import React, { useState } from 'react';
import { useTrafficData } from '../../context/TrafficDataContext';
import { GlassCard } from '../common/GlassCard';
import { Shield, Settings, Users, Trash2 } from 'lucide-react';

export const AdminControls: React.FC = () => {
  const { logs, intersections } = useTrafficData();
  const [adminTab, setAdminTab] = useState<'logs' | 'users' | 'intersections'>('logs');

  // Hardcoded dashboard user database (just for mock administration)
  const [mockDbUsers, setMockDbUsers] = useState([
    { id: '1', name: 'Chief Administrator', email: 'admin@traffic.gov', role: 'Administrator', badge: 'AD-001' },
    { id: '2', name: 'Officer John Smith', email: 'officer@traffic.gov', role: 'Traffic Officer', badge: 'TO-482' },
    { id: '3', name: 'Citizen Jane Doe', email: 'citizen@traffic.gov', role: 'Citizen', badge: '-' }
  ]);

  const handleUpdateRole = (id: string, role: string) => {
    setMockDbUsers(prev => prev.map(u => {
      if (u.id === id) {
        return { ...u, role };
      }
      return u;
    }));
  };

  const getLogColor = (type: string) => {
    if (type === 'error') return 'border-l-rose-500 bg-rose-500/5 text-rose-300';
    if (type === 'warning') return 'border-l-amber-500 bg-amber-500/5 text-amber-300';
    if (type === 'success') return 'border-l-emerald-500 bg-emerald-500/5 text-emerald-300';
    return 'border-l-blue-500 bg-blue-500/5 text-blue-300';
  };

  return (
    <div className="space-y-6">
      
      {/* Sub Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Administrator Operations Console</h2>
          <p className="text-xs text-slate-500 mt-1">Application parameters, user privileges configuration and auditable system logging timelines.</p>
        </div>

        <div className="flex space-x-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800 shrink-0 text-xs font-semibold">
          <button
            onClick={() => setAdminTab('logs')}
            className={`py-1.5 px-3 rounded-md transition-all cursor-pointer ${adminTab === 'logs' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Auditable Logs ({logs.length})
          </button>
          
          <button
            onClick={() => setAdminTab('users')}
            className={`py-1.5 px-3 rounded-md transition-all cursor-pointer ${adminTab === 'users' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            User Roles ({mockDbUsers.length})
          </button>

          <button
            onClick={() => setAdminTab('intersections')}
            className={`py-1.5 px-3 rounded-md transition-all cursor-pointer ${adminTab === 'intersections' ? 'bg-blue-650 bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Map Intersections ({intersections.length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">

        {/* Tab 1: System Activity Logs */}
        {adminTab === 'logs' && (
          <GlassCard>
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center">
              <Shield className="h-4.5 w-4.5 mr-2 text-rose-400" />
              Auditable System Activity Logs
            </h3>

            {logs.length > 0 ? (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {logs.map(log => (
                  <div 
                    key={log.id} 
                    className={`p-3 border-l-4 rounded-lg flex items-center justify-between text-xs font-medium ${getLogColor(log.type)}`}
                  >
                    <div className="min-w-0 pr-4">
                      <span className="font-semibold block">{log.message}</span>
                      <span className="text-[10px] text-slate-500 mt-1 block font-mono">
                        Thread ID: {log.id} • {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <span className="text-[9px] uppercase font-bold text-slate-500 shrink-0">
                      Acked
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs">
                No activity logs recorded. Live stream connected pending simulator cycles.
              </div>
            )}
          </GlassCard>
        )}

        {/* Tab 2: User management */}
        {adminTab === 'users' && (
          <GlassCard>
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center">
              <Users className="h-4.5 w-4.5 mr-2 text-blue-400" />
              Role Privilege Matrix
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-400">
                <thead className="bg-[#101828] border-b border-slate-800 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  <tr>
                    <th className="p-3">User name</th>
                    <th className="p-3">Email address</th>
                    <th className="p-3">Credentials Role</th>
                    <th className="p-3">Badge Number</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {mockDbUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-900/30">
                      <td className="p-3 text-white font-bold">{u.name}</td>
                      <td className="p-3">{u.email}</td>
                      <td className="p-3">
                        <select
                          value={u.role}
                          onChange={e => handleUpdateRole(u.id, e.target.value)}
                          className="bg-slate-950 p-1 border border-slate-800 rounded text-slate-300"
                        >
                          <option value="Administrator">Administrator</option>
                          <option value="Traffic Officer">Traffic Officer</option>
                          <option value="Citizen">Citizen</option>
                        </select>
                      </td>
                      <td className="p-3 font-mono">{u.badge}</td>
                      <td className="p-3 text-right">
                        <button 
                          onClick={() => setMockDbUsers(prev => prev.filter(x => x.id !== u.id))}
                          className="p-1 text-rose-400 hover:text-rose-300 font-bold bg-slate-900 border border-slate-850 rounded hover:border-slate-700 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}

        {/* Tab 3: Intersections list parameters config */}
        {adminTab === 'intersections' && (
          <GlassCard>
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center">
              <Settings className="h-4.5 w-4.5 mr-2 text-indigo-400" />
              GIS Node Configurations
            </h3>

            <div className="space-y-4">
              {intersections.map(int => (
                <div key={int._id} className="p-4 bg-slate-950 border border-slate-900 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <h4 className="font-bold text-white leading-tight">{int.name}</h4>
                    <p className="text-[10px] text-slate-500 mt-1">Coordinates: {int.lat.toFixed(4)}, {int.lng.toFixed(4)}</p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button className="px-3 py-1.5 bg-slate-900 border border-slate-850 hover:border-slate-750 text-slate-300 font-semibold rounded cursor-pointer">
                      Edit Coordinates / Lanes
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

      </div>

    </div>
  );
};
