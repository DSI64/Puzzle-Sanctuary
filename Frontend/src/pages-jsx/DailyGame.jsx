import { useState } from "react";
import "../pages-css/DailyGame.css";

function DailyGame() {
  const [revealedGame, setRevealedGame] = useState(false);

  const todaysGame = {
    name: "Sliding Puzzle",
    description:
      "Slide the pieces into place to recreate the image.",
  };

  const today = new Date();

  const formattedDate = today.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const handleRevealGame = () => {
    setRevealedGame(true);
  };

  return (
    <main className="daily-game-page">
      <section className="daily-game-container">

        {/* Header */}

        <header className="daily-game-header">
          <p className="page-label">PUZZLE SANCTUARY</p>

          <h1>Daily Puzzle</h1>

          <p className="daily-date">
            {formattedDate}
          </p>
        </header>

        {/* Daily Puzzle */}

        <section className="daily-puzzle-section">

          {!revealedGame ? (
            <>
              <div className="daily-puzzle-preview">
                <span className="daily-puzzle-icon">?</span>

                <h2>Today's Puzzle</h2>

                <p>
                  Discover which puzzle awaits you today.
                </p>
              </div>

              <button
                className="reveal-daily-button"
                onClick={handleRevealGame}
              >
                Reveal Today's Puzzle
              </button>
            </>
          ) : (
            <div className="daily-puzzle-revealed">

              <p className="daily-result-label">
                TODAY'S PUZZLE
              </p>

              <h2>{todaysGame.name}</h2>

              <p className="daily-puzzle-description">
                {todaysGame.description}
              </p>

              <button className="play-daily-button">
                Play Today's Game
              </button>

            </div>
          )}

        </section>

        {/* How It Works */}

        <section className="daily-how-section">

          <h2>How Daily Puzzles Work</h2>

          <div className="daily-how-grid">

            <div className="daily-how-card">
              <span className="daily-step-number">
                1
              </span>

              <div>
                <h3>Reveal</h3>

                <p>
                  Reveal today's puzzle to see which
                  game has been selected.
                </p>
              </div>
            </div>

            <div className="daily-how-card">
              <span className="daily-step-number">
                2
              </span>

              <div>
                <h3>Play</h3>

                <p>
                  Complete today's puzzle to continue
                  your daily streak.
                </p>
              </div>
            </div>

            <div className="daily-how-card">
              <span className="daily-step-number">
                3
              </span>

              <div>
                <h3>Come Back</h3>

                <p>
                  Return tomorrow for a brand new
                  daily puzzle.
                </p>
              </div>
            </div>

          </div>

        </section>

      </section>
    </main>
  );
}

export default DailyGame;