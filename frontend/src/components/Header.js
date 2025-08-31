import React from 'react';
import './Header.css';
import { Shield, Zap } from 'lucide-react';

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="header-brand">
          <div className="brand-icon">
            <Shield size={32} />
            <Zap size={16} className="brand-accent" />
          </div>
          <div className="brand-text">
            <h1 className="brand-title">ScamGuard</h1>
            <p className="brand-subtitle">Real-time Scam Detection Network</p>
          </div>
        </div>
        
        <div className="header-actions">
          <div className="status-indicator">
            <div className="status-dot active"></div>
            <span className="status-text">Live Detection Active</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
