import { useState } from 'react';
import { Loader2, AlertCircle, BrainCircuit, Mail, Lock, CheckCircle2 } from 'lucide-react';
import Disclaimer from '@/components/Disclaimer';
import { supabase } from '@/lib/supabase';
import { useRouter } from '@/lib/router';

type Mode = 'signin' | 'signup';

export default function Auth() {
  const { navigate } = useRouter();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setBusy(true);
    try {
      if (mode === 'signup') {
        const { data, error: err } = await supabase.auth.signUp({ email: email.trim(), password });
        if (err) throw err;
        // Email confirmation is OFF in this project, so a session is usually
        // returned immediately. If not (e.g. rate-limited), tell the user.
        if (data.session) {
          navigate('dashboard');
        } else {
          setInfo('Account created. You can now sign in.');
          setMode('signin');
        }
      } else {
        const { data, error: err } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (err) throw err;
        if (data.session) {
          navigate('dashboard');
        } else {
          setInfo('Signed in.');
        }
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(translateAuthError(msg));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="card p-6 sm:p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-brand-600 to-accent-500 flex items-center justify-center">
            <BrainCircuit className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-ink-900">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {mode === 'signin'
              ? 'Sign in to record and review your analysis history.'
              : 'Sign up to start recording your research analyses.'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError(null);
              setInfo(null);
            }}
            className={`rounded-lg py-2 text-sm font-semibold transition-colors ${
              mode === 'signin' ? 'bg-white text-ink-900 shadow-sm' : 'text-slate-500'
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
              setInfo(null);
            }}
            className={`rounded-lg py-2 text-sm font-semibold transition-colors ${
              mode === 'signup' ? 'bg-white text-ink-900 shadow-sm' : 'text-slate-500'
            }`}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="input pl-9"
                disabled={busy}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                className="input pl-9"
                disabled={busy}
              />
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-danger-500/10 border border-danger-500/30 px-4 py-3">
              <AlertCircle className="h-4 w-4 text-danger-600 mt-0.5 shrink-0" />
              <p className="text-sm text-danger-600">{error}</p>
            </div>
          )}
          {info && (
            <div className="flex items-start gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
              <CheckCircle2 className="h-4 w-4 text-success-600 mt-0.5 shrink-0" />
              <p className="text-sm text-success-600">{info}</p>
            </div>
          )}

          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Please wait…
              </>
            ) : mode === 'signin' ? (
              'Sign in'
            ) : (
              'Create account'
            )}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-slate-400">
          {mode === 'signin' ? (
            <>
              Don&apos;t have an account?{' '}
              <button
                className="text-brand-600 font-semibold hover:underline"
                onClick={() => {
                  setMode('signup');
                  setError(null);
                  setInfo(null);
                }}
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                className="text-brand-600 font-semibold hover:underline"
                onClick={() => {
                  setMode('signin');
                  setError(null);
                  setInfo(null);
                }}
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>

      <div className="mt-5">
        <Disclaimer />
      </div>
    </div>
  );
}

function translateAuthError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes('invalid login credentials')) return 'Incorrect email or password.';
  if (m.includes('already registered') || m.includes('already been registered'))
    return 'An account with this email already exists. Try signing in.';
  if (m.includes('rate limit')) return 'Too many attempts. Please wait a moment and try again.';
  return msg;
}
