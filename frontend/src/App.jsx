import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, CartesianGrid, XAxis, YAxis } from 'recharts';

// ─── STYLES & CONFIG ─────────────────────────────────────────────────────────

const exploreStyles = {
  blob: {
    position: 'absolute', borderRadius: '50%', filter: 'blur(90px)',
    opacity: 0.18, pointerEvents: 'none',
  },
  eyebrow: {
    fontSize: '0.75rem', letterSpacing: '3px', textTransform: 'uppercase',
    color: '#818cf8', fontWeight: 500, background: 'rgba(99,102,241,0.1)',
    border: '1px solid rgba(99,102,241,0.3)', padding: '6px 16px',
    borderRadius: '100px', display: 'inline-block',
  },
  gradHeading: {
    fontSize: 'clamp(2.2rem, 6vw, 3.8rem)', fontWeight: 800,
    lineHeight: 1.1, maxWidth: '700px', textAlign: 'center',
    background: 'linear-gradient(135deg, #fff 30%, #818cf8 70%, #a78bfa 100%)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  demoBtn: {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)',
    color: '#e2e8f0', padding: '10px 26px', borderRadius: '100px',
    cursor: 'pointer', fontSize: '0.85rem', display: 'flex',
    alignItems: 'center', gap: '8px',
  },
  featureCard: {
    background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(99,102,241,0.15)',
    borderRadius: '18px', padding: '28px 24px',
    backdropFilter: 'blur(12px)', transition: 'all 0.3s',
  },
};

const injectStyles = () => {
  if (document.getElementById('ft-animations')) return;
  const style = document.createElement('style');
  style.id = 'ft-animations';
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
    @keyframes drift1 { from { transform: translate(0,0) scale(1); } to { transform: translate(40px,30px) scale(1.1); } }
    @keyframes drift2 { from { transform: translate(0,0) scale(1); } to { transform: translate(-30px,40px) scale(1.05); } }
    @keyframes drift3 { from { transform: translate(0,0) scale(1); } to { transform: translate(20px,-20px) scale(1.08); } }
    .ft-blob1 { animation: drift1 8s ease-in-out infinite alternate; }
    .ft-blob2 { animation: drift2 10s ease-in-out infinite alternate; }
    .ft-blob3 { animation: drift3 12s ease-in-out infinite alternate; }
    .ft-feat-card:hover { border-color: rgba(99,102,241,0.4) !important; transform: translateY(-3px); background: rgba(30,41,59,0.7) !important; }
    .ft-modal-enter { animation: modalIn 0.3s cubic-bezier(0.34,1.56,0.64,1); }
    @keyframes modalIn { from { opacity:0; transform: scale(0.88); } to { opacity:1; transform: scale(1); } }
  `;
  document.head.appendChild(style);
};

const features = [
  { title: 'Secure Tracking', desc: 'Data is encrypted. Your records stay private.', icon: '🛡️' },
  { title: 'Smart Analytics', desc: 'Visual breakdowns of your expenses.', icon: '📈' },
  { title: 'Cloud Sync', desc: 'Access your data from any device.', icon: '☁️' },
  { title: 'Budget Alerts', desc: 'Get notified before you overspend.', icon: '🔔' },
];

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

const DemoModal = ({ show, onClose }) => {
  if (!show) return null;
  return (
    <div onClick={onClose} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 3000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', backdropFilter: 'blur(16px)' }}>
      <div className="ft-modal-enter" onClick={e => e.stopPropagation()} style={{ background: 'rgba(15,23,42,0.95)', padding: '16px', borderRadius: '22px', border: '1px solid rgba(99,102,241,0.3)', maxWidth: '860px', width: '100%', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '-16px', right: '-16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
          <iframe style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '12px' }} src="https://www.youtube.com/embed/S_8qM163eYk?autoplay=1" title="Demo" frameBorder="0" allowFullScreen />
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [view, setView] = useState('explore');
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [monthlyEntries, setMonthlyEntries] = useState([]);
  const [plannedTransactions, setPlannedTransactions] = useState([]);
  const [newEntry, setNewEntry] = useState({ title: '', amount: '', type: 'Expense', category: 'General' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const API_BASE_URL = "https://smart-finance-backend-knxx.onrender.com/api";

  useEffect(() => {
    const dataFromStorage = localStorage.getItem('expemonth');
    if (dataFromStorage) setMonthlyEntries(JSON.parse(dataFromStorage));
  }, []);

  // API Logic
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
      const res = await axios.post(`${API_BASE_URL}/users/login`, { username: e.target.username.value, password: e.target.password.value });
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
      await axios.post(`${API_BASE_URL}/users/register`, { username: e.target.username.value, password: e.target.password.value, email: e.target.email.value, budgetLimit: 5000 });
      alert("Success! Now Login.");
      setIsRegistering(false);
    } catch (err) { alert("Register failed!"); }
    finally { setIsSubmitting(false); }
  };

  const saveNewTransaction = async () => {
    if (!newEntry.title || !newEntry.amount) return alert("Fill all details.");
    setIsSubmitting(true);
    try {
      await axios.post(`${API_BASE_URL}/add`, { user_id: user.userId, description: newEntry.title, amount: parseFloat(newEntry.amount), type: newEntry.type, category: newEntry.category });
      await loadAllTransactions(user.userId);
      setView('dashboard');
    } catch (err) { alert("Save error"); }
    finally { setIsSubmitting(false); }
  };

  // Calculations
  const totalIncome = transactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + Number(t.amount), 0);
  const netBalance = totalIncome - totalExpense;

  const styles = {
    mainWrapper: { backgroundColor: '#020617', minHeight: '100vh', color: '#e2e8f0', fontFamily: "'DM Sans', sans-serif" },
    commonCard: { backgroundColor: '#1e293b', padding: '25px', borderRadius: '15px', border: '1px solid #334155' },
    inputBox: { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '10px', background: '#020617', color: 'white', border: '1px solid #475569', boxSizing: 'border-box' },
    primaryBtn: { padding: '12px 25px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '100px', cursor: 'pointer', fontWeight: 'bold' }
  };

  // ─── VIEWS ─────────────────────────────────────────────────────────────────

  if (view === 'explore') {
    injectStyles();
    return (
      <div style={styles.mainWrapper}>
        <DemoModal show={showDemoModal} onClose={() => setShowDemoModal(false)} />
        <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 40px', background: 'rgba(2,6,23,0.6)', position: 'fixed', width: '100%', top: 0, zIndex: 2000, backdropFilter: 'blur(20px)', boxSizing: 'border-box', borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, color: '#818cf8', letterSpacing: '2px' }}>FINTRACE</span>
          <div>
            <button onClick={() => setView('login')} style={{ background: 'transparent', border: 'none', color: '#a5b4fc', marginRight: '20px', cursor: 'pointer' }}>Login</button>
            <button onClick={() => setView('login')} style={styles.primaryBtn}>Get Started →</button>
          </div>
        </nav>

        <section style={{ position: 'relative', paddingTop: '130px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', overflow: 'hidden', padding: '130px 20px 80px' }}>
          <div className="ft-blob1" style={{ ...exploreStyles.blob, width: 500, height: 500, background: 'radial-gradient(circle, #6366f1, transparent)', top: -100, left: -80 }} />
          <span style={exploreStyles.eyebrow}>✦ CSE Student Finance Tracker</span>
          <h1 style={exploreStyles.gradHeading}>Manage money<br />with clarity.</h1>
          <p style={{ color: '#94a3b8', maxWidth: '520px', lineHeight: 1.7, marginTop: '20px' }}>Professional financial tracking built for students — visualize your money in real time.</p>
          <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
            <button onClick={() => setView('login')} style={styles.primaryBtn}>Start Free →</button>
            <button style={exploreStyles.demoBtn} onClick={() => setShowDemoModal(true)}>Watch Demo</button>
          </div>
        </section>

        <section style={{ padding: '40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', maxWidth: '1000px', margin: '0 auto' }}>
          {features.map(f => (
            <div key={f.title} className="ft-feat-card" style={exploreStyles.featureCard}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{f.icon}</div>
              <h3 style={{ fontFamily: "'Syne', sans-serif" }}>{f.title}</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{f.desc}</p>
            </div>
          ))}
        </section>
      </div>
    );
  }

  if (view === 'login') {
    return (
      <div style={{ ...styles.mainWrapper, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ ...styles.commonCard, width: '380px' }}>
          <h2 style={{ textAlign: 'center', color: '#6366f1' }}>{isRegistering ? "Create Account" : "Login"}</h2>
          <form onSubmit={isRegistering ? handleRegister : loginUser}>
            {isRegistering && <input name="email" type="email" style={styles.inputBox} placeholder="Email" required />}
            <input name="username" style={styles.inputBox} placeholder="Username" required />
            <input name="password" type="password" style={styles.inputBox} placeholder="Password" required />
            <button type="submit" style={{ ...styles.primaryBtn, width: '100%' }}>{isSubmitting ? "Processing..." : (isRegistering ? "Register" : "Login")}</button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '20px' }}>
            <span onClick={() => setIsRegistering(!isRegistering)} style={{ color: '#6366f1', cursor: 'pointer' }}>{isRegistering ? "Already have an account? Login" : "New user? Register now"}</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...styles.mainWrapper, display: 'flex' }}>
      {/* Sidebar & Dashboard Content (Remains same as your previous stable version) */}
      <aside style={{ width: '260px', background: '#0f172a', padding: '20px', height: '100vh', position: 'sticky', top: 0 }}>
        <h2 style={{ color: '#6366f1' }}>FINTRACE</h2>
        <nav style={{ marginTop: '40px' }}>
          <button style={{ width: '100%', padding: '12px', marginBottom: '10px', background: view === 'dashboard' ? '#4f46e5' : 'transparent', border: 'none', color: 'white', textAlign: 'left', borderRadius: '10px', cursor: 'pointer' }} onClick={() => setView('dashboard')}>📊 Dashboard</button>
          <button style={{ width: '100%', padding: '12px', background: view === 'add' ? '#4f46e5' : 'transparent', border: 'none', color: 'white', textAlign: 'left', borderRadius: '10px', cursor: 'pointer' }} onClick={() => setView('add')}>➕ Add Record</button>
        </nav>
        <button style={{ position: 'absolute', bottom: 20, width: '85%', padding: '10px', background: '#ef4444', border: 'none', color: 'white', borderRadius: '10px' }} onClick={() => setView('explore')}>Logout</button>
      </aside>

      <main style={{ flex: 1, padding: '40px' }}>
        {view === 'dashboard' ? (
          <div>
            <h1>Welcome, {user?.username}</h1>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginTop: '20px' }}>
              <div style={styles.commonCard}>Balance<h2 style={{ color: '#10b981' }}>₹{netBalance}</h2></div>
              <div style={styles.commonCard}>Income<h2>₹{totalIncome}</h2></div>
              <div style={styles.commonCard}>Expense<h2 style={{ color: '#ef4444' }}>₹{totalExpense}</h2></div>
            </div>
            {/* Chart */}
            <div style={{ ...styles.commonCard, marginTop: '30px', height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={[{ name: 'In', value: totalIncome || 1 }, { name: 'Out', value: totalExpense || 0 }]} dataKey="value" innerRadius={60} outerRadius={80}>
                    <Cell fill="#10b981" /><Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div style={{ ...styles.commonCard, maxWidth: '500px' }}>
            <h2>Add New Transaction</h2>
            <input style={styles.inputBox} placeholder="Description" onChange={e => setNewEntry({ ...newEntry, title: e.target.value })} />
            <input style={styles.inputBox} type="number" placeholder="Amount" onChange={e => setNewEntry({ ...newEntry, amount: e.target.value })} />
            <button style={styles.primaryBtn} onClick={saveNewTransaction}>Save</button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;