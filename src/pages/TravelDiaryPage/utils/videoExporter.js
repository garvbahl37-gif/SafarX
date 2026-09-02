/**
 * Video Exporter: High-Fidelity Canvas 2D + Audio Reel Recorder
 * Synchronizes frame-by-frame rendering with MediaRecorder so that the downloaded
 * video matches the live preview in frame rate, Ken Burns motion, flares, and effects.
 */

import { ReelRenderer } from './reelRenderer';

export const exportReelVideo = async (slides, options = {}, onProgress = () => {}) => {
 const width = options.width || 1080;
 const height = options.height || 1920;
 const fps = options.fps || 30;
 const slideDuration = options.slideDuration || 2.8;
 const totalDuration = slides.length * slideDuration;

 // Offscreen canvas for hardware-accelerated rendering
 const exportCanvas = document.createElement('canvas');
 exportCanvas.width = width;
 exportCanvas.height = height;

 const renderer = new ReelRenderer(exportCanvas, {
 width,
 height,
 slideDuration,
 tripTitle: options.tripTitle || 'Royal Rajasthan Odyssey',
 travelerName: options.travelerName || 'SafarX Traveler',
 stylePreset: options.stylePreset || 'capcut'
 });

 onProgress({ status: 'preloading', progress: 5, message: 'Loading high-res photos...' });
 const loadedSlides = await ReelRenderer.preloadImages(slides);
 renderer.setSlides(loadedSlides, options.tripTitle, options.stylePreset || 'capcut');

 // Setup Canvas Stream
 const canvasStream = exportCanvas.captureStream(fps);

 // Combined Media Stream (Video + Audio)
 let combinedStream = canvasStream;
 let audioContext = null;
 let audioSource = null;
 let audioDestination = null;
 let audioElement = null;

 try {
 if (options.audioUrl) {
 audioElement = new Audio();
 audioElement.crossOrigin = 'anonymous';
 audioElement.src = options.audioUrl;

 const AudioCtx = window.AudioContext || window.webkitAudioContext;
 audioContext = new AudioCtx();
 audioDestination = audioContext.createMediaStreamDestination();
 audioSource = audioContext.createMediaElementSource(audioElement);
 audioSource.connect(audioDestination);
 // audioSource is routed strictly to the recording stream (audioDestination), not speaker output

 combinedStream = new MediaStream([
 ...canvasStream.getVideoTracks(),
 ...audioDestination.stream.getAudioTracks()
 ]);
 }
 } catch (e) {
 console.warn('Audio merging warning, exporting video only:', e);
 combinedStream = canvasStream;
 }

 // Determine supported mimeType
 const mimeTypes = [
 'video/mp4;codecs=avc1',
 'video/mp4',
 'video/webm;codecs=vp9,opus',
 'video/webm;codecs=vp8,opus',
 'video/webm'
 ];

 let selectedMimeType = '';
 for (const mime of mimeTypes) {
 if (MediaRecorder.isTypeSupported(mime)) {
 selectedMimeType = mime;
 break;
 }
 }

 if (!selectedMimeType) {
 throw new Error('MediaRecorder video recording is not supported in this browser.');
 }

 return new Promise((resolve, reject) => {
 try {
 const mediaRecorder = new MediaRecorder(combinedStream, {
 mimeType: selectedMimeType,
 videoBitsPerSecond: 8000000 // 8 Mbps high-bitrate crisp quality
 });

 const chunks = [];
 mediaRecorder.ondataavailable = (e) => {
 if (e.data && e.data.size > 0) {
 chunks.push(e.data);
 }
 };

 mediaRecorder.onstop = () => {
 const blob = new Blob(chunks, { type: selectedMimeType });
 const url = URL.createObjectURL(blob);
 const extension = selectedMimeType.includes('mp4') ? 'mp4' : 'webm';
 const filename = `SafarX_${(options.tripTitle || 'Reel').replace(/\s+/g, '_')}_${Date.now()}.${extension}`;

 if (audioElement) audioElement.pause();
 if (audioContext && audioContext.state !== 'closed') audioContext.close();

 onProgress({ status: 'completed', progress: 100, message: 'Reel ready!' });
 resolve({ blob, url, filename });
 };

 mediaRecorder.onerror = (e) => {
 reject(e.error || new Error('Video recording failed'));
 };

 mediaRecorder.start(100);

 if (audioElement) {
 audioElement.currentTime = options.audioStartTime || 0;
 audioElement.play().catch(() => {});
 }

 // Synchronized Frame Loop: render frames in sync with the media recorder stream
 const totalFrames = Math.ceil(totalDuration * fps);
 let currentFrame = 0;
 const frameInterval = 1000 / fps;

 const stepFrame = () => {
 if (options.cancelRef && options.cancelRef.current) {
 try {
 if (mediaRecorder.state !== 'inactive') mediaRecorder.stop();
 if (audioElement) audioElement.pause();
 if (audioContext && audioContext.state !== 'closed') audioContext.close();
 } catch {}
 reject(new Error('Rendering stopped by user'));
 return;
 }

 if (currentFrame >= totalFrames) {
 setTimeout(() => {
 if (mediaRecorder.state !== 'inactive') {
 mediaRecorder.stop();
 }
 }, 300);
 return;
 }

 const currentTimeSec = currentFrame / fps;
 renderer.renderFrame(currentTimeSec);

 const progressPercent = Math.min(98, Math.round((currentFrame / totalFrames) * 92) + 5);
 onProgress({
 status: 'rendering',
 progress: progressPercent,
 message: `Rendering high-res frame ${currentFrame}/${totalFrames}...`
 });

 currentFrame++;
 setTimeout(stepFrame, frameInterval);
 };

 stepFrame();

 } catch (err) {
 reject(err);
 }
 });
};
