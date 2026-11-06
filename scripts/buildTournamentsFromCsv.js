import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const csvRaw = `08:00,08:07,Carrom,Group A Round 1,CR-A-R1-M1,Lawrence Rodrigues,Alphonso Menezes,4th Floor,Board 1,7,2,Player rest: 2 min
08:00,08:07,Carrom,Group A Round 1,CR-A-R1-M2,Colet Coelho,Anthony Aranha,4th Floor,Board 2,7,2,Player rest: 2 min
08:00,08:07,Carrom,Group A Round 1,CR-A-R1-M3,Amal lancelot,Nelson Fernandes,4th Floor,Board 3,7,2,Player rest: 2 min
08:00,08:07,Carrom,Group B Round 1,CR-B-R1-M1,Jim D'souza,Charlette Sequera,4th Floor,Board 4,7,2,Player rest: 2 min
08:00,08:07,Carrom,Group B Round 1,CR-B-R1-M2,Sunborn Perrira,Gerald Rodrigues,4th Floor,Board 5,7,2,Player rest: 2 min
08:00,08:10,Chess,Group Round 1,CH-R1-M1,Mario Chettiar,Don Danthi,4th Floor,Board 1,10,3,Player rest: 2 min
08:00,08:10,Chess,Group Round 1,CH-R1-M2,Frank Mathias,Christine,4th Floor,Board 2,10,3,Player rest: 2 min
08:00,08:10,Chess,Group Round 1,CH-R1-M3,Shibu Jacob,Joel Britto,4th Floor,Board 3,10,3,Player rest: 2 min
08:00,08:07,Table Tennis,Group A Round 2,TT-A-R2-M1,Fr. Kenneth Pinto,James Louis,Ground Floor,Table 1,7,1,Player rest: 1 min
08:08,08:15,Table Tennis,Group B Round 1,TT-B-R1-M1,Malcolm Corria,Nigel Moriera,Ground Floor,Table 1,7,1,Player rest: 1 min
08:09,08:16,Carrom,Group A Round 2,CR-A-R2-M1,Lawrence Rodrigues,Anthony Aranha,4th Floor,Board 1,7,2,Player rest: 2 min
08:09,08:16,Carrom,Group A Round 2,CR-A-R2-M2,Alphonso Menezes,Nelson Fernandes,4th Floor,Board 2,7,2,Player rest: 2 min
08:09,08:16,Carrom,Group A Round 2,CR-A-R2-M3,Colet Coelho,Amal lancelot,4th Floor,Board 3,7,2,Player rest: 2 min
08:09,08:16,Carrom,Group B Round 2,CR-B-R2-M1,Jim D'souza,Gerald Rodrigues,4th Floor,Board 4,7,2,Player rest: 2 min
08:09,08:16,Carrom,Group B Round 2,CR-B-R2-M2,Charlette Sequera,Rosslin Louis,4th Floor,Board 5,7,2,Player rest: 2 min
08:13,08:23,Chess,Group Round 2,CH-R2-M1,Mario Chettiar,Christine,4th Floor,Board 1,10,3,Player rest: 2 min
08:13,08:23,Chess,Group Round 2,CH-R2-M2,Don Danthi,Joel Britto,4th Floor,Board 2,10,3,Player rest: 2 min
08:13,08:23,Chess,Group Round 2,CH-R2-M3,Frank Mathias,Shibu Jacob,4th Floor,Board 3,10,3,Player rest: 2 min
08:16,08:23,Table Tennis,Group B Round 2,TT-B-R2-M2,Nigel Moriera,Vincent Chettiar,Ground Floor,Table 1,7,1,Player rest: 1 min
08:18,08:25,Carrom,Group A Round 3,CR-A-R3-M1,Lawrence Rodrigues,Nelson Fernandes,4th Floor,Board 1,7,2,Player rest: 2 min
08:18,08:25,Carrom,Group A Round 3,CR-A-R3-M2,Anthony Aranha,Amal lancelot,4th Floor,Board 2,7,2,Player rest: 2 min
08:18,08:25,Carrom,Group A Round 3,CR-A-R3-M3,Alphonso Menezes,Colet Coelho,4th Floor,Board 3,7,2,Player rest: 2 min
08:18,08:25,Carrom,Group B Round 1,CR-B-R1-M3,James Louis,Rosslin Louis,4th Floor,Board 4,7,2,Player rest: 2 min
08:18,08:25,Carrom,Group B Round 3,CR-B-R3-M3,Charlette Sequera,Sunborn Perrira,4th Floor,Board 5,7,2,Player rest: 2 min
08:24,08:31,Table Tennis,Group B Round 3,TT-B-R3-M1,Malcolm Corria,Vincent Chettiar,Ground Floor,Table 1,7,1,Player rest: 1 min
08:26,08:36,Chess,Group Round 3,CH-R3-M1,Mario Chettiar,Joel Britto,4th Floor,Board 1,10,3,Player rest: 2 min
08:26,08:36,Chess,Group Round 3,CH-R3-M2,Christine,Shibu Jacob,4th Floor,Board 2,10,3,Player rest: 2 min
08:26,08:36,Chess,Group Round 3,CH-R3-M3,Don Danthi,Frank Mathias,4th Floor,Board 3,10,3,Player rest: 2 min
08:27,08:34,Carrom,Group A Round 4,CR-A-R4-M1,Lawrence Rodrigues,Amal lancelot,4th Floor,Board 1,7,2,Player rest: 2 min
08:27,08:34,Carrom,Group A Round 4,CR-A-R4-M2,Nelson Fernandes,Colet Coelho,4th Floor,Board 2,7,2,Player rest: 2 min
08:27,08:34,Carrom,Group A Round 4,CR-A-R4-M3,Anthony Aranha,Alphonso Menezes,4th Floor,Board 3,7,2,Player rest: 2 min
08:27,08:34,Carrom,Group B Round 2,CR-B-R2-M3,Sunborn Perrira,James Louis,4th Floor,Board 4,7,2,Player rest: 2 min
08:27,08:34,Carrom,Group B Round 3,CR-B-R3-M1,Jim D'souza,Rosslin Louis,4th Floor,Board 5,7,2,Player rest: 2 min
08:32,08:39,Table Tennis,Group A Round 1,TT-A-R1-M1,Fr. Kenneth Pinto,Gerald Rodrigues,Ground Floor,Table 1,7,1,Player rest: 1 min
08:36,08:43,Carrom,Group A Round 5,CR-A-R5-M1,Lawrence Rodrigues,Colet Coelho,4th Floor,Board 1,7,2,Player rest: 2 min
08:36,08:43,Carrom,Group A Round 5,CR-A-R5-M2,Amal lancelot,Alphonso Menezes,4th Floor,Board 2,7,2,Player rest: 2 min
08:36,08:43,Carrom,Group A Round 5,CR-A-R5-M3,Nelson Fernandes,Anthony Aranha,4th Floor,Board 3,7,2,Player rest: 2 min
08:36,08:43,Carrom,Group B Round 4,CR-B-R4-M1,Jim D'souza,James Louis,4th Floor,Board 4,7,2,Player rest: 2 min
08:36,08:43,Carrom,Group B Round 4,CR-B-R4-M2,Rosslin Louis,Sunborn Perrira,4th Floor,Board 5,7,2,Player rest: 2 min
08:39,08:49,Chess,Group Round 4,CH-R4-M1,Mario Chettiar,Shibu Jacob,4th Floor,Board 1,10,3,Player rest: 2 min
08:39,08:49,Chess,Group Round 4,CH-R4-M2,Joel Britto,Frank Mathias,4th Floor,Board 2,10,3,Player rest: 2 min
08:39,08:49,Chess,Group Round 4,CH-R4-M3,Christine,Don Danthi,4th Floor,Board 3,10,3,Player rest: 2 min
08:45,08:52,Carrom,Group B Round 5,CR-B-R5-M1,Jim D'souza,Sunborn Perrira,4th Floor,Board 1,7,2,Player rest: 2 min
08:45,08:52,Carrom,Group B Round 5,CR-B-R5-M2,James Louis,Charlette Sequera,4th Floor,Board 2,7,2,Player rest: 2 min
08:45,08:52,Carrom,Group C Round 1,CR-C-R1-M1,Emmanuel Menezes,Florine Fernandes,4th Floor,Board 3,7,2,Player rest: 2 min
08:45,08:52,Carrom,Group C Round 1,CR-C-R1-M2,Dean D'souza,Joseph Rodrigues,4th Floor,Board 4,7,2,Player rest: 2 min
08:45,08:52,Carrom,Group C Round 1,CR-C-R1-M3,Patrick Menezes,Daniel Danthi,4th Floor,Board 5,7,2,Player rest: 2 min
08:52,09:02,Chess,Group Round 5,CH-R5-M1,Mario Chettiar,Frank Mathias,4th Floor,Board 1,10,3,Player rest: 2 min
08:52,09:02,Chess,Group Round 5,CH-R5-M2,Shibu Jacob,Don Danthi,4th Floor,Board 2,10,3,Player rest: 2 min
08:52,09:02,Chess,Group Round 5,CH-R5-M3,Joel Britto,Christine,4th Floor,Board 3,10,3,Player rest: 2 min
08:53,09:00,Table Tennis,Group B Round 1,TT-B-R1-M2,Vincent Chettiar,Anthony Aranha,Ground Floor,Table 1,7,1,Player rest: 1 min
08:54,09:01,Carrom,Group B Round 3,CR-B-R3-M2,Gerald Rodrigues,James Louis,4th Floor,Board 1,7,2,Player rest: 2 min
08:54,09:01,Carrom,Group C Round 2,CR-C-R2-M1,Emmanuel Menezes,Joseph Rodrigues,4th Floor,Board 2,7,2,Player rest: 2 min
08:54,09:01,Carrom,Group C Round 2,CR-C-R2-M2,Florine Fernandes,Daniel Danthi,4th Floor,Board 3,7,2,Player rest: 2 min
08:54,09:01,Carrom,Group C Round 2,CR-C-R2-M3,Dean D'souza,Patrick Menezes,4th Floor,Board 4,7,2,Player rest: 2 min
09:01,09:08,Table Tennis,Group B Round 2,TT-B-R2-M1,Malcolm Corria,Anthony Aranha,Ground Floor,Table 1,7,1,Player rest: 1 min
09:03,09:10,Carrom,Group B Round 4,CR-B-R4-M3,Gerald Rodrigues,Charlette Sequera,4th Floor,Board 1,7,2,Player rest: 2 min
09:03,09:10,Carrom,Group C Round 3,CR-C-R3-M1,Emmanuel Menezes,Daniel Danthi,4th Floor,Board 2,7,2,Player rest: 2 min
09:03,09:10,Carrom,Group C Round 3,CR-C-R3-M2,Joseph Rodrigues,Patrick Menezes,4th Floor,Board 3,7,2,Player rest: 2 min
09:03,09:10,Carrom,Group C Round 3,CR-C-R3-M3,Florine Fernandes,Dean D'souza,4th Floor,Board 4,7,2,Player rest: 2 min
09:05,09:15,Chess,Final,CH-Final,Winner Group Stage 1,Winner Group Stage 2,4th Floor,Board 1,10,3,Player rest: 2 min
09:09,09:16,Table Tennis,Group A Round 3,TT-A-R3-M1,Fr. Kenneth Pinto,Sunborn Perrira,Ground Floor,Table 1,7,1,Player rest: 1 min
09:12,09:19,Carrom,Group B Round 5,CR-B-R5-M3,Rosslin Louis,Gerald Rodrigues,4th Floor,Board 1,7,2,Player rest: 2 min
09:12,09:19,Carrom,Group C Round 4,CR-C-R4-M1,Emmanuel Menezes,Patrick Menezes,4th Floor,Board 2,7,2,Player rest: 2 min
09:12,09:19,Carrom,Group C Round 4,CR-C-R4-M2,Daniel Danthi,Dean D'souza,4th Floor,Board 3,7,2,Player rest: 2 min
09:12,09:19,Carrom,Group C Round 4,CR-C-R4-M3,Joseph Rodrigues,Florine Fernandes,4th Floor,Board 4,7,2,Player rest: 2 min
09:17,09:24,Table Tennis,Group A Round 1,TT-A-R1-M2,Sunborn Perrira,James Louis,Ground Floor,Table 1,7,1,Player rest: 1 min
09:21,09:28,Carrom,Group C Round 5,CR-C-R5-M1,Emmanuel Menezes,Dean D'souza,4th Floor,Board 1,7,2,Player rest: 2 min
09:21,09:28,Carrom,Group C Round 5,CR-C-R5-M2,Patrick Menezes,Florine Fernandes,4th Floor,Board 2,7,2,Player rest: 2 min
09:21,09:28,Carrom,Group C Round 5,CR-C-R5-M3,Daniel Danthi,Joseph Rodrigues,4th Floor,Board 3,7,2,Player rest: 2 min
09:25,09:32,Table Tennis,Group B Round 3,TT-B-R3-M2,Anthony Aranha,Nigel Moriera,Ground Floor,Table 1,7,1,Player rest: 1 min
09:30,09:37,Carrom,Preliminary,CR-Prelim1,3rd Group Winner,Runner-up Group A,4th Floor,Board 1,7,2,Player rest: 2 min
09:30,09:37,Carrom,Preliminary,CR-Prelim2,Runner-up Group B,Runner-up Group C,4th Floor,Board 2,7,2,Player rest: 2 min
09:33,09:40,Table Tennis,Group A Round 2,TT-A-R2-M2,Gerald Rodrigues,Sunborn Perrira,Ground Floor,Table 1,7,1,Player rest: 1 min
09:39,09:46,Carrom,Semifinal,CR-Semi1,Top Group Winner,Winner Preliminary 1,4th Floor,Board 1,7,2,Player rest: 2 min
09:39,09:46,Carrom,Semifinal,CR-Semi2,2nd Group Winner,Winner Preliminary 2,4th Floor,Board 2,7,2,Player rest: 2 min
09:41,09:48,Table Tennis,Group A Round 3,TT-A-R3-M2,James Louis,Gerald Rodrigues,Ground Floor,Table 1,7,1,Player rest: 1 min
09:48,09:55,Carrom,Final,CR-Final,Winner Semi 1,Winner Semi 2,4th Floor,Board 1,7,2,Player rest: 2 min
09:49,09:56,Table Tennis,Semifinal,TT-Semi1,Winner Group A,Runner-up Group B,Ground Floor,Table 1,7,1,Player rest: 1 min
09:57,10:04,Table Tennis,Semifinal,TT-Semi2,Winner Group B,Runner-up Group A,Ground Floor,Table 1,7,1,Player rest: 1 min
10:05,10:12,Table Tennis,Final,TT-Final,Winner Semi 1,Winner Semi 2,Ground Floor,Table 1,7,1,Player rest: 1 min`;

// Roster map
const rosters = {
  Carrom: {
    "Group A": [
      "Lawrence Rodrigues",
      "Colet Coelho",
      "Amal lancelot",
      "Nelson Fernandes",
      "Anthony Aranha",
      "Alphonso Menezes"
    ],
    "Group B": [
      "Jim D'souza",
      "Sunborn Perrira",
      "James Louis",
      "Rosslin Louis",
      "Gerald Rodrigues",
      "Charlette Sequera"
    ],
    "Group C": [
      "Emmanuel Menezes",
      "Dean D'souza",
      "Patrick Menezes",
      "Daniel Danthi",
      "Joseph Rodrigues",
      "Florine Fernandes"
    ]
  },
  Chess: {
    "Round-robin (all 6)": [
      "Mario Chettiar",
      "Frank Mathias",
      "Shibu Jacob",
      "Joel Britto",
      "Christine",
      "Don Danthi"
    ]
  },
  "Table Tennis": {
    "Group A": [
      "Fr. Kenneth Pinto",
      "Sunborn Perrira",
      "James Louis",
      "Gerald Rodrigues"
    ],
    "Group B": [
      "Malcolm Corria",
      "Vincent Chettiar",
      "Anthony Aranha",
      "Nigel Moriera"
    ]
  }
};

// Player ID slug helper
function makePlayerId(name) {
  return "p-" + name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
}

// Player avatars
const avatars = ["👤", "🎯", "🏅", "⚡", "🌟", "🛡️", "🔥", "🚀"];
function getAvatar(idx) {
  return avatars[idx % avatars.length];
}

// 1. Build Participant Objects
const tournamentsConfig = [
  {
    id: "dmc-carrom-2026",
    title: "Divine Mercy Parish Carrom Tournament 2026",
    sport: "Carrom",
    sportIcon: "🎯",
    scoreUnit: "Points",
    format: "GROUP_KNOCKOUT",
    status: "UPCOMING",
    participantType: "INDIVIDUAL",
    startDate: "2026-11-07",
    endDate: "2026-11-07",
    location: "Parish Hall - 4th Floor (Boards 1-5)",
    organizer: "Divine Mercy Church",
    description: "Official Parish Carrom Championship 2026. 3 Groups with 18 players competing across 5 boards, followed by preliminaries, semifinals and grand final.",
    bannerUrl: "https://images.unsplash.com/photo-1611195974226-a6a9be9dd763?auto=format&fit=crop&w=1200&q=80",
    pointsConfig: { win: 2, draw: 1, loss: 0, showForm: true },
    rules: [
      { id: "cr-1", title: "Match Duration", category: "Rules", content: "Each game is 7 minutes of active play. Standard carrom scoring applies." },
      { id: "cr-2", title: "Playoff Qualification", category: "Format", content: "Top 3 Group Winners advance directly or through preliminaries into semifinals." },
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
    sportIcon: "♟️",
    scoreUnit: "Points",
    format: "ROUND_ROBIN",
    status: "UPCOMING",
    participantType: "INDIVIDUAL",
    startDate: "2026-11-07",
    endDate: "2026-11-07",
    location: "Parish Hall - 4th Floor (Boards 1-3)",
    organizer: "Divine Mercy Church",
    description: "Official Parish Chess Championship 2026. 6 players in a 5-round round-robin battle followed by the Grand Championship Final.",
    bannerUrl: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=1200&q=80",
    pointsConfig: { win: 2, draw: 1, loss: 0, showForm: true },
    rules: [
      { id: "ch-1", title: "Game Time", category: "Rules", content: "10 minutes rapid play per game with 3 minutes equipment reset." },
      { id: "ch-2", title: "Final Match", category: "Format", content: "Top 2 players from the round-robin standings contest the Championship Final." },
      { id: "ch-3", title: "Fair Play", category: "Conduct", content: "Respectful silence during play and shake hands before/after every match." }
    ],
    groups: []
  },
  {
    id: "dmc-table-tennis-2026",
    title: "Divine Mercy Parish Table Tennis Tournament 2026",
    sport: "Table Tennis",
    sportIcon: "🏓",
    scoreUnit: "Sets",
    format: "GROUP_KNOCKOUT",
    status: "UPCOMING",
    participantType: "INDIVIDUAL",
    startDate: "2026-11-07",
    endDate: "2026-11-07",
    location: "Parish Ground Floor (Table 1)",
    organizer: "Divine Mercy Church",
    description: "Official Parish Table Tennis Championship 2026. 8 players across Group A & Group B, leading to crossover semifinals and grand final.",
    bannerUrl: "https://images.unsplash.com/photo-1534158914592-062992fbe900?auto=format&fit=crop&w=1200&q=80",
    pointsConfig: { win: 2, draw: 0, loss: 0, showForm: true },
    rules: [
      { id: "tt-1", title: "Match Format", category: "Rules", content: "7 minutes match duration. Best of sets rule applies." },
      { id: "tt-2", title: "Semifinals & Final", category: "Format", content: "Winner Group A vs Runner-up Group B, and Winner Group B vs Runner-up Group A." },
      { id: "tt-3", title: "Fellowship", category: "Conduct", content: "Good sportsmanship, cheer for all parish players." }
    ],
    groups: [
      { id: "grp-a", name: "Group A", teams: [] },
      { id: "grp-b", name: "Group B", teams: [] }
    ]
  }
];

// Populate players and teams
let globalPlayerIndex = 0;
tournamentsConfig.forEach((cfg) => {
  const sportRosters = rosters[cfg.sport] || {};
  const allTeams = [];

  Object.entries(sportRosters).forEach(([groupName, playerNames]) => {
    playerNames.forEach((name, idx) => {
      globalPlayerIndex++;
      const pId = makePlayerId(name);
      const teamObj = {
        id: pId,
        name: name,
        shortName: name.split(" ")[0].substring(0, 4).toUpperCase(),
        seed: idx + 1,
        logo: getAvatar(globalPlayerIndex),
        group: groupName.startsWith("Group") ? groupName : "Group A",
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

// 2. Parse matches from CSV lines
const lines = csvRaw.trim().split("\n");
const matchesBySport = {
  Carrom: [],
  Chess: [],
  "Table Tennis": []
};

// Global all matches list for the match finder
const allScheduleMatches = [];

lines.forEach((line, lineIdx) => {
  if (!line.trim()) return;
  const parts = line.split(",");
  if (parts.length < 9) return;

  const [
    startTime,
    endTime,
    sport,
    stageRound,
    matchId,
    player1Name,
    player2Name,
    venue,
    boardTable,
    duration,
    resetTime,
    restNote
  ] = parts;

  // Determine if it's playoff or group
  const isPlayoff =
    stageRound.includes("Preliminary") ||
    stageRound.includes("Semifinal") ||
    stageRound.includes("Final");

  let groupId = "ALL";
  if (stageRound.includes("Group A")) groupId = "grp-a";
  else if (stageRound.includes("Group B")) groupId = "grp-b";
  else if (stageRound.includes("Group C")) groupId = "grp-c";
  else if (isPlayoff) groupId = "PLAYOFFS";

  // Check if player names correspond to team IDs
  const targetConfig = tournamentsConfig.find((c) => c.sport === sport);
  const team1 = targetConfig ? targetConfig.teams.find((t) => t.name.toLowerCase() === player1Name.toLowerCase()) : null;
  const team2 = targetConfig ? targetConfig.teams.find((t) => t.name.toLowerCase() === player2Name.toLowerCase()) : null;

  // Round number
  let roundNum = 1;
  const rMatch = stageRound.match(/Round (\d+)/);
  if (rMatch) roundNum = parseInt(rMatch[1], 10);
  else if (stageRound.includes("Preliminary")) roundNum = 1;
  else if (stageRound.includes("Semifinal")) roundNum = 2;
  else if (stageRound.includes("Final")) roundNum = 3;

  const matchObj = {
    id: matchId.trim(),
    round: roundNum,
    roundName: stageRound.trim(),
    stageName: stageRound.trim(),
    groupId,
    groupName: groupId.startsWith("grp-") ? `Group ${groupId.slice(-1).toUpperCase()}` : isPlayoff ? "Knockout Playoffs" : "Group Stage",
    teamAId: team1 ? team1.id : null,
    teamBId: team2 ? team2.id : null,
    placeholderA: team1 ? null : player1Name.trim(),
    placeholderB: team2 ? null : player2Name.trim(),
    scoreA: 0,
    scoreB: 0,
    status: "SCHEDULED",
    winnerId: null,
    scheduledAt: `2026-11-07 ${startTime.trim()}`,
    startTime: startTime.trim(),
    endTime: endTime.trim(),
    venue: venue.trim(),
    court: boardTable.trim(),
    duration: duration ? `${duration.trim()} mins` : "7 mins"
  };

  if (matchesBySport[sport]) {
    matchesBySport[sport].push(matchObj);
  }

  allScheduleMatches.push({
    ...matchObj,
    sport,
    player1Name: player1Name.trim(),
    player2Name: player2Name.trim()
  });
});

// Assign matches to tournament configs
tournamentsConfig.forEach((cfg) => {
  cfg.matches = matchesBySport[cfg.sport] || [];
});

console.log("Tournaments generated:");
tournamentsConfig.forEach((t) => {
  console.log(`- ${t.title}: ${t.teams.length} players, ${t.groups?.length || 0} groups, ${t.matches.length} matches`);
});
console.log(`Total fixtures: ${allScheduleMatches.length}`);

// Write to seedData.js
const seedContent = `/**
 * Official Divine Mercy Parish Sports Tournament Seed Data
 * Schedule Date: 7th November 2026
 * Sports: Carrom (50 matches), Chess (16 matches), Table Tennis (15 matches)
 * Total Fixtures: 81 Matches (All scheduled with exact timings and board allocations)
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
