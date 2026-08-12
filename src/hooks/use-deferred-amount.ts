"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const COMMIT_DELAY_MS = 200;

/**
 * Keeps a currency field responsive while typing.
 *
 * The raw string stays in local state so each keystroke re-renders one input
 * rather than every consumer of the bill context. The parsed value is pushed
 * upstream once typing pauses, or immediately on blur.
 *
 * `value` from upstream wins whenever it changes for any other reason — a
 * preset button, a scanned receipt, a reset — so the field never shows a stale
 * number.
 */
export function useDeferredAmount(
  value: number,
  commit: (amount: number) => void
) {
  const [draft, setDraft] = useState(() => String(value));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editing = useRef(false);
  const commitRef = useRef(commit);
  commitRef.current = commit;

  useEffect(() => {
    if (!editing.current) setDraft(String(value));
  }, [value]);

  useEffect(() => () => clearTimeout(timer.current ?? undefined), []);

  const parse = (raw: string) => {
    const parsed = parseFloat(raw);
    return isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
  };

  const onChange = useCallback((raw: string) => {
    editing.current = true;
    setDraft(raw);
    clearTimeout(timer.current ?? undefined);
    timer.current = setTimeout(() => {
      editing.current = false;
      commitRef.current(parse(raw));
    }, COMMIT_DELAY_MS);
  }, []);

  const onBlur = useCallback(() => {
    clearTimeout(timer.current ?? undefined);
    editing.current = false;
    setDraft((raw) => {
      commitRef.current(parse(raw));
      return raw;
    });
  }, []);

  return { draft, onChange, onBlur };
}
