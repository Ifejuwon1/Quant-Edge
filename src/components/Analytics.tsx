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
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-primary tracking-[0.2em] uppercase">Performance Engine</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-2xl">
            Real-time equity monitoring and behavioral tracking to optimize your edge.
          </p>
        </div>
        <div className="flex gap-2 p-1 bg-secondary/50 rounded-2xl">
          {['MONTHLY', 'QUARTERLY', 'ALL TIME'].map((tab, i) => (
            <button
              key={tab}
              className={cn(
                "px-6 py-3 text-[10px] font-bold tracking-widest rounded-xl transition-all",
                i === 0 ? "bg-background text-primary shadow-lg" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Equity Curve */}
        <Card className="lg:col-span-2 bg-card border-none shadow-xl rounded-3xl overflow-hidden">
          <CardContent className="p-8 md:p-10 space-y-8">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Current Equity Value</p>
                <h2 className="text-5xl md:text-6xl font-bold font-mono text-primary tracking-tighter">
                  ${equityData[equityData.length - 1].equity.toLocaleString()}
                </h2>
              </div>
              <div className="flex items-center gap-2 text-primary bg-primary/10 px-3 py-1 rounded-lg">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-bold font-mono">+12.4%</span>
              </div>
            </div>

            <div className="h-[350px] md:h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={equityData}>
                  <defs>
                    <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00ff88" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#737373', fontWeight: 'bold' }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#737373', fontWeight: 'bold' }}
                    tickFormatter={(v) => `$${v/1000}k`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#141414', border: 'none', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}
                    itemStyle={{ color: '#00ff88' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="equity" 
                    stroke="#00ff88" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorEquity)" 
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics & Extremes */}
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
            <Card className="bg-secondary/20 border-none rounded-3xl shadow-lg">
              <CardContent className="p-8 space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Win Rate %</p>
                  <Award className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-4">
                  <p className="text-5xl font-bold font-mono tracking-tighter">{winRate.toFixed(1)}%</p>
                  <div className="h-2 bg-background rounded-full overflow-hidden">
                    <div className="h-full bg-primary shadow-[0_0_10px_rgba(0,255,136,0.5)] transition-all duration-1000" style={{ width: `${winRate}%` }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-secondary/20 border-none rounded-3xl shadow-lg">
              <CardContent className="p-8 space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Discipline Score</p>
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-2">
                  <p className="text-5xl font-bold font-mono tracking-tighter">{disciplineScore.toFixed(1)}<span className="text-xl text-muted-foreground">/10</span></p>
                  <p className="text-xs font-bold text-muted-foreground italic leading-relaxed">
                    {disciplineScore >= 8 ? '"Excellent risk adherence. Your edge is statistically protected."' : '"Focus on following your plan to prevent drawdown."'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Trade Extremes</h3>
            <div className="space-y-4">
              {bestTrade && (
                <Card className="bg-card border border-border/50 rounded-2xl overflow-hidden group hover:border-primary/50 transition-colors">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <TrendingUp className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Best Performer</p>
                        <p className="text-2xl font-bold font-mono text-primary tracking-tighter">{bestTrade.pair}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase tracking-widest">{bestTrade.side}</p>
                      <p className="text-xs font-bold text-muted-foreground">{bestTrade.leverage}x Leverage</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {worstTrade && (
                <Card className="bg-card border border-border/50 rounded-2xl overflow-hidden group hover:border-destructive/50 transition-colors">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <TrendingDown className="w-6 h-6 text-destructive" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Greatest Drawdown</p>
                        <p className="text-2xl font-bold font-mono text-destructive tracking-tighter">{worstTrade.pair}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase tracking-widest">{worstTrade.side}</p>
                      <p className="text-xs font-bold text-muted-foreground">Full SL Hit</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
