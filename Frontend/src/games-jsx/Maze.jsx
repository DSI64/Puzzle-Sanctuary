import { useEffect, useRef, useState } from "react";
import "../games-css/Maze.css";

const MAZE_SIZES = {
  easy: 15,
  normal: 21,
  hard: 27,
  veryHard: 33,
};

const DIFFICULTY_LABELS = {
  easy: "Easy",
  normal: "Normal",
  hard: "Hard",
  veryHard: "Very Hard",
};

const DIFFICULTY_ORDER = ["easy", "normal", "hard", "veryHard"];
const REAL_VIEWPORT_SIZE = 9;
const TIME_ATTACK_START_TIME = 60;
const TIME_ATTACK_MAX_TIME = 60;

function shuffleArray(array) {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[i],
    ];
  }

  return shuffled;
}

/* Generate a maze using recursive backtracking. */
function generateMaze(size) {
  const maze = Array.from({ length: size }, () => Array(size).fill(1));
  const directions = [
    [-2, 0],
    [2, 0],
    [0, -2],
    [0, 2],
  ];

  const carvePath = (row, col) => {
    maze[row][col] = 0;

    for (const [rowChange, colChange] of shuffleArray(directions)) {
      const newRow = row + rowChange;
      const newCol = col + colChange;

      if (
        newRow > 0 &&
        newRow < size - 1 &&
        newCol > 0 &&
        newCol < size - 1 &&
        maze[newRow][newCol] === 1
      ) {
        maze[row + rowChange / 2][col + colChange / 2] = 0;
        carvePath(newRow, newCol);
      }
    }
  };

  carvePath(1, 1);
  return maze;
}

/* Find possible entrances around the outer edge. */
function getStartCandidates(maze) {
  const size = maze.length;
  const candidates = [];

  for (let col = 1; col < size - 1; col += 2) {
    if (maze[1][col] === 0) candidates.push({ row: 0, col });
    if (maze[size - 2][col] === 0) {
      candidates.push({ row: size - 1, col });
    }
  }

  for (let row = 1; row < size - 1; row += 2) {
    if (maze[row][1] === 0) candidates.push({ row, col: 0 });
    if (maze[row][size - 2] === 0) {
      candidates.push({ row, col: size - 1 });
    }
  }

  return candidates;
}

/* Find interior dead ends that can be used as the goal. */
function getGoalCandidates(maze) {
  const size = maze.length;
  const candidates = [];

  for (let row = 1; row < size - 1; row++) {
    for (let col = 1; col < size - 1; col++) {
      if (maze[row][col] !== 0) continue;

      let pathNeighbors = 0;
      if (maze[row - 1][col] === 0) pathNeighbors++;
      if (maze[row + 1][col] === 0) pathNeighbors++;
      if (maze[row][col - 1] === 0) pathNeighbors++;
      if (maze[row][col + 1] === 0) pathNeighbors++;

      if (pathNeighbors === 1) candidates.push({ row, col });
    }
  }

  return candidates;
}

/* Select a random entrance and interior goal. */
function chooseEndpoints(maze) {
  const startCandidates = getStartCandidates(maze);
  const goalCandidates = getGoalCandidates(maze);

  const start = startCandidates[
    Math.floor(Math.random() * startCandidates.length)
  ];
  const goal = goalCandidates[
    Math.floor(Math.random() * goalCandidates.length)
  ];

  return { start, goal };
}

/* Create a maze and open its randomized entrance. */
function createMaze(size) {
  const maze = generateMaze(size);
  const { start, goal } = chooseEndpoints(maze);
  maze[start.row][start.col] = 0;

  return { maze, start, goal };
}

/* Point the slime toward the inside of the maze at its entrance. */
function getInitialDirection(start, size) {
  if (start.row === 0) return "down";
  if (start.row === size - 1) return "up";
  if (start.col === 0) return "right";
  if (start.col === size - 1) return "left";
  return "right";
}

/*
 * TIME ATTACK DIFFICULTY
 * The player gets two mazes at each difficulty before moving up.
 */
function getTimeAttackDifficulty(completedMazes) {
  const progressionIndex = Math.min(
    Math.floor(completedMazes / 2),
    DIFFICULTY_ORDER.length - 1
  );

  return DIFFICULTY_ORDER[progressionIndex];
}

/*
 * TIME ATTACK VARIANTS
 * Normal is the common mode. Darkness and Real start rare and get
 * gradually more likely, up to a combined 25% chance.
 */
function chooseTimeAttackMode(completedMazes) {
  const specialModeChance = Math.min(
    0.05 + completedMazes * 0.015,
    0.25
  );

  if (Math.random() >= specialModeChance) return "normal";
  return Math.random() < 0.5 ? "darkness" : "real";
}

/* Award more bonus time for faster maze completions. */
function getTimeAttackBonus(elapsedSeconds) {
  return Math.max(2, 12 - Math.floor(elapsedSeconds / 5));
}

function Maze() {
  const [screen, setScreen] = useState("menu");
  const [difficulty, setDifficulty] = useState("normal");
  const [gameMode, setGameMode] = useState("normal");
  const [mazeData, setMazeData] = useState(() =>
    createMaze(MAZE_SIZES.normal)
  );
  const { maze, start, goal } = mazeData;

  const [player, setPlayer] = useState({
    row: start.row,
    col: start.col,
  });
  const [playerDirection, setPlayerDirection] = useState("right");
  const [gameStatus, setGameStatus] = useState("playing");

  // Classic mode's elapsed timer, reset for each new maze.
  const [time, setTime] = useState(0);

  // Time Attack run state. These values are not saved as high scores.
  const [timeAttackActive, setTimeAttackActive] = useState(false);
  const [timeAttackRemaining, setTimeAttackRemaining] = useState(
    TIME_ATTACK_START_TIME
  );
  const [mazesCompleted, setMazesCompleted] = useState(0);
  const [timeAttackLastReward, setTimeAttackLastReward] = useState("—");

  // Count Classic completions across the current page session.
  const [classicMazesCompleted, setClassicMazesCompleted] = useState(0);

  // Use a timestamp for accurate per-maze bonus calculations.
  const timeAttackMazeStartRef = useRef(Date.now());

  const isRealMode = gameMode === "real";

  /* ===================== MENU FUNCTIONS ===================== */

  const openClassicMenu = () => {
    setTimeAttackActive(false);
    setScreen("classic");
  };

  const openNormalDifficultyMenu = () => {
    setGameMode("normal");
    setScreen("difficulty");
  };

  const openDarknessDifficultyMenu = () => {
    setGameMode("darkness");
    setScreen("difficulty");
  };

  const openRealDifficultyMenu = () => {
    setGameMode("real");
    setScreen("realDifficulty");
  };

  const openTimeAttack = () => {
    setTimeAttackActive(false);
    setScreen("timeAttack");
  };

  const openHighScores = () => setScreen("highScores");
  const openHowToPlay = () => setScreen("howToPlay");

  /* ===================== CREATE A CLASSIC MAZE ===================== */

  const createNewMaze = (
    selectedDifficulty = difficulty,
    selectedMode = gameMode
  ) => {
    const mazeSize = MAZE_SIZES[selectedDifficulty];
    const newMazeData = createMaze(mazeSize);

    setTimeAttackActive(false);
    setDifficulty(selectedDifficulty);
    setGameMode(selectedMode);
    setMazeData(newMazeData);
    setPlayer({
      row: newMazeData.start.row,
      col: newMazeData.start.col,
    });
    setPlayerDirection(getInitialDirection(newMazeData.start, mazeSize));
    setGameStatus("playing");
    setTime(0);
    timeAttackMazeStartRef.current = Date.now();
    setScreen("playing");
  };

  /* ===================== START / RESET TIME ATTACK ===================== */

  const startTimeAttack = () => {
    const initialDifficulty = "easy";
    const initialMode = chooseTimeAttackMode(0);
    const initialMazeData = createMaze(MAZE_SIZES[initialDifficulty]);

    setDifficulty(initialDifficulty);
    setGameMode(initialMode);
    setMazeData(initialMazeData);
    setPlayer({
      row: initialMazeData.start.row,
      col: initialMazeData.start.col,
    });
    setPlayerDirection(
      getInitialDirection(
        initialMazeData.start,
        MAZE_SIZES[initialDifficulty]
      )
    );

    setTime(0);
    setTimeAttackRemaining(TIME_ATTACK_START_TIME);
    setMazesCompleted(0);
    setTimeAttackLastReward("—");
    timeAttackMazeStartRef.current = Date.now();

    setGameStatus("playing");
    setTimeAttackActive(true);
    setScreen("playing");
  };

  /* ===================== RETURN / NAVIGATION FUNCTIONS ===================== */

  const returnToMenu = () => {
    setTimeAttackActive(false);
    setScreen("menu");
    setGameStatus("playing");
    setTime(0);
  };

  const returnToClassicMenu = () => {
    setTimeAttackActive(false);
    setGameStatus("playing");
    setScreen("classic");
  };

  /* ===================== PAUSE / RESUME ===================== */

  const pauseGame = () => {
    if (screen === "playing" && gameStatus === "playing") {
      setGameStatus("paused");
    }
  };

  const resumeGame = () => {
    if (screen === "playing" && gameStatus === "paused") {
      setGameStatus("playing");
    }
  };

  /* ===================== PLAYER MOVEMENT ===================== */

  const movePlayer = (direction) => {
    if (
      screen !== "playing" ||
      gameStatus !== "playing" ||
      (timeAttackActive && timeAttackRemaining <= 0)
    ) {
      return;
    }

    let newRow = player.row;
    let newCol = player.col;

    if (direction === "up") newRow--;
    if (direction === "down") newRow++;
    if (direction === "left") newCol--;
    if (direction === "right") newCol++;

    // Stop movement outside the board.
    if (
      newRow < 0 ||
      newRow >= maze.length ||
      newCol < 0 ||
      newCol >= maze[0].length
    ) {
      return;
    }

    // Stop movement through walls.
    if (maze[newRow][newCol] === 1) return;

    setPlayer({ row: newRow, col: newCol });
    setPlayerDirection(direction);

    // Check for the exit.
    if (newRow === goal.row && newCol === goal.col) {
      if (!timeAttackActive) {
        // Count each Classic completion and show its completion prompt.
        setClassicMazesCompleted((completed) => completed + 1);
        setGameStatus("won");
        return;
      }

      // Calculate how long this individual Time Attack maze took.
      const elapsedSeconds = Math.floor(
        (Date.now() - timeAttackMazeStartRef.current) / 1000
      );
      const nextCompletedCount = mazesCompleted + 1;
      const nextDifficulty = getTimeAttackDifficulty(nextCompletedCount);
      const nextMode = chooseTimeAttackMode(nextCompletedCount);
      const nextMazeSize = MAZE_SIZES[nextDifficulty];
      const nextMazeData = createMaze(nextMazeSize);

      if (gameMode === "darkness" || gameMode === "real") {
        // Special variants refill the timer instead of awarding a bonus.
        setTimeAttackRemaining(TIME_ATTACK_MAX_TIME);
        setTimeAttackLastReward("Reset to 60s");
      } else {
        // Normal mazes award time based on completion speed, capped at 60.
        const bonusTime = getTimeAttackBonus(elapsedSeconds);
        setTimeAttackRemaining((remaining) =>
          Math.min(TIME_ATTACK_MAX_TIME, remaining + bonusTime)
        );
        setTimeAttackLastReward(`+${bonusTime}s`);
      }

      setMazesCompleted(nextCompletedCount);

      // Immediately place the player at the next maze's entrance.
      setDifficulty(nextDifficulty);
      setGameMode(nextMode);
      setMazeData(nextMazeData);
      setPlayer({
        row: nextMazeData.start.row,
        col: nextMazeData.start.col,
      });
      setPlayerDirection(getInitialDirection(nextMazeData.start, nextMazeSize));
      setTime(0);
      timeAttackMazeStartRef.current = Date.now();
    }
  };

  /* ===================== CLASSIC ELAPSED TIMER ===================== */

  useEffect(() => {
    if (screen !== "playing" || gameStatus !== "playing") {
      return undefined;
    }

    const timer = setInterval(() => {
      setTime((currentTime) => currentTime + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [screen, gameStatus, mazeData]);

  /* ===================== TIME ATTACK COUNTDOWN ===================== */

  useEffect(() => {
    if (
      screen !== "playing" ||
      !timeAttackActive ||
      gameStatus !== "playing"
    ) {
      return undefined;
    }

    if (timeAttackRemaining <= 0) {
      setGameStatus("timeUp");
      return undefined;
    }

    const countdown = setTimeout(() => {
      setTimeAttackRemaining((remaining) => Math.max(0, remaining - 1));
    }, 1000);

    return () => clearTimeout(countdown);
  }, [screen, timeAttackActive, gameStatus, timeAttackRemaining]);

  /* ===================== KEYBOARD CONTROLS ===================== */

  useEffect(() => {
    if (screen !== "playing" || gameStatus !== "playing") {
      return undefined;
    }

    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();
      const movementKeys = [
        "arrowup",
        "arrowdown",
        "arrowleft",
        "arrowright",
        "w",
        "a",
        "s",
        "d",
      ];

      if (movementKeys.includes(key)) event.preventDefault();

      if (key === "arrowup" || key === "w") {
        movePlayer("up");
      } else if (key === "arrowdown" || key === "s") {
        movePlayer("down");
      } else if (key === "arrowleft" || key === "a") {
        movePlayer("left");
      } else if (key === "arrowright" || key === "d") {
        movePlayer("right");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    screen,
    gameStatus,
    player,
    maze,
    goal,
    timeAttackActive,
    timeAttackRemaining,
    time,
    mazesCompleted,
  ]);

  /* ===================== REAL MODE CAMERA ===================== */

  const viewportSize = isRealMode ? REAL_VIEWPORT_SIZE : maze.length;
  let viewportStartRow = 0;
  let viewportStartCol = 0;

  if (isRealMode) {
    const cameraRadius = Math.floor(REAL_VIEWPORT_SIZE / 2);

    viewportStartRow = Math.max(
      0,
      Math.min(player.row - cameraRadius, maze.length - REAL_VIEWPORT_SIZE)
    );
    viewportStartCol = Math.max(
      0,
      Math.min(player.col - cameraRadius, maze[0].length - REAL_VIEWPORT_SIZE)
    );
  }

  const visibleMaze = isRealMode
    ? maze
      .slice(viewportStartRow, viewportStartRow + REAL_VIEWPORT_SIZE)
      .map((row) =>
        row.slice(viewportStartCol, viewportStartCol + REAL_VIEWPORT_SIZE)
      )
    : maze;

  const modeLabel =
    gameMode === "real"
      ? "REAL"
      : gameMode === "darkness"
        ? "DARKNESS"
        : "NORMAL";

  /* ===================== RENDER SCREENS ===================== */

  return (
    <main className="maze-page">
      <section className="maze-game">
        {/* MAIN MENU */}
        {screen === "menu" && (
          <>
            <header className="maze-header">
              <p className="page-label">PUZZLE SANCTUARY</p>
              <h1>Maze</h1>
              <p>Find your way through the maze.</p>
            </header>

            <section className="maze-menu">
              <button className="maze-menu-button" onClick={openClassicMenu}>
                <span className="maze-menu-title">Classic</span>
                <span className="maze-menu-description">
                  Play the traditional maze.
                </span>
              </button>

              <button className="maze-menu-button" onClick={openTimeAttack}>
                <span className="maze-menu-title">Time Attack</span>
                <span className="maze-menu-description">
                  Clear as many mazes as possible.
                </span>
              </button>

              <button className="maze-menu-button" onClick={openHighScores}>
                <span className="maze-menu-title">High Scores</span>
                <span className="maze-menu-description">
                  View your best Time Attack runs.
                </span>
              </button>

              <button className="maze-menu-button" onClick={openHowToPlay}>
                <span className="maze-menu-title">How to Play</span>
                <span className="maze-menu-description">
                  Learn how the maze works.
                </span>
              </button>
            </section>
          </>
        )}

        {/* CLASSIC MODE SELECTION */}
        {screen === "classic" && (
          <>
            <header className="maze-header">
              <p className="page-label">CLASSIC</p>
              <h1>Choose Your Maze</h1>
              <p>Select a Classic maze mode.</p>
            </header>

            <section className="maze-menu">
              <button className="maze-menu-button" onClick={openNormalDifficultyMenu}>
                <span className="maze-menu-title">Normal</span>
                <span className="maze-menu-description">
                  Find your way from the entrance to the exit.
                </span>
              </button>

              <button className="maze-menu-button" onClick={openDarknessDifficultyMenu}>
                <span className="maze-menu-title">Darkness</span>
                <span className="maze-menu-description">
                  Only the area around the slime is visible.
                </span>
              </button>

              <button className="maze-menu-button" onClick={openRealDifficultyMenu}>
                <span className="maze-menu-title">Real</span>
                <span className="maze-menu-description">
                  Navigate with a close-up view around the slime.
                </span>
              </button>
            </section>

            <button className="maze-back-button" onClick={returnToMenu}>
              ← Back to Menu
            </button>
          </>
        )}

        {/* NORMAL AND DARKNESS DIFFICULTY */}
        {screen === "difficulty" && (
          <>
            <header className="maze-header">
              <p className="page-label">CLASSIC • {gameMode.toUpperCase()}</p>
              <h1>Choose Difficulty</h1>
              <p>Choose how large you want your maze to be.</p>
            </header>

            <section className="maze-menu">
              {Object.entries(MAZE_SIZES).map(([level, size]) => (
                <button
                  key={level}
                  className="maze-menu-button"
                  onClick={() => createNewMaze(level, gameMode)}
                >
                  <span className="maze-menu-title">
                    {DIFFICULTY_LABELS[level]}
                  </span>
                  <span className="maze-menu-description">
                    {size} × {size} maze
                  </span>
                </button>
              ))}
            </section>

            <button className="maze-back-button" onClick={returnToClassicMenu}>
              ← Back to Classic
            </button>
          </>
        )}

        {/* REAL MODE DIFFICULTY */}
        {screen === "realDifficulty" && (
          <>
            <header className="maze-header">
              <p className="page-label">CLASSIC • REAL</p>
              <h1>Choose Difficulty</h1>
              <p>The maze follows the slime as you move.</p>
            </header>

            <section className="maze-menu">
              {Object.entries(MAZE_SIZES).map(([level, size]) => (
                <button
                  key={level}
                  className="maze-menu-button"
                  onClick={() => createNewMaze(level, "real")}
                >
                  <span className="maze-menu-title">
                    {DIFFICULTY_LABELS[level]}
                  </span>
                  <span className="maze-menu-description">
                    {size} × {size} maze
                  </span>
                </button>
              ))}
            </section>

            <button className="maze-back-button" onClick={returnToClassicMenu}>
              ← Back to Classic
            </button>
          </>
        )}

        {/* TIME ATTACK INTRODUCTION */}
        {screen === "timeAttack" && (
          <>
            <header className="maze-header">
              <p className="page-label">TIME ATTACK</p>
              <h1>Time Attack</h1>
              <p>
                See how many mazes you can complete before time runs out.
              </p>
            </header>

            <section className="maze-coming-soon maze-time-attack-intro">
              <div className="maze-coming-icon">⏱</div>
              <h2>Rules</h2>
              <p>
                Start with 60 seconds and clear as many mazes as possible.
              </p>
              <p>
                Finish quickly to earn bonus time. Mazes get larger as you
                progress. Watch out for Darkness and Real mazes!
              </p>
              <button
                className="maze-play-again-button"
                type="button"
                onClick={startTimeAttack}
              >
                Start Time Attack
              </button>
            </section>

            <button className="maze-back-button" onClick={returnToMenu}>
              ← Back to Menu
            </button>
          </>
        )}

        {/* HIGH SCORES: INTENTIONALLY A PLACEHOLDER UNTIL ACCOUNTS EXIST */}
        {screen === "highScores" && (
          <>
            <header className="maze-header">
              <p className="page-label">HIGH SCORES</p>
              <h1>High Scores</h1>
              <p>Track your best Time Attack runs.</p>
            </header>

            <section className="maze-coming-soon">
              <div className="maze-coming-icon">★</div>
              <h2>Coming Soon</h2>
              <p>High scores will be added later.</p>
              <p>Your best Time Attack runs will be saved here.</p>
            </section>

            <button className="maze-back-button" onClick={returnToMenu}>
              ← Back to Menu
            </button>
          </>
        )}

        {/* HOW TO PLAY */}
        {screen === "howToPlay" && (
          <>
            <header className="maze-header">
              <p className="page-label">HOW TO PLAY</p>
              <h1>Maze</h1>
              <p>Find the exit while avoiding the walls.</p>
            </header>

            <section className="maze-how-to-play">
              <div className="maze-how-to-card">
                <h2>Movement</h2>
                <p>
                  Use the <strong>Arrow Keys</strong> or <strong>WASD</strong>
                  to move the slime.
                </p>
              </div>
              <div className="maze-how-to-card">
                <h2>Goal</h2>
                <p>
                  Start at the entrance and reach the <strong>★</strong> to
                  complete the maze.
                </p>
              </div>
              <div className="maze-how-to-card">
                <h2>Darkness</h2>
                <p>
                  Only the area around the slime is visible. Explore to find
                  the exit.
                </p>
              </div>
              <div className="maze-how-to-card">
                <h2>Real</h2>
                <p>
                  Uses a close-up camera that follows the slime through the
                  maze.
                </p>
              </div>
            </section>

            <button className="maze-back-button" onClick={returnToMenu}>
              ← Back to Menu
            </button>
          </>
        )}

        {/* GAMEPLAY */}
        {screen === "playing" && (
          <>
            <header className="maze-header">
              <p className="page-label">
                {timeAttackActive
                  ? `TIME ATTACK • ${mazesCompleted} COMPLETED • ${modeLabel} • ${DIFFICULTY_LABELS[difficulty].toUpperCase()}`
                  : `CLASSIC • ${modeLabel} • ${DIFFICULTY_LABELS[difficulty].toUpperCase()}`}
              </p>
              <h1>Maze</h1>
              <p>
                {timeAttackActive
                  ? "Find the exit quickly to earn bonus time."
                  : isRealMode
                    ? "Stay close to the slime and find the exit."
                    : gameMode === "darkness"
                      ? "Explore the darkness and find the hidden exit."
                      : "Find your way from the entrance to the exit."}
              </p>
            </header>

            <div
              className={`maze-info ${timeAttackActive ? "maze-info-time-attack" : ""}`}
            >
              <div
                className={`maze-stat ${timeAttackActive && timeAttackRemaining <= 10 ? "maze-stat-low-time" : ""}`}
              >
                <span>{timeAttackActive ? "Time Remaining" : "Time"}</span>
                <strong>
                  {timeAttackActive ? timeAttackRemaining : time}s
                </strong>
              </div>

              <div className="maze-stat">
                <span>Mazes Done</span>
                <strong>
                  {timeAttackActive ? mazesCompleted : classicMazesCompleted}
                </strong>
              </div>

              {timeAttackActive && (
                <div className="maze-stat">
                  <span>Time Gained</span>
                  <strong>{timeAttackLastReward}</strong>
                </div>
              )}

              {gameStatus === "playing" && (
                <button
                  type="button"
                  className="maze-pause-button"
                  onClick={pauseGame}
                  aria-label="Pause maze game"
                >
                  Ⅱ Pause
                </button>
              )}
            </div>

            <section className="maze-board-section">
              <div className="maze-board-wrap">
                <div
                  className={`maze-board maze-board-size-${maze.length} ${isRealMode ? "maze-board-real" : ""
                    } ${gameStatus === "won" ? "maze-board-won" : ""}`}
                  style={{
                    gridTemplateColumns: `repeat(${viewportSize}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${viewportSize}, minmax(0, 1fr))`,
                  }}
                >
                  {visibleMaze.map((row, rowIndex) =>
                    row.map((cell, colIndex) => {
                      const actualRow = rowIndex + viewportStartRow;
                      const actualCol = colIndex + viewportStartCol;
                      const isPlayer =
                        player.row === actualRow && player.col === actualCol;
                      const isStart =
                        start.row === actualRow && start.col === actualCol;
                      const isGoal =
                        goal.row === actualRow && goal.col === actualCol;
                      const isHidden =
                        gameMode === "darkness" &&
                        gameStatus !== "won" &&
                        gameStatus !== "timeUp" &&
                        (Math.abs(actualRow - player.row) > 2 ||
                          Math.abs(actualCol - player.col) > 2);

                      return (
                        <div
                          key={`${actualRow}-${actualCol}`}
                          className={`maze-cell ${cell === 1 ? "maze-wall" : "maze-path"
                            } ${isHidden ? "maze-cell-hidden" : ""}`}
                        >
                          {isPlayer && (
                            <div
                              className={`maze-player maze-player-${playerDirection} ${gameStatus === "won" ? "maze-player-won" : ""
                                }`}
                            >
                              ●
                            </div>
                          )}
                          {isGoal && !isPlayer && !isHidden && (
                            <div className="maze-goal">★</div>
                          )}
                          {isStart && !isPlayer && !isHidden && (
                            <div className="maze-start">START</div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/*
                  Completion prompts overlay the maze board itself.
                  The board and original slime styling remain visible underneath.
                */}
                {gameStatus === "won" && !timeAttackActive && (
                  <div
                    className="maze-board-overlay"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="maze-classic-overlay-title"
                  >
                    <section className="maze-complete maze-overlay-card">
                      <p className="maze-complete-label">MAZE COMPLETE!</p>
                      <h2 id="maze-classic-overlay-title">You made it!</h2>
                      <p>
                        You reached the exit in <strong>{time} seconds</strong>.
                      </p>
                      <p>
                        Total Classic mazes completed: <strong>{classicMazesCompleted}</strong>
                      </p>
                      <h3>Would you like to play another maze?</h3>
                      <div className="maze-complete-actions">
                        <button
                          className="maze-play-again-button"
                          onClick={() => createNewMaze(difficulty, gameMode)}
                        >
                          Play Again
                        </button>
                        <button
                          className="maze-menu-small-button"
                          onClick={returnToClassicMenu}
                        >
                          Choose Another Maze
                        </button>
                        <button
                          className="maze-menu-small-button"
                          onClick={returnToMenu}
                        >
                          Main Menu
                        </button>
                      </div>
                    </section>
                  </div>
                )}

                {gameStatus === "timeUp" && (
                  <div
                    className="maze-board-overlay"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="maze-time-attack-overlay-title"
                  >
                    <section className="maze-complete maze-overlay-card">
                      <p className="maze-complete-label">TIME'S UP!</p>
                      <h2 id="maze-time-attack-overlay-title">Run Complete!</h2>
                      <p>
                        You cleared <strong>{mazesCompleted} {mazesCompleted === 1 ? "maze" : "mazes"}</strong>.
                      </p>
                      <p>
                        You reached <strong>{DIFFICULTY_LABELS[difficulty]}</strong> difficulty.
                      </p>
                      <div className="maze-complete-actions">
                        <button
                          className="maze-play-again-button"
                          onClick={startTimeAttack}
                        >
                          Play Again
                        </button>
                        <button
                          className="maze-menu-small-button"
                          onClick={returnToMenu}
                        >
                          Main Menu
                        </button>
                      </div>
                    </section>
                  </div>
                )}

                {gameStatus === "paused" && (
                  <div
                    className="maze-board-overlay maze-pause-overlay"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="maze-pause-overlay-title"
                  >
                    <section className="maze-complete maze-overlay-card maze-pause-card">
                      <h2 id="maze-pause-overlay-title">Game Paused</h2>
                      <p>Your timer has been paused.</p>
                      <div className="maze-complete-actions">
                        <button
                          type="button"
                          className="maze-play-again-button"
                          onClick={resumeGame}
                        >
                          Resume
                        </button>
                        <button
                          type="button"
                          className="maze-menu-small-button"
                          onClick={returnToMenu}
                        >
                          Main Menu
                        </button>
                      </div>
                    </section>
                  </div>
                )}
              </div>

              <p className="maze-instructions maze-pc-instructions">
                Use <strong>Arrow Keys</strong> or <strong>WASD</strong> to move.
              </p>
              <p className="maze-instructions maze-mobile-instructions">
                Use the buttons below to move.
              </p>

              {/* Mobile movement controls */}
              <div className="maze-controls">
                <button type="button" aria-label="Move up" onClick={() => movePlayer("up")}>
                  ▲
                </button>
                <div className="maze-horizontal-controls">
                  <button type="button" aria-label="Move left" onClick={() => movePlayer("left")}>
                    ◀
                  </button>
                  <button type="button" aria-label="Move down" onClick={() => movePlayer("down")}>
                    ▼
                  </button>
                  <button type="button" aria-label="Move right" onClick={() => movePlayer("right")}>
                    ▶
                  </button>
                </div>
              </div>
            </section>

          </>
        )}
      </section>
    </main>
  );
}

export default Maze;