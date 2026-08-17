/**
 * Spread onto fields that browsers and password managers try to autofill.
 *
 * The name field in the add/edit modals was triggering the browser's saved-name
 * suggestions, and inside a bottom sheet that dropdown is positioned against
 * the transformed drawer rather than the input, so it renders offset from the
 * box it belongs to. Suppressing the suggestion avoids the misplacement — and
 * a diner's name isn't something worth autofilling in the first place.
 *
 * `autoComplete="off"` covers the browser's own suggestions; the `data-*` flags
 * opt out of 1Password, LastPass and Dashlane, which ignore it.
 */
export const noAutofill = {
  autoComplete: "off",
  autoCorrect: "off",
  spellCheck: false,
  "data-1p-ignore": "",
  "data-lpignore": "true",
  "data-form-type": "other",
} as const;
