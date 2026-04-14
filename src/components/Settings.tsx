import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpCircle, LogOut, ChevronRight, Globe, Moon, Sun, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFirebase } from '@/src/lib/FirebaseContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Settings() {
  const { user, logout, profile, updateProfile } = useFirebase();

  const handleCurrencyChange = (value: string) => {
    updateProfile({ currency: value });
  };

  const toggleTheme = () => {
    const nextTheme = profile?.theme === 'light' ? 'dark' : 'light';
    updateProfile({ theme: nextTheme });
  };

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500 pb-24">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-secondary border border-border overflow-hidden">
            <img 
              src={user?.photoURL || "https://picsum.photos/seed/trader/200/200"} 
              alt="Profile" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-lg border-2 border-background flex items-center justify-center">
            <Plus className="w-3 h-3 text-primary-foreground" />
          </div>
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">{user?.displayName || 'Trader'}</h2>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[8px] font-bold px-2 py-0.5 bg-primary/20 text-primary rounded-full uppercase tracking-widest">Pro Tier Member</span>
          </div>
        </div>
      </div>

      <Button variant="secondary" className="w-full h-12 font-bold bg-secondary hover:bg-secondary/80">
        Edit Profile
      </Button>

      <div className="space-y-8">
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">ACCOUNT SETTINGS</h3>
          <Card className="bg-secondary/20 border-none overflow-hidden">
            <CardContent className="p-0">
              {/* Currency Dropdown */}
              <div className="flex justify-between items-center p-4 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Default Currency</span>
                </div>
                <Select value={profile?.currency || 'USD'} onValueChange={handleCurrencyChange}>
                  <SelectTrigger className="h-8 bg-transparent border-none hover:bg-secondary/30 transition-colors font-bold text-xs">
                    <SelectValue placeholder="Select Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="NGN">NGN</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Theme Toggle */}
              <div 
                onClick={toggleTheme}
                className="flex justify-between items-center p-4 cursor-pointer hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {profile?.theme === 'light' ? <Sun className="w-4 h-4 text-muted-foreground" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
                  <span className="text-sm font-medium">Theme</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {profile?.theme === 'light' ? 'Light Mode' : 'Dark Mode'}
                  </span>
                  <div className={cn(
                    "w-10 h-5 rounded-full relative transition-colors",
                    profile?.theme !== 'light' ? "bg-primary" : "bg-muted"
                  )}>
                    <div className={cn(
                      "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                      profile?.theme !== 'light' ? "right-1" : "left-1"
                    )} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="space-y-3">
        <Button 
          variant="ghost" 
          className="w-full justify-between h-12 text-muted-foreground hover:text-foreground"
          onClick={() => window.open('https://x.com/ij__trades', '_blank')}
        >
          <div className="flex items-center gap-3">
            <HelpCircle className="w-4 h-4" />
            <span>Help Center</span>
          </div>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <Button 
        onClick={logout}
        variant="destructive" 
        className="w-full h-14 font-bold gap-3 rounded-2xl bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20"
      >
        <LogOut className="w-5 h-5" />
        LOG OUT
      </Button>
    </div>
  );
}
