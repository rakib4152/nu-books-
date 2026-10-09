import React from 'react';
import { Moon, Sun, Shield, Search, Plus } from 'lucide-react';
import { AVATAR_ADMIN } from '../../lib/database';

interface HeaderProps {
  breadcrumb: string[];
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenCreateBook: () => void;
  searchQuery: string;
  onSearchChange: (val: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  breadcrumb,
  theme,
  onToggleTheme,
  onOpenCreateBook,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <header className="h-16 px-6 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 flex items-center justify-between gap-6 shrink-0 z-10">
      {/* Breadcrumb Trail */}
      <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 min-w-0">
        <span className="font-medium text-neutral-800 dark:text-neutral-200">Admin</span>
        {breadcrumb.map((crumb, idx) => (
          <React.Fragment key={idx}>
            <span className="text-neutral-300 dark:text-neutral-700">/</span>
            <span
              className={`truncate ${
                idx === breadcrumb.length - 1
                  ? 'text-neutral-900 dark:text-neutral-100 font-semibold'
                  : 'hover:text-neutral-700 dark:hover:text-neutral-300'
              }`}
            >
              {crumb}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Action Zone */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Global Search */}
        <div className="relative hidden md:block w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search books, chapters, ISBN..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400"
          />
        </div>

        {/* Quick New Book CTA */}
        <button
          onClick={onOpenCreateBook}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 rounded-md transition-colors whitespace-nowrap shrink-0 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Book</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          title="Toggle light/dark theme"
          className="p-2 rounded-md border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors shrink-0"
        >
          {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-neutral-200 dark:border-neutral-800 shrink-0">
          <img
            src={AVATAR_ADMIN}
            alt="Dr. Arthur Sterling"
            referrerPolicy="no-referrer"
            className="w-7 h-7 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
          />
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 leading-tight">
              Arthur Sterling
            </span>
            <div className="flex items-center gap-1 text-[10px] text-neutral-500 dark:text-neutral-400">
              <Shield className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
              <span>SUPER ADMIN</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
