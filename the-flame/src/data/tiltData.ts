export const TILT_CONTROL = {
  // degrees of tilt (from the angle captured when tilt mode is enabled)
  // that map to full steering magnitude in one direction
  maxTiltDegrees: 30,
  // how far ahead of the flame the steering target sits, in world px, at
  // full tilt -- same role `target` plays for touch, just derived
  // differently
  lookaheadPx: 220,
  // if no orientation event arrives within this window after enabling,
  // the device likely has no usable sensor (most desktops) -- fall back
  // to touch automatically rather than leaving steering dead
  fallbackTimeoutMs: 1500
} as const;
