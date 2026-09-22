import { useState } from "react";
import "../pages-css/DailyGame.css";

function DailyGame() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [revealedGame, setRevealedGame] = useState(null);

  // Area for games on the Wheel
  const puzzleGames = [
    "Sliding Puzzle",
    "Placeholder"
  ];

  const handleRevealGame = () => {
    if (isSpinning || revealedGame) {
      return;
    }

    setIsSpinning(true);

    setTimeout(() => {
      setRevealedGame("Sliding Puzzle");
      setIsSpinning(false);
    }, 2500);
  };

  // Current Time based on US EST
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

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

        {/* Daily Game Wheel */}

        <section className="daily-wheel-section">

          <h2>What Will Today's Puzzle Be?</h2>

          <p className="daily-wheel-description">
            Reveal today's puzzle to find out which game
            awaits you.
          </p>

          <div
            className={`daily-wheel-container ${
              isSpinning ? "spinning" : ""
            }`}
          >
            <div className="wheel-pointer">
              ▼
            </div>

            <div className="daily-wheel">
              {puzzleGames.map((game, index) => (
                <div
                  key={game}
                  className="wheel-section"
                  style={{
                    transform: `rotate(${
                      index * (360 / puzzleGames.length)
                    }deg)`,
                  }}
                >
                  <span>
                    {game}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {!revealedGame ? (
            <button
              className="reveal-daily-button"
              onClick={handleRevealGame}
              disabled={isSpinning}
            >
              {isSpinning
                ? "Revealing..."
                : "Reveal Daily Game"}
            </button>
          ) : (
            <div className="daily-result">
              <p>Today's Puzzle</p>

              <h3>{revealedGame}</h3>

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