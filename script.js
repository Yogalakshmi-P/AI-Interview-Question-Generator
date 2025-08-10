/* AI Interview Question Generator - MCQ version
   - Loads questions.json
   - Generates up to 10 unique random MCQs per chosen category
   - Lets user save individual questions to localStorage (Saved list)
   - Check Score button evaluates answers and shows results
   - Regenerate to get a new set; handles categories with fewer than 10 questions gracefully
*/

let questionsData = {};
let currentQuestions = []; // array of selected question objects for current quiz

// DOM refs
const categoryEl = document.getElementById("category");
const generateBtn = document.getElementById("generateBtn");
const regenerateBtn = document.getElementById("regenerateBtn");
const questionBox = document.getElementById("questionBox");
const checkScoreBtn = document.getElementById("checkScore");
const clearAnswersBtn = document.getElementById("clearAnswers");
const savedListEl = document.getElementById("savedList");
const clearSavedBtn = document.getElementById("clearSaved");

// Load question bank
fetch("questions.json")
  .then((res) => res.json())
  .then((data) => {
    questionsData = data;
  })
  .catch((err) => {
    console.error("Failed to load questions.json", err);
    questionBox.innerHTML = `<p class="hint">Error loading questions. Make sure <code>questions.json</code> is present.</p>`;
  });

// Utility: shuffle array in-place (Fisher-Yates)
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Pick up to 10 unique random questions
function pickQuestions(category) {
  const pool = Array.isArray(questionsData[category])
    ? [...questionsData[category]]
    : [];
  if (pool.length === 0) return [];
  shuffle(pool);
  return pool.slice(0, Math.min(10, pool.length));
}

// Render current questions as form with radio options and Save buttons
function renderQuestions() {
  if (!currentQuestions || currentQuestions.length === 0) {
    questionBox.innerHTML = `<p class="hint">No questions to display. Generate a set first.</p>`;
    checkScoreBtn.disabled = true;
    clearAnswersBtn.disabled = true;
    return;
  }

  const form = document.createElement("form");
  form.id = "quizForm";
  currentQuestions.forEach((qObj, idx) => {
    const card = document.createElement("div");
    card.className = "question-card";
    const header = document.createElement("div");
    header.className = "question-header";

    const qText = document.createElement("p");
    qText.className = "q-text";
    qText.textContent = `${idx + 1}. ${qObj.question}`;

    const saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.className = "save-btn";
    saveBtn.textContent = "Save";
    saveBtn.title = "Save this question for later review";
    saveBtn.addEventListener("click", () => saveQuestion(qObj.question));

    header.appendChild(qText);
    header.appendChild(saveBtn);
    card.appendChild(header);

    const optList = document.createElement("ul");
    optList.className = "options";

    qObj.options.forEach((optText, optIdx) => {
      const li = document.createElement("li");
      const id = `q${idx}_opt${optIdx}`;
      const label = document.createElement("label");
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = `q${idx}`;
      radio.value = optIdx;
      radio.id = id;
      const span = document.createElement("span");
      span.textContent = optText;

      label.appendChild(radio);
      label.appendChild(span);
      li.appendChild(label);
      optList.appendChild(li);
    });

    card.appendChild(optList);
    form.appendChild(card);
  });

  questionBox.innerHTML = "";
  questionBox.appendChild(form);

  // enable buttons
  checkScoreBtn.disabled = false;
  clearAnswersBtn.disabled = false;
}

// Score check: counts correct selections; unanswered treated as incorrect
function checkScore() {
  const form = document.getElementById("quizForm");
  if (!form) return;

  let score = 0;
  currentQuestions.forEach((qObj, idx) => {
    const selected = form.querySelector(`input[name="q${idx}"]:checked`);
    if (selected && parseInt(selected.value, 10) === qObj.answer) score++;
  });

  // Show results with a simple modal-like alert and also show which were wrong/correct below
  alert(`You scored ${score} out of ${currentQuestions.length}`);
  showDetailedResults();
}

// Show detailed results inline (marks correct/incorrect)
function showDetailedResults() {
  const form = document.getElementById("quizForm");
  if (!form) return;

  currentQuestions.forEach((qObj, idx) => {
    const selected = form.querySelector(`input[name="q${idx}"]:checked`);
    const chosen = selected ? parseInt(selected.value, 10) : null;
    // highlight options
    qObj.options.forEach((_, optIdx) => {
      const input = form.querySelector(
        `input[name="q${idx}"][value="${optIdx}"]`
      );
      if (!input) return;
      const li = input.closest("li");
      li.style.background = ""; // reset
      if (optIdx === qObj.answer) {
        li.style.background = "rgba(16,185,129,0.08)"; // correct highlight
      }
      if (chosen !== null && optIdx === chosen && optIdx !== qObj.answer) {
        li.style.background = "rgba(239,68,68,0.08)"; // wrong highlight
      }
    });
  });
}

// Save a question string into localStorage
function saveQuestion(questionText) {
  if (!questionText) return;
  const stored = JSON.parse(localStorage.getItem("savedQuestions") || "[]");
  if (!stored.includes(questionText)) {
    stored.push(questionText);
    localStorage.setItem("savedQuestions", JSON.stringify(stored));
    renderSavedQuestions();
  } else {
    // small feedback (could be replaced by toast)
    console.log("Question already saved");
  }
}

// Render saved questions list
function renderSavedQuestions() {
  const saved = JSON.parse(localStorage.getItem("savedQuestions") || "[]");
  savedListEl.innerHTML = "";
  if (saved.length === 0) {
    savedListEl.innerHTML = '<li class="meta">No saved questions yet.</li>';
    return;
  }
  saved.forEach((q, i) => {
    const li = document.createElement("li");
    li.textContent = `${i + 1}. ${q}`;
    savedListEl.appendChild(li);
  });
}

// Clear saved questions
function clearSaved() {
  if (!confirm("Clear all saved questions?")) return;
  localStorage.removeItem("savedQuestions");
  renderSavedQuestions();
}

// Clear selected answers (uncheck radios)
function clearAnswers() {
  const form = document.getElementById("quizForm");
  if (!form) return;
  form
    .querySelectorAll('input[type="radio"]')
    .forEach((r) => (r.checked = false));
  // remove highlights if any
  form
    .querySelectorAll(".options li")
    .forEach((li) => (li.style.background = ""));
}

// Event handlers
generateBtn.addEventListener("click", () => {
  const cat = categoryEl.value;
  currentQuestions = pickQuestions(cat);
  renderQuestions();
});

regenerateBtn.addEventListener("click", () => {
  if (!currentQuestions || currentQuestions.length === 0) {
    // nothing to regenerate -> behave like generate
    generateBtn.click();
    return;
  }
  // regenerate from same category
  const cat = categoryEl.value;
  currentQuestions = pickQuestions(cat);
  renderQuestions();
});

checkScoreBtn.addEventListener("click", checkScore);
clearSavedBtn.addEventListener("click", clearSaved);
clearAnswersBtn.addEventListener("click", clearAnswers);

// load saved on start
renderSavedQuestions();
