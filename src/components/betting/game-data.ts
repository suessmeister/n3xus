export interface Bet {
  id: string;
  type: BetType;
  options: string[];
  odds: number[];
  expiresAt: number;
  minStake: number;
  maxStake: number;
}

export type BetType =
  | 'Next At Bat'
  | 'Inning Result'
  | 'Next Base Stolen'
  | 'Strikeout This At Bat'
  | 'Next Hit Type'
  | 'Next Pitcher Change';

export interface GameState {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  inning: number;
  isTopInning: boolean;
  outs: number;
  bases: {
    first: boolean;
    second: boolean;
    third: boolean;
  };
  balls: number;
  strikes: number;
  pitcher: string;
  batter: string;
  activeBets: Bet[];
}

// Mock data for development
export const mockGameState: GameState = {
  homeTeam: "New York Yankees",
  awayTeam: "Boston Red Sox",
  homeScore: 3,
  awayScore: 2,
  inning: 7,
  isTopInning: true,
  outs: 1,
  bases: {
    first: true,
    second: false,
    third: true
  },
  balls: 2,
  strikes: 1,
  pitcher: "Gerrit Cole",
  batter: "Rafael Devers",
  activeBets: [
    {
      id: "next-at-bat",
      type: "Next At Bat",
      options: ["Hit", "Strikeout", "Walk", "Ground Out", "Fly Out"],
      odds: [3.5, 2.8, 4.0, 2.2, 2.0],
      expiresAt: Date.now() + 60000,
      minStake: 0.1,
      maxStake: 5
    },
    {
      id: "inning-run",
      type: "Inning Result",
      options: ["Run Scored", "No Run"],
      odds: [2.5, 1.8],
      expiresAt: Date.now() + 300000,
      minStake: 0.1,
      maxStake: 5
    },
    {
      id: "next-hit",
      type: "Next Hit Type",
      options: ["Single", "Double", "Triple", "Home Run"],
      odds: [2.0, 4.0, 8.0, 10.0],
      expiresAt: Date.now() + 45000,
      minStake: 0.1,
      maxStake: 5
    }
  ]
}
