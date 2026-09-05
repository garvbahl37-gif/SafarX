/**
 * Turning the rendered itinerary into a PDF without cutting it in half.
 *
 * The obvious way to paginate an html2canvas capture — and the way this used to
 * work — is to draw the same full-height image onto every page at a negative
 * offset, moving it up by one page each time. It is three lines and it is
 * wrong: the page boundary falls at a fixed height, which is a position with no
 * relationship to the content, so it lands wherever it lands. In practice that
 * meant a day heading sliced along its middle and a sentence severed between
 * its ascenders and its baseline.
 *
 * So the break has to be chosen rather than assumed. This module measures every
 * atom on the page — a run of text, an image, an icon — in the same coordinate
 * space as the capture, and treats a horizontal line as cuttable only when no
 * atom straddles it. Each page then takes as much as will fit and ends at the
 * lowest safe line above that limit, and the slice is redrawn onto its own
 * canvas so the page carries only its own pixels.
 *
 * The result is a page that may end early — a short page is the price of a
 * whole sentence, and it is worth paying.
 */

import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const SCALE = 2;
const MARGIN_MM = 6;
const PAGE_BG = "#061412";
/* A page that ends before this fraction of its height has been used is worse
   than one small cut: it means a single tall element — an image, a long card —
   cannot fit any page, so we stop looking for a nice break and take the whole
   height. */
const MIN_PAGE_FILL = 0.25;


/**
 * Makes every card visible before the capture.
 *
 * The day cards animate in with framer-motion's `whileInView`, starting at
 * `opacity: 0`. A card the reader never scrolled to has therefore never
 * animated — it still occupies its full height, but paints nothing, so the
 * capture came back with whole pages of empty paper where days six and seven
 * should have been.
 *
 * Scrolling the itinerary past the viewport triggers those animations for
 * real, and `viewport={{ once: true }}` means they stay put afterwards. The
 * inline-style pass that follows is the safety net: anything still transparent
 * when the scroll finishes — a card below a container that does not scroll, a
 * reduced-motion path — is forced visible for the capture and restored after.
 *
 * @returns {() => void} restores whatever this changed
 */
async function revealAll(element) {
  const startedAt = window.scrollY;
  const step = Math.max(200, window.innerHeight * 0.75);
  const top = element.getBoundingClientRect().top + window.scrollY;

  for (let y = 0; y < element.scrollHeight + window.innerHeight; y += step) {
    window.scrollTo({ top: top + y, behavior: "auto" });
    // One frame is not enough: framer-motion starts the animation on the next
    // one, and the transition itself needs longer than that to finish.
    await new Promise((r) => setTimeout(r, 110));
  }
  window.scrollTo({ top: startedAt, behavior: "auto" });
  await new Promise((r) => setTimeout(r, 420));

  const forced = [];
  for (const el of element.querySelectorAll("*")) {
    const style = window.getComputedStyle(el);
    if (parseFloat(style.opacity) > 0.05) continue;
    forced.push([el, el.style.opacity, el.style.transform]);
    el.style.opacity = "1";
    el.style.transform = "none";
  }
  return () => {
    for (const [el, opacity, transform] of forced) {
      el.style.opacity = opacity;
      el.style.transform = transform;
    }
  };
}

/**
 * Whether an element paints something a reader would notice being sliced.
 * Containers are excluded on purpose: a card border crossing a page edge reads
 * as a page edge, while a cut word reads as a bug.
 */
function isAtom(el) {
  if (el.childElementCount === 0 && el.textContent.trim()) return true;
  return el.tagName === "IMG" || el.tagName === "SVG" || el.tagName === "svg";
}

/**
 * Whether an element is a card — a bounded box a reader sees as one thing.
 *
 * Breaking between cards is much better than breaking merely where no glyph is
 * crossed: a cut can be clean and still leave "18:00 - 19:00" alone at the foot
 * of a page with the activity it belongs to overleaf. Cards are recognised by
 * how they are drawn, so no markup has to be annotated for this.
 */
function isCard(el) {
  if (el.childElementCount === 0) return false;
  const style = window.getComputedStyle(el);
  const filled = style.backgroundColor && !/rgba?\((?:0, ?){3}0\)|transparent/.test(style.backgroundColor);
  const rounded = parseFloat(style.borderRadius) > 4;
  return Boolean(filled && rounded);
}

/**
 * Card edges, in canvas pixels — the preferred places to break.
 *
 * Both edges count. Breaking at a card's bottom finishes it on this page;
 * breaking just above a card's top sends the whole card to the next one, which
 * is what stops a day's heading being stranded at the foot of a page with its
 * activities overleaf.
 */
function measureCards(root) {
  const base = root.getBoundingClientRect().top;
  const edges = [];
  for (const el of root.querySelectorAll("*")) {
    if (!isCard(el)) continue;
    const rect = el.getBoundingClientRect();
    if (rect.height <= 0) continue;
    edges.push((rect.bottom - base) * SCALE);
    // A hair above the top, so the card's own shadow and border go with it.
    const top = (rect.top - base) * SCALE - 4;
    if (top > 0) edges.push(top);
  }
  return edges;
}

/**
 * The vertical extents of everything that must not be cut, in canvas pixels.
 * @returns {{top: number, bottom: number}[]}
 */
function measureAtoms(root) {
  const base = root.getBoundingClientRect().top;
  const atoms = [];
  for (const el of root.querySelectorAll("*")) {
    if (!isAtom(el)) continue;
    const rect = el.getBoundingClientRect();
    if (rect.height <= 0) continue;
    atoms.push({
      top: (rect.top - base) * SCALE,
      bottom: (rect.bottom - base) * SCALE,
    });
  }
  return atoms;
}

/**
 * The lowest line at or below `limit` that cuts through nothing.
 *
 * Walks the atom bottoms downward from the limit, because the bottom of an atom
 * is the first place below it where a cut is certainly clean.
 */
function safeBreakBefore(atoms, cards, from, limit, minFill) {
  const clean = (y) => !atoms.some((a) => a.top < y - 1 && a.bottom > y + 1);
  const usable = (list) =>
    list.filter((y) => y > from && y <= limit).sort((a, b) => b - a);

  /* A card edge first: it keeps a whole activity together, which is what a
     reader notices. Only accept one that still fills a decent share of the
     page, or a trip of small cards would print one to a sheet. */
  for (const y of usable(cards)) {
    if (y - from < minFill) break;
    if (clean(y)) return y;
  }
  // Otherwise any line that severs nothing.
  for (const y of usable(atoms.map((a) => a.bottom))) {
    if (clean(y)) return y;
  }
  return null;
}

/**
 * Renders `element` to a multi-page A4 PDF and saves it.
 *
 * @param {HTMLElement} element the itinerary to capture
 * @param {string} filename what the file should be called
 */
export async function exportItineraryPdf(element, filename) {
  const restore = await revealAll(element);
  let canvas;
  let atoms;
  let cards;
  try {
    canvas = await html2canvas(element, {
      scale: SCALE,
      useCORS: true,
      backgroundColor: PAGE_BG,
      logging: false,
    });
    /* Measured inside the reveal, not after it. Restoring puts the cards'
       transforms back and moves them, so atoms taken afterwards would describe
       a layout the capture never had — and every page break would be computed
       against the wrong positions. */
    atoms = measureAtoms(element);
    cards = measureCards(element);
  } finally {
    restore();
  }

  const pdf = new jsPDF("p", "mm", "a4");
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const contentW = pageW - MARGIN_MM * 2;
  const contentH = pageH - MARGIN_MM * 2;

  // How many canvas pixels one page of content is worth.
  const pxPerMm = canvas.width / contentW;
  const pagePx = Math.floor(contentH * pxPerMm);

  const slice = document.createElement("canvas");
  const ctx = slice.getContext("2d");

  let y = 0;
  let page = 0;
  while (y < canvas.height) {
    let end = Math.min(y + pagePx, canvas.height);

    if (end < canvas.height) {
      const safe = safeBreakBefore(atoms, cards, y, end, pagePx * 0.55);
      // Only honour a break that still leaves a usefully full page.
      if (safe && safe - y > pagePx * MIN_PAGE_FILL) end = safe;
    }

    const height = Math.max(1, Math.round(end - y));
    slice.width = canvas.width;
    slice.height = height;
    ctx.fillStyle = PAGE_BG;
    ctx.fillRect(0, 0, slice.width, slice.height);
    ctx.drawImage(canvas, 0, y, canvas.width, height, 0, 0, canvas.width, height);

    if (page > 0) pdf.addPage();
    // The page is filled edge to edge behind the margin, so a short page ends
    // on the itinerary's own colour rather than on white paper.
    pdf.setFillColor(PAGE_BG);
    pdf.rect(0, 0, pageW, pageH, "F");
    pdf.addImage(
      slice.toDataURL("image/jpeg", 0.92),
      "JPEG",
      MARGIN_MM,
      MARGIN_MM,
      contentW,
      height / pxPerMm
    );

    y = end;
    page += 1;
    // A runaway loop would hang the tab rather than fail; 200 pages is far
    // past any real itinerary.
    if (page > 200) break;
  }

  pdf.save(filename);
  return page;
}
