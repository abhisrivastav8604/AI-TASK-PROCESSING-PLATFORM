import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function StatusBadge({ status }) {
  const normalizedStatus = status?.toLowerCase() || 'pending';
  
  const config = {
    pending: {
      bg: 'bg-accent-yellow/10',
      text: 'text-accent-yellow',
      dot: 'bg-accent-yellow',
      label: 'Pending',
      anim: 'animate-pulse-slow'
    },
    running: {
      bg: 'bg-accent-cyan/10',
      text: 'text-accent-cyan',
      dot: 'border-accent-cyan',
      label: 'Running',
      anim: 'animate-spin-slow border-t-transparent'
    },
    success: {
      bg: 'bg-accent-green/10',
      text: 'text-accent-green',
      dot: 'bg-accent-green',
      label: 'Success',
      anim: ''
    },
    failed: {
      bg: 'bg-accent-red/10',
      text: 'text-accent-red',
      dot: 'bg-accent-red',
      label: 'Failed',
      anim: ''
    }
  };

  const style = config[normalizedStatus] || config.pending;

  return (
    <div className={cn("inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-border/50 text-xs font-medium font-sans uppercase tracking-wide", style.bg, style.text)}>
      {normalizedStatus === 'running' ? (
        <span className={cn("w-2 h-2 rounded-full border-2 border-accent-cyan/30", style.anim)} />
      ) : (
        <span className={cn("w-1.5 h-1.5 rounded-full shadow-[0_0_5px_currentColor]", style.dot, style.anim)} />
      )}
      {style.label}
    </div>
  );
}
