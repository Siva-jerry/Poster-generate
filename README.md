# 🎉 SmartWish AI - Birthday Poster Generator

A premium, production-ready web application built from scratch to generate three unique, high-resolution birthday posters (Luxury Purple, Royal Blue, and Black Gold) in a single click.

## Features

- **3 Exquisite Luxury Themes**: Automatically generates different custom-styled templates (Purple, Blue, Black Gold) with unique typography, graphics, and glows.
- **Smart Image Framing**: Automatically crops, centers, and frames your uploaded photo to fit perfectly inside the poster templates.
- **High Resolution Outputs**: Exports designs at 1080x1350 px, optimized for Instagram, WhatsApp, and digital sharing.
- **Full Client-side Conversion**: Downloader supports direct lossless PNG download and browser-side canvas-driven JPG conversion.
- **Modern Responsive Design**: Fully optimized for mobile, tablet, and desktop screens with smooth glassmorphism effects and Framer Motion micro-animations.

---

## Tech Stack

- **Frontend**: React.js + Vite, Tailwind CSS, Framer Motion, React Icons, canvas-confetti
- **Backend**: Node.js, Express, Multer
- **Image Engine**: Sharp

---

## Installation & Running

Follow these steps to run the application locally:

### 1. Install all dependencies
Run this command from the root directory to install packages for the root, backend, and frontend applications:
```bash
npm run install:all
```

### 2. Start the application
Start the development server. This starts the Express server on port 5000 and the Vite frontend on port 3000 concurrently:
```bash
npm run dev
```

Open your browser and navigate to **`http://localhost:3000`**.

---

## Project Structure

```text
smartwish-ai/
├── backend/                  # Express.js backend server
│   ├── public/generated/     # Static output directory for rendered posters
│   ├── uploads/              # Temporary uploads directory
│   ├── utils/                # Poster generation logic (Sharp & SVG templates)
│   ├── package.json          # Backend dependencies
│   └── server.js             # Express routing and upload middleware
│
├── frontend/                 # React.js + Vite frontend
│   ├── src/
│   │   ├── components/       # UI components (Hero, Features, Generator, FAQ, Footer)
│   │   ├── services/         # API integration (fetches backend)
│   │   ├── App.jsx           # Main page structure & modal router
│   │   ├── index.css         # Tailwind & custom glass/glow classes
│   │   └── main.jsx          # React entry point
│   ├── index.html            # Entry HTML page
│   ├── tailwind.config.js    # Styling design tokens & custom keyframes
│   ├── vite.config.js        # Vite configurations and proxies
│   └── package.json          # Frontend dependencies
│
├── package.json              # Orchestrates both services (using concurrently)
└── README.md                 # User guide and documentation
```
