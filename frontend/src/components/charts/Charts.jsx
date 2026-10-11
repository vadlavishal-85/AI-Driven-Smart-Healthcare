import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const AppointmentTrendChart = ({ trendData = [] }) => {
  const labels = trendData.length > 0 ? trendData.map((d) => d.month) : ['2026-08', '2026-09', '2026-10'];
  const dataCounts = trendData.length > 0 ? trendData.map((d) => d.count) : [0, 0, 0];

  const data = {
    labels,
    datasets: [
      {
        label: 'Monthly Appointments',
        data: dataCounts,
        borderColor: '#0284c7',
        backgroundColor: 'rgba(2, 132, 199, 0.12)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#0284c7',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 13 },
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#f1f5f9' },
        ticks: { color: '#64748b', font: { size: 12 }, precision: 0 },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', font: { size: 12 } },
      },
    },
  };

  return (
    <div style={{ height: '260px', width: '100%' }}>
      <Line data={data} options={options} />
    </div>
  );
};

export const UserRoleDistributionChart = ({ usersData }) => {
  const data = {
    labels: ['Doctors', 'Patients', 'Admins', 'Labs'],
    datasets: [
      {
        data: [
          usersData?.doctors || 0,
          usersData?.patients || 0,
          usersData?.admins || 0,
          usersData?.labs || 0,
        ],
        backgroundColor: ['#0284c7', '#0d9488', '#9333ea', '#f59e0b'],
        borderWidth: 2,
        borderColor: '#ffffff',
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 16,
          color: '#475569',
          font: { size: 12, weight: '600' },
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
    },
    cutout: '70%',
  };

  return (
    <div style={{ height: '260px', width: '100%' }}>
      <Doughnut data={data} options={options} />
    </div>
  );
};

export const DocumentDistributionChart = ({ docsData }) => {
  const data = {
    labels: ['Medical Records', 'Prescriptions', 'Doctor Notes', 'Lab Reports'],
    datasets: [
      {
        label: 'Documents Count',
        data: [
          docsData?.medical_records || 0,
          docsData?.prescriptions || 0,
          docsData?.doctor_notes || 0,
          docsData?.lab_reports || 0,
        ],
        backgroundColor: ['#38bdf8', '#2dd4bf', '#a78bfa', '#fbbf24'],
        borderRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#f1f5f9' },
        ticks: { color: '#64748b', precision: 0 },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', font: { size: 12 } },
      },
    },
  };

  return (
    <div style={{ height: '260px', width: '100%' }}>
      <Bar data={data} options={options} />
    </div>
  );
};
