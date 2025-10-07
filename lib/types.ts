export type Game = 'BGMI' | 'Free Fire' | 'Clash Royale';
export type TeamStatus = 'active' | 'disqualified' | 'withdrawn';


export interface TeamRow {
id: string; team_name: string; game: Game; status: TeamStatus;
total_points: number; matches_played: number; wins: number;
}