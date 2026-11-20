# QuizMind Student (edu_ai_app)

React Native (Expo) mobile app for **students only**. It connects to the same QuizMind backend API as the web app.

## What students can do

- Sign in (student accounts only)
- Home dashboard (upcoming quizzes, counts, quick actions)
- My Quizzes — upcoming & completed
- Take a quiz and submit answers
- My Classes — join with code, open class detail
- My Results — scores, AI feedback, recommendations
- Progress — streak, average, subject breakdown, study recommendations
- Announcements
- Notifications
- Messages / chat
- Help
- Settings — profile, change password, send feedback/rating, logout

## Setup

```bash
cd edu_ai_app
npm install
```

Set your API base URL (default `http://127.0.0.1:4000/api/v1`):

```bash
# Windows PowerShell
$env:EXPO_PUBLIC_API_BASE_URL="https://YOUR-BACKEND/api/v1"
npm start
```

Or create `.env`:

```
EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:4000/api/v1
```

Then:

```bash
npm start
```

Scan the QR code with Expo Go (Android/iOS), or press `a` / `i` for emulator.

## Demo student login

- Email: `cedrickhakuzimana75@gmail.com`
- Password: `Quiz@2026!Demo3`

Teachers and admins should use the web app — this mobile app rejects non-student roles.
