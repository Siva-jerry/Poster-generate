import {
  IText,
  Shadow,
  Textbox,
} from "fabric";

/*
|--------------------------------------------------------------------------
| Text engine constants
|--------------------------------------------------------------------------
*/

export const DEFAULT_TEXT_OPTIONS = {
  text: "Add your text",

  left: 120,
  top: 120,
  width: 600,

  fontFamily: "Poppins",
  fontSize: 64,
  fontWeight: "normal",
  fontStyle: "normal",

  fill: "#111827",
  stroke: null,
  strokeWidth: 0,

  textAlign: "left",
  lineHeight: 1.15,
  charSpacing: 0,

  underline: false,
  linethrough: false,
  overline: false,

  opacity: 1,
  angle: 0,

  backgroundColor: "",
  textBackgroundColor: "",

  shadow: null,

  editable: true,
  selectable: true,
  evented: true,

  lockMovementX: false,
  lockMovementY: false,
  lockScalingX: false,
  lockScalingY: false,
  lockRotation: false,

  editorType: "text",
  editorName: "Text",
  dynamicField: null,
};

/*
|--------------------------------------------------------------------------
| Supported fonts
|--------------------------------------------------------------------------
*/

export const EDITOR_FONT_FAMILIES = [
  "Poppins",
  "Montserrat",
  "Inter",
  "Roboto",
  "Open Sans",
  "Lato",
  "Oswald",
  "Anton",
  "Bebas Neue",
  "Playfair Display",
  "Cormorant Garamond",
  "Merriweather",
  "Great Vibes",
  "Pacifico",
  "Dancing Script",
];

/*
|--------------------------------------------------------------------------
| Safe helpers
|--------------------------------------------------------------------------
*/

function toSafeNumber(
  value,
  fallback = 0
) {
  const parsedValue =
    Number(value);

  return Number.isFinite(
    parsedValue
  )
    ? parsedValue
    : fallback;
}

function toPositiveNumber(
  value,
  fallback
) {
  const parsedValue =
    Number(value);

  if (
    !Number.isFinite(parsedValue) ||
    parsedValue <= 0
  ) {
    return fallback;
  }

  return parsedValue;
}

function toSafeString(
  value,
  fallback = ""
) {
  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    return String(value);
  }

  return fallback;
}

function toSafeColor(
  value,
  fallback = "#111827"
) {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    return fallback;
  }

  return value.trim();
}

function toBoolean(
  value,
  fallback = false
) {
  if (
    value === undefined ||
    value === null
  ) {
    return fallback;
  }

  return Boolean(value);
}

/*
|--------------------------------------------------------------------------
| Generate editor ID
|--------------------------------------------------------------------------
*/

export function createTextEditorId() {
  const randomValue =
    globalThis.crypto
      ?.randomUUID?.() ||
    `${Date.now()}-${Math.random()
      .toString(16)
      .slice(2)}`;

  return `text-${randomValue}`;
}

/*
|--------------------------------------------------------------------------
| Check whether an object is editable text
|--------------------------------------------------------------------------
*/

export function isTextObject(
  object
) {
  if (!object) {
    return false;
  }

  return (
    object instanceof Textbox ||
    object instanceof IText ||
    object.type === "textbox" ||
    object.type === "i-text" ||
    object.type === "itext" ||
    object.editorType === "text"
  );
}

/*
|--------------------------------------------------------------------------
| Resolve active text object
|--------------------------------------------------------------------------
*/

export function getActiveTextObject(
  canvas
) {
  if (!canvas) {
    return null;
  }

  const activeObject =
    canvas.getActiveObject?.();

  return isTextObject(
    activeObject
  )
    ? activeObject
    : null;
}

/*
|--------------------------------------------------------------------------
| Create Fabric shadow
|--------------------------------------------------------------------------
*/

export function createTextShadow({
  color = "rgba(0, 0, 0, 0.28)",
  blur = 12,
  offsetX = 4,
  offsetY = 6,
  nonScaling = false,
} = {}) {
  return new Shadow({
    color:
      toSafeColor(
        color,
        "rgba(0, 0, 0, 0.28)"
      ),

    blur:
      Math.max(
        toSafeNumber(
          blur,
          12
        ),
        0
      ),

    offsetX:
      toSafeNumber(
        offsetX,
        4
      ),

    offsetY:
      toSafeNumber(
        offsetY,
        6
      ),

    nonScaling:
      Boolean(nonScaling),
  });
}

/*
|--------------------------------------------------------------------------
| Normalize shadow value
|--------------------------------------------------------------------------
*/

function normalizeShadow(
  shadow
) {
  if (!shadow) {
    return null;
  }

  if (shadow instanceof Shadow) {
    return shadow;
  }

  if (
    typeof shadow === "object"
  ) {
    return createTextShadow(
      shadow
    );
  }

  return null;
}

/*
|--------------------------------------------------------------------------
| Configure text controls
|--------------------------------------------------------------------------
*/

export function configureTextObject(
  textObject,
  {
    editorId,
    editorName,
    dynamicField,
  } = {}
) {
  if (!textObject) {
    return null;
  }

  textObject.set({
    editorId:
      editorId ||
      textObject.editorId ||
      createTextEditorId(),

    editorType: "text",

    editorName:
      editorName ||
      textObject.editorName ||
      "Text",

    dynamicField:
      dynamicField ??
      textObject.dynamicField ??
      null,

    transparentCorners: false,

    cornerColor: "#FF6B1A",
    cornerStrokeColor: "#FFFFFF",
    borderColor: "#FF6B1A",

    cornerSize: 12,
    touchCornerSize: 24,

    borderScaleFactor: 1.5,

    padding: 4,

    centeredRotation: true,
    visible: true,
opacity: 1,

hasControls: true,
hasBorders: true,

objectCaching: false,
  });

  textObject.setCoords();

  return textObject;
}

/*
|--------------------------------------------------------------------------
| Create editable textbox
|--------------------------------------------------------------------------
*/

export function createEditableText({
  text =
    DEFAULT_TEXT_OPTIONS.text,

  left =
    DEFAULT_TEXT_OPTIONS.left,

  top =
    DEFAULT_TEXT_OPTIONS.top,

  width =
    DEFAULT_TEXT_OPTIONS.width,

  fontFamily =
    DEFAULT_TEXT_OPTIONS.fontFamily,

  fontSize =
    DEFAULT_TEXT_OPTIONS.fontSize,

  fontWeight =
    DEFAULT_TEXT_OPTIONS.fontWeight,

  fontStyle =
    DEFAULT_TEXT_OPTIONS.fontStyle,

  fill =
    DEFAULT_TEXT_OPTIONS.fill,

  stroke =
    DEFAULT_TEXT_OPTIONS.stroke,

  strokeWidth =
    DEFAULT_TEXT_OPTIONS.strokeWidth,

  textAlign =
    DEFAULT_TEXT_OPTIONS.textAlign,

  lineHeight =
    DEFAULT_TEXT_OPTIONS.lineHeight,

  charSpacing =
    DEFAULT_TEXT_OPTIONS.charSpacing,

  underline =
    DEFAULT_TEXT_OPTIONS.underline,

  linethrough =
    DEFAULT_TEXT_OPTIONS.linethrough,

  overline =
    DEFAULT_TEXT_OPTIONS.overline,

  opacity =
    DEFAULT_TEXT_OPTIONS.opacity,

  angle =
    DEFAULT_TEXT_OPTIONS.angle,

  backgroundColor =
    DEFAULT_TEXT_OPTIONS.backgroundColor,

  textBackgroundColor =
    DEFAULT_TEXT_OPTIONS
      .textBackgroundColor,

  shadow =
    DEFAULT_TEXT_OPTIONS.shadow,

  editable =
    DEFAULT_TEXT_OPTIONS.editable,

  selectable =
    DEFAULT_TEXT_OPTIONS.selectable,

  evented =
    DEFAULT_TEXT_OPTIONS.evented,

  lockMovementX =
    DEFAULT_TEXT_OPTIONS.lockMovementX,

  lockMovementY =
    DEFAULT_TEXT_OPTIONS.lockMovementY,

  lockScalingX =
    DEFAULT_TEXT_OPTIONS.lockScalingX,

  lockScalingY =
    DEFAULT_TEXT_OPTIONS.lockScalingY,

  lockRotation =
    DEFAULT_TEXT_OPTIONS.lockRotation,

  editorId,
  editorName =
    DEFAULT_TEXT_OPTIONS.editorName,

  dynamicField =
    DEFAULT_TEXT_OPTIONS.dynamicField,
} = {}) {
  const textbox =
    new Textbox(
      toSafeString(
        text,
        "Add your text"
      ),
      {
        left:
          toSafeNumber(
            left,
            120
          ),

        top:
          toSafeNumber(
            top,
            120
          ),

        width:
          Math.max(
            toPositiveNumber(
              width,
              600
            ),
            40
          ),

        fontFamily:
          toSafeString(
            fontFamily,
            "Poppins"
          ),

        fontSize:
          Math.max(
            toPositiveNumber(
              fontSize,
              64
            ),
            8
          ),

        fontWeight:
          fontWeight ||
          "normal",

        fontStyle:
          fontStyle ||
          "normal",

        fill:
          toSafeColor(
            fill,
            "#111827"
          ),

        stroke:
          stroke
            ? toSafeColor(
                stroke,
                "#111827"
              )
            : null,

        strokeWidth:
          Math.max(
            toSafeNumber(
              strokeWidth,
              0
            ),
            0
          ),

        textAlign:
          toSafeString(
            textAlign,
            "left"
          ),

        lineHeight:
          Math.max(
            toPositiveNumber(
              lineHeight,
              1.15
            ),
            0.5
          ),

        charSpacing:
          toSafeNumber(
            charSpacing,
            0
          ),

        underline:
          toBoolean(
            underline
          ),

        linethrough:
          toBoolean(
            linethrough
          ),

        overline:
          toBoolean(
            overline
          ),

        opacity:
          Math.min(
            Math.max(
              toSafeNumber(
                opacity,
                1
              ),
              0
            ),
            1
          ),

        angle:
          toSafeNumber(
            angle,
            0
          ),

        backgroundColor:
          toSafeString(
            backgroundColor,
            ""
          ),

        textBackgroundColor:
          toSafeString(
            textBackgroundColor,
            ""
          ),

        shadow:
          normalizeShadow(
            shadow
          ),

        editable:
          toBoolean(
            editable,
            true
          ),

        selectable:
          toBoolean(
            selectable,
            true
          ),

        evented:
          toBoolean(
            evented,
            true
          ),

        lockMovementX:
          toBoolean(
            lockMovementX
          ),

        lockMovementY:
          toBoolean(
            lockMovementY
          ),

        lockScalingX:
          toBoolean(
            lockScalingX
          ),

        lockScalingY:
          toBoolean(
            lockScalingY
          ),

        lockRotation:
          toBoolean(
            lockRotation
          ),

        originX: "left",
        originY: "top",

        splitByGrapheme: false,
      }
    );

  return configureTextObject(
    textbox,
    {
      editorId,
      editorName,
      dynamicField,
    }
  );
}

/*
|--------------------------------------------------------------------------
| Add text to canvas
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Add text to canvas
|--------------------------------------------------------------------------
*/

export function addTextToCanvas(
  canvas,
  options = {},
  {
    select = true,
    enterEditing = false,
    render = true,
  } = {}
) {
  if (!canvas) {
    throw new Error(
      "A Fabric canvas instance is required to add text."
    );
  }

  const textObject =
    createEditableText(options);

  /*
   * Ensure the text has visible,
   * browser-safe rendering values.
   */
  textObject.set({
    visible: true,
    opacity: 1,

    fill:
      options.fill ||
      textObject.fill ||
      "#111827",

    fontFamily:
      options.fontFamily ||
      textObject.fontFamily ||
      "Arial",

    selectable: true,
    evented: true,

    hasControls: true,
    hasBorders: true,
  });

  /*
   * Fabric must calculate the textbox
   * dimensions before rendering it.
   */
  textObject.initDimensions?.();
  textObject.setCoords();

  canvas.add(textObject);

  /*
   * Keep the new text above existing
   * background elements.
   */
  canvas.bringObjectToFront?.(
    textObject
  );

  if (
    select &&
    textObject.selectable !== false
  ) {
    canvas.setActiveObject(
      textObject
    );
  }

  /*
   * Do not enter editing automatically
   * unless explicitly requested.
   *
   * Automatic selectAll() was creating
   * the blue highlighted rectangle and
   * making the text difficult to see.
   */
  if (
    enterEditing &&
    textObject.editable !== false
  ) {
    textObject.enterEditing?.();

    textObject.hiddenTextarea
      ?.focus?.();
  }

  textObject.initDimensions?.();
  textObject.setCoords();

  if (render) {
    canvas.requestRenderAll();
    canvas.renderAll?.();
  }

  return textObject;
}

/*
|--------------------------------------------------------------------------
| Add heading
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| Add subheading
|--------------------------------------------------------------------------
*/
/*
|--------------------------------------------------------------------------
| Add subheading
|--------------------------------------------------------------------------
*/

export function addSubheadingText(
  canvas,
  options = {}
) {
  return addTextToCanvas(
    canvas,
    {
      text:
        options.text ||
        "Add a subheading",

      left:
        options.left ?? 190,

      top:
        options.top ?? 300,

      width:
        options.width ?? 700,

      fontFamily:
        options.fontFamily ||
        "Arial",

      fontSize:
        options.fontSize ?? 54,

      fontWeight:
        options.fontWeight ||
        "600",

      fill:
        options.fill ||
        "#1F2937",

      textAlign:
        options.textAlign ||
        "center",

      lineHeight:
        options.lineHeight ??
        1.15,

      editorName:
        options.editorName ||
        "Subheading",

      ...options,
    },
    {
      select: true,
      enterEditing: false,
      render: true,
    }
  );
}

/*
|--------------------------------------------------------------------------
| Add heading
|--------------------------------------------------------------------------
*/

export function addHeadingText(
  canvas,
  options = {}
) {
  return addTextToCanvas(
    canvas,
    {
      text:
        options.text ||
        "ADD A HEADING",

      left:
        options.left ?? 140,

      top:
        options.top ?? 140,

      width:
        options.width ?? 800,

      fontFamily:
        options.fontFamily ||
        "Arial",

      fontSize:
        options.fontSize ?? 104,

      fontWeight:
        options.fontWeight ||
        "bold",

      fill:
        options.fill ||
        "#111827",

      textAlign:
        options.textAlign ||
        "center",

      lineHeight:
        options.lineHeight ?? 1,

      editorName:
        options.editorName ||
        "Heading",

      ...options,
    },
    {
      select: true,

      /*
       * Important:
       * Keep this false.
       */
      enterEditing: false,

      render: true,
    }
  );
}
/*
|--------------------------------------------------------------------------
| Add body text
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Add body text
|--------------------------------------------------------------------------
*/

export function addBodyText(
  canvas,
  options = {}
) {
  return addTextToCanvas(
    canvas,
    {
      text:
        options.text ||
        "Add a little bit of body text",

      left:
        options.left ?? 220,

      top:
        options.top ?? 430,

      width:
        options.width ?? 640,

      fontFamily:
        options.fontFamily ||
        "Arial",

      fontSize:
        options.fontSize ?? 32,

      fontWeight:
        options.fontWeight ||
        "normal",

      fill:
        options.fill ||
        "#374151",

      textAlign:
        options.textAlign ||
        "center",

      lineHeight:
        options.lineHeight ??
        1.4,

      editorName:
        options.editorName ||
        "Body Text",

      ...options,
    },
    {
      select: true,
      enterEditing: false,
      render: true,
    }
  );
}

/*
|--------------------------------------------------------------------------
| Apply selected-character styles
|--------------------------------------------------------------------------
*/

function applySelectionStyle(
  textObject,
  styles
) {
  if (
    !textObject ||
    !isTextObject(textObject)
  ) {
    return;
  }

  const isEditing =
    Boolean(
      textObject.isEditing
    );

  const selectionStart =
    Number(
      textObject.selectionStart
    ) || 0;

  const selectionEnd =
    Number(
      textObject.selectionEnd
    ) || 0;

  if (
    isEditing &&
    selectionStart !==
      selectionEnd &&
    typeof textObject
      .setSelectionStyles ===
      "function"
  ) {
    textObject.setSelectionStyles(
      styles,
      selectionStart,
      selectionEnd
    );

    return;
  }

  textObject.set(
    styles
  );
}

/*
|--------------------------------------------------------------------------
| Update text object
|--------------------------------------------------------------------------
*/

export function updateTextObject(
  canvas,
  textObject,
  updates = {}
) {
  if (
    !canvas ||
    !isTextObject(
      textObject
    )
  ) {
    return null;
  }

  const safeUpdates = {
    ...updates,
  };

  if (
    Object.prototype
      .hasOwnProperty.call(
        safeUpdates,
        "fontSize"
      )
  ) {
    safeUpdates.fontSize =
      Math.max(
        toPositiveNumber(
          safeUpdates.fontSize,
          textObject.fontSize ||
            32
        ),
        8
      );
  }

  if (
    Object.prototype
      .hasOwnProperty.call(
        safeUpdates,
        "width"
      )
  ) {
    safeUpdates.width =
      Math.max(
        toPositiveNumber(
          safeUpdates.width,
          textObject.width ||
            300
        ),
        40
      );
  }

  if (
    Object.prototype
      .hasOwnProperty.call(
        safeUpdates,
        "opacity"
      )
  ) {
    safeUpdates.opacity =
      Math.min(
        Math.max(
          toSafeNumber(
            safeUpdates.opacity,
            1
          ),
          0
        ),
        1
      );
  }

  if (
    Object.prototype
      .hasOwnProperty.call(
        safeUpdates,
        "lineHeight"
      )
  ) {
    safeUpdates.lineHeight =
      Math.max(
        toPositiveNumber(
          safeUpdates.lineHeight,
          1.15
        ),
        0.5
      );
  }

  if (
    Object.prototype
      .hasOwnProperty.call(
        safeUpdates,
        "charSpacing"
      )
  ) {
    safeUpdates.charSpacing =
      toSafeNumber(
        safeUpdates.charSpacing,
        0
      );
  }

  if (
    Object.prototype
      .hasOwnProperty.call(
        safeUpdates,
        "shadow"
      )
  ) {
    safeUpdates.shadow =
      normalizeShadow(
        safeUpdates.shadow
      );
  }

  const characterStyleKeys =
    [
      "fontFamily",
      "fontSize",
      "fontWeight",
      "fontStyle",
      "fill",
      "stroke",
      "strokeWidth",
      "underline",
      "linethrough",
      "overline",
      "textBackgroundColor",
    ];

  const selectionStyles = {};
  const objectStyles = {};

  Object.entries(
    safeUpdates
  ).forEach(
    ([key, value]) => {
      if (
        characterStyleKeys.includes(
          key
        )
      ) {
        selectionStyles[key] =
          value;
      } else {
        objectStyles[key] =
          value;
      }
    }
  );

  if (
    Object.keys(
      selectionStyles
    ).length > 0
  ) {
    applySelectionStyle(
      textObject,
      selectionStyles
    );
  }

  if (
    Object.keys(
      objectStyles
    ).length > 0
  ) {
    textObject.set(
      objectStyles
    );
  }

  textObject.setCoords();

  canvas.requestRenderAll();

  canvas.fire(
    "object:modified",
    {
      target: textObject,
    }
  );

  return textObject;
}

/*
|--------------------------------------------------------------------------
| Update active text
|--------------------------------------------------------------------------
*/

export function updateActiveText(
  canvas,
  updates
) {
  const textObject =
    getActiveTextObject(
      canvas
    );

  return updateTextObject(
    canvas,
    textObject,
    updates
  );
}

/*
|--------------------------------------------------------------------------
| Change text content
|--------------------------------------------------------------------------
*/

export function setTextContent(
  canvas,
  value
) {
  return updateActiveText(
    canvas,
    {
      text:
        toSafeString(
          value,
          ""
        ),
    }
  );
}

/*
|--------------------------------------------------------------------------
| Change font family
|--------------------------------------------------------------------------
*/

export function setTextFontFamily(
  canvas,
  fontFamily
) {
  return updateActiveText(
    canvas,
    {
      fontFamily:
        toSafeString(
          fontFamily,
          "Arial"
        ),
    }
  );
}

/*
|--------------------------------------------------------------------------
| Change font size
|--------------------------------------------------------------------------
*/

export function setTextFontSize(
  canvas,
  fontSize
) {
  return updateActiveText(
    canvas,
    {
      fontSize:
        Math.max(
          toPositiveNumber(
            fontSize,
            32
          ),
          8
        ),
    }
  );
}

/*
|--------------------------------------------------------------------------
| Change text colour
|--------------------------------------------------------------------------
*/

export function setTextColor(
  canvas,
  color
) {
  return updateActiveText(
    canvas,
    {
      fill:
        toSafeColor(
          color,
          "#111827"
        ),
    }
  );
}

/*
|--------------------------------------------------------------------------
| Change text alignment
|--------------------------------------------------------------------------
*/

export function setTextAlignment(
  canvas,
  textAlign
) {
  const allowedAlignments =
    [
      "left",
      "center",
      "right",
      "justify",
      "justify-left",
      "justify-center",
      "justify-right",
    ];

  const safeAlignment =
    allowedAlignments.includes(
      textAlign
    )
      ? textAlign
      : "left";

  return updateActiveText(
    canvas,
    {
      textAlign:
        safeAlignment,
    }
  );
}

/*
|--------------------------------------------------------------------------
| Toggle bold
|--------------------------------------------------------------------------
*/

export function toggleTextBold(
  canvas
) {
  const textObject =
    getActiveTextObject(
      canvas
    );

  if (!textObject) {
    return null;
  }

  const isBold =
    textObject.fontWeight ===
      "bold" ||
    Number(
      textObject.fontWeight
    ) >= 600;

  return updateTextObject(
    canvas,
    textObject,
    {
      fontWeight:
        isBold
          ? "normal"
          : "bold",
    }
  );
}

/*
|--------------------------------------------------------------------------
| Toggle italic
|--------------------------------------------------------------------------
*/

export function toggleTextItalic(
  canvas
) {
  const textObject =
    getActiveTextObject(
      canvas
    );

  if (!textObject) {
    return null;
  }

  return updateTextObject(
    canvas,
    textObject,
    {
      fontStyle:
        textObject.fontStyle ===
        "italic"
          ? "normal"
          : "italic",
    }
  );
}

/*
|--------------------------------------------------------------------------
| Toggle underline
|--------------------------------------------------------------------------
*/

export function toggleTextUnderline(
  canvas
) {
  const textObject =
    getActiveTextObject(
      canvas
    );

  if (!textObject) {
    return null;
  }

  return updateTextObject(
    canvas,
    textObject,
    {
      underline:
        !textObject.underline,
    }
  );
}

/*
|--------------------------------------------------------------------------
| Toggle strikethrough
|--------------------------------------------------------------------------
*/

export function toggleTextLinethrough(
  canvas
) {
  const textObject =
    getActiveTextObject(
      canvas
    );

  if (!textObject) {
    return null;
  }

  return updateTextObject(
    canvas,
    textObject,
    {
      linethrough:
        !textObject.linethrough,
    }
  );
}

/*
|--------------------------------------------------------------------------
| Set letter spacing
|--------------------------------------------------------------------------
*/

export function setTextLetterSpacing(
  canvas,
  charSpacing
) {
  return updateActiveText(
    canvas,
    {
      charSpacing:
        toSafeNumber(
          charSpacing,
          0
        ),
    }
  );
}

/*
|--------------------------------------------------------------------------
| Set line height
|--------------------------------------------------------------------------
*/

export function setTextLineHeight(
  canvas,
  lineHeight
) {
  return updateActiveText(
    canvas,
    {
      lineHeight:
        Math.max(
          toPositiveNumber(
            lineHeight,
            1.15
          ),
          0.5
        ),
    }
  );
}

/*
|--------------------------------------------------------------------------
| Set outline
|--------------------------------------------------------------------------
*/

export function setTextOutline(
  canvas,
  {
    color = "#FFFFFF",
    width = 2,
  } = {}
) {
  return updateActiveText(
    canvas,
    {
      stroke:
        toSafeColor(
          color,
          "#FFFFFF"
        ),

      strokeWidth:
        Math.max(
          toSafeNumber(
            width,
            2
          ),
          0
        ),
    }
  );
}

/*
|--------------------------------------------------------------------------
| Remove outline
|--------------------------------------------------------------------------
*/

export function removeTextOutline(
  canvas
) {
  return updateActiveText(
    canvas,
    {
      stroke: null,
      strokeWidth: 0,
    }
  );
}

/*
|--------------------------------------------------------------------------
| Set shadow
|--------------------------------------------------------------------------
*/

export function setTextShadow(
  canvas,
  shadowOptions = {}
) {
  return updateActiveText(
    canvas,
    {
      shadow:
        createTextShadow(
          shadowOptions
        ),
    }
  );
}

/*
|--------------------------------------------------------------------------
| Remove shadow
|--------------------------------------------------------------------------
*/

export function removeTextShadow(
  canvas
) {
  return updateActiveText(
    canvas,
    {
      shadow: null,
    }
  );
}

/*
|--------------------------------------------------------------------------
| Transform text case
|--------------------------------------------------------------------------
*/

export function transformTextCase(
  canvas,
  mode = "uppercase"
) {
  const textObject =
    getActiveTextObject(
      canvas
    );

  if (!textObject) {
    return null;
  }

  const currentText =
    toSafeString(
      textObject.text,
      ""
    );

  let transformedText =
    currentText;

  if (
    mode === "uppercase"
  ) {
    transformedText =
      currentText.toUpperCase();
  }

  if (
    mode === "lowercase"
  ) {
    transformedText =
      currentText.toLowerCase();
  }

  if (
    mode === "capitalize"
  ) {
    transformedText =
      currentText.replace(
        /\b\w/g,
        (character) =>
          character.toUpperCase()
      );
  }

  return updateTextObject(
    canvas,
    textObject,
    {
      text:
        transformedText,
    }
  );
}

/*
|--------------------------------------------------------------------------
| Enter text-editing mode
|--------------------------------------------------------------------------
*/

export function enterTextEditing(
  canvas,
  textObject =
    getActiveTextObject(
      canvas
    )
) {
  if (
    !canvas ||
    !isTextObject(
      textObject
    ) ||
    textObject.editable ===
      false
  ) {
    return false;
  }

  canvas.setActiveObject(
    textObject
  );

  textObject.enterEditing?.();

  textObject.hiddenTextarea
    ?.focus?.();

  canvas.requestRenderAll();

  return true;
}

/*
|--------------------------------------------------------------------------
| Exit text-editing mode
|--------------------------------------------------------------------------
*/

export function exitTextEditing(
  canvas,
  textObject =
    getActiveTextObject(
      canvas
    )
) {
  if (
    !canvas ||
    !textObject ||
    !textObject.isEditing
  ) {
    return false;
  }

  textObject.exitEditing?.();

  textObject.setCoords();

  canvas.requestRenderAll();

  return true;
}

/*
|--------------------------------------------------------------------------
| Get text properties for UI
|--------------------------------------------------------------------------
*/

export function getTextProperties(
  object
) {
  if (
    !isTextObject(
      object
    )
  ) {
    return null;
  }

  return {
    id:
      object.editorId ||
      null,

    name:
      object.editorName ||
      "Text",

    text:
      toSafeString(
        object.text,
        ""
      ),

    fontFamily:
      toSafeString(
        object.fontFamily,
        "Poppins"
      ),

    fontSize:
      toPositiveNumber(
        object.fontSize,
        32
      ),

    fontWeight:
      object.fontWeight ||
      "normal",

    fontStyle:
      object.fontStyle ||
      "normal",

    fill:
      toSafeColor(
        object.fill,
        "#111827"
      ),

    stroke:
      typeof object.stroke ===
      "string"
        ? object.stroke
        : "",

    strokeWidth:
      toSafeNumber(
        object.strokeWidth,
        0
      ),

    textAlign:
      toSafeString(
        object.textAlign,
        "left"
      ),

    lineHeight:
      toPositiveNumber(
        object.lineHeight,
        1.15
      ),

    charSpacing:
      toSafeNumber(
        object.charSpacing,
        0
      ),

    underline:
      Boolean(
        object.underline
      ),

    linethrough:
      Boolean(
        object.linethrough
      ),

    overline:
      Boolean(
        object.overline
      ),

    opacity:
      toSafeNumber(
        object.opacity,
        1
      ),

    width:
      toSafeNumber(
        object.width,
        0
      ),

    height:
      toSafeNumber(
        object.height,
        0
      ),

    left:
      toSafeNumber(
        object.left,
        0
      ),

    top:
      toSafeNumber(
        object.top,
        0
      ),

    angle:
      toSafeNumber(
        object.angle,
        0
      ),

    isEditing:
      Boolean(
        object.isEditing
      ),

    hasShadow:
      Boolean(
        object.shadow
      ),
  };
}