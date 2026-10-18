
import { useCallback, useEffect, useState } from "react";
import "../games-css/2048.css";

const SIZE = 4;
const TARGET_TILE = 2048;

function createEmptyBoard() {
  return Array(SIZE * SIZE).fill(0);
}

function addRandomTile(board) {
  const emptyCells = board
    .map((value, index) => (value === 0 ? index : -1))
    .filter((index) => index !== -1);

  if (emptyCells.length === 0) return board;

  const index = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const newBoard = [...board];
  newBoard[index] = Math.random() < 0.9 ? 2 : 4;

  return newBoard;
}

function createNewBoard() {
  let board = createEmptyBoard();
  board = addRandomTile(board);
  board = addRandomTile(board);
  return board;
}

function mergeRow(row) {
  const values = row.filter((value) => value !== 0);
  const merged = [];
  let gained = 0;

  for (let i = 0; i < values.length; i++) {
    if (values[i] === values[i + 1]) {
      const value = values[i] * 2;
      merged.push(value);
      gained += value;
      i++;
    } else {
      merged.push(values[i]);
    }
  }

  while (merged.length < SIZE) {
    merged.push(0);
  }

  return { row: merged, gained };
}

function moveBoard(board, direction) {
  const nextBoard = createEmptyBoard();
  let gained = 0;

  for (let line = 0; line < SIZE; line++) {
    const positions = [];

    for (let offset = 0; offset < SIZE; offset++) {
      let row;
      let col;

      if (direction === "left" || direction === "right") {
        row = line;
        col = direction === "left" ? offset : SIZE - 1 - offset;
      } else {
        row = direction === "up" ? offset : SIZE - 1 - offset;
        col = line;
      }

      positions.push(row * SIZE + col);
    }

    const values = positions.map((index) => board[index]);
    const result = mergeRow(values);
    gained += result.gained;

    positions.forEach((index, offset) => {
      nextBoard[index] = result.row[offset];
    });
  }

  const changed = nextBoard.some(
    (value, index) => value !== board[index]
  );

  return { board: nextBoard, gained, changed };
}

function hasMoves(board) {
  if (board.some((value) => value === 0)) return true;

  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      const index = row * SIZE + col;

      if (col < SIZE - 1 && board[index] === board[index + 1]) {
        return true;
      }

      if (row < SIZE - 1 && board[index] === board[index + SIZE]) {
        return true;
      }
    }
  }

  return false;
}

function formatScore(score) {
  return score.toLocaleString();
}

export default function Game2048() {
  const [board, setBoard] = useState(() => createNewBoard());
  const [score, setScore] = useState(0);

  const [bestScore, setBestScore] = useState(() => {
    try {
      return Number(
        localStorage.getItem("puzzleSanctuary2048Best")
      ) || 0;
    } catch {
      return 0;
    }
  });

  const [won, setWon] = useState(false);
  const [keepPlaying, setKeepPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [showNewGameConfirm, setShowNewGameConfirm] = useState(false);

  const startNewGame = useCallback(() => {
    setBoard(createNewBoard());
    setScore(0);
    setWon(false);
    setKeepPlaying(false);
    setGameOver(false);
    setTouchStart(null);
  }, []);

  const move = useCallback(
    (direction) => {
      if (gameOver || (won && !keepPlaying)) return;

      const result = moveBoard(board, direction);

      if (!result.changed) return;

      const nextBoard = addRandomTile(result.board);
      const nextScore = score + result.gained;

      setBoard(nextBoard);
      setScore(nextScore);

      if (nextScore > bestScore) {
        setBestScore(nextScore);

        try {
          localStorage.setItem(
            "puzzleSanctuary2048Best",
            String(nextScore)
          );
        } catch {
          // The game still works if storage is unavailable.
        }
      }

      if (
        !won &&
        nextBoard.some((value) => value >= TARGET_TILE)
      ) {
        setWon(true);
      }

      if (!hasMoves(nextBoard)) {
        setGameOver(true);
      }
    },
    [board, score, bestScore, won, keepPlaying, gameOver]
  );

  useEffect(() => {
    function handleKeyDown(event) {
      const target = event.target;

      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(
            target.tagName
          ))
      ) {
        return;
      }

      const key = event.key.toLowerCase();

      const directions = {
        arrowup: "up",
        w: "up",
        arrowdown: "down",
        s: "down",
        arrowleft: "left",
        a: "left",
        arrowright: "right",
        d: "right",
      };

      if (directions[key]) {
        event.preventDefault();
        move(directions[key]);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [move]);

  function handleTouchStart(event) {
    const touch = event.touches[0];

    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
    });
  }

  function handleTouchEnd(event) {
    if (!touchStart) return;

    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStart.x;
    const dy = touch.clientY - touchStart.y;
    const threshold = 25;

    if (Math.max(Math.abs(dx), Math.abs(dy)) >= threshold) {
      if (Math.abs(dx) > Math.abs(dy)) {
        move(dx > 0 ? "right" : "left");
      } else {
        move(dy > 0 ? "down" : "up");
      }
    }

    setTouchStart(null);
  }

  return (
    <main className="game2048-page">
      <header className="game2048-header">
        <div>
          <p className="game2048-eyebrow">PUZZLE SANCTUARY</p>
          <h1>2048</h1>
          <p className="game2048-subtitle">
            Join matching numbers to reach 2048!
          </p>
        </div>
      </header>

      <section
        className="game2048-score-row"
        aria-label="Game scores and controls"
      >
        <div className="game2048-score-card">
          <span>Score</span>
          <strong>{formatScore(score)}</strong>
        </div>

        <div className="game2048-score-card">
          <span>Best</span>
          <strong>{formatScore(bestScore)}</strong>
        </div>

        <button
          type="button"
          className="game2048-new-game"
          onClick={() => setShowNewGameConfirm(true)}
        >
          New Game
        </button>
      </section>

      <section
        className="game2048-board"
        aria-label="2048 game board"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {board.map((value, index) => (
          <div
            className={`game2048-cell tile-${value || "empty"}`}
            key={index}
            aria-label={value ? String(value) : "Empty"}
          >
            {value !== 0 ? value : ""}
          </div>
        ))}

        {((won && !keepPlaying) || gameOver) && (
          <div className="game2048-overlay">
            <div className="game2048-overlay-card">
              <h2>
                {gameOver ? "Game Over!" : "You reached 2048!"}
              </h2>

              <p>
                {gameOver
                  ? "No more moves are available."
                  : "Great job! You can keep playing or start again."}
              </p>

              {!gameOver && (
                <button
                  type="button"
                  className="game2048-overlay-button"
                  onClick={() => setKeepPlaying(true)}
                >
                  Keep Playing
                </button>
              )}

              <button
                type="button"
                className="game2048-overlay-button"
                onClick={() => setShowNewGameConfirm(true)}
              >
                New Game
              </button>
            </div>
          </div>
        )}
      </section>

      <p className="game2048-instructions">
        <strong>How to play:</strong> Use your arrow keys or WASD to
        slide the tiles. On a phone or tablet, swipe in the direction
        you want to move. Matching tiles merge into one!
      </p>

      {showNewGameConfirm && (
        <div className="game2048-confirm-backdrop">
          <div
            className="game2048-confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="game2048-confirm-title"
          >
            <h2 id="game2048-confirm-title">
              Start a New Game?
            </h2>

            <p>
              Your current board will be replaced. Are you sure you
              want to start over?
            </p>

            <div className="game2048-confirm-actions">
              <button
                type="button"
                className="game2048-cancel-button"
                onClick={() => setShowNewGameConfirm(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="game2048-confirm-button"
                onClick={() => {
                  startNewGame();
                  setShowNewGameConfirm(false);
                }}
              >
                New Game
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
