// src/pages/UploadPage.jsx

import React, { useState, useRef } from "react";
import {
  Upload,
  MapPin,
  Type,
  Camera,
  Mic,
  Star,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  LocateFixed,
  Info,
} from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { uploadFileToStorage, insertHeritageGem } from "../lib/supabaseClient";
import { getSubmitterInfo } from "../services/mockUserService";

const UploadPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    culturalSignificance: "",
    state: "",
    city: "",
    category: "",
    coordinates: { lat: "", lng: "" },
    visitDate: "",
    bestTimeToVisit: "",
    howToReach: "",
    accessibility: "",
    localTips: "",
    nearbyAttractions: [],
    tags: [],
    isHidden: false,
  });

  const [images, setImages] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const [audioRecording, setAudioRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);

  const steps = [
    {
      id: 1,
      title: "Basics",
      icon: Type,
      description: "Tell us about your discovery",
    },
    {
      id: 2,
      title: "Location",
      icon: MapPin,
      description: "Where is this hidden gem?",
    },
    {
      id: 3,
      title: "Media",
      icon: Camera,
      description: "Share photos and recordings",
    },
    {
      id: 4,
      title: "Details",
      icon: Star,
      description: "Add cultural significance",
    },
    {
      id: 5,
      title: "Review",
      icon: CheckCircle,
      description: "Review and submit",
    },
  ];

  const indianStates = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Andaman & Nicobar Islands",
    "Chandigarh",
    "Dadra & Nagar Haveli and Daman & Diu",
    "Delhi",
    "Jammu & Kashmir",
    "Ladakh",
    "Lakshadweep",
    "Puducherry",
  ];

  const categories = [
    "Hidden Tourist Place",
    "Mountain Retreat",
    "Beaches & Islands",
    "Urban Exploration",
    "Historical Landmark",
    "Nature Sanctuary",
    "Cultural Experience",
    "Adventure Spot",
    "Food & Culinary",
    "Village & Rural",
    "Spiritual Site",
    "Modern Architecture",
    "Art Gallery",
    "Photography Point",
    "Local Secret",
    "Other",
  ];

  const suggestedTags = [
    "ancient",
    "temple",
    "fort",
    "palace",
    "sculpture",
    "architecture",
    "festival",
    "tradition",
    "craft",
    "spiritual",
    "historical",
    "cultural",
    "art",
    "music",
    "dance",
    "cuisine",
    "wildlife",
    "nature",
    "photography",
    "meditation",
  ];

  // ----------------- helpers -----------------

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const processFiles = (files) => {
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        alert(`${file.name} isn't an image file — add JPG, PNG, or WebP photos instead`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name} is over the 10MB limit — compress it and try again`);
        return false;
      }
      return true;
    });

    const newImages = validFiles.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file),
      caption: "",
    }));

    setImages((prev) => [...prev, ...newImages].slice(0, 8));
  };

  const removeImage = (id) => {
    setImages((prev) => {
      const updated = prev.filter((img) => img.id !== id);
      const removed = prev.find((img) => img.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return updated;
    });
  };

  const updateImageCaption = (id, caption) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, caption } : img))
    );
  };

  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          handleInputChange(
            "coordinates.lat",
            position.coords.latitude.toFixed(6)
          );
          handleInputChange(
            "coordinates.lng",
            position.coords.longitude.toFixed(6)
          );
          alert("Location detected — coordinates filled in.");
        },
        (error) => {
          alert(
            "Couldn't detect your location (" +
              error.message +
              "). You can type the coordinates in manually."
          );
        }
      );
    } else {
      alert("Your browser doesn't support location detection — type the coordinates in manually.");
    }
  };

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];
      const recordingStartTime = Date.now();

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioRecording({
          blob,
          url: URL.createObjectURL(blob),
          duration: Date.now() - recordingStartTime,
        });
        stream.getTracks().forEach((track) => track.stop());
        setIsRecording(false);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);

      setTimeout(() => {
        if (mediaRecorder.state === "recording") {
          mediaRecorder.stop();
          setIsRecording(false);
        }
      }, 120000);
    } catch (error) {
      alert("Couldn't access your microphone — allow microphone access in your browser and try again.");
      console.error(error);
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const addTag = (tag) => {
    if (!formData.tags.includes(tag)) {
      handleInputChange("tags", [...formData.tags, tag]);
    }
  };

  const removeTag = (tag) => {
    handleInputChange(
      "tags",
      formData.tags.filter((t) => t !== tag)
    );
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return (
          formData.title.trim() &&
          formData.description.trim() &&
          formData.category
        );
      case 2:
        return formData.state && formData.city.trim();
      case 3:
        return images.length > 0;
      case 4:
        return formData.culturalSignificance.trim();
      case 5:
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    } else {
      alert("A few required fields are still empty — fill them in to continue.");
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // ----------------- submit logic (mock user, no Clerk) -----------------

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      alert("A few required fields are still empty — fill them in before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Starting upload...");

      // STEP 1: upload images
      const uploadedImages = [];

      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2);
        const extension = image.file.name.split(".").pop();
        const fileName = `images/mocked/${timestamp}-${random}.${extension}`;

        try {
          console.log(`Uploading image ${i + 1}/${images.length}...`);

          const result = await uploadFileToStorage(image.file, fileName);

          uploadedImages.push({
            url: result.url,
            path: result.path,
            caption: image.caption || "",
            originalName: image.file.name,
            size: image.file.size,
            type: image.file.type,
            uploadedAt: new Date().toISOString(),
          });

          console.log(`Image ${i + 1} uploaded successfully`);
        } catch (error) {
          console.error(`Failed to upload ${image.file.name}:`, error);
          alert(`${image.file.name} didn't upload — check your connection and try again.`);
        }
      }

      if (uploadedImages.length === 0) {
        throw new Error("No images uploaded successfully");
      }

      // STEP 2: upload audio (optional)
      let audioUrl = null;
      if (audioRecording && audioRecording.blob) {
        try {
          console.log("Uploading audio...");
          const timestamp = Date.now();
          const random = Math.random().toString(36).substring(2);
          const audioFileName = `audio/mocked/${timestamp}-${random}.webm`;

          const audioResult = await uploadFileToStorage(
            audioRecording.blob,
            audioFileName
          );
          audioUrl = audioResult.url;

          console.log("Audio uploaded successfully");
        } catch (error) {
          console.error("Audio upload failed:", error);
        }
      }

      // STEP 3: insert into hidden_gems via Supabase
      console.log("Saving to database...");

      const tagsArray = formData.tags || [];

      const submissionData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        cultural_significance: formData.culturalSignificance.trim(),
        state: formData.state,
        city: formData.city.trim(),
        category: formData.category,
        coordinates: {
          lat: formData.coordinates.lat
            ? parseFloat(formData.coordinates.lat)
            : null,
          lng: formData.coordinates.lng
            ? parseFloat(formData.coordinates.lng)
            : null,
        },
        visit_date: formData.visitDate || null,
        best_time_to_visit: formData.bestTimeToVisit.trim() || null,
        how_to_reach: formData.howToReach.trim() || null,
        accessibility: formData.accessibility.trim() || null,
        local_tips: formData.localTips.trim() || null,
        nearby_attractions: formData.nearbyAttractions || [],
        tags: tagsArray,
        is_hidden: formData.isHidden,
        submitter_info: getSubmitterInfo(), // mock user info
        submitter_id: null, // always null
        images: uploadedImages,
        audio_url: audioUrl,
        submitted_at: new Date().toISOString(),
        status: "pending_review",
      };

      const result = await insertHeritageGem(submissionData);

      console.log("Successfully submitted travel gem:", result);
      alert(`"${formData.title}" is submitted for review. It'll appear on the map once our team verifies it.`);

      // reset
      setFormData({
        title: "",
        description: "",
        culturalSignificance: "",
        state: "",
        city: "",
        category: "",
        coordinates: { lat: "", lng: "" },
        visitDate: "",
        bestTimeToVisit: "",
        howToReach: "",
        accessibility: "",
        localTips: "",
        nearbyAttractions: [],
        tags: [],
        isHidden: false,
      });
      setImages([]);
      setAudioRecording(null);
      setCurrentStep(1);
    } catch (error) {
      console.error("Submission error:", error);
      alert("The submission didn't go through — check your connection and try again.\n\nDetails: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ----------------- render steps -----------------

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="gem-title" className="form-label">
                Name of the place *
              </label>
              <input
                id="gem-title"
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="e.g. Sunset point above Chitkul village"
                className="glass-input w-full"
                required
              />
            </div>

            <div>
              <label htmlFor="gem-category" className="form-label">
                Category *
              </label>
              <select
                id="gem-category"
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                className="glass-input w-full appearance-none cursor-pointer"
                required
              >
                <option value="" className="bg-ink-900">Choose a category</option>
                {categories.map((category) => (
                  <option key={category} value={category} className="bg-ink-900">
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="gem-description" className="form-label">
                Description *
              </label>
              <textarea
                id="gem-description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="What is this place, and what does it feel like to be there?"
                className="glass-input w-full h-32 resize-none"
                required
              />
              <p className="mt-1.5 font-data text-[11px] text-ivory-faint tabular-nums">
                {formData.description.length}/1000 characters
              </p>
            </div>

            <label className="flex items-center gap-3 p-3.5 rounded-xl bg-ink-800/60 border border-white/[0.07] cursor-pointer hover:border-white/20 transition">
              <input
                type="checkbox"
                id="hidden"
                checked={formData.isHidden}
                onChange={(e) =>
                  handleInputChange("isHidden", e.target.checked)
                }
                className="w-[18px] h-[18px] accent-saffron"
              />
              <span className="text-sm text-ivory-muted">
                This is a hidden, lesser-known spot
              </span>
            </label>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="gem-state" className="form-label">
                  State or union territory *
                </label>
                <select
                  id="gem-state"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  className="glass-input w-full appearance-none cursor-pointer"
                  required
                >
                  <option value="" className="bg-ink-900">Choose a state</option>
                  {indianStates.map((state) => (
                    <option key={state} value={state} className="bg-ink-900">
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="gem-city" className="form-label">
                  City or district *
                </label>
                <input
                  id="gem-city"
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="e.g. Kinnaur"
                  className="glass-input w-full"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="gem-lat" className="form-label">
                  Latitude
                </label>
                <input
                  id="gem-lat"
                  type="number"
                  value={formData.coordinates.lat}
                  onChange={(e) =>
                    handleInputChange("coordinates.lat", e.target.value)
                  }
                  placeholder="e.g. 31.3506"
                  className="glass-input w-full"
                  step="any"
                />
              </div>

              <div>
                <label htmlFor="gem-lng" className="form-label">
                  Longitude
                </label>
                <input
                  id="gem-lng"
                  type="number"
                  value={formData.coordinates.lng}
                  onChange={(e) =>
                    handleInputChange("coordinates.lng", e.target.value)
                  }
                  placeholder="e.g. 78.4376"
                  className="glass-input w-full"
                  step="any"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="btn-ghost w-full justify-center !py-3"
                >
                  <LocateFixed size={15} aria-hidden="true" />
                  Use my location
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="gem-reach" className="form-label">
                How to reach
              </label>
              <textarea
                id="gem-reach"
                value={formData.howToReach}
                onChange={(e) =>
                  handleInputChange("howToReach", e.target.value)
                }
                placeholder="Nearest railway station or bus stand, and the last stretch to get there"
                className="glass-input w-full h-24 resize-none"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <div>
              <span className="form-label">
                Photos * <span className="normal-case text-ivory-faint">(up to 8 images, 10MB each)</span>
              </span>

              <div
                className={`rounded-2xl border-2 border-dashed p-10 text-center transition-colors cursor-pointer ${dragActive
                  ? "border-saffron/60 bg-saffron/[0.06]"
                  : "border-white/15 hover:border-saffron/40 hover:bg-white/[0.03]"
                  }`}
                onDragEnter={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                }}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
                }}
                aria-label="Add photos"
              >
                <span className="mx-auto mb-4 w-12 h-12 rounded-xl bg-saffron/10 border border-saffron/25 flex items-center justify-center">
                  <Upload size={20} className="text-saffron" aria-hidden="true" />
                </span>
                <p className="text-ivory font-semibold mb-1.5">
                  Drop images here, or click to browse
                </p>
                <p className="font-data text-[11px] uppercase tracking-[0.16em] text-ivory-faint">
                  Sharp, well-lit photos travel furthest
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  {images.map((image, index) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.preview}
                        alt={image.caption || `Photo ${index + 1} preview`}
                        className="w-full h-24 object-cover rounded-xl border border-white/[0.08]"
                      />
                      <button
                        onClick={() => removeImage(image.id)}
                        aria-label={`Remove photo ${index + 1}`}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-ink-950 border border-white/20 text-ivory-muted hover:text-red-400 hover:border-red-400/50 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        ×
                      </button>
                      <input
                        type="text"
                        value={image.caption}
                        onChange={(e) => updateImageCaption(image.id, e.target.value)}
                        placeholder="Caption (optional)"
                        aria-label={`Caption for photo ${index + 1}`}
                        className="mt-2 w-full bg-ink-900/70 border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-ivory placeholder:text-ivory-faint focus:border-saffron/50 focus:outline-none transition-colors"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <span className="form-label">
                Audio story <span className="normal-case text-ivory-faint">(optional)</span>
              </span>
              <div className="bg-ink-800/60 border border-white/[0.07] rounded-2xl p-6 text-center">
                {audioRecording ? (
                  <div>
                    <audio
                      controls
                      src={audioRecording.url}
                      className="w-full mb-4"
                    />
                    <button
                      onClick={() => setAudioRecording(null)}
                      className="text-sm text-ivory-faint hover:text-red-400 font-medium transition-colors"
                    >
                      Delete recording
                    </button>
                  </div>
                ) : (
                  <div>
                    <span className="mx-auto mb-4 w-12 h-12 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center">
                      <Mic size={20} className="text-saffron" aria-hidden="true" />
                    </span>
                    <p className="text-ivory-muted text-sm mb-5">
                      Record the story of this place in your own voice — up to 2 minutes.
                    </p>
                    {isRecording ? (
                      <button
                        onClick={stopAudioRecording}
                        className="px-6 py-3 rounded-full font-semibold text-sm bg-red-500/15 text-red-400 border border-red-500/35 hover:bg-red-500/25 transition-colors"
                      >
                        Stop recording
                      </button>
                    ) : (
                      <button
                        onClick={startAudioRecording}
                        className="btn-ghost"
                      >
                        <Mic size={15} aria-hidden="true" />
                        Start recording
                      </button>
                    )}
                    {isRecording && (
                      <p className="mt-4 flex items-center justify-center gap-2 font-data text-[11px] uppercase tracking-[0.18em] text-red-400">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" aria-hidden="true" />
                        Recording · max 2 min
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="gem-significance" className="form-label">
                Why is it special? *
              </label>
              <textarea
                id="gem-significance"
                value={formData.culturalSignificance}
                onChange={(e) =>
                  handleInputChange("culturalSignificance", e.target.value)
                }
                placeholder="The history, the legend, or simply why travelers should make the detour"
                className="glass-input w-full h-32 resize-none"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="gem-visit-date" className="form-label">
                  When did you visit?
                </label>
                <input
                  id="gem-visit-date"
                  type="date"
                  value={formData.visitDate}
                  onChange={(e) =>
                    handleInputChange("visitDate", e.target.value)
                  }
                  className="glass-input w-full [color-scheme:dark]"
                />
              </div>

              <div>
                <label htmlFor="gem-best-time" className="form-label">
                  Best time to visit
                </label>
                <input
                  id="gem-best-time"
                  type="text"
                  value={formData.bestTimeToVisit}
                  onChange={(e) =>
                    handleInputChange("bestTimeToVisit", e.target.value)
                  }
                  placeholder="e.g. October to March"
                  className="glass-input w-full"
                />
              </div>
            </div>

            <div>
              <label htmlFor="gem-tips" className="form-label">
                Local tips
              </label>
              <textarea
                id="gem-tips"
                value={formData.localTips}
                onChange={(e) => handleInputChange("localTips", e.target.value)}
                placeholder="Entry timings, what to carry, where to eat nearby…"
                className="glass-input w-full h-24 resize-none"
              />
            </div>

            <div>
              <span className="form-label">Tags</span>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 bg-saffron/10 border border-saffron/30 text-saffron px-3 py-1 rounded-full text-sm"
                    >
                      <span>{tag}</span>
                      <button
                        onClick={() => removeTag(tag)}
                        aria-label={`Remove tag ${tag}`}
                        className="text-saffron/70 hover:text-saffron"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {suggestedTags
                  .filter((tag) => !formData.tags.includes(tag))
                  .slice(0, 10)
                  .map((tag) => (
                    <button
                      key={tag}
                      onClick={() => addTag(tag)}
                      className="px-3 py-1 bg-white/[0.05] border border-white/[0.08] text-ivory-muted rounded-full text-sm hover:border-saffron/40 hover:text-saffron transition-colors"
                    >
                      + {tag}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <span className="mx-auto mb-5 w-14 h-14 rounded-2xl bg-saffron/10 border border-saffron/25 flex items-center justify-center">
                <CheckCircle size={26} className="text-saffron" aria-hidden="true" />
              </span>
              <h3 className="font-display text-2xl md:text-3xl font-medium text-ivory mb-2">
                One last look
              </h3>
              <p className="text-ivory-muted text-sm">
                Check the details before you send it in.
              </p>
            </div>

            <div className="bg-ink-800/60 border border-white/[0.07] rounded-2xl p-6 space-y-5">
              <div>
                <h4 className="font-display italic text-xl font-medium text-ivory mb-1">
                  {formData.title}
                </h4>
                <p className="font-data text-[11px] uppercase tracking-[0.12em] text-ivory-faint">
                  {formData.category} · {formData.city}, {formData.state}
                </p>
              </div>

              <p className="text-ivory-muted text-sm leading-relaxed">{formData.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.slice(0, 4).map((image, index) => (
                  <img
                    key={image.id}
                    src={image.preview}
                    alt={`Photo ${index + 1} preview`}
                    className="w-full h-20 object-cover rounded-xl border border-white/[0.08]"
                  />
                ))}
                {images.length > 4 && (
                  <div className="w-full h-20 bg-ink-900 border border-white/[0.08] rounded-xl flex items-center justify-center font-data text-sm text-ivory-faint">
                    +{images.length - 4} more
                  </div>
                )}
              </div>

              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-saffron/10 border border-saffron/25 text-saffron px-2.5 py-1 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-start gap-3 p-4 bg-white/[0.03] border border-white/[0.07] rounded-xl">
              <Info size={16} className="text-saffron mt-0.5 shrink-0" aria-hidden="true" />
              <p className="text-sm text-ivory-muted leading-relaxed">
                The SafarX team reviews every submission before it appears on the map.
                You're submitting as an anonymous contributor — thank you for helping
                travelers across India find the places guidebooks miss.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ----------------- main render -----------------

  return (
    <div className="min-h-screen bg-ink-950 pb-24">
      <div className="max-w-4xl mx-auto px-6 md:px-8 pt-10">
        {/* Header */}
        <div className="mb-12">
          <p className="flex items-center gap-3 mb-5">
            <span className="route-dot" />
            <span className="eyebrow">Field report</span>
            <span className="route-line w-12 hidden sm:inline-block" />
            <span className="eyebrow-muted">Hidden gems</span>
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-light text-ivory tracking-tight leading-[1.08] mb-4">
            Put your <em className="font-medium italic text-saffron-bright">hidden gem</em> on the map
          </h1>
          <p className="text-ivory-muted text-base md:text-lg max-w-2xl leading-relaxed">
            Found a place the guidebooks missed? Share it with travelers across India —
            photos, directions, and the story that makes it worth the detour.
          </p>
        </div>

        {/* Stepper */}
        <div className="glass-panel !rounded-2xl p-5 md:p-6 mb-8">
          <div className="flex items-center justify-between overflow-x-auto" role="list" aria-label="Submission steps">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center flex-shrink-0" role="listitem" aria-current={currentStep === step.id ? "step" : undefined}>
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 border ${currentStep >= step.id
                      ? "bg-saffron text-ink-950 border-saffron"
                      : "bg-ink-800 text-ivory-faint border-white/[0.08]"
                      }`}
                  >
                    {currentStep > step.id ? (
                      <CheckCircle size={18} aria-hidden="true" />
                    ) : (
                      <step.icon size={18} aria-hidden="true" />
                    )}
                  </div>
                  <div
                    className={`mt-2.5 font-data text-[10px] uppercase tracking-[0.16em] ${currentStep >= step.id ? "text-saffron" : "text-ivory-faint"
                      }`}
                  >
                    {step.title}
                  </div>
                </div>

                {index < steps.length - 1 && (
                  <div
                    aria-hidden="true"
                    className={`flex-1 h-px mx-3 md:mx-4 mb-6 transition-all duration-300 ${currentStep > step.id
                      ? "bg-saffron/60"
                      : "bg-white/10"
                      }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="glass-panel !rounded-3xl p-6 md:p-10 mb-8">
          <div className="mb-8 pb-6 border-b border-white/[0.07]">
            <h2 className="font-display text-2xl font-medium text-ivory mb-1">
              {steps[currentStep - 1].title}
            </h2>
            <p className="text-ivory-faint text-sm">{steps[currentStep - 1].description}</p>
          </div>
          <AnimatePresence mode="wait">
            <Motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {renderStep()}
            </Motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div>
            {currentStep > 1 && (
              <button onClick={prevStep} className="btn-ghost">
                <ArrowLeft size={15} aria-hidden="true" />
                Back
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            {currentStep < steps.length ? (
              <button onClick={nextStep} className="btn-primary">
                Continue
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2.5">
                    <span className="animate-spin h-4 w-4 border-2 border-ink-950/40 border-t-ink-950 rounded-full" aria-hidden="true" />
                    Submitting…
                  </span>
                ) : (
                  <>
                    Submit for review
                    <ArrowRight size={16} aria-hidden="true" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
