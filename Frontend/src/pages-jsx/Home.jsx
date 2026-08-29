import "../App.css";

function Home() {
  return (
    <main>
      <section className="hero">
        <p className="hero-label">WELCOME TO</p>
        <h1>PUZZLE SANCTUARY</h1>
        <p>
          Relax, challenge yourself, and enjoy a collection of puzzles
          designed for all kinds of players.
        </p>

        <button>Play Today's Puzzle</button>
      </section>

      <section className="featured">
        <h2>Explore Puzzles</h2>

        <div className="puzzle-grid">
          <div className="puzzle-card">
            <h3>Word Puzzles</h3>
            <p>Test your vocabulary and word skills.</p>
            <button>Explore</button>
          </div>

          <div className="puzzle-card">
            <h3>Number Puzzles</h3>
            <p>Challenge yourself with numbers and patterns.</p>
            <button>Explore</button>
          </div>

          <div className="puzzle-card">
            <h3>Logic Puzzles</h3>
            <p>Use deduction and reasoning to solve problems.</p>
            <button>Explore</button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;