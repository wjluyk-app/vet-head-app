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
        description: "2-Man Scramble scoring, match points and field results.",
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
      {
        title: "2025 Tournament Archive",
        description: "Final score, match results, MVPs, payouts and the complete 25th-anniversary record.",
        href: "/archive/2025",
        status: "Available",
        icon: "AR",
      },
    ],
  },
  {
    title: "Results & Money",
    description: "Prize structure, final payouts, standings and permanent records.",
    items: [
      {
        title: "Prize Structure",
        description: "What is available to win across fields, skins, team awards and MVP.",
        href: "/prize-money",
        status: "Available",
        icon: "$",
      },
      {
        title: "Final Payouts",
        description: "What each player actually earned after all results are complete.",
        href: "/final-results",
        status: "Available",
        icon: "🏆",
      },
    ],
  },
];
