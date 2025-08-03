import React, { useState, useEffect } from 'react';
import { WalletProvider } from './contexts/WalletContext';
import { ContractProvider } from './contexts/ContractContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Header, Navigation } from './components/Layout';
import ParticipantDashboard from './components/dashboards/ParticipantDashboard';
import CreatorDashboard from './components/dashboards/CreatorDashboard';
import AdminDashboard from './components/dashboards/AdminDashboard';
import OperatorDashboard from './components/dashboards/OperatorDashboard';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('participant');

  // Set dark theme as default
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const renderDashboard = () => {
    switch (activeTab) {
      case 'participant':
        return <ParticipantDashboard />;
      case 'creator':
        return <CreatorDashboard />;
      case 'admin':
        return <AdminDashboard />;
      case 'operator':
        return <OperatorDashboard />;
      default:
        return <ParticipantDashboard />;
    }
  };

  return (
    <ThemeProvider>
      <WalletProvider>
        <ContractProvider>
          <div className="min-h-screen bg-background text-foreground">
            <Header />
            <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
            <main className="min-h-[calc(100vh-8rem)]">
              {renderDashboard()}
            </main>
          </div>
        </ContractProvider>
      </WalletProvider>
    </ThemeProvider>
  );
}

export default App;

