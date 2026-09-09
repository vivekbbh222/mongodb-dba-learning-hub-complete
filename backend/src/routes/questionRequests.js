const express = require('express');
const { ObjectId } = require('mongodb');

const { getDatabase } = require('../config/db');

const {
  requireAuth,
  requireAdmin
} = require('../middleware/auth');

const router = express.Router();


/* =========================================================
   ALLOWED REQUEST STATUSES
========================================================= */

const ALLOWED_STATUSES = [
  'pending',
  'approved',
  'rejected',
  'added'
];


/* =========================================================
   SUBMIT QUESTION REQUEST

   POST /api/question-requests

   ACCESS:
   user  ✅
   admin ✅
========================================================= */

router.post(
  '/',
  requireAuth,
  async (req, res) => {

    try {

      const {
        topic,
        question,
        notes
      } = req.body;


      /* -----------------------------------------------------
         VALIDATION
      ----------------------------------------------------- */

      if (
        !question ||
        !question.trim()
      ) {

        return res.status(400).json({
          message: 'Question is required'
        });
      }


      if (question.trim().length < 5) {

        return res.status(400).json({
          message:
            'Question must contain at least 5 characters'
        });
      }


      if (question.trim().length > 1000) {

        return res.status(400).json({
          message:
            'Question cannot exceed 1000 characters'
        });
      }


      if (
        topic &&
        topic.trim().length > 200
      ) {

        return res.status(400).json({
          message:
            'Topic cannot exceed 200 characters'
        });
      }


      if (
        notes &&
        notes.trim().length > 2000
      ) {

        return res.status(400).json({
          message:
            'Notes cannot exceed 2000 characters'
        });
      }


      const db = getDatabase();

      const now = new Date();


      /*
       * IMPORTANT:
       *
       * Username comes from req.user.
       *
       * We DO NOT accept username from the request body
       * because users must never be able to submit a
       * question under someone else's username.
       */

      const document = {

        username:
          req.user.username,

        submittedByRole:
          req.user.role,

        topic:
          topic?.trim() || 'General',

        question:
          question.trim(),

        notes:
          notes?.trim() || '',

        status:
          'pending',

        createdAt:
          now,

        updatedAt:
          now,

        reviewedBy:
          null,

        reviewedAt:
          null
      };


      const result =
        await db
          .collection('questionRequests')
          .insertOne(document);


      return res.status(201).json({

        message:
          'Question request submitted successfully',

        request: {
          _id:
            result.insertedId,

          ...document
        }
      });


    } catch (error) {

      console.error(
        'Submit question request error:',
        error
      );


      return res.status(500).json({
        message:
          'Internal server error'
      });
    }
  }
);


/* =========================================================
   VIEW ALL QUESTION REQUESTS

   GET /api/question-requests/admin

   ACCESS:
   user  ❌
   admin ✅
========================================================= */

router.get(
  '/admin',
  requireAuth,
  requireAdmin,
  async (req, res) => {

    try {

      const db =
        getDatabase();


      const requests =
        await db
          .collection('questionRequests')
          .find({})
          .sort({
            createdAt: -1
          })
          .toArray();


      return res.json({

        count:
          requests.length,

        requests
      });


    } catch (error) {

      console.error(
        'Load question requests error:',
        error
      );


      return res.status(500).json({
        message:
          'Internal server error'
      });
    }
  }
);


/* =========================================================
   UPDATE QUESTION REQUEST STATUS

   PATCH /api/question-requests/admin/:id

   ACCESS:
   user  ❌
   admin ✅
========================================================= */

router.patch(
  '/admin/:id',
  requireAuth,
  requireAdmin,
  async (req, res) => {

    try {

      const {
        id
      } = req.params;


      const {
        status
      } = req.body;


      /* -----------------------------------------------------
         VALIDATE OBJECT ID
      ----------------------------------------------------- */

      if (!ObjectId.isValid(id)) {

        return res.status(400).json({
          message:
            'Invalid question request ID'
        });
      }


      /* -----------------------------------------------------
         VALIDATE STATUS
      ----------------------------------------------------- */

      if (
        !status ||
        !ALLOWED_STATUSES.includes(status)
      ) {

        return res.status(400).json({

          message:
            'Invalid status',

          allowedStatuses:
            ALLOWED_STATUSES
        });
      }


      const db =
        getDatabase();


      const now =
        new Date();


      const result =
        await db
          .collection('questionRequests')
          .findOneAndUpdate(

            {
              _id:
                new ObjectId(id)
            },

            {
              $set: {

                status,

                updatedAt:
                  now,

                reviewedBy:
                  req.user.username,

                reviewedAt:
                  now
              }
            },

            {
              returnDocument:
                'after'
            }
          );


      if (!result) {

        return res.status(404).json({
          message:
            'Question request not found'
        });
      }


      return res.json({

        message:
          'Question request updated successfully',

        request:
          result
      });


    } catch (error) {

      console.error(
        'Update question request error:',
        error
      );


      return res.status(500).json({
        message:
          'Internal server error'
      });
    }
  }
);


module.exports = router;
