const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../supabase');

router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });

  const hash = await bcrypt.hash(password, 10);
  const { data, error } = await supabase
    .from('users')
    .insert([{ email, password_hash: hash }])
    .select('id, email')
    .single();

  if (error) return res.status(400).json({ error: error.message });

  const token = jwt.sign({ id: data.id, email: data.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: data.id, email: data.email } });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });

  const { data, error } = await supabase
    .from('users')
    .select('id, email, password_hash')
    .eq('email', email)
    .single();

  if (error || !data) return res.status(401).json({ error: 'Invalid credentials.' });

  const valid = await bcrypt.compare(password, data.password_hash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials.' });

  const token = jwt.sign({ id: data.id, email: data.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: data.id, email: data.email } });
});

module.exports = router;
