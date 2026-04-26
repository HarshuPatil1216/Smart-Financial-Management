import React, { useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const App = () => {
  const [view, setView] = useState('explore'); 
  const [user, setUser] = useState(null); 
  const [transactions, setTransactions] = useState([]);
  const [newEntry, setNewEntry] = useState({ title: '', amount: '', type: 'Expense', category: 'General' });
  const [tempLimit, setTempLimit] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_BASE_URL = "https://smart-finance-backend-knxx.onrender.com";
  const [savingsGoal] = useState({ name: "Emergency Fund", target: 50000 });
  
  // ही ती प्रोफेशनल इमेज लिंक आहे
  const loginImg = "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1471&q=80";

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
      alert("Login Failed! Please check credentials."); 
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
      alert("Registration Successful! Please login.");
      setView('login');
    } catch (err) { 
      alert("Registration Failed!"); 
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateBudget = async () => {
    if (!tempLimit || tempLimit <= 0) return alert("Enter valid amount");
    setIsSubmitting(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/users/update-budget`, {
        user_id: user.userId,
        budget_limit: parseFloat(tempLimit)
      });
      setUser(res.data);
      alert("Budget Updated! ✅");
      setTempLimit("");
    } catch (err) { 
      alert("Update failed."); 
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveTransaction = async () => {
    if (!newEntry.title || !newEntry.amount) return alert("Fill all details");
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
      alert("Save failed."); 
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this record?")) {
      try {
        await axios.delete(`${API_BASE_URL}/api/transactions/${id}`); 
        loadTransactions(user.userId);
      } catch (err) { 
        alert("Delete failed."); 
      }
    }
  };

  // Calculations (Oringal)
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
    navbar: { display: 'flex', justifyContent: 'space-between', padding: '15px 50px', background: '#111827', borderBottom: '1px solid #1f2937', alignItems: 'center', position: 'fixed', width: '100%', top: 0, zIndex: 1000, boxSizing: 'border-box' },
    sidebar: { width: '280px', background: '#111827', padding: '30px', borderRight: '1px solid #1f2937', position: 'sticky', top: 0, height: '100vh', display: 'flex', flexDirection: 'column' },
    main: { flex: 1, padding: '100px 40px 40px', overflowY: 'auto' },
    card: { backgroundColor: '#111827', padding: '24px', borderRadius: '16px', border: '1px solid #1f2937', marginBottom: '25px' },
    statCard: { padding: '20px', borderRadius: '16px', background: '#1f2937', border: '1px solid #374151' },
    input: { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', background: '#0f172a', color: 'white', border: '1px solid #334155', outline: 'none' },
    btn: { padding: '12px 24px', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s' },
    aiBadge: { background: 'linear-gradient(90deg, #818cf8, #c084fc)', padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 'bold' },
    
    // Split Screen Styles
    splitScreen: { display: 'flex', minHeight: '100vh', width: '100%' },
    formSide: { flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' },
    imageSide: { 
      flex: 1.5, 
      backgroundImage: `url(${loginImg})`, 
      backgroundSize: 'cover', 
      backgroundPosition: 'center', 
      position: 'relative', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      color: 'white'
    },
    overlay: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(3, 7, 18, 0.7)' }
  };

  if (view === 'explore') {
    return (
      <div style={styles.wrapper}>
        <nav style={styles.navbar}>
          <h2 style={{ color: '#6366f1', margin: 0 }}>FinTrace</h2>
          <div style={{ display: 'flex', gap: '30px' }}><span>Home</span><span>Features</span><span>Security</span></div>
          <button style={styles.btn} onClick={() => setView('login')}>Sign In</button>
        </nav>
        <div style={{ textAlign: 'center', padding: '200px 20px' }}>
          <h1 style={{ fontSize: '64px', fontWeight: 'bold', marginBottom: '20px' }}>Master Your Money</h1>
          <p style={{ color: '#94a3b8', fontSize: '20px', maxWidth: '600px', margin: '0 auto' }}>AI-driven insights to help you save, spend, and invest smarter.</p>
          <button style={{ ...styles.btn, marginTop: '40px', fontSize: '18px', padding: '15px 40px' }} onClick={() => setView('register')}>Get Started Now</button>
        </div>
      </div>
    );
  }

  if (view === 'login' || view === 'register') {
    return (
      <div style={styles.splitScreen}>
        <div style={styles.formSide}>
          <div style={{ width: '100%', maxWidth: '360px' }}>
            <h1 style={{ color: '#6366f1', marginBottom: '10px' }}>FinTrace</h1>
            <h2 style={{ marginBottom: '30px' }}>{view === 'login' ? 'Login to Dashboard' : 'Create an Account'}</h2>
            <form onSubmit={view === 'login' ? handleLogin : handleRegister}>
              {view === 'register' && <input name="email" type="email" style={styles.input} placeholder="Email" required />}
              <input name="username" style={styles.input} placeholder="Username" required />
              <input name="password" type="password" style={styles.input} placeholder="Password" required />
              <button type="submit" style={{ ...styles.btn, width: '100%' }} disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : "Continue"}
              </button>
            </form>
            <p onClick={() => setView(view === 'login' ? 'register' : 'login')} style={{ textAlign: 'center', cursor: 'pointer', marginTop: '25px', color: '#94a3b8' }}>
              {view === 'login' ? "Don't have an account? Register" : "Already have an account? Login"}
            </p>
          </div>
        </div>
        <div style={styles.imageSide}>
          <div style={styles.overlay}></div>
          <div style={{ zIndex: 1, textAlign: 'center', padding: '40px' }}>
            <h2 style={{ fontSize: '42px', marginBottom: '20px' }}>Smart Wealth Management</h2>
            <p style={{ fontSize: '18px', color: '#cbd5e1' }}>Take the guesswork out of your finances with real-time analytics.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...styles.wrapper, display: 'flex' }}>
      <div style={styles.sidebar}>
        <h2 style={{ color: '#6366f1', marginBottom: '40px' }}>FinTrace</h2>
        <div style={{ padding: '15px', background: '#1f2937', borderRadius: '12px', marginBottom: '30px' }}>
          <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0 }}>User</p>
          <h3 style={{ margin: 0 }}>{user?.username}</h3>
        </div>
        <nav style={{ flex: 1 }}>
          <button style={{ ...styles.btn, width: '100%', background: view === 'dashboard' ? '#6366f1' : 'transparent', textAlign: 'left', marginBottom: '10px' }} onClick={() => setView('dashboard')}>📊 Dashboard</button>
          <button style={{ ...styles.btn, width: '100%', background: view === 'add' ? '#6366f1' : 'transparent', textAlign: 'left' }} onClick={() => setView('add')}>➕ Add Transaction</button>
        </nav>
        <button style={{ ...styles.btn, backgroundColor: '#ef4444' }} onClick={() => { setUser(null); setTransactions([]); setView('explore'); }}>Logout</button>
      </div>

      <div style={styles.main}>
        {view === 'dashboard' && (
          <>
            <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
              <h1>Analytics Overview</h1>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: '#94a3b8', margin: 0 }}>Current Balance</p>
                <h1 style={{ color: balance >= 0 ? '#10b981' : '#ef4444', margin: 0 }}>₹{balance}</h1>
              </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <div style={styles.statCard}><span>Total Income</span><h2 style={{ color: '#10b981' }}>₹{totalIncome}</h2></div>
              <div style={styles.statCard}><span>Total Expenses</span><h2 style={{ color: '#ef4444' }}>₹{totalExpense}</h2></div>
              <div style={styles.statCard}><span>Top Category</span><h2>{topCategory}</h2></div>
              <div style={{ ...styles.statCard, border: '1px solid #6366f1' }}>
                <span style={styles.aiBadge}>AI FORECAST</span>
                <h2>₹{predictedSpend.toFixed(0)}</h2>
              </div>
            </div>

            <div style={styles.card}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                 <h3>🎯 Goal: {savingsGoal.name}</h3>
                 <div style={{display: 'flex', gap: '10px'}}>
                    <input type="number" placeholder="Set Limit" style={{...styles.input, width: '120px', marginBottom: 0}} value={tempLimit} onChange={e => setTempLimit(e.target.value)} />
                    <button style={{...styles.btn, padding: '8px 15px'}} onClick={handleUpdateBudget} disabled={isSubmitting}>Update</button>
                 </div>
              </div>
              <div style={{ width: '100%', height: '12px', background: '#030712', borderRadius: '10px', margin: '20px 0' }}>
                <div style={{ width: `${savingsProgress}%`, height: '100%', background: '#10b981', borderRadius: '10px', transition: 'width 0.5s' }}></div>
              </div>
              <p style={{ fontSize: '14px', color: '#94a3b8' }}>
                {savingsProgress.toFixed(1)}% Completed | Remaining: ₹{remainingForGoal} | Budget: ₹{user?.budgetLimit || 5000}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
              <div style={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <h3>Transaction History</h3>
                  <input placeholder="Search..." style={{ ...styles.input, width: '180px', marginBottom: 0 }} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                  {filteredTransactions.map((t) => (
                    <div key={t.id || Math.random()} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #1f2937' }}>
                      <div>
                        <strong>{t.description}</strong><br/>
                        <small style={{ color: '#64748b' }}>{t.category}</small>
                      </div>
                      <div style={{ color: t.type === 'Income' ? '#10b981' : '#ef4444', textAlign: 'right' }}>
                        ₹{t.amount} <br/>
                        <button onClick={() => handleDelete(t.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={styles.card}>
                <h3>Expense Breakdown</h3>
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
            <h2 style={{ marginBottom: '30px' }}>Add New Transaction</h2>
            <label style={{fontSize: '14px', color: '#94a3b8'}}>Description</label>
            <input style={styles.input} placeholder="e.g. Salary, Groceries" value={newEntry.title} onChange={e => setNewEntry({ ...newEntry, title: e.target.value })} />
            
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
                  <option value="Travel">Travel</option>
                  <option value="Bills">Bills</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Entertainment">Entertainment</option>
                </select>
              </div>
            </div>
            
            <button style={{ ...styles.btn, width: '100%', marginTop: '20px' }} onClick={handleSaveTransaction} disabled={isSubmitting}>
               {isSubmitting ? "Processing..." : "Save Transaction"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;