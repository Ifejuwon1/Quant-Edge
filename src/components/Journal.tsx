import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { TIMEFRAMES } from '@/src/lib/constants';
import { Plus, Search, Filter, Image as ImageIcon, CheckCircle2, XCircle, Clock, Loader2, BookOpen, Trash2, Upload, Calendar, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFirebase } from '@/src/lib/FirebaseContext';
import { db, handleFirestoreError, OperationType } from '@/src/lib/firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { Trade, Timeframe, TradeResult, TradeSide, TradeStatus } from '@/src/lib/types';
import { format } from 'date-fns';

export default function Journal() {
  const [view, setView] = useState<'list' | 'add' | 'edit' | 'preview'>('list');
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const { trades } = useFirebase();

  const handleAdd = () => {
    setSelectedTrade(null);
    setView('add');
  };

  const handleEdit = (trade: Trade) => {
    setSelectedTrade(trade);
    setView('edit');
  };

  const handlePreview = (trade: Trade) => {
    setSelectedTrade(trade);
    setView('preview');
  };

  const handleBack = () => {
    setView('list');
    setSelectedTrade(null);
  };

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-primary tracking-[0.2em] uppercase">Trade Repository</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            {view === 'list' ? 'Trade Journal' : view === 'add' ? 'New Entry' : view === 'edit' ? 'Edit Entry' : 'Trade Preview'}
          </h1>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-2xl">
            {view === 'list' 
              ? 'Review your technical execution and psychological state to find your edge.' 
              : 'Document your setup, confluences, and mental state before execution.'}
          </p>
        </div>
        <Button 
          onClick={view === 'list' ? handleAdd : handleBack}
          variant={view === 'list' ? 'default' : 'secondary'}
          className={cn(
            "h-14 px-8 font-bold rounded-2xl shadow-lg transition-all gap-3",
            view === 'list' ? "bg-primary text-primary-foreground shadow-primary/20" : "bg-secondary text-foreground"
          )}
        >
          {view === 'list' ? (
            <>
              <Plus className="w-5 h-5" />
              Log New Trade
            </>
          ) : (
            <>
              <Clock className="w-5 h-5" />
              Back to Journal
            </>
          )}
        </Button>
      </div>

      <div className="max-w-7xl mx-auto">
        {view === 'list' && <TradeList trades={trades} onPreview={handlePreview} />}
        {(view === 'add' || view === 'edit') && (
          <AddTradeForm 
            onComplete={handleBack} 
            initialData={selectedTrade} 
            isEdit={view === 'edit'} 
          />
        )}
        {view === 'preview' && selectedTrade && (
          <TradePreview trade={selectedTrade} onEdit={() => handleEdit(selectedTrade)} />
        )}
      </div>
    </div>
  );
}

function TradeList({ trades, onPreview }: { trades: Trade[], onPreview: (t: Trade) => void }) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search pairs, notes, or strategies..." className="h-14 pl-12 bg-secondary/30 border-none rounded-2xl text-lg" />
        </div>
        <Button variant="secondary" className="h-14 px-6 bg-secondary/50 rounded-2xl gap-2 font-bold">
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trades.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-24 space-y-6 bg-secondary/10 rounded-3xl border border-dashed border-border/50">
            <div className="w-20 h-20 bg-secondary/30 rounded-full flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-muted-foreground" />
            </div>
            <div className="space-y-2 text-center">
              <p className="font-bold text-xl">No trades logged yet</p>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">Your trading history will appear here once you log your first entry.</p>
            </div>
          </div>
        ) : (
          trades.map((trade) => (
            <Card 
              key={trade.id} 
              onClick={() => onPreview(trade)}
              className="bg-card border-none hover:ring-2 hover:ring-primary/30 transition-all cursor-pointer group rounded-3xl overflow-hidden shadow-xl shadow-black/10"
            >
              <CardContent className="p-0">
                <div className="p-6 space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold font-mono tracking-tighter">{trade.pair}</span>
                        <span className={cn(
                          "text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest",
                          trade.side === 'long' ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"
                        )}>
                          {trade.side}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground font-bold tracking-widest uppercase">
                        {trade.timeframe} • {format(new Date(trade.tradeDate || trade.timestamp), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner",
                      trade.result === 'tp' ? "bg-primary/10 text-primary" : 
                      trade.result === 'sl' ? "bg-destructive/10 text-destructive" : 
                      trade.result === 'tsl' ? "bg-amber-500/10 text-amber-500" : "bg-muted text-muted-foreground"
                    )}>
                      {trade.result === 'tp' ? <CheckCircle2 className="w-7 h-7" /> : 
                       trade.result === 'sl' ? <XCircle className="w-7 h-7" /> : 
                       trade.result === 'tsl' ? <TrendingDown className="w-7 h-7" /> : <Clock className="w-7 h-7" />}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 py-6 border-y border-border/30">
                    <div className="space-y-1">
                      <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Entry</p>
                      <p className="text-sm font-bold font-mono">${trade.entryPrice.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Exit</p>
                      <p className="text-sm font-bold font-mono">${trade.exitPrice?.toLocaleString() || '---'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Leverage</p>
                      <p className="text-sm font-bold font-mono">{trade.leverage}x</p>
                    </div>
                  </div>

                  {trade.notes && (
                    <div className="space-y-2">
                      <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Psychology & Notes</p>
                      <p className="text-xs text-muted-foreground line-clamp-3 italic leading-relaxed">
                        "{trade.notes}"
                      </p>
                    </div>
                  )}

                  <div className="pt-2 flex justify-between items-center">
                    <div className={cn(
                      "text-xs font-black tracking-widest uppercase",
                      trade.result === 'tp' ? "text-primary" : 
                      trade.result === 'sl' ? "text-destructive" : 
                      trade.result === 'tsl' ? "text-amber-500" : "text-muted-foreground"
                    )}>
                      {trade.result === 'tp' ? 'Profit Realized' : 
                       trade.result === 'sl' ? 'Loss Realized' : 
                       trade.result === 'tsl' ? 'TSL Hit' : 'Active Position'}
                    </div>
                    <span className="text-[10px] font-bold text-primary group-hover:translate-x-1 transition-transform">
                      VIEW FULL ANALYSIS →
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function TradePreview({ trade, onEdit }: { trade: Trade, onEdit: () => void }) {
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h2 className="text-4xl md:text-5xl font-bold font-mono tracking-tighter">{trade.pair}</h2>
            <span className={cn(
              "text-[10px] font-black px-3 py-1 rounded-xl uppercase tracking-widest",
              trade.side === 'long' ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"
            )}>
              {trade.side}
            </span>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground font-bold tracking-widest uppercase">
            {trade.timeframe} • {format(new Date(trade.tradeDate || trade.timestamp), 'MMMM dd, yyyy')}
          </p>
        </div>
        <Button onClick={onEdit} className="w-full sm:w-auto h-12 px-6 font-bold rounded-xl gap-2 shadow-lg">
          <Plus className="w-4 h-4" />
          Edit Trade
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: 'Entry Price', value: `$${trade.entryPrice.toLocaleString()}` },
          { label: 'Exit Price', value: trade.exitPrice ? `$${trade.exitPrice.toLocaleString()}` : '---' },
          { label: 'Leverage', value: `${trade.leverage}x` },
          { label: 'Result', value: trade.result === 'tp' ? 'TP HIT' : trade.result === 'sl' ? 'SL HIT' : trade.result === 'tsl' ? 'TSL HIT' : 'OPEN' },
        ].map((stat) => (
          <Card key={stat.label} className="bg-secondary/20 border-none rounded-2xl md:rounded-3xl">
            <CardContent className="p-4 md:p-6 space-y-1">
              <p className="text-[8px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
              <p className="text-lg md:text-2xl font-bold font-mono">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {trade.images && trade.images.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-primary">Screenshots</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {trade.images.map((img, idx) => (
              <div key={idx} className="aspect-video rounded-3xl overflow-hidden bg-secondary/30 border border-border/50 group relative">
                <img src={img} alt={`Analysis ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button variant="secondary" className="font-bold" onClick={() => window.open(img, '_blank')}>
                    View Full Size
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-primary">Analysis & Notes</h3>
        <Card className="bg-secondary/10 border-none rounded-3xl">
          <CardContent className="p-8">
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap italic">
              {trade.notes || "No notes provided for this trade."}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4 p-6 bg-secondary/20 rounded-3xl border border-border/50">
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center",
          trade.riskFollowed ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"
        )}>
          {trade.riskFollowed ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
        </div>
        <div>
          <p className="text-sm font-bold">Risk Management</p>
          <p className="text-xs text-muted-foreground">
            {trade.riskFollowed ? "Strict risk parameters were followed for this execution." : "Risk parameters were deviated from during this execution."}
          </p>
        </div>
      </div>
    </div>
  );
}

function AddTradeForm({ onComplete, initialData, isEdit }: { onComplete: () => void, initialData?: Trade | null, isEdit?: boolean }) {
  const { user } = useFirebase();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [customTimeframe, setCustomTimeframe] = useState(
    initialData && !TIMEFRAMES.includes(initialData.timeframe as any) ? initialData.timeframe : ''
  );
  
  const [formData, setFormData] = useState({
    pair: initialData?.pair || '',
    timeframe: (initialData && TIMEFRAMES.includes(initialData.timeframe as any) ? initialData.timeframe : (initialData ? 'Custom' : '1H')) as Timeframe,
    leverage: initialData?.leverage ?? 10 as number | '',
    entryPrice: initialData?.entryPrice ?? 0 as number | '',
    exitPrice: initialData?.exitPrice ?? 0 as number | '',
    side: initialData?.side || 'long' as TradeSide,
    notes: initialData?.notes || '',
    riskFollowed: initialData?.riskFollowed ?? true,
    result: initialData?.result || 'tp' as TradeResult,
    tradeDate: initialData?.tradeDate || format(new Date(), 'yyyy-MM-dd')
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (images.length + files.length > 2) {
      alert("Maximum 2 screenshots allowed.");
      return;
    }

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!formData.pair || !formData.entryPrice) {
      alert("Please fill in the pair and entry price.");
      return;
    }

    setLoading(true);
    try {
      const finalTimeframe = formData.timeframe === 'Custom' ? customTimeframe : formData.timeframe;
      
      const tradeData: Omit<Trade, 'id'> = {
        userId: user.uid,
        pair: formData.pair,
        timeframe: finalTimeframe || '1H',
        leverage: Number(formData.leverage) || 0,
        entryPrice: Number(formData.entryPrice),
        exitPrice: formData.exitPrice ? Number(formData.exitPrice) : undefined,
        side: formData.side,
        status: formData.result === 'none' ? 'open' : 'closed',
        result: formData.result,
        riskFollowed: formData.riskFollowed,
        notes: formData.notes,
        images: images,
        timestamp: new Date().toISOString(),
        tradeDate: formData.tradeDate
      };

      const path = `users/${user.uid}/trades`;
      if (isEdit && initialData) {
        await updateDoc(doc(db, path, initialData.id), tradeData as any);
      } else {
        await addDoc(collection(db, path), tradeData);
      }
      onComplete();
    } catch (error) {
      handleFirestoreError(error, isEdit ? OperationType.UPDATE : OperationType.CREATE, `users/${user.uid}/trades`);
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Trading Pair</Label>
              <Input 
                placeholder="BTC/USDT" 
                className="bg-secondary border-none h-12" 
                value={formData.pair}
                onChange={(e) => setFormData({ ...formData, pair: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Trade Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input 
                  type="date"
                  className="bg-secondary border-none h-12 pl-10" 
                  value={formData.tradeDate}
                  onChange={(e) => setFormData({ ...formData, tradeDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              {formData.timeframe === 'Custom' && (
                <Input 
                  placeholder="Enter custom timeframe (e.g. 2H)" 
                  className="bg-secondary border-none h-10 mt-2 text-xs" 
                  value={customTimeframe}
                  onChange={(e) => setCustomTimeframe(e.target.value)}
                />
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Leverage</Label>
              <Input 
                type="number" 
                placeholder="0" 
                className="bg-secondary border-none h-12" 
                value={formData.leverage}
                onChange={(e) => setFormData({ ...formData, leverage: e.target.value === '' ? '' : Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Entry Price</Label>
              <Input 
                type="number" 
                placeholder="0.00" 
                className="bg-secondary border-none h-12" 
                value={formData.entryPrice}
                onChange={(e) => setFormData({ ...formData, entryPrice: e.target.value === '' ? '' : Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Exit Price (Optional)</Label>
              <Input 
                type="number" 
                placeholder="0.00" 
                className="bg-secondary border-none h-12" 
                value={formData.exitPrice}
                onChange={(e) => setFormData({ ...formData, exitPrice: e.target.value === '' ? '' : Number(e.target.value) })}
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
                { id: 'tp', label: 'TP HIT' },
                { id: 'tsl', label: 'TSL HIT' },
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
          <h3 className="text-xs font-bold uppercase tracking-widest">Analysis & Screenshots</h3>
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

          <div className="space-y-4">
            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Screenshots (Max 2)</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-video rounded-xl overflow-hidden bg-secondary group">
                  <img src={img} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                  <button 
                    onClick={() => removeImage(idx)}
                    className="absolute top-2 right-2 p-2 bg-destructive text-destructive-foreground rounded-lg opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {images.length < 2 && (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-video rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 hover:bg-secondary/50 transition-colors py-8"
                >
                  <Upload className="w-6 h-6 text-muted-foreground" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Upload Screenshot</span>
                </button>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              multiple 
              onChange={handleImageUpload} 
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
        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (isEdit ? 'UPDATE TRADE ENTRY' : 'LOG TRADE ENTRY')}
      </Button>
    </div>
  );
}
