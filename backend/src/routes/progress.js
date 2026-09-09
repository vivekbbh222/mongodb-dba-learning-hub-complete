const express = require('express');
const { ObjectId } = require('mongodb');

const { getDatabase } = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

/* =========================================================
   GET ALL PROGRESS FOR CURRENT USER
========================================================= */

router.get(
  '/',
  requireAuth,
  async (req, res) => {
    try {
      const db = getDatabase();

      const progress = await db
        .collection('userProgress')
        .find({
          username: req.user.username,
          completed: true
        })
        .sort({
          updatedAt: -1
        })
        .toArray();

      return res.status(200).json({
        count: progress.length,
        progress
      });

    } catch (error) {
      console.error(
        'Get progress error:',
        error
      );

      return res.status(500).json({
        message:
          'Unable to fetch user progress'
      });
    }
  }
);


/* =========================================================
   GET PROGRESS SUMMARY
========================================================= */

router.get(
  '/summary',
  requireAuth,
  async (req, res) => {
    try {
      const db = getDatabase();

      const totalQuestions =
        await db
          .collection('questions')
          .countDocuments({
            active: {
              $ne: false
            }
          });

      const completedQuestions =
        await db
          .collection('userProgress')
          .countDocuments({
            username:
              req.user.username,
            completed: true
          });

      const remainingQuestions =
        Math.max(
          totalQuestions -
            completedQuestions,
          0
        );

      const percentage =
        totalQuestions > 0
          ? Number(
              (
                (
                  completedQuestions /
                  totalQuestions
                ) *
                100
              ).toFixed(2)
            )
          : 0;

      const topicProgress =
        await db
          .collection('userProgress')
          .aggregate([
            {
              $match: {
                username:
                  req.user.username,
                completed: true
              }
            },

            {
              $group: {
                _id: '$topicId',
                completed: {
                  $sum: 1
                }
              }
            },

            {
              $sort: {
                _id: 1
              }
            }
          ])
          .toArray();

      return res.status(200).json({
        username:
          req.user.username,

        totalQuestions,

        completedQuestions,

        remainingQuestions,

        percentage,

        topicProgress:
          topicProgress.map(
            item => ({
              topicId: item._id,
              completed:
                item.completed
            })
          )
      });

    } catch (error) {
      console.error(
        'Progress summary error:',
        error
      );

      return res.status(500).json({
        message:
          'Unable to fetch progress summary'
      });
    }
  }
);


/* =========================================================
   MARK QUESTION COMPLETED
========================================================= */

router.put(
  '/:questionId',
  requireAuth,
  async (req, res) => {
    try {
      const {
        questionId
      } = req.params;

      if (
        !ObjectId.isValid(
          questionId
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              'Invalid question ID'
          });
      }

      const db =
        getDatabase();

      const question =
        await db
          .collection(
            'questions'
          )
          .findOne({
            _id:
              new ObjectId(
                questionId
              )
          });

      if (!question) {
        return res
          .status(404)
          .json({
            message:
              'Question not found'
          });
      }

      const now =
        new Date();

      await db
        .collection(
          'userProgress'
        )
        .updateOne(
          {
            username:
              req.user.username,

            questionId:
              question._id
          },
          {
            $set: {
              topicId:
                question.topicId,

              completed:
                true,

              completedAt:
                now,

              updatedAt:
                now
            },

            $setOnInsert: {
              createdAt:
                now
            }
          },
          {
            upsert: true
          }
        );

      const progress =
        await db
          .collection(
            'userProgress'
          )
          .findOne({
            username:
              req.user.username,

            questionId:
              question._id
          });

      return res
        .status(200)
        .json({
          message:
            'Question marked as completed',

          progress
        });

    } catch (error) {
      console.error(
        'Mark progress error:',
        error
      );

      return res
        .status(500)
        .json({
          message:
            'Unable to update progress'
        });
    }
  }
);


/* =========================================================
   REMOVE COMPLETED STATUS
========================================================= */

router.delete(
  '/:questionId',
  requireAuth,
  async (req, res) => {
    try {
      const {
        questionId
      } = req.params;

      if (
        !ObjectId.isValid(
          questionId
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              'Invalid question ID'
          });
      }

      const db =
        getDatabase();

      const result =
        await db
          .collection(
            'userProgress'
          )
          .deleteOne({
            username:
              req.user.username,

            questionId:
              new ObjectId(
                questionId
              )
          });

      return res
        .status(200)
        .json({
          message:
            'Question completion removed',

          deleted:
            result.deletedCount === 1
        });

    } catch (error) {
      console.error(
        'Remove progress error:',
        error
      );

      return res
        .status(500)
        .json({
          message:
            'Unable to remove progress'
        });
    }
  }
);


module.exports = router;
