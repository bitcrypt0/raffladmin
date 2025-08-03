import React, { useState } from 'react';
import { Ticket, Users, Shield, Settings as SettingsIcon, Moon, Sun, Wallet } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { useTheme } from '../contexts/ThemeContext';
import WalletModal from './wallet/WalletModal';

const Header = () => {
  const { connected, address, formatAddress, disconnect } = useWallet();
  const { isDark, toggleTheme } = useTheme();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showConfigPanel, setShowConfigPanel] = useState(false);

  return (
    <>
      <header className="bg-card border-b border-border sticky top-0 z-30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Ticket className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">Raffle Protocol</span>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowConfigPanel(!showConfigPanel)}
                className="flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
              >
                <SettingsIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Configure</span>
              </button>
              
              <button
                onClick={toggleTheme}
                className="p-2 hover:bg-muted rounded-md transition-colors"
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              
              {connected ? (
                <div className="flex items-center gap-2">
                  <div className="px-3 py-2 bg-muted rounded-md text-sm font-medium">
                    {formatAddress(address)}
                  </div>
                  <button
                    onClick={disconnect}
                    className="px-3 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors text-sm"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowWalletModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  <Wallet className="h-4 w-4" />
                  <span>Connect Wallet</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <WalletModal 
        isOpen={showWalletModal} 
        onClose={() => setShowWalletModal(false)} 
      />
      
    </>
  );
};

const Navigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'participant', label: 'Participant Dashboard', icon: Users },
    { id: 'creator', label: 'Creator Dashboard', icon: Ticket },
    { id: 'admin', label: 'Admin Dashboard', icon: Shield },
    { id: 'operator', label: 'Operator Dashboard', icon: SettingsIcon },
  ];

  return (
    <nav className="bg-secondary">
      <div className="container mx-auto px-4">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-transparent hover:bg-muted/50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export { Header, Navigation };

