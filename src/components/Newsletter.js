import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Newsletter = ({ newsletterId, isPreview = false }) => {
  const [newsletter, setNewsletter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [readingTime, setReadingTime] = useState(0);
  const [readingProgress, setReadingProgress] = useState(0);
  const [activeSection, setActiveSection] = useState(null);

  // Mock newsletter data
  const mockNewsletter = {
    id: 'piper-dispatch-001',
    title: 'Strategic Intelligence Weekly',
    subtitle: 'Market Dynamics & Geopolitical Insights',
    date: new Date().toISOString(),
    edition: '#001',
    readTime: '12 min read',
    author: {
      name: 'Strategic Intelligence Team',
      avatar: '🎯',
      bio: 'Curated insights for strategic professionals'
    },
    sections: [
      {
        id: 'executive-summary',
        title: 'Executive Summary',
        icon: '📊',
        content: `
          This week's intelligence briefing covers critical developments in global markets,
          emerging geopolitical tensions, and strategic opportunities for forward-thinking
          organizations. Key themes include supply chain resilience, digital transformation
          acceleration, and regulatory landscape shifts.
        `,
        priority: 'high'
      },
      {
        id: 'market-intelligence',
        title: 'Market Intelligence',
        icon: '📈',
        content: `
          **Technology Sector Dynamics**
          - AI infrastructure investments surge 340% YoY
          - Quantum computing breakthroughs accelerate timeline
          - Cybersecurity spending reaches $200B globally
          
          **Energy Transition Updates**
          - Renewable energy capacity additions hit record highs
          - Critical mineral supply chains face disruption
          - Green hydrogen projects gain momentum
          
          **Financial Markets Overview**
          - Central bank policy divergence creates volatility
          - ESG investment flows show resilience
          - Cryptocurrency regulation frameworks emerge
        `,
        priority: 'high'
      },
      {
        id: 'geopolitical-analysis',
        title: 'Geopolitical Analysis',
        icon: '🌍',
        content: `
          **Regional Developments**
          - Trade relationship recalibrations continue
          - Strategic alliance formations accelerate
          - Resource competition intensifies
          
          **Policy Implications**
          - Technology export controls expand
          - Climate diplomacy gains prominence
          - Economic security measures proliferate
          
          **Risk Assessment**
          - Supply chain vulnerabilities persist
          - Cyber threat landscape evolves
          - Regulatory compliance complexity increases
        `,
        priority: 'medium'
      },
      {
        id: 'strategic-opportunities',
        title: 'Strategic Opportunities',
        icon: '🎯',
        content: `
          **Emerging Markets**
          - Southeast Asia digital economy expansion
          - African renewable energy infrastructure
          - Latin American fintech innovation
          
          **Technology Convergence**
          - AI-IoT integration opportunities
          - Blockchain infrastructure development
          - Edge computing deployment acceleration
          
          **Sustainability Focus**
          - Circular economy business models
          - Carbon credit market evolution
          - Green finance instrument innovation
        `,
        priority: 'medium'
      },
      {
        id: 'actionable-insights',
        title: 'Actionable Insights',
        icon: '⚡',
        content: `
          **Immediate Actions**
          1. Assess supply chain resilience across critical components
          2. Evaluate cybersecurity posture against emerging threats
          3. Review ESG strategy alignment with investor expectations
          
          **Medium-term Considerations**
          - Develop scenario planning for geopolitical shifts
          - Invest in digital transformation capabilities
          - Build strategic partnerships in key markets
          
          **Long-term Strategic Planning**
          - Position for energy transition opportunities
          - Prepare for regulatory landscape evolution
          - Cultivate innovation ecosystem relationships
        `,
        priority: 'high'
      }
    ],
    metrics: {
      views: 15420,
      shares: 892,
      engagement: 94.2
    },
    tags: ['Strategy', 'Intelligence', 'Markets', 'Geopolitics', 'Technology']
  };

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setNewsletter(mockNewsletter);
      setLoading(false);
      calculateReadingTime(mockNewsletter);
    }, 1000);

    return () => clearTimeout(timer);
  }, [newsletterId]);

  useEffect(() => {
    // Track reading progress
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setReadingProgress(Math.min(progress, 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const calculateReadingTime = (newsletter) => {
    const wordsPerMinute = 200;
    const totalWords = newsletter.sections.reduce((total, section) => {
      return total + section.content.split(' ').length;
    }, 0);
    setReadingTime(Math.ceil(totalWords / wordsPerMinute));
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  const formatContent = (content) => {
    return content.split('\n').map((paragraph, index) => {
      if (paragraph.trim() === '') return null;
      
      if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
        return (
          <h4 key={index} className="content-subheading">
            {paragraph.replace(/\*\*/g, '')}
          </h4>
        );
      }
      
      if (paragraph.trim().startsWith('-')) {
        return (
          <li key={index} className="content-list-item">
            {paragraph.replace(/^\s*-\s*/, '')}
          </li>
        );
      }
      
      if (paragraph.match(/^\d+\./)) {
        return (
          <li key={index} className="content-numbered-item">
            {paragraph.replace(/^\d+\.\s*/, '')}
          </li>
        );
      }
      
      return (
        <p key={index} className="content-paragraph">
          {paragraph.trim()}
        </p>
      );
    }).filter(Boolean);
  };

  if (loading) {
    return (
      <div className="newsletter-loading">
        <motion.div 
          className="loading-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          📰
        </motion.div>
        <p>Loading newsletter...</p>
      </div>
    );
  }

  if (!newsletter) {
    return (
      <div className="newsletter-error">
        <h2>Newsletter not found</h2>
        <p>The requested newsletter could not be loaded.</p>
      </div>
    );
  }

  return (
    <div className="newsletter-container">
      {/* Reading Progress Bar */}
      <motion.div 
        className="reading-progress"
        style={{ scaleX: readingProgress / 100 }}
        initial={{ scaleX: 0 }}
      />

      {/* Newsletter Header */}
      <motion.header 
        className="newsletter-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="header-content">
          <div className="newsletter-meta">
            <span className="edition">{newsletter.edition}</span>
            <span className="date">
              {new Date(newsletter.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
            <span className="read-time">{readingTime} min read</span>
          </div>
          
          <h1 className="newsletter-title">{newsletter.title}</h1>
          <p className="newsletter-subtitle">{newsletter.subtitle}</p>
          
          <div className="author-info">
            <span className="author-avatar">{newsletter.author.avatar}</span>
            <div className="author-details">
              <span className="author-name">{newsletter.author.name}</span>
              <span className="author-bio">{newsletter.author.bio}</span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Table of Contents */}
      <motion.nav 
        className="table-of-contents"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <h3>Contents</h3>
        <ul>
          {newsletter.sections.map((section, index) => (
            <motion.li 
              key={section.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
            >
              <button
                onClick={() => scrollToSection(section.id)}
                className={`toc-link ${activeSection === section.id ? 'active' : ''}`}
              >
                <span className="section-icon">{section.icon}</span>
                <span className="section-title">{section.title}</span>
                <span className={`priority-indicator priority-${section.priority}`}>
                  {section.priority === 'high' ? '🔥' : '📌'}
                </span>
              </button>
            </motion.li>
          ))}
        </ul>
      </motion.nav>

      {/* Newsletter Content */}
      <main className="newsletter-content">
        <AnimatePresence>
          {newsletter.sections.map((section, index) => (
            <motion.section 
              key={section.id}
              id={section.id}
              className="content-section"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
            >
              <div className="section-header">
                <span className="section-icon">{section.icon}</span>
                <h2 className="section-title">{section.title}</h2>
                <span className={`priority-badge priority-${section.priority}`}>
                  {section.priority}
                </span>
              </div>
              
              <div className="section-content">
                {formatContent(section.content)}
              </div>
            </motion.section>
          ))}
        </AnimatePresence>
      </main>

      {/* Newsletter Footer */}
      <motion.footer 
        className="newsletter-footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <div className="newsletter-metrics">
          <div className="metric">
            <span className="metric-value">{newsletter.metrics.views.toLocaleString()}</span>
            <span className="metric-label">Views</span>
          </div>
          <div className="metric">
            <span className="metric-value">{newsletter.metrics.shares}</span>
            <span className="metric-label">Shares</span>
          </div>
          <div className="metric">
            <span className="metric-value">{newsletter.metrics.engagement}%</span>
            <span className="metric-label">Engagement</span>
          </div>
        </div>
        
        <div className="newsletter-tags">
          {newsletter.tags.map((tag) => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      </motion.footer>

      {/* Newsletter Styles */}
      <style jsx>{`
        .newsletter-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-family: 'Georgia', serif;
          line-height: 1.6;
          color: #2d3748;
        }

        .reading-progress {
          position: fixed;
          top: 0;
          left: 0;
          height: 3px;
          background: linear-gradient(90deg, #667eea, #764ba2);
          transform-origin: left;
          z-index: 1000;
          width: 100%;
        }

        .newsletter-header {
          text-align: center;
          margin-bottom: 40px;
          padding: 40px 0;
          border-bottom: 2px solid #e2e8f0;
        }

        .newsletter-meta {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-bottom: 20px;
          font-size: 14px;
          color: #718096;
        }

        .edition {
          background: #667eea;
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-weight: 600;
        }

        .newsletter-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 20px 0 10px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .newsletter-subtitle {
          font-size: 1.2rem;
          color: #4a5568;
          margin-bottom: 30px;
        }

        .author-info {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .author-avatar {
          font-size: 24px;
        }

        .author-details {
          display: flex;
          flex-direction: column;
          text-align: left;
        }

        .author-name {
          font-weight: 600;
          color: #2d3748;
        }

        .author-bio {
          font-size: 14px;
          color: #718096;
        }

        .table-of-contents {
          background: #f7fafc;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 40px;
        }

        .table-of-contents h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 600;
        }

        .table-of-contents ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .table-of-contents li {
          margin-bottom: 8px;
        }

        .toc-link {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 12px 16px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .toc-link:hover,
        .toc-link.active {
          background: #667eea;
          color: white;
          transform: translateX(4px);
        }

        .section-icon {
          font-size: 18px;
        }

        .section-title {
          flex: 1;
          font-weight: 500;
        }

        .priority-indicator {
          font-size: 14px;
        }

        .content-section {
          margin-bottom: 50px;
          padding: 30px 0;
          border-bottom: 1px solid #e2e8f0;
        }

        .content-section:last-child {
          border-bottom: none;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }

        .section-header .section-title {
          font-size: 1.8rem;
          font-weight: 600;
          color: #2d3748;
          margin: 0;
        }

        .priority-badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .priority-high {
          background: #fed7d7;
          color: #c53030;
        }

        .priority-medium {
          background: #feebc8;
          color: #dd6b20;
        }

        .section-content {
          font-size: 16px;
          line-height: 1.8;
        }

        .content-subheading {
          font-size: 1.2rem;
          font-weight: 600;
          color: #4a5568;
          margin: 24px 0 12px;
        }

        .content-paragraph {
          margin-bottom: 16px;
        }

        .content-list-item,
        .content-numbered-item {
          margin-bottom: 8px;
          padding-left: 8px;
        }

        .newsletter-footer {
          margin-top: 60px;
          padding: 30px 0;
          border-top: 2px solid #e2e8f0;
          text-align: center;
        }

        .newsletter-metrics {
          display: flex;
          justify-content: center;
          gap: 40px;
          margin-bottom: 24px;
        }

        .metric {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .metric-value {
          font-size: 24px;
          font-weight: 700;
          color: #667eea;
        }

        .metric-label {
          font-size: 14px;
          color: #718096;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .newsletter-tags {
          display: flex;
          justify-content: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .tag {
          background: #e2e8f0;
          color: #4a5568;
          padding: 6px 12px;
          border-radius: 16px;
          font-size: 14px;
          font-weight: 500;
        }

        .newsletter-loading,
        .newsletter-error {
          text-align: center;
          padding: 60px 20px;
        }

        .loading-spinner {
          font-size: 48px;
          margin-bottom: 20px;
        }

        @media (max-width: 768px) {
          .newsletter-container {
            padding: 15px;
          }

          .newsletter-title {
            font-size: 2rem;
          }

          .newsletter-meta {
            flex-direction: column;
            gap: 8px;
          }

          .newsletter-metrics {
            flex-direction: column;
            gap: 20px;
          }

          .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default Newsletter;