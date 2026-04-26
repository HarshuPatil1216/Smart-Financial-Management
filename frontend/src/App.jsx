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

  // Backend Base URL

const API_BASE_URL = "https://smart-finance-backend-knxx.onrender.com";
  // Savings Goal State
  const [savingsGoal] = useState({ name: "Emergency Fund", target: 50000 });

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
    try {
      const res = await axios.post(`${API_BASE_URL}/api/users/login`, {
        username: e.target.username.value,
        password: e.target.password.value
      });
      setUser(res.data);
      loadTransactions(res.data.userId);
      setView('dashboard');
    } catch (err) { 
      alert("Login Failed! Please check credentials."); 
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
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
    }
  };

  const handleUpdateBudget = async () => {
    if (!tempLimit || tempLimit <= 0) return alert("Enter valid amount");
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
    }
  };

  const handleSaveTransaction = async () => {
    if (!newEntry.title || !newEntry.amount) return alert("Fill all details");
    try {
      await axios.post(`${API_BASE_URL}/api/add`, {
        user_id: user.userId,
        description: newEntry.title,
        amount: parseFloat(newEntry.amount),
        type: newEntry.type,
        category: newEntry.category
      });
      loadTransactions(user.userId);
      setView('dashboard');
      setNewEntry({ title: '', amount: '', type: 'Expense', category: 'General' });
    } catch (err) { 
      alert("Save failed."); 
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

  // Logic Calculations
  const totalIncome = transactions.filter(t => t.type === 'Income').reduce((a, b) => a + Number(b.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'Expense').reduce((a, b) => a + Number(b.amount), 0);
  const balance = totalIncome - totalExpense;
  const currentBudget = user?.budgetLimit || 5000;
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

  const styles = {
    wrapper: { backgroundColor: '#030712', minHeight: '100vh', color: '#f3f4f6', fontFamily: 'Inter, sans-serif' },
    navbar: { display: 'flex', justifyContent: 'space-between', padding: '15px 50px', background: '#111827', borderBottom: '1px solid #1f2937', alignItems: 'center', position: 'fixed', width: '100%', top: 0, zIndex: 1000, boxSizing: 'border-box' },
    sidebar: { width: '280px', background: '#111827', padding: '30px', borderRight: '1px solid #1f2937', position: 'sticky', top: 0, height: '100vh', display: 'flex', flexDirection: 'column' },
    main: { flex: 1, padding: '100px 40px 40px', overflowY: 'auto' },
    card: { backgroundColor: '#111827', padding: '24px', borderRadius: '16px', border: '1px solid #1f2937', marginBottom: '25px' },
    statCard: { padding: '20px', borderRadius: '16px', background: '#1f2937', border: '1px solid #374151' },
    input: { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', background: '#0f172a', color: 'white', border: '1px solid #334155' },
    btn: { padding: '12px 24px', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
    aiBadge: { background: 'linear-gradient(90deg, #818cf8, #c084fc)', padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 'bold' }
  };

  if (view === 'explore') {
    return (
      <div style={styles.wrapper}>
        <nav style={styles.navbar}>
          <h2 style={{ color: '#6366f1', margin: 0 }}>FinTrace</h2>
          <div style={{ display: 'flex', gap: '30px' }}>
            <span>Home</span><span>Features</span><span>Security</span>
          </div>
          <button style={styles.btn} onClick={() => setView('login')}>Sign In</button>
        </nav>
        <div style={{ textAlign: 'center', padding: '200px 20px' }}>
          <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>Smart Wealth Management</h1>
          <p style={{ color: '#94a3b8', fontSize: '20px' }}>Take control of your money with AI-powered insights.</p>
          <button style={{ ...styles.btn, marginTop: '30px', fontSize: '18px' }} onClick={() => setView('register')}>Get Started Free</button>
        </div>
      </div>
    );
  }

  if (view === 'login' || view === 'register') {
    return (
      <div style={{ ...styles.wrapper, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ ...styles.card, width: '400px' }}>
          <h2 style={{ textAlign: 'center', color: '#6366f1' }}>{view === 'login' ? 'Login' : 'Register'}</h2>
          <form onSubmit={view === 'login' ? handleLogin : handleRegister}>
            <input name="username" style={styles.input} placeholder="Username" required />
            {view === 'register' && <input name="email" type="email" style={styles.input} placeholder="Email" required />}
            <input name="password" type="password" style={styles.input} placeholder="Password" required />
            <button type="submit" style={{ ...styles.btn, width: '100%' }}>Submit</button>
          </form>
          <p onClick={() => setView(view === 'login' ? 'register' : 'login')} style={{ textAlign: 'center', cursor: 'pointer', marginTop: '20px', color: '#94a3b8' }}>
            {view === 'login' ? "New here? Register" : "Have account? Login"}
          </p>
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
          <button style={{ ...styles.btn, width: '100%', background: view === 'add' ? '#6366f1' : 'transparent', textAlign: 'left' }} onClick={() => setView('add')}>➕ Add New</button>
        </nav>
        <button style={{ ...styles.btn, backgroundColor: '#ef4444' }} onClick={() => { setUser(null); setTransactions([]); setView('explore'); }}>Logout</button>
      </div>

      <div style={styles.main}>
        {view === 'dashboard' && (
          <>
            <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
              <h1>Dashboard</h1>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: '#94a3b8', margin: 0 }}>Net Balance</p>
                <h1 style={{ color: balance >= 0 ? '#10b981' : '#ef4444', margin: 0 }}>₹{balance}</h1>
              </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <div style={styles.statCard}><span>Income</span><h2 style={{ color: '#10b981' }}>₹{totalIncome}</h2></div>
              <div style={styles.statCard}><span>Expenses</span><h2 style={{ color: '#ef4444' }}>₹{totalExpense}</h2></div>
              <div style={styles.statCard}><span>Top Category</span><h2>{topCategory}</h2></div>
              <div style={{ ...styles.statCard, border: '1px solid #6366f1' }}>
                <span style={styles.aiBadge}>AI FORECAST</span>
                <h2>₹{predictedSpend.toFixed(0)}</h2>
              </div>
            </div>

            <div style={styles.card}>
              <h3>🎯 Goal: {savingsGoal.name}</h3>
              <div style={{ width: '100%', height: '10px', background: '#030712', borderRadius: '10px', margin: '15px 0' }}>
                <div style={{ width: `${savingsProgress}%`, height: '100%', background: '#10b981', borderRadius: '10px' }}></div>
              </div>
              <p style={{ fontSize: '12px' }}>{savingsProgress.toFixed(1)}% Completed (Remaining: ₹{remainingForGoal})</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
              <div style={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <h3>History</h3>
                  <input placeholder="Search..." style={{ ...styles.input, width: '150px', marginBottom: 0 }} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {filteredTransactions.map((t) => (
                    <div key={t.id || Math.random()} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #1f2937' }}>
                      <div>{t.description} <small style={{ color: '#64748b' }}>({t.category})</small></div>
                      <div style={{ color: t.type === 'Income' ? '#10b981' : '#ef4444' }}>
                        ₹{t.amount} <button onClick={() => handleDelete(t.id)} style={{ color: 'grey', background: 'none', border: 'none', cursor: 'pointer', marginLeft: '10px' }}>x</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={styles.card}>
                <h3>Analytics</h3>
                <div style={{ width: '100%', height: 200 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={[{ name: 'In', value: totalIncome || 1 }, { name: 'Out', value: totalExpense || 0.1 }]} innerRadius={50} outerRadius={70} dataKey="value">
                        <Cell fill="#10b981" /><Cell fill="#ef4444" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}

        {view === 'add' && (
          <div style={{ ...styles.card, maxWidth: '500px', margin: '0 auto' }}>
            <h2>New Transaction</h2>
            <input style={styles.input} placeholder="Title" value={newEntry.title} onChange={e => setNewEntry({ ...newEntry, title: e.target.value })} />
            <input style={styles.input} type="number" placeholder="Amount" value={newEntry.amount} onChange={e => setNewEntry({ ...newEntry, amount: e.target.value })} />
            <select style={styles.input} value={newEntry.type} onChange={e => setNewEntry({ ...newEntry, type: e.target.value })}>
              <option value="Expense">Expense</option>
              <option value="Income">Income</option>
            </select>
            <select style={styles.input} value={newEntry.category} onChange={e => setNewEntry({ ...newEntry, category: e.target.value })}>
              <option value="General">General</option>
              <option value="Food">Food</option>
              <option value="Travel">Travel</option>
              <option value="Bills">Bills</option>
            </select>
            <button style={{ ...styles.btn, width: '100%' }} onClick={handleSaveTransaction}>Save</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;