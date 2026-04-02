import React, { useState, useCallback, Suspense, lazy } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { exportToCSV, exportToPDF } from './utils/exportData';
import './index.css';

// Lazy load main views to optimize initial bundle size
const Dashboard = lazy(() => import('./components/Dashboard'));
const AddTransaction = lazy(() => import('./components/AddTransaction'));
const History = lazy(() => import('./components/History'));
const Analytics = lazy(() => import('./components/Analytics'));
const CalendarView = lazy(() => import('./components/CalendarView'));
const Settings = lazy(() => import('./components/Settings'));
const AIAssistant = lazy(() => import('./components/AIAssistant'));

// ─── Export Modal ─────────────────────────────────────────────────────────────
function ExportModal({ onClose }) {
  const { state, totalIncome, totalExpenses, balance } = useApp();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 380 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Export Data</div>
          <button className="icon-btn" onClick={onClose} style={{ width: 32, height: 32 }}>✕</button>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20 }}>
          Export {state.transactions.length} transaction{state.transactions.length !== 1 ? 's' : ''} to your preferred format.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button className="btn btn-primary btn-lg" onClick={() => { exportToCSV(state.transactions); onClose(); }}>
            📊 Export as CSV
          </button>
          <button className="btn btn-secondary btn-lg" onClick={() => { exportToPDF(state.transactions, balance, totalIncome, totalExpenses); onClose(); }}>
            📄 Export as PDF
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Inner App (inside Provider) ─────────────────────────────────────────────
function AppInner() {
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showExport, setShowExport] = useState(false);

  const navigate = useCallback((page) => {
    setActivePage(page);
    setSearchQuery('');
  }, []);

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':    return <Dashboard onNavigate={navigate} searchQuery={searchQuery} />;
      case 'add':          return <AddTransaction onSuccess={() => navigate('dashboard')} />;
      case 'history':      return <History searchQuery={searchQuery} />;
      case 'analytics':    return <Analytics />;
      case 'calendar':     return <CalendarView />;
      case 'ai-assistant': return <AIAssistant />;
      case 'settings':     return <Settings />;
      default:             return <Dashboard onNavigate={navigate} searchQuery={searchQuery} />;
    }
  };

  return (
    <div className="app-layout">
      {showExport && <ExportModal onClose={() => setShowExport(false)} />}

      <Sidebar
        activePage={activePage}
        onNavigate={navigate}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <div className="main-content">
        <Header
          activePage={activePage}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onMobileMenuOpen={() => setMobileSidebarOpen(true)}
          onExport={() => setShowExport(true)}
        />
        <div className="page-container">
          <Suspense fallback={
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <div style={{ color: 'var(--text-muted)' }}>Loading...</div>
            </div>
          }>
            {renderPage()}
          </Suspense>
        </div>
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
