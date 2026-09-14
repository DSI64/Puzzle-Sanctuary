// Jigsaw Puzzle Game
import { useState } from "react";
import "../games-css/Jigsaw.css";

function Jigsaw() {
  const [gameStarted, setGameStarted] = useState(false);
  const [imageId, setImageId] = useState(null);
  const [pieces, setPieces] = useState([]);

  const newPuzzle = () => {
    const randomId = Math.floor(Math.random() * 1000) + 1;

    // Create the 9 pieces of the image.
    const newPieces = Array.from({ length: 9 }, (_, index) => ({
      id: index,
      correctPosition: index,
    }));

    // Shuffle the pieces.
    for (let i = newPieces.length - 1; i > 0; i--) {
      const randomIndex = Math.floor(Math.random() * (i + 1));

      [newPieces[i], newPieces[randomIndex]] = [
        newPieces[randomIndex],
        newPieces[i],
      ];
    }

    setImageId(randomId);
    setPieces(newPieces);
    setGameStarted(true);
  };

  // Gets the correct section of the image for each piece.
  const getBackgroundPosition = (position) => {
    const row = Math.floor(position / 3);
    const column = position % 3;

    const positions = [
      ["0% 0%", "50% 0%", "100% 0%"],
      ["0% 50%", "50% 50%", "100% 50%"],
      ["0% 100%", "50% 100%", "100% 100%"],
    ];

    return positions[row][column];
  };

  return (
    <main className="jigsaw-page">
      <div className="jigsaw-game">

        <section className="jigsaw-header">
          <p className="page-label">PUZZLE SANCTUARY</p>
          <h1>Jigsaw Puzzle</h1>

          {!gameStarted && (
            <>
              <p>Put the pieces together to complete the image.</p>

              <button
                className="jigsaw-new-button"
                onClick={newPuzzle}
              >
                New Puzzle
              </button>
            </>
          )}
        </section>

        {gameStarted && (
          <section className="jigsaw-board-section">

            {/* Empty puzzle board */}
            <div className="jigsaw-board">
              {Array.from({ length: 9 }).map((_, index) => (
                <div
                  key={index}
                  className="jigsaw-board-space"
                />
              ))}
            </div>

            {/* Shuffled puzzle pieces */}
            <div className="jigsaw-piece-tray">
              <h2>Puzzle Pieces</h2>

              <div className="jigsaw-pieces">
                {pieces.map((piece) => (
                  <div
                    key={piece.id}
                    className="jigsaw-piece"
                    style={{
                      backgroundImage: `url(https://picsum.photos/id/${imageId}/600/600)`,
                      backgroundPosition: getBackgroundPosition(
                        piece.correctPosition
                      ),
                    }}
                  />
                ))}
              </div>
            </div>

          </section>
        )}

      </div>
    </main>
  );
}

export default Jigsaw;