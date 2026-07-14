const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { generatePosters } = require('./utils/posterGenerator');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
// Enable CORS for your frontend
app.use(cors({
  origin: '*' 
}));

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure required directories exist
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const GENERATED_DIR = path.join(__dirname, 'public', 'generated');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(GENERATED_DIR)) {
  fs.mkdirSync(GENERATED_DIR, { recursive: true });
}

// Serve generated files statically
app.use('/generated', express.static(path.join(__dirname, 'public', 'generated')));

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'photo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images (JPEG, JPG, PNG, WEBP) are allowed!'));
    }
  }
});

// Poster Generation Endpoint
app.post('/api/generate', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a photo.' });
    }

    const { name, department, year, rollNo, birthdayQuote, apiKey } = req.body;

    if (!name || !department || !year || !rollNo) {
      return res.status(400).json({ error: 'Name, Department, Year, and Roll Number are required fields.' });
    }

    const studentInfo = {
      name: name.trim(),
      department: department.trim(),
      year: year.trim(),
      rollNo: rollNo.trim(),
      birthdayQuote: birthdayQuote ? birthdayQuote.trim() : 'Wishing you a day filled with laughter, love, and endless joy!'
    };

    const photoPath = req.file.path;
    const sessionId = Date.now() + '-' + Math.round(Math.random() * 1e5);

    // Generate the three posters
    const resultFiles = await generatePosters(photoPath, studentInfo, sessionId, GENERATED_DIR, apiKey);

    // Delete the original uploaded file to save disk space
    try {
      fs.unlinkSync(photoPath);
    } catch (err) {
      console.error('Error deleting temp uploaded photo:', err);
    }

    // Build absolute/relative URLs for client access
    const protocol = req.protocol;
    const host = req.get('host');
    const baseUrl = `${protocol}://${host}/generated`;

    const posters = {
      luxuryPurple: `${baseUrl}/${resultFiles.luxuryPurple}`,
      royalBlue: `${baseUrl}/${resultFiles.royalBlue}`,
      blackGold: `${baseUrl}/${resultFiles.blackGold}`
    };

    res.json({
      success: true,
      message: 'Posters generated successfully!',
      posters: posters
    });

  } catch (error) {
    console.error('Poster generation failed:', error);
    res.status(500).json({ error: 'Failed to generate posters: ' + error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'SmartWish AI Backend' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ error: err.message || 'Something went wrong on the server!' });
});

app.listen(PORT, () => {
  console.log(`SmartWish AI Backend listening on port ${PORT}`);
});
