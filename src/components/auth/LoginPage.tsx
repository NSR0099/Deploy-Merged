import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertTriangle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    const result = await login(email, password);
    
    if (result.success) {
      toast.success('Login successful', {
        description: 'Welcome to the Emergency Command Center',
      });
      navigate('/dashboard');
    } else {
      setError(result.error || 'Login failed');
      toast.error('Authentication failed', {
        description: result.error,
      });
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error('Please enter your email address');
      return;
    }
    toast.success('Password reset link sent', {
      description: `If an account exists for ${resetEmail}, you will receive a password reset email shortly.`,
    });
    setShowForgotPassword(false);
    setResetEmail('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(200 100% 97%) 0%, hsl(200 100% 94%) 100%)' }}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(26,86,219,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(26,86,219,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="relative w-full max-w-md mx-4">
        {/* Logo Section */}
        <div className="text-center mb-8 mt-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 shadow-lg" style={{ background: 'linear-gradient(135deg, hsl(221 83% 48%), hsl(217 91% 60%))' }}>
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Emergency Command Center
          </h1>
          <p className="text-muted-foreground">
            Smart Emergency Response System
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-card rounded-2xl p-8 shadow-lg border border-border">
          {!showForgotPassword ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@emergency.gov"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-muted/50 border-border focus:border-primary"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 bg-muted/50 border-border focus:border-primary pr-12"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    Access Command Center
                  </>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div className="text-center mb-4">
                <h2 className="text-xl font-semibold text-foreground">Reset Password</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reset-email" className="text-foreground">
                  Email Address
                </Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="admin@emergency.gov"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="h-12 bg-muted/50 border-border focus:border-primary"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-12"
                  onClick={() => setShowForgotPassword(false)}
                >
                  Back to Login
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-12"
                >
                  Send Reset Link
                </Button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-border">
            <div className="text-center text-sm text-muted-foreground">
              <p className="mb-2">Access restricted to authorized personnel only.</p>
              <p className="text-xs">
                Roles: <span className="text-primary font-medium">ADMIN</span> or <span className="text-primary font-medium">RESPONDER</span>
              </p>
            </div>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 rounded-xl bg-accent/50 border border-border">
          <p className="text-sm font-medium text-foreground mb-2">Demo Credentials:</p>
          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div>
              <p className="font-medium text-primary">Admin</p>
              <p>admin@emergency.gov</p>
              <p>admin123</p>
            </div>
            <div>
              <p className="font-medium text-primary">Responder</p>
              <p>responder@emergency.gov</p>
              <p>responder123</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6 mb-8">
          All actions are logged for security purposes
        </p>
      </div>
    </div>
  );
};

export default LoginPage;