export type HubStatus = "Live" | "Available" | "Coming Soon";

export interface HubItem {
  title: string;
  description: string;
  href: string;
  status: HubStatus;
  icon: string;
  featured?: boolean;
}

export interface HubGroup {
  title: string;
  description: string;
  items: HubItem[];
}

export const tournamentHubGroups: HubGroup[] = [
  {
    title: "Live Tournament",
    description: "Scores, standings and day-by-day competition.",
    items: [
      {
        title: "Overall Scoreboard",
        description: "Team Luke vs. Team Sam across the full tournament.",
        href: "/scoreboard",
        status: "Live",
        icon: "SB",
        featured: true,
      },
      {
        title: "Friday",
        description: "Live matches, field standings, skins and Friday results.",
        href: "/friday",
        status: "Live",
        icon: "FR",
      },
      {
        title: "Saturday",
        description: "Scramble scoring, match points and field results.",
        href: "/saturday",
        status: "Live",
        icon: "SA",
      },
      {
        title: "Sunday",
        description: "Pinehurst, singles, final team score and champions.",
        href: "/sunday",
        status: "Live",
        icon: "SU",
      },
    ],
  },
  {
    title: "Event Information",
    description: "Everything players need before and during the trip.",
    items: [
      {
        title: "Player Guide",
        description: "Schedule, formats, rules, lodging, contacts and what to expect.",
        href: "/player-guide",
        status: "Available",
        icon: "PG",
      },
      {
        title: "Teams & Pairings",
        description: "Rosters, captains, handicaps, pairings and tee assignments.",
        href: "/teams",
        status: "Available",
        icon: "TP",
      },
      {
        title: "Schedule & Tee Times",
        description: "Daily courses, start times, pairings and event schedule.",
        href: "/schedule",
        status: "Available",
        icon: "TT",
      },
    ],
  },
  {
    title: "Results & Money",
    description: "Tournament payouts, final standings and permanent records.",
    items: [
      {
        title: "Prize Money",
        description: "Payout structure, skins, team totals and player payment summary.",
        href: "/prize-money",
        status: "Coming Soon",
        icon: "$",
      },
      {
        title: "Payouts",
        description: "Champions, final team score, complete results and journal.",
        href: "/final-results",
        status: "Available",
        icon: "🏆",
      },
    ],
  },
];
