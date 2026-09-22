import { useEffect, useRef, useState } from "react";
import "../games-css/Jigsaw.css";

const API_BASE_URL = "http://localhost:3001";

function Jigsaw() {
  const [gameStarted, setGameStarted] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [photoCredit, setPhotoCredit] = useState(null);
  const [pieces, setPieces] = useState([]);
  const [shuffling, setShuffling] = useState(false);
  const [timer, setTimer] = useState(0);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [gameAbandoned, setGameAbandoned] = useState(false);

  // Give Up confirmation
  const [showGiveUpConfirmation, setShowGiveUpConfirmation] =
    useState(false);

  // Options window
  const [showOptions, setShowOptions] = useState(false);

  // Selected game options
  const [difficulty, setDifficulty] = useState("medium");
  const [category, setCategory] = useState("nature");

  // Keep track of every move made during the puzzle.
  const moveHistory = useRef([]);

  // Keep track of the active shuffle interval.
  const shuffleIntervalRef = useRef(null);

  // Get the board size for the selected difficulty.
  const getBoardSize = (selectedDifficulty) => {
    if (selectedDifficulty === "easy") {
      return 2;
    }

    if (selectedDifficulty === "hard") {
      return 4;
    }

    return 3;
  };

  // Get the local storage key for each difficulty.
  const getHighScoreKey = (selectedDifficulty) => {
    return `slidingPuzzleHighScore_${selectedDifficulty}`;
  };

  // Get the high score for the current difficulty.
  const getHighScore = (selectedDifficulty) => {
    return (
      Number(
        localStorage.getItem(
          getHighScoreKey(selectedDifficulty)
        )
      ) || 0
    );
  };

  // Get a readable difficulty name.
  const getDifficultyName = (
    selectedDifficulty = difficulty
  ) => {
    if (selectedDifficulty === "easy") {
      return "Easy";
    }

    if (selectedDifficulty === "hard") {
      return "Hard";
    }

    return "Medium";
  };

  // Get a readable category name.
  const getCategoryName = (
    selectedCategory = category
  ) => {
    if (selectedCategory === "animals") {
      return "Animals";
    }

    if (selectedCategory === "architecture") {
      return "Architecture";
    }

    if (selectedCategory === "art") {
      return "Art";
    }

    if (selectedCategory === "games") {
      return "Games";
    }

    if (selectedCategory === "music") {
      return "Music";
    }

    return "Nature";
  };

  // Timer
  useEffect(() => {
    if (
      !gameStarted ||
      shuffling ||
      gameComplete ||
      gameAbandoned
    ) {
      return;
    }

    const timerInterval = setInterval(() => {
      setTimer((currentTime) => currentTime + 1);
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [
    gameStarted,
    shuffling,
    gameComplete,
    gameAbandoned,
  ]);

  // Create a new puzzle.
  const newPuzzle = async (
    selectedDifficulty = difficulty,
    selectedCategory = category
  ) => {
    // Make sure an old shuffle interval is not still running.
    if (shuffleIntervalRef.current) {
      clearInterval(shuffleIntervalRef.current);
      shuffleIntervalRef.current = null;
    }

    const boardSize = getBoardSize(selectedDifficulty);
    const totalPieces = boardSize * boardSize;

    // Create the solved puzzle.
    const newPieces = Array.from(
      { length: totalPieces - 1 },
      (_, index) => ({
        id: index,
        correctPosition: index,
        currentPosition: index,
      })
    );

    // The final position is empty.
    newPieces.push(null);

    // Clear the move history for the new puzzle.
    moveHistory.current = [];

    try {
      // Ask the backend for a Pexels image.
      const response = await fetch(
        `${API_BASE_URL}/api/pexels/photo?category=${encodeURIComponent(
          selectedCategory
        )}`
      );

      if (!response.ok) {
        throw new Error(
          `Pexels request failed with status ${response.status}`
        );
      }

      const data = await response.json();

      if (!data.imageUrl) {
        throw new Error(
          "The backend did not return an image URL."
        );
      }

      // Store the selected image and photographer information.
      setImageUrl(data.imageUrl);

      setPhotoCredit({
        photographer:
          data.photographer || "Unknown Photographer",
        photographerUrl:
          data.photographerUrl || "https://www.pexels.com/",
        photoUrl:
          data.photoUrl || "https://www.pexels.com/",
      });

      setDifficulty(selectedDifficulty);
      setCategory(selectedCategory);
      setPieces(newPieces);
      setGameStarted(true);
      setShuffling(true);
      setTimer(0);
      setScore(0);
      setGameComplete(false);
      setGameAbandoned(false);
      setShowGiveUpConfirmation(false);
      setShowOptions(false);

      // Start rapidly shuffling the puzzle.
      shufflePuzzle(newPieces, boardSize);
    } catch (error) {
      console.error(
        "Unable to load Pexels image:",
        error
      );

      window.alert(
        "Unable to load a puzzle image. Make sure your Puzzle Sanctuary backend is running."
      );
    }
  };

  // Shuffle the puzzle using legal sliding moves.
  const shufflePuzzle = (
    startingPieces,
    boardSize
  ) => {
    let currentPieces = [...startingPieces];

    let currentEmptyPosition =
      startingPieces.length - 1;

    let previousEmptyPosition = -1;

    const shuffleInterval = setInterval(() => {
      const possibleMoves = [];

      const row = Math.floor(
        currentEmptyPosition / boardSize
      );

      const column =
        currentEmptyPosition % boardSize;

      // Move above the empty space.
      if (row > 0) {
        possibleMoves.push(
          currentEmptyPosition - boardSize
        );
      }

      // Move below the empty space.
      if (row < boardSize - 1) {
        possibleMoves.push(
          currentEmptyPosition + boardSize
        );
      }

      // Move left of the empty space.
      if (column > 0) {
        possibleMoves.push(
          currentEmptyPosition - 1
        );
      }

      // Move right of the empty space.
      if (column < boardSize - 1) {
        possibleMoves.push(
          currentEmptyPosition + 1
        );
      }

      // Avoid immediately undoing the previous move.
      const filteredMoves =
        possibleMoves.filter(
          (position) =>
            position !== previousEmptyPosition
        );

      const moves =
        filteredMoves.length > 0
          ? filteredMoves
          : possibleMoves;

      const randomMove =
        moves[
          Math.floor(
            Math.random() * moves.length
          )
        ];

      // Save the move.
      moveHistory.current.push({
        piecePosition: randomMove,
        emptyPosition: currentEmptyPosition,
      });

      // Move the piece into the empty space.
      currentPieces[currentEmptyPosition] =
        currentPieces[randomMove];

      currentPieces[randomMove] = null;

      previousEmptyPosition =
        currentEmptyPosition;

      currentEmptyPosition = randomMove;

      // Update the current positions.
      currentPieces = currentPieces.map(
        (piece, index) => {
          if (!piece) {
            return null;
          }

          return {
            ...piece,
            currentPosition: index,
          };
        }
      );

      setPieces([...currentPieces]);
    }, 100);

    shuffleIntervalRef.current =
      shuffleInterval;

    // Stop shuffling after 2 seconds.
    setTimeout(() => {
      clearInterval(shuffleInterval);
      shuffleIntervalRef.current = null;
      setShuffling(false);
      setTimer(0);
    }, 2000);
  };

  // Gets the correct section of the image for each piece.
  const getBackgroundPosition = (
    position,
    boardSize
  ) => {
    const row = Math.floor(
      position / boardSize
    );

    const column =
      position % boardSize;

    if (boardSize === 1) {
      return "0% 0%";
    }

    const horizontalPosition =
      (column / (boardSize - 1)) * 100;

    const verticalPosition =
      (row / (boardSize - 1)) * 100;

    return `${horizontalPosition}% ${verticalPosition}%`;
  };

  // Check if a piece can move into the empty space.
  const isAdjacentToEmpty = (position) => {
    const boardSize =
      getBoardSize(difficulty);

    const row = Math.floor(
      position / boardSize
    );

    const column =
      position % boardSize;

    const emptyPosition =
      pieces.findIndex(
        (piece) => piece === null
      );

    if (emptyPosition === -1) {
      return false;
    }

    const emptyRow = Math.floor(
      emptyPosition / boardSize
    );

    const emptyColumn =
      emptyPosition % boardSize;

    const rowDifference =
      Math.abs(row - emptyRow);

    const columnDifference =
      Math.abs(column - emptyColumn);

    return (
      rowDifference + columnDifference === 1
    );
  };

  // Check if the puzzle is complete.
  const checkPuzzleComplete = (
    currentPieces
  ) => {
    return currentPieces.every(
      (piece, index) => {
        if (
          index ===
          currentPieces.length - 1
        ) {
          return piece === null;
        }

        return (
          piece &&
          piece.correctPosition === index
        );
      }
    );
  };

  // Calculate the score based on difficulty and completion time.
  const calculateScore = (
    completionTime,
    puzzleDifficulty = difficulty
  ) => {
    const difficultyMultipliers = {
      easy: 0.75,
      medium: 1,
      hard: 1.5,
    };

    const multiplier =
      difficultyMultipliers[
        puzzleDifficulty
      ];

    const baseScore =
      10000 - completionTime * 100;

    return Math.max(
      100,
      Math.floor(
        baseScore * multiplier
      )
    );
  };

  // Move a puzzle piece.
  const movePiece = (position) => {
    if (
      shuffling ||
      gameComplete ||
      gameAbandoned
    ) {
      return;
    }

    if (!isAdjacentToEmpty(position)) {
      return;
    }

    setPieces((currentPieces) => {
      const newPieces = [
        ...currentPieces,
      ];

      const emptyPosition =
        newPieces.findIndex(
          (piece) => piece === null
        );

      // Save the move.
      moveHistory.current.push({
        piecePosition: position,
        emptyPosition: emptyPosition,
      });

      newPieces[emptyPosition] = {
        ...newPieces[position],
        currentPosition: emptyPosition,
      };

      newPieces[position] = null;

      // Check if the puzzle has been completed.
      if (
        checkPuzzleComplete(newPieces)
      ) {
        const finalScore =
          calculateScore(
            timer,
            difficulty
          );

        setScore(finalScore);
        setGameComplete(true);

        const existingHighScore =
          getHighScore(difficulty);

        if (
          finalScore >
          existingHighScore
        ) {
          localStorage.setItem(
            getHighScoreKey(
              difficulty
            ),
            finalScore.toString()
          );
        }
      }

      return newPieces;
    });
  };

  // Open the Give Up confirmation.
  const handleGiveUp = () => {
    if (shuffling) {
      return;
    }

    setShowGiveUpConfirmation(true);
  };

  // Confirm Give Up.
  const confirmGiveUp = () => {
    setShowGiveUpConfirmation(false);
    setTimer(0);
    setGameAbandoned(true);
    moveHistory.current = [];
  };

  // Cancel Give Up.
  const cancelGiveUp = () => {
    setShowGiveUpConfirmation(false);
  };

  // Open Options.
  const openOptions = () => {
    setShowOptions(true);
  };

  // Close Options without saving.
  const cancelOptions = () => {
    setShowOptions(false);
  };

  // Return to the main menu.
  const returnToMainMenu = () => {
    if (shuffleIntervalRef.current) {
      clearInterval(
        shuffleIntervalRef.current
      );

      shuffleIntervalRef.current = null;
    }

    setGameStarted(false);
    setGameComplete(false);
    setGameAbandoned(false);
    setShuffling(false);
    setShowGiveUpConfirmation(false);
    setShowOptions(false);
    setTimer(0);
    setScore(0);
    setPieces([]);
    setImageUrl(null);
    setPhotoCredit(null);

    moveHistory.current = [];
  };

  return (
    <main className="jigsaw-page">
      <div className="jigsaw-game">

        {/* Main Menu */}
        {!gameStarted && (
          <section className="jigsaw-title-screen">

            <div className="jigsaw-title-main">

              {/* Left Side */}
              <div className="jigsaw-title-content">

                <p className="page-label">
                  PUZZLE SANCTUARY
                </p>

                <h1>
                  Sliding Puzzle
                </h1>

                <p className="title-description">
                  Rearrange the pieces to recreate
                  the image.
                </p>

                <div className="title-menu-buttons">

                  <button
                    className="jigsaw-play-button"
                    onClick={() =>
                      newPuzzle(
                        difficulty,
                        category
                      )
                    }
                  >
                    Play Game
                  </button>

                  <button
                    className="jigsaw-options-button"
                    onClick={openOptions}
                  >
                    Options
                  </button>

                </div>

                {/* How to Play */}
                <div className="how-to-play">

                  <h2>
                    How to Play
                  </h2>

                  <div className="how-to-play-steps">

                    <div className="how-to-play-step">

                      <span className="how-to-play-number">
                        1
                      </span>

                      <div>
                        <strong>
                          Slide the pieces
                        </strong>

                        <p>
                          Click a piece next to
                          the empty space to
                          slide it into place.
                        </p>
                      </div>

                    </div>

                    <div className="how-to-play-step">

                      <span className="how-to-play-number">
                        2
                      </span>

                      <div>
                        <strong>
                          Recreate the image
                        </strong>

                        <p>
                          Put every piece into
                          its correct position.
                        </p>
                      </div>

                    </div>

                    <div className="how-to-play-step">

                      <span className="how-to-play-number">
                        3
                      </span>

                      <div>
                        <strong>
                          Beat your time
                        </strong>

                        <p>
                          Finish quickly to earn
                          a higher score.
                        </p>
                      </div>

                    </div>

                  </div>
                </div>

              </div>

              {/* Right Side */}
              <div className="jigsaw-title-right">

                {/* Puzzle Preview */}
                <div className="title-puzzle-preview">

                  <div className="preview-piece">
                    8
                  </div>

                  <div className="preview-piece">
                    2
                  </div>

                  <div className="preview-piece">
                    5
                  </div>

                  <div className="preview-piece">
                    1
                  </div>

                  <div className="preview-piece">
                    6
                  </div>

                  <div className="preview-piece">
                    3
                  </div>

                  <div className="preview-piece">
                    7
                  </div>

                  <div className="preview-piece">
                    4
                  </div>

                  <div className="preview-piece empty"></div>

                </div>

                {/* High Scores */}
                <div className="high-scores">

                  <h2>
                    High Scores
                  </h2>

                  <div className="high-score-table">
                    <div className="high-score-row high-score-header">
                      <span>RANK</span>
                      <span>NAME</span>
                      <span>SCORE</span>
                    </div>
                     {/* Where High Score information goes*/}
                    <div className="high-score-row">
                      <span>1</span>
                      <span>PMR</span>
                      <span>18,420</span>
                    </div>

                    <div className="high-score-row">
                      <span>2</span>
                      <span>GGR</span>
                      <span>17,950</span>
                    </div>

                    <div className="high-score-row">
                      <span>3</span>
                      <span>PZF</span>
                      <span>16,780</span>
                    </div>

                    <div className="high-score-row">
                      <span>4</span>
                      <span>SLM</span>
                      <span>15,640</span>
                    </div>

                    <div className="high-score-row">
                      <span>5</span>
                      <span>PPR</span>
                      <span>14,920</span>
                    </div>

                  </div>
                </div>

              </div>
            </div>

          </section>
        )}

        {/* Gameplay */}
        {gameStarted &&
          !gameComplete &&
          !gameAbandoned && (
            <>
              <section className="jigsaw-header">

                <p className="page-label">
                  PUZZLE SANCTUARY
                </p>

                <h1>
                  Sliding Puzzle
                </h1>

                <p>
                  {shuffling
                    ? "Shuffling puzzle..."
                    : "Slide the pieces into the empty space to complete the image."}
                </p>

                <div className="jigsaw-stats">

                  <div className="jigsaw-stat">

                    <span className="jigsaw-stat-label">
                      DIFFICULTY
                    </span>

                    <span className="jigsaw-stat-value">
                      {getDifficultyName()}
                    </span>

                  </div>

                  <div className="jigsaw-stat">

                    <span className="jigsaw-stat-label">
                      CATEGORY
                    </span>

                    <span className="jigsaw-stat-value">
                      {getCategoryName()}
                    </span>

                  </div>

                  <div className="jigsaw-stat">

                    <span className="jigsaw-stat-label">
                      TIME
                    </span>

                    <span className="jigsaw-stat-value">
                      {timer}s
                    </span>

                  </div>

                </div>

              </section>

              <section className="jigsaw-board-section">

                <div
                  className={`jigsaw-board jigsaw-board-${difficulty}`}
                  style={{
                    gridTemplateColumns: `repeat(${getBoardSize(
                      difficulty
                    )}, 1fr)`,

                    gridTemplateRows: `repeat(${getBoardSize(
                      difficulty
                    )}, 1fr)`,
                  }}
                >

                  {pieces.map(
                    (piece, index) => {

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
                        isAdjacentToEmpty(
                          index
                        );

                      return (
                        <div
                          key={piece.id}
                          className={`jigsaw-board-space ${
                            canMove
                              ? "movable"
                              : ""
                          }`}
                          onClick={() =>
                            movePiece(index)
                          }
                        >

                          <div
                            className="jigsaw-piece"
                            style={{
                              backgroundImage: `url(${imageUrl})`,

                              backgroundPosition:
                                getBackgroundPosition(
                                  piece.correctPosition,
                                  getBoardSize(
                                    difficulty
                                  )
                                ),

                              backgroundSize: `${
                                getBoardSize(
                                  difficulty
                                ) * 100
                              }% ${
                                getBoardSize(
                                  difficulty
                                ) * 100
                              }%`,
                            }}
                          >

                            <span className="jigsaw-piece-number">
                              {piece.correctPosition +
                                1}
                            </span>

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

                {photoCredit && (
                  <p className="pexels-credit">

                    Photo by{" "}

                    <a
                      href={
                        photoCredit.photographerUrl
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      {photoCredit.photographer}
                    </a>{" "}

                    on{" "}

                    <a
                      href={
                        photoCredit.photoUrl
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      Pexels
                    </a>

                  </p>
                )}

                <button
                  className="jigsaw-give-up-button"
                  onClick={handleGiveUp}
                  disabled={shuffling}
                >
                  Give Up
                </button>

              </section>

              {/* Give Up Confirmation */}
              {showGiveUpConfirmation && (
                <div className="give-up-overlay">

                  <div className="give-up-dialog">

                    <h2>
                      Give Up?
                    </h2>

                    <p>
                      Are you sure you want
                      to give up on this
                      puzzle?
                    </p>

                    <p>
                      Your current puzzle
                      will be abandoned.
                    </p>

                    <p>
                      Your current time will
                      not be saved.
                    </p>

                    <div className="give-up-buttons">

                      <button
                        className="jigsaw-keep-playing-button"
                        onClick={
                          cancelGiveUp
                        }
                      >
                        Keep Playing
                      </button>

                      <button
                        className="jigsaw-confirm-give-up-button"
                        onClick={
                          confirmGiveUp
                        }
                      >
                        Give Up
                      </button>

                    </div>

                  </div>

                </div>
              )}

            </>
          )}

        {/* Options Modal */}
        {showOptions && (
          <div className="give-up-overlay">

            <div className="jigsaw-options-dialog">

              <h2>
                Options
              </h2>

              <p className="options-description">
                Customize your Sliding
                Puzzle experience.
              </p>

              {/* Difficulty */}
              <div className="options-group">

                <h3>
                  Difficulty
                </h3>

                <div className="options-choice-grid">

                  <button
                    className={`options-choice ${
                      difficulty === "easy"
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      setDifficulty("easy")
                    }
                  >
                    <strong>
                      Easy
                    </strong>

                    <span>
                      2 × 2
                    </span>

                    <small>
                      4 pieces
                    </small>
                  </button>

                  <button
                    className={`options-choice ${
                      difficulty === "medium"
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      setDifficulty("medium")
                    }
                  >
                    <strong>
                      Medium
                    </strong>

                    <span>
                      3 × 3
                    </span>

                    <small>
                      9 pieces
                    </small>
                  </button>

                  <button
                    className={`options-choice ${
                      difficulty === "hard"
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      setDifficulty("hard")
                    }
                  >
                    <strong>
                      Hard
                    </strong>

                    <span>
                      4 × 4
                    </span>

                    <small>
                      16 pieces
                    </small>
                  </button>

                </div>

              </div>

              {/* Category */}
              <div className="options-group">

                <h3>
                  Puzzle Category
                </h3>

                <div className="options-category-grid">

                  <button
                    className={`options-category ${
                      category === "nature"
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      setCategory("nature")
                    }
                  >
                    Nature
                  </button>

                  <button
                    className={`options-category ${
                      category === "animals"
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      setCategory("animals")
                    }
                  >
                    Animals
                  </button>

                  <button
                    className={`options-category ${
                      category === "architecture"
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      setCategory(
                        "architecture"
                      )
                    }
                  >
                    Architecture
                  </button>

                  <button
                    className={`options-category ${
                      category === "art"
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      setCategory("art")
                    }
                  >
                    Art
                  </button>

                  <button
                    className={`options-category ${
                      category === "games"
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      setCategory("games")
                    }
                  >
                    Games
                  </button>

                  <button
                    className={`options-category ${
                      category === "music"
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      setCategory("music")
                    }
                  >
                    Music
                  </button>

                </div>

              </div>

              <div className="options-buttons">

                <button
                  className="jigsaw-keep-playing-button"
                  onClick={
                    cancelOptions
                  }
                >
                  Cancel
                </button>

                <button
                  className="jigsaw-confirm-give-up-button"
                  onClick={() =>
                    setShowOptions(false)
                  }
                >
                  Save Options
                </button>

              </div>

            </div>

          </div>
        )}

        {/* Puzzle Abandoned */}
        {gameAbandoned && (
          <section className="jigsaw-complete-screen">

            <p className="page-label">
              PUZZLE SANCTUARY
            </p>

            <h1>
              Puzzle Abandoned
            </h1>

            <p className="complete-description">
              Your current puzzle has been
              abandoned.
              <br />
              Your time was not saved.
            </p>

            <div className="abandoned-difficulty">

              Difficulty:{" "}

              <strong>
                {getDifficultyName()}
              </strong>

            </div>

            <div className="jigsaw-completion-buttons">

              <button
                className="jigsaw-play-button"
                onClick={() =>
                  newPuzzle()
                }
              >
                Try Again
              </button>

              <button
                className="jigsaw-main-menu-button"
                onClick={
                  returnToMainMenu
                }
              >
                Main Menu
              </button>

            </div>

          </section>
        )}

        {/* Completion Screen */}
        {gameComplete && (
          <section className="jigsaw-complete-screen">

            <p className="page-label">
              PUZZLE SANCTUARY
            </p>

            <h1>
              Puzzle Complete!
            </h1>

            <p className="complete-description">
              You successfully recreated
              the image.
            </p>

            <div className="completion-stats">

              <div className="completion-stat">

                <span className="completion-stat-label">
                  DIFFICULTY
                </span>

                <span className="completion-stat-value">
                  {getDifficultyName()}
                </span>

              </div>

              <div className="completion-stat">

                <span className="completion-stat-label">
                  CATEGORY
                </span>

                <span className="completion-stat-value">
                  {getCategoryName()}
                </span>

              </div>

              <div className="completion-stat">

                <span className="completion-stat-label">
                  TIME
                </span>

                <span className="completion-stat-value">
                  {timer}s
                </span>

              </div>

              <div className="completion-stat">

                <span className="completion-stat-label">
                  SCORE
                </span>

                <span className="completion-stat-value">
                  {score}
                </span>

              </div>

              <div className="completion-stat">

                <span className="completion-stat-label">
                  HIGH SCORE
                </span>

                <span className="completion-stat-value">
                  {getHighScore(
                    difficulty
                  )}
                </span>

              </div>

            </div>

            {score ===
              getHighScore(difficulty) &&
              score > 0 && (
                <p className="new-high-score">
                  New High Score!
                </p>
              )}

            <p className="completion-question">
              Would you like to play another
              puzzle or return to the main
              menu?
            </p>

            <div className="jigsaw-completion-buttons">

              <button
                className="jigsaw-play-button"
                onClick={() =>
                  newPuzzle()
                }
              >
                New Puzzle
              </button>

              <button
                className="jigsaw-main-menu-button"
                onClick={
                  returnToMainMenu
                }
              >
                Main Menu
              </button>

            </div>

          </section>
        )}

      </div>
    </main>
  );
}

export default Jigsaw;