import { useState } from 'react';
import { X, ArrowUpCircle, ArrowDownCircle, RefreshCcw, Hash, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const OPERATIONS = [
  { id: 'uppercase', icon: <ArrowUpCircle className="w-5 h-5" />, title: 'UPPERCASE', desc: 'Convert to caps' },
  { id: 'lowercase', icon: <ArrowDownCircle className="w-5 h-5" />, title: 'lowercase', desc: 'Convert to lower' },
  { id: 'reverse', icon: <RefreshCcw className="w-5 h-5" />, title: 'Reverse', desc: 'Flip the string' },
  { id: 'word_count', icon: <Hash className="w-5 h-5" />, title: 'Word Count', desc: 'Count all words' },
];

export default function TaskForm({ onClose, onSubmit }) {
  const [title, setTitle] = useState('');
  const [operation, setOperation] = useState('uppercase');
  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await onSubmit({ title, operation, inputText });
    setIsSubmitting(false);
    if (result?.success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-primary/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ animation: 'slideUp 200ms ease-out forwards' }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-bg-secondary/50">
          <h2 className="font-display text-xl font-bold text-white">New Task</h2>
          <button 
            onClick={onClose}
            className="p-1 text-text-muted hover:text-white transition-colors rounded hover:bg-bg-hover"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Task Title</label>
            <input
              required
              type="text"
              placeholder="e.g. Process customer feedback"
              className="cyber-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Operation</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {OPERATIONS.map((op) => {
                const isSelected = operation === op.id;
                return (
                  <button
                    key={op.id}
                    type="button"
                    onClick={() => setOperation(op.id)}
                    className={cn(
                      "flex items-start gap-3 p-4 rounded-xl border text-left transition-all duration-150",
                      isSelected 
                        ? "bg-accent-primary/10 border-accent-primary shadow-[0_0_15px_rgba(99,102,241,0.15)]" 
                        : "bg-bg-secondary border-border hover:border-text-muted hover:bg-bg-hover"
                    )}
                  >
                    <div className={cn("mt-0.5", isSelected ? "text-accent-glow" : "text-text-muted")}>
                      {op.icon}
                    </div>
                    <div>
                      <h4 className={cn("font-medium text-sm mb-0.5", isSelected ? "text-white" : "text-text-primary")}>
                        {op.title}
                      </h4>
                      <p className={cn("text-xs", isSelected ? "text-accent-glow/80" : "text-text-muted")}>
                        {op.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-end mb-2">
              <label className="block text-sm font-medium text-text-secondary">Input Text</label>
              <span className="text-xs text-text-muted font-mono">{inputText.length} / 5000</span>
            </div>
            <textarea
              required
              maxLength={5000}
              placeholder="Paste or type your text here..."
              className="cyber-input min-h-[120px] resize-y font-mono text-sm"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-solid min-w-[160px]"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Queuing...</>
              ) : (
                'Create & Queue Task →'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
