import React, { useState } from 'react';
import './SubmissionForm.css';
import { Send, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { saveSubmission, saveNode } from '../firebaseConfig';

const SubmissionForm = ({ onSubmissionSuccess, onError }) => {
  const [text, setText] = useState('');
  const [type, setType] = useState('message');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!text.trim()) {
      onError('Please enter some text to analyze');
      return;
    }

    setIsSubmitting(true);
    setAnalysisResult(null);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text.trim(), type: type }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save to Firebase after successful ML analysis
        try {
          const submissionId = await saveSubmission({
            text: text.trim(),
            type,
            riskScore: data.submission.riskScore,
            riskCategory: data.submission.riskCategory,
            features: data.submission.features,
            similarSubmissions: data.submission.similarSubmissions || []
          });

          // Save node to Firebase
          await saveNode({
            id: submissionId,
            label: data.submission.text.length > 50 ? data.submission.text.substring(0, 50) + '...' : data.submission.text,
            riskScore: data.submission.riskScore,
            riskCategory: data.submission.riskCategory,
            type,
            timestamp: new Date()
          });

          // Note: Edges are now created directly by the backend
          console.log('✅ Data saved to Firebase successfully');
        } catch (firebaseError) {
          console.error('⚠️ Firebase save error (but ML analysis succeeded):', firebaseError);
          // Continue even if Firebase save fails
        }

        setAnalysisResult(data);
        onSubmissionSuccess(data.submission);
        setText('');
      } else {
        onError(data.error || 'Failed to analyze submission');
      }
    } catch (error) {
      console.error('Submission error:', error);
      onError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
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

  const getRiskIcon = (riskCategory) => {
    switch (riskCategory) {
      case 'scam': return <AlertTriangle size={24} color="#ef4444" />;
      case 'suspicious': return <Clock size={24} color="#f59e0b" />;
      case 'safe': return <CheckCircle size={24} color="#10b981" />;
      default: return null;
    }
  };

  return (
    <div className="submission-form-container">
      <div className="form-header">
        <h2>Submit Suspicious Content</h2>
        <p>Enter a suspicious URL or message to analyze for potential scams</p>
      </div>

      <form onSubmit={handleSubmit} className="submission-form">
        <div className="form-group">
          <label htmlFor="type">Content Type</label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="form-select"
          >
            <option value="message">Text Message</option>
            <option value="url">URL/Link</option>
            <option value="email">Email</option>
            <option value="sms">SMS</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="text">Content to Analyze</label>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Enter the ${type} content here...`}
            className="form-textarea"
            rows={6}
            required
          />
          <div className="char-count">
            {text.length} characters
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !text.trim()}
          className="submit-button btn-hover"
        >
          {isSubmitting ? (
            <>
              <div className="spinner"></div>
              Analyzing...
            </>
          ) : (
            <>
              <Send size={20} />
              Analyze Content
            </>
          )}
        </button>
      </form>

      {/* Analysis Result */}
      {analysisResult && (
        <div className="analysis-result scale-in">
          <div className="result-header">
            {getRiskIcon(analysisResult.submission.riskCategory)}
            <h3>Analysis Complete</h3>
          </div>
          
          <div className="result-details">
            <div className="risk-score">
              <span className="score-label">Risk Score:</span>
              <span 
                className="score-value"
                style={{ color: getRiskColor(analysisResult.submission.riskCategory) }}
              >
                {analysisResult.submission.riskScore}/100
              </span>
            </div>
            
            <div className="risk-category">
              <span className="category-label">Classification:</span>
              <span 
                className="category-value"
                style={{ 
                  color: getRiskColor(analysisResult.submission.riskCategory),
                  backgroundColor: getRiskColor(analysisResult.submission.riskCategory) + '20'
                }}
              >
                {analysisResult.submission.riskCategory.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="features-analysis">
            <h4>Detected Features:</h4>
            <div className="features-grid">
              {Object.entries(analysisResult.submission.features).map(([key, value]) => {
                if (typeof value === 'boolean') {
                  return (
                    <div key={key} className={`feature-item ${value ? 'detected' : 'not-detected'}`}>
                      <span className="feature-name">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                      <span className="feature-value">{value ? '✓' : '✗'}</span>
                    </div>
                  );
                } else if (typeof value === 'number') {
                  return (
                    <div key={key} className="feature-item">
                      <span className="feature-name">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                      <span className="feature-value">{value}</span>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>

          {analysisResult.submission.similarSubmissions && analysisResult.submission.similarSubmissions.length > 0 && (
            <div className="similarity-info">
              <h4>Similar Submissions Found:</h4>
              <p>This content is similar to {analysisResult.submission.similarSubmissions.length} other submission(s) in our database.</p>
            </div>
          )}
        </div>
      )}

      {/* Tips Section */}
      <div className="tips-section">
        <h3>What to Look For</h3>
        <div className="tips-grid">
          <div className="tip-card">
            <h4>🚨 High Risk Indicators</h4>
            <ul>
              <li>Urgent action required</li>
              <li>Threats of account suspension</li>
              <li>Requests for personal information</li>
              <li>Unusual payment demands</li>
            </ul>
          </div>
          
          <div className="tip-card">
            <h4>⚠️ Suspicious Patterns</h4>
            <ul>
              <li>Generic greetings</li>
              <li>Poor grammar/spelling</li>
              <li>Unfamiliar sender addresses</li>
              <li>Too-good-to-be-true offers</li>
            </ul>
          </div>
          
          <div className="tip-card">
            <h4>✅ Safe Practices</h4>
            <ul>
              <li>Verify sender identity</li>
              <li>Check official websites</li>
              <li>Don't click suspicious links</li>
              <li>Report suspicious content</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionForm;
