import React, { useState } from 'react';
import { PromptScanner } from './PromptScanner';
import { SkillScanner } from './SkillScanner';
import { Shield, FileCode } from 'lucide-react';
import { ScanResult } from '../types';

interface ScannerProps {
  onScanComplete: (result: ScanResult) => void;
}

const Scanner: React.FC<ScannerProps> = ({ onScanComplete }) => {
  const [activeTab, setActiveTab] = useState<'prompt' | 'skill'>('prompt');

  return (
    <div className="p-8 h-full flex flex-col">
      <header className="mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">Threat Detection Engine</h2>
        <p className="text-gray-400">Advanced AI-powered scanning for Prompt Injection and Malicious Skills.</p>
      </header>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('prompt')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${
            activeTab === 'prompt'
              ? 'bg-neon-green text-black shadow-[0_0_15px_rgba(0,255,157,0.3)]'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          <Shield size={20} />
          Prompt Scanner
        </button>
        <button
          onClick={() => setActiveTab('skill')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${
            activeTab === 'skill'
              ? 'bg-neon-green text-black shadow-[0_0_15px_rgba(0,255,157,0.3)]'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          <FileCode size={20} />
          Skill Scanner
        </button>
      </div>

      <div className="flex-1 min-h-0 relative">
        <div className={`absolute inset-0 transition-opacity duration-300 ${activeTab === 'prompt' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
           <PromptScanner />
        </div>
        <div className={`absolute inset-0 transition-opacity duration-300 ${activeTab === 'skill' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
           <SkillScanner />
        </div>
      </div>
    </div>
  );
};

export default Scanner;
