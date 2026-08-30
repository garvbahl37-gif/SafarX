import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useSignIn, useSignUp, useClerk } from "@clerk/clerk-react";
import { ArrowRight, ArrowLeft, Eye, EyeOff } from "lucide-react";

/**
 * Signing in to SafarX.
 *
 * Written against Clerk's headless hooks rather than its prebuilt screens, so
 * every pixel is ours: Clerk keeps the passwords and the sessions, and nothing
 * of its own interface reaches the traveller.
 *
 * The page opens on somewhere real. SafarX sells standing in a place before you
 * go, so the sign-in screen stands in one — a vista drawn from the same tour
 * library the rest of the app uses, with that site's true coordinates read out
 * beside it. The form is the quiet half.
 */

const EASE = [0.22, 1, 0.36, 1];

/* Three places, moving, with the still from the tour library behind each one.
   Every clip is a 1080p rendition rather than the 4K files the rest of the app
   opens with: the same Taj footage is 2.3MB at 1080p and 8.8MB at 4K, and a
   sign-in screen that spends eight megabytes before you can type your password
   is a worse screen, not a richer one. Sizes were curl-checked. */
const VISTAS = [
  {
    id: "taj-mahal",
    name: "Taj Mahal",
    where: "Agra, Uttar Pradesh",
    lat: 27.17501,
    lng: 78.0421,
    still: "/images/vr_thumbnails/taj-mahal.jpg",
    video: "https://videos.pexels.com/video-files/19717370/19717370-hd_1920_1080_30fps.mp4",
  },
  {
    id: "jodhpur",
    name: "Mehrangarh Fort",
    where: "Jodhpur, Rajasthan",
    lat: 26.29785,
    lng: 73.01862,
    still: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=1600&auto=format&fit=crop&q=70",
    video: "https://videos.pexels.com/video-files/17453762/17453762-hd_1920_1080_24fps.mp4",
  },
  {
    id: "jaipur",
    name: "The Pink City",
    where: "Jaipur, Rajasthan",
    lat: 26.98631,
    lng: 75.85066,
    still: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1600&auto=format&fit=crop&q=70",
    video: "https://videos.pexels.com/video-files/37056813/15698517_1920_1080_50fps.mp4",
  },
];
const VISTA_MS = 11000;

/** 27.17501 → 27.1750° N. The readout the rest of SafarX uses. */
const coord = (value, positive, negative) =>
  `${Math.abs(value).toFixed(4)}° ${value >= 0 ? positive : negative}`;

/* ── The vista ──────────────────────────────────────────────────────── */

/**
 * One scene: the still underneath, the film over it once it can actually play.
 *
 * The order matters. The photograph is up immediately, so the panel is never
 * blank and never a black hole while several megabytes arrive; the video fades
 * in only on `canplay`, so a slow connection degrades to a still rather than to
 * nothing. If the file fails outright the still simply stays.
 */
const Scene = ({ place, active, reduce }) => {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (active) el.play?.().catch(() => {});
    else el.pause?.();
  }, [active]);

  return (
    <>
      <img
        src={place.still}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
        onError={(e) => { e.currentTarget.style.opacity = 0; }}
      />
      {!reduce && (
        <motion.video
          ref={videoRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: playing ? 1 : 0 }}
          transition={{ duration: 1.2, ease: EASE }}
          src={place.video}
          poster={place.still}
          muted
          loop
          playsInline
          /* Only the scene on screen is worth bytes; the rest wait their turn. */
          preload={active ? "auto" : "none"}
          onCanPlay={() => setPlaying(true)}
          onError={() => setPlaying(false)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </>
  );
};

const Vista = () => {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // One place, held, if the traveller has asked for less movement.
    if (reduce || VISTAS.length < 2) return undefined;
    const timer = setInterval(() => setIndex((i) => (i + 1) % VISTAS.length), VISTA_MS);
    return () => clearInterval(timer);
  }, [reduce]);

  const place = VISTAS[index];

  return (
    <div className="relative h-full w-full overflow-hidden bg-ink-950">
      <AnimatePresence mode="sync">
        <motion.div
          key={place.id}
          initial={{ opacity: 0, scale: reduce ? 1 : 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 1.4, ease: EASE }, scale: { duration: VISTA_MS / 1000 + 1.4, ease: "linear" } }}
          className="absolute inset-0"
        >
          <Scene place={place} active reduce={reduce} />
        </motion.div>
      </AnimatePresence>

      {/* Ink washes in from the form's edge so the join reads as one page. */}
      <div className="absolute inset-0 bg-gradient-to-r from-ink-950/40 via-ink-950/15 to-ink-950" />
      {/* On the phone band the readout sits over the middle of the frame,
          which can be the brightest part of it — so the band gets a deeper
          wash than the full panel needs. */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/45 to-ink-950/55 lg:via-transparent" />

      {/* The photograph stops at the column edge; without this the bright
          sky met the ink in a visible seam. */}
      <div className="absolute inset-y-0 right-0 hidden w-40 bg-gradient-to-r from-transparent to-ink-950 lg:block" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-ink-950 lg:hidden" />

      <div className="relative flex h-full flex-col justify-between p-6 sm:p-8 lg:p-10 xl:p-14">
        <Link
          to="/"
          className="flex items-baseline gap-0.5 self-start rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron/70 focus-visible:ring-offset-4 focus-visible:ring-offset-ink-950"
          aria-label="SafarX home"
        >
          <span className="font-display italic font-medium text-[1.45rem] text-ivory tracking-tight">Safar</span>
          <span className="font-data text-[1.2rem] text-saffron tracking-[0.04em] font-bold">X</span>
        </Link>

        <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={place.id}
              initial={{ opacity: 0, y: reduce ? 0 : 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduce ? 0 : -10 }}
              transition={{ duration: 0.7, ease: EASE }}
            >
              <p className="eyebrow mb-3">
                {coord(place.lat, "N", "S")} · {coord(place.lng, "E", "W")}
              </p>
              <h2 className="font-display text-[2.6rem] xl:text-[3.2rem] leading-[1.05] text-ivory">
                {place.name}
              </h2>
              <p className="mt-2 font-data text-[10px] uppercase tracking-[0.2em] text-ivory-faint">
                {place.where}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 hidden items-center gap-3 lg:flex">
            <span className="route-dot" aria-hidden="true" />
            <span className="route-line flex-1" aria-hidden="true" />
            <span className="route-dot" aria-hidden="true" />
          </div>

          <p className="mt-6 hidden max-w-sm font-sans text-[15px] leading-relaxed text-ivory-muted lg:block">
            Thirty-four places across India you can stand in, in 360°, before you
            book a thing.
          </p>
        </div>
      </div>
    </div>
  );
};

/* ── Fields ─────────────────────────────────────────────────────────── */

const Field = ({ id, label, hint, children }) => (
  <div>
    <div className="mb-2 flex items-baseline justify-between gap-3">
      <label htmlFor={id} className="eyebrow-muted">{label}</label>
      {hint}
    </div>
    {children}
  </div>
);

const PasswordField = ({ id, label, value, onChange, autoComplete, hint }) => {
  const [shown, setShown] = useState(false);
  return (
    <Field id={id} label={label} hint={hint}>
      <div className="relative">
        <input
          id={id}
          type={shown ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          required
          className="glass-input pr-12"
        />
        <button
          type="button"
          onClick={() => setShown((v) => !v)}
          aria-label={shown ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-ivory-faint transition-colors hover:text-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron/70"
        >
          {shown ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </Field>
  );
};

/** Clerk's own messages are already specific and written for travellers. */
const readError = (err) =>
  err?.errors?.[0]?.longMessage ||
  err?.errors?.[0]?.message ||
  "That did not go through. Check the details and try again.";

const Notice = ({ children }) =>
  children ? (
    <p
      role="alert"
      className="rounded-xl border border-[#E05252]/35 bg-[#E05252]/[0.08] px-4 py-3 font-sans text-[13.5px] leading-relaxed text-[#F0A8A8]"
    >
      {children}
    </p>
  ) : null;

const GoogleMark = () => (
  <svg width="17" height="17" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#4285F4" d="M45.1 24.5c0-1.6-.1-3.2-.4-4.7H24v8.9h11.8c-.5 2.7-2 5.1-4.4 6.7v5.5h7.1c4.2-3.8 6.6-9.5 6.6-16.4z" />
    <path fill="#34A853" d="M24 46c6 0 11-2 14.6-5.4l-7.1-5.5c-2 1.3-4.5 2.1-7.5 2.1-5.8 0-10.7-3.9-12.4-9.750H4.2v5.7C7.8 40.9 15.3 46 24 46z" />
    <path fill="#FBBC05" d="M11.6 27.4c-.4-1.3-.7-2.7-.7-4.4s.3-3.1.7-4.4v-5.7H4.2C2.8 15.9 2 19.4 2 23s.8 7.1 2.2 10.1l7.4-5.7z" />
    <path fill="#EA4335" d="M24 10.2c3.3 0 6.2 1.1 8.5 3.3l6.3-6.3C35 3.6 30 1.5 24 1.5 15.3 1.5 7.8 6.6 4.2 13.9l7.4 5.7C13.3 14.1 18.2 10.2 24 10.2z" />
  </svg>
);

/* ── Coming back from Google ────────────────────────────────────────── */

/**
 * Finishes the OAuth handshake on our own terms.
 *
 * Clerk's stock callback, handed a request it cannot complete, sends the
 * traveller to its hosted account portal — its interface reappearing in an app
 * that deliberately has none of it. Driving the callback ourselves keeps every
 * outcome, success or failure, inside SafarX.
 */
export const SsoCallback = () => {
  const { handleRedirectCallback } = useClerk();
  const navigate = useNavigate();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    handleRedirectCallback(
      {
        signInUrl: "/signin",
        signUpUrl: "/signup",
        signInForceRedirectUrl: "/",
        signUpForceRedirectUrl: "/",
        continueSignUpUrl: "/signup",
      },
      (to) => {
        // Keep it in the router: a bare path must not become a full page load.
        navigate(to, { replace: true });
        return Promise.resolve();
      }
    ).catch(() => navigate("/signin", { replace: true }));
  }, [handleRedirectCallback, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-6">
      <div className="text-center">
        <div className="mb-6 flex items-center justify-center gap-3" aria-hidden="true">
          <span className="route-dot" />
          <span className="route-line w-28" />
          <span className="route-dot animate-pulse" />
        </div>
        <p className="eyebrow mb-3">Signing you in</p>
        <p className="font-display text-[1.6rem] text-ivory">One moment.</p>
      </div>
    </div>
  );
};

/* ── The page ───────────────────────────────────────────────────────── */

const AuthPage = ({ mode = "signin" }) => {
  const joining = mode === "signup";
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  const { isLoaded: signInReady, signIn, setActive: activateSignIn } = useSignIn();
  const { isLoaded: signUpReady, signUp, setActive: activateSignUp } = useSignUp();
  const ready = joining ? signUpReady : signInReady;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [code, setCode] = useState("");
  /* Joining really is two legs — details, then the code in the inbox. Signing
     in is one, so it gets no waypoints to pretend otherwise. */
  const [stage, setStage] = useState("details");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const codeRef = useRef(null);

  useEffect(() => {
    setError(null);
    setStage("details");
  }, [mode]);

  useEffect(() => {
    if (stage === "confirm") codeRef.current?.focus();
  }, [stage]);

  const land = async (activate, sessionId) => {
    await activate({ session: sessionId });
    navigate("/");
  };

  const inFlight = useRef(false);
  const submit = async (e) => {
    e.preventDefault();
    /* `busy` is state, so two submits in the same tick both read it as false —
       Enter and a click together were enough to send the attempt twice. A ref
       is set synchronously and closes that window. */
    if (!ready || busy || inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError(null);
    try {
      if (!joining) {
        const attempt = await signIn.create({ identifier: email, password });
        if (attempt.status === "complete") {
          await land(activateSignIn, attempt.createdSessionId);
          return;
        }
        setError("This account needs another step that SafarX cannot finish here yet.");
        return;
      }

      if (stage === "details") {
        await signUp.create({
          emailAddress: email,
          password,
          ...(firstName.trim() ? { firstName: firstName.trim() } : {}),
        });
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
        setStage("confirm");
        return;
      }

      const attempt = await signUp.attemptEmailAddressVerification({ code });
      if (attempt.status === "complete") {
        await land(activateSignUp, attempt.createdSessionId);
        return;
      }
      setError("That code did not complete the sign-up. Ask for a new one and try again.");
    } catch (err) {
      setError(readError(err));
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };

  const withGoogle = async () => {
    if (!ready || busy) return;
    setError(null);
    try {
      const flow = joining ? signUp : signIn;
      await flow.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/",
      });
    } catch (err) {
      setError(readError(err));
    }
  };

  const confirming = joining && stage === "confirm";
  const heading = joining ? "Begin your" : "Continue your";

  return (
    <div className="grid min-h-screen bg-ink-950 lg:h-screen lg:overflow-hidden lg:grid-cols-[1.05fr_minmax(0,0.95fr)]">
      {/* Vista: the left half on a desktop, a band above the form on a phone. */}
      <div className="relative hidden lg:block">
        <Vista />
      </div>
      <div className="relative h-44 sm:h-56 lg:hidden">
        <Vista />
      </div>

      <div className="flex items-center justify-center px-6 py-8 [@media(min-height:880px)]:py-12 sm:px-10 lg:h-screen lg:overflow-y-auto lg:px-14">
        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="w-full max-w-[26rem]"
        >
          <Link
            to="/"
            className="mb-5 [@media(min-height:880px)]:mb-7 inline-flex items-center gap-2 font-data text-[10.5px] uppercase tracking-[0.22em] text-ivory-faint transition-colors hover:text-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron/70 focus-visible:ring-offset-4 focus-visible:ring-offset-ink-950"
          >
            <ArrowLeft size={13} aria-hidden="true" />
            Back to SafarX
          </Link>

          <p className="eyebrow mb-4">{joining ? "Create account" : "Sign in"}</p>
          <h1 className="font-display text-[2.1rem] [@media(min-height:880px)]:text-[2.5rem] leading-[1.06] text-ivory">
            {heading}{" "}
            <em className="not-italic font-display italic text-saffron">journey.</em>
          </h1>
          <p className="mt-3 font-sans text-[14.5px] leading-relaxed text-ivory-muted">
            {joining
              ? "Your itineraries, saved tours and travel documents stay with your account."
              : "Pick up your saved itineraries, tours and documents where you left them."}
          </p>

          {/* Waypoints, only where there are genuinely two legs. */}
          {joining && (
            <div className="mt-6 [@media(min-height:880px)]:mt-8 flex items-center gap-3" aria-hidden="true">
              {["Details", "Confirm"].map((label, i) => {
                const active = (stage === "details" ? 0 : 1) >= i;
                return (
                  <React.Fragment key={label}>
                    {i > 0 && <span className="route-line w-10 shrink-0" />}
                    <span className="flex items-center gap-2">
                      <span
                        className={`h-[7px] w-[7px] rounded-full transition-colors ${
                          active ? "bg-saffron shadow-[0_0_10px_rgba(212,168,67,0.7)]" : "bg-white/20"
                        }`}
                      />
                      <span
                        className={`font-data text-[9.5px] uppercase tracking-[0.2em] transition-colors ${
                          active ? "text-saffron" : "text-ivory-faint"
                        }`}
                      >
                        {label}
                      </span>
                    </span>
                  </React.Fragment>
                );
              })}
            </div>
          )}

          <form onSubmit={submit} className="mt-5 space-y-3.5 [@media(min-height:880px)]:mt-7 [@media(min-height:880px)]:space-y-5">
            {confirming ? (
              <>
                <p className="font-sans text-[14px] leading-relaxed text-ivory-muted">
                  We sent a six-digit code to <span className="text-ivory">{email}</span>.
                </p>
                <Field id="code" label="Verification code">
                  <input
                    ref={codeRef}
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="000000"
                    required
                    className="glass-input font-data text-center text-[1.35rem] tracking-[0.5em]"
                  />
                </Field>
                <button
                  type="button"
                  onClick={() => { setStage("details"); setCode(""); setError(null); }}
                  className="font-data text-[10px] uppercase tracking-[0.2em] text-ivory-faint transition-colors hover:text-saffron"
                >
                  Use a different email
                </button>
              </>
            ) : (
              <>
                {joining && (
                  <Field id="firstName" label="First name">
                    <input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      autoComplete="given-name"
                      placeholder="Optional"
                      className="glass-input"
                    />
                  </Field>
                )}
                <Field id="email" label="Email">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    placeholder="you@example.com"
                    required
                    className="glass-input"
                  />
                </Field>
                <PasswordField
                  id="password"
                  label="Password"
                  value={password}
                  onChange={setPassword}
                  autoComplete={joining ? "new-password" : "current-password"}
                />
              </>
            )}

            <Notice>{error}</Notice>

            <button
              type="submit"
              disabled={!ready || busy}
              className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-55"
            >
              {busy ? "Working…" : confirming ? "Confirm and continue" : "Continue"}
              {!busy && <ArrowRight size={15} aria-hidden="true" />}
            </button>
          </form>

          {!confirming && (
            <>
              <div className="my-5 [@media(min-height:880px)]:my-7 flex items-center gap-4" aria-hidden="true">
                <span className="route-line flex-1" />
                <span className="font-data text-[9.5px] uppercase tracking-[0.24em] text-ivory-faint">or</span>
                <span className="route-line flex-1" />
              </div>

              <button
                type="button"
                onClick={withGoogle}
                disabled={!ready}
                className="btn-ghost w-full disabled:cursor-not-allowed disabled:opacity-55"
              >
                <GoogleMark />
                Continue with Google
              </button>
            </>
          )}

          <p className="mt-6 [@media(min-height:880px)]:mt-8 font-sans text-[13.5px] text-ivory-muted">
            {joining ? "Already travelling with us? " : "New to SafarX? "}
            <Link
              to={joining ? "/signin" : "/signup"}
              className="text-saffron underline-offset-4 transition-colors hover:text-saffron-bright hover:underline"
            >
              {joining ? "Sign in" : "Create an account"}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
