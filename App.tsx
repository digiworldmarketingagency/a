import React, { useState, useEffect } from 'react';
import { Header, Footer } from './components/Layout';
import { store } from './services/store';
import { UserType } from './types';
import Home from './pages/Home';
import About from './pages/About';
import Events from './pages/Events';
import Resources from './pages/Resources';
import Registration from './pages/Registration';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import JobBoard from './pages/JobBoard';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    // Check local storage or mock store for persistent login
    if (store.currentUser) {
      setUser(store.currentUser.type);
    }
  }, []);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleLogin = (userType: UserType) => {
    store.login(userType);
    setUser(userType);
    
    // Redirect logic based on user type
    if (userType === UserType.CANDIDATE) {
        handleNavigate('jobboard');
    } else if (userType === UserType.CORPORATE) {
        handleNavigate('dashboard');
    } else if (userType === UserType.ADMIN) {
        handleNavigate('dashboard');
    } else {
        handleNavigate('home');
    }
  };

  const handleLogout = () => {
    store.logout();
    setUser(null);
    handleNavigate('home');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <Home onNavigate={handleNavigate} />;
      case 'about': return <About />;
      case 'events': return <Events />;
      case 'resources': return <Resources />;
      case 'register-candidate': return <Registration type={UserType.CANDIDATE} onNavigate={handleNavigate} />;
      case 'register-corporate': return <Registration type={UserType.CORPORATE} onNavigate={handleNavigate} />;
      case 'login-candidate': return <Login type={UserType.CANDIDATE} onLogin={() => handleLogin(UserType.CANDIDATE)} />;
      case 'login-corporate': return <Login type={UserType.CORPORATE} onLogin={(isAdmin) => handleLogin(isAdmin ? UserType.ADMIN : UserType.CORPORATE)} />;
      case 'dashboard': return <Dashboard userType={user || UserType.GUEST} />;
      case 'jobboard': return <JobBoard />;
      default: return <Home onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-secondary font-sans text-gray-900">
      <Header user={user} onNavigate={handleNavigate} onLogout={handleLogout} />
      <main className="flex-grow">
        {renderPage()}
      </main>
      <Footer onNavigate={handleNavigate} />
    </div>
  );
};

export default App;