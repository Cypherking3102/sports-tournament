export const initialTournaments = [
  {
    id: "dm-football-cup-2026",
    title: "Divine Mercy Annual Football Cup 2026",
    sport: "Football",
    sportIcon: "⚽",
    scoreUnit: "Goals",
    bannerUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
    format: "GROUP_KNOCKOUT",
    status: "LIVE",
    startDate: "2026-11-08",
    endDate: "2026-11-22",
    location: "Divine Mercy Parish Grounds & Turf",
    organizer: "Divine Mercy Sports Ministry",
    description: "8 teams compete across Group A and Group B, with the top 2 teams in each group advancing to the Knockout Semi-Finals and Championship Final.",
    groups: [
      {
        id: "grp-a",
        name: "Group A",
        teams: [
          { id: "tm-a1", name: "Red Dragons", shortName: "RDG", seed: 1, logo: "🐉" },
          { id: "tm-a2", name: "Apex Thunder", shortName: "ATD", seed: 2, logo: "⚡" },
          { id: "tm-a3", name: "Iron Wolves", shortName: "IWL", seed: 3, logo: "🐺" },
          { id: "tm-a4", name: "Blue Falcons", shortName: "BFC", seed: 4, logo: "🦅" }
        ]
      },
      {
        id: "grp-b",
        name: "Group B",
        teams: [
          { id: "tm-b1", name: "Silver Strikers", shortName: "SST", seed: 1, logo: "⚔️" },
          { id: "tm-b2", name: "Golden Titans", shortName: "GTT", seed: 2, logo: "🛡️" },
          { id: "tm-b3", name: "Phoenix United", shortName: "PHX", seed: 3, logo: "🔥" },
          { id: "tm-b4", name: "Shadow Cobras", shortName: "SCB", seed: 4, logo: "🐍" }
        ]
      }
    ],
    teams: [
      { id: "tm-a1", name: "Red Dragons", shortName: "RDG", seed: 1, logo: "🐉", groupId: "grp-a" },
      { id: "tm-a2", name: "Apex Thunder", shortName: "ATD", seed: 2, logo: "⚡", groupId: "grp-a" },
      { id: "tm-a3", name: "Iron Wolves", shortName: "IWL", seed: 3, logo: "🐺", groupId: "grp-a" },
      { id: "tm-a4", name: "Blue Falcons", shortName: "BFC", seed: 4, logo: "🦅", groupId: "grp-a" },
      { id: "tm-b1", name: "Silver Strikers", shortName: "SST", seed: 1, logo: "⚔️", groupId: "grp-b" },
      { id: "tm-b2", name: "Golden Titans", shortName: "GTT", seed: 2, logo: "🛡️", groupId: "grp-b" },
      { id: "tm-b3", name: "Phoenix United", shortName: "PHX", seed: 3, logo: "🔥", groupId: "grp-b" },
      { id: "tm-b4", name: "Shadow Cobras", shortName: "SCB", seed: 4, logo: "🐍", groupId: "grp-b" }
    ],
    rules: [
      {
        id: "dm-rule-1",
        title: "Fair Play & Mutual Respect",
        category: "Code of Conduct",
        content: "Matches begin with a joint team prayer. Respectful behavior towards officials, opponents, and spectators is required at all times."
      },
      {
        id: "dm-rule-2",
        title: "Group Stage Points & Tie-Breakers",
        category: "Tournament Format",
        content: "Win = 3 points, Draw = 1 point, Loss = 0 points. Top 2 teams from Group A and Group B advance to the Semi-Finals. Tie-breakers: 1) Head-to-Head, 2) Goal Difference, 3) Higher Goals Scored."
      },
      {
        id: "dm-rule-3",
        title: "Playoff Semi-Finals & Final",
        category: "Knockout Rules",
        content: "Semi-Final 1: Winner Group A vs Runner-up Group B. Semi-Final 2: Winner Group B vs Runner-up Group A. Direct penalty shootout applies if scores are level at full time."
      }
    ],
    matches: [
      // Group A Fixtures
      {
        id: "ga-m-1",
        round: 1,
        roundName: "Group A - Match 1",
        stageName: "Group A",
        groupId: "grp-a",
        teamAId: "tm-a1",
        teamBId: "tm-a2",
        scoreA: 3,
        scoreB: 1,
        status: "COMPLETED",
        winnerId: "tm-a1",
        scheduledAt: "2026-11-08 15:30",
        venue: "Parish Turf"
      },
      {
        id: "ga-m-2",
        round: 1,
        roundName: "Group A - Match 1",
        stageName: "Group A",
        groupId: "grp-a",
        teamAId: "tm-a3",
        teamBId: "tm-a4",
        scoreA: 1,
        scoreB: 1,
        status: "COMPLETED",
        winnerId: null,
        scheduledAt: "2026-11-08 17:00",
        venue: "Parish Turf"
      },
      {
        id: "ga-m-3",
        round: 2,
        roundName: "Group A - Match 2",
        stageName: "Group A",
        groupId: "grp-a",
        teamAId: "tm-a1",
        teamBId: "tm-a3",
        scoreA: 2,
        scoreB: 0,
        status: "COMPLETED",
        winnerId: "tm-a1",
        scheduledAt: "2026-11-12 15:30",
        venue: "Parish Turf"
      },
      {
        id: "ga-m-4",
        round: 2,
        roundName: "Group A - Match 2",
        stageName: "Group A",
        groupId: "grp-a",
        teamAId: "tm-a4",
        teamBId: "tm-a2",
        scoreA: 2,
        scoreB: 2,
        status: "LIVE",
        winnerId: null,
        scheduledAt: "2026-11-12 17:00",
        venue: "Parish Turf"
      },
      {
        id: "ga-m-5",
        round: 3,
        roundName: "Group A - Match 3",
        stageName: "Group A",
        groupId: "grp-a",
        teamAId: "tm-a1",
        teamBId: "tm-a4",
        scoreA: 0,
        scoreB: 0,
        status: "SCHEDULED",
        winnerId: null,
        scheduledAt: "2026-11-15 15:30",
        venue: "Parish Turf"
      },
      {
        id: "ga-m-6",
        round: 3,
        roundName: "Group A - Match 3",
        stageName: "Group A",
        groupId: "grp-a",
        teamAId: "tm-a2",
        teamBId: "tm-a3",
        scoreA: 0,
        scoreB: 0,
        status: "SCHEDULED",
        winnerId: null,
        scheduledAt: "2026-11-15 17:00",
        venue: "Parish Turf"
      },

      // Group B Fixtures
      {
        id: "gb-m-1",
        round: 1,
        roundName: "Group B - Match 1",
        stageName: "Group B",
        groupId: "grp-b",
        teamAId: "tm-b1",
        teamBId: "tm-b2",
        scoreA: 2,
        scoreB: 1,
        status: "COMPLETED",
        winnerId: "tm-b1",
        scheduledAt: "2026-11-09 15:30",
        venue: "Parish Turf"
      },
      {
        id: "gb-m-2",
        round: 1,
        roundName: "Group B - Match 1",
        stageName: "Group B",
        groupId: "grp-b",
        teamAId: "tm-b3",
        teamBId: "tm-b4",
        scoreA: 1,
        scoreB: 3,
        status: "COMPLETED",
        winnerId: "tm-b4",
        scheduledAt: "2026-11-09 17:00",
        venue: "Parish Turf"
      },
      {
        id: "gb-m-3",
        round: 2,
        roundName: "Group B - Match 2",
        stageName: "Group B",
        groupId: "grp-b",
        teamAId: "tm-b1",
        teamBId: "tm-b3",
        scoreA: 4,
        scoreB: 1,
        status: "COMPLETED",
        winnerId: "tm-b1",
        scheduledAt: "2026-11-13 15:30",
        venue: "Parish Turf"
      },
      {
        id: "gb-m-4",
        round: 2,
        roundName: "Group B - Match 2",
        stageName: "Group B",
        groupId: "grp-b",
        teamAId: "tm-b4",
        teamBId: "tm-b2",
        scoreA: 0,
        scoreB: 0,
        status: "SCHEDULED",
        winnerId: null,
        scheduledAt: "2026-11-13 17:00",
        venue: "Parish Turf"
      },
      {
        id: "gb-m-5",
        round: 3,
        roundName: "Group B - Match 3",
        stageName: "Group B",
        groupId: "grp-b",
        teamAId: "tm-b1",
        teamBId: "tm-b4",
        scoreA: 0,
        scoreB: 0,
        status: "SCHEDULED",
        winnerId: null,
        scheduledAt: "2026-11-16 15:30",
        venue: "Parish Turf"
      },
      {
        id: "gb-m-6",
        round: 3,
        roundName: "Group B - Match 3",
        stageName: "Group B",
        groupId: "grp-b",
        teamAId: "tm-b2",
        teamBId: "tm-b3",
        scoreA: 0,
        scoreB: 0,
        status: "SCHEDULED",
        winnerId: null,
        scheduledAt: "2026-11-16 17:00",
        venue: "Parish Turf"
      },

      // Knockout Playoff Stage
      {
        id: "dm-po-sf1",
        round: 1,
        roundName: "Semi-Final 1",
        stageName: "Playoff Semi-Finals",
        groupId: "PLAYOFFS",
        teamAId: "tm-a1",
        teamBId: "tm-b4",
        placeholderA: "Winner Group A",
        placeholderB: "Runner-up Group B",
        scoreA: 0,
        scoreB: 0,
        status: "SCHEDULED",
        winnerId: null,
        nextMatchId: "dm-po-final",
        nextMatchSlot: "A",
        scheduledAt: "2026-11-20 16:00",
        venue: "Parish Main Turf"
      },
      {
        id: "dm-po-sf2",
        round: 1,
        roundName: "Semi-Final 2",
        stageName: "Playoff Semi-Finals",
        groupId: "PLAYOFFS",
        teamAId: "tm-b1",
        teamBId: "tm-a4",
        placeholderA: "Winner Group B",
        placeholderB: "Runner-up Group A",
        scoreA: 0,
        scoreB: 0,
        status: "SCHEDULED",
        winnerId: null,
        nextMatchId: "dm-po-final",
        nextMatchSlot: "B",
        scheduledAt: "2026-11-20 17:30",
        venue: "Parish Main Turf"
      },
      {
        id: "dm-po-final",
        round: 2,
        roundName: "Championship Final",
        stageName: "Championship Final",
        groupId: "PLAYOFFS",
        teamAId: null,
        teamBId: null,
        placeholderA: "Winner Semi-Final 1",
        placeholderB: "Winner Semi-Final 2",
        scoreA: 0,
        scoreB: 0,
        status: "SCHEDULED",
        winnerId: null,
        nextMatchId: null,
        nextMatchSlot: null,
        scheduledAt: "2026-11-22 18:00",
        venue: "Parish Main Turf"
      }
    ]
  },
  {
    id: "dm-youth-basketball-2026",
    title: "Divine Mercy Youth Basketball Trophy",
    sport: "Basketball",
    sportIcon: "🏀",
    scoreUnit: "Points",
    bannerUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80",
    format: "ROUND_ROBIN",
    status: "LIVE",
    startDate: "2026-11-10",
    endDate: "2026-11-25",
    location: "Parish Indoor Court",
    organizer: "Divine Mercy Sports Ministry",
    description: "5 teams compete in a round-robin league format. Top 2 teams advance to the Super Cup.",
    teams: [
      { id: "bb-1", name: "Mercy Sparks", shortName: "MSP", seed: 1, logo: "⚡" },
      { id: "bb-2", name: "Divine Dunkers", shortName: "DDK", seed: 2, logo: "🔥" },
      { id: "bb-3", name: "Hoopers Club", shortName: "HPC", seed: 3, logo: "🛡️" },
      { id: "bb-4", name: "Crusaders", shortName: "CRU", seed: 4, logo: "⚔️" },
      { id: "bb-5", name: "Warriors", shortName: "WAR", seed: 5, logo: "🦅" }
    ],
    rules: [
      {
        id: "brule-1",
        title: "Match Timing",
        category: "Gameplay",
        content: "4 quarters of 10 minutes running clock. Clock stops for timeouts and in the last 2 minutes."
      },
      {
        id: "brule-2",
        title: "League Points",
        category: "Scoring",
        content: "Win = 2 Points, Loss = 1 Point. Head-to-head record breaks ties."
      }
    ],
    matches: [
      {
        id: "bb-m-1",
        round: 1,
        roundName: "Week 1",
        stageName: "League Stage",
        teamAId: "bb-1",
        teamBId: "bb-2",
        scoreA: 64,
        scoreB: 58,
        status: "COMPLETED",
        winnerId: "bb-1",
        scheduledAt: "2026-11-10 17:00",
        venue: "Parish Indoor Court"
      },
      {
        id: "bb-m-2",
        round: 1,
        roundName: "Week 1",
        stageName: "League Stage",
        teamAId: "bb-3",
        teamBId: "bb-4",
        scoreA: 52,
        scoreB: 50,
        status: "COMPLETED",
        winnerId: "bb-3",
        scheduledAt: "2026-11-10 18:30",
        venue: "Parish Indoor Court"
      },
      {
        id: "bb-m-3",
        round: 2,
        roundName: "Week 2",
        stageName: "League Stage",
        teamAId: "bb-5",
        teamBId: "bb-1",
        scoreA: 48,
        scoreB: 55,
        status: "COMPLETED",
        winnerId: "bb-1",
        scheduledAt: "2026-11-14 17:00",
        venue: "Parish Indoor Court"
      },
      {
        id: "bb-m-4",
        round: 2,
        roundName: "Week 2",
        stageName: "League Stage",
        teamAId: "bb-2",
        teamBId: "bb-3",
        scoreA: 41,
        scoreB: 39,
        status: "LIVE",
        winnerId: null,
        scheduledAt: "2026-11-14 18:30",
        venue: "Parish Indoor Court"
      }
    ]
  },
  {
    id: "dm-cricket-2026",
    title: "Divine Mercy Cricket Trophy",
    sport: "Cricket",
    sportIcon: "🏏",
    scoreUnit: "Runs",
    bannerUrl: "https://images.unsplash.com/photo-1531415074868-036b107e775a?auto=format&fit=crop&w=1200&q=80",
    format: "KNOCKOUT",
    status: "UPCOMING",
    startDate: "2026-11-28",
    endDate: "2026-11-29",
    location: "Parish Open Grounds",
    organizer: "Divine Mercy Sports Ministry",
    description: "4-team knockout cricket tournament with explosive 8-over matches.",
    teams: [
      { id: "cr-1", name: "Royal Kings", shortName: "RK", seed: 1, logo: "👑" },
      { id: "cr-2", name: "Brave Lions", shortName: "BL", seed: 2, logo: "🦁" },
      { id: "cr-3", name: "Knights", shortName: "KT", seed: 3, logo: "🛡️" },
      { id: "cr-4", name: "Archers", shortName: "AR", seed: 4, logo: "🏹" }
    ],
    rules: [
      {
        id: "crule-1",
        title: "Match Format",
        category: "Gameplay",
        content: "8 overs per side. Maximum 2 overs per bowler. 2 overs powerplay."
      },
      {
        id: "crule-2",
        title: "Super Over",
        category: "Tie-Breaker",
        content: "1-over shootout (Super Over) applies if scores are tied."
      }
    ],
    matches: [
      {
        id: "dm-cr-sf1",
        round: 1,
        roundName: "Semi-Final 1",
        stageName: "Semi-Finals",
        teamAId: "cr-1",
        teamBId: "cr-4",
        scoreA: 0,
        scoreB: 0,
        status: "SCHEDULED",
        winnerId: null,
        nextMatchId: "dm-cr-fn",
        nextMatchSlot: "A",
        scheduledAt: "2026-11-28 09:30",
        venue: "Pitch 1"
      },
      {
        id: "dm-cr-sf2",
        round: 1,
        roundName: "Semi-Final 2",
        stageName: "Semi-Finals",
        teamAId: "cr-2",
        teamBId: "cr-3",
        scoreA: 0,
        scoreB: 0,
        status: "SCHEDULED",
        winnerId: null,
        nextMatchId: "dm-cr-fn",
        nextMatchSlot: "B",
        scheduledAt: "2026-11-28 11:30",
        venue: "Pitch 1"
      },
      {
        id: "dm-cr-fn",
        round: 2,
        roundName: "Grand Final",
        stageName: "Final",
        teamAId: null,
        teamBId: null,
        scoreA: 0,
        scoreB: 0,
        status: "SCHEDULED",
        winnerId: null,
        nextMatchId: null,
        nextMatchSlot: null,
        scheduledAt: "2026-11-29 15:00",
        venue: "Main Ground"
      }
    ]
  }
];
