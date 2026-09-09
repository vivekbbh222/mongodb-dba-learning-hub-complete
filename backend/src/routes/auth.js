const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const { getDatabase } = require('../config/db');

const router = express.Router();

const SESSION_MINUTES = 15;


// ============================================================
// LOGIN
// ============================================================

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: 'Username and password are required'
      });
    }

    const db = getDatabase();

    const usersCollection = db.collection('users');
    const sessionsCollection = db.collection('loginSessions');

    const user = await usersCollection.findOne({
      username: username.trim().toLowerCase()
    });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid username or password'
      });
    }

    if (user.active !== true) {
      return res.status(403).json({
        message: 'User account is inactive'
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: 'Invalid username or password'
      });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');

    const tokenHash = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    const createdAt = new Date();

    const expiresAt = new Date(
      createdAt.getTime() +
      SESSION_MINUTES * 60 * 1000
    );

    await sessionsCollection.insertOne({
      tokenHash,
      username: user.username,
      role: user.role,
      createdAt,
      expiresAt
    });

    return res.json({
      message: 'Login successful',
      token: rawToken,
      username: user.username,
      role: user.role,
      expiresAt
    });

  } catch (error) {
    console.error('Login error:', error);

    return res.status(500).json({
      message: 'Internal server error'
    });
  }
});


// ============================================================
// SESSION CHECK
// ============================================================

router.get('/session', async (req, res) => {
  try {
    const authorization =
      req.headers.authorization || '';

    if (!authorization.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Missing session token'
      });
    }

    const rawToken =
      authorization.substring(7).trim();

    const tokenHash = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    const db = getDatabase();

    const session =
      await db.collection('loginSessions')
        .findOne({ tokenHash });

    if (!session) {
      return res.status(401).json({
        message: 'Invalid session'
      });
    }

    if (session.expiresAt <= new Date()) {
      await db.collection('loginSessions')
        .deleteOne({ _id: session._id });

      return res.status(401).json({
        message: 'Session expired'
      });
    }

    return res.json({
      authenticated: true,
      username: session.username,
      role: session.role,
      expiresAt: session.expiresAt
    });

  } catch (error) {
    console.error('Session check error:', error);

    return res.status(500).json({
      message: 'Internal server error'
    });
  }
});


// ============================================================
// LOGOUT
// ============================================================

router.post('/logout', async (req, res) => {
  try {
    const authorization =
      req.headers.authorization || '';

    if (!authorization.startsWith('Bearer ')) {
      return res.json({
        message: 'Logged out'
      });
    }

    const rawToken =
      authorization.substring(7).trim();

    const tokenHash = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    const db = getDatabase();

    await db.collection('loginSessions')
      .deleteOne({ tokenHash });

    return res.json({
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);

    return res.status(500).json({
      message: 'Internal server error'
    });
  }
});


module.exports = router;
