import "./App.css";

function App() {
  return (
    <div className="app">
      <header className="navbar">
        <h1 className="logo">Puzzle Sanctuary</h1>

        <nav>
          <a href="#">Home</a>
          <a href="#">Daily Game</a>
          <a href="#">Puzzles</a>
          <a href="#">About</a>
        </nav>
      </header>

      <main>
        <section className="hero">
          <h2>Welcome to Puzzle Sanctuary</h2>
          <p>
            Take a break, challenge your mind, and enjoy a collection of
            relaxing and entertaining puzzles.
          </p>

          <button>Play Today's Puzzle</button>
        </section>

        <section className="featured">
          <h2>Featured Puzzles</h2>

          <div className="puzzle-grid">
            <div className="puzzle-card">
              <h3>Word Puzzle</h3>
              <p>Test your vocabulary and find the hidden words.</p>
              <button>Play</button>
            </div>

            <div className="puzzle-card">
              <h3>Number Puzzle</h3>
              <p>Put your mathematical thinking to the test.</p>
              <button>Play</button>
            </div>

            <div className="puzzle-card">
              <h3>Logic Puzzle</h3>
              <p>Use logic and deduction to solve challenging problems.</p>
              <button>Play</button>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <p>© 2026 Puzzle Sanctuary</p>
      </footer>
    </div>
  );
}

export default App;
