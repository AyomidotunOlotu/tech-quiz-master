// ── APP.JS — Main Application Logic ──────────────────────────────────────────
import { TECHNOLOGIES, DIFFICULTIES, QUESTIONS } from "./questions.js";
import { db } from "./firebase-config.js";
import {
  collection, addDoc, getDocs, query, where, orderBy, limit, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ── STATE ─────────────────────────────────────────────────────────────────────
let state = {
  activeTech:   null,
  activeDiff:   null,
  questions:    [],
  current:      0,
  score:        0,
  answered:     false,
  startTime:    null,
  elapsed:      0,
  wrongAnswers: [],    // ← make sure this is here
  timerInterval: null,
};

// ── ELEMENTS ──────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const techList    = $("techList");
const homeView    = $("homeView");
const quizView    = $("quizView");
const resultsView = $("resultsView");

// ── INIT ──────────────────────────────────────────────────────────────────────
function init() {
  buildSidebar();
  attachControls();
  showHome();
}

// ── SIDEBAR ───────────────────────────────────────────────────────────────────
function buildSidebar() {
  techList.innerHTML = "";

  TECHNOLOGIES.forEach(tech => {
    const item = document.createElement("div");
    item.className = "tech-item";
    item.dataset.id = tech.id;

    item.innerHTML = `
      <div class="tech-item-header">
        <span class="tech-emoji">${tech.emoji}</span>
        <span class="tech-name">${tech.name}</span>
        <span class="tech-arrow">›</span>
      </div>
      <div class="tech-sub">
        ${DIFFICULTIES.map(d => `
          <button class="sub-btn" data-tech="${tech.id}" data-diff="${d.id}">
            ${d.emoji} ${d.label}
            <span class="sub-count">${d.questions} Qs</span>
          </button>
        `).join("")}
      </div>`;

    // Toggle accordion
    item.querySelector(".tech-item-header").addEventListener("click", () => {
      const wasActive = item.classList.contains("active");
      document.querySelectorAll(".tech-item").forEach(i => i.classList.remove("active"));
      if (!wasActive) {
        item.classList.add("active");
        state.activeTech = tech;
        updateHomeCard(tech);
      } else {
        state.activeTech = null;
        showHomeDefault();
      }
    });

    // Difficulty buttons
    item.querySelectorAll(".sub-btn").forEach(btn => {
      btn.addEventListener("click", e => {
        e.stopPropagation();
        const diff = DIFFICULTIES.find(d => d.id === btn.dataset.diff);
        item.querySelectorAll(".sub-btn").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        state.activeDiff = diff;
        updateHomeCard(tech, diff);
      });
    });

    techList.appendChild(item);
  });
}

function updateHomeCard(tech, diff = null) {
  $("homeIcon").textContent = tech.emoji;
  $("homeTechName").textContent = `${tech.name} Quiz`;
  $("homeDesc").textContent = diff
    ? `${diff.desc} — ${diff.questions} questions`
    : "Select a difficulty level to begin your challenge";

  const grid = $("difficultyGrid");
  grid.innerHTML = DIFFICULTIES.map(d => `
    <div class="diff-card" data-diff="${d.id}" onclick="window.startQuiz('${tech.id}','${d.id}')">
      <div class="diff-card-left">
        <div class="diff-dot ${d.id}">${d.emoji}</div>
        <div>
          <div class="diff-label">${d.label}</div>
          <div class="diff-sub">${d.desc}</div>
        </div>
      </div>
      <span class="diff-pill">${d.questions} Qs</span>
    </div>`).join("");

  $("homeHint").textContent = diff
    ? `Click a difficulty card above to start!`
    : `Choose your difficulty level 👆`;

  showView(homeView);
}

function showHomeDefault() {
  $("homeIcon").textContent = "{ }";
  $("homeTechName").textContent = "Select a Technology";
  $("homeDesc").textContent = "Choose a technology from the sidebar to begin";
  $("difficultyGrid").innerHTML = "";
  $("homeHint").textContent = "← Pick a topic to get started";
  showView(homeView);
}

// ── QUIZ START ────────────────────────────────────────────────────────────────
window.startQuiz = function(techId, diffId) {
  const tech = TECHNOLOGIES.find(t => t.id === techId);
  const diff = DIFFICULTIES.find(d => d.id === diffId);
  const pool = QUESTIONS[techId]?.[diffId] || [];

  if (!pool.length) {
    alert("Questions coming soon for this level!");
    return;
  }

  // Shuffle and slice to exact count
  const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, diff.questions);

  state = {
    activeTech:  tech,
    activeDiff:  diff,
    questions:   shuffled,
    current:     0,
    score:       0,
    answered:    false,
    startTime:   Date.now(),
    elapsed:     0,
  };

  $("quizTechBadge").textContent = tech.name;
  $("quizDiffBadge").textContent = diff.label;
  $("liveScore").textContent = "0";

  showView(quizView);
  renderQuestion();
};

// ── QUESTION RENDER ────────────────────────────────────────────────────────────
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
function renderQuestion() {
  const q = state.questions[state.current];
  const total = state.questions.length;
  state.answered = false;

  $("questionNumber").textContent = `Question ${state.current + 1}`;
  $("questionText").textContent = q.text;
  $("quizCounter").textContent = `${state.current + 1} / ${total}`;
  $("progressFill").style.width = `${((state.current) / total) * 100}%`;
  $("nextBtn").classList.add("hidden");

  const letters = ["A", "B", "C", "D"];
  $("optionsGrid").innerHTML = q.options.map((opt, i) => `
  <button class="option-btn" onclick="window.selectAnswer(${i})">
    <span class="opt-letter">${letters[i]}</span>${escapeHtml(opt)}
  </button>`).join("");

  // Animate question card
  const card = $("questionCard");
  card.style.opacity = "0";
  card.style.transform = "translateY(12px)";
  requestAnimationFrame(() => {
    card.style.transition = "opacity .25s, transform .25s";
    card.style.opacity = "1";
    card.style.transform = "translateY(0)";
  });
}



  // ── ANSWER SELECTION ──────────────────────────────────────────────────────────

window.selectAnswer = function(idx) {
  if (state.answered) return;

  state.answered = true;

  // SAFETY FIX
  if (!state.wrongAnswers) {
    state.wrongAnswers = [];
  }

  const q = state.questions[state.current];
  const btns = $("optionsGrid").querySelectorAll(".option-btn");

  btns.forEach(b => b.disabled = true);

  if (idx === q.answer) {
    state.score++;
    $("liveScore").textContent = state.score;

    btns[idx].classList.add("correct");
    btns[idx].classList.add("pop");

  } else {

    btns[idx].classList.add("wrong");
    btns[idx].classList.add("shake");

    btns[q.answer].classList.add("correct");

    state.wrongAnswers.push({
      question: q.text,
      yourAnswer: q.options[idx],
      correctAnswer: q.options[q.answer],
    });
  }

  // SHOW NEXT BUTTON
  $("nextBtn").classList.remove("hidden");

  // LAST QUESTION?
  if (state.current === state.questions.length - 1) {
    $("nextBtn").textContent = "Finish ✓";
  } else {
    $("nextBtn").textContent = "Next →";
  }
};

// ── REVIEW WRONG ANSWERS ─────────────────────────────────────────────────────
function showReview() {
  if (!state.wrongAnswers || state.wrongAnswers.length === 0) {
    alert("🎉 Perfect score! No wrong answers to review.");
    return;
  }

  const list = $("reviewList");
  list.innerHTML = state.wrongAnswers.map((w, i) => `
    <div class="review-card">
      <p class="review-num">Question ${i + 1}</p>
      <p class="review-question">${escapeHtml(w.question)}</p>
      <div class="review-answers">
        <div class="review-wrong">
          ✗ Your answer: <span>${escapeHtml(w.yourAnswer)}</span>
        </div>
        <div class="review-correct">
          ✓ Correct: <span>${escapeHtml(w.correctAnswer)}</span>
        </div>
      </div>
    </div>`).join("");

  showView($("reviewView"));
}
// ── CONTROLS ─────────────────────────────────────────────────────────────────
function attachControls() {
  $("nextBtn").addEventListener("click", () => {
    state.current++;
    if (state.current >= state.questions.length) {
      showResults();
    } else {
      renderQuestion();
    }
  });

  $("quitBtn").addEventListener("click", () => {
    if (confirm("Quit this quiz? Your progress will be lost.")) showHomeDefault();
  });

  $("retryBtn").addEventListener("click", () => {
    startQuiz(state.activeTech.id, state.activeDiff.id);
  });

  $("homeBtn").addEventListener("click", () => showHomeDefault());
  // Inside attachControls(), add:
  $("backHomeBtn").addEventListener("click", () => window.showLandingPage());
  $("ctaStartBtn") && $("ctaStartBtn").addEventListener("click", () => {
    document.getElementById("appContainer").classList.remove("hidden");
    document.getElementById("landingOverlay").classList.add("hidden");
  });
  // ← ADD THESE TWO LINES
  $("reviewBtn").addEventListener("click", showReview);
  $("reviewBackBtn").addEventListener("click", () => showView(resultsView));
}

// ── RESULTS ────────────────────────────────────────────────────────────────────
function showResults() {
  const total   = state.questions.length;
  const score   = state.score;
  const pct     = Math.round((score / total) * 100);
  const elapsed = Math.round((Date.now() - state.startTime) / 1000);
  state.elapsed = elapsed;

  $("resultPercent").textContent  = `${pct}%`;
  $("resultFraction").textContent = `${score}/${total}`;
  $("statCorrect").textContent    = score;
  $("statWrong").textContent      = total - score;
  $("statTime").textContent       = elapsed >= 60
    ? `${Math.floor(elapsed/60)}m ${elapsed%60}s`
    : `${elapsed}s`;

  // Emoji + message
  let emoji, msg;
  if (pct >= 90) { emoji = "🏆"; msg = "Outstanding! You're a master!"; }
  else if (pct >= 75) { emoji = "🎉"; msg = "Great job! Keep pushing!"; }
  else if (pct >= 60) { emoji = "👍"; msg = "Good effort! Review the misses."; }
  else if (pct >= 40) { emoji = "📖"; msg = "Keep studying — you'll get there!"; }
  else { emoji = "💪"; msg = "Don't give up! Practice makes perfect."; }

  $("resultIcon").textContent  = emoji;
  $("resultTitle").textContent = `${state.activeTech.name} — ${state.activeDiff.label}`;
  $("resultMessage").textContent = msg;

  showView(resultsView);

  // Animate ring
  setTimeout(() => {
    const circumference = 314;
    const offset = circumference - (pct / 100) * circumference;
    $("ringFill").style.strokeDashoffset = offset;

    // Colour by score
    const ringColor = pct >= 75 ? "#10b981" : pct >= 50 ? "#f97316" : "#ef4444";
    $("ringFill").style.stroke = ringColor;
  }, 100);

  // Save result to Firebase (if connected)
  saveResult({ tech: state.activeTech.id, diff: state.activeDiff.id, score, total, pct, elapsed });
}

// ── FIREBASE SAVE ────────────────────────────────────────────────────────────
async function saveResult(data) {
  try {
    await addDoc(collection(db, "results"), {
      ...data,
      timestamp: serverTimestamp(),
    });
    console.log("✅ Result saved to Firebase");
  } catch (err) {
    // Firebase not configured yet — silent fail in dev
    console.warn("Firebase save skipped (configure firebase-config.js):", err.message);
  }
}

// ── VIEW HELPERS ──────────────────────────────────────────────────────────────
function showView(el) {
  [homeView, quizView, resultsView, $("reviewView")]
    .forEach(v => v.classList.add("hidden"));

  el.classList.remove("hidden");
}

function showHome() {
  showHomeDefault();
}

// ── MOBILE MENU ───────────────────────────────────────────────────────────────
(function setupMobileMenu() {
  const btn = document.createElement("button");
  btn.className = "mobile-menu-btn";
  btn.textContent = "☰";
  btn.setAttribute("aria-label", "Toggle sidebar");
  document.body.appendChild(btn);

  btn.addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("open");
  });

  document.addEventListener("click", e => {
    const sidebar = document.getElementById("sidebar");
    if (!sidebar.contains(e.target) && e.target !== btn) {
      sidebar.classList.remove("open");
    }
  });
})();

// ── BOOT ─────────────────────────────────────────────────────────────────────
init();

// ── THEME TOGGLE ─────────────────────────────────────────────────────────────
(function setupTheme() {
  const btn = document.getElementById("themeToggle");
  const saved = localStorage.getItem("theme");

  // Apply saved preference on load
  if (saved === "light") {
    document.body.classList.add("light");
    btn.textContent = "☀️";
  }

  btn.addEventListener("click", () => {
    const isLight = document.body.classList.toggle("light");
    btn.textContent = isLight ? "☀️" : "🌙";
    localStorage.setItem("theme", isLight ? "light" : "dark");
  });
})();
window.showLandingPage = function() {
  document.getElementById("appContainer").classList.add("hidden");
  document.getElementById("landingOverlay").classList.remove("hidden");
};