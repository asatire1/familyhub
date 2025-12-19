# 🏠 Family Hub

A beautiful, touch-optimized family dashboard designed for iPad. Think Skylight, but customizable and self-hosted!

![Family Hub](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18-61dafb.svg)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange.svg)

## ✨ Features

### 📅 Calendar & Events
- Month view with event dots
- Day view with full event details
- Color-coded events by person
- All-day and timed events
- Family-wide or personal events

### ✓ Task Management
- Kanban board (To Do → In Progress → Done)
- List view with sorting
- Priority levels (High, Medium, Low)
- Due dates with overdue alerts
- Assign tasks to family members

### ⭐ Chores & Rewards
- Daily chore tracking
- Points system for kids
- Progress bars and milestones
- Celebration animations
- Rewards shop to redeem points

### 📝 Lists
- Multiple list types (Groceries, Shopping, Wish List, To-Do)
- Custom icons and colors
- Check off items with tap
- Progress tracking
- Shared or private lists

### 🖼️ Photo Frame
- Photo gallery with grid view
- Full-screen slideshow mode
- Auto-advancing with speed control
- Favorite photos
- Keyboard navigation

### 🔐 Privacy & Security
- Multi-user PIN authentication
- Role-based permissions (Admin, Parent, Child)
- Privacy screen with ambient clock
- Auto-lock timer
- Children only see their own tasks

### ⚙️ Settings
- Family name customization
- 12/24 hour time format
- Auto-lock timer configuration
- Theme options (Dark/Light)
- Notification preferences

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Firebase account (free tier works)

### Installation

1. **Clone or extract the project**
   ```bash
   cd family-hub
   npm install
   ```

2. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create a new project
   - Enable Firestore Database
   - Get your config from Project Settings → General → Your apps

3. **Configure Environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your Firebase config:
   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=your-app-id
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Build for Production**
   ```bash
   npm run build
   ```

## 📱 iPad Setup

For the best experience on iPad:

1. **Deploy to hosting** (Netlify, Vercel, Firebase Hosting)
2. **Open in Safari** on your iPad
3. **Add to Home Screen**:
   - Tap Share button
   - Select "Add to Home Screen"
   - Name it "Family Hub"
4. **Launch from Home Screen** for full-screen mode

## 🔥 Firebase Setup

### Firestore Rules (Development)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /hubs/{hubId}/{document=**} {
      allow read, write: if true;
    }
  }
}
```

### Firestore Rules (Production)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /hubs/{hubId}/{document=**} {
      // Add your authentication logic here
      allow read, write: if request.auth != null;
    }
  }
}
```

### Collections Structure
```
hubs/
  {hubId}/
    users/          # Family members
    config/
      settings      # App settings
    chores/         # Chore definitions
    rewards/        # Reward definitions
    choreCompletions/ # Daily completions
    tasks/          # Tasks
    events/         # Calendar events
    lists/          # Shopping/to-do lists
    photos/         # Photo gallery
```

## 🎨 Customization

### Colors (src/styles/global.css)
```css
:root {
  --color-accent-blue: #5b9aff;
  --color-accent-green: #4ade80;
  --color-accent-orange: #ff9f43;
  --color-accent-pink: #ff6b9d;
  --color-accent-purple: #a78bfa;
  --color-accent-red: #ff6b6b;
  --color-accent-yellow: #ffd93d;
}
```

### Default Chores (src/context/AppContext.jsx)
```javascript
const defaultChores = [
  { name: 'Make Bed', icon: '🛏️', points: 5 },
  { name: 'Brush Teeth', icon: '🪥', points: 3 },
  // Add or modify chores here
];
```

### Default Rewards (src/context/AppContext.jsx)
```javascript
const defaultRewards = [
  { name: 'Extra Screen Time', icon: '📱', cost: 30 },
  { name: 'Choose Dinner', icon: '🍕', cost: 50 },
  // Add or modify rewards here
];
```

## 📂 Project Structure

```
family-hub/
├── src/
│   ├── components/
│   │   ├── tabs/
│   │   │   ├── CalendarTab.jsx
│   │   │   ├── TasksTab.jsx
│   │   │   ├── ChoresTab.jsx
│   │   │   ├── ListsTab.jsx
│   │   │   └── PhotosTab.jsx
│   │   ├── LoginScreen.jsx
│   │   ├── PinEntry.jsx
│   │   ├── Dashboard.jsx
│   │   ├── PrivacyScreen.jsx
│   │   ├── SettingsPanel.jsx
│   │   ├── AddUserModal.jsx
│   │   ├── AddEventModal.jsx
│   │   ├── AddTaskModal.jsx
│   │   └── AddListModal.jsx
│   ├── context/
│   │   └── AppContext.jsx
│   ├── config/
│   │   └── firebase.js
│   ├── styles/
│   │   └── global.css
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── package.json
└── README.md
```

## 🛠️ Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **Firebase Firestore** - Real-time database
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **CSS Variables** - Theming

## 👨‍👩‍👧‍👦 User Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full access, manage users, manage settings |
| **Parent** | Manage tasks, events, lists, photos |
| **Child** | View assigned tasks, complete chores, redeem rewards |

## ⌨️ Keyboard Shortcuts

### Slideshow Mode
| Key | Action |
|-----|--------|
| `→` | Next photo |
| `←` | Previous photo |
| `Space` | Play/Pause |
| `Escape` | Exit slideshow |

## 🐛 Troubleshooting

### "Firebase not configured"
- Ensure all VITE_FIREBASE_* variables are set in `.env`
- Restart the dev server after changing `.env`

### Photos not uploading
- Photos are stored as base64 in Firestore (limited to ~1MB)
- For larger photos, implement Firebase Storage

### Auto-lock not working
- Check Settings → Auto-lock Timer is not set to "Disabled"
- Activity is tracked on clicks/taps

## 📄 License

MIT License - feel free to use for personal or commercial projects!

## 🙏 Credits

Built with ❤️ for families everywhere.

---

**Enjoy your Family Hub!** 🎉
