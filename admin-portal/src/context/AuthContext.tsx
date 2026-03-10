import React, { createContext, useContext, useState, useEffect } from 'react';

type Role = 'Admin' | 'Executive' | null;

interface AuthContextType {
  user: { name: string; role: Role } | null;
  login: (name: string, role: Role) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ name: string; role: Role } | null>(null);

  useEffect(() => {
    // Session persistence intentionally disabled 
    // to strictly enforce routing to the Login page on the very first load
    // as requested by the user.
    /*
    const savedUser = localStorage.getItem('ss_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    */
  }, []);

  const login = (name: string, role: Role) => {
    const newUser = { name, role };
    setUser(newUser);
    localStorage.setItem('ss_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ss_user');
    // Force browser to the root path so re-login correctly
    // routes Admin → /admin and Executive → /executive
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
