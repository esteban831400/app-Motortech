import { useState } from 'react';
import { AppProvider, useApp } from './hooks/AppContext';
import { ToastProvider } from './hooks/ToastContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import BottomNav from './components/BottomNav';
import CommandPalette from './components/CommandPalette';
import RdvModal from './components/RdvModal';
import Overview from './pages/Overview';
import Calls from './pages/Calls';
import Quotes from './pages/Quotes';
import Invoices from './pages/Invoices';
import Followup from './pages/Followup';
import Events from './pages/Events';
import Network from './pages/Network';
import Automations from './pages/Automations';

const PAGES = {
  overview: Overview,
  calls: Calls,
  quotes: Quotes,
  invoices: Invoices,
  followup: Followup,
  events: Events,
  network: Network,
  automations: Automations,
};

function Shell() {
  const { page, params, rdvOpen } = useApp();
  const [introDone, setIntroDone] = useState(false);
  const Page = PAGES[page] ?? Overview;

  return (
    <div
      className={`app-shell ${introDone ? '' : 'app-intro'}`}
      onAnimationEnd={(e) => e.target === e.currentTarget && setIntroDone(true)}
    >
      <Sidebar />
      <div className="app-main">
        <Topbar />
        <main className="app-content">
          {/* key : remonte la page à chaque navigation pour rejouer la cascade */}
          <div key={`${page}-${JSON.stringify(params)}`} className="page-transition">
            <Page />
          </div>
        </main>
      </div>
      <BottomNav />
      <CommandPalette />
      {rdvOpen && <RdvModal />}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppProvider>
        <Shell />
      </AppProvider>
    </ToastProvider>
  );
}
