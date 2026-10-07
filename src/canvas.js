export const levelScale = [0.57, 1, 1.46];

const zoomThresholds = {
  thumbnailToDefault: (170 / 140) * levelScale[0],
  defaultToThumbnail: 0.6,
  defaultToFocused: 340 / 247,
  focusedToDefault: 1.22,
};

export const cardSize = [
  { width: 140, height: 140 },
  { width: 247, height: 394 },
  { width: 360, height: 547 },
];

const gap = 28;

export function canvasOrigin(level, viewportWidth) {
  const width = cardSize[level].width;
  const span = level === 0 ? width * 2 + gap : width;
  return { x: Math.max(15, (viewportWidth - span) / 2), y: 20 };
}

export function maxZoom(viewportWidth) {
  const available = Math.max(1, viewportWidth - 32);
  return Math.min(1.68, (available / cardSize[2].width) * levelScale[2]);
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
