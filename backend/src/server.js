const cors = require('cors');
const express = require('express');

const { connectToDatabase } = require('./config/db');

const healthRouter = require('./routes/health');
const recordsRouter = require('./routes/records');
const questionsRouter = require('./routes/questions');
const authRouter = require('./routes/auth');
const questionRequestsRouter =
  require('./routes/questionRequests');
const progressRouter =
  require('./routes/progress');
const bookmarksRouter =
  require('./routes/bookmarks');

const {
  requireAuth,
  requireAdmin
} = require('./middleware/auth');

const app = express();

const PORT =
  process.env.PORT || 3000;


/* =========================================================
   CORS
========================================================= */

const allowedOrigins =
  (
    process.env.ALLOWED_ORIGINS ||
    ''
  )
    .split(',')
    .map(
      origin =>
        origin.trim()
    )
    .filter(Boolean);


console.log(
  'Allowed CORS origins:',
  allowedOrigins
);


app.use(
  cors({

    origin:
      (
        origin,
        callback
      ) => {

        /*
         * Requests such as curl and
         * server-to-server requests
         * may not contain Origin.
         */

        if (!origin) {

          return callback(
            null,
            true
          );
        }


        if (
          allowedOrigins.includes(
            origin
          )
        ) {

          return callback(
            null,
            true
          );
        }


        console.log(
          `Blocked by CORS: ${origin}`
        );


        return callback(
          new Error(
            'Not allowed by CORS'
          )
        );
      },


    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS'
    ],


    allowedHeaders: [
      'Content-Type',
      'Authorization'
    ]
  })
);


app.use(
  express.json({
    limit: '1mb'
  })
);


/* =========================================================
   TEMPORARY AUTH TEST
========================================================= */

app.get(
  '/api/auth-test',
  requireAuth,
  (req, res) => {

    res.json({

      message:
        'Authentication successful',

      user:
        req.user,

      expiresAt:
        req.session.expiresAt
    });
  }
);


/* =========================================================
   TEMPORARY ADMIN TEST
========================================================= */

app.get(
  '/api/admin-test',
  requireAuth,
  requireAdmin,
  (req, res) => {

    res.json({

      message:
        'Administrator authentication successful',

      user:
        req.user
    });
  }
);


/* =========================================================
   HEALTH
========================================================= */

app.use(
  '/health',
  healthRouter
);


/* =========================================================
   RECORDS
========================================================= */

app.use(
  '/api/records',
  recordsRouter
);


/* =========================================================
   PROGRESS

   Progress is user-specific.
   Authentication is enforced
   inside progress routes.
========================================================= */

app.use(
  '/api/progress',
  progressRouter
);


/* =========================================================
   BOOKMARKS

   Bookmarks are user-specific.
   Authentication is enforced
   inside bookmark routes.
========================================================= */

app.use(
  '/api/bookmarks',
  bookmarksRouter
);


/* =========================================================
   QUESTIONS

   All authenticated users:
   user  ✅
   admin ✅
========================================================= */

app.use(
  '/api/questions',
  requireAuth,
  questionsRouter
);


/* =========================================================
   QUESTION REQUESTS

   POST /                  -> authenticated users
   GET /admin              -> admins only
   PATCH /admin/:id        -> admins only
========================================================= */

app.use(
  '/api/question-requests',
  questionRequestsRouter
);


/* =========================================================
   AUTHENTICATION ROUTES
========================================================= */

app.use(
  '/api/auth',
  authRouter
);


/* =========================================================
   START SERVER
========================================================= */

async function startServer() {

  try {

    await connectToDatabase();


    app.listen(
      PORT,
      '0.0.0.0',
      () => {

        console.log(
          `API server is running on port ${PORT}`
        );
      }
    );


  } catch (error) {

    console.error(
      'Failed to start application:',
      error
    );


    process.exit(1);
  }
}


startServer();
