import { Link, useLocation } from 'react-router-dom';
import { Hexagon, Bell, UserCircle, Menu } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const { logout } = useAuthContext();
  
  const getBreadcrumb = () => {
    if (location.pathname === '/') return 'Dashboard';
    if (location.pathname.startsWith('/tasks/')) return 'Dashboard / Task Detail';
    return 'Dashboard';
  };

  return (
    <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-border bg-bg-secondary/80 backdrop-blur-md sticky top-0 z-30">
      
      <div className="flex lg:hidden items-center gap-3">
        <button className="text-text-muted hover:text-text-primary p-1">
          <Menu className="w-5 h-5" />
        </button>
        <Link to="/" className="flex items-center gap-2">
          <Hexagon className="w-6 h-6 text-accent-primary" strokeWidth={1.5} />
        </Link>
      </div>

      <div className="hidden lg:flex items-center text-sm font-mono text-text-muted">
        <span className="bg-bg-primary border border-border px-2.5 py-1 rounded-md text-text-secondary">
          {getBreadcrumb()}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-text-muted hover:text-text-primary transition-colors rounded-full hover:bg-bg-hover">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-primary border-2 border-bg-secondary" />
        </button>

        <div className="h-6 w-[1px] bg-border mx-1 hidden sm:block" />
        
        <button className="flex lg:hidden p-1 text-text-muted hover:text-text-primary" onClick={logout}>
           <UserCircle className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
}
