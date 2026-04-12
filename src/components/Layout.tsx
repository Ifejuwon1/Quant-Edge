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
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card/50 backdrop-blur-xl">
        <div className="p-6 flex items-center gap-3 border-b border-border">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <BarChart3 className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-primary">QuantEdge</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all group",
                  activeTab === item.id 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/10" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className={cn("w-5 h-5", activeTab === item.id ? "" : "group-hover:scale-110 transition-transform")} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-4">
          <button 
            onClick={() => onTabChange('settings')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all",
              activeTab === 'settings' ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <div className="w-8 h-8 rounded-full border border-border overflow-hidden">
              <img 
                src={user?.photoURL || "https://picsum.photos/seed/trader/100/100"} 
                alt="Profile" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-1 text-left truncate">
              <p className="truncate font-bold">{user?.displayName || 'Trader'}</p>
              <p className="text-[10px] text-muted-foreground truncate">Settings</p>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-6 py-4 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl tracking-tight text-primary">QuantEdge</span>
          </div>
          <div className="flex items-center gap-4">
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

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </main>

        {/* Mobile Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-card/90 backdrop-blur-xl border-t border-border px-4 py-3 z-50">
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
    </div>
  );
}
