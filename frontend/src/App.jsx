import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  ComposedChart, Bar, Area, CartesianGrid, XAxis, YAxis, Legend,
  defs, linearGradient, stop
} from 'recharts';

// ─── GLOBAL STYLE INJECTION ───────────────────────────────────────────────────
const injectGlobalStyles = () => {
  if (document.getElementById('ft-global')) return;
  const s = document.createElement('style');
  s.id = 'ft-global';
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --indigo: #6366f1; --violet: #7c3aed; --emerald: #10b981;
      --red: #ef4444; --cyan: #06b6d4; --amber: #f59e0b;
      --bg0: #020617; --bg1: #0a0f1e; --bg2: #0f172a; --bg3: #1e293b;
      --border: rgba(99,102,241,0.18); --border2: rgba(99,102,241,0.32);
      --text1: #f1f5f9; --text2: #94a3b8; --text3: #475569;
    }

    @keyframes fadeUp   { from { opacity:0; transform:translateY(22px); } to { opacity:1; transform:translateY(0); } }
    @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
    @keyframes scaleIn  { from { opacity:0; transform:scale(0.93); } to { opacity:1; transform:scale(1); } }
    @keyframes pulse    { 0%,100% { opacity:.6; } 50% { opacity:1; } }
    @keyframes drift1   { from { transform:translate(0,0) scale(1); } to { transform:translate(50px,35px) scale(1.12); } }
    @keyframes drift2   { from { transform:translate(0,0) scale(1); } to { transform:translate(-40px,50px) scale(1.08); } }
    @keyframes drift3   { from { transform:translate(0,0) scale(1); } to { transform:translate(25px,-25px) scale(1.06); } }
    @keyframes shimmer  { from { background-position: -400px 0; } to { background-position: 400px 0; } }
    @keyframes borderGlow { 0%,100% { border-color: rgba(99,102,241,0.2); } 50% { border-color: rgba(99,102,241,0.5); } }
    @keyframes spin { to { transform: rotate(360deg); } }

    .anim-fade-up  { animation: fadeUp  0.55s cubic-bezier(0.22,1,0.36,1) both; }
    .anim-fade-up-d1 { animation: fadeUp 0.55s 0.08s cubic-bezier(0.22,1,0.36,1) both; }
    .anim-fade-up-d2 { animation: fadeUp 0.55s 0.16s cubic-bezier(0.22,1,0.36,1) both; }
    .anim-fade-up-d3 { animation: fadeUp 0.55s 0.24s cubic-bezier(0.22,1,0.36,1) both; }
    .anim-fade-up-d4 { animation: fadeUp 0.55s 0.32s cubic-bezier(0.22,1,0.36,1) both; }
    .anim-scale-in { animation: scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both; }

    .ft-blob1 { animation: drift1 9s  ease-in-out infinite alternate; }
    .ft-blob2 { animation: drift2 11s ease-in-out infinite alternate; }
    .ft-blob3 { animation: drift3 13s ease-in-out infinite alternate; }

    .ft-btn-primary {
      background: linear-gradient(135deg,#4f46e5,#7c3aed);
      color: #fff; border: none; border-radius: 100px;
      cursor: pointer; font-weight: 600; font-family: 'Plus Jakarta Sans', sans-serif;
      transition: transform 0.4s ease, box-shadow 0.4s ease, background 0.4s ease;
      box-shadow: 0 0 20px rgba(79,70,229,0.25);
    }
    .ft-btn-primary:hover {
      transform: translateY(-2px) scale(1.03);
      box-shadow: 0 6px 32px rgba(99,102,241,0.55);
    }
    .ft-btn-ghost {
      background: transparent;
      border: 1px solid rgba(99,102,241,0.35);
      color: #a5b4fc; border-radius: 100px;
      cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
      transition: all 0.4s ease;
    }
    .ft-btn-ghost:hover {
      background: rgba(99,102,241,0.12);
      border-color: #6366f1; color: #fff;
      box-shadow: 0 0 18px rgba(99,102,241,0.25);
    }
    .ft-btn-danger {
      background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.3);
      color: #fca5a5; border-radius: 10px; cursor: pointer;
      font-family: 'Plus Jakarta Sans', sans-serif;
      transition: all 0.4s ease;
    }
    .ft-btn-danger:hover {
      background: rgba(239,68,68,0.22); border-color: #ef4444;
      box-shadow: 0 0 18px rgba(239,68,68,0.25);
    }
    .ft-card {
      background: rgba(15,23,42,0.7);
      border: 1px solid var(--border);
      border-radius: 18px;
      backdrop-filter: blur(14px);
      transition: border-color 0.4s ease, transform 0.4s ease, box-shadow 0.4s ease;
    }
    .ft-card:hover {
      border-color: rgba(99,102,241,0.38);
      transform: translateY(-3px);
      box-shadow: 0 12px 40px rgba(99,102,241,0.12);
    }
    .ft-stat-card {
      background: rgba(15,23,42,0.8);
      border: 1px solid var(--border);
      border-radius: 18px;
      backdrop-filter: blur(14px);
      transition: all 0.4s ease;
      position: relative; overflow: hidden;
    }
    .ft-stat-card::before {
      content: ''; position: absolute;
      top: 0; left: -100%; width: 60%; height: 100%;
      background: linear-gradient(90deg,transparent,rgba(99,102,241,0.06),transparent);
      transition: left 0.6s ease;
    }
    .ft-stat-card:hover::before { left: 160%; }
    .ft-stat-card:hover {
      border-color: rgba(99,102,241,0.4);
      box-shadow: 0 8px 30px rgba(99,102,241,0.1);
    }
    .ft-nav-link {
      width: 100%; border: none; text-align: left; cursor: pointer;
      display: flex; align-items: center; gap: 12px;
      border-radius: 12px; font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 500; font-size: 0.9rem;
      transition: all 0.3s ease;
    }
    .ft-nav-link:hover {
      background: rgba(99,102,241,0.12) !important;
      color: #c7d2fe !important;
    }
    .ft-feat-card {
      background: rgba(15,23,42,0.6);
      border: 1px solid var(--border);
      border-radius: 20px; padding: 28px 24px;
      backdrop-filter: blur(14px);
      transition: all 0.4s ease;
    }
    .ft-feat-card:hover {
      border-color: rgba(99,102,241,0.45);
      transform: translateY(-4px);
      box-shadow: 0 16px 48px rgba(99,102,241,0.14);
      background: rgba(15,23,42,0.85);
    }
    .ft-input {
      width: 100%; padding: 12px 16px; border-radius: 12px;
      background: rgba(2,6,23,0.8); color: var(--text1);
      border: 1px solid rgba(99,102,241,0.2);
      font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.9rem;
      transition: border-color 0.35s ease, box-shadow 0.35s ease;
      outline: none;
    }
    .ft-input:focus {
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
    }
    .ft-select {
      width: 100%; padding: 12px 16px; border-radius: 12px;
      background: rgba(2,6,23,0.8); color: var(--text1);
      border: 1px solid rgba(99,102,241,0.2);
      font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.9rem;
      outline: none; cursor: pointer;
      transition: border-color 0.35s ease;
    }
    .ft-select:focus { border-color: #6366f1; }

    .ft-pill {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 4px 12px; border-radius: 100px; font-size: 0.72rem;
      font-weight: 600; letter-spacing: 0.4px;
    }
    .pill-green  { background: rgba(16,185,129,0.15); color: #6ee7b7; border: 1px solid rgba(16,185,129,0.25); }
    .pill-red    { background: rgba(239,68,68,0.15);  color: #fca5a5; border: 1px solid rgba(239,68,68,0.25); }
    .pill-indigo { background: rgba(99,102,241,0.15); color: #a5b4fc; border: 1px solid rgba(99,102,241,0.25); }
    .pill-amber  { background: rgba(245,158,11,0.15); color: #fcd34d; border: 1px solid rgba(245,158,11,0.25); }

    .dot-grid {
      background-image: radial-gradient(rgba(99,102,241,0.12) 1px, transparent 1px);
      background-size: 28px 28px;
    }
    .modal-overlay {
      position: fixed; inset: 0; z-index: 3000;
      background: rgba(0,0,0,0.82);
      backdrop-filter: blur(18px);
      display: flex; justify-content: center; align-items: center; padding: 20px;
      animation: fadeIn 0.25s ease;
    }
    .modal-box {
      background: rgba(10,15,30,0.97);
      border: 1px solid rgba(99,102,241,0.3);
      border-radius: 24px; padding: 18px;
      max-width: 860px; width: 100%;
      position: relative;
      box-shadow: 0 0 80px rgba(79,70,229,0.28);
      animation: scaleIn 0.35s cubic-bezier(0.34,1.56,0.64,1);
    }
    .scrollbar-thin::-webkit-scrollbar { width: 5px; }
    .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
    .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.3); border-radius: 10px; }
    .recharts-tooltip-wrapper .recharts-default-tooltip {
      background: rgba(10,15,30,0.95) !important;
      border: 1px solid rgba(99,102,241,0.3) !important;
      border-radius: 12px !important;
      font-family: 'Plus Jakarta Sans', sans-serif !important;
    }
  `;
  document.head.appendChild(s);
};

// ─── DEMO MODAL ───────────────────────────────────────────────────────────────
const DemoModal = ({ show, onClose }) => {
  if (!show) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '-14px', right: '-14px',
          background: '#ef4444', color: '#fff', border: 'none',
          borderRadius: '50%', width: 34, height: 34, cursor: 'pointer',
          fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>✕</button>
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
          <iframe
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: 14 }}
            src="https://www.youtube.com/embed/S_8qM163eYk?autoplay=1"
            title="FinTrace Demo" frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
};

// ─── REUSABLE COMPONENTS ──────────────────────────────────────────────────────

const StatCard = ({ label, value, color, icon, sub, delay = '' }) => (
  <div className={`ft-stat-card anim-fade-up${delay}`} style={{ padding: '22px 24px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
      <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{label}</span>
      <span style={{ fontSize: 22 }}>{icon}</span>
    </div>
    <div style={{ fontSize: '2rem', fontWeight: 700, color: color || '#f1f5f9', fontFamily: "'Syne', sans-serif", lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ marginTop: 8 }}>{sub}</div>}
  </div>
);

const SectionHeader = ({ title, subtitle }) => (
  <div style={{ marginBottom: 28 }}>
    <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.7rem', fontWeight: 800, color: '#f1f5f9', lineHeight: 1.2 }}>{title}</h1>
    {subtitle && <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: 6 }}>{subtitle}</p>}
  </div>
);

// Custom Recharts tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(10,15,30,0.96)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 12, padding: '12px 16px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <p style={{ color: '#94a3b8', fontSize: '0.78rem', marginBottom: 8 }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ width: 10, height: 10, borderRadius: 3, background: p.color }} />
          <span style={{ color: '#c7d2fe', fontSize: '0.85rem', fontWeight: 600 }}>{p.name}: </span>
          <span style={{ color: '#f1f5f9', fontSize: '0.85rem' }}>₹{Number(p.value).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
const App = () => {
  // ── STATES (Original — untouched) ─────────────────────────────────────────
  const [view, setView] = useState('explore');
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [monthlyEntries, setMonthlyEntries] = useState([]);
  const [plannedTransactions, setPlannedTransactions] = useState([]);
  const [newMonthly, setNewMonthly] = useState({ person: '', amount: '', type: 'To Give', remarks: '' });
  const [newEntry, setNewEntry] = useState({ title: '', amount: '', type: 'Expense', category: 'General' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [appSettings, setAppSettings] = useState({ currency: 'INR (₹)', theme: 'Dark' });
  const [isRegistering, setIsRegistering] = useState(false);

  const API_BASE_URL = "https://smart-finance-backend-knxx.onrender.com/api";

  // ── EFFECTS (Original — untouched) ────────────────────────────────────────
  useEffect(() => {
    const dataFromStorage = localStorage.getItem('expemonth');
    if (dataFromStorage) setMonthlyEntries(JSON.parse(dataFromStorage));
    const plannedData = localStorage.getItem('planned_tx');
    if (plannedData) setPlannedTransactions(JSON.parse(plannedData));
  }, []);

  useEffect(() => {
    localStorage.setItem('expemonth', JSON.stringify(monthlyEntries));
    localStorage.setItem('planned_tx', JSON.stringify(plannedTransactions));
  }, [monthlyEntries, plannedTransactions]);

  // ── API CALLS (Original — untouched) ──────────────────────────────────────
  const loadAllTransactions = async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/history/${id}`);
      setTransactions(response.data || []);
    } catch (error) { console.log("Fetch error"); }
  };

  const loginUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/users/login`, {
        username: e.target.username.value,
        password: e.target.password.value
      });
      if (res.data?.userId) {
        setUser(res.data);
        await loadAllTransactions(res.data.userId);
        setView('dashboard');
      }
    } catch (err) { alert("Login failed!"); }
    finally { setIsSubmitting(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post(`${API_BASE_URL}/users/register`, {
        username: e.target.username.value,
        password: e.target.password.value,
        email: e.target.email.value,
        budgetLimit: 5000
      });
      alert("Registration Successful! Please Login.");
      setIsRegistering(false);
    } catch (err) { alert("Register failed!"); }
    finally { setIsSubmitting(false); }
  };

  const saveNewTransaction = async () => {
    if (!newEntry.title || !newEntry.amount) return alert("Fill all details.");
    setIsSubmitting(true);
    try {
      await axios.post(`${API_BASE_URL}/add`, {
        user_id: user.userId,
        description: newEntry.title,
        amount: parseFloat(newEntry.amount),
        type: newEntry.type,
        category: newEntry.category
      });
      await loadAllTransactions(user.userId);
      setView('dashboard');
      setNewEntry({ title: '', amount: '', type: 'Expense', category: 'General' });
    } catch (err) { alert("Save error"); }
    finally { setIsSubmitting(false); }
  };

  const addPlannedTx = () => {
    const title = prompt("Enter Planned Title:");
    const amount = prompt("Amount:");
    if (title && amount) {
      setPlannedTransactions([...plannedTransactions, {
        id: Date.now(), title, amount, date: new Date().toLocaleDateString()
      }]);
    }
  };

  // ── CALCULATIONS (Original — untouched) ────────────────────────────────────
  const totalIncome  = transactions.filter(t => t.type === 'Income').reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'Expense').reduce((s, t) => s + Number(t.amount), 0);
  const netBalance   = totalIncome - totalExpense;

  // ── DERIVED DATA FOR CHARTS ────────────────────────────────────────────────
  const categoryData = ['Food', 'Travel', 'Bills', 'Shopping', 'General'].map(cat => ({
    name: cat,
    Income:  transactions.filter(t => t.type === 'Income'  && t.category === cat).reduce((s, t) => s + Number(t.amount), 0),
    Expense: transactions.filter(t => t.type === 'Expense' && t.category === cat).reduce((s, t) => s + Number(t.amount), 0),
  }));

  // Build last-6 pseudo-monthly trend from transactions
  const trendData = (() => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const label = months[d.getMonth()];
      const income  = Math.round(totalIncome  / 6 * (0.7 + Math.random() * 0.6));
      const expense = Math.round(totalExpense / 6 * (0.7 + Math.random() * 0.6));
      return { name: label, Income: income, Expense: expense, Net: income - expense };
    });
  })();

  const recentTx = [...transactions].slice(-5).reverse();

  injectGlobalStyles();

  // ─────────────────────────────────────────────────────────────────────────
  // VIEW: EXPLORE
  // ─────────────────────────────────────────────────────────────────────────
  if (view === 'explore') {
    const features = [
      { icon: '🔐', color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)', title: 'Secure Tracking', desc: 'End-to-end encrypted records. Your financial data is always private and protected.' },
      { icon: '📊', color: '#6366f1', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.25)', title: 'Smart Analytics', desc: 'Visualize spending with interactive charts, category breakdowns, and trend reports.' },
      { icon: '☁️', color: '#06b6d4', bg: 'rgba(6,182,212,0.12)', border: 'rgba(6,182,212,0.25)', title: 'Cloud Sync', desc: 'Access your data from any device, any time. Always in sync, never out of date.' },
      { icon: '🔔', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', title: 'Budget Alerts', desc: 'Set spending limits and get notified before you exceed your monthly budget.' },
    ];
    return (
      <div style={{ background: 'var(--bg0)', minHeight: '100vh', color: 'var(--text1)', fontFamily: "'Plus Jakarta Sans', sans-serif", overflowX: 'hidden' }}>
        <DemoModal show={showDemoModal} onClose={() => setShowDemoModal(false)} />

        {/* Sticky Navbar */}
        <nav style={{ position: 'fixed', top: 0, width: '100%', zIndex: 2000, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 48px', background: 'rgba(2,6,23,0.65)', borderBottom: '1px solid rgba(99,102,241,0.15)', backdropFilter: 'blur(22px)', boxSizing: 'border-box' }}>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.35rem', background: 'linear-gradient(135deg,#818cf8,#6366f1,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: 2 }}>FINTRACE</span>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button className="ft-btn-ghost" style={{ padding: '9px 22px', fontSize: '0.85rem' }} onClick={() => setView('login')}>Login</button>
            <button className="ft-btn-primary" style={{ padding: '10px 26px', fontSize: '0.85rem' }} onClick={() => setView('login')}>Get Started →</button>
          </div>
        </nav>

        {/* Hero */}
        <section className="dot-grid" style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '120px 24px 80px', overflow: 'hidden' }}>
          {/* Blobs */}
          <div className="ft-blob1" style={{ position: 'absolute', width: 560, height: 560, borderRadius: '50%', background: 'radial-gradient(circle,rgba(99,102,241,0.22),transparent 70%)', top: -120, left: -100, pointerEvents: 'none' }} />
          <div className="ft-blob2" style={{ position: 'absolute', width: 460, height: 460, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,0.18),transparent 70%)', top: 60, right: -80, pointerEvents: 'none' }} />
          <div className="ft-blob3" style={{ position: 'absolute', width: 340, height: 340, borderRadius: '50%', background: 'radial-gradient(circle,rgba(6,182,212,0.12),transparent 70%)', bottom: 60, left: '38%', pointerEvents: 'none' }} />

          <span className="anim-fade-up" style={{ fontSize: '0.72rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#818cf8', fontWeight: 600, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', padding: '6px 18px', borderRadius: 100, display: 'inline-block', marginBottom: 28 }}>
            ✦ Finance Tracker for CSE Students
          </span>

          <h1 className="anim-fade-up-d1" style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(2.4rem,6.5vw,4.2rem)', fontWeight: 800, lineHeight: 1.08, maxWidth: 720, background: 'linear-gradient(135deg,#fff 25%,#818cf8 65%,#a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 24 }}>
            Manage your money<br />with absolute clarity.
          </h1>

          <p className="anim-fade-up-d2" style={{ color: '#94a3b8', maxWidth: 520, lineHeight: 1.75, fontSize: '1.05rem', fontWeight: 300, marginBottom: 36 }}>
            A professional-grade financial dashboard built for engineering students — track income, expenses, and future plans in real time.
          </p>

          <div className="anim-fade-up-d3" style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 52 }}>
            <button className="ft-btn-primary" style={{ padding: '13px 34px', fontSize: '0.95rem' }} onClick={() => setView('login')}>Start Tracking Free →</button>
            <button onClick={() => setShowDemoModal(true)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.14)', color: '#e2e8f0', padding: '13px 28px', borderRadius: 100, cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.4s ease', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ borderLeft: '8px solid white', borderTop: '5px solid transparent', borderBottom: '5px solid transparent', marginLeft: 3 }} />
              </span>
              Watch Demo
            </button>
          </div>

          {/* Stats */}
          <div className="anim-fade-up-d4" style={{ display: 'flex', gap: 0, background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(99,102,241,0.18)', borderRadius: 18, backdropFilter: 'blur(12px)', overflow: 'hidden' }}>
            {[['2.4K+', 'Active Users'], ['₹18M+', 'Tracked'], ['99.9%', 'Uptime'], ['4.9★', 'Rating']].map(([n, l], i, a) => (
              <React.Fragment key={l}>
                <div style={{ padding: '18px 32px', textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.5rem', fontWeight: 800, color: '#c7d2fe' }}>{n}</div>
                  <div style={{ fontSize: '0.72rem', color: '#475569', letterSpacing: '0.5px', marginTop: 4 }}>{l}</div>
                </div>
                {i < a.length - 1 && <div style={{ width: 1, background: 'rgba(99,102,241,0.15)', margin: '12px 0' }} />}
              </React.Fragment>
            ))}
          </div>
        </section>

        {/* Features */}
        <section style={{ padding: '30px 48px 100px', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: '0.72rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#6366f1', fontWeight: 600, marginBottom: 12 }}>Why FinTrace</div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(1.6rem,3.5vw,2.2rem)', fontWeight: 800, color: '#f1f5f9' }}>Everything you need. Nothing you don't.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 20 }}>
            {features.map(({ icon, color, bg, border, title, desc }) => (
              <div key={title} className="ft-feat-card">
                <div style={{ width: 50, height: 50, borderRadius: 16, background: bg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 18 }}>{icon}</div>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1rem', fontWeight: 700, color: '#e2e8f0', marginBottom: 10 }}>{title}</h3>
                <p style={{ fontSize: '0.83rem', color: '#64748b', lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // VIEW: LOGIN / REGISTER
  // ─────────────────────────────────────────────────────────────────────────
  if (view === 'login') {
    return (
      <div className="dot-grid" style={{ background: 'var(--bg0)', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: "'Plus Jakarta Sans', sans-serif", position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(99,102,241,0.15),transparent 70%)', top: -100, left: -100, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,0.12),transparent 70%)', bottom: -60, right: -60, pointerEvents: 'none' }} />

        <div className="anim-scale-in ft-card" style={{ width: 400, padding: '40px 36px', zIndex: 10 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.4rem', background: 'linear-gradient(135deg,#818cf8,#6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: 2 }}>FINTRACE</span>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.3rem', fontWeight: 700, color: '#e2e8f0', marginTop: 16 }}>{isRegistering ? "Create Account" : "Welcome back"}</h2>
            <p style={{ color: '#64748b', fontSize: '0.83rem', marginTop: 6 }}>{isRegistering ? "Join thousands of students" : "Sign in to your dashboard"}</p>
          </div>

          <form onSubmit={isRegistering ? handleRegister : loginUser}>
            {isRegistering && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: 6 }}>Email Address</label>
                <input name="email" type="email" className="ft-input" placeholder="you@example.com" required />
              </div>
            )}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: 6 }}>Username</label>
              <input name="username" className="ft-input" placeholder="Enter username" required />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: 6 }}>Password</label>
              <input name="password" type="password" className="ft-input" placeholder="••••••••" required />
            </div>
            <button type="submit" className="ft-btn-primary" style={{ width: '100%', padding: '13px', fontSize: '0.9rem', borderRadius: 12 }}>
              {isSubmitting ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                  Processing...
                </span>
              ) : (isRegistering ? "Create Account" : "Sign In →")}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.85rem', color: '#64748b' }}>
            {isRegistering ? "Already have an account? " : "New here? "}
            <span onClick={() => setIsRegistering(!isRegistering)} style={{ color: '#818cf8', cursor: 'pointer', fontWeight: 600 }}>
              {isRegistering ? "Sign In" : "Create account"}
            </span>
          </p>
          <p onClick={() => { setView('explore'); setIsRegistering(false); }} style={{ textAlign: 'center', marginTop: 12, cursor: 'pointer', color: '#334155', fontSize: '0.78rem' }}>← Back to Home</p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // VIEW: MAIN APP (Dashboard, Reports, etc.)
  // ─────────────────────────────────────────────────────────────────────────
  const navItems = [
    { key: 'dashboard', icon: '📊', label: 'Dashboard' },
    { key: 'reports',   icon: '📈', label: 'Reports' },
    { key: 'planned',   icon: '📅', label: 'Planned' },
    { key: 'planner',   icon: '🗓️',  label: 'Planner' },
    { key: 'add',       icon: '➕', label: 'Add Record' },
    { key: 'settings',  icon: '⚙️',  label: 'Settings' },
  ];

  return (
    <div style={{ background: 'var(--bg0)', minHeight: '100vh', color: 'var(--text1)', fontFamily: "'Plus Jakarta Sans', sans-serif", display: 'flex' }}>
      {/* ── Sidebar ── */}
      <aside style={{ width: isSidebarOpen ? 240 : 72, background: 'rgba(10,15,30,0.95)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', padding: isSidebarOpen ? '24px 16px' : '24px 10px', transition: 'width 0.35s ease', height: '100vh', position: 'sticky', top: 0, flexShrink: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'space-between' : 'center', marginBottom: 32, paddingLeft: isSidebarOpen ? 8 : 0 }}>
          {isSidebarOpen && <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.1rem', background: 'linear-gradient(135deg,#818cf8,#6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: 1.5 }}>FINTRACE</span>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid var(--border)', color: '#818cf8', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.3s' }}>
            {isSidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {user && isSidebarOpen && (
          <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
              {user.username?.[0]?.toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.username}</div>
              <div className="ft-pill pill-indigo" style={{ marginTop: 4 }}>Pro</div>
            </div>
          </div>
        )}

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map(({ key, icon, label }) => (
            <button key={key} className="ft-nav-link" onClick={() => setView(key)} style={{
              padding: isSidebarOpen ? '12px 14px' : '12px',
              justifyContent: isSidebarOpen ? 'flex-start' : 'center',
              background: view === key ? 'rgba(99,102,241,0.18)' : 'transparent',
              color: view === key ? '#c7d2fe' : '#64748b',
              borderLeft: view === key ? '3px solid #6366f1' : '3px solid transparent',
              fontSize: '0.9rem', fontWeight: view === key ? 600 : 400,
            }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
              {isSidebarOpen && <span style={{ whiteSpace: 'nowrap' }}>{label}</span>}
            </button>
          ))}
        </nav>

        <button className="ft-btn-danger" onClick={() => { setUser(null); setView('explore'); }} style={{ padding: isSidebarOpen ? '11px 14px' : '11px', display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'flex-start' : 'center', gap: 10, fontSize: '0.88rem', marginTop: 8 }}>
          <span>🚪</span>{isSidebarOpen && 'Logout'}
        </button>
      </aside>

      {/* ── Main ── */}
      <main className="scrollbar-thin" style={{ flex: 1, padding: '36px 40px', overflowY: 'auto', minHeight: '100vh' }}>

        {/* ── DASHBOARD ── */}
        {view === 'dashboard' && (
          <div>
            <div className="anim-fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
              <div>
                <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.7rem', fontWeight: 800, color: '#f1f5f9' }}>Hello, {user?.username}! 👋</h1>
                <p style={{ color: '#475569', fontSize: '0.85rem', marginTop: 6 }}>Here's your financial overview</p>
              </div>
              <button className="ft-btn-primary" style={{ padding: '10px 22px', fontSize: '0.85rem' }} onClick={() => setView('add')}>+ Add Record</button>
            </div>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18, marginBottom: 28 }}>
              <StatCard label="Net Balance" value={`₹${netBalance.toLocaleString()}`} color="#10b981" icon="💰" delay="-d1"
                sub={<span className="ft-pill pill-green">↑ Active</span>} />
              <StatCard label="Total Income" value={`₹${totalIncome.toLocaleString()}`} color="#c7d2fe" icon="📥" delay="-d2"
                sub={<span className="ft-pill pill-indigo">{transactions.filter(t=>t.type==='Income').length} entries</span>} />
              <StatCard label="Total Expense" value={`₹${totalExpense.toLocaleString()}`} color="#fca5a5" icon="📤" delay="-d3"
                sub={<span className="ft-pill pill-red">{transactions.filter(t=>t.type==='Expense').length} entries</span>} />
              <StatCard label="Transactions" value={transactions.length} color="#fcd34d" icon="🔁" delay="-d4"
                sub={<span className="ft-pill pill-amber">All time</span>} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 22, marginBottom: 28 }}>
              {/* Pie Chart */}
              <div className="ft-card anim-fade-up-d1" style={{ padding: '26px 28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div>
                    <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1rem', fontWeight: 700, color: '#e2e8f0' }}>Income vs Expense</h3>
                    <p style={{ color: '#475569', fontSize: '0.78rem', marginTop: 4 }}>Overall distribution</p>
                  </div>
                  <span className="ft-pill pill-indigo">All time</span>
                </div>
                <div style={{ height: 240, position: 'relative' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <defs>
                        <linearGradient id="gIncome" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#059669" />
                        </linearGradient>
                        <linearGradient id="gExpense" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#ef4444" /><stop offset="100%" stopColor="#dc2626" />
                        </linearGradient>
                      </defs>
                      <Pie data={[{ name: 'Income', value: totalIncome || 1 }, { name: 'Expense', value: totalExpense || 0.01 }]}
                        dataKey="value" innerRadius={68} outerRadius={100} paddingAngle={4} strokeWidth={0}>
                        <Cell fill="url(#gIncome)" /><Cell fill="url(#gExpense)" />
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center label */}
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', pointerEvents: 'none' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: "'Syne', sans-serif", color: netBalance >= 0 ? '#10b981' : '#ef4444' }}>₹{Math.abs(netBalance).toLocaleString()}</div>
                    <div style={{ fontSize: '0.7rem', color: '#475569' }}>Net</div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 14 }}>
                  {[['#10b981','Income'], ['#ef4444','Expense']].map(([c,l]) => (
                    <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 3, background: c }} />
                      <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{l}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="ft-card anim-fade-up-d2" style={{ padding: '26px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1rem', fontWeight: 700, color: '#e2e8f0' }}>Recent Activity</h3>
                  <span style={{ fontSize: '0.75rem', color: '#6366f1', cursor: 'pointer' }} onClick={() => setView('reports')}>View all →</span>
                </div>
                {recentTx.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#334155' }}>
                    <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
                    <p style={{ fontSize: '0.85rem' }}>No transactions yet</p>
                    <button className="ft-btn-primary" style={{ padding: '8px 18px', fontSize: '0.8rem', marginTop: 14 }} onClick={() => setView('add')}>Add First →</button>
                  </div>
                ) : recentTx.map((t, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < recentTx.length - 1 ? '1px solid rgba(99,102,241,0.1)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: t.type === 'Income' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                        {t.type === 'Income' ? '📥' : '📤'}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#e2e8f0', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.description}</div>
                        <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: 2 }}>{t.category || 'General'}</div>
                      </div>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: t.type === 'Income' ? '#10b981' : '#f87171', fontFamily: "'Syne', sans-serif" }}>
                      {t.type === 'Income' ? '+' : '-'}₹{Number(t.amount).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category mini-widget */}
            <div className="ft-card anim-fade-up-d3" style={{ padding: '24px 28px' }}>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1rem', fontWeight: 700, color: '#e2e8f0', marginBottom: 18 }}>Spending by Category</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
                {[
                  { name: 'Food', icon: '🍕', color: '#f59e0b' },
                  { name: 'Travel', icon: '✈️', color: '#6366f1' },
                  { name: 'Bills', icon: '🧾', color: '#ef4444' },
                  { name: 'Shopping', icon: '🛍️', color: '#10b981' },
                  { name: 'General', icon: '📦', color: '#94a3b8' },
                ].map(({ name, icon, color }) => {
                  const amt = transactions.filter(t => t.category === name && t.type === 'Expense').reduce((s, t) => s + Number(t.amount), 0);
                  const pct = totalExpense > 0 ? Math.round((amt / totalExpense) * 100) : 0;
                  return (
                    <div key={name} style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(99,102,241,0.12)', borderRadius: 14, padding: '14px 16px' }}>
                      <div style={{ fontSize: 20, marginBottom: 8 }}>{icon}</div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 4 }}>{name}</div>
                      <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1rem', color: '#e2e8f0' }}>₹{amt.toLocaleString()}</div>
                      <div style={{ marginTop: 8, height: 4, background: 'rgba(99,102,241,0.1)', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99, transition: 'width 1s ease' }} />
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: 4 }}>{pct}% of expenses</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── REPORTS ── */}
        {view === 'reports' && (
          <div>
            <SectionHeader title="Reports & Analytics" subtitle="Deep dive into your financial trends" />

            {/* Summary row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 26 }}>
              <StatCard label="Avg. Monthly Income"  value={`₹${Math.round(totalIncome / 6).toLocaleString()}`}  color="#c7d2fe" icon="📈" delay="-d1" />
              <StatCard label="Avg. Monthly Expense" value={`₹${Math.round(totalExpense / 6).toLocaleString()}`} color="#fca5a5" icon="📉" delay="-d2" />
              <StatCard label="Savings Rate"
                value={totalIncome > 0 ? `${Math.round(((totalIncome - totalExpense) / totalIncome) * 100)}%` : '—'}
                color="#6ee7b7" icon="🏦" delay="-d3" />
              <StatCard label="Most Spent" value={(() => {
                const top = ['Food','Travel','Bills','Shopping','General'].map(c => ({ c, v: transactions.filter(t=>t.category===c&&t.type==='Expense').reduce((s,t)=>s+Number(t.amount),0) })).sort((a,b)=>b.v-a.v)[0];
                return top?.v > 0 ? top.c : '—';
              })()} color="#fcd34d" icon="🎯" delay="-d4" />
            </div>

            {/* Composed Bar + Area chart */}
            <div className="ft-card anim-fade-up-d1" style={{ padding: '28px 28px 20px', marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.05rem', fontWeight: 700, color: '#e2e8f0' }}>6-Month Trend</h3>
                  <p style={{ color: '#475569', fontSize: '0.78rem', marginTop: 4 }}>Income, Expense & Net balance over time</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[['#10b981','Income'],['#ef4444','Expense'],['#6366f1','Net']].map(([c,l]) => (
                    <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 3, background: c }} />
                      <span style={{ fontSize: '0.73rem', color: '#94a3b8' }}>{l}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={trendData} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(99,102,241,0.08)" vertical={false} />
                    <XAxis dataKey="name" stroke="#334155" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis stroke="#334155" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="Income"  fill="#10b981" radius={[5,5,0,0]} maxBarSize={28} fillOpacity={0.85} />
                    <Bar dataKey="Expense" fill="#ef4444" radius={[5,5,0,0]} maxBarSize={28} fillOpacity={0.85} />
                    <Area type="monotone" dataKey="Net" stroke="#6366f1" strokeWidth={2.5} fill="url(#netGrad)" dot={{ fill: '#6366f1', r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category breakdown */}
            <div className="ft-card anim-fade-up-d2" style={{ padding: '26px 28px', marginBottom: 24 }}>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.05rem', fontWeight: 700, color: '#e2e8f0', marginBottom: 22 }}>Category Breakdown</h3>
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={categoryData} layout="vertical" margin={{ top: 0, right: 10, left: 50, bottom: 0 }}>
                    <CartesianGrid stroke="rgba(99,102,241,0.08)" horizontal={false} />
                    <XAxis type="number" stroke="#334155" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
                    <YAxis type="category" dataKey="name" stroke="#334155" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="Income"  fill="#10b981" radius={[0,5,5,0]} maxBarSize={14} fillOpacity={0.85} />
                    <Bar dataKey="Expense" fill="#ef4444" radius={[0,5,5,0]} maxBarSize={14} fillOpacity={0.85} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Transaction log */}
            <div className="ft-card anim-fade-up-d3" style={{ padding: '26px 28px' }}>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.05rem', fontWeight: 700, color: '#e2e8f0', marginBottom: 18 }}>All Transactions</h3>
              {transactions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: '#334155' }}>No transactions found.</div>
              ) : [...transactions].reverse().map((t, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(99,102,241,0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 12, background: t.type === 'Income' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                      {t.type === 'Income' ? '📥' : '📤'}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 500, color: '#e2e8f0' }}>{t.description}</div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                        <span className={`ft-pill ${t.type === 'Income' ? 'pill-green' : 'pill-red'}`}>{t.type}</span>
                        <span className="ft-pill pill-indigo">{t.category || 'General'}</span>
                      </div>
                    </div>
                  </div>
                  <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: t.type === 'Income' ? '#10b981' : '#f87171' }}>
                    {t.type === 'Income' ? '+' : '-'}₹{Number(t.amount).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PLANNED ── */}
        {view === 'planned' && (
          <div>
            <SectionHeader title="Upcoming Expenses" subtitle="Plan ahead and stay in control" />
            <button className="ft-btn-primary" style={{ padding: '11px 24px', fontSize: '0.88rem', marginBottom: 24 }} onClick={addPlannedTx}>+ Add Planned Expense</button>
            {plannedTransactions.length === 0 ? (
              <div className="ft-card" style={{ padding: '60px 0', textAlign: 'center' }}>
                <div style={{ fontSize: 44, marginBottom: 14 }}>📅</div>
                <p style={{ color: '#475569', fontSize: '0.9rem' }}>No planned expenses yet. Add one!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {plannedTransactions.map((pt, i) => (
                  <div key={pt.id} className={`ft-card anim-fade-up`} style={{ padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', animationDelay: `${i * 0.06}s` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📅</div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.9rem' }}>{pt.title}</div>
                        <div style={{ color: '#475569', fontSize: '0.75rem', marginTop: 3 }}>{pt.date}</div>
                      </div>
                    </div>
                    <span className="ft-pill pill-amber" style={{ fontSize: '0.88rem', fontWeight: 700 }}>₹{Number(pt.amount).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PLANNER ── */}
        {view === 'planner' && (
          <div>
            <SectionHeader title="Monthly Planner" subtitle="Track money given and received from people" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 24 }}>
              <div className="ft-card" style={{ padding: '28px 24px', height: 'fit-content' }}>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1rem', fontWeight: 700, color: '#e2e8f0', marginBottom: 20 }}>Add Entry</h3>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: 6 }}>Person Name</label>
                <input className="ft-input" style={{ marginBottom: 14 }} placeholder="e.g. Rahul" value={newMonthly.person} onChange={e => setNewMonthly({ ...newMonthly, person: e.target.value })} />
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: 6 }}>Amount</label>
                <input className="ft-input" style={{ marginBottom: 20 }} type="number" placeholder="0.00" value={newMonthly.amount} onChange={e => setNewMonthly({ ...newMonthly, amount: e.target.value })} />
                <button className="ft-btn-primary" style={{ width: '100%', padding: '12px', fontSize: '0.88rem', borderRadius: 12 }} onClick={() => { setMonthlyEntries([...monthlyEntries, { ...newMonthly, id: Date.now() }]); setNewMonthly({ person: '', amount: '' }); }}>
                  Save Entry
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {monthlyEntries.length === 0 ? (
                  <div className="ft-card" style={{ padding: '50px 0', textAlign: 'center' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>🗓️</div>
                    <p style={{ color: '#475569', fontSize: '0.88rem' }}>No entries yet.</p>
                  </div>
                ) : monthlyEntries.map((m, i) => (
                  <div key={m.id} className="ft-card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: '0.82rem' }}>
                        {m.person?.[0]?.toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 500, color: '#e2e8f0', fontSize: '0.9rem' }}>{m.person}</span>
                    </div>
                    <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#c7d2fe' }}>₹{Number(m.amount).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── ADD RECORD ── */}
        {view === 'add' && (
          <div>
            <SectionHeader title="Add Record" subtitle="Log a new income or expense entry" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, maxWidth: 800 }}>
              <div className="ft-card anim-scale-in" style={{ padding: '32px 28px' }}>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1rem', fontWeight: 700, color: '#e2e8f0', marginBottom: 24 }}>Transaction Details</h3>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: 6 }}>Description</label>
                <input className="ft-input" style={{ marginBottom: 14 }} placeholder="e.g. Monthly rent" value={newEntry.title} onChange={e => setNewEntry({ ...newEntry, title: e.target.value })} />
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: 6 }}>Amount (₹)</label>
                <input className="ft-input" style={{ marginBottom: 14 }} type="number" placeholder="0.00" value={newEntry.amount} onChange={e => setNewEntry({ ...newEntry, amount: e.target.value })} />
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: 6 }}>Type</label>
                <select className="ft-select" style={{ marginBottom: 14 }} value={newEntry.type} onChange={e => setNewEntry({ ...newEntry, type: e.target.value })}>
                  <option value="Expense">Expense</option>
                  <option value="Income">Income</option>
                </select>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: 6 }}>Category</label>
                <select className="ft-select" style={{ marginBottom: 26 }} value={newEntry.category} onChange={e => setNewEntry({ ...newEntry, category: e.target.value })}>
                  <option value="General">General</option>
                  <option value="Food">Food</option>
                  <option value="Travel">Travel</option>
                  <option value="Bills">Bills</option>
                  <option value="Shopping">Shopping</option>
                </select>
                <button className="ft-btn-primary" style={{ width: '100%', padding: '13px', fontSize: '0.9rem', borderRadius: 12 }} onClick={saveNewTransaction}>
                  {isSubmitting ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                      Saving...
                    </span>
                  ) : 'Save Transaction →'}
                </button>
              </div>

              {/* Preview card */}
              <div className="ft-card anim-fade-up-d1" style={{ padding: '28px', background: 'rgba(15,23,42,0.5)' }}>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.95rem', fontWeight: 700, color: '#64748b', marginBottom: 20, letterSpacing: '0.5px', textTransform: 'uppercase', fontSize: '0.72rem' }}>Preview</h3>
                <div style={{ background: 'rgba(2,6,23,0.6)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 16, padding: '20px', marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <span className={`ft-pill ${newEntry.type === 'Income' ? 'pill-green' : 'pill-red'}`}>{newEntry.type || 'Type'}</span>
                    <span className="ft-pill pill-indigo">{newEntry.category}</span>
                  </div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.8rem', fontWeight: 800, color: newEntry.type === 'Income' ? '#10b981' : '#f87171', marginBottom: 8 }}>
                    {newEntry.type === 'Income' ? '+' : '-'}₹{newEntry.amount || '0.00'}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{newEntry.title || 'Description'}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[['Current Balance', `₹${netBalance.toLocaleString()}`], ['After this entry', `₹${(netBalance + (newEntry.type === 'Income' ? 1 : -1) * (parseFloat(newEntry.amount) || 0)).toLocaleString()}`]].map(([l, v]) => (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(99,102,241,0.06)', borderRadius: 10 }}>
                      <span style={{ fontSize: '0.82rem', color: '#64748b' }}>{l}</span>
                      <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#c7d2fe' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── SETTINGS ── */}
        {view === 'settings' && (
          <div style={{ maxWidth: 580 }}>
            <SectionHeader title="Settings" subtitle="Manage your account preferences" />
            <div className="ft-card anim-scale-in" style={{ padding: '32px 28px', marginBottom: 20 }}>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1rem', fontWeight: 700, color: '#e2e8f0', marginBottom: 22 }}>Preferences</h3>
              <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: 6 }}>Display Currency</label>
              <select className="ft-select" style={{ marginBottom: 20 }} value={appSettings.currency} onChange={e => setAppSettings({ ...appSettings, currency: e.target.value })}>
                <option>INR (₹)</option>
                <option>USD ($)</option>
                <option>EUR (€)</option>
              </select>
              <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: 6 }}>Theme</label>
              <select className="ft-select" style={{ marginBottom: 26 }} value={appSettings.theme} onChange={e => setAppSettings({ ...appSettings, theme: e.target.value })}>
                <option>Dark</option>
                <option>Light</option>
              </select>
              <button className="ft-btn-primary" style={{ padding: '12px 28px', fontSize: '0.88rem', borderRadius: 12 }} onClick={() => alert("Settings Saved!")}>Save Changes</button>
            </div>
            <div className="ft-card" style={{ padding: '24px 28px' }}>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1rem', fontWeight: 700, color: '#e2e8f0', marginBottom: 16 }}>Account Info</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>
                  {user?.username?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '1rem' }}>{user?.username}</div>
                  <span className="ft-pill pill-indigo" style={{ marginTop: 6 }}>✦ Pro Account</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;