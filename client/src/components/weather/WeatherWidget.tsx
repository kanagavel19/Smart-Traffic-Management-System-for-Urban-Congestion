import React, { useState } from 'react';
import { useTrafficData } from '../../context/TrafficDataContext';
import { useAuth } from '../../context/AuthContext';
import { GlassCard } from '../common/GlassCard';
import { CloudRain, Sun, CloudFog, CloudLightning, Sliders, AlertTriangle } from 'lucide-react';

export const WeatherWidget: React.FC = () => {
  const { user } = useAuth();
  const { weather, updateWeather } = useTrafficData();
  const [temperature, setTemperature] = useState(25);
  const [condition, setCondition] = useState('Clear');
  const [humidity, setHumidity] = useState(60);
  const [windSpeed, setWindSpeed] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getWeatherIcon = (cond: string) => {
    switch (cond) {
      case 'Rain':
      case 'Heavy Rain':
        return <CloudRain className="h-10 w-10 text-sky-400" />;
      case 'Fog':
        return <CloudFog className="h-10 w-10 text-slate-400" />;
      case 'Storm':
        return <CloudLightning className="h-10 w-10 text-amber-500 animate-bounce" />;
      default:
        return <Sun className="h-10 w-10 text-yellow-400" />;
    }
  };

  const handleWeatherChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateWeather({
        temperature,
        condition,
        humidity,
        windSpeed
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isOperator = user?.role === 'Administrator' || user?.role === 'Traffic Officer';

  return (
    <div className="space-y-6">
      
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Weather Intelligence & Signal Offset</h2>
        <p className="text-xs text-slate-500 mt-1">Real-time roadway coefficient monitoring. Recommends safe buffer offsets under severe visibilities.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Monitor widget */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 border-blue-500/20">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-4">
              <div className="flex items-center space-x-6">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                  {getWeatherIcon(weather.condition)}
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-0.5">Atmospheric state</span>
                  <h3 className="text-4xl font-extrabold text-white">{weather.temperature}°C</h3>
                  <p className="text-sm font-semibold text-slate-300 mt-1">{weather.condition}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center shrink-0">
                <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-900 min-w-[70px]">
                  <span className="text-[9px] text-slate-500 font-bold uppercase block">Rain</span>
                  <span className="text-xs font-bold text-white mt-1 block">{weather.rainfall} mm</span>
                </div>
                <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-900 min-w-[70px]">
                  <span className="text-[9px] text-slate-500 font-bold uppercase block">Visibility</span>
                  <span className="text-xs font-bold text-white mt-1 block">{weather.visibility} km</span>
                </div>
                <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-900 min-w-[70px]">
                  <span className="text-[9px] text-slate-500 font-bold uppercase block font-sans">Wind</span>
                  <span className="text-xs font-bold text-white mt-1 block">{weather.windSpeed} km/h</span>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Impact calculations card */}
          <GlassCard>
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">
              Signal Offset Recommender System
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-900 space-y-1">
                <span className="text-[9px] text-slate-500 font-bold uppercase block">Safety Buffer Multiplier</span>
                <span className="text-lg font-black text-rose-400 block">{weather.congestionMultiplier}x delay penalty</span>
                <p className="text-[9px] text-slate-400 leading-relaxed mt-1">
                  Wet asphalt lowers tire friction coefficients. Minimum travel intervals increased globally to prevent collision slip backlogs.
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-900 space-y-1">
                <span className="text-[9px] text-slate-500 font-bold uppercase block">Adaptive Offset Buffer</span>
                <span className="text-lg font-black text-emerald-400 block">
                  {weather.condition === 'Clear' ? '0s (No offset)' : weather.condition === 'Rain' ? '+5s (Mild offsets)' : '+10s (Heavy offsets)'}
                </span>
                <p className="text-[9px] text-slate-400 leading-relaxed mt-1">
                  AI controller automatically extends green timing intervals for principal avenues to cushion deceleration delays.
                </p>
              </div>

            </div>
          </GlassCard>
        </div>

        {/* Right Officer simulation Controls Drawer */}
        <div className="space-y-6">
          <GlassCard>
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center">
              <Sliders className="h-4.5 w-4.5 mr-2 text-sky-400" />
              Simulate Weather Shifts
            </h3>
            
            {isOperator ? (
              <form onSubmit={handleWeatherChange} className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Condition Preset</label>
                  <select 
                    value={condition}
                    onChange={e => setCondition(e.target.value)}
                    className="w-full mt-1.5 p-2 rounded bg-slate-950 border border-slate-800 text-xs text-white"
                  >
                    <option value="Clear">Clear / Sunny</option>
                    <option value="Rain">Light Rain</option>
                    <option value="Heavy Rain">Torrential Downpour</option>
                    <option value="Fog">Dense Fog (Visibility &lt; 2km)</option>
                    <option value="Storm">Severe Thunderstorm Warning</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Temperature (°C)</label>
                  <input 
                    type="number"
                    value={temperature}
                    onChange={e => setTemperature(Number(e.target.value))}
                    className="w-full mt-1.5 p-2.5 rounded bg-slate-950 border border-slate-800 text-xs text-white"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Humidity (%)</label>
                  <input 
                    type="number"
                    value={humidity}
                    onChange={e => setHumidity(Number(e.target.value))}
                    className="w-full mt-1.5 p-2.5 rounded bg-slate-950 border border-slate-800 text-xs text-white"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Wind Speed (km/h)</label>
                  <input 
                    type="number"
                    value={windSpeed}
                    onChange={e => setWindSpeed(Number(e.target.value))}
                    className="w-full mt-1.5 p-2.5 rounded bg-slate-950 border border-slate-800 text-xs text-white"
                    required
                  />
                </div>

                <div className="p-2.5 bg-slate-950/20 border border-slate-900 text-[10px] text-slate-500 rounded-lg">
                  Submitting weather shifts triggers notifications on officers client timelines.
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-slate-950 font-bold rounded text-xs transition-all cursor-pointer"
                >
                  Apply Weather conditions
                </button>
              </form>
            ) : (
              <div className="p-6 text-center text-slate-500 text-xs flex flex-col items-center">
                <AlertTriangle className="h-8 w-8 mb-2 text-slate-600" />
                <span>Simulate override requires Administrator or Officer access profiles. Use Bypass role switcher below left.</span>
              </div>
            )}
          </GlassCard>
        </div>

      </div>

    </div>
  );
};
