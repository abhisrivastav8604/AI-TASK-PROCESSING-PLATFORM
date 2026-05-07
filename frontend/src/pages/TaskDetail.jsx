import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Check, RefreshCw, Trash2, FileText } from 'lucide-react';
import { useTaskDetail } from '../hooks/useTaskDetail';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';
import OperationBadge from '../components/OperationBadge';
import LogsPanel from '../components/LogsPanel';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { task, loading, deleteTask } = useTaskDetail(id);
  const [copiedId, setCopiedId] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(task._id);
    setCopiedId(true);
    toast.success('Task ID copied to clipboard');
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000); 
      return;
    }
    const success = await deleteTask();
    if (success) {
      toast.success('Task deleted');
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 animate-pulse">
        <div className="w-12 h-12 rounded-full border-4 border-accent-primary/20 border-t-accent-primary animate-spin mb-4" />
        <p className="text-text-muted font-mono">Loading telemetry...</p>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-white mb-2">Task Not Found</h2>
        <p className="text-text-muted mb-6">This task may have been deleted or never existed.</p>
        <Link to="/" className="btn-solid inline-flex"><ArrowLeft className="w-4 h-4" /> Return Home</Link>
      </div>
    );
  }

  const dateStr = new Date(task.createdAt).toLocaleString();

  return (
    <div className="animate-fade-in pb-10">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-accent-primary transition-colors mb-6 group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
      </Link>

      <div className="flex flex-col lg:flex-row gap-6">
        
        <div className="w-full lg:w-3/5 flex flex-col gap-6">
          
          <div className="glass-panel p-6 rounded-xl">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="font-display text-2xl font-bold text-white mb-3">{task.title}</h1>
                <div className="flex flex-wrap items-center gap-3">
                  <OperationBadge operation={task.operation} />
                  <span className="text-text-muted">|</span>
                  <button onClick={handleCopyId} className="flex items-center gap-1.5 text-xs font-mono text-text-muted hover:text-white transition-colors group">
                    ID: {task._id}
                    {copiedId ? <Check className="w-3.5 h-3.5 text-accent-green" /> : <Copy className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100" />}
                  </button>
                </div>
              </div>
              <StatusBadge status={task.status} />
            </div>
            <div className="text-xs text-text-muted font-mono border-t border-border pt-4">
              Created: <span className="text-text-secondary">{dateStr}</span>
            </div>
          </div>

          <div className="glass-panel rounded-xl overflow-hidden">
            <div className="h-10 bg-bg-secondary border-b border-border flex items-center px-4">
              <FileText className="w-4 h-4 text-text-muted mr-2" />
              <span className="text-xs font-medium text-text-secondary uppercase tracking-widest">Input Text</span>
            </div>
            <div className="p-4 bg-bg-primary/50 text-sm font-mono text-text-primary whitespace-pre-wrap max-h-48 overflow-y-auto thin-scrollbar">
              {task.inputText}
            </div>
          </div>

          {(task.status === 'success' || task.status === 'failed') && (
            <div className={cn(
              "glass-panel rounded-xl overflow-hidden border",
              task.status === 'success' ? "border-accent-green/30" : "border-accent-red/30"
            )}>
              <div className={cn(
                "h-10 flex items-center px-4 border-b border-border",
                task.status === 'success' ? "bg-accent-green/5" : "bg-accent-red/5"
              )}>
                <span className={cn(
                  "text-xs font-bold uppercase tracking-widest",
                  task.status === 'success' ? "text-accent-green" : "text-accent-red"
                )}>
                  {task.status === 'success' ? 'Output Result' : 'Task Failed'}
                </span>
              </div>
              <div className="p-4 bg-bg-primary/50 text-sm font-mono text-text-primary whitespace-pre-wrap max-h-64 overflow-y-auto thin-scrollbar">
                {task.result !== null ? task.result : "Task execution failed. Inspect the logs for details."}
              </div>
            </div>
          )}

        </div>

        <div className="w-full lg:w-2/5 flex flex-col gap-6">
          <LogsPanel logs={task.logs || []} />
          
          <div className="glass-panel p-4 rounded-xl flex flex-col gap-3">
            <button className="btn-ghost justify-start text-text-primary border border-border">
              <RefreshCw className="w-4 h-4" /> Re-run Task
            </button>
            <button 
              onClick={handleDelete}
              className={cn(
                "btn-ghost justify-start border border-transparent transition-colors",
                confirmDelete 
                  ? "bg-accent-red hover:bg-accent-red text-white" 
                  : "text-accent-red hover:bg-accent-red/10"
              )}
            >
              <Trash2 className="w-4 h-4" /> 
              {confirmDelete ? 'Click to confirm deletion' : 'Delete Task'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
