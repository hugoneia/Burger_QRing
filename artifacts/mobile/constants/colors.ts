/**
 * Semantic design tokens for the mobile app.
 *
 * QR Scan & Edit uses a single dark "instrument" palette — a scanner
 * viewfinder feel with a bright mint laser accent.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#F4FBF8',
    tint: '#3CF2A6',

    // Core surfaces
    background: '#0B0F0E',
    foreground: '#F4FBF8',

    // Cards / elevated surfaces
    card: '#141B19',
    cardForeground: '#F4FBF8',

    // Primary action color (buttons, links, active states)
    primary: '#3CF2A6',
    primaryForeground: '#06120D',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#1E2624',
    secondaryForeground: '#CFE9DF',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#1A211F',
    mutedForeground: '#7D9089',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#1E2624',
    accentForeground: '#3CF2A6',

    // Destructive actions (delete, error states)
    destructive: '#FF5C5C',
    destructiveForeground: '#0B0F0E',

    // Borders and input outlines
    border: '#232B29',
    input: '#1A211F',
  },

  // Border radius (in px).
  radius: 18,
};

export default colors;
