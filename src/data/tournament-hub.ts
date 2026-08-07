export type HubStatus = "Available" | "Coming Soon";

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
    title: "Tournament",
    description: "Scores, standings, pairings and round-by-round results.",
    items: [
      {
        title: "Scoreboard",
        description: "Vet Head points, Vet Head MVP standings and round results.",
        href: "/scoreboard",
        status: "Available",
        icon: "SB",
        featured: true,
      },
      {
        title: "Pairings",
        description: "See the preset foursomes and scramble teams for every round.",
        href: "/teams",
        status: "Available",
        icon: "PR",
      },
      {
        title: "Schedule & Tee Times",
        description: "Thursday through Saturday formats and start times.",
        href: "/schedule",
        status: "Available",
        icon: "TT",
      },
    ],
  },
  {
    title: "Tournament Information",
    description: "The essentials players need for Vet Head.",
    items: [
      {
        title: "Players",
        description: "The 12-player field and handicap indexes.",
        href: "/teams",
        status: "Available",
        icon: "PL",
      },
      {
        title: "Tournament Format",
        description: "Three individual net rounds, two four-man scrambles and two simultaneous competitions.",
        href: "/schedule",
        status: "Available",
        icon: "FM",
      },
    ],
  },
];
