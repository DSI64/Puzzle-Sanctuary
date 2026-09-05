// Puzzle Page of the website; Lists the available games on the website
import PuzzleCard from "../components/PuzzleCard";
import "../pages-css/Puzzles.css"
import puzzlePlaceholder from "../assets/placeholder.png";

function Puzzles() {
  const puzzles = [ //Gives the name, desciption, and the type of puzzle game it is
    {
      name: "Game Name",
      description: "This is a description for the game",
      type: "Puzzle Type",
      image: puzzlePlaceholder,
    },
    {
      name: "",
      description: "",
      type: "",
      image: puzzlePlaceholder,
    },
    {
      name: "",
      description: "",
      type: "",
      image: puzzlePlaceholder,
    },
    {
      name: "",
      description: "",
      type: "",
      image: puzzlePlaceholder,
    },
    {
      name: "",
      description: "",
      type: "",
      image: puzzlePlaceholder,
    },
    {
      name: "",
      description: "",
      type: "",
      image: puzzlePlaceholder,
    },
    {
      name: "",
      description: "",
      type: "",
      image: puzzlePlaceholder,
    },
    {
      name: "",
      description: "",
      type: "",
      image: puzzlePlaceholder,
    },
    {
      name: "",
      description: "",
      type: "",
      image: puzzlePlaceholder,
    },
    {
      name: "",
      description: "",
      type: "",
      image: puzzlePlaceholder,
    },
    {
      name: "",
      description: "",
      type: "",
      image: puzzlePlaceholder,
    },
    {
      name: "",
      description: "",
      type: "",
      image: puzzlePlaceholder,
    }
  ]

  return (
    <main className="puzzles-page">
      <section className="puzzles-header">
      <p className="page-label">PUZZLE SANCTUARY </p>
      <h1>Puzzle Hub</h1>
      <p>Browse all of the available puzzle games.</p>
      </section>

      <section className="puzzles-list">
        <div className="puzzle-grid">
          {puzzles.map((puzzle) => (
            <PuzzleCard //Here, React creates card for each puzzle on website
                key={puzzle.name}
                name={puzzle.name}
                description={puzzle.description}
                type={puzzle.type}
                image={puzzle.image}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

export default Puzzles;