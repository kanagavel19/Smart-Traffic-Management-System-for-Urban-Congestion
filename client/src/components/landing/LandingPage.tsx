import React, { useState } from 'react';
import { Shield, MapPin, Sliders, AlertTriangle, CloudSun, UserCheck, MessageSquare } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [contactState, setContactState] = useState({ name: '', email: '', message: '', submitted: false });

  const faqs = [
    { q: "How does the AI Adaptive Signal timing work?", a: "High-resolution camera feeds calculate lane density scores (occupancy, speed, count). The algorithm overrides fixed cycles, expanding green phases up to 90s for bottleneck corridors, and contracting clear lanes to minimize delay." },
    { q: "What is an Emergency Green Corridor?", a: "When an ambulance or fire truck is dispatched, GPS route prediction automatically signals safety coordinators downstream, turning upcoming intersections green and locking conflicting cross-traffic to red." },
    { q: "Can citizens report incidents directly?", a: "Yes. Using the Citizen Portal, any user can drop a GPS Pin, select an issues tag (e.g. Broken Signal, Flood, Obstruction), capture an image, and submit. Authorities receive the report instantly on their dashboard." }
  ];

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-950">
      {/* Background Neon Orbs */}
      <div className="absolute top-0 left-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[120px]" />
      <div className="absolute top-1/3 right-1/4 -z-10 h-[600px] w-[600px] rounded-full bg-emerald-500/10 blur-[130px]" />

      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-emerald-400 to-indigo-400">
              METROPULSE
            </span>
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
              AI Smart Grid
            </span>
          </div>
          <button 
            onClick={onStart}
            className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-teal-300 to-lime-300 group-hover:from-teal-300 group-hover:to-lime-300 dark:text-white dark:hover:text-gray-900 focus:ring-4 focus:outline-none focus:ring-lime-800 transition-all duration-300 cursor-pointer"
          >
            <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-[#0F172A] rounded-md group-hover:bg-opacity-0 font-bold">
              Access Control Console
            </span>
          </button>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="mx-auto max-w-7xl px-6 pt-20 pb-16 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-7xl">
          Smart Congestion Control for
          <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-emerald-400 to-teal-400">
            Next-Gen Autonomous Cities
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-3xl text-lg text-slate-400 leading-relaxed">
          METROPULSE is a production-grade Intelligent Transportation System combining real-time camera computer vision feeds, adaptive logic signals, and automatic emergency green corridors to cut wait times by 28%.
        </p>

        <div className="mt-10 flex justify-center space-x-4">
          <button 
            onClick={onStart}
            className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-all text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/30 cursor-pointer"
          >
            Launch System Dashboard
          </button>
          <a
            href="#features" 
            className="px-8 py-4 border border-slate-700 bg-slate-900/40 hover:bg-slate-900 text-slate-300 font-semibold rounded-xl transition-all"
          >
            Explore System Architecture
          </a>
        </div>

        {/* Live Metrics Ticker */}
        <div className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4 max-w-5xl mx-auto">
          {[
            { tag: "Average Delay Reduction", val: "-28.4%" },
            { tag: "Green Corridors Assisted", val: "1,248" },
            { tag: "Active AI CCTV Cameras", val: "542 Nodes" },
            { tag: "AI Decision Sync Speed", val: "220 ms" }
          ].map((stat, idx) => (
            <GlassCard key={idx} className="p-4 border-emerald-500/10 text-center">
              <h4 className="text-3xl font-extrabold text-white">{stat.val}</h4>
              <p className="text-xs font-semibold text-slate-500 mt-2 uppercase">{stat.tag}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* 3. FEATURE HIGHLIGHTS */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-20 border-t border-slate-900">
        <h2 className="text-3xl font-extrabold text-white text-center sm:text-4xl mb-12">
          Enterprise Traffic Management Grid
        </h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: <MapPin className="h-6 w-6 text-blue-400" />, head: "GIS Congestion Maps", desc: "Interactive leaflet mapping rendering live traffic speed profiles, incident alerts, and road closures in custom color polylines." },
            { icon: <Sliders className="h-6 w-6 text-emerald-400" />, head: "AI Adaptive Signals", desc: "Dynamic green phases optimization derived from vehicle density queue ratios, pedestrian requests, and weather status." },
            { icon: <Shield className="h-6 w-6 text-red-400" />, head: "Emergency Green Corridors", desc: "Automatic trajectory clearing modules for dispatched first responders, securing continuous downstream green locks." },
            { icon: <AlertTriangle className="h-6 w-6 text-amber-400" />, head: "AI Bounding Box CCTV", desc: "Digital safety monitoring tracks overspeeding, wrong lane patterns, helmet bypass, red-light runs, and crash detections." },
            { icon: <CloudSun className="h-6 w-6 text-sky-400" />, head: "Weather Analysis", desc: "Real-time weather radar tracks heavy rainfall and fog visibility, recommending offset buffers on active signals." },
            { icon: <UserCheck className="h-6 w-6 text-indigo-400" />, head: "Citizen Portal", desc: "Enables public submission of potholes, damaged signals, or crashes with photo uploads, GPS coordinates and resolution tracking." }
          ].map((feat, idx) => (
            <GlassCard key={idx} hoverGlow={true} className="flex flex-col items-start text-left">
              <div className="mb-4 p-3 rounded-lg bg-slate-900 border border-slate-800">
                {feat.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{feat.head}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feat.desc}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* 4. LIVE INTERACTIVE SIGNAL BOX SIMULATION */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        <GlassCard className="border-blue-500/25 bg-gradient-to-r from-slate-900 to-indigo-950/20 text-left">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-md">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Interactive Proof of Concept</span>
              <h3 className="text-3xl font-extrabold text-white mt-2">AI Adaptive Corridor Simulation</h3>
              <p className="text-slate-400 mt-4 text-sm leading-relaxed">
                Experience how our central server calculates intersection queues. Watch density fluctuations trigger shift changes automatically below inside the active console.
              </p>
            </div>
            
            <div className="w-full max-w-xs p-5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
              <div className="space-y-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Main Junction Core</span>
                <div className="flex items-center space-x-3 bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <div className="h-3 w-3 rounded-full bg-emerald-500 glow-emerald" />
                  <span className="text-xs font-semibold text-emerald-400">Adaptive Green: E-Lane</span>
                </div>
                <div className="flex items-center space-x-3 bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <div className="h-3 w-3 rounded-full bg-emerald-500 glow-emerald" />
                  <span className="text-xs font-semibold text-slate-300">Phase duration: 42s</span>
                </div>
              </div>
              
              <div className="flex flex-col space-y-2 select-none">
                <div className="w-10 h-28 bg-[#1e293b] border border-slate-700 rounded-full py-3 flex flex-col justify-between items-center relative overflow-hidden">
                  <div className="w-6 h-6 rounded-full bg-rose-950 border border-rose-600/30 flex items-center justify-center" />
                  <div className="w-6 h-6 rounded-full bg-yellow-950 border border-yellow-600/30 flex items-center justify-center" />
                  <div className="w-6 h-6 rounded-full bg-emerald-500 glow-emerald flex items-center justify-center" />
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* 5. TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-6 py-20 border-t border-slate-900">
        <h2 className="text-3xl font-extrabold text-white text-center sm:text-4xl mb-12">
          Public Safety Endorsements
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            { quote: "Deploying METROPULSE at the Midtown intersection grid dropped average transit delays by nearly 30% in just two weeks. Adaptive green hallways are a game changer.", author: "Captain Dennis Mitchell", role: "Metropolitan Police Traffic Division" },
            { quote: "Green corridor priorities save lives. Our ambulances now request traffic signal holds from dispatch tablets, clearing NY Chelsea junctions in seconds.", author: "Chief Paramedic Helen Vance", role: "City Emergency Services" },
            { quote: "Reporting potholes and broken signals via the citizen app actually works. Within 24 hours, the repair ticket was resolved and the signal fixed.", author: "Marcus Thorne", role: "Local Citizen Commuter" }
          ].map((t, idx) => (
            <GlassCard key={idx} className="flex flex-col justify-between text-left">
              <p className="text-slate-400 italic text-sm leading-relaxed mb-6">"{t.quote}"</p>
              <div>
                <h4 className="text-sm font-semibold text-white">{t.author}</h4>
                <p className="text-xs text-slate-500 mt-1">{t.role}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* 6. FAQ & Q&A SECION */}
      <section className="mx-auto max-w-4xl px-6 py-20 border-t border-slate-900">
        <h2 className="text-3xl font-extrabold text-white text-center mb-12">
          Frequently Answered Questions
        </h2>
        <div className="space-y-6 text-left">
          {faqs.map((faq, idx) => (
            <GlassCard key={idx}>
              <h3 className="text-lg font-bold text-white mb-2">{faq.q}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* 7. CONTACT US FORM */}
      <section className="mx-auto max-w-xl px-6 py-16 border-t border-slate-900">
        <GlassCard className="text-left">
          <h2 className="text-2xl font-extrabold text-white mb-2 flex items-center">
            <MessageSquare className="mr-3 text-emerald-400" />
            Contact Control Center
          </h2>
          <p className="text-slate-400 text-xs mb-6">Ask custom engineering questions or query server availability.</p>
          
          {contactState.submitted ? (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-sm text-center">
              Message submitted successfully. Our coordinators will reach out shortly.
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setContactState(s => ({ ...s, submitted: true })); }} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={contactState.name}
                  onChange={e => setContactState(s => ({ ...s, name: e.target.value }))}
                  className="w-full mt-1.5 p-3 rounded-lg border border-slate-800 bg-slate-900/60 text-white text-sm focus:outline-none focus:border-emerald-500" 
                  placeholder="Enter name"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={contactState.email}
                  onChange={e => setContactState(s => ({ ...s, email: e.target.value }))}
                  className="w-full mt-1.5 p-3 rounded-lg border border-slate-800 bg-slate-900/60 text-white text-sm focus:outline-none focus:border-emerald-500" 
                  placeholder="Enter email"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400">Message Content</label>
                <textarea 
                  required
                  value={contactState.message}
                  rows={4}
                  onChange={e => setContactState(s => ({ ...s, message: e.target.value }))}
                  className="w-full mt-1.5 p-3 rounded-lg border border-slate-800 bg-slate-900/60 text-white text-sm focus:outline-none focus:border-emerald-500" 
                  placeholder="Ask a question..."
                />
              </div>
              <button 
                type="submit" 
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg transition-all"
              >
                Send Message
              </button>
            </form>
          )}
        </GlassCard>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-slate-600 text-xs">
        <p>© 2026 METROPULSE Inc. Built for Urban Logistics congestion management. All rights reserved.</p>
      </footer>
    </div>
  );
};
