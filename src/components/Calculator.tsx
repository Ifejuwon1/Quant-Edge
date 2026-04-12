import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { calculatePositionSize, calculateRR } from '@/src/lib/calculator';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Info, Plus, Calculator as CalcIcon, Zap, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
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
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      <div className="space-y-2">
        <p className="text-[10px] font-bold text-primary tracking-[0.2em] uppercase">Precision Tool</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Risk Calculator</h1>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-2xl">
          Determine your precise position size and required leverage based on your current account equity.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Input Form */}
        <Card className="bg-card border-none shadow-xl shadow-black/20 rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-secondary/10 p-6 md:p-8">
            <CardTitle className="text-sm font-bold tracking-widest uppercase flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" />
              Position Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8 space-y-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="capital" className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">Account Capital ($)</Label>
                <Input
                  id="capital"
                  type="number"
                  value={capital}
                  onChange={(e) => setCapital(Number(e.target.value))}
                  className="bg-secondary/30 border-none h-14 text-xl font-mono font-bold focus-visible:ring-primary rounded-xl"
                  placeholder="10,000"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="risk" className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">Risk Per Trade ($)</Label>
                  <span className="text-xs font-bold text-primary">{riskPercent.toFixed(1)}%</span>
                </div>
                <Input
                  id="risk"
                  type="number"
                  value={riskAmount}
                  onChange={(e) => setRiskAmount(Number(e.target.value))}
                  className="bg-secondary/30 border-none h-14 text-xl font-mono font-bold focus-visible:ring-primary rounded-xl"
                  placeholder="200"
                />
                <div className="flex gap-2 pt-1">
                  {[0.5, 1.0, 2.0, 5.0].map((p) => (
                    <button
                      key={p}
                      onClick={() => setRiskAmount(capital * (p / 100))}
                      className="flex-1 py-3 text-[10px] font-bold bg-secondary rounded-xl hover:bg-muted transition-colors"
                    >
                      {p}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="entry" className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">Entry Price ($)</Label>
                  <Input
                    id="entry"
                    type="number"
                    value={entry || ''}
                    onChange={(e) => setEntry(Number(e.target.value))}
                    className="bg-secondary/30 border-none h-14 text-xl font-mono font-bold focus-visible:ring-primary rounded-xl"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stopLoss" className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">Stop Loss ($)</Label>
                  <Input
                    id="stopLoss"
                    type="number"
                    value={stopLoss || ''}
                    onChange={(e) => setStopLoss(Number(e.target.value))}
                    className="bg-secondary/30 border-none h-14 text-xl font-mono font-bold focus-visible:ring-primary rounded-xl"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target" className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">Take Profit ($) (Optional)</Label>
                <Input
                  id="target"
                  type="number"
                  value={target || ''}
                  onChange={(e) => setTarget(Number(e.target.value))}
                  className="bg-secondary/30 border-none h-14 text-xl font-mono font-bold focus-visible:ring-primary rounded-xl"
                  placeholder="0.00"
                />
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => setSide('long')}
                  className={cn(
                    "flex-1 h-14 font-bold rounded-xl transition-all",
                    side === 'long' ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-secondary text-muted-foreground"
                  )}
                >
                  LONG (BUY)
                </Button>
                <Button
                  onClick={() => setSide('short')}
                  className={cn(
                    "flex-1 h-14 font-bold rounded-xl transition-all",
                    side === 'short' ? "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/20" : "bg-secondary text-muted-foreground"
                  )}
                >
                  SHORT (SELL)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <div className="space-y-6">
          <Card className="bg-primary text-primary-foreground border-none shadow-2xl shadow-primary/20 rounded-3xl overflow-hidden neon-glow">
            <CardContent className="p-8 md:p-10 space-y-6">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Recommended Position Size</p>
                <h2 className="text-5xl md:text-6xl font-bold font-mono tracking-tighter">
                  ${results ? results.positionSize.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                </h2>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-black/10">
                <span className="text-xs font-medium opacity-80 uppercase tracking-widest">Total Units:</span>
                <span className="text-lg font-bold font-mono">
                  {results ? results.totalUnits.toFixed(4) : '0.0000'} UNITS
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-6">
            <Card className="bg-card border-none rounded-3xl shadow-lg">
              <CardContent className="p-6 space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Required Leverage</p>
                <p className="text-3xl font-bold font-mono">
                  {results ? results.leverage.toFixed(2) : '0.00'}x
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card border-none rounded-3xl shadow-lg">
              <CardContent className="p-6 space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Risk/Reward</p>
                <p className={cn(
                  "text-3xl font-bold font-mono",
                  rr >= 2 ? "text-primary" : "text-foreground"
                )}>
                  1:{rr.toFixed(1)}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-secondary/30 rounded-3xl p-8 border border-border/50 space-y-6">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              <span className="text-xs font-bold uppercase tracking-widest">Trade Structure Analysis</span>
              <span className={cn(
                "ml-auto text-[10px] font-bold px-3 py-1 rounded-full bg-background border border-border",
                rr >= 2 ? "text-primary border-primary/20" : "text-muted-foreground"
              )}>
                {rr >= 2 ? 'OPTIMAL SETUP' : 'WAITING FOR EDGE'}
              </span>
            </div>
            
            <div className="space-y-4">
              <div className="h-3 bg-background rounded-full overflow-hidden flex">
                <div className="h-full bg-destructive shadow-[0_0_10px_rgba(239,68,68,0.5)]" style={{ width: '30%' }}></div>
                <div className="h-full bg-primary shadow-[0_0_10px_rgba(34,197,94,0.5)] transition-all duration-1000" style={{ width: rr >= 2 ? '70%' : '0%' }}></div>
              </div>
              <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <span>STOP LOSS (-${riskAmount.toLocaleString()})</span>
                <span>TARGET PROFIT (+${(riskAmount * rr).toLocaleString(undefined, { maximumFractionDigits: 0 })})</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed italic">
              "Execution is the only thing you can control. Stick to the numbers."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
