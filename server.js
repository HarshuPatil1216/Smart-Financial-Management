const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'postgres', // तुझा DB युजरनेम
  host: 'localhost',
  database: 'your_db_name', // तुझ्या डेटाबेसचे नाव
  password: 'your_password', // तुझा पासवर्ड
  port: 5432,
});

// १. डॅशबोर्ड डेटा (Balance & Limits)
app.get('/api/dashboard/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(`
      SELECT u.safety_limit, u.monthly_goal,
      COALESCE(SUM(CASE WHEN t.type = 'Income' THEN t.amount ELSE 0 END), 0) as total_income,
      COALESCE(SUM(CASE WHEN t.type = 'Expense' THEN t.amount ELSE 0 END), 0) as total_expense
      FROM users u
      LEFT JOIN transactions t ON u.user_id = t.user_id
      WHERE u.user_id = $1 GROUP BY u.user_id`, [userId]);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).send(err.message); }
});

// २. सर्व व्यवहार मिळवा
app.get('/api/transactions/:userId', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC', [req.params.userId]);
    res.json(result.rows);
  } catch (err) { res.status(500).send(err.message); }
});

// ३. नवीन व्यवहार स्टोअर करा
app.post('/api/transactions', async (req, res) => {
  try {
    const { description, amount, type, user_id } = req.body;
    const result = await pool.query(
      'INSERT INTO transactions (description, amount, type, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [description, amount, type, user_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.listen(5000, () => console.log("Backend running on port 5000 ✅"));