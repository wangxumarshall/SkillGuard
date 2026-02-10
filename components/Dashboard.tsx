import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ShieldCheck, AlertTriangle, Activity, Bug } from 'lucide-react';
import { ScanReport } from '../types';

interface DashboardProps {
  scanHistory: ScanReport[];
}

const Dashboard: React.FC<DashboardProps> = ({ scanHistory }) => {
  const totalScans = scanHistory.length;
  const infected = scanHistory.filter(r => r.overallStatus === 'INFECTED').length;
  const suspicious = scanHistory.filter(r => r.overallStatus === 'SUSPICIOUS').length;
  const clean = scanHistory.filter(r => r.overallStatus === 'CLEAN').length;

  const data = [
    { name: 'Clean', value: clean, color: '#00ff9d' },
    { name: 'Suspicious', value: suspicious, color: '#f6e05e' },
    { name: 'Infected', value: infected, color: '#ff0055' },
  ].filter(d => d.value > 0);

  // If no data, show a placeholder
  const chartData = data.length > 0 ? data : [{ name: 'No Data', value: 1, color: '#2d3748' }];

  const recentThreats = scanHistory
    .filter(r => r.overallStatus !== 'CLEAN')
    .slice(0, 5);

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">LLM Guard Dashboard</h2>
        <p className="text-gray-400">Personal Edition - Real-time Prompt & Skill Protection</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-mono text-sm">PROTECTION STATUS</h3>
            <ShieldCheck className="text-neon-green" />
          </div>
          <div className="text-2xl font-bold text-white">ACTIVE</div>
          <div className="text-sm text-gray-500 mt-2">Signatures: v2024.05.01</div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-mono text-sm">THREATS INTERCEPTED</h3>
            <AlertTriangle className="text-neon-red" />
          </div>
          <div className="text-2xl font-bold text-white">{infected + suspicious}</div>
          <div className="text-sm text-gray-500 mt-2">Prompts & Skills Blocked</div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-mono text-sm">TOTAL SCANS</h3>
            <Activity className="text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totalScans}</div>
          <div className="text-sm text-gray-500 mt-2">Inputs Analyzed</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-80">
        <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-xl">
          <h3 className="text-white font-mono mb-6">THREAT DISTRIBUTION</h3>
          <ResponsiveContainer width="100%" height="80%">
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a202c', borderColor: '#4a5568', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-xl overflow-hidden flex flex-col">
          <h3 className="text-white font-mono mb-4">RECENT ALERTS</h3>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {recentThreats.length === 0 ? (
              <div className="text-gray-500 text-center py-10">No recent threats detected.</div>
            ) : (
              recentThreats.map(threat => (
                <div key={threat.id} className="bg-gray-900/50 p-3 rounded border border-gray-700 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Bug className="text-neon-red w-5 h-5" />
                    <div>
                      <div className="font-bold text-sm text-white">{threat.targetName}</div>
                      <div className="text-xs text-gray-400">
                         {threat.maxSeverity} • {threat.targetType}
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    threat.overallStatus === 'INFECTED' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {threat.overallStatus}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;