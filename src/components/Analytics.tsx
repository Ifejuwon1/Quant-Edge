import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Target, Zap, Award, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFirebase } from '@/src/lib/FirebaseContext';
import { format, subDays, startOfDay } from 'date-fns';

export default function Analytics() {
  const { trades, profile } = useFirebase();

  // Calculate Win Rate
  const winRate = trades.length > 0 
    ? (trades.filter(t => t.result === 'tp').length / trades.length) * 100 
    : 0;

  // Calculate Discipline Score (based on riskFollowed)
  const disciplineScore = trades.length > 0
    ? (trades.filter(t => t.riskFollowed).length / trades.length) * 10
    : 10;

  // Best/Worst Trades
  const closedTrades = trades.filter(t => t.status === 'closed');
  const bestTrade = closedTrades.find(t => t.result === 'tp'); // Simplified for now
  const worstTrade = closedTrades.find(t => t.result === 'sl');

  // Equity Curve Data (Mocking a curve based on trade results for visualization)
  const equityData = trades.slice().reverse().reduce((acc: any[], trade, i) => {
    const prevEquity = acc.length > 0 ? acc[acc.length - 1].equity : (profile?.accountCapital || 10000);
    let change = 0;
    if (trade.result === 'tp') change = 500; // Mock change
    if (trade.result === 'sl') change = -200; // Mock change
    
    acc.push({
      name: format(new Date(trade.timestamp), 'MMM dd'),
      equity: prevEquity + change
    });
    return acc;
  }, []);

  if (equityData.length === 0) {
    equityData.push({ name: 'Start', equity: profile?.accountCapital || 10000 });
  }

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500 pb-24">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Performance</h1>
        <p className="text-muted-foreground text-sm">Real-time equity monitoring and behavioral tracking.</p>
      </div>

      <div className="flex gap-2 p-1 bg-secondary rounded-xl">
        {['MONTHLY', 'QUARTERLY', 'ALL TIME'].map((tab, i) => (
          <button
            key={tab}
            className={cn(
              "flex-1 py-2 text-[10px] font-bold tracking-widest rounded-lg transition-all",
              i === 0 ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Equity Curve */}
      <Card className="bg-card border-none overflow-hidden">
        <CardContent className="p-6 space-y-6">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Equity Curve</p>
              <h2 className="text-3xl font-bold font-mono text-primary">
                ${equityData[equityData.length - 1].equity.toLocaleString()}
              </h2>
            </div>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equityData}>
                <defs>
                  <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00ff88" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#262626" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#737373', fontWeight: 'bold' }}
                  dy={10}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#141414', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#00ff88' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="equity" 
                  stroke="#00ff88" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorEquity)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-secondary/30 border-none">
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Win Rate %</p>
              <Award className="w-4 h-4 text-primary" />
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold font-mono">{winRate.toFixed(1)}%</p>
              <div className="h-1.5 bg-background rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${winRate}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary/30 border-none">
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Discipline Score</p>
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold font-mono">{disciplineScore.toFixed(1)}<span className="text-sm text-muted-foreground">/10</span></p>
              <p className="text-[8px] font-bold text-muted-foreground italic leading-tight">
                {disciplineScore >= 8 ? '"Excellent risk adherence."' : '"Focus on following your plan."'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Extremes */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          {bestTrade && (
            <Card className="bg-card border border-border/50">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Best Trade</p>
                    <p className="text-xl font-bold font-mono text-primary">{bestTrade.pair}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-widest">{bestTrade.side}</p>
                  <p className="text-[10px] font-bold text-muted-foreground">{bestTrade.leverage}x Leverage</p>
                </div>
              </CardContent>
            </Card>
          )}

          {worstTrade && (
            <Card className="bg-card border border-border/50">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <TrendingDown className="w-6 h-6 text-destructive" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Greatest Loss</p>
                    <p className="text-xl font-bold font-mono text-destructive">{worstTrade.pair}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-widest">{worstTrade.side}</p>
                  <p className="text-[10px] font-bold text-muted-foreground">Full SL Hit</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
