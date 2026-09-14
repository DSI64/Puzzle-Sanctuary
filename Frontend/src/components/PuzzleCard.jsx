// Component that shows the games on the Puzzle page
import { Link } from "react-router-dom";

function PuzzleCard({ name, description, image, path }) {
  return (
    <Link to={path || "#"} className="puzzle-card-link">
      <div className="puzzle-card">
        <div className="puzzle-card-image">
          <img src={image} alt={name} />
        </div>

        <div className="puzzle-card-content">
          <h3>{name}</h3>
          <p>{description}</p>
        </div>
      </div>
    </Link>
  );
}

export default PuzzleCard;