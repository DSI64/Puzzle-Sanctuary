
import { useEffect, useRef, useState } from "react";
import "../games-css/Solitaire.css";


/* ---------- Card data ---------- */

const SUITS = [
    { symbol: "♥", color: "red", name: "hearts" },
    { symbol: "♦", color: "red", name: "diamonds" },
    { symbol: "♣", color: "black", name: "clubs" },
    { symbol: "♠", color: "black", name: "spades" },
];

const RANKS = [
    { value: 1, label: "A" },
    { value: 2, label: "2" },
    { value: 3, label: "3" },
    { value: 4, label: "4" },
    { value: 5, label: "5" },
    { value: 6, label: "6" },
    { value: 7, label: "7" },
    { value: 8, label: "8" },
    { value: 9, label: "9" },
    { value: 10, label: "10" },
    { value: 11, label: "J" },
    { value: 12, label: "Q" },
    { value: 13, label: "K" },
];


/* ---------- Help page content ---------- */

const HELP_PAGES = [
    {
        title: "Tableau",
        description:
            "The tableau contains seven columns. Your goal is to organize cards, uncover hidden cards, and build sequences.",

        tips: [
            "Arrange cards in descending order, alternating between red and black.",
            "You can move a single card or a valid sequence of face-up cards.",
            "Only a King can be placed in an empty tableau column.",
            "Moving the top face-up card can reveal a hidden card underneath.",
            "Build the four foundations by suit, starting with Ace and ending with King.",
        ],
    },

    {
        title: "Stock Pile",
        description:
            "The Stock is the face-down pile on the left side of the game board.",

        tips: [
            "Select the Stock pile to draw one card.",
            "The drawn card moves to the Waste pile.",
            "When the Stock is empty, select it again to recycle the Waste pile.",
            "You can continue drawing cards after the Stock has been recycled.",
        ],
    },

    {
        title: "Waste Pile",
        description:
            "The Waste pile holds the cards drawn from the Stock.",

        tips: [
            "Only the top card of the Waste pile can be played.",
            "Select the top card to move it to a valid tableau column.",
            "You can also move it to its matching foundation when it is next in sequence.",
            "When a Waste card is moved, the previous card underneath becomes available.",
        ],
    },
];


/* ---------- Create and shuffle deck ---------- */

function createDeck() {
    return SUITS.flatMap((suit) =>
        RANKS.map((rank) => ({
            id: `${suit.name}-${rank.value}`,
            suit: suit.symbol,
            color: suit.color,
            rank: rank.value,
            label: rank.label,
            faceUp: false,
        }))
    );
}

function shuffleDeck(deck) {
    const shuffled = [...deck];

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
}


/* ---------- Deal game ---------- */

function dealGame() {
    const deck = shuffleDeck(createDeck());
    const tableau = [];
    let deckIndex = 0;

    for (let column = 0; column < 7; column++) {
        const cards = [];

        for (let row = 0; row <= column; row++) {
            cards.push({
                ...deck[deckIndex],
                faceUp: row === column,
            });

            deckIndex++;
        }

        tableau.push(cards);
    }

    return {
        tableau,
        stock: deck.slice(deckIndex),
        waste: [],
        foundations: {
            hearts: [],
            diamonds: [],
            clubs: [],
            spades: [],
        },
    };
}


/* ---------- Format elapsed time ---------- */

function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}


/* ---------- Leaderboard and customization settings ---------- */

const HIGH_SCORES_KEY = "solitaireHighScores";
const CUSTOMIZATIONS_KEY = "solitaireCustomizations";

const DEFAULT_CUSTOMIZATIONS = {
    boardColor: "green",
    cardBack: "blue",
    cardFace: "white",
};

const BOARD_COLOR_OPTIONS = [
    { value: "green", label: "Classic Green" },
    { value: "blue", label: "Ocean Blue" },
    { value: "purple", label: "Lavender" },
    { value: "dark", label: "Dark Slate" },
];

const CARD_BACK_OPTIONS = [
    { value: "blue", label: "Blue" },
    { value: "red", label: "Red" },
    { value: "green", label: "Green" },
    { value: "purple", label: "Purple" },
];

const CARD_FACE_OPTIONS = [
    { value: "white", label: "Classic White" },
    { value: "cream", label: "Warm Cream" },
];


// Rank fastest completion first.
// When times are tied, rank fewer moves first.

function compareHighScores(a, b) {
    return (
        a.timeSeconds - b.timeSeconds ||
        a.moves - b.moves
    );
}


// Load previously saved scores.

function loadHighScores() {
    try {
        const savedScores = JSON.parse(
            localStorage.getItem(HIGH_SCORES_KEY) || "[]"
        );

        if (!Array.isArray(savedScores)) return [];

        return savedScores
            .filter(
                (score) =>
                    typeof score.playerName === "string" &&
                    typeof score.timeSeconds === "number" &&
                    typeof score.moves === "number"
            )
            .sort(compareHighScores)
            .slice(0, 10);

    } catch {
        return [];
    }
}


// Load saved appearance settings.

function loadCustomizations() {
    try {
        const saved = JSON.parse(
            localStorage.getItem(CUSTOMIZATIONS_KEY) || "{}"
        );

        return {
            boardColor: BOARD_COLOR_OPTIONS.some(
                (option) => option.value === saved.boardColor
            )
                ? saved.boardColor
                : DEFAULT_CUSTOMIZATIONS.boardColor,

            cardBack: CARD_BACK_OPTIONS.some(
                (option) => option.value === saved.cardBack
            )
                ? saved.cardBack
                : DEFAULT_CUSTOMIZATIONS.cardBack,

            cardFace: CARD_FACE_OPTIONS.some(
                (option) => option.value === saved.cardFace
            )
                ? saved.cardFace
                : DEFAULT_CUSTOMIZATIONS.cardFace,
        };

    } catch {
        return { ...DEFAULT_CUSTOMIZATIONS };
    }
}


/* ---------- Playing card component ---------- */

function PlayingCard({ card }) {
    if (!card.faceUp) {
        return (
            <div
                className="solitaire-board-card solitaire-board-card-back"
                aria-label="Face-down card"
            >
                <div className="solitaire-board-card-pattern">
                    ✦
                </div>
            </div>
        );
    }

    return (
        <div
            className={`solitaire-board-card solitaire-board-card-face ${card.color}`}
            aria-label={`${card.label} of ${card.suit}`}
        >
            <div className="solitaire-board-card-corner">
                <span>{card.label}</span>
                <span>{card.suit}</span>
            </div>

            <span className="solitaire-board-card-center">
                {card.suit}
            </span>

            <div className="solitaire-board-card-corner bottom">
                <span>{card.label}</span>
                <span>{card.suit}</span>
            </div>
        </div>
    );
}


/* ---------- Main Solitaire component ---------- */

function Solitaire() {
    const [screen, setScreen] = useState("menu");
    const [game, setGame] = useState(null);
    const [history, setHistory] = useState([]);
    const [selected, setSelected] = useState(null);
    const [moveMessage, setMoveMessage] = useState("");

    // Timer and move counter.
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [moves, setMoves] = useState(0);

    // Leaderboard.
    const [highScores, setHighScores] = useState(loadHighScores);

    // Player customizations.
    const [customizations, setCustomizations] = useState(
        loadCustomizations
    );

    // Prevent a completed game from being saved more than once.
    const resultSavedRef = useRef(false);

    // Help popup states.
    const [showHelp, setShowHelp] = useState(false);
    const [helpPage, setHelpPage] = useState(0);


    /* ---------- Check whether the game is won ---------- */

    const isGameWon =
        game !== null &&
        Object.values(game.foundations).every(
            (cards) => cards.length === 13
        );


    /* ---------- Help keyboard controls ---------- */

    useEffect(() => {
        if (!showHelp) return;

        function handleHelpKeyDown(event) {
            if (event.key === "Escape") {
                setShowHelp(false);
            }

            if (event.key === "ArrowLeft") {
                setHelpPage((page) => Math.max(0, page - 1));
            }

            if (event.key === "ArrowRight") {
                setHelpPage((page) =>
                    Math.min(HELP_PAGES.length - 1, page + 1)
                );
            }
        }

        window.addEventListener("keydown", handleHelpKeyDown);

        return () => {
            window.removeEventListener("keydown", handleHelpKeyDown);
        };
    }, [showHelp]);


    /* ---------- Game timer ---------- */

    useEffect(() => {
        if (screen !== "playing" || !game || isGameWon) {
            return;
        }

        const timerInterval = window.setInterval(() => {
            setElapsedSeconds((previousSeconds) => previousSeconds + 1);
        }, 1000);

        return () => {
            window.clearInterval(timerInterval);
        };
    }, [screen, game, isGameWon]);


    /* ---------- Save completed game to leaderboard ---------- */

    useEffect(() => {
        if (!isGameWon || resultSavedRef.current) return;

        // Prevent duplicate leaderboard entries.
        resultSavedRef.current = true;

        // Get the player's profile name.
        let playerName = "PuzzlePlayer";

        try {
            playerName =
                localStorage.getItem("profileName")?.trim() ||
                "PuzzlePlayer";
        } catch {
            // Use the default name if local storage is unavailable.
        }

        const completedGame = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            playerName,
            timeSeconds: elapsedSeconds,
            moves,
            completedAt: new Date().toISOString(),
        };

        // Add the result and keep the ten best scores.
        const updatedScores = [
            ...loadHighScores(),
            completedGame,
        ]
            .sort(compareHighScores)
            .slice(0, 10);

        try {
            localStorage.setItem(
                HIGH_SCORES_KEY,
                JSON.stringify(updatedScores)
            );
        } catch {
            // The result will still appear during this session.
        }

        setHighScores(updatedScores);

    }, [isGameWon, elapsedSeconds, moves]);


    /* ---------- Save player customizations ---------- */

    useEffect(() => {
        try {
            localStorage.setItem(
                CUSTOMIZATIONS_KEY,
                JSON.stringify(customizations)
            );
        } catch {
            // Keep selected settings in React state for this session.
        }
    }, [customizations]);


    /* ---------- Start game ---------- */

    function startGame() {
        resultSavedRef.current = false;

        setGame(dealGame());
        setHistory([]);
        setSelected(null);
        setMoveMessage("");

        // Reset timer and move counter.
        setElapsedSeconds(0);
        setMoves(0);

        setShowHelp(false);
        setHelpPage(0);
        setScreen("playing");
    }


    /* ---------- Save history for Undo ---------- */

    function saveHistory() {
        setHistory((previousHistory) => [
            ...previousHistory,
            game,
        ]);
    }


    /* ---------- Draw and recycle stock ---------- */

    function drawFromStock() {
        if (!game || isGameWon) return;

        setSelected(null);
        setMoveMessage("");

        if (game.stock.length === 0 && game.waste.length === 0) {
            return;
        }

        saveHistory();

        // Count the stock action.
        setMoves((previousMoves) => previousMoves + 1);

        setGame((currentGame) => {
            if (!currentGame) return currentGame;

            // Draw from the stock.
            if (currentGame.stock.length > 0) {
                const newStock = [...currentGame.stock];
                const drawnCard = newStock.pop();

                return {
                    ...currentGame,
                    stock: newStock,
                    waste: [
                        ...currentGame.waste,
                        {
                            ...drawnCard,
                            faceUp: true,
                        },
                    ],
                };
            }

            // Recycle the waste pile.
            return {
                ...currentGame,
                stock: [...currentGame.waste]
                    .reverse()
                    .map((card) => ({
                        ...card,
                        faceUp: false,
                    })),
                waste: [],
            };
        });
    }


    /* ---------- Get selected cards ---------- */

    function getSelectedCards(currentGame) {
        if (!selected || !currentGame) return [];

        if (selected.type === "tableau") {
            return currentGame.tableau[selected.column].slice(
                selected.index
            );
        }

        if (selected.type === "waste") {
            return currentGame.waste.slice(-1);
        }

        if (selected.type === "foundation") {
            return currentGame.foundations[
                selected.suitName
            ].slice(-1);
        }

        return [];
    }


    /* ---------- Validate tableau sequences ---------- */

    function isValidSequence(cards) {
        if (cards.length === 0) return false;

        for (let i = 0; i < cards.length; i++) {
            if (!cards[i].faceUp) return false;

            if (i > 0) {
                const previousCard = cards[i - 1];
                const currentCard = cards[i];

                if (
                    previousCard.rank !== currentCard.rank + 1 ||
                    previousCard.color === currentCard.color
                ) {
                    return false;
                }
            }
        }

        return true;
    }


    /* ---------- Validate tableau destinations ---------- */

    function canMoveToTableau(columnIndex) {
        if (!selected || !game || isGameWon) return false;

        if (
            selected.type === "tableau" &&
            selected.column === columnIndex
        ) {
            return false;
        }

        const movingCards = getSelectedCards(game);

        if (movingCards.length === 0) return false;

        if (
            selected.type === "tableau" &&
            !isValidSequence(movingCards)
        ) {
            return false;
        }

        const firstCard = movingCards[0];
        const destinationColumn = game.tableau[columnIndex];

        // Empty columns only accept Kings.
        if (destinationColumn.length === 0) {
            return firstCard.rank === 13;
        }

        const targetCard =
            destinationColumn[destinationColumn.length - 1];

        return (
            targetCard.faceUp &&
            targetCard.color !== firstCard.color &&
            targetCard.rank === firstCard.rank + 1
        );
    }


    /* ---------- Move cards ---------- */

    function attemptMove(destination) {
        if (!game || !selected || isGameWon) return false;

        const movingCards = getSelectedCards(game);

        if (movingCards.length === 0) {
            setMoveMessage("Select a card first.");
            return false;
        }

        const firstCard = movingCards[0];

        // Validate a selected tableau sequence.
        if (
            selected.type === "tableau" &&
            !isValidSequence(movingCards)
        ) {
            setMoveMessage(
                "That card sequence cannot be moved."
            );

            return false;
        }

        // Validate tableau destinations.
        if (destination.type === "tableau") {
            if (!canMoveToTableau(destination.column)) {
                setMoveMessage(
                    firstCard.rank === 13
                        ? "Choose a valid destination column."
                        : "Cards must descend in rank and alternate colors. Only Kings can start empty columns."
                );

                return false;
            }

            const destinationColumn =
                game.tableau[destination.column];

            if (
                destinationColumn.length > 0 &&
                destination.targetIndex !==
                destinationColumn.length - 1
            ) {
                setMoveMessage(
                    "Choose the top card of the destination column."
                );

                return false;
            }
        }

        // Validate foundation destinations.
        if (destination.type === "foundation") {
            if (movingCards.length !== 1) {
                setMoveMessage(
                    "Only one card at a time can be moved to a foundation."
                );

                return false;
            }

            if (selected.type === "foundation") {
                setMoveMessage(
                    "A foundation card can only be moved back to the tableau."
                );

                return false;
            }

            const matchingSuit = SUITS.find(
                (suit) => suit.symbol === firstCard.suit
            )?.name;

            if (destination.suitName !== matchingSuit) {
                setMoveMessage(
                    "Cards must go to their matching suit."
                );

                return false;
            }

            const foundation =
                game.foundations[destination.suitName];

            if (foundation.length === 0) {
                if (firstCard.rank !== 1) {
                    setMoveMessage(
                        "A foundation must start with an Ace."
                    );

                    return false;
                }
            } else {
                const topCard =
                    foundation[foundation.length - 1];

                if (firstCard.rank !== topCard.rank + 1) {
                    setMoveMessage(
                        "Foundations must be built upward from Ace to King."
                    );

                    return false;
                }
            }
        }

        // Make a copy of the current game.
        const nextGame = {
            tableau: game.tableau.map((column) => [...column]),
            stock: [...game.stock],
            waste: [...game.waste],
            foundations: Object.fromEntries(
                Object.entries(game.foundations).map(
                    ([suit, cards]) => [suit, [...cards]]
                )
            ),
        };

        // Remove cards from the original pile.
        if (selected.type === "tableau") {
            const remainingCards = nextGame.tableau[
                selected.column
            ].slice(0, selected.index);

            // Reveal the newly exposed card.
            if (remainingCards.length > 0) {
                const topIndex = remainingCards.length - 1;

                if (!remainingCards[topIndex].faceUp) {
                    remainingCards[topIndex] = {
                        ...remainingCards[topIndex],
                        faceUp: true,
                    };
                }
            }

            nextGame.tableau[selected.column] = remainingCards;
        }

        if (selected.type === "waste") {
            nextGame.waste.pop();
        }

        if (selected.type === "foundation") {
            nextGame.foundations[selected.suitName].pop();
        }

        // Add cards to the destination pile.
        if (destination.type === "tableau") {
            nextGame.tableau[destination.column].push(
                ...movingCards
            );
        }

        if (destination.type === "foundation") {
            nextGame.foundations[destination.suitName].push(
                movingCards[0]
            );
        }

        // Save the previous state for Undo.
        saveHistory();

        // Count the successful card movement.
        setMoves((previousMoves) => previousMoves + 1);

        setGame(nextGame);
        setSelected(null);
        setMoveMessage("");

        return true;
    }


    /* ---------- Tableau card selection ---------- */

    function handleTableauCardClick(columnIndex, cardIndex) {
        if (isGameWon) return;

        const column = game.tableau[columnIndex];
        const card = column[cardIndex];

        if (!card.faceUp) return;

        // Clicking the selected card again deselects it.
        if (
            selected?.type === "tableau" &&
            selected.column === columnIndex &&
            selected.index === cardIndex
        ) {
            setSelected(null);
            setMoveMessage("");
            return;
        }

        // Clicking the top card of another column
        // attempts to move the selected cards there.
        if (
            selected &&
            cardIndex === column.length - 1
        ) {
            attemptMove({
                type: "tableau",
                column: columnIndex,
                targetIndex: cardIndex,
            });

            return;
        }

        // Otherwise, select this card and the cards beneath it.
        setSelected({
            type: "tableau",
            column: columnIndex,
            index: cardIndex,
        });

        setMoveMessage("");
    }


    /* ---------- Empty tableau columns ---------- */

    function handleEmptyColumnClick(columnIndex) {
        if (!selected || isGameWon) return;

        attemptMove({
            type: "tableau",
            column: columnIndex,
            targetIndex: null,
        });
    }


    /* ---------- Waste selection ---------- */

    function handleWasteClick() {
        if (isGameWon || game.waste.length === 0) return;

        if (selected?.type === "waste") {
            setSelected(null);
            setMoveMessage("");
            return;
        }

        if (selected) {
            setMoveMessage(
                "Click your selected card again to deselect it."
            );

            return;
        }

        setSelected({ type: "waste" });
        setMoveMessage("");
    }


    /* ---------- Foundation selection ---------- */

    function handleFoundationClick(suitName) {
        if (isGameWon) return;

        const foundation = game.foundations[suitName];

        if (
            selected?.type === "foundation" &&
            selected.suitName === suitName
        ) {
            setSelected(null);
            setMoveMessage("");
            return;
        }

        if (selected) {
            attemptMove({
                type: "foundation",
                suitName,
            });

            return;
        }

        if (foundation.length > 0) {
            setSelected({
                type: "foundation",
                suitName,
            });

            setMoveMessage("");
        }
    }


    /* ---------- Undo ---------- */

    function undoMove() {
        if (history.length === 0 || isGameWon) return;

        const previousGame = history[history.length - 1];

        setGame(previousGame);

        setHistory((previousHistory) =>
            previousHistory.slice(0, -1)
        );

        // Reverse the move counter.
        setMoves((previousMoves) =>
            Math.max(0, previousMoves - 1)
        );

        setSelected(null);
        setMoveMessage("");
    }


    /* ---------- Current waste card ---------- */

    const topWasteCard =
        game?.waste[game.waste.length - 1];


    /* ---------- Current Help page ---------- */

    const currentHelpPage = HELP_PAGES[helpPage];


    /* ---------- Render ---------- */

    return (
        <main className="solitaire-page">

            {/* Main menu */}

            {screen === "menu" && (
                <section className="solitaire-menu">

                    <p className="solitaire-eyebrow">
                        PUZZLE SANCTUARY
                    </p>

                    <div
                        className="solitaire-card-logo"
                        aria-hidden="true"
                    >
                        <div className="solitaire-playing-card solitaire-card-back">
                            <div className="solitaire-card-pattern">
                                ✦
                            </div>
                        </div>

                        <div className="solitaire-playing-card solitaire-card-front">
                            <span className="solitaire-card-corner">
                                A
                            </span>

                            <span className="solitaire-card-heart">
                                ♥
                            </span>
                        </div>
                    </div>

                    <h1 className="solitaire-title">
                        Solitaire
                    </h1>

                    <div className="solitaire-menu-buttons">

                        <button
                            type="button"
                            className="solitaire-button solitaire-primary-button"
                            onClick={startGame}
                        >
                            <span aria-hidden="true">▶</span>
                            Play Game
                        </button>

                        <button
                            type="button"
                            className="solitaire-button"
                            onClick={() => setScreen("highScores")}
                        >
                            <span aria-hidden="true">★</span>
                            High Scores
                        </button>

                        <button
                            type="button"
                            className="solitaire-button"
                            onClick={() => setScreen("options")}
                        >
                            <span aria-hidden="true">⚙</span>
                            Options
                        </button>

                        <button
                            type="button"
                            className="solitaire-button"
                            onClick={() => setScreen("howToPlay")}
                        >
                            <span aria-hidden="true">?</span>
                            How to Play
                        </button>

                    </div>
                </section>
            )}


            {/* Active game */}

            {screen === "playing" && game && (
                <section
                    className={`solitaire-game solitaire-board-${customizations.boardColor} solitaire-back-${customizations.cardBack} solitaire-face-${customizations.cardFace}`}
                >

                    {/* Game header */}

                    <header className="solitaire-game-header">

                        <div className="solitaire-game-heading">

                            <p className="solitaire-eyebrow">
                                PUZZLE SANCTUARY
                            </p>

                            <h1>Solitaire</h1>

                            {/* Timer and move counter */}

                            <div className="solitaire-game-stats">

                                <div className="solitaire-game-stat">
                                    <span>Time</span>
                                    <strong>
                                        {formatTime(elapsedSeconds)}
                                    </strong>
                                </div>

                                <div className="solitaire-game-stat">
                                    <span>Moves</span>
                                    <strong>{moves}</strong>
                                </div>

                            </div>

                        </div>

                        <div className="solitaire-game-header-actions">

                            {/* Undo */}

                            <button
                                type="button"
                                className="solitaire-button"
                                onClick={undoMove}
                                disabled={
                                    history.length === 0 || isGameWon
                                }
                            >
                                ↶ Undo
                            </button>


                            {/* Help */}

                            <button
                                type="button"
                                className="solitaire-button"
                                onClick={() => {
                                    setHelpPage(0);
                                    setShowHelp(true);
                                }}
                                aria-haspopup="dialog"
                                aria-label="Open Solitaire help"
                                disabled={isGameWon}
                            >
                                ? Help
                            </button>


                            {/* Back to menu */}

                            <button
                                type="button"
                                className="solitaire-button"
                                onClick={() => {
                                    setSelected(null);
                                    setMoveMessage("");
                                    setShowHelp(false);
                                    setHelpPage(0);
                                    setScreen("menu");
                                }}
                            >
                                Back to Menu
                            </button>

                        </div>
                    </header>


                    {/* Game board */}

                    <div className="solitaire-board">

                        {/* Stock, waste, and foundations */}

                        <div className="solitaire-top-piles">

                            {/* Stock */}

                            <button
                                type="button"
                                className={`solitaire-empty-pile solitaire-stock-pile ${game.stock.length > 0
                                    ? "solitaire-pile-has-card"
                                    : ""
                                    }`}
                                onClick={drawFromStock}
                                disabled={
                                    isGameWon ||
                                    (
                                        game.stock.length === 0 &&
                                        game.waste.length === 0
                                    )
                                }
                                aria-label={
                                    game.stock.length > 0
                                        ? "Draw a card from the stock"
                                        : game.waste.length > 0
                                            ? "Recycle the waste pile"
                                            : "Stock is empty"
                                }
                            >
                                {game.stock.length > 0 ? (
                                    <PlayingCard
                                        card={
                                            game.stock[
                                                game.stock.length - 1
                                            ]
                                        }
                                    />
                                ) : game.waste.length > 0 ? (
                                    <span aria-hidden="true">↻</span>
                                ) : (
                                    <span>Stock</span>
                                )}
                            </button>


                            {/* Waste */}

                            <button
                                type="button"
                                className={`solitaire-empty-pile solitaire-waste-pile ${topWasteCard
                                    ? "solitaire-pile-has-card"
                                    : ""
                                    } ${selected?.type === "waste"
                                        ? "solitaire-pile-selected"
                                        : ""
                                    }`}
                                onClick={handleWasteClick}
                                disabled={!topWasteCard || isGameWon}
                                aria-label={
                                    topWasteCard
                                        ? `Select ${topWasteCard.label} of ${topWasteCard.suit}`
                                        : "Waste pile is empty"
                                }
                            >
                                {topWasteCard ? (
                                    <PlayingCard card={topWasteCard} />
                                ) : (
                                    <span className="solitaire-waste-label">
                                        Waste
                                    </span>
                                )}
                            </button>


                            {/* Spacer */}

                            <div className="solitaire-pile-spacer" />


                            {/* Foundations */}

                            {SUITS.map((suit) => {
                                const cards =
                                    game.foundations[suit.name];

                                const topCard =
                                    cards[cards.length - 1];

                                return (
                                    <button
                                        type="button"
                                        key={suit.name}
                                        className={`solitaire-empty-pile solitaire-foundation-pile ${topCard
                                            ? "solitaire-pile-has-card"
                                            : ""
                                            } ${selected?.type === "foundation" &&
                                                selected.suitName === suit.name
                                                ? "solitaire-pile-selected"
                                                : ""
                                            }`}
                                        onClick={() =>
                                            handleFoundationClick(
                                                suit.name
                                            )
                                        }
                                        disabled={isGameWon}
                                        aria-label={
                                            topCard
                                                ? `${topCard.label} of ${topCard.suit} foundation`
                                                : `${suit.name} foundation`
                                        }
                                    >
                                        {topCard ? (
                                            <PlayingCard card={topCard} />
                                        ) : (
                                            <span>{suit.symbol}</span>
                                        )}
                                    </button>
                                );
                            })}

                        </div>


                        {/* Tableau */}

                        <div className="solitaire-tableau">

                            {game.tableau.map(
                                (column, columnIndex) => {
                                    const validDestination =
                                        selected &&
                                        canMoveToTableau(columnIndex);

                                    return (
                                        <div
                                            className={`solitaire-tableau-column ${column.length === 0 &&
                                                validDestination
                                                ? "solitaire-empty-column-target"
                                                : ""
                                                }`}
                                            key={columnIndex}
                                            onClick={() =>
                                                handleEmptyColumnClick(
                                                    columnIndex
                                                )
                                            }
                                        >
                                            {column.map(
                                                (card, cardIndex) => {
                                                    const isSelected =
                                                        selected?.type === "tableau" &&
                                                        selected.column === columnIndex &&
                                                        cardIndex >= selected.index;

                                                    const isValidTarget =
                                                        validDestination &&
                                                        cardIndex === column.length - 1;

                                                    return (
                                                        <div
                                                            className="solitaire-tableau-card"
                                                            key={card.id}
                                                            style={{
                                                                top: `${cardIndex * 16}px`,
                                                                zIndex: cardIndex + 1,
                                                            }}
                                                        >
                                                            <button
                                                                type="button"
                                                                className={`solitaire-card-button ${isSelected
                                                                    ? "is-selected"
                                                                    : ""
                                                                    } ${isValidTarget
                                                                        ? "solitaire-valid-move-target"
                                                                        : ""
                                                                    }`}
                                                                onClick={(event) => {
                                                                    event.stopPropagation();

                                                                    handleTableauCardClick(
                                                                        columnIndex,
                                                                        cardIndex
                                                                    );
                                                                }}
                                                                aria-label={
                                                                    card.faceUp
                                                                        ? `Select ${card.label} of ${card.suit}`
                                                                        : "Face-down card"
                                                                }
                                                                disabled={
                                                                    !card.faceUp ||
                                                                    isGameWon
                                                                }
                                                            >
                                                                <PlayingCard
                                                                    card={card}
                                                                />
                                                            </button>
                                                        </div>
                                                    );
                                                }
                                            )}
                                        </div>
                                    );
                                }
                            )}

                        </div>


                        {/* Move status and feedback */}

                        <p
                            className="solitaire-board-message"
                            aria-live="polite"
                        >
                            {moveMessage ||
                                (selected
                                    ? "Card selected. Choose a highlighted destination."
                                    : "Select a face-up card to move it.")}
                        </p>

                    </div>


                    {/* Win screen */}

                    {isGameWon && (
                        <div className="solitaire-win-overlay">

                            <section
                                className="solitaire-win-card"
                                role="dialog"
                                aria-modal="true"
                                aria-labelledby="solitaire-win-title"
                            >

                                <div
                                    className="solitaire-win-icon"
                                    aria-hidden="true"
                                >
                                    🏆
                                </div>

                                <p className="solitaire-eyebrow">
                                    PUZZLE SANCTUARY
                                </p>

                                <h2 id="solitaire-win-title">
                                    You Won!
                                </h2>

                                <p className="solitaire-win-description">
                                    Congratulations! You successfully completed Solitaire.
                                </p>


                                {/* Final statistics */}

                                <div className="solitaire-win-stats">

                                    <div className="solitaire-win-stat">
                                        <span>Completion Time</span>
                                        <strong>
                                            {formatTime(elapsedSeconds)}
                                        </strong>
                                    </div>

                                    <div className="solitaire-win-stat">
                                        <span>Total Moves</span>
                                        <strong>{moves}</strong>
                                    </div>

                                </div>


                                {/* Completion actions */}

                                <div className="solitaire-win-actions">

                                    <button
                                        type="button"
                                        className="solitaire-button solitaire-primary-button"
                                        onClick={startGame}
                                    >
                                        Play Again
                                    </button>

                                    <button
                                        type="button"
                                        className="solitaire-button"
                                        onClick={() => {
                                            setSelected(null);
                                            setMoveMessage("");
                                            setShowHelp(false);
                                            setHelpPage(0);
                                            setScreen("menu");
                                        }}
                                    >
                                        Main Menu
                                    </button>

                                </div>

                            </section>

                        </div>
                    )}


                    {/* Help popup */}

                    {showHelp && !isGameWon && (
                        <div
                            className="solitaire-help-overlay"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="solitaire-help-title"
                            onClick={(event) => {
                                if (event.target === event.currentTarget) {
                                    setShowHelp(false);
                                }
                            }}
                        >
                            <section className="solitaire-help-card">

                                {/* Popup heading */}

                                <div className="solitaire-help-heading">
                                    <span>
                                        PUZZLE SANCTUARY GUIDE
                                    </span>

                                    <button
                                        type="button"
                                        className="solitaire-help-close"
                                        onClick={() => setShowHelp(false)}
                                        aria-label="Close help"
                                    >
                                        ×
                                    </button>
                                </div>


                                {/* Page information */}

                                <p className="solitaire-help-page-count">
                                    PAGE {helpPage + 1} OF {HELP_PAGES.length}
                                </p>

                                <h2 id="solitaire-help-title">
                                    {currentHelpPage.title}
                                </h2>

                                <p className="solitaire-help-description">
                                    {currentHelpPage.description}
                                </p>


                                {/* Current page instructions */}

                                <ul className="solitaire-help-tips">
                                    {currentHelpPage.tips.map(
                                        (tip, index) => (
                                            <li key={index}>
                                                {tip}
                                            </li>
                                        )
                                    )}
                                </ul>


                                {/* Page indicators */}

                                <div className="solitaire-help-dots">
                                    {HELP_PAGES.map(
                                        (page, index) => (
                                            <button
                                                key={page.title}
                                                type="button"
                                                className={
                                                    helpPage === index
                                                        ? "solitaire-help-dot active"
                                                        : "solitaire-help-dot"
                                                }
                                                onClick={() =>
                                                    setHelpPage(index)
                                                }
                                                aria-label={`Go to ${page.title} help page`}
                                                aria-current={
                                                    helpPage === index
                                                        ? "step"
                                                        : undefined
                                                }
                                            />
                                        )
                                    )}
                                </div>


                                {/* Previous and Next buttons */}

                                <div className="solitaire-help-navigation">

                                    <button
                                        type="button"
                                        className="solitaire-help-nav-button"
                                        onClick={() =>
                                            setHelpPage((page) =>
                                                Math.max(0, page - 1)
                                            )
                                        }
                                        disabled={helpPage === 0}
                                    >
                                        Previous
                                    </button>

                                    <span>
                                        {helpPage + 1} / {HELP_PAGES.length}
                                    </span>

                                    <button
                                        type="button"
                                        className="solitaire-help-nav-button primary"
                                        onClick={() => {
                                            if (
                                                helpPage ===
                                                HELP_PAGES.length - 1
                                            ) {
                                                setShowHelp(false);
                                            } else {
                                                setHelpPage((page) =>
                                                    page + 1
                                                );
                                            }
                                        }}
                                    >
                                        {helpPage === HELP_PAGES.length - 1
                                            ? "Done"
                                            : "Next"}
                                    </button>

                                </div>

                            </section>
                        </div>
                    )}

                </section>
            )}


            {/* =========================================
                HIGH SCORES
            ========================================= */}

            {screen === "highScores" && (
                <section className="solitaire-placeholder solitaire-high-scores-page">

                    <p className="solitaire-eyebrow">
                        PUZZLE SANCTUARY
                    </p>

                    <h1>High Scores</h1>

                    <p>
                        Your ten fastest Solitaire completions.
                        Lower completion times rank higher.
                    </p>

                    {highScores.length === 0 ? (
                        <div className="solitaire-no-scores">

                            <span>★</span>

                            <h2>No Scores Yet</h2>

                            <p>
                                Complete a game to earn your first leaderboard entry!
                            </p>

                        </div>
                    ) : (
                        <div className="solitaire-high-scores-table-wrap">

                            <table className="solitaire-high-scores-table">

                                <thead>
                                    <tr>
                                        <th>Rank</th>
                                        <th>Player</th>
                                        <th>Time</th>
                                        <th>Moves</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {highScores.map((score, index) => (
                                        <tr key={score.id}>

                                            <td>
                                                <strong>#{index + 1}</strong>
                                            </td>

                                            <td>{score.playerName}</td>

                                            <td>
                                                <strong>
                                                    {formatTime(score.timeSeconds)}
                                                </strong>
                                            </td>

                                            <td>{score.moves}</td>

                                            <td>
                                                {new Date(
                                                    score.completedAt
                                                ).toLocaleDateString()}
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>

                            </table>

                        </div>
                    )}

                    <button
                        type="button"
                        className="solitaire-button solitaire-primary-button"
                        onClick={() => setScreen("menu")}
                    >
                        Back to Menu
                    </button>

                </section>
            )}


            {/* =========================================
                OPTIONS
            ========================================= */}

            {screen === "options" && (
                <section className="solitaire-placeholder solitaire-options-page">

                    <p className="solitaire-eyebrow">
                        PUZZLE SANCTUARY
                    </p>

                    <h1>Solitaire Options</h1>

                    <p>
                        Customize the appearance of your Solitaire game.
                    </p>


                    <div className="solitaire-options-panel">

                        {/* Board color */}

                        <div className="solitaire-option">

                            <label htmlFor="solitaire-board-color">
                                Board Color
                            </label>

                            <select
                                id="solitaire-board-color"
                                value={customizations.boardColor}
                                onChange={(event) =>
                                    setCustomizations((previous) => ({
                                        ...previous,
                                        boardColor: event.target.value,
                                    }))
                                }
                            >
                                {BOARD_COLOR_OPTIONS.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                        </div>


                        {/* Card back */}

                        <div className="solitaire-option">

                            <label htmlFor="solitaire-card-back">
                                Card Back Design
                            </label>

                            <select
                                id="solitaire-card-back"
                                value={customizations.cardBack}
                                onChange={(event) =>
                                    setCustomizations((previous) => ({
                                        ...previous,
                                        cardBack: event.target.value,
                                    }))
                                }
                            >
                                {CARD_BACK_OPTIONS.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                        </div>


                        {/* Card face */}

                        <div className="solitaire-option">

                            <label htmlFor="solitaire-card-face">
                                Card Face Color
                            </label>

                            <select
                                id="solitaire-card-face"
                                value={customizations.cardFace}
                                onChange={(event) =>
                                    setCustomizations((previous) => ({
                                        ...previous,
                                        cardFace: event.target.value,
                                    }))
                                }
                            >
                                {CARD_FACE_OPTIONS.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                        </div>

                    </div>


                    <button
                        type="button"
                        className="solitaire-button"
                        onClick={() =>
                            setCustomizations({
                                ...DEFAULT_CUSTOMIZATIONS,
                            })
                        }
                    >
                        Reset Customizations
                    </button>

                    <button
                        type="button"
                        className="solitaire-button solitaire-primary-button"
                        onClick={() => setScreen("menu")}
                    >
                        Back to Menu
                    </button>

                </section>
            )}


            {/* =========================================
                HOW TO PLAY
            ========================================= */}

            {screen === "howToPlay" && (
                <section className="solitaire-placeholder">

                    <p className="solitaire-eyebrow">
                        PUZZLE SANCTUARY
                    </p>

                    <h1>How to Play</h1>

                    <p>
                        Arrange cards in descending order,
                        alternating colors, and move each suit
                        to its foundation from Ace to King.
                    </p>

                    <button
                        type="button"
                        className="solitaire-button solitaire-primary-button"
                        onClick={() => setScreen("menu")}
                    >
                        Back to Menu
                    </button>

                </section>
            )}

        </main>
    );
}

export default Solitaire;
