import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// --- Demo Video Modal Component ---
const DemoModal = ({ show, onClose }) => {
  if (!show) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.9)', zIndex: 3000,
      display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px'
    }} onClick={onClose}>
      <div style={{
        background: '#111827', padding: '10px', borderRadius: '16px',
        border: '1px solid #374151', maxWidth: '800px', width: '100%',
        position: 'relative', boxShadow: '0 25px 50px -12px rgba(99, 102, 241, 0.5)'
      }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '-15px', right: '-15px',
          background: '#ef4444', color: 'white', border: 'none',
          borderRadius: '50%', width: '35px', height: '35px',
          cursor: 'pointer', fontWeight: 'bold', fontSize: '18px'
        }}>X</button>
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
          <iframe 
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '8px' }}
            src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" 
            title="FinTrace Product Demo"
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
  const [view, setView] = useState('explore'); 
  const [user, setUser] = useState(null); 
  const [transactions, setTransactions] = useState([]);
  const [newEntry, setNewEntry] = useState({ title: '', amount: '', type: 'Expense', category: 'General' });
  const [tempLimit, setTempLimit] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);

  const API_BASE_URL = "https://smart-finance-backend-knxx.onrender.com";
  const [savingsGoal] = useState({ name: "Emergency Fund", target: 50000 });
  
  const exploreHeroImg = "https://images.unsplash.com/photo-1593640495253-23196b27a87f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1471&q=80";
  const authBgImg = "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1471&q=80";

  const loadTransactions = async (userId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/history/${userId}`);
      setTransactions(res.data || []);
    } catch (err) { console.error("Error loading data:", err); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/users/login`, {
        username: e.target.username.value,
        password: e.target.password.value
      });
      setUser(res.data);
      await loadTransactions(res.data.userId);
      setView('dashboard');
    } catch (err) { alert("Login Failed!"); } finally { setIsSubmitting(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post(`${API_BASE_URL}/api/users/register`, {
        username: e.target.username.value,
        password: e.target.password.value,
        email: e.target.email.value
      });
      alert("Registration Successful!");
      setView('login');
    } catch (err) { alert("Registration Failed!"); } finally { setIsSubmitting(false); }
  };

  const handleUpdateBudget = async () => {
    if (!user) return alert("Login first");
    setIsSubmitting(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/users/update-budget`, {
        user_id: user.userId,
        budget_limit: parseFloat(tempLimit)
      });
      setUser(res.data);
      alert("Budget Updated!");
      setTempLimit("");
    } catch (err) { alert("Failed."); } finally { setIsSubmitting(false); }
  };

  const handleSaveTransaction = async () => {
    if (!newEntry.title || !newEntry.amount) return alert("Fill details.");
    if (!user) { setView('login'); return; }
    setIsSubmitting(true);
    try {
      await axios.post(`${API_BASE_URL}/api/add`, {
        user_id: user.userId,
        description: newEntry.title,
        amount: parseFloat(newEntry.amount),
        type: newEntry.type,
        category: newEntry.category
      });
      await loadTransactions(user.userId);
      setView('dashboard');
      setNewEntry({ title: '', amount: '', type: 'Expense', category: 'General' });
    } catch (err) { alert("Error."); } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete record?")) {
      try {
        await axios.delete(`${API_BASE_URL}/api/transactions/${id}`); 
        loadTransactions(user.userId);
      } catch (err) { alert("Failed."); }
    }
  };

  // Calculations Logic
  const totalIncome = transactions.filter(t => t.type === 'Income').reduce((a, b) => a + Number(b.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'Expense').reduce((a, b) => a + Number(b.amount), 0);
  const balance = totalIncome - totalExpense;
  const savingsProgress = Math.min((balance / savingsGoal.target) * 100, 100);
  const predictedSpend = (totalExpense / (new Date().getDate() || 1)) * 30;

  const filteredTransactions = transactions.filter(t => 
    t.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const styles = {
    wrapper: { backgroundColor: '#030712', minHeight: '100vh', color: '#f3f4f6', fontFamily: 'Inter, sans-serif' },
    navbar: { 
        display: 'flex', justifyContent: 'space-between', padding: '15px 50px', 
        background: 'rgba(17, 24, 39, 0.85)', backdropFilter: 'blur(12px)', 
        borderBottom: '1px solid #1f2937', alignItems: 'center', 
        position: 'fixed', width: '100%', top: 0, zIndex: 2000, boxSizing: 'border-box' 
    },
    hero: { 
        minHeight: '100vh', display: 'flex', flexDirection: 'column', 
        justifyContent: 'center', alignItems: 'center', textAlign: 'center',
        padding: '100px 20px',
        backgroundImage: `linear-gradient(rgba(3,7,18,0.7), rgba(3,7,18,0.9)), url(${exploreHeroImg})`,
        backgroundSize: 'cover', backgroundAttachment: 'fixed'
    },
    section: { padding: '80px 50px', maxWidth: '1200px', margin: '0 auto' },
    card: { 
        backgroundColor: '#111827', padding: '24px', borderRadius: '16px', 
        border: '1px solid #1f2937', transition: 'all 0.3s ease', cursor: 'default'
    },
    sidebar: { width: '280px', background: '#111827', padding: '30px', borderRight: '1px solid #1f2937', position: 'sticky', top: 0, height: '100vh', display: 'flex', flexDirection: 'column' },
    btn: { padding: '12px 24px', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: '0.3s' },
    input: { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', background: '#0f172a', color: 'white', border: '1px solid #334155', outline: 'none' }
  };

  // 1. EXPLORE VIEW (LONG SCROLL)
  if (view === 'explore') {
    return (
      <div style={styles.wrapper}>
        <DemoModal show={showDemoModal} onClose={() => setShowDemoModal(false)} />
        <nav style={styles.navbar}>
          <h2 style={{ color: '#6366f1', margin: 0 }}>FinTrace</h2>
          <div style={{ display: 'flex', gap: '30px', fontWeight: '500' }}>
            <span style={{cursor: 'pointer'}} onClick={() => window.scrollTo({top: 800, behavior: 'smooth'})}>Features</span>
            <span style={{cursor: 'pointer'}} onClick={() => setView('login')}>Login</span>
          </div>
          <button style={styles.btn} onClick={() => setView('register')}>Start Tracking</button>
        </nav>

        {/* Hero Section */}
        <header style={styles.hero}>
          <h1 style={{ fontSize: 'clamp(40px, 8vw, 85px)', fontWeight: '900', marginBottom: '20px', lineHeight: 1.1 }}>
            Take Control of <br/><span style={{color: '#6366f1'}}>Your Wealth.</span>
          </h1>
          <p style={{ fontSize: '20px', color: '#94a3b8', maxWidth: '600px', marginBottom: '40px' }}>
            Smart AI insights and intuitive tracking for your personal finance journey.
          </p>
          <div style={{ display: 'flex', gap: '20px' }}>
            <button style={{ ...styles.btn, padding: '16px 40px' }} onClick={() => setView('register')}>Create Free Account</button>
            <button style={{ ...styles.btn, background: 'transparent', border: '1px solid #6366f1' }} onClick={() => setShowDemoModal(true)}>Watch Demo</button>
          </div>
        </header>

        {/* Feature Grid */}
        <section style={styles.section}>
          <h2 style={{textAlign: 'center', fontSize: '32px', marginBottom: '50px'}}>Why Choose FinTrace?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
            <div style={styles.card} onMouseOver={e => e.currentTarget.style.transform='translateY(-10px)'} onMouseOut={e => e.currentTarget.style.transform='translateY(0)'}>
              <h3 style={{color: '#6366f1'}}>Real-time Sync</h3>
              <p style={{color: '#94a3b8'}}>Your data is always up-to-date across all your devices instantly.</p>
            </div>
            <div style={styles.card} onMouseOver={e => e.currentTarget.style.transform='translateY(-10px)'} onMouseOut={e => e.currentTarget.style.transform='translateY(0)'}>
              <h3 style={{color: '#6366f1'}}>AI Analytics</h3>
              <p style={{color: '#94a3b8'}}>Predict your monthly spending based on past habits using our smart engine.</p>
            </div>
            <div style={styles.card} onMouseOver={e => e.currentTarget.style.transform='translateY(-10px)'} onMouseOut={e => e.currentTarget.style.transform='translateY(0)'}>
              <h3 style={{color: '#6366f1'}}>Privacy First</h3>
              <p style={{color: '#94a3b8'}}>Military-grade encryption for your financial peace of mind.</p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section style={{...styles.section, background: '#0f172a', textAlign: 'center'}}>
           <div style={{display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '30px'}}>
              <div><h2 style={{fontSize: '40px', color: '#6366f1'}}>10K+</h2><p>Active Users</p></div>
              <div><h2 style={{fontSize: '40px', color: '#6366f1'}}>₹50Cr+</h2><p>Tracked Monthly</p></div>
              <div><h2 style={{fontSize: '40px', color: '#6366f1'}}>99.9%</h2><p>Uptime</p></div>
           </div>
        </section>

        <footer style={{padding: '50px', textAlign: 'center', borderTop: '1px solid #1f2937'}}>
           <p>© 2026 FinTrace AI. Built for Smart Savers.</p>
        </footer>
      </div>
    );
  }

  // 2. LOGIN / REGISTER VIEW
  if (view === 'login' || view === 'register') {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#030712' }}>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ width: '100%', maxWidth: '380px', padding: '40px', background: '#111827', borderRadius: '20px' }}>
            <h2 style={{color: '#6366f1', textAlign: 'center', marginBottom: '30px'}}>{view === 'login' ? 'Welcome Back' : 'Join FinTrace'}</h2>
            <form onSubmit={view === 'login' ? handleLogin : handleRegister}>
              {view === 'register' && <input name="email" type="email" style={styles.input} placeholder="Email" required />}
              <input name="username" style={styles.input} placeholder="Username" required />
              <input name="password" type="password" style={styles.input} placeholder="Password" required />
              <button type="submit" style={{ ...styles.btn, width: '100%', marginTop: '10px' }}>{isSubmitting ? "Authenticating..." : "Continue"}</button>
            </form>
            <p onClick={() => setView(view === 'login' ? 'register' : 'login')} style={{ textAlign: 'center', cursor: 'pointer', marginTop: '20px', color: '#94a3b8' }}>
                {view === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Login"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 3. DASHBOARD VIEW
  return (
    <div style={{ ...styles.wrapper, display: 'flex' }}>
      <div style={styles.sidebar}>
        <h2 style={{ color: '#6366f1' }}>FinTrace</h2>
        <nav style={{ flex: 1, marginTop: '40px' }}>
          <button style={{ ...styles.btn, width: '100%', background: view === 'dashboard' ? '#6366f1' : 'transparent', textAlign: 'left', marginBottom: '15px' }} onClick={() => setView('dashboard')}>📊 Dashboard</button>
          <button style={{ ...styles.btn, width: '100%', background: view === 'add' ? '#6366f1' : 'transparent', textAlign: 'left' }} onClick={() => setView('add')}>➕ New Entry</button>
        </nav>
        <button style={{ ...styles.btn, backgroundColor: '#ef4444' }} onClick={() => { setUser(null); setView('explore'); }}>Logout</button>
      </div>

      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        {view === 'dashboard' && (
          <>
            <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
              <h1>Dashboard Overview</h1>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, color: '#94a3b8' }}>Net Balance</p>
                <h1 style={{ margin: 0, color: balance >= 0 ? '#10b981' : '#ef4444' }}>₹{balance}</h1>
              </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
              <div style={styles.card}><span>Monthly Income</span><h2 style={{color: '#10b981'}}>₹{totalIncome}</h2></div>
              <div style={styles.card}><span>Total Expenses</span><h2 style={{color: '#ef4444'}}>₹{totalExpense}</h2></div>
              <div style={{...styles.card, border: '1px solid #6366f1'}}><span>AI Forecast</span><h2>₹{predictedSpend.toFixed(0)}</h2></div>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '30px'}}>
                <div style={styles.card}>
                    <h3>Recent Transactions</h3>
                    <input placeholder="Search records..." style={styles.input} onChange={e => setSearchTerm(e.target.value)} />
                    <div style={{maxHeight: '400px', overflowY: 'auto'}}>
                        {filteredTransactions.map(t => (
                            <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #1f2937' }}>
                                <div><b>{t.description}</b><br/><small style={{color: '#94a3b8'}}>{t.category}</small></div>
                                <div style={{textAlign: 'right'}}>
                                    <span style={{ color: t.type === 'Income' ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>₹{t.amount}</span><br/>
                                    <button onClick={() => handleDelete(t.id)} style={{background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px'}}>Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={styles.card}>
                    <h3>Expense Distribution</h3>
                    <div style={{ height: '250px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={[{name: 'Inc', value: totalIncome || 1}, {name: 'Exp', value: totalExpense || 0}]} dataKey="value" innerRadius={60} outerRadius={80}>
                                    <Cell fill="#10b981" /><Cell fill="#ef4444" />
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{textAlign: 'center', color: '#94a3b8'}}>Green: Income | Red: Expense</div>
                </div>
            </div>
          </>
        )}

        {view === 'add' && (
          <div style={{ ...styles.card, maxWidth: '500px', margin: '40px auto' }}>
            <h2 style={{marginBottom: '20px'}}>Add New Record</h2>
            <input style={styles.input} placeholder="Description" value={newEntry.title} onChange={e => setNewEntry({ ...newEntry, title: e.target.value })} />
            <input style={styles.input} type="number" placeholder="Amount" value={newEntry.amount} onChange={e => setNewEntry({ ...newEntry, amount: e.target.value })} />
            <select style={styles.input} value={newEntry.type} onChange={e => setNewEntry({ ...newEntry, type: e.target.value })}>
              <option value="Expense">Expense</option>
              <option value="Income">Income</option>
            </select>
            <select style={styles.input} value={newEntry.category} onChange={e => setNewEntry({ ...newEntry, category: e.target.value })}>
               <option value="General">General</option>
               <option value="Food">Food</option>
               <option value="Travel">Travel</option>
            </select>
            <button style={{ ...styles.btn, width: '100%' }} onClick={handleSaveTransaction}>Confirm Transaction</button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;