import React, { useState, useEffect } from 'react';
import './App.css';
import SubmissionForm from './components/SubmissionForm';
import NetworkGraph from './components/NetworkGraph';
import SubmissionsList from './components/SubmissionsList';
import Header from './components/Header';
import { Shield, Network, FileText, Activity } from 'lucide-react';
import { getSubmissions, getGraphData } from './firebaseConfig';

function App() {
  const [activeTab, setActiveTab] = useState('submit');
  const [submissions, setSubmissions] = useState([]);
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Fetch initial data
  useEffect(() => {
    fetchSubmissions();
    fetchGraphData();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const submissions = await getSubmissions();
      setSubmissions(submissions);
    } catch (error) {
      console.error('Error fetching submissions from Firebase:', error);
      showToast('Error fetching submissions', 'error');
    }
  };

  const fetchGraphData = async () => {
    try {
      const graphData = await getGraphData();
      setGraphData(graphData);
    } catch (error) {
      console.error('Error fetching graph data from Firebase:', error);
      showToast('Error fetching graph data', 'error');
    }
  };

  const handleSubmissionSuccess = (newSubmission) => {
    // Add new submission to list
    setSubmissions(prev => [newSubmission, ...prev]);
    
    // Refresh graph data to show new connections
    fetchGraphData();
    
    showToast('Submission analyzed successfully!', 'success');
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const tabs = [
    { id: 'submit', label: 'Submit', icon: Shield, description: 'Submit suspicious URLs or messages for analysis' },
    { id: 'graph', label: 'Network', icon: Network, description: 'Visualize scam network connections and patterns' },
    { id: 'submissions', label: 'History', icon: FileText, description: 'View all analyzed submissions and results' },
    { id: 'analytics', label: 'Analytics', icon: Activity, description: 'Risk score statistics and trends' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'submit':
        return (
          <SubmissionForm 
            onSubmissionSuccess={handleSubmissionSuccess}
            onError={(error) => showToast(error, 'error')}
          />
        );
      case 'graph':
        return (
          <NetworkGraph 
            data={graphData}
            onNodeClick={(node) => {
              setActiveTab('submissions');
              // Could implement scroll to specific submission
            }}
          />
        );
      case 'submissions':
        return (
          <SubmissionsList 
            submissions={submissions}
            onRefresh={fetchSubmissions}
          />
        );
      case 'analytics':
        return (
          <div className="analytics-container">
            <h2>Risk Analytics</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Submissions</h3>
                <p className="stat-number">{submissions.length}</p>
              </div>
              <div className="stat-card">
                <h3>High Risk</h3>
                <p className="stat-number risk-high">
                  {submissions.filter(s => s.riskCategory === 'scam').length}
                </p>
              </div>
              <div className="stat-card">
                <h3>Suspicious</h3>
                <p className="stat-number risk-medium">
                  {submissions.filter(s => s.riskCategory === 'suspicious').length}
                </p>
              </div>
              <div className="stat-card">
                <h3>Safe</h3>
                <p className="stat-number risk-low">
                  {submissions.filter(s => s.riskCategory === 'safe').length}
                </p>
              </div>
            </div>
            <div className="risk-distribution">
              <h3>Risk Score Distribution</h3>
              <div className="risk-bars">
                {[0, 20, 40, 60, 80, 100].map((score, index) => {
                  const count = submissions.filter(s => 
                    s.riskScore >= score && s.riskScore < (score + 20)
                  ).length;
                  const maxCount = Math.max(...[0, 20, 40, 60, 80, 100].map(s => 
                    submissions.filter(sub => sub.riskScore >= s && sub.riskScore < (s + 20)).length
                  ));
                  const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                  
                  return (
                    <div key={score} className="risk-bar">
                      <div className="bar-label">{score}-{score + 19}</div>
                      <div className="bar-container">
                        <div 
                          className="bar-fill" 
                          style={{ height: `${height}%` }}
                        ></div>
                      </div>
                      <div className="bar-count">{count}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="App">
      <Header />
      
      <main className="main-content">
        <div className="container">
          {/* Tab Navigation */}
          <nav className="tab-navigation">
            {tabs.map(tab => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <IconComponent size={20} />
                  <span className="tab-label">{tab.label}</span>
                  <span className="tab-description">{tab.description}</span>
                </button>
              );
            })}
          </nav>

          {/* Tab Content */}
          <div className="tab-content fade-in">
            {renderTabContent()}
          </div>
        </div>
      </main>

      {/* Toast Notifications */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default App;
