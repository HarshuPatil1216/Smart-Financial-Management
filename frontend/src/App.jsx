import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const App = () => {
  const [view, setView] = useState('explore'); 
  const [user, setUser] = useState(null); 
  const [transactions, setTransactions] = useState([]);
  const [newEntry, setNewEntry] = useState({ title: '', amount: '', type: 'Expense', category: 'General' });
  const [tempLimit, setTempLimit] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  // --- NEW CONCEPT: Savings Goal State ---
  const [savingsGoal, setSavingsGoal] = useState({ name: "Emergency Fund", target: 50000 });

  const loadTransactions = async (userId) => {
    try {
      const res = await axios.get(`http://localhost:8080/api/history/${userId}`);
      setTransactions(res.data);
    } catch (err) { 
      console.error("Error loading data from backend. Make sure Spring Boot is running."); 
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8080/api/users/login', {
        username: e.target.username.value,
        password: e.target.password.value
      });
      setUser(res.data);
      loadTransactions(res.data.userId);
      setView('dashboard');
    } catch (err) { alert("Login Failed! Please check credentials."); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8080/api/users/register', {
        username: e.target.username.value,
        password: e.target.password.value,
        email: e.target.email.value
      });
      alert("Registration Successful! Please login to continue.");
      setView('login');
    } catch (err) { alert("Registration Failed! User might already exist."); }
  };

  const handleUpdateBudget = async () => {
    if (!tempLimit || tempLimit <= 0) return alert("Please enter a valid amount");
    try {
      const res = await axios.post('http://localhost:8080/api/users/update-budget', {
        user_id: user.userId,
        budget_limit: parseFloat(tempLimit)
      });
      setUser(res.data);
      alert("Monthly Budget Updated! ✅");
      setTempLimit("");
    } catch (err) { alert("Failed to update budget."); }
  };

 const handleSaveTransaction = async () => {
  if (!newEntry.title || !newEntry.amount) return alert("Fill all details");

  // --- नवीन बदल: बॅलन्स चेक ---
  const amountToSave = parseFloat(newEntry.amount);
  
  if (newEntry.type === 'Expense' && (balance - amountToSave) < 0) {
    alert("Transaction Failed: Insufficient funds in your account!");
    return; // इथेच फंक्शन थांबेल, बॅकएंडला डेटा जाणार नाही
  }
  // ---------------------------

  try {
    await axios.post('http://localhost:8080/api/add', {
      user_id: user.userId,
      description: newEntry.title,
      amount: amountToSave,
      type: newEntry.type,
      category: newEntry.category
    });
    loadTransactions(user.userId);
    setView('dashboard');
    setNewEntry({ title: '', amount: '', type: 'Expense', category: 'General' });
  } catch (err) { 
    alert("Transaction failed to save."); 
  }
};

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await axios.delete(`http://localhost:8080/api/transactions/${id}`); 
        loadTransactions(user.userId);
      } catch (err) { alert("Backend Delete API not found. Please verify your Controller."); }
    }
  };

  const exportToCSV = () => {
    const headers = "Description,Amount,Type,Category,Date\n";
    const rows = transactions.map(t => `${t.description},${t.amount},${t.type},${t.category || 'General'},${t.date || 'N/A'}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FinTrace_Report_${user.username}.csv`;
    a.click();
  };

  // --- Logic & Filtering ---
  const totalIncome = transactions.filter(t => t.type === 'Income').reduce((a, b) => a + Number(b.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'Expense').reduce((a, b) => a + Number(b.amount), 0);
  const balance = totalIncome - totalExpense;
  const currentBudget = user?.budgetLimit || 5000;
  const budgetProgress = (totalExpense / currentBudget) * 100;

  const savingsProgress = Math.min((balance / savingsGoal.target) * 100, 100);
  const remainingForGoal = Math.max(savingsGoal.target - balance, 0);

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "All" || (t.category && t.category.includes(filterCategory));
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

  const today = new Date();
  const currentDay = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const dailyAvg = totalExpense / (currentDay || 1);
  const predictedSpend = dailyAvg * daysInMonth;

  const styles = {
    wrapper: { backgroundColor: '#030712', minHeight: '100vh', color: '#f3f4f6', fontFamily: 'Inter, sans-serif', scrollBehavior: 'smooth' },
    sidebar: { width: '280px', background: '#111827', padding: '30px', borderRight: '1px solid #1f2937', position: 'sticky', top: 0, height: '100vh', display: 'flex', flexDirection: 'column' },
    main: { flex: 1, padding: '40px', overflowY: 'auto' },
    navbar: { display: 'flex', justifyContent: 'space-between', padding: '15px 50px', background: 'rgba(17, 24, 39, 0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #1f2937', alignItems: 'center', position: 'fixed', width: '100%', top: 0, zIndex: 1000, boxSizing: 'border-box' },
    hero: { textAlign: 'center', padding: '180px 20px 100px', background: 'linear-gradient(rgba(3, 7, 18, 0.9), rgba(3, 7, 18, 0.9)), url("https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=1600&q=80")', backgroundSize: 'cover', backgroundPosition: 'center' },
    card: { backgroundColor: '#111827', padding: '24px', borderRadius: '16px', border: '1px solid #1f2937', marginBottom: '25px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
    statCard: { padding: '20px', borderRadius: '16px', background: '#1f2937', border: '1px solid #374151', transition: 'all 0.3s ease' },
    input: { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', background: '#0f172a', color: 'white', border: '1px solid #334155', outline: 'none' },
    btn: { padding: '12px 24px', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: '0.3s' },
    aiBadge: { background: 'linear-gradient(90deg, #818cf8, #c084fc)', padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 'bold', color: 'white', letterSpacing: '1px' },
    footer: { padding: '60px 20px', textAlign: 'center', background: '#030712', borderTop: '1px solid #1f2937', color: '#64748b' }
  };

  // --- EXPLORE VIEW ---
  if (view === 'explore') {
    return (
      <div style={styles.wrapper}>
        <nav style={styles.navbar}>
          <h2 style={{ color: '#6366f1', margin: 0, fontSize: '24px', fontWeight: 'bold' }}>FinTrace</h2>
          <div style={{ display: 'flex', gap: '30px', fontWeight: '500' }}>
            <span style={{ cursor: 'pointer' }}>Home</span>
            <span style={{ cursor: 'pointer' }} onClick={() => document.getElementById('features').scrollIntoView({behavior:'smooth'})}>Features</span>
            <span style={{ cursor: 'pointer' }}>Security</span>
          </div>
          <button style={styles.btn} onClick={() => setView('login')}>Sign In</button>
        </nav>

        <header style={styles.hero}>
          <h1 style={{ fontSize: '64px', fontWeight: '800', marginBottom: '24px', letterSpacing: '-1px' }}>
            Master Your Money with <span style={{ color: '#6366f1' }}>AI Intelligence</span>
          </h1>
          <p style={{ fontSize: '20px', color: '#94a3b8', maxWidth: '800px', margin: '0 auto 40px', lineHeight: '1.6' }}>
            The ultimate financial companion for students. Track every rupee, set smart goals, and predict your future spending with our advanced dashboard.
          </p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <button style={{ ...styles.btn, fontSize: '18px', padding: '16px 40px' }} onClick={() => setView('register')}>Get Started Free</button>
            <button style={{ ...styles.btn, background: 'transparent', border: '1px solid #374151', fontSize: '18px' }}>Watch Demo</button>
          </div>
        </header>

        <section id="features" style={{ maxWidth: '1200px', margin: '100px auto', padding: '0 20px' }}>
          <h2 style={{ textAlign: 'center', fontSize: '36px', marginBottom: '60px' }}>Powerful Features</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' }}>
            {[
              { icon: '📊', title: 'Smart Analytics', desc: 'Detailed pie charts and bar graphs for your cash flow.' },
              { icon: '🤖', title: 'AI Predictions', desc: 'Algorithms that forecast your month-end balance.' },
              { icon: '🎯', title: 'Goal Tracking', desc: 'Set savings targets and watch your progress in real-time.' },
              { icon: '🔒', title: 'Bank-Grade Security', desc: 'Your data is encrypted and completely private.' },
              { icon: '📱', title: 'Mobile Friendly', desc: 'Access your dashboard anywhere, on any device.' },
              { icon: '📩', title: 'CSV Exports', desc: 'Download professional financial reports in one click.' }
            ].map((f, i) => (
              <div key={i} style={styles.card}>
                <div style={{ fontSize: '40px', marginBottom: '20px' }}>{f.icon}</div>
                <h3 style={{ marginBottom: '10px' }}>{f.title}</h3>
                <p style={{ color: '#94a3b8', lineHeight: '1.5' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <footer style={styles.footer}>
          <p>© 2026 FinTrace Financial. Built for Computer Science Students.</p>
          <div style={{ marginTop: '20px', fontSize: '14px' }}>Maharashtra, India • Privacy • Terms • Contact</div>
        </footer>
      </div>
    );
  }

  // --- AUTH VIEWS ---
  if (view === 'login' || view === 'register') {
    return (
      <div style={{ ...styles.wrapper, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#030712' }}>
        <div style={{ ...styles.card, width: '400px', padding: '40px' }}>
          <h2 style={{ textAlign: 'center', color: '#6366f1', fontSize: '28px', marginBottom: '10px' }}>
            {view === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '30px' }}>Enter your credentials to continue</p>
          <form onSubmit={view === 'login' ? handleLogin : handleRegister}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontSize: '14px', color: '#94a3b8' }}>Username</label>
              <input name="username" style={{ ...styles.input, marginTop: '5px' }} placeholder="harsh_aiml" required />
            </div>
            {view === 'register' && (
              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontSize: '14px', color: '#94a3b8' }}>Email</label>
                <input name="email" type="email" style={{ ...styles.input, marginTop: '5px' }} placeholder="name@college.edu" required />
              </div>
            )}
            <div style={{ marginBottom: '25px' }}>
              <label style={{ fontSize: '14px', color: '#94a3b8' }}>Password</label>
              <input name="password" type="password" style={{ ...styles.input, marginTop: '5px' }} placeholder="••••••••" required />
            </div>
            <button type="submit" style={{ ...styles.btn, width: '100%', fontSize: '16px' }}>
              {view === 'login' ? 'Sign In' : 'Register Now'}
            </button>
          </form>
          <p onClick={() => setView(view === 'login' ? 'register' : 'login')} style={{ textAlign: 'center', cursor: 'pointer', color: '#94a3b8', marginTop: '25px', fontSize: '14px' }}>
            {view === 'login' ? "Don't have an account? Sign up" : "Already have an account? Log in"}
          </p>
        </div>
      </div>
    );
  }

  // --- DASHBOARD UI ---
  return (
    <div style={{ ...styles.wrapper, display: 'flex' }}>
      <div style={styles.sidebar}>
        <h2 style={{ color: '#6366f1', marginBottom: '40px', letterSpacing: '1px' }}>FinTrace</h2>
        <div style={{ padding: '20px', background: '#1f2937', borderRadius: '12px', marginBottom: '30px' }}>
          <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0 }}>Active User</p>
          <h3 style={{ margin: '5px 0 0', fontSize: '16px' }}>{user?.username}</h3>
        </div>
        <nav style={{ flex: 1 }}>
          <button style={{ ...styles.btn, width: '100%', background: view === 'dashboard' ? '#6366f1' : 'transparent', textAlign: 'left', marginBottom: '12px' }} onClick={() => setView('dashboard')}>📊 Dashboard</button>
          <button style={{ ...styles.btn, width: '100%', background: view === 'add' ? '#6366f1' : 'transparent', textAlign: 'left', marginBottom: '12px' }} onClick={() => setView('add')}>➕ New Transaction</button>
          <button style={{ ...styles.btn, width: '100%', background: 'transparent', textAlign: 'left', color: '#94a3b8' }} onClick={exportToCSV}>📥 Export Data</button>
        </nav>
        <button style={{ ...styles.btn, width: '100%', backgroundColor: '#ef4444' }} onClick={() => { setUser(null); setView('explore'); }}>Logout</button>
      </div>

      <div style={styles.main}>
        {view === 'dashboard' && (
          <>
      

<header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
  <div>
    <h1 style={{ margin: 0 }}>Dashboard Overview</h1>
    <p style={{ color: '#94a3b8', margin: '5px 0 0' }}>Welcome back to your financial control center.</p>
  </div>
  <div style={{ textAlign: 'right' }}>
    <p style={{ color: '#94a3b8', margin: 0, fontSize: '14px' }}>Net Balance</p>
    
    {balance < 0 ? (
      <h2 style={{ color: '#ef4444', margin: 0, fontWeight: 'bold' }}>
        ⚠️ Insufficient Funds
      </h2>
    ) : (
      <h1 style={{ color: '#10b981', margin: 0 }}>
        ₹{balance}
      </h1>
    )}
  </div>
</header>


            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
              <div style={styles.statCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Income</span><span style={{ color: '#10b981' }}>↑</span></div>
                <h2 style={{ margin: '10px 0 0' }}>₹{totalIncome}</h2>
              </div>
              <div style={styles.statCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Expenses</span><span style={{ color: '#ef4444' }}>↓</span></div>
                <h2 style={{ margin: '10px 0 0' }}>₹{totalExpense}</h2>
              </div>
              <div style={styles.statCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Top Category</span><span style={{ color: '#f59e0b' }}>★</span></div>
                <h2 style={{ margin: '10px 0 0', fontSize: '20px' }}>{topCategory}</h2>
              </div>
              <div style={{ ...styles.statCard, border: '1px solid #6366f1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={styles.aiBadge}>AI FORECAST</span></div>
                <h2 style={{ margin: '10px 0 0' }}>₹{predictedSpend.toFixed(0)}</h2>
              </div>
            </div>

            {/* SAVINGS GOAL TRACKER */}
            <div style={{ ...styles.card, background: 'linear-gradient(145deg, #111827, #1f2937)', border: '1px solid #10b981' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ margin: 0 }}>🎯 Savings Goal: {savingsGoal.name}</h3>
                  <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '5px' }}>Target: ₹{savingsGoal.target} | Current: ₹{balance}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h2 style={{ margin: 0, color: '#10b981' }}>{savingsProgress.toFixed(1)}%</h2>
                </div>
              </div>
              <div style={{ width: '100%', height: '12px', background: '#030712', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ width: `${savingsProgress}%`, height: '100%', background: '#10b981', transition: 'width 1s ease-in-out' }}></div>
              </div>
              <p style={{ fontSize: '13px', marginTop: '15px', color: remainingForGoal <= 0 ? '#10b981' : '#94a3b8' }}>
                {remainingForGoal <= 0 ? "🎉 Congratulations! You have reached your goal!" : `You need ₹${remainingForGoal} more to reach your target.`}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
              <div style={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                  <h3 style={{ margin: 0 }}>Recent Transactions</h3>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input 
                      style={{ ...styles.input, width: '200px', marginBottom: 0, padding: '8px 12px' }} 
                      placeholder="🔍 Search..." 
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <select 
                      style={{ ...styles.input, width: '120px', marginBottom: 0, padding: '8px' }}
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                    >
                      <option value="All">All</option>
                      <option value="Food">Food</option>
                      <option value="Travel">Travel</option>
                      <option value="Bills">Bills</option>
                      <option value="Salary">Salary</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                </div>
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {filteredTransactions.slice(0).reverse().map((t, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #1f2937' }}>
                      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <div style={{ background: '#1f2937', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {t.type === 'Income' ? '💰' : '💸'}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600' }}>{t.description}</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>{t.category} • {t.type}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 'bold', color: t.type === 'Income' ? '#10b981' : '#ef4444' }}>
                          {t.type === 'Income' ? '+' : '-'} ₹{t.amount}
                        </div>
                        <button onClick={() => handleDelete(t.id)} style={{ background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <div style={styles.card}>
                  <h3 style={{ marginBottom: '20px' }}>Budget Limit</h3>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <input type="number" style={{ ...styles.input, marginBottom: 0 }} placeholder="Set New Limit" value={tempLimit} onChange={(e) => setTempLimit(e.target.value)} />
                    <button style={styles.btn} onClick={handleUpdateBudget}>Update</button>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#030712', borderRadius: '10px', marginBottom: '10px' }}>
                    <div style={{ width: `${Math.min(budgetProgress, 100)}%`, height: '100%', background: budgetProgress > 90 ? '#ef4444' : '#6366f1', borderRadius: '10px' }}></div>
                  </div>
                  <p style={{ fontSize: '12px', color: '#94a3b8' }}>Used ₹{totalExpense} of ₹{currentBudget} ({budgetProgress.toFixed(1)}%)</p>
                </div>

                <div style={styles.card}>
                  <h3 style={{ marginBottom: '20px' }}>Cash Flow Analysis</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={[{ name: 'In', value: totalIncome || 1 }, { name: 'Out', value: totalExpense }]} innerRadius={60} outerRadius={80} dataKey="value" paddingAngle={5}>
                        <Cell fill="#10b981" /><Cell fill="#ef4444" />
                      </Pie>
                      <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', color: 'white' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}

        {view === 'add' && (
          <div style={{ ...styles.card, maxWidth: '600px', margin: '40px auto', padding: '40px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '40px' }}>New Transaction</h2>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: '#94a3b8', fontSize: '14px' }}>Description</label>
              <input style={{ ...styles.input, marginTop: '8px' }} placeholder="Ex: Starbucks Coffee" value={newEntry.title} onChange={e => setNewEntry({ ...newEntry, title: e.target.value })} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: '#94a3b8', fontSize: '14px' }}>Amount (₹)</label>
              <input style={{ ...styles.input, marginTop: '8px' }} type="number" placeholder="0.00" value={newEntry.amount} onChange={e => setNewEntry({ ...newEntry, amount: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
              <div>
                <label style={{ color: '#94a3b8', fontSize: '14px' }}>Type</label>
                <select style={{ ...styles.input, marginTop: '8px' }} value={newEntry.type} onChange={e => setNewEntry({ ...newEntry, type: e.target.value })}>
                  <option value="Expense">Expense</option>
                  <option value="Income">Income</option>
                </select>
              </div>
              <div>
                <label style={{ color: '#94a3b8', fontSize: '14px' }}>Category</label>
                <select style={{ ...styles.input, marginTop: '8px' }} value={newEntry.category} onChange={e => setNewEntry({ ...newEntry, category: e.target.value })}>
                  <option value="General">General</option>
                  <option value="Food">Food</option>
                  <option value="Travel">Travel</option>
                  <option value="Bills">Bills</option>
                  <option value="Salary">Salary</option>
                </select>
              </div>
            </div>
            <button style={{ ...styles.btn, width: '100%', padding: '16px' }} onClick={handleSaveTransaction}>Confirm Transaction</button>
            <button style={{ ...styles.btn, width: '100%', background: 'transparent', color: '#94a3b8', marginTop: '10px' }} onClick={() => setView('dashboard')}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  ); 
};

export default App;