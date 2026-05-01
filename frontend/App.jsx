import React, { useState, useCallback } from 'react';
import ChatAssistant from './components/ChatAssistant';
import LearningJourney from './components/LearningJourney';
import SimulationMode from './components/SimulationMode';
import { Vote, BookOpen, User, PlayCircle } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('learning'); // 'learning' or 'simulation'
  const [role, setRole] = useState('First-Time Voter');

  const handleRoleChange = useCallback((newRole) => {
    setRole(newRole);
  }, []);

  return (
    <div className="app-container">
      {/* Sidebar / Navbar area could go here, but we'll use a top header for mobile first */}
      <header className="app-header glass-panel">
        <div className="logo-container">
          <div className="logo-icon"><Vote size={24} /></div>
          <h1>ElectionVerse</h1>
        </div>
        
        <div className="role-selector">
          <User size={16} aria-hidden="true" />
          <select 
            value={role} 
            onChange={(e) => handleRoleChange(e.target.value)} 
            className="role-dropdown"
            aria-label="Select User Role"
          >
            <option value="First-Time Voter">First-Time Voter</option>
            <option value="Election Officer">Election Officer</option>
            <option value="Candidate">Candidate</option>
          </select>
        </div>
      </header>

      <main className="main-content">
        {/* Left Side: Content Area (Learning or Simulation) */}
        <section className="content-section">
          <div className="tabs glass-panel">
            <button 
              className={`tab-btn ${activeTab === 'learning' ? 'active' : ''}`}
              onClick={() => setActiveTab('learning')}
              aria-pressed={activeTab === 'learning'}
            >
              <BookOpen size={18} aria-hidden="true" /> Learning Journey
            </button>
            <button 
              className={`tab-btn ${activeTab === 'simulation' ? 'active' : ''}`}
              onClick={() => setActiveTab('simulation')}
              aria-pressed={activeTab === 'simulation'}
            >
              <PlayCircle size={18} aria-hidden="true" /> Voting Simulation
            </button>
          </div>

          <div className="scrollable-content fade-in">
            {activeTab === 'learning' ? <LearningJourney role={role} /> : <SimulationMode />}
          </div>
        </section>

        {/* Right Side: AI Assistant */}
        <section className="assistant-section">
          <ChatAssistant role={role} currentTab={activeTab} />
        </section>
      </main>
    </div>
  );
}

export default App;
