import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import Home from "./pages-jsx/Home";
import DailyGame from "./pages-jsx/DailyGame";
import Puzzles from "./pages-jsx/Puzzles";
import Account from "./pages-jsx/Account";
import AccountSettings from "./pages-jsx/AccountSettings";
import Challenges from "./pages-jsx/Challenges";
import SlidingPuzzle from "./games-jsx/SlidingPuzzle";
import Maze from "./games-jsx/Maze";

function App() {
  return (
    <BrowserRouter>
      <div className="app">

        <header className="navbar">
          <Link to="/" className="logo">
            Puzzle Sanctuary
          </Link>

          <nav>
            <Link to="/">Home</Link>
            <Link to="/daily">Daily Game</Link>
            <Link to="/puzzles">Puzzles</Link>
            <Link to="/challenges">Challenges</Link>
            <Link to="/account">Account</Link>
          </nav>
        </header>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/daily" element={<DailyGame />} />
          <Route path="/puzzles" element={<Puzzles />} />
          <Route path="/puzzles/SlidingPuzzle" element={<SlidingPuzzle />} />
          <Route path="/puzzles/maze" element={<Maze />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/account" element={<Account />} />
          <Route path="/account/settings" element={<AccountSettings />} />
        </Routes>

        <footer>
          <p>© 2026 Puzzle Sanctuary</p>
        </footer>

      </div>
    </BrowserRouter>
  );
}

export default App;