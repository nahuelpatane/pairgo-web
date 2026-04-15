import { useState, useEffect, useRef } from "react";

const SECTIONS = ["hero", "how", "benefits", "proof", "cta"];

export default function PairgoLanding() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("worker");
  const [submitted, setSubmitted] = useState(false);
  const [visible, setVisible] = useState(new Set());
  const observerRefs = useRef({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible((prev) => new Set([...prev, e.target.dataset.section]));
          }
        });
      },
      { threshold: 0.15 }
    );
    Object.values(observerRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const isVisible = (id) => visible.has(id);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <div style={{ background: "#FAFAF7", minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;0,9..144,700;0,9..144,800;1,9..144,400&display=swap');

        :root {
          --ink: #1A1A18;
          --ink-soft: #4A4A45;
          --ink-muted: #8A8A82;
          --sand: #FAFAF7;
          --sand-dark: #F0EFE9;
          --coral: #E8654A;
          --coral-deep: #D4503A;
          --coral-glow: #FFE8E2;
          --ocean: #2563EB;
          --ocean-soft: #EFF6FF;
          --forest: #1B7A5A;
          --forest-soft: #ECFDF5;
          --gold: #E5A100;
          --gold-soft: #FFF8E1;
          --font-display: 'Fraunces', serif;
          --font-body: 'DM Sans', sans-serif;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .fade-up {
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .fade-up.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .delay-1 { transition-delay: 0.1s; }
        .delay-2 { transition-delay: 0.2s; }
        .delay-3 { transition-delay: 0.3s; }
        .delay-4 { transition-delay: 0.4s; }
        .delay-5 { transition-delay: 0.5s; }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes grain {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-2%, -2%); }
          30% { transform: translate(1%, -3%); }
          50% { transform: translate(-1%, 2%); }
          70% { transform: translate(3%, 1%); }
          90% { transform: translate(2%, -1%); }
        }

        .hero-section {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          background: linear-gradient(165deg, #1A1A18 0%, #2A2520 40%, #3A2A20 100%);
          overflow: hidden;
        }
        .hero-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          animation: grain 8s steps(10) infinite;
          pointer-events: none;
          z-index: 1;
        }

        .hero-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }
        .hero-orb-1 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(232,101,74,0.2) 0%, transparent 70%);
          top: -100px; right: -100px;
          animation: float 8s ease-in-out infinite;
        }
        .hero-orb-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%);
          bottom: -50px; left: -100px;
          animation: float 10s ease-in-out infinite 2s;
        }

        .nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          padding: 20px 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          backdrop-filter: blur(20px);
          background: rgba(26,26,24,0.6);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .nav-logo {
          font-family: var(--font-display);
          font-size: 24px;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.5px;
        }
        .nav-logo span { color: var(--coral); }
        .nav-links { display: flex; gap: 32px; align-items: center; }
        .nav-links a {
          color: rgba(255,255,255,0.6);
          text-decoration: none;
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 500;
          transition: color 0.2s;
        }
        .nav-links a:hover { color: #fff; }
        .nav-cta {
          background: var(--coral) !important;
          color: #fff !important;
          padding: 10px 24px;
          border-radius: 100px;
          font-weight: 600 !important;
          transition: background 0.2s, transform 0.2s !important;
        }
        .nav-cta:hover { background: var(--coral-deep) !important; transform: scale(1.03); }

        .hero-content {
          position: relative;
          z-index: 2;
          max-width: 1200px;
          margin: 0 auto;
          padding: 120px 40px 80px;
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 60px;
          align-items: center;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(232,101,74,0.12);
          border: 1px solid rgba(232,101,74,0.25);
          padding: 8px 16px;
          border-radius: 100px;
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 600;
          color: var(--coral);
          margin-bottom: 24px;
        }
        .badge-dot {
          width: 7px; height: 7px;
          background: var(--coral);
          border-radius: 50%;
          position: relative;
        }
        .badge-dot::after {
          content: '';
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          border: 2px solid var(--coral);
          animation: pulse-ring 2s ease-out infinite;
        }

        .hero-title {
          font-family: var(--font-display);
          font-size: clamp(40px, 5.5vw, 64px);
          font-weight: 700;
          color: #fff;
          line-height: 1.08;
          letter-spacing: -2px;
          margin-bottom: 20px;
        }
        .hero-title em {
          font-style: italic;
          color: var(--coral);
          font-weight: 600;
        }
        .hero-subtitle {
          font-family: var(--font-body);
          font-size: 18px;
          color: rgba(255,255,255,0.55);
          line-height: 1.6;
          margin-bottom: 36px;
          max-width: 480px;
        }

        .hero-form {
          display: flex;
          gap: 0;
          max-width: 440px;
        }
        .hero-input {
          flex: 1;
          padding: 16px 20px;
          border: 2px solid rgba(255,255,255,0.1);
          border-right: none;
          border-radius: 14px 0 0 14px;
          background: rgba(255,255,255,0.06);
          color: #fff;
          font-family: var(--font-body);
          font-size: 15px;
          outline: none;
          transition: border-color 0.2s;
        }
        .hero-input::placeholder { color: rgba(255,255,255,0.3); }
        .hero-input:focus { border-color: var(--coral); }
        .hero-btn {
          padding: 16px 28px;
          background: var(--coral);
          color: #fff;
          border: none;
          border-radius: 0 14px 14px 0;
          font-family: var(--font-body);
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s;
          white-space: nowrap;
        }
        .hero-btn:hover { background: var(--coral-deep); }

        .hero-stats {
          display: flex;
          gap: 40px;
          margin-top: 48px;
          padding-top: 32px;
          border-top: 1px solid rgba(255,255,255,0.08);
        }
        .stat-val {
          font-family: var(--font-display);
          font-size: 28px;
          font-weight: 700;
          color: #fff;
        }
        .stat-label {
          font-family: var(--font-body);
          font-size: 13px;
          color: rgba(255,255,255,0.4);
          margin-top: 2px;
        }

        /* Hero illustration */
        .hero-visual {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .swap-card {
          background: rgba(255,255,255,0.07);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          padding: 28px;
          width: 320px;
          position: relative;
        }
        .swap-card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }
        .swap-avatar {
          width: 48px; height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
        }
        .swap-name {
          font-family: var(--font-body);
          font-size: 16px;
          font-weight: 600;
          color: #fff;
        }
        .swap-role {
          font-family: var(--font-body);
          font-size: 12px;
          color: rgba(255,255,255,0.45);
          margin-top: 2px;
        }
        .swap-route {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255,255,255,0.05);
          border-radius: 12px;
          padding: 14px 16px;
          margin-bottom: 16px;
        }
        .swap-city {
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 600;
          color: #fff;
        }
        .swap-country {
          font-family: var(--font-body);
          font-size: 11px;
          color: rgba(255,255,255,0.35);
        }
        .swap-arrow {
          font-size: 18px;
          color: var(--coral);
          flex-shrink: 0;
        }
        .swap-skills {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 16px;
        }
        .swap-skill {
          padding: 5px 12px;
          background: rgba(232,101,74,0.12);
          border-radius: 100px;
          font-family: var(--font-body);
          font-size: 11px;
          font-weight: 600;
          color: var(--coral);
        }
        .swap-match-bar {
          background: rgba(255,255,255,0.08);
          height: 6px;
          border-radius: 3px;
          overflow: hidden;
          margin-top: 8px;
        }
        .swap-match-fill {
          height: 100%;
          border-radius: 3px;
          background: linear-gradient(90deg, var(--coral), var(--gold));
          width: 92%;
          transition: width 1.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .swap-match-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: var(--font-body);
          font-size: 12px;
          color: rgba(255,255,255,0.4);
          margin-bottom: 4px;
        }
        .swap-match-pct {
          color: var(--coral);
          font-weight: 700;
        }

        .floating-badge {
          position: absolute;
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 14px;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          animation: float 6s ease-in-out infinite;
        }
        .floating-badge-icon {
          width: 36px; height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }
        .floating-badge-text {
          font-family: var(--font-body);
          font-size: 12px;
          font-weight: 600;
          color: #fff;
        }
        .floating-badge-sub {
          font-size: 10px;
          color: rgba(255,255,255,0.4);
          font-weight: 400;
        }

        /* SECTIONS */
        .section {
          max-width: 1200px;
          margin: 0 auto;
          padding: 100px 40px;
        }
        .section-label {
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: var(--coral);
          margin-bottom: 12px;
        }
        .section-title {
          font-family: var(--font-display);
          font-size: clamp(32px, 4vw, 48px);
          font-weight: 700;
          color: var(--ink);
          line-height: 1.1;
          letter-spacing: -1.5px;
          margin-bottom: 16px;
        }
        .section-subtitle {
          font-family: var(--font-body);
          font-size: 17px;
          color: var(--ink-muted);
          line-height: 1.6;
          max-width: 520px;
        }

        /* HOW IT WORKS */
        .steps-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          margin-top: 64px;
        }
        .step-card {
          background: #fff;
          border-radius: 20px;
          padding: 32px 24px;
          border: 1px solid rgba(0,0,0,0.05);
          position: relative;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .step-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.06);
        }
        .step-num {
          font-family: var(--font-display);
          font-size: 48px;
          font-weight: 800;
          color: var(--sand-dark);
          line-height: 1;
          margin-bottom: 16px;
        }
        .step-icon {
          width: 48px; height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          margin-bottom: 16px;
        }
        .step-title {
          font-family: var(--font-display);
          font-size: 20px;
          font-weight: 700;
          color: var(--ink);
          margin-bottom: 8px;
        }
        .step-desc {
          font-family: var(--font-body);
          font-size: 14px;
          color: var(--ink-muted);
          line-height: 1.5;
        }
        .step-connector {
          position: absolute;
          top: 50%;
          right: -18px;
          color: var(--ink-muted);
          font-size: 16px;
          opacity: 0.3;
        }

        /* BENEFITS */
        .benefits-section {
          background: var(--ink);
          position: relative;
          overflow: hidden;
        }
        .benefits-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
          pointer-events: none;
        }
        .benefits-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 100px 40px;
          position: relative;
          z-index: 1;
        }
        .benefits-toggle {
          display: flex;
          gap: 4px;
          background: rgba(255,255,255,0.06);
          border-radius: 100px;
          padding: 4px;
          width: fit-content;
          margin-bottom: 56px;
        }
        .toggle-btn {
          padding: 12px 28px;
          border-radius: 100px;
          border: none;
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          background: transparent;
          color: rgba(255,255,255,0.4);
        }
        .toggle-btn.active {
          background: var(--coral);
          color: #fff;
        }
        .benefits-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .benefit-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          padding: 32px;
          transition: background 0.3s, border-color 0.3s;
        }
        .benefit-card:hover {
          background: rgba(255,255,255,0.07);
          border-color: rgba(255,255,255,0.12);
        }
        .benefit-icon {
          width: 48px; height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          margin-bottom: 20px;
        }
        .benefit-title {
          font-family: var(--font-display);
          font-size: 20px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 8px;
        }
        .benefit-desc {
          font-family: var(--font-body);
          font-size: 14px;
          color: rgba(255,255,255,0.45);
          line-height: 1.6;
        }

        /* SOCIAL PROOF */
        .proof-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-top: 56px;
        }
        .proof-card {
          background: #fff;
          border-radius: 20px;
          padding: 32px;
          border: 1px solid rgba(0,0,0,0.05);
        }
        .proof-stars {
          color: var(--gold);
          font-size: 16px;
          margin-bottom: 16px;
          letter-spacing: 2px;
        }
        .proof-text {
          font-family: var(--font-body);
          font-size: 15px;
          color: var(--ink-soft);
          line-height: 1.65;
          margin-bottom: 20px;
          font-style: italic;
        }
        .proof-author {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .proof-avatar {
          width: 42px; height: 42px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }
        .proof-name {
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 600;
          color: var(--ink);
        }
        .proof-meta {
          font-family: var(--font-body);
          font-size: 12px;
          color: var(--ink-muted);
        }

        /* CTA */
        .cta-section {
          background: linear-gradient(165deg, var(--coral) 0%, var(--coral-deep) 100%);
          position: relative;
          overflow: hidden;
        }
        .cta-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E");
          pointer-events: none;
        }
        .cta-inner {
          max-width: 700px;
          margin: 0 auto;
          padding: 100px 40px;
          text-align: center;
          position: relative;
          z-index: 1;
        }
        .cta-title {
          font-family: var(--font-display);
          font-size: clamp(32px, 4vw, 48px);
          font-weight: 700;
          color: #fff;
          line-height: 1.1;
          letter-spacing: -1.5px;
          margin-bottom: 16px;
        }
        .cta-subtitle {
          font-family: var(--font-body);
          font-size: 17px;
          color: rgba(255,255,255,0.75);
          margin-bottom: 40px;
          line-height: 1.6;
        }
        .cta-form {
          display: flex;
          gap: 0;
          max-width: 460px;
          margin: 0 auto 24px;
        }
        .cta-input {
          flex: 1;
          padding: 18px 22px;
          border: 2px solid rgba(255,255,255,0.25);
          border-right: none;
          border-radius: 14px 0 0 14px;
          background: rgba(255,255,255,0.12);
          color: #fff;
          font-family: var(--font-body);
          font-size: 15px;
          outline: none;
        }
        .cta-input::placeholder { color: rgba(255,255,255,0.5); }
        .cta-input:focus { border-color: #fff; }
        .cta-btn {
          padding: 18px 32px;
          background: var(--ink);
          color: #fff;
          border: none;
          border-radius: 0 14px 14px 0;
          font-family: var(--font-body);
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s;
          white-space: nowrap;
        }
        .cta-btn:hover { background: #333; }
        .cta-note {
          font-family: var(--font-body);
          font-size: 13px;
          color: rgba(255,255,255,0.5);
        }

        /* SUCCESS */
        .success-msg {
          background: rgba(255,255,255,0.15);
          border-radius: 16px;
          padding: 24px;
          max-width: 460px;
          margin: 0 auto;
        }
        .success-msg h3 {
          font-family: var(--font-display);
          font-size: 22px;
          color: #fff;
          margin-bottom: 8px;
        }
        .success-msg p {
          font-family: var(--font-body);
          font-size: 14px;
          color: rgba(255,255,255,0.7);
        }

        /* FOOTER */
        .footer {
          background: var(--ink);
          padding: 48px 40px;
        }
        .footer-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .footer-logo {
          font-family: var(--font-display);
          font-size: 20px;
          font-weight: 700;
          color: #fff;
        }
        .footer-logo span { color: var(--coral); }
        .footer-text {
          font-family: var(--font-body);
          font-size: 13px;
          color: rgba(255,255,255,0.3);
        }

        @media (max-width: 900px) {
          .hero-content { grid-template-columns: 1fr; padding: 100px 24px 60px; }
          .hero-visual { display: none; }
          .steps-grid { grid-template-columns: repeat(2, 1fr); }
          .benefits-grid { grid-template-columns: 1fr; }
          .proof-grid { grid-template-columns: 1fr; }
          .step-connector { display: none; }
          .nav { padding: 16px 20px; }
          .nav-links a:not(.nav-cta) { display: none; }
          .section, .benefits-inner, .cta-inner { padding-left: 24px; padding-right: 24px; }
          .hero-stats { gap: 24px; }
          .hero-form, .cta-form { flex-direction: column; }
          .hero-input, .cta-input { border-radius: 14px; border-right: 2px solid rgba(255,255,255,0.1); }
          .hero-btn, .cta-btn { border-radius: 14px; padding: 16px; }
        }
        @media (max-width: 600px) {
          .steps-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* NAV */}
      <nav className="nav">
        <div className="nav-logo">pair<span>go</span></div>
        <div className="nav-links">
          <a href="#how">How it works</a>
          <a href="#benefits">Benefits</a>
          <a href="#proof">Stories</a>
          <a href="#cta" className="nav-cta">Early Access</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero-section">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-content">
          <div>
            <div className={`fade-up ${isVisible("hero") ? "visible" : ""}`}
              ref={(el) => { observerRefs.current["hero"] = el; }}
              data-section="hero">
              <div className="hero-badge">
                <div className="badge-dot" />
                Launching in Australia — 2026
              </div>
            </div>
            <h1 className={`hero-title fade-up delay-1 ${isVisible("hero") ? "visible" : ""}`}>
              Swap your job.<br />
              <em>Keep moving.</em>
            </h1>
            <p className={`hero-subtitle fade-up delay-2 ${isVisible("hero") ? "visible" : ""}`}>
              Find someone in another city with your same role, swap positions, and travel with a guaranteed job waiting for you on day one.
            </p>
            <form className={`hero-form fade-up delay-3 ${isVisible("hero") ? "visible" : ""}`}
              onSubmit={handleSubmit}>
              <input className="hero-input" type="email" placeholder="Enter your email"
                value={email} onChange={(e) => setEmail(e.target.value)} />
              <button className="hero-btn" type="submit">Get Early Access</button>
            </form>
            <div className={`hero-stats fade-up delay-4 ${isVisible("hero") ? "visible" : ""}`}>
              <div>
                <div className="stat-val">100%</div>
                <div className="stat-label">Free during beta</div>
              </div>
              <div>
                <div className="stat-val">0</div>
                <div className="stat-label">Recruitment cost</div>
              </div>
              <div>
                <div className="stat-val">Day 1</div>
                <div className="stat-label">Start working</div>
              </div>
            </div>
          </div>

          {/* HERO VISUAL */}
          <div className={`hero-visual fade-up delay-3 ${isVisible("hero") ? "visible" : ""}`}>
            <div className="swap-card" style={{ animation: "float 7s ease-in-out infinite" }}>
              <div className="swap-card-header">
                <div className="swap-avatar" style={{ background: "rgba(232,101,74,0.15)" }}>👩‍🍳</div>
                <div>
                  <div className="swap-name">Sarah T.</div>
                  <div className="swap-role">Kitchen Hand • Verified ✓</div>
                </div>
              </div>
              <div className="swap-route">
                <div>
                  <div className="swap-city">Cairns</div>
                  <div className="swap-country">QLD, Australia</div>
                </div>
                <div className="swap-arrow">→</div>
                <div>
                  <div className="swap-city">Melbourne</div>
                  <div className="swap-country">VIC, Australia</div>
                </div>
              </div>
              <div className="swap-skills">
                <span className="swap-skill">Kitchen Hand ★★★</span>
                <span className="swap-skill">Barista ★★</span>
                <span className="swap-skill">Food Prep ★★</span>
              </div>
              <div className="swap-match-label">
                <span>Skills Match</span>
                <span className="swap-match-pct">92%</span>
              </div>
              <div className="swap-match-bar">
                <div className="swap-match-fill" />
              </div>
            </div>

            <div className="floating-badge" style={{ top: -10, right: -30, animationDelay: "1s" }}>
              <div className="floating-badge-icon" style={{ background: "rgba(27,122,90,0.15)" }}>✓</div>
              <div>
                <div className="floating-badge-text">Manager Approved</div>
                <div className="floating-badge-sub">Reef Bistro, Cairns</div>
              </div>
            </div>

            <div className="floating-badge" style={{ bottom: 20, left: -40, animationDelay: "3s" }}>
              <div className="floating-badge-icon" style={{ background: "rgba(229,161,0,0.15)" }}>★</div>
              <div>
                <div className="floating-badge-text">4.9 Rating</div>
                <div className="floating-badge-sub">6 completed swaps</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="section"
        ref={(el) => { observerRefs.current["how"] = el; }}
        data-section="how">
        <div className={`fade-up ${isVisible("how") ? "visible" : ""}`}>
          <div className="section-label">How it works</div>
          <div className="section-title">Four steps to your<br />next adventure</div>
          <div className="section-subtitle">
            No interviews, no uncertainty. Just a verified swap with someone who's ready to go.
          </div>
        </div>
        <div className="steps-grid">
          {[
            { num: "01", icon: "📝", bg: "#FFF1EE", title: "Post your swap", desc: "Share your current role, skills, and where you want to go. Set your dates and preferred destinations.", color: "var(--coral-glow)" },
            { num: "02", icon: "🔍", bg: "#EFF6FF", title: "Find your match", desc: "Browse verified workers in your target city with matching skills. See their ratings, reviews, and work history.", color: "var(--ocean-soft)" },
            { num: "03", icon: "✅", bg: "#ECFDF5", title: "Managers approve", desc: "Both managers review the candidate's verified profile and approve the swap. No surprises, full transparency.", color: "var(--forest-soft)" },
            { num: "04", icon: "✈️", bg: "#FFF8E1", title: "Travel & start", desc: "Pack your bags and go. Your new position is confirmed and waiting. Start working from day one.", color: "var(--gold-soft)" },
          ].map((step, i) => (
            <div key={i}
              className={`step-card fade-up delay-${i + 1} ${isVisible("how") ? "visible" : ""}`}>
              <div className="step-num">{step.num}</div>
              <div className="step-icon" style={{ background: step.color }}>{step.icon}</div>
              <div className="step-title">{step.title}</div>
              <div className="step-desc">{step.desc}</div>
              {i < 3 && <div className="step-connector">→</div>}
            </div>
          ))}
        </div>
      </section>

      {/* BENEFITS */}
      <section id="benefits" className="benefits-section"
        ref={(el) => { observerRefs.current["benefits"] = el; }}
        data-section="benefits">
        <div className="benefits-inner">
          <div className={`fade-up ${isVisible("benefits") ? "visible" : ""}`}>
            <div className="section-label">Benefits</div>
            <div className="section-title" style={{ color: "#fff" }}>Built for both sides</div>
            <div className="section-subtitle" style={{ color: "rgba(255,255,255,0.45)" }}>
              Whether you're a backpacker looking for your next adventure or a manager tired of losing great workers.
            </div>
          </div>

          <div className={`benefits-toggle fade-up delay-1 ${isVisible("benefits") ? "visible" : ""}`}>
            <button className={`toggle-btn ${role === "worker" ? "active" : ""}`}
              onClick={() => setRole("worker")}>🎒 For Workers</button>
            <button className={`toggle-btn ${role === "manager" ? "active" : ""}`}
              onClick={() => setRole("manager")}>🏢 For Managers</button>
          </div>

          <div className="benefits-grid">
            {(role === "worker"
              ? [
                  { icon: "💼", title: "Job on arrival", desc: "No more arriving to a new city broke and desperate. Your position is confirmed before you leave.", bg: "rgba(232,101,74,0.12)" },
                  { icon: "⭐", title: "Portable reputation", desc: "Your ratings and verified skills follow you everywhere. Every swap makes your profile stronger.", bg: "rgba(229,161,0,0.12)" },
                  { icon: "🌏", title: "Explore with confidence", desc: "See a new city without the financial risk. You already know your schedule, your manager, and your role.", bg: "rgba(37,99,235,0.12)" },
                  { icon: "🤝", title: "Meet your swap", desc: "Chat with your match before the swap. Get insider tips about the city, the job, and the team.", bg: "rgba(27,122,90,0.12)" },
                  { icon: "📈", title: "Grow your career", desc: "Work in different environments, learn new skills, and build a resume that shows adaptability.", bg: "rgba(232,101,74,0.12)" },
                  { icon: "🔒", title: "Verified & safe", desc: "Every business is ABN-verified. Every worker is ID-checked. Reviews from real managers you can trust.", bg: "rgba(37,99,235,0.12)" },
                ]
              : [
                  { icon: "⚡", title: "Zero downtime", desc: "When a worker leaves, a pre-vetted replacement arrives the same week. No gap in your roster.", bg: "rgba(232,101,74,0.12)" },
                  { icon: "✅", title: "Pre-vetted candidates", desc: "See verified skills, ratings from other managers, and complete work history before you approve.", bg: "rgba(27,122,90,0.12)" },
                  { icon: "💰", title: "Cut recruitment costs", desc: "No job ads, no interviews, no trial shifts. The platform handles matching and verification.", bg: "rgba(229,161,0,0.12)" },
                  { icon: "📊", title: "Full transparency", desc: "Review detailed profiles with skill levels, reliability scores, and comments from previous employers.", bg: "rgba(37,99,235,0.12)" },
                  { icon: "🎯", title: "One-click approval", desc: "Review the candidate, tap approve, done. The simplest hiring process you've ever used.", bg: "rgba(232,101,74,0.12)" },
                  { icon: "🔄", title: "Consistent quality", desc: "Workers are incentivized to perform because their rating affects future swap opportunities.", bg: "rgba(27,122,90,0.12)" },
                ]
            ).map((b, i) => (
              <div key={`${role}-${i}`}
                className={`benefit-card fade-up delay-${(i % 3) + 1} ${isVisible("benefits") ? "visible" : ""}`}>
                <div className="benefit-icon" style={{ background: b.bg }}>{b.icon}</div>
                <div className="benefit-title">{b.title}</div>
                <div className="benefit-desc">{b.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section id="proof" className="section"
        ref={(el) => { observerRefs.current["proof"] = el; }}
        data-section="proof">
        <div className={`fade-up ${isVisible("proof") ? "visible" : ""}`}>
          <div className="section-label">Stories</div>
          <div className="section-title">What early testers say</div>
          <div className="section-subtitle">
            Real feedback from backpackers and managers who tested the concept.
          </div>
        </div>
        <div className="proof-grid">
          {[
            {
              text: "I was terrified of leaving Cairns because I had a good job. With Pairgo I found a kitchen hand in Melbourne who wanted to come here. We swapped and I started working the day after I arrived.",
              name: "Emma L.",
              meta: "Kitchen Hand • UK → Cairns → Melbourne",
              emoji: "👩‍🍳",
              bg: "var(--coral-glow)",
            },
            {
              text: "As a hospo manager, my biggest headache is replacing backpackers who leave. This solves it completely. I get someone with verified reviews who I know can do the job.",
              name: "Tom S.",
              meta: "Manager • Reef Bistro, Cairns",
              emoji: "👨‍💼",
              bg: "var(--ocean-soft)",
            },
            {
              text: "I've done 3 swaps now. Byron Bay, Gold Coast, and now Sydney. Every time I arrive knowing exactly what to expect. My profile keeps getting stronger with each swap.",
              name: "Lucas M.",
              meta: "Barista • Argentina → 4 cities",
              emoji: "☕",
              bg: "var(--gold-soft)",
            },
          ].map((p, i) => (
            <div key={i}
              className={`proof-card fade-up delay-${i + 1} ${isVisible("proof") ? "visible" : ""}`}>
              <div className="proof-stars">★★★★★</div>
              <div className="proof-text">"{p.text}"</div>
              <div className="proof-author">
                <div className="proof-avatar" style={{ background: p.bg }}>{p.emoji}</div>
                <div>
                  <div className="proof-name">{p.name}</div>
                  <div className="proof-meta">{p.meta}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="cta-section"
        ref={(el) => { observerRefs.current["cta"] = el; }}
        data-section="cta">
        <div className="cta-inner">
          <div className={`fade-up ${isVisible("cta") ? "visible" : ""}`}>
            <div className="cta-title">Ready to make<br />your next move?</div>
            <div className="cta-subtitle">
              Join the waitlist and be among the first to swap when Pairgo launches in Australia.
            </div>
          </div>

          {!submitted ? (
            <form className={`cta-form fade-up delay-1 ${isVisible("cta") ? "visible" : ""}`}
              onSubmit={handleSubmit}>
              <input className="cta-input" type="email" placeholder="your@email.com"
                value={email} onChange={(e) => setEmail(e.target.value)} />
              <button className="cta-btn" type="submit">Join Waitlist</button>
            </form>
          ) : (
            <div className={`success-msg fade-up ${isVisible("cta") ? "visible" : ""}`}>
              <h3>You're in! 🎉</h3>
              <p>We'll notify you as soon as Pairgo launches. Welcome to the community.</p>
            </div>
          )}

          <div className={`cta-note fade-up delay-2 ${isVisible("cta") ? "visible" : ""}`}>
            No spam, ever. Just launch updates and early access.
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-logo">pair<span>go</span></div>
          <div className="footer-text">© 2026 Pairgo. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
