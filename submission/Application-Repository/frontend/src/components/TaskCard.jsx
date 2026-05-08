import { ArrowRight } from 'lucide-react';
import StatusBadge from './StatusBadge';
import OperationBadge from './OperationBadge';

export default function TaskCard({ task, onClick }) {
  const date = new Date(task.createdAt).toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  return (
    <div 
      className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-bg-card border-b border-border hover:bg-bg-hover transition-all cursor-pointer relative"
      onClick={() => onClick(task._id || task.id)}
    >
      <div className="absolute left-0 top-0 h-full w-[2px] bg-accent-primary opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_8px_rgba(99,102,241,0.8)]" />

      <div className="flex flex-col gap-2 min-w-0 pr-4 flex-1">
        <div className="flex items-center gap-3">
          <h3 className="text-text-primary font-medium truncate">{task.title}</h3>
          <OperationBadge operation={task.operation} />
        </div>
        <p className="text-xs text-text-muted font-mono">{date}</p>
      </div>

      <div className="hidden md:flex items-center justify-center flex-1 pr-4">
        <span className="text-xs text-text-muted font-mono opacity-60 truncate max-w-[120px]">
          {task._id || task.id}
        </span>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-6 mt-4 sm:mt-0 flex-shrink-0">
        <StatusBadge status={task.status} />
        <button className="flex items-center gap-1 text-sm font-medium text-text-muted group-hover:text-accent-primary transition-colors opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0">
          View Details <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
