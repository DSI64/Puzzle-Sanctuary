import "../pages-css/Home.css";
import { Link } from "react-router-dom";

function Home() {
  return (
    <main className="home-page">
      <section className="hero">

        {/* <div className="tree">
          <div className="tree-leaves"></div>
          <div className="tree-trunk"></div>
        </div> */}

        {/* Background Decorations */}

        <div className="background-decoration puzzle-bg puzzle-bg-1"></div>
        <div className="background-decoration puzzle-bg puzzle-bg-2"></div>
        <div className="background-decoration puzzle-bg puzzle-bg-3"></div>
        <div className="background-decoration puzzle-bg puzzle-bg-4"></div>
        <div className="background-decoration puzzle-bg puzzle-bg-5"></div>
        <div className="background-decoration puzzle-bg puzzle-bg-6"></div>
        <div className="background-decoration puzzle-bg puzzle-bg-7"></div>
        <div className="background-decoration puzzle-bg puzzle-bg-8"></div>
        <div className="background-decoration leaf-bg leaf-bg-1">🍃</div>
        <div className="background-decoration leaf-bg leaf-bg-2">🍃</div>
        <div className="background-decoration leaf-bg leaf-bg-3">🍃</div>
        <div className="background-decoration leaf-bg leaf-bg-4">🍃</div>

        <p className="hero-label puzzle-piece-1">WELCOME TO</p>
        <h1 className="puzzle-piece-2">PUZZLE SANCTUARY</h1>

        <p className="puzzle-piece-3">
          Relax, challenge yourself, and enjoy a collection of
          relaxing and entertaining puzzles.
        </p>

        <Link to="/daily" className="puzzle-piece-4"> Play Today's Puzzle </Link>      </section>

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