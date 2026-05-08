import { useEffect, useState } from 'react';
import { useToast } from '../context/ToastContext';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function Toast({ id, type, message }) {
  const { removeToast } = useToast();
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLeaving(true);
    }, 3800); 
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => removeToast(id), 200); 
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-accent-green" />,
    error: <XCircle className="w-5 h-5 text-accent-red" />,
    info: <Info className="w-5 h-5 text-accent-cyan" />,
  };

  const borders = {
    success: 'border-l-accent-green',
    error: 'border-l-accent-red',
    info: 'border-l-accent-cyan',
  };

  const progressColors = {
    success: 'bg-accent-green',
    error: 'bg-accent-red',
    info: 'bg-accent-cyan',
  };

  return (
    <div
      className={cn(
        "glass-panel border-l-4 w-80 relative overflow-hidden flex flex-col pointer-events-auto rounded shadow-xl",
        borders[type],
        isLeaving ? "animate-[slideOutRight_200ms_ease-in_forwards] opacity-0" : "animate-slide-in-right"
      )}
    >
      <div className="flex items-start gap-3 p-4">
        {icons[type]}
        <div className="flex-1 min-w-0 pt-0.5">
          <p className="text-sm font-medium text-text-primary leading-tight">{message}</p>
        </div>
        <button 
          onClick={handleClose}
          className="text-text-muted hover:text-text-primary transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="h-[2px] w-full bg-bg-secondary absolute bottom-0 left-0">
        <div 
          className={cn("h-full animate-[shrinkWidth_4s_linear_forwards]", progressColors[type])} 
        />
      </div>

      <style>{`
        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
        @keyframes shrinkWidth {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
