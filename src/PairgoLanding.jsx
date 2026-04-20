import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock } from "lucide-react";

function LoginModal({ onClose }) {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Welcome");
    onClose();
  };

  const inputClass =
    "w-full rounded-xl pl-11 pr-4 py-3.5 text-white text-sm outline-none transition-all duration-200 placeholder-white/20 border border-white/8"
    + " " + "focus:border-[var(--coral)] focus:ring-2 focus:ring-[var(--coral)]/20";

  const inputStyle = {
    background: "rgba(0,0,0,0.45)",
    fontFamily: "var(--font-b)",
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-sm border overflow-hidden"
          style={{
            background: "rgba(255,255,255,.08)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,.1)",
            borderRadius: 20,
          }}
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Coral accent bar */}
          <div style={{ height: 3, background: "linear-gradient(90deg, var(--coral), var(--gold))" }} />

          <div className="p-8">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/25 hover:text-white/70 transition-colors"
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div className="mb-7">
            {/* Logo */}
            <div
              className="mb-4"
              style={{
                fontFamily: "var(--font-d)",
                fontSize: 26,
                fontWeight: 800,
                color: "#fff",
                letterSpacing: "-1px",
              }}
            >
              pair<span style={{ color: "var(--coral)" }}>go</span>
            </div>
            <h2
              className="text-white font-bold leading-tight"
              style={{ fontFamily: "var(--font-d)", fontSize: 22, letterSpacing: "-0.4px" }}
            >
              Welcome back
            </h2>
            <p
              className="mt-1 text-sm"
              style={{ color: "rgba(255,255,255,0.38)", fontFamily: "var(--font-b)" }}
            >
              Sign in to your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {/* Email */}
            <div className="relative">
              <Mail
                size={15}
                className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: "rgba(255,255,255,0.28)" }}
              />
              <input
                type="email"
                placeholder="Email address"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                className={inputClass}
                style={inputStyle}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock
                size={15}
                className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: "rgba(255,255,255,0.28)" }}
              />
              <input
                type="password"
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                className={inputClass}
                style={inputStyle}
              />
            </div>

            {/* Forgot password */}
            <div className="text-right -mt-1">
              <a
                href="#"
                className="text-xs transition-colors duration-200"
                style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-b)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--coral)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
              >
                Forgot your password?
              </a>
            </div>

            {/* Submit — matches nav-cta */}
            <button
              type="submit"
              className="w-full mt-1 text-white font-semibold transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
              style={{
                background: "var(--coral)",
                padding: "13px 26px",
                borderRadius: "100px",
                fontFamily: "var(--font-b)",
                fontSize: "15px",
                fontWeight: 600,
                letterSpacing: 0,
                border: "none",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--coral-deep)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--coral)")}
            >
              Log In
            </button>
          </form>

          {/* Footer */}
          <p
            className="text-center text-xs mt-6"
            style={{ color: "rgba(255,255,255,0.28)", fontFamily: "var(--font-b)" }}
          >
            Don't have an account?{" "}
            <a
              href="#cta"
              onClick={onClose}
              className="transition-colors duration-200"
              style={{ color: "rgba(255,255,255,0.28)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--coral)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.28)")}
            >
              Create an account
            </a>
          </p>
          </div>{/* end p-8 */}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Unsplash photos for different work categories
const WORK_PHOTOS = [
  { url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80", label: "Restaurant", role: "Kitchen & Hospitality" },
  { url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80", label: "Coffee Shop", role: "Barista" },
  { url: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80", label: "Agriculture", role: "Farm Hand" },
  { url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80", label: "Hotel", role: "Housekeeping" },
  { url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80", label: "Fine Dining", role: "Chef Assistant" },
  { url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80", label: "Bar & Lounge", role: "Bartender" },
  { url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80", label: "Retail", role: "Shop Assistant" },
  { url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80", label: "Surf School", role: "Instructor" },
];

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=1600&q=80",
  "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1600&q=80",
  "https://images.unsplash.com/photo-1529108190281-9a4f620bc2d8?w=1600&q=80",
];

const CITY_IMAGES = [
  { url: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600&q=80", city: "Sydney", jobs: "340+ swaps" },
  { url: "https://images.unsplash.com/photo-1545044846-351ba102b6d5?w=600&q=80", city: "Melbourne", jobs: "280+ swaps" },
  { url: "https://images.unsplash.com/photo-1562602833-0f4ab2fc46e5?w=600&q=80", city: "Cairns", jobs: "150+ swaps" },
  { url: "https://images.unsplash.com/photo-1494949360228-4e9bde560065?w=600&q=80", city: "Byron Bay", jobs: "120+ swaps" },
  { url: "https://images.unsplash.com/photo-1570737209810-87a8e7245f88?w=600&q=80", city: "Gold Coast", jobs: "190+ swaps" },
  { url: "https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=600&q=80", city: "Perth", jobs: "95+ swaps" },
];

export default function PairgoLanding() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [heroIdx, setHeroIdx] = useState(0);
  const [role, setRole] = useState("worker");
  const [carouselX, setCarouselX] = useState(0);
  const [visible, setVisible] = useState(new Set());
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const observerRefs = useRef({});
  const carouselRef = useRef(null);
  const animFrame = useRef(null);

  // Hero slideshow
  useEffect(() => {
    const interval = setInterval(() => setHeroIdx((p) => (p + 1) % HERO_IMAGES.length), 5000);
    return () => clearInterval(interval);
  }, []);

  // Intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setVisible((prev) => new Set([...prev, e.target.dataset.section]));
        });
      },
      { threshold: 0.1 }
    );
    Object.values(observerRefs.current).forEach((el) => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  // Auto-scroll carousel
  useEffect(() => {
    let x = 0;
    const speed = 0.4;
    const totalWidth = WORK_PHOTOS.length * 320;
    const tick = () => {
      x = (x + speed) % totalWidth;
      setCarouselX(x);
      animFrame.current = requestAnimationFrame(tick);
    };
    animFrame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrame.current);
  }, []);

  const isV = (id) => visible.has(id);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  // Parallax mouse for hero
  const handleMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width - 0.5,
      y: (e.clientY - rect.top) / rect.height - 0.5,
    });
  }, []);

  return (
    <div style={{ background: "#FAFAF7", minHeight: "100vh", overflowX: "hidden" }}>
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

        .fu{opacity:0;transform:translateY(44px);transition:opacity .85s cubic-bezier(.16,1,.3,1),transform .85s cubic-bezier(.16,1,.3,1);}
        .fu.v{opacity:1;transform:translateY(0);}
        .d1{transition-delay:.1s}.d2{transition-delay:.2s}.d3{transition-delay:.3s}.d4{transition-delay:.4s}.d5{transition-delay:.5s}.d6{transition-delay:.6s}

        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
        @keyframes pulse{0%{transform:scale(1);opacity:.4}100%{transform:scale(2);opacity:0}}
        @keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes hero-zoom{0%{transform:scale(1)}100%{transform:scale(1.08)}}
        @keyframes slide-in-right{0%{opacity:0;transform:translateX(60px)}100%{opacity:1;transform:translateX(0)}}
        @keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes glow-pulse{0%,100%{box-shadow:0 0 0 0 rgba(232,101,74,0.3)}50%{box-shadow:0 0 0 16px rgba(232,101,74,0)}}

        /* NAV */
        .nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:16px 40px;display:flex;align-items:center;justify-content:space-between;backdrop-filter:blur(24px);background:rgba(26,26,24,.7);border-bottom:1px solid rgba(255,255,255,.05);transition:all .3s;}
        .nav-logo{font-family:var(--font-d);font-size:26px;font-weight:800;color:#fff;letter-spacing:-1px;}
        .nav-logo span{color:var(--coral);}
        .nav-links{display:flex;gap:28px;align-items:center;}
        .nav-links a{color:rgba(255,255,255,.55);text-decoration:none;font-family:var(--font-b);font-size:14px;font-weight:500;transition:color .2s;letter-spacing:-.2px;}
        .nav-links a:hover{color:#fff;}
        .nav-cta{background:var(--coral)!important;color:#fff!important;padding:11px 26px;border-radius:100px;font-weight:600!important;transition:all .25s!important;letter-spacing:0!important;}
        .nav-cta:hover{background:var(--coral-deep)!important;transform:scale(1.04);}

        /* HERO */
        .hero{position:relative;min-height:100vh;display:flex;align-items:center;overflow:hidden;background:#111;}
        .hero-bg{position:absolute;inset:0;transition:opacity 1.2s ease;}
        .hero-bg img{width:100%;height:100%;object-fit:cover;animation:hero-zoom 20s ease-in-out infinite alternate;}
        .hero-overlay{position:absolute;inset:0;background:linear-gradient(to right,rgba(10,10,8,.88) 0%,rgba(10,10,8,.7) 45%,rgba(10,10,8,.3) 100%);z-index:1;}
        .hero-grain{position:absolute;inset:0;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.07'/%3E%3C/svg%3E");z-index:2;pointer-events:none;}
        .hero-content{position:relative;z-index:3;max-width:1280px;margin:0 auto;padding:140px 48px 80px;display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;}
        .hero-left{max-width:580px;}

        .hero-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(232,101,74,.1);border:1px solid rgba(232,101,74,.2);padding:8px 18px;border-radius:100px;font-family:var(--font-b);font-size:12px;font-weight:700;color:var(--coral);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:28px;}
        .bdot{width:7px;height:7px;background:var(--coral);border-radius:50%;position:relative;}
        .bdot::after{content:'';position:absolute;inset:-3px;border-radius:50%;border:2px solid var(--coral);animation:pulse 2s ease-out infinite;}

        .hero-title{font-family:var(--font-d);font-size:clamp(42px,5.8vw,72px);font-weight:800;color:#fff;line-height:1.04;letter-spacing:-3px;margin-bottom:24px;}
        .hero-title em{font-style:italic;color:var(--coral);font-weight:600;}
        .hero-sub{font-family:var(--font-b);font-size:19px;color:rgba(255,255,255,.5);line-height:1.65;margin-bottom:40px;max-width:460px;}

        .hero-form{display:flex;gap:0;max-width:440px;}
        .hero-input{flex:1;padding:17px 22px;border:2px solid rgba(255,255,255,.08);border-right:none;border-radius:14px 0 0 14px;background:rgba(255,255,255,.05);color:#fff;font-family:var(--font-b);font-size:15px;outline:none;transition:border .2s;}
        .hero-input::placeholder{color:rgba(255,255,255,.25);}
        .hero-input:focus{border-color:var(--coral);}
        .hero-btn{padding:17px 30px;background:var(--coral);color:#fff;border:none;border-radius:0 14px 14px 0;font-family:var(--font-b);font-size:15px;font-weight:700;cursor:pointer;transition:all .2s;white-space:nowrap;}
        .hero-btn:hover{background:var(--coral-deep);}

        .hero-proof{display:flex;align-items:center;gap:16px;margin-top:36px;}
        .hero-avatars{display:flex;}
        .hero-av{width:38px;height:38px;border-radius:50%;border:3px solid rgba(10,10,8,.9);margin-left:-10px;object-fit:cover;background:var(--coral-glow);display:flex;align-items:center;justify-content:center;font-size:15px;}
        .hero-av:first-child{margin-left:0;}
        .hero-proof-text{font-family:var(--font-b);font-size:13px;color:rgba(255,255,255,.4);}
        .hero-proof-text strong{color:rgba(255,255,255,.8);}

        /* Hero right - stacked cards */
        .hero-right{position:relative;height:480px;perspective:800px;}
        .hcard{position:absolute;background:rgba(255,255,255,.08);backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,.1);border-radius:20px;overflow:hidden;transition:all .6s cubic-bezier(.16,1,.3,1);}
        .hcard-img{width:100%;height:140px;object-fit:cover;display:block;}
        .hcard-body{padding:20px;}
        .hcard-row{display:flex;align-items:center;gap:10px;margin-bottom:12px;}
        .hcard-av{width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:18px;}
        .hcard-name{font-family:var(--font-b);font-size:15px;font-weight:600;color:#fff;}
        .hcard-meta{font-family:var(--font-b);font-size:11px;color:rgba(255,255,255,.4);}
        .hcard-route{display:flex;align-items:center;gap:8px;font-family:var(--font-b);font-size:12px;color:rgba(255,255,255,.5);margin-bottom:10px;}
        .hcard-arrow{color:var(--coral);font-weight:700;font-size:16px;}
        .hcard-skills{display:flex;gap:5px;flex-wrap:wrap;}
        .hcard-skill{padding:4px 10px;border-radius:100px;font-family:var(--font-b);font-size:10px;font-weight:600;background:rgba(232,101,74,.12);color:var(--coral);}
        .hcard-badge{position:absolute;top:12px;right:12px;padding:5px 12px;border-radius:100px;font-family:var(--font-b);font-size:10px;font-weight:700;background:rgba(27,122,90,.85);color:#fff;backdrop-filter:blur(8px);}

        /* TICKER */
        .ticker-wrap{overflow:hidden;background:var(--ink);padding:18px 0;border-top:1px solid rgba(255,255,255,.05);}
        .ticker{display:flex;animation:ticker 30s linear infinite;width:max-content;}
        .ticker-item{display:flex;align-items:center;gap:8px;padding:0 32px;white-space:nowrap;font-family:var(--font-b);font-size:14px;font-weight:500;color:rgba(255,255,255,.35);}
        .ticker-dot{width:5px;height:5px;border-radius:50%;background:var(--coral);opacity:.5;}

        /* CAROUSEL */
        .carousel-section{padding:100px 0 80px;overflow:hidden;}
        .carousel-header{max-width:1280px;margin:0 auto;padding:0 48px 48px;}
        .carousel-track{display:flex;gap:20px;width:max-content;will-change:transform;}
        .carousel-card{width:300px;border-radius:20px;overflow:hidden;position:relative;flex-shrink:0;cursor:pointer;transition:transform .4s;}
        .carousel-card:hover{transform:scale(1.03);}
        .carousel-card img{width:100%;height:220px;object-fit:cover;display:block;transition:transform .6s;}
        .carousel-card:hover img{transform:scale(1.08);}
        .carousel-card-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.7) 0%,transparent 50%);display:flex;flex-direction:column;justify-content:flex-end;padding:24px;}
        .carousel-label{font-family:var(--font-d);font-size:20px;font-weight:700;color:#fff;}
        .carousel-role{font-family:var(--font-b);font-size:12px;color:rgba(255,255,255,.6);margin-top:4px;}

        /* HOW */
        .how-section{background:#fff;position:relative;}
        .how-inner{max-width:1280px;margin:0 auto;padding:100px 48px;}
        .steps{display:grid;grid-template-columns:repeat(4,1fr);gap:32px;margin-top:64px;}
        .step{position:relative;padding:36px 28px;border-radius:24px;background:var(--sand);border:1px solid rgba(0,0,0,.04);transition:all .4s;}
        .step:hover{transform:translateY(-6px);box-shadow:0 24px 64px rgba(0,0,0,.06);border-color:var(--coral);background:#fff;}
        .step-num{font-family:var(--font-d);font-size:56px;font-weight:800;background:linear-gradient(135deg,var(--coral),var(--gold));-webkit-background-clip:text;-webkit-text-fill-color:transparent;line-height:1;margin-bottom:12px;}
        .step-icon{width:52px;height:52px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:20px;}
        .step-title{font-family:var(--font-d);font-size:22px;font-weight:700;color:var(--ink);margin-bottom:10px;}
        .step-desc{font-family:var(--font-b);font-size:14px;color:var(--ink-muted);line-height:1.6;}
        .step-line{position:absolute;top:60px;right:-20px;width:40px;height:2px;background:linear-gradient(90deg,var(--coral),transparent);opacity:.3;}

        /* CITIES */
        .cities-section{padding:100px 0;overflow:hidden;}
        .cities-header{max-width:1280px;margin:0 auto;padding:0 48px 56px;}
        .cities-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:16px;max-width:1280px;margin:0 auto;padding:0 48px;}
        .city-card{border-radius:20px;overflow:hidden;position:relative;aspect-ratio:3/4;cursor:pointer;transition:transform .4s;}
        .city-card:hover{transform:scale(1.03);}
        .city-card img{width:100%;height:100%;object-fit:cover;transition:transform .6s;}
        .city-card:hover img{transform:scale(1.1);}
        .city-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.75) 0%,transparent 60%);display:flex;flex-direction:column;justify-content:flex-end;padding:20px;}
        .city-name{font-family:var(--font-d);font-size:22px;font-weight:700;color:#fff;}
        .city-jobs{font-family:var(--font-b);font-size:12px;color:rgba(255,255,255,.6);margin-top:2px;}

        /* BENEFITS */
        .ben-section{background:var(--ink);position:relative;overflow:hidden;}
        .ben-section::before{content:'';position:absolute;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,rgba(232,101,74,.08),transparent 70%);top:-200px;right:-200px;pointer-events:none;}
        .ben-inner{max-width:1280px;margin:0 auto;padding:100px 48px;position:relative;z-index:1;}
        .ben-toggle{display:flex;gap:4px;background:rgba(255,255,255,.05);border-radius:100px;padding:4px;width:fit-content;margin-bottom:56px;}
        .tgl{padding:13px 30px;border-radius:100px;border:none;font-family:var(--font-b);font-size:14px;font-weight:600;cursor:pointer;transition:all .3s;background:transparent;color:rgba(255,255,255,.35);}
        .tgl.on{background:var(--coral);color:#fff;}
        .ben-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
        .ben-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:24px;padding:36px;transition:all .3s;position:relative;overflow:hidden;}
        .ben-card:hover{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12);transform:translateY(-4px);}
        .ben-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--coral),var(--gold));opacity:0;transition:opacity .3s;}
        .ben-card:hover::before{opacity:1;}
        .ben-icon{width:52px;height:52px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:24px;}
        .ben-title{font-family:var(--font-d);font-size:22px;font-weight:700;color:#fff;margin-bottom:10px;}
        .ben-desc{font-family:var(--font-b);font-size:14px;color:rgba(255,255,255,.4);line-height:1.65;}

        /* PROOF */
        .proof-section{padding:100px 48px;}
        .proof-inner{max-width:1280px;margin:0 auto;}
        .proof-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;margin-top:56px;}
        .proof-card{background:#fff;border-radius:24px;padding:36px;border:1px solid rgba(0,0,0,.04);transition:all .4s;position:relative;}
        .proof-card:hover{transform:translateY(-4px);box-shadow:0 20px 60px rgba(0,0,0,.05);}
        .proof-card-img{width:100%;height:180px;object-fit:cover;border-radius:16px;margin-bottom:20px;}
        .proof-stars{color:var(--gold);font-size:15px;letter-spacing:2px;margin-bottom:14px;}
        .proof-text{font-family:var(--font-b);font-size:15px;color:var(--ink-soft);line-height:1.7;margin-bottom:20px;}
        .proof-author{display:flex;align-items:center;gap:12px;}
        .proof-av{width:44px;height:44px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:20px;}
        .proof-name{font-family:var(--font-b);font-size:14px;font-weight:600;color:var(--ink);}
        .proof-role{font-family:var(--font-b);font-size:12px;color:var(--ink-muted);}

        /* CTA */
        .cta-section{position:relative;overflow:hidden;}
        .cta-bg{position:absolute;inset:0;}
        .cta-bg img{width:100%;height:100%;object-fit:cover;}
        .cta-bg-overlay{position:absolute;inset:0;background:linear-gradient(135deg,rgba(232,101,74,.92),rgba(212,80,58,.95));}
        .cta-inner{position:relative;z-index:1;max-width:700px;margin:0 auto;padding:120px 48px;text-align:center;}
        .cta-title{font-family:var(--font-d);font-size:clamp(36px,5vw,56px);font-weight:800;color:#fff;line-height:1.08;letter-spacing:-2px;margin-bottom:20px;}
        .cta-sub{font-family:var(--font-b);font-size:18px;color:rgba(255,255,255,.7);margin-bottom:44px;line-height:1.6;}
        .cta-form{display:flex;gap:0;max-width:460px;margin:0 auto 20px;}
        .cta-in{flex:1;padding:18px 22px;border:2px solid rgba(255,255,255,.2);border-right:none;border-radius:14px 0 0 14px;background:rgba(255,255,255,.1);color:#fff;font-family:var(--font-b);font-size:15px;outline:none;}
        .cta-in::placeholder{color:rgba(255,255,255,.45);}
        .cta-in:focus{border-color:#fff;}
        .cta-bt{padding:18px 32px;background:var(--ink);color:#fff;border:none;border-radius:0 14px 14px 0;font-family:var(--font-b);font-size:15px;font-weight:700;cursor:pointer;transition:all .2s;white-space:nowrap;}
        .cta-bt:hover{background:#333;}
        .cta-note{font-family:var(--font-b);font-size:13px;color:rgba(255,255,255,.45);}
        .success-box{background:rgba(255,255,255,.15);border-radius:20px;padding:28px;max-width:460px;margin:0 auto;}
        .success-box h3{font-family:var(--font-d);font-size:24px;color:#fff;margin-bottom:8px;}
        .success-box p{font-family:var(--font-b);font-size:14px;color:rgba(255,255,255,.65);}

        /* FOOTER */
        .footer{background:var(--ink);padding:48px 48px;border-top:1px solid rgba(255,255,255,.05);}
        .footer-inner{max-width:1280px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;}
        .footer-logo{font-family:var(--font-d);font-size:22px;font-weight:800;color:#fff;}
        .footer-logo span{color:var(--coral);}
        .footer-links{display:flex;gap:24px;}
        .footer-links a{font-family:var(--font-b);font-size:13px;color:rgba(255,255,255,.3);text-decoration:none;transition:color .2s;}
        .footer-links a:hover{color:rgba(255,255,255,.6);}
        .footer-copy{font-family:var(--font-b);font-size:12px;color:rgba(255,255,255,.2);}

        .slabel{font-family:var(--font-b);font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:var(--coral);margin-bottom:12px;}
        .stitle{font-family:var(--font-d);font-size:clamp(32px,4.5vw,52px);font-weight:800;color:var(--ink);line-height:1.08;letter-spacing:-2px;margin-bottom:16px;}
        .ssub{font-family:var(--font-b);font-size:17px;color:var(--ink-muted);line-height:1.65;max-width:520px;}

        @media(max-width:1024px){
          .hero-content{grid-template-columns:1fr;padding:120px 24px 60px;}
          .hero-right{display:none;}
          .steps{grid-template-columns:repeat(2,1fr);}
          .step-line{display:none;}
          .cities-grid{grid-template-columns:repeat(3,1fr);}
          .ben-grid{grid-template-columns:1fr 1fr;}
          .proof-grid{grid-template-columns:1fr;}
        }
        @media(max-width:640px){
          .steps{grid-template-columns:1fr;}
          .cities-grid{grid-template-columns:repeat(2,1fr);padding:0 16px;}
          .ben-grid{grid-template-columns:1fr;}
          .nav{padding:12px 16px;}
          .nav-links a:not(.nav-cta){display:none;}
          .hero-form,.cta-form{flex-direction:column;}
          .hero-input,.cta-in{border-radius:14px;border-right:2px solid rgba(255,255,255,.08);}
          .hero-btn,.cta-bt{border-radius:14px;padding:16px;}
          .carousel-header,.how-inner,.ben-inner,.proof-section,.cities-header,.cta-inner,.footer{padding-left:20px;padding-right:20px;}
        }
      `}</style>

      {/* NAV */}
      <nav className="nav">
        <div className="nav-logo">pair<span>go</span></div>
        <div className="nav-links">
          <a href="#how">How it works</a>
          <a href="#cities">Cities</a>
          <a href="#benefits">Benefits</a>
          <button
            onClick={() => setLoginOpen(true)}
            className="flex items-center gap-1.5 text-white/55 hover:text-white transition-colors text-sm font-medium bg-transparent border-none cursor-pointer"
            style={{ fontFamily: "var(--font-b)", letterSpacing: "-.2px" }}
          >
            Log In
          </button>
          <a href="#cta" className="nav-cta">Early Access</a>
        </div>
      </nav>

      {/* LOGIN MODAL */}
      {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} />}

      {/* HERO */}
      <section className="hero" onMouseMove={handleMouseMove}
        ref={(el) => { observerRefs.current["hero"] = el; }} data-section="hero">
        {HERO_IMAGES.map((src, i) => (
          <div key={i} className="hero-bg" style={{ opacity: heroIdx === i ? 1 : 0, zIndex: 0 }}>
            <img src={src} alt="" />
          </div>
        ))}
        <div className="hero-overlay" />
        <div className="hero-grain" />

        <div className="hero-content">
          <div className="hero-left">
            <div className={`fu ${isV("hero") ? "v" : ""}`}>
              <div className="hero-badge"><div className="bdot" />Launching in Australia — 2026</div>
            </div>
            <h1 className={`hero-title fu d1 ${isV("hero") ? "v" : ""}`}>
              Swap your job.<br /><em>Keep moving.</em>
            </h1>
            <p className={`hero-sub fu d2 ${isV("hero") ? "v" : ""}`}>
              Find someone in another city doing your same role. Swap positions. Travel with a guaranteed job from day one.
            </p>
            {!submitted ? (
              <form className={`hero-form fu d3 ${isV("hero") ? "v" : ""}`} onSubmit={handleSubmit}>
                <input className="hero-input" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <button className="hero-btn" type="submit">Get Early Access</button>
              </form>
            ) : (
              <div className={`fu d3 ${isV("hero") ? "v" : ""}`} style={{
                background: "rgba(232,101,74,.12)",
                border: "1px solid rgba(232,101,74,.25)",
                borderRadius: 14,
                padding: "18px 24px",
                maxWidth: 440,
                fontFamily: "var(--font-b)",
              }}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>🎉 You're on the list!</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,.55)" }}>We'll notify you as soon as Pairgo launches.</div>
              </div>
            )}
            <div className={`hero-proof fu d4 ${isV("hero") ? "v" : ""}`}>
              <div className="hero-avatars">
                {["👩‍🍳","👨‍🌾","☕","🏄","👨‍💼"].map((e,i) => (
                  <div key={i} className="hero-av" style={{ background: ["#FFE8E2","#ECFDF5","#FFF8E1","#EFF6FF","#F3E8FF"][i] }}>{e}</div>
                ))}
              </div>
              <div className="hero-proof-text"><strong>2,400+</strong> workers already on the waitlist</div>
            </div>
          </div>

          {/* Hero cards */}
          <div className="hero-right" style={{ transform: `rotateY(${mousePos.x * 5}deg) rotateX(${-mousePos.y * 5}deg)` }}>
            {[
              { top: 0, left: 20, w: 280, z: 3, img: WORK_PHOTOS[0].url, name: "Sarah T.", meta: "Kitchen Hand • ★4.9", from: "Cairns", to: "Melbourne", skills: ["Kitchen","Barista","Food Prep"], badge: "✓ Verified", delay: ".1s" },
              { top: 60, left: 140, w: 260, z: 2, img: WORK_PHOTOS[1].url, name: "Juan M.", meta: "Barista • ★4.8", from: "Melbourne", to: "Byron Bay", skills: ["Barista","Latte Art"], badge: "Top Rated", delay: ".3s" },
              { top: 140, left: 50, w: 240, z: 1, img: WORK_PHOTOS[3].url, name: "Lisa K.", meta: "Housekeeper • ★4.7", from: "Sydney", to: "Gold Coast", skills: ["Housekeeping","Front Desk"], badge: null, delay: ".5s" },
            ].map((c, i) => (
              <div key={i} className={`hcard fu d${i + 2} ${isV("hero") ? "v" : ""}`}
                style={{ top: c.top, left: c.left, width: c.w, zIndex: c.z }}>
                <img className="hcard-img" src={c.img} alt="" />
                {c.badge && <div className="hcard-badge">{c.badge}</div>}
                <div className="hcard-body">
                  <div className="hcard-row">
                    <div className="hcard-av" style={{ background: "rgba(232,101,74,.12)" }}>
                      {["👩‍🍳","☕","🏨"][i]}
                    </div>
                    <div>
                      <div className="hcard-name">{c.name}</div>
                      <div className="hcard-meta">{c.meta}</div>
                    </div>
                  </div>
                  <div className="hcard-route">
                    📍 {c.from} <span className="hcard-arrow">→</span> {c.to}
                  </div>
                  <div className="hcard-skills">
                    {c.skills.map((s, j) => <span key={j} className="hcard-skill">{s}</span>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div className="ticker-wrap">
        <div className="ticker">
          {[...Array(2)].map((_, rep) => (
            <div key={rep} style={{ display: "flex" }}>
              {["Hospitality","Barista","Farm Work","Housekeeping","Kitchen Hand","Retail","Bar & Lounge","Surf Instructor","Tour Guide","Fruit Picking","Dishwasher","Front Desk","Chef Assistant","Cleaner","Waiter"].map((t, i) => (
                <span key={i} className="ticker-item"><span className="ticker-dot" />{t}</span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* CAROUSEL — Work Categories */}
      <section className="carousel-section"
        ref={(el) => { observerRefs.current["carousel"] = el; }} data-section="carousel">
        <div className="carousel-header">
          <div className={`slabel fu ${isV("carousel") ? "v" : ""}`}>Every industry</div>
          <div className={`stitle fu d1 ${isV("carousel") ? "v" : ""}`}>Swap across any role</div>
          <div className={`ssub fu d2 ${isV("carousel") ? "v" : ""}`}>
            From coffee shops to cattle farms. Pairgo works for any job where one skilled person can step into another's shoes.
          </div>
        </div>
        <div style={{ overflow: "hidden" }}>
          <div className="carousel-track" style={{ transform: `translateX(-${carouselX}px)` }}>
            {[...WORK_PHOTOS, ...WORK_PHOTOS].map((p, i) => (
              <div key={i} className="carousel-card">
                <img src={p.url} alt={p.label} />
                <div className="carousel-card-overlay">
                  <div className="carousel-label">{p.label}</div>
                  <div className="carousel-role">{p.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="how-section"
        ref={(el) => { observerRefs.current["how"] = el; }} data-section="how">
        <div className="how-inner">
          <div className={`fu ${isV("how") ? "v" : ""}`}>
            <div className="slabel">How it works</div>
            <div className="stitle">Four steps to your<br />next adventure</div>
            <div className="ssub">No interviews, no uncertainty. Just a verified swap with someone ready to go.</div>
          </div>
          <div className="steps">
            {[
              { n: "01", icon: "📝", bg: "var(--coral-glow)", t: "Post your swap", d: "Share your current role, skills, and where you want to go next." },
              { n: "02", icon: "🔍", bg: "var(--ocean-soft)", t: "Find your match", d: "Browse verified workers in your target city with matching skills and great ratings." },
              { n: "03", icon: "✅", bg: "var(--forest-soft)", t: "Managers approve", d: "Both managers review the candidate's profile and approve. Full transparency." },
              { n: "04", icon: "✈️", bg: "var(--gold-soft)", t: "Travel & start", d: "Your position is confirmed. Pack your bags and start working from day one." },
            ].map((s, i) => (
              <div key={i} className={`step fu d${i + 1} ${isV("how") ? "v" : ""}`}>
                <div className="step-num">{s.n}</div>
                <div className="step-icon" style={{ background: s.bg }}>{s.icon}</div>
                <div className="step-title">{s.t}</div>
                <div className="step-desc">{s.d}</div>
                {i < 3 && <div className="step-line" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CITIES */}
      <section id="cities" className="cities-section"
        ref={(el) => { observerRefs.current["cities"] = el; }} data-section="cities">
        <div className="cities-header">
          <div className={`slabel fu ${isV("cities") ? "v" : ""}`}>Explore</div>
          <div className={`stitle fu d1 ${isV("cities") ? "v" : ""}`}>Popular swap destinations</div>
          <div className={`ssub fu d2 ${isV("cities") ? "v" : ""}`}>
            The most active cities for job swaps. New destinations are added as the community grows.
          </div>
        </div>
        <div className="cities-grid">
          {CITY_IMAGES.map((c, i) => (
            <div key={i} className={`city-card fu d${i + 1} ${isV("cities") ? "v" : ""}`}>
              <img src={c.url} alt={c.city} />
              <div className="city-overlay">
                <div className="city-name">{c.city}</div>
                <div className="city-jobs">{c.jobs}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BENEFITS */}
      <section id="benefits" className="ben-section"
        ref={(el) => { observerRefs.current["ben"] = el; }} data-section="ben">
        <div className="ben-inner">
          <div className={`fu ${isV("ben") ? "v" : ""}`}>
            <div className="slabel">Benefits</div>
            <div className="stitle" style={{ color: "#fff" }}>Built for both sides</div>
            <div className="ssub" style={{ color: "rgba(255,255,255,.4)" }}>
              Whether you're chasing your next adventure or keeping your team running smooth.
            </div>
          </div>
          <div className={`ben-toggle fu d1 ${isV("ben") ? "v" : ""}`}>
            <button className={`tgl ${role === "worker" ? "on" : ""}`} onClick={() => setRole("worker")}>🎒 For Workers</button>
            <button className={`tgl ${role === "manager" ? "on" : ""}`} onClick={() => setRole("manager")}>🏢 For Managers</button>
          </div>
          <div className="ben-grid">
            {(role === "worker"
              ? [
                  { icon: "💼", t: "Job on arrival", d: "No more arriving broke. Your position is confirmed before you leave.", bg: "rgba(232,101,74,.12)" },
                  { icon: "⭐", t: "Portable reputation", d: "Ratings and verified skills follow you everywhere. Every swap makes you stronger.", bg: "rgba(229,161,0,.12)" },
                  { icon: "🌏", t: "Explore confidently", d: "New city, no financial risk. You know your schedule, your manager, your role.", bg: "rgba(37,99,235,.12)" },
                  { icon: "🤝", t: "Meet your swap partner", d: "Chat before you swap. Get tips about the city, the job, and the team.", bg: "rgba(27,122,90,.12)" },
                  { icon: "📈", t: "Grow your career", d: "Different environments, new skills, a resume that shows real adaptability.", bg: "rgba(232,101,74,.12)" },
                  { icon: "🔒", t: "Verified & safe", d: "Every business is ABN-verified. Every worker is ID-checked. Real reviews from real managers.", bg: "rgba(37,99,235,.12)" },
                ]
              : [
                  { icon: "⚡", t: "Zero downtime", d: "Worker leaves, replacement arrives the same week. No gap in your roster.", bg: "rgba(232,101,74,.12)" },
                  { icon: "✅", t: "Pre-vetted candidates", d: "Verified skills, manager ratings, complete work history — before you approve.", bg: "rgba(27,122,90,.12)" },
                  { icon: "💰", t: "Cut recruitment costs", d: "No job ads, no interviews, no trial shifts. We handle the matching.", bg: "rgba(229,161,0,.12)" },
                  { icon: "📊", t: "Full transparency", d: "Detailed profiles with reliability scores and real comments from previous employers.", bg: "rgba(37,99,235,.12)" },
                  { icon: "🎯", t: "One-click approval", d: "Review the candidate, tap approve. The simplest hiring ever.", bg: "rgba(232,101,74,.12)" },
                  { icon: "🔄", t: "Consistent quality", d: "Workers perform because their rating directly affects future swap opportunities.", bg: "rgba(27,122,90,.12)" },
                ]
            ).map((b, i) => (
              <div key={`${role}-${i}`} className={`ben-card fu d${(i % 3) + 1} ${isV("ben") ? "v" : ""}`}>
                <div className="ben-icon" style={{ background: b.bg }}>{b.icon}</div>
                <div className="ben-title">{b.t}</div>
                <div className="ben-desc">{b.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROOF */}
      <section className="proof-section"
        ref={(el) => { observerRefs.current["proof"] = el; }} data-section="proof">
        <div className="proof-inner">
          <div className={`fu ${isV("proof") ? "v" : ""}`}>
            <div className="slabel">Stories</div>
            <div className="stitle">Real people, real swaps</div>
            <div className="ssub">Hear from backpackers and managers who tested the concept.</div>
          </div>
          <div className="proof-grid">
            {[
              { img: "https://images.unsplash.com/photo-1528892952291-009c663ce843?w=600&q=80", text: "I was terrified of leaving Cairns. With Pairgo I found a kitchen hand in Melbourne who wanted my spot. I started working the day after I arrived.", name: "Emma L.", role: "Kitchen Hand • UK", emoji: "👩‍🍳", bg: "var(--coral-glow)" },
              { img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&q=80", text: "My biggest headache is replacing backpackers who leave. This solves it. I get someone with verified reviews who I know can do the job from day one.", name: "Tom S.", role: "Manager • Reef Bistro", emoji: "👨‍💼", bg: "var(--ocean-soft)" },
              { img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&q=80", text: "Three swaps done. Byron Bay, Gold Coast, now Sydney. Every time I arrive knowing exactly what to expect. My profile keeps getting stronger.", name: "Lucas M.", role: "Barista • Argentina", emoji: "☕", bg: "var(--gold-soft)" },
            ].map((p, i) => (
              <div key={i} className={`proof-card fu d${i + 1} ${isV("proof") ? "v" : ""}`}>
                <img className="proof-card-img" src={p.img} alt="" />
                <div className="proof-stars">★★★★★</div>
                <div className="proof-text">"{p.text}"</div>
                <div className="proof-author">
                  <div className="proof-av" style={{ background: p.bg }}>{p.emoji}</div>
                  <div>
                    <div className="proof-name">{p.name}</div>
                    <div className="proof-role">{p.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="cta-section"
        ref={(el) => { observerRefs.current["cta"] = el; }} data-section="cta">
        <div className="cta-bg">
          <img src="https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=1600&q=80" alt="" />
          <div className="cta-bg-overlay" />
        </div>
        <div className="cta-inner">
          <div className={`fu ${isV("cta") ? "v" : ""}`}>
            <div className="cta-title">Ready to make your next move?</div>
            <div className="cta-sub">Join the waitlist and be the first to swap when Pairgo launches in Australia.</div>
          </div>
          {!submitted ? (
            <form className={`cta-form fu d1 ${isV("cta") ? "v" : ""}`} onSubmit={handleSubmit}>
              <input className="cta-in" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              <button className="cta-bt" type="submit">Join Waitlist</button>
            </form>
          ) : (
            <div className={`success-box fu ${isV("cta") ? "v" : ""}`}>
              <h3>You're in! 🎉</h3>
              <p>We'll notify you as soon as Pairgo launches. Welcome to the community.</p>
            </div>
          )}
          <div className={`cta-note fu d2 ${isV("cta") ? "v" : ""}`}>No spam. Just launch updates and early access.</div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-logo">pair<span>go</span></div>
          <div className="footer-links">
            <a href="#">About</a>
            <a href="#">Blog</a>
            <a href="#">Contact</a>
            <a href="#">Privacy</a>
          </div>
          <div className="footer-copy">© 2026 Pairgo. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
