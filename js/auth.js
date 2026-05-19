// ── AUTH + LANDING PAGE ───────────────────────────────────────────────────────
import { auth } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ── STATE ─────────────────────────────────────────────────────────────────────
let currentUser = null;

// ── DOM REFERENCES ────────────────────────────────────────────────────────────
const authOverlay    = document.getElementById("authOverlay");
const landingOverlay = document.getElementById("landingOverlay");
const appContainer   = document.getElementById("appContainer");

// Auth form elements
const loginForm      = document.getElementById("loginForm");
const signupForm     = document.getElementById("signupForm");
const showSignup     = document.getElementById("showSignup");
const showLogin      = document.getElementById("showLogin");
const loginBtn       = document.getElementById("loginBtn");
const signupBtn      = document.getElementById("signupBtn");

// Landing elements
const landingUserName  = document.getElementById("landingUserName");
const landingAvatar    = document.getElementById("landingAvatar");
const navUsername      = document.getElementById("navUsername");
const navAvatar        = document.getElementById("navAvatar");
const logoutBtnLanding = document.getElementById("logoutBtnLanding");
const logoutBtnSidebar = document.getElementById("logoutBtnSidebar");
const startQuizBtn     = document.getElementById("startQuizBtn");
const heroStartBtn     = document.getElementById("heroStartBtn");
const sidebarUsername  = document.getElementById("sidebarUsername");

// ── AUTH STATE OBSERVER ───────────────────────────────────────────────────────
onAuthStateChanged(auth, user => {
  if (user) {
    currentUser = user;
    showLanding(user);
  } else {
    currentUser = null;
    showAuth();
  }
});

// ── SHOW AUTH ─────────────────────────────────────────────────────────────────
function showAuth() {
  authOverlay.classList.remove("hidden");
  landingOverlay.classList.add("hidden");
  appContainer.classList.add("hidden");
}

// ── SHOW LANDING ──────────────────────────────────────────────────────────────
function showLanding(user) {
  authOverlay.classList.add("hidden");
  landingOverlay.classList.remove("hidden");
  appContainer.classList.add("hidden");

  const name = user.displayName || user.email.split("@")[0];
  const initial = name.charAt(0).toUpperCase();

  // Update all user displays
  if (landingUserName) landingUserName.textContent = `Welcome back, ${name}! 👋`;
  if (navUsername)     navUsername.textContent = name;
  if (navAvatar)       navAvatar.textContent = initial;
  if (landingAvatar)   landingAvatar.textContent = initial;
  if (sidebarUsername) sidebarUsername.textContent = name;
}

// ── SHOW APP ──────────────────────────────────────────────────────────────────
export function showApp() {
  authOverlay.classList.add("hidden");
  landingOverlay.classList.add("hidden");
  appContainer.classList.remove("hidden");
}

// ── TOGGLE AUTH FORMS ─────────────────────────────────────────────────────────
if (showSignup) {
  showSignup.addEventListener("click", e => {
    e.preventDefault();
    loginForm.classList.add("hidden");
    signupForm.classList.remove("hidden");
    clearErrors();
  });
}

if (showLogin) {
  showLogin.addEventListener("click", e => {
    e.preventDefault();
    signupForm.classList.add("hidden");
    loginForm.classList.remove("hidden");
    clearErrors();
  });
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    const email    = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    clearErrors();

    if (!email)    return showError("loginEmailError", "Email is required");
    if (!password) return showError("loginPasswordError", "Password is required");

    setLoading(loginBtn, true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setLoading(loginBtn, false);
      handleAuthError(err, "login");
    }
  });
}

// ── SIGNUP ────────────────────────────────────────────────────────────────────
if (signupBtn) {
  signupBtn.addEventListener("click", async () => {
    const name     = document.getElementById("signupName").value.trim();
    const email    = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;
    const confirm  = document.getElementById("signupConfirm").value;

    clearErrors();

    if (!name)              return showError("signupNameError", "Name is required");
    if (!email)             return showError("signupEmailError", "Email is required");
    if (password.length < 6) return showError("signupPasswordError", "Password must be at least 6 characters");
    if (password !== confirm) return showError("signupConfirmError", "Passwords do not match");

    setLoading(signupBtn, true);

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
    } catch (err) {
      setLoading(signupBtn, false);
      handleAuthError(err, "signup");
    }
  });
}

// ── LOGOUT ────────────────────────────────────────────────────────────────────
async function logout() {
  await signOut(auth);
}

if (logoutBtnLanding) logoutBtnLanding.addEventListener("click", logout);
if (logoutBtnSidebar) logoutBtnSidebar.addEventListener("click", logout);

// ── NAVIGATION ────────────────────────────────────────────────────────────────
if (startQuizBtn)  startQuizBtn.addEventListener("click",  showApp);
if (heroStartBtn)  heroStartBtn.addEventListener("click",  showApp);

// Tech pills on landing page
document.querySelectorAll(".tech-pill-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    showApp();
    // Trigger the tech selection after app loads
    setTimeout(() => {
      const techId = btn.dataset.tech;
      const techItem = document.querySelector(`.tech-item[data-id="${techId}"] .tech-item-header`);
      if (techItem) techItem.click();
    }, 100);
  });
});

// ── HELPERS ───────────────────────────────────────────────────────────────────
function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) { el.textContent = msg; el.classList.add("show"); }
}

function clearErrors() {
  document.querySelectorAll(".auth-error").forEach(el => {
    el.classList.remove("show");
    el.textContent = "";
  });
  document.querySelectorAll(".auth-input").forEach(el => {
    el.classList.remove("error");
  });
}

function setLoading(btn, loading) {
  const spinner = btn.querySelector(".btn-spinner");
  const text    = btn.querySelector(".btn-text");
  btn.disabled  = loading;
  if (spinner) spinner.classList.toggle("show", loading);
  if (text)    text.style.opacity = loading ? "0.5" : "1";
}

function handleAuthError(err, type) {
  const map = {
    "auth/user-not-found":      ["loginEmailError",    "No account found with this email"],
    "auth/wrong-password":      ["loginPasswordError", "Incorrect password"],
    "auth/email-already-in-use":["signupEmailError",   "Email already in use"],
    "auth/invalid-email":       [type === "login" ? "loginEmailError" : "signupEmailError", "Invalid email address"],
    "auth/weak-password":       ["signupPasswordError","Password is too weak"],
    "auth/too-many-requests":   ["loginPasswordError", "Too many attempts. Try again later"],
    "auth/invalid-credential":  ["loginPasswordError", "Invalid email or password"],
  };

  const [errorId, message] = map[err.code] || ["loginPasswordError", "Something went wrong. Try again."];
  showError(errorId, message);
}

export { currentUser };
