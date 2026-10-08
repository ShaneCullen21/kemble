export const REFERENCE_WIDTH = 390;

// Resting zoom for each card, relative to the compact card at its drawn width.
export const levelScale = [160 / 240, 1, 360 / 240];

// Each card scales from 0.75× to 1.25× its drawn size before the layout changes.
// Focused stops at the drawn width, and also at the screen width minus 32px.
export const minZoom = levelScale[0] * 0.75;

const zoomThresholds = {
  thumbnailToDefault: levelScale[0] * 1.25,
  defaultToThumbnail: 0.75,
  defaultToFocused: 1.25,
  focusedToDefault: levelScale[2] * 0.75,
};

export const cardSize = [
  { width: 160, height: 160 },
  { width: 240, height: 358 },
  { width: 360, height: 500 },
];

const gap = 28;

export function deviceScale(viewportWidth) {
  return viewportWidth / REFERENCE_WIDTH;
}

export function canvasScale(zoom, level, viewportWidth) {
  return deviceScale(viewportWidth) * (zoom / levelScale[level]);
}

export function canvasOrigin(level, viewportWidth) {
  const scale = canvasScale(levelScale[level], level, viewportWidth);
  const width = cardSize[level].width * scale;
  const span = level === 0 ? width * 2 + gap * scale : width;
  return { x: Math.max(16 * deviceScale(viewportWidth), (viewportWidth - span) / 2), y: 20 };
}

export function maxZoom(viewportWidth) {
  const u = deviceScale(viewportWidth);
  const available = Math.max(1, viewportWidth - 32);
  return Math.min(cardSize[2].width * u, available) / (cardSize[1].width * u);
}

export function cardPosition(index, level, scale) {
  const { width, height } = cardSize[level];
  const spaced = gap / scale;
  return {
    x: (index % 2) * (width + spaced),
    y: Math.floor(index / 2) * (height + spaced),
  };
}

export function zoomLevel(currentLevel, zoom) {
  if (currentLevel === 2) {
    if (zoom < zoomThresholds.defaultToThumbnail) return 0;
    if (zoom < zoomThresholds.focusedToDefault) return 1;
    return 2;
  }
  if (currentLevel === 0) {
    if (zoom >= zoomThresholds.defaultToFocused) return 2;
    if (zoom >= zoomThresholds.thumbnailToDefault) return 1;
    return 0;
  }
  if (zoom < zoomThresholds.defaultToThumbnail) return 0;
  if (zoom >= zoomThresholds.defaultToFocused) return 2;
  return 1;
}
