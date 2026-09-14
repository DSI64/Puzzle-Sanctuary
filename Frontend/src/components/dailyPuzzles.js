// Handles which puzzle is selected for each day

const puzzleTypes = [
  "jigsaw",
  "word-scramble",
  "crossword",
];

// Gets today's date in YYYY-MM-DD format
function getTodayDate() {
  const today = new Date();

  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
    today.getDate()
  ).padStart(2, "0")}`;
}

// Creates a number based on the date.
// This means the same date will always produce the same number.
function getDailyNumber(dateString) {
  let total = 0;

  for (let i = 0; i < dateString.length; i++) {
    total += dateString.charCodeAt(i);
  }

  return total;
}

// Gets the daily puzzle
export function getDailyPuzzle() {
  const date = getTodayDate();
  const number = getDailyNumber(date);

  const puzzleIndex = number % puzzleTypes.length;
  const puzzleType = puzzleTypes[puzzleIndex];

  // Lorem Picsum IDs go from 1 upward.
  // The same date will always get the same image ID.
  const imageId = (number % 1000) + 1;

  return {
    date,
    type: puzzleType,
    imageId,
  };
}