import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
 X, Copy, Check, Share2, QrCode,
 Smartphone, ExternalLink, Link2,
 Upload, Loader2, Video, Send, Download, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Upload video to Cloudinary via our server ──────────────────────────────
const uploadVideoToCloudinary = async (videoBlob, onProgress) => {
 const serverUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
 const formData = new FormData();
 formData.append('video', videoBlob, 'safarx-reel.webm');

 return new Promise((resolve, reject) => {
 const xhr = new XMLHttpRequest();
 xhr.open('POST', `${serverUrl}/upload/video`, true);
 xhr.upload.onprogress = (e) => {
 if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 90));
 };
 xhr.onload = () => {
 if (xhr.status === 200) {
 try {
 const data = JSON.parse(xhr.responseText);
 if (data.success && data.url) {
 onProgress(100);
 resolve(data.url);
 } else {
 reject(new Error(data.error || 'Upload failed'));
 }
 } catch { reject(new Error('Invalid server response')); }
 } else {
 reject(new Error(`Upload failed (${xhr.status})`));
 }
 };
 xhr.onerror = () => reject(new Error('Network error — is the server running?'));
 xhr.send(formData);
 });
};

// ─── ShareModal ───────────────────────────────────────────────────────────────
export const ShareModal = ({ isOpen, onClose, journey, videoBlob }) => {
 const [copied, setCopied] = useState(false);
 const [shareUrl, setShareUrl] = useState('');
 const [uploadState, setUploadState] = useState('idle'); // idle | uploading | done | error
 const [uploadProgress, setUploadProgress] = useState(0);

 // Reset states when modal is closed
 useEffect(() => {
 if (!isOpen) {
 setUploadState('idle');
 setUploadProgress(0);
 setShareUrl('');
 setCopied(false);
 }
 }, [isOpen]);

 // ── On-demand Cloudinary Video Upload (ONLY when user requests link/QR) ─────
 const handleGenerateLinkAndQR = async () => {
 if (!videoBlob) {
 toast.error('No video available to upload.');
 return;
 }
 setUploadState('uploading');
 setUploadProgress(0);
 try {
 const url = await uploadVideoToCloudinary(videoBlob, setUploadProgress);
 setUploadState('done');
 setShareUrl(url);
 toast.success('Video link & QR code ready!');
 } catch (err) {
 console.error('Video upload error:', err);
 setUploadState('error');
 toast.error('Upload failed. Is the server running?');
 }
 };

 const handleCopy = () => {
 if (!shareUrl) return;
 navigator.clipboard.writeText(shareUrl).then(() => {
 setCopied(true);
 setTimeout(() => setCopied(false), 2500);
 }).catch(() => {
 const el = document.createElement('textarea');
 el.value = shareUrl;
 document.body.appendChild(el);
 el.select();
 document.execCommand('copy');
 document.body.removeChild(el);
 setCopied(true);
 setTimeout(() => setCopied(false), 2500);
 });
 };

 // ── Native Share Sheet (Share to any app installed on user device) ────────
 const handleNativeShare = async () => {
 if (videoBlob) {
 const videoFile = new File([videoBlob],
 `SafarX-${(journey?.tripTitle || 'Reel').replace(/\s+/g, '-')}.webm`,
 { type: 'video/webm' }
 );

 if (navigator.canShare && navigator.canShare({ files: [videoFile] })) {
 try {
 await navigator.share({
 title: journey?.tripTitle || 'SafarX Travel Reel',
 text: `Check out my travel reel: ${journey?.tripTitle || 'My Journey'}`,
 files: [videoFile],
 });
 return;
 } catch (err) {
 if (err.name === 'AbortError') return;
 }
 }
 }

 if (navigator.share) {
 try {
 await navigator.share({
 title: journey?.tripTitle || 'SafarX Travel Reel',
 text: `Check out my travel reel: ${journey?.tripTitle || 'My Journey'}`,
 url: shareUrl || window.location.href,
 });
 return;
 } catch (err) {
 if (err.name === 'AbortError') return;
 }
 }

 if (shareUrl) {
 handleCopy();
 toast.success('Reel link copied! You can paste and share to any app.');
 } else {
 toast('Generate a link or scan QR code below to share!');
 }
 };

 // ── Direct Download ───────────────────────────────────────────────────────
 const handleDirectDownload = () => {
 if (!videoBlob) return;
 const a = document.createElement('a');
 a.href = URL.createObjectURL(videoBlob);
 a.download = `SafarX_${(journey?.tripTitle || 'Reel').replace(/\s+/g, '_')}_${Date.now()}.webm`;
 document.body.appendChild(a);
 a.click();
 document.body.removeChild(a);
 toast.success('Video downloaded to your device!');
 };

 if (!isOpen || !journey) return null;

 return (<AnimatePresence>
 {isOpen && (<motion.div
 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
 className="fixed inset-0 bg-ink-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50"
 onClick={(e) => e.target === e.currentTarget && onClose()}
 >
 <motion.div
 initial={{ opacity: 0, scale: 0.93, y: 24 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.93, y: 24 }}
 transition={{ type: 'spring', damping: 22, stiffness: 280 }}
 className="bg-ink-900 border border-white/[0.07] rounded-3xl p-6 max-w-sm w-full shadow-2xl shadow-black/70 relative"
 >
 {/* Close */}
 <button onClick={onClose}
 className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 text-ivory-faint hover:text-ivory hover:bg-white/10 transition-colors">
 <X size={16} />
 </button>

 {/* Header */}
 <div className="mb-4 pr-8">
 <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-saffron/10 border border-saffron/25 text-saffron-bright text-[11px] font-semibold uppercase tracking-wider mb-2">
 <Share2 size={11} /> Share Reel
 </div>
 <h3 className="text-lg font-bold text-ivory leading-tight">
 {journey.tripTitle || 'Your Travel Reel'}
 </h3>
 <p className="text-xs text-ivory-muted mt-1">
 {journey.travelerName ? `by ${journey.travelerName} · ` : ''}
 {journey.photos?.length || 0} moments
 </p>
 </div>

 {/* Share Reel through Apps Button */}
 <button
 onClick={handleNativeShare}
 className="w-full py-3.5 mb-2 rounded-2xl bg-gradient-to-r from-saffron via-saffron-deep to-saffron hover:from-saffron-bright hover:to-saffron-bright text-ink-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-saffron/20 transition-all cursor-pointer"
 >
 <Share2 size={16} /> Share Reel through Apps
 </button>

 {/* Save to Device */}
 <button
 onClick={handleDirectDownload}
 className="w-full py-2.5 mb-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/[0.07] text-horizon-bright font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
 >
 <Download size={13} /> Save Video to Device
 </button>

 {/* Optional On-Demand Cloud Link & QR Code Card */}
 <div className="p-3.5 rounded-2xl bg-white/3 border border-white/[0.07] space-y-3">
 <div className="flex items-center justify-between">
 <span className="text-[11px] font-bold text-saffron-bright flex items-center gap-1.5">
 <QrCode size={13} /> Public Link & QR Code
 </span>
 {uploadState === 'done' && (<span className="text-[10px] text-horizon-bright font-semibold bg-horizon/10 px-2 py-0.5 rounded-full"> Ready</span>
 )}
 </div>

 {uploadState === 'idle' && (<div className="text-center py-2 space-y-2.5">
 <p className="text-[11px] text-ivory-muted leading-relaxed">
 Generate a public web link & QR code so anyone can scan or open the video on any phone.
 </p>
 <button
 onClick={handleGenerateLinkAndQR}
 className="w-full py-2.5 rounded-xl bg-saffron/15 hover:bg-saffron/25 border border-saffron/30 text-saffron-bright font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
 >
 <Sparkles size={13} /> Generate Link & QR Code
 </button>
 </div>
 )}

 {uploadState === 'uploading' && (<div className="flex flex-col items-center justify-center py-4 space-y-2 text-center">
 <Loader2 size={24} className="animate-spin text-saffron-bright" />
 <p className="text-xs font-semibold text-ivory">Uploading reel to cloud…</p>
 <p className="text-[10px] text-ivory-faint">{uploadProgress}% complete</p>
 <div className="w-28 h-1 bg-white/10 rounded-full overflow-hidden">
 <div className="h-full bg-saffron transition-all duration-300 rounded-full" style={{ width: `${uploadProgress}%` }} />
 </div>
 </div>
 )}

 {uploadState === 'error' && (<div className="text-center py-2 space-y-1.5">
 <p className="text-xs text-danger-bright font-semibold">Upload failed</p>
 <p className="text-[10px] text-ivory-faint">Check your internet or server</p>
 <button onClick={handleGenerateLinkAndQR} className="text-[11px] text-saffron-bright underline font-semibold cursor-pointer">
 Retry
 </button>
 </div>
 )}

 {uploadState === 'done' && (<div className="space-y-3 flex flex-col items-center">
 <div className="p-2.5 bg-ivory rounded-xl shadow-lg shadow-black/40">
 <QRCodeSVG value={shareUrl} size={140} level="M" fgColor="#0A1D1A" bgColor="#F2EFE6" />
 </div>
 <p className="text-[11px] text-ivory-muted flex items-center gap-1 font-medium">
 <Smartphone size={11} className="text-saffron-bright" /> Scan QR to watch on any phone
 </p>

 {/* Public link copy box */}
 <div className="w-full flex items-center gap-1.5">
 <input readOnly value={shareUrl}
 className="w-full bg-ink-950 border border-white/[0.07] rounded-lg px-2.5 py-1.5 text-[10px] text-ivory-muted font-data focus:outline-none truncate" />
 <button onClick={handleCopy}
 className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold shrink-0 flex items-center gap-1 transition-all ${
 copied ? 'bg-horizon/20 text-horizon-bright border border-horizon/30' : 'bg-saffron hover:bg-saffron-bright text-ink-950'
 }`}>
 {copied ? <Check size={11} /> : <Copy size={11} />}
 {copied ? '' : 'Copy'}
 </button>
 </div>
 </div>
 )}
 </div>
 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>
 );
};
