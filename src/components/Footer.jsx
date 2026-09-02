import React from "react";
import {
  FaInstagram,
  FaXTwitter,
  FaYoutube,
  FaLinkedin,
  FaGithub,
} from "react-icons/fa6";
import qrCode from "./qr-code.png";

const EXPLORE_LINKS = [
  { id: "360tour", label: "VR Tours" },
  { id: "gems", label: "Hidden Gems" },
  { id: "itinerary", label: "Trip Planner" },
  { id: "360view", label: "360° Explorer" },
  { id: "social", label: "Safar Groups" },
];

const TOOLKIT_LINKS = [
  { id: "safety", label: "Tourist Safety & SOS" },
  { id: "diary", label: "Digital Diary" },
  { id: "chat", label: "SafarX Agent" },
  { id: "tracker", label: "Flight Tracker" },
  { id: "vault", label: "Document Vault" },
  { id: "checklist", label: "Trip Checklist" },
  { id: "map", label: "Local Insights" },
];

const SOCIALS = [
  { href: "https://instagram.com", label: "Instagram", Icon: FaInstagram },
  { href: "https://twitter.com", label: "X (Twitter)", Icon: FaXTwitter },
  { href: "https://youtube.com", label: "YouTube", Icon: FaYoutube },
  { href: "https://linkedin.com", label: "LinkedIn", Icon: FaLinkedin },
  { href: "https://github.com/garvbahl37-gif/SafarX-SIH", label: "GitHub", Icon: FaGithub },
];

const LinkColumn = ({ title, links, onPageChange }) => (
  <div>
    <p className="eyebrow-muted mb-4">{title}</p>
    <ul className="space-y-2.5">
      {links.map((link) => (
        <li key={link.id}>
          <button
            onClick={() => onPageChange(link.id)}
            className="text-[14px] text-ivory-muted hover:text-saffron transition-colors duration-300"
          >
            {link.label}
          </button>
        </li>
      ))}
    </ul>
  </div>
);

const Footer = ({ onPageChange }) => {
  return (
    <footer className="relative bg-ink-900 border-t border-white/[0.06] overflow-hidden">
      {/* Dotted atlas-grid backdrop */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(rgba(242, 239, 230, 0.14) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent)",
        }}
        aria-hidden="true"
      />
      {/* Warm ambient glow */}
      <div className="absolute -top-32 left-1/3 w-[38rem] h-[20rem] bg-saffron/[0.06] rounded-full blur-[130px] pointer-events-none" aria-hidden="true" />

      {/* Monumental Devanagari watermark — the same motif as the hero */}
      <span
        aria-hidden="true"
        className="pointer-events-none select-none absolute -bottom-6 right-[-1%] font-devanagari italic leading-none text-transparent text-[clamp(5rem,15vw,13rem)]"
        style={{ WebkitTextStroke: "1px rgba(212, 168, 67, 0.13)" }}
      >
        सफ़र
      </span>

      <div className="relative max-w-[1440px] mx-auto px-6 md:px-14 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.2fr] gap-10 lg:gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-baseline gap-0.5 mb-3.5">
              <span className="font-display italic font-medium text-3xl text-ivory tracking-tight">
                Safar
              </span>
              <span className="font-data text-2xl text-saffron tracking-[0.04em] font-bold">
                X
              </span>
            </div>
            <p className="eyebrow mb-3">Smart India Hackathon 2026</p>
            <p className="text-ivory-muted text-[14px] leading-relaxed max-w-xs mb-5">
              Your companion for Incredible India — preview heritage sites in
              360°, plan with AI, and carry everything that matters in one place.
            </p>
            <div className="flex items-center gap-2">
              {SOCIALS.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-full border border-white/[0.09] flex items-center justify-center text-ivory/60 hover:text-saffron hover:border-saffron/40 transition-colors duration-300"
                >
                  <Icon className="w-[15px] h-[15px]" />
                </a>
              ))}
            </div>
          </div>

          <LinkColumn title="Explore" links={EXPLORE_LINKS} onPageChange={onPageChange} />
          <LinkColumn title="Toolkit" links={TOOLKIT_LINKS} onPageChange={onPageChange} />

          {/* QR — SafarX on your phone */}
          <div className="flex flex-col items-start lg:items-end">
            <div className="flex items-center gap-4 p-3.5 rounded-2xl border border-white/[0.07] bg-ink-800/60">
              <img
                src={qrCode}
                alt="QR code that opens SafarX Agent"
                className="w-16 h-16 rounded-lg bg-ivory p-1.5"
              />
              <div>
                <p className="text-[13px] font-bold text-ivory mb-1">SafarX in your pocket</p>
                <p className="text-[12px] text-ivory-faint leading-snug max-w-[18ch]">
                  Scan to chat with your AI travel co-pilot
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Route-line divider */}
        <div className="flex items-center gap-3 mt-9 mb-5" aria-hidden="true">
          <span className="route-dot" />
          <span className="route-line flex-1" />
          <span className="font-data text-[10px] tracking-[0.3em] uppercase text-ivory-faint whitespace-nowrap px-2">
            20.59° N · 78.96° E
          </span>
          <span className="route-line flex-1" />
          <span className="route-dot" />
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[12px] text-ivory-faint">
            © 2026 SafarX · Built by <span className="text-ivory-muted font-semibold">Netaji Ninjas</span> for Smart India Hackathon
          </p>
          <div className="flex items-center gap-6 text-[12px] text-ivory-faint">
            <a href="#" className="hover:text-saffron transition-colors">Terms</a>
            <a href="#" className="hover:text-saffron transition-colors">Privacy</a>
            <a href="#" className="hover:text-saffron transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
