import React, { useState } from 'react';
import { useTrafficData } from '../../context/TrafficDataContext';
import { GlassCard } from '../common/GlassCard';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
  PieChart, Pie, Cell
} from 'recharts';
import { FileText, Download } from 'lucide-react';

export const DeepAnalytics: React.FC = () => {
  const { intersections, incidents, cameras } = useTrafficData();
  const [dateFilter, setDateFilter] = useState('Today');

  // Hardcoded historical analytics mock dataset
  const historyTrends = [
    { name: '08:00', Congestion: 72, volume: 840, efficiency: 68 },
    { name: '10:00', Congestion: 52, volume: 620, efficiency: 75 },
    { name: '12:00', Congestion: 40, volume: 510, efficiency: 81 },
    { name: '14:00', Congestion: 48, volume: 550, efficiency: 79 },
    { name: '16:00', Congestion: 85, volume: 980, efficiency: 60 }, // Peak Rush Hour
    { name: '18:00', Congestion: 78, volume: 920, efficiency: 64 },
    { name: '20:00', Congestion: 35, volume: 440, efficiency: 85 }
  ];

  // Vehicle Distribution totals
  const totalVehicles = cameras.reduce((acc, cam) => {
    return {
      car: acc.car + cam.liveMetrics.car,
      bus: acc.bus + cam.liveMetrics.bus,
      truck: acc.truck + cam.liveMetrics.truck,
      motorcycle: acc.motorcycle + cam.liveMetrics.motorcycle,
      rickshaw: acc.rickshaw + cam.liveMetrics.rickshaw,
    };
  }, { car: 0, bus: 0, truck: 0, motorcycle: 0, rickshaw: 0 });

  const vehicleDistributionData = [
    { name: 'Cars', count: totalVehicles.car, fill: '#3b82f6' },
    { name: 'Buses', count: totalVehicles.bus, fill: '#10b981' },
    { name: 'Trucks', count: totalVehicles.truck, fill: '#f59e0b' },
    { name: 'Bikes', count: totalVehicles.motorcycle, fill: '#8b5cf6' },
    { name: 'Rickshaws', count: totalVehicles.rickshaw, fill: '#ec4899' }
  ];

  // Active vs Resolved Incidents counts
  const incidentCategories = [
    { name: 'Accidents', value: incidents.filter(i => i.type === 'Accident').length },
    { name: 'Stalled Vehicles', value: incidents.filter(i => i.type === 'Stalled Vehicle' || i.type === 'Wrongway Driving').length },
    { name: 'Road Obstruction', value: incidents.filter(i => i.type === 'Road Obstruction' || i.type === 'Construction').length },
    { name: 'AI Violations', value: incidents.filter(i => i.type === 'Red-Light Violation' || i.type === 'Overspeeding').length }
  ].filter(c => c.value > 0);

  const COLORS = ['#ef4444', '#f97316', '#3b82f6', '#8b5cf6'];

  // Dynamic CSV Exporter (lightweight browser native)
  const exportCSVReport = () => {
    const headers = ['Timestamp', 'CongestionIndex', 'TrafficVolume', 'SignalEfficiency'];
    const rows = historyTrends.map(t => [t.name, t.Congestion, t.volume, t.efficiency]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Metropulse_Traffic_Data_${dateFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Browser standard Print PDF report hook
  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Exporters and Date Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-sans">Deep Diagnostics Analytics</h2>
          <p className="text-xs text-slate-500 mt-1">Cross-sectional summaries detailing intersection velocities and carbon/volume indicators.</p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <select 
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="p-2 border border-slate-800 rounded bg-slate-900 text-xs text-slate-300 font-semibold focus:outline-none"
          >
            <option>Today</option>
            <option>Yesterday</option>
            <option>Last 7 Days</option>
            <option>Month to Date</option>
          </select>

          <button
            onClick={exportCSVReport}
            className="p-2 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded text-xs font-bold transition-all flex items-center cursor-pointer"
          >
            <Download className="h-4 w-4 mr-1.5" />
            Excel Data
          </button>
          
          <button
            onClick={handlePrintPDF}
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold transition-all flex items-center cursor-pointer"
          >
            <FileText className="h-4 w-4 mr-1.5" />
            Print PDF Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Line Chart: Daily trends */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard>
            <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">
              24-Hour Traffic Congestion & Volume indices
            </h3>
            
            <div className="h-80 w-full sm:-ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                  <Line type="monotone" dataKey="Congestion" name="Congestion index (%)" stroke="#EF4444" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="volume" name="Vehicles / hour" stroke="#3b82f6" strokeWidth={2} dot={{ r: 1 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* Pie incident categories */}
        <div className="space-y-6">
          <GlassCard className="h-full flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">
                Road Incident distributions
              </h3>
              
              {incidentCategories.length > 0 ? (
                <div className="h-48 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={incidentCategories}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {incidentCategories.map((_entry, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-slate-500 text-xs">
                  No active incidents logged for classification.
                </div>
              )}
            </div>

            <div className="space-y-2 mt-4">
              {incidentCategories.map((c, i) => (
                <div key={c.name} className="flex justify-between items-center text-[11px] text-slate-400 font-medium">
                  <span className="flex items-center">
                    <span className="h-2 w-2 rounded-full mr-2 shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    {c.name}
                  </span>
                  <span className="text-white font-bold">{c.value} events</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Bar chart: vehicle classification counts */}
        <div className="lg:col-span-1 space-y-6">
          <GlassCard className="h-full">
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">
              Autonomous Vehicle density Share
            </h3>
            
            <div className="h-64 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vehicleDistributionData}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                  <YAxis stroke="#94a3b8" fontSize={9} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {vehicleDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* Hotspots report matrix */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard>
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">
              Urban Hotspots Congestion Rank
            </h3>
            
            <div className="space-y-3">
              {intersections.map(int => (
                <div key={int._id} className="p-3 bg-slate-950 border border-slate-900 rounded-xl flex items-center justify-between">
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white block truncate">{int.name}</span>
                    <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">Average Speed: {int.lanes[0]?.averageSpeed || 45} km/h</span>
                  </div>

                  <div className="flex items-center space-x-4 shrink-0">
                    <div className="w-24 bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div 
                        className={`h-full rounded-full ${
                          int.congestionIndex > 75 ? 'bg-red-500' : int.congestionIndex > 45 ? 'bg-orange-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${int.congestionIndex}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-300 w-12 text-right">{int.congestionIndex}% Index</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

      </div>

    </div>
  );
};
