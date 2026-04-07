const STACK = ["Next.js", "Hono", "tRPC", "Drizzle", "PostgreSQL", "Vitest", "Playwright", "Biome"];

const COMMANDS = [
  { name: "/implement", desc: "Blueprint pattern: deterministic + agent nodes, TDD, 2-round cap" },
  {
    name: "/experiment",
    desc: "Autonomous loop: hypothesize, implement, evaluate, keep or discard",
  },
  { name: "/parallel-implement", desc: "Dual worktree agents for backend + frontend in parallel" },
  { name: "/test-e2e", desc: "E2E against real backend with healer loop" },
  { name: "/tdd", desc: "Strict red-green-refactor cycle" },
  { name: "/review", desc: "Audit changes against conventions" },
];

const STATS = [
  { value: "2", label: "Max retries" },
  { value: "0", label: "JS shipped" },
  { value: "100%", label: "Type-safe" },
];

const PRINCIPLES = [
  {
    key: "Immutable gates",
    desc: "Lint, typecheck, and test configs are read-only. Agents fix code, not rules.",
  },
  {
    key: "Git as undo",
    desc: "Every experiment is a commit. Keep what works, reset what doesn't.",
  },
  {
    key: "Deterministic first",
    desc: "Everything that can be deterministic is. LLMs only handle what requires reasoning.",
  },
  {
    key: "2-round cap",
    desc: "Max 2 fix attempts per gate. No infinite loops. Escalate to human.",
  },
];

export default function HomePage() {
  return (
    <main>
      <section>
        <h1>Never Code</h1>
        <p className="tagline">The gold standard for agentic fullstack engineering.</p>
      </section>

      <section>
        <h2>What Is This</h2>
        <p>
          A TypeScript fullstack monorepo with an autonomous Claude Code harness. Blueprints enforce
          deterministic quality gates. Experiment loops iterate toward goals. Agents write code,
          machines verify it, humans trust the result.
        </p>
      </section>

      <section>
        <h2>By The Numbers</h2>
        <div className="stats-grid">
          {STATS.map((stat) => (
            <div key={stat.label} className="stat">
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>The Stack</h2>
        <div className="stack-grid">
          {STACK.map((tech) => (
            <span key={tech} className="stack-item">
              {tech}
            </span>
          ))}
        </div>
      </section>

      <section>
        <h2>The Harness</h2>
        <ul className="command-list">
          {COMMANDS.map((cmd) => (
            <li key={cmd.name}>
              <span className="command-name">{cmd.name}</span>
              <span className="command-desc">{cmd.desc}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>The Loop</h2>
        <div className="loop-diagram">
          <span className="det">{"[DETERMINISTIC]"}</span> Create branch{"\n"}
          {"      ↓\n"}
          <span className="agent">{"[AGENT]"}</span> Write failing tests{"\n"}
          {"      ↓\n"}
          <span className="det">{"[DETERMINISTIC]"}</span> Confirm tests fail{"\n"}
          {"      ↓\n"}
          <span className="agent">{"[AGENT]"}</span> Implement feature{"\n"}
          {"      ↓\n"}
          <span className="det">{"[DETERMINISTIC]"}</span> Lint → Typecheck → Test{"\n"}
          {"      ↓\n"}
          <span className="decision">{"[KEEP or DISCARD]"}</span>
        </div>
      </section>

      <section>
        <h2>Principles</h2>
        <ul className="principles">
          {PRINCIPLES.map((p) => (
            <li key={p.key}>
              <strong>{p.key}.</strong> {p.desc}
            </li>
          ))}
        </ul>
      </section>

      <footer>Built by agents, verified by machines, trusted by humans.</footer>
    </main>
  );
}
