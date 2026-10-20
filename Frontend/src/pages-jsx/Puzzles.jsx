// Puzzle Page of the website; Lists the available games on the website
import PuzzleCard from "../components/PuzzleCard";
import "../pages-css/Puzzles.css"
import puzzlePlaceholder from "../assets/placeholder.png";
import slidingPuzzle from "../assets/slidingPuzzle.png";
import mazeIcon from "../assets/maze-icon.png";
import sudokuIcon from "../assets/sudoku-icon.png";
import game2048 from "../assets/2048icon.svg";


function Puzzles() {
  const puzzles = [ //Gives the name, desciption, and the type of puzzle game it is
    {
      name: "Sliding Puzzle",
      description: "Rearrange and slide the pieces to reveal a picture!",
      type: "Puzzle Type",
      image: slidingPuzzle,
      path: "/puzzles/SlidingPuzzle",
    },
    {
      name: "Maze",
      description: "Find your way through the maze.",
      type: "Tour Puzzle",
      image: mazeIcon,
      path: "/puzzles/maze",
    },
    {
      name: "Sudoku",
      description: "Fill the grid with numbers without repeating them in any row, column, or box.",
      type: "Number Puzzle",
      image: sudokuIcon,
      path: "/puzzles/sudoku",
    },
    {
      name: "2048",
      description: "Slide numbered tiles across the board, merge matching numbers, and work your way up to 2048!",
      type: "Number Puzzle",
      image: game2048,
      path: "/puzzles/2048",
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
              path={puzzle.path}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

export default Puzzles;