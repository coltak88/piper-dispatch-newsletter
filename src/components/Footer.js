import React from 'react';
import { motion } from 'framer-motion';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Careers', href: '/careers' },
      { name: 'Press', href: '/press' },
      { name: 'Blog', href: '/blog' }
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'Status', href: '/status' },
      { name: 'Community', href: '/community' }
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'GDPR', href: '/gdpr' }
    ],
    social: [
      { name: 'Twitter', href: 'https://twitter.com/piperdispatch', icon: '🐦' },
      { name: 'LinkedIn', href: 'https://linkedin.com/company/piperdispatch', icon: '💼' },
      { name: 'GitHub', href: 'https://github.com/piperdispatch', icon: '🐙' },
      { name: 'RSS', href: '/rss', icon: '📡' }
    ]
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-brand">
            <motion.div 
              className="footer-logo"
              whileHover={{ scale: 1.05 }}
            >
              <h3>Piper Dispatch</h3>
              <p className="footer-tagline">
                Strategic Intelligence for the Modern Professional
              </p>
            </motion.div>
            
            <div className="footer-newsletter">
              <h4>Stay Informed</h4>
              <p>Get the latest insights delivered to your inbox</p>
              <div className="footer-subscribe">
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  className="footer-email-input"
                />
                <motion.button 
                  className="footer-subscribe-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Subscribe
                </motion.button>
              </div>
            </div>
          </div>

          {/* Links Sections */}
          <div className="footer-links">
            <div className="footer-section">
              <h4>Company</h4>
              <ul>
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <motion.a 
                      href={link.href}
                      whileHover={{ x: 4 }}
                    >
                      {link.name}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-section">
              <h4>Support</h4>
              <ul>
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <motion.a 
                      href={link.href}
                      whileHover={{ x: 4 }}
                    >
                      {link.name}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-section">
              <h4>Legal</h4>
              <ul>
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <motion.a 
                      href={link.href}
                      whileHover={{ x: 4 }}
                    >
                      {link.name}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-section">
              <h4>Connect</h4>
              <ul className="footer-social">
                {footerLinks.social.map((link) => (
                  <li key={link.name}>
                    <motion.a 
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1 }}
                      className="footer-social-link"
                    >
                      <span className="social-icon">{link.icon}</span>
                      <span className="social-name">{link.name}</span>
                    </motion.a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <div className="footer-copyright">
              <p>
                © {currentYear} Piper Dispatch. All rights reserved.
              </p>
              <p className="footer-built-with">
                Built with ❤️ for strategic professionals worldwide
              </p>
            </div>
            
            <div className="footer-certifications">
              <div className="certification-badge">
                <span className="badge-icon">🔒</span>
                <span className="badge-text">GDPR Compliant</span>
              </div>
              <div className="certification-badge">
                <span className="badge-icon">🛡️</span>
                <span className="badge-text">SOC 2 Certified</span>
              </div>
              <div className="certification-badge">
                <span className="badge-icon">♿</span>
                <span className="badge-text">WCAG 2.1 AA</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Styles */}
      <style jsx>{`
        .footer {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          color: #e2e8f0;
          margin-top: auto;
        }

        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .footer-content {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 60px;
          padding: 60px 0 40px;
        }

        .footer-brand h3 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .footer-tagline {
          color: #a0aec0;
          font-size: 16px;
          margin-bottom: 32px;
          line-height: 1.5;
        }

        .footer-newsletter h4 {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #f7fafc;
        }

        .footer-newsletter p {
          color: #a0aec0;
          margin-bottom: 16px;
        }

        .footer-subscribe {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
        }

        .footer-email-input {
          flex: 1;
          padding: 12px 16px;
          border: 1px solid #4a5568;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.1);
          color: #f7fafc;
          font-size: 14px;
        }

        .footer-email-input::placeholder {
          color: #a0aec0;
        }

        .footer-subscribe-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .footer-links {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 40px;
        }

        .footer-section h4 {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 16px;
          color: #f7fafc;
        }

        .footer-section ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-section li {
          margin-bottom: 8px;
        }

        .footer-section a {
          color: #a0aec0;
          text-decoration: none;
          font-size: 14px;
          transition: color 0.2s ease;
        }

        .footer-section a:hover {
          color: #667eea;
        }

        .footer-social {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .footer-social-link {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .social-icon {
          font-size: 16px;
        }

        .footer-bottom {
          border-top: 1px solid #4a5568;
          padding: 24px 0;
        }

        .footer-bottom-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }

        .footer-copyright p {
          margin: 0;
          color: #a0aec0;
          font-size: 14px;
        }

        .footer-built-with {
          margin-top: 4px !important;
          font-size: 12px !important;
        }

        .footer-certifications {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .certification-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.1);
          padding: 6px 12px;
          border-radius: 16px;
          font-size: 12px;
        }

        .badge-icon {
          font-size: 14px;
        }

        @media (max-width: 768px) {
          .footer-content {
            grid-template-columns: 1fr;
            gap: 40px;
            padding: 40px 0 30px;
          }

          .footer-links {
            grid-template-columns: repeat(2, 1fr);
            gap: 30px;
          }

          .footer-bottom-content {
            flex-direction: column;
            text-align: center;
          }

          .footer-certifications {
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .footer-links {
            grid-template-columns: 1fr;
          }

          .footer-subscribe {
            flex-direction: column;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;