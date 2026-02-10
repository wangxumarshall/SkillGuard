import React, { useState, useRef } from 'react';
import { Upload, Camera, ScanLine, Loader2, AlertCircle, FileImage } from 'lucide-react';
import { analyzeImageThreat } from '../services/geminiService';

const ImageScanner: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setAnalysis(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    
    setIsAnalyzing(true);
    // Extract base64 part only
    const base64Data = image.split(',')[1];
    const result = await analyzeImageThreat(base64Data);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <header className="mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">Visual Threat Analysis</h2>
        <p className="text-gray-400">Upload screenshots of suspicious interfaces or diagrams for forensic analysis.</p>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
        <div className="flex flex-col gap-4">
          <div 
            className="flex-1 bg-gray-900 border-2 border-dashed border-gray-700 rounded-xl relative overflow-hidden group hover:border-neon-green/50 transition-colors cursor-pointer flex flex-col items-center justify-center"
            onClick={() => !image && fileInputRef.current?.click()}
          >
            {image ? (
              <div className="relative w-full h-full">
                <img src={image} alt="Preview" className="w-full h-full object-contain p-4" />
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setImage(null);
                    setAnalysis(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="absolute top-4 right-4 bg-black/80 text-white p-2 rounded-full hover:bg-red-500/80 transition-colors"
                >
                  <AlertCircle className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Camera className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-300">Upload Image Evidence</h3>
                <p className="text-sm text-gray-500 mt-2">Supports JPG, PNG, WEBP</p>
              </>
            )}
            
            {image && isAnalyzing && (
               <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                 <div className="flex flex-col items-center gap-3">
                   <ScanLine className="w-12 h-12 text-neon-green animate-pulse" />
                   <span className="text-neon-green font-mono tracking-widest">SCANNING_PIXELS...</span>
                 </div>
               </div>
            )}
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileSelect}
            />
          </div>

          <button 
            onClick={handleAnalyze}
            disabled={!image || isAnalyzing}
            className="w-full py-4 bg-neon-blue text-black font-bold rounded-lg hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(0,208,255,0.3)] flex items-center justify-center gap-2"
          >
             {isAnalyzing ? <Loader2 className="animate-spin" /> : <ScanLine />}
             INITIATE VISUAL SCAN
          </button>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 overflow-y-auto">
          {!analysis ? (
             <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-4">
                <FileImage className="w-16 h-16 opacity-20" />
                <p>Waiting for visual input</p>
             </div>
          ) : (
             <div className="animate-fade-in space-y-4">
               <div className="flex items-center gap-2 text-neon-green border-b border-gray-700 pb-3 mb-4">
                 <ScanLine className="w-5 h-5" />
                 <span className="font-mono font-bold">ANALYSIS COMPLETE</span>
               </div>
               <div className="prose prose-invert prose-sm max-w-none">
                  <div className="text-gray-300 whitespace-pre-wrap leading-relaxed font-mono text-sm">
                    {analysis}
                  </div>
               </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageScanner;