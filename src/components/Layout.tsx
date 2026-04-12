import React from 'react';
import { Home, Calculator, BookOpen, BarChart3, Settings, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFirebase } from '@/src/lib/FirebaseContext';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Layout({ children, activeTab, onTabChange }: LayoutProps) {
  const { user } = useFirebase();
  const navItems = [
    { id: 'home', icon: Home, label: 'HOME' },
    { id: 'calculator', icon: Calculator, label: 'CALCULATOR' },
    { id: 'journal', icon: BookOpen, label: 'JOURNAL' },
    { id: 'analytics', icon: BarChart3, label: 'ANALYTICS' },
  ];

  return (
    <div className="flex flex-col h-screen bg-background text-foreground max-w-md mx-auto border-x border-border overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl tracking-tight text-primary">QuantEdge</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <button 
            onClick={() => onTabChange('settings')}
            className={cn(
              "w-8 h-8 rounded-full bg-secondary border overflow-hidden transition-all",
              activeTab === 'settings' ? "border-primary scale-110" : "border-border"
            )}
          >
            <img 
              src={user?.photoURL || "https://picsum.photos/seed/trader/100/100"} 
              alt="Profile" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-card/90 backdrop-blur-xl border-t border-border px-4 py-3 z-50">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "flex flex-col items-center gap-1 transition-all duration-300",
                  isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className={cn(
                  "p-2 rounded-xl transition-colors",
                  isActive && "bg-primary/10"
                )}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold tracking-widest">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
