import { REGEX, ERROR_MESSAGES } from "./constants";

// Validation functions
export const validators = {
  required: (value, fieldName = "Field") => {
    if (!value || value.toString().trim() === "") {
      return `${fieldName} is required`;
    }
    return null;
  },

  email: (value) => {
    if (!value) return null;
    if (!REGEX.EMAIL.test(value)) {
      return "Please enter a valid email address";
    }
    return null;
  },

  mobile: (value) => {
    if (!value) return null;
    if (!REGEX.MOBILE.test(value)) {
      return "Please enter a valid 10-digit mobile number";
    }
    return null;
  },

  pincode: (value) => {
    if (!value) return null;
    if (!REGEX.PINCODE.test(value)) {
      return "Please enter a valid pincode";
    }
    return null;
  },

  minLength: (value, min, fieldName = "Field") => {
    if (!value) return null;
    if (value.toString().length < min) {
      return `${fieldName} must be at least ${min} characters long`;
    }
    return null;
  },

  maxLength: (value, max, fieldName = "Field") => {
    if (!value) return null;
    if (value.toString().length > max) {
      return `${fieldName} must be less than ${max} characters`;
    }
    return null;
  },

  coordinates: (lat, lng) => {
    if (!lat || !lng) return null;
    if (!REGEX.COORDINATES.test(lat) || !REGEX.COORDINATES.test(lng)) {
      return "Please enter valid coordinates";
    }
    return null;
  },

  fileSize: (file, maxSize) => {
    if (file.size > maxSize) {
      return ERROR_MESSAGES.FILE_TOO_LARGE;
    }
    return null;
  },

  fileType: (file, allowedTypes) => {
    if (!allowedTypes.includes(file.type)) {
      return ERROR_MESSAGES.INVALID_FILE_TYPE;
    }
    return null;
  },

  rating: (value) => {
    const num = parseFloat(value);
    if (isNaN(num) || num < 1 || num > 5) {
      return "Rating must be between 1 and 5";
    }
    return null;
  },

  url: (value) => {
    if (!value) return null;
    try {
      new URL(value);
      return null;
    } catch {
      return "Please enter a valid URL";
    }
  },
};

// Form validation helper
export function validateForm(data, rules) {
  const errors = {};
  let isValid = true;

  Object.keys(rules).forEach((field) => {
    const fieldRules = rules[field];
    const value = data[field];

    for (const rule of fieldRules) {
      const error = rule(value);
      if (error) {
        errors[field] = error;
        isValid = false;
        break; // Stop at first error for this field
      }
    }
  });

  return { isValid, errors };
}

// Specific form validation schemas
export const validationSchemas = {
  login: {
    email: [validators.required, validators.email],
    password: [(value) => validators.required(value, "Password")],
  },

  register: {
    name: [(value) => validators.required(value, "Name")],
    email: [validators.required, validators.email],
    password: [
      (value) => validators.required(value, "Password"),
      (value) => validators.minLength(value, 6, "Password"),
    ],
    mobile: [validators.mobile],
  },

  profile: {
    name: [(value) => validators.required(value, "Name")],
    email: [validators.email],
    bio: [(value) => validators.maxLength(value, 500, "Bio")],
    location: [(value) => validators.maxLength(value, 100, "Location")],
  },

  review: {
    rating: [
      (value) => validators.required(value, "Rating"),
      validators.rating,
    ],
    title: [(value) => validators.maxLength(value, 100, "Title")],
    content: [
      (value) => validators.required(value, "Review content"),
      (value) => validators.minLength(value, 10, "Review content"),
    ],
  },

  hiddenGem: {
    title: [(value) => validators.required(value, "Title")],
    description: [
      (value) => validators.required(value, "Description"),
      (value) => validators.minLength(value, 50, "Description"),
    ],
    state: [(value) => validators.required(value, "State")],
    city: [(value) => validators.required(value, "City")],
    category: [(value) => validators.required(value, "Category")],
    culturalSignificance: [
      (value) => validators.required(value, "Cultural significance"),
      (value) => validators.minLength(value, 20, "Cultural significance"),
    ],
  },
};
