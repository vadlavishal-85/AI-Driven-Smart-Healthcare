import React from 'react';
import {
  UserCheck,
  Stethoscope,
  FileText,
  ArrowLeftRight,
  Activity,
  ShieldCheck,
} from 'lucide-react';
import Badge from './Badge';
import './HealthcareNetwork.css';

export default function HealthcareNetwork() {
  const nodes = [
    {
      id: 'patient',
      title: 'Patient Node',
      subtitle: 'Demographics & Care Portal',
      icon: UserCheck,
      badge: 'MySQL Core',
      theme: 'blue',
      glow: 'glow-blue',
    },
    {
      id: 'doctor',
      title: 'Doctor Node',
      subtitle: 'Clinical Consultation & Diagnostics',
      icon: Stethoscope,
      badge: 'Specialist Portal',
      theme: 'teal',
      glow: 'glow-teal',
    },
    {
      id: 'records',
      title: 'Clinical Records',
      subtitle: 'EMR, SOAP Notes & Diagnostics',
      icon: FileText,
      badge: 'Record Preview',
      theme: 'cyan',
      glow: 'glow-cyan',
    },
    {
      id: 'exchange',
      title: 'Data Exchange',
      subtitle: 'FHIR / HL7 Interoperability Router',
      icon: ArrowLeftRight,
      badge: 'Exchange Broker',
      theme: 'teal',
      glow: 'glow-teal',
    },
    {
      id: 'analytics',
      title: 'Analytics Engine',
      subtitle: 'Telemetry & Clinical Intelligence',
      icon: Activity,
      badge: 'Event Stream',
      theme: 'blue',
      glow: 'glow-blue',
    },
  ];

  return (
    <div className="sh-network-diagram">
      <div className="sh-network-header">
        <div className="sh-network-title-box">
          <Badge variant="secondary" size="sm" dot>
            Distributed Hospital Topology
          </Badge>
          <h3>Connected Healthcare Architecture Network</h3>
          <p>Real-time data flow orchestration between relational entities and clinical document streams.</p>
        </div>
        <div className="sh-network-security-pill desktop-only">
          <ShieldCheck size={16} className="text-success" />
          <span>Cryptographically Governed Multi-Node Network</span>
        </div>
      </div>

      <div className="sh-network-nodes-flow">
        {nodes.map((node, index) => {
          const Icon = node.icon;
          return (
            <React.Fragment key={node.id}>
              {/* Node Card */}
              <div className={`sh-network-node theme-${node.theme}`}>
                <div className="sh-node-icon-wrapper">
                  <Icon size={24} className="sh-node-icon" />
                  <span className="sh-node-status-indicator" />
                </div>
                <div className="sh-node-meta">
                  <span className="sh-node-badge">{node.badge}</span>
                  <h4 className="sh-node-title">{node.title}</h4>
                  <span className="sh-node-subtitle">{node.subtitle}</span>
                </div>
              </div>

              {/* Connecting Pulse Line (Between Nodes) */}
              {index < nodes.length - 1 && (
                <div className="sh-node-connector" aria-hidden="true">
                  <div className="sh-connector-track">
                    <div className="sh-connector-beam" />
                  </div>
                  <ArrowLeftRight size={13} className="sh-connector-icon" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
