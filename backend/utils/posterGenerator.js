const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Helper: Word wrapping for SVG text
function wrapText(text, maxChars = 52) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  words.forEach(word => {
    if ((currentLine + word).length > maxChars) {
      lines.push(currentLine.trim());
      currentLine = word + ' ';
    } else {
      currentLine += word + ' ';
    }
  });
  if (currentLine) {
    lines.push(currentLine.trim());
  }
  return lines;
}

// Complex Multi-Tiered Luxury Cake SVG Graphic
const SVGCakeDetailed = `
  <g transform="scale(0.7)">
    <!-- Stand -->
    <ellipse cx="0" cy="110" rx="100" ry="18" fill="url(#metallic-gold)" filter="drop-shadow(0px 4px 6px rgba(0,0,0,0.5))"/>
    <path d="M -30 110 L -15 145 L 15 145 L 30 110 Z" fill="url(#metallic-gold)"/>
    <ellipse cx="0" cy="145" rx="40" ry="8" fill="url(#metallic-gold)"/>

    <!-- Bottom Cake Layer (Tier 1) -->
    <path d="M -80 35 L -80 95 C -80 110, 80 110, 80 95 L 80 35 Z" fill="#1b0826" stroke="url(#metallic-gold)" stroke-width="2"/>
    <ellipse cx="0" cy="35" rx="80" ry="12" fill="#2d154f" stroke="url(#metallic-gold)" stroke-width="1"/>
    
    <!-- Tier 1 Drips & Frosting -->
    <path d="M -80 35 C -60 48, -40 25, -20 45 C 0 25, 20 48, 40 30 C 60 48, 70 30, 80 35 C 80 35, 80 50, 80 55 C 80 60, 70 58, 60 50 C 40 60, 20 50, 0 62 C -20 50, -40 62, -60 50 C -70 55, -80 50, -80 35 Z" fill="#ff70a6" opacity="0.95"/>
    <ellipse cx="0" cy="35" rx="76" ry="10" fill="#ff70a6" opacity="0.4"/>
    
    <!-- Top Cake Layer (Tier 2) -->
    <path d="M -55 -25 L -55 25 C -55 35, 55 35, 55 25 L 55 -25 Z" fill="#1b0826" stroke="url(#metallic-gold)" stroke-width="2"/>
    <ellipse cx="0" cy="-25" rx="55" ry="8" fill="#2d154f" stroke="url(#metallic-gold)" stroke-width="1"/>
    
    <!-- Tier 2 Drips -->
    <path d="M -55 -25 C -40 -15, -30 -32, -15 -18 C 0 -32, 15 -15, 30 -22 C 45 -12, 50 -20, 55 -25 C 55 -25, 55 -15, 55 -10 C 55 -5, 45 -7, 35 -15 C 20 -5, 10 -10, 0 -3 C -10 -10, -25 -3, -35 -12 C -45 -7, -55 -10, -55 -25 Z" fill="#ff70a6" opacity="0.95"/>

    <!-- Candle 1 -->
    <rect x="-15" y="-65" width="8" height="35" rx="2" fill="url(#metallic-gold)"/>
    <path d="M -15 -65 Q -10 -55 -15 -45" stroke="#ffffff" stroke-width="1.5" fill="none"/>
    <path d="M -11 -82 Q -16 -72 -11 -67 C -8 -72 -11 -82 -11 -82 Z" fill="#ff9f1c" filter="drop-shadow(0 0 5px #ff9f1c)"/>
    
    <!-- Candle 2 (Center) -->
    <rect x="-4" y="-75" width="8" height="45" rx="2" fill="#00f0ff"/>
    <path d="M -4 -70 Q 1 -60 -4 -50" stroke="#ffffff" stroke-width="1.5" fill="none"/>
    <path d="M 0 -92 Q -5 -82 0 -77 C 3 -82 0 -92 0 -92 Z" fill="#ff3f8e" filter="drop-shadow(0 0 6px #ff3f8e)"/>
    
    <!-- Candle 3 -->
    <rect x="7" y="-65" width="8" height="35" rx="2" fill="url(#metallic-gold)"/>
    <path d="M 7 -65 Q 12 -55 7 -45" stroke="#ffffff" stroke-width="1.5" fill="none"/>
    <path d="M 11 -82 Q 6 -72 11 -67 C 14 -72 11 -82 11 -82 Z" fill="#ff9f1c" filter="drop-shadow(0 0 5px #ff9f1c)"/>

    <!-- Small Star Sprinkles on cake -->
    <path d="M -40 70 L -37 73 L -34 70 L -37 67 Z" fill="#ffd700"/>
    <path d="M 40 75 L 43 78 L 46 75 L 43 72 Z" fill="#00f0ff"/>
    <path d="M -20 85 L -17 88 L -14 85 L -17 82 Z" fill="#ff70a6"/>
    <path d="M 15 80 L 18 83 L 21 80 L 18 77 Z" fill="#ffd700"/>
  </g>
`;

// Helper: Upgraded SVG Defs (Beautiful 3D balloon gradients, metallic finishes, light leaks, patterns)
const SVGDefsUpgraded = `
  <defs>
    <!-- Multi-Stop Ultra Metallic Gold (High Contrast reflection) -->
    <linearGradient id="metallic-gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#CF9E42" />
      <stop offset="20%" stop-color="#FFF3CD" />
      <stop offset="40%" stop-color="#A5792F" />
      <stop offset="60%" stop-color="#FFEFA6" />
      <stop offset="80%" stop-color="#805C1E" />
      <stop offset="100%" stop-color="#E2B755" />
    </linearGradient>

    <!-- Metallic Silver Gradient -->
    <linearGradient id="metallic-silver" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8a8a8a" />
      <stop offset="20%" stop-color="#ffffff" />
      <stop offset="40%" stop-color="#a3a3a3" />
      <stop offset="60%" stop-color="#f5f5f5" />
      <stop offset="80%" stop-color="#6b6b6b" />
      <stop offset="100%" stop-color="#d4d4d4" />
    </linearGradient>
    
    <!-- Neon Electric Cyan Gradient -->
    <linearGradient id="neon-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00F0FF" />
      <stop offset="50%" stop-color="#0072FF" />
      <stop offset="100%" stop-color="#00F0FF" />
    </linearGradient>

    <!-- 3D Balloon Gradients -->
    <radialGradient id="purple-balloon" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#E295FC" />
      <stop offset="50%" stop-color="#8C30E8" />
      <stop offset="100%" stop-color="#3A0080" />
    </radialGradient>

    <radialGradient id="gold-balloon" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#FFF9D2" />
      <stop offset="50%" stop-color="#D4AF37" />
      <stop offset="80%" stop-color="#AA7C11" />
      <stop offset="100%" stop-color="#553A00" />
    </radialGradient>

    <radialGradient id="blue-balloon" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#A5F3FC" />
      <stop offset="60%" stop-color="#0066FF" />
      <stop offset="100%" stop-color="#002266" />
    </radialGradient>

    <radialGradient id="black-balloon" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#666666" />
      <stop offset="65%" stop-color="#1A1A1A" />
      <stop offset="100%" stop-color="#050505" />
    </radialGradient>

    <!-- Glowing Filters -->
    <filter id="blur-glow-heavy" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="30" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <filter id="drop-shadow-heavy" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="16" stdDeviation="22" flood-color="#000000" flood-opacity="0.75"/>
    </filter>

    <filter id="neon-glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="10" result="blur" />
      <feComponentTransfer in="blur" result="boost">
        <feFuncA type="linear" slope="1.5"/>
      </feComponentTransfer>
      <feMerge>
        <feMergeNode in="boost" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <!-- Diagonal Line Pattern for Luxury texture -->
    <pattern id="luxury-grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 0 40 L 40 0 M 0 0 L 40 40" fill="none" stroke="#ffffff" stroke-width="0.7" opacity="0.03" />
    </pattern>

    <!-- Dot Pattern for Royal Blue Tech theme -->
    <pattern id="tech-dots" width="30" height="30" patternUnits="userSpaceOnUse">
      <circle cx="15" cy="15" r="1" fill="#00f0ff" opacity="0.08" />
    </pattern>
  </defs>
`;

/**
 * Main function: Generates three distinct, premium posters.
 */
async function generatePosters(photoPath, studentInfo, sessionId, outputDir) {
  const metadata = await sharp(photoPath).metadata();
  
  // Crop & Prepare User Photo with advanced centering
  const squareSize = Math.min(metadata.width, metadata.height);
  const sqLeft = Math.floor((metadata.width - squareSize) / 2);
  const sqTop = Math.floor((metadata.height - squareSize) * 0.28); // Focus around upper head height

  // 1. Circular photo (Purple Theme)
  const squarePhotoBuffer = await sharp(photoPath)
    .extract({ 
      left: sqLeft, 
      top: Math.max(0, Math.min(sqTop, metadata.height - squareSize)), 
      width: squareSize, 
      height: squareSize 
    })
    .resize(460, 460, { fit: 'cover' })
    .png()
    .toBuffer();

  const circleMask = Buffer.from(
    `<svg width="460" height="460"><circle cx="230" cy="230" r="226" fill="white"/></svg>`
  );
  const circularPhoto = await sharp(squarePhotoBuffer)
    .composite([{ input: circleMask, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // 2. Squircle photo (Blue Theme)
  const squircleMask = Buffer.from(
    `<svg width="460" height="460"><rect x="10" y="10" width="440" height="440" rx="80" ry="80" fill="white"/></svg>`
  );
  const squirclePhoto = await sharp(squarePhotoBuffer)
    .composite([{ input: squircleMask, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // 3. Tall rectangular photo (Black Gold Theme)
  const tallWidth = Math.min(metadata.width, Math.floor(metadata.height * 0.72));
  const tallHeight = Math.floor(tallWidth * 1.3); // 1.3 ratio
  const tallLeft = Math.floor((metadata.width - tallWidth) / 2);
  const tallTop = Math.floor((metadata.height - tallHeight) * 0.28);

  const tallPhotoBuffer = await sharp(photoPath)
    .extract({
      left: tallLeft,
      top: Math.max(0, Math.min(tallTop, metadata.height - tallHeight)),
      width: tallWidth,
      height: tallHeight
    })
    .resize(410, 530, { fit: 'cover' })
    .png()
    .toBuffer();

  const roundedRectMask = Buffer.from(
    `<svg width="410" height="530"><rect x="0" y="0" width="410" height="530" rx="30" ry="30" fill="white"/></svg>`
  );
  const rectPhoto = await sharp(tallPhotoBuffer)
    .composite([{ input: roundedRectMask, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // Wrap Quote lines
  const quoteLines = wrapText(studentInfo.birthdayQuote, 52);

  // Setup files
  const files = {
    luxuryPurple: `purple-${sessionId}.png`,
    royalBlue: `blue-${sessionId}.png`,
    blackGold: `blackgold-${sessionId}.png`
  };

  // Generate Themes
  await generateThemePurple(circularPhoto, studentInfo, quoteLines, path.join(outputDir, files.luxuryPurple));
  await generateThemeBlue(squirclePhoto, studentInfo, quoteLines, path.join(outputDir, files.royalBlue));
  await generateThemeBlackGold(rectPhoto, studentInfo, quoteLines, path.join(outputDir, files.blackGold));

  return files;
}

/**
 * THEME 1: LUXURY PURPLE (Elegant Royal Vibe)
 */
async function generateThemePurple(photoBuffer, info, quoteLines, destPath) {
  // Rich background with purple shades and luxury texture
  const bgSvg = Buffer.from(
    `<svg width="1080" height="1350">
      <defs>
        <radialGradient id="purple-bg" cx="50%" cy="40%" r="85%">
          <stop offset="0%" stop-color="#3E1A66" />
          <stop offset="45%" stop-color="#190B2B" />
          <stop offset="100%" stop-color="#090312" />
        </radialGradient>
      </defs>
      <!-- Base Gradient -->
      <rect width="1080" height="1350" fill="url(#purple-bg)"/>
      <!-- Grid Overlay for luxury feel -->
      <rect width="1080" height="1350" fill="url(#luxury-grid)"/>
    </svg>`
  );

  const svgOverlay = `
    <svg width="1080" height="1350">
      ${SVGDefsUpgraded}
      
      <!-- Lighting flares -->
      <circle cx="540" cy="520" r="380" fill="#9D4EDD" opacity="0.16" filter="url(#blur-glow-heavy)"/>
      <circle cx="540" cy="180" r="280" fill="#FFE07D" opacity="0.08" filter="url(#blur-glow-heavy)"/>

      <!-- Gorgeous Double Border with ornate corners -->
      <rect x="35" y="35" width="1010" height="1280" rx="20" fill="none" stroke="url(#metallic-gold)" stroke-width="4.5" filter="url(#drop-shadow-heavy)"/>
      <rect x="52" y="52" width="976" height="1246" rx="14" fill="none" stroke="url(#metallic-gold)" stroke-width="1.5" stroke-dasharray="14 7" opacity="0.7"/>

      <!-- Ornate corners details -->
      <path d="M 28 65 L 65 65 L 65 28" fill="none" stroke="url(#metallic-gold)" stroke-width="4.5"/>
      <path d="M 1052 65 L 1015 65 L 1015 28" fill="none" stroke="url(#metallic-gold)" stroke-width="4.5"/>
      <path d="M 28 1285 L 65 1285 L 65 1322" fill="none" stroke="url(#metallic-gold)" stroke-width="4.5"/>
      <path d="M 1052 1285 L 1015 1285 L 1015 1322" fill="none" stroke="url(#metallic-gold)" stroke-width="4.5"/>

      <!-- Floating 3D Balloons (Left Stack) -->
      <g transform="translate(130, 380) scale(0.95)" filter="url(#drop-shadow-heavy)">
        <!-- String -->
        <path d="M 0 0 Q -10 40 10 90 T -5 160" stroke="url(#metallic-gold)" stroke-width="2" fill="none" opacity="0.5"/>
        <!-- Balloon 1 (Gold) -->
        <path d="M 0 0 C -45 -60, -45 -130, 0 -140 C 45 -130, 45 -60, 0 0 Z" fill="url(#gold-balloon)" />
        <ellipse cx="-15" cy="-90" rx="8" ry="25" fill="#ffffff" opacity="0.25" transform="rotate(-15 -15 -90)" />
      </g>
      <g transform="translate(80, 440) scale(0.8)" filter="url(#drop-shadow-heavy)">
        <path d="M 0 0 Q 15 40 -5 95 T 10 170" stroke="#ffffff" stroke-width="1.5" fill="none" opacity="0.4"/>
        <path d="M 0 0 C -45 -60, -45 -130, 0 -140 C 45 -130, 45 -60, 0 0 Z" fill="url(#purple-balloon)" />
        <ellipse cx="-15" cy="-90" rx="8" ry="25" fill="#ffffff" opacity="0.25" transform="rotate(-15 -15 -90)" />
      </g>

      <!-- Floating 3D Balloons (Right Stack) -->
      <g transform="translate(950, 360) scale(1.05)" filter="url(#drop-shadow-heavy)">
        <path d="M 0 0 Q 10 40 -15 90 T 5 180" stroke="#ffffff" stroke-width="2" fill="none" opacity="0.4"/>
        <path d="M 0 0 C -45 -60, -45 -130, 0 -140 C 45 -130, 45 -60, 0 0 Z" fill="url(#purple-balloon)" />
        <ellipse cx="-15" cy="-90" rx="8" ry="25" fill="#ffffff" opacity="0.25" transform="rotate(-15 -15 -90)" />
      </g>
      <g transform="translate(990, 430) scale(0.82)" filter="url(#drop-shadow-heavy)">
        <path d="M 0 0 Q -15 35 10 80 T -5 160" stroke="url(#metallic-gold)" stroke-width="1.5" fill="none" opacity="0.5"/>
        <path d="M 0 0 C -45 -60, -45 -130, 0 -140 C 45 -130, 45 -60, 0 0 Z" fill="url(#gold-balloon)" />
        <ellipse cx="-15" cy="-90" rx="8" ry="25" fill="#ffffff" opacity="0.25" transform="rotate(-15 -15 -90)" />
      </g>

      <!-- Shimmer/Confetti/Glitter particles -->
      <g fill="url(#metallic-gold)">
        <!-- Beautiful Sparkles -->
        <path d="M 220 220 Q 220 235 235 235 Q 220 235 220 250 Q 220 235 205 235 Q 220 235 220 220 Z" filter="url(#neon-glow-cyan)"/>
        <path d="M 860 250 Q 860 262 872 262 Q 860 262 860 274 Q 860 262 848 262 Q 860 262 860 250 Z" />
        <path d="M 160 910 Q 160 918 168 918 Q 160 918 160 926 Q 160 918 152 918 Q 160 918 160 910 Z" />
        <path d="M 910 890 Q 910 898 918 898 Q 910 898 910 906 Q 910 898 902 898 Q 910 898 910 890 Z" />
        <!-- Floating circular particles -->
        <circle cx="280" cy="180" r="4"/>
        <circle cx="800" cy="190" r="5" opacity="0.8"/>
        <circle cx="340" cy="300" r="3" opacity="0.5"/>
        <circle cx="730" cy="280" r="4.5" opacity="0.7"/>
        <circle cx="180" cy="800" r="4" opacity="0.6"/>
        <circle cx="890" cy="810" r="5" opacity="0.6"/>
      </g>

      <!-- Header Banner & Typography -->
      <text x="540" y="140" font-family="'Georgia', serif" font-size="28" font-weight="bold" fill="url(#metallic-gold)" letter-spacing="14" text-anchor="middle">EXCLUSIVE CELEBRATION</text>
      
      <!-- Styled Calligraphic "Happy Birthday" with layers -->
      <text x="540" y="245" font-family="'Georgia', serif" font-size="94" font-weight="900" fill="#0c0414" stroke="url(#metallic-gold)" stroke-width="8" stroke-linejoin="round" letter-spacing="3" text-anchor="middle" filter="url(#drop-shadow-heavy)">HAPPY BIRTHDAY</text>
      <text x="540" y="245" font-family="'Georgia', serif" font-size="94" font-weight="900" fill="url(#metallic-gold)" letter-spacing="3" text-anchor="middle">HAPPY BIRTHDAY</text>

      <!-- Frame Rings for User Photo -->
      <circle cx="540" cy="530" r="248" fill="none" stroke="#9D4EDD" stroke-width="4.5" opacity="0.6" filter="url(#neon-glow-cyan)"/>
      <circle cx="540" cy="530" r="238" fill="none" stroke="url(#metallic-gold)" stroke-width="9.5" filter="url(#drop-shadow-heavy)"/>
      <circle cx="540" cy="530" r="229" fill="none" stroke="#000000" stroke-width="3" opacity="0.5"/>

      <!-- Cake SVG Details (Left Side) -->
      <g transform="translate(195, 755)">
        ${SVGCakeDetailed}
      </g>

      <!-- Student details section -->
      <text x="540" y="830" font-family="'Georgia', serif" font-size="56" font-weight="bold" fill="url(#metallic-gold)" filter="url(#drop-shadow-heavy)" text-anchor="middle">${info.name.toUpperCase()}</text>
      
      <!-- Sub-headers -->
      <text x="540" y="882" font-family="'Arial', sans-serif" font-size="24" font-weight="bold" fill="#ffffff" letter-spacing="5" text-anchor="middle">${info.department.toUpperCase()}</text>
      <text x="540" y="922" font-family="'Arial', sans-serif" font-size="19" fill="#dfc0eb" letter-spacing="3.5" text-anchor="middle">${info.year.toUpperCase()} YEAR • ROLL NO: ${info.rollNo}</text>

      <!-- Quote Box - Semi-transparent Glassmorphism (High Quality) -->
      <g transform="translate(140, 975)">
        <rect x="0" y="0" width="800" height="225" rx="24" fill="#ffffff" fill-opacity="0.04" stroke="url(#metallic-gold)" stroke-width="2" filter="url(#drop-shadow-heavy)" />
        <rect x="3" y="3" width="794" height="219" rx="21" fill="none" stroke="#ffffff" stroke-width="0.5" opacity="0.18"/>
        
        <!-- Ornate Quote Symbols -->
        <text x="45" y="70" font-family="'Georgia', serif" font-size="95" font-weight="bold" fill="url(#metallic-gold)" opacity="0.32">“</text>
        <text x="725" y="195" font-family="'Georgia', serif" font-size="95" font-weight="bold" fill="url(#metallic-gold)" opacity="0.32">”</text>

        <!-- Quote Lines -->
        <text font-family="'Georgia', serif" font-style="italic" font-size="24" fill="#ffffff" text-anchor="middle">
          ${quoteLines.map((line, i) => `<tspan x="400" y="${92 + i * 36}">${line}</tspan>`).join('')}
        </text>
      </g>
      
      <!-- Footer brand details -->
      <text x="540" y="1290" font-family="'Arial', sans-serif" font-size="15" fill="#5c4d6b" letter-spacing="7" text-anchor="middle">DESIGNED BY SMARTWISH AI</text>
    </svg>
  `;

  await sharp(bgSvg)
    .composite([
      { input: photoBuffer, top: 300, left: 310 }, // Fits perfectly inside r=230 frame centered at 540,530
      { input: Buffer.from(svgOverlay), top: 0, left: 0 }
    ])
    .png()
    .toFile(destPath);
}

/**
 * THEME 2: ROYAL BLUE (Modern Cyber Glowing Vibe)
 */
async function generateThemeBlue(photoBuffer, info, quoteLines, destPath) {
  // Deep Blue gradient with digital tech dots
  const bgSvg = Buffer.from(
    `<svg width="1080" height="1350">
      <defs>
        <radialGradient id="blue-bg" cx="50%" cy="40%" r="85%">
          <stop offset="0%" stop-color="#0B256B" />
          <stop offset="50%" stop-color="#040F2D" />
          <stop offset="100%" stop-color="#01040D" />
        </radialGradient>
      </defs>
      <rect width="1080" height="1350" fill="url(#blue-bg)"/>
      <rect width="1080" height="1350" fill="url(#tech-dots)"/>
    </svg>`
  );

  const svgOverlay = `
    <svg width="1080" height="1350">
      ${SVGDefsUpgraded}
      
      <!-- Cyber Lighting effects -->
      <circle cx="540" cy="520" r="390" fill="#00f0ff" opacity="0.16" filter="url(#blur-glow-heavy)"/>
      <circle cx="900" cy="850" r="280" fill="#7000FF" opacity="0.14" filter="url(#blur-glow-heavy)"/>

      <!-- Glowing Cyan Cyber Border -->
      <rect x="35" y="35" width="1010" height="1280" rx="24" fill="none" stroke="url(#neon-cyan)" stroke-width="4.5" filter="url(#neon-glow-cyan)"/>
      <rect x="48" y="48" width="984" height="1254" rx="18" fill="none" stroke="url(#metallic-silver)" stroke-width="1.5" opacity="0.6"/>

      <!-- Tech Corner Crosshairs -->
      <path d="M 20 50 L 50 50 L 50 20" fill="none" stroke="#00F0FF" stroke-width="4"/>
      <path d="M 1060 50 L 1030 50 L 1030 20" fill="none" stroke="#00F0FF" stroke-width="4"/>
      <path d="M 20 1300 L 50 1300 L 50 1330" fill="none" stroke="#00F0FF" stroke-width="4"/>
      <path d="M 1060 1300 L 1030 1300 L 1030 1330" fill="none" stroke="#00F0FF" stroke-width="4"/>

      <!-- 3D Electric Balloons (Left Stack) -->
      <g transform="translate(130, 390) scale(0.95)" filter="url(#drop-shadow-heavy)">
        <path d="M 0 0 Q -15 40 10 95" stroke="#00f0ff" stroke-width="2" fill="none" opacity="0.5"/>
        <path d="M 0 0 C -45 -60, -45 -130, 0 -140 C 45 -130, 45 -60, 0 0 Z" fill="url(#blue-balloon)" />
        <ellipse cx="-15" cy="-90" rx="8" ry="25" fill="#ffffff" opacity="0.3" transform="rotate(-15 -15 -90)" />
      </g>
      <g transform="translate(75, 450) scale(0.78)" filter="url(#drop-shadow-heavy)">
        <path d="M 0 0 Q 10 35 -10 90" stroke="url(#metallic-silver)" stroke-width="1.5" fill="none" opacity="0.5"/>
        <path d="M 0 0 C -45 -60, -45 -130, 0 -140 C 45 -130, 45 -60, 0 0 Z" fill="url(#black-balloon)" />
        <ellipse cx="-15" cy="-90" rx="8" ry="25" fill="#ffffff" opacity="0.2" transform="rotate(-15 -15 -90)" />
      </g>

      <!-- 3D Electric Balloons (Right Stack) -->
      <g transform="translate(950, 370) scale(1.05)" filter="url(#drop-shadow-heavy)">
        <path d="M 0 0 Q 15 40 -5 95" stroke="url(#metallic-silver)" stroke-width="2" fill="none" opacity="0.5"/>
        <path d="M 0 0 C -45 -60, -45 -130, 0 -140 C 45 -130, 45 -60, 0 0 Z" fill="url(#blue-balloon)" />
        <ellipse cx="-15" cy="-90" rx="8" ry="25" fill="#ffffff" opacity="0.3" transform="rotate(-15 -15 -90)" />
      </g>
      <g transform="translate(995, 440) scale(0.8)" filter="url(#drop-shadow-heavy)">
        <path d="M 0 0 Q -10 35 15 85" stroke="#00f0ff" stroke-width="1.5" fill="none" opacity="0.5"/>
        <path d="M 0 0 C -45 -60, -45 -130, 0 -140 C 45 -130, 45 -60, 0 0 Z" fill="url(#black-balloon)" />
        <ellipse cx="-15" cy="-90" rx="8" ry="25" fill="#ffffff" opacity="0.2" transform="rotate(-15 -15 -90)" />
      </g>

      <!-- Star bursts and sparks -->
      <g fill="#00FFFF" filter="url(#neon-glow-cyan)">
        <polygon points="200,200 203,212 215,215 203,218 200,230 197,218 185,215 197,212"/>
        <polygon points="880,240 882,248 890,250 882,252 880,260 878,252 870,250 878,248"/>
        <circle cx="310" cy="180" r="3"/>
        <circle cx="770" cy="170" r="4"/>
      </g>

      <path d="M 50 150 L 1030 150" stroke="#00f0ff" stroke-width="1.5" opacity="0.25"/>
      <path d="M 50 1200 L 1030 1200" stroke="#00f0ff" stroke-width="1.5" opacity="0.25"/>

      <!-- Header Typography -->
      <text x="540" y="135" font-family="'Montserrat', sans-serif" font-size="28" font-weight="900" fill="#00FFFF" letter-spacing="15" text-anchor="middle" filter="url(#neon-glow-cyan)">CYBER CELEBRATION</text>
      
      <!-- Big styled birthday header -->
      <text x="540" y="245" font-family="'Montserrat', sans-serif" font-size="94" font-weight="900" fill="#040f2d" stroke="url(#neon-cyan)" stroke-width="8" stroke-linejoin="round" letter-spacing="2" text-anchor="middle" filter="url(#drop-shadow-heavy)">HAPPY BIRTHDAY</text>
      <text x="540" y="245" font-family="'Montserrat', sans-serif" font-size="94" font-weight="900" fill="#ffffff" letter-spacing="2" text-anchor="middle">HAPPY BIRTHDAY</text>

      <!-- Glowing squircle frame for user photo -->
      <rect x="302" y="292" width="476" height="476" rx="84" ry="84" fill="none" stroke="url(#neon-cyan)" stroke-width="9.5" filter="url(#drop-shadow-heavy)"/>
      <rect x="312" y="302" width="456" height="456" rx="74" ry="74" fill="none" stroke="url(#metallic-silver)" stroke-width="3" opacity="0.6"/>

      <!-- Detailed Cake silhouette (Right Side rotated) -->
      <g transform="translate(885, 775) rotate(-8)">
        ${SVGCakeDetailed}
      </g>

      <!-- Student details section (Futuristic tech styles) -->
      <text x="540" y="830" font-family="'Montserrat', sans-serif" font-size="56" font-weight="900" fill="url(#neon-cyan)" filter="url(#neon-glow-cyan)" text-anchor="middle">${info.name.toUpperCase()}</text>
      <text x="540" y="885" font-family="'Montserrat', sans-serif" font-size="24" font-weight="bold" fill="#ffffff" letter-spacing="6" text-anchor="middle">${info.department.toUpperCase()}</text>
      <text x="540" y="925" font-family="'Montserrat', sans-serif" font-size="19" fill="#00FFFF" letter-spacing="4" text-anchor="middle">${info.year.toUpperCase()} YEAR • ROLL NO: ${info.rollNo}</text>

      <!-- Quote Box - Cyber Glass (High Contrast) -->
      <g transform="translate(140, 975)">
        <rect x="0" y="0" width="800" height="215" rx="20" fill="#040f2d" fill-opacity="0.75" stroke="#00FFFF" stroke-width="2.5" filter="url(#drop-shadow-heavy)" />
        <rect x="4" y="4" width="792" height="207" rx="16" fill="none" stroke="#ffffff" stroke-width="0.5" opacity="0.12"/>
        
        <!-- Tech Corners inside box -->
        <path d="M 12 30 L 12 12 L 30 12" fill="none" stroke="#00FFFF" stroke-width="3.5"/>
        <path d="M 788 30 L 788 12 L 770 12" fill="none" stroke="#00FFFF" stroke-width="3.5"/>
        <path d="M 12 185 L 12 203 L 30 203" fill="none" stroke="#00FFFF" stroke-width="3.5"/>
        <path d="M 788 185 L 788 203 L 770 203" fill="none" stroke="#00FFFF" stroke-width="3.5"/>

        <!-- Quote Lines -->
        <text font-family="'Montserrat', sans-serif" font-size="22" font-weight="bold" fill="#ffffff" text-anchor="middle">
          ${quoteLines.map((line, i) => `<tspan x="400" y="${84 + i * 36}">${line}</tspan>`).join('')}
        </text>
      </g>
      
      <!-- Footer brand -->
      <text x="540" y="1290" font-family="'Montserrat', sans-serif" font-size="14" fill="#00f0ff" opacity="0.4" letter-spacing="9" text-anchor="middle">POWERED BY SMARTWISH AI</text>
    </svg>
  `;

  await sharp(bgSvg)
    .composite([
      { input: photoBuffer, top: 300, left: 310 }, // Center matches squircle frame
      { input: Buffer.from(svgOverlay), top: 0, left: 0 }
    ])
    .png()
    .toFile(destPath);
}

/**
 * THEME 3: BLACK GOLD (High-End Luxury Editorial Vibe)
 */
async function generateThemeBlackGold(photoBuffer, info, quoteLines, destPath) {
  // Pure matte black background with gold shimmering radial glow
  const bgSvg = Buffer.from(
    `<svg width="1080" height="1350">
      <defs>
        <radialGradient id="black-bg" cx="50%" cy="35%" r="85%">
          <stop offset="0%" stop-color="#1E1E1E" />
          <stop offset="50%" stop-color="#0B0B0B" />
          <stop offset="100%" stop-color="#020202" />
        </radialGradient>
      </defs>
      <rect width="1080" height="1350" fill="url(#black-bg)"/>
      <rect width="1080" height="1350" fill="url(#luxury-grid)"/>
    </svg>`
  );

  const svgOverlay = `
    <svg width="1080" height="1350">
      ${SVGDefsUpgraded}
      
      <!-- Warm Gold Light Source from top -->
      <circle cx="540" cy="150" r="420" fill="url(#metallic-gold)" opacity="0.08" filter="url(#blur-glow-heavy)"/>
      <circle cx="540" cy="550" r="320" fill="#AA7C11" opacity="0.07" filter="url(#blur-glow-heavy)"/>

      <!-- Gorgeous Ornamental Double Border -->
      <rect x="40" y="40" width="1000" height="1270" fill="none" stroke="url(#metallic-gold)" stroke-width="4.5" filter="url(#drop-shadow-heavy)"/>
      <rect x="52" y="52" width="976" height="1246" fill="none" stroke="url(#metallic-gold)" stroke-width="1.5" stroke-dasharray="16 8" opacity="0.6"/>

      <!-- Filigree corner accents -->
      <g fill="none" stroke="url(#metallic-gold)" stroke-width="3">
        <!-- Top Left -->
        <rect x="35" y="35" width="40" height="40" fill="url(#metallic-gold)" stroke="none"/>
        <path d="M 85 40 L 85 85 L 40 85"/>
        <circle cx="85" cy="85" r="5" fill="url(#metallic-gold)"/>

        <!-- Top Right -->
        <rect x="1005" y="35" width="40" height="40" fill="url(#metallic-gold)" stroke="none"/>
        <path d="M 995 40 L 995 85 L 1040 85"/>
        <circle cx="995" cy="85" r="5" fill="url(#metallic-gold)"/>

        <!-- Bottom Left -->
        <rect x="35" y="1275" width="40" height="40" fill="url(#metallic-gold)" stroke="none"/>
        <path d="M 85 1310 L 85 1265 L 40 1265"/>
        <circle cx="85" cy="1265" r="5" fill="url(#metallic-gold)"/>

        <!-- Bottom Right -->
        <rect x="1005" y="1275" width="40" height="40" fill="url(#metallic-gold)" stroke="none"/>
        <path d="M 995 1310 L 995 1265 L 1040 1265"/>
        <circle cx="995" cy="1265" r="5" fill="url(#metallic-gold)"/>
      </g>

      <!-- 3D Luxury Black & Gold Balloons (Left Stack) -->
      <g transform="translate(130, 400) scale(0.95)" filter="url(#drop-shadow-heavy)">
        <path d="M 0 0 Q -15 40 10 90" stroke="url(#metallic-gold)" stroke-width="2" fill="none" opacity="0.6"/>
        <path d="M 0 0 C -45 -60, -45 -130, 0 -140 C 45 -130, 45 -60, 0 0 Z" fill="url(#gold-balloon)" />
        <ellipse cx="-15" cy="-90" rx="8" ry="25" fill="#ffffff" opacity="0.25" transform="rotate(-15 -15 -90)" />
      </g>
      <g transform="translate(75, 460) scale(0.78)" filter="url(#drop-shadow-heavy)">
        <path d="M 0 0 Q 15 35 -10 85" stroke="#ffffff" stroke-width="1.5" fill="none" opacity="0.4"/>
        <path d="M 0 0 C -45 -60, -45 -130, 0 -140 C 45 -130, 45 -60, 0 0 Z" fill="url(#black-balloon)" />
        <ellipse cx="-15" cy="-90" rx="8" ry="25" fill="#ffffff" opacity="0.2" transform="rotate(-15 -15 -90)" />
      </g>

      <!-- 3D Luxury Black & Gold Balloons (Right Stack) -->
      <g transform="translate(950, 380) scale(1.05)" filter="url(#drop-shadow-heavy)">
        <path d="M 0 0 Q 10 40 -15 90" stroke="#ffffff" stroke-width="2" fill="none" opacity="0.4"/>
        <path d="M 0 0 C -45 -60, -45 -130, 0 -140 C 45 -130, 45 -60, 0 0 Z" fill="url(#black-balloon)" />
        <ellipse cx="-15" cy="-90" rx="8" ry="25" fill="#ffffff" opacity="0.2" transform="rotate(-15 -15 -90)" />
      </g>
      <g transform="translate(995, 450) scale(0.82)" filter="url(#drop-shadow-heavy)">
        <path d="M 0 0 Q -15 35 10 80" stroke="url(#metallic-gold)" stroke-width="1.5" fill="none" opacity="0.6"/>
        <path d="M 0 0 C -45 -60, -45 -130, 0 -140 C 45 -130, 45 -60, 0 0 Z" fill="url(#gold-balloon)" />
        <ellipse cx="-15" cy="-90" rx="8" ry="25" fill="#ffffff" opacity="0.25" transform="rotate(-15 -15 -90)" />
      </g>

      <!-- Gold Glitter Dust scattered around -->
      <g fill="url(#metallic-gold)" filter="url(#drop-shadow-heavy)">
        <!-- Elegant diamonds & stars -->
        <path d="M 230 200 L 234 212 L 246 216 L 234 220 L 230 232 L 226 220 L 214 216 L 226 212 Z" />
        <path d="M 850 220 L 853 230 L 863 233 L 853 236 L 850 246 L 847 236 L 837 233 L 847 230 Z" />
        <circle cx="280" cy="130" r="3.5"/>
        <circle cx="780" cy="110" r="4"/>
        <circle cx="340" cy="240" r="2.5" opacity="0.6"/>
        <circle cx="720" cy="220" r="3.5" opacity="0.8"/>
      </g>

      <!-- Header Typography -->
      <text x="540" y="140" font-family="'Georgia', serif" font-size="28" font-weight="normal" fill="url(#metallic-gold)" letter-spacing="14" text-anchor="middle">PREMIUM SELECTION</text>
      
      <!-- Script Serif layered text -->
      <text x="540" y="245" font-family="'Georgia', serif" font-size="94" font-weight="bold" fill="#040404" stroke="url(#metallic-gold)" stroke-width="8" stroke-linejoin="round" letter-spacing="4" text-anchor="middle" filter="url(#drop-shadow-heavy)">HAPPY BIRTHDAY</text>
      <text x="540" y="245" font-family="'Georgia', serif" font-size="94" font-weight="bold" fill="url(#metallic-gold)" letter-spacing="4" text-anchor="middle">HAPPY BIRTHDAY</text>

      <!-- Tall Rectangular Gold Frame with notches -->
      <rect x="328" y="283" width="424" height="544" rx="34" fill="none" stroke="url(#metallic-gold)" stroke-width="10.5" filter="url(#drop-shadow-heavy)"/>
      <rect x="335" y="290" width="410" height="530" rx="27" fill="none" stroke="#000000" stroke-width="4.5" opacity="0.95"/>
      
      <!-- Corner notches inside frame -->
      <g stroke="url(#metallic-gold)" stroke-width="2.5" fill="none">
        <path d="M 345 320 L 345 305 L 360 305" />
        <path d="M 735 320 L 735 305 L 720 305" />
        <path d="M 345 790 L 345 805 L 360 805" />
        <path d="M 735 790 L 735 805 L 720 805" />
      </g>

      <!-- Detailed gold cake illustration (Left Side) -->
      <g transform="translate(195, 755)">
        ${SVGCakeDetailed}
      </g>

      <!-- Student details section (Serif Gold Elegant) -->
      <text x="540" y="855" font-family="'Georgia', serif" font-size="56" font-weight="bold" fill="url(#metallic-gold)" filter="url(#drop-shadow-heavy)" text-anchor="middle">${info.name.toUpperCase()}</text>
      
      <text x="540" y="905" font-family="'Georgia', serif" font-size="24" font-weight="bold" fill="#ffffff" letter-spacing="7" text-anchor="middle">${info.department.toUpperCase()}</text>
      <text x="540" y="945" font-family="'Georgia', serif" font-style="italic" font-size="19" fill="url(#metallic-gold)" letter-spacing="3.5" text-anchor="middle">${info.year.toUpperCase()} YEAR • ROLL NO: ${info.rollNo}</text>

      <!-- Quote Box - Traditional Gold Brass Plate -->
      <g transform="translate(140, 990)">
        <rect x="0" y="0" width="800" height="215" rx="14" fill="#0d0d0d" stroke="url(#metallic-gold)" stroke-width="2.5" filter="url(#drop-shadow-heavy)" />
        <rect x="5" y="5" width="790" height="205" rx="10" fill="none" stroke="url(#metallic-gold)" stroke-width="0.8" opacity="0.45"/>
        
        <!-- Screws on plate -->
        <circle cx="16" cy="16" r="3.5" fill="url(#metallic-gold)"/>
        <circle cx="784" cy="16" r="3.5" fill="url(#metallic-gold)"/>
        <circle cx="16" cy="199" r="3.5" fill="url(#metallic-gold)"/>
        <circle cx="784" cy="199" r="3.5" fill="url(#metallic-gold)"/>

        <!-- Quote Lines -->
        <text font-family="'Georgia', serif" font-style="italic" font-size="22" fill="#ffffff" text-anchor="middle">
          ${quoteLines.map((line, i) => `<tspan x="400" y="${82 + i * 36}">${line}</tspan>`).join('')}
        </text>
      </g>
      
      <!-- Footer brand -->
      <text x="540" y="1290" font-family="'Georgia', serif" font-size="14" fill="url(#metallic-gold)" opacity="0.5" letter-spacing="9" text-anchor="middle">MADE WITH SMARTWISH AI</text>
    </svg>
  `;

  await sharp(bgSvg)
    .composite([
      { input: photoBuffer, top: 290, left: 335 }, // Fits rectangular crop perfectly inside coordinates
      { input: Buffer.from(svgOverlay), top: 0, left: 0 }
    ])
    .png()
    .toFile(destPath);
}

module.exports = {
  generatePosters
};
