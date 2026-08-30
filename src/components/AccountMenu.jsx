import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useClerk, useUser } from "@clerk/clerk-react";
import { FolderLock, LogOut, Users } from "lucide-react";

/**
 * The signed-in traveller's menu.
 *
 * Clerk's own avatar widget would put its dropdown — and its badge — in the
 * corner of an app that has no other trace of it. This is the same thing in
 * SafarX's hand: Clerk still holds the session, we draw the menu.
 */

const EASE = [0.22, 1, 0.36, 1];

const initials = (user) => {
  const from = user?.firstName || user?.username || user?.primaryEmailAddress?.emailAddress || "";
  return from.trim().charAt(0).toUpperCase() || "T";
};

const AccountMenu = ({ onNavigate }) => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!user) return null;

  const email = user.primaryEmailAddress?.emailAddress;
  const name = user.fullName || user.firstName || email || "Traveller";

  const go = (page, path) => {
    setOpen(false);
    if (onNavigate) onNavigate(page);
    else navigate(path);
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Your account"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-saffron/40 bg-gradient-to-br from-saffron-bright/25 to-saffron/10 transition-colors hover:border-saffron/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron/70"
      >
        {user.imageUrl ? (
          <img src={user.imageUrl} alt="" className="h-full w-full rounded-full object-cover" />
        ) : (
          <span className="font-data text-[13px] font-bold text-saffron">{initials(user)}</span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: EASE }}
            className="absolute right-0 z-50 mt-3 w-60 overflow-hidden rounded-2xl border border-white/[0.09] bg-ink-900/95 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl"
          >
            <div className="border-b border-white/[0.07] px-4 py-3.5">
              <p className="truncate font-sans text-[14px] font-semibold text-ivory">{name}</p>
              {email && (
                <p className="mt-0.5 truncate font-data text-[10.5px] tracking-[0.06em] text-ivory-faint">
                  {email}
                </p>
              )}
            </div>

            <div className="p-1.5">
              {[
                { label: "Document Vault", page: "vault", path: "/vault", Icon: FolderLock },
                { label: "Safar Groups", page: "social", path: "/social", Icon: Users },
              ].map(({ label, page, path, Icon }) => (
                <button
                  key={page}
                  role="menuitem"
                  onClick={() => go(page, path)}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left font-sans text-[13.5px] text-ivory-muted transition-colors hover:bg-white/[0.06] hover:text-ivory"
                >
                  <Icon size={15} aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>

            <div className="border-t border-white/[0.07] p-1.5">
              <button
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  signOut({ redirectUrl: "/" });
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left font-sans text-[13.5px] text-ivory-muted transition-colors hover:bg-white/[0.06] hover:text-ivory"
              >
                <LogOut size={15} aria-hidden="true" />
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AccountMenu;
