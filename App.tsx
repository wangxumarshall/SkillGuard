import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Scanner from './components/Scanner';
import ImageScanner from './components/ImageScanner';
import ChatAssistant from './components/ChatAssistant';
import Logs from './components/Logs';
import { AppView, ScanResult } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);

  const handleScanComplete = (result: ScanResult) => {
    setScanResults(prev => [result, ...prev]);
  };

  // Helper to manage visibility while keeping components mounted (preserving state)
  const getDisplayStyle = (view: AppView) => {
    return currentView === view ? { display: 'block', height: '100%' } : { display: 'none', height: '100%' };
  };

  return (
    <div className="flex h-screen w-screen bg-gray-950 text-gray-200 overflow-hidden font-sans">
      <Sidebar currentView={currentView} onChangeView={setCurrentView} />
      <main className="flex-1 h-full relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
        <div className="absolute inset-0 bg-gray-950/90 z-0"></div>
        <div className="relative z-10 h-full">
            {/* We render all views and toggle visibility to preserve state (inputs, results, chat history) */}
            <div style={getDisplayStyle(AppView.DASHBOARD)}>
              <Dashboard scanResults={scanResults} />
            </div>
            
            <div style={getDisplayStyle(AppView.SCANNER)}>
              <Scanner onScanComplete={handleScanComplete} />
            </div>

            <div style={getDisplayStyle(AppView.IMAGE_ANALYSIS)}>
              <ImageScanner />
            </div>

            <div style={getDisplayStyle(AppView.CHAT)}>
              <ChatAssistant />
            </div>

            <div style={getDisplayStyle(AppView.LOGS)}>
              <Logs />
            </div>
        </div>
      </main>
    </div>
  );
};

export default App;