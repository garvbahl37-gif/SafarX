import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Mic } from 'lucide-react';

/**
 * The way out for someone who does not know where to start.
 *
 * Both places this appears already have a headline, a paragraph and a pair of
 * buttons; a fourth thing competing for attention would make the page harder
 * to use, not easier. So it is one quiet line — the quietest thing on either
 * page — and it earns its place by naming the feeling before the action:
 * somebody who is stuck recognises "not sure where to start" faster than they
 * recognise a product name.
 *
 * The microphone is the whole reason for the glyph. Without it "Ask Srishti"
 * reads as another link to another form; with it, you know you can simply
 * talk.
 *
 * @param {() => void} onAsk opens the Srishti panel
 * @param {string} [prompt] the question, if this page needs a different one
 */
const AskSrishti = ({ onAsk, prompt = 'Not sure where to start?', className = '' }) => {
  const reduce = useReducedMotion();

  return (
    <motion.p
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={`flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-sans text-[14px] text-ivory-muted ${className}`}
    >
      <span>{prompt}</span>

      <button
        type="button"
        onClick={onAsk}
        className="group inline-flex items-center gap-1.5 text-ivory transition-colors hover:text-saffron-bright focus-visible:text-saffron-bright"
      >
        <span
          className="flex h-6 w-6 items-center justify-center rounded-full border border-saffron/35 bg-saffron/10 text-saffron transition-colors group-hover:border-saffron/60 group-hover:bg-saffron/20"
          aria-hidden="true"
        >
          <Mic size={11} />
        </span>

        {/* The rule under the words grows from the left on hover, which is the
            only motion here — it answers the pointer rather than running on
            its own. */}
        <span className="relative">
          Ask Srishti
          <span
            className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-saffron-bright transition-transform duration-300 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100"
            aria-hidden="true"
          />
        </span>
      </button>
    </motion.p>
  );
};

export default AskSrishti;
