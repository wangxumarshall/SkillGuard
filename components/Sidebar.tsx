import React from 'react';
import { AppView } from '../types';
import { Shield, Search, MessageSquare, Image as ImageIcon, FileText, Terminal } from 'lucide-react';

interface SidebarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView }) => {
  const menuItems = [
    { id: AppView.DASHBOARD, label: 'Dashboard', icon: Shield },
    { id: AppView.SCANNER, label: 'Skill Scanner', icon: Search },
    { id: AppView.IMAGE_ANALYSIS, label: 'Visual Analysis', icon: ImageIcon },
    { id: AppView.CHAT, label: 'Security Chat', icon: MessageSquare },
    { id: AppView.LOGS, label: 'System Logs', icon: Terminal },
  ];

  return (
    <div className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col h-full">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-neon-green to-blue-500 rounded flex items-center justify-center">
          <Shield className="text-black w-5 h-5" />
        </div>
        <h1 className="text-xl font-bold tracking-wider text-white">SKILL<span className="text-neon-green">GUARD</span></h1>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                active
                  ? 'bg-gray-800 text-neon-green shadow-[0_0_15px_rgba(0,255,157,0.1)] border-l-4 border-neon-green'
                  : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-neon-green' : ''}`} />
              <span className="font-mono text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
          <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
          SYSTEM ONLINE v2.4.0
        </div>
      </div>
    </div>
  );
};

export default Sidebar;