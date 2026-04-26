import React, { useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// --- Demo Video Modal Component ---
const DemoModal = ({ show, onClose }) => {
  if (!show) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.9)', zIndex: 2000,
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
        <h3 style={{color: 'white', textAlign: 'center', marginTop: '15px'}}>FinTrace - Smart Finance Demo</h3>
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
  
  // Image Links
  const exploreHeroImg = "https://images.unsplash.com/photo-1593640495253-23196b27a87f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1471&q=80";
  const authBgImg = "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1471&q=80";

  const loadTransactions = async (userId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/history/${userId}`);
      setTransactions(res.data || []);
    } catch (err) { 
      console.error("Error loading data:", err); 
    }
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
    } catch (err) { 
      alert("Login Failed! Please check your credentials."); 
    } finally {
      setIsSubmitting(false);
    }
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
      alert("Registration Successful! Please login to continue.");
      setView('login');
    } catch (err) { 
      alert("Registration Failed! Username might already exist."); 
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateBudget = async () => {
    if (!user) return alert("Please login to update your budget.");
    if (!tempLimit || tempLimit <= 0) return alert("Please enter a valid amount.");
    setIsSubmitting(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/users/update-budget`, {
        user_id: user.userId,
        budget_limit: parseFloat(tempLimit)
      });
      setUser(res.data);
      alert("Budget Updated Successfully! ✅");
      setTempLimit("");
    } catch (err) { 
      alert("Failed to update budget."); 
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveTransaction = async () => {
    if (!newEntry.title || !newEntry.amount) return alert("Please fill in all details.");
    
    if (!user) {
      alert("Authentication Required: Please login to save your transactions.");
      setView('login');
      return;
    }

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
    } catch (err) { 
      alert("Failed to save transaction."); 
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!user) return alert("Please login to manage transactions.");
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await axios.delete(`${API_BASE_URL}/api/transactions/${id}`); 
        loadTransactions(user.userId);
      } catch (err) { 
        alert("Delete operation failed."); 
      }
    }
  };

  // Calculations
  const totalIncome = transactions.filter(t => t.type === 'Income').reduce((a, b) => a + Number(b.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'Expense').reduce((a, b) => a + Number(b.amount), 0);
  const balance = totalIncome - totalExpense;
  const savingsProgress = Math.min((balance / savingsGoal.target) * 100, 100);
  const remainingForGoal = Math.max(savingsGoal.target - balance, 0);

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "All" || (t.category === filterCategory);
    return matchesSearch && matchesCategory;
  });

  const categoryExpenses = transactions
    .filter(t => t.type === 'Expense')
    .reduce((acc, t) => {
      const cat = t.category || 'General';
      acc[cat] = (acc[cat] || 0) + Number(t.amount);
      return acc;
    }, {});
  
  const topCategory = Object.keys(categoryExpenses).length > 0 
    ? Object.keys(categoryExpenses).reduce((a, b) => categoryExpenses[a] > categoryExpenses[b] ? a : b) 
    : "None";

  const predictedSpend = (totalExpense / (new Date().getDate() || 1)) * 30;

  // Professional UI Styles
  const styles = {
    wrapper: { backgroundColor: '#030712', minHeight: '100vh', color: '#f3f4f6', fontFamily: 'Inter, sans-serif' },
    navbar: { display: 'flex', justifyContent: 'space-between', padding: '15px 50px', background: 'rgba(17, 24, 39, 0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #1f2937', alignItems: 'center', position: 'fixed', width: '100%', top: 0, zIndex: 1000, boxSizing: 'border-box' },
    sidebar: { width: '280px', background: '#111827', padding: '30px', borderRight: '1px solid #1f2937', position: 'sticky', top: 0, height: '100vh', display: 'flex', flexDirection: 'column' },
    main: { flex: 1, padding: '100px 40px 40px', overflowY: 'auto' },
    card: { backgroundColor: '#111827', padding: '24px', borderRadius: '16px', border: '1px solid #1f2937', marginBottom: '25px' },
    statCard: { padding: '20px', borderRadius: '16px', background: '#1f2937', border: '1px solid #374151' },
    input: { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', background: '#0f172a', color: 'white', border: '1px solid #334155', outline: 'none' },
    btn: { padding: '12px 24px', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s' },
    aiBadge: { background: 'linear-gradient(90deg, #818cf8, #c084fc)', padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 'bold' },
    splitScreen: { display: 'flex', minHeight: '100vh', width: '100%' },
    formSide: { flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px', background: '#030712' },
    authImageSide: { 
      flex: 1.5, 
      backgroundImage: `linear-gradient(rgba(3, 7, 18, 0.4), rgba(3, 7, 18, 0.8)), url(${authBgImg})`, 
      backgroundSize: 'cover', backgroundPosition: 'center', 
      display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', padding: '40px', textAlign: 'center'
    }
  };

  // 1. EXPLORE VIEW
  if (view === 'explore') {
    return (
      <div style={styles.wrapper}>
        <DemoModal show={showDemoModal} onClose={() => setShowDemoModal(false)} />
        <nav style={styles.navbar}>
          <h2 style={{ color: '#6366f1', margin: 0 }}>FinTrace</h2>
          <div style={{ display: 'flex', gap: '30px' }}>
            <span style={{cursor: 'pointer'}} onClick={() => setView('dashboard')}>Try Dashboard</span>
            <span style={{cursor: 'pointer'}} onClick={() => setView('add')}>Quick Entry</span>
          </div>
          <button style={styles.btn} onClick={() => setView('login')}>Sign In</button>
        </nav>
        <div style={{ 
          height: '100vh', width: '100%', 
          backgroundImage: `linear-gradient(rgba(3, 7, 18, 0.5), rgba(3, 7, 18, 0.9)), url(${exploreHeroImg})`, 
          backgroundSize: 'cover', backgroundPosition: 'center',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '80px', fontWeight: '900', marginBottom: '20px', background: 'linear-gradient(to right, #fff, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Master Your Money
          </h1>
          <p style={{ color: '#cbd5e1', fontSize: '22px', maxWidth: '700px', marginBottom: '40px', lineHeight: '1.6' }}>
            Smart AI-driven insights to help you track, save, and grow your wealth effortlessly.
          </p>
          <div style={{ display: 'flex', gap: '20px' }}>
            <button style={{ ...styles.btn, fontSize: '18px', padding: '16px 45px' }} onClick={() => setView('register')}>Get Started Free</button>
            <button 
              style={{ padding: '16px 45px', background: 'transparent', color: 'white', border: '1px solid #6366f1', borderRadius: '8px', cursor: 'pointer', fontSize: '18px' }}
              onClick={() => setShowDemoModal(true)}
            >
              Watch Demo
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. AUTH VIEW
  if (view === 'login' || view === 'register') {
    return (
      <div style={styles.splitScreen}>
        <div style={styles.formSide}>
          <div style={{ width: '100%', maxWidth: '360px' }}>
            <h1 style={{ color: '#6366f1', marginBottom: '10px' }}>FinTrace</h1>
            <h2 style={{ marginBottom: '30px' }}>{view === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
            <form onSubmit={view === 'login' ? handleLogin : handleRegister}>
              {view === 'register' && <input name="email" type="email" style={styles.input} placeholder="Email Address" required />}
              <input name="username" style={styles.input} placeholder="Username" required />
              <input name="password" type="password" style={styles.input} placeholder="Password" required />
              <button type="submit" style={{ ...styles.btn, width: '100%' }} disabled={isSubmitting}>
                {isSubmitting ? "Authenticating..." : "Continue"}
              </button>
            </form>
            <p onClick={() => setView(view === 'login' ? 'register' : 'login')} style={{ textAlign: 'center', cursor: 'pointer', marginTop: '25px', color: '#94a3b8' }}>
              {view === 'login' ? "New to FinTrace? Sign Up" : "Already have an account? Login"}
            </p>
          </div>
        </div>
        <div style={styles.authImageSide}>
          <div style={{ zIndex: 1 }}>
            <h2 style={{ fontSize: '42px', marginBottom: '20px' }}>Secure Finance</h2>
            <p style={{ fontSize: '18px', color: '#cbd5e1' }}>Your data is encrypted. Your future is planned.</p>
          </div>
        </div>
      </div>
    );
  }

  // 3. MAIN DASHBOARD
  return (
    <div style={{ ...styles.wrapper, display: 'flex' }}>
      <DemoModal show={showDemoModal} onClose={() => setShowDemoModal(false)} />
      <div style={styles.sidebar}>
        <h2 style={{ color: '#6366f1', marginBottom: '40px' }}>FinTrace</h2>
        <div style={{ padding: '15px', background: '#1f2937', borderRadius: '12px', marginBottom: '30px' }}>
          <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0 }}>Active Profile</p>
          <h3 style={{ margin: 0 }}>{user ? user.username : 'Guest User'}</h3>
        </div>
        <nav style={{ flex: 1 }}>
          <button style={{ ...styles.btn, width: '100%', background: view === 'dashboard' ? '#6366f1' : 'transparent', textAlign: 'left', marginBottom: '10px' }} onClick={() => setView('dashboard')}>📊 Dashboard</button>
          <button style={{ ...styles.btn, width: '100%', background: view === 'add' ? '#6366f1' : 'transparent', textAlign: 'left' }} onClick={() => setView('add')}>➕ Add Record</button>
          <button style={{ ...styles.btn, width: '100%', background: 'transparent', textAlign: 'left', marginTop: '10px', color: '#94a3b8' }} onClick={() => setShowDemoModal(true)}>🎥 Product Tour</button>
        </nav>
        {user ? (
            <button style={{ ...styles.btn, backgroundColor: '#ef4444' }} onClick={() => { setUser(null); setTransactions([]); setView('explore'); }}>Logout</button>
        ) : (
            <button style={{ ...styles.btn }} onClick={() => setView('login')}>Sign In to Sync</button>
        )}
      </div>

      <div style={styles.main}>
        {view === 'dashboard' && (
          <>
            {!user && (
                <div style={{background: '#6366f1', padding: '15px', borderRadius: '12px', marginBottom: '20px', textAlign: 'center', color: 'white', fontWeight: 'bold'}}>
                    Preview Mode: Sign in to save your financial records permanently.
                </div>
            )}

            <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
              <h1>Financial Analytics</h1>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: '#94a3b8', margin: 0 }}>Available Balance</p>
                <h1 style={{ color: balance >= 0 ? '#10b981' : '#ef4444', margin: 0 }}>₹{balance}</h1>
              </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <div style={styles.statCard}><span>Total Income</span><h2 style={{ color: '#10b981' }}>₹{totalIncome}</h2></div>
              <div style={styles.statCard}><span>Total Spending</span><h2 style={{ color: '#ef4444' }}>₹{totalExpense}</h2></div>
              <div style={styles.statCard}><span>Top Category</span><h2>{topCategory}</h2></div>
              <div style={{ ...styles.statCard, border: '1px solid #6366f1' }}>
                <span style={styles.aiBadge}>AI PREDICTION</span>
                <h2>₹{predictedSpend.toFixed(0)}</h2>
              </div>
            </div>

            <div style={styles.card}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                 <h3>🎯 Target Goal: {savingsGoal.name}</h3>
                 <div style={{display: 'flex', gap: '10px'}}>
                    <input type="number" placeholder="Set Limit" style={{...styles.input, width: '120px', marginBottom: 0}} value={tempLimit} onChange={e => setTempLimit(e.target.value)} />
                    <button style={{...styles.btn, padding: '8px 15px'}} onClick={handleUpdateBudget} disabled={isSubmitting}>Update</button>
                 </div>
              </div>
              <div style={{ width: '100%', height: '12px', background: '#030712', borderRadius: '10px', margin: '20px 0' }}>
                <div style={{ width: `${savingsProgress}%`, height: '100%', background: '#10b981', borderRadius: '10px', transition: 'width 0.5s' }}></div>
              </div>
              <p style={{ fontSize: '14px', color: '#94a3b8' }}>
                {savingsProgress.toFixed(1)}% Achieved | Remaining: ₹{remainingForGoal} | Monthly Budget: ₹{user?.budgetLimit || 5000}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
              <div style={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <h3>Transaction History</h3>
                  <input placeholder="Search records..." style={{ ...styles.input, width: '180px', marginBottom: 0 }} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                  {filteredTransactions.map((t) => (
                    <div key={t.id || Math.random()} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #1f2937' }}>
                      <div><strong>{t.description}</strong><br/><small style={{ color: '#64748b' }}>{t.category}</small></div>
                      <div style={{ color: t.type === 'Income' ? '#10b981' : '#ef4444', textAlign: 'right' }}>
                        ₹{t.amount} <br/>
                        <button onClick={() => handleDelete(t.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                      </div>
                    </div>
                  ))}
                  {transactions.length === 0 && <p style={{textAlign: 'center', color: '#94a3b8', marginTop: '20px'}}>No records found.</p>}
                </div>
              </div>

              <div style={styles.card}>
                <h3>Expense Distribution</h3>
                <div style={{ width: '100%', height: 250 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={[{ name: 'Income', value: totalIncome || 1 }, { name: 'Expense', value: totalExpense || 0.1 }]} innerRadius={60} outerRadius={80} dataKey="value" paddingAngle={5}>
                        <Cell fill="#10b981" /><Cell fill="#ef4444" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{textAlign: 'center', color: '#94a3b8', fontSize: '14px'}}>
                   <span style={{color: '#10b981'}}>●</span> Income vs <span style={{color: '#ef4444'}}>●</span> Expense
                </div>
              </div>
            </div>
          </>
        )}

        {view === 'add' && (
          <div style={{ ...styles.card, maxWidth: '500px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '30px' }}>New Transaction</h2>
            <label style={{fontSize: '14px', color: '#94a3b8'}}>Description</label>
            <input style={styles.input} placeholder="e.g. Salary, Rent, Shopping" value={newEntry.title} onChange={e => setNewEntry({ ...newEntry, title: e.target.value })} />
            <label style={{fontSize: '14px', color: '#94a3b8'}}>Amount (₹)</label>
            <input style={styles.input} type="number" placeholder="0.00" value={newEntry.amount} onChange={e => setNewEntry({ ...newEntry, amount: e.target.value })} />
            <div style={{display: 'flex', gap: '20px'}}>
              <div style={{flex: 1}}>
                <label style={{fontSize: '14px', color: '#94a3b8'}}>Type</label>
                <select style={styles.input} value={newEntry.type} onChange={e => setNewEntry({ ...newEntry, type: e.target.value })}>
                  <option value="Expense">Expense</option>
                  <option value="Income">Income</option>
                </select>
              </div>
              <div style={{flex: 1}}>
                <label style={{fontSize: '14px', color: '#94a3b8'}}>Category</label>
                <select style={styles.input} value={newEntry.category} onChange={e => setNewEntry({ ...newEntry, category: e.target.value })}>
                  <option value="General">General</option>
                  <option value="Food">Food</option>
                  <option value="Bills">Bills</option>
                  <option value="Travel">Travel</option>
                  <option value="Shopping">Shopping</option>
                </select>
              </div>
            </div>
            
            <button style={{ ...styles.btn, width: '100%', marginTop: '20px' }} onClick={handleSaveTransaction} disabled={isSubmitting}>
               {isSubmitting ? "Processing..." : (user ? "Save Transaction" : "Sign In to Save Data")}
            </button>
            {!user && <p style={{textAlign: 'center', marginTop: '15px', color: '#ef4444', fontSize: '14px', fontWeight: '500'}}>You must be logged in to save records.</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;