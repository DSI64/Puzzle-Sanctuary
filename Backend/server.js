import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
    ],
  })
);

app.use(express.json());

/*
  Map Puzzle Sanctuary categories
  to Pexels search terms.
*/
const categoryQueries = {
  nature: "nature landscape",
  animals: "animals wildlife",
  architecture: "architecture buildings",
  art: "art painting",
  games: "video games board games gaming",
  music: "music instruments",
};

/*
  Get a random Pexels photo for a puzzle category.
*/
app.get("/api/pexels/photo", async (req, res) => {
  try {
    const category = req.query.category || "nature";

    const query =
      categoryQueries[category] ||
      categoryQueries.nature;

    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(
        query
      )}&orientation=square&per_page=10`,
      {
        headers: {
          Authorization: process.env.PEXELS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "Pexels API error:",
        response.status,
        errorText
      );

      return res.status(response.status).json({
        error: "Pexels API request failed.",
      });
    }

    const data = await response.json();

    if (!data.photos || data.photos.length === 0) {
      return res.status(404).json({
        error: "No photos were found for this category.",
      });
    }

    /*
      Pick one of the returned photos at random.
    */
    const photo =
      data.photos[
        Math.floor(
          Math.random() * data.photos.length
        )
      ];

    res.json({
      id: photo.id,
      imageUrl: photo.src.large,
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
      photoUrl: photo.url,
      alt: photo.alt || query,
    });
  } catch (error) {
    console.error(
      "Server error:",
      error
    );

    res.status(500).json({
      error: "Unable to retrieve a Pexels photo.",
    });
  }
});

/*
  Basic server test.
*/
app.get("/api/health", (req, res) => {
  res.json({
    message: "Puzzle Sanctuary backend is running.",
  });
});

app.listen(PORT, () => {
  console.log(
    `Puzzle Sanctuary backend running on port ${PORT}`
  );
});