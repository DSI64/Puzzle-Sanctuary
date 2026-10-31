
import { useState } from "react";
import "../games-css/Solitaire.css";

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

function Solitaire() {
    const [screen, setScreen] = useState("menu");
    const [game, setGame] = useState(null);
    const [history, setHistory] = useState([]);
    const [selected, setSelected] = useState(null);
    const [moveMessage, setMoveMessage] = useState("");

    function startGame() {
        setGame(dealGame());
        setHistory([]);
        setSelected(null);
        setMoveMessage("");
        setScreen("playing");
    }

    // Save a previous game state for Undo.
    function saveHistory() {
        setHistory((previousHistory) => [
            ...previousHistory,
            game,
        ]);
    }

    function drawFromStock() {
        if (!game) return;

        setSelected(null);
        setMoveMessage("");

        if (game.stock.length === 0 && game.waste.length === 0) {
            return;
        }

        saveHistory();

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

    // Check that a selected tableau sequence is valid.
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

    // Determine whether the selected cards can move
    // to a particular tableau column.
    function canMoveToTableau(columnIndex) {
        if (!selected || !game) return false;

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

    function attemptMove(destination) {
        if (!game || !selected) return false;

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
            if (
                !canMoveToTableau(destination.column)
            ) {
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

        setGame(nextGame);
        setSelected(null);
        setMoveMessage("");

        return true;
    }

    function handleTableauCardClick(columnIndex, cardIndex) {
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

            // Keep the original selection if the move fails.
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

    function handleEmptyColumnClick(columnIndex) {
        if (!selected) return;

        attemptMove({
            type: "tableau",
            column: columnIndex,
            targetIndex: null,
        });
    }

    function handleWasteClick() {
        if (game.waste.length === 0) return;

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

    function handleFoundationClick(suitName) {
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

    function undoMove() {
        if (history.length === 0) return;

        const previousGame = history[history.length - 1];

        setGame(previousGame);

        setHistory((previousHistory) =>
            previousHistory.slice(0, -1)
        );

        setSelected(null);
        setMoveMessage("");
    }

    const topWasteCard =
        game?.waste[game.waste.length - 1];

    return (
        <main className="solitaire-page">
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
                                A<span>♥</span>
                            </span>

                            <span className="solitaire-card-heart">
                                ♥
                            </span>

                            <span className="solitaire-card-corner bottom">
                                A<span>♥</span>
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

            {screen === "playing" && game && (
                <section className="solitaire-game">
                    <header className="solitaire-game-header">
                        <div>
                            <p className="solitaire-eyebrow">
                                PUZZLE SANCTUARY
                            </p>

                            <h1>Solitaire</h1>
                        </div>

                        <div className="solitaire-game-header-actions">
                            <button
                                type="button"
                                className="solitaire-button"
                                onClick={undoMove}
                                disabled={history.length === 0}
                            >
                                ↶ Undo
                            </button>

                            <button
                                type="button"
                                className="solitaire-button"
                                onClick={() => {
                                    setSelected(null);
                                    setMoveMessage("");
                                    setScreen("menu");
                                }}
                            >
                                Back to Menu
                            </button>
                        </div>
                    </header>

                    <div className="solitaire-board">
                        {/* Stock, waste, and foundations */}
                        <div className="solitaire-top-piles">
                            <button
                                type="button"
                                className={`solitaire-empty-pile solitaire-stock-pile ${
                                    game.stock.length > 0
                                        ? "solitaire-pile-has-card"
                                        : ""
                                }`}
                                onClick={drawFromStock}
                                disabled={
                                    game.stock.length === 0 &&
                                    game.waste.length === 0
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

                            <button
                                type="button"
                                className={`solitaire-empty-pile solitaire-waste-pile ${
                                    topWasteCard
                                        ? "solitaire-pile-has-card"
                                        : ""
                                } ${
                                    selected?.type === "waste"
                                        ? "solitaire-pile-selected"
                                        : ""
                                }`}
                                onClick={handleWasteClick}
                                disabled={!topWasteCard}
                                aria-label={
                                    topWasteCard
                                        ? `Select ${topWasteCard.label} of ${topWasteCard.suit}`
                                        : "Waste pile is empty"
                                }
                            >
                                {topWasteCard ? (
                                    <PlayingCard card={topWasteCard} />
                                ) : (
                                    <span>Waste</span>
                                )}
                            </button>

                            <div className="solitaire-pile-spacer" />

                            {SUITS.map((suit) => {
                                const cards =
                                    game.foundations[suit.name];

                                const topCard =
                                    cards[cards.length - 1];

                                return (
                                    <button
                                        type="button"
                                        key={suit.name}
                                        className={`solitaire-empty-pile solitaire-foundation-pile ${
                                            topCard
                                                ? "solitaire-pile-has-card"
                                                : ""
                                        } ${
                                            selected?.type === "foundation" &&
                                            selected.suitName === suit.name
                                                ? "solitaire-pile-selected"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            handleFoundationClick(
                                                suit.name
                                            )
                                        }
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
                                            className={`solitaire-tableau-column ${
                                                column.length === 0 &&
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
                                                                top: `${cardIndex * 30}px`,
                                                                zIndex: cardIndex + 1,
                                                            }}
                                                        >
                                                            <button
                                                                type="button"
                                                                className={`solitaire-card-button ${
                                                                    isSelected
                                                                        ? "is-selected"
                                                                        : ""
                                                                } ${
                                                                    isValidTarget
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
                                                                disabled={!card.faceUp}
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
                </section>
            )}

            {[
                "highScores",
                "options",
                "howToPlay",
            ].includes(screen) && (
                <section className="solitaire-placeholder">
                    <p className="solitaire-eyebrow">
                        PUZZLE SANCTUARY
                    </p>

                    <h1>
                        {screen === "highScores" && "High Scores"}
                        {screen === "options" && "Options"}
                        {screen === "howToPlay" && "How to Play"}
                    </h1>

                    {screen === "highScores" && (
                        <p>
                            Your best completion times and game
                            statistics will appear here.
                        </p>
                    )}

                    {screen === "options" && (
                        <p>
                            Card backs, card faces, and table
                            colors will be customizable here.
                        </p>
                    )}

                    {screen === "howToPlay" && (
                        <p>
                            Arrange cards in descending order,
                            alternating colors, and move each suit
                            to its foundation from Ace to King.
                        </p>
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
        </main>
    );
}

export default Solitaire;