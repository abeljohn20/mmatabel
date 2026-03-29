/* eslint-disable @typescript-eslint/no-explicit-any */

export interface MatchContext {
  player_id: string;
  opponent_id: string;
  result: string;
  score: string;
  games_played: number;
  archetype: string;
  total_rallies: number;
  player_avg_effectiveness: number;
  player_total_shots: number;
}

export interface ShotEvidence {
  frame: number;
  rally_id: string;
  effectiveness: number;
  outcome: string;
}

export interface PressureData {
  crucial_eff: number;
  normal_eff: number;
  delta: number;
  n_crucial: number;
}

export interface Shot {
  stroke: string;
  category?: string;
  kb_rating?: string;
  classification: string;
  volume?: { n: number; pct_of_total: number };
  n?: number;
  effectiveness?: {
    avg: number;
    std_dev?: number;
    distribution?: Record<string, number>;
  };
  avg_eff?: number;
  win_rate?: number;
  winners?: number;
  unforced_errors?: number;
  pressure?: PressureData | null;
  evidence?: ShotEvidence[];
  synthesized_insight?: string;
  elite_pct?: number;
  good_pct?: number;
  weak_pct?: number;
  direction?: any;
  dual_nature_detail?: any;
  rally_phase_usage?: any;
}

export interface ShotCategory {
  category_avg_eff: number;
  category_n: number;
  shots: Shot[];
}

export interface ZoneShot {
  count: number;
  pct: number;
  direction?: string;
  landings?: Record<string, { count: number; avg_eff: number; eff_distribution?: Record<string, number> }>;
  avg_eff: number;
  n?: number;
}

export interface Zone {
  total_shots: number;
  zone_name?: string;
  shot_distribution: Record<string, ZoneShot>;
}

export interface ZoneDistribution {
  zones: Record<string, Zone>;
  total_zones?: number;
  total_shots_with_zones?: number;
  data_gates?: Record<string, boolean>;
  shot_choice_issues?: any[];
}

export interface ShotArsenal {
  player_id: string;
  total_non_serve_shots: number;
  avg_effectiveness: number;
  categories: Record<string, ShotCategory>;
  weapons: string[];
  liabilities: string[];
  dual_nature: string[];
  concerns: string[];
  hidden_weapons: string[];
  zone_distribution?: ZoneDistribution;
  opponent?: ShotArsenal & { zone_distribution?: ZoneDistribution };
}

export interface ServeType {
  serve_type: string;
  n: number;
  pct: number;
  win_rate: number;
}

export interface ServeAnalysis {
  total_serves: number;
  by_type: ServeType[];
  by_court_side?: any[];
  predictability?: { dominant_type: string; pct: number; alert: boolean };
  evolution?: any;
}

export interface OpeningPhase {
  player_id: string;
  serve_analysis: ServeAnalysis;
  receive_analysis: any;
  opening_patterns?: any;
  opponent?: any;
  opening_analysis?: any;
}

export interface TurningPoint {
  game_number?: number;
  start_rally?: number;
  end_rally?: number;
  length?: number;
  score_before?: string;
  score_after?: string;
}

export interface ClutchShot {
  shot: string;
  crucial_eff: number;
  normal_eff: number;
  delta: number;
  n_crucial: number;
}

export interface PressureProfile {
  championship_phase: { avg_eff: number; overall_avg_eff: number; delta: number };
  clutch_shots: ClutchShot[];
  fragile_shots: ClutchShot[];
  score_state?: any;
  noteworthy_findings?: any[];
}

export interface GameEvolution {
  game: number;
  rallies: number;
  win_rate: number;
  player_avg_eff: number;
  opponent_avg_eff?: number;
  category_distribution?: Record<string, number>;
}

export interface HeadToHead {
  by_category: any[];
  winner_error_difference: {
    player_winners: number;
    player_ue: number;
    opponent_winners: number;
    opponent_ue: number;
    delta: number;
  };
  rally_length_advantage: Record<string, { player_win_rate: number; opponent_win_rate?: number }>;
  style_comparison?: any;
}

export interface MatchDynamics {
  turning_points: {
    player_runs: TurningPoint[];
    opponent_runs: TurningPoint[];
    streak_analysis: any;
  };
  pressure_profile: PressureProfile;
  head_to_head: HeadToHead;
  game_evolution: {
    games: GameEvolution[];
    trend: string;
    eff_trend_delta: number;
  };
}

export interface PatternsAndSequences {
  player_id: string;
  rally_length_analysis: any;
  tactical_patterns: any;
  predictability: any;
  tempo_control: any;
  opponent?: any;
  match_phase_analysis?: any;
}

export interface DeepMatchReport {
  shot_arsenal: ShotArsenal;
  opening_phase: OpeningPhase;
  patterns_and_sequences: PatternsAndSequences;
  match_dynamics: MatchDynamics;
}

export interface MatchReport {
  match_id: string;
  player_id: string;
  match_context: MatchContext;
  match_story?: { headline: string; summary: string; key_differential?: string };
  deep_match_report: DeepMatchReport;
  pipeline_metadata?: any;
}

export interface ShotInsight {
  stroke?: string;
  insight: string;
  shot?: string;
  tendency?: string;
  counter?: string;
  vulnerability?: string;
  exploit?: string;
}

export interface NarrativeSection {
  headline?: string;
  arsenal_headline?: string;
  opponent_headline?: string;
  shot_insights?: Record<string, string> | ShotInsight[];
  [key: string]: any;
}

export interface Narrative {
  metadata: any;
  section_narratives: {
    match_story: { headline: string; summary: string; key_differential?: string };
    shot_arsenal_player: NarrativeSection;
    shot_arsenal_opponent: NarrativeSection;
    opening_phase: NarrativeSection;
    patterns_sequences: NarrativeSection;
    pressure_dynamics: NarrativeSection;
    head_to_head: NarrativeSection;
    game_evolution: NarrativeSection;
  };
  editorial?: any;
}

export type TabId = "report" | "arsenal" | "opening" | "patterns" | "decisions" | "dynamics" | "h2h";
