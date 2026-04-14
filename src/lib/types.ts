export type Timeframe = '5m' | '15m' | '30m' | '1H' | '4H' | '1D' | 'Custom';
export type TradeSide = 'long' | 'short';
export type TradeStatus = 'open' | 'closed';
export type TradeResult = 'tp' | 'sl' | 'tsl' | 'breakeven' | 'none';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  accountCapital: number;
  currency: string;
  theme?: 'dark' | 'light';
}

export interface Trade {
  id: string;
  userId: string;
  pair: string;
  timeframe: string; // Changed from Timeframe to string to support custom
  entryPrice: number;
  exitPrice?: number;
  side: TradeSide;
  leverage: number;
  status: TradeStatus;
  result: TradeResult;
  riskFollowed: boolean;
  notes: string;
  images?: string[]; // Support up to 2 images
  setupImage?: string;
  resultImage?: string;
  timestamp: string;
  tradeDate: string; // New field for the date the trade was taken
}

export interface CalculationResult {
  positionSize: number;
  leverage: number;
  riskReward: string;
  totalUnits: number;
}
