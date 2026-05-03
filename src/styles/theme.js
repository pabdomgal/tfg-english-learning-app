export const theme = {
  colors: {
    bg: "#061945",
    bgSecondary: "#0d2b78",
    bgTertiary: "#123b9c",

    bgPanel: "rgba(13, 43, 120, 0.65)",
    bgPanelStrong: "rgba(8, 29, 84, 0.85)",
    bgGlass: "rgba(255, 255, 255, 0.08)",
    bgGlassSoft: "rgba(255, 255, 255, 0.035)",

    primary: "#2563eb",
    primaryStrong: "#1d4ed8",
    primarySoft: "rgba(37, 99, 235, 0.25)",

    accent: "#d4ff26",
    accentStrong: "#bce014",
    accentSoft: "rgba(212, 255, 38, 0.15)",

    violet: "#8b5cf6",
    violetSoft: "rgba(139, 92, 246, 0.2)",

    success: "#45d483",
    danger: "#ff6b81",
    warning: "#ffb84d",

    text: "#ffffff",
    textSoft: "#d1e0ff",
    textMuted: "#94a8cc",
    textDim: "#6b82ad",

    border: "rgba(255, 255, 255, 0.12)",
    borderStrong: "rgba(255, 255, 255, 0.20)",
    borderAccent: "rgba(212, 255, 38, 0.45)",

    shadow: "rgba(2, 8, 25, 0.5)",
    shadowSoft: "rgba(2, 8, 25, 0.25)",
  },

  gradients: {
    appBg: `
      radial-gradient(circle at 10% 0%, rgba(59, 130, 246, 0.3), transparent 45%),
      radial-gradient(circle at 90% 15%, rgba(212, 255, 38, 0.1), transparent 30%),
      radial-gradient(circle at 50% 100%, rgba(139, 92, 246, 0.15), transparent 50%),
      linear-gradient(180deg, #103a8f 0%, #061945 100%)
    `,

    panel: `linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)`,
    mainCard: `linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.02) 100%)`,
    progress: "linear-gradient(90deg, #d4ff26 0%, #bce014 100%)",
    buttonPrimary: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
    buttonSecondary:
      "linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.05))",
  },

  shadows: {
    app: "0 24px 80px rgba(4, 8, 20, 0.5)",
    card: "0 20px 50px rgba(4, 8, 20, 0.3)",
    cardSoft: "0 10px 24px rgba(4, 8, 20, 0.2)",
    primaryGlow: "0 10px 25px rgba(26, 86, 219, 0.4)",
    accentGlow:
      "0 0 15px rgba(212, 255, 38, 0.25), 0 0 5px rgba(212, 255, 38, 0.16)",
  },

  blur: {
    sm: "blur(8px)",
    md: "blur(12px)",
    lg: "blur(20px)",
  },

  radius: {
    pill: "999px",
    sm: "12px",
    md: "16px",
    lg: "24px",
    xl: "32px",
  },

  spacing: {
    xxs: "0.2rem",
    xs: "0.35rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    xxl: "3rem",
    xxxl: "4rem",
  },

  typography: {
    h1: {
      fontSize: "2rem",
      fontWeight: 800,
      lineHeight: 1.1,
      letterSpacing: "-0.03em",
    },
    body: {
      fontSize: "0.98rem",
      fontWeight: 500,
      lineHeight: 1.55,
    },
    label: {
      fontSize: "0.76rem",
      fontWeight: 800,
      lineHeight: 1.1,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
    },
  },

  transitions: {
    springy:
      "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease",
  },

  layout: {
    sidebarWidth: "86px",
    topbarHeight: "76px",
    maxWidth: "100%",
    contentWidth: "min(96vw, 1700px)",
  },
};

export const ui = {
  page: {
    minHeight: "100vh",
    width: "100%",
    background: theme.gradients.appBg,
    color: theme.colors.text,
  },

  shell: {
    width: "100%",
    maxWidth: theme.layout.contentWidth,
    margin: "0 auto",
    padding: "clamp(12px, 2vw, 28px)",
    boxSizing: "border-box",
  },

  topbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.lg,
    flexWrap: "wrap",
    width: "100%",
    minHeight: theme.layout.topbarHeight,
    padding: "0.9rem 1.2rem",
    borderRadius: theme.radius.xl,
    border: `1px solid ${theme.colors.borderStrong}`,
    background: `
      linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)
    `,
    boxShadow: theme.shadows.card,
    backdropFilter: theme.blur.lg,
    WebkitBackdropFilter: theme.blur.lg,
    boxSizing: "border-box",
  },

  eyebrow: {
    margin: 0,
    color: theme.colors.textMuted,
    fontSize: "0.72rem",
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },

  topbarTitle: {
    color: theme.colors.text,
    fontWeight: 900,
    letterSpacing: "-0.03em",
  },

  profileCard: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing.md,
    padding: "0.75rem 0.95rem",
    borderRadius: "22px",
    border: `1px solid ${theme.colors.border}`,
    background: "rgba(255,255,255,0.08)",
    boxShadow: theme.shadows.cardSoft,
    backdropFilter: theme.blur.md,
    WebkitBackdropFilter: theme.blur.md,
    boxSizing: "border-box",
  },

  avatar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "44px",
    height: "44px",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #90a8ff 0%, #6f7cff 100%)",
    color: "#ffffff",
    fontWeight: 900,
  },

  mainCard: {
    width: "100%",
    borderRadius: theme.radius.xl,
    padding: "clamp(18px, 2.4vw, 48px)",
    border: `1px solid ${theme.colors.borderStrong}`,
    background: theme.colors.bgPanel,
    boxShadow: theme.shadows.card,
    backdropFilter: theme.blur.lg,
    WebkitBackdropFilter: theme.blur.lg,
    boxSizing: "border-box",
  },

  sectionCard: {
    width: "100%",
    borderRadius: theme.radius.lg,
    padding: "clamp(16px, 2vw, 32px)",
    border: `1px solid ${theme.colors.border}`,
    background: theme.gradients.panel,
    boxShadow: theme.shadows.cardSoft,
    boxSizing: "border-box",
  },

  softPanel: {
    borderRadius: theme.radius.md,
    padding: "1rem 1.1rem",
    border: `1px solid ${theme.colors.border}`,
    background: theme.colors.bgGlassSoft,
    boxSizing: "border-box",
  },

  title: {
    margin: 0,
    color: theme.colors.text,
    fontSize: "clamp(2rem, 4vw, 2.8rem)",
    fontWeight: 900,
    letterSpacing: "-0.04em",
    lineHeight: 1,
  },

  subtitle: {
    margin: 0,
    color: theme.colors.textSoft,
    lineHeight: 1.65,
  },

  badge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0.4rem 0.95rem",
    borderRadius: theme.radius.pill,
    border: `1px solid ${theme.colors.borderAccent}`,
    background: theme.colors.accentSoft,
    color: theme.colors.accent,
    fontSize: "0.82rem",
    fontWeight: 800,
    boxShadow: theme.shadows.accentGlow,
    boxSizing: "border-box",
  },

  progressTrack: {
    width: "100%",
    height: "10px",
    borderRadius: theme.radius.pill,
    background: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },

  progressBar: (value) => ({
    width: `${value}%`,
    height: "100%",
    borderRadius: theme.radius.pill,
    background: theme.gradients.progress,
    boxShadow: theme.shadows.accentGlow,
    transition: "width 0.3s ease",
  }),

  primaryButton: {
    border: "none",
    outline: "none",
    cursor: "pointer",
    padding: "0.9rem 1.2rem",
    color: "#ffffff",
    background: theme.gradients.buttonPrimary,
    boxShadow: theme.shadows.primaryGlow,
    transition: theme.transitions.springy,
    boxSizing: "border-box",
  },

  secondaryButton: {
    border: `1px solid ${theme.colors.borderStrong}`,
    outline: "none",
    cursor: "pointer",
    padding: "0.9rem 1.2rem",
    color: theme.colors.text,
    background: theme.gradients.buttonSecondary,
    boxShadow: theme.shadows.cardSoft,
    transition: theme.transitions.springy,
    boxSizing: "border-box",
  },

  ghostButton: {
    border: `1px solid ${theme.colors.border}`,
    outline: "none",
    cursor: "pointer",
    padding: "0.85rem 1.05rem",
    color: theme.colors.textSoft,
    background: "rgba(255,255,255,0.03)",
    transition: theme.transitions.springy,
    boxSizing: "border-box",
  },

  disabledButton: {
    opacity: 0.45,
    cursor: "not-allowed",
    boxShadow: "none",
  },

  choiceCard: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.95rem 1rem",
    borderRadius: theme.radius.md,
    border: `1px solid ${theme.colors.border}`,
    background: "rgba(255,255,255,0.04)",
    boxSizing: "border-box",
  },

  input: {
    width: "100%",
    padding: "0.95rem 1rem",
    borderRadius: theme.radius.md,
    border: `1px solid ${theme.colors.borderStrong}`,
    background: "rgba(255,255,255,0.05)",
    color: theme.colors.text,
    fontSize: "1rem",
    outline: "none",
    boxSizing: "border-box",
  },

  chipButton: {
    border: `1px solid ${theme.colors.border}`,
    background: "rgba(255,255,255,0.05)",
    color: theme.colors.text,
    cursor: "pointer",
    boxSizing: "border-box",
  },

  chipButtonSelected: {
    border: `1px solid ${theme.colors.borderAccent}`,
    background: theme.colors.accentSoft,
    color: theme.colors.text,
    boxSizing: "border-box",
  },

  wordBuildArea: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.6rem",
    alignItems: "center",
    minHeight: "72px",
    width: "100%",
    boxSizing: "border-box",
  },

  pairItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1rem",
    padding: "0.85rem 1rem",
    borderRadius: theme.radius.md,
    border: `1px solid ${theme.colors.border}`,
    background: "rgba(255,255,255,0.04)",
    boxSizing: "border-box",
  },

  resultSuccess: {
    padding: "1rem 1.1rem",
    borderRadius: theme.radius.md,
    border: "1px solid rgba(69,212,131,0.28)",
    background: "rgba(69,212,131,0.12)",
    color: "#d8ffe7",
    fontWeight: 700,
    boxSizing: "border-box",
  },

  resultError: {
    padding: "1rem 1.1rem",
    borderRadius: theme.radius.md,
    border: "1px solid rgba(255,107,129,0.28)",
    background: "rgba(255,107,129,0.12)",
    color: "#ffe1e6",
    fontWeight: 700,
    boxSizing: "border-box",
  },
};