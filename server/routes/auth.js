const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const sign = u => jwt.sign({ id: u._id, role: u.role, name: u.name }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ msg: 'Name, email and password are required' });
    if (password.length < 6) return res.status(400).json({ msg: 'Password must be at least 6 characters' });
    if (await User.findOne({ email: email.toLowerCase() })) return res.status(400).json({ msg: 'Email already registered' });
    const user = await User.create({
      name, email, password: await bcrypt.hash(password, 10),
      role: role === 'creator' ? 'creator' : 'viewer'
    });
    res.json({ token: sign(user), user: { name: user.name, role: user.role } });
  } catch (e) { res.status(500).json({ msg: e.message }); }
});

router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: (req.body.email || '').toLowerCase() });
    if (!user || !(await bcrypt.compare(req.body.password || '', user.password)))
      return res.status(400).json({ msg: 'Invalid email or password' });
    res.json({ token: sign(user), user: { name: user.name, role: user.role } });
  } catch (e) { res.status(500).json({ msg: e.message }); }
});

module.exports = router;
