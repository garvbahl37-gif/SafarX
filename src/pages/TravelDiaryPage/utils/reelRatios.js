/**
 * SafarX — Reel Aspect Ratio Definitions
 */
export const REEL_RATIOS = [
  {
    id: 'portrait_916',
    label: '9:16',
    desc: 'Instagram / TikTok Reels',
    emoji: '📱',
    width: 1080,
    height: 1920,
    cssAspect: 'aspect-[9/16]',
    canvasDisplayW: 310,
    canvasDisplayH: 551,
    popular: true,
  },
  {
    id: 'portrait_45',
    label: '4:5',
    desc: 'Instagram Portrait',
    emoji: '🖼️',
    width: 1080,
    height: 1350,
    cssAspect: 'aspect-[4/5]',
    canvasDisplayW: 360,
    canvasDisplayH: 450,
    popular: false,
  },
  {
    id: 'square_11',
    label: '1:1',
    desc: 'Instagram Square',
    emoji: '⬛',
    width: 1080,
    height: 1080,
    cssAspect: 'aspect-square',
    canvasDisplayW: 420,
    canvasDisplayH: 420,
    popular: false,
  },
  {
    id: 'landscape_169',
    label: '16:9',
    desc: 'YouTube / Landscape',
    emoji: '🖥️',
    width: 1920,
    height: 1080,
    cssAspect: 'aspect-video',
    canvasDisplayW: 560,
    canvasDisplayH: 315,
    popular: false,
  },
  {
    id: 'landscape_43',
    label: '4:3',
    desc: 'Classic / Widescreen',
    emoji: '📺',
    width: 1440,
    height: 1080,
    cssAspect: 'aspect-[4/3]',
    canvasDisplayW: 480,
    canvasDisplayH: 360,
    popular: false,
  },
];

/**
 * Auto-detect best ratio from a batch of photos by analysing their dominant aspect ratio
 */
export const detectBestRatio = (photos) => {
  if (!photos || photos.length === 0) return REEL_RATIOS[0]; // default 9:16

  let portraitCount = 0;
  let squareCount = 0;
  let landscapeCount = 0;

  photos.forEach(photo => {
    if (photo.img) {
      const r = photo.img.naturalWidth / photo.img.naturalHeight;
      if (r < 0.85) portraitCount++;
      else if (r > 1.15) landscapeCount++;
      else squareCount++;
    } else if (photo.url) {
      // Can't detect without loading — default portrait
      portraitCount++;
    }
  });

  if (landscapeCount > portraitCount && landscapeCount > squareCount) return REEL_RATIOS[3]; // 16:9
  if (squareCount > portraitCount && squareCount > landscapeCount) return REEL_RATIOS[2]; // 1:1
  return REEL_RATIOS[0]; // default 9:16 for portrait
};
