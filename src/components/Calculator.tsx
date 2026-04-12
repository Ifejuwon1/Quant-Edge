import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { calculatePositionSize, calculateRR } from '@/src/lib/calculator';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Info } from 'lucide-react';
import { useFirebase } from '@/src/lib/FirebaseContext';

export default function Calculator() {
  const { profile } = useFirebase();
  const [capital, setCapital] = useState<number>(profile?.accountCapital || 10000);
  const [riskAmount, setRiskAmount] = useState<number>(200);
  
  useEffect(() => {
    if (profile?.accountCapital) {
      setCapital(profile.accountCapital);
      setRiskAmount(profile.accountCapital * 0.02); // Default 2% risk
    }
  }, [profile]);
  const [entry, setEntry] = useState<number>(0);
  const [stopLoss, setStopLoss] = useState<number>(0);
  const [target, setTarget] = useState<number>(0);
  const [side, setSide] = useState<'long' | 'short'>('long');

  const [results, setResults] = useState<any>(null);
  const [rr, setRR] = useState<number>(0);

  useEffect(() => {
    if (capital && riskAmount && entry && stopLoss) {
      const res = calculatePositionSize(capital, riskAmount, entry, stopLoss);
      setResults(res);
    } else {
      setResults(null);
    }

    if (entry && stopLoss && target) {
      setRR(calculateRR(entry, stopLoss, target));
    } else {
      setRR(0);
    }
  }, [capital, riskAmount, entry, stopLoss, target]);

  const riskPercent = capital > 0 ? (riskAmount / capital) * 100 : 0;

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Calculator</h1>
        <p className="text-muted-foreground text-sm">Position sizing and risk management engine.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="capital" className="text-xs font-bold text-muted-foreground tracking-wider uppercase">Account Capital ($)</Label>
          <Input
            id="capital"
            type="number"
            value={capital}
            onChange={(e) => setCapital(Number(e.target.value))}
            className="bg-secondary border-none h-12 text-lg font-mono"
            placeholder="10,000"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="risk" className="text-xs font-bold text-muted-foreground tracking-wider uppercase">Risk Per Trade ($)</Label>
            <span className="text-xs font-bold text-primary">{riskPercent.toFixed(1)}%</span>
          </div>
          <Input
            id="risk"
            type="number"
            value={riskAmount}
            onChange={(e) => setRiskAmount(Number(e.target.value))}
            className="bg-secondary border-none h-12 text-lg font-mono"
            placeholder="200"
          />
          <div className="flex gap-2 pt-1">
            {[0.5, 1.0, 2.0, 5.0].map((p) => (
              <button
                key={p}
                onClick={() => setRiskAmount(capital * (p / 100))}
                className="flex-1 py-2 text-[10px] font-bold bg-secondary rounded-md hover:bg-muted transition-colors"
              >
                {p}%
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="entry" className="text-xs font-bold text-muted-foreground tracking-wider uppercase">Entry Price ($)</Label>
            <Input
              id="entry"
              type="number"
              value={entry || ''}
              onChange={(e) => setEntry(Number(e.target.value))}
              className="bg-secondary border-none h-12 text-lg font-mono"
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stopLoss" className="text-xs font-bold text-muted-foreground tracking-wider uppercase">Stop Loss ($)</Label>
            <Input
              id="stopLoss"
              type="number"
              value={stopLoss || ''}
              onChange={(e) => setStopLoss(Number(e.target.value))}
              className="bg-secondary border-none h-12 text-lg font-mono"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="target" className="text-xs font-bold text-muted-foreground tracking-wider uppercase">Take Profit ($) (Optional)</Label>
          <Input
            id="target"
            type="number"
            value={target || ''}
            onChange={(e) => setTarget(Number(e.target.value))}
            className="bg-secondary border-none h-12 text-lg font-mono"
            placeholder="0.00"
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => setSide('long')}
            className={cn(
              "flex-1 h-12 font-bold transition-all",
              side === 'long' ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            )}
          >
            LONG (BUY)
          </Button>
          <Button
            onClick={() => setSide('short')}
            className={cn(
              "flex-1 h-12 font-bold transition-all",
              side === 'short' ? "bg-destructive text-destructive-foreground" : "bg-secondary text-muted-foreground"
            )}
          >
            SHORT (SELL)
          </Button>
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-4 pt-4">
        <Card className="bg-primary text-primary-foreground border-none overflow-hidden neon-glow">
          <CardContent className="p-6 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Position Size (Order Value)</p>
            <h2 className="text-4xl font-bold font-mono">
              ${results ? results.positionSize.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
            </h2>
            <div className="flex justify-between items-center pt-2 border-t border-black/10">
              <span className="text-xs font-medium opacity-80">Total Units:</span>
              <span className="text-sm font-bold font-mono">
                {results ? results.totalUnits.toFixed(4) : '0.0000'} UNITS
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-secondary border-none">
            <CardContent className="p-4 space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Required Leverage</p>
              <p className="text-2xl font-bold font-mono">
                {results ? results.leverage.toFixed(2) : '0.00'}x
              </p>
            </CardContent>
          </Card>
          <Card className="bg-secondary border-none">
            <CardContent className="p-4 space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Risk/Reward</p>
              <p className={cn(
                "text-2xl font-bold font-mono",
                rr >= 2 ? "text-primary" : "text-foreground"
              )}>
                1:{rr.toFixed(1)}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-secondary/50 rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Trade Structure</span>
            <span className={cn(
              "ml-auto text-[10px] font-bold px-2 py-0.5 rounded bg-background",
              rr >= 2 ? "text-primary" : "text-muted-foreground"
            )}>
              {rr >= 2 ? 'OPTIMAL' : 'WAITING'}
            </span>
          </div>
          <div className="h-2 bg-background rounded-full overflow-hidden flex">
            <div className="h-full bg-destructive" style={{ width: '30%' }}></div>
            <div className="h-full bg-primary" style={{ width: rr >= 2 ? '70%' : '0%' }}></div>
          </div>
          <div className="flex justify-between mt-2 text-[10px] font-bold text-muted-foreground">
            <span>STOP (-${riskAmount})</span>
            <span>TARGET (+${(riskAmount * rr).toFixed(0)})</span>
          </div>
        </div>
      </div>

      <div className="pt-4 pb-8 text-center">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Current Market Sentiment</p>
        <p className="text-sm font-bold text-primary">BULLISH VOLATILITY</p>
      </div>
    </div>
  );
}
