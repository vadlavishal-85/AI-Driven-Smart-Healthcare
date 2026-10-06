import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';
import './NotFound.css';

export default function NotFound() {
  return (
    <div className="notfound-container">
      <div className="notfound-card animate-fade-up">
        <div className="notfound-icon-box">
          <AlertTriangle size={36} className="text-warning" />
        </div>
        <span className="notfound-code">404</span>
        <h1 className="notfound-title">Page Not Found</h1>
        <p className="notfound-desc">
          The healthcare resource or clinical view you requested does not exist or has been moved.
        </p>
        <Link to="/">
          <Button variant="primary" size="md" icon={ArrowLeft}>
            Return to Landing Page
          </Button>
        </Link>
      </div>
    </div>
  );
}
