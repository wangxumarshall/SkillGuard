import React, { useState } from 'react';
import { Upload, FileCode, Play, Loader2, Volume2, Database, AlertOctagon } from 'lucide-react';
import { scanSkillCode, generateSpeechAlert } from '../services/geminiService';
import { ScanResult } from '../types';

interface ScannerProps {
  onScanComplete: (result: ScanResult) => void;
}

const Scanner: React.FC<ScannerProps> = ({ onScanComplete }) => {
  const [code, setCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      try {
        const text = await file.text();
        setCode(text);
      } catch (err) {
        console.error("Failed to read file:", err);
      }
    }
  };

  const handleScan = async () => {
    if (!code.trim()) return;

    setIsScanning(true);
    setLastResult(null);

    const result = await scanSkillCode(code, "manual_input_script.py");
    
    setLastResult(result);
    onScanComplete(result);
    setIsScanning(false);
  };

  const playReport = async () => {
    if (!lastResult || isPlaying) return;
    setIsPlaying(true);
    
    const text = `Scan completed for ${lastResult.filename}. Status: ${lastResult.status}. Threat Level: ${lastResult.threatLevel}. ${lastResult.details}`;
    
    const audioBuffer = await generateSpeechAlert(text);
    if (audioBuffer) {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
      source.onended = () => setIsPlaying(false);
      source.start();
    } else {
        setIsPlaying(false);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <header className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Skill Scanner</h2>
          <p className="text-gray-400">Paste skill definition (JSON/Python/JS) to detect autonomous viruses.</p>
        </div>
        {lastResult && (
           <button 
             onClick={playReport}
             disabled={isPlaying}
             className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors disabled:opacity-50"
           >
             {isPlaying ? <Loader2 className="animate-spin w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
             {isPlaying ? 'Speaking...' : 'Read Report'}
           </button>
        )}
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
        <div className="flex flex-col gap-4">
            <div className="flex-1 bg-gray-900 border border-gray-700 rounded-xl overflow-hidden relative">
                <textarea 
                    className="w-full h-full bg-transparent p-4 font-mono text-sm text-gray-300 focus:outline-none resize-none"
                    placeholder="// Paste skill code here..."
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                />
                <div className="absolute bottom-4 right-4">
                    <button 
                        onClick={handleScan}
                        disabled={isScanning || !code}
                        className="flex items-center gap-2 bg-neon-green text-black font-bold px-6 py-3 rounded-lg hover:bg-green-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(0,255,157,0.3)]"
                    >
                        {isScanning ? (
                            <>
                                <Loader2 className="animate-spin w-5 h-5" />
                                SCANNING...
                            </>
                        ) : (
                            <>
                                <Play className="w-5 h-5 fill-current" />
                                EXECUTE SCAN
                            </>
                        )}
                    </button>
                </div>
            </div>
            
            <div
                className={`h-24 border-2 border-dashed rounded-xl flex items-center justify-center transition-colors cursor-pointer
                    ${isDragging ? 'border-neon-green bg-green-900/20 text-white' : 'border-gray-700 text-gray-500 hover:text-gray-300 hover:border-gray-500 bg-gray-800/30'}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <div className="flex flex-col items-center gap-2">
                    <Upload className={`w-6 h-6 ${isDragging ? 'animate-bounce' : ''}`} />
                    <span className="text-sm">{isDragging ? 'Release to Load Skill' : 'Drag & Drop Skill Manifest Files'}</span>
                </div>
            </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 overflow-y-auto">
            {!lastResult ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-4">
                    <FileCode className="w-16 h-16 opacity-20" />
                    <p>Ready for input analysis</p>
                </div>
            ) : (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-gray-700 pb-4">
                        <div>
                            <h3 className="text-lg font-bold text-white">Analysis Report</h3>
                            <div className="text-xs text-gray-400 font-mono">{lastResult.id}</div>
                        </div>
                        <div className={`px-4 py-2 rounded font-bold ${
                            lastResult.status === 'Clean' ? 'bg-green-500/20 text-neon-green' : 
                            lastResult.status === 'Infected' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                            {lastResult.status.toUpperCase()}
                        </div>
                    </div>

                    <div>
                        <div className="text-sm text-gray-400 mb-1 font-mono">THREAT LEVEL</div>
                        <div className="h-4 w-full bg-gray-700 rounded-full overflow-hidden">
                            <div 
                                className={`h-full transition-all duration-1000 ${
                                    lastResult.threatLevel > 75 ? 'bg-red-500' : 
                                    lastResult.threatLevel > 25 ? 'bg-yellow-500' : 'bg-neon-green'
                                }`}
                                style={{ width: `${lastResult.threatLevel}%` }}
                            />
                        </div>
                        <div className="flex justify-end mt-1 text-xs font-mono text-gray-300">
                            {lastResult.threatLevel}/100
                        </div>
                    </div>

                    {/* Signature Matches Section */}
                    {lastResult.signatureMatches && lastResult.signatureMatches.length > 0 && (
                      <div className="bg-gray-900/80 border border-gray-700 rounded p-4">
                        <div className="flex items-center gap-2 text-neon-red mb-3">
                          <Database className="w-4 h-4" />
                          <h4 className="text-sm font-bold font-mono">DATABASE SIGNATURE HITS</h4>
                        </div>
                        <div className="space-y-2">
                          {lastResult.signatureMatches.map((sig) => (
                            <div key={sig.id} className="flex items-center justify-between text-xs bg-red-950/30 p-2 rounded border border-red-900/20">
                              <span className="text-red-300 font-mono">{sig.id} :: {sig.name}</span>
                              <span className={`px-1.5 py-0.5 rounded ${
                                sig.severity === 'CRITICAL' ? 'bg-red-500 text-black' : 
                                sig.severity === 'WARNING' ? 'bg-yellow-500 text-black' : 'bg-blue-500 text-black'
                              } font-bold`}>{sig.severity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                        <div className="text-sm text-gray-400 mb-2 font-mono">AI SUMMARY</div>
                        <p className="text-gray-200 leading-relaxed bg-gray-900/50 p-4 rounded border border-gray-700">
                            {lastResult.details}
                        </p>
                    </div>

                    {lastResult.vulnerabilities.length > 0 && (
                        <div>
                            <div className="text-sm text-gray-400 mb-2 font-mono">DETECTED VULNERABILITIES</div>
                            <ul className="space-y-2">
                                {lastResult.vulnerabilities.map((vuln, idx) => (
                                    <li key={idx} className="flex items-center gap-2 text-red-400 text-sm bg-red-900/10 p-2 rounded border border-red-900/30">
                                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                        {vuln}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Scanner;