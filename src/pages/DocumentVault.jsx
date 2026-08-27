import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Upload, Trash2, Shield, Lock,
  Cloud, Plus, FileCheck, CheckCircle2, Info, FolderOpen
} from 'lucide-react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { getDocuments, uploadDocument, deleteDocument } from '../services/documentService';

const docTypes = [
  'Passport', 'Visa', 'Aadhaar Card', 'Vaccination Certificate',
  'Flight Ticket', 'Train Ticket', 'Hotel Booking', 'Travel Insurance', 'ID Card', 'Other'
];

export default function DocumentVault() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const [docs, setDocs] = useState([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('Passport');
  const [customType, setCustomType] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadError, setUploadError] = useState('');
  // If auth never finishes loading (e.g. no Clerk key configured), fall
  // through to the signed-out state instead of spinning forever.
  const [authTimedOut, setAuthTimedOut] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAuthTimedOut(true), 4000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (isSignedIn) loadDocuments();
  }, [isSignedIn]);

  const loadDocuments = async () => {
    try {
      const token = await getToken();
      if (!token) throw new Error('No authentication token found');
      const data = await getDocuments(token);
      setDocs(data);
    } catch (err) {
      console.error('Fetch docs error:', err);
    }
  };

  const handleUpload = async (e) => {
    e?.preventDefault();
    if (!file || !name) return;
    setLoading(true);
    setUploadError('');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    formData.append('type', type === 'Other' ? customType || 'Other' : type);

    try {
      const token = await getToken();
      if (!token) throw new Error('No authentication token found');
      await uploadDocument(formData, token);
      loadDocuments();
      resetForm();
      setShowUploadModal(false);
    } catch (err) {
      console.error('Upload Error:', err);
      setUploadError("The upload didn't go through — check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setFile(null);
    setCustomType('');
    setType('Passport');
    setUploadError('');
  };

  const handleDelete = async (id) => {
    if (deletingId === id) return;
    if (!confirm('Delete this document permanently? This can\'t be undone.')) return;

    setDeletingId(id);
    try {
      const token = await getToken();
      if (!token) throw new Error('No authentication token found');
      await deleteDocument(id, token);
      loadDocuments();
    } catch (err) {
      console.error('Delete failed:', err.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (!isLoaded && !authTimedOut) return (
    <div className="flex items-center justify-center min-h-screen bg-ink-950">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-white/10 border-t-saffron" aria-label="Loading" />
    </div>
  );

  if (!isSignedIn) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] bg-ink-950 p-6 text-center">
      <div className="w-16 h-16 bg-saffron/10 border border-saffron/25 rounded-2xl flex items-center justify-center mb-6">
        <Lock className="w-7 h-7 text-saffron" aria-hidden="true" />
      </div>
      <h2 className="font-display text-3xl font-medium text-ivory mb-3">Vault locked</h2>
      <p className="text-ivory-muted max-w-md leading-relaxed">
        Sign in to open your document vault and keep tickets, visas, and IDs in one secure place.
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-ink-950 pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-8 pt-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <p className="flex items-center gap-3 mb-5">
              <span className="route-dot" />
              <span className="eyebrow">Encrypted · Offline-ready</span>
              <span className="route-line w-12 hidden sm:inline-block" />
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-light text-ivory tracking-tight leading-[1.08] mb-4">
              Your papers, <em className="font-medium italic text-saffron-bright">always on you</em>
            </h1>
            <p className="text-ivory-muted text-base md:text-lg max-w-xl leading-relaxed">
              Tickets, visas, and IDs — stored once, ready at every checkpoint from Leh to Kanyakumari.
            </p>
          </div>

          <Motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowUploadModal(true)}
            className="btn-primary shrink-0 self-start md:self-auto"
          >
            <Plus size={16} aria-hidden="true" />
            Add a document
          </Motion.button>
        </header>

        {/* Stats & Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          <div className="bg-ink-800 p-6 rounded-2xl border border-white/[0.07] flex items-center gap-5">
            <div className="w-12 h-12 bg-saffron/10 border border-saffron/25 rounded-xl flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-saffron" aria-hidden="true" />
            </div>
            <div>
              <p className="font-data text-[10px] uppercase tracking-[0.18em] text-ivory-faint mb-1">Secure vault</p>
              <h3 className="font-data text-lg font-medium text-ivory">256-bit encrypted</h3>
            </div>
          </div>
          <div className="bg-ink-800 p-6 rounded-2xl border border-white/[0.07] flex items-center gap-5">
            <div className="w-12 h-12 bg-saffron/10 border border-saffron/25 rounded-xl flex items-center justify-center shrink-0">
              <Cloud className="w-5 h-5 text-saffron" aria-hidden="true" />
            </div>
            <div>
              <p className="font-data text-[10px] uppercase tracking-[0.18em] text-ivory-faint mb-1">Stored files</p>
              <h3 className="font-data text-lg font-medium text-ivory tabular-nums">
                {docs.length} {docs.length === 1 ? 'document' : 'documents'}
              </h3>
            </div>
          </div>
          <div className="bg-ink-800 p-6 rounded-2xl border border-white/[0.07] flex items-center gap-5">
            <div className="w-12 h-12 bg-saffron/10 border border-saffron/25 rounded-xl flex items-center justify-center shrink-0">
              <FileCheck className="w-5 h-5 text-saffron" aria-hidden="true" />
            </div>
            <div>
              <p className="font-data text-[10px] uppercase tracking-[0.18em] text-ivory-faint mb-1">Verified access</p>
              <h3 className="font-data text-lg font-medium text-ivory">{user?.firstName || 'Traveler'}</h3>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <AnimatePresence mode="popLayout">
          {docs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {docs.map((doc) => (
                <Motion.div
                  key={doc._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group bg-ink-800 rounded-2xl border border-white/[0.07] hover:border-saffron/35 transition-colors duration-500 overflow-hidden"
                >
                  <div
                    onClick={() => doc.url && window.open(doc.url, '_blank')}
                    className="aspect-[4/3] bg-ink-900 relative overflow-hidden flex items-center justify-center cursor-pointer"
                  >
                    {doc.url?.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
                      <img
                        src={doc.url}
                        alt={doc.name}
                        className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 bg-saffron/10 border border-saffron/25 rounded-xl flex items-center justify-center">
                          <FileText className="w-6 h-6 text-saffron" aria-hidden="true" />
                        </div>
                        <span className="font-data text-[10px] text-ivory-faint uppercase tracking-[0.18em]">Digital document</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute top-3 right-3 flex gap-2 translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(doc._id);
                        }}
                        disabled={deletingId === doc._id}
                        aria-label={`Delete ${doc.name}`}
                        className="p-2.5 bg-ink-950/80 backdrop-blur-md border border-white/10 text-ivory-muted rounded-xl hover:text-red-400 hover:border-red-400/40 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h4 className="font-bold text-ivory text-sm truncate flex-1">{doc.name}</h4>
                      <span className="px-2.5 py-1 bg-saffron/10 border border-saffron/25 text-saffron font-data text-[9px] uppercase tracking-[0.14em] rounded-md shrink-0">
                        {doc.type}
                      </span>
                    </div>
                    <div className="flex items-center justify-between font-data text-[11px] text-ivory-faint">
                      <span>Ref #{doc._id.slice(-6).toUpperCase()}</span>
                      <div className="flex items-center gap-3">
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-saffron hover:text-saffron-bright font-bold transition-colors"
                        >
                          View
                        </a>
                        <span className="w-px h-3 bg-white/15" aria-hidden="true" />
                        <a
                          href={doc.url}
                          download={doc.name}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-ivory-muted hover:text-ivory font-bold transition-colors"
                        >
                          Download
                        </a>
                      </div>
                    </div>
                  </div>
                </Motion.div>
              ))}
            </div>
          ) : (
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center bg-ink-900/60 rounded-3xl border-2 border-dashed border-white/10"
            >
              <div className="w-16 h-16 bg-saffron/10 border border-saffron/25 rounded-2xl flex items-center justify-center mb-5">
                <FolderOpen className="w-7 h-7 text-saffron" aria-hidden="true" />
              </div>
              <h3 className="font-display text-2xl font-medium text-ivory mb-2">No documents yet</h3>
              <p className="text-ivory-muted max-w-sm leading-relaxed mb-8">
                Add your first travel document — a passport, visa, or ticket — and it'll be here whenever you need it.
              </p>
              <button onClick={() => setShowUploadModal(true)} className="btn-ghost">
                <Plus size={16} aria-hidden="true" />
                Add a document
              </button>
            </Motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Upload modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-[11000] flex items-center justify-center p-4">
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !loading && setShowUploadModal(false)}
              className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm"
            />
            <Motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative bg-ink-900 border border-white/[0.09] w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
              role="dialog"
              aria-modal="true"
              aria-labelledby="vault-modal-title"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <p className="eyebrow !text-[10px] mb-2">Vault · New entry</p>
                    <h3 id="vault-modal-title" className="font-display text-2xl md:text-3xl font-medium text-ivory tracking-tight">
                      Add a document
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowUploadModal(false)}
                    aria-label="Close"
                    className="p-2 text-ivory-muted hover:text-ivory hover:bg-white/[0.06] rounded-full transition-colors"
                  >
                    <Plus className="rotate-45" aria-hidden="true" />
                  </button>
                </div>

                <form onSubmit={handleUpload} className="space-y-6">
                  {/* File upload area */}
                  <div className="relative group">
                    <input
                      type="file"
                      id="file-upload"
                      required
                      onChange={(e) => setFile(e.target.files[0])}
                      className="hidden"
                    />
                    <label
                      htmlFor="file-upload"
                      className={`
                        relative flex flex-col items-center justify-center w-full min-h-[160px]
                        rounded-2xl border-2 border-dashed cursor-pointer transition-all gap-3 overflow-hidden
                        ${file ? 'border-saffron/60 bg-saffron/[0.06]' : 'border-white/15 hover:border-saffron/40 hover:bg-white/[0.03]'}
                      `}
                    >
                      {file ? (
                        <div className="flex flex-col items-center text-center p-4">
                          <div className="w-12 h-12 bg-saffron/10 border border-saffron/25 rounded-xl flex items-center justify-center mb-3">
                            <CheckCircle2 className="w-5 h-5 text-saffron" aria-hidden="true" />
                          </div>
                          <p className="text-sm font-bold text-ivory max-w-[240px] truncate">{file.name}</p>
                          <p className="font-data text-[10px] text-ivory-faint mt-1 uppercase tracking-[0.14em]">Click to change file</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 bg-white/[0.05] border border-white/[0.08] group-hover:bg-saffron/10 group-hover:border-saffron/25 rounded-xl flex items-center justify-center mb-3 transition-colors">
                            <Upload className="w-5 h-5 text-ivory-faint group-hover:text-saffron transition-colors" aria-hidden="true" />
                          </div>
                          <p className="text-sm font-bold text-ivory">Choose a file</p>
                          <p className="font-data text-[10px] text-ivory-faint mt-1 uppercase tracking-[0.14em]">PDF, JPG, PNG · up to 10MB</p>
                        </div>
                      )}
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="doc-name" className="form-label">Document name</label>
                      <input
                        id="doc-name"
                        type="text"
                        required
                        value={name}
                        placeholder="e.g. My passport"
                        onChange={(e) => setName(e.target.value)}
                        className="glass-input w-full"
                      />
                    </div>

                    <div>
                      <label htmlFor="doc-type" className="form-label">Type</label>
                      <select
                        id="doc-type"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="glass-input w-full appearance-none cursor-pointer"
                      >
                        {docTypes.map((t) => (
                          <option key={t} value={t} className="bg-ink-900">{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {type === 'Other' && (
                    <Motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                    >
                      <label htmlFor="doc-custom-type" className="form-label">What kind of document is it?</label>
                      <input
                        id="doc-custom-type"
                        type="text"
                        placeholder="e.g. Permit, membership card"
                        value={customType}
                        onChange={(e) => setCustomType(e.target.value)}
                        className="glass-input w-full"
                      />
                    </Motion.div>
                  )}

                  {uploadError && (
                    <p role="alert" className="text-sm text-red-400 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3">
                      {uploadError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !file || !name}
                    className="btn-primary w-full justify-center !py-4 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2.5">
                        <span className="w-4 h-4 border-2 border-ink-950/40 border-t-ink-950 rounded-full animate-spin" aria-hidden="true" />
                        Saving to vault…
                      </span>
                    ) : (
                      'Save to vault'
                    )}
                  </button>
                </form>

                <div className="mt-6 flex items-start gap-3 p-4 bg-white/[0.03] rounded-xl border border-white/[0.07]">
                  <Info className="w-4 h-4 text-saffron mt-0.5 shrink-0" aria-hidden="true" />
                  <p className="text-[12px] text-ivory-faint leading-relaxed">
                    Documents are encrypted before storage. Only you can open them, through your verified account.
                  </p>
                </div>
              </div>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
