import React, { useState } from 'react';
import { useTrafficData } from '../../context/TrafficDataContext';
import { useAuth } from '../../context/AuthContext';
import { GlassCard } from '../common/GlassCard';
import { AlertCircle, FileText, Send, MessageSquare } from 'lucide-react';

export const CitizenPortal: React.FC = () => {
  const { user } = useAuth();
  const { complaints, fileComplaint, updateComplaintStatus } = useTrafficData();
  const [type, setType] = useState<'Traffic Jam' | 'Road Damage' | 'Flooding' | 'Broken Signal' | 'Illegal Parking' | 'Hazardous Condition'>('Road Damage');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('Lexington Ave & E 42nd St');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  // Operator response state
  const [selectedCompId, setSelectedCompId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [opStatus, setOpStatus] = useState<'Investigating' | 'In Progress' | 'Resolved'>('In Progress');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg(false);

    try {
      const fd = new FormData();
      fd.append('type', type);
      fd.append('description', description);
      fd.append('address', address);
      fd.append('lat', '40.7527'); // Demo coords NYC
      fd.append('lng', '-73.9818');
      
      await fileComplaint(fd);
      
      setDescription('');
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolveGrievance = async (id: string) => {
    if (!notes) return;
    try {
      await updateComplaintStatus(id, opStatus, notes);
      setSelectedCompId(null);
      setNotes('');
    } catch (err) {
      console.error(err);
    }
  };

  const isOperator = user?.role === 'Administrator' || user?.role === 'Traffic Officer';

  return (
    <div className="space-y-6">
      
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Citizen Grievance & Reports Portal</h2>
        <p className="text-xs text-slate-500 mt-1">Submit city hazards, waterlogging incidents or signal malfunctions. Track resolution pipelines.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left submission form (only visible/usable or styled for citizen submit) */}
        <div className="lg:col-span-1 space-y-6">
          <GlassCard>
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center">
              <Send className="mr-2 h-4 w-4 text-emerald-400" />
              File Public Hazard Report
            </h3>
            
            {successMsg && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-semibold text-center">
                ✔ Hazard report submitted successfully for review.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Report Category</label>
                <select 
                  value={type}
                  onChange={e => setType(e.target.value as any)}
                  className="w-full mt-1.5 p-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Road Damage">Road Pothole / Damage</option>
                  <option value="Broken Signal">Malfunctioning signal / crossing</option>
                  <option value="Flooding">Waterlogging / Drainage flood</option>
                  <option value="Traffic Jam">Extreme Traffic backlog blockage</option>
                  <option value="Illegal Parking">Illegal Parking obstruction</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Metropolitan Location / Near Address</label>
                <input 
                  type="text" 
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full mt-1.5 p-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white text-xs focus:outline-none focus:border-blue-500" 
                  placeholder="Address or landmark"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Grievance Description</label>
                <textarea 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                  className="w-full mt-1.5 p-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white text-xs focus:outline-none focus:border-blue-500" 
                  placeholder="Explain the hazard or issue..."
                  required
                />
              </div>

              <div className="p-3 bg-slate-950/60 border border-slate-900 rounded-lg text-[9px] text-slate-400">
                Reports automatically capture demo coordinate indices of Manhattan grid for mapping.
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-xs transition-all cursor-pointer flex items-center justify-center"
              >
                SUBMIT PUBLIC COMPLAINT
              </button>
            </form>
          </GlassCard>
        </div>

        {/* Right timeline and operator review grid */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="h-full flex flex-col">
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center">
              <FileText className="mr-2 h-4 w-4 text-blue-400" />
              Public Grievances Review log
            </h3>
            
            {complaints.length > 0 ? (
              <div className="space-y-4 flex-1 overflow-y-auto max-h-[500px] pr-1">
                {complaints.map(comp => (
                  <div key={comp._id} className="p-4 bg-slate-950 border border-slate-900 rounded-xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold text-white">{comp.type}</span>
                        <p className="text-[10px] text-slate-500 mt-0.5">Submitted by {comp.citizenName} • {new Date(comp.createdAt).toLocaleDateString()}</p>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                        comp.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400' :
                        comp.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400' :
                        comp.status === 'Investigating' ? 'bg-amber-500/10 text-amber-400' : 'bg-purple-500/10 text-purple-400'
                      }`}>
                        {comp.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed bg-[#101828] p-2.5 rounded-lg border border-slate-800">
                      "{comp.description}"
                    </p>

                    {comp.officerNotes && (
                      <div className="p-2.5 bg-blue-500/5 border-l-2 border-blue-500 text-[10px] text-blue-300">
                        <b>Officer Updates:</b> {comp.officerNotes}
                      </div>
                    )}

                    {/* Operator response expand triggers */}
                    {isOperator && comp.status !== 'Resolved' && (
                      <div className="pt-2 border-t border-slate-900">
                        {selectedCompId === comp._id ? (
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <select
                                value={opStatus}
                                onChange={e => setOpStatus(e.target.value as any)}
                                className="p-1.5 bg-slate-900 border border-slate-800 text-[10px] rounded text-white"
                              >
                                <option value="In Progress">Set: In Progress</option>
                                <option value="Investigating">Set: Investigating</option>
                                <option value="Resolved">Set: Resolved</option>
                              </select>
                              <input
                                type="text"
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                className="flex-1 p-1.5 bg-slate-900 border border-slate-800 text-[10px] rounded text-white placeholder-slate-500 focus:outline-none"
                                placeholder="State notes..."
                                required
                              />
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleResolveGrievance(comp._id)}
                                className="px-3 py-1 bg-emerald-500 text-slate-950 font-bold text-[9px] rounded uppercase cursor-pointer"
                              >
                                Submit Response
                              </button>
                              <button
                                onClick={() => setSelectedCompId(null)}
                                className="px-3 py-1 bg-slate-800 text-slate-400 text-[9px] rounded uppercase"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedCompId(comp._id)}
                            className="text-[9px] text-blue-400 font-bold hover:underline uppercase flex items-center cursor-pointer"
                          >
                            <MessageSquare className="mr-1 h-3 w-3" /> Responding updates
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-center items-center text-center p-8 text-slate-500 text-xs">
                <AlertCircle className="h-8 w-8 mb-2 text-slate-600" />
                <span>No complaints are currently logged.</span>
              </div>
            )}
          </GlassCard>
        </div>

      </div>

    </div>
  );
};
