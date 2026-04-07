import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Health — Never Code",
};

interface HealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
  services?: Record<string, string>;
}

async function getHealth(): Promise<HealthResponse | null> {
  try {
    const res = await fetch("http://localhost:4000/health?detailed=true", {
      cache: "no-store",
    });
    return (await res.json()) as HealthResponse;
  } catch {
    return null;
  }
}

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
}

export default async function HealthPage() {
  const health = await getHealth();
  const apiOk = health?.status === "ok";

  return (
    <main>
      <section>
        <h1>System Health</h1>
        <p className="tagline">Real-time status of all services.</p>
      </section>

      <section>
        <h2>Services</h2>
        <div className="health-grid">
          <div className={`health-card ${apiOk ? "status-ok" : "status-error"}`}>
            <span className="health-indicator">{apiOk ? "●" : "○"}</span>
            <span className="health-label">API Server</span>
            <span className="health-value">{apiOk ? "Healthy" : "Unreachable"}</span>
          </div>
          <div className="health-card">
            <span className="health-indicator">●</span>
            <span className="health-label">Uptime</span>
            <span className="health-value">{health ? formatUptime(health.uptime) : "—"}</span>
          </div>
          <div className="health-card">
            <span className="health-indicator">●</span>
            <span className="health-label">Last Check</span>
            <span className="health-value">
              {health ? new Date(health.timestamp).toLocaleTimeString() : "—"}
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
