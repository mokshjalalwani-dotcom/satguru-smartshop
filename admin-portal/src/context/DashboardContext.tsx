import React, { createContext, useContext, useState } from 'react';

type Duration = 7 | 30 | 180;
type SystemStatus = 'live' | 'warming' | 'error';

interface DashboardContextType {
  duration: Duration;
  setDuration: (d: Duration) => void;
  status: SystemStatus;
  setStatus: (s: SystemStatus) => void;
  errorMessage: string | null;
  setErrorMessage: (m: string | null) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [duration, setDuration] = useState<Duration>(7);
  const [status, setStatus] = useState<SystemStatus>('live');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  return (
    <DashboardContext.Provider value={{ 
      duration, setDuration, 
      status, setStatus, 
      errorMessage, setErrorMessage 
    }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) throw new Error('useDashboard must be used within DashboardProvider');
  return context;
};
