// Account Settings Page
import { useState } from "react";
import { Link } from "react-router-dom";
import { Style, Avatar } from "@dicebear/core";
import definition from "@dicebear/styles/critters.json" with { type: "json" };

import "../pages-css/AccountSettings.css";

import gamePlaceholder from "../assets/placeholder.png";
import badgePlaceholder from "../assets/badge-placeholder.png";

// Create the DiceBear Critters style
const crittersStyle = new Style(definition);

function AccountSettings() {
  const [activeSection, setActiveSection] = useState("General");

  // Saved message
  const [saveMessage, setSaveMessage] = useState("");

  // Load saved settings from localStorage
  const [profileName, setProfileName] = useState(
    localStorage.getItem("profileName") || "PuzzlePlayer"
  );

  const [profileBackground, setProfileBackground] = useState(
    localStorage.getItem("profileBackground") || "#f5f5f5"
  );

  // Store the DiceBear seed instead of an image path
  const [profileAvatar, setProfileAvatar] = useState(
    localStorage.getItem("profileAvatar") || "Felix"
  );

  const [favoriteGame, setFavoriteGame] = useState(
    localStorage.getItem("favoriteGame") || "Word Puzzle"
  );

  // Load saved trophy showcase
  const [selectedTrophies, setSelectedTrophies] = useState(() => {
    const savedTrophies = localStorage.getItem("trophyShowcase");

    if (savedTrophies) {
      return JSON.parse(savedTrophies);
    }

    // Initially show all five trophies
    return [
      "First Puzzle",
      "Puzzle Master",
      "Daily Solver",
      "Logic Expert",
      "Dedicated Solver",
    ];
  });

  const settingsSections = [
    "General",
    "Avatar",
    "Profile Background",
    "Favorite Game",
    "Trophy Showcase",
  ];

  // Available DiceBear Critters avatars
  const avatars = [
    {
      name: "Felix",
      seed: "Felix",
    },
    {
      name: "Puzzle",
      seed: "Puzzle",
    },
    {
      name: "Forest",
      seed: "Forest",
    },
    {
      name: "Sunny",
      seed: "Sunny",
    },
    {
      name: "Explorer",
      seed: "Explorer",
    },
    {
      name: "Mystery",
      seed: "Mystery",
    },
    {
      name: "Garden",
      seed: "Garden",
    },
    {
      name: "Lucky",
      seed: "Lucky",
    },
  ];

  // Available games
  const games = [
    {
      name: "Word Puzzle",
      description: "A puzzle game focused on words and vocabulary.",
      image: gamePlaceholder,
    },
    {
      name: "Jigsaw Puzzle",
      description: "Piece together images to complete the puzzle.",
      image: gamePlaceholder,
    },
    {
      name: "Game Name",
      description: "Description for this puzzle game.",
      image: gamePlaceholder,
    },
  ];

  // Available trophies
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

  // Profile background choices
  const backgroundChoices = [
    "#f5f5f5",
    "#f7f4e9",
    "#dde8d5",
    "#cad2c5",
    "#d8e8e0",
    "#dce8f5",
  ];

  // Generate a DiceBear Critters avatar
  const generateAvatar = (seed, size = 100) => {
  return new Avatar(crittersStyle, {
    seed: seed,
    size: size,
  }).toDataUri();
};

  // Show saved message
  const showSaveMessage = () => {
    setSaveMessage("✓ Changes saved!");

    setTimeout(() => {
      setSaveMessage("");
    }, 2000);
  };

  // Save General settings
  const saveGeneralSettings = () => {
    localStorage.setItem("profileName", profileName);

    showSaveMessage();
  };

  // Save Avatar settings
  const saveAvatarSettings = () => {
    localStorage.setItem("profileAvatar", profileAvatar);

    showSaveMessage();
  };

  // Save Profile Background
  const saveProfileBackground = () => {
    localStorage.setItem("profileBackground", profileBackground);

    showSaveMessage();
  };

  // Save Favorite Game
  const saveFavoriteGame = () => {
    localStorage.setItem("favoriteGame", favoriteGame);

    showSaveMessage();
  };

  // Save Trophy Showcase
  const saveTrophyShowcase = () => {
    localStorage.setItem(
      "trophyShowcase",
      JSON.stringify(selectedTrophies)
    );

    showSaveMessage();
  };

  // Select / deselect a trophy
  const toggleTrophy = (trophyName) => {
    setSelectedTrophies((currentTrophies) => {
      if (currentTrophies.includes(trophyName)) {
        return currentTrophies.filter(
          (name) => name !== trophyName
        );
      }

      // Maximum of 5 trophies
      if (currentTrophies.length >= 5) {
        return currentTrophies;
      }

      return [...currentTrophies, trophyName];
    });
  };

  return (
    <main className="account-settings-page">

      <div className="settings-layout-container">

        {/* Sidebar Navigation */}
        <aside className="settings-sidebar">

          <Link to="/account" className="back-link">
            ← Back to Your Profile
          </Link>

          <ul className="sidebar-menu">
            {settingsSections.map((section) => (
              <li
                key={section}
                className={activeSection === section ? "active" : ""}
                onClick={() => setActiveSection(section)}
              >
                {section}
              </li>
            ))}
          </ul>

        </aside>

        {/* Main Settings Panel */}
        <section className="settings-panel">

          {/* General */}
          {activeSection === "General" && (
            <div className="settings-section">

              <h1>General</h1>

              <div className="settings-option">

                <div className="settings-label">
                  <h2>Profile Name</h2>

                  <p>
                    Change the name displayed on your Puzzle Sanctuary profile.
                  </p>
                </div>

                <div className="settings-control general-control">

                  <input
                    className="username-input"
                    type="text"
                    value={profileName}
                    onChange={(event) =>
                      setProfileName(event.target.value)
                    }
                  />

                </div>

              </div>

              <div className="settings-save-container">

                <button
                  className="settings-button"
                  onClick={saveGeneralSettings}
                >
                  Save Changes
                </button>

                {saveMessage && (
                  <span className="save-message">
                    {saveMessage}
                  </span>
                )}

              </div>

            </div>
          )}

          {/* Avatar */}
          {activeSection === "Avatar" && (
            <div className="settings-section">

              <h1>Avatar</h1>

              <div className="settings-option">

                <div className="settings-label">
                  <h2>Profile Picture</h2>

                  <p>
                    Choose the picture displayed on your Puzzle Sanctuary profile.
                  </p>
                </div>

                <div className="settings-control profile-picture-control">

                  {/* Current Avatar */}
                  <div className="current-avatar">
                    <img
                      src={generateAvatar(profileAvatar, 160)}
                      alt="Current profile avatar"
                    />
                  </div>

                  {/* Avatar Choices */}
                  <div className="avatar-options">

                    {avatars.map((avatar) => (
                      <button
                        key={avatar.name}
                        className={`avatar-option ${
                          profileAvatar === avatar.seed
                            ? "selected"
                            : ""
                        }`}
                        onClick={() =>
                          setProfileAvatar(avatar.seed)
                        }
                        aria-label={`Select ${avatar.name} avatar`}
                        title={avatar.name}
                      >
                        <img
                          src={generateAvatar(avatar.seed, 100)}
                          alt={avatar.name}
                        />
                      </button>
                    ))}

                  </div>

                </div>

              </div>

              <div className="settings-save-container">

                <button
                  className="settings-button"
                  onClick={saveAvatarSettings}
                >
                  Save Changes
                </button>

                {saveMessage && (
                  <span className="save-message">
                    {saveMessage}
                  </span>
                )}

              </div>

            </div>
          )}

          {/* Profile Background */}
          {activeSection === "Profile Background" && (
            <div className="settings-section">

              <h1>Profile Background</h1>

              <div className="settings-option">

                <div className="settings-label">
                  <h2>Background Color</h2>

                  <p>
                    Choose a background color for your profile.
                  </p>
                </div>

                <div className="settings-control background-control">

                  <div className="background-color-grid">

                    {backgroundChoices.map((color) => (
                      <button
                        key={color}
                        className={`background-color-option ${
                          profileBackground === color
                            ? "selected"
                            : ""
                        }`}
                        style={{
                          backgroundColor: color,
                        }}
                        onClick={() =>
                          setProfileBackground(color)
                        }
                        aria-label={`Select background color ${color}`}
                      />
                    ))}

                  </div>

                </div>

              </div>

              {/* Background Preview */}
              <div
                className="background-preview"
                style={{
                  backgroundColor: profileBackground,
                }}
              >
                <span>
                  Profile Background Preview
                </span>
              </div>

              <div className="settings-save-container">

                <button
                  className="settings-button"
                  onClick={saveProfileBackground}
                >
                  Save Changes
                </button>

                {saveMessage && (
                  <span className="save-message">
                    {saveMessage}
                  </span>
                )}

              </div>

            </div>
          )}

          {/* Favorite Game */}
          {activeSection === "Favorite Game" && (
            <div className="settings-section favorite-game-settings">

              <h1>Favorite Game</h1>

              <div className="favorite-game-grid">

                {games.map((game) => (
                  <div
                    className={`settings-game-card ${
                      favoriteGame === game.name
                        ? "selected"
                        : ""
                    }`}
                    key={game.name}
                    onClick={() => setFavoriteGame(game.name)}
                  >

                    <div className="settings-game-image">

                      <img
                        src={game.image}
                        alt={game.name}
                      />

                    </div>

                    <div className="settings-game-info">

                      <h3>{game.name}</h3>

                      <p>
                        {game.description}
                      </p>

                    </div>

                  </div>
                ))}

              </div>

              <div className="settings-save-container">

                <button
                  className="settings-button"
                  onClick={saveFavoriteGame}
                >
                  Save Changes
                </button>

                {saveMessage && (
                  <span className="save-message">
                    {saveMessage}
                  </span>
                )}

              </div>

            </div>
          )}

          {/* Trophy Showcase */}
          {activeSection === "Trophy Showcase" && (
            <div className="settings-section trophy-showcase-settings">

              <h1>Trophy Showcase</h1>

              <p className="trophy-instructions">
                Select up to 5 trophies to display on your profile.
              </p>

              <div className="trophy-grid">

                {badges.map((badge) => (

                  <div
                    className={`settings-trophy-card ${
                      selectedTrophies.includes(badge.name)
                        ? "selected"
                        : ""
                    }`}
                    key={badge.name}
                    onClick={() => toggleTrophy(badge.name)}
                  >

                    <div className="settings-trophy-image">

                      <img
                        src={badge.image}
                        alt={badge.name}
                      />

                      <div className="settings-trophy-tooltip">
                        {badge.description}
                      </div>

                    </div>

                    <p>
                      {badge.name}
                    </p>

                  </div>

                ))}

              </div>

              <div className="settings-save-container">

                <button
                  className="settings-button"
                  onClick={saveTrophyShowcase}
                >
                  Save Changes
                </button>

                {saveMessage && (
                  <span className="save-message">
                    {saveMessage}
                  </span>
                )}

              </div>

            </div>
          )}

        </section>

      </div>

    </main>
  );
}

export default AccountSettings;