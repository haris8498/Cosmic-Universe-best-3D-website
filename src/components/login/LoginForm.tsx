import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Rocket, User, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface LoginFormProps {
  onLogin: (email: string, password: string) => void;
  onSignup?: (name: string, email: string, password: string) => void;
  isLoading?: boolean;
}

const LoginForm = ({ onLogin, onSignup, isLoading = false }: LoginFormProps) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      onLogin(email, password);
    } else if (onSignup) {
      onSignup(name, email, password);
    }
  };

  const inputVariants = {
    focused: {
      scale: 1.02,
      boxShadow: '0 0 30px rgba(0, 212, 255, 0.5), 0 0 60px rgba(0, 212, 255, 0.3)',
    },
    unfocused: {
      scale: 1,
      boxShadow: '0 0 0px rgba(0, 212, 255, 0)',
    },
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="w-full max-w-md space-y-6"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.8 }}
    >
      {/* Mode Toggle */}
      <div className="flex gap-2 p-1 glass-panel rounded-xl">
        <button
          type="button"
          onClick={() => setMode('login')}
          className={`flex-1 py-3 px-6 rounded-lg font-orbitron font-bold transition-all duration-300 ${
            mode === 'login'
              ? 'bg-gradient-to-r from-nebula-cyan to-blue-500 text-primary-foreground shadow-lg'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          LOGIN
        </button>
        <button
          type="button"
          onClick={() => setMode('signup')}
          className={`flex-1 py-3 px-6 rounded-lg font-orbitron font-bold transition-all duration-300 ${
            mode === 'signup'
              ? 'bg-gradient-to-r from-nebula-magenta to-purple-500 text-primary-foreground shadow-lg'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          SIGN UP
        </button>
      </div>

      {/* Name Field - Only for Signup */}
      <AnimatePresence mode="wait">
        {mode === 'signup' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={
              focusedField === 'name' 
                ? { opacity: 1, height: 'auto', ...inputVariants.focused } 
                : { opacity: 1, height: 'auto', ...inputVariants.unfocused }
            }
            exit={{ opacity: 0, height: 0 }}
            className="relative overflow-hidden"
          >
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-nebula-cyan">
              <User size={20} />
            </div>
            <Input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
              className="h-14 pl-12 pr-4 bg-space-dark/50 border-nebula-cyan/30 text-foreground placeholder:text-muted-foreground rounded-xl font-exo text-lg focus:border-nebula-cyan focus:ring-nebula-cyan/20 transition-all duration-300"
              required={mode === 'signup'}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Email Field */}
      <motion.div
        variants={inputVariants}
        animate={focusedField === 'email' ? 'focused' : 'unfocused'}
        className="relative"
      >
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-nebula-cyan">
          <Mail size={20} />
        </div>
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onFocus={() => setFocusedField('email')}
          onBlur={() => setFocusedField(null)}
          className="h-14 pl-12 pr-4 bg-space-dark/50 border-nebula-cyan/30 text-foreground placeholder:text-muted-foreground rounded-xl font-exo text-lg focus:border-nebula-cyan focus:ring-nebula-cyan/20 transition-all duration-300"
          required
        />
      </motion.div>

      {/* Password Field */}
      <motion.div
        variants={inputVariants}
        animate={focusedField === 'password' ? 'focused' : 'unfocused'}
        className="relative"
      >
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-nebula-cyan">
          <Lock size={20} />
        </div>
        <Input
          type={showPassword ? 'text' : 'password'}
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onFocus={() => setFocusedField('password')}
          onBlur={() => setFocusedField(null)}
          className="h-14 pl-12 pr-12 bg-space-dark/50 border-nebula-cyan/30 text-foreground placeholder:text-muted-foreground rounded-xl font-exo text-lg focus:border-nebula-cyan focus:ring-nebula-cyan/20 transition-all duration-300"
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-nebula-cyan transition-colors"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </motion.div>

      {/* Submit Button */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-14 bg-gradient-to-r from-nebula-cyan via-nebula-magenta to-nebula-gold text-primary-foreground font-orbitron text-lg font-bold rounded-xl relative overflow-hidden group"
        >
          <span className="relative z-10 flex items-center justify-center gap-3">
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Rocket size={24} />
              </motion.div>
            ) : (
              <>
                <Rocket size={24} />
                {mode === 'login' ? 'LAUNCH INTO UNIVERSE' : 'CREATE ACCOUNT'}
              </>
            )}
          </span>
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-nebula-gold via-nebula-magenta to-nebula-cyan opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          />
        </Button>
      </motion.div>

      {/* Footer Text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center text-muted-foreground font-exo"
      >
        {mode === 'login' ? (
          <>
            Lost in space?{' '}
            <button
              type="button"
              className="text-nebula-cyan hover:text-nebula-magenta transition-colors underline"
            >
              Reset your coordinates
            </button>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => setMode('login')}
              className="text-nebula-cyan hover:text-nebula-magenta transition-colors underline"
            >
              Launch here
            </button>
          </>
        )}
      </motion.p>
    </motion.form>
  );
};

export default LoginForm;
