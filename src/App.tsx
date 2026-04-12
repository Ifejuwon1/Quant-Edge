/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Layout from './components/Layout';
import Home from './components/Home';
import Calculator from './components/Calculator';
import Journal from './components/Journal';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import { FirebaseProvider, useFirebase } from './lib/FirebaseContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { BarChart3, LogIn } from 'lucide-react';

function AppContent() {
  const [activeTab, setActiveTab] = useState('home');
  const { user, loading, login } = useFirebase();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background p-6 text-center space-y-8 max-w-md mx-auto border-x border-border">
        <div className="space-y-4">
          <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-primary/20">
            <BarChart3 className="w-10 h-10 text-primary-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">QuantEdge</h1>
            <p className="text-muted-foreground">Professional Trading Workspace</p>
          </div>
        </div>
        
        <div className="w-full space-y-4">
          <Button 
            onClick={login}
            className="w-full h-14 text-lg font-bold rounded-2xl gap-3 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <LogIn className="w-5 h-5" />
            Sign in with Google
          </Button>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
            Securely manage your risk and journal
          </p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Home onAction={(tab) => setActiveTab(tab)} />;
      case 'calculator':
        return <Calculator />;
      case 'journal':
        return <Journal />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      default:
        return <Home onAction={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <FirebaseProvider>
        <AppContent />
      </FirebaseProvider>
    </ErrorBoundary>
  );
}
