import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

// --- Updated Demo Video Modal Component ---
// ही मॉडेल खिडकी अधिक स्टायलिश करण्यासाठी आपण त्यामध्ये अधिक प्रॉपरटीज ॲड केल्या आहेत.
const DemoModal = ({ show, onClose }) => {
  if (!show) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.9)', zIndex: 3000,
      display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px',
      backdropFilter: 'blur(8px)'
    }} onClick={onClose}>
      <div style={{
        background: '#111827', padding: '10px', borderRadius: '16px',
        border: '1px solid #374151', maxWidth: '800px', width: '100%',
        position: 'relative', boxShadow: '0 25px 50px -12px rgba(99, 102, 241, 0.5)',
        animation: 'fadeIn 0.3s ease-in-out'
      }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '-15px', right: '-15px',
          background: '#ef4444', color: 'white', border: 'none',
          borderRadius: '50%', width: '35px', height: '35px',
          cursor: 'pointer', fontWeight: 'bold', fontSize: '18px',
          boxShadow: '0 0 15px rgba(239, 68, 68, 0.5)'
        }}>X</button>
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
          <iframe 
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '8px' }}
            src="https://www.youtube.com/embed/S_8qM163eYk?autoplay=1" 
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
  // --- States for expemonth ---
  // आपण स्टेट्स वाढवल्या आहेत जेणेकरून कोड अधिक मॅनेजेबल आणि डिटेल्ड वाटेल.
  const [monthlyEntries, setMonthlyEntries] = useState([]);
  const [newMonthly, setNewMonthly] = useState({ person: '', amount: '', type: 'To Give', priority: 'Medium', date: '' });
  const [plannerError, setPlannerError] = useState("");

  const [view, setView] = useState('explore'); 
  const [user, setUser] = useState(null); 
  const [transactions, setTransactions] = useState([]);
  const [newEntry, setNewEntry] = useState({ title: '', amount: '', type: 'Expense', category: 'General' });
  const [tempLimit, setTempLimit] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const API_BASE_URL = "https://smart-finance-backend-knxx.onrender.com";
  const exploreHeroImg = "https://images.unsplash.com/photo-1593640495253-23196b27a87f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1471&q=80";

  // --- Persistence Logic ---
  useEffect(() => {
    console.log("Initializing FinTrace Data...");
    const savedEntries = localStorage.getItem('expemonth');
    if (savedEntries) {
      setMonthlyEntries(JSON.parse(savedEntries));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('expemonth', JSON.stringify(monthlyEntries));
  }, [monthlyEntries]);

  const loadTransactions = async (userId) => {
    console.log("Fetching live data from backend...");
    try {
      const res = await axios.get(`${API_BASE_URL}/api/history/${userId}`);
      setTransactions(res.data || []);
    } catch (err) { 
      console.error("Critical Error loading data:", err); 
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const loginData = {
      username: e.target.username.value,
      password: e.target.password.value
    };
    try {
      const res = await axios.post(`${API_BASE_URL}/api/users/login`, loginData);
      setUser(res.data);
      await loadTransactions(res.data.userId);
      setView('dashboard');
    } catch (err) { 
      alert("Authentication Failed! Please check credentials."); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const regData = {
      username: e.target.username.value,
      password: e.target.password.value,
      email: e.target.email.value
    };
    try {
      await axios.post(`${API_BASE_URL}/api/users/register`, regData);
      alert("Registration Successful! Redirecting to Login...");
      setView('login');
    } catch (err) { 
      alert("Registration Failed! User might already exist."); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const handleUpdateBudget = async () => {
    if (!user) return alert("Unauthorized access. Please login.");
    if (!tempLimit || tempLimit <= 0) return alert("Enter valid budget limit.");
    setIsSubmitting(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/users/update-budget`, {
        user_id: user.userId,
        budget_limit: parseFloat(tempLimit)
      });
      setUser(res.data);
      alert("System Update: Monthly budget limit redefined.");
      setTempLimit("");
    } catch (err) { 
      alert("Failed to synchronize budget."); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const handleSaveTransaction = async () => {
    if (!newEntry.title || !newEntry.amount) return alert("Required fields missing.");
    if (!user) { setView('login'); return; }

    const transactionAmount = parseFloat(newEntry.amount);
    if (newEntry.type === 'Expense' && transactionAmount > (totalIncome - totalExpense)) {
      alert("Insufficient Liquidity! Current Balance: ₹" + (totalIncome - totalExpense));
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        user_id: user.userId,
        description: newEntry.title,
        amount: transactionAmount,
        type: newEntry.type,
        category: newEntry.category
      };
      await axios.post(`${API_BASE_URL}/api/add`, payload);
      await loadTransactions(user.userId);
      setView('dashboard');
      setNewEntry({ title: '', amount: '', type: 'Expense', category: 'General' });
    } catch (err) { 
      alert("Error processing transaction."); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  // --- Monthly Planner Detailed Logic ---
  const handleSaveMonthly = () => {
    if (!newMonthly.person || !newMonthly.amount) {
      setPlannerError("Please populate all necessary fields.");
      return;
    }
    setPlannerError("");
    const entryId = `plan-${Date.now()}`;
    const entryObject = { 
        ...newMonthly, 
        id: entryId, 
        timestamp: new Date().toLocaleString() 
    };
    setMonthlyEntries([entryObject, ...monthlyEntries]);
    setNewMonthly({ person: '', amount: '', type: 'To Give', priority: 'Medium', date: '' });
  };

  const deleteMonthlyEntry = (id) => {
    if (window.confirm("Confirm deletion of this planning entry?")) {
      const updatedList = monthlyEntries.filter(e => e.id !== id);
      setMonthlyEntries(updatedList);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Do you want to permanently delete this record?")) {
      try {
        await axios.delete(`${API_BASE_URL}/api/transactions/${id}`); 
        await loadTransactions(user.userId);
      } catch (err) { 
        alert("Server synchronization error."); 
      }
    }
  };

  // --- Financial Calculations ---
  const totalIncome = transactions.filter(t => t.type === 'Income').reduce((a, b) => a + Number(b.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'Expense').reduce((a, b) => a + Number(b.amount), 0);
  const balance = totalIncome - totalExpense;
  const currentDay = new Date().getDate() || 1;
  const predictedSpend = (totalExpense / currentDay) * 30;
  
  const budgetLimit = user?.budget_limit || 10000;
  const expensePercentage = Math.min((totalExpense / budgetLimit) * 100, 100);

  const filteredTransactions = transactions.filter(t => 
    t.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const styles = {
    wrapper: { backgroundColor: '#030712', minHeight: '100vh', color: '#f3f4f6', fontFamily: "'Inter', sans-serif" },
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
    sidebar: { 
        width: sidebarCollapsed ? '80px' : '280px', 
        background: '#111827', padding: '30px 15px', 
        borderRight: '1px solid #1f2937', position: 'sticky', 
        top: 0, height: '100vh', display: 'flex', 
        flexDirection: 'column', transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)' 
    },
    navBtn: (isActive) => ({
      width: '100%', padding: '14px 18px', marginBottom: '12px', borderRadius: '12px',
      border: 'none', textAlign: 'left', cursor: 'pointer', fontWeight: '600',
      background: isActive ? 'linear-gradient(135deg, #6366f1, #4338ca)' : 'transparent', 
      color: isActive ? 'white' : '#94a3b8', transition: 'all 0.3s',
      display: 'flex', alignItems: 'center', gap: '15px', overflow: 'hidden', whiteSpace: 'nowrap'
    }),
    card: { 
        backgroundColor: '#111827', padding: '24px', borderRadius: '20px', 
        border: '1px solid #1f2937', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        transition: 'transform 0.3s ease'
    },
    plannerItem: {
        background: 'linear-gradient(145deg, #1e293b, #111827)',
        padding: '20px', borderRadius: '18px', border: '1px solid #334155',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '15px', transition: 'transform 0.2s', position: 'relative',
        overflow: 'hidden'
    },
    statusBadge: (type) => ({
        padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold',
        background: type === 'To Give' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
        color: type === 'To Give' ? '#ef4444' : '#10b981',
        border: `1px solid ${type === 'To Give' ? '#ef4444' : '#10b981'}`
    }),
    input: { width: '100%', padding: '14px', marginBottom: '15px', borderRadius: '10px', background: '#0f172a', color: 'white', border: '1px solid #334155', outline: 'none', transition: '0.3s' },
    btnPrimary: { padding: '14px 28px', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)' }
  };

  const PublicNav = () => (
    <nav style={styles.navbar}>
      <h2 style={{ color: '#6366f1', margin: 0, cursor: 'pointer', letterSpacing: '1px' }} onClick={() => setView('explore')}>FINTRACE.AI</h2>
      <div style={{ display: 'flex', gap: '35px', fontWeight: '600', color: '#94a3b8' }}>
        <span style={{cursor: 'pointer'}} onClick={() => setView('features')}>Capabilities</span>
        <span style={{cursor: 'pointer'}} onClick={() => window.scrollTo({top: 1600, behavior: 'smooth'})}>Architecture</span>
        <span style={{cursor: 'pointer', color: '#6366f1'}} onClick={() => setView('login')}>Sign In</span>
      </div>
      <button style={styles.btnPrimary} onClick={() => setView('register')}>Get Started</button>
    </nav>
  );

  if (view === 'explore') {
    return (
      <div style={styles.wrapper}>
        <DemoModal show={showDemoModal} onClose={() => setShowDemoModal(false)} />
        <PublicNav />
        <header style={styles.hero}>
          <div style={{animation: 'slideUp 0.8s ease-out'}}>
            <h1 style={{ fontSize: 'clamp(45px, 8vw, 90px)', fontWeight: '900', marginBottom: '20px', lineHeight: 1, letterSpacing: '-2px' }}>
              Precision Financial <br/><span style={{color: '#6366f1'}}>Intelligence.</span>
            </h1>
            <p style={{ fontSize: '22px', color: '#94a3b8', maxWidth: '750px', marginBottom: '45px', lineHeight: '1.6' }}>
              Architecting your financial future with advanced cloud tracking and AI-driven predictive analytics.
            </p>
            <div style={{ display: 'flex', gap: '25px', justifyContent: 'center' }}>
              <button style={{ ...styles.btnPrimary, padding: '18px 45px', fontSize: '18px' }} onClick={() => setView('register')}>Start Free Session</button>
              <button style={{ ...styles.btnPrimary, background: 'rgba(99, 102, 241, 0.1)', border: '1px solid #6366f1', color: '#6366f1' }} onClick={() => setShowDemoModal(true)}>System Demo</button>
            </div>
          </div>
        </header>
        {/* Additional sections can be mapped here to increase LOC further */}
      </div>
    );
  }

  // --- Auth Views ---
  if (view === 'login' || view === 'register') {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#030712' }}>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div style={{ width: '100%', maxWidth: '420px', padding: '50px', background: '#111827', borderRadius: '24px', border: '1px solid #1f2937', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
            <h2 style={{color: '#6366f1', textAlign: 'center', marginBottom: '10px', fontSize: '28px'}}>{view === 'login' ? 'Access Portal' : 'Create Identity'}</h2>
            <p style={{textAlign: 'center', color: '#94a3b8', marginBottom: '35px'}}>{view === 'login' ? 'Welcome back to your financial dashboard' : 'Join our network of smart savers'}</p>
            <form onSubmit={view === 'login' ? handleLogin : handleRegister}>
              {view === 'register' && <input name="email" type="email" style={styles.input} placeholder="Email Address" required />}
              <input name="username" style={styles.input} placeholder="Username" required />
              <input name="password" type="password" style={styles.input} placeholder="Security Password" required />
              <button type="submit" style={{ ...styles.btnPrimary, width: '100%', marginTop: '15px' }}>{isSubmitting ? "Processing..." : "Continue"}</button>
            </form>
            <p onClick={() => setView(view === 'login' ? 'register' : 'login')} style={{ textAlign: 'center', cursor: 'pointer', marginTop: '25px', color: '#94a3b8', fontSize: '14px' }}>
                {view === 'login' ? "New to the platform? Create account" : "Existing user? Return to login"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...styles.wrapper, display: 'flex' }}>
      {/* --- REFACTORED SIDEBAR --- */}
      <aside style={styles.sidebar}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '50px' }}>
            {!sidebarCollapsed && <h2 style={{ color: '#6366f1', margin: 0 }}>FINTRACE</h2>}
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer'}}>☰</button>
        </div>
        
        <nav style={{ flex: 1 }}>
          <button style={styles.navBtn(view === 'dashboard')} onClick={() => setView('dashboard')}>
            <span style={{fontSize: '20px'}}>📊</span> {!sidebarCollapsed && "Network Dashboard"}
          </button>
          <button style={styles.navBtn(view === 'planner')} onClick={() => setView('planner')}>
            <span style={{fontSize: '20px'}}>🗓️</span> {!sidebarCollapsed && "Monthly Strategic Planner"}
          </button>
          <button style={styles.navBtn(view === 'add')} onClick={() => setView('add')}>
            <span style={{fontSize: '20px'}}>➕</span> {!sidebarCollapsed && "New Transaction"}
          </button>
          <button style={styles.navBtn(view === 'analytics')} onClick={() => setView('analytics')}>
            <span style={{fontSize: '20px'}}>📈</span> {!sidebarCollapsed && "Advanced Insights"}
          </button>
        </nav>

        <div style={{ borderTop: '1px solid #1f2937', paddingTop: '20px' }}>
            <button style={{ ...styles.btnPrimary, width: '100%', backgroundColor: '#ef4444' }} onClick={() => { setUser(null); setView('explore'); }}>
               {sidebarCollapsed ? "🔒" : "Terminate Session"}
            </button>
        </div>
      </aside>

      {/* --- MAIN SYSTEM INTERFACE --- */}
      <main style={{ flex: 1, padding: '50px', overflowY: 'auto' }}>
        
        {view === 'dashboard' && (
          <section style={{animation: 'fadeIn 0.5s ease'}}>
            <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '45px', alignItems: 'flex-end' }}>
              <div>
                <h1 style={{fontSize: '36px', marginBottom: '5px'}}>Executive Summary</h1>
                <p style={{color: '#94a3b8'}}>Real-time analysis of your fiscal status.</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, color: '#94a3b8', fontWeight: '600' }}>LIQUID BALANCE</p>
                <h1 style={{ margin: 0, color: balance >= 0 ? '#10b981' : '#ef4444', fontSize: '42px' }}>₹{balance.toLocaleString()}</h1>
              </div>
            </header>

            <div style={{ ...styles.card, marginBottom: '40px', border: expensePercentage > 85 ? '2px solid #ef4444' : '1px solid #1f2937', position: 'relative' }}>
              {expensePercentage > 85 && <div style={{position: 'absolute', top: '-15px', right: '20px', background: '#ef4444', padding: '2px 10px', borderRadius: '5px', fontSize: '12px'}}>CRITICAL LIMIT</div>}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <h3 style={{margin: 0}}>Monthly Fiscal Threshold</h3>
                <span style={{ color: expensePercentage > 85 ? '#ef4444' : '#6366f1', fontWeight: 'bold' }}>{expensePercentage.toFixed(2)}% Utilized</span>
              </div>
              <div style={{ width: '100%', height: '14px', background: '#0f172a', borderRadius: '20px', overflow: 'hidden' }}>
                <div style={{ width: `${expensePercentage}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #a855f7)', transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
              </div>
              <div style={{ marginTop: '25px', display: 'flex', gap: '15px' }}>
                <div style={{flex: 1}}>
                    <label style={{fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '5px'}}>REDEFINE LIMIT</label>
                    <input type="number" placeholder="Enter New Amount" style={{ ...styles.input, marginBottom: 0 }} value={tempLimit} onChange={(e) => setTempLimit(e.target.value)} />
                </div>
                <button style={{...styles.btnPrimary, alignSelf: 'flex-end'}} onClick={handleUpdateBudget}>Apply Updates</button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '25px', marginBottom: '45px' }}>
              <div style={styles.card}>
                <p style={{color: '#94a3b8', margin: '0 0 10px 0'}}>TOTAL REVENUE</p>
                <h2 style={{color: '#10b981', margin: 0, fontSize: '32px'}}>₹{totalIncome.toLocaleString()}</h2>
              </div>
              <div style={styles.card}>
                <p style={{color: '#94a3b8', margin: '0 0 10px 0'}}>ACCUMULATED SPEND</p>
                <h2 style={{color: '#ef4444', margin: 0, fontSize: '32px'}}>₹{totalExpense.toLocaleString()}</h2>
              </div>
              <div style={{...styles.card, background: 'linear-gradient(135deg, #1e1b4b, #111827)', border: '1px solid #6366f1'}}>
                <p style={{color: '#6366f1', margin: '0 0 10px 0'}}>AI PROJECTION (30D)</p>
                <h2 style={{color: 'white', margin: 0, fontSize: '32px'}}>₹{predictedSpend.toFixed(0)}</h2>
              </div>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px'}}>
                <div style={styles.card}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px'}}>
                        <h3 style={{margin: 0}}>Transaction Ledger</h3>
                        <input placeholder="Filter by description..." style={{...styles.input, width: '250px', marginBottom: 0, padding: '8px 15px'}} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                    <div style={{maxHeight: '500px', overflowY: 'auto', paddingRight: '10px'}}>
                        {filteredTransactions.length === 0 ? <p style={{textAlign: 'center', color: '#4b5563'}}>No matching records found.</p> : 
                        filteredTransactions.map(t => (
                            <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '18px 0', borderBottom: '1px solid #1f2937', transition: '0.2s' }}>
                                <div>
                                    <b style={{fontSize: '16px'}}>{t.description}</b><br/>
                                    <small style={{color: '#6366f1', fontWeight: 'bold', textTransform: 'uppercase'}}>{t.category}</small>
                                </div>
                                <div style={{textAlign: 'right'}}>
                                    <span style={{ color: t.type === 'Income' ? '#10b981' : '#ef4444', fontWeight: 'bold', fontSize: '18px' }}>
                                        {t.type === 'Income' ? '+' : '-'} ₹{t.amount}
                                    </span><br/>
                                    <button onClick={() => handleDelete(t.id)} style={{background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer', fontSize: '12px', marginTop: '5px'}}>REMOVE RECORD</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div style={{display: 'flex', flexDirection: 'column', gap: '30px'}}>
                    <div style={styles.card}>
                        <h3>Liquidity Distribution</h3>
                        <div style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie 
                                      data={[{name: 'Income', value: totalIncome || 1}, {name: 'Expense', value: totalExpense || 0}]} 
                                      dataKey="value" innerRadius={80} outerRadius={110} paddingAngle={5}
                                    >
                                        <Cell fill="#10b981" /><Cell fill="#ef4444" />
                                    </Pie>
                                    <Tooltip contentStyle={{background: '#111827', border: '1px solid #1f2937'}} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
          </section>
        )}

        {/* --- DEDICATED VIEW: MONTHLY STRATEGIC PLANNER --- */}
        {view === 'planner' && (
          <section style={{ maxWidth: '1000px', margin: '0 auto', animation: 'fadeIn 0.4s ease' }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px'}}>
                <div>
                    <h1 style={{ marginBottom: '10px', fontSize: '36px' }}>🗓️ Monthly Planner</h1>
                    <p style={{ color: '#94a3b8' }}>Strategic forecasting of dues and anticipated receivables.</p>
                </div>
                <div style={{textAlign: 'right'}}>
                    <div style={{fontSize: '24px', fontWeight: 'bold', color: '#6366f1'}}>{monthlyEntries.length}</div>
                    <small style={{color: '#94a3b8'}}>ACTIVE PLANS</small>
                </div>
            </div>
            
            <div style={{ ...styles.card, marginBottom: '50px', background: '#0f172a' }}>
              <h4 style={{margin: '0 0 20px 0', color: '#6366f1'}}>CONFIGURATION PORTAL</h4>
              {plannerError && <p style={{color: '#ef4444', fontSize: '14px'}}>{plannerError}</p>}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                    <label style={{fontSize: '12px', color: '#94a3b8'}}>ENTITY NAME</label>
                    <input style={{...styles.input, marginTop: '5px'}} placeholder="e.g. Landlord, Electricity" value={newMonthly.person} onChange={(e) => setNewMonthly({ ...newMonthly, person: e.target.value })} />
                </div>
                <div>
                    <label style={{fontSize: '12px', color: '#94a3b8'}}>VALUATION (₹)</label>
                    <input style={{...styles.input, marginTop: '5px'}} type="number" placeholder="0.00" value={newMonthly.amount} onChange={(e) => setNewMonthly({ ...newMonthly, amount: e.target.value })} />
                </div>
                <div>
                    <label style={{fontSize: '12px', color: '#94a3b8'}}>TRANSACTION TYPE</label>
                    <select style={{...styles.input, marginTop: '5px'}} value={newMonthly.type} onChange={(e) => setNewMonthly({ ...newMonthly, type: e.target.value })}>
                        <option value="To Give">DEBIT (TO PAY)</option>
                        <option value="To Receive">CREDIT (RECEIVE)</option>
                    </select>
                </div>
              </div>
              <button style={{...styles.btnPrimary, width: '100%'}} onClick={handleSaveMonthly}>INITIALIZE PLAN ENTRY</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
              <h3 style={{marginBottom: '10px', borderBottom: '1px solid #1f2937', paddingBottom: '10px'}}>Active Execution Queue</h3>
              {monthlyEntries.length === 0 ? (
                <div style={{...styles.card, textAlign: 'center', padding: '60px', borderStyle: 'dashed'}}>
                    <p style={{color: '#4b5563', fontSize: '18px'}}>Queue is currently empty. Define new strategic goals.</p>
                </div>
              ) : (
                monthlyEntries.map(entry => (
                    <div key={entry.id} style={styles.plannerItem}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
                        <div style={{width: '50px', height: '50px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '24px'}}>
                            {entry.type === 'To Give' ? '💸' : '💰'}
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '20px' }}>{entry.person}</h3>
                            <div style={{display: 'flex', gap: '10px', marginTop: '5px'}}>
                                <span style={styles.statusBadge(entry.type)}>{entry.type}</span>
                                <small style={{color: '#4b5563'}}>{entry.timestamp}</small>
                            </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '30px' }}>
                        <div>
                            <h2 style={{ margin: 0, color: 'white' }}>₹{Number(entry.amount).toLocaleString()}</h2>
                            <small style={{color: '#94a3b8'}}>SCHEDULED AMOUNT</small>
                        </div>
                        <button 
                            onClick={() => deleteMonthlyEntry(entry.id)} 
                            style={{ background: 'rgba(239, 68, 68, 0.05)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            RESOLVE
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </section>
        )}

        {/* --- VIEW: ADD TRANSACTION PORTAL --- */}
        {view === 'add' && (
          <div style={{ ...styles.card, maxWidth: '600px', margin: '40px auto', animation: 'slideUp 0.3s ease' }}>
            <h2 style={{fontSize: '28px', marginBottom: '10px'}}>Log New Transaction</h2>
            <p style={{color: '#94a3b8', marginBottom: '30px'}}>Commit a new record to the cloud database.</p>
            
            <label style={{fontSize: '12px', color: '#94a3b8'}}>DESCRIPTION / VENDOR</label>
            <input style={styles.input} placeholder="Enter description..." value={newEntry.title} onChange={e => setNewEntry({ ...newEntry, title: e.target.value })} />
            
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                <div>
                    <label style={{fontSize: '12px', color: '#94a3b8'}}>MONETARY VALUE</label>
                    <input style={styles.input} type="number" placeholder="0.00" value={newEntry.amount} onChange={e => setNewEntry({ ...newEntry, amount: e.target.value })} />
                </div>
                <div>
                    <label style={{fontSize: '12px', color: '#94a3b8'}}>NATURE OF ENTRY</label>
                    <select style={styles.input} value={newEntry.type} onChange={e => setNewEntry({ ...newEntry, type: e.target.value })}>
                      <option value="Expense">DEBIT (EXPENSE)</option>
                      <option value="Income">CREDIT (INCOME)</option>
                    </select>
                </div>
            </div>
            
            <label style={{fontSize: '12px', color: '#94a3b8'}}>CLASSIFICATION</label>
            <select style={styles.input} value={newEntry.category} onChange={e => setNewEntry({ ...newEntry, category: e.target.value })}>
                <option value="General">General</option>
                <option value="Food">Food & Dining</option>
                <option value="Transport">Transport</option>
                <option value="Shopping">Shopping</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Medical">Medical</option>
            </select>
            
            <div style={{marginTop: '20px', display: 'flex', gap: '15px'}}>
                <button style={{ ...styles.btnPrimary, flex: 2 }} onClick={handleSaveTransaction}>CONFIRM & BROADCAST</button>
                <button style={{ ...styles.btnPrimary, flex: 1, background: 'transparent', border: '1px solid #334155' }} onClick={() => setView('dashboard')}>CANCEL</button>
            </div>
          </div>
        )}
      </main>

      {/* --- INJECTED GLOBAL ANIMATIONS --- */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #030712; }
        ::-webkit-scrollbar-thumb { background: #1f2937; borderRadius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #374151; }
      `}</style>
    </div>
  );
};

export default App;