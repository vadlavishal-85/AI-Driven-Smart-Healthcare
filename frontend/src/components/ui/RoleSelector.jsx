import React from 'react';
import { Stethoscope, UserCheck, Shield, Check } from 'lucide-react';
import './RoleSelector.css';

const ROLES = [
  {
    id: 'DOCTOR',
    title: 'Doctor',
    subtitle: 'Clinical & Care Provider',
    description: 'Access clinical tools, consults, and patient medical records.',
    icon: Stethoscope,
    badge: 'Clinical Staff',
    theme: 'teal',
  },
  {
    id: 'PATIENT',
    title: 'Patient',
    subtitle: 'Personal Health Portal',
    description: 'Access your personal medical charts, appointments, and care history.',
    icon: UserCheck,
    badge: 'Health Portal',
    theme: 'blue',
  },
  {
    id: 'ADMIN',
    title: 'Administrator',
    subtitle: 'System & Governance',
    description: 'Manage hospital ecosystem, data exchange channels, and access controls.',
    icon: Shield,
    badge: 'Governance',
    theme: 'navy',
  },
];

export default function RoleSelector({ selectedRole, onSelectRole }) {
  return (
    <div className="sh-role-selector-container">
      <div className="sh-role-grid">
        {ROLES.map((role) => {
          const Icon = role.icon;
          const isSelected = selectedRole === role.id;

          return (
            <div
              key={role.id}
              className={`sh-role-card theme-${role.theme} ${isSelected ? 'sh-role-card-selected' : ''}`}
              onClick={() => onSelectRole(role.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectRole(role.id);
                }
              }}
              aria-label={`Select ${role.title} Role`}
            >
              {/* Outer Selection Ring */}
              <div className="sh-role-circle-wrapper">
                <div className="sh-role-circle">
                  <Icon size={38} className="sh-role-icon" />
                  {isSelected && (
                    <div className="sh-role-check-bubble animate-fade-scale">
                      <Check size={14} strokeWidth={3} />
                    </div>
                  )}
                </div>
              </div>

              <div className="sh-role-info">
                <span className="sh-role-badge">{role.badge}</span>
                <h3 className="sh-role-title">{role.title}</h3>
                <p className="sh-role-desc">{role.description}</p>
              </div>

              <div className="sh-role-action-prompt">
                <span>{isSelected ? 'Role Selected' : 'Click to Select'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
