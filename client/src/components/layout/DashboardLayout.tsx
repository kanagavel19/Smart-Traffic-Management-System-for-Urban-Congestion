import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTrafficData } from '../../context/TrafficDataContext';
import { 
  BarChart2, 
  Map, 
  Tv, 
  Sliders, 
  AlertOctagon, 
  FileText, 
  CloudSun,
  Shield,
  LogOut,
  User,
  Radio
} from 'lucide-react';

interface DashboardLayoutProps {
  currentTab: string;
  setTab: (tab: string) => void;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ currentTab, setTab, children }) => {
  const { user, logout, switchRole } = useAuth();
  const { isLiveConnected } = useTrafficData();

  const menuItems = [
    { id: 'map', label: 'GIS City Map', icon: <Map className="h-4.5 w-4.5" />, roles: ['Administrator', 'Traffic Officer', 'Citizen'] },
    { id: 'signals', label: 'Adaptive Signals', icon: <Sliders className="h-4.5 w-4.5" />, roles: ['Administrator', 'Traffic Officer'] },
    { id: 'emergency', label: 'Emergency Corridor', icon: <Shield className="h-4.5 w-4.5" />, roles: ['Administrator', 'Traffic Officer'] },
    { id: 'cctv', label: 'CCTV AI Detection', icon: <Tv className="h-4.5 w-4.5" />, roles: ['Administrator', 'Traffic Officer'] },
    { id: 'citizen', label: 'Citizen Portal', icon: <AlertOctagon className="h-4.5 w-4.5" />, roles: ['Administrator', 'Traffic Officer', 'Citizen'] },
    { id: 'weather', label: 'Weather Radar', icon: <CloudSun className="h-4.5 w-4.5" />, roles: ['Administrator', 'Traffic Officer', 'Citizen'] },
    { id: 'analytics', label: 'Deep Analytics', icon: <BarChart2 className="h-4.5 w-4.5" />, roles: ['Administrator', 'Traffic Officer'] },
    { id: 'admin', label: 'Admin Panels', icon: <FileText className="h-4.5 w-4.5" />, roles: ['Administrator'] }
  ];

  const visibleMenu = menuItems.filter(item => item.roles.includes(user?.role || 'Citizen'));

  return (
    <div className="min-h-screen flex bg-[#0c111d] text-slate-100 font-sans">
      
      {/* 1. LEFT SIDEBAR */}
      <aside className="w-64 bg-[#101828] border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand */}
          <div className="h-16 flex items-center px-6 border-b border-slate-800 space-x-3 bg-slate-950/20">
            <span className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              METROPULSE
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-3 mb-2 block">Control Grid</span>
            {visibleMenu.map((item) => {
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                    active 
                      ? 'bg-blue-600/10 text-blue-400 border border-blue-500/25 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Info & Switcher */}
        <div className="p-4 border-t border-slate-800 space-y-4 bg-slate-950/20">
          <div className="flex items-center space-x-3 px-2">
            <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 shrink-0">
              <User className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-white truncate">{user?.name}</h4>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block bg-slate-900 border border-slate-800 py-0.5 px-2 rounded-full inline-block mt-1">
                {user?.role}
              </span>
            </div>
          </div>

          {/* Tester Role Quick Switcher */}
          <div className="p-2.5 rounded-lg bg-slate-950/45 border border-slate-900">
            <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest block text-center mb-2">
              Dev Role Override
            </span>
            <div className="flex gap-1 justify-between">
              {(['Administrator', 'Traffic Officer', 'Citizen'] as const).map((r) => {
                const isCurrent = user?.role === r;
                let colorClass = 'border-slate-800 text-slate-400 bg-transparent';
                if (isCurrent) {
                  if (r === 'Administrator') colorClass = 'border-blue-500 text-blue-400 bg-blue-500/5';
                  if (r === 'Traffic Officer') colorClass = 'border-amber-500 text-amber-400 bg-amber-500/5';
                  if (r === 'Citizen') colorClass = 'border-emerald-500 text-emerald-400 bg-emerald-500/5';
                }
                return (
                  <button
                    key={r}
                    onClick={() => {
                      switchRole(r);
                      // Reset default view depending on permissions
                      if (r === 'Citizen' && !['map', 'citizen', 'weather'].includes(currentTab)) {
                        setTab('map');
                      }
                      if (r === 'Traffic Officer' && currentTab === 'admin') {
                        setTab('map');
                      }
                    }}
                    className={`text-[8px] py-1 px-1.5 border rounded font-black uppercase tracking-wider cursor-pointer transition-all hover:scale-105 ${colorClass}`}
                    title={`Switch Role to ${r}`}
                  >
                    {r === 'Administrator' ? 'Admin' : r === 'Traffic Officer' ? 'TO' : 'Cit'}
                  </button>
                );
              })}
            </div>
          </div>

          <button 
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 py-2.5 border border-slate-800 hover:border-slate-700 bg-transparent hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout Portal</span>
          </button>
        </div>
      </aside>

      {/* 2. RIGHT CONTENT PAGE container */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top telemetry status bar */}
        <header className="h-16 bg-[#101828] border-b border-slate-800 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-semibold text-slate-300">Intelligent Transportation Command Hub</span>
            
            {/* Live Socket Status node */}
            <div className="flex items-center space-x-2 bg-slate-950/40 border border-slate-800 py-1 px-2.5 rounded-full">
              <Radio className={`h-3.5 w-3.5 animate-pulse ${isLiveConnected ? 'text-emerald-400' : 'text-amber-500'}`} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {isLiveConnected ? 'Socket Live Grid Connected' : 'Local Sandbox Mode Active'}
              </span>
            </div>
          </div>

          {/* Quick Stats overview widgets ticker */}
          <div className="flex items-center space-x-6 text-xs text-slate-400">
            <span className="font-semibold">Weather Impact: <b className="text-sky-400 font-bold">1.2x</b></span>
            <span className="h-4 w-px bg-slate-800" />
            <span className="font-semibold">Security Level: <b className="text-emerald-400 font-bold">SSL Secure</b></span>
          </div>
        </header>

        {/* Dynamic tabs render wrapper */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          {children}
        </main>
      </div>

    </div>
  );
};
