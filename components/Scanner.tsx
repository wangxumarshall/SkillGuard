// components/Scanner.tsx
import React, { useState } from 'react';
import { Upload, FileCode, Play, Loader2, Volume2, ShieldAlert, CheckCircle, AlertTriangle, Hammer } from 'lucide-react';
import { scanContent } from '../services/core/detection';
import { remediateContent } from '../services/core/remediation/sanitizer';
import { ScanReport } from '../types';
import { generateSpeechAlert } from '../services/geminiService'; // Reuse TTS

interface ScannerProps {
  onScanComplete: (result: ScanReport) => void;
}

const Scanner: React.FC<ScannerProps> = ({ onScanComplete }) => {
  const [content, setContent] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [lastResult, setLastResult] = useState<ScanReport | null>(null);
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
        setContent(text);
      } catch (err) {
        console.error("Failed to read file:", err);
      }
    }
  };

  const handleScan = async () => {
    if (!content.trim()) return;

    setIsScanning(true);
    setLastResult(null);

    const result = await scanContent(content, "Manual Input");
    
    setLastResult(result);
    onScanComplete(result);
    setIsScanning(false);
  };

  const handleRemediate = () => {
    if (!lastResult || !content) return;
    const cleanContent = remediateContent(content, lastResult.findings);
    setContent(cleanContent);
    // Optionally trigger a re-scan or clear the result to indicate "Cleaned" state
    setLastResult(prev => prev ? { ...prev, overallStatus: 'CLEAN', maxSeverity: 'SAFE', findings: [], aiAnalysisSummary: 'Content Sanitized.' } : null);
  };

  const playReport = async () => {
    if (!lastResult || isPlaying) return;
    setIsPlaying(true);
    
    const text = `Scan completed. Status: ${lastResult.overallStatus}. Severity: ${lastResult.maxSeverity}. ${lastResult.aiAnalysisSummary}`;
    
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
          <h2 className="text-3xl font-bold text-white mb-2">Threat Scanner</h2>
          <p className="text-gray-400">Scan Prompts, Skills, or Configs for LLM Viruses.</p>
        </div>
        {lastResult && (
           <div className="flex gap-2">
             {lastResult.overallStatus !== 'CLEAN' && (
               <button
                 onClick={handleRemediate}
                 className="flex items-center gap-2 px-4 py-2 bg-neon-red hover:bg-red-600 text-black font-bold rounded transition-colors"
               >
                 <Hammer className="w-4 h-4" />
                 Fix Threats
               </button>
             )}
             <button
               onClick={playReport}
               disabled={isPlaying}
               className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors disabled:opacity-50"
             >
               {isPlaying ? <Loader2 className="animate-spin w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
               {isPlaying ? 'Speaking...' : 'Read Report'}
             </button>
           </div>
        )}
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
        <div className="flex flex-col gap-4">
            <div className="flex-1 bg-gray-900 border border-gray-700 rounded-xl overflow-hidden relative">
                <textarea 
                    className="w-full h-full bg-transparent p-4 font-mono text-sm text-gray-300 focus:outline-none resize-none"
                    placeholder="// Paste Prompt or Skill Code here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
                <div className="absolute bottom-4 right-4">
                    <button 
                        onClick={handleScan}
                        disabled={isScanning || !content}
                        className="flex items-center gap-2 bg-neon-green text-black font-bold px-6 py-3 rounded-lg hover:bg-green-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(0,255,157,0.3)]"
                    >
                        {isScanning ? (
                            <>
                                <Loader2 className="animate-spin w-5 h-5" />
                                ANALYZING...
                            </>
                        ) : (
                            <>
                                <Play className="w-5 h-5 fill-current" />
                                SCAN
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
                    <span className="text-sm">{isDragging ? 'Release to Load Content' : 'Drag & Drop Skill Files (.py, .md, .json)'}</span>
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
                            <h3 className="text-lg font-bold text-white">Scan Report</h3>
                            <div className="text-xs text-gray-400 font-mono">{lastResult.id}</div>
                        </div>
                        <div className={`px-4 py-2 rounded font-bold flex items-center gap-2 ${
                            lastResult.overallStatus === 'CLEAN' ? 'bg-green-500/20 text-neon-green' :
                            lastResult.overallStatus === 'INFECTED' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                            {lastResult.overallStatus === 'CLEAN' ? <CheckCircle className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                            {lastResult.overallStatus}
                        </div>
                    </div>

                    <div>
                        <div className="text-sm text-gray-400 mb-1 font-mono">SEVERITY ASSESSMENT</div>
                        <div className={`text-xl font-bold ${
                            lastResult.maxSeverity === 'CRITICAL' ? 'text-red-500' :
                            lastResult.maxSeverity === 'HIGH' ? 'text-orange-500' :
                            lastResult.maxSeverity === 'MEDIUM' ? 'text-yellow-400' : 'text-green-400'
                        }`}>
                            {lastResult.maxSeverity}
                        </div>
                    </div>

                    {/* Findings Section */}
                    {lastResult.findings && lastResult.findings.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-neon-red mb-1">
                          <AlertTriangle className="w-4 h-4" />
                          <h4 className="text-sm font-bold font-mono">DETECTED THREATS</h4>
                        </div>
                        {lastResult.findings.map((finding, idx) => (
                            <div key={idx} className="bg-red-950/30 p-3 rounded border border-red-900/20">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-red-300 font-bold text-sm">{finding.type}</span>
                                    <span className="text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded">{finding.severity}</span>
                                </div>
                                <div className="text-gray-300 text-sm mb-2">{finding.description}</div>
                                {finding.snippet && (
                                    <div className="bg-black/40 p-2 rounded font-mono text-xs text-red-200 mb-2 truncate">
                                        Matched: "{finding.snippet}"
                                    </div>
                                )}
                                <div className="text-green-400 text-xs flex items-center gap-1">
                                    <ShieldAlert className="w-3 h-3" />
                                    Remediation: {finding.remediation}
                                </div>
                            </div>
                        ))}
                      </div>
                    )}

                    <div>
                        <div className="text-sm text-gray-400 mb-2 font-mono">AI SUMMARY</div>
                        <p className="text-gray-200 leading-relaxed bg-gray-900/50 p-4 rounded border border-gray-700 text-sm">
                            {lastResult.aiAnalysisSummary}
                        </p>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Scanner;