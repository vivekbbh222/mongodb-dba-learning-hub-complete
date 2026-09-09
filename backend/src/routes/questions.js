const express = require('express');
const { ObjectId } = require('mongodb');

const { getClient } = require('../config/db');
const {
  requireAuth,
  requireAdmin
} = require('../middleware/auth');

const router = express.Router();

const DATABASE_NAME = 'webapp';
const COLLECTION_NAME = 'questions';


/* =========================================================
   HELPER - ESCAPE REGEX SPECIAL CHARACTERS
========================================================= */

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}


/* =========================================================
   HELPER - NORMALIZE QUESTION DOCUMENT
========================================================= */

function buildQuestionDocument(body) {

  const answer =
    body?.answer &&
    typeof body.answer === 'object'
      ? body.answer
      : {};


  return {

    category:
      String(
        body.category || ''
      ).trim(),

    topicId:
      String(
        body.topicId || ''
      ).trim(),

    topicNumber:
      Number(
        body.topicNumber
      ),

    topicName:
      String(
        body.topicName || ''
      ).trim(),

    questionNumber:
      Number(
        body.questionNumber
      ),

    question:
      String(
        body.question || ''
      ).trim(),

    level:
      String(
        body.level || ''
      ).trim(),

    difficulty:
      String(
        body.difficulty || ''
      ).trim(),

    order:
      Number(
        body.order
      ),

    answer: {

      groundZero:
        String(
          answer.groundZero || ''
        ).trim(),

      coreConcept:
        String(
          answer.coreConcept || ''
        ).trim(),

      detailedExplanation:
        String(
          answer.detailedExplanation || ''
        ).trim(),

      internalWorking:
        String(
          answer.internalWorking || ''
        ).trim(),

      architecture:
        String(
          answer.architecture || ''
        ).trim(),

      examples:
        Array.isArray(
          answer.examples
        )
          ? answer.examples
          : [],

      commands:
        Array.isArray(
          answer.commands
        )
          ? answer.commands
          : [],

      productionScenario:
        String(
          answer.productionScenario || ''
        ).trim(),

      troubleshootingApproach:
        String(
          answer.troubleshootingApproach || ''
        ).trim(),

      commonMistakes:
        Array.isArray(
          answer.commonMistakes
        )
          ? answer.commonMistakes
          : [],

      bestPractices:
        Array.isArray(
          answer.bestPractices
        )
          ? answer.bestPractices
          : [],

      interviewAnswer:
        String(
          answer.interviewAnswer || ''
        ).trim(),

      keyTakeaways:
        Array.isArray(
          answer.keyTakeaways
        )
          ? answer.keyTakeaways
          : []

    }

  };
}


/* =========================================================
   HELPER - VALIDATE QUESTION
========================================================= */

function validateQuestion(question) {

  const errors = [];


  if (!question.category) {
    errors.push(
      'category is required'
    );
  }


  if (!question.topicId) {
    errors.push(
      'topicId is required'
    );
  }


  if (
    !Number.isInteger(
      question.topicNumber
    ) ||
    question.topicNumber < 1
  ) {
    errors.push(
      'topicNumber must be a positive integer'
    );
  }


  if (!question.topicName) {
    errors.push(
      'topicName is required'
    );
  }


  if (
    !Number.isInteger(
      question.questionNumber
    ) ||
    question.questionNumber < 1
  ) {
    errors.push(
      'questionNumber must be a positive integer'
    );
  }


  if (!question.question) {
    errors.push(
      'question is required'
    );
  }


  if (!question.level) {
    errors.push(
      'level is required'
    );
  }


  if (!question.difficulty) {
    errors.push(
      'difficulty is required'
    );
  }


  if (
    !Number.isInteger(
      question.order
    ) ||
    question.order < 1
  ) {
    errors.push(
      'order must be a positive integer'
    );
  }


  return errors;
}


/* =========================================================
   GET /api/questions

   Returns active questions only.
========================================================= */

router.get('/', async (req, res) => {
  try {

    const db =
      getClient().db(
        DATABASE_NAME
      );


    const collection =
      db.collection(
        COLLECTION_NAME
      );


    const questions =
      await collection
        .find({
          active: {
            $ne: false
          }
        })
        .sort({
          category: 1,
          order: 1
        })
        .toArray();


    return res
      .status(200)
      .json(questions);


  } catch (error) {

    console.error(
      'Failed to fetch questions:',
      error
    );


    return res
      .status(500)
      .json({
        error:
          'Failed to fetch questions'
      });
  }
});


/* =========================================================
   GET /api/questions/search

   Global question search.
========================================================= */

router.get(
  '/search',
  async (req, res) => {
    try {

      const db =
        getClient().db(
          DATABASE_NAME
        );


      const collection =
        db.collection(
          COLLECTION_NAME
        );


      const searchText =
        String(
          req.query.q || ''
        ).trim();


      const topic =
        String(
          req.query.topic || ''
        ).trim();


      const difficulty =
        String(
          req.query.difficulty || ''
        ).trim();


      const level =
        String(
          req.query.level || ''
        ).trim();


      if (
        !searchText &&
        !topic &&
        !difficulty &&
        !level
      ) {

        return res
          .status(400)
          .json({
            message:
              'Enter a search term or filter.'
          });
      }


      const filter = {
        active: {
          $ne: false
        }
      };


      if (searchText) {

        const safeSearch =
          escapeRegex(
            searchText
          );


        const searchRegex =
          new RegExp(
            safeSearch,
            'i'
          );


        filter.$or = [

          {
            question:
              searchRegex
          },

          {
            category:
              searchRegex
          },

          {
            topicId:
              searchRegex
          },

          {
            topicName:
              searchRegex
          },

          {
            level:
              searchRegex
          },

          {
            difficulty:
              searchRegex
          },

          {
            'answer.groundZero':
              searchRegex
          },

          {
            'answer.coreConcept':
              searchRegex
          },

          {
            'answer.detailedExplanation':
              searchRegex
          },

          {
            'answer.productionScenario':
              searchRegex
          },

          {
            'answer.troubleshootingApproach':
              searchRegex
          },

          {
            'answer.interviewAnswer':
              searchRegex
          }

        ];
      }


      if (topic) {

        const safeTopic =
          escapeRegex(
            topic
          );


        filter.$and =
          filter.$and || [];


        filter.$and.push({
          $or: [

            {
              category:
                new RegExp(
                  `^${safeTopic}$`,
                  'i'
                )
            },

            {
              topicId:
                new RegExp(
                  `^${safeTopic}$`,
                  'i'
                )
            },

            {
              topicName:
                new RegExp(
                  `^${safeTopic}$`,
                  'i'
                )
            }

          ]
        });
      }


      if (difficulty) {

        filter.difficulty =
          new RegExp(
            `^${escapeRegex(
              difficulty
            )}$`,
            'i'
          );
      }


      if (level) {

        filter.level =
          new RegExp(
            `^${escapeRegex(
              level
            )}$`,
            'i'
          );
      }


      const questions =
        await collection
          .find(filter)
          .sort({
            topicNumber: 1,
            category: 1,
            order: 1
          })
          .limit(100)
          .toArray();


      return res
        .status(200)
        .json({

          query:
            searchText,

          filters: {

            topic:
              topic || null,

            difficulty:
              difficulty || null,

            level:
              level || null

          },

          count:
            questions.length,

          questions

        });


    } catch (error) {

      console.error(
        'Question search failed:',
        error
      );


      return res
        .status(500)
        .json({
          error:
            'Failed to search questions'
        });
    }
  }
);


/* =========================================================
   ADMIN - GET ALL QUESTIONS

   GET /api/questions/admin/all

   Includes active and disabled questions.
========================================================= */

router.get(
  '/admin/all',
  requireAuth,
  requireAdmin,
  async (req, res) => {

    try {

      const db =
        getClient().db(
          DATABASE_NAME
        );


      const collection =
        db.collection(
          COLLECTION_NAME
        );


      const questions =
        await collection
          .find({})
          .sort({
            topicNumber: 1,
            order: 1
          })
          .toArray();


      return res
        .status(200)
        .json({

          count:
            questions.length,

          questions

        });


    } catch (error) {

      console.error(
        'Admin question list failed:',
        error
      );


      return res
        .status(500)
        .json({
          error:
            'Failed to load questions'
        });
    }
  }
);


/* =========================================================
   ADMIN - CREATE QUESTION

   POST /api/questions/admin
========================================================= */

router.post(
  '/admin',
  requireAuth,
  requireAdmin,
  async (req, res) => {

    try {

      const question =
        buildQuestionDocument(
          req.body
        );


      const validationErrors =
        validateQuestion(
          question
        );


      if (
        validationErrors.length > 0
      ) {

        return res
          .status(400)
          .json({
            message:
              'Question validation failed',

            errors:
              validationErrors
          });
      }


      const db =
        getClient().db(
          DATABASE_NAME
        );


      const collection =
        db.collection(
          COLLECTION_NAME
        );


      const now =
        new Date();


      const document = {

        ...question,

        active:
          req.body?.active === false
            ? false
            : true,

        createdBy:
          req.user.username,

        createdAt:
          now,

        updatedBy:
          req.user.username,

        updatedAt:
          now

      };


      const result =
        await collection
          .insertOne(
            document
          );


      return res
        .status(201)
        .json({

          message:
            'Question created successfully.',

          question: {
            ...document,
            _id:
              result.insertedId
          }

        });


    } catch (error) {

      if (
        error?.code === 11000
      ) {

        return res
          .status(409)
          .json({
            message:
              'A question with this topic/order combination already exists.'
          });
      }


      console.error(
        'Create question failed:',
        error
      );


      return res
        .status(500)
        .json({
          error:
            'Failed to create question'
        });
    }
  }
);


/* =========================================================
   ADMIN - UPDATE QUESTION

   PUT /api/questions/admin/:id
========================================================= */

router.put(
  '/admin/:id',
  requireAuth,
  requireAdmin,
  async (req, res) => {

    try {

      const {
        id
      } = req.params;


      if (
        !ObjectId.isValid(id)
      ) {

        return res
          .status(400)
          .json({
            message:
              'Invalid question ID.'
          });
      }


      const question =
        buildQuestionDocument(
          req.body
        );


      const validationErrors =
        validateQuestion(
          question
        );


      if (
        validationErrors.length > 0
      ) {

        return res
          .status(400)
          .json({
            message:
              'Question validation failed',

            errors:
              validationErrors
          });
      }


      const db =
        getClient().db(
          DATABASE_NAME
        );


      const collection =
        db.collection(
          COLLECTION_NAME
        );


      const update = {

        ...question,

        updatedBy:
          req.user.username,

        updatedAt:
          new Date()

      };


      const result =
        await collection
          .findOneAndUpdate(
            {
              _id:
                new ObjectId(id)
            },
            {
              $set:
                update
            },
            {
              returnDocument:
                'after'
            }
          );


      if (!result) {

        return res
          .status(404)
          .json({
            message:
              'Question not found.'
          });
      }


      return res
        .status(200)
        .json({

          message:
            'Question updated successfully.',

          question:
            result

        });


    } catch (error) {

      if (
        error?.code === 11000
      ) {

        return res
          .status(409)
          .json({
            message:
              'A question with this topic/order combination already exists.'
          });
      }


      console.error(
        'Update question failed:',
        error
      );


      return res
        .status(500)
        .json({
          error:
            'Failed to update question'
        });
    }
  }
);


/* =========================================================
   ADMIN - ENABLE / DISABLE QUESTION

   PATCH /api/questions/admin/:id/status

   Body:
   {
      "active": false
   }
========================================================= */

router.patch(
  '/admin/:id/status',
  requireAuth,
  requireAdmin,
  async (req, res) => {

    try {

      const {
        id
      } = req.params;


      if (
        !ObjectId.isValid(id)
      ) {

        return res
          .status(400)
          .json({
            message:
              'Invalid question ID.'
          });
      }


      if (
        typeof req.body?.active !==
        'boolean'
      ) {

        return res
          .status(400)
          .json({
            message:
              'active must be true or false.'
          });
      }


      const db =
        getClient().db(
          DATABASE_NAME
        );


      const collection =
        db.collection(
          COLLECTION_NAME
        );


      const result =
        await collection
          .findOneAndUpdate(
            {
              _id:
                new ObjectId(id)
            },
            {
              $set: {

                active:
                  req.body.active,

                updatedBy:
                  req.user.username,

                updatedAt:
                  new Date()

              }
            },
            {
              returnDocument:
                'after'
            }
          );


      if (!result) {

        return res
          .status(404)
          .json({
            message:
              'Question not found.'
          });
      }


      return res
        .status(200)
        .json({

          message:
            req.body.active
              ? 'Question enabled successfully.'
              : 'Question disabled successfully.',

          question:
            result

        });


    } catch (error) {

      console.error(
        'Question status update failed:',
        error
      );


      return res
        .status(500)
        .json({
          error:
            'Failed to update question status'
        });
    }
  }
);


/* =========================================================
   ADMIN - PERMANENTLY DELETE QUESTION

   DELETE /api/questions/admin/:id

   Permanently deletes:
   - question
   - related userProgress records
   - related bookmarks

   IMPORTANT:
   This cannot be undone.
========================================================= */

router.delete(
  '/admin/:id',
  requireAuth,
  requireAdmin,
  async (req, res) => {

    const client =
      getClient();

    const session =
      client.startSession();

    try {

      const {
        id
      } = req.params;


      if (
        !ObjectId.isValid(id)
      ) {

        return res
          .status(400)
          .json({
            message:
              'Invalid question ID.'
          });
      }


      const db =
        client.db(
          DATABASE_NAME
        );


      const questionsCollection =
        db.collection(
          COLLECTION_NAME
        );


      const progressCollection =
        db.collection(
          'userProgress'
        );


      const bookmarksCollection =
        db.collection(
          'bookmarks'
        );


      const questionObjectId =
        new ObjectId(id);


      let deletedQuestion = null;

      let deletedProgressCount = 0;

      let deletedBookmarkCount = 0;


      await session.withTransaction(
        async () => {

          deletedQuestion =
            await questionsCollection
              .findOne(
                {
                  _id:
                    questionObjectId
                },
                {
                  session
                }
              );


          if (!deletedQuestion) {
            return;
          }


          const progressResult =
            await progressCollection
              .deleteMany(
                {
                  questionId:
                    questionObjectId
                },
                {
                  session
                }
              );


          const bookmarkResult =
            await bookmarksCollection
              .deleteMany(
                {
                  questionId:
                    questionObjectId
                },
                {
                  session
                }
              );


          const questionResult =
            await questionsCollection
              .deleteOne(
                {
                  _id:
                    questionObjectId
                },
                {
                  session
                }
              );


          if (
            questionResult.deletedCount !== 1
          ) {

            throw new Error(
              'Question deletion did not complete.'
            );
          }


          deletedProgressCount =
            progressResult.deletedCount || 0;


          deletedBookmarkCount =
            bookmarkResult.deletedCount || 0;
        }
      );


      if (!deletedQuestion) {

        return res
          .status(404)
          .json({
            message:
              'Question not found.'
          });
      }


      return res
        .status(200)
        .json({

          message:
            'Question permanently deleted.',

          deleted: {

            questions:
              1,

            progressRecords:
              deletedProgressCount,

            bookmarks:
              deletedBookmarkCount

          },

          question: {

            _id:
              deletedQuestion._id,

            topicId:
              deletedQuestion.topicId,

            topicName:
              deletedQuestion.topicName,

            questionNumber:
              deletedQuestion.questionNumber,

            question:
              deletedQuestion.question

          }

        });


    } catch (error) {

      console.error(
        'Permanent question deletion failed:',
        error
      );


      return res
        .status(500)
        .json({
          error:
            'Failed to permanently delete question'
        });


    } finally {

      await session.endSession();
    }
  }
);


/* =========================================================
   ADMIN - PERMANENTLY DELETE CUSTOM TOPIC

   DELETE /api/questions/admin/topic/:topicId

   Body:
   {
      "confirmation": "Exact Topic Name"
   }

   A topic in the original curriculum (topicNumber <= 21)
   is protected from whole-topic deletion.

   Permanently deletes:
   - every question in the topic
   - related userProgress records
   - related bookmarks

   IMPORTANT:
   This cannot be undone.
========================================================= */

router.delete(
  '/admin/topic/:topicId',
  requireAuth,
  requireAdmin,
  async (req, res) => {

    const client =
      getClient();

    const session =
      client.startSession();

    try {

      const topicId =
        String(
          req.params.topicId || ''
        ).trim();


      const confirmation =
        String(
          req.body?.confirmation || ''
        ).trim();


      if (!topicId) {

        return res
          .status(400)
          .json({
            message:
              'topicId is required.'
          });
      }


      const db =
        client.db(
          DATABASE_NAME
        );


      const questionsCollection =
        db.collection(
          COLLECTION_NAME
        );


      const progressCollection =
        db.collection(
          'userProgress'
        );


      const bookmarksCollection =
        db.collection(
          'bookmarks'
        );


      let topicQuestions = [];

      let deletedQuestionCount = 0;

      let deletedProgressCount = 0;

      let deletedBookmarkCount = 0;

      let topicName = '';


      await session.withTransaction(
        async () => {

          topicQuestions =
            await questionsCollection
              .find(
                {
                  topicId
                },
                {
                  session
                }
              )
              .toArray();


          if (
            topicQuestions.length === 0
          ) {
            return;
          }


          topicName =
            String(
              topicQuestions[0]?.topicName ||
              topicId
            ).trim();


          const protectedTopic =
            topicQuestions.some(
              question =>
                Number(
                  question?.topicNumber || 0
                ) <= 21
            );


          if (protectedTopic) {

            const error =
              new Error(
                'Built-in curriculum topics cannot be permanently deleted as a whole topic.'
              );

            error.code =
              'PROTECTED_TOPIC';

            throw error;
          }


          if (
            confirmation !== topicName
          ) {

            const error =
              new Error(
                'Topic name confirmation does not match.'
              );

            error.code =
              'CONFIRMATION_MISMATCH';

            throw error;
          }


          const questionIds =
            topicQuestions.map(
              question =>
                question._id
            );


          const progressResult =
            await progressCollection
              .deleteMany(
                {
                  questionId: {
                    $in:
                      questionIds
                  }
                },
                {
                  session
                }
              );


          const bookmarkResult =
            await bookmarksCollection
              .deleteMany(
                {
                  questionId: {
                    $in:
                      questionIds
                  }
                },
                {
                  session
                }
              );


          const questionsResult =
            await questionsCollection
              .deleteMany(
                {
                  topicId
                },
                {
                  session
                }
              );


          deletedQuestionCount =
            questionsResult.deletedCount || 0;


          deletedProgressCount =
            progressResult.deletedCount || 0;


          deletedBookmarkCount =
            bookmarkResult.deletedCount || 0;
        }
      );


      if (
        topicQuestions.length === 0
      ) {

        return res
          .status(404)
          .json({
            message:
              'Topic not found.'
          });
      }


      return res
        .status(200)
        .json({

          message:
            'Topic permanently deleted.',

          topic: {

            topicId,

            topicName

          },

          deleted: {

            questions:
              deletedQuestionCount,

            progressRecords:
              deletedProgressCount,

            bookmarks:
              deletedBookmarkCount

          }

        });


    } catch (error) {

      if (
        error?.code ===
        'PROTECTED_TOPIC'
      ) {

        return res
          .status(403)
          .json({
            message:
              error.message
          });
      }


      if (
        error?.code ===
        'CONFIRMATION_MISMATCH'
      ) {

        return res
          .status(400)
          .json({
            message:
              error.message
          });
      }


      console.error(
        'Permanent topic deletion failed:',
        error
      );


      return res
        .status(500)
        .json({
          error:
            'Failed to permanently delete topic'
        });


    } finally {

      await session.endSession();
    }
  }
);


/* =========================================================
   GET /api/questions/:category

   Returns active questions for category.

   IMPORTANT:
   This route MUST remain after:

   /search
   /admin/all
   /admin
========================================================= */

router.get(
  '/:category',
  async (req, res) => {

    try {

      const {
        category
      } = req.params;


      const db =
        getClient().db(
          DATABASE_NAME
        );


      const collection =
        db.collection(
          COLLECTION_NAME
        );


      const questions =
        await collection
          .find({

            category:
              category,

            active: {
              $ne: false
            }

          })
          .sort({
            order: 1
          })
          .toArray();


      return res
        .status(200)
        .json(
          questions
        );


    } catch (error) {

      console.error(
        'Failed to fetch category questions:',
        error
      );


      return res
        .status(500)
        .json({
          error:
            'Failed to fetch category questions'
        });
    }
  }
);


module.exports = router;
