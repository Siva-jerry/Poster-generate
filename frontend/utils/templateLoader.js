import {
  IText,
  Rect,
  Circle,
  Group,
  Shadow,
  FabricImage,
  Gradient,
} from "fabric";

export const POSTER_BASE_WIDTH = 1080;
export const POSTER_BASE_HEIGHT = 1350;

/*
|--------------------------------------------------------------------------
| Load High-Fidelity Canva Birthday Flex Poster Template
|--------------------------------------------------------------------------
*/

export function loadPosterTemplate(canvas, options = {}) {
  if (!canvas) return;

  const {
    posterImage = null,
    collegeName = "COLLEGE OF ENGINEERING & TECHNOLOGY",
    studentName = "HERMIONE JEAN GRANGER",
    department = "Dept. of Computer Science & Engineering",
    year = "Final Year",
    rollNo = "21CS108",
    heading = "HAPPY BIRTHDAY",
    quote = "Wishing you a spectacular birthday filled with happiness, triumph and great milestones ahead!",
    theme = "gold", // "gold", "neon", "royal", "rose", "cinema", "varsity"
  } = options;

  canvas.clear();

  const width = POSTER_BASE_WIDTH;
  const height = POSTER_BASE_HEIGHT;

  // Theme palettes
  const THEMES = {
    gold: {
      bg: "#0A0A0E",
      primary: "#D4AF37",
      secondary: "#FFF5C0",
      accent: "#FF6B1A",
      text: "#FFFFFF",
      badgeBg: "rgba(212, 175, 55, 0.20)",
      frameBg: "rgba(212, 175, 55, 0.08)",
    },
    neon: {
      bg: "#090214",
      primary: "#00F2FE",
      secondary: "#FF3864",
      accent: "#7C3CFF",
      text: "#FFFFFF",
      badgeBg: "rgba(0, 242, 254, 0.20)",
      frameBg: "rgba(0, 242, 254, 0.08)",
    },
    royal: {
      bg: "#050B1A",
      primary: "#38EF7D",
      secondary: "#D4AF37",
      accent: "#00F2FE",
      text: "#FFFFFF",
      badgeBg: "rgba(56, 239, 125, 0.20)",
      frameBg: "rgba(56, 239, 125, 0.08)",
    },
    rose: {
      bg: "#180512",
      primary: "#FF7597",
      secondary: "#FFE0EC",
      accent: "#D4AF37",
      text: "#FFFFFF",
      badgeBg: "rgba(255, 117, 151, 0.20)",
      frameBg: "rgba(255, 117, 151, 0.08)",
    },
    cinema: {
      bg: "#0B0B0F",
      primary: "#FFA751",
      secondary: "#FFE259",
      accent: "#E50914",
      text: "#FFFFFF",
      badgeBg: "rgba(255, 167, 81, 0.20)",
      frameBg: "rgba(255, 167, 81, 0.08)",
    },
    varsity: {
      bg: "#08101E",
      primary: "#FFD700",
      secondary: "#FFFFFF",
      accent: "#2A5298",
      text: "#FFFFFF",
      badgeBg: "rgba(255, 215, 0, 0.20)",
      frameBg: "rgba(255, 215, 0, 0.08)",
    },
  };

  const currentTheme = THEMES[theme] || THEMES.gold;
  canvas.backgroundColor = currentTheme.bg;

  // Solid background layer to guarantee rendering in all viewport zooms
  const bgLayer = new Rect({
    left: 0,
    top: 0,
    width,
    height,
    fill: currentTheme.bg,
    selectable: false,
    evented: false,
  });
  canvas.add(bgLayer);

  // Outer decorative border
  const outerBorder = new Rect({
    left: width / 2,
    top: height / 2,
    originX: "center",
    originY: "center",
    width: width - 40,
    height: height - 40,
    fill: "transparent",
    stroke: currentTheme.primary,
    strokeWidth: 3,
    rx: 16,
    ry: 16,
    selectable: false,
    evented: false,
  });
  canvas.add(outerBorder);

  /*
   * Case A: If user provided a generated poster image, load it as editable base!
   */
  if (posterImage) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const fImg = new FabricImage(img, {
        originX: "center",
        originY: "center",
        left: width / 2,
        top: height / 2,
        scaleX: width / img.width,
        scaleY: height / img.height,
        selectable: true,
        cornerColor: "#00C4CC",
        cornerStrokeColor: "#FFFFFF",
        cornerStyle: "circle",
        transparentCorners: false,
        cornerSize: 12,
        borderColor: "#00C4CC",
        borderScaleFactor: 2,
      });

      canvas.add(fImg);
      // Place right above the solid background
      canvas.moveObjectTo(fImg, 1);

      // Add overlay editable text layers so user can edit their information directly
      addEditablePosterLayers(canvas, {
        width,
        height,
        currentTheme,
        collegeName,
        heading,
        studentName,
        department,
        year,
        rollNo,
        quote,
      });

      canvas.requestRenderAll();
    };
    img.src = posterImage;
    return;
  }

  /*
   * Case B: Load full vector flex template
   */
  addEditablePosterLayers(canvas, {
    width,
    height,
    currentTheme,
    collegeName,
    heading,
    studentName,
    department,
    year,
    rollNo,
    quote,
    withPlaceholders: true,
  });

  canvas.requestRenderAll();
}

function addEditablePosterLayers(
  canvas,
  {
    width,
    height,
    currentTheme,
    collegeName,
    heading,
    studentName,
    department,
    year,
    rollNo,
    quote,
    withPlaceholders = false,
  }
) {
  /*
   * 1. Top College Header Banner
   */
  const collegeHeaderBg = new Rect({
    left: width / 2,
    top: 60,
    originX: "center",
    originY: "center",
    width: 860,
    height: 48,
    rx: 24,
    ry: 24,
    fill: "rgba(0, 0, 0, 0.7)",
    stroke: currentTheme.primary,
    strokeWidth: 2,
    selectable: true,
    cornerColor: "#00C4CC",
    cornerStrokeColor: "#FFFFFF",
    cornerStyle: "circle",
    transparentCorners: false,
    cornerSize: 12,
    borderColor: "#00C4CC",
  });

  const collegeHeaderText = new IText(`✦ ${collegeName.toUpperCase()} ✦`, {
    left: width / 2,
    top: 60,
    originX: "center",
    originY: "center",
    fontFamily: "Arial",
    fontSize: 20,
    fontWeight: "bold",
    fill: currentTheme.secondary,
    charSpacing: 80,
    selectable: true,
    cornerColor: "#00C4CC",
    cornerStrokeColor: "#FFFFFF",
    cornerStyle: "circle",
    transparentCorners: false,
    cornerSize: 12,
    borderColor: "#00C4CC",
  });

  /*
   * 2. Main 3D Celebration Headline
   */
  const birthdayTitle = new IText(`★ ${heading} ★`, {
    left: width / 2,
    top: 150,
    originX: "center",
    originY: "center",
    fontFamily: "Georgia",
    fontSize: 66,
    fontWeight: "900",
    fill: currentTheme.primary,
    charSpacing: 100,
    shadow: new Shadow({
      color: "rgba(0,0,0,0.9)",
      blur: 16,
      offsetX: 2,
      offsetY: 6,
    }),
    selectable: true,
    cornerColor: "#00C4CC",
    cornerStrokeColor: "#FFFFFF",
    cornerStyle: "circle",
    transparentCorners: false,
    cornerSize: 12,
    borderColor: "#00C4CC",
  });

  canvas.add(collegeHeaderBg, collegeHeaderText, birthdayTitle);

  /*
   * 3. Optional Placeholder Frame (if no base image)
   */
  if (withPlaceholders) {
    const frameTop = 520;
    const photoFrameOuter = new Rect({
      left: width / 2,
      top: frameTop,
      originX: "center",
      originY: "center",
      width: 580,
      height: 600,
      rx: 28,
      ry: 28,
      fill: currentTheme.frameBg,
      stroke: currentTheme.primary,
      strokeWidth: 4,
      shadow: new Shadow({
        color: currentTheme.primary,
        blur: 24,
        offsetX: 0,
        offsetY: 0,
      }),
      selectable: true,
      cornerColor: "#00C4CC",
      cornerStrokeColor: "#FFFFFF",
      cornerStyle: "circle",
      transparentCorners: false,
      cornerSize: 12,
      borderColor: "#00C4CC",
    });

    const photoLabel = new IText("👤 CLICK UPLOADS TO ADD PHOTO", {
      left: width / 2,
      top: frameTop,
      originX: "center",
      originY: "center",
      fontFamily: "Arial",
      fontSize: 20,
      fontWeight: "bold",
      fill: currentTheme.secondary,
      selectable: true,
      cornerColor: "#00C4CC",
      cornerStrokeColor: "#FFFFFF",
      cornerStyle: "circle",
      transparentCorners: false,
      cornerSize: 12,
      borderColor: "#00C4CC",
    });

    canvas.add(photoFrameOuter, photoLabel);
  }

  /*
   * 4. Student Name (Large 3D Embossed)
   */
  const studentNameText = new IText(studentName.toUpperCase(), {
    left: width / 2,
    top: 920,
    originX: "center",
    originY: "center",
    fontFamily: "Arial",
    fontSize: 66,
    fontWeight: "900",
    fill: "#FFFFFF",
    charSpacing: 40,
    shadow: new Shadow({
      color: "rgba(0,0,0,0.95)",
      blur: 16,
      offsetX: 0,
      offsetY: 4,
    }),
    selectable: true,
    cornerColor: "#00C4CC",
    cornerStrokeColor: "#FFFFFF",
    cornerStyle: "circle",
    transparentCorners: false,
    cornerSize: 12,
    borderColor: "#00C4CC",
  });

  /*
   * 5. Department & Roll Info Badge
   */
  const deptBadgeBg = new Rect({
    left: width / 2,
    top: 995,
    originX: "center",
    originY: "center",
    width: 780,
    height: 48,
    rx: 24,
    ry: 24,
    fill: currentTheme.badgeBg,
    stroke: currentTheme.primary,
    strokeWidth: 2,
    selectable: true,
    cornerColor: "#00C4CC",
    cornerStrokeColor: "#FFFFFF",
    cornerStyle: "circle",
    transparentCorners: false,
    cornerSize: 12,
    borderColor: "#00C4CC",
  });

  const deptText = new IText(department.toUpperCase(), {
    left: width / 2,
    top: 995,
    originX: "center",
    originY: "center",
    fontFamily: "Arial",
    fontSize: 21,
    fontWeight: "bold",
    fill: currentTheme.primary,
    charSpacing: 40,
    selectable: true,
    cornerColor: "#00C4CC",
    cornerStrokeColor: "#FFFFFF",
    cornerStyle: "circle",
    transparentCorners: false,
    cornerSize: 12,
    borderColor: "#00C4CC",
  });

  const yearRollText = [year, rollNo ? `ROLL: ${rollNo}` : ""].filter(Boolean).join("  •  ");
  const yearTextObj = new IText(yearRollText.toUpperCase(), {
    left: width / 2,
    top: 1045,
    originX: "center",
    originY: "center",
    fontFamily: "Arial",
    fontSize: 18,
    fontWeight: "bold",
    fill: "#FFFFFF",
    charSpacing: 50,
    selectable: true,
    cornerColor: "#00C4CC",
    cornerStrokeColor: "#FFFFFF",
    cornerStyle: "circle",
    transparentCorners: false,
    cornerSize: 12,
    borderColor: "#00C4CC",
  });

  /*
   * 6. Birthday Wish Quote Card
   */
  const quoteCard = new Rect({
    left: width / 2,
    top: 1150,
    originX: "center",
    originY: "center",
    width: 900,
    height: 90,
    rx: 20,
    ry: 20,
    fill: "rgba(0, 0, 0, 0.65)",
    stroke: "rgba(255, 255, 255, 0.15)",
    strokeWidth: 1.5,
    selectable: true,
    cornerColor: "#00C4CC",
    cornerStrokeColor: "#FFFFFF",
    cornerStyle: "circle",
    transparentCorners: false,
    cornerSize: 12,
    borderColor: "#00C4CC",
  });

  const quoteText = new IText(`“${quote}”`, {
    left: width / 2,
    top: 1150,
    originX: "center",
    originY: "center",
    fontFamily: "Georgia",
    fontSize: 20,
    fontStyle: "italic",
    fill: "#FFFFFF",
    textAlign: "center",
    shadow: new Shadow({
      color: "rgba(0,0,0,0.8)",
      blur: 8,
      offsetX: 0,
      offsetY: 2,
    }),
    selectable: true,
    cornerColor: "#00C4CC",
    cornerStrokeColor: "#FFFFFF",
    cornerStyle: "circle",
    transparentCorners: false,
    cornerSize: 12,
    borderColor: "#00C4CC",
  });

  // Add all remaining layers
  canvas.add(
    studentNameText,
    deptBadgeBg,
    deptText,
    yearTextObj,
    quoteCard,
    quoteText
  );
}
