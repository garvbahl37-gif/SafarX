/**
 * Which language Srishti is speaking, worked out from the script she replied in.
 *
 * The speech model applies English prosody to Indic text unless it is told
 * otherwise — the same Hindi line renders 7.5s with an en-US hint and 7.9s
 * with hi-IN, and the difference is audible: the first is a foreigner reading
 * Devanagari, the second is someone speaking Hindi.
 *
 * Script is a reliable proxy for language across Indian scripts, with one
 * genuine ambiguity: Devanagari carries both Hindi and Marathi. Hindi is the
 * safer default, and the model is asked to name the language when it is not.
 */

const SCRIPTS = [
  [/[஀-௿]/, "ta-IN", "Tamil"],
  [/[ఀ-౿]/, "te-IN", "Telugu"],
  [/[ഀ-ൿ]/, "ml-IN", "Malayalam"],
  [/[ಀ-೿]/, "kn-IN", "Kannada"],
  [/[ঀ-৿]/, "bn-IN", "Bengali"],
  [/[઀-૿]/, "gu-IN", "Gujarati"],
  [/[਀-੿]/, "pa-IN", "Punjabi"],
  [/[଀-୿]/, "or-IN", "Odia"],
  [/[ऀ-ॿ]/, "hi-IN", "Hindi"],
];

/**
 * @param {string} text
 * @returns {{code: string, name: string}} BCP-47 tag for the speech model.
 */
export const detectLanguage = (text = "") => {
  for (const [pattern, code, name] of SCRIPTS) {
    if (pattern.test(text)) return { code, name };
  }
  // Indian English, not American — it is the accent she is meant to have.
  return { code: "en-IN", name: "English" };
};
