/**
 * checklistExport.js — share & export helpers for the pre-trip checklist.
 * Kept out of the component so the print/PDF markup can be tweaked without
 * touching React state logic.
 */
import {
  CATEGORIES,
  checklistToText,
  formatDate,
  formatWeight,
  getChecklistStats,
  sortItems,
} from "./checklistGenerator";

const escapeHtml = (str) =>
  String(str ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[ch]);

/**
 * Copy a WhatsApp-ready plain-text checklist to the clipboard.
 * Falls back to a hidden textarea where the async Clipboard API is blocked
 * (older Android WebViews, non-secure origins).
 * @returns {Promise<boolean>} whether the copy succeeded
 */
export async function copyChecklistAsText(trip) {
  const text = checklistToText(trip);
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to the legacy path */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

/** Build a clean, ink-on-paper HTML document for printing. */
function buildPrintDocument(trip) {
  const items = trip.items || [];
  const stats = getChecklistStats(items);

  const sections = CATEGORIES.map((cat) => {
    const list = sortItems(items.filter((i) => i.category === cat.id));
    if (!list.length) return "";
    const packed = list.filter((i) => i.packed).length;
    const rows = list
      .map(
        (i) => `<tr>
          <td class="box">${i.packed ? "&#10005;" : ""}</td>
          <td>
            <span class="label${i.packed ? " done" : ""}">${escapeHtml(i.label)}</span>
            ${i.priority === "critical" ? '<span class="crit">must</span>' : ""}
            ${i.notes ? `<div class="note">${escapeHtml(i.notes)}</div>` : ""}
          </td>
          <td class="qty">${i.quantity > 1 ? `x${i.quantity}` : ""}</td>
        </tr>`
      )
      .join("");
    return `<section>
        <h2>${escapeHtml(cat.label)} <span class="count">${packed}/${list.length}</span></h2>
        <table>${rows}</table>
      </section>`;
  }).join("");

  return `<!doctype html><html lang="en"><head><meta charset="utf-8" />
<title>${escapeHtml(trip.name)} — SafarX packing checklist</title>
<style>
  @page { margin: 16mm; }
  * { box-sizing: border-box; }
  body { font-family: Georgia, "Times New Roman", serif; color: #12100c; margin: 0; }
  header { border-bottom: 2px solid #12100c; padding-bottom: 12px; margin-bottom: 20px; }
  .eyebrow { font-family: ui-monospace, Menlo, monospace; font-size: 10px; letter-spacing: .3em; text-transform: uppercase; color: #7a6a3f; }
  h1 { font-size: 26px; margin: 6px 0 4px; font-weight: 600; }
  .meta { font-family: ui-monospace, Menlo, monospace; font-size: 11px; color: #4a4a44; }
  section { break-inside: avoid; margin-bottom: 18px; }
  h2 { font-size: 13px; letter-spacing: .18em; text-transform: uppercase; border-bottom: 1px solid #cfc9b8; padding-bottom: 4px; margin: 0 0 8px; }
  .count { float: right; font-family: ui-monospace, Menlo, monospace; color: #7a6a3f; }
  table { width: 100%; border-collapse: collapse; font-family: Helvetica, Arial, sans-serif; }
  td { padding: 4px 6px; vertical-align: top; font-size: 12.5px; border-bottom: 1px dotted #ddd6c4; }
  td.box { width: 18px; border: 1px solid #12100c; text-align: center; height: 16px; }
  td.qty { width: 42px; text-align: right; font-family: ui-monospace, Menlo, monospace; color: #7a6a3f; }
  .label.done { text-decoration: line-through; color: #8a8880; }
  .crit { font-family: ui-monospace, Menlo, monospace; font-size: 9px; text-transform: uppercase; letter-spacing: .12em; border: 1px solid #a8802a; color: #8a6a1e; padding: 0 4px; margin-left: 6px; }
  .note { font-size: 11px; color: #6a675e; margin-top: 2px; }
  footer { margin-top: 24px; border-top: 1px solid #cfc9b8; padding-top: 8px; font-family: ui-monospace, Menlo, monospace; font-size: 10px; color: #7a6a3f; }
</style></head><body>
<header>
  <div class="eyebrow">SafarX · Pre-trip checklist</div>
  <h1>${escapeHtml(trip.name)}</h1>
  <div class="meta">${escapeHtml(trip.destination || "India")} · ${trip.days} day${trip.days === 1 ? "" : "s"} · ${escapeHtml(
    formatDate(trip.startDate)
  )}</div>
  <div class="meta">Packed ${stats.packed}/${stats.total} · Critical ${stats.criticalPacked}/${
    stats.criticalTotal
  } · Approx ${formatWeight(stats.totalWeight)}</div>
</header>
${sections}
<footer>Generated with SafarX — carry a physical ID copy for hotel check-in.</footer>
</body></html>`;
}

/**
 * Open a print-friendly rendering in a new window and trigger the dialog.
 * @returns {boolean} false if the popup was blocked
 */
export function printChecklist(trip) {
  const win = window.open("", "_blank", "width=880,height=1000");
  if (!win) return false;
  win.document.open();
  win.document.write(buildPrintDocument(trip));
  win.document.close();
  win.focus();
  // Give the new document a tick to lay out before the print dialog opens.
  setTimeout(() => {
    try {
      win.print();
    } catch {
      /* the user can still print manually */
    }
  }, 350);
  return true;
}

/**
 * Text-based PDF via jsPDF (lazy-loaded so it never lands in the main bundle).
 * @returns {Promise<boolean>}
 */
export async function downloadChecklistPdf(trip) {
  try {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const items = trip.items || [];
    const stats = getChecklistStats(items);
    const margin = 48;
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = margin;

    const nl = (h = 14) => {
      y += h;
      if (y > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
    };

    doc.setFont("helvetica", "bold").setFontSize(18);
    doc.text(trip.name || "Packing checklist", margin, y);
    nl(18);
    doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(110);
    doc.text(
      `${trip.destination || "India"}  ·  ${trip.days} day${trip.days === 1 ? "" : "s"}  ·  ${formatDate(
        trip.startDate
      )}`,
      margin,
      y
    );
    nl(13);
    doc.text(
      `Packed ${stats.packed}/${stats.total}  ·  Critical ${stats.criticalPacked}/${stats.criticalTotal}  ·  Approx ${formatWeight(
        stats.totalWeight
      )}`,
      margin,
      y
    );
    nl(22);

    for (const cat of CATEGORIES) {
      const list = sortItems(items.filter((i) => i.category === cat.id));
      if (!list.length) continue;
      doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(20);
      doc.text(`${cat.label.toUpperCase()}  (${list.filter((i) => i.packed).length}/${list.length})`, margin, y);
      nl(15);
      doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(40);
      for (const item of list) {
        const qty = item.quantity > 1 ? ` x${item.quantity}` : "";
        const flag = item.priority === "critical" ? "  (must)" : "";
        const line = `${item.packed ? "[x]" : "[ ]"}  ${item.label}${qty}${flag}`;
        doc.text(line.slice(0, 95), margin + 8, y);
        nl(13);
      }
      nl(8);
    }

    doc.setFontSize(8).setTextColor(140);
    doc.text("Generated with SafarX", margin, pageHeight - 28);
    doc.save(`${(trip.name || "safarx-checklist").replace(/[^\w-]+/g, "-").toLowerCase()}.pdf`);
    return true;
  } catch (err) {
    console.error("PDF export failed", err);
    return false;
  }
}
