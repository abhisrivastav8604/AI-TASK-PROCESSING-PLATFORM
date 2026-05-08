import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function OperationBadge({ operation }) {
  const normalizedOp = operation?.toLowerCase() || 'uppercase';

  const config = {
    uppercase: { bg: 'bg-accent-cyan/15', text: 'text-accent-cyan', border: 'border-accent-cyan/20' },
    lowercase: { bg: 'bg-[#A855F7]/15', text: 'text-[#A855F7]', border: 'border-[#A855F7]/20' }, 
    reverse:   { bg: 'bg-[#F97316]/15', text: 'text-[#F97316]', border: 'border-[#F97316]/20' }, 
    word_count:{ bg: 'bg-accent-green/15', text: 'text-accent-green', border: 'border-accent-green/20' },
  };

  const style = config[normalizedOp] || config.uppercase;

  return (
    <span className={cn("inline-block px-2 py-0.5 rounded text-[11px] font-mono tracking-wider uppercase border", style.bg, style.text, style.border)}>
      {normalizedOp.replace('_', ' ')}
    </span>
  );
}
