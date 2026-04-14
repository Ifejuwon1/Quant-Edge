import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, HelpCircle, LogOut, ChevronRight, Globe, Moon, Sun, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFirebase } from '@/src/lib/FirebaseContext';

export default function Settings() {
  const { user, logout, profile, updateProfile } = useFirebase();

  const handleCurrencyChange = () => {
    const currencies = ['USD', 'GBP', 'NGN'];
    const currentIndex = currencies.indexOf(profile?.currency || 'USD');
    const nextIndex = (currentIndex + 1) % currencies.length;
    updateProfile({ currency: currencies[nextIndex] });
  };

  const toggleTheme = () => {
    const nextTheme = profile?.theme === 'light' ? 'dark' : 'light';
    updateProfile({ theme: nextTheme });
  };

  const sections = [
    {
      title: 'ACCOUNT SETTINGS',
      items: [
        { 
          icon: Globe, 
          label: 'Default Currency', 
          value: profile?.currency || 'USD',
          onClick: handleCurrencyChange
        },
        { 
          icon: profile?.theme === 'light' ? Sun : Moon, 
          label: 'Theme', 
          value: profile?.theme === 'light' ? 'Light Mode' : 'Dark Mode',
          onClick: toggleTheme,
          toggle: true,
          checked: profile?.theme !== 'light'
        },
      ]
    }
  ];

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
        {sections.map((section) => (
          <div key={section.title} className="space-y-4">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{section.title}</h3>
            <Card className="bg-secondary/20 border-none overflow-hidden">
              <CardContent className="p-0">
                {section.items.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div 
                      key={item.label} 
                      onClick={item.onClick}
                      className={cn(
                        "flex justify-between items-center p-4 cursor-pointer hover:bg-secondary/30 transition-colors",
                        i !== section.items.length - 1 && "border-b border-border/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.value && <span className="text-xs text-muted-foreground">{item.value}</span>}
                        {item.toggle ? (
                          <div className={cn(
                            "w-10 h-5 rounded-full relative transition-colors",
                            item.checked ? "bg-primary" : "bg-muted"
                          )}>
                            <div className={cn(
                              "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                              item.checked ? "right-1" : "left-1"
                            )} />
                          </div>
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <Button variant="ghost" className="w-full justify-between h-12 text-muted-foreground hover:text-foreground">
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
