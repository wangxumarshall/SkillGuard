import React, { useState } from 'react';
import { scanSkillText, scanSkillFile, ScanResponse } from '../services/api';
import { AlertCircle, CheckCircle, Loader2, FileUp, ShieldCheck } from 'lucide-react';
import { ScanResult } from '../types';

interface SkillScannerProps {
    onScanComplete?: (result: ScanResult) => void;
}

export const SkillScanner: React.FC<SkillScannerProps> = ({ onScanComplete }) => {
    const [scanType, setScanType] = useState<'text' | 'file'>('text');
    const [textContent, setTextContent] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [result, setResult] = useState<ScanResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleScan = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            let data: ScanResponse;
            let filename = 'Manual Input Skill';

            if (scanType === 'text') {
                if (!textContent.trim()) return;
                data = await scanSkillText(textContent);
            } else {
                if (!file) return;
                filename = file.name;
                data = await scanSkillFile(file);
            }
            setResult(data);

            if (onScanComplete) {
                onScanComplete({
                    id: crypto.randomUUID(),
                    filename: filename,
                    timestamp: new Date(),
                    status: data.is_malicious ? 'Infected' : 'Clean',
                    threatLevel: data.risk_level === 'High' ? 90 : data.risk_level === 'Medium' ? 50 : 0,
                    details: data.reasoning,
                    vulnerabilities: data.threat_type !== 'None' ? [data.threat_type] : [],
                    signatureMatches: []
                });
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred during scanning.');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    return (
        <div className="p-6 bg-gray-900 border border-gray-800 rounded-xl shadow-xl h-full flex flex-col">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <ShieldCheck className="text-neon-green" />
                Skill Code Scanner
            </h2>

            <div className="flex gap-4 mb-4">
                <button
                    className={`px-4 py-2 rounded-md ${scanType === 'text' ? 'bg-gray-700 text-white font-bold' : 'bg-gray-800 text-gray-500 hover:text-gray-300'}`}
                    onClick={() => setScanType('text')}
                >
                    Paste Content
                </button>
                <button
                    className={`px-4 py-2 rounded-md ${scanType === 'file' ? 'bg-gray-700 text-white font-bold' : 'bg-gray-800 text-gray-500 hover:text-gray-300'}`}
                    onClick={() => setScanType('file')}
                >
                    Upload File
                </button>
            </div>

            {scanType === 'text' ? (
                <textarea
                    className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl mb-4 focus:ring-2 focus:ring-neon-green focus:outline-none min-h-[150px] text-gray-200 font-mono"
                    placeholder="Paste skill content (Python, YAML, Markdown)..."
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                />
            ) : (
                <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center mb-4 bg-gray-800/20 hover:bg-gray-800/50 transition-colors">
                    <input
                        type="file"
                        id="skill-upload"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    <label
                        htmlFor="skill-upload"
                        className="cursor-pointer flex flex-col items-center justify-center text-gray-500 hover:text-neon-green transition-colors"
                    >
                        <FileUp size={48} className="mb-2 opacity-50" />
                        <span className="font-semibold">{file ? file.name : 'Click to Upload Skill File'}</span>
                    </label>
                </div>
            )}

            <button
                className="bg-neon-green text-black font-bold px-6 py-3 rounded-lg hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-[0_0_15px_rgba(0,255,157,0.2)]"
                onClick={handleScan}
                disabled={loading || (scanType === 'text' ? !textContent.trim() : !file)}
            >
                {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                SCAN SKILL
            </button>

            {error && (
                <div className="mt-4 p-4 bg-red-900/20 text-red-400 rounded-md border border-red-900/50">
                    {error}
                </div>
            )}

            {result && (
                <div className={`mt-6 p-6 rounded-xl border animate-in fade-in slide-in-from-bottom-4 ${result.is_malicious ? 'bg-red-900/10 border-red-500/50' : 'bg-green-900/10 border-green-500/50'}`}>
                    <div className="flex items-center mb-4">
                        {result.is_malicious ? (
                            <AlertCircle className="text-red-500 mr-3" size={28} />
                        ) : (
                            <CheckCircle className="text-green-500 mr-3" size={28} />
                        )}
                        <h3 className={`text-xl font-bold ${result.is_malicious ? 'text-red-400' : 'text-green-400'}`}>
                            {result.is_malicious ? 'MALICIOUS SKILL DETECTED' : 'SKILL APPEARS SAFE'}
                        </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-2 text-sm mb-4">
                        <div className="bg-gray-950/50 p-3 rounded-lg border border-gray-800">
                            <span className="block text-gray-500 text-xs uppercase tracking-wider mb-1">Risk Level</span>
                            <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                                result.risk_level === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                result.risk_level === 'Medium' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                                result.risk_level === 'Low' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                'bg-green-500/20 text-green-400 border border-green-500/30'
                            }`}>
                                {result.risk_level.toUpperCase()}
                            </span>
                        </div>
                        <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                            <span className="block text-gray-500 text-xs uppercase tracking-wider mb-1">Threat Type</span>
                            <span className="text-gray-300 font-mono">{result.threat_type}</span>
                        </div>
                    </div>

                    <div>
                        <span className="block text-gray-500 text-xs uppercase tracking-wider mb-2">Analysis Report</span>
                        <p className="text-gray-300 bg-gray-950/50 p-4 rounded-lg border border-gray-800 leading-relaxed font-mono text-sm">
                            {result.reasoning}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
