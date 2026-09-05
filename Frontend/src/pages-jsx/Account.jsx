// Account Page of the website; Displays the user's profile and progress
import "../pages-css/Account.css";
import profilePlaceholder from "../assets/profile-placeholder.png";
import gamePlaceholder from "../assets/placeholder.png";
import badgePlaceholder from "../assets/badge-placeholder.png";


function Account() {
  // Placeholder account information for now
  const user = {
    username: "PuzzlePlayer",
    level: 12,
    favoriteGame: "Word Puzzle",
    profilePicture: profilePlaceholder,
    favoriteGameImage: gamePlaceholder,
  };

  // Placeholder statistics
  const statistics = [
    {
      label: "Puzzles Completed",
      value: "37",
    },
    {
      label: "Puzzles Played",
      value: "52",
    },
    {
      label: "Best Score",
      value: "982",
    },
    {
      label: "Current Streak",
      value: "6",
    },
  ];

  // Placeholder badges
  const badges = [
    {
      name: "First Puzzle",
      description: "Awarded for completing your first puzzle.",
      image: badgePlaceholder,
    },
    {
      name: "Puzzle Master",
      description: "Awarded for completing 50 puzzles.",
      image: badgePlaceholder,
    },
    {
      name: "Daily Solver",
      description: "Awarded for maintaining a 7 day login streak.",
      image: badgePlaceholder,
    },
    {
      name: "Logic Expert",
      description: "Awarded for completing 25 logic puzzles.",
      image: badgePlaceholder,
    },
    {
      name: "Dedicated Solver",
      description: "Awarded for playing puzzles on 30 different days.",
      image: badgePlaceholder,
    },
  ];

  return (
    <main className="account-page">

      {/* Profile */}
      <section className="profile-section">
        <div className="profile-picture">
          <img src={user.profilePicture} alt="Profile" />
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

        <button className="settings-button">
          Settings
        </button>
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
      {/* --- End Dashboard Row --- */}

      {/* Badges */}
      <section className="badges-section">
        <h2>Badges</h2>

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