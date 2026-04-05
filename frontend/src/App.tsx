import { useMemo, useState } from "react";

type NavSection =
  | "overview"
  | "modules"
  | "homepage"
  | "flows"
  | "architecture"
  | "monetization"
  | "roadmap"
  | "database"
  | "growth"
  | "branding";

type ModuleBlueprint = {
  id: number;
  name: string;
  goal: string;
  mvpFeatures: string[];
};

type Flow = {
  name: string;
  steps: string[];
};

const navItems: { key: NavSection; label: string }[] = [
  { key: "overview", label: "Platform Map" },
  { key: "modules", label: "Core Modules" },
  { key: "homepage", label: "Homepage Layout" },
  { key: "flows", label: "User Flows" },
  { key: "architecture", label: "Tech Architecture" },
  { key: "monetization", label: "Monetization" },
  { key: "roadmap", label: "MVP Roadmap" },
  { key: "database", label: "Database Overview" },
  { key: "growth", label: "Acquisition" },
  { key: "branding", label: "Brand Direction" },
];

const modules: ModuleBlueprint[] = [
  {
    id: 1,
    name: "Dashboard",
    goal: "A morning-to-night control center with AI guidance.",
    mvpFeatures: [
      "Daily agenda cards (work, shopping, learning, health).",
      "Unified notifications and reminders.",
      "AI daily briefing and action recommendations.",
    ],
  },
  {
    id: 2,
    name: "Marketplace",
    goal: "Global buying and selling, starting with Africa-first logistics.",
    mvpFeatures: [
      "Product catalog, seller stores, and buyer checkout.",
      "Regional shipping and local payment methods.",
      "Trust badges and dispute resolution workflow.",
    ],
  },
  {
    id: 3,
    name: "Work & Freelancing Hub",
    goal: "Enable jobs, gigs, and remote project collaboration.",
    mvpFeatures: [
      "Talent profiles and verified skill portfolios.",
      "Job board with escrow-based milestone payments.",
      "Team workspace with task tracking.",
    ],
  },
  {
    id: 4,
    name: "Wallet & Payments",
    goal: "Multi-currency wallet for consumer and business payments.",
    mvpFeatures: [
      "Wallet balances in local and major global currencies.",
      "Peer-to-peer transfer and merchant checkout.",
      "KYC onboarding and fraud monitoring rules engine.",
    ],
  },
  {
    id: 5,
    name: "Messaging & Social",
    goal: "Encrypted communication, communities, and creator engagement.",
    mvpFeatures: [
      "1:1 and group messaging with encryption.",
      "Community feeds and interest groups.",
      "Business pages with lead capture tools.",
    ],
  },
  {
    id: 6,
    name: "Learning Platform",
    goal: "Career and business education with certificates.",
    mvpFeatures: [
      "Course catalog with short data-light videos.",
      "Micro-learning tracks for mobile usage.",
      "Creator and institution onboarding.",
    ],
  },
  {
    id: 7,
    name: "Entertainment Hub",
    goal: "Video, live, and news experiences in one stream.",
    mvpFeatures: [
      "Short videos and live events feed.",
      "Local and global trend channels.",
      "Creator monetization hooks.",
    ],
  },
  {
    id: 8,
    name: "Health & Productivity",
    goal: "Personal wellbeing and high-performance tracking.",
    mvpFeatures: [
      "Habit tracker, sleep and hydration logs.",
      "Calendar sync and focus sprint timers.",
      "AI coach nudges for wellness goals.",
    ],
  },
  {
    id: 9,
    name: "Business Builder",
    goal: "Launch and scale digital businesses from mobile.",
    mvpFeatures: [
      "No-code storefront and checkout pages.",
      "Digital product uploads and subscription plans.",
      "Automated marketing funnel templates.",
    ],
  },
  {
    id: 10,
    name: "Integrated AI Assistant",
    goal: "Cross-app assistant available in every flow.",
    mvpFeatures: [
      "Context-aware assistant panel on all pages.",
      "Shopping, scheduling, learning, and support prompts.",
      "AI safety controls and human handoff.",
    ],
  },
];

const userFlows: Flow[] = [
  {
    name: "New User Onboarding",
    steps: [
      "Sign up with phone/email and choose language.",
      "Complete lightweight KYC and fraud check.",
      "Select goals: work, commerce, education, health.",
      "AI assistant generates personalized dashboard.",
    ],
  },
  {
    name: "Buyer Journey",
    steps: [
      "Discover products via feed or search.",
      "Chat seller, compare offers, and add to cart.",
      "Pay with wallet or local payment rail.",
      "Track delivery and submit trust rating.",
    ],
  },
  {
    name: "Seller / Creator Journey",
    steps: [
      "Create store and verify business profile.",
      "Upload physical or digital products.",
      "Run social/live campaigns and collect orders.",
      "Withdraw earnings to local bank or mobile money.",
    ],
  },
  {
    name: "Freelancer Journey",
    steps: [
      "Create skills profile and portfolio.",
      "Apply to gigs or receive job invites.",
      "Deliver milestones with escrow release.",
      "Build reputation score and recurring clients.",
    ],
  },
  {
    name: "Learning Journey",
    steps: [
      "Take skill assessment and learning recommendation.",
      "Enroll in mobile-first lessons.",
      "Complete projects and pass assessments.",
      "Earn verified credential on profile.",
    ],
  },
  {
    name: "Daily AI Copilot Journey",
    steps: [
      "Morning: AI agenda and priority planner.",
      "Day: AI automates tasks across modules.",
      "Evening: AI recap, financial and health insights.",
      "Next-day recommendations and reminders.",
    ],
  },
];

const databaseGroups = [
  {
    name: "Identity & Security",
    tables: ["users", "profiles", "kyc_records", "sessions", "risk_events", "device_fingerprints"],
  },
  {
    name: "Commerce & Payments",
    tables: ["stores", "products", "catalog_items", "orders", "transactions", "wallets", "exchange_rates"],
  },
  {
    name: "Social & Communication",
    tables: ["conversations", "messages", "groups", "posts", "reactions", "follows"],
  },
  {
    name: "Learning & Media",
    tables: ["courses", "lessons", "enrollments", "assessments", "media_assets", "watch_history"],
  },
  {
    name: "Work & Productivity",
    tables: ["jobs", "proposals", "contracts", "tasks", "health_logs", "habit_events"],
  },
  {
    name: "Business Builder",
    tables: ["business_workspaces", "funnels", "digital_products", "subscriptions", "campaigns"],
  },
];

function App() {
  const [activeSection, setActiveSection] = useState<NavSection>("overview");

  const currentTitle = useMemo(
    () => navItems.find((item) => item.key === activeSection)?.label ?? "Platform Map",
    [activeSection],
  );

  return (
    <main className="omnilife-app">
      <header className="hero">
        <div className="hero-badge">OMNILIFE SUPER APP</div>
        <h1>
          Build the Global <span>Life Super App</span>
        </h1>
        <p className="hero-copy">
          A scalable digital ecosystem designed to keep users inside one platform from morning to
          night: productivity, commerce, communication, entertainment, learning, health, and
          business growth.
        </p>
        <div className="hero-kpis">
          <article>
            <h3>Africa-first launch</h3>
            <p>Localized payments, low-data UX, multilingual access, and trust infrastructure.</p>
          </article>
          <article>
            <h3>Global-ready architecture</h3>
            <p>Multi-region cloud, modular services, and multi-currency wallet foundation.</p>
          </article>
          <article>
            <h3>AI on every page</h3>
            <p>Integrated assistant for decisions, automation, and personalized guidance.</p>
          </article>
        </div>
      </header>

      <section className="main-layout">
        <nav className="side-nav" aria-label="Super app blueprint navigation">
          <h2>Blueprint Navigator</h2>
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={item.key === activeSection ? "nav-button active" : "nav-button"}
              onClick={() => setActiveSection(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <section className="content-panel">
          <h2>{currentTitle}</h2>

          {activeSection === "overview" ? (
            <div className="stack">
              <article className="card">
                <h3>Full website structure (pages & navigation map)</h3>
                <div className="grid two">
                  <div>
                    <h4>Main navigation</h4>
                    <ul>
                      <li>Home (global dashboard)</li>
                      <li>Marketplace</li>
                      <li>Work</li>
                      <li>Wallet</li>
                      <li>Social</li>
                      <li>Learning</li>
                      <li>Entertainment</li>
                      <li>Health</li>
                      <li>Business Builder</li>
                      <li>AI Assistant</li>
                    </ul>
                  </div>
                  <div>
                    <h4>Platform pages</h4>
                    <ul>
                      <li>Onboarding & KYC</li>
                      <li>User Profile & Settings</li>
                      <li>Notifications Center</li>
                      <li>Security Center</li>
                      <li>Admin & Fraud Console</li>
                      <li>Help Center & Disputes</li>
                      <li>Partner / API Portal</li>
                    </ul>
                  </div>
                </div>
              </article>
              <article className="card">
                <h3>Scalability principles</h3>
                <ul>
                  <li>Mobile-first UI with adaptive components and lazy loading.</li>
                  <li>Data-light mode: compressed media, skeleton states, edge caching.</li>
                  <li>Region-first expansion: Africa launch clusters, then global regional shards.</li>
                  <li>Trust by design: KYC, fraud controls, and encrypted messaging.</li>
                </ul>
              </article>
            </div>
          ) : null}

          {activeSection === "modules" ? (
            <div className="grid two">
              {modules.map((module) => (
                <article className="card" key={module.id}>
                  <h3>
                    {module.id}. {module.name}
                  </h3>
                  <p>{module.goal}</p>
                  <h4>MVP feature set</h4>
                  <ul>
                    {module.mvpFeatures.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          ) : null}

          {activeSection === "homepage" ? (
            <div className="stack">
              <article className="card">
                <h3>Homepage layout design</h3>
                <ol>
                  <li>
                    <strong>Top utility bar:</strong> language, region, wallet snapshot, alerts.
                  </li>
                  <li>
                    <strong>Hero:</strong> personalized greeting plus AI briefing card.
                  </li>
                  <li>
                    <strong>Quick actions:</strong> Send money, Buy, Sell, Find Work, Learn, Chat.
                  </li>
                  <li>
                    <strong>Dynamic feed:</strong> marketplace, jobs, content, and community updates.
                  </li>
                  <li>
                    <strong>Module shortcuts:</strong> 10 core modules in thumb-friendly layout.
                  </li>
                  <li>
                    <strong>Progress strip:</strong> daily health and productivity stats.
                  </li>
                  <li>
                    <strong>Business spotlight:</strong> creator tools and monetization prompts.
                  </li>
                  <li>
                    <strong>Persistent AI dock:</strong> available on all pages for contextual help.
                  </li>
                </ol>
              </article>
              <article className="card">
                <h3>Low-data and mobile-first UX standards</h3>
                <ul>
                  <li>Default to compressed assets and progressive image quality.</li>
                  <li>Infinite feeds with smart prefetch under bandwidth constraints.</li>
                  <li>Offline-tolerant states for weak networks and intermittent sessions.</li>
                  <li>Touch-first navigation and bottom-tab ergonomics.</li>
                </ul>
              </article>
            </div>
          ) : null}

          {activeSection === "flows" ? (
            <div className="stack">
              {userFlows.map((flow) => (
                <article className="card" key={flow.name}>
                  <h3>{flow.name}</h3>
                  <ol>
                    {flow.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </article>
              ))}
            </div>
          ) : null}

          {activeSection === "architecture" ? (
            <div className="stack">
              <article className="card">
                <h3>Technical architecture (realistic and scalable)</h3>
                <div className="grid two">
                  <div>
                    <h4>Frontend layer</h4>
                    <ul>
                      <li>React SPA with module federation readiness.</li>
                      <li>Design system tokens for consistent multi-brand rollout.</li>
                      <li>Edge-delivered static assets with country-aware localization.</li>
                    </ul>
                  </div>
                  <div>
                    <h4>Backend services</h4>
                    <ul>
                      <li>API gateway + service mesh for 10 core modules.</li>
                      <li>Identity, payments, commerce, messaging, and AI services split.</li>
                      <li>Event bus for cross-module updates and analytics.</li>
                    </ul>
                  </div>
                  <div>
                    <h4>Security stack</h4>
                    <ul>
                      <li>KYC provider integration and risk scoring service.</li>
                      <li>End-to-end encrypted messaging channels.</li>
                      <li>Fraud detection using behavioral + transaction signals.</li>
                    </ul>
                  </div>
                  <div>
                    <h4>Infrastructure</h4>
                    <ul>
                      <li>Multi-region cloud deployment with active-active regions.</li>
                      <li>CDN, object storage, and queue-based async workers.</li>
                      <li>Observability: logs, traces, fraud and growth dashboards.</li>
                    </ul>
                  </div>
                </div>
              </article>
              <article className="card">
                <h3>Africa-first then global expansion model</h3>
                <ul>
                  <li>Phase 1: Nigeria, Kenya, Ghana, South Africa localization stack.</li>
                  <li>Phase 2: Pan-African interoperability and cross-border settlement.</li>
                  <li>Phase 3: Add MENA, LATAM, and Southeast Asia with replicated modules.</li>
                </ul>
              </article>
            </div>
          ) : null}

          {activeSection === "monetization" ? (
            <div className="grid two">
              <article className="card">
                <h3>Core monetization engines</h3>
                <ul>
                  <li>Marketplace take rate on transactions.</li>
                  <li>Wallet transfer and merchant processing fees.</li>
                  <li>Freelancing escrow and contract commission.</li>
                  <li>Subscriptions for premium creators and businesses.</li>
                </ul>
              </article>
              <article className="card">
                <h3>Expansion monetization</h3>
                <ul>
                  <li>Ad network with privacy-safe targeting.</li>
                  <li>AI assistant premium productivity packages.</li>
                  <li>Learning certifications and enterprise partnerships.</li>
                  <li>API and infrastructure services for third-party sellers.</li>
                </ul>
              </article>
            </div>
          ) : null}

          {activeSection === "roadmap" ? (
            <div className="stack">
              <article className="card">
                <h3>MVP development roadmap</h3>
                <ol>
                  <li>
                    <strong>Foundation:</strong> auth, KYC, wallet ledger, notifications, AI shell.
                  </li>
                  <li>
                    <strong>Commerce core:</strong> marketplace listing, checkout, payouts, disputes.
                  </li>
                  <li>
                    <strong>Engagement core:</strong> messaging, social feed, creator profiles.
                  </li>
                  <li>
                    <strong>Work + Learning:</strong> gigs, course delivery, profile credentials.
                  </li>
                  <li>
                    <strong>Retention layer:</strong> health/productivity and AI habit loops.
                  </li>
                  <li>
                    <strong>Business builder:</strong> no-code storefront and digital product tools.
                  </li>
                </ol>
              </article>
              <article className="card">
                <h3>Execution metrics for investor readiness</h3>
                <ul>
                  <li>Activation: KYC completion and first transaction rate.</li>
                  <li>Retention: 7-day and 30-day active user rates.</li>
                  <li>Monetization: gross merchandise volume + wallet throughput.</li>
                  <li>Trust: fraud loss rate, dispute closure time, and uptime.</li>
                </ul>
              </article>
            </div>
          ) : null}

          {activeSection === "database" ? (
            <div className="grid two">
              {databaseGroups.map((group) => (
                <article className="card" key={group.name}>
                  <h3>{group.name}</h3>
                  <ul>
                    {group.tables.map((tableName) => (
                      <li key={tableName}>
                        <code>{tableName}</code>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          ) : null}

          {activeSection === "growth" ? (
            <div className="stack">
              <article className="card">
                <h3>User acquisition strategy</h3>
                <ul>
                  <li>City-by-city launch playbooks with local ambassadors.</li>
                  <li>Telco, bank, and university distribution partnerships.</li>
                  <li>Referral engine with wallet credits and creator rewards.</li>
                  <li>SMB onboarding campaigns for digital storefront creation.</li>
                </ul>
              </article>
              <article className="card">
                <h3>Retention loops</h3>
                <ul>
                  <li>AI-powered daily goals connecting commerce and productivity.</li>
                  <li>Wallet incentives for learning, freelancing, and selling activity.</li>
                  <li>Community events and creator live sessions.</li>
                </ul>
              </article>
            </div>
          ) : null}

          {activeSection === "branding" ? (
            <div className="stack">
              <article className="card">
                <h3>Branding direction</h3>
                <p>
                  Premium trust meets community energy. Visual language combines the ecosystem depth
                  of WeChat, commerce confidence of Amazon, social utility of Meta, and payment trust
                  of PayPal while maintaining a unique OMNILIFE identity.
                </p>
                <div className="branding-list">
                  <p>
                    <strong>Color system:</strong> Gold-first premium palette (trust and ambition),
                    supported by deep graphite neutrals for contrast.
                  </p>
                  <p>
                    <strong>Voice:</strong> Confident, empowering, and practical.
                  </p>
                  <p>
                    <strong>Personality:</strong> Smart, secure, and opportunity-driven.
                  </p>
                  <p>
                    <strong>Tagline:</strong> "One Platform for Your Entire Day."
                  </p>
                </div>
              </article>
              <article className="card">
                <h3>Investor-ready positioning</h3>
                <ul>
                  <li>Massive TAM across commerce, fintech, creator economy, and productivity.</li>
                  <li>Multi-engine revenue with defensible data network effects.</li>
                  <li>Africa-first wedge with high global replication potential.</li>
                </ul>
              </article>
            </div>
          ) : null}
        </section>
      </section>

      <aside className="ai-assistant">
        <h2>AI Copilot</h2>
        <p>
          Ask anything: "Plan my day", "Find profitable products", "Draft a course plan", "Detect
          risky transactions".
        </p>
        <div className="assistant-actions">
          <button type="button">Start AI chat</button>
          <button type="button" className="ghost-button">
            Suggested actions
          </button>
        </div>
      </aside>
    </main>
  );
}

export default App;
