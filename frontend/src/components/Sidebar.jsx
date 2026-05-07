import { Link, useLocation } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { Hexagon, LayoutDashboard, Zap, BarChart2, Settings, LogOut } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function Sidebar() {
  const { user, logout } = useAuthContext();
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Tasks', path: '/tasks', icon: <Zap className="w-4 h-4" />, disabled: true },
    { label: 'Analytics', path: '/analytics', icon: <BarChart2 className="w-4 h-4" />, disabled: true },
    { label: 'Settings', path: '/settings', icon: <Settings className="w-4 h-4" />, disabled: true },
  ];

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <aside className="hidden lg:flex w-[260px] h-full flex-col bg-bg-secondary border-r border-border relative z-20">
      <div className="absolute right-0 top-0 w-[1px] h-full bg-gradient-to-b from-transparent via-accent-primary/20 to-transparent pointer-events-none" />

      <div className="h-16 flex items-center px-6 border-b border-border">
        <Link to="/" className="flex items-center gap-2.5 group">
          <Hexagon className="w-7 h-7 text-accent-primary fill-accent-primary/10 group-hover:fill-accent-primary/20 transition-colors" strokeWidth={1.5} />
          <span className="font-display text-lg font-bold tracking-wide text-white">NexTask</span>
        </Link>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 mb-2 text-xs font-semibold text-text-muted uppercase tracking-wider font-mono">Main</div>
        
        {navItems.map((item, idx) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          
          if (item.disabled) {
            return (
              <div key={idx} className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-text-muted opacity-60 cursor-not-allowed">
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.label === 'Analytics' && <span className="text-[10px] bg-bg-hover text-text-muted px-1.5 py-0.5 rounded font-mono">SOON</span>}
              </div>
            );
          }

          return (
            <Link
              key={idx}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                isActive 
                  ? "bg-accent-primary/10 text-accent-glow" 
                  : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
              )}
            >
              <div className={cn(
                "transition-colors",
                isActive ? "text-accent-glow" : "text-text-muted group-hover:text-text-primary"
              )}>
                {item.icon}
              </div>
              {item.label}
              
              {isActive && (
                <div className="ml-auto w-1 h-4 rounded-full bg-accent-glow shadow-[0_0_8px_rgba(129,140,248,0.6)]" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border mt-auto">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-9 h-9 rounded-full bg-accent-primary/20 text-accent-glow flex items-center justify-center font-bold font-display text-sm border border-accent-primary/30">
            {getInitials(user?.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-text-muted truncate font-mono">{user?.email || 'email@example.com'}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-text-muted hover:bg-accent-red/10 hover:text-accent-red transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
