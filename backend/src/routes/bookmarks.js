const express = require('express');
const { ObjectId } = require('mongodb');

const { getDatabase } = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();


/* =========================================================
   GET ALL BOOKMARKS FOR LOGGED-IN USER
========================================================= */

router.get(
  '/',
  requireAuth,
  async (req, res) => {
    try {
      const db = getDatabase();

      const bookmarks = await db
        .collection('bookmarks')
        .find({
          username: req.user.username
        })
        .sort({
          createdAt: -1
        })
        .toArray();

      return res.status(200).json({
        count: bookmarks.length,
        bookmarks
      });

    } catch (error) {
      console.error(
        'Get bookmarks error:',
        error
      );

      return res.status(500).json({
        message: 'Unable to fetch bookmarks'
      });
    }
  }
);


/* =========================================================
   ADD BOOKMARK
========================================================= */

router.post(
  '/:questionId',
  requireAuth,
  async (req, res) => {
    try {
      const { questionId } = req.params;

      if (!ObjectId.isValid(questionId)) {
        return res.status(400).json({
          message: 'Invalid question ID'
        });
      }

      const db = getDatabase();

      const question = await db
        .collection('questions')
        .findOne({
          _id: new ObjectId(questionId),
          active: { $ne: false }
        });

      if (!question) {
        return res.status(404).json({
          message: 'Question not found'
        });
      }

      const now = new Date();

      await db
        .collection('bookmarks')
        .updateOne(
          {
            username: req.user.username,
            questionId: question._id
          },
          {
            $setOnInsert: {
              username: req.user.username,
              questionId: question._id,
              topicId: question.topicId,
              createdAt: now
            }
          },
          {
            upsert: true
          }
        );

      const bookmark = await db
        .collection('bookmarks')
        .findOne({
          username: req.user.username,
          questionId: question._id
        });

      return res.status(200).json({
        message: 'Question bookmarked',
        bookmark
      });

    } catch (error) {
      console.error(
        'Add bookmark error:',
        error
      );

      return res.status(500).json({
        message: 'Unable to bookmark question'
      });
    }
  }
);


/* =========================================================
   REMOVE BOOKMARK
========================================================= */

router.delete(
  '/:questionId',
  requireAuth,
  async (req, res) => {
    try {
      const { questionId } = req.params;

      if (!ObjectId.isValid(questionId)) {
        return res.status(400).json({
          message: 'Invalid question ID'
        });
      }

      const db = getDatabase();

      const result = await db
        .collection('bookmarks')
        .deleteOne({
          username: req.user.username,
          questionId:
            new ObjectId(questionId)
        });

      return res.status(200).json({
        message: 'Bookmark removed',
        deleted:
          result.deletedCount === 1
      });

    } catch (error) {
      console.error(
        'Remove bookmark error:',
        error
      );

      return res.status(500).json({
        message: 'Unable to remove bookmark'
      });
    }
  }
);


module.exports = router;
