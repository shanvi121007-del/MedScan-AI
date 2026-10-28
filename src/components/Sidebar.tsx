import { BrainCircuit, LayoutDashboard, ScanLine, Microscope, FileText, History, Info, X, LogIn, LogOut } from 'lucide-react';
import { useRouter, type Route } from '@/lib/router';
import { useSession } from '@/lib/session';

const NAV: { route: Route; label: string; icon: typeof LayoutDashboard }[] = [
  { route: 'home', label: 'Home', icon: BrainCircuit },
  { route: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { route: 'mri', label: 'MRI Analysis', icon: ScanLine },
  { route: 'histopathology', label: 'Histopathology', icon: Microscope },
  { route: 'report', label: 'Clinical Report', icon: FileText },
  { route: 'history', label: 'History', icon: History },
  { route: 'about', label: 'About', icon: Info },
];

const PROTECTED: Route[] = ['dashboard', 'mri', 'histopathology', 'report', 'history'];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { route, navigate } = useRouter();
  const { user, signOut } = useSession();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-ink-900/40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed lg:static z-40 inset-y-0 left-0 w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-600 to-accent-500 flex items-center justify-center">
              <BrainCircuit className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-ink-900 font-bold leading-tight">MedScan AI</p>
              <p className="text-[11px] text-slate-400 leading-tight">Imaging Research Suite</p>
            </div>
          </div>
          <button
            className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ route: r, label, icon: Icon }) => {
            const active = route === r;
            const locked = !user && PROTECTED.includes(r);
            return (
              <button
                key={r}
                onClick={() => {
                  navigate(locked ? 'auth' : r);
                  onClose();
                }}
                className={`nav-link w-full text-left ${active ? 'nav-link-active' : ''}`}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        <div className="px-3 pb-2">
          {user ? (
            <button
              onClick={() => {
                signOut();
                navigate('home');
                onClose();
              }}
              className="nav-link w-full text-left"
            >
              <LogOut className="h-[18px] w-[18px] shrink-0" />
              <span>Sign out</span>
            </button>
          ) : (
            <button
              onClick={() => {
                navigate('auth');
                onClose();
              }}
              className="nav-link w-full text-left"
            >
              <LogIn className="h-[18px] w-[18px] shrink-0" />
              <span>Sign in / Sign up</span>
            </button>
          )}
        </div>

        <div className="p-4">
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
            <p className="text-[11px] leading-relaxed text-amber-700 font-medium">
              Research prototype only. Not intended for medical diagnosis or treatment decisions.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
