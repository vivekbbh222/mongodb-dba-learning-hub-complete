const express = require('express');
const { ObjectId } = require('mongodb');
const { getClient } = require('../config/db');

const router = express.Router();

const DATABASE_NAME = 'webapp';
const COLLECTION_NAME = 'records';

/*
 * POST /api/records
 * Creates a new record.
 */
router.post('/', async (req, res) => {
  try {
    const { name, message } = req.body;

    if (!name || !message) {
      return res.status(400).json({
        error: 'name and message are required'
      });
    }

    const db = getClient().db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);

    const record = {
      name,
      message,
      createdAt: new Date()
    };

    const result = await collection.insertOne(record);

    return res.status(201).json({
      message: 'Record created successfully',
      record: {
        _id: result.insertedId,
        ...record
      }
    });
  } catch (error) {
    console.error('Failed to create record:', error);

    return res.status(500).json({
      error: 'Failed to create record'
    });
  }
});

/*
 * GET /api/records
 * Returns all records.
 */
router.get('/', async (req, res) => {
  try {
    const db = getClient().db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);

    const records = await collection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json(records);
  } catch (error) {
    console.error('Failed to fetch records:', error);

    return res.status(500).json({
      error: 'Failed to fetch records'
    });
  }
});

/*
 * GET /api/records/:id
 * Returns one record by MongoDB ObjectId.
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Invalid record ID'
      });
    }

    const db = getClient().db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);

    const record = await collection.findOne({
      _id: new ObjectId(id)
    });

    if (!record) {
      return res.status(404).json({
        error: 'Record not found'
      });
    }

    return res.status(200).json(record);
  } catch (error) {
    console.error('Failed to fetch record:', error);

    return res.status(500).json({
      error: 'Failed to fetch record'
    });
  }
});

/*
 * PUT /api/records/:id
 * Updates name and/or message.
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, message } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Invalid record ID'
      });
    }

    if (!name && !message) {
      return res.status(400).json({
        error: 'At least name or message is required'
      });
    }

    const updateFields = {
      updatedAt: new Date()
    };

    if (name) {
      updateFields.name = name;
    }

    if (message) {
      updateFields.message = message;
    }

    const db = getClient().db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateFields },
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(404).json({
        error: 'Record not found'
      });
    }

    return res.status(200).json({
      message: 'Record updated successfully',
      record: result
    });
  } catch (error) {
    console.error('Failed to update record:', error);

    return res.status(500).json({
      error: 'Failed to update record'
    });
  }
});

/*
 * DELETE /api/records/:id
 * Deletes one record.
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Invalid record ID'
      });
    }

    const db = getClient().db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);

    const result = await collection.deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        error: 'Record not found'
      });
    }

    return res.status(200).json({
      message: 'Record deleted successfully'
    });
  } catch (error) {
    console.error('Failed to delete record:', error);

    return res.status(500).json({
      error: 'Failed to delete record'
    });
  }
});

module.exports = router;
