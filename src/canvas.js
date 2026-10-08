export const REFERENCE_WIDTH = 390;
export const MIN_CARD_WIDTH = 100;

const gap = 28;

// Drawn frames from "Scaling - 390 width phone screen".
// Widths between two frames interpolate every value.
const frames = [
  { w: 100, h: 100, level: 0, pad: 12, gap: 8, title: 16, titleLh: 22, season: 12, seasonLh: 16, stat: 10, statLh: 16, chip: 10, chipLh: 16, badge: 10, badgeLh: 18, badgeSize: 33.6, badgeY: -13.1, badgeRight: -7.9, lock: 13.1, chipX: 7.5, chipY: 7.5, chipW: 24.3, chipH: 24.3, bar: 10, chipR: 12 },
  { w: 120, h: 120, level: 0, pad: 12, gap: 8, title: 16, titleLh: 22, season: 12, seasonLh: 16, stat: 10, statLh: 16, chip: 10, chipLh: 16, badge: 10, badgeLh: 18, badgeSize: 33.6, badgeY: -13.1, badgeRight: -7.9, lock: 13.1, chipX: 7.5, chipY: 7.5, chipW: 24.3, chipH: 24.3, bar: 10, chipR: 12 },
  { w: 140, h: 140, level: 0, pad: 12, gap: 8, title: 16, titleLh: 22, season: 12, seasonLh: 16, stat: 10, statLh: 16, chip: 10, chipLh: 16, badge: 10, badgeLh: 18, badgeSize: 33.6, badgeY: -13.1, badgeRight: -7.9, lock: 13.1, chipX: 7.5, chipY: 7.5, chipW: 24.3, chipH: 24.3, bar: 10, chipR: 12 },
  { w: 180, h: 280, level: 1, pad: 13.1, gap: 9.8, title: 16, titleLh: 26.18, season: 12, seasonLh: 19.64, stat: 10, statLh: 18, chip: 10, chipLh: 22, badge: 10, badgeLh: 15.88, badgeSize: 29.5, badgeY: -4.9, badgeRight: -6.8, lock: 11.5, chipX: 13.1, chipY: 13.1, chipW: 60.7, chipH: 30, bar: 9.8, chipR: 9.82 },
  { w: 220, h: 342, level: 1, pad: 16, gap: 12, title: 20, titleLh: 32, season: 14, seasonLh: 24, stat: 12, statLh: 22, chip: 10, chipLh: 22, badge: 10, badgeLh: 19.4, badgeSize: 36, badgeY: -6, badgeRight: -8, lock: 14, chipX: 16, chipY: 16, chipW: 64, chipH: 30, bar: 12, chipR: 12 },
  { w: 280, h: 411, level: 2, pad: 14, gap: 10.5, title: 24, titleLh: 35, season: 16, seasonLh: 21, stat: 14, statLh: 19.25, chip: 14, chipLh: 22, badge: 12, badgeLh: 16.98, badgeSize: 31.5, badgeY: -5.2, badgeRight: -7, lock: 12.3, chipX: 14, chipY: 14, chipW: 73.8, chipH: 30, bar: 10.5, chipR: 10.5 },
  { w: 320, h: 468, level: 2, pad: 16, gap: 12, title: 28, titleLh: 40, season: 18, seasonLh: 24, stat: 16, statLh: 22, chip: 14, chipLh: 22, badge: 12, badgeLh: 19.4, badgeSize: 36, badgeY: -6, badgeRight: -8, lock: 14, chipX: 16, chipY: 16, chipW: 76, chipH: 30, bar: 12, chipR: 12 },
  { w: 360, h: 527, level: 2, pad: 18, gap: 13.5, title: 32, titleLh: 45, season: 20, seasonLh: 27, stat: 18, statLh: 24.75, chip: 14, chipLh: 24.75, badge: 14, badgeLh: 21.83, badgeSize: 40.5, badgeY: -6.7, badgeRight: -9, lock: 15.8, chipX: 18, chipY: 18, chipW: 78.3, chipH: 33, bar: 13.5, chipR: 13.5 },
  { w: 420, h: 615, level: 2, pad: 21, gap: 15.8, title: 36, titleLh: 52.5, season: 22, seasonLh: 31.5, stat: 20, statLh: 28.88, chip: 14, chipLh: 28.88, badge: 14, badgeLh: 25.47, badgeSize: 47.3, badgeY: -7.9, badgeRight: -10.5, lock: 18.4, chipX: 21, chipY: 21, chipW: 81.6, chipH: 37, bar: 15.8, chipR: 15.75 },
  { w: 460, h: 674, level: 2, pad: 23, gap: 17.3, title: 40, titleLh: 57.5, season: 24, seasonLh: 34.5, stat: 22, statLh: 31.63, chip: 16, chipLh: 31.63, badge: 16, badgeLh: 27.89, badgeSize: 51.8, badgeY: -8.6, badgeRight: -11.5, lock: 20.1, chipX: 23, chipY: 23, chipW: 89.9, chipH: 40, bar: 17.3, chipR: 17.25 },
];

const lerp = (a, b, t) => a + (b - a) * t;

export function deviceScale(viewportWidth) {
  return viewportWidth / REFERENCE_WIDTH;
}

export function maxCardWidth(viewportWidth) {
  const room = Math.max(MIN_CARD_WIDTH, viewportWidth - 30);
  return Math.min(frames[frames.length - 1].w, room / deviceScale(viewportWidth));
}

export function layoutFor(width, current = 1) {
  if (current === 0) return width >= 180 ? 1 : 0;
  if (current === 2) return width < 250 ? 1 : 2;
  if (width < 160) return 0;
  if (width >= 280) return 2;
  return 1;
}

export function cardMetrics(width, currentLevel = 1) {
  const w = Math.max(MIN_CARD_WIDTH, Math.min(frames[frames.length - 1].w, width));
  let index = 0;
  while (index < frames.length - 1 && frames[index + 1].w < w) index += 1;
  const from = frames[index];
  const to = frames[Math.min(index + 1, frames.length - 1)];
  const t = from.w === to.w ? 0 : (w - from.w) / (to.w - from.w);
  const mix = (key) => lerp(from[key], to[key], t);
  const level = layoutFor(w, currentLevel);
  const thumb = frames[2];
  const compact = frames[3];
  const chrome = (frame) => {
    if (level === 0) return frame.level === 0 ? frame : thumb;
    if (frame.level === 0) return compact;
    return frame;
  };
  const chromeFrom = chrome(from);
  const chromeTo = chrome(to);
  const mixChrome = (key) => lerp(chromeFrom[key], chromeTo[key], chromeFrom === chromeTo ? 0 : t);
  return {
    width: w,
    height: level === 0 ? w : mix("h"),
    level,
    radius: 24,
    pad: mix("pad"),
    gap: mix("gap"),
    title: mix("title"),
    titleLh: mix("titleLh"),
    season: mix("season"),
    seasonLh: mix("seasonLh"),
    stat: mix("stat"),
    statLh: mix("statLh"),
    chip: mixChrome("chip"),
    chipLh: mixChrome("chipLh"),
    chipX: mixChrome("chipX"),
    chipY: mixChrome("chipY"),
    chipW: mixChrome("chipW"),
    chipH: mixChrome("chipH"),
    chipR: mixChrome("chipR"),
    badge: mixChrome("badge"),
    badgeLh: mixChrome("badgeLh"),
    badgeSize: mixChrome("badgeSize"),
    badgeY: mixChrome("badgeY"),
    badgeRight: mixChrome("badgeRight"),
    lock: mixChrome("lock"),
    bar: mix("bar"),
  };
}

export function canvasOrigin(width, viewportWidth) {
  const scale = deviceScale(viewportWidth);
  const { width: cardWidth, height, level } = cardMetrics(width);
  const visualWidth = cardWidth * scale;
  const span = level === 0 ? visualWidth * 2 + gap * scale : visualWidth;
  return { x: Math.max(16 * scale, (viewportWidth - span) / 2), y: 20 };
}

export function cardPosition(index, metrics) {
  return {
    x: (index % 2) * (metrics.width + gap),
    y: Math.floor(index / 2) * (metrics.height + gap),
  };
}
