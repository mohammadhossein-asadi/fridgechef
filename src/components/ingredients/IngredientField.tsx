"use client";

import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SPRINGS, STAGGER } from "@/motion/transitions";
import { INGREDIENTS, findIngredient } from "@/lib/ingredients";
import { normalizeFa } from "@/lib/schemas";
import { parsePersianNumber } from "@/lib/format";

/**
 * «مواد غذایی من» — animated ingredient chips with suggestion dropdown.
 * Persian + Latin input both accepted; unknown text is offered as free chip.
 */
export function IngredientField({
  value,
  onChange,
  placeholder = "مثلاً: تخم‌مرغ، برنج، گوجه...",
  max = 30,
}: {
  value: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
  max?: number;
}) {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = useMemo(() => {
    const q = normalizeFa(text);
    if (!q) return [];
    return INGREDIENTS.filter(
      (ing) =>
        !value.includes(ing.id) &&
        (normalizeFa(ing.fa).includes(q) ||
          ing.aliases.some((a) => normalizeFa(a).includes(q)) ||
          ing.id.includes(q)),
    ).slice(0, 6);
  }, [text, value]);

  const add = (id: string) => {
    if (value.includes(id) || value.length >= max) return;
    onChange([...value, id]);
    setText("");
    setOpen(false);
    inputRef.current?.focus();
  };

  const addFree = () => {
    const t = text.trim();
    if (!t) return;
    const found = findIngredient(t);
    if (found) return add(found.id);
    // free-text pseudo id
    const pseudoId = `free:${t}`;
    if (!value.includes(pseudoId)) onChange([...value, pseudoId]);
    setText("");
    setOpen(false);
  };

  const remove = (id: string) => onChange(value.filter((v) => v !== id));

  const labelOf = (id: string) => {
    if (id.startsWith("free:")) return id.slice(5);
    return findIngredient(id)?.fa ?? id;
  };
  const emojiOf = (id: string) =>
    id.startsWith("free:") ? "🥘" : findIngredient(id)?.emoji ?? "🥘";

  return (
    <div className="relative">
      <div
        className="glass flex min-h-14 flex-wrap items-center gap-2 rounded-2xl p-3"
        onClick={() => inputRef.current?.focus()}
      >
        <AnimatePresence mode="popLayout">
          {value.map((id) => (
            <motion.span
              key={id}
              layout
              initial={{ opacity: 0, scale: 0.6, y: 10, rotate: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.7, y: -8, filter: "blur(4px)" }}
              transition={SPRINGS.snappy}
              className="flex items-center gap-1.5 rounded-xl border border-cream-200 bg-white px-3 py-1.5 text-sm font-bold shadow-sm dark:border-[var(--border)] dark:bg-[var(--card)] dark:text-[var(--foreground)]"
            >
              <span aria-hidden>{emojiOf(id)}</span>
              {labelOf(id)}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  remove(id);
                }}
                className="mr-1 grid h-5 w-5 place-items-center rounded-full bg-cream-100 text-xs text-charcoal-700 transition-colors hover:bg-pomegranate-100 hover:text-pomegranate-700 dark:bg-[var(--card)] dark:text-[var(--foreground)] dark:hover:bg-pomegranate-900/30 dark:hover:text-pomegranate-300"
                aria-label={`حذف ${labelOf(id)}`}
              >
                ✕
              </button>
            </motion.span>
          ))}
        </AnimatePresence>

        <input
          ref={inputRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (suggestions.length) add(suggestions[0].id);
              else addFree();
            } else if (e.key === "Backspace" && !text && value.length) {
              remove(value[value.length - 1]);
            }
          }}
          placeholder={value.length ? "" : placeholder}
          className="min-w-40 flex-1 bg-transparent p-1 text-sm outline-none placeholder:text-charcoal-700/40 dark:placeholder:text-[var(--muted)]"
          aria-label="افزودن ماده غذایی"
        />
      </div>

      <AnimatePresence>
        {open && (suggestions.length > 0 || text.trim()) && (
          <motion.ul
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="glass absolute z-20 mt-2 w-full overflow-hidden rounded-2xl py-1 card-shadow-lg"
            role="listbox"
          >
            {suggestions.map((ing) => (
              <li key={ing.id}>
                <button
                  type="button"
                  onClick={() => add(ing.id)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-cream-100 dark:hover:bg-[var(--card-2)]"
                >
                  <span aria-hidden>{ing.emoji}</span>
                  <span className="font-bold">{ing.fa}</span>
                  <span className="text-xs text-charcoal-700/50 dark:text-[var(--muted)]">
                    {ing.category === "produce" && "میوه و سبزیجات"}
                    {ing.category === "protein" && "گوشت و پروتئین"}
                    {ing.category === "dairy" && "لبنیات"}
                    {ing.category === "legumes" && "حبوبات"}
                    {ing.category === "grains" && "خشکبار و غلات"}
                    {ing.category === "spices" && "ادویه و چاشنی"}
                    {ing.category === "other" && "سایر"}
                  </span>
                </button>
              </li>
            ))}
            {text.trim() && !findIngredient(text) && (
              <li>
                <button
                  type="button"
                  onClick={addFree}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-cream-100 dark:hover:bg-[var(--card-2)]"
                >
                  <span aria-hidden>➕</span>
                  <span>افزودن «{text.trim()}»</span>
                </button>
              </li>
            )}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
