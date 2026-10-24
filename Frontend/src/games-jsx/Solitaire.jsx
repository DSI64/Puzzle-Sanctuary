
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
            const card = {
                ...deck[deckIndex],
                faceUp: row === column,
            };

            cards.push(card);
            deckIndex++;
        }

        tableau.push(cards);
    }

    return {
        tableau,
        stock: deck.slice(deckIndex),
    };
}

function PlayingCard({ card }) {
    if (!card.faceUp) {
        return (
            <div
                className="solitaire-board-card solitaire-board-card-back"
                aria-label="Face-down card"
            >
                <div className="solitaire-board-card-pattern">✦</div>
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

    function startGame() {
        setGame(dealGame());
        setScreen("playing");
    }

    return (
        <main className="solitaire-page">
            {screen === "menu" && (
                <section className="solitaire-menu">
                    <p className="solitaire-eyebrow">
                        PUZZLE SANCTUARY
                    </p>

                    <div className="solitaire-card-logo" aria-hidden="true">
                        <div className="solitaire-playing-card solitaire-card-back">
                            <div className="solitaire-card-pattern">✦</div>
                        </div>

                        <div className="solitaire-playing-card solitaire-card-front">
                            <span className="solitaire-card-corner">
                                A<span>♥</span>
                            </span>
                            <span className="solitaire-card-heart">♥</span>
                            <span className="solitaire-card-corner bottom">
                                A<span>♥</span>
                            </span>
                        </div>
                    </div>

                    <h1 className="solitaire-title">Solitaire</h1>

                    <p className="solitaire-description">
                        Take your time, plan your moves, and
                        find your winning hand.
                    </p>

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

                    <p className="solitaire-menu-footer">
                        A little patience goes a long way.
                    </p>
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

                        <button
                            type="button"
                            className="solitaire-button"
                            onClick={() => setScreen("menu")}
                        >
                            Back to Menu
                        </button>
                    </header>

                    <div className="solitaire-board">
                        <div className="solitaire-top-piles">
                            <div className="solitaire-empty-pile">
                                <span>Stock</span>
                            </div>

                            <div className="solitaire-empty-pile">
                                <span>Waste</span>
                            </div>

                            <div className="solitaire-pile-spacer" />

                            {SUITS.map((suit) => (
                                <div
                                    key={suit.name}
                                    className="solitaire-empty-pile"
                                    aria-label={`${suit.name} foundation`}
                                >
                                    <span>{suit.symbol}</span>
                                </div>
                            ))}
                        </div>

                        <div className="solitaire-tableau">
                            {game.tableau.map((column, columnIndex) => (
                                <div
                                    className="solitaire-tableau-column"
                                    key={columnIndex}
                                >
                                    {column.map((card, cardIndex) => (
                                        <div
                                            className="solitaire-tableau-card"
                                            key={card.id}
                                            style={{
                                                top: `${cardIndex * 30}px`,
                                                zIndex: cardIndex + 1,
                                            }}
                                        >
                                            <PlayingCard card={card} />
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>

                        <p className="solitaire-board-message">
                            Your cards are dealt! Next, we'll make
                            the piles interactive.
                        </p>
                    </div>
                </section>
            )}

            {["highScores", "options", "howToPlay"].includes(screen) && (
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
