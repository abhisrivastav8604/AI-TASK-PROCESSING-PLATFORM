import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function FloatingLabelInput({ id, label, type = 'text', value, onChange, required, minLength }) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;
  const isFilled = value && value.length > 0;

  return (
    <div className="relative mt-2">
      <input
        id={id}
        type={inputType}
        value={value}
        onChange={onChange}
        required={required}
        minLength={minLength}
        className="cyber-input peer pt-5 pb-2 w-full text-base"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      <label
        htmlFor={id}
        className={cn(
          "absolute left-4 transition-all duration-200 pointer-events-none",
          focused || isFilled 
            ? "text-[11px] top-1.5 text-accent-glow font-medium"
            : "text-base top-3.5 text-text-muted"
        )}
      >
        {label}
      </label>
      
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-3.5 text-text-muted hover:text-text-primary transition-colors focus:outline-none"
          tabIndex={-1}
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      )}
    </div>
  );
}
