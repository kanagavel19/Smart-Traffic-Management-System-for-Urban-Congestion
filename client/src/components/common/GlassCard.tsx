import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverGlow?: boolean;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', hoverGlow = false, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`glass-panel rounded-xl p-6 transition-all duration-300 ${
        hoverGlow ? 'hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:border-blue-500/30' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: 'blue' | 'emerald' | 'amber' | 'rose';
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  description, 
  trend,
  color = 'blue'
}) => {
  const colorMap = {
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/25',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/25',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/25'
  };

  return (
    <GlassCard className="flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <span className="text-slate-400 text-sm font-medium">{title}</span>
        <div className={`p-2 border rounded-lg ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
      <div>
        <h3 className="text-3xl font-bold tracking-tight text-white">{value}</h3>
        {trend && (
          <div className="flex items-center mt-2">
            <span className={`text-xs font-semibold mr-2 ${trend.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {trend.value}
            </span>
            <span className="text-xs text-slate-500">vs last hour</span>
          </div>
        )}
        {description && !trend && (
          <p className="text-xs text-slate-500 mt-2">{description}</p>
        )}
      </div>
    </GlassCard>
  );
};
