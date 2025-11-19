const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');
const { normalizeDivisionForAssets } = require('./rarityMapping');

// Path to assets
const ASSETS_PATH = path.join(__dirname, '../client/public/player cards');
const PATTERN_PATH = path.join(__dirname, '../client/pattern.jpg');
const MASK_PATH = path.join(__dirname, '../client/public/player cards/image.png');
const FONTS_PATH = path.join(__dirname, '../assets/fonts');

// Register fonts
registerFont(path.join(FONTS_PATH, 'Roboto-Black.ttf'), { family: 'Roboto', weight: '900' });
registerFont(path.join(FONTS_PATH, 'Roboto-Bold.ttf'), { family: 'Roboto', weight: 'bold' });
registerFont(path.join(FONTS_PATH, 'RobotoMono-Bold.ttf'), { family: 'Roboto Mono', weight: 'bold' });
registerFont(path.join(FONTS_PATH, 'RobotoMono-Regular.ttf'), { family: 'Roboto Mono', weight: 'normal' });

/**
 * Generate a player card as a PNG buffer
 * @param {Object} player - Player data
 * @param {Object} colors - Color scheme
 * @returns {Promise<Buffer>} PNG buffer
 */
async function generatePlayerCard(player, colors) {
  const {
    primaryColor = '#D4822A',
    darkColor = '#2C2418',
    lightColor = '#E8DCC4',
    accentColor = '#D4822A',
    bgPositionX = 50,
    bgPositionY = 50,
    seasonInfo = null
  } = colors;

  // Create canvas
  const canvas = createCanvas(900, 1227);
  const ctx = canvas.getContext('2d');

  // Calculate player overall rating
  const overall = Math.round(
    ((player.cbt * 2) + (player.eff * 0.5) + (player.eva * 0.5) +
     (player.imp * 2) + player.spt + player.srv) / 7.0
  );

  try {
    // Normalize division name for asset loading
    const normalizedDivision = normalizeDivisionForAssets(player.division);

    console.log('Loading images for card generation...', {
      player: player.rglname || player.id64,
      division: player.division,
      normalizedDivision: normalizedDivision,
      class: player.class
    });

    // Load all images
    const [pattern, mask, border, classPortrait, gradient, classIcon, logo, divisionMedal] = await Promise.all([
      loadImage(PATTERN_PATH).catch(err => {
        console.error('Failed to load pattern:', err.message);
        throw new Error(`Pattern not found: ${PATTERN_PATH}`);
      }),
      loadImage(MASK_PATH).catch(err => {
        console.error('Failed to load mask:', err.message);
        throw new Error(`Mask not found: ${MASK_PATH}`);
      }),
      loadImage(path.join(ASSETS_PATH, `borders/${normalizedDivision}.png`)).catch(err => {
        console.error('Failed to load border:', err.message);
        throw new Error(`Border not found for division: ${player.division} (normalized: ${normalizedDivision})`);
      }),
      loadImage(path.join(ASSETS_PATH, `class-portraits/${player.class}.png`)).catch(err => {
        console.error('Failed to load class portrait:', err.message);
        throw new Error(`Class portrait not found for class: ${player.class}`);
      }),
      loadImage(path.join(ASSETS_PATH, 'gradients.png')).catch(err => {
        console.error('Failed to load gradients:', err.message);
        throw new Error('Gradients image not found');
      }),
      loadImage(path.join(ASSETS_PATH, `class-icons/${player.class}.png`)).catch(err => {
        console.error('Failed to load class icon:', err.message);
        throw new Error(`Class icon not found for class: ${player.class}`);
      }),
      loadImage(path.join(ASSETS_PATH, 'logo.png')).catch(err => {
        console.error('Failed to load logo:', err.message);
        throw new Error('Logo image not found');
      }),
      loadImage(path.join(ASSETS_PATH, `division-medals/${normalizedDivision}.png`)).catch(err => {
        console.error('Failed to load division medal:', err.message);
        throw new Error(`Division medal not found for division: ${player.division} (normalized: ${normalizedDivision})`);
      })
    ]);

    console.log('All images loaded successfully');

    // Load crystals for invite/premier divisions (legendary tier)
    let crystals = null;
    if (normalizedDivision === 'invite' || normalizedDivision === 'premier') {
      crystals = await loadImage(path.join(ASSETS_PATH, 'crystals.png'));
    }

    // Step 1: Create background with pattern at specified position
    // Match SVG behavior: scale pattern to fill 1500x1800 while preserving aspect ratio (like "objectFit: cover")
    const TARGET_WIDTH = 1500;
    const TARGET_HEIGHT = 1800;

    // Calculate scale to fill the target area (like CSS object-fit: cover)
    const scaleX = TARGET_WIDTH / pattern.width;
    const scaleY = TARGET_HEIGHT / pattern.height;
    const scale = Math.max(scaleX, scaleY); // Use larger scale to cover the area

    const scaledWidth = pattern.width * scale;
    const scaledHeight = pattern.height * scale;

    const patternCanvas = createCanvas(TARGET_WIDTH, TARGET_HEIGHT);
    const patternCtx = patternCanvas.getContext('2d');

    // Center the pattern (like xMidYMid)
    const offsetX = (TARGET_WIDTH - scaledWidth) / 2;
    const offsetY = (TARGET_HEIGHT - scaledHeight) / 2;

    // Draw pattern scaled and centered
    patternCtx.drawImage(pattern, offsetX, offsetY, scaledWidth, scaledHeight);

    // Get image data for color replacement
    const imageData = patternCtx.getImageData(0, 0, TARGET_WIDTH, TARGET_HEIGHT);
    const data = imageData.data;

    // Parse colors
    const hexToRgb = (hex) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return { r, g, b };
    };

    const dark = hexToRgb(darkColor);
    const accent = hexToRgb(accentColor);
    const light = hexToRgb(lightColor);

    // Replace colors based on brightness
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Calculate brightness (0-255)
      const brightness = (r * 0.299 + g * 0.587 + b * 0.114);

      // Map brightness to our color scheme
      let newColor;
      if (brightness < 85) {
        newColor = dark; // Dark areas
      } else if (brightness < 170) {
        newColor = accent; // Mid-tone areas
      } else {
        newColor = light; // Bright areas
      }

      data[i] = newColor.r;
      data[i + 1] = newColor.g;
      data[i + 2] = newColor.b;
    }

    // Put the modified pattern back
    patternCtx.putImageData(imageData, 0, 0);

    // Step 2: Create card-sized canvas and cut out the pattern using mask
    const bgCanvas = createCanvas(900, 1227);
    const bgCtx = bgCanvas.getContext('2d');

    // Calculate pattern position (offset from bgPositionX/Y)
    const patternX = -bgPositionX * 6;
    const patternY = -bgPositionY * 6;

    // Draw the color-replaced pattern at the offset position, maintaining its natural size
    bgCtx.drawImage(patternCanvas, patternX, patternY);

    // Apply the mask using destination-in (this cuts out the card shape)
    // Scale the mask to 900x1227 to match canvas size
    bgCtx.globalCompositeOperation = 'destination-in';
    bgCtx.drawImage(mask, 0, 0, 900, 1227);
    bgCtx.globalCompositeOperation = 'source-over';

    // Draw the masked background to main canvas
    ctx.drawImage(bgCanvas, 0, 0);

    // Step 3: Add dark overlay (also with mask)
    const overlayCanvas = createCanvas(900, 1227);
    const overlayCtx = overlayCanvas.getContext('2d');
    overlayCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    overlayCtx.fillRect(0, 0, 900, 1227);
    overlayCtx.globalCompositeOperation = 'destination-in';
    overlayCtx.drawImage(mask, 0, 0, 900, 1227);
    ctx.drawImage(overlayCanvas, 0, 0);

    // Step 4: Draw border frame
    ctx.drawImage(border, 0, 0, 900, 1227);

    // Step 4: Draw class portrait
    ctx.drawImage(classPortrait, 0, 0, 900, 1227);

    // Step 6: Draw gradient overlay
    ctx.drawImage(gradient, 0, 0, 900, 1227);

    // Step 7: Draw class icon at bottom
    ctx.drawImage(classIcon, 410, 1090, 80, 80);

    // Step 8: Draw logo
    ctx.drawImage(logo, 0, 0, 900, 1227);

    // Step 9: Draw crystals for invite/premier divisions (with primary color tint)
    if (crystals) {
      // Create a separate canvas for tinting the crystals
      const crystalCanvas = createCanvas(900, 1227);
      const crystalCtx = crystalCanvas.getContext('2d');

      // Draw the crystals
      crystalCtx.drawImage(crystals, 0, 0, 900, 1227);

      // Get image data for manual desaturation and tinting
      const crystalImageData = crystalCtx.getImageData(0, 0, 900, 1227);
      const crystalData = crystalImageData.data;

      // Parse primary color
      const primaryRgb = {
        r: parseInt(primaryColor.slice(1, 3), 16),
        g: parseInt(primaryColor.slice(3, 5), 16),
        b: parseInt(primaryColor.slice(5, 7), 16)
      };

      // Apply desaturation and primary color tint (matching SVG filter logic)
      // SVG does: saturate(0) -> multiply with solid color -> lighten 1.5x
      for (let i = 0; i < crystalData.length; i += 4) {
        const r = crystalData[i];
        const g = crystalData[i + 1];
        const b = crystalData[i + 2];
        const a = crystalData[i + 3];

        // Skip transparent pixels
        if (a === 0) continue;

        // Step 1: Desaturate (convert to grayscale) - matching feColorMatrix saturate(0)
        const gray = r * 0.2126 + g * 0.7152 + b * 0.0722;

        // Step 2: Multiply blend with primary color
        // SVG feBlend mode="multiply": result = (gray/255) * (primary/255) in 0-1 range
        const normalizedGray = gray / 255;
        const normalizedPrimaryR = primaryRgb.r / 255;
        const normalizedPrimaryG = primaryRgb.g / 255;
        const normalizedPrimaryB = primaryRgb.b / 255;

        // Multiply blend (both values 0-1)
        const blendedR = normalizedGray * normalizedPrimaryR;
        const blendedG = normalizedGray * normalizedPrimaryG;
        const blendedB = normalizedGray * normalizedPrimaryB;

        // Step 3: Apply 1.5x lightening (feComponentTransfer slope) and convert back to 0-255
        crystalData[i] = Math.min(255, blendedR * 1.5 * 255);
        crystalData[i + 1] = Math.min(255, blendedG * 1.5 * 255);
        crystalData[i + 2] = Math.min(255, blendedB * 1.5 * 255);
      }

      // Put the tinted data back
      crystalCtx.putImageData(crystalImageData, 0, 0);

      // Draw the tinted crystals to main canvas
      ctx.drawImage(crystalCanvas, 0, 0);
    }

    // Step 10: Draw division medal
    ctx.drawImage(divisionMedal, 180, 460, 120, 120);

    // Step 11: Draw text content
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';

    // "OVERALL" text
    ctx.font = 'bold 35px "Roboto Mono", monospace';
    ctx.fillText('OVERALL', 240, 280);

    // Format text with season (e.g., "HL S10" or just "HIGHLANDER")
    ctx.font = '26px "Roboto Mono", monospace';
    ctx.fillStyle = '#CCCCCC';
    let formatText = (player.format || 'HIGHLANDER').toUpperCase();
    if (seasonInfo && seasonInfo.seasonname) {
      // Extract season number from seasonname (e.g., "HL Season 20" -> "20")
      const seasonMatch = seasonInfo.seasonname.match(/Season (\d+)/i);
      const seasonNumber = seasonMatch ? seasonMatch[1] : seasonInfo.seasonid;
      formatText = `${formatText} S${seasonNumber}`;
    }
    ctx.fillText(formatText, 240, 315);

    // Overall score
    ctx.font = 'bold 110px "Roboto Mono", monospace';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(overall.toString(), 240, 420);

    // Line under overall
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(175, 450);
    ctx.lineTo(305, 450);
    ctx.stroke();

    // Player name with responsive font size
    ctx.fillStyle = '#FFFFFF';
    const playerName = (player.rglname || `Player ${player.id64}`).toUpperCase();

    // Calculate font size to fit within card width (580px max width for text)
    const maxTextWidth = 580; // Maximum width for player name
    let nameFontSize = 100;

    // Start with base size and measure
    ctx.font = `900 ${nameFontSize}px Roboto, sans-serif`;
    let textWidth = ctx.measureText(playerName).width;

    // Reduce font size until text fits
    while (textWidth > maxTextWidth && nameFontSize > 30) {
      nameFontSize -= 2;
      ctx.font = `900 ${nameFontSize}px Roboto, sans-serif`;
      textWidth = ctx.measureText(playerName).width;
    }

    ctx.fillText(playerName, 450, 690);

    // Horizontal divider
    ctx.beginPath();
    ctx.moveTo(160, 720);
    ctx.lineTo(740, 720);
    ctx.stroke();

    // Stats - Left Column
    ctx.font = 'bold 80px "Roboto Mono", monospace';

    ctx.fillText(player.cbt.toString(), 360, 820);
    ctx.fillText('CBT', 212, 820);

    ctx.fillText(player.spt.toString(), 360, 920);
    ctx.fillText('SPT', 212, 920);

    ctx.fillText(player.srv.toString(), 360, 1020);
    ctx.fillText('SRV', 212, 1020);

    // Vertical divider
    ctx.beginPath();
    ctx.moveTo(450, 740);
    ctx.lineTo(450, 1040);
    ctx.stroke();

    // Stats - Right Column
    ctx.fillText('EFF', 560, 820);
    ctx.fillText(player.eff.toString(), 712, 820);

    ctx.fillText('DMG', 560, 920);
    ctx.fillText(player.imp.toString(), 712, 920);

    ctx.fillText('EVA', 560, 1020);
    ctx.fillText(player.eva.toString(), 712, 1020);

    // Bottom divider
    ctx.beginPath();
    ctx.moveTo(300, 1060);
    ctx.lineTo(600, 1060);
    ctx.stroke();

    // Return PNG buffer
    return canvas.toBuffer('image/png');

  } catch (error) {
    console.error('Card generation error:', error);
    throw error;
  }
}

module.exports = { generatePlayerCard };
