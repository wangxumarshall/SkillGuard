import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ShieldCheck, AlertTriangle, Activity } from 'lucide-react';
import { ScanResult } from '../types';

interface DashboardProps {
  scanResults: ScanResult[];
}

const Dashboard: React.FC<DashboardProps> = ({ scanResults }) => {
  const totalScans = scanResults.length;
  const infected = scanResults.filter(r => r.status === 'Infected').length;
  const suspicious = scanResults.filter(r => r.status === 'Suspicious').length;
  const clean = scanResults.filter(r => r.status === 'Clean').length;

  const data = [
    { name: 'Clean', value: clean, color: '#00ff9d' },
    { name: 'Suspicious', value: suspicious, color: '#f6e05e' },
    { name: 'Infected', value: infected, color: '#ff0055' },
  ].filter(d => d.value > 0);

  // If no data, show a placeholder
  const chartData = data.length > 0 ? data : [{ name: 'No Data', value: 1, color: '#2d3748' }];

  const recentThreats = scanResults
    .filter(r => r.status !== 'Clean')
    .slice(0, 5);

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Security Overview</h2>
        <p className="text-gray-400">Real-time threat monitoring and skill analysis.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-mono text-sm">SYSTEM STATUS</h3>
            <ShieldCheck className="text-neon-green" />
          </div>
          <div className="text-2xl font-bold text-white">PROTECTED</div>
          <div className="text-sm text-gray-500 mt-2">Latest definitions updated</div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-mono text-sm">THREATS BLOCKED</h3>
            <AlertTriangle className="text-neon-red" />
          </div>
          <div className="text-2xl font-bold text-white">{infected}</div>
          <div className="text-sm text-gray-500 mt-2">In the last 24 hours</div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-mono text-sm">ACTIVE SCANS</h3>
            <Activity className="text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totalScans}</div>
          <div className="text-sm text-gray-500 mt-2">Total skills analyzed</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-80">
        <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-xl">
          <h3 className="text-white font-mono mb-6">SCAN DISTRIBUTION</h3>
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
                  <div>
                    <div className="font-bold text-sm text-white">{threat.filename}</div>
                    <div className="text-xs text-gray-400">{threat.details}</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    threat.status === 'Infected' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {threat.status.toUpperCase()}
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