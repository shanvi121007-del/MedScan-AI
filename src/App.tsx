import { useCallback, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { RouterContext, type Route } from '@/lib/router';
import { SessionProvider, useSession } from '@/lib/session';
import Home from '@/pages/Home';
import Dashboard from '@/pages/Dashboard';
import MriAnalysis from '@/pages/MriAnalysis';
import HistopathologyAnalysis from '@/pages/HistopathologyAnalysis';
import ClinicalReport from '@/pages/ClinicalReport';
import History from '@/pages/History';
import About from '@/pages/About';
import Auth from '@/pages/Auth';

const META: Record<Route, { title: string; subtitle?: string }> = {
  home: { title: 'Home', subtitle: 'Welcome to MedScan AI' },
  dashboard: { title: 'Dashboard', subtitle: 'Analysis overview & system status' },
  mri: { title: 'MRI Analysis', subtitle: 'Preview and prepare MRI scans' },
  histopathology: { title: 'Histopathology', subtitle: 'Preview and prepare tissue images' },
  report: { title: 'Clinical Report Analysis', subtitle: 'Extract text locally from PDF or TXT' },
  history: { title: 'Analysis History', subtitle: 'Recorded analysis metadata' },
  about: { title: 'About', subtitle: 'Project, technology & limitations' },
  auth: { title: 'Sign in', subtitle: 'Access your research workspace' },
};

const PROTECTED: Route[] = ['dashboard', 'mri', 'histopathology', 'report', 'history'];

function Shell() {
  const [route, setRoute] = useState<Route>('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, loading } = useSession();

  const navigate = useCallback((r: Route) => {
    setRoute(r);
    window.scrollTo({ top: 0 });
  }, []);

  // Redirect protected routes to the sign-in page when signed out.
  const effectiveRoute: Route =
    !loading && !user && PROTECTED.includes(route) ? 'auth' : route;

  const meta = META[effectiveRoute];

  return (
    <RouterContext.Provider value={{ route: effectiveRoute, navigate }}>
      <div className="min-h-screen flex bg-slate-50">
        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar title={meta.title} subtitle={meta.subtitle} onMenu={() => setMenuOpen(true)} />
          <main className="flex-1 p-4 lg:p-8 max-w-6xl w-full mx-auto">
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <p className="text-sm text-slate-400">Loading…</p>
              </div>
            ) : effectiveRoute === 'home' ? (
              <Home />
            ) : effectiveRoute === 'dashboard' ? (
              <Dashboard />
            ) : effectiveRoute === 'mri' ? (
              <MriAnalysis />
            ) : effectiveRoute === 'histopathology' ? (
              <HistopathologyAnalysis />
            ) : effectiveRoute === 'report' ? (
              <ClinicalReport />
            ) : effectiveRoute === 'history' ? (
              <History />
            ) : effectiveRoute === 'about' ? (
              <About />
            ) : effectiveRoute === 'auth' ? (
              <Auth />
            ) : (
              <Home />
            )}
          </main>
          <footer className="px-4 lg:px-8 py-4 text-center">
            <p className="text-[11px] text-slate-400">
              MedScan AI · Research prototype · No medical advice
            </p>
          </footer>
        </div>
      </div>
    </RouterContext.Provider>
  );
}

function App() {
  return (
    <SessionProvider>
      <Shell />
    </SessionProvider>
  );
}

export default App;
