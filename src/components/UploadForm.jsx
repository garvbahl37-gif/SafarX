import React, { useState, useRef } from "react";
import { Upload, X, Image, MapPin, Calendar, Type } from "lucide-react";
import { toast } from "react-hot-toast";
import { uploadFileToStorage, insertHeritageGem as insertPremiumGem } from "../lib/supabaseClient";

const UploadForm = ({ user, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    state: "",
    city: "",
    category: "",
    coordinates: { lat: "", lng: "" },
    visitDate: "",
    tags: "",
    isHidden: false,
    culturalSignificance: "",
    bestTimeToVisit: "",
    accessibility: "",
    localContact: "",
  });

  const [images, setImages] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        toast.error(`${file.name} is too large (max 10MB)`);
        return false;
      }
      return true;
    });

    const newImages = validFiles.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file),
      caption: "", // Add caption support
    }));

    setImages((prev) => [...prev, ...newImages].slice(0, 8)); // Max 8 images
  };

  const removeImage = (id) => {
    setImages((prev) => {
      const updated = prev.filter((img) => img.id !== id);
      // Clean up object URLs
      const removed = prev.find((img) => img.id === id);
      if (removed) {
        URL.revokeObjectURL(removed.preview);
      }
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
          setFormData((prev) => ({
            ...prev,
            coordinates: {
              lat: position.coords.latitude.toFixed(6),
              lng: position.coords.longitude.toFixed(6),
            },
          }));
          toast.success("Location detected!");
        },
        (error) => {
          toast.error("Failed to get location: " + error.message);
        }
      );
    } else {
      toast.error("Geolocation not supported by browser");
    }
  };

  // UPDATED HANDLESUBMIT WITH SUPABASE INTEGRATION AND USER ID
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Description is required");
      return;
    }

    if (!formData.state) {
      toast.error("State is required");
      return;
    }

    if (!formData.city.trim()) {
      toast.error("City is required");
      return;
    }

    if (!formData.category) {
      toast.error("Category is required");
      return;
    }

    if (images.length === 0) {
      toast.error("At least one image is required");
      return;
    }

    if (!user || !user.id) {
      toast.error("You must be logged in to submit");
      return;
    }

    setIsSubmitting(true);

    try {
      // Start upload process
      toast.loading("Starting upload...", { id: "upload" });

      // STEP 1: Upload all images to Supabase Storage
      const uploadedImages = [];

      for (let i = 0; i < images.length; i++) {
        const image = images[i];

        // Create unique filename
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2);
        const extension = image.file.name.split(".").pop();
        const fileName = `images/${timestamp}-${random}.${extension}`;

        try {
          toast.loading(`Uploading image ${i + 1}/${images.length}...`, {
            id: "upload",
          });

          // Upload to Supabase
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

          console.log(`Successfully uploaded image ${i + 1}:`, result);
        } catch (error) {
          console.error(`Failed to upload ${image.file.name}:`, error);
          toast.error(`Failed to upload ${image.file.name}: ${error.message}`);
        }
      }

      // Check if at least one image uploaded
      if (uploadedImages.length === 0) {
        throw new Error("No images uploaded successfully. Please try again.");
      }

      // STEP 2: Prepare data for database insertion
      toast.loading("Saving to database...", { id: "upload" });

      // Process tags - convert comma-separated string to array
      const tagsArray = formData.tags
        ? formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0)
        : [];

      const submissionData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        cultural_significance: formData.culturalSignificance.trim() || null,
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
        how_to_reach: null,
        accessibility: formData.accessibility.trim() || null,
        local_tips: formData.localContact.trim() || null,
        nearby_attractions: [],
        tags: tagsArray,
        is_hidden: formData.isHidden,
        submitter_info: {
          canContact: true,
        },
        submitter_id: user.id,
        images: uploadedImages,
        audio_url: null,
        submitted_at: new Date().toISOString(),
        status: "pending_review",
      };

      console.log("Prepared submission data:", submissionData);

      // STEP 3: Insert into database
      const result = await insertPremiumGem(submissionData);

      console.log("Successfully submitted heritage gem:", result);

      // Success!
      toast.success(`🎉 "${formData.title}" submitted for review!`, {
        id: "upload",
        duration: 5000,
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        state: "",
        city: "",
        category: "",
        coordinates: { lat: "", lng: "" },
        visitDate: "",
        tags: "",
        isHidden: false,
        culturalSignificance: "",
        bestTimeToVisit: "",
        accessibility: "",
        localContact: "",
      });
      setImages([]);

      // Call original onSubmit if exists (for parent component)
      if (onSubmit) {
        await onSubmit(result);
      }
    } catch (error) {
      console.error("Submission error:", error);

      let errorMessage = "Upload failed. Please try again.";
      if (
        error.message.includes("network") ||
        error.message.includes("fetch")
      ) {
        errorMessage = "Network error. Check your internet connection.";
      } else if (error.message.includes("storage")) {
        errorMessage = "File upload failed. Check file sizes.";
      } else if (
        error.message.includes("database") ||
        error.message.includes("insert")
      ) {
        errorMessage = "Database error. Please try again or contact support.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, { id: "upload", duration: 6000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  const destinations = [
    "France",
    "Italy",
    "Japan",
    "India",
    "USA",
    "Greece",
    "UAE",
    "Switzerland",
    "Australia",
    "United Kingdom",
    "Germany",
    "Canada",
    "Mexico",
    "Brazil",
    "South Africa",
    "Thailand",
    "Vietnam",
    "Rajasthan",
    "Kerala",
    "Goa",
    "Bali",
    "Santorini",
    "Dubai",
    "New York"
  ];

  const categories = [
    "Historic Landmark",
    "Natural Wonder",
    "Modern Architecture",
    "Cultural Experience",
    "Hidden Gem",
    "National Park",
    "Museum & Gallery",
    "UNESCO World Heritage",
    "Traditional Craft",
    "Island Paradise",
    "Ancient Monument",
    "Other",
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="heritage-card p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-premium font-bold premium-text-gradient mb-4">
            Share a Hidden Global Gem
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Help explorers discover unique destinations, landmarks, or cultural practices from around the world.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold flex items-center space-x-2">
              <Type size={24} className="text-saffron-600" />
              <span>Basic Information</span>
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Name of the heritage site or tradition"
                  required
                />
              </div>

              <div>
                <label className="form-label">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="form-label">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="form-input"
                rows="4"
                placeholder="Detailed description of the heritage site, its history, and significance"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.description.length}/1000 characters
              </p>
            </div>

            <div>
              <label className="form-label">Cultural Significance</label>
              <textarea
                name="culturalSignificance"
                value={formData.culturalSignificance}
                onChange={handleInputChange}
                className="form-input"
                rows="3"
                placeholder="Explain the cultural, historical, or spiritual importance"
              />
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold flex items-center space-x-2">
              <MapPin size={24} className="text-saffron-600" />
              <span>Location Details</span>
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Destination/State *</label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                >
                  <option value="">Select destination</option>
                  {destinations.map((dest) => (
                    <option key={dest} value={dest}>
                      {dest}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">City/District *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Nearest city or district"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="form-label">Latitude</label>
                <input
                  type="number"
                  name="coordinates.lat"
                  value={formData.coordinates.lat}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Latitude"
                  step="any"
                />
              </div>

              <div>
                <label className="form-label">Longitude</label>
                <input
                  type="number"
                  name="coordinates.lng"
                  value={formData.coordinates.lng}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Longitude"
                  step="any"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="btn-outline-heritage w-full"
                >
                  Get Current Location
                </button>
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold flex items-center space-x-2">
              <Image size={24} className="text-saffron-600" />
              <span>Images (Required)</span>
            </h3>

            {/* Upload Area */}
            <div
              className={`upload-dropzone ${dragActive ? "dragover" : ""}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="text-center">
                <Upload size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-semibold mb-2">
                  Drag & drop images or click to browse
                </p>
                <p className="text-sm text-gray-600">
                  Upload up to 8 high-quality images (max 10MB each)
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Image Previews */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.preview}
                      alt="Preview"
                      className="w-full h-24 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                    <input
                      type="text"
                      placeholder="Add caption..."
                      value={image.caption}
                      onChange={(e) =>
                        updateImageCaption(image.id, e.target.value)
                      }
                      className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 opacity-0 group-hover:opacity-100 transition-opacity rounded-b-lg"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Additional Information */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold flex items-center space-x-2">
              <Calendar size={24} className="text-saffron-600" />
              <span>Additional Details</span>
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">When did you visit?</label>
                <input
                  type="date"
                  name="visitDate"
                  value={formData.visitDate}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Best time to visit</label>
                <input
                  type="text"
                  name="bestTimeToVisit"
                  value={formData.bestTimeToVisit}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="e.g., October to March"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Tags (comma-separated)</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="form-input"
                placeholder="temple, ancient, sculpture, festival, traditional"
              />
            </div>

            <div>
              <label className="form-label">Accessibility Information</label>
              <textarea
                name="accessibility"
                value={formData.accessibility}
                onChange={handleInputChange}
                className="form-input"
                rows="2"
                placeholder="How to reach, parking, accessibility for elderly/disabled"
              />
            </div>

            <div>
              <label className="form-label">Local Contact (Optional)</label>
              <input
                type="text"
                name="localContact"
                value={formData.localContact}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Local guide or contact person (phone/email)"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="isHidden"
                checked={formData.isHidden}
                onChange={handleInputChange}
                className="rounded border-gray-300 text-saffron-600 focus:ring-saffron-500"
              />
              <label className="text-sm text-gray-700">
                This is a hidden/lesser-known heritage site
              </label>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-heritage px-8 py-3 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Submit for Review"}
            </button>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-8 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors flex-1 sm:flex-none"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> All submissions are reviewed by our team
              before publishing. We may contact you for additional information.
              Thank you for helping preserve India's cultural heritage!
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadForm;
