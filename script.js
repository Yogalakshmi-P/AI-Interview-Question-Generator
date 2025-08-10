let questionsData = {};
let currentQuestion = "";

// Load questions from JSON
fetch("questions.json")
  .then((response) => response.json())
  .then((data) => {
    questionsData = data;
  })
  .catch((err) => console.error("Error loading questions:", err));

document.getElementById("generateBtn").addEventListener("click", () => {
  const category = document.getElementById("category").value;
  const questions = questionsData[category];
  if (questions && questions.length > 0) {
    const randomIndex = Math.floor(Math.random() * questions.length);
    currentQuestion = questions[randomIndex];
    document.getElementById(
      "questionBox"
    ).innerHTML = `<p>${currentQuestion}</p>`;
  } else {
    document.getElementById(
      "questionBox"
    ).innerHTML = `<p>No questions available for this category.</p>`;
  }
});

document.getElementById("saveBtn").addEventListener("click", () => {
  if (!currentQuestion) return;
  let saved = JSON.parse(localStorage.getItem("savedQuestions")) || [];
  if (!saved.includes(currentQuestion)) {
    saved.push(currentQuestion);
    localStorage.setItem("savedQuestions", JSON.stringify(saved));
    renderSavedQuestions();
  }
});

function renderSavedQuestions() {
  let saved = JSON.parse(localStorage.getItem("savedQuestions")) || [];
  const savedList = document.getElementById("savedList");
  savedList.innerHTML = "";
  saved.forEach((q) => {
    let li = document.createElement("li");
    li.textContent = q;
    savedList.appendChild(li);
  });
}

// Load saved questions on page load
renderSavedQuestions();
