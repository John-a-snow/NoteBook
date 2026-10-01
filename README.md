<p align="center">
  <img src="assets/Tabbed.png" alt="NOTEBOOK" width="900">
</p>

<p align="center">

  <img src="https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black" alt="React"/>

  <img src="https://img.shields.io/badge/TSX-3178C6?style=flat&logo=typescript&logoColor=white" alt="TSX"/>

  <img src="https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white" alt="Vite"/>

  <img src="https://img.shields.io/badge/CSS-1572B6?style=flat&logo=css3&logoColor=white" alt="CSS"/>

  <img src="https://img.shields.io/badge/Lucide-Icons-F56565?style=flat" alt="Lucide Icons"/>

</p>


# NOTEBOOK

**NOTEBOOK is a keyboard-first reading workspace made for reading, taking notes and keeping important thoughts connected to what you are reading.**

**The main idea is simple: A user can read a document, save notes, highlight important sections, ask questions and review them later without depending on a mouse.**

Live: [Here](https://notebook-henna-mu.vercel.app/)

# What NOTEBOOK can do

**Currently NOTEBOOK supports:**

* Reading documents in a focused workspace
* Adding notes while reading
* Highlighting important sections
* Bookmarking sections
* Full Keyboard Navigation

# How It Works

**Basic reading flow:**

```text
Open NOTEBOOK
    ↓
Select / Add Document
    ↓
Read Document
    ↓
Add Notes / Highlights / Questions
    ↓
Bookmark Important Sections
    ↓
Review Saved Annotations
```

# Keyboard Controls
```
↑ ↓ ← →     Navigate
ENTER       Select / Open
ESC         Back / Close
1           Reading Mode
2           Review Mode
3           Library
N           New Note / New Document
M           Highlight
Q           Question
B           Bookmark
R           Review Mode
/           Search
J / K       Next / Previous Section
F           Zen Mode
T           Day / Night Mode
?           Keyboard Shortcuts
Ctrl + K    Command Palette
```

# Tech Stack

Frontend

React, TypeScript, Vite, CSS, Lucide React

Storage

Browser Local Storage

# Project Structure
```
notebook/
│
├── src/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── HomeHero.tsx
│   │   ├── Kbd.tsx
│   │   ├── LibraryModal.tsx
│   │   ├── MarginThinkingSpace.tsx
│   │   ├── Modals.tsx
│   │   ├── NewDocModal.tsx
│   │   ├── ReadingView.tsx
│   │   └── ReviewMode.tsx
│   │
│   ├── types/
│   │   └── index.ts
│   │
│   ├── utils/
│   │   └── storage.ts
│   │
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
│
├── public/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── .gitignore
└── README.md
```

# How to run it locally

Install the dependencies:
```
npm install
```
Start the development server:
```
npm run dev
```

The application will be available at:
```
http://localhost:5173
```

## Built by

- [@Arushv](https://github.com/John-a-snow)