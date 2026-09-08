import "../pages-css/Home.css";

function Home() {
  return (
    <main className="home-page">
      <section className="hero">
        
        {/* <div className="tree">
          <div className="tree-leaves"></div>
          <div className="tree-trunk"></div>
        </div> */}

        <p className="hero-label">WELCOME TO</p>
        <h1>PUZZLE SANCTUARY</h1>

        <p className="hero-description">
          Relax, challenge yourself, and enjoy a collection of 
          relaxing and entertaining puzzles.
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