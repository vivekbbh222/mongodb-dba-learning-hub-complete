const express = require('express');
const { getClient } = require('../config/db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const client = getClient();

    const hello = await client.db('admin').command({ hello: 1 });
    await client.db('admin').command({ ping: 1 });

    res.status(200).json({
      status: 'ok',
      mongodb: 'connected',
      replicaSet: hello.setName,
      primary: hello.primary
    });
  } catch (error) {
    console.error('Health check failed:', error);

    res.status(503).json({
      status: 'error',
      mongodb: 'disconnected'
    });
  }
});

module.exports = router;
