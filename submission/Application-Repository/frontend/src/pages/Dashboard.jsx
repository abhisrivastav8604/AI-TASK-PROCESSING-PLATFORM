import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, List, Activity, CheckCircle2, XCircle, Plus, Inbox } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import TaskCard from '../components/TaskCard';
import SkeletonRow from '../components/SkeletonRow';
import TaskForm from '../components/TaskForm';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function Dashboard() {
  const { tasks, stats, loading, fetchTasks, createTask } = useTasks();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const filteredTasks = tasks.filter(task => {
    if (filter !== 'all' && task.status !== filter) return false;
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleTaskClick = (id) => navigate(`/tasks/${id}`);

  const statCards = [
    { label: 'Total Tasks', value: stats.total, icon: <List className="w-5 h-5 text-accent-primary" /> },
    { label: 'Running', value: stats.running, icon: <Activity className="w-5 h-5 text-accent-cyan" /> },
    { label: 'Completed', value: stats.completed, icon: <CheckCircle2 className="w-5 h-5 text-accent-green" /> },
    { label: 'Failed', value: stats.failed, icon: <XCircle className="w-5 h-5 text-accent-red" /> },
  ];

  return (
    <div className="animate-fade-in pb-10">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white mb-2">Task Queue</h1>
          <p className="text-text-secondary text-sm">
            <span className="text-text-primary font-medium">{stats.total}</span> tasks total • <span className="text-accent-cyan font-medium">{stats.running}</span> running
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative group">
            <Search className="w-4 h-4 absolute left-3 top-3 text-text-muted group-focus-within:text-accent-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              className="cyber-input pl-9 h-10 py-0 w-full sm:w-64"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <button onClick={() => setIsModalOpen(true)} className="btn-solid h-10 shrink-0">
            <Plus className="w-4 h-4" /> New Task
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <div key={i} className={cn("glass-panel glow-card p-5 rounded-xl flex items-start gap-4", `stagger-${i+1}`)}>
            <div className="p-2.5 rounded-lg bg-bg-primary border border-border">
              {stat.icon}
            </div>
            <div>
              <p className="text-2xl font-bold font-display text-white leading-none mb-1">{stat.value}</p>
              <p className="text-xs text-text-muted font-medium uppercase tracking-wider">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 border-b border-border mb-4 overflow-x-auto hide-scrollbar">
        {['all', 'pending', 'running', 'success', 'failed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap",
              filter === f 
                ? "border-accent-primary text-accent-glow" 
                : "border-transparent text-text-muted hover:text-text-primary"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-bg-card border border-border rounded-xl overflow-hidden shadow-xl">
        {loading ? (
          <div>
            {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <div className="w-16 h-16 rounded-full bg-bg-secondary border border-border flex items-center justify-center mb-4 text-text-muted">
              <Inbox className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No tasks found</h3>
            <p className="text-sm text-text-muted max-w-sm mb-6">
              {searchQuery || filter !== 'all' 
                ? "Try adjusting your filters or search query to find what you're looking for."
                : "Your queue is empty. Create a new task to start processing."}
            </p>
            {(!searchQuery && filter === 'all') && (
              <button onClick={() => setIsModalOpen(true)} className="btn-solid">
                <Plus className="w-4 h-4" /> Create your first task
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredTasks.map(task => (
              <TaskCard key={task._id || task.id} task={task} onClick={handleTaskClick} />
            ))}
          </div>
        )}
      </div>

      {!loading && filteredTasks.length > 0 && (
        <div className="flex items-center justify-between mt-4 px-2">
          <p className="text-xs text-text-muted">Showing {filteredTasks.length} tasks</p>
          <div className="flex gap-2">
            <button className="btn-ghost text-xs px-2 py-1" disabled>← Prev</button>
            <button className="btn-ghost text-xs px-2 py-1" disabled>Next →</button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <TaskForm onClose={() => setIsModalOpen(false)} onSubmit={createTask} />
      )}
    </div>
  );
}
