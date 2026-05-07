import { useState, useEffect, useRef } from 'react';
import { Terminal, ToggleLeft, ToggleRight } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function LogsPanel({ logs = [] }) {
  const [autoScroll, setAutoScroll] = useState(true);
  const logsEndRef = useRef(null);

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const parseLogLine = (line) => {
    const match = line.match(/^(\[\d{2}:\d{2}:\d{2}\])\s(.*)$/);
    if (!match) return { timestamp: '', msg: line, color: 'text-text-primary' };

    const timestamp = match[1];
    const msg = match[2];
    let color = 'text-text-primary';

    const msgLower = msg.toLowerCase();
    if (msgLower.includes('error') || msgLower.includes('fail')) color = 'text-accent-red';
    else if (msgLower.includes('success') || msgLower.includes('complet')) color = 'text-accent-green';
    else if (msgLower.includes('system') || msgLower.includes('worker')) color = 'text-accent-cyan opacity-80';

    return { timestamp, msg, color };
  };

  return (
    <div className="flex flex-col rounded-xl overflow-hidden border border-border bg-[#080810] shadow-inner h-[400px]">
      
      <div className="h-10 bg-bg-secondary border-b border-border flex items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-text-muted" />
          <span className="text-xs font-medium text-text-secondary uppercase tracking-widest">Execution Logs</span>
        </div>
        <button 
          onClick={() => setAutoScroll(!autoScroll)}
          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
        >
          Auto-scroll
          {autoScroll ? <ToggleRight className="w-4 h-4 text-accent-primary" /> : <ToggleLeft className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 thin-scrollbar font-mono text-[13px] leading-relaxed">
        {logs.length === 0 ? (
          <div className="flex items-center gap-2 text-text-muted">
            <span className="text-accent-cyan">›</span> Waiting for logs
            <span className="w-2 h-4 bg-text-muted animate-pulse inline-block" />
          </div>
        ) : (
          <div className="space-y-1">
            {logs.map((log, idx) => {
              const { timestamp, msg, color } = parseLogLine(log);
              return (
                <div key={idx} className="flex gap-3 hover:bg-white/5 px-1 -mx-1 rounded transition-colors animate-fade-in">
                  <span className="text-accent-cyan/70 select-none shrink-0">{timestamp}</span>
                  <span className={cn(color, "break-all")}>{msg}</span>
                </div>
              );
            })}
            <div ref={logsEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}
