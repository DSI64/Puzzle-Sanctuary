// Component that shows the games on the Puzzle page
function PuzzleCard ({name, description, type}) {
    return (
        <div className="puzzle-card">
            <div className="puzzle-card-image">
                <span>{type}</span>
            </div>

            <div className="puzzle-card-content">
                <h3>{name}</h3>
                <p>{description}</p>
                <button>Play</button>
            </div>
        </div>
    );
}

export default PuzzleCard;