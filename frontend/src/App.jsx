import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, CartesianGrid, XAxis, YAxis } from 'recharts';

// --- Demo Video Section ---
const DemoModal = ({ show, onClose }) => {
  if (!show) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.9)', zIndex: 3000,
      display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px',
      backdropFilter: 'blur(10px)'
    }} onClick={onClose}>
      <div style={{
        background: '#111827', padding: '15px', borderRadius: '20px',
        border: '2px solid #4f46e5', maxWidth: '850px', width: '100%',
        position: 'relative', boxShadow: '0 0 30px rgba(79, 70, 229, 0.4)'
      }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '-20px', right: '-20px',
          background: '#ef4444', color: 'white', border: 'none',
          borderRadius: '50%', width: '40px', height: '40px',
          cursor: 'pointer', fontWeight: 'bold', fontSize: '20px'
        }}>X</button>
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
          <iframe 
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '10px' }}
            src="https://www.youtube.com/embed/S_8qM163eYk?autoplay=1" 
            title="FinTrace Product Demo Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  // --- States ---
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

  // Backend URL - /api एकदाच वापरला आहे जेणेकरून कॉल करताना चुका होणार नाहीत
  const API_BASE_URL = "https://smart-finance-backend-knxx.onrender.com/api";
  const heroBackground = "https://images.unsplash.com/photo-1593640495253-23196b27a87f?auto=format&fit=crop&w=1471&q=80";

  // --- Effects ---
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

  // --- API Calls (Fixed Connections) ---
  const loadAllTransactions = async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/history/${id}`);
      setTransactions(response.data || []);
    } catch (error) { console.log("Fetching history error."); }
  };

  const loginUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const credentials = { username: e.target.username.value, password: e.target.password.value };
    try {
      const res = await axios.post(`${API_BASE_URL}/users/login`, credentials);
      if (res.data && res.data.userId) {
        setUser(res.data);
        await loadAllTransactions(res.data.userId);
        setView('dashboard');
      }
    } catch (err) { alert("Login failed! Check credentials."); }
    finally { setIsSubmitting(false); }
  };

  const saveNewTransaction = async () => {
    if (!newEntry.title || !newEntry.amount) return alert("Fill all details.");
    setIsSubmitting(true);
    try {
      await axios.post(`${API_BASE_URL}/add`, {
        user_id: user.userId, description: newEntry.title, amount: parseFloat(newEntry.amount),
        type: newEntry.type, category: newEntry.category
      });
      await loadAllTransactions(user.userId);
      setView('dashboard');
      setNewEntry({ title: '', amount: '', type: 'Expense', category: 'General' });
    } catch (err) { alert("Error saving transaction."); }
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
    mainWrapper: { backgroundColor: '#020617', minHeight: '100vh', color: '#e2e8f0', fontFamily: 'sans-serif' },
    navBar: { display: 'flex', justifyContent: 'space-between', padding: '15px 40px', background: 'rgba(15, 23, 42, 0.8)', borderBottom: '1px solid #1e293b', position: 'fixed', width: '100%', top: 0, zIndex: 2000, backdropFilter: 'blur(10px)', boxSizing: 'border-box' },
    sidePanel: { width: isSidebarOpen ? '260px' : '80px', background: '#0f172a', borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', padding: '20px', transition: '0.3s', height: '100vh', position: 'sticky', top: 0 },
    commonCard: { backgroundColor: '#1e293b', padding: '25px', borderRadius: '15px', border: '1px solid #334155' },
    menuButton: (active) => ({ width: '100%', padding: '15px', marginBottom: '8px', borderRadius: '12px', border: 'none', textAlign: 'left', cursor: 'pointer', background: active ? '#4f46e5' : 'transparent', color: active ? 'white' : '#94a3b8', display: 'flex', gap: '15px', fontWeight: 'bold' }),
    inputBox: { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '10px', background: '#020617', color: 'white', border: '1px solid #475569', boxSizing: 'border-box' },
    primaryBtn: { padding: '12px 25px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }
  };

  // --- Render Views ---
  if (view === 'explore') {
    return (
      <div style={styles.mainWrapper}>
        <DemoModal show={showDemoModal} onClose={() => setShowDemoModal(false)} />
        <nav style={styles.navBar}>
          <h2 style={{ color: '#6366f1', margin: 0 }}>FinTrace</h2>
          <div style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
             <span onClick={() => setView('login')} style={{cursor:'pointer'}}>Login</span>
             <button style={styles.primaryBtn} onClick={() => setView('login')}>Get Started</button>
          </div>
        </nav>
        <header style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', backgroundImage: `linear-gradient(rgba(2,6,23,0.8), rgba(2,6,23,0.95)), url(${heroBackground})`, backgroundSize: 'cover' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: '800' }}>Manage Your <span style={{ color: '#6366f1' }}>Money Better.</span></h1>
          <p style={{ maxWidth: '600px', color: '#94a3b8', fontSize: '1.2rem' }}>The most professional financial tracker for CSE students.</p>
          <div style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
            <button style={styles.primaryBtn} onClick={() => setView('login')}>Login Now</button>
            <button style={{ ...styles.primaryBtn, background: 'transparent', border: '2px solid #6366f1' }} onClick={() => setShowDemoModal(true)}>Watch Demo</button>
          </div>
        </header>
      </div>
    );
  }

  if (view === 'login') {
    return (
      <div style={{ ...styles.mainWrapper, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ ...styles.commonCard, width: '380px' }}>
          <h2 style={{ textAlign: 'center', color: '#6366f1' }}>Login</h2>
          <form onSubmit={loginUser}>
            <input name="username" style={styles.inputBox} placeholder="Username" required />
            <input name="password" type="password" style={styles.inputBox} placeholder="Password" required />
            <button type="submit" style={{ ...styles.primaryBtn, width: '100%' }}>{isSubmitting ? "Wait..." : "Login"}</button>
          </form>
          <p onClick={() => setView('explore')} style={{ textAlign: 'center', marginTop: '20px', cursor: 'pointer', color: '#94a3b8' }}>← Back</p>
        </div>
      </div>
    );
  }

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
          <button style={styles.menuButton(view === 'add')} onClick={() => setView('add')}>➕ {isSidebarOpen && "Add Money"}</button>
        </nav>
        <button style={{ ...styles.primaryBtn, background: '#ef4444' }} onClick={() => setUser(null) || setView('explore')}>Logout</button>
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
            <div style={{...styles.commonCard, marginTop:'20px'}}>
               <h3>Top Categories</h3>
               {['Food', 'Travel', 'Bills', 'Shopping', 'General'].map(cat => (
                 <div key={cat} style={{display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #334155'}}>
                   <span>{cat}</span>
                   <span>₹{transactions.filter(t => t.category === cat).reduce((s,t) => s + Number(t.amount), 0)}</span>
                 </div>
               ))}
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