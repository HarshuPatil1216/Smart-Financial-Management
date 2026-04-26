import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

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
  // --- States for Monthly Planner (Expemonth) ---
  const [monthlyEntries, setMonthlyEntries] = useState([]);
  const [newMonthly, setNewMonthly] = useState({ person: '', amount: '', type: 'To Give', remarks: '' });
  const [plannerMessage, setPlannerMessage] = useState("");

  // --- Main App States ---
  const [view, setView] = useState('explore'); 
  const [user, setUser] = useState(null); 
  const [transactions, setTransactions] = useState([]);
  const [newEntry, setNewEntry] = useState({ title: '', amount: '', type: 'Expense', category: 'General' });
  const [tempLimit, setTempLimit] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const API_BASE_URL = "https://smart-finance-backend-knxx.onrender.com";
  const heroBackground = "https://images.unsplash.com/photo-1593640495253-23196b27a87f?auto=format&fit=crop&w=1471&q=80";

  // --- Data Loading & Saving ---
  useEffect(() => {
    console.log("App is starting... loading local data");
    const dataFromStorage = localStorage.getItem('expemonth');
    if (dataFromStorage) {
      setMonthlyEntries(JSON.parse(dataFromStorage));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('expemonth', JSON.stringify(monthlyEntries));
  }, [monthlyEntries]);

  const loadAllTransactions = async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/history/${id}`);
      setTransactions(response.data || []);
    } catch (error) { 
      console.log("Server error while fetching history."); 
    }
  };

  // --- User Login & Registration ---
 const loginUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const credentials = {
      username: e.target.username.value,
      password: e.target.password.value
    };

    try {
      // १. बॅकएंड कॉल
      const res = await axios.post(`${API_BASE_URL}/api/users/login`, credentials);
      
      // २. जर लॉगिन सक्सेस झाले तरच डेटा लोड करा
      if (res.data && res.data.userId) {
        setUser(res.data);
        await loadAllTransactions(res.data.userId);
        setView('dashboard');
      } else {
        alert("User data not found!");
        setIsSubmitting(false);
      }
    } catch (err) { 
      console.error("Login Error:", err);
      alert("Server is not responding. Please check your internet or try again later."); 
      setIsSubmitting(false); // इथे फॉल्स होणे खूप गरजेचे आहे
    }
  };

  const registerUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const userData = {
      username: e.target.username.value,
      password: e.target.password.value,
      email: e.target.email.value
    };
    try {
      await axios.post(`${API_BASE_URL}/api/users/register`, userData);
      alert("Account created successfully! Now you can login.");
      setView('login');
    } catch (err) { 
      alert("Registration failed. Email or Username might be already taken."); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  // --- Budget and Transactions ---
  const updateMonthlyBudget = async () => {
    if (!user) return;
    if (!tempLimit) return alert("Please enter a budget amount first.");
    setIsSubmitting(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/users/update-budget`, {
        user_id: user.userId,
        budget_limit: parseFloat(tempLimit)
      });
      setUser(res.data);
      alert("Monthly Budget Limit updated successfully.");
      setTempLimit("");
    } catch (err) { 
      alert("Could not update budget."); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const saveNewTransaction = async () => {
    if (!newEntry.title || !newEntry.amount) return alert("All fields are mandatory.");
    if (!user) return setView('login');

    const totalCurrentBalance = totalIncome - totalExpense;
    if (newEntry.type === 'Expense' && parseFloat(newEntry.amount) > totalCurrentBalance) {
      alert("Not enough balance! You only have ₹" + totalCurrentBalance + " left.");
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
      await loadAllTransactions(user.userId);
      setView('dashboard');
      setNewEntry({ title: '', amount: '', type: 'Expense', category: 'General' });
    } catch (err) { 
      alert("Error while saving entry."); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  // --- Monthly Planner Logic ---
  const savePlanEntry = () => {
    if (!newMonthly.person || !newMonthly.amount) {
      setPlannerMessage("Error: Fill person name and amount.");
      return;
    }
    const newPlan = { ...newMonthly, id: Date.now(), date: new Date().toLocaleDateString() };
    setMonthlyEntries([newPlan, ...monthlyEntries]);
    setNewMonthly({ person: '', amount: '', type: 'To Give', remarks: '' });
    setPlannerMessage("Plan added to your list!");
    setTimeout(() => setPlannerMessage(""), 3000);
  };

  const removePlanEntry = (id) => {
    if (window.confirm("Are you sure you want to delete this plan?")) {
      setMonthlyEntries(monthlyEntries.filter(item => item.id !== id));
    }
  };

  const deleteRecord = async (id) => {
    if (window.confirm("Remove this transaction permanently?")) {
      try {
        await axios.delete(`${API_BASE_URL}/api/transactions/${id}`); 
        await loadAllTransactions(user.userId);
      } catch (err) { 
        alert("Delete failed."); 
      }
    }
  };

  // --- Calculations ---
  const totalIncome = transactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + Number(t.amount), 0);
  const netBalance = totalIncome - totalExpense;
  const daysPassed = new Date().getDate();
  const nextMonthPrediction = (totalExpense / daysPassed) * 30;
  
  const myLimit = user?.budget_limit || 0;
  const budgetUsage = myLimit > 0 ? Math.min((totalExpense / myLimit) * 100, 100) : 0;

  const searchedItems = transactions.filter(t => 
    t.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Styling Section ---
  const styles = {
    mainWrapper: { backgroundColor: '#020617', minHeight: '100vh', color: '#e2e8f0', fontFamily: 'system-ui, -apple-system, sans-serif' },
    navBar: { 
        display: 'flex', justifyContent: 'space-between', padding: '15px 40px', 
        background: '#0f172a', borderBottom: '1px solid #1e293b', alignItems: 'center', 
        position: 'fixed', width: '100%', top: 0, zIndex: 1000, boxSizing: 'border-box' 
    },
    landingPage: { 
        minHeight: '100vh', display: 'flex', flexDirection: 'column', 
        justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 20px',
        backgroundImage: `linear-gradient(rgba(2,6,23,0.8), rgba(2,6,23,0.95)), url(${heroBackground})`,
        backgroundSize: 'cover', backgroundPosition: 'center'
    },
    sidePanel: { 
        width: isSidebarOpen ? '260px' : '80px', background: '#0f172a', padding: '25px 15px', 
        borderRight: '1px solid #1e293b', position: 'sticky', top: 0, height: '100vh', 
        display: 'flex', flexDirection: 'column', transition: 'width 0.3s ease' 
    },
    menuButton: (active) => ({
      width: '100%', padding: '15px', marginBottom: '10px', borderRadius: '12px',
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

  const TopNav = () => (
    <nav style={styles.navBar}>
      <h2 style={{ color: '#6366f1', margin: 0, cursor: 'pointer' }} onClick={() => setView('explore')}>FinTrace</h2>
      <div style={{ display: 'flex', gap: '25px', fontSize: '15px', fontWeight: '600' }}>
        <span style={{cursor: 'pointer'}} onClick={() => setView('explore')}>Home</span>
        <span style={{cursor: 'pointer'}} onClick={() => setView('login')}>Login</span>
      </div>
      <button style={styles.primaryBtn} onClick={() => setView('register')}>Create Account</button>
    </nav>
  );

  if (view === 'explore') {
    return (
      <div style={styles.mainWrapper}>
        <DemoModal show={showDemoModal} onClose={() => setShowDemoModal(false)} />
        <TopNav />
        <header style={styles.landingPage}>
          <h1 style={{ fontSize: '65px', fontWeight: '800', marginBottom: '15px', letterSpacing: '-1px' }}>
            Manage Your <span style={{color: '#6366f1'}}>Hard-Earned Money.</span>
          </h1>
          <p style={{ fontSize: '20px', color: '#94a3b8', maxWidth: '700px', marginBottom: '40px', lineHeight: '1.6' }}>
            Easy tracking for your daily expenses, income, and future planning. 
            No more manual calculations.
          </p>
          <div style={{ display: 'flex', gap: '20px' }}>
            <button style={{ ...styles.primaryBtn, padding: '15px 40px' }} onClick={() => setView('register')}>Start Saving Now</button>
            <button style={{ ...styles.primaryBtn, background: 'transparent', border: '2px solid #6366f1' }} onClick={() => setShowDemoModal(true)}>See Video Demo</button>
          </div>
        </header>
      </div>
    );
  }

  if (view === 'login' || view === 'register') {
    return (
      <div style={{ ...styles.mainWrapper, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: '400px', padding: '40px', background: '#0f172a', borderRadius: '20px', border: '1px solid #1e293b' }}>
          <h2 style={{color: '#6366f1', textAlign: 'center', marginBottom: '30px', fontSize: '28px'}}>{view === 'login' ? 'Login to Portal' : 'Register Yourself'}</h2>
          <form onSubmit={view === 'login' ? loginUser : registerUser}>
            {view === 'register' && <input name="email" type="email" style={styles.inputBox} placeholder="Your Email Address" required />}
            <input name="username" style={styles.inputBox} placeholder="Choose Username" required />
            <input name="password" type="password" style={styles.inputBox} placeholder="Secret Password" required />
            <button type="submit" style={{ ...styles.primaryBtn, width: '100%', marginTop: '10px' }}>{isSubmitting ? "Please wait..." : "Continue"}</button>
          </form>
          <p onClick={() => setView(view === 'login' ? 'register' : 'login')} style={{ textAlign: 'center', cursor: 'pointer', marginTop: '20px', color: '#94a3b8' }}>
            {view === 'login' ? "New user? Create account" : "Already have an account? Login"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...styles.mainWrapper, display: 'flex' }}>
      {/* --- Dashboard Sidebar --- */}
      <aside style={styles.sidePanel}>
        <h2 style={{ color: '#6366f1', marginBottom: '40px', paddingLeft: '10px' }}>{isSidebarOpen ? "FINTRACE" : "FT"}</h2>
        <nav style={{ flex: 1 }}>
          <button style={styles.menuButton(view === 'dashboard')} onClick={() => setView('dashboard')}>
            <span>📊</span> {isSidebarOpen && "My Dashboard"}
          </button>
          <button style={styles.menuButton(view === 'planner')} onClick={() => setView('planner')}>
            <span>🗓️</span> {isSidebarOpen && "Monthly Planner"}
          </button>
          <button style={styles.menuButton(view === 'add')} onClick={() => setView('add')}>
            <span>➕</span> {isSidebarOpen && "Add Transaction"}
          </button>
        </nav>
        <button style={{ ...styles.primaryBtn, backgroundColor: '#ef4444' }} onClick={() => { setUser(null); setView('explore'); }}>
          {isSidebarOpen ? "Logout Session" : "🚪"}
        </button>
      </aside>

      {/* --- Main Dashboard Area --- */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        
        {view === 'dashboard' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', alignItems: 'center' }}>
              <h1>Welcome Back, {user?.username}!</h1>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, color: '#94a3b8' }}>TOTAL CASH IN HAND</p>
                <h1 style={{ margin: 0, color: netBalance >= 0 ? '#10b981' : '#ef4444' }}>₹{netBalance.toLocaleString()}</h1>
              </div>
            </div>

            <div style={{ ...styles.commonCard, marginBottom: '35px', border: budgetUsage > 80 ? '2px solid #ef4444' : '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <h3 style={{margin: 0}}>Monthly Expense Limit Tracker</h3>
                <span style={{ color: budgetUsage > 80 ? '#ef4444' : '#6366f1', fontWeight: 'bold' }}>{budgetUsage.toFixed(1)}% Usage</span>
              </div>
              <div style={{ width: '100%', height: '12px', background: '#020617', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ width: `${budgetUsage}%`, height: '100%', background: budgetUsage > 80 ? '#ef4444' : '#6366f1', transition: 'width 0.8s ease' }}></div>
              </div>
              <div style={{ marginTop: '20px', display: 'flex', gap: '15px' }}>
                <input type="number" placeholder="Enter New Limit" style={{ ...styles.inputBox, marginBottom: 0, flex: 1 }} value={tempLimit} onChange={(e) => setTempLimit(e.target.value)} />
                <button style={styles.primaryBtn} onClick={updateMonthlyBudget}>Set Budget</button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '25px', marginBottom: '40px' }}>
              <div style={styles.commonCard}><span>Income</span><h2 style={{color: '#10b981'}}>₹{totalIncome.toLocaleString()}</h2></div>
              <div style={styles.commonCard}><span>Expenses</span><h2 style={{color: '#ef4444'}}>₹{totalExpense.toLocaleString()}</h2></div>
              <div style={{...styles.commonCard, border: '1px solid #6366f1'}}><span>AI Forecast</span><h2>₹{nextMonthPrediction.toFixed(0)}</h2></div>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '30px'}}>
                <div style={styles.commonCard}>
                    <h3>Recent History</h3>
                    <input placeholder="Search items..." style={styles.inputBox} onChange={e => setSearchTerm(e.target.value)} />
                    <div style={{maxHeight: '400px', overflowY: 'auto'}}>
                        {searchedItems.map(item => (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #334155' }}>
                                <div><b>{item.description}</b><br/><small style={{color: '#94a3b8'}}>{item.category}</small></div>
                                <div style={{textAlign: 'right'}}>
                                    <span style={{ color: item.type === 'Income' ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>₹{item.amount}</span><br/>
                                    <button onClick={() => deleteRecord(item.id)} style={{background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px'}}>Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div style={styles.commonCard}>
                    <h3>Where Money is Going?</h3>
                    <div style={{ height: '280px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={[{name: 'Income', value: totalIncome || 1}, {name: 'Expense', value: totalExpense || 0}]} dataKey="value" innerRadius={70} outerRadius={100} paddingAngle={5}>
                                    <Cell fill="#10b981" /><Cell fill="#ef4444" />
                                </Pie><Tooltip contentStyle={{background: '#1e293b', border: 'none', borderRadius: '10px'}} /></PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
          </div>
        )}

        {/* --- Monthly Planner Page --- */}
        {view === 'planner' && (
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '10px' }}>🗓️ Monthly Planner</h1>
            <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Keep a list of people you need to give or receive money from this month.</p>
            
            <div style={{ ...styles.commonCard, display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '15px', marginBottom: '40px' }}>
              <input style={{ ...styles.inputBox, marginBottom: 0 }} placeholder="Person/Entity Name" value={newMonthly.person} onChange={(e) => setNewMonthly({ ...newMonthly, person: e.target.value })} />
              <input style={{ ...styles.inputBox, marginBottom: 0 }} type="number" placeholder="Amount (₹)" value={newMonthly.amount} onChange={(e) => setNewMonthly({ ...newMonthly, amount: e.target.value })} />
              <select style={{ ...styles.inputBox, marginBottom: 0 }} value={newMonthly.type} onChange={(e) => setNewMonthly({ ...newMonthly, type: e.target.value })}>
                <option value="To Give">I have to Give</option>
                <option value="To Receive">I will Receive</option>
              </select>
              <button style={{ ...styles.primaryBtn, gridColumn: 'span 3' }} onClick={savePlanEntry}>Save to Monthly List</button>
            </div>

            {plannerMessage && <div style={{padding: '10px', background: '#10b981', borderRadius: '10px', marginBottom: '20px', textAlign: 'center'}}>{plannerMessage}</div>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {monthlyEntries.length === 0 && <p style={{textAlign: 'center', color: '#64748b', padding: '40px'}}>No plans created for this month.</p>}
              {monthlyEntries.map(plan => (
                <div key={plan.id} style={{ ...styles.commonCard, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: 0 }}>{plan.person}</h3>
                    <span style={{ color: plan.type === 'To Give' ? '#ef4444' : '#10b981', fontSize: '13px', fontWeight: 'bold' }}>{plan.type.toUpperCase()}</span>
                    <br/><small style={{color: '#64748b'}}>Added on: {plan.date}</small>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <h2 style={{ margin: 0 }}>₹{plan.amount}</h2>
                    <button onClick={() => removePlanEntry(plan.id)} style={{ padding: '8px 15px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '8px', cursor: 'pointer' }}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- Add Transaction Page --- */}
        {view === 'add' && (
          <div style={{ ...styles.commonCard, maxWidth: '500px', margin: '40px auto' }}>
            <h2 style={{marginBottom: '20px'}}>Add New Money Record</h2>
            <label style={{fontSize: '13px', color: '#94a3b8'}}>Description</label>
            <input style={styles.inputBox} placeholder="e.g. Lunch at Office, Grocery Store" value={newEntry.title} onChange={e => setNewEntry({ ...newEntry, title: e.target.value })} />
            
            <label style={{fontSize: '13px', color: '#94a3b8'}}>Amount (in Rupees)</label>
            <input style={styles.inputBox} type="number" placeholder="0" value={newEntry.amount} onChange={e => setNewEntry({ ...newEntry, amount: e.target.value })} />
            
            <label style={{fontSize: '13px', color: '#94a3b8'}}>Type of Record</label>
            <select style={styles.inputBox} value={newEntry.type} onChange={e => setNewEntry({ ...newEntry, type: e.target.value })}>
              <option value="Expense">Expense (Money Out)</option>
              <option value="Income">Income (Money In)</option>
            </select>

            <label style={{fontSize: '13px', color: '#94a3b8'}}>Category</label>
            <select style={styles.inputBox} value={newEntry.category} onChange={e => setNewEntry({ ...newEntry, category: e.target.value })}>
                <option value="General">General</option>
                <option value="Food">Food & Drinks</option>
                <option value="Travel">Auto / Petrol / Bus</option>
                <option value="Shopping">Shopping / Clothing</option>
                <option value="Bills">Mobile / Electricity / Rent</option>
            </select>
            
            <button style={{ ...styles.primaryBtn, width: '100%', marginTop: '10px' }} onClick={saveNewTransaction}>Confirm & Save Record</button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;