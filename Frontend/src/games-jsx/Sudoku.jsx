import { useCallback, useEffect, useState } from "react";
import "../games-css/Sudoku.css";

// ---------- Sudoku generation ----------

function shuffle(numbers) {
    const result = [...numbers];

    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}

function findEmptyCell(board) {
    return board.indexOf(0);
}

function canPlace(board, index, number) {
    const row = Math.floor(index / 9);
    const col = index % 9;

    for (let i = 0; i < 9; i++) {
        if (board[row * 9 + i] === number) return false;
        if (board[i * 9 + col] === number) return false;
    }

    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;

    for (let r = boxRow; r < boxRow + 3; r++) {
        for (let c = boxCol; c < boxCol + 3; c++) {
            if (board[r * 9 + c] === number) return false;
        }
    }

    return true;
}

function solveBoard(board, randomize = false) {
    const index = findEmptyCell(board);

    if (index === -1) return true;

    const numbers = randomize
        ? shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])
        : [1, 2, 3, 4, 5, 6, 7, 8, 9];

    for (const number of numbers) {
        if (canPlace(board, index, number)) {
            board[index] = number;

            if (solveBoard(board, randomize)) return true;

            board[index] = 0;
        }
    }

    return false;
}

function countSolutions(board) {
    const index = findEmptyCell(board);

    if (index === -1) return 1;

    let count = 0;

    for (let number = 1; number <= 9; number++) {
        if (canPlace(board, index, number)) {
            board[index] = number;
            count += countSolutions(board);
            board[index] = 0;

            if (count > 1) return count;
        }
    }

    return count;
}

function createPuzzle() {
    const solution = Array(81).fill(0);
    solveBoard(solution, true);

    const puzzle = [...solution];
    const cells = shuffle(Array.from({ length: 81 }, (_, i) => i));
    const targetClues = 40;
    let clues = 81;

    for (const index of cells) {
        if (clues <= targetClues) break;

        const savedNumber = puzzle[index];
        puzzle[index] = 0;

        if (countSolutions([...puzzle]) === 1) {
            clues--;
        } else {
            puzzle[index] = savedNumber;
        }
    }

    return { puzzle, solution };
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
        remainingSeconds
    ).padStart(2, "0")}`;
}

function readBestTime() {
    try {
        const saved = localStorage.getItem("sudokuBestTime");

        if (saved === null) return null;

        const parsed = Number(saved);
        return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
    } catch {
        return null;
    }
}

// ---------- Sudoku game ----------

function Sudoku() {
    const [screen, setScreen] = useState("menu");
    const [game, setGame] = useState(null);
    const [grid, setGrid] = useState([]);
    const [selectedCell, setSelectedCell] = useState(null);
    const [elapsed, setElapsed] = useState(0);
    const [won, setWon] = useState(false);
    const [paused, setPaused] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [showNewPuzzleConfirm, setShowNewPuzzleConfirm] =
        useState(false);
    const [bestTime, setBestTime] = useState(readBestTime);

    const startNewGame = useCallback(() => {
        const nextGame = createPuzzle();

        setGame(nextGame);
        setGrid([...nextGame.puzzle]);
        setSelectedCell(null);
        setElapsed(0);
        setWon(false);
        setPaused(false);
        setShowHelp(false);
        setShowNewPuzzleConfirm(false);
        setScreen("playing");
    }, []);

    // The timer stops while paused or while help is open.
    useEffect(() => {
        if (
            screen !== "playing" ||
            paused ||
            won ||
            showHelp
        ) {
            return undefined;
        }

        const timer = setInterval(() => {
            setElapsed((time) => time + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [screen, paused, won, showHelp]);

    const enterNumber = useCallback(
        (number) => {
            if (
                screen !== "playing" ||
                paused ||
                showHelp ||
                showNewPuzzleConfirm ||
                won ||
                selectedCell === null ||
                !game
            ) {
                return;
            }

            // Original puzzle clues cannot be changed.
            if (game.puzzle[selectedCell] !== 0) return;

            const nextGrid = [...grid];
            nextGrid[selectedCell] = number;
            setGrid(nextGrid);

            const completed = nextGrid.every(
                (value, index) => value === game.solution[index]
            );

            if (completed) {
                setWon(true);

                if (bestTime === null || elapsed < bestTime) {
                    setBestTime(elapsed);

                    try {
                        localStorage.setItem(
                            "sudokuBestTime",
                            String(elapsed)
                        );
                    } catch {
                        // The game can still be played if browser storage is unavailable.
                    }
                }
            }
        },
        [
            screen,
            paused,
            showHelp,
            showNewPuzzleConfirm,
            won,
            selectedCell,
            game,
            grid,
            bestTime,
            elapsed,
        ]
    );

    const eraseCell = useCallback(() => {
        if (
            screen !== "playing" ||
            paused ||
            showHelp ||
            showNewPuzzleConfirm ||
            won ||
            selectedCell === null ||
            !game
        ) {
            return;
        }

        if (game.puzzle[selectedCell] !== 0) return;

        const nextGrid = [...grid];
        nextGrid[selectedCell] = 0;
        setGrid(nextGrid);
    }, [
        screen,
        paused,
        showHelp,
        showNewPuzzleConfirm,
        won,
        selectedCell,
        game,
        grid,
    ]);

    // Keyboard number entry, deletion, and arrow-key navigation.
    useEffect(() => {
        if (
            screen !== "playing" ||
            paused ||
            showHelp ||
            showNewPuzzleConfirm ||
            won
        ) {
            return undefined;
        }

        function handleKeyDown(event) {
            if (/^[1-9]$/.test(event.key)) {
                event.preventDefault();
                enterNumber(Number(event.key));
                return;
            }

            if (event.key === "Backspace" || event.key === "Delete") {
                event.preventDefault();
                eraseCell();
                return;
            }

            const moves = {
                ArrowUp: -9,
                ArrowDown: 9,
                ArrowLeft: -1,
                ArrowRight: 1,
            };

            if (moves[event.key] !== undefined) {
                event.preventDefault();

                setSelectedCell((current) => {
                    if (current === null) return 40;

                    const row = Math.floor(current / 9);
                    const col = current % 9;

                    if (event.key === "ArrowUp") {
                        return row > 0 ? current - 9 : current;
                    }

                    if (event.key === "ArrowDown") {
                        return row < 8 ? current + 9 : current;
                    }

                    if (event.key === "ArrowLeft") {
                        return col > 0 ? current - 1 : current;
                    }

                    return col < 8 ? current + 1 : current;
                });
            }
        }

        window.addEventListener("keydown", handleKeyDown);

        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [
        screen,
        paused,
        showHelp,
        showNewPuzzleConfirm,
        won,
        enterNumber,
        eraseCell,
    ]);

    const returnToMenu = () => {
        setPaused(false);
        setShowHelp(false);
        setShowNewPuzzleConfirm(false);
        setScreen("menu");
    };

    const selectedNumber =
        selectedCell === null ? 0 : grid[selectedCell];

    return (
        <main className="sudoku-page">
            {/* Main menu */}
            {screen === "menu" && (
                <section className="sudoku-title-screen">
                    <p className="sudoku-eyebrow">PUZZLE SANCTUARY</p>

                    <div className="sudoku-logo-box">
                        <div
                            className="sudoku-title-symbol"
                            role="img"
                            aria-label="Sudoku logo"
                        >
                            {["S", "U", "D", "O", "K", "U", "", "", ""].map(
                                (letter, index) => (
                                    <span key={index}>{letter}</span>
                                )
                            )}
                        </div>
                    </div>

                    <h1>Sudoku</h1>

                    <p className="sudoku-title-description">
                        Fill the grid, find your rhythm, and beat your best time.
                    </p>

                    <div className="sudoku-menu-buttons">
                        <button
                            type="button"
                            className="sudoku-primary-button sudoku-menu-button"
                            onClick={startNewGame}
                        >
                            Play
                        </button>

                        <button
                            type="button"
                            className="sudoku-secondary-button sudoku-menu-button"
                            onClick={() => {
                                setBestTime(readBestTime());
                                setScreen("highScores");
                            }}
                        >
                            High Scores
                        </button>
                    </div>

                    <p className="sudoku-menu-record">
                        Personal Best:{" "}
                        <strong>
                            {bestTime === null
                                ? "--:--"
                                : formatTime(bestTime)}
                        </strong>
                    </p>
                </section>
            )}

            {/* High scores */}
            {screen === "highScores" && (
                <section className="sudoku-high-scores">
                    <p className="sudoku-eyebrow">PUZZLE SANCTUARY</p>

                    <h1>High Scores</h1>

                    <p className="sudoku-title-description">
                        Your fastest successful Sudoku completion.
                    </p>

                    <div className="sudoku-record-card">
                        <span
                            className="sudoku-record-icon"
                            aria-hidden="true"
                        >
                            ★
                        </span>

                        <span className="sudoku-record-label">
                            PERSONAL BEST
                        </span>

                        <strong className="sudoku-record-time">
                            {bestTime === null
                                ? "--:--"
                                : formatTime(bestTime)}
                        </strong>

                        <p>
                            {bestTime === null
                                ? "Complete a Sudoku puzzle to set your first record."
                                : "Keep playing and see if you can beat your record!"}
                        </p>
                    </div>

                    <button
                        type="button"
                        className="sudoku-primary-button sudoku-menu-button"
                        onClick={returnToMenu}
                    >
                        Back to Menu
                    </button>
                </section>
            )}

            {/* Gameplay */}
            {screen === "playing" && game && (
                <>
                    <header className="sudoku-header">
                        <p className="sudoku-eyebrow">PUZZLE SANCTUARY</p>

                        <h1>Sudoku</h1>

                        <p>
                            Fill every row, column, and 3×3 box with numbers 1–9.
                        </p>
                    </header>

                    <section className="sudoku-game">
                        <div className="sudoku-toolbar">
                            <div className="sudoku-timer">
                                <span>TIME</span>
                                <strong>{formatTime(elapsed)}</strong>
                            </div>

                            <div className="sudoku-best-time">
                                <span>PERSONAL BEST</span>
                                <strong>
                                    {bestTime === null
                                        ? "--:--"
                                        : formatTime(bestTime)}
                                </strong>
                            </div>

                            <button
                                type="button"
                                className="sudoku-secondary-button sudoku-pause-button"
                                onClick={() => setPaused(true)}
                                disabled={won || showHelp}
                            >
                                Pause
                            </button>
                        </div>

                        <div className="sudoku-board-wrap">
                            <div
                                className="sudoku-board"
                                role="group"
                                aria-label="Sudoku board"
                            >
                                {grid.map((value, index) => {
                                    const row = Math.floor(index / 9);
                                    const col = index % 9;
                                    const isFixed = game.puzzle[index] !== 0;
                                    const isSelected = selectedCell === index;

                                    const isSameNumber =
                                        selectedNumber !== 0 &&
                                        value === selectedNumber;

                                    const isRelated =
                                        selectedCell !== null &&
                                        (
                                            Math.floor(selectedCell / 9) === row ||
                                            selectedCell % 9 === col ||
                                            (
                                                Math.floor(
                                                    Math.floor(selectedCell / 9) / 3
                                                ) === Math.floor(row / 3) &&
                                                Math.floor(
                                                    (selectedCell % 9) / 3
                                                ) === Math.floor(col / 3)
                                            )
                                        );

                                    const isIncorrect =
                                        value !== 0 &&
                                        value !== game.solution[index];

                                    // Check for a duplicate in this cell's row.
                                    const hasRowConflict =
                                        value !== 0 &&
                                        grid.some(
                                            (otherValue, otherIndex) =>
                                                otherIndex !== index &&
                                                Math.floor(otherIndex / 9) === row &&
                                                otherValue === value
                                        );

                                    // Check for a duplicate in this cell's column.
                                    const hasColumnConflict =
                                        value !== 0 &&
                                        grid.some(
                                            (otherValue, otherIndex) =>
                                                otherIndex !== index &&
                                                otherIndex % 9 === col &&
                                                otherValue === value
                                        );

                                    // Check for a duplicate in this cell's 3×3 box.
                                    const boxRow = Math.floor(row / 3) * 3;
                                    const boxCol = Math.floor(col / 3) * 3;

                                    const hasBoxConflict =
                                        value !== 0 &&
                                        grid.some((otherValue, otherIndex) => {
                                            if (
                                                otherIndex === index ||
                                                otherValue !== value
                                            ) {
                                                return false;
                                            }

                                            const otherRow = Math.floor(otherIndex / 9);
                                            const otherCol = otherIndex % 9;

                                            return (
                                                Math.floor(otherRow / 3) * 3 === boxRow &&
                                                Math.floor(otherCol / 3) * 3 === boxCol
                                            );
                                        });

                                    const hasConflict =
                                        hasRowConflict ||
                                        hasColumnConflict ||
                                        hasBoxConflict;

                                    const classNames = [
                                        "sudoku-cell",
                                        isFixed ? "fixed" : "editable",
                                        isSelected ? "selected" : "",
                                        isSameNumber ? "same-number" : "",
                                        isRelated ? "related" : "",
                                        isIncorrect ? "incorrect" : "",
                                        hasConflict ? "conflict" : "",
                                        col === 2 || col === 5
                                            ? "box-right"
                                            : "",
                                        row === 2 || row === 5
                                            ? "box-bottom"
                                            : "",
                                    ]
                                        .filter(Boolean)
                                        .join(" ");

                                    return (
                                        <button
                                            key={index}
                                            type="button"
                                            className={classNames}
                                            onClick={() => setSelectedCell(index)}
                                            aria-label={`Row ${row + 1}, column ${col + 1}${value
                                                ? `, ${value}`
                                                : ", empty"
                                                }`}
                                            aria-pressed={isSelected}
                                            disabled={
                                                paused ||
                                                won ||
                                                showHelp ||
                                                showNewPuzzleConfirm
                                            }
                                        >
                                            {value || ""}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Pause menu and New Puzzle confirmation */}
                            {paused && (
                                <div className="sudoku-overlay">
                                    <div className="sudoku-overlay-card">
                                        {!showNewPuzzleConfirm ? (
                                            <>
                                                <h2>Game Paused</h2>

                                                <p>
                                                    Your timer is paused. Take a breather!
                                                </p>

                                                <button
                                                    type="button"
                                                    className="sudoku-primary-button"
                                                    onClick={() => setPaused(false)}
                                                >
                                                    Resume
                                                </button>

                                                <button
                                                    type="button"
                                                    className="sudoku-secondary-button"
                                                    onClick={() =>
                                                        setShowNewPuzzleConfirm(true)
                                                    }
                                                >
                                                    New Puzzle
                                                </button>

                                                <button
                                                    type="button"
                                                    className="sudoku-secondary-button"
                                                    onClick={returnToMenu}
                                                >
                                                    Main Menu
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <h2>New Puzzle?</h2>

                                                <p>
                                                    Are you sure you want to start a
                                                    new puzzle? Your current progress
                                                    will be lost.
                                                </p>

                                                <button
                                                    type="button"
                                                    className="sudoku-primary-button"
                                                    onClick={startNewGame}
                                                >
                                                    Confirm
                                                </button>

                                                <button
                                                    type="button"
                                                    className="sudoku-secondary-button"
                                                    onClick={() =>
                                                        setShowNewPuzzleConfirm(false)
                                                    }
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Help overlay */}
                            {showHelp && (
                                <div
                                    className="sudoku-overlay"
                                    role="dialog"
                                    aria-modal="true"
                                    aria-labelledby="sudoku-help-title"
                                >
                                    <div className="sudoku-overlay-card">
                                        <h2 id="sudoku-help-title">
                                            How to Play Sudoku
                                        </h2>

                                        <p>
                                            Fill the 9×9 grid with numbers
                                            1 through 9.
                                        </p>

                                        <p>
                                            Every row, every column, and each
                                            3×3 box must contain the numbers
                                            1 through 9 exactly once.
                                        </p>

                                        <p>
                                            The original clues cannot be
                                            changed. Fill the empty cells
                                            without repeating a number in
                                            any row, column, or 3×3 box.
                                        </p>

                                        <p>
                                            Select an empty cell and choose
                                            a number from the number pad,
                                            or press a number key on your
                                            keyboard. Use the arrow keys to
                                            move between cells and Backspace
                                            or Delete to erase an entry.
                                        </p>

                                        <button
                                            type="button"
                                            className="sudoku-primary-button"
                                            onClick={() => setShowHelp(false)}
                                            autoFocus
                                        >
                                            Back to Puzzle
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Puzzle completion overlay */}
                            {won && (
                                <div className="sudoku-overlay">
                                    <div className="sudoku-overlay-card">
                                        <span
                                            className="sudoku-win-icon"
                                            aria-hidden="true"
                                        >
                                            ✦
                                        </span>

                                        <h2>Puzzle Solved!</h2>

                                        <p>
                                            You completed Sudoku in{" "}
                                            {formatTime(elapsed)}.
                                        </p>

                                        {bestTime === elapsed && (
                                            <p className="sudoku-new-record">
                                                Personal Best!
                                            </p>
                                        )}

                                        <button
                                            type="button"
                                            className="sudoku-primary-button"
                                            onClick={startNewGame}
                                        >
                                            Play Again
                                        </button>

                                        <button
                                            type="button"
                                            className="sudoku-secondary-button"
                                            onClick={returnToMenu}
                                        >
                                            Main Menu
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Number pad */}
                        <div
                            className="sudoku-number-pad"
                            aria-label="Number pad"
                        >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
                                <button
                                    key={number}
                                    type="button"
                                    className={
                                        selectedNumber === number
                                            ? "sudoku-number active"
                                            : "sudoku-number"
                                    }
                                    onClick={() => enterNumber(number)}
                                    disabled={paused || won || showHelp}
                                >
                                    {number}
                                </button>
                            ))}
                        </div>

                        {/* Game actions */}
                        <div className="sudoku-actions">
                            <button
                                type="button"
                                className="sudoku-secondary-button"
                                onClick={eraseCell}
                                disabled={paused || won || showHelp}
                            >
                                Erase
                            </button>

                            <button
                                type="button"
                                className="sudoku-secondary-button"
                                onClick={() => setShowHelp(true)}
                                disabled={paused || won}
                            >
                                Help
                            </button>
                        </div>
                    </section>
                </>
            )}
        </main>
    );
}

export default Sudoku;