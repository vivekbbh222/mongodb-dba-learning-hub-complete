import { useEffect, useState } from 'react';
import { getQuestions, getQuestionsByCategory } from './api/questions';
import './App.css';

const categories = [
  {
    id: 'mongodb_basics',
    title: 'MongoDB Basics',
    description: 'Learn the fundamentals of MongoDB and its core concepts.'
  },
  {
    id: 'linux_basics',
    title: 'Linux Basics',
    description: 'Learn essential Linux concepts and commands used by DBAs.'
  },
  {
    id: 'replication',
    title: 'Replication',
    description: 'Understand replica sets, elections, oplog, and failover.'
  },
  {
    id: 'atlas',
    title: 'MongoDB Atlas',
    description: 'Learn Atlas architecture, monitoring, security, and networking.'
  }
];

function App() {
  const [questions, setQuestions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryQuestions, setCategoryQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadQuestions() {
      try {
        setLoading(true);
        setError('');

        const data = await getQuestions();

        setQuestions(data);
      } catch (error) {
        console.error('Failed to load questions:', error);
        setError('Failed to load questions');
      } finally {
        setLoading(false);
      }
    }

    loadQuestions();
  }, []);

  async function startLearning(category) {
    try {
      setCategoryLoading(true);
      setError('');

      const data = await getQuestionsByCategory(category.id);

      setSelectedCategory(category);
      setCategoryQuestions(data);
      setCurrentQuestion(0);

    } catch (error) {
      console.error('Failed to load category questions:', error);

      setError('Failed to load category questions');

    } finally {
      setCategoryLoading(false);
    }
  }

  function goBackToTopics() {
    setSelectedCategory(null);
    setCategoryQuestions([]);
    setCurrentQuestion(0);
    setError('');
  }

  function nextQuestion() {
    if (currentQuestion < categoryQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  }

  function previousQuestion() {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  }

  function getQuestionCount(category) {
    return questions.filter(
      (question) => question.category === category
    ).length;
  }

  /*
   * QUESTION SCREEN
   */

  if (selectedCategory) {
    const question = categoryQuestions[currentQuestion];

    return (
      <main className="app-container">

        <header className="app-header">

          <button
            type="button"
            onClick={goBackToTopics}
          >
            ← Back to Topics
          </button>

          <h1>{selectedCategory.title}</h1>

          <p>
            Learn and test your knowledge.
          </p>

        </header>

        {categoryLoading && (
          <section className="card">
            <p>Loading questions...</p>
          </section>
        )}

        {error && (
          <section className="card">
            <p className="error-message">
              {error}
            </p>
          </section>
        )}

        {!categoryLoading && !error && question && (

          <section className="card question-card">

            <div className="question-progress">

              <span>
                Question {currentQuestion + 1} of {categoryQuestions.length}
              </span>

              <span>
                {question.difficulty}
              </span>

            </div>

            <h2>
              {question.question}
            </h2>

            <div className="answer-box">

              <h3>Answer</h3>

              <p>
                {question.answer}
              </p>

            </div>

            <div className="question-navigation">

              <button
                type="button"
                onClick={previousQuestion}
                disabled={currentQuestion === 0}
              >
                ← Previous
              </button>

              <button
                type="button"
                onClick={nextQuestion}
                disabled={
                  currentQuestion === categoryQuestions.length - 1
                }
              >
                Next →
              </button>

            </div>

          </section>

        )}

      </main>
    );
  }

  /*
   * TOPIC SCREEN
   */

  return (
    <main className="app-container">

      <header className="app-header">

        <h1>DBA Learning Hub</h1>

        <p>
          Learn MongoDB, Linux, Replication, and Atlas
          through practical questions.
        </p>

      </header>

      <section className="topics-section">

        <h2>Choose a Topic</h2>

        {loading && (
          <p>Loading topics...</p>
        )}

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}

        {!loading && !error && (

          <div className="topics-grid">

            {categories.map((category) => (

              <article
                className="topic-card"
                key={category.id}
              >

                <h3>
                  {category.title}
                </h3>

                <p>
                  {category.description}
                </p>

                <div className="topic-footer">

                  <span>
                    {getQuestionCount(category.id)} Questions
                  </span>

                  <button
                    type="button"
                    onClick={() => startLearning(category)}
                  >
                    Start Learning
                  </button>

                </div>

              </article>

            ))}

          </div>

        )}

      </section>

    </main>
  );
}

export default App;