\# MongoDB DBA Learning Hub



A full-stack MongoDB DBA learning and interview-preparation application built with React, Vite, Node.js, Express.js, and MongoDB.



\## Features



\- 21 seeded MongoDB DBA topics

\- 420 seeded questions as the baseline curriculum

\- Dynamic custom topic creation

\- Admin question management

\- Global question search

\- Account-backed progress tracking

\- Bookmarks

\- Question request workflow

\- Predefined user authentication

\- Admin and normal-user roles

\- Enable/disable questions

\- Permanent question deletion

\- Permanent custom-topic deletion

\- 15-minute backend session expiry



The application is dynamic, so administrators can add additional topics and questions beyond the original 420-question baseline.



\---



\## Project Structure



```text

mongo-dba-learning-hub-share/

├── frontend/

│   ├── src/

│   ├── public/

│   ├── package.json

│   └── package-lock.json

│

├── backend/

│   ├── src/

│   ├── scripts/

│   ├── seed/

│   ├── package.json

│   ├── package-lock.json

│   └── .env.example

│

├── database/

│   └── indexes.js

│

├── docs/

├── .gitignore

└── README.md

```



\---



\## Technology Stack



\### Frontend



\- React

\- Vite

\- JavaScript

\- CSS



\### Backend



\- Node.js

\- Express.js

\- MongoDB Node.js Driver

\- bcrypt

\- dotenv

\- cors



\### Database



\- MongoDB

\- Replica set supported

\- Application database: `webapp`



\---



\# Prerequisites



Install the following before running the project:



\- Node.js

\- npm

\- MongoDB or access to a MongoDB deployment

\- mongosh

\- Git (optional)



\---



\# 1. Backend Setup



Open a terminal in the project directory and move to:



```bash

cd backend

```



Install dependencies:



```bash

npm install

```



Copy the example environment configuration.



\### Windows PowerShell



```powershell

Copy-Item .env.example .env

```



\### Linux/macOS



```bash

cp .env.example .env

```



Edit `.env` and enter your own MongoDB configuration.



Example:



```env

MONGODB\_URI=mongodb://<USERNAME>:<PASSWORD>@<MONGODB\_HOST\_1>:27017,<MONGODB\_HOST\_2>:27017,<MONGODB\_HOST\_3>:27017/webapp?replicaSet=<REPLICA\_SET\_NAME>\&authSource=admin

PORT=3000

ALLOWED\_ORIGINS=http://localhost:5173

```



Never commit or share the real `.env` file.



\---



\# 2. MongoDB Database Setup



The application uses the `webapp` database.



The following collections are used:



\- `questions`

\- `users`

\- `loginSessions`

\- `questionRequests`

\- `userProgress`

\- `bookmarks`



The required indexes are defined in:



```text

database/indexes.js

```



Run the index script against your own MongoDB deployment using `mongosh`.



Example:



```bash

mongosh "<YOUR\_MONGODB\_CONNECTION\_STRING>" database/indexes.js

```



\---



\# 3. Seed the Learning Curriculum



The curriculum seed files are located in:



```text

backend/seed/

```



There are 21 seeded MongoDB DBA topics.



The baseline curriculum contains:



```text

21 topics

420 questions

20 questions per seeded topic

```



Run the seed files in numerical order.



Example:



```bash

node seed/01-mongodb-fundamentals.js

```



Continue through:



```bash

node seed/21-linux-for-mongodb.js

```



The application can grow beyond the seeded baseline because admins can create additional questions and custom topics.



\---



\# 4. Create a User



Users are predefined by the administrator.



There is no public signup functionality.



Run:



```bash

node scripts/create-user.js

```



Follow the prompts to create the user.



Passwords are hashed using bcrypt before being stored in MongoDB.



Supported roles are:



```text

admin

user

```



An `admin` has administrative privileges.



A normal `user` has access to the learning functionality without administrative controls.



\---



\# 5. Start the Backend



From the `backend` directory run:



```bash

npm start

```



The backend starts using:



```text

node src/server.js

```



Default API address:



```text

http://localhost:3000

```



Health endpoint:



```text

http://localhost:3000/health

```



\---



\# 6. Frontend Setup



Open another terminal.



Move to:



```bash

cd frontend

```



Install dependencies:



```bash

npm install

```



Start the Vite development server:



```bash

npm run dev

```



The frontend normally runs at:



```text

http://localhost:5173

```



\---



\# 7. Authentication



The application uses predefined accounts.



There is no public registration page.



Authentication includes:



\- Username/password login

\- bcrypt password hashing

\- Backend-managed sessions

\- 15-minute session expiration

\- Active/inactive user control

\- Admin and normal-user roles

\- Automatic frontend logout after session expiry



\---



\# 8. Normal User Capabilities



A normal user can:



\- Access MongoDB DBA topics

\- Read questions and answers

\- Search the curriculum

\- Mark questions as completed

\- View saved progress

\- Bookmark questions

\- View bookmarks

\- Submit question requests

\- Logout



Progress and bookmarks are stored in MongoDB and therefore persist across browser sessions.



\---



\# 9. Admin Capabilities



An admin has all normal-user functionality plus administrative controls.



Admins can:



\- Create questions

\- Edit questions

\- Enable questions

\- Disable questions

\- Permanently delete questions

\- Create custom topics

\- Permanently delete custom topics

\- Review question requests

\- Approve/reject/update question requests



The original 21 seeded topics are protected from whole-topic permanent deletion.



Individual question administration remains available.



\---



\# 10. Progress Tracking



User progress is stored in:



```text

userProgress

```



Progress is associated with the authenticated username and question.



This allows completion status to persist after:



\- Page refresh

\- Logout

\- Login

\- Browser restart



\---



\# 11. Bookmarks



Bookmarks are stored in:



```text

bookmarks

```



Bookmarks are account-specific.



Users can bookmark and unbookmark questions and access their saved bookmark list.



\---



\# 12. Global Search



The application provides authenticated global search.



Search can match information including:



\- Question text

\- Category

\- Topic ID

\- Topic name

\- Level

\- Difficulty

\- Ground-zero explanation

\- Core concepts

\- Detailed explanations

\- Production scenarios

\- Troubleshooting approaches

\- Interview answers



Search also supports topic, difficulty, and level filtering.



\---



\# 13. Question Requests



Authenticated users can submit requests for additional questions.



Administrators can review these requests and maintain their status.



Supported workflow statuses include:



```text

pending

approved

rejected

added

```



\---



\# 14. Dynamic Topics



The application begins with 21 seeded topics but is not restricted to them.



Administrators can create new topics through the admin interface.



For new topics, the application can automatically determine:



\- Next topic number

\- Topic ID

\- Category

\- First question number

\- Question order



New active topics automatically appear in the application curriculum.



\---



\# 15. Question Management



Questions contain structured learning content including:



\- Ground-zero explanation

\- Core concept

\- Detailed explanation

\- Internal working

\- Architecture

\- Examples

\- Commands

\- Production scenarios

\- Troubleshooting approach

\- Common mistakes

\- Best practices

\- Interview answer

\- Key takeaways



This structure is designed for MongoDB DBA learning from fundamentals through production/L3 scenarios.



\---



\# 16. Permanent Deletion



Administrators can permanently delete individual questions.



Related progress and bookmark records are also cleaned up.



Custom topics can also be permanently deleted.



Whole-topic deletion requires confirmation.



The original seeded Topics 1-21 are protected from whole-topic deletion.



Permanent deletion should be used carefully because it is destructive.



\---



\# 17. Security



Never commit or share:



\- `.env`

\- MongoDB passwords

\- MongoDB connection strings containing credentials

\- SSH private keys

\- `.pem` files

\- `.ppk` files

\- TLS private keys

\- AWS credentials

\- API secrets

\- Session tokens

\- Production credentials



The provided `.env.example` contains placeholders only.



The root `.gitignore` is configured to exclude common sensitive and generated files.



\---



\# 18. Production Architecture



One possible production architecture is:



```text

User Browser

&#x20;    |

&#x20;    v

React/Vite Frontend

&#x20;    |

&#x20;    v

HTTPS Endpoint / Secure Tunnel

&#x20;    |

&#x20;    v

Express.js Backend API

&#x20;    |

&#x20;    v

MongoDB Replica Set

```



The original project was designed using:



\- Vercel for frontend hosting

\- Linux/EC2 for the Express backend

\- MongoDB replica set

\- Secure tunneling/reverse proxy for HTTPS API access



Infrastructure-specific credentials and private connection information are intentionally excluded from this shared project.



\---



\# 19. Environment Configuration



Frontend and backend URLs may need to be changed depending on the deployment environment.



For local development:



```text

Frontend: http://localhost:5173

Backend:  http://localhost:3000

```



Production deployments should use HTTPS and appropriately restricted CORS origins.



\---



\# 20. Additional Documentation



Detailed architecture, installation, deployment, operations, authentication, troubleshooting, recovery, and enhancement information is available in the `docs` directory.



Refer to the MongoDB DBA Learning Hub runbook for the complete implementation history and operational procedure.



\---



\# Important



This shared repository intentionally does NOT contain the original developer's:



\- MongoDB credentials

\- `.env` configuration

\- SSH private keys

\- AWS credentials

\- Production secrets

\- Session tokens



Anyone deploying this project must provide their own infrastructure and credentials.



\---



\# MongoDB DBA Learning Hub



Built as a practical full-stack MongoDB DBA learning, administration, interview-preparation, and production-scenario project.

