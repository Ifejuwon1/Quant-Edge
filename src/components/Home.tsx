import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Plus, BookOpen, Calculator as CalcIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFirebase } from '@/src/lib/FirebaseContext';

interface HomeProps {
  onAction: (action: string) => void;
}

export default function Home({ onAction }: HomeProps) {
  const { user, profile, trades } = useFirebase();

  const winRate = trades.length > 0 
    ? (trades.filter(t => t.result === 'tp').length / trades.length) * 100 
    : 0;

  const stats = [
    { label: 'Total Trades', value: trades.length.toString(), trend: 'neutral', color: 'text-foreground' },
    { label: 'Open Risk', value: '$0.00', trend: 'neutral', color: 'text-foreground' },
    { label: 'Margin Use', value: '0%', trend: 'neutral', color: 'text-foreground' },
    { label: 'Win Ratio', value: `${winRate.toFixed(1)}%`, trend: winRate >= 50 ? 'up' : 'down', color: winRate >= 50 ? 'text-primary' : 'text-destructive' },
  ];

  const marketWatch = [
    { pair: 'BTC/USD', price: '$64,231.50', change: '+2.4%', color: 'text-primary' },
    { pair: 'ETH/USD', price: '$3,412.12', change: '-1.2%', color: 'text-destructive' },
    { pair: 'SPX/USD', price: '$5,123.90', change: '+0.8%', color: 'text-primary' },
  ];

  const latestNote = trades.length > 0 && trades[0].notes 
    ? `"${trades[0].notes.substring(0, 100)}${trades[0].notes.length > 100 ? '...' : ''}"`
    : '"Your first trade note will appear here."';

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <div className="space-y-2">
        <p className="text-[10px] font-bold text-primary tracking-[0.2em] uppercase">System Ready</p>
        <h1 className="text-4xl font-bold tracking-tight">Welcome back, {user?.displayName?.split(' ')[0] || 'Trader'}</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {trades.length > 0 
            ? `You have logged ${trades.length} trades. Your current win rate is ${winRate.toFixed(1)}%.`
            : "Market volatility is up today. Start by calculating your first position size."}
        </p>
      </div>

      {/* Main Equity Card */}
      <Card className="bg-card border-none overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
          <TrendingUp className="w-24 h-24" />
        </div>
        <CardContent className="p-8 space-y-6">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">Total Equity Value</p>
            <h2 className="text-5xl font-bold font-mono tracking-tighter text-primary">
              ${profile?.accountCapital?.toLocaleString() || '0.00'}
            </h2>
          </div>
          
          <div className="grid grid-cols-2 gap-y-6 gap-x-4 pt-4">
            {stats.map((stat) => (
              <div key={stat.label} className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">{stat.label}</p>
                <p className={cn("text-lg font-bold font-mono", stat.color)}>{stat.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Performance Chart Placeholder */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <h3 className="text-sm font-bold tracking-widest uppercase">Recent Performance</h3>
          <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">Last 7 Days</span>
        </div>
        <div className="h-32 flex items-end gap-2 px-2">
          {[40, 60, 55, 30, 80, 45, 65].map((h, i) => (
            <div 
              key={i} 
              className={cn(
                "flex-1 rounded-t-sm transition-all duration-500",
                i === 4 ? "bg-primary" : "bg-muted hover:bg-muted/80"
              )} 
              style={{ height: `${h}%` }}
            ></div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold tracking-widest uppercase">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-3">
          <Button 
            onClick={() => onAction('calculator')}
            className="h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg gap-3 rounded-2xl shadow-lg shadow-primary/10"
          >
            <CalcIcon className="w-5 h-5" />
            New Calculation
          </Button>
          <Button 
            onClick={() => onAction('journal')}
            variant="secondary" 
            className="h-14 font-bold text-lg gap-3 rounded-2xl bg-secondary hover:bg-secondary/80"
          >
            <Plus className="w-5 h-5" />
            Log Trade
          </Button>
        </div>
      </div>

      {/* Market Watch */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold tracking-widest uppercase">Market Watch</h3>
        <Card className="bg-secondary/30 border-none">
          <CardContent className="p-4 space-y-4">
            {marketWatch.map((item) => (
              <div key={item.pair} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={cn("w-2 h-2 rounded-full", item.change.startsWith('+') ? "bg-primary" : "bg-destructive")} />
                  <span className="font-bold text-sm">{item.pair}</span>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-bold">{item.price}</p>
                  <p className={cn("text-[10px] font-bold", item.color)}>{item.change}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Latest Note */}
      <div className="space-y-4 pb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold tracking-widest uppercase">Latest Note</h3>
        </div>
        <Card className="bg-card border border-border/50 rounded-2xl overflow-hidden">
          <CardContent className="p-6 space-y-4">
            <p className="text-sm italic text-muted-foreground leading-relaxed">
              {latestNote}
            </p>
            <button 
              onClick={() => onAction('journal')}
              className="text-[10px] font-bold text-primary tracking-widest uppercase hover:underline"
            >
              Read Journal
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
