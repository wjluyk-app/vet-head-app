import type { LiveFridayMatch, LiveTeamScorecard } from "@/lib/live-types";
import { calculateFridayLiveResults, type FridayLiveResults } from "@/lib/friday-results";

export const SATURDAY_FIELD_POT = 450;

export interface SaturdayBoardTeam {
  scorecardId: string; sourceKey: string; matchNumber: number;
  captainTeam: "LUKE" | "SAM"; captainLabel: string; players: string;
  scores: Array<number | null>; front: number | null; back: number | null; total: number | null;
  frontRank: number | null; backRank: number | null; totalRank: number | null;
  matchPoints: number; fieldPayout: number; lastUpdatedAt: string | null;
}
export interface SaturdayTournamentBoard {
  generatedAt:string; matchPlay:FridayLiveResults; teams:SaturdayBoardTeam[]; fieldComplete:boolean; fieldDistributed:number; moneyDistributed:number; moneyAvailable:number;
}

type Segment = "front"|"back"|"total";
type Basic = { card:LiveTeamScorecard; matchNumber:number; captainTeam:"LUKE"|"SAM"; captainLabel:string; players:string; scores:Array<number|null>; front:number|null; back:number|null; total:number|null; matchPoints:number; lastUpdatedAt:string|null };

function sumComplete(values:Array<number|null>):number|null { return values.every(v=>v!==null) ? values.reduce((s,v)=>s+(v??0),0) : null; }
function latest(card:LiveTeamScorecard):string|null { return card.scores.filter(Boolean).map(s=>s!.updatedAt).sort().at(-1) ?? null; }
function ranks(rows:Basic[], key:Segment):Map<string,number|null> {
  const out=new Map<string, number | null>(rows.map(r=>[r.card.id,null]));
  const sorted=rows.filter(r=>r[key]!==null).sort((a,b)=>(a[key] as number)-(b[key] as number));
  let last:number|null=null, rank=0;
  sorted.forEach((r,i)=>{ const score=r[key] as number; if(score!==last) rank=i+1; out.set(r.card.id,rank); last=score; });
  return out;
}
function payouts(rows:Basic[], key:Segment):Map<string,number> {
  const out=new Map(rows.map(r=>[r.card.id,0]));
  if(!rows.every(r=>r[key]!==null)) return out;
  const scores=[...new Set(rows.map(r=>r[key] as number))].sort((a,b)=>a-b);
  const first=rows.filter(r=>r[key]===scores[0]);
  if(first.length>1){ first.forEach(r=>out.set(r.card.id,150/first.length)); return out; }
  out.set(first[0].card.id,100);
  if(scores[1]!==undefined){ const second=rows.filter(r=>r[key]===scores[1]); second.forEach(r=>out.set(r.card.id,50/second.length)); }
  return out;
}
export function calculateSaturdayTournamentBoard(matches:LiveFridayMatch[]):SaturdayTournamentBoard {
  const matchPlay=calculateFridayLiveResults(matches);
  const pointMap=new Map(matchPlay.matches.map(m=>[m.pairingId,{luke:m.lukePoints,sam:m.samPoints}]));
  const basics:Basic[]=[];
  for(const match of matches){
    for(const x of [
      {card:match.luke,captainTeam:"LUKE" as const,captainLabel:"L. Swardo",points:pointMap.get(match.pairingId)?.luke??0},
      {card:match.sam,captainTeam:"SAM" as const,captainLabel:"S. Swardo",points:pointMap.get(match.pairingId)?.sam??0},
    ]){
      const scores=x.card.scores.map(s=>s?.netScore??null);
      basics.push({card:x.card,matchNumber:match.matchNumber,captainTeam:x.captainTeam,captainLabel:x.captainLabel,players:`${x.card.player1} / ${x.card.player2}`,scores,front:sumComplete(scores.slice(0,9)),back:sumComplete(scores.slice(9)),total:sumComplete(scores),matchPoints:x.points,lastUpdatedAt:latest(x.card)});
    }
  }
  const fieldComplete=basics.every(r=>r.total!==null);
  const fr=ranks(basics,"front"), br=ranks(basics,"back"), tr=ranks(basics,"total");
  const fp=fieldComplete?payouts(basics,"front"):new Map(basics.map(r=>[r.card.id,0]));
  const bp=fieldComplete?payouts(basics,"back"):new Map(basics.map(r=>[r.card.id,0]));
  const tp=fieldComplete?payouts(basics,"total"):new Map(basics.map(r=>[r.card.id,0]));
  const teams:SaturdayBoardTeam[]=basics.map(r=>({scorecardId:r.card.id,sourceKey:r.card.sourceKey,matchNumber:r.matchNumber,captainTeam:r.captainTeam,captainLabel:r.captainLabel,players:r.players,scores:r.scores,front:r.front,back:r.back,total:r.total,frontRank:fr.get(r.card.id)??null,backRank:br.get(r.card.id)??null,totalRank:tr.get(r.card.id)??null,matchPoints:r.matchPoints,fieldPayout:(fp.get(r.card.id)??0)+(bp.get(r.card.id)??0)+(tp.get(r.card.id)??0),lastUpdatedAt:r.lastUpdatedAt}));
  const fieldDistributed=teams.reduce((s,t)=>s+t.fieldPayout,0);
  return {generatedAt:new Date().toISOString(),matchPlay,teams,fieldComplete,fieldDistributed,moneyDistributed:fieldDistributed,moneyAvailable:SATURDAY_FIELD_POT};
}
