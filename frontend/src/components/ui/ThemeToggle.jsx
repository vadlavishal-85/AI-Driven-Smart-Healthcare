import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import './ThemeToggle.css';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const nextMode = theme === 'dark' ? 'White' : 'Dark';
  const Icon = theme === 'dark' ? Sun : Moon;

  return (
    <button
      type="button"
      className="sh-theme-toggle"
      onClick={toggleTheme}
      aria-pressed={theme === 'light'}
      aria-label={`Switch to ${nextMode.toLowerCase()} mode`}
      title={`Switch to ${nextMode.toLowerCase()} mode`}
    >
      <Icon size={17} aria-hidden="true" />
      <span>{nextMode} mode</span>
    </button>
  );
}
