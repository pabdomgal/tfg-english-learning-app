export const theme = {
  colors: {
    bg: "#F4F7FB",
    bgSoft: "#F8FBFF",

    surface: "#FFFFFF",
    surfaceSoft: "#F8FBFF",
    surfaceElevated: "#FFFFFF",

    border: "#D9E1F0",
    borderStrong: "#BFD0F5",
    borderFocus: "#7FA9FF",

    text: "#16325C",
    textSoft: "#5B6780",
    textMuted: "#7B879C",
    textOnPrimary: "#FFFFFF",

    primary: "#3B82F6",
    primaryDark: "#1F4EA3",
    primarySoft: "#EEF3FF",

    success: "#157347",
    successSoft: "#EAF7EF",
    successBorder: "#B7E4C7",

    danger: "#C0392B",
    dangerSoft: "#FDEEEE",
    dangerBorder: "#F3C5C0",

    warning: "#B7791F",
    warningSoft: "#FFF7E6",
    warningBorder: "#F3D8A6",

    shadowColor: "rgba(31, 42, 68, 0.08)",
    shadowColorStrong: "rgba(31, 42, 68, 0.14)",
    overlay: "rgba(22, 50, 92, 0.06)",
  },

  radius: {
    xs: "8px",
    sm: "10px",
    md: "12px",
    lg: "16px",
    xl: "20px",
    xxl: "24px",
    pill: "999px",
  },

  spacing: {
    xs: "0.35rem",
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.25rem",
    xxl: "1.5rem",
    xxxl: "2rem",
    section: "2.5rem",
  },

  typography: {
    appTitle: {
      fontSize: "1.25rem",
      fontWeight: 800,
      letterSpacing: "-0.02em",
    },
    h1: {
      fontSize: "2.1rem",
      fontWeight: 800,
      letterSpacing: "-0.03em",
      lineHeight: 1.1,
    },
    h2: {
      fontSize: "1.5rem",
      fontWeight: 700,
      letterSpacing: "-0.02em",
      lineHeight: 1.2,
    },
    h3: {
      fontSize: "1.1rem",
      fontWeight: 700,
      lineHeight: 1.3,
    },
    body: {
      fontSize: "1rem",
      fontWeight: 400,
      lineHeight: 1.5,
    },
    bodyStrong: {
      fontSize: "1rem",
      fontWeight: 600,
      lineHeight: 1.45,
    },
    small: {
      fontSize: "0.92rem",
      fontWeight: 500,
      lineHeight: 1.4,
    },
    label: {
      fontSize: "0.88rem",
      fontWeight: 700,
      lineHeight: 1.2,
    },
    badge: {
      fontSize: "0.82rem",
      fontWeight: 700,
      lineHeight: 1,
    },
  },

  shadows: {
    soft: "0 6px 18px rgba(31, 42, 68, 0.06)",
    card: "0 10px 30px rgba(31, 42, 68, 0.08)",
    hover: "0 14px 34px rgba(31, 42, 68, 0.12)",
    focus: "0 0 0 4px rgba(59, 130, 246, 0.14)",
  },

  transitions: {
    fast: "0.18s ease",
    normal: "0.28s ease",
    slow: "0.4s ease",
  },
};

export const ui = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top, rgba(255,255,255,0.95) 0%, #F4F7FB 45%, #EEF3F9 100%)",
    padding: "1.5rem",
    boxSizing: "border-box",
  },

  shell: {
    width: "100%",
    maxWidth: "1100px",
    margin: "0 auto",
  },

  mainCard: {
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius.xl,
    boxShadow: theme.shadows.card,
    padding: theme.spacing.xxxl,
  },

  sectionCard: {
    background: theme.colors.surfaceSoft,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xl,
  },

  softPanel: {
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
  },

  title: {
    margin: 0,
    color: theme.colors.text,
    fontSize: theme.typography.h1.fontSize,
    fontWeight: theme.typography.h1.fontWeight,
    letterSpacing: theme.typography.h1.letterSpacing,
    lineHeight: theme.typography.h1.lineHeight,
  },

  subtitle: {
    margin: 0,
    color: theme.colors.textSoft,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },

  badge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: theme.colors.primarySoft,
    border: `1px solid ${theme.colors.borderStrong}`,
    color: theme.colors.text,
    borderRadius: theme.radius.pill,
    padding: "0.45rem 0.85rem",
    fontSize: theme.typography.badge.fontSize,
    fontWeight: theme.typography.badge.fontWeight,
    lineHeight: theme.typography.badge.lineHeight,
    whiteSpace: "nowrap",
  },

  progressTrack: {
    width: "100%",
    height: "12px",
    background: "#DCE5F5",
    borderRadius: theme.radius.pill,
    overflow: "hidden",
  },

  progressBar: (percent) => ({
    width: `${percent}%`,
    height: "100%",
    background: "linear-gradient(90deg, #4F86FF 0%, #1F4EA3 100%)",
    borderRadius: theme.radius.pill,
    transition: `width ${theme.transitions.normal}`,
  }),

  primaryButton: {
    background: "linear-gradient(90deg, #3B82F6 0%, #1F4EA3 100%)",
    color: theme.colors.textOnPrimary,
    border: "none",
    borderRadius: theme.radius.md,
    padding: "0.9rem 1.2rem",
    fontWeight: 700,
    fontSize: "0.98rem",
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(59, 130, 246, 0.22)",
    transition: "transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease",
  },

  secondaryButton: {
    background: theme.colors.surface,
    color: theme.colors.text,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius.md,
    padding: "0.9rem 1.2rem",
    fontWeight: 700,
    fontSize: "0.98rem",
    cursor: "pointer",
    transition: "all 0.18s ease",
  },

  ghostButton: {
    background: theme.colors.primarySoft,
    color: theme.colors.text,
    border: `1px solid ${theme.colors.borderStrong}`,
    borderRadius: theme.radius.md,
    padding: "0.8rem 1rem",
    fontWeight: 700,
    fontSize: "0.95rem",
    cursor: "pointer",
    transition: "all 0.18s ease",
  },

  disabledButton: {
    opacity: 0.45,
    cursor: "not-allowed",
    boxShadow: "none",
  },

  input: {
    width: "100%",
    padding: "0.95rem 1rem",
    border: `2px solid ${theme.colors.borderStrong}`,
    borderRadius: theme.radius.md,
    background: theme.colors.surface,
    color: theme.colors.text,
    fontSize: "1rem",
    outline: "none",
    boxSizing: "border-box",
  },

  choiceCard: {
    display: "flex",
    gap: "0.75rem",
    alignItems: "center",
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius.md,
    padding: "0.95rem 1rem",
    transition: "all 0.18s ease",
  },

  chipButton: {
    background: theme.colors.primarySoft,
    color: theme.colors.text,
    border: `1px solid transparent`,
    borderRadius: theme.radius.md,
    padding: "0.8rem 1rem",
    fontWeight: 600,
    fontSize: "1rem",
    cursor: "pointer",
    transition: "all 0.18s ease",
  },

  chipButtonSelected: {
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.borderStrong}`,
    boxShadow: theme.shadows.soft,
  },

  resultSuccess: {
    background: theme.colors.successSoft,
    border: `1px solid ${theme.colors.successBorder}`,
    color: theme.colors.success,
    borderRadius: theme.radius.md,
    padding: "0.95rem 1rem",
    fontWeight: 700,
  },

  resultError: {
    background: theme.colors.dangerSoft,
    border: `1px solid ${theme.colors.dangerBorder}`,
    color: theme.colors.danger,
    borderRadius: theme.radius.md,
    padding: "0.95rem 1rem",
    fontWeight: 700,
  },

  wordBuildArea: {
    minHeight: "72px",
    padding: "1rem",
    border: `2px solid ${theme.colors.borderStrong}`,
    borderRadius: theme.radius.md,
    background: theme.colors.surface,
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
    alignItems: "center",
    boxSizing: "border-box",
  },

  feedbackInfoCard: {
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius.md,
    padding: "0.95rem 1rem",
  },

  pairItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1rem",
    background: theme.colors.surfaceSoft,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius.sm,
    padding: "0.8rem",
  },
};