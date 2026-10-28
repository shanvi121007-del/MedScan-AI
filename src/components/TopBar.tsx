import { Menu, Bell, LogIn, LogOut, UserCircle } from 'lucide-react';
import { useSession } from '@/lib/session';
import { useRouter } from '@/lib/router';

interface TopBarProps {
  title: string;
  subtitle?: string;
  onMenu: () => void;
}

export default function TopBar({ title, subtitle, onMenu }: TopBarProps) {
  const { user, signOut } = useSession();
  const { navigate } = useRouter();

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="flex items-center justify-between h-16 px-4 lg:px-8">
        <div className="flex items-center gap-3 min-w-0">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
            onClick={onMenu}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5 text-slate-600" />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-ink-900 truncate">{title}</h1>
            {subtitle && (
              <p className="text-xs text-slate-500 truncate">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex badge bg-slate-100 text-slate-600">
            <span className="h-1.5 w-1.5 rounded-full bg-success-500" />
            Model API: Not connected
          </span>
          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 max-w-[180px] truncate">
                <UserCircle className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="truncate">{user.email}</span>
              </span>
              <button
                onClick={signOut}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('auth')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
            >
              <LogIn className="h-3.5 w-3.5" /> Sign in
            </button>
          )}
          <button
            className="p-2 rounded-lg hover:bg-slate-100"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 text-slate-500" />
          </button>
        </div>
      </div>
    </header>
  );
}
