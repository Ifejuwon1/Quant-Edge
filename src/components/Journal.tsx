import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { TIMEFRAMES } from '@/src/lib/constants';
import { Plus, Search, Filter, Image as ImageIcon, CheckCircle2, XCircle, Clock, Loader2, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFirebase } from '@/src/lib/FirebaseContext';
import { db, handleFirestoreError, OperationType } from '@/src/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Trade, Timeframe, TradeResult, TradeSide, TradeStatus } from '@/src/lib/types';
import { format } from 'date-fns';

export default function Journal() {
  const [view, setView] = useState<'list' | 'add'>('list');
  const { trades } = useFirebase();

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {view === 'list' ? 'Journal' : 'New Entry'}
          </h1>
          <p className="text-muted-foreground text-sm">
            {view === 'list' ? 'Review your technical execution.' : 'Log your trade and psychological state.'}
          </p>
        </div>
        <Button 
          onClick={() => setView(view === 'list' ? 'add' : 'list')}
          variant={view === 'list' ? 'default' : 'secondary'}
          size="icon"
          className="rounded-full w-12 h-12 shadow-lg"
        >
          {view === 'list' ? <Plus className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
        </Button>
      </div>

      {view === 'list' ? <TradeList trades={trades} /> : <AddTradeForm onComplete={() => setView('list')} />}
    </div>
  );
}

function TradeList({ trades }: { trades: Trade[] }) {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search pairs..." className="pl-10 bg-secondary border-none" />
        </div>
        <Button variant="secondary" size="icon" className="bg-secondary">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-3">
        {trades.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto">
              <BookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">No trades logged yet.</p>
          </div>
        ) : (
          trades.map((trade) => (
            <Card key={trade.id} className="bg-card border-border/50 hover:border-primary/50 transition-colors cursor-pointer group">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    trade.result === 'tp' ? "bg-primary/10 text-primary" : 
                    trade.result === 'sl' ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
                  )}>
                    {trade.result === 'tp' ? <CheckCircle2 className="w-6 h-6" /> : 
                     trade.result === 'sl' ? <XCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{trade.pair}</h4>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      {trade.side} • {trade.timeframe} • {format(new Date(trade.timestamp), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn(
                    "font-mono font-bold", 
                    trade.result === 'tp' ? "text-primary" : 
                    trade.result === 'sl' ? "text-destructive" : "text-foreground"
                  )}>
                    {trade.result === 'tp' ? 'WIN' : trade.result === 'sl' ? 'LOSS' : 'OPEN'}
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest group-hover:text-primary transition-colors">
                    Details →
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function AddTradeForm({ onComplete }: { onComplete: () => void }) {
  const { user } = useFirebase();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    pair: '',
    timeframe: '1H' as Timeframe,
    leverage: 10,
    entryPrice: 0,
    exitPrice: 0,
    side: 'long' as TradeSide,
    notes: '',
    riskFollowed: true,
    result: 'none' as TradeResult
  });

  const handleSubmit = async () => {
    if (!user) return;
    if (!formData.pair || !formData.entryPrice) {
      alert("Please fill in the pair and entry price.");
      return;
    }

    setLoading(true);
    try {
      const tradeData: Omit<Trade, 'id'> = {
        userId: user.uid,
        pair: formData.pair,
        timeframe: formData.timeframe,
        leverage: formData.leverage,
        entryPrice: formData.entryPrice,
        exitPrice: formData.exitPrice || undefined,
        side: formData.side,
        status: formData.result === 'none' ? 'open' : 'closed',
        result: formData.result,
        riskFollowed: formData.riskFollowed,
        notes: formData.notes,
        timestamp: new Date().toISOString()
      };

      const path = `users/${user.uid}/trades`;
      await addDoc(collection(db, path), tradeData);
      onComplete();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/trades`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-primary">
          <CheckCircle2 className="w-4 h-4" />
          <h3 className="text-xs font-bold uppercase tracking-widest">Trade Setup</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Trading Pair</Label>
            <Input 
              placeholder="BTC/USDT" 
              className="bg-secondary border-none h-12" 
              value={formData.pair}
              onChange={(e) => setFormData({ ...formData, pair: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Timeframe</Label>
              <Select 
                value={formData.timeframe}
                onValueChange={(v: Timeframe) => setFormData({ ...formData, timeframe: v })}
              >
                <SelectTrigger className="bg-secondary border-none h-12">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEFRAMES.map(tf => (
                    <SelectItem key={tf} value={tf}>{tf}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Leverage</Label>
              <Input 
                type="number" 
                placeholder="10x" 
                className="bg-secondary border-none h-12" 
                value={formData.leverage}
                onChange={(e) => setFormData({ ...formData, leverage: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Entry Price</Label>
              <Input 
                type="number" 
                placeholder="0.00" 
                className="bg-secondary border-none h-12" 
                value={formData.entryPrice || ''}
                onChange={(e) => setFormData({ ...formData, entryPrice: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Exit Price (Optional)</Label>
              <Input 
                type="number" 
                placeholder="0.00" 
                className="bg-secondary border-none h-12" 
                value={formData.exitPrice || ''}
                onChange={(e) => setFormData({ ...formData, exitPrice: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Position Side</Label>
            <div className="flex gap-2">
              <Button
                onClick={() => setFormData({ ...formData, side: 'long' })}
                className={cn(
                  "flex-1 h-12 font-bold",
                  formData.side === 'long' ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                )}
              >
                LONG
              </Button>
              <Button
                onClick={() => setFormData({ ...formData, side: 'short' })}
                className={cn(
                  "flex-1 h-12 font-bold",
                  formData.side === 'short' ? "bg-destructive text-destructive-foreground" : "bg-secondary text-muted-foreground"
                )}
              >
                SHORT
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Trade Result</Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'none', label: 'OPEN' },
                { id: 'tp', label: 'TP HIT' },
                { id: 'sl', label: 'SL HIT' },
              ].map((res) => (
                <Button
                  key={res.id}
                  onClick={() => setFormData({ ...formData, result: res.id as TradeResult })}
                  className={cn(
                    "h-10 text-[10px] font-bold",
                    formData.result === res.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                  )}
                >
                  {res.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-2 text-primary">
          <ImageIcon className="w-4 h-4" />
          <h3 className="text-xs font-bold uppercase tracking-widest">Analysis & Notes</h3>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Trade Notes</Label>
            <Textarea 
              placeholder="Describe the confluence, your mental state, and market context..." 
              className="bg-secondary border-none min-h-[120px] resize-none"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-2 text-primary">
          <CheckCircle2 className="w-4 h-4" />
          <h3 className="text-xs font-bold uppercase tracking-widest">Risk Checklist</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-3 bg-secondary/50 p-4 rounded-xl">
            <Checkbox 
              id="riskFollowed" 
              className="border-primary data-[state=checked]:bg-primary" 
              checked={formData.riskFollowed}
              onCheckedChange={(v) => setFormData({ ...formData, riskFollowed: !!v })}
            />
            <label htmlFor="riskFollowed" className="text-sm font-medium leading-none">
              Followed Risk Management?
            </label>
          </div>
        </div>
      </div>

      <Button 
        onClick={handleSubmit}
        disabled={loading}
        className="w-full h-14 bg-primary text-primary-foreground font-bold text-lg rounded-2xl shadow-lg shadow-primary/20"
      >
        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'LOG TRADE ENTRY'}
      </Button>
    </div>
  );
}
