import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, CartesianGrid, XAxis, YAxis } from 'recharts';

// ─── STYLES & CONFIG FOR EXPLORE PAGE ─────────────────────────────────────────

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
    fontFamily: "'Syne', sans-serif"
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
    .ft-blob1 { animation: drift1 8s ease-in-out infinite alternate; }
    .ft-blob2 { animation: drift2 10s ease-in-out infinite alternate; }
    .ft-feat-card:hover { border-color: rgba(99,102,241,0.4) !important; transform: translateY(-3px); background: rgba(30,41,59,0.7) !important; }
  `;
  document.head.appendChild(style);
};

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

const DemoModal = ({ show, onClose }) => {
  if (!show) return null;
  return (
    <div onClick={onClose} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 3000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', backdropFilter: 'blur(16px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'rgba(15,23,42,0.95)', padding: '16px', borderRadius: '22px', border: '1px solid rgba(99,102,241,0.3)', maxWidth: '860px', width: '100%', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '-16px', right: '-16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
          <iframe style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '12px' }} src="https://www.youtube.com/embed/S_8qM163eYk?autoplay=1" title="Demo" frameBorder="0" allowFullScreen />
        </div>
      </div>
    </div>
  );
};

const App = () => {
  // --- States (Keeping All Your Original States) ---
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

  // --- Effects (Your Original Logic) ---
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

  // --- API Calls (Your Original Logic) ---
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
      setPlannedTransactions([...plannedTransactions, { id: Date.now(), title, amount, date: new Date().toLocaleDateString() }]);
    }
  };

  // --- Calculations ---
  const totalIncome = transactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + Number(t.amount), 0);
  const netBalance = totalIncome - totalExpense;

  // --- Styles ---
  const styles = {
    mainWrapper: { backgroundColor: '#020617', minHeight: '100vh', color: '#e2e8f0', fontFamily: "'DM Sans', sans-serif" },
    commonCard: { backgroundColor: '#1e293b', padding: '25px', borderRadius: '15px', border: '1px solid #334155' },
    inputBox: { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '10px', background: '#020617', color: 'white', border: '1px solid #475569', boxSizing: 'border-box' },
    primaryBtn: { padding: '12px 25px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' },
    sidePanel: { width: isSidebarOpen ? '260px' : '80px', background: '#0f172a', borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', padding: '20px', transition: '0.3s', height: '100vh', position: 'sticky', top: 0 },
    menuButton: (active) => ({ width: '100%', padding: '15px', marginBottom: '8px', borderRadius: '12px', border: 'none', textAlign: 'left', cursor: 'pointer', background: active ? '#4f46e5' : 'transparent', color: active ? 'white' : '#94a3b8', display: 'flex', gap: '15px', fontWeight: 'bold' }),
  };

  // ─── VIEW: EXPLORE (MODERN UI) ─────────────────────────────────────────────
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

        <section style={{ position: 'relative', paddingTop: '130px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', overflow: 'hidden', padding: '130px 20px 80px', minHeight: '100vh', boxSizing: 'border-box' }}>
          <div className="ft-blob1" style={{ ...exploreStyles.blob, width: 500, height: 500, background: 'radial-gradient(circle, #6366f1, transparent)', top: -100, left: -80 }} />
          <div className="ft-blob2" style={{ ...exploreStyles.blob, width: 400, height: 400, background: 'radial-gradient(circle, #a78bfa, transparent)', bottom: 50, right: -50 }} />
          
          <span style={exploreStyles.eyebrow}>✦ Finance Tracking for Students</span>
          <h1 style={exploreStyles.gradHeading}>Manage your money<br />with absolute clarity.</h1>
          <p style={{ color: '#94a3b8', maxWidth: '520px', lineHeight: 1.7, marginTop: '20px', fontSize: '1.1rem' }}>Professional dashboard for CSE students to track expenses, income, and future plans in real-time.</p>
          
          <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
            <button onClick={() => setView('login')} style={styles.primaryBtn}>Start Tracking Free →</button>
            <button style={exploreStyles.demoBtn} onClick={() => setShowDemoModal(true)}>Watch Demo Video</button>
          </div>
        </section>

        <section style={{ padding: '80px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '25px', maxWidth: '1100px', margin: '0 auto' }}>
          <div className="ft-feat-card" style={exploreStyles.featureCard}>
             <h3 style={{fontFamily:"'Syne', sans-serif", color: '#818cf8'}}>Smart Analytics</h3>
             <p style={{color: '#64748b', fontSize: '0.9rem'}}>Visualize your spending with interactive charts and real-time reports.</p>
          </div>
          <div className="ft-feat-card" style={exploreStyles.featureCard}>
             <h3 style={{fontFamily:"'Syne', sans-serif", color: '#818cf8'}}>Future Planning</h3>
             <p style={{color: '#64748b', fontSize: '0.9rem'}}>Add planned expenses and monthly budgets to stay ahead of your bills.</p>
          </div>
          <div className="ft-feat-card" style={exploreStyles.featureCard}>
             <h3 style={{fontFamily:"'Syne', sans-serif", color: '#818cf8'}}>Secure Cloud</h3>
             <p style={{color: '#64748b', fontSize: '0.9rem'}}>Your data is synced securely across the cloud, accessible from anywhere.</p>
          </div>
        </section>
      </div>
    );
  }

  // ─── VIEW: LOGIN / REGISTER ───────────────────────────────────────────────
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
          <p onClick={() => setView('explore')} style={{ textAlign: 'center', marginTop: '10px', cursor: 'pointer', color: '#94a3b8', fontSize: '0.8rem' }}>← Back to Home</p>
        </div>
      </div>
    );
  }

  // ─── VIEW: DASHBOARD & FEATURES (Your Main App) ───────────────────────────
  return (
    <div style={{ ...styles.mainWrapper, display: 'flex' }}>
      <aside style={styles.sidePanel}>
        <h2 style={{ color: '#6366f1', marginBottom: '30px' }}>{isSidebarOpen ? "FINTRACE" : "FT"}</h2>
        <nav style={{ flex: 1 }}>
          <button style={styles.menuButton(view === 'dashboard')} onClick={() => setView('dashboard')}>📊 {isSidebarOpen && "Dashboard"}</button>
          <button style={styles.menuButton(view === 'reports')} onClick={() => setView('reports')}>📈 {isSidebarOpen && "Reports"}</button>
          <button style={styles.menuButton(view === 'planned')} onClick={() => setView('planned')}>📅 {isSidebarOpen && "Planned"}</button>
          <button style={styles.menuButton(view === 'planner')} onClick={() => setView('planner')}>🗓️ {isSidebarOpen && "Planner"}</button>
          <button style={styles.menuButton(view === 'settings')} onClick={() => setView('settings')}>⚙️ {isSidebarOpen && "Settings"}</button>
          <button style={styles.menuButton(view === 'add')} onClick={() => setView('add')}>➕ {isSidebarOpen && "Add Record"}</button>
        </nav>
        <button style={{ ...styles.primaryBtn, background: '#ef4444' }} onClick={() => { setUser(null); setView('explore'); }}>Logout</button>
      </aside>

      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        {view === 'dashboard' && (
          <div>
            <h1>Hi, {user?.username}!</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', margin: '30px 0' }}>
              <div style={styles.commonCard}><span>Balance</span><h2 style={{color: '#10b981'}}>₹{netBalance}</h2></div>
              <div style={styles.commonCard}><span>Income</span><h2>₹{totalIncome}</h2></div>
              <div style={styles.commonCard}><span>Expense</span><h2 style={{color: '#ef4444'}}>₹{totalExpense}</h2></div>
            </div>
            <div style={{ ...styles.commonCard, height: '350px' }}>
              <h3>Income vs Expense</h3>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={[{name:'In', value:totalIncome || 1}, {name:'Out', value:totalExpense || 0.1}]} dataKey="value" innerRadius={60} outerRadius={100} paddingAngle={5}>
                    <Cell fill="#10b981" /><Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {view === 'reports' && (
          <div>
            <h1>Reports & Trends</h1>
            <div style={{ ...styles.commonCard, height: '350px', marginTop: '20px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={transactions}>
                  <CartesianGrid stroke="#334155" />
                  <XAxis dataKey="description" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{background:'#1e293b', border:'none'}} />
                  <Line type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {view === 'planned' && (
          <div>
            <h1>📅 Upcoming Expenses</h1>
            <button style={{...styles.primaryBtn, marginBottom:'20px'}} onClick={addPlannedTx}>+ Add Plan</button>
            <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
              {plannedTransactions.map(pt => (
                <div key={pt.id} style={{...styles.commonCard, display:'flex', justifyContent:'space-between'}}>
                  <span>{pt.title} ({pt.date})</span>
                  <b>₹{pt.amount}</b>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'planner' && (
          <div>
            <h1>🗓️ Monthly Planner</h1>
            <div style={{...styles.commonCard, maxWidth:'500px'}}>
              <input style={styles.inputBox} placeholder="Person Name" value={newMonthly.person} onChange={e => setNewMonthly({...newMonthly, person: e.target.value})} />
              <input style={styles.inputBox} type="number" placeholder="Amount" value={newMonthly.amount} onChange={e => setNewMonthly({...newMonthly, amount: e.target.value})} />
              <button style={{...styles.primaryBtn, width:'100%'}} onClick={() => {setMonthlyEntries([...monthlyEntries, {...newMonthly, id:Date.now()}]); setNewMonthly({person:'', amount:''})}}>Add Entry</button>
            </div>
            <div style={{marginTop:'30px'}}>
              {monthlyEntries.map(m => (
                <div key={m.id} style={{...styles.commonCard, marginBottom:'10px', display:'flex', justifyContent:'space-between'}}>
                  <span>{m.person}</span>
                  <span>₹{m.amount}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'settings' && (
          <div style={{ maxWidth: '500px' }}>
            <h1>⚙️ Settings</h1>
            <div style={styles.commonCard}>
               <label>Currency</label>
               <select style={styles.inputBox} value={appSettings.currency} onChange={e => setAppSettings({...appSettings, currency: e.target.value})}>
                 <option>INR (₹)</option><option>USD ($)</option>
               </select>
               <button style={{...styles.primaryBtn, width:'100%'}} onClick={() => alert("Settings Saved!")}>Save Changes</button>
            </div>
          </div>
        )}

        {view === 'add' && (
          <div style={{ ...styles.commonCard, maxWidth: '500px', margin: '0 auto' }}>
            <h2>Add Record</h2>
            <input style={styles.inputBox} placeholder="Description" value={newEntry.title} onChange={e => setNewEntry({ ...newEntry, title: e.target.value })} />
            <input style={styles.inputBox} type="number" placeholder="Amount" value={newEntry.amount} onChange={e => setNewEntry({ ...newEntry, amount: e.target.value })} />
            <select style={styles.inputBox} value={newEntry.type} onChange={e => setNewEntry({ ...newEntry, type: e.target.value })}>
              <option value="Expense">Expense</option>
              <option value="Income">Income</option>
            </select>
            <select style={styles.inputBox} value={newEntry.category} onChange={e => setNewEntry({...newEntry, category: e.target.value})}>
              <option value="General">General</option><option value="Food">Food</option><option value="Travel">Travel</option><option value="Bills">Bills</option>
            </select>
            <button style={{ ...styles.primaryBtn, width: '100%' }} onClick={saveNewTransaction}>{isSubmitting ? "Saving..." : "Save Transaction"}</button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;