const crypto = require('crypto');

const { getDatabase } = require('../config/db');

function hashToken(token) {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
}


// ============================================================
// REQUIRE AUTHENTICATION
// ============================================================

async function requireAuth(req, res, next) {
  try {
    const authorization = req.headers.authorization || '';

    if (!authorization.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Authentication required'
      });
    }

    const rawToken = authorization.substring(7).trim();

    if (!rawToken) {
      return res.status(401).json({
        message: 'Authentication required'
      });
    }

    const tokenHash = hashToken(rawToken);

    const db = getDatabase();

    const session = await db.collection('loginSessions').findOne({
      tokenHash,
      expiresAt: { $gt: new Date() }
    });

    if (!session) {
      return res.status(401).json({
        message: 'Invalid or expired session'
      });
    }

    /*
      Do NOT trust only the role/username stored in the session.

      We check the users collection on every authenticated request.
      This means disabling a user takes effect immediately even if
      they still have an unexpired session.
    */

    const user = await db.collection('users').findOne({
      username: session.username,
      active: true
    });

    if (!user) {
      await db.collection('loginSessions').deleteOne({
        _id: session._id
      });

      return res.status(401).json({
        message: 'User account is inactive or unavailable'
      });
    }

    req.user = {
      id: user._id,
      username: user.username,
      role: user.role
    };

    req.session = {
      id: session._id,
      expiresAt: session.expiresAt
    };

    next();

  } catch (error) {
    console.error('Authentication middleware error:', error);

    return res.status(500).json({
      message: 'Internal server error'
    });
  }
}


// ============================================================
// REQUIRE ADMIN ROLE
// ============================================================

function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      message: 'Administrator access required'
    });
  }

  next();
}


module.exports = {
  requireAuth,
  requireAdmin
};
