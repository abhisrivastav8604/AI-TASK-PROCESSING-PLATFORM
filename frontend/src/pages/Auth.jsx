import { useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import FloatingLabelInput from '../components/FloatingLabelInput';
import { Hexagon, Loader2, Zap, Lock, BarChart2 } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [errorMsg, setErrorMsg] = useState('');
  
  const { login, register, loading } = useAuthContext();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    let result;
    if (isLogin) {
      result = await login({ email: formData.email, password: formData.password });
    } else {
      result = await register(formData);
    }

    if (result.success) {
      toast.success(`Welcome ${isLogin ? 'back' : 'aboard'}!`);
    } else {
      setErrorMsg(result.message);
      toast.error(result.message);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrorMsg('');
    setFormData({ name: '', email: '', password: '' });
  };

  return (
    <div className="flex min-h-screen bg-bg-primary text-text-primary font-sans overflow-hidden relative">
      <div className="absolute -bottom-64 -left-64 w-[500px] h-[500px] rounded-full bg-accent-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute -top-64 -right-64 w-[500px] h-[500px] rounded-full bg-accent-cyan/10 blur-[120px] pointer-events-none" />

      <div className="hidden lg:flex w-[45%] flex-col justify-between p-12 relative z-10 border-r border-border bg-bg-secondary/50">
        <div>
          <div className="flex items-center gap-3 mb-16 animate-fade-in stagger-1">
            <Hexagon className="w-10 h-10 text-accent-primary fill-accent-primary/20" strokeWidth={1.5} />
            <span className="font-display text-2xl font-bold tracking-tight text-white">NexTask</span>
          </div>
          
          <h1 className="font-display text-5xl font-bold leading-[1.1] mb-6 animate-fade-in stagger-2 bg-gradient-to-br from-white to-text-secondary bg-clip-text text-transparent">
            AI-powered task processing at scale.
          </h1>
          <p className="text-lg text-text-secondary mb-12 animate-fade-in stagger-3 max-w-md">
            The command center for executing high-throughput background operations with real-time observability.
          </p>

          <div className="space-y-6 animate-fade-in stagger-4">
            <FeatureRow icon={<Zap />} title="Async background processing" desc="Zero blocking, infinite horizontal scaling." />
            <FeatureRow icon={<Lock />} title="JWT-secured workspace" desc="Enterprise-grade session management." />
            <FeatureRow icon={<BarChart2 />} title="Real-time status tracking" desc="Sub-second polling for active tasks." />
          </div>
        </div>
        
        <div className="text-sm text-text-muted font-mono animate-fade-in stagger-4">
          v2.0.0-production • k3s cluster connected
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center p-6 relative z-10">
        
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <Hexagon className="w-8 h-8 text-accent-primary fill-accent-primary/20" strokeWidth={1.5} />
          <span className="font-display text-xl font-bold text-white">NexTask</span>
        </div>

        <div className="w-full max-w-md animate-fade-in">
          <div className="glass-panel p-8 sm:p-10 rounded-2xl glow-card shadow-2xl relative overflow-hidden">
            
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-accent-primary to-transparent opacity-50" />

            <div className="flex p-1 bg-bg-secondary rounded-lg mb-8 border border-border">
              <button
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${isLogin ? 'bg-bg-hover text-white shadow shadow-black/20' : 'text-text-muted hover:text-text-primary'}`}
                onClick={() => !isLogin && toggleMode()}
              >
                Sign In
              </button>
              <button
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${!isLogin ? 'bg-bg-hover text-white shadow shadow-black/20' : 'text-text-muted hover:text-text-primary'}`}
                onClick={() => isLogin && toggleMode()}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <FloatingLabelInput
                  id="name"
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              )}
              
              <FloatingLabelInput
                id="email"
                type="email"
                label="Work Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              
              <FloatingLabelInput
                id="password"
                type="password"
                label="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={8}
              />

              {errorMsg && (
                <p className="text-accent-red text-sm font-medium animate-slide-up flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-red inline-block" />
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-solid mt-2 h-12 text-[15px]"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  isLogin ? 'Sign In →' : 'Create Account →'
                )}
              </button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureRow({ icon, title, desc }) {
  return (
    <div className="flex gap-4">
      <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-bg-primary border border-border flex items-center justify-center text-accent-cyan">
        {icon}
      </div>
      <div>
        <h4 className="font-medium text-text-primary text-sm">{title}</h4>
        <p className="text-text-secondary text-sm mt-0.5">{desc}</p>
      </div>
    </div>
  );
}
