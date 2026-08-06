import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TrafficDataProvider } from './context/TrafficDataContext';
import { LandingPage } from './components/landing/LandingPage';
import { LoginPage } from './components/auth/LoginPage';
import { DashboardLayout } from './components/layout/DashboardLayout';

// View Imports
import { LiveTrafficMap } from './components/map/LiveTrafficMap';
import { AdaptiveSignalSimulator } from './components/signals/AdaptiveSignalSimulator';
import { GreenCorridorPlanner } from './components/emergency/GreenCorridorPlanner';
import { VideoFeedGrid } from './components/cctv/VideoFeedGrid';
import { CitizenPortal } from './components/citizen/CitizenPortal';
import { WeatherWidget } from './components/weather/WeatherWidget';
import { DeepAnalytics } from './components/analytics/DeepAnalytics';
import { AdminControls } from './components/admin/AdminControls';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  
  // Navigation states: 'landing', 'login', 'dashboard'
  const [navState, setNavState] = useState<'landing' | 'login' | 'dashboard'>(
    user ? 'dashboard' : 'landing'
  );

  // Active dashboard tabs
  const [activeTab, setActiveTab] = useState<string>('map');

  // Monitor auth logins
  React.useEffect(() => {
    if (user) {
      setNavState('dashboard');
    } else {
      setNavState('landing');
    }
  }, [user]);

  // Tab View Dispatcher
  const renderViewContent = () => {
    switch (activeTab) {
      case 'map':
        return <LiveTrafficMap />;
      case 'signals':
        return <AdaptiveSignalSimulator />;
      case 'emergency':
        return <GreenCorridorPlanner />;
      case 'cctv':
        return <VideoFeedGrid />;
      case 'citizen':
        return <CitizenPortal />;
      case 'weather':
        return <WeatherWidget />;
      case 'analytics':
        return <DeepAnalytics />;
      case 'admin':
        return <AdminControls />;
      default:
        return <LiveTrafficMap />;
    }
  };

  if (navState === 'landing') {
    return <LandingPage onStart={() => setNavState('login')} />;
  }

  if (navState === 'login') {
    return <LoginPage onBack={() => setNavState('landing')} />;
  }

  return (
    <DashboardLayout currentTab={activeTab} setTab={setActiveTab}>
      {renderViewContent()}
    </DashboardLayout>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <TrafficDataProvider>
        <AppContent />
      </TrafficDataProvider>
    </AuthProvider>
  );
};

export default App;
