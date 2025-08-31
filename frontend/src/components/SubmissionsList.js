import React, { useState, useMemo } from 'react';
import './SubmissionsList.css';
import { Search, Filter, RefreshCw, Eye, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const SubmissionsList = ({ submissions, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const filteredAndSortedSubmissions = useMemo(() => {
    let filtered = submissions.filter(submission => {
      const matchesSearch = submission.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           submission.riskCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           submission.type.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = filterCategory === 'all' || submission.riskCategory === filterCategory;
      
      return matchesSearch && matchesCategory;
    });

    // Sort submissions
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'riskScore':
          aValue = a.riskScore;
          bValue = b.riskScore;
          break;
        case 'timestamp':
          aValue = new Date(a.timestamp?.toDate?.() || a.timestamp);
          bValue = new Date(b.timestamp?.toDate?.() || b.timestamp);
          break;
        case 'text':
          aValue = a.text.toLowerCase();
          bValue = b.text.toLowerCase();
          break;
        default:
          aValue = a[sortBy];
          bValue = b[sortBy];
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [submissions, searchTerm, filterCategory, sortBy, sortOrder]);

  const getRiskIcon = (riskCategory) => {
    switch (riskCategory) {
      case 'scam': return <AlertTriangle size={20} color="#ef4444" />;
      case 'suspicious': return <Clock size={20} color="#f59e0b" />;
      case 'safe': return <CheckCircle size={20} color="#10b981" />;
      default: return null;
    }
  };

  const getRiskColor = (riskCategory) => {
    switch (riskCategory) {
      case 'scam': return '#ef4444';
      case 'suspicious': return '#f59e0b';
      case 'safe': return '#10b981';
      default: return '#6b7280';
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    let date;
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      // Firebase Timestamp
      date = timestamp.toDate();
    } else if (timestamp._seconds) {
      // Firebase Timestamp object
      date = new Date(timestamp._seconds * 1000);
    } else if (timestamp instanceof Date) {
      // Regular Date object
      date = timestamp;
    } else {
      // String or number
      date = new Date(timestamp);
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    return date.toLocaleString();
  };

  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getCategoryStats = () => {
    const stats = {
      total: submissions.length,
      safe: submissions.filter(s => s.riskCategory === 'safe').length,
      suspicious: submissions.filter(s => s.riskCategory === 'suspicious').length,
      scam: submissions.filter(s => s.riskCategory === 'scam').length
    };
    
    return stats;
  };

  const stats = getCategoryStats();

  return (
    <div className="submissions-list-container">
      {/* Header with Stats */}
      <div className="list-header">
        <div className="header-content">
          <h2>Submission History</h2>
          <p>View and analyze all submitted content</p>
        </div>
        <button onClick={onRefresh} className="refresh-btn btn-hover">
          <RefreshCw size={20} />
          Refresh
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="stats-cards">
        <div className="stat-card total">
          <h3>Total</h3>
          <p className="stat-number">{stats.total}</p>
        </div>
        <div className="stat-card safe">
          <h3>Safe</h3>
          <p className="stat-number">{stats.safe}</p>
        </div>
        <div className="stat-card suspicious">
          <h3>Suspicious</h3>
          <p className="stat-number">{stats.suspicious}</p>
        </div>
        <div className="stat-card scam">
          <h3>Scam</h3>
          <p className="stat-number">{stats.scam}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-box">
          <Search size={20} color="#6b7280" />
          <input
            type="text"
            placeholder="Search submissions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <label htmlFor="category-filter">Category:</label>
            <select
              id="category-filter"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              <option value="safe">Safe</option>
              <option value="suspicious">Suspicious</option>
              <option value="scam">Scam</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="sort-by">Sort by:</label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="timestamp">Date</option>
              <option value="riskScore">Risk Score</option>
              <option value="text">Content</option>
              <option value="type">Type</option>
            </select>
          </div>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="sort-order-btn"
            title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="results-count">
        Showing {filteredAndSortedSubmissions.length} of {submissions.length} submissions
      </div>

      {/* Submissions List */}
      <div className="submissions-grid">
        {filteredAndSortedSubmissions.length === 0 ? (
          <div className="no-results">
            <p>No submissions match your current filters.</p>
            <p>Try adjusting your search criteria or filters.</p>
          </div>
        ) : (
          filteredAndSortedSubmissions.map(submission => (
            <div key={submission.id} className="submission-card">
              <div className="card-header">
                <div className="risk-indicator">
                  {getRiskIcon(submission.riskCategory)}
                  <span 
                    className="risk-badge"
                    style={{ 
                      color: getRiskColor(submission.riskCategory),
                      backgroundColor: getRiskColor(submission.riskCategory) + '20'
                    }}
                  >
                    {submission.riskCategory.toUpperCase()}
                  </span>
                </div>
                <div className="submission-meta">
                  <span className="submission-type">{submission.type}</span>
                  <span className="submission-time">
                    {formatTimestamp(submission.timestamp)}
                  </span>
                </div>
              </div>

              <div className="card-content">
                <p className="submission-text">
                  {truncateText(submission.text, 150)}
                </p>
                
                <div className="risk-score">
                  <span className="score-label">Risk Score:</span>
                  <span 
                    className="score-value"
                    style={{ color: getRiskColor(submission.riskCategory) }}
                  >
                    {submission.riskScore}/100
                  </span>
                </div>

                {submission.features && (
                  <div className="features-summary">
                    <span className="features-label">Key Features:</span>
                    <div className="features-tags">
                      {Object.entries(submission.features)
                        .filter(([key, value]) => typeof value === 'boolean' && value)
                        .slice(0, 3)
                        .map(([key, value]) => (
                          <span key={key} className="feature-tag">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="card-actions">
                <button 
                  className="view-details-btn"
                  onClick={() => {
                    setSelectedSubmission(submission);
                    setShowDetailsModal(true);
                  }}
                >
                  <Eye size={16} />
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedSubmission && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Submission Details</h3>
              <button 
                className="modal-close-btn"
                onClick={() => setShowDetailsModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="detail-section">
                <h4>Content</h4>
                <p className="full-text">{selectedSubmission.text}</p>
              </div>
              
              <div className="detail-section">
                <h4>Analysis Results</h4>
                <div className="analysis-grid">
                  <div className="analysis-item">
                    <span className="label">Risk Score:</span>
                    <span 
                      className="value risk-score"
                      style={{ color: getRiskColor(selectedSubmission.riskCategory) }}
                    >
                      {selectedSubmission.riskScore}/100
                    </span>
                  </div>
                  <div className="analysis-item">
                    <span className="label">Category:</span>
                    <span 
                      className="value risk-badge"
                      style={{ 
                        color: getRiskColor(selectedSubmission.riskCategory),
                        backgroundColor: getRiskColor(selectedSubmission.riskCategory) + '20'
                      }}
                    >
                      {selectedSubmission.riskCategory.toUpperCase()}
                    </span>
                  </div>
                  <div className="analysis-item">
                    <span className="label">Type:</span>
                    <span className="value">{selectedSubmission.type}</span>
                  </div>
                  <div className="analysis-item">
                    <span className="label">Timestamp:</span>
                    <span className="value">{formatTimestamp(selectedSubmission.timestamp)}</span>
                  </div>
                </div>
              </div>
              
              {selectedSubmission.features && (
                <div className="detail-section">
                  <h4>Detected Features</h4>
                  <div className="features-grid">
                    {Object.entries(selectedSubmission.features).map(([key, value]) => (
                      <div key={key} className={`feature-item ${typeof value === 'boolean' ? (value ? 'detected' : 'not-detected') : ''}`}>
                        <span className="feature-name">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                        <span className="feature-value">
                          {typeof value === 'boolean' ? (value ? '✓' : '✗') : value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedSubmission.similarSubmissions && selectedSubmission.similarSubmissions.length > 0 && (
                <div className="detail-section">
                  <h4>Similar Submissions</h4>
                  <p>This content is similar to {selectedSubmission.similarSubmissions.length} other submission(s).</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionsList;
