# ⟨/⟩ Tech Quiz Master

A full-featured quiz app covering **10 technologies** across **3 difficulty levels** — built with vanilla HTML, CSS & JavaScript, powered by Firebase, and deployable to Vercel.

---

## 🚀 Technologies Covered
HTML · CSS · JavaScript · React · Node.js · MongoDB · Java · Python · C++ · Bootstrap

## 📊 Quiz Levels
| Level | Questions | Focus |
|-------|-----------|-------|
| Basic | 20 | Fundamentals & syntax |
| Intermediate | 40 | Core concepts & patterns |
| Advanced | 60 | Deep knowledge & edge cases |

---

## 🛠 Setup

### 1. Clone & Open
```bash
git clone https://github.com/YOUR_USERNAME/tech-quiz-master.git
cd tech-quiz-master
# Open index.html in browser OR use Live Server in VS Code
```

### 2. Configure Firebase
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project → Add Web App
3. Copy your config and paste into `js/firebase-config.js`:

```js
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
};
```

4. In Firebase Console → Firestore Database → Create database (start in test mode)

### 3. Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts — your app will be live at yourapp.vercel.app
```

Or connect your GitHub repo directly at [vercel.com/new](https://vercel.com/new).

---

## 📁 Project Structure
```
tech-quiz-master/
├── index.html              # Main entry point
├── vercel.json             # Vercel deployment config
├── css/
│   └── style.css           # All styles (dark theme, responsive)
└── js/
    ├── firebase-config.js  # 🔧 YOUR FIREBASE CREDENTIALS HERE
    ├── questions.js        # 600 questions across 10 techs × 3 levels
    └── app.js              # Quiz logic, Firebase save, UI
```

---

## ✨ Features
- 🌙 Dark theme with orange accent
- 📱 Fully responsive (mobile sidebar)
- 🔀 Shuffled questions each attempt
- 📈 Live score tracking
- ⏱ Timer per quiz session
- 💾 Results saved to Firestore
- 🏆 Score ring animation on results
- ♿ Accessible markup

---

## 🔮 Extending the App
- **Add questions**: Edit the arrays in `js/questions.js`
- **Add a leaderboard**: Query `results` collection in Firestore sorted by `pct`
- **Add auth**: Use `firebase/auth` for user accounts
- **Add timer per question**: Add countdown in `renderQuestion()`
