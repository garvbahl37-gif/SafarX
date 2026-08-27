import React from "react";
import { motion as Motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { TEMPLATES } from "../../utils/checklistGenerator";
import { getIcon } from "./icons";

/**
 * Starter templates. Applying one runs the same generator with a preset trip
 * shape, then merges the result into the active trip — nothing is overwritten.
 */
const TemplateGallery = ({ onApply, heading = "Start from a template", lede }) => {
  const reduce = useReducedMotion();

  return (
    <section aria-label="Checklist templates">
      <div className="mb-4 flex items-center gap-3">
        <span className="eyebrow whitespace-nowrap">{heading}</span>
        <span className="route-line flex-1" aria-hidden="true" />
      </div>
      {lede && <p className="mb-4 max-w-2xl text-sm leading-relaxed text-ivory-muted">{lede}</p>}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {TEMPLATES.map((template, i) => {
          const Icon = getIcon(template.icon);
          return (
            <Motion.button
              key={template.id}
              type="button"
              onClick={() => onApply(template.id)}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: Math.min(i * 0.05, 0.3), ease: [0.22, 1, 0.36, 1] }}
              className="heritage-card group p-4 text-left"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.03] text-saffron transition-colors duration-300 group-hover:border-saffron/40 group-hover:bg-saffron/10">
                  <Icon size={17} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 font-display text-base text-ivory">
                    {template.name}
                    <ArrowUpRight
                      size={14}
                      className="text-ivory-faint transition-colors group-hover:text-saffron"
                    />
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-ivory-muted">{template.blurb}</p>
                  <p className="mt-2 font-data text-[10px] uppercase tracking-[0.18em] text-ivory-faint">
                    {template.preset.days} days · {template.preset.destination.split(",")[0]}
                  </p>
                </div>
              </div>
            </Motion.button>
          );
        })}
      </div>
    </section>
  );
};

export default TemplateGallery;
