import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import invoicesData from '../data/invoices.json';
import workflowsData from '../data/workflows.json';
import quotesData from '../data/quotes.json';

const AppContext = createContext(null);

const readTheme = () => document.documentElement.getAttribute('data-theme') || 'dark';

// État global de la démo : navigation, thème, et les quelques données
// modifiables à l'écran (attribution des factures, interrupteurs n8n).
export function AppProvider({ children }) {
  const [route, setRoute] = useState({ page: 'overview', params: {} });
  const [theme, setTheme] = useState(readTheme);
  const [invoices, setInvoices] = useState(invoicesData);
  const [workflows, setWorkflows] = useState(workflowsData.workflows);
  const [rdvOpen, setRdvOpen] = useState(false);

  const navigate = useCallback((page, params = {}) => {
    setRoute({ page, params });
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#111113' : '#fefefe');
    try {
      localStorage.setItem('motortech.theme', theme);
    } catch {
      /* stockage indisponible : le thème reste valable pour la session */
    }
  }, [theme]);

  const toggleTheme = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), []);

  const assignInvoice = useCallback((id, clientId) => {
    setInvoices((list) =>
      list.map((inv) => {
        if (inv.id !== id) return inv;
        return { ...inv, clientId, statut: 'classee', confiance: 100, valideManuellement: true };
      })
    );
  }, []);

  const toggleWorkflow = useCallback((id) => {
    setWorkflows((list) => list.map((w) => (w.id === id ? { ...w, actif: !w.actif } : w)));
  }, []);

  const counts = useMemo(
    () => ({
      invoicesToCheck: invoices.filter((i) => i.statut === 'a_verifier').length,
      quotesPending: quotesData.quotes.filter((q) => q.statut !== 'accepte').length,
      workflowsActive: workflows.filter((w) => w.actif).length,
    }),
    [invoices, workflows]
  );

  const value = {
    page: route.page,
    params: route.params,
    navigate,
    theme,
    toggleTheme,
    invoices,
    assignInvoice,
    workflows,
    toggleWorkflow,
    counts,
    rdvOpen,
    openRdv: () => setRdvOpen(true),
    closeRdv: () => setRdvOpen(false),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp doit être utilisé à l'intérieur de <AppProvider>");
  return ctx;
}
