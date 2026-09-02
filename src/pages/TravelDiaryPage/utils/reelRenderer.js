/**
 * SafarX Advanced Multi-Style Video Editor Engine
 * 4 Completely Distinct Editing Aesthetics:
 * 1. Trending CapCut Reel (Rapid 1.5s beat cuts, 2-photo split screens, whip-pans, RGB glitch)
 * 2. 35mm Vintage Cinema (Kodak film sprockets, 2.35:1 letterbox, film burn light leaks)
 * 3. Polaroid Travel Scrapbook (Floating tilted photo cards, tape stickers, GPS coordinate HUD)
 * 4. Slow Luxury Gallery (Minimalist Vogue framing, silky continuous morph, golden haze)
 */

export const EDIT_PRESETS = [
 { id: 'capcut', label: 'Trending Reel', emoji: '', desc: 'Fast beat cuts, split-screens, whip-pans & RGB glitch' },
 { id: 'cinema', label: '35mm Film', emoji: '', desc: 'Kodak sprockets, 2.35:1 letterbox & vintage film burns' },
 { id: 'vlog', label: 'Polaroid Vlog', emoji: '', desc: 'Tilted Polaroid snapshots, tape stickers & GPS coordinates' },
 { id: 'wanderlust', label: 'Luxury Gallery', emoji: '', desc: 'Minimalist editorial framing & silky slow-motion drift' },
];

export class ReelRenderer {
 constructor(canvas, options = {}) {
 this.canvas = canvas;
 this.ctx = canvas.getContext('2d', { alpha: false });
 this.width = options.width || 1080;
 this.height = options.height || 1920;
 this.canvas.width = this.width;
 this.canvas.height = this.height;

 this.stylePreset = options.stylePreset || 'capcut';
 this.tripTitle = options.tripTitle || 'Royal Rajasthan Odyssey';
 this.travelerName = options.travelerName || 'SafarX Traveler';
 this.slides = [];

 this.updatePacing();

 this.currentTime = 0;
 this.totalDuration = 0;

 // Dust particles & film grain seeds
 this.particles = Array.from({ length: 35 }, (_, i) => ({
 x: (i * 149.3) % this.width,
 y: (i * 87.7) % this.height,
 radius: 1.2 + (i % 3) * 1.6,
 speedX: -0.5 + (i % 5) * 0.2,
 speedY: -0.8 - (i % 4) * 0.35,
 opacity: 0.3 + (i % 4) * 0.25,
 pulseSpeed: 2.0 + (i % 3) * 1.1
 }));
 }

 updatePacing() {
 if (this.stylePreset === 'capcut') {
 this.slideDuration = 1.6;
 this.transitionDuration = 0.45;
 } else if (this.stylePreset === 'cinema') {
 this.slideDuration = 3.0;
 this.transitionDuration = 0.85;
 } else if (this.stylePreset === 'vlog') {
 this.slideDuration = 2.4;
 this.transitionDuration = 0.65;
 } else { // wanderlust
 this.slideDuration = 3.4;
 this.transitionDuration = 0.95;
 }
 }

 setSlides(slides, tripTitle = 'Royal Rajasthan Odyssey', stylePreset = 'capcut') {
 this.slides = slides;
 this.tripTitle = tripTitle;
 this.stylePreset = stylePreset;
 this.updatePacing();
 this.totalDuration = Math.max(slides.length * this.slideDuration, 5);
 }

 setStylePreset(preset) {
 this.stylePreset = preset;
 this.updatePacing();
 if (this.slides.length) {
 this.totalDuration = Math.max(this.slides.length * this.slideDuration, 5);
 }
 }

 static async preloadImages(photoList) {
 const promises = photoList.map(item => {
 return new Promise((resolve) => {
 const img = new Image();
 img.crossOrigin = 'anonymous';
 img.onload = () => resolve({ ...item, img, loaded: true });
 img.onerror = () => {
 const fallbackCanvas = document.createElement('canvas');
 fallbackCanvas.width = 1080;
 fallbackCanvas.height = 1920;
 const fctx = fallbackCanvas.getContext('2d');
 fctx.fillStyle = '#061412';
 fctx.fillRect(0, 0, 1080, 1920);
 fctx.fillStyle = '#D4A843';
 fctx.font = 'bold 48px sans-serif';
 fctx.textAlign = 'center';
 fctx.fillText(item.location || 'SafarX Moment', 540, 960);
 const fallbackImg = new Image();
 fallbackImg.src = fallbackCanvas.toDataURL();
 fallbackImg.onload = () => resolve({ ...item, img: fallbackImg, loaded: true });
 };
 img.src = item.url;
 });
 });

 return Promise.all(promises);
 }

 renderFrame(timeInSeconds) {
 if (!this.slides || this.slides.length === 0) {
 this.renderEmptyState();
 return;
 }

 const t = Math.max(0, timeInSeconds % this.totalDuration);
 this.currentTime = t;

 const slideFloat = t / this.slideDuration;
 const currentIndex = Math.min(Math.floor(slideFloat), this.slides.length - 1);
 const nextIndex = (currentIndex + 1) % this.slides.length;

 const timeWithinSlide = t - currentIndex * this.slideDuration;
 const progress = Math.min(Math.max(timeWithinSlide / this.slideDuration, 0), 1);

 const currentSlide = this.slides[currentIndex];
 const nextSlide = this.slides[nextIndex];

 const transitionStart = this.slideDuration - this.transitionDuration;
 const isTrans = timeWithinSlide > transitionStart && this.slides.length > 1;
 const transProgress = isTrans ? (timeWithinSlide - transitionStart) / this.transitionDuration : 0;

 // Dispatch to specific Preset Renderer
 switch (this.stylePreset) {
 case 'cinema':
 this.renderCinemaStyle(currentSlide, nextSlide, progress, transProgress, isTrans, currentIndex, nextIndex, t);
 break;
 case 'vlog':
 this.renderPolaroidVlogStyle(currentSlide, nextSlide, progress, transProgress, isTrans, currentIndex, nextIndex, t);
 break;
 case 'wanderlust':
 this.renderWanderlustStyle(currentSlide, nextSlide, progress, transProgress, isTrans, currentIndex, nextIndex, t);
 break;
 case 'capcut':
 default:
 this.renderCapCutStyle(currentSlide, nextSlide, progress, transProgress, isTrans, currentIndex, nextIndex, t);
 break;
 }
 }

 // ─────────────────────────────────────────────────────────────────────────────
 // 1. TRENDING CAPCUT REEL (Fast, Snap-Zooms, Split-Screens, RGB Glitch)
 // ─────────────────────────────────────────────────────────────────────────────
 renderCapCutStyle(slideA, slideB, progress, transProgress, isTrans, idxA, idxB, totalTime) {
 this.ctx.fillStyle = '#061412';
 this.ctx.fillRect(0, 0, this.width, this.height);

 const isSplitScreen = (idxA % 3 === 2); // Every 3rd shot is a dynamic 2-photo split screen!

 if (isSplitScreen && this.slides.length > 1) {
 // Split Screen Layout (Top photo panning right, Bottom photo panning left)
 const topImg = slideA.img;
 const bottomImg = this.slides[(idxA + 1) % this.slides.length].img;

 this.ctx.save();
 // Top Half
 this.ctx.beginPath();
 this.ctx.rect(0, 0, this.width, this.height / 2 - 4);
 this.ctx.clip();
 this.drawImageFill(topImg, 0.5 + progress * 0.1, 0.5, 1.15);
 this.ctx.restore();

 // Divider Line
 this.ctx.fillStyle = '#D4A843';
 this.ctx.fillRect(0, this.height / 2 - 4, this.width, 8);

 // Bottom Half
 this.ctx.save();
 this.ctx.beginPath();
 this.ctx.rect(0, this.height / 2 + 4, this.width, this.height / 2 - 4);
 this.ctx.clip();
 this.drawImageFill(bottomImg, 0.6 - progress * 0.1, 0.5, 1.15);
 this.ctx.restore();
 } else {
 // Full bleed with snappy beat-zoom
 const beatPulse = Math.sin(totalTime * 8) > 0.85 ? 0.04 : 0;
 if (isTrans && slideB.img) {
 // Whip-pan transition
 const shiftX = Math.pow(transProgress, 2.5) * this.width;
 this.ctx.save();
 this.ctx.translate(-shiftX, 0);
 this.drawImageFill(slideA.img, 0.5, 0.5, 1.08 + beatPulse);
 this.ctx.restore();

 this.ctx.save();
 this.ctx.translate(this.width - shiftX, 0);
 this.drawImageFill(slideB.img, 0.5, 0.5, 1.18 - transProgress * 0.1);
 this.ctx.restore();

 // RGB Glitch streak
 if (transProgress > 0.2 && transProgress < 0.8) {
 this.ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
 this.ctx.fillRect(0, 0, this.width, this.height);
 }
 } else {
 this.drawImageFill(slideA.img, 0.5 + Math.sin(progress * Math.PI) * 0.05, 0.5, 1.06 + progress * 0.14 + beatPulse);
 }
 }

 // Dynamic Overlays
 this.drawCapCutHUD(slideA, idxA, progress, totalTime);
 }

 drawCapCutHUD(slide, idx, progress, totalTime) {
 this.ctx.save();

 // Top Neon Tag
 this.ctx.textAlign = 'center';
 this.ctx.font = '800 24px "Space Grotesk", sans-serif';
 this.ctx.fillStyle = '#D4A843';
 this.ctx.fillText('TRENDING SAFARX REEL', this.width / 2, 100);

 this.ctx.font = '800 48px "Space Grotesk", sans-serif';
 this.ctx.fillStyle = '#F2EFE6';
 this.ctx.shadowColor = 'rgba(0,0,0,0.9)';
 this.ctx.shadowBlur = 16;
 this.ctx.fillText(this.tripTitle.toUpperCase(), this.width / 2, 145);
 this.ctx.shadowBlur = 0;

 // Big Bold Kinetic Location Text in Lower Third
 const cardY = this.height - 400;
 const bounceScale = Math.min(1, progress * 6);
 this.ctx.save();
 this.ctx.translate(80, cardY);
 this.ctx.scale(bounceScale, bounceScale);

 this.ctx.font = '800 24px "Space Grotesk", sans-serif';
 this.ctx.fillStyle = '#D4A843';
 this.ctx.textAlign = 'left';
 this.ctx.fillText(`SHOT 0${idx + 1} // ${slide.tag || 'RAJASTHAN'}`, 0, 0);

 const mainText = slide.location || slide.caption || 'Rajasthan Moment';
 this.ctx.font = '900 58px "Space Grotesk", sans-serif';
 this.ctx.fillStyle = '#F2EFE6';
 this.ctx.shadowColor = 'rgba(0,0,0,0.95)';
 this.ctx.shadowBlur = 20;
 this.ctx.fillText(mainText, 0, 68);
 this.ctx.shadowBlur = 0;

 // Sub-caption if different from main text
 if (slide.caption && slide.caption.trim() && slide.caption !== slide.location) {
 this.ctx.font = '500 28px "Space Grotesk", sans-serif';
 this.ctx.fillStyle = '#EDDCA0';
 this.ctx.shadowColor = 'rgba(0,0,0,0.9)';
 this.ctx.shadowBlur = 10;
 this.ctx.fillText(slide.caption.slice(0, 65), 0, 112);
 this.ctx.shadowBlur = 0;
 }
 this.ctx.restore();

 // Fast Equalizer Bar at bottom
 const barY = this.height - 90;
 this.ctx.fillStyle = '#D4A843';
 for (let i = 0; i < 24; i++) {
 const h = 6 + 22 * Math.abs(Math.sin(totalTime * 10 + i * 0.45));
 this.ctx.fillRect(80 + i * 16, barY - h / 2, 8, h);
 }

 this.ctx.restore();
 }

 // ─────────────────────────────────────────────────────────────────────────────
 // 2. 35MM VINTAGE CINEMA (Kodak Film Sprockets, 2.35:1 Letterbox, Light Leaks)
 // ─────────────────────────────────────────────────────────────────────────────
 renderCinemaStyle(slideA, slideB, progress, transProgress, isTrans, idxA, idxB, totalTime) {
 this.ctx.fillStyle = '#040E0D';
 this.ctx.fillRect(0, 0, this.width, this.height);

 const letterboxH = 260; // 2.35:1 cinema black bars

 // Clip to Cinema Viewport
 this.ctx.save();
 this.ctx.beginPath();
 this.ctx.rect(0, letterboxH, this.width, this.height - letterboxH * 2);
 this.ctx.clip();

 // Handheld camera organic sway
 const swayX = Math.sin(totalTime * 1.5) * 0.015;
 const swayY = Math.cos(totalTime * 1.2) * 0.01;

 if (isTrans && slideB.img) {
 const ease = 0.5 - 0.5 * Math.cos(transProgress * Math.PI);
 this.drawImageFill(slideA.img, 0.5 + swayX, 0.5 + swayY, 1.15, 1.0 - ease);
 this.drawImageFill(slideB.img, 0.5 + swayX, 0.5 + swayY, 1.25 - transProgress * 0.1, ease);
 this.drawFilmBurn(transProgress);
 } else {
 this.drawImageFill(slideA.img, 0.5 + swayX + progress * 0.04, 0.5 + swayY, 1.12 + progress * 0.12);
 }

 // Warm sepia/golden cinema color grade
 this.ctx.fillStyle = 'rgba(235, 140, 50, 0.07)';
 this.ctx.fillRect(0, letterboxH, this.width, this.height - letterboxH * 2);

 this.drawFloatingEmbers(totalTime);
 this.ctx.restore();

 // Draw Top & Bottom 35mm Kodak Film Borders with Sprocket Holes
 this.drawKodakFilmBorders(letterboxH, totalTime);

 // Cinema Typography Overlays
 this.drawCinemaTypography(slideA, idxA, progress, letterboxH);
 }

 drawKodakFilmBorders(letterboxH, totalTime) {
 this.ctx.save();
 this.ctx.fillStyle = '#000000';
 this.ctx.fillRect(0, 0, this.width, letterboxH);
 this.ctx.fillRect(0, this.height - letterboxH, this.width, letterboxH);

 // Film Sprocket Holes along the edge
 const sprockW = 28;
 const sprockH = 40;
 const count = 18;
 const step = this.width / count;

 this.ctx.fillStyle = '#0D231F';
 for (let i = 0; i < count; i++) {
 const x = i * step + 15;
 // Top sprockets
 this.roundRect(x, letterboxH - 55, sprockW, sprockH, 6);
 this.ctx.fill();
 // Bottom sprockets
 this.roundRect(x, this.height - letterboxH + 15, sprockW, sprockH, 6);
 this.ctx.fill();
 }

 // Kodak Edge Text
 this.ctx.font = '700 18px monospace';
 this.ctx.fillStyle = '#D4A843';
 this.ctx.textAlign = 'left';
 this.ctx.fillText(`EASTMAN KODAK 500T 7219 ▶ 35MM COLOR FILM • 24 FPS`, 80, letterboxH - 75);

 this.ctx.textAlign = 'right';
 this.ctx.fillText(`FRAME ${(Math.floor(totalTime * 24) % 9999).toString().padStart(4, '0')} • SAFETY FILM`, this.width - 80, this.height - letterboxH + 75);

 this.ctx.restore();
 }

 drawCinemaTypography(slide, idx, progress, letterboxH) {
 this.ctx.save();
 this.ctx.textAlign = 'center';

 // Cinematic Grand Title in Black Bar
 this.ctx.font = 'italic 700 36px "Fraunces", Georgia, serif';
 this.ctx.fillStyle = '#F2EFE6';
 this.ctx.fillText(this.tripTitle, this.width / 2, letterboxH - 120);

 // Location Subtitle inside the cinema frame
 const textY = this.height - letterboxH - 100;
 const mainText = slide.location || slide.caption || 'Rajasthan Chronicle';
 this.ctx.font = '700 52px "Fraunces", Georgia, serif';
 this.ctx.fillStyle = '#F2EFE6';
 this.ctx.shadowColor = 'rgba(0,0,0,0.95)';
 this.ctx.shadowBlur = 18;
 this.ctx.fillText(mainText, this.width / 2, textY);
 this.ctx.shadowBlur = 0;

 if (slide.caption && slide.caption.trim() && slide.caption !== slide.location) {
 this.ctx.font = 'italic 400 26px "Schibsted Grotesk", sans-serif';
 this.ctx.fillStyle = '#9A9C94';
 this.ctx.fillText(`"${slide.caption}"`, this.width / 2, textY + 50);
 }

 this.ctx.restore();
 }

 // ─────────────────────────────────────────────────────────────────────────────
 // 3. POLAROID TRAVEL VLOG (Tilted Photo Cards, Scotch Tape, GPS HUD)
 // ─────────────────────────────────────────────────────────────────────────────
 renderPolaroidVlogStyle(slideA, slideB, progress, transProgress, isTrans, idxA, idxB, totalTime) {
 // Blurred background of the destination
 this.ctx.fillStyle = '#0A1D1A';
 this.ctx.fillRect(0, 0, this.width, this.height);

 if (slideA.img) {
 this.ctx.save();
 this.drawImageFill(slideA.img, 0.5, 0.5, 1.4, 0.35);
 this.ctx.fillStyle = 'rgba(11, 15, 25, 0.7)';
 this.ctx.fillRect(0, 0, this.width, this.height);
 this.ctx.restore();
 }

 // Tilted Polaroid Card
 const cardW = this.width * 0.84;
 const cardH = cardW * 1.25;
 const cardX = (this.width - cardW) / 2;
 const cardY = (this.height - cardH) / 2 - 30;

 // Organic gentle tilt angle
 const tilt = Math.sin(idxA * 1.8 + progress * 0.5) * 0.035;

 this.ctx.save();
 this.ctx.translate(this.width / 2, cardY + cardH / 2);
 this.ctx.rotate(tilt);
 this.ctx.translate(-this.width / 2, -(cardY + cardH / 2));

 // Polaroid Drop Shadow
 this.ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
 this.ctx.shadowBlur = 40;
 this.ctx.shadowOffsetY = 20;

 // Polaroid White Frame
 this.ctx.fillStyle = '#F2EFE6';
 this.roundRect(cardX, cardY, cardW, cardH, 18);
 this.ctx.fill();
 this.ctx.shadowColor = 'transparent';

 // Photo Area inside Polaroid
 const photoPad = 32;
 const photoW = cardW - photoPad * 2;
 const photoH = cardH - photoPad * 2 - 130;
 const photoX = cardX + photoPad;
 const photoY = cardY + photoPad;

 this.ctx.save();
 this.roundRect(photoX, photoY, photoW, photoH, 10);
 this.ctx.clip();

 if (isTrans && slideB.img) {
 const ease = 0.5 - 0.5 * Math.cos(transProgress * Math.PI);
 this.drawImageFill(slideA.img, 0.5, 0.5, 1.15, 1.0 - ease, photoX, photoY, photoW, photoH);
 this.drawImageFill(slideB.img, 0.5, 0.5, 1.15, ease, photoX, photoY, photoW, photoH);
 } else {
 this.drawImageFill(slideA.img, 0.5 + progress * 0.05, 0.5, 1.08 + progress * 0.08, 1.0, photoX, photoY, photoW, photoH);
 }
 this.ctx.restore();

 // Scotch Tape Sticker at Top
 this.ctx.fillStyle = 'rgba(254, 240, 138, 0.75)';
 this.roundRect(cardX + cardW / 2 - 65, cardY - 16, 130, 34, 4);
 this.ctx.fill();

 // Handwritten-style Caption on Polaroid Footer
 this.ctx.textAlign = 'left';
 const mainText = slideA.location || slideA.caption || 'Rajasthan Memory';
 this.ctx.font = '700 38px "Fraunces", Georgia, serif';
 this.ctx.fillStyle = '#0A1D1A';
 this.ctx.fillText(mainText, photoX, cardY + cardH - 85);

 if (slideA.caption && slideA.caption.trim() && slideA.caption !== slideA.location) {
 this.ctx.font = 'italic 500 22px "Schibsted Grotesk", sans-serif';
 this.ctx.fillStyle = '#5F6763';
 this.ctx.fillText(`"${slideA.caption.slice(0, 50)}"`, photoX, cardY + cardH - 55);
 } else {
 this.ctx.font = '600 20px "Space Grotesk", sans-serif';
 this.ctx.fillStyle = '#A67E2B';
 this.ctx.fillText(` ${slideA.day || 'DAY 01'} · ${slideA.tag || 'RAJASTHAN'}`, photoX, cardY + cardH - 45);
 }

 this.ctx.restore();

 // Top GPS HUD Stamp
 this.ctx.save();
 this.ctx.font = '700 20px "Space Grotesk", monospace';
 this.ctx.fillStyle = '#D4A843';
 this.ctx.textAlign = 'center';
 this.ctx.fillText(` 26.9124° N, 75.7873° E · ALT 431M · ${this.tripTitle.toUpperCase()}`, this.width / 2, 90);
 this.ctx.restore();
 }

 // ─────────────────────────────────────────────────────────────────────────────
 // 4. SLOW LUXURY GALLERY (Minimalist Vogue Framing, Silky Morph, Gold Haze)
 // ─────────────────────────────────────────────────────────────────────────────
 renderWanderlustStyle(slideA, slideB, progress, transProgress, isTrans, idxA, idxB, totalTime) {
 this.ctx.fillStyle = '#0A1D1A';
 this.ctx.fillRect(0, 0, this.width, this.height);

 // Luxury Gallery Inset Frame
 const inset = 60;
 const frameW = this.width - inset * 2;
 const frameH = this.height - inset * 2;

 this.ctx.save();
 this.roundRect(inset, inset, frameW, frameH, 24);
 this.ctx.clip();

 if (isTrans && slideB.img) {
 const ease = 0.5 - 0.5 * Math.cos(transProgress * Math.PI);
 this.drawImageFill(slideA.img, 0.5, 0.5, 1.15, 1.0 - ease);
 this.drawImageFill(slideB.img, 0.5, 0.5, 1.15, ease);
 this.drawLightFlare(transProgress);
 } else {
 this.drawImageFill(slideA.img, 0.5 + progress * 0.03, 0.5, 1.06 + progress * 0.08);
 }

 this.drawFloatingEmbers(totalTime);
 this.ctx.restore();

 // Thin Gold Inner Border
 this.ctx.save();
 this.ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
 this.ctx.lineWidth = 2.5;
 this.roundRect(inset, inset, frameW, frameH, 24);
 this.ctx.stroke();

 // Elegant Editorial Typography
 this.ctx.textAlign = 'center';
 this.ctx.font = '300 22px "Space Grotesk", sans-serif';
 this.ctx.fillStyle = '#D4A843';
 this.ctx.letterSpacing = '6px';
 this.ctx.fillText('VOYAGE CHRONICLES ', this.width / 2, inset + 60);

 this.ctx.font = '400 48px "Fraunces", Georgia, serif';
 this.ctx.fillStyle = '#F2EFE6';
 this.ctx.fillText(this.tripTitle, this.width / 2, inset + 115);

 // Bottom Inset Card
 const bottomY = this.height - inset - 120;
 const mainText = slideA.location || slideA.caption || 'Incredible Journey';
 this.ctx.font = '700 50px "Fraunces", Georgia, serif';
 this.ctx.fillStyle = '#F2EFE6';
 this.ctx.shadowColor = 'rgba(0,0,0,0.9)';
 this.ctx.shadowBlur = 18;
 this.ctx.fillText(mainText, this.width / 2, bottomY);
 this.ctx.shadowBlur = 0;

 this.ctx.font = 'italic 300 26px "Schibsted Grotesk", sans-serif';
 this.ctx.fillStyle = '#F2EFE6';
 this.ctx.fillText(`${slideA.day || 'Day 01'} · ${slideA.tag || 'Heritage Tour'}`, this.width / 2, bottomY + 48);

 this.ctx.restore();
 }

 // ─── Shared Drawing Helpers ──────────────────────────────────────────────────
 drawImageFill(img, focusX = 0.5, focusY = 0.5, scale = 1.0, alpha = 1.0, clipX = 0, clipY = 0, clipW = this.width, clipH = this.height) {
 if (!img || !img.width || !img.height) return;

 this.ctx.save();
 this.ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

 const imgAspect = img.width / img.height;
 const canvasAspect = clipW / clipH;

 let drawW, drawH;
 if (imgAspect > canvasAspect) {
 drawH = clipH * scale;
 drawW = drawH * imgAspect;
 } else {
 drawW = clipW * scale;
 drawH = drawW / imgAspect;
 }

 const drawX = clipX + (clipW / 2) - (drawW * focusX);
 const drawY = clipY + (clipH / 2) - (drawH * focusY);

 this.ctx.drawImage(img, drawX, drawY, drawW, drawH);
 this.ctx.restore();
 }

 drawLightFlare(progress) {
 this.ctx.save();
 const flareAlpha = Math.sin(progress * Math.PI) * 0.5;
 if (flareAlpha > 0.01) {
 this.ctx.globalAlpha = flareAlpha;
 this.ctx.globalCompositeOperation = 'screen';
 const flareGrad = this.ctx.createLinearGradient(0, this.height * 0.3, this.width, this.height * 0.7);
 flareGrad.addColorStop(0, 'rgba(245, 158, 11, 0)');
 flareGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.9)');
 flareGrad.addColorStop(1, 'rgba(217, 119, 6, 0)');
 this.ctx.fillStyle = flareGrad;
 this.ctx.fillRect(0, 0, this.width, this.height);
 }
 this.ctx.restore();
 }

 drawFilmBurn(progress) {
 this.ctx.save();
 const burnAlpha = Math.sin(progress * Math.PI) * 0.7;
 if (burnAlpha > 0.01) {
 this.ctx.globalAlpha = burnAlpha;
 this.ctx.globalCompositeOperation = 'screen';
 const burnGrad = this.ctx.createRadialGradient(this.width * 0.9, this.height * 0.2, 20,
 this.width * 0.9, this.height * 0.2, this.width * 0.85
 );
 burnGrad.addColorStop(0, 'rgba(255, 240, 180, 0.95)');
 burnGrad.addColorStop(0.35, 'rgba(245, 158, 11, 0.7)');
 burnGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
 this.ctx.fillStyle = burnGrad;
 this.ctx.fillRect(0, 0, this.width, this.height);
 }
 this.ctx.restore();
 }

 drawFloatingEmbers(totalTime) {
 this.ctx.save();
 this.ctx.globalCompositeOperation = 'screen';
 for (let i = 0; i < this.particles.length; i++) {
 const p = this.particles[i];
 const curX = (p.x + p.speedX * totalTime * 60 + this.width) % this.width;
 const curY = (p.y + p.speedY * totalTime * 60 + this.height) % this.height;
 const pulse = 0.5 + 0.5 * Math.sin(totalTime * p.pulseSpeed + i);
 this.ctx.fillStyle = `rgba(251, 191, 36, ${p.opacity * pulse})`;
 this.ctx.beginPath();
 this.ctx.arc(curX, curY, p.radius, 0, Math.PI * 2);
 this.ctx.fill();
 }
 this.ctx.restore();
 }

 roundRect(x, y, w, h, r) {
 if (w < 2 * r) r = w / 2;
 if (h < 2 * r) r = h / 2;
 this.ctx.beginPath();
 this.ctx.moveTo(x + r, y);
 this.ctx.arcTo(x + w, y, x + w, y + h, r);
 this.ctx.arcTo(x + w, y + h, x, y + h, r);
 this.ctx.arcTo(x, y + h, x, y, r);
 this.ctx.arcTo(x, y, x + w, y, r);
 this.ctx.closePath();
 }

 renderEmptyState() {
 this.ctx.fillStyle = '#061412';
 this.ctx.fillRect(0, 0, this.width, this.height);
 this.ctx.fillStyle = '#D4A843';
 this.ctx.font = 'bold 36px "Fraunces", serif';
 this.ctx.textAlign = 'center';
 this.ctx.fillText('Upload Photos to Create Your Reel', this.width / 2, this.height / 2);
 }
}
