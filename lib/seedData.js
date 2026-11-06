/**
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
