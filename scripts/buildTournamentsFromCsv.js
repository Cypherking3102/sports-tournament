import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Raw CSV data for Carrom, Chess, Table Tennis from user schedule
const rawSchedules = {
  Carrom: [
    { start: "08:00 AM", end: "08:07 AM", p1: "Nelson Fernandes", p2: "Alphonso Menezes", group: "Group A", court: "Board 1" },
    { start: "08:00 AM", end: "08:07 AM", p1: "Rosslin Louis", p2: "Gerald Rodrigues", group: "Group B", court: "Board 2" },
    { start: "08:00 AM", end: "08:07 AM", p1: "Sunborn Perrira", p2: "Charlette Sequera", group: "Group B", court: "Board 3" },
    { start: "08:00 AM", end: "08:07 AM", p1: "Joseph Rodrigues", p2: "Florine Fernandes", group: "Group C", court: "Board 4" },
    { start: "08:09 AM", end: "08:16 AM", p1: "Amal lancelot", p2: "Alphonso Menezes", group: "Group A", court: "Board 1" },
    { start: "08:09 AM", end: "08:16 AM", p1: "Lawrence Rodrigues", p2: "Nelson Fernandes", group: "Group A", court: "Board 2" },
    { start: "08:09 AM", end: "08:16 AM", p1: "Jim D'souza", p2: "James Louis", group: "Group B", court: "Board 3" },
    { start: "08:09 AM", end: "08:16 AM", p1: "Sunborn Perrira", p2: "Gerald Rodrigues", group: "Group B", court: "Board 4" },
    { start: "08:09 AM", end: "08:16 AM", p1: "Daniel Danthi", p2: "Florine Fernandes", group: "Group C", court: "Board 5" },
    { start: "08:18 AM", end: "08:25 AM", p1: "Colet Coelho", p2: "Alphonso Menezes", group: "Group A", court: "Board 1" },
    { start: "08:18 AM", end: "08:25 AM", p1: "James Louis", p2: "Gerald Rodrigues", group: "Group B", court: "Board 2" },
    { start: "08:18 AM", end: "08:25 AM", p1: "Jim D'souza", p2: "Sunborn Perrira", group: "Group B", court: "Board 3" },
    { start: "08:18 AM", end: "08:25 AM", p1: "Daniel Danthi", p2: "Joseph Rodrigues", group: "Group C", court: "Board 4" },
    { start: "08:18 AM", end: "08:25 AM", p1: "Patrick Menezes", p2: "Florine Fernandes", group: "Group C", court: "Board 5" },
    { start: "08:25 AM", end: "08:32 AM", p1: "Lawrence Rodrigues", p2: "Amal lancelot", group: "Group A", court: "Board 1" },
    { start: "08:27 AM", end: "08:34 AM", p1: "James Louis", p2: "Charlette Sequera", group: "Group B", court: "Board 2" },
    { start: "08:27 AM", end: "08:34 AM", p1: "Jim D'souza", p2: "Gerald Rodrigues", group: "Group B", court: "Board 3" },
    { start: "08:27 AM", end: "08:34 AM", p1: "Sunborn Perrira", p2: "Rosslin Louis", group: "Group B", court: "Board 4" },
    { start: "08:27 AM", end: "08:34 AM", p1: "Patrick Menezes", p2: "Joseph Rodrigues", group: "Group C", court: "Board 5" },
    { start: "08:32 AM", end: "08:39 AM", p1: "Dean D'souza", p2: "Florine Fernandes", group: "Group C", court: "Board 1" },
    { start: "08:34 AM", end: "08:41 AM", p1: "Lawrence Rodrigues", p2: "Alphonso Menezes", group: "Group A", court: "Board 2" },
    { start: "08:36 AM", end: "08:43 AM", p1: "Gerald Rodrigues", p2: "Charlette Sequera", group: "Group B", court: "Board 3" },
    { start: "08:36 AM", end: "08:43 AM", p1: "Sunborn Perrira", p2: "James Louis", group: "Group B", court: "Board 4" },
    { start: "08:36 AM", end: "08:43 AM", p1: "Patrick Menezes", p2: "Daniel Danthi", group: "Group C", court: "Board 5" },
    { start: "08:41 AM", end: "08:48 AM", p1: "Dean D'souza", p2: "Joseph Rodrigues", group: "Group C", court: "Board 1" },
    { start: "08:41 AM", end: "08:48 AM", p1: "Emmanuel Menezes", p2: "Florine Fernandes", group: "Group C", court: "Board 2" },
    { start: "08:45 AM", end: "08:52 AM", p1: "Colet Coelho", p2: "Anthony Aranha", group: "Group A", court: "Board 3" },
    { start: "08:45 AM", end: "08:52 AM", p1: "James Louis", p2: "Rosslin Louis", group: "Group B", court: "Board 4" },
    { start: "08:45 AM", end: "08:52 AM", p1: "Jim D'souza", p2: "Charlette Sequera", group: "Group B", court: "Board 5" },
    { start: "08:50 AM", end: "08:57 AM", p1: "Dean D'souza", p2: "Daniel Danthi", group: "Group C", court: "Board 1" },
    { start: "08:50 AM", end: "08:57 AM", p1: "Emmanuel Menezes", p2: "Joseph Rodrigues", group: "Group C", court: "Board 2" },
    { start: "08:54 AM", end: "09:01 AM", p1: "Lawrence Rodrigues", p2: "Colet Coelho", group: "Group A", court: "Board 3" },
    { start: "08:54 AM", end: "09:01 AM", p1: "Nelson Fernandes", p2: "Anthony Aranha", group: "Group A", court: "Board 4" },
    { start: "08:54 AM", end: "09:01 AM", p1: "Rosslin Louis", p2: "Charlette Sequera", group: "Group B", court: "Board 5" },
    { start: "08:59 AM", end: "09:06 AM", p1: "Emmanuel Menezes", p2: "Dean D'souza", group: "Group C", court: "Board 1" },
    { start: "09:03 AM", end: "09:10 AM", p1: "Amal lancelot", p2: "Nelson Fernandes", group: "Group A", court: "Board 2" },
    { start: "09:03 AM", end: "09:10 AM", p1: "Anthony Aranha", p2: "Alphonso Menezes", group: "Group A", court: "Board 3" },
    { start: "09:03 AM", end: "09:10 AM", p1: "Jim D'souza", p2: "Rosslin Louis", group: "Group B", court: "Board 4" },
    { start: "09:08 AM", end: "09:15 AM", p1: "Dean D'souza", p2: "Patrick Menezes", group: "Group C", court: "Board 1" },
    { start: "09:08 AM", end: "09:15 AM", p1: "Emmanuel Menezes", p2: "Daniel Danthi", group: "Group C", court: "Board 5" },
    { start: "09:12 AM", end: "09:19 AM", p1: "Amal lancelot", p2: "Anthony Aranha", group: "Group A", court: "Board 2" },
    { start: "09:12 AM", end: "09:19 AM", p1: "Colet Coelho", p2: "Nelson Fernandes", group: "Group A", court: "Board 3" },
    { start: "09:17 AM", end: "09:24 AM", p1: "Emmanuel Menezes", p2: "Patrick Menezes", group: "Group C", court: "Board 1" },
    { start: "09:21 AM", end: "09:28 AM", p1: "Colet Coelho", p2: "Amal lancelot", group: "Group A", court: "Board 2" },
    { start: "09:21 AM", end: "09:28 AM", p1: "Lawrence Rodrigues", p2: "Anthony Aranha", group: "Group A", court: "Board 3" },
    // Quarterfinals
    { start: "09:33 AM", end: "09:40 AM", p1: "Carrom Group A Rank 1", p2: "Carrom Best 3rd Place #2", group: "Playoffs", court: "Board 1", isPlayoff: true, qfNum: 1, nextMatchId: "CR-SF1", nextSlot: "A" },
    { start: "09:33 AM", end: "09:40 AM", p1: "Carrom Group B Rank 1", p2: "Carrom Best 3rd Place #1", group: "Playoffs", court: "Board 2", isPlayoff: true, qfNum: 2, nextMatchId: "CR-SF2", nextSlot: "A" },
    { start: "09:33 AM", end: "09:40 AM", p1: "Carrom Group C Rank 1", p2: "Carrom Group A Rank 2", group: "Playoffs", court: "Board 3", isPlayoff: true, qfNum: 3, nextMatchId: "CR-SF2", nextSlot: "B" },
    { start: "09:33 AM", end: "09:40 AM", p1: "Carrom Group B Rank 2", p2: "Carrom Group C Rank 2", group: "Playoffs", court: "Board 4", isPlayoff: true, qfNum: 4, nextMatchId: "CR-SF1", nextSlot: "B" },
    // Semifinals
    { start: "09:42 AM", end: "09:49 AM", p1: "Winner Carrom QF1", p2: "Winner Carrom QF4", group: "Playoffs", court: "Board 1", isPlayoff: true, sfNum: 1, nextMatchId: "CR-FINAL", nextSlot: "A" },
    { start: "09:42 AM", end: "09:49 AM", p1: "Winner Carrom QF2", p2: "Winner Carrom QF3", group: "Playoffs", court: "Board 2", isPlayoff: true, sfNum: 2, nextMatchId: "CR-FINAL", nextSlot: "B" },
    // Grand Final
    { start: "09:51 AM", end: "09:58 AM", p1: "Winner Carrom SF1", p2: "Winner Carrom SF2", group: "Playoffs", court: "Board 1", isPlayoff: true, isFinal: true }
  ],

  Chess: [
    { start: "08:00 AM", end: "08:10 AM", p1: "Joel Britto", p2: "Don Danthi", group: "Group Stage", court: "Board 1" },
    { start: "08:00 AM", end: "08:10 AM", p1: "Shibu Jacob", p2: "Christine", group: "Group Stage", court: "Board 2" },
    { start: "08:13 AM", end: "08:23 AM", p1: "Joel Britto", p2: "Christine", group: "Group Stage", court: "Board 1" },
    { start: "08:13 AM", end: "08:23 AM", p1: "Shibu Jacob", p2: "Don Danthi", group: "Group Stage", court: "Board 2" },
    { start: "08:26 AM", end: "08:36 AM", p1: "Christine", p2: "Don Danthi", group: "Group Stage", court: "Board 1" },
    { start: "08:26 AM", end: "08:36 AM", p1: "Shibu Jacob", p2: "Joel Britto", group: "Group Stage", court: "Board 2" },
    { start: "08:30 AM", end: "08:40 AM", p1: "Mario Chettiar", p2: "Frank Mathias", group: "Group Stage", court: "Board 3" },
    { start: "08:43 AM", end: "08:53 AM", p1: "Frank Mathias", p2: "Shibu Jacob", group: "Group Stage", court: "Board 1" },
    { start: "08:43 AM", end: "08:53 AM", p1: "Mario Chettiar", p2: "Christine", group: "Group Stage", court: "Board 2" },
    { start: "08:56 AM", end: "09:06 AM", p1: "Frank Mathias", p2: "Joel Britto", group: "Group Stage", court: "Board 1" },
    { start: "08:56 AM", end: "09:06 AM", p1: "Mario Chettiar", p2: "Shibu Jacob", group: "Group Stage", court: "Board 2" },
    { start: "09:09 AM", end: "09:19 AM", p1: "Frank Mathias", p2: "Don Danthi", group: "Group Stage", court: "Board 1" },
    { start: "09:09 AM", end: "09:19 AM", p1: "Mario Chettiar", p2: "Joel Britto", group: "Group Stage", court: "Board 2" },
    { start: "09:22 AM", end: "09:32 AM", p1: "Frank Mathias", p2: "Christine", group: "Group Stage", court: "Board 1" },
    { start: "09:22 AM", end: "09:32 AM", p1: "Mario Chettiar", p2: "Don Danthi", group: "Group Stage", court: "Board 2" },
    // Championship Final
    { start: "09:35 AM", end: "09:45 AM", p1: "Chess Group Rank 1", p2: "Chess Group Rank 2", group: "Playoffs", court: "Board 1", isPlayoff: true, isFinal: true }
  ],

  "Table Tennis": [
    { start: "08:00 AM", end: "08:05 AM", p1: "Nigel Moriera", p2: "Mario Chettiar", group: "Group B", court: "Table 1" },
    { start: "08:05 AM", end: "08:10 AM", p1: "Vincent Chettiar", p2: "Mario Chettiar", group: "Group B", court: "Table 1" },
    { start: "08:10 AM", end: "08:15 AM", p1: "Malcolm Corria", p2: "Mario Chettiar", group: "Group B", court: "Table 1" },
    { start: "08:15 AM", end: "08:20 AM", p1: "Anthony Aranha", p2: "Mario Chettiar", group: "Group B", court: "Table 1" },
    { start: "08:20 AM", end: "08:25 AM", p1: "Anthony Aranha", p2: "Nigel Moriera", group: "Group B", court: "Table 1" },
    { start: "08:25 AM", end: "08:30 AM", p1: "Vincent Chettiar", p2: "Anthony Aranha", group: "Group B", court: "Table 1" },
    { start: "08:30 AM", end: "08:35 AM", p1: "Malcolm Corria", p2: "Anthony Aranha", group: "Group B", court: "Table 1" },
    { start: "08:35 AM", end: "08:40 AM", p1: "Vincent Chettiar", p2: "Nigel Moriera", group: "Group B", court: "Table 1" },
    { start: "08:40 AM", end: "08:45 AM", p1: "Malcolm Corria", p2: "Nigel Moriera", group: "Group B", court: "Table 1" },
    { start: "08:45 AM", end: "08:50 AM", p1: "Malcolm Corria", p2: "Vincent Chettiar", group: "Group B", court: "Table 1" },
    { start: "08:53 AM", end: "08:58 AM", p1: "Fr. Kenneth Pinto", p2: "Gerald Rodrigues", group: "Group A", court: "Table 1" },
    { start: "08:58 AM", end: "09:03 AM", p1: "Sunborn Perrira", p2: "Gerald Rodrigues", group: "Group A", court: "Table 1" },
    { start: "09:03 AM", end: "09:08 AM", p1: "Fr. Kenneth Pinto", p2: "Sunborn Perrira", group: "Group A", court: "Table 1" },
    { start: "09:08 AM", end: "09:13 AM", p1: "Sunborn Perrira", p2: "James Louis", group: "Group A", court: "Table 1" },
    { start: "09:13 AM", end: "09:18 AM", p1: "James Louis", p2: "Gerald Rodrigues", group: "Group A", court: "Table 1" },
    { start: "09:18 AM", end: "09:23 AM", p1: "Fr. Kenneth Pinto", p2: "James Louis", group: "Group A", court: "Table 1" },
    // Semifinals
    { start: "09:42 AM", end: "09:47 AM", p1: "TT Group A Rank 1", p2: "TT Group B Rank 2", group: "Playoffs", court: "Table 1", isPlayoff: true, sfNum: 1, nextMatchId: "TT-FINAL", nextSlot: "A" },
    { start: "09:47 AM", end: "09:52 AM", p1: "TT Group B Rank 1", p2: "TT Group A Rank 2", group: "Playoffs", court: "Table 1", isPlayoff: true, sfNum: 2, nextMatchId: "TT-FINAL", nextSlot: "B" },
    // Grand Final
    { start: "09:52 AM", end: "09:57 AM", p1: "Winner TT SF1", p2: "Winner TT SF2", group: "Playoffs", court: "Table 1", isPlayoff: true, isFinal: true }
  ]
};

// Official Rosters
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
      "Rosslin Louis",
      "Gerald Rodrigues",
      "Sunborn Perrira",
      "Charlette Sequera",
      "Jim D'souza",
      "James Louis"
    ],
    "Group C": [
      "Joseph Rodrigues",
      "Florine Fernandes",
      "Daniel Danthi",
      "Patrick Menezes",
      "Dean D'souza",
      "Emmanuel Menezes"
    ]
  },
  Chess: {
    "Group Stage": [
      "Joel Britto",
      "Don Danthi",
      "Shibu Jacob",
      "Christine",
      "Mario Chettiar",
      "Frank Mathias"
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
      "Nigel Moriera",
      "Mario Chettiar",
      "Vincent Chettiar",
      "Malcolm Corria",
      "Anthony Aranha"
    ]
  }
};

// 5 Parish Teams for Cricket & Throwball
const parishTeams = [
  { id: "team-divine-united", name: "Divine United", shortName: "DU", seed: 1 },
  { id: "team-yellow-palthans", name: "Yellow Palthans", shortName: "YP", seed: 2 },
  { id: "team-game-changers", name: "Game Changers", shortName: "GC", seed: 3 },
  { id: "team-pink-panthers", name: "Pink Panthers", shortName: "PP", seed: 4 },
  { id: "team-green-goblin", name: "Green Goblin (AD)", shortName: "GG", seed: 5 }
];

function normalizeTeamName(rawName) {
  const clean = rawName.trim().toLowerCase();
  if (clean === "ad" || clean.includes("green goblin")) return "Green Goblin (AD)";
  if (clean.includes("divine united")) return "Divine United";
  if (clean.includes("yellow palthan") || clean.includes("yellow paltan")) return "Yellow Palthans";
  if (clean.includes("game changer")) return "Game Changers";
  if (clean.includes("pink panther")) return "Pink Panthers";
  return rawName.trim();
}

function makePlayerId(name) {
  return "p-" + name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
}

// Build Tournaments Configuration
const tournamentsConfig = [
  {
    id: "dmc-carrom-2026",
    title: "Divine Mercy Parish Carrom Tournament 2026",
    sport: "Carrom",
    sportIcon: "",
    scoreUnit: "Points",
    format: "GROUP_KNOCKOUT",
    status: "UPCOMING",
    participantType: "INDIVIDUAL",
    startDate: "2026-11-07",
    endDate: "2026-11-07",
    location: "Parish Hall - 4th Floor (Boards 1-5)",
    organizer: "Divine Mercy Church",
    description: "Official Parish Carrom Championship 2026. 3 Groups with 18 players competing across 5 boards, followed by Quarterfinals, Semifinals and Grand Final.",
    bannerUrl: "https://images.unsplash.com/photo-1611195974226-a6a9be9dd763?auto=format&fit=crop&w=1200&q=80",
    pointsConfig: { win: 2, draw: 1, loss: 0, showForm: true },
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
    title: "Divine Mercy Parish Chess Tournament 2026",
    sport: "Chess",
    sportIcon: "",
    scoreUnit: "Points",
    format: "ROUND_ROBIN",
    status: "UPCOMING",
    participantType: "INDIVIDUAL",
    startDate: "2026-11-07",
    endDate: "2026-11-07",
    location: "Parish Hall - 4th Floor (Boards 1-3)",
    organizer: "Divine Mercy Church",
    description: "Official Parish Chess Championship 2026. 6 players in a 15-match round-robin stage followed by the Championship Final between Top 2.",
    bannerUrl: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=1200&q=80",
    pointsConfig: { win: 2, draw: 1, loss: 0, showForm: true },
    rules: [
      { id: "ch-1", title: "Game Time", category: "Rules", content: "10 minutes rapid play per game with quick board reset." },
      { id: "ch-2", title: "Final Match", category: "Format", content: "Top 2 players from the round-robin standings contest the Championship Final." },
      { id: "ch-3", title: "Fair Play", category: "Conduct", content: "Respectful silence during play and shake hands before/after every match." }
    ],
    groups: []
  },
  {
    id: "dmc-table-tennis-2026",
    title: "Divine Mercy Parish Table Tennis Tournament 2026",
    sport: "Table Tennis",
    sportIcon: "",
    scoreUnit: "Sets",
    format: "GROUP_KNOCKOUT",
    status: "UPCOMING",
    participantType: "INDIVIDUAL",
    startDate: "2026-11-07",
    endDate: "2026-11-07",
    location: "Parish Ground Floor (Table 1)",
    organizer: "Divine Mercy Church",
    description: "Official Parish Table Tennis Championship 2026. 9 players across Group A (4 players) & Group B (5 players), leading to crossover semifinals and grand final.",
    bannerUrl: "https://images.unsplash.com/photo-1534158914592-062992fbe900?auto=format&fit=crop&w=1200&q=80",
    pointsConfig: { win: 2, draw: 0, loss: 0, showForm: true },
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
    title: "Divine Mercy Parish Cricket Tournament 2026",
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
    description: "Official Parish Cricket Championship 2026. 5 teams: Divine United, Yellow Palthans, Game Changers, Pink Panthers, and Green Goblin (AD). Top 2 contest the Grand Final.",
    bannerUrl: "https://images.unsplash.com/photo-1531415074868-036b107e7752?auto=format&fit=crop&w=1200&q=80",
    pointsConfig: { win: 2, draw: 1, loss: 0, showForm: true },
    rules: [
      { id: "cr-1", title: "Match Format", category: "Rules", content: "Rapid 5 overs per side. Rotational bowling with standard cricket rules." },
      { id: "cr-2", title: "Championship Final", category: "Format", content: "Top 2 teams on the league points table contest the Grand Final at 05:00 PM." },
      { id: "cr-3", title: "Sportsmanship", category: "Conduct", content: "Umpire decisions are final. Respect opponents and celebrate parish fellowship." }
    ],
    groups: []
  },
  {
    id: "dmc-throwball-2026",
    title: "Divine Mercy Parish Throwball Tournament 2026",
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
    description: "Official Parish Throwball Championship 2026. 5 teams: Divine United, Yellow Palthans, Game Changers, Pink Panthers, and Green Goblin (AD). Top 2 contest the Grand Final.",
    bannerUrl: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=1200&q=80",
    pointsConfig: { win: 2, draw: 1, loss: 0, showForm: true },
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

// Parse matches for Carrom, Chess, Table Tennis
Object.entries(rawSchedules).forEach(([sport, scheduleList]) => {
  const targetConfig = tournamentsConfig.find((c) => c.sport === sport);
  let matchCounter = 1;

  scheduleList.forEach((m) => {
    const isPlayoff = Boolean(m.isPlayoff);
    let groupId = "ALL";
    let groupName = "Group Stage";

    if (m.group === "Group A") {
      groupId = "grp-a";
      groupName = "Group A";
    } else if (m.group === "Group B") {
      groupId = "grp-b";
      groupName = "Group B";
    } else if (m.group === "Group C") {
      groupId = "grp-c";
      groupName = "Group C";
    } else if (isPlayoff) {
      groupId = "PLAYOFFS";
      groupName = "Knockout Playoffs";
    }

    const team1 = targetConfig ? targetConfig.teams.find((t) => t.name.toLowerCase() === m.p1.toLowerCase()) : null;
    const team2 = targetConfig ? targetConfig.teams.find((t) => t.name.toLowerCase() === m.p2.toLowerCase()) : null;

    let matchId = "";
    let roundNum = 1;
    let roundName = "Group Stage";
    let stageName = `${groupName} Match ${matchCounter}`;

    if (sport === "Carrom") {
      if (m.qfNum) {
        matchId = `CR-QF${m.qfNum}`;
        roundNum = 1;
        roundName = "Quarter-Finals";
        stageName = `Quarterfinal ${m.qfNum}`;
      } else if (m.sfNum) {
        matchId = `CR-SF${m.sfNum}`;
        roundNum = 2;
        roundName = "Semi-Finals";
        stageName = `Semifinal ${m.sfNum}`;
      } else if (m.isFinal) {
        matchId = "CR-FINAL";
        roundNum = 3;
        roundName = "Grand Final";
        stageName = "Grand Final";
      } else {
        matchId = `CR-M${matchCounter}`;
        roundNum = 1;
        roundName = groupName;
        stageName = `${groupName} Fixture`;
      }
    } else if (sport === "Chess") {
      if (m.isFinal) {
        matchId = "CH-FINAL";
        roundNum = 2;
        roundName = "Championship Final";
        stageName = "Championship Final";
      } else {
        matchId = `CH-M${matchCounter}`;
        roundNum = 1;
        roundName = "Group Stage";
        stageName = `Round-Robin Match ${matchCounter}`;
      }
    } else if (sport === "Table Tennis") {
      if (m.sfNum) {
        matchId = `TT-SF${m.sfNum}`;
        roundNum = 1;
        roundName = "Semi-Finals";
        stageName = `Semifinal ${m.sfNum}`;
      } else if (m.isFinal) {
        matchId = "TT-FINAL";
        roundNum = 2;
        roundName = "Grand Final";
        stageName = "Grand Final";
      } else {
        matchId = `TT-M${matchCounter}`;
        roundNum = 1;
        roundName = groupName;
        stageName = `${groupName} Match ${matchCounter}`;
      }
    }

    matchCounter++;

    const matchObj = {
      id: matchId,
      round: roundNum,
      roundName,
      stageName,
      groupId,
      groupName,
      teamAId: team1 ? team1.id : null,
      teamBId: team2 ? team2.id : null,
      placeholderA: team1 ? null : m.p1,
      placeholderB: team2 ? null : m.p2,
      scoreA: 0,
      scoreB: 0,
      status: "SCHEDULED",
      winnerId: null,
      nextMatchId: m.nextMatchId || null,
      nextMatchSlot: m.nextSlot || null,
      scheduledAt: `2026-11-07 ${m.start}`,
      startTime: m.start,
      endTime: m.end,
      venue: sport === "Table Tennis" ? "Parish Ground Floor" : "Parish Hall - 4th Floor",
      court: m.court,
      duration: sport === "Chess" ? "10 mins" : sport === "Table Tennis" ? "5 mins" : "7 mins"
    };

    matchesBySport[sport].push(matchObj);
  });
});

// Build Cricket Matches (From PDF Page 1)
const cricketRawMatches = [
  { time: "10:30 AM", endTime: "11:00 AM", teamA: "Divine United", teamB: "Yellow palthans", round: 1, matchNum: 1 },
  { time: "11:05 AM", endTime: "11:35 AM", teamA: "Game changer", teamB: "Pink Panther", round: 1, matchNum: 2 },
  { time: "11:40 AM", endTime: "12:10 PM", teamA: "Divine united", teamB: "AD", round: 2, matchNum: 3 },
  { time: "12:15 PM", endTime: "12:45 PM", teamA: "Yellow Palthans", teamB: "Game changers", round: 2, matchNum: 4 },
  { time: "12:50 PM", endTime: "01:20 PM", teamA: "Pink Panthers", teamB: "AD", round: 3, matchNum: 5 },
  { time: "01:25 PM", endTime: "01:55 PM", teamA: "Divine United", teamB: "Game Changers", round: 3, matchNum: 6 },
  { time: "02:00 PM", endTime: "02:30 PM", teamA: "Yellow Palthans", teamB: "Pink Panthers", round: 4, matchNum: 7 },
  { time: "02:35 PM", endTime: "03:05 PM", teamA: "Game changers", teamB: "AD", round: 4, matchNum: 8 },
  { time: "03:10 PM", endTime: "03:40 PM", teamA: "Divine United", teamB: "Pink Panthers", round: 5, matchNum: 9 },
  { time: "03:45 PM", endTime: "04:15 PM", teamA: "Yellow Palthans", teamB: "AD", round: 5, matchNum: 10 },
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

// Build Throwball Matches (From PDF Page 2)
const throwballRawMatches = [
  { time: "10:30 AM", endTime: "11:00 AM", teamA: "Game Changers", teamB: "Pink Panthers", round: 1, matchNum: 1 },
  { time: "11:05 AM", endTime: "11:35 AM", teamA: "Divine United", teamB: "AD", round: 1, matchNum: 2 },
  { time: "11:40 AM", endTime: "12:10 PM", teamA: "Yellow Palthans", teamB: "Game Changers", round: 2, matchNum: 3 },
  { time: "12:15 PM", endTime: "12:45 PM", teamA: "Pink Panthers", teamB: "AD", round: 2, matchNum: 4 },
  { time: "12:50 PM", endTime: "01:20 PM", teamA: "Divine United", teamB: "Yellow Palthans", round: 3, matchNum: 5 },
  // BREAK at 01:25 PM
  { time: "02:00 PM", endTime: "02:30 PM", teamA: "Game Changers", teamB: "AD", round: 3, matchNum: 6 },
  { time: "02:35 PM", endTime: "03:05 PM", teamA: "Divine United", teamB: "Pink Panthers", round: 4, matchNum: 7 },
  { time: "03:10 PM", endTime: "03:40 PM", teamA: "Yellow Palthans", teamB: "AD", round: 4, matchNum: 8 },
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

// Write to seedData.js
const seedContent = `/**
 * Official Divine Mercy Parish Sports Tournament Seed Data
 * Schedule Date: 7th November 2026
 * Sports: Carrom, Chess, Table Tennis, Cricket, Throwball
 * Total Fixtures: ${totalFixtures} Matches
 */

export const initialTournaments = ${JSON.stringify(tournamentsConfig, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, '../lib/seedData.js'), seedContent, 'utf-8');

// Also write to data/tournaments.json
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
fs.writeFileSync(path.join(dataDir, 'tournaments.json'), JSON.stringify(tournamentsConfig, null, 2), 'utf-8');

console.log("Successfully updated lib/seedData.js and data/tournaments.json!");
