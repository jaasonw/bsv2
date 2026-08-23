// Autofill dropdowns mis-position inside the bottom sheet (anchored to the
// transformed drawer, not the input). Password managers ignore autocomplete=off.
export const noAutofill = {
  autoComplete: "off",
  "data-1p-ignore": "",
  "data-lpignore": "true",
} as const;
