import { useState } from "react";

const screens = [
  {
    id: "landing",
    title: "Landing Page",
    desc: "Primera impresión. Comunica el concepto y capta sign-ups.",
  },
  {
    id: "login",
    title: "Login / Sign Up",
    desc: "Registro diferenciado para Workers y Managers.",
  },
  {
    id: "search",
    title: "Swap Search",
    desc: "Búsqueda y filtrado de swaps disponibles.",
  },
  {
    id: "profile",
    title: "Worker Profile",
    desc: "Perfil público del worker con skills y reviews.",
  },
  {
    id: "swap-detail",
    title: "Swap Detail",
    desc: "Detalle de un swap match con info de ambos lados.",
  },
  {
    id: "manager",
    title: "Manager Dashboard",
    desc: "Panel del manager para aprobar swaps y gestionar workers.",
  },
  {
    id: "chat",
    title: "Chat / Messaging",
    desc: "Mensajería entre workers matched.",
  },
  {
    id: "reviews",
    title: "Reviews & Ratings",
    desc: "Sistema de reviews post-swap.",
  },
];

// Wireframe components
const Box = ({ x, y, w, h, label, dashed, fill, radius }) => (
  <g>
    <rect
      x={x} y={y} width={w} height={h}
      rx={radius || 4}
      fill={fill || "var(--bg-element)"}
      stroke="var(--border)"
      strokeWidth={1.5}
      strokeDasharray={dashed ? "6,4" : "none"}
    />
    {label && (
      <text x={x + w / 2} y={y + h / 2} textAnchor="middle" dominantBaseline="central"
        fill="var(--text-secondary)" fontSize={11} fontFamily="monospace">
        {label}
      </text>
    )}
  </g>
);

const Btn = ({ x, y, w, h, label, primary }) => (
  <g>
    <rect x={x} y={y} width={w} height={h || 32} rx={6}
      fill={primary ? "var(--accent)" : "var(--bg-element)"}
      stroke={primary ? "var(--accent)" : "var(--border)"}
      strokeWidth={1.5}
    />
    <text x={x + w / 2} y={y + (h || 32) / 2} textAnchor="middle" dominantBaseline="central"
      fill={primary ? "#fff" : "var(--text-primary)"} fontSize={11} fontWeight="600" fontFamily="monospace">
      {label}
    </text>
  </g>
);

const TextLine = ({ x, y, w, size, bold }) => (
  <rect x={x} y={y} width={w} height={size || 8} rx={3}
    fill={bold ? "var(--text-primary)" : "var(--text-line)"} opacity={bold ? 0.6 : 0.35}
  />
);

const Avatar = ({ x, y, r }) => (
  <g>
    <circle cx={x + r} cy={y + r} r={r} fill="var(--bg-element)" stroke="var(--border)" strokeWidth={1.5} />
    <circle cx={x + r} cy={y + r - r * 0.15} r={r * 0.3} fill="var(--text-line)" opacity={0.4} />
    <ellipse cx={x + r} cy={y + r + r * 0.55} rx={r * 0.45} ry={r * 0.25} fill="var(--text-line)" opacity={0.4} />
  </g>
);

const Star = ({ x, y, filled }) => (
  <text x={x} y={y} fontSize={12} fill={filled ? "var(--star)" : "var(--text-line)"} opacity={filled ? 1 : 0.3}>
    ★
  </text>
);

const Stars = ({ x, y, count = 5, filled = 4 }) => (
  <g>
    {Array.from({ length: count }).map((_, i) => (
      <Star key={i} x={x + i * 16} y={y} filled={i < filled} />
    ))}
  </g>
);

const InputField = ({ x, y, w, label }) => (
  <g>
    <text x={x} y={y - 6} fontSize={10} fill="var(--text-secondary)" fontFamily="monospace">{label}</text>
    <rect x={x} y={y} width={w} height={30} rx={4}
      fill="var(--bg-input)" stroke="var(--border)" strokeWidth={1} />
  </g>
);

const SearchBar = ({ x, y, w }) => (
  <g>
    <rect x={x} y={y} width={w} height={36} rx={18} fill="var(--bg-input)" stroke="var(--border)" strokeWidth={1.5} />
    <circle cx={x + 22} cy={y + 18} r={8} fill="none" stroke="var(--text-secondary)" strokeWidth={1.5} />
    <line x1={x + 28} y1={y + 24} x2={x + 32} y2={y + 28} stroke="var(--text-secondary)" strokeWidth={1.5} />
    <text x={x + 42} y={y + 22} fontSize={11} fill="var(--text-secondary)" fontFamily="monospace" opacity={0.5}>Search role, city...</text>
  </g>
);

const Badge = ({ x, y, label }) => (
  <g>
    <rect x={x} y={y} width={label.length * 7 + 16} height={22} rx={11} fill="var(--badge-bg)" stroke="var(--badge-border)" strokeWidth={1} />
    <text x={x + (label.length * 7 + 16) / 2} y={y + 11} textAnchor="middle" dominantBaseline="central"
      fontSize={10} fill="var(--accent)" fontFamily="monospace" fontWeight="600">{label}</text>
  </g>
);

const Nav = ({ y = 0 }) => (
  <g>
    <rect x={0} y={y} width={375} height={56} fill="var(--bg-nav)" />
    <line x1={0} y1={y + 56} x2={375} y2={y + 56} stroke="var(--border)" strokeWidth={1} />
    <TextLine x={16} y={y + 22} w={60} size={12} bold />
    <g opacity={0.5}>
      <TextLine x={140} y={y + 25} w={30} size={8} />
      <TextLine x={185} y={y + 25} w={30} size={8} />
      <TextLine x={230} y={y + 25} w={30} size={8} />
    </g>
    <Btn x={295} y={y + 14} w={64} h={28} label="Sign Up" primary />
  </g>
);

const PhoneFrame = ({ children, title }) => (
  <g>
    <rect x={0} y={0} width={375} height={780} rx={20} fill="var(--bg-screen)" stroke="var(--border)" strokeWidth={2} />
    <rect x={130} y={8} width={115} height={4} rx={2} fill="var(--text-line)" opacity={0.3} />
    {children}
  </g>
);

// === SCREEN RENDERERS ===

const LandingScreen = () => (
  <PhoneFrame>
    <Nav />
    {/* Hero */}
    <rect x={16} y={72} width={343} height={200} rx={12} fill="var(--bg-element)" stroke="var(--border)" strokeWidth={1} strokeDasharray="6,4" />
    <text x={187} y={135} textAnchor="middle" fontSize={18} fontWeight="700" fill="var(--text-primary)" fontFamily="monospace">Swap your job.</text>
    <text x={187} y={158} textAnchor="middle" fontSize={18} fontWeight="700" fill="var(--accent)" fontFamily="monospace">Keep moving.</text>
    <text x={187} y={190} textAnchor="middle" fontSize={10} fill="var(--text-secondary)" fontFamily="monospace">Find someone to swap positions with</text>
    <text x={187} y={204} textAnchor="middle" fontSize={10} fill="var(--text-secondary)" fontFamily="monospace">and travel to a new city with a job ready.</text>
    <Btn x={117} y={225} w={140} h={34} label="Get Started" primary />
    
    {/* How it works */}
    <text x={187} y={310} textAnchor="middle" fontSize={13} fontWeight="700" fill="var(--text-primary)" fontFamily="monospace">How It Works</text>
    {[
      { n: "1", t: "Post your swap" },
      { n: "2", t: "Find a match" },
      { n: "3", t: "Managers approve" },
      { n: "4", t: "Travel & start" },
    ].map((step, i) => (
      <g key={i}>
        <circle cx={52 + i * 82} cy={345} r={16} fill="var(--accent)" opacity={0.15} />
        <text x={52 + i * 82} y={349} textAnchor="middle" fontSize={12} fontWeight="700" fill="var(--accent)" fontFamily="monospace">{step.n}</text>
        <text x={52 + i * 82} y={375} textAnchor="middle" fontSize={8} fill="var(--text-secondary)" fontFamily="monospace">{step.t}</text>
      </g>
    ))}
    
    {/* Stats */}
    <rect x={16} y={400} width={343} height={60} rx={8} fill="var(--bg-element)" />
    {[
      { v: "2,400+", l: "Workers" },
      { v: "850+", l: "Businesses" },
      { v: "1,200+", l: "Swaps" },
    ].map((s, i) => (
      <g key={i}>
        <text x={72 + i * 115} y={425} textAnchor="middle" fontSize={16} fontWeight="700" fill="var(--accent)" fontFamily="monospace">{s.v}</text>
        <text x={72 + i * 115} y={442} textAnchor="middle" fontSize={9} fill="var(--text-secondary)" fontFamily="monospace">{s.l}</text>
      </g>
    ))}
    
    {/* Testimonial */}
    <rect x={16} y={480} width={343} height={90} rx={8} fill="var(--bg-element)" stroke="var(--border)" strokeWidth={1} />
    <Avatar x={30} y={493} r={18} />
    <TextLine x={74} y={498} w={80} size={8} bold />
    <TextLine x={74} y={512} w={50} size={6} />
    <Stars x={74} y={524} filled={5} />
    <TextLine x={30} y={546} w={310} size={6} />
    <TextLine x={30} y={556} w={240} size={6} />
    
    {/* CTA */}
    <rect x={16} y={590} width={343} height={80} rx={8} fill="var(--accent)" opacity={0.1} />
    <text x={187} y={620} textAnchor="middle" fontSize={12} fontWeight="600" fill="var(--accent)" fontFamily="monospace">Ready to swap?</text>
    <Btn x={127} y={635} w={120} h={28} label="Join Now" primary />
    
    {/* Footer */}
    <line x1={16} y1={700} x2={359} y2={700} stroke="var(--border)" strokeWidth={1} />
    <TextLine x={16} y={720} w={60} size={6} />
    <TextLine x={16} y={732} w={80} size={6} />
    <TextLine x={280} y={720} w={75} size={6} />
    <TextLine x={280} y={732} w={60} size={6} />
  </PhoneFrame>
);

const LoginScreen = () => (
  <PhoneFrame>
    <Nav />
    <rect x={32} y={90} width={311} height={580} rx={12} fill="var(--bg-element)" stroke="var(--border)" strokeWidth={1} />
    
    <text x={187} y={130} textAnchor="middle" fontSize={16} fontWeight="700" fill="var(--text-primary)" fontFamily="monospace">Join the Platform</text>
    <text x={187} y={150} textAnchor="middle" fontSize={10} fill="var(--text-secondary)" fontFamily="monospace">Choose your role to get started</text>
    
    {/* Role selector */}
    <rect x={56} y={170} width={125} height={50} rx={8} fill="var(--accent)" opacity={0.15} stroke="var(--accent)" strokeWidth={1.5} />
    <text x={118} y={192} textAnchor="middle" fontSize={16}>🎒</text>
    <text x={118} y={210} textAnchor="middle" fontSize={9} fontWeight="600" fill="var(--accent)" fontFamily="monospace">Worker</text>
    
    <rect x={194} y={170} width={125} height={50} rx={8} fill="var(--bg-input)" stroke="var(--border)" strokeWidth={1} />
    <text x={256} y={192} textAnchor="middle" fontSize={16}>🏢</text>
    <text x={256} y={210} textAnchor="middle" fontSize={9} fontWeight="600" fill="var(--text-secondary)" fontFamily="monospace">Manager</text>
    
    {/* Form */}
    <InputField x={56} y={250} w={263} label="Full Name" />
    <InputField x={56} y={310} w={263} label="Email" />
    <InputField x={56} y={370} w={263} label="Password" />
    <InputField x={56} y={430} w={263} label="Current Location" />
    
    <Btn x={56} y={490} w={263} h={38} label="Create Account" primary />
    
    {/* Divider */}
    <line x1={56} y1={548} x2={150} y2={548} stroke="var(--border)" strokeWidth={1} />
    <text x={187} y={552} textAnchor="middle" fontSize={9} fill="var(--text-secondary)" fontFamily="monospace">or</text>
    <line x1={224} y1={548} x2={319} y2={548} stroke="var(--border)" strokeWidth={1} />
    
    {/* Social */}
    <Btn x={56} y={570} w={263} h={34} label="Continue with Google" />
    
    <text x={187} y={635} textAnchor="middle" fontSize={10} fill="var(--text-secondary)" fontFamily="monospace">
      Already have an account? <tspan fill="var(--accent)" fontWeight="600">Log in</tspan>
    </text>
  </PhoneFrame>
);

const SearchScreen = () => (
  <PhoneFrame>
    <Nav />
    <text x={16} y={85} fontSize={16} fontWeight="700" fill="var(--text-primary)" fontFamily="monospace">Find a Swap</text>
    <SearchBar x={16} y={96} w={343} />
    
    {/* Filters */}
    <g>
      {["Role ▾", "City ▾", "Dates ▾", "Skills ▾"].map((f, i) => (
        <g key={i}>
          <rect x={16 + i * 86} y={144} width={78} height={26} rx={13} fill="var(--bg-element)" stroke="var(--border)" strokeWidth={1} />
          <text x={16 + i * 86 + 39} y={160} textAnchor="middle" fontSize={9} fill="var(--text-secondary)" fontFamily="monospace">{f}</text>
        </g>
      ))}
    </g>
    
    <text x={16} y={198} fontSize={10} fill="var(--text-secondary)" fontFamily="monospace">23 matches found</text>
    
    {/* Cards */}
    {[0, 1, 2].map(i => (
      <g key={i} transform={`translate(0, ${210 + i * 175})`}>
        <rect x={16} y={0} width={343} height={162} rx={10} fill="var(--bg-element)" stroke="var(--border)" strokeWidth={1} />
        
        <Avatar x={28} y={12} r={22} />
        <TextLine x={80} y={16} w={100} size={10} bold />
        <TextLine x={80} y={32} w={70} size={7} />
        <Stars x={80} y={42} filled={4 + (i % 2)} />
        
        {/* Swap arrow */}
        <text x={300} y={35} textAnchor="middle" fontSize={20} fill="var(--accent)">⇄</text>
        
        {/* Info */}
        <line x1={28} y1={68} x2={347} y2={68} stroke="var(--border)" strokeWidth={0.5} />
        <text x={28} y={88} fontSize={9} fill="var(--text-secondary)" fontFamily="monospace">📍 {["Melbourne → Cairns", "Sydney → Byron Bay", "Gold Coast → Perth"][i]}</text>
        <text x={28} y={105} fontSize={9} fill="var(--text-secondary)" fontFamily="monospace">👨‍🍳 {["Kitchen Hand", "Barista", "Housekeeper"][i]}</text>
        <text x={28} y={122} fontSize={9} fill="var(--text-secondary)" fontFamily="monospace">📅 {["May 15 – Jun 30", "Jun 1 – Aug 15", "Jul 10 – Sep 1"][i]}</text>
        
        <Badge x={220} y={82} label={["Verified", "Top Rated", "New"][i]} />
        <Btn x={220} y={120} w={127} h={28} label="View Match" primary />
      </g>
    ))}
  </PhoneFrame>
);

const ProfileScreen = () => (
  <PhoneFrame>
    <Nav />
    {/* Header */}
    <rect x={0} y={56} width={375} height={120} fill="var(--accent)" opacity={0.08} />
    <Avatar x={148} y={66} r={32} />
    <text x={187} y={144} textAnchor="middle" fontSize={14} fontWeight="700" fill="var(--text-primary)" fontFamily="monospace">Sarah Thompson</text>
    <text x={187} y={160} textAnchor="middle" fontSize={10} fill="var(--text-secondary)" fontFamily="monospace">📍 Cairns, QLD  •  🇬🇧 UK  •  WHV 417</text>
    <Stars x={147} y={174} filled={5} />
    
    {/* Stats bar */}
    <rect x={16} y={195} width={343} height={50} rx={8} fill="var(--bg-element)" />
    {[
      { v: "6", l: "Swaps" },
      { v: "4.9", l: "Rating" },
      { v: "8", l: "Skills" },
    ].map((s, i) => (
      <g key={i}>
        <text x={75 + i * 115} y={215} textAnchor="middle" fontSize={14} fontWeight="700" fill="var(--accent)" fontFamily="monospace">{s.v}</text>
        <text x={75 + i * 115} y={232} textAnchor="middle" fontSize={8} fill="var(--text-secondary)" fontFamily="monospace">{s.l}</text>
      </g>
    ))}
    
    {/* Verified Skills */}
    <text x={16} y={275} fontSize={12} fontWeight="600" fill="var(--text-primary)" fontFamily="monospace">Verified Skills</text>
    {[
      { skill: "Kitchen Hand", lvl: "Expert", mgr: "by Tom @ Reef Bistro" },
      { skill: "Barista", lvl: "Competent", mgr: "by Lisa @ Coastal Café" },
      { skill: "Dishwashing", lvl: "Expert", mgr: "by Tom @ Reef Bistro" },
      { skill: "Food Prep", lvl: "Competent", mgr: "by Marco @ Pier Restaurant" },
    ].map((s, i) => (
      <g key={i} transform={`translate(0, ${290 + i * 38})`}>
        <rect x={16} y={0} width={343} height={32} rx={6} fill="var(--bg-element)" />
        <text x={28} y={14} fontSize={10} fill="var(--accent)" fontFamily="monospace">✓</text>
        <text x={42} y={14} fontSize={10} fontWeight="600" fill="var(--text-primary)" fontFamily="monospace">{s.skill}</text>
        <text x={42} y={26} fontSize={8} fill="var(--text-secondary)" fontFamily="monospace">{s.lvl} • Verified {s.mgr}</text>
        <Badge x={280} y={5} label={s.lvl === "Expert" ? "★★★" : "★★"} />
      </g>
    ))}
    
    {/* Work History */}
    <text x={16} y={460} fontSize={12} fontWeight="600" fill="var(--text-primary)" fontFamily="monospace">Work History</text>
    {[
      { role: "Kitchen Hand", place: "Reef Bistro, Cairns", dates: "Jan–Apr 2026" },
      { role: "Barista", place: "Coastal Café, Sydney", dates: "Sep–Dec 2025" },
    ].map((w, i) => (
      <g key={i} transform={`translate(0, ${475 + i * 50})`}>
        <rect x={16} y={0} width={343} height={42} rx={6} fill="var(--bg-element)" stroke="var(--border)" strokeWidth={1} />
        <text x={28} y={16} fontSize={10} fontWeight="600" fill="var(--text-primary)" fontFamily="monospace">{w.role}</text>
        <text x={28} y={32} fontSize={8} fill="var(--text-secondary)" fontFamily="monospace">{w.place} • {w.dates}</text>
        <Stars x={280} y={15} filled={5} count={5} />
      </g>
    ))}
    
    {/* Availability */}
    <text x={16} y={600} fontSize={12} fontWeight="600" fill="var(--text-primary)" fontFamily="monospace">Availability</text>
    <rect x={16} y={612} width={343} height={55} rx={8} fill="var(--bg-element)" stroke="var(--accent)" strokeWidth={1} strokeDasharray="4,3" />
    <text x={28} y={632} fontSize={10} fill="var(--text-secondary)" fontFamily="monospace">🟢 Available to swap from May 15</text>
    <text x={28} y={650} fontSize={10} fill="var(--text-secondary)" fontFamily="monospace">📍 Looking for: Melbourne, Byron Bay, Gold Coast</text>
    
    <Btn x={16} y={685} w={167} h={34} label="Message" />
    <Btn x={192} y={685} w={167} h={34} label="Request Swap" primary />
  </PhoneFrame>
);

const SwapDetailScreen = () => (
  <PhoneFrame>
    <Nav />
    <text x={16} y={85} fontSize={14} fontWeight="700" fill="var(--text-primary)" fontFamily="monospace">Swap Detail</text>
    <Badge x={130} y={72} label="Pending Approval" />
    
    {/* Two sides */}
    <rect x={16} y={100} width={165} height={200} rx={10} fill="var(--bg-element)" stroke="var(--accent)" strokeWidth={1.5} />
    <rect x={194} y={100} width={165} height={200} rx={10} fill="var(--bg-element)" stroke="var(--border)" strokeWidth={1.5} />
    
    <text x={98} y={118} textAnchor="middle" fontSize={9} fontWeight="600" fill="var(--accent)" fontFamily="monospace">YOU</text>
    <text x={276} y={118} textAnchor="middle" fontSize={9} fontWeight="600" fill="var(--text-secondary)" fontFamily="monospace">MATCH</text>
    
    <Avatar x={72} y={125} r={22} />
    <Avatar x={250} y={125} r={22} />
    
    <text x={98} y={180} textAnchor="middle" fontSize={10} fontWeight="600" fill="var(--text-primary)" fontFamily="monospace">You</text>
    <text x={98} y={195} textAnchor="middle" fontSize={8} fill="var(--text-secondary)" fontFamily="monospace">Kitchen Hand</text>
    <text x={98} y={210} textAnchor="middle" fontSize={8} fill="var(--text-secondary)" fontFamily="monospace">📍 Cairns</text>
    <Stars x={60} y={220} filled={4} count={5} />
    <text x={98} y={250} textAnchor="middle" fontSize={8} fill="var(--accent)" fontFamily="monospace">Reef Bistro</text>
    <text x={98} y={265} textAnchor="middle" fontSize={8} fill="var(--text-secondary)" fontFamily="monospace">Mgr: Tom S.</text>
    <text x={98} y={280} textAnchor="middle" fontSize={7} fill="var(--accent)" fontFamily="monospace">✓ Approved</text>
    
    <text x={276} y={180} textAnchor="middle" fontSize={10} fontWeight="600" fill="var(--text-primary)" fontFamily="monospace">Juan M.</text>
    <text x={276} y={195} textAnchor="middle" fontSize={8} fill="var(--text-secondary)" fontFamily="monospace">Kitchen Hand</text>
    <text x={276} y={210} textAnchor="middle" fontSize={8} fill="var(--text-secondary)" fontFamily="monospace">📍 Melbourne</text>
    <Stars x={238} y={220} filled={5} count={5} />
    <text x={276} y={250} textAnchor="middle" fontSize={8} fill="var(--accent)" fontFamily="monospace">Olive Kitchen</text>
    <text x={276} y={265} textAnchor="middle" fontSize={8} fill="var(--text-secondary)" fontFamily="monospace">Mgr: Amy R.</text>
    <text x={276} y={280} textAnchor="middle" fontSize={7} fill="var(--star)" fontFamily="monospace">⏳ Pending</text>
    
    {/* Arrow */}
    <text x={187} y={200} textAnchor="middle" fontSize={26} fill="var(--accent)">⇄</text>
    
    {/* Compatibility */}
    <text x={16} y={328} fontSize={12} fontWeight="600" fill="var(--text-primary)" fontFamily="monospace">Compatibility</text>
    <rect x={16} y={338} width={343} height={36} rx={6} fill="var(--bg-element)" />
    <text x={28} y={357} fontSize={9} fill="var(--text-secondary)" fontFamily="monospace">Skills match:</text>
    <rect x={110} y={350} width={200} height={10} rx={5} fill="var(--bg-input)" />
    <rect x={110} y={350} width={170} height={10} rx={5} fill="var(--accent)" opacity={0.7} />
    <text x={320} y={360} fontSize={10} fontWeight="700" fill="var(--accent)" fontFamily="monospace">85%</text>
    
    {/* Skills comparison */}
    <text x={16} y={402} fontSize={12} fontWeight="600" fill="var(--text-primary)" fontFamily="monospace">Skills Match</text>
    {["Kitchen Hand ✓✓", "Dishwashing ✓✓", "Food Prep ✓ ✗", "Barista ✓ ✗"].map((s, i) => (
      <g key={i}>
        <rect x={16} y={412 + i * 28} width={343} height={24} rx={4} fill={i % 2 === 0 ? "var(--bg-element)" : "transparent"} />
        <text x={28} y={428 + i * 28} fontSize={9} fill="var(--text-secondary)" fontFamily="monospace">{s}</text>
      </g>
    ))}
    
    {/* Timeline */}
    <text x={16} y={540} fontSize={12} fontWeight="600" fill="var(--text-primary)" fontFamily="monospace">Swap Timeline</text>
    {[
      { d: "May 1", e: "Request sent", done: true },
      { d: "May 2", e: "Your manager approved", done: true },
      { d: "...", e: "Waiting for match's manager", done: false },
      { d: "May 15", e: "Swap starts", done: false },
    ].map((t, i) => (
      <g key={i} transform={`translate(0, ${555 + i * 35})`}>
        <circle cx={28} cy={10} r={6} fill={t.done ? "var(--accent)" : "var(--bg-input)"} stroke={t.done ? "var(--accent)" : "var(--border)"} strokeWidth={1.5} />
        {i < 3 && <line x1={28} y1={16} x2={28} y2={35} stroke="var(--border)" strokeWidth={1} />}
        <text x={44} y={8} fontSize={8} fill="var(--text-secondary)" fontFamily="monospace">{t.d}</text>
        <text x={44} y={20} fontSize={9} fill={t.done ? "var(--text-primary)" : "var(--text-secondary)"} fontWeight={t.done ? "600" : "400"} fontFamily="monospace">{t.e}</text>
      </g>
    ))}
    
    <Btn x={16} y={710} w={167} h={34} label="Chat" />
    <Btn x={192} y={710} w={167} h={34} label="Cancel Swap" />
  </PhoneFrame>
);

const ManagerScreen = () => (
  <PhoneFrame>
    <Nav />
    <text x={16} y={85} fontSize={14} fontWeight="700" fill="var(--text-primary)" fontFamily="monospace">Manager Dashboard</text>
    <text x={16} y={100} fontSize={10} fill="var(--text-secondary)" fontFamily="monospace">Reef Bistro, Cairns • ABN Verified ✓</text>
    
    {/* Quick stats */}
    <g>
      {[
        { v: "3", l: "Pending", c: "var(--star)" },
        { v: "2", l: "Active", c: "var(--accent)" },
        { v: "12", l: "Completed", c: "var(--text-secondary)" },
      ].map((s, i) => (
        <g key={i}>
          <rect x={16 + i * 117} y={115} width={109} height={55} rx={8} fill="var(--bg-element)" stroke="var(--border)" strokeWidth={1} />
          <text x={70 + i * 117} y={140} textAnchor="middle" fontSize={18} fontWeight="700" fill={s.c} fontFamily="monospace">{s.v}</text>
          <text x={70 + i * 117} y={158} textAnchor="middle" fontSize={8} fill="var(--text-secondary)" fontFamily="monospace">{s.l}</text>
        </g>
      ))}
    </g>
    
    {/* Pending approvals */}
    <text x={16} y={200} fontSize={12} fontWeight="600" fill="var(--text-primary)" fontFamily="monospace">Pending Approvals</text>
    {[
      { name: "Juan M.", from: "Melbourne", role: "Kitchen Hand", rating: "4.9" },
      { name: "Lisa K.", from: "Sydney", role: "Kitchen Hand", rating: "4.7" },
      { name: "Mike R.", from: "Brisbane", role: "Dishwasher", rating: "4.5" },
    ].map((p, i) => (
      <g key={i} transform={`translate(0, ${215 + i * 90})`}>
        <rect x={16} y={0} width={343} height={82} rx={8} fill="var(--bg-element)" stroke="var(--star)" strokeWidth={1} />
        <Avatar x={24} y={10} r={16} />
        <text x={64} y={22} fontSize={10} fontWeight="600" fill="var(--text-primary)" fontFamily="monospace">{p.name}</text>
        <text x={64} y={36} fontSize={8} fill="var(--text-secondary)" fontFamily="monospace">From {p.from} • {p.role}</text>
        <text x={64} y={50} fontSize={8} fill="var(--text-secondary)" fontFamily="monospace">★ {p.rating} rating • Wants to replace Sarah T.</text>
        <Btn x={180} y={56} w={80} h={22} label="Approve" primary />
        <Btn x={268} y={56} w={80} h={22} label="Reject" />
        <text x={330} y={20} fontSize={9} fill="var(--accent)" fontFamily="monospace" textDecoration="underline">Profile →</text>
      </g>
    ))}
    
    {/* Current workers */}
    <text x={16} y={505} fontSize={12} fontWeight="600" fill="var(--text-primary)" fontFamily="monospace">Current Workers</text>
    {[
      { name: "Sarah T.", role: "Kitchen Hand", status: "Swap pending" },
      { name: "Ben W.", role: "Dishwasher", status: "Active" },
    ].map((w, i) => (
      <g key={i} transform={`translate(0, ${520 + i * 50})`}>
        <rect x={16} y={0} width={343} height={42} rx={6} fill="var(--bg-element)" />
        <Avatar x={24} y={5} r={14} />
        <text x={60} y={18} fontSize={10} fontWeight="600" fill="var(--text-primary)" fontFamily="monospace">{w.name}</text>
        <text x={60} y={32} fontSize={8} fill="var(--text-secondary)" fontFamily="monospace">{w.role}</text>
        <Badge x={270} y={10} label={w.status} />
      </g>
    ))}
    
    {/* Verify skills button */}
    <text x={16} y={640} fontSize={12} fontWeight="600" fill="var(--text-primary)" fontFamily="monospace">Quick Actions</text>
    <Btn x={16} y={650} w={167} h={34} label="Verify Skills" primary />
    <Btn x={192} y={650} w={167} h={34} label="Post Position" />
    <Btn x={16} y={695} w={343} h={34} label="View All Reviews" />
  </PhoneFrame>
);

const ChatScreen = () => (
  <PhoneFrame>
    {/* Chat header */}
    <rect x={0} y={0} width={375} height={70} fill="var(--bg-nav)" />
    <line x1={0} y1={70} x2={375} y2={70} stroke="var(--border)" strokeWidth={1} />
    <text x={16} y={30} fontSize={14} fill="var(--text-secondary)" fontFamily="monospace">←</text>
    <Avatar x={44} y={16} r={18} />
    <text x={86} y={32} fontSize={12} fontWeight="600" fill="var(--text-primary)" fontFamily="monospace">Juan M.</text>
    <text x={86} y={48} fontSize={9} fill="var(--accent)" fontFamily="monospace">● Online</text>
    <text x={330} y={40} fontSize={9} fill="var(--text-secondary)" fontFamily="monospace">Profile</text>
    
    {/* Swap context bar */}
    <rect x={16} y={80} width={343} height={36} rx={6} fill="var(--accent)" opacity={0.1} />
    <text x={28} y={102} fontSize={9} fill="var(--accent)" fontFamily="monospace">🔄 Swap: Kitchen Hand • Cairns ⇄ Melbourne • Pending</text>
    
    {/* Messages */}
    {/* Incoming */}
    <rect x={16} y={135} width={220} height={50} rx={12} fill="var(--bg-element)" stroke="var(--border)" strokeWidth={1} />
    <text x={28} y={155} fontSize={10} fill="var(--text-primary)" fontFamily="monospace">Hey! I saw your profile.</text>
    <text x={28} y={170} fontSize={10} fill="var(--text-primary)" fontFamily="monospace">Your skills look great!</text>
    <text x={200} y={198} fontSize={8} fill="var(--text-secondary)" fontFamily="monospace">10:30 AM</text>
    
    {/* Outgoing */}
    <rect x={139} y={210} width={220} height={50} rx={12} fill="var(--accent)" opacity={0.15} stroke="var(--accent)" strokeWidth={1} />
    <text x={151} y={230} fontSize={10} fill="var(--text-primary)" fontFamily="monospace">Thanks! Melbourne looks</text>
    <text x={151} y={245} fontSize={10} fill="var(--text-primary)" fontFamily="monospace">amazing. How's the café?</text>
    <text x={323} y={273} fontSize={8} fill="var(--text-secondary)" fontFamily="monospace">10:32 AM</text>
    
    {/* Incoming */}
    <rect x={16} y={285} width={250} height={65} rx={12} fill="var(--bg-element)" stroke="var(--border)" strokeWidth={1} />
    <text x={28} y={305} fontSize={10} fill="var(--text-primary)" fontFamily="monospace">Really good! The manager is</text>
    <text x={28} y={320} fontSize={10} fill="var(--text-primary)" fontFamily="monospace">super chill. Busy weekends</text>
    <text x={28} y={335} fontSize={10} fill="var(--text-primary)" fontFamily="monospace">but nothing crazy.</text>
    <text x={230} y={363} fontSize={8} fill="var(--text-secondary)" fontFamily="monospace">10:35 AM</text>
    
    {/* Outgoing */}
    <rect x={139} y={375} width={220} height={50} rx={12} fill="var(--accent)" opacity={0.15} stroke="var(--accent)" strokeWidth={1} />
    <text x={151} y={395} fontSize={10} fill="var(--text-primary)" fontFamily="monospace">Perfect. My manager already</text>
    <text x={151} y={410} fontSize={10} fill="var(--text-primary)" fontFamily="monospace">approved your profile!</text>
    <text x={323} y={438} fontSize={8} fill="var(--text-secondary)" fontFamily="monospace">10:38 AM</text>
    
    {/* System message */}
    <rect x={80} y={460} width={215} height={28} rx={14} fill="var(--accent)" opacity={0.08} />
    <text x={187} y={478} textAnchor="middle" fontSize={8} fill="var(--accent)" fontFamily="monospace">🎉 Manager A approved this swap</text>
    
    {/* Incoming */}
    <rect x={16} y={505} width={220} height={50} rx={12} fill="var(--bg-element)" stroke="var(--border)" strokeWidth={1} />
    <text x={28} y={525} fontSize={10} fill="var(--text-primary)" fontFamily="monospace">Awesome!! I'll talk to my</text>
    <text x={28} y={540} fontSize={10} fill="var(--text-primary)" fontFamily="monospace">manager today too 🤞</text>
    <text x={200} y={568} fontSize={8} fill="var(--text-secondary)" fontFamily="monospace">10:40 AM</text>
    
    {/* Quick actions */}
    <rect x={16} y={590} width={343} height={32} rx={6} fill="var(--bg-element)" />
    <text x={40} y={610} fontSize={9} fill="var(--accent)" fontFamily="monospace">📋 Share Profile</text>
    <text x={160} y={610} fontSize={9} fill="var(--accent)" fontFamily="monospace">📅 Suggest Dates</text>
    <text x={290} y={610} fontSize={9} fill="var(--accent)" fontFamily="monospace">📍 Share Location</text>
    
    {/* Input */}
    <rect x={0} y={640} width={375} height={140} fill="var(--bg-nav)" />
    <rect x={16} y={655} width={290} height={40} rx={20} fill="var(--bg-input)" stroke="var(--border)" strokeWidth={1} />
    <text x={36} y={679} fontSize={10} fill="var(--text-secondary)" fontFamily="monospace" opacity={0.5}>Type a message...</text>
    <circle cx={335} cy={675} r={18} fill="var(--accent)" />
    <text x={335} y={680} textAnchor="middle" fontSize={14} fill="#fff">↑</text>
  </PhoneFrame>
);

const ReviewsScreen = () => (
  <PhoneFrame>
    <Nav />
    <text x={16} y={85} fontSize={14} fontWeight="700" fill="var(--text-primary)" fontFamily="monospace">Leave a Review</text>
    <text x={16} y={100} fontSize={10} fill="var(--text-secondary)" fontFamily="monospace">Swap completed: Kitchen Hand • Cairns ⇄ Melbourne</text>
    
    {/* Who you're reviewing */}
    <rect x={16} y={115} width={343} height={60} rx={8} fill="var(--bg-element)" />
    <Avatar x={28} y={125} r={18} />
    <text x={72} y={142} fontSize={11} fontWeight="600" fill="var(--text-primary)" fontFamily="monospace">Reviewing: Juan M.</text>
    <text x={72} y={158} fontSize={9} fill="var(--text-secondary)" fontFamily="monospace">Kitchen Hand at Reef Bistro • May–Jun 2026</text>
    
    {/* Rating categories */}
    {[
      { cat: "Reliability", desc: "Punctuality, attendance" },
      { cat: "Skill Level", desc: "Competence in tasks" },
      { cat: "Attitude", desc: "Communication, teamwork" },
    ].map((r, i) => (
      <g key={i} transform={`translate(0, ${195 + i * 75})`}>
        <text x={16} y={12} fontSize={11} fontWeight="600" fill="var(--text-primary)" fontFamily="monospace">{r.cat}</text>
        <text x={16} y={28} fontSize={8} fill="var(--text-secondary)" fontFamily="monospace">{r.desc}</text>
        {Array.from({ length: 5 }).map((_, j) => (
          <g key={j}>
            <text x={16 + j * 36} y={55} fontSize={28} fill={j < (4 - i + 1) ? "var(--star)" : "var(--text-line)"} opacity={j < (4 - i + 1) ? 1 : 0.25}>★</text>
          </g>
        ))}
      </g>
    ))}
    
    {/* Comment */}
    <text x={16} y={435} fontSize={11} fontWeight="600" fill="var(--text-primary)" fontFamily="monospace">Comments</text>
    <rect x={16} y={445} width={343} height={80} rx={8} fill="var(--bg-input)" stroke="var(--border)" strokeWidth={1} />
    <text x={28} y={470} fontSize={9} fill="var(--text-secondary)" fontFamily="monospace" opacity={0.5}>Share your experience working with Juan...</text>
    
    {/* Skill verification */}
    <text x={16} y={555} fontSize={11} fontWeight="600" fill="var(--text-primary)" fontFamily="monospace">Verify Skills</text>
    <text x={16} y={570} fontSize={8} fill="var(--text-secondary)" fontFamily="monospace">Confirm the skills Juan demonstrated</text>
    {[
      { skill: "Kitchen Hand", checked: true },
      { skill: "Dishwashing", checked: true },
      { skill: "Food Prep", checked: false },
    ].map((s, i) => (
      <g key={i} transform={`translate(0, ${585 + i * 32})`}>
        <rect x={16} y={0} width={343} height={26} rx={4} fill="var(--bg-element)" />
        <rect x={24} y={5} width={16} height={16} rx={3} fill={s.checked ? "var(--accent)" : "var(--bg-input)"} stroke={s.checked ? "var(--accent)" : "var(--border)"} strokeWidth={1.5} />
        {s.checked && <text x={28} y={18} fontSize={10} fill="#fff" fontWeight="700">✓</text>}
        <text x={48} y={17} fontSize={10} fill="var(--text-primary)" fontFamily="monospace">{s.skill}</text>
        {s.checked && (
          <g>
            {["Beginner", "Competent", "Expert"].map((l, j) => (
              <g key={j}>
                <rect x={200 + j * 50} y={3} width={44} height={20} rx={10}
                  fill={j === 2 ? "var(--accent)" : "var(--bg-input)"}
                  stroke={j === 2 ? "var(--accent)" : "var(--border)"} strokeWidth={1} />
                <text x={222 + j * 50} y={16} textAnchor="middle" fontSize={7}
                  fill={j === 2 ? "#fff" : "var(--text-secondary)"} fontFamily="monospace">{l}</text>
              </g>
            ))}
          </g>
        )}
      </g>
    ))}
    
    <Btn x={16} y={700} w={343} h={38} label="Submit Review" primary />
  </PhoneFrame>
);

const screenRenderers = {
  landing: LandingScreen,
  login: LoginScreen,
  search: SearchScreen,
  profile: ProfileScreen,
  "swap-detail": SwapDetailScreen,
  manager: ManagerScreen,
  chat: ChatScreen,
  reviews: ReviewsScreen,
};

export default function Wireframes() {
  const [active, setActive] = useState("landing");
  const Screen = screenRenderers[active];

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-page)",
      fontFamily: "monospace",
    }}>
      <style>{`
        :root {
          --bg-page: #F8F9FA;
          --bg-screen: #FFFFFF;
          --bg-element: #F3F4F6;
          --bg-nav: #FAFAFA;
          --bg-input: #FFFFFF;
          --border: #D1D5DB;
          --text-primary: #1F2937;
          --text-secondary: #6B7280;
          --text-line: #9CA3AF;
          --accent: #2563EB;
          --star: #F59E0B;
          --badge-bg: #EFF6FF;
          --badge-border: #BFDBFE;
        }
        @media (prefers-color-scheme: dark) {
          :root {
            --bg-page: #111318;
            --bg-screen: #1A1D24;
            --bg-element: #242830;
            --bg-nav: #1E2128;
            --bg-input: #2A2E36;
            --border: #374151;
            --text-primary: #F3F4F6;
            --text-secondary: #9CA3AF;
            --text-line: #6B7280;
            --accent: #60A5FA;
            --star: #FBBF24;
            --badge-bg: #1E3A5F;
            --badge-border: #2563EB;
          }
        }
      `}</style>

      {/* Header */}
      <div style={{
        padding: "20px 24px 16px",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg-screen)",
      }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
          Wireframes — Job Swap App
        </div>
        <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
          Low-fidelity • 8 pantallas principales • Tap para navegar
        </div>
      </div>

      {/* Tab nav */}
      <div style={{
        display: "flex",
        gap: 0,
        overflowX: "auto",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg-screen)",
        padding: "0 16px",
        WebkitOverflowScrolling: "touch",
      }}>
        {screens.map(s => (
          <button
            key={s.id}
            onClick={() => setActive(s.id)}
            style={{
              padding: "10px 14px",
              fontSize: 11,
              fontFamily: "monospace",
              fontWeight: active === s.id ? 700 : 400,
              color: active === s.id ? "var(--accent)" : "var(--text-secondary)",
              background: "none",
              border: "none",
              borderBottom: active === s.id ? "2px solid var(--accent)" : "2px solid transparent",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.15s",
            }}
          >
            {s.title}
          </button>
        ))}
      </div>

      {/* Screen description */}
      <div style={{
        padding: "12px 24px",
        fontSize: 12,
        color: "var(--text-secondary)",
        fontFamily: "monospace",
      }}>
        {screens.find(s => s.id === active)?.desc}
      </div>

      {/* Wireframe display */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        padding: "8px 16px 40px",
      }}>
        <svg
          viewBox="0 0 375 780"
          width="375"
          style={{
            maxWidth: "100%",
            filter: "drop-shadow(0 4px 24px rgba(0,0,0,0.08))",
          }}
        >
          <Screen />
        </svg>
      </div>

      {/* Annotations */}
      <div style={{
        padding: "0 24px 40px",
        maxWidth: 420,
        margin: "0 auto",
      }}>
        <div style={{
          padding: 16,
          background: "var(--bg-element)",
          borderRadius: 10,
          border: "1px solid var(--border)",
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-primary)", fontFamily: "monospace", marginBottom: 8 }}>
            📝 Notas de diseño
          </div>
          <div style={{ fontSize: 10, color: "var(--text-secondary)", fontFamily: "monospace", lineHeight: 1.6 }}>
            {{
              landing: "Hero claro con propuesta de valor. Sección 'How it works' en 4 pasos. Social proof con stats y testimonial. CTA repetido al final.",
              login: "Selector de rol (Worker/Manager) como primer paso. Formulario limpio con opción de Google login. El flujo de Manager pedirá ABN en paso 2.",
              search: "Filtros rápidos por pills. Cards con info clave: foto, rating, ruta, rol, fechas. Badge de verificación visible. CTA directo en cada card.",
              profile: "Header con stats principales. Skills verificadas con nivel y quién las verificó. Historial de trabajo con ratings. Disponibilidad y destinos deseados.",
              "swap-detail": "Vista lado a lado: vos vs match. Estado de aprobación de cada manager. Barra de compatibilidad de skills. Timeline del proceso de swap.",
              manager: "Stats rápidos arriba. Cola de aprobaciones pendientes con preview de candidato. Lista de workers actuales. Acciones rápidas para verificar skills.",
              chat: "Barra de contexto del swap arriba. Mensajes con timestamps. Mensajes del sistema (aprobaciones). Quick actions para compartir info relevante.",
              reviews: "Rating por categorías (reliability, skill, attitude) con estrellas grandes. Campo de comentarios. Verificación de skills con selector de nivel.",
            }[active]}
          </div>
        </div>
      </div>
    </div>
  );
}
