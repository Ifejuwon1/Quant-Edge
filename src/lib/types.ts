export type Timeframe = '5m' | '15m' | '30m' | '1H' | '4H' | '1D' | 'Custom';
export type TradeSide = 'long' | 'short';
export type TradeStatus = 'open' | 'closed';
export type TradeResult = 'tp' | 'sl' | 'breakeven' | 'none';

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
  timeframe: Timeframe;
  entryPrice: number;
  exitPrice?: number;
  side: TradeSide;
  leverage: number;
  status: TradeStatus;
  result: TradeResult;
  riskFollowed: boolean;
  notes: string;
  setupImage?: string;
  resultImage?: string;
  timestamp: string;
}

export interface CalculationResult {
  positionSize: number;
  leverage: number;
  riskReward: string;
  totalUnits: number;
}
