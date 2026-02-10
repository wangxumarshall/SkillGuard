import React, { useEffect, useState, useRef } from 'react';

const Logs: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulate real-time logs
    const interval = setInterval(() => {
      const actions = [
        '[INFO] Daemon active. Monitoring port 8080.',
        '[SCAN] Analyzing chunk 0x4F3A...',
        '[NET] Outbound connection to safe-origin verified.',
        '[SYS] Heap usage: 45MB.',
        '[AUTH] Handshake successful.',
        '[INFO] Skill signature database updated.',
        '[WATCH] File system watcher engaged.',
      ];
      const randomLog = actions[Math.floor(Math.random() * actions.length)];
      const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
      setLogs(prev => [...prev.slice(-50), `[${timestamp}] ${randomLog}`]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="p-8 h-full flex flex-col">
      <header className="mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">System Logs</h2>
        <p className="text-gray-400">Raw kernel and daemon output.</p>
      </header>
      <div className="flex-1 bg-black border border-gray-800 rounded-xl p-4 font-mono text-sm text-green-500 overflow-y-auto shadow-inner" ref={scrollRef}>
        {logs.map((log, i) => (
          <div key={i} className="mb-1 opacity-80 hover:opacity-100 hover:bg-gray-900/50 px-2 rounded">
            {log}
          </div>
        ))}
        <div className="animate-pulse">_</div>
      </div>
    </div>
  );
};

export default Logs;