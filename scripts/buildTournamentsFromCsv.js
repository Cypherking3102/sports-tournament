import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Official Rosters for Carrom, Chess, Table Tennis
const rosters = {
  Carrom: {
    "Group A": [
      "Nelson Fernandes",
      "Alphonso Menezes",
      "Amal lancelot",
      "Lawrence Rodrigues",
      "Colet Coelho",
      "Anthony Aranha"
    ],
    "Group B": [
      "James Louis",
      "Gerald Rodrigues",
      "Jim D'souza",
      "Sunborn Perrira",
      "Charlette Sequera",
      "Rosslin Louis"
    ],
    "Group C": [
      "Joseph Rodrigues",
      "Florine Fernandes",
      "Patrick Menezes",
      "Daniel Danthi",
      "Dean D'souza",
      "Emmanuel Menezes"
    ]
  },
  Chess: {
    "Group Stage": [
      "Joel Britto",
      "Christine",
      "Mario Chettiar",
      "Frank Mathias",
      "Shibu Jacob",
      "Don Danthi"
    ]
  },
  "Table Tennis": {
    "Group A": [
      "Fr. Kenneth Pinto",
      "Gerald Rodrigues",
      "Sunborn Perrira",
      "James Louis"
    ],
    "Group B": [
      "Vincent Chettiar",
      "Nigel Moriera",
      "Malcolm Corria",
      "Anthony Aranha",
      "Mario Fernandes"
    ]
  }
};

// 5 Parish Teams for Cricket & Throwball
const parishTeams = [
  { id: "team-divine-united", name: "Divine United", shortName: "DU", seed: 1 },
  { id: "team-yellow-palthans", name: "Yellow Palthans", shortName: "YP", seed: 2 },
  { id: "team-game-changers", name: "Game Changers", shortName: "GC", seed: 3 },
  { id: "team-pink-panthers", name: "Pink Panthers", shortName: "PP", seed: 4 },
  { id: "team-green-goblin", name: "Green Goblin", shortName: "GG", seed: 5 }
];

function normalizeTeamName(rawName) {
  const clean = rawName.trim().toLowerCase();
  if (clean === "ad" || clean.includes("green goblin")) return "Green Goblin";
  if (clean.includes("divine united")) return "Divine United";
  if (clean.includes("yellow palthan") || clean.includes("yellow paltan")) return "Yellow Palthans";
  if (clean.includes("game changer")) return "Game Changers";
  if (clean.includes("pink panther")) return "Pink Panthers";
  return rawName.trim();
}

function makePlayerId(name) {
  return "p-" + name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
}

// 5 Official Tournaments Configurations
const tournamentsConfig = [
  {
    id: "dmc-carrom-2026",
    title: "Carrom Tournament",
    sport: "Carrom",
    sportIcon: "",
    scoreUnit: "Points",
    format: "GROUP_KNOCKOUT",
    status: "UPCOMING",
    participantType: "INDIVIDUAL",
    startDate: "2026-11-07",
    endDate: "2026-11-07",
    location: "4th Floor AV Room",
    organizer: "Divine Mercy Church",
    description: "",
    bannerUrl: "https://images.unsplash.com/photo-1617300067484-314ed2cfd9a6?auto=format&fit=crop&w=1200&q=80",
    pointsConfig: { win: 2, draw: 1, loss: 0, showForm: false },
    rules: [
      { id: "cr-1", title: "Match Duration", category: "Rules", content: "Each game is 7 minutes of active play. Standard carrom scoring applies." },
      { id: "cr-2", title: "Playoff Qualification", category: "Format", content: "Top 2 from each group + 2 Best 3rd place finishers advance to Quarterfinals (8 players total)." },
      { id: "cr-3", title: "Fellowship & Fair Play", category: "Conduct", content: "Opening prayer at 08:00 AM. Mutual respect for opponents and table marshals." }
    ],
    groups: [
      { id: "grp-a", name: "Group A", teams: [] },
      { id: "grp-b", name: "Group B", teams: [] },
      { id: "grp-c", name: "Group C", teams: [] }
    ]
  },
  {
    id: "dmc-chess-2026",
    title: "Chess Tournament",
    sport: "Chess",
    sportIcon: "",
    scoreUnit: "Points",
    format: "ROUND_ROBIN",
    status: "UPCOMING",
    participantType: "INDIVIDUAL",
    startDate: "2026-11-07",
    endDate: "2026-11-07",
    location: "4th Floor outside AV Room",
    organizer: "Divine Mercy Church",
    description: "",
    bannerUrl: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=1200&q=80",
    pointsConfig: { win: 2, draw: 1, loss: 0, showForm: false },
    rules: [
      { id: "ch-1", title: "Game Time", category: "Rules", content: "10 minutes rapid play per game with quick board reset." },
      { id: "ch-2", title: "Final Match", category: "Format", content: "Top 2 players from the round-robin standings contest the Championship Final." },
      { id: "ch-3", title: "Fair Play", category: "Conduct", content: "Respectful silence during play and shake hands before/after every match." }
    ],
    groups: []
  },
  {
    id: "dmc-table-tennis-2026",
    title: "Table Tennis Tournament",
    sport: "Table Tennis",
    sportIcon: "",
    scoreUnit: "Sets",
    format: "GROUP_KNOCKOUT",
    status: "UPCOMING",
    participantType: "INDIVIDUAL",
    startDate: "2026-11-07",
    endDate: "2026-11-07",
    location: "Ground Floor Main Hall",
    organizer: "Divine Mercy Church",
    description: "",
    bannerUrl: "https://images.unsplash.com/photo-1534158914592-062992fbe900?auto=format&fit=crop&w=1200&q=80",
    pointsConfig: { win: 2, draw: 0, loss: 0, showForm: false },
    rules: [
      { id: "tt-1", title: "Match Format", category: "Rules", content: "5 minutes match duration on Table 1. Best of sets rule applies." },
      { id: "tt-2", title: "Semifinals & Final", category: "Format", content: "Group A Rank 1 vs Group B Rank 2, and Group B Rank 1 vs Group A Rank 2. Winners advance to Grand Final." },
      { id: "tt-3", title: "Fellowship", category: "Conduct", content: "Good sportsmanship, cheer for all parish players." }
    ],
    groups: [
      { id: "grp-a", name: "Group A", teams: [] },
      { id: "grp-b", name: "Group B", teams: [] }
    ]
  },
  {
    id: "dmc-cricket-2026",
    title: "Cricket Tournament",
    sport: "Cricket",
    sportIcon: "",
    scoreUnit: "Runs",
    format: "ROUND_ROBIN",
    status: "UPCOMING",
    participantType: "TEAM",
    startDate: "2026-11-07",
    endDate: "2026-11-07",
    location: "Church Hall",
    organizer: "Divine Mercy Church",
    description: "",
    bannerUrl: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80",
    pointsConfig: { win: 2, draw: 1, loss: 0, showForm: false },
    rules: [
      { id: "cr-1", title: "Match Format", category: "Rules", content: "Rapid 5 overs per side. Rotational bowling with standard cricket rules." },
      { id: "cr-2", title: "Championship Final", category: "Format", content: "Top 2 teams on the league points table contest the Grand Final at 05:00 PM." },
      { id: "cr-3", title: "Sportsmanship", category: "Conduct", content: "Umpire decisions are final. Respect opponents and celebrate parish fellowship." }
    ],
    groups: []
  },
  {
    id: "dmc-throwball-2026",
    title: "Throwball Tournament",
    sport: "Throwball",
    sportIcon: "",
    scoreUnit: "Points",
    format: "ROUND_ROBIN",
    status: "UPCOMING",
    participantType: "TEAM",
    startDate: "2026-11-07",
    endDate: "2026-11-07",
    location: "Grotto Area",
    organizer: "Divine Mercy Church",
    description: "",
    bannerUrl: "https://images.unsplash.com/photo-1666901356149-93f2eb3ba5a2?auto=format&fit=crop&w=1200&q=80",
    pointsConfig: { win: 2, draw: 1, loss: 0, showForm: false },
    rules: [
      { id: "tb-1", title: "Match Format", category: "Rules", content: "Best of 3 sets format. Standard rotational catching and throwing rules apply." },
      { id: "tb-2", title: "Championship Final", category: "Format", content: "Top 2 teams on the league points table advance to the Grand Final at 05:00 PM." },
      { id: "tb-3", title: "Fellowship", category: "Conduct", content: "Fair play, support teammates, and cheer for all participating parish teams." }
    ],
    groups: []
  }
];

// Populate players and teams
tournamentsConfig.forEach((cfg) => {
  if (cfg.sport === "Cricket" || cfg.sport === "Throwball") {
    cfg.teams = parishTeams.map((t) => ({
      ...t,
      logo: "",
      group: "League",
      players: []
    }));
    return;
  }

  const sportRosters = rosters[cfg.sport] || {};
  const allTeams = [];

  Object.entries(sportRosters).forEach(([groupName, playerNames]) => {
    playerNames.forEach((name, idx) => {
      const pId = makePlayerId(name);
      const teamObj = {
        id: pId,
        name: name,
        shortName: name.split(" ")[0].substring(0, 4).toUpperCase(),
        seed: idx + 1,
        logo: "",
        group: groupName.startsWith("Group") ? groupName : "Group Stage",
        players: [
          {
            id: pId,
            name: name,
            role: "PLAYER"
          }
        ]
      };
      allTeams.push(teamObj);
    });
  });

  cfg.teams = allTeams;

  // Populate groups teams
  if (cfg.groups && cfg.groups.length > 0) {
    cfg.groups.forEach((g) => {
      g.teams = allTeams.filter((t) => t.group === g.name);
    });
  }
});

const matchesBySport = {
  Carrom: [],
  Chess: [],
  "Table Tennis": [],
  Cricket: [],
  Throwball: []
};

// Parse CSV for Carrom, Chess, Table Tennis
const csvPath = path.join(__dirname, '../data/latest_schedule.csv');
const csvLines = fs.readFileSync(csvPath, 'utf-8').split(/\r?\n/).filter((l) => l.trim());
const scheduleRows = csvLines.slice(1).map((l) => {
  const parts = l.split(',');
  return {
    game: parts[0]?.trim(),
    startTime: parts[1]?.trim(),
    endTime: parts[2]?.trim(),
    p1: parts[3]?.trim(),
    p2: parts[4]?.trim(),
    group: parts[5]?.trim(),
    court: parts[6]?.trim()
  };
}).filter((r) => r.game);

// Process Carrom
const carromCfg = tournamentsConfig.find((t) => t.sport === "Carrom");
let carromMatchCount = 1;

scheduleRows.filter((r) => r.game === "Carrom").forEach((m) => {
  const isQF = m.p1.includes("Rank") || m.p2.includes("Rank") || m.p1.includes("Best 3rd") || m.p2.includes("Best 3rd");
  const isSF = m.p1.includes("Winner Carrom QF");
  const isFinal = m.p1.includes("Winner Carrom SF");

  let matchId = "";
  let roundNum = 1;
  let roundName = m.group;
  let stageName = `${m.group} Fixture`;
  let groupId = "ALL";
  let groupName = m.group;
  let nextMatchId = null;
  let nextSlot = null;

  if (m.group === "Group A") {
    groupId = "grp-a";
  } else if (m.group === "Group B") {
    groupId = "grp-b";
  } else if (m.group === "Group C") {
    groupId = "grp-c";
  }

  if (isQF) {
    groupId = "PLAYOFFS";
    groupName = "Knockout Playoffs";
    roundNum = 1;
    roundName = "Quarter-Finals";
    if (m.court === "Board 1") {
      matchId = "CR-QF1";
      stageName = "Quarterfinal 1";
      nextMatchId = "CR-SF1";
      nextSlot = "A";
    } else if (m.court === "Board 2") {
      matchId = "CR-QF2";
      stageName = "Quarterfinal 2";
      nextMatchId = "CR-SF2";
      nextSlot = "A";
    } else if (m.court === "Board 3") {
      matchId = "CR-QF3";
      stageName = "Quarterfinal 3";
      nextMatchId = "CR-SF2";
      nextSlot = "B";
    } else if (m.court === "Board 4") {
      matchId = "CR-QF4";
      stageName = "Quarterfinal 4";
      nextMatchId = "CR-SF1";
      nextSlot = "B";
    }
  } else if (isSF) {
    groupId = "PLAYOFFS";
    groupName = "Knockout Playoffs";
    roundNum = 2;
    roundName = "Semi-Finals";
    if (m.court === "Board 1") {
      matchId = "CR-SF1";
      stageName = "Semifinal 1";
      nextMatchId = "CR-FINAL";
      nextSlot = "A";
    } else {
      matchId = "CR-SF2";
      stageName = "Semifinal 2";
      nextMatchId = "CR-FINAL";
      nextSlot = "B";
    }
  } else if (isFinal) {
    groupId = "PLAYOFFS";
    groupName = "Knockout Playoffs";
    roundNum = 3;
    roundName = "Grand Final";
    stageName = "Grand Final";
    matchId = "CR-FINAL";
  } else {
    matchId = `CR-M${carromMatchCount++}`;
  }

  const t1 = carromCfg.teams.find((t) => t.name.toLowerCase() === m.p1.toLowerCase());
  const t2 = carromCfg.teams.find((t) => t.name.toLowerCase() === m.p2.toLowerCase());

  matchesBySport.Carrom.push({
    id: matchId,
    round: roundNum,
    roundName,
    stageName,
    groupId,
    groupName,
    teamAId: t1 ? t1.id : null,
    teamBId: t2 ? t2.id : null,
    placeholderA: t1 ? null : m.p1,
    placeholderB: t2 ? null : m.p2,
    scoreA: 0,
    scoreB: 0,
    status: "SCHEDULED",
    winnerId: null,
    nextMatchId,
    nextMatchSlot: nextSlot,
    scheduledAt: `2026-11-07 ${m.startTime}`,
    startTime: m.startTime,
    endTime: m.endTime,
    venue: "4th Floor AV Room",
    court: m.court,
    duration: "7 mins"
  });
});

// Process Chess
const chessCfg = tournamentsConfig.find((t) => t.sport === "Chess");
let chessMatchCount = 1;

scheduleRows.filter((r) => r.game === "Chess").forEach((m) => {
  const isFinal = m.p1.includes("Rank");
  let matchId = "";
  let roundNum = 1;
  let roundName = "Group Stage";
  let stageName = `Round-Robin Match ${chessMatchCount}`;
  let groupId = "ALL";
  let groupName = "Group Stage";

  if (isFinal) {
    matchId = "CH-FINAL";
    roundNum = 2;
    roundName = "Championship Final";
    stageName = "Championship Final";
    groupId = "PLAYOFFS";
    groupName = "Knockout Playoffs";
  } else {
    matchId = `CH-M${chessMatchCount++}`;
  }

  const t1 = chessCfg.teams.find((t) => t.name.toLowerCase() === m.p1.toLowerCase());
  const t2 = chessCfg.teams.find((t) => t.name.toLowerCase() === m.p2.toLowerCase());

  matchesBySport.Chess.push({
    id: matchId,
    round: roundNum,
    roundName,
    stageName,
    groupId,
    groupName,
    teamAId: t1 ? t1.id : null,
    teamBId: t2 ? t2.id : null,
    placeholderA: t1 ? null : m.p1,
    placeholderB: t2 ? null : m.p2,
    scoreA: 0,
    scoreB: 0,
    status: "SCHEDULED",
    winnerId: null,
    nextMatchId: null,
    nextMatchSlot: null,
    scheduledAt: `2026-11-07 ${m.startTime}`,
    startTime: m.startTime,
    endTime: m.endTime,
    venue: "4th Floor outside AV Room",
    court: m.court,
    duration: "10 mins"
  });
});

// Process Table Tennis
const ttCfg = tournamentsConfig.find((t) => t.sport === "Table Tennis");
let ttMatchCount = 1;

scheduleRows.filter((r) => r.game === "Table Tennis").forEach((m) => {
  const isSF = m.p1.includes("Rank");
  const isFinal = m.p1.includes("Winner TT SF");

  let matchId = "";
  let roundNum = 1;
  let roundName = m.group;
  let stageName = `${m.group} Match ${ttMatchCount}`;
  let groupId = "ALL";
  let groupName = m.group;
  let nextMatchId = null;
  let nextSlot = null;

  if (m.group === "Group A") {
    groupId = "grp-a";
  } else if (m.group === "Group B") {
    groupId = "grp-b";
  }

  if (isSF) {
    groupId = "PLAYOFFS";
    groupName = "Knockout Playoffs";
    roundNum = 1;
    roundName = "Semi-Finals";
    if (m.startTime === "9:42 AM") {
      matchId = "TT-SF1";
      stageName = "Semifinal 1";
      nextMatchId = "TT-FINAL";
      nextSlot = "A";
    } else {
      matchId = "TT-SF2";
      stageName = "Semifinal 2";
      nextMatchId = "TT-FINAL";
      nextSlot = "B";
    }
  } else if (isFinal) {
    groupId = "PLAYOFFS";
    groupName = "Knockout Playoffs";
    roundNum = 2;
    roundName = "Grand Final";
    stageName = "Grand Final";
    matchId = "TT-FINAL";
  } else {
    matchId = `TT-M${ttMatchCount++}`;
  }

  const t1 = ttCfg.teams.find((t) => t.name.toLowerCase() === m.p1.toLowerCase());
  const t2 = ttCfg.teams.find((t) => t.name.toLowerCase() === m.p2.toLowerCase());

  matchesBySport["Table Tennis"].push({
    id: matchId,
    round: roundNum,
    roundName,
    stageName,
    groupId,
    groupName,
    teamAId: t1 ? t1.id : null,
    teamBId: t2 ? t2.id : null,
    placeholderA: t1 ? null : m.p1,
    placeholderB: t2 ? null : m.p2,
    scoreA: 0,
    scoreB: 0,
    status: "SCHEDULED",
    winnerId: null,
    nextMatchId,
    nextMatchSlot: nextSlot,
    scheduledAt: `2026-11-07 ${m.startTime}`,
    startTime: m.startTime,
    endTime: m.endTime,
    venue: "Ground Floor Main Hall",
    court: m.court,
    duration: "5 mins"
  });
});

// Build Cricket Matches
const cricketRawMatches = [
  { time: "10:30 AM", endTime: "11:00 AM", teamA: "Divine United", teamB: "Yellow palthans", round: 1, matchNum: 1 },
  { time: "11:05 AM", endTime: "11:35 AM", teamA: "Game changer", teamB: "Pink Panther", round: 1, matchNum: 2 },
  { time: "11:40 AM", endTime: "12:10 PM", teamA: "Divine united", teamB: "Green Goblin", round: 2, matchNum: 3 },
  { time: "12:15 PM", endTime: "12:45 PM", teamA: "Yellow Palthans", teamB: "Game changers", round: 2, matchNum: 4 },
  { time: "12:50 PM", endTime: "01:20 PM", teamA: "Pink Panthers", teamB: "Green Goblin", round: 3, matchNum: 5 },
  { time: "01:25 PM", endTime: "01:55 PM", teamA: "Divine United", teamB: "Game Changers", round: 3, matchNum: 6 },
  { time: "02:00 PM", endTime: "02:30 PM", teamA: "Yellow Palthans", teamB: "Pink Panthers", round: 4, matchNum: 7 },
  { time: "02:35 PM", endTime: "03:05 PM", teamA: "Game changers", teamB: "Green Goblin", round: 4, matchNum: 8 },
  { time: "03:10 PM", endTime: "03:40 PM", teamA: "Divine United", teamB: "Pink Panthers", round: 5, matchNum: 9 },
  { time: "03:45 PM", endTime: "04:15 PM", teamA: "Yellow Palthans", teamB: "Green Goblin", round: 5, matchNum: 10 },
  { time: "05:00 PM", endTime: "05:45 PM", isFinal: true, round: 6, matchNum: 11 }
];

const cricketConfig = tournamentsConfig.find((t) => t.id === "dmc-cricket-2026");

cricketRawMatches.forEach((m) => {
  if (m.isFinal) {
    matchesBySport.Cricket.push({
      id: "CRIC-FINAL",
      round: 6,
      roundName: "Championship Final",
      stageName: "Championship Final",
      groupId: "PLAYOFFS",
      groupName: "Championship Final",
      teamAId: null,
      teamBId: null,
      placeholderA: "Winner Group Stage 1",
      placeholderB: "Winner Group Stage 2",
      scoreA: 0,
      scoreB: 0,
      status: "SCHEDULED",
      winnerId: null,
      scheduledAt: "2026-11-07 05:00 PM",
      startTime: "05:00 PM",
      endTime: "05:45 PM",
      venue: "Church Hall",
      court: "Church Hall",
      duration: "45 mins"
    });
    return;
  }

  const normA = normalizeTeamName(m.teamA);
  const normB = normalizeTeamName(m.teamB);
  const tA = cricketConfig.teams.find((t) => t.name === normA);
  const tB = cricketConfig.teams.find((t) => t.name === normB);

  matchesBySport.Cricket.push({
    id: `CRIC-M${m.matchNum}`,
    round: m.round,
    roundName: `Round ${m.round}`,
    stageName: `League Match ${m.matchNum}`,
    groupId: "ALL",
    groupName: "League Stage",
    teamAId: tA ? tA.id : null,
    teamBId: tB ? tB.id : null,
    placeholderA: tA ? null : normA,
    placeholderB: tB ? null : normB,
    scoreA: 0,
    scoreB: 0,
    status: "SCHEDULED",
    winnerId: null,
    scheduledAt: `2026-11-07 ${m.time}`,
    startTime: m.time,
    endTime: m.endTime,
    venue: "Church Hall",
    court: "Church Hall",
    duration: "30 mins"
  });
});

// Build Throwball Matches
const throwballRawMatches = [
  { time: "10:30 AM", endTime: "11:00 AM", teamA: "Game Changers", teamB: "Pink Panthers", round: 1, matchNum: 1 },
  { time: "11:05 AM", endTime: "11:35 AM", teamA: "Divine United", teamB: "Green Goblin", round: 1, matchNum: 2 },
  { time: "11:40 AM", endTime: "12:10 PM", teamA: "Yellow Palthans", teamB: "Game Changers", round: 2, matchNum: 3 },
  { time: "12:15 PM", endTime: "12:45 PM", teamA: "Pink Panthers", teamB: "Green Goblin", round: 2, matchNum: 4 },
  { time: "12:50 PM", endTime: "01:20 PM", teamA: "Divine United", teamB: "Yellow Palthans", round: 3, matchNum: 5 },
  { time: "02:00 PM", endTime: "02:30 PM", teamA: "Game Changers", teamB: "Green Goblin", round: 3, matchNum: 6 },
  { time: "02:35 PM", endTime: "03:05 PM", teamA: "Divine United", teamB: "Pink Panthers", round: 4, matchNum: 7 },
  { time: "03:10 PM", endTime: "03:40 PM", teamA: "Yellow Palthans", teamB: "Green Goblin", round: 4, matchNum: 8 },
  { time: "03:45 PM", endTime: "04:15 PM", teamA: "Divine United", teamB: "Game Changers", round: 5, matchNum: 9 },
  { time: "04:20 PM", endTime: "04:50 PM", teamA: "Yellow Palthans", teamB: "Pink Panthers", round: 5, matchNum: 10 },
  { time: "05:00 PM", endTime: "05:40 PM", isFinal: true, round: 6, matchNum: 11 }
];

const throwballConfig = tournamentsConfig.find((t) => t.id === "dmc-throwball-2026");

throwballRawMatches.forEach((m) => {
  if (m.isFinal) {
    matchesBySport.Throwball.push({
      id: "TB-FINAL",
      round: 6,
      roundName: "Championship Final",
      stageName: "Championship Final",
      groupId: "PLAYOFFS",
      groupName: "Championship Final",
      teamAId: null,
      teamBId: null,
      placeholderA: "Winner Group Stage 1",
      placeholderB: "Winner Group Stage 2",
      scoreA: 0,
      scoreB: 0,
      status: "SCHEDULED",
      winnerId: null,
      scheduledAt: "2026-11-07 05:00 PM",
      startTime: "05:00 PM",
      endTime: "05:40 PM",
      venue: "Grotto Area",
      court: "Grotto Area",
      duration: "40 mins"
    });
    return;
  }

  const normA = normalizeTeamName(m.teamA);
  const normB = normalizeTeamName(m.teamB);
  const tA = throwballConfig.teams.find((t) => t.name === normA);
  const tB = throwballConfig.teams.find((t) => t.name === normB);

  matchesBySport.Throwball.push({
    id: `TB-M${m.matchNum}`,
    round: m.round,
    roundName: `Round ${m.round}`,
    stageName: `League Match ${m.matchNum}`,
    groupId: "ALL",
    groupName: "League Stage",
    teamAId: tA ? tA.id : null,
    teamBId: tB ? tB.id : null,
    placeholderA: tA ? null : normA,
    placeholderB: tB ? null : normB,
    scoreA: 0,
    scoreB: 0,
    status: "SCHEDULED",
    winnerId: null,
    scheduledAt: `2026-11-07 ${m.time}`,
    startTime: m.time,
    endTime: m.endTime,
    venue: "Grotto Area",
    court: "Grotto Area",
    duration: "30 mins"
  });
});

// Assign matches to tournament configs
tournamentsConfig.forEach((cfg) => {
  cfg.matches = matchesBySport[cfg.sport] || [];
});

let totalFixtures = 0;
console.log("Tournaments generated:");
tournamentsConfig.forEach((t) => {
  console.log(`- ${t.title}: ${t.teams.length} teams/players, ${t.groups?.length || 0} groups, ${t.matches.length} matches`);
  totalFixtures += t.matches.length;
});
console.log(`Total fixtures across all tournaments: ${totalFixtures}`);

// Write modular tournament files into lib/data/
const libDataDir = path.join(__dirname, '../lib/data');
if (!fs.existsSync(libDataDir)) {
  fs.mkdirSync(libDataDir, { recursive: true });
}

const moduleMapping = [
  { sport: "Carrom", file: "carromData.js", exp: "carromTournament" },
  { sport: "Chess", file: "chessData.js", exp: "chessTournament" },
  { sport: "Table Tennis", file: "tableTennisData.js", exp: "tableTennisTournament" },
  { sport: "Cricket", file: "cricketData.js", exp: "cricketTournament" },
  { sport: "Throwball", file: "throwballData.js", exp: "throwballTournament" }
];

moduleMapping.forEach(({ sport, file, exp }) => {
  const t = tournamentsConfig.find((x) => x.sport === sport);
  const code = `export const ${exp} = ${JSON.stringify(t, null, 2)};\n`;
  fs.writeFileSync(path.join(libDataDir, file), code, 'utf-8');
});

// Write lean lib/seedData.js
const seedContent = `/**
 * Official Divine Mercy Parish Sports Tournament Seed Data
 * Schedule Date: 7th November 2026
 * Modularized by sport for maximum maintainability and fast compilation.
 */

import { carromTournament } from "./data/carromData.js";
import { chessTournament } from "./data/chessData.js";
import { tableTennisTournament } from "./data/tableTennisData.js";
import { cricketTournament } from "./data/cricketData.js";
import { throwballTournament } from "./data/throwballData.js";

export const initialTournaments = [
  carromTournament,
  chessTournament,
  tableTennisTournament,
  cricketTournament,
  throwballTournament
];
`;

fs.writeFileSync(path.join(__dirname, '../lib/seedData.js'), seedContent, 'utf-8');

// Also write to data/tournaments.json
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
fs.writeFileSync(path.join(dataDir, 'tournaments.json'), JSON.stringify(tournamentsConfig, null, 2), 'utf-8');

console.log("Successfully updated modular data files, lib/seedData.js and data/tournaments.json!");
