import { theme, ui } from "../styles/theme";
import lertiLogo from "../assets/LERTI.png";

function getInitial(name = "-") {
  return String(name).trim().charAt(0).toUpperCase() || "U";
}

export default function Header({ userName = "-", levelName = "-" }) {
  return (
    <header
      style={{
        ...ui.topbar,
        position: "relative",
        overflow: "hidden",
        width: "100%",
        minHeight: "clamp(88px, 10vw, 118px)",
        borderRadius: "clamp(22px, 3vw, 30px)",
        padding: "clamp(14px, 1.8vw, 22px) clamp(16px, 2vw, 28px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "clamp(12px, 2vw, 24px)",
        flexWrap: "wrap",
        boxSizing: "border-box",
        background: `
          radial-gradient(circle at 12% 20%, rgba(198,240,77,0.10), transparent 16%),
          radial-gradient(circle at 88% 30%, rgba(91,140,255,0.16), transparent 22%),
          linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0.04))
        `,
        boxShadow: "0 22px 50px rgba(31, 42, 68, 0.10)",
        border: `1px solid ${theme.colors.border}`,
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
      }}
    >
      <style>{`
        .app-header-left {
          display: flex;
          align-items: center;
          gap: clamp(14px, 1.8vw, 22px);
          flex: 1 1 440px;
          min-width: 0;
        }

        .app-header-brand-wrap {
          display: flex;
          align-items: center;
          gap: clamp(14px, 1.8vw, 22px);
          min-width: 0;
          flex: 1 1 auto;
        }

        .app-header-logo-box {
          width: clamp(82px, 7vw, 108px);
          height: clamp(82px, 7vw, 108px);
          min-width: clamp(82px, 7vw, 108px);
          border-radius: clamp(18px, 2vw, 24px);
          border: 1px solid ${theme.colors.borderStrong};
          background: linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.05));
          box-shadow: 0 16px 32px rgba(31, 42, 68, 0.16);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
          padding: clamp(6px, 0.8vw, 10px);
        }

        .app-header-logo {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
          filter: drop-shadow(0 4px 12px rgba(0,0,0,0.14));
        }

        .app-header-brand {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 0.18rem;
          min-width: 0;
          flex: 1 1 auto;
        }

        .app-header-right {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          flex: 0 1 340px;
          min-width: 0;
          margin-left: auto;
        }

        .app-profile-card {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          width: 100%;
          max-width: 340px;
          min-width: 0;
          min-height: 72px;
        }

        .app-profile-meta {
          display: flex;
          flex-direction: column;
          gap: 0.18rem;
          min-width: 0;
          flex: 1 1 auto;
        }

        .app-profile-name,
        .app-profile-level,
        .app-header-title,
        .app-header-eyebrow {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        @media (max-width: 900px) {
          .app-header-right {
            flex: 1 1 280px;
          }
        }

        @media (max-width: 768px) {
          .app-header-left {
            flex: 1 1 100%;
          }

          .app-header-right {
            flex: 1 1 100%;
            margin-left: 0;
            justify-content: flex-start;
          }

          .app-profile-card {
            max-width: 100%;
          }
        }

        @media (max-width: 520px) {
          .app-header-brand-wrap {
            gap: 10px;
          }

          .app-header-logo-box {
            width: 72px;
            height: 72px;
            min-width: 72px;
            padding: 6px;
          }
        }
      `}</style>

      <div
        style={{
          position: "absolute",
          top: "-60px",
          left: "-40px",
          width: "140px",
          height: "140px",
          borderRadius: "999px",
          background: "rgba(91,140,255,0.10)",
          filter: "blur(18px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: "-70px",
          right: "120px",
          width: "160px",
          height: "160px",
          borderRadius: "999px",
          background: "rgba(140,123,255,0.08)",
          filter: "blur(20px)",
          pointerEvents: "none",
        }}
      />

      <div
        className="app-header-left"
        style={{
          position: "relative",
          zIndex: 1,
        }}
      >
        <div className="app-header-brand-wrap">
          <div className="app-header-logo-box">
            <img src={lertiLogo} alt="LERTI" className="app-header-logo" />
          </div>

          <div className="app-header-brand">
            <p
              className="app-header-eyebrow"
              style={{
                ...ui.eyebrow,
                margin: 0,
                fontSize: "clamp(0.62rem, 0.9vw, 0.74rem)",
                letterSpacing: "0.12em",
                color: theme.colors.textMuted,
              }}
            >
              English training app
            </p>

            <h1
              className="app-header-title"
              style={{
                ...ui.topbarTitle,
                margin: 0,
                fontSize: "clamp(1.9rem, 3vw, 2.8rem)",
                lineHeight: 1,
                letterSpacing: "-0.04em",
                color: theme.colors.text,
                fontWeight: 900,
              }}
            >
              LERTI
            </h1>
          </div>
        </div>
      </div>
      <div
        className="app-header-right"
        style={{
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          className="app-profile-card"
          style={{
            ...ui.profileCard,
            padding: "0.7rem 0.95rem",
            borderRadius: "24px",
            background: "rgba(255,255,255,0.10)",
            border: `1px solid ${theme.colors.border}`,
            boxShadow: "0 14px 30px rgba(31, 42, 68, 0.08)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              ...ui.avatar,
              width: "48px",
              height: "48px",
              minWidth: "48px",
              fontSize: "1rem",
              fontWeight: 900,
              borderRadius: "18px",
              background:
                "linear-gradient(135deg, rgba(91,140,255,0.95), rgba(140,123,255,0.92))",
              color: "#fff",
              boxShadow: "0 12px 24px rgba(91,140,255,0.22)",
              flexShrink: 0,
            }}
          >
            {getInitial(userName)}
          </div>

          <div className="app-profile-meta">
            <span
              className="app-profile-name"
              style={{
                color: theme.colors.text,
                fontSize: "clamp(0.9rem, 1.2vw, 0.98rem)",
                fontWeight: 800,
                lineHeight: 1.1,
              }}
              title={userName}
            >
              {userName}
            </span>

            <span
              className="app-profile-level"
              style={{
                color: theme.colors.textMuted,
                fontSize: "clamp(0.78rem, 1vw, 0.82rem)",
                fontWeight: 700,
                lineHeight: 1.1,
              }}
              title={levelName}
            >
              {levelName}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}