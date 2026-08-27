import React, { useState } from "react";
import { motion as Motion, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";
import { CATEGORIES, PRIORITIES } from "../../utils/checklistGenerator";

/** Inline "add your own item" row. */
const AddItemForm = ({ onAdd, defaultCategory = "misc" }) => {
  const reduce = useReducedMotion();
  const [label, setLabel] = useState("");
  const [category, setCategory] = useState(defaultCategory);
  const [priority, setPriority] = useState("normal");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const trimmed = label.trim();
    if (!trimmed) {
      setError("Type what you want to pack, then press Add.");
      return;
    }
    onAdd({
      label: trimmed,
      category,
      priority,
      quantity: Math.max(1, Math.min(99, Number(quantity) || 1)),
      autoAdded: false,
    });
    setLabel("");
    setQuantity(1);
    setError("");
  };

  return (
    <Motion.form
      onSubmit={submit}
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-white/[0.07] bg-ink-900/60 p-4"
    >
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <div>
          <label className="form-label" htmlFor="add-item-label">
            Add your own item
          </label>
          <input
            id="add-item-label"
            className="glass-input"
            placeholder="Spare spectacles, sim card, Ma's ladoo box…"
            value={label}
            onChange={(e) => {
              setLabel(e.target.value);
              setError("");
            }}
            aria-invalid={Boolean(error)}
          />
          {error && (
            <p role="alert" className="mt-1.5 text-[12px] text-saffron">
              {error}
            </p>
          )}
        </div>
        <div className="flex items-end">
          <button type="submit" className="btn-primary w-full sm:w-auto">
            <Plus size={16} />
            Add
          </button>
        </div>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <div>
          <label className="form-label" htmlFor="add-item-category">
            Category
          </label>
          <select
            id="add-item-category"
            className="glass-input [color-scheme:dark]"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id} className="bg-ink-900">
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="form-label" htmlFor="add-item-priority">
            Priority
          </label>
          <select
            id="add-item-priority"
            className="glass-input [color-scheme:dark]"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            {Object.values(PRIORITIES).map((p) => (
              <option key={p.id} value={p.id} className="bg-ink-900">
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="form-label" htmlFor="add-item-quantity">
            Quantity
          </label>
          <input
            id="add-item-quantity"
            type="number"
            min="1"
            max="99"
            className="glass-input [color-scheme:dark]"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>
      </div>
    </Motion.form>
  );
};

export default AddItemForm;
