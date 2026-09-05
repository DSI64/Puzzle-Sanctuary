// Component that shows the games on the Puzzle page
function PuzzleCard({ name, description, image }) {
  return (
    <div className="puzzle-card">
      <div className="puzzle-card-image">
        <img src={image} alt={name} />
      </div>

      <div className="puzzle-card-content">
        <h3>{name}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default PuzzleCard;