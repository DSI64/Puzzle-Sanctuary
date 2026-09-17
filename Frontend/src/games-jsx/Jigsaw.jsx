// Jigsaw Puzzle Game
import { useState } from "react";
import "../games-css/Jigsaw.css";

function Jigsaw() {
  const [gameStarted, setGameStarted] = useState(false);
  const [imageId, setImageId] = useState(null);
  const [pieces, setPieces] = useState([]);
  const [shuffling, setShuffling] = useState(false);

  // Create a new puzzle
  const newPuzzle = () => {
    const randomId = Math.floor(Math.random() * 1000) + 1;

    // Create the solved puzzle.
    const newPieces = Array.from({ length: 8 }, (_, index) => ({
      id: index,
      correctPosition: index,
    }));

    // The last position is empty.
    newPieces.push(null);

    setImageId(randomId);
    setPieces(newPieces);
    setGameStarted(true);
    setShuffling(true);

    // Start rapidly shuffling the puzzle.
    shufflePuzzle(newPieces);
  };

  // Shuffle the puzzle using legal sliding moves.
  const shufflePuzzle = (startingPieces) => {
    let currentPieces = [...startingPieces];
    let currentEmptyPosition = 8;
    let previousEmptyPosition = -1;

    const shuffleInterval = setInterval(() => {
      const possibleMoves = [];

      const row = Math.floor(currentEmptyPosition / 3);
      const column = currentEmptyPosition % 3;

      // Move above the empty space.
      if (row > 0) {
        possibleMoves.push(currentEmptyPosition - 3);
      }

      // Move below the empty space.
      if (row < 2) {
        possibleMoves.push(currentEmptyPosition + 3);
      }

      // Move left of the empty space.
      if (column > 0) {
        possibleMoves.push(currentEmptyPosition - 1);
      }

      // Move right of the empty space.
      if (column < 2) {
        possibleMoves.push(currentEmptyPosition + 1);
      }

      // Avoid immediately moving the previous piece back.
      const filteredMoves = possibleMoves.filter(
        (position) => position !== previousEmptyPosition
      );

      const moves =
        filteredMoves.length > 0
          ? filteredMoves
          : possibleMoves;

      const randomMove =
        moves[Math.floor(Math.random() * moves.length)];

      // Move the piece into the empty space.
      currentPieces[currentEmptyPosition] =
        currentPieces[randomMove];

      currentPieces[randomMove] = null;

      previousEmptyPosition = currentEmptyPosition;
      currentEmptyPosition = randomMove;

      // Update the position of each piece.
      currentPieces = currentPieces.map((piece, index) => {
        if (!piece) {
          return null;
        }

        return {
          ...piece,
          currentPosition: index,
        };
      });

      setPieces([...currentPieces]);
    }, 100);

    // Stop shuffling after 2 seconds.
    setTimeout(() => {
      clearInterval(shuffleInterval);
      setShuffling(false);
    }, 2000);
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

  // Check if a piece can move into the empty space.
  const isAdjacentToEmpty = (position) => {
    const row = Math.floor(position / 3);
    const column = position % 3;

    const emptyPosition = pieces.findIndex(
      (piece) => piece === null
    );

    if (emptyPosition === -1) {
      return false;
    }

    const emptyRow = Math.floor(emptyPosition / 3);
    const emptyColumn = emptyPosition % 3;

    const rowDifference = Math.abs(row - emptyRow);
    const columnDifference = Math.abs(column - emptyColumn);

    return rowDifference + columnDifference === 1;
  };

  // Move a puzzle piece.
  const movePiece = (position) => {
    if (shuffling) {
      return;
    }

    if (!isAdjacentToEmpty(position)) {
      return;
    }

    setPieces((currentPieces) => {
      const newPieces = [...currentPieces];

      const emptyPosition = newPieces.findIndex(
        (piece) => piece === null
      );

      newPieces[emptyPosition] = {
        ...newPieces[position],
        currentPosition: emptyPosition,
      };

      newPieces[position] = null;

      return newPieces;
    });
  };

  return (
    <main className="jigsaw-page">
      <div className="jigsaw-game">
        {!gameStarted && (
          <section className="jigsaw-title-screen">
            <div className="jigsaw-title-content">
              <p className="page-label">PUZZLE SANCTUARY</p>

              <h1>Sliding Puzzle</h1>

              <p className="title-description">
                Rearrange the pieces to recreate the image.
              </p>

              <button
                className="jigsaw-play-button"
                onClick={newPuzzle}
              >
                Play Game
              </button>
            </div>

            <div className="title-puzzle-preview">
              <div className="preview-piece">8</div>
              <div className="preview-piece">2</div>
              <div className="preview-piece">5</div>

              <div className="preview-piece">1</div>
              <div className="preview-piece">6</div>
              <div className="preview-piece">3</div>

              <div className="preview-piece">7</div>
              <div className="preview-piece">4</div>
              <div className="preview-piece empty"></div>
            </div>
          </section>
        )}

        {gameStarted && (
          <>
            <section className="jigsaw-header">
              <p className="page-label">PUZZLE SANCTUARY</p>

              <h1>Sliding Puzzle</h1>

              <p>
                {shuffling
                  ? "Shuffling puzzle..."
                  : "Slide the pieces into the empty space to complete the image."}
              </p>

              <button
                className="jigsaw-new-button"
                onClick={newPuzzle}
                disabled={shuffling}
              >
                New Puzzle
              </button>
            </section>

            <section className="jigsaw-board-section">
              <div className="jigsaw-board">
                {pieces.map((piece, index) => {
                  if (!piece) {
                    return (
                      <div
                        key={`empty-${index}`}
                        className="jigsaw-board-space empty"
                      />
                    );
                  }

                  const canMove =
                    !shuffling &&
                    isAdjacentToEmpty(index);

                  return (
                    <div
                      key={piece.id}
                      className={`jigsaw-board-space ${
                        canMove ? "movable" : ""
                      }`}
                      onClick={() => movePiece(index)}
                    >
                      <div
                        className="jigsaw-piece"
                        style={{
                          backgroundImage: `url(https://picsum.photos/id/${imageId}/600/600)`,
                          backgroundPosition: getBackgroundPosition(
                            piece.correctPosition
                          ),
                        }}
                      >
                        <span className="jigsaw-piece-number">
                          {piece.correctPosition + 1}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

export default Jigsaw;