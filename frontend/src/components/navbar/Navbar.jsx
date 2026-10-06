import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Menu, X, ArrowRight } from 'lucide-react';
import Button from '../ui/Button';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`landing-navbar ${scrolled ? 'landing-navbar-scrolled' : ''}`}>
      <div className="container landing-navbar-inner">
        {/* Brand */}
        <Link to="/" className="landing-brand">
          <div className="landing-brand-icon">
            <Activity size={22} className="brand-pulse-icon" />
          </div>
          <span className="landing-brand-name">
            Smart<span className="landing-brand-highlight">Healthcare</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="landing-nav-links">
          <a href="#capabilities" className="landing-nav-link">Platform</a>
          <a href="#ecosystem" className="landing-nav-link">Solutions</a>
          <a href="#network" className="landing-nav-link">Network</a>
          <a href="#roles" className="landing-nav-link">Portals</a>
          <Link to="/select-role" className="landing-nav-link">Workspace</Link>
        </nav>

        {/* Desktop Actions */}
        <div className="landing-nav-actions">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/login')}
          >
            Sign In
          </Button>
          <Button
            variant="primary"
            size="sm"
            iconRight={ArrowRight}
            onClick={() => navigate('/register')}
          >
            Get Started
          </Button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          className="landing-mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="landing-mobile-menu">
          <nav className="landing-mobile-links">
            <a
              href="#capabilities"
              className="landing-mobile-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Platform
            </a>
            <a
              href="#ecosystem"
              className="landing-mobile-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Solutions
            </a>
            <a
              href="#network"
              className="landing-mobile-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Network
            </a>
            <a
              href="#roles"
              className="landing-mobile-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Portals
            </a>
            <Link
              to="/select-role"
              className="landing-mobile-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Workspace
            </Link>
          </nav>
          <div className="landing-mobile-actions">
            <Button
              variant="outline"
              fullWidth
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/login');
              }}
            >
              Sign In
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/register');
              }}
            >
              Get Started
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
