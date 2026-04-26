import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, Legend } from 'recharts';

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
  const [plannedTransactions, setPlannedTransactions] = useState([]); // नवीन: Planned Transactions साठी
  const [newMonthly, setNewMonthly] = useState({ person: '', amount: '', type: 'To Give', remarks: '' });
  const [newEntry, setNewEntry] = useState({ title: '', amount: '', type: 'Expense', category: 'General' });
  const [tempLimit, setTempLimit] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Settings States
  const [appSettings, setAppSettings] = useState({ currency: 'INR (₹)', theme: 'Dark' });

  const API_BASE_URL = "https://smart-finance-backend-knxx.onrender.com";
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

  // --- API Calls ---
  const loadAllTransactions = async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/history/${id}`);
      setTransactions(response.data || []);
    } catch (error) { console.log("Server error while fetching history."); }
  };

  const loginUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const credentials = { username: e.target.username.value, password: e.target.password.value };
    try {
      const res = await axios.post(`${API_BASE_URL}/api/users/login`, credentials);
      if (res.data && res.data.userId) {
        setUser(res.data);
        await loadAllTransactions(res.data.userId);
        setView('dashboard');
      }
    } catch (err) { alert("Login Error: Check credentials or server."); }
    finally { setIsSubmitting(false); }
  };

  const saveNewTransaction = async () => {
    if (!newEntry.title || !newEntry.amount) return alert("Fill all fields.");
    setIsSubmitting(true);
    try {
      await axios.post(`${API_BASE_URL}/api/add`, {
        user_id: user.userId, description: newEntry.title, amount: parseFloat(newEntry.amount),
        type: newEntry.type, category: newEntry.category
      });
      await loadAllTransactions(user.userId);
      setView('dashboard');
      setNewEntry({ title: '', amount: '', type: 'Expense', category: 'General' });
    } catch (err) { alert("Error saving transaction."); }
    finally { setIsSubmitting(false); }
  };

  // --- Planned Transactions Logic ---
  const addPlannedTx = () => {
    const title = prompt("Enter Planned Expense Title (e.g. Rent, Fees):");
    const amount = prompt("Enter Estimated Amount:");
    if (title && amount) {
      const newPlan = { id: Date.now(), title, amount, date: new Date().toLocaleDateString() };
      setPlannedTransactions([...plannedTransactions, newPlan]);
    }
  };

  // --- Calculations ---
  const totalIncome = transactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + Number(t.amount), 0);
  const netBalance = totalIncome - totalExpense;
  const myLimit = user?.budget_limit || 0;
  const budgetUsage = myLimit > 0 ? Math.min((totalExpense / myLimit) * 100, 100) : 0;

  // --- Styling Section ---
  const styles = {
    mainWrapper: { backgroundColor: '#020617', minHeight: '100vh', color: '#e2e8f0', fontFamily: 'system-ui, -apple-system, sans-serif' },
    sidePanel: { 
        width: isSidebarOpen ? '260px' : '80px', background: '#0f172a', padding: '25px 15px', 
        borderRight: '1px solid #1e293b', position: 'sticky', top: 0, height: '100vh', 
        display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease' 
    },
    menuButton: (active) => ({
      width: '100%', padding: '15px', marginBottom: '8px', borderRadius: '12px',
      border: 'none', textAlign: 'left', cursor: 'pointer', fontWeight: 'bold',
      background: active ? '#4f46e5' : 'transparent', color: active ? 'white' : '#94a3b8',
      display: 'flex', alignItems: 'center', gap: '15px'
    }),
    commonCard: { 
        backgroundColor: '#1e293b', padding: '25px', borderRadius: '15px', 
        border: '1px solid #334155', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
    },
    inputBox: { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '10px', background: '#020617', color: 'white', border: '1px solid #475569', boxSizing: 'border-box' },
    primaryBtn: { padding: '12px 25px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }
  };

  // --- Views ---
  if (view === 'explore') {
    return (
      <div style={styles.mainWrapper}>
        <DemoModal show={showDemoModal} onClose={() => setShowDemoModal(false)} />
        <header style={{...styles.landingPage, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', height:'100vh', textAlign:'center', backgroundImage: `linear-gradient(rgba(2,6,23,0.8), rgba(2,6,23,0.95)), url(${heroBackground})`, backgroundSize:'cover'}}>
          <h1 style={{fontSize: '60px', fontWeight: '800'}}>Manage Your <span style={{color: '#6366f1'}}>Money Better.</span></h1>
          <p style={{fontSize: '20px', color: '#94a3b8', margin: '20px 0 40px'}}>The most professional financial tracker for Indian students and professionals.</p>
          <div style={{display:'flex', gap:'20px'}}>
            <button style={styles.primaryBtn} onClick={() => setView('login')}>Login Now</button>
            <button style={{...styles.primaryBtn, background:'transparent', border:'2px solid #6366f1'}} onClick={() => setShowDemoModal(true)}>Video Demo</button>
          </div>
        </header>
      </div>
    );
  }

  if (view === 'login') {
    return (
      <div style={{...styles.mainWrapper, display:'flex', justifyContent:'center', alignItems:'center'}}>
        <div style={{...styles.commonCard, width:'400px'}}>
          <h2 style={{textAlign:'center', color:'#6366f1'}}>Login to FinTrace</h2>
          <form onSubmit={loginUser}>
            <input name="username" style={styles.inputBox} placeholder="Username" required />
            <input name="password" type="password" style={styles.inputBox} placeholder="Password" required />
            <button type="submit" style={{...styles.primaryBtn, width:'100%'}}>{isSubmitting ? "Processing..." : "Login"}</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...styles.mainWrapper, display: 'flex' }}>
      {/* --- Sidebar Menu --- */}
      <aside style={styles.sidePanel}>
        <h2 style={{ color: '#6366f1', marginBottom: '30px' }}>{isSidebarOpen ? "FINTRACE" : "FT"}</h2>
        <nav style={{ flex: 1 }}>
          <button style={styles.menuButton(view === 'dashboard')} onClick={() => setView('dashboard')}><span>📊</span> {isSidebarOpen && "Dashboard"}</button>
          <button style={styles.menuButton(view === 'reports')} onClick={() => setView('reports')}><span>📈</span> {isSidebarOpen && "Reports"}</button>
          <button style={styles.menuButton(view === 'planned')} onClick={() => setView('planned')}><span>📅</span> {isSidebarOpen && "Planned"}</button>
          <button style={styles.menuButton(view === 'planner')} onClick={() => setView('planner')}><span>🗓️</span> {isSidebarOpen && "Planner"}</button>
          <button style={styles.menuButton(view === 'settings')} onClick={() => setView('settings')}><span>⚙️</span> {isSidebarOpen && "Settings"}</button>
          <button style={styles.menuButton(view === 'add')} onClick={() => setView('add')}><span>➕</span> {isSidebarOpen && "Add Money"}</button>
        </nav>
        <button style={{ ...styles.primaryBtn, backgroundColor: '#ef4444' }} onClick={() => setView('explore')}>Logout</button>
      </aside>

      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        
        {/* --- Dashboard View --- */}
        {view === 'dashboard' && (
          <div>
            <h1>Namaste, {user?.username}!</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', margin: '30px 0' }}>
              <div style={styles.commonCard}><span>Balance</span><h2 style={{color: '#10b981'}}>₹{netBalance}</h2></div>
              <div style={styles.commonCard}><span>Income</span><h2>₹{totalIncome}</h2></div>
              <div style={styles.commonCard}><span>Expenses</span><h2 style={{color: '#ef4444'}}>₹{totalExpense}</h2></div>
            </div>
            {/* Pie Chart */}
            <div style={styles.commonCard}>
              <h3>Income vs Expense Split</h3>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[{name:'In', value:totalIncome}, {name:'Out', value:totalExpense}]} dataKey="value" innerRadius={60} outerRadius={100} paddingAngle={5}>
                      <Cell fill="#10b981" /><Cell fill="#ef4444" />
                    </Pie><Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* --- Reports View (नवीन) --- */}
        {view === 'reports' && (
          <div>
            <h1>📈 Financial Reports</h1>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'25px', marginTop:'30px'}}>
              <div style={styles.commonCard}>
                <h3>Monthly Spending Trend</h3>
                <div style={{height:'300px'}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={transactions}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="description" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={{background:'#1e293b', border:'none'}} />
                      <Line type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div style={styles.commonCard}>
                <h3>Top Categories</h3>
                <ul style={{listStyle:'none', padding:0}}>
                  {['Food', 'Travel', 'Bills', 'Shopping', 'General'].map(cat => (
                    <li key={cat} style={{padding:'15px 0', borderBottom:'1px solid #334155', display:'flex', justifyContent:'space-between'}}>
                      <span>{cat}</span>
                      <span style={{fontWeight:'bold'}}>₹{transactions.filter(t => t.category === cat).reduce((s, t) => s + Number(t.amount), 0)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* --- Planned Transactions View (नवीन) --- */}
        {view === 'planned' && (
          <div style={{maxWidth:'800px'}}>
            <h1>📅 Upcoming / Planned Expenses</h1>
            <p style={{color:'#94a3b8', margin:'10px 0 30px'}}>List of things you need to buy or pay for soon.</p>
            <button style={{...styles.primaryBtn, marginBottom:'30px'}} onClick={addPlannedTx}>+ Add New Plan</button>
            
            <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
              {plannedTransactions.map(pt => (
                <div key={pt.id} style={{...styles.commonCard, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <div><h3 style={{margin:0}}>{pt.title}</h3><small style={{color:'#6366f1'}}>Estimated Date: {pt.date}</small></div>
                  <div style={{display:'flex', alignItems:'center', gap:'20px'}}>
                    <h2 style={{margin:0}}>₹{pt.amount}</h2>
                    <button onClick={() => setPlannedTransactions(plannedTransactions.filter(x => x.id !== pt.id))} style={{color:'#ef4444', background:'none', border:'none', cursor:'pointer'}}>Delete</button>
                  </div>
                </div>
              ))}
              {plannedTransactions.length === 0 && <p style={{textAlign:'center', padding:'50px', color:'#94a3b8'}}>No planned expenses yet.</p>}
            </div>
          </div>
        )}

        {/* --- Settings View (नवीन) --- */}
        {view === 'settings' && (
          <div style={{maxWidth:'600px'}}>
            <h1>⚙️ Settings</h1>
            <div style={{...styles.commonCard, marginTop:'30px'}}>
              <label style={{display:'block', marginBottom:'10px'}}>Preferred Currency</label>
              <select style={styles.inputBox} value={appSettings.currency} onChange={e => setAppSettings({...appSettings, currency: e.target.value})}>
                <option>INR (₹)</option>
                <option>USD ($)</option>
                <option>EUR (€)</option>
              </select>

              <label style={{display:'block', marginBottom:'10px'}}>Theme Mode</label>
              <div style={{display:'flex', gap:'10px'}}>
                <button style={{...styles.primaryBtn, background: appSettings.theme === 'Dark' ? '#4f46e5' : '#334155'}} onClick={() => setAppSettings({...appSettings, theme: 'Dark'})}>Dark Mode</button>
                <button style={{...styles.primaryBtn, background: appSettings.theme === 'Light' ? '#4f46e5' : '#334155'}} onClick={() => setAppSettings({...appSettings, theme: 'Light'})}>Light Mode</button>
              </div>

              <div style={{marginTop:'40px', padding:'20px', background:'#020617', borderRadius:'10px'}}>
                <h3>Profile Info</h3>
                <p>Username: <b>{user?.username}</b></p>
                <p>System ID: <small>{user?.userId}</small></p>
              </div>
              <button style={{...styles.primaryBtn, width:'100%', marginTop:'20px'}} onClick={() => alert("Settings Saved Locally!")}>Save Changes</button>
            </div>
          </div>
        )}

        {/* Planner View */}
        {view === 'planner' && (
           <div style={{ maxWidth: '800px' }}>
              <h1>🗓️ Monthly Planner</h1>
              <div style={{...styles.commonCard, marginTop:'20px'}}>
                <input style={styles.inputBox} placeholder="Person Name" value={newMonthly.person} onChange={e => setNewMonthly({...newMonthly, person: e.target.value})} />
                <input style={styles.inputBox} type="number" placeholder="Amount" value={newMonthly.amount} onChange={e => setNewMonthly({...newMonthly, amount: e.target.value})} />
                <button style={{...styles.primaryBtn, width:'100%'}} onClick={() => {setMonthlyEntries([...monthlyEntries, {...newMonthly, id:Date.now()}]); setNewMonthly({person:'', amount:''})}}>Add to List</button>
              </div>
           </div>
        )}

        {/* Add Transaction View */}
        {view === 'add' && (
          <div style={{...styles.commonCard, maxWidth:'500px', margin:'0 auto'}}>
            <h2>Add Record</h2>
            <input style={styles.inputBox} placeholder="What for?" value={newEntry.title} onChange={e => setNewEntry({...newEntry, title: e.target.value})} />
            <input style={styles.inputBox} type="number" placeholder="How much?" value={newEntry.amount} onChange={e => setNewEntry({...newEntry, amount: e.target.value})} />
            <select style={styles.inputBox} value={newEntry.type} onChange={e => setNewEntry({...newEntry, type: e.target.value})}>
              <option value="Expense">Expense</option>
              <option value="Income">Income</option>
            </select>
            <button style={{...styles.primaryBtn, width:'100%'}} onClick={saveNewTransaction}>Save Transaction</button>
          </div>
        )}

      </main>
    </div>
  );
};

export default App;