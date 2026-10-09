import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  FolderKanban,
  CalendarDays,
  Cpu,
  KeyRound,
  Smartphone,
  Server,
  Layers,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'subjects'
  | 'years'
  | 'books'
  | 'processing'
  | 'access'
  | 'reader-simulator'
  | 'architecture';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  activeProcessingCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapsed,
  activeProcessingCount,
}) => {
  interface NavItem {
    id: NavTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'subjects', label: 'Subjects', icon: FolderKanban },
    { id: 'years', label: 'Years', icon: CalendarDays },
    { id: 'books', label: 'Books', icon: BookOpen },
    { id: 'processing', label: 'PDF Processing', icon: Cpu, badge: activeProcessingCount > 0 ? activeProcessingCount : undefined },
    { id: 'access', label: 'Access Management', icon: KeyRound },
    { id: 'reader-simulator', label: 'Expo App Simulator', icon: Smartphone },
    { id: 'architecture', label: 'Settings & Hostinger', icon: Server },
  ];

  return (
    <aside
      className={`relative flex flex-col border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 transition-all duration-200 ${
        collapsed ? 'w-16' : 'w-64'
      } shrink-0 select-none z-20`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-sm shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-sm tracking-tight text-neutral-900 dark:text-neutral-100 truncate">
                FolioPress
              </span>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                Admin Engine v2.0
              </span>
            </div>
          )}
        </div>

        <button
          onClick={onToggleCollapsed}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900/60 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-neutral-900 dark:text-white' : 'text-neutral-500'}`} />
              {!collapsed && (
                <span className="flex-1 text-left truncate whitespace-nowrap">
                  {item.label}
                </span>
              )}
              {!collapsed && item.badge !== undefined && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Production Stack Hierarchy Indicator */}
      {!collapsed && (
        <div className="p-3 mx-2 mb-3 border border-neutral-200/80 dark:border-neutral-800/80 rounded-md bg-neutral-50/70 dark:bg-neutral-900/40 text-[11px] text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-neutral-700 dark:text-neutral-300">Hierarchy Contract</span>
            <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">Strict</span>
          </div>
          <div className="text-[10px] leading-relaxed font-mono">
            Subject → Year → Book → PDF → Chapter
          </div>
        </div>
      )}
    </aside>
  );
};
