// Account Page of the website; Displays the user's profile and progress
import { useState } from "react";
import { Link } from "react-router-dom";
import { Style, Avatar } from "@dicebear/core";
import definition from "@dicebear/styles/critters.json" with { type: "json" };
import "../pages-css/Account.css";
import gamePlaceholder from "../assets/placeholder.png";
// import badgePlaceholder from "../assets/badge-placeholder.png";
import bronzeTrophy from "../assets/bronze-trophy.png";
import silverTrophy from "../assets/silver-trophy.png";
import goldTrophy from "../assets/gold-trophy.png";

// Create the DiceBear Critters style
const crittersStyle = new Style(definition);

function Account() {
  // Get saved profile settings from localStorage
  const savedProfileName =
    localStorage.getItem("profileName") || "PuzzlePlayer";

  const savedProfileBackground =
    localStorage.getItem("profileBackground") || "#f5f5f5";

  const savedFavoriteGame =
    localStorage.getItem("favoriteGame") || "Word Puzzle";

  // The saved value is now a DiceBear seed
  const savedAvatar =
    localStorage.getItem("profileAvatar") || "Felix";

  // Generate the saved DiceBear Critters avatar
  const profilePicture = new Avatar(crittersStyle, {
    seed: savedAvatar,
    size: 160,
  }).toDataUri();

  // Get saved trophy showcase
  const savedTrophies = JSON.parse(
    localStorage.getItem("trophyShowcase") || "[]"
  );

  // Placeholder account information
  const user = {
    username: savedProfileName,
    level: 7,
    favoriteGame: savedFavoriteGame,
    profilePicture: profilePicture,
    favoriteGameImage: gamePlaceholder,
  };

  // Profile background
  const [profileBackground] = useState(savedProfileBackground);

  // Placeholder statistics
  const statistics = [
    {
      label: "Puzzles Completed",
      value: "60",
    },
    {
      label: "Puzzles Played",
      value: "60",
    },
    {
      label: "Best Score",
      value: "1983",
    },
    {
      label: "Current Streak",
      value: "7",
    },
  ];

  // All available badges
  const allBadges = [
    {
      name: "First Puzzle",
      description: "Awarded for completing your first puzzle.",
      image: bronzeTrophy,
    },
    {
      name: "Puzzle Master",
      description: "Awarded for completing 50 puzzles.",
      image: goldTrophy,
    },
    {
      name: "Daily Solver",
      description: "Awarded for maintaining a 7 day login streak.",
      image: bronzeTrophy,
    },
    {
      name: "Logic Expert",
      description: "Awarded for completing 25 logic puzzles.",
      image: silverTrophy,
    },
    {
      name: "Dedicated Solver",
      description: "Awarded for playing puzzles on 30 different days.",
      image: silverTrophy,
    },
  ];

  // If trophies have been saved, use those.
  // Otherwise, show all trophies for the initial account.
  const badges =
    savedTrophies.length > 0
      ? allBadges.filter((badge) => savedTrophies.includes(badge.name))
      : allBadges;

  return (
    <main
      className="account-page"
      style={{ backgroundColor: profileBackground }}
    >

      {/* Profile */}
      <section className="profile-section">

        <div className="profile-picture">
          <img
            src={user.profilePicture}
            alt={`${user.username}'s profile avatar`}
          />
        </div>

        <div className="profile-info">
          <p className="account-label">PUZZLE SANCTUARY</p>

          <h1>{user.username}</h1>

          <p className="profile-level">
            Level <strong>{user.level}</strong>
          </p>

          <p className="favorite-game">
            Favorite Game: <strong>{user.favoriteGame}</strong>
          </p>
        </div>

        <Link to="/account/settings" className="settings-button">
          Settings
        </Link>

      </section>

      {/* Middle Dashboard Row (Stats & Favorite Side-by-Side) */}
      <div className="dashboard-row">

        {/* Statistics */}
        <section className="statistics-section">
          <h2>Puzzle Statistics</h2>

          <div className="statistics-grid">
            {statistics.map((stat) => (
              <div className="stat-card" key={stat.label}>
                <h3>{stat.value}</h3>
                <p>{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Favorite Game */}
        <section className="favorite-section">
          <h2>Favorite Game</h2>

          <div className="favorite-game-card">

            <div className="favorite-game-image">
              <img
                src={user.favoriteGameImage}
                alt={user.favoriteGame}
              />
            </div>

            <div className="favorite-game-info">
              <h3>{user.favoriteGame}</h3>
              <p>Your favorite puzzle game.</p>
            </div>

          </div>
        </section>

      </div>

      {/* Badges / Trophies */}
      <section className="badges-section">
        <h2>Trophies</h2>

        <div className="badge-grid">

          {badges.map((badge) => (
            <div className="badge-card" key={badge.name}>

              <div className="badge-image-container">

                <img
                  src={badge.image}
                  alt={badge.name}
                />

                <div className="badge-tooltip">
                  {badge.description}
                </div>

              </div>

              <p>{badge.name}</p>

            </div>
          ))}

        </div>
      </section>

    </main>
  );
}

export default Account;