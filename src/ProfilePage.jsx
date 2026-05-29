import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, LogOut, MessageCircle, RefreshCw } from "lucide-react";

const PROFILE_DATA = {
  name: "Emma Laurent",
  nationality: "French",
  flag: "🇫🇷",
  photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80",
  coverPhoto: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&q=80",
  role: "Kitchen Hand & Barista",
  emoji: "👩‍🍳",
  rating: 4.9,
  reviewCount: 12,
  swapsCompleted: 3,
  yearsExp: 4,
  verified: true,
  currentPlace: "The Pier Restaurant",
  currentCity: "Cairns",
  currentState: "QLD",
  targetCity: "Melbourne",
  targetState: "VIC",
  availableFrom: "July 2026",
  visaType: "Working Holiday (417)",
  languages: ["English (Fluent)", "French (Native)", "Spanish (Basic)"],
  bio: "Passionate cook with 4 years of hospitality experience across Europe and now Australia. I love learning new cuisines and adapting fast to different kitchen environments. Currently working at The Pier Restaurant in Cairns and ready to make my next swap when the right match comes along.",
  skills: [
    "Kitchen Hand", "Barista", "Food Prep", "Bar Work",
    "Front of House", "Cleaning & Hygiene", "Stock Control", "Team Training",
  ],
  certs: [
    { name: "Food Safety Certificate", icon: "🏆", color: "#ECFDF5" },
    { name: "RSA Certification", icon: "🍺", color: "#EFF6FF" },
    { name: "Barista Diploma", icon: "☕", color: "#FFF8E1" },
  ],
  workHistory: [
    {
      role: "Kitchen Hand",
      place: "Saltwater Café",
      city: "Byron Bay, NSW",
      period: "Jan – Apr 2026",
      rating: 5.0,
      managerName: "Tom S.",
      managerRole: "Head Chef",
      review: "Emma was outstanding. She picked up our kitchen procedures within 2 days and never needed reminding about hygiene standards. We would take her back any time.",
      emoji: "🌿",
      coverColor: "#ECFDF5",
      swapPartner: "Juan M. (Melbourne → Byron Bay)",
    },
    {
      role: "Barista",
      place: "The Beach Club",
      city: "Gold Coast, QLD",
      period: "Sep – Dec 2025",
      rating: 4.9,
      managerName: "Sarah K.",
      managerRole: "Floor Manager",
      review: "Very reliable and professional from day one. She integrated with the team immediately and our customers loved her energy and coffee skills.",
      emoji: "🏖️",
      coverColor: "#EFF6FF",
      swapPartner: "Mia T. (Cairns → Gold Coast)",
    },
    {
      role: "Barista",
      place: "Bondi Brew Co.",
      city: "Sydney, NSW",
      period: "Apr – Aug 2025",
      rating: 4.8,
      managerName: "Alex R.",
      managerRole: "Café Owner",
      review: "Excellent barista skills and a great attitude. Customers often came back specifically asking for her. Would recommend to any café owner.",
      emoji: "☕",
      coverColor: "#FFF8E1",
      swapPartner: "Lena W. (Cairns → Sydney)",
    },
  ],
};

export default function ProfilePage({ user, onBack, onLogout }) {
  const [tab, setTab] = useState("overview");
  const profile = PROFILE_DATA;

  const avgRating = (
    profile.workHistory.reduce((s, w) => s + w.rating, 0) / profile.workHistory.length
  ).toFixed(1);

  return (
    <div style={{ background: "#F5F4F0", minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;0,9..144,700;0,9..144,800;1,9..144,400&display=swap');
        :root {
          --ink:#1A1A18;--ink-soft:#4A4A45;--ink-muted:#8A8A82;
          --sand:#FAFAF7;--sand-dark:#F0EFE9;
          --coral:#E8654A;--coral-deep:#D4503A;--coral-glow:#FFE8E2;
          --ocean:#2563EB;--ocean-soft:#EFF6FF;
          --forest:#1B7A5A;--forest-soft:#ECFDF5;
          --gold:#E5A100;--gold-soft:#FFF8E1;
          --font-d:'Fraunces',serif;--font-b:'DM Sans',sans-serif;
        }
        *{box-sizing:border-box;margin:0;padding:0;}

        .ptab{padding:10px 22px;border-radius:100px;border:none;font-family:var(--font-b);font-size:14px;font-weight:600;cursor:pointer;transition:all .25s;background:transparent;color:var(--ink-muted);}
        .ptab.on{background:var(--ink);color:#fff;}
        .ptab:hover:not(.on){background:rgba(0,0,0,.06);color:var(--ink);}

        .skill-tag{padding:8px 16px;border-radius:100px;background:#fff;border:1.5px solid rgba(0,0,0,.08);font-family:var(--font-b);font-size:13px;font-weight:500;color:var(--ink-soft);transition:all .2s;cursor:default;}
        .skill-tag:hover{border-color:var(--coral);color:var(--coral);background:var(--coral-glow);}

        .pcard{background:#fff;border-radius:24px;border:1px solid rgba(0,0,0,.04);}

        .content-grid{display:grid;grid-template-columns:300px 1fr;gap:20px;margin-bottom:20px;}
        @media(max-width:768px){
          .content-grid{grid-template-columns:1fr;}
          .prof-header-inner{flex-direction:column!important;}
          .prof-actions{margin-top:16px;}
        }
        @media(max-width:640px){
          .prof-content{padding:0 16px!important;}
          .pcard{padding:20px!important;}
        }
      `}</style>

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "16px 32px", display: "flex", alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(26,26,24,.88)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <button
            onClick={onBack}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              color: "rgba(255,255,255,.55)", background: "none", border: "none",
              cursor: "pointer", fontFamily: "var(--font-b)", fontSize: 14, fontWeight: 500,
              transition: "color .2s", padding: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.color = "#fff"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,.55)"}
          >
            <ArrowLeft size={15} /> Back
          </button>
          <div style={{ fontFamily: "var(--font-d)", fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-1px" }}>
            pair<span style={{ color: "var(--coral)" }}>go</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontFamily: "var(--font-b)", fontSize: 13, color: "rgba(255,255,255,.35)" }}>{user.email}</span>
          <button
            onClick={onLogout}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              color: "rgba(255,255,255,.4)", background: "rgba(255,255,255,.06)",
              border: "1px solid rgba(255,255,255,.08)", borderRadius: 100,
              cursor: "pointer", fontFamily: "var(--font-b)", fontSize: 13, fontWeight: 500,
              transition: "all .2s", padding: "8px 16px",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,.4)"; e.currentTarget.style.background = "rgba(255,255,255,.06)"; }}
          >
            <LogOut size={13} /> Log out
          </button>
        </div>
      </nav>

      {/* COVER PHOTO */}
      <div style={{ position: "relative", height: 320, overflow: "hidden", marginTop: 0 }}>
        <img
          src={profile.coverPhoto}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover", marginTop: 57 }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,.05) 0%, rgba(0,0,0,.6) 100%)" }} />
      </div>

      {/* CONTENT */}
      <div className="prof-content" style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px" }}>

        {/* HEADER CARD */}
        <motion.div
          className="pcard"
          style={{ padding: "32px 36px", marginTop: -90, position: "relative", zIndex: 10, boxShadow: "0 8px 40px rgba(0,0,0,.1)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="prof-header-inner" style={{ display: "flex", gap: 28, alignItems: "flex-start" }}>
            {/* Avatar */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <img
                src={profile.photo}
                alt={profile.name}
                style={{
                  width: 104, height: 104, borderRadius: 24, objectFit: "cover",
                  border: "4px solid #fff", boxShadow: "0 4px 20px rgba(0,0,0,.15)",
                }}
              />
              {profile.verified && (
                <div style={{
                  position: "absolute", bottom: -6, right: -6, width: 28, height: 28,
                  borderRadius: 8, background: "var(--forest)", display: "flex",
                  alignItems: "center", justifyContent: "center", border: "2px solid #fff",
                  fontSize: 12, color: "#fff", fontWeight: 700,
                }}>✓</div>
              )}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                <h1 style={{ fontFamily: "var(--font-d)", fontSize: 28, fontWeight: 800, color: "var(--ink)", letterSpacing: "-1px" }}>
                  {profile.name}
                </h1>
                <span style={{ fontSize: 22 }}>{profile.flag}</span>
                {profile.verified && (
                  <span style={{
                    padding: "3px 10px", borderRadius: 100,
                    background: "var(--forest-soft)", color: "var(--forest)",
                    fontFamily: "var(--font-b)", fontSize: 11, fontWeight: 700,
                    textTransform: "uppercase", letterSpacing: 1,
                  }}>✓ Verified</span>
                )}
              </div>
              <div style={{ fontFamily: "var(--font-b)", fontSize: 15, color: "var(--ink-muted)", marginBottom: 20 }}>
                {profile.role} · {profile.nationality}
              </div>

              {/* Stats row */}
              <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
                {[
                  { label: "Rating", value: `★ ${profile.rating}`, color: "var(--gold)" },
                  { label: "Reviews", value: profile.reviewCount, color: "var(--ink)" },
                  { label: "Swaps done", value: profile.swapsCompleted, color: "var(--coral)" },
                  { label: "Years exp", value: `${profile.yearsExp}+`, color: "var(--ocean)" },
                ].map((s, i) => (
                  <div key={i}>
                    <div style={{ fontFamily: "var(--font-d)", fontSize: 22, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontFamily: "var(--font-b)", fontSize: 11, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: 1, marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="prof-actions" style={{ display: "flex", gap: 10, flexShrink: 0, alignItems: "flex-start" }}>
              <button
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "11px 20px", borderRadius: 100,
                  border: "1.5px solid rgba(0,0,0,.1)", background: "#fff",
                  fontFamily: "var(--font-b)", fontSize: 14, fontWeight: 600, color: "var(--ink-soft)",
                  cursor: "pointer", transition: "all .2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--ink)"; e.currentTarget.style.color = "var(--ink)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(0,0,0,.1)"; e.currentTarget.style.color = "var(--ink-soft)"; }}
              >
                <MessageCircle size={15} /> Message
              </button>
              <button
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "11px 22px", borderRadius: 100,
                  border: "none", background: "var(--coral)", color: "#fff",
                  fontFamily: "var(--font-b)", fontSize: 14, fontWeight: 600,
                  cursor: "pointer", transition: "all .2s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--coral-deep)"}
                onMouseLeave={e => e.currentTarget.style.background = "var(--coral)"}
              >
                <RefreshCw size={15} /> Propose Swap
              </button>
            </div>
          </div>
        </motion.div>

        {/* TABS */}
        <div style={{ display: "flex", gap: 4, margin: "24px 0 20px", background: "#fff", padding: 4, borderRadius: 100, width: "fit-content", boxShadow: "0 2px 12px rgba(0,0,0,.05)" }}>
          {[
            { id: "overview", label: "Overview" },
            { id: "history", label: "Work History" },
            { id: "reviews", label: "Reviews" },
          ].map(t => (
            <button key={t.id} className={`ptab ${tab === t.id ? "on" : ""}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* TAB CONTENT */}
        <AnimatePresence mode="wait">
          {tab === "overview" && (
            <motion.div key="overview"
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
            >
              <div className="content-grid">
                {/* Swap card */}
                <div style={{
                  background: "linear-gradient(145deg, #E8654A, #D4503A)",
                  borderRadius: 24, padding: "32px 28px", color: "#fff",
                  position: "relative", overflow: "hidden",
                }}>
                  <div style={{ position: "absolute", top: -30, right: -30, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,.07)" }} />
                  <div style={{ position: "absolute", bottom: -20, left: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,.05)" }} />
                  <div style={{ position: "relative", zIndex: 1 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2.5, opacity: .7, marginBottom: 20 }}>
                      🎒 Looking to swap
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                      <div>
                        <div style={{ fontSize: 10, opacity: .6, marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>From</div>
                        <div style={{ fontFamily: "var(--font-d)", fontSize: 22, fontWeight: 700, lineHeight: 1.1 }}>📍 {profile.currentCity}</div>
                        <div style={{ fontSize: 11, opacity: .6, marginTop: 2 }}>{profile.currentState}, Australia</div>
                      </div>
                      <div style={{ fontSize: 22, opacity: .7, fontWeight: 300 }}>→</div>
                      <div>
                        <div style={{ fontSize: 10, opacity: .6, marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>To</div>
                        <div style={{ fontFamily: "var(--font-d)", fontSize: 22, fontWeight: 700, lineHeight: 1.1 }}>🎯 {profile.targetCity}</div>
                        <div style={{ fontSize: 11, opacity: .6, marginTop: 2 }}>{profile.targetState}, Australia</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {[
                        { icon: "📅", label: "Available from", value: profile.availableFrom },
                        { icon: "🛂", label: "Visa", value: profile.visaType },
                      ].map((item, i) => (
                        <div key={i} style={{
                          display: "flex", alignItems: "center", gap: 12,
                          background: "rgba(255,255,255,.13)", borderRadius: 14, padding: "11px 15px",
                        }}>
                          <span style={{ fontSize: 16 }}>{item.icon}</span>
                          <div>
                            <div style={{ fontSize: 10, opacity: .6, textTransform: "uppercase", letterSpacing: 1 }}>{item.label}</div>
                            <div style={{ fontSize: 13, fontWeight: 600, marginTop: 1 }}>{item.value}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* About + quick info */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div className="pcard" style={{ padding: "28px 32px" }}>
                    <div style={{ fontFamily: "var(--font-d)", fontSize: 19, fontWeight: 700, color: "var(--ink)", marginBottom: 12 }}>About</div>
                    <p style={{ fontFamily: "var(--font-b)", fontSize: 15, color: "var(--ink-soft)", lineHeight: 1.75 }}>{profile.bio}</p>
                  </div>
                  <div className="pcard" style={{ padding: "24px 32px" }}>
                    <div style={{ fontFamily: "var(--font-d)", fontSize: 19, fontWeight: 700, color: "var(--ink)", marginBottom: 18 }}>Quick info</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      {[
                        { icon: "🌏", label: "Languages", value: profile.languages.join(" · ") },
                        { icon: "📍", label: "Current location", value: `${profile.currentCity}, ${profile.currentState}` },
                        { icon: "💼", label: "Current role", value: `${profile.role} @ ${profile.currentPlace}` },
                        { icon: "🛂", label: "Visa type", value: profile.visaType },
                      ].map((item, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: 10, background: "var(--sand)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 17, flexShrink: 0,
                          }}>{item.icon}</div>
                          <div>
                            <div style={{ fontFamily: "var(--font-b)", fontSize: 11, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>{item.label}</div>
                            <div style={{ fontFamily: "var(--font-b)", fontSize: 14, fontWeight: 500, color: "var(--ink-soft)" }}>{item.value}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="pcard" style={{ padding: "28px 32px", marginBottom: 20 }}>
                <div style={{ fontFamily: "var(--font-d)", fontSize: 19, fontWeight: 700, color: "var(--ink)", marginBottom: 16 }}>Skills</div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {profile.skills.map((s, i) => (
                    <span key={i} className="skill-tag">{s}</span>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div className="pcard" style={{ padding: "28px 32px", marginBottom: 48 }}>
                <div style={{ fontFamily: "var(--font-d)", fontSize: 19, fontWeight: 700, color: "var(--ink)", marginBottom: 16 }}>Certifications</div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {profile.certs.map((c, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "12px 20px", borderRadius: 14, background: c.color,
                      fontFamily: "var(--font-b)", fontSize: 13, fontWeight: 600, color: "var(--ink-soft)",
                    }}>
                      <span style={{ fontSize: 18 }}>{c.icon}</span>
                      <span>{c.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {tab === "history" && (
            <motion.div key="history"
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 48 }}>
                {profile.workHistory.map((job, i) => (
                  <motion.div
                    key={i}
                    className="pcard"
                    style={{ overflow: "hidden" }}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.3 }}
                  >
                    <div style={{ height: 5, background: "linear-gradient(90deg, var(--coral), var(--gold))" }} />
                    <div style={{ padding: "28px 32px" }}>
                      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                        <div style={{
                          width: 56, height: 56, borderRadius: 16, background: job.coverColor,
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0,
                        }}>{job.emoji}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8, marginBottom: 6 }}>
                            <div>
                              <div style={{ fontFamily: "var(--font-d)", fontSize: 20, fontWeight: 700, color: "var(--ink)" }}>{job.role}</div>
                              <div style={{ fontFamily: "var(--font-b)", fontSize: 14, color: "var(--ink-muted)" }}>{job.place} · {job.city}</div>
                            </div>
                            <div style={{ textAlign: "right", flexShrink: 0 }}>
                              <div style={{ fontFamily: "var(--font-b)", fontSize: 12, color: "var(--ink-muted)", marginBottom: 4 }}>{job.period}</div>
                              <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
                                <span style={{ color: "var(--gold)", fontSize: 15 }}>★</span>
                                <span style={{ fontFamily: "var(--font-d)", fontSize: 20, fontWeight: 700, color: "var(--ink)" }}>{job.rating.toFixed(1)}</span>
                                <span style={{ fontFamily: "var(--font-b)", fontSize: 12, color: "var(--ink-muted)" }}>by {job.managerName}</span>
                              </div>
                            </div>
                          </div>
                          <div style={{
                            fontFamily: "var(--font-b)", fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.7,
                            background: "var(--sand)", borderRadius: 14, padding: "14px 18px", marginTop: 12,
                            borderLeft: "3px solid var(--coral)",
                          }}>
                            "{job.review}"
                            <div style={{ marginTop: 8, fontSize: 12, color: "var(--ink-muted)", fontStyle: "italic" }}>
                              — {job.managerName}, {job.managerRole}
                            </div>
                          </div>
                          <div style={{
                            display: "inline-flex", alignItems: "center", gap: 6, marginTop: 14,
                            padding: "6px 14px", borderRadius: 100,
                            background: "rgba(232,101,74,.08)", border: "1px solid rgba(232,101,74,.15)",
                            fontFamily: "var(--font-b)", fontSize: 12, color: "var(--coral)",
                          }}>
                            🔄 Swap with: {job.swapPartner}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {tab === "reviews" && (
            <motion.div key="reviews"
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
            >
              {/* Rating summary */}
              <div className="pcard" style={{ padding: "32px 36px", marginBottom: 16, display: "flex", alignItems: "center", gap: 48, flexWrap: "wrap" }}>
                <div style={{ textAlign: "center", flexShrink: 0 }}>
                  <div style={{ fontFamily: "var(--font-d)", fontSize: 68, fontWeight: 800, color: "var(--ink)", lineHeight: 1 }}>{avgRating}</div>
                  <div style={{ color: "var(--gold)", fontSize: 20, letterSpacing: 5, marginTop: 8 }}>★★★★★</div>
                  <div style={{ fontFamily: "var(--font-b)", fontSize: 13, color: "var(--ink-muted)", marginTop: 8 }}>{profile.reviewCount} manager reviews</div>
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  {[[5, 9], [4, 3], [3, 0]].map(([star, count]) => (
                    <div key={star} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <span style={{ fontFamily: "var(--font-b)", fontSize: 13, color: "var(--ink-muted)", width: 14 }}>{star}</span>
                      <span style={{ color: "var(--gold)", fontSize: 12 }}>★</span>
                      <div style={{ flex: 1, height: 8, borderRadius: 100, background: "rgba(0,0,0,.06)", overflow: "hidden" }}>
                        <div style={{
                          width: `${Math.round(count / profile.reviewCount * 100)}%`,
                          height: "100%", borderRadius: 100, background: "var(--gold)",
                          transition: "width .6s ease",
                        }} />
                      </div>
                      <span style={{ fontFamily: "var(--font-b)", fontSize: 12, color: "var(--ink-muted)", width: 18 }}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Individual reviews */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 48 }}>
                {profile.workHistory.map((job, i) => (
                  <motion.div
                    key={i}
                    className="pcard"
                    style={{ padding: "28px 32px" }}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: 14, background: job.coverColor,
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0,
                      }}>{job.emoji}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "var(--font-b)", fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>
                          {job.managerName} · {job.managerRole}
                        </div>
                        <div style={{ fontFamily: "var(--font-b)", fontSize: 12, color: "var(--ink-muted)" }}>
                          {job.place}, {job.city} · {job.period}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                        <span style={{ color: "var(--gold)", fontSize: 16 }}>★</span>
                        <span style={{ fontFamily: "var(--font-d)", fontSize: 22, fontWeight: 700, color: "var(--ink)" }}>
                          {job.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <p style={{ fontFamily: "var(--font-b)", fontSize: 15, color: "var(--ink-soft)", lineHeight: 1.75 }}>
                      "{job.review}"
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
