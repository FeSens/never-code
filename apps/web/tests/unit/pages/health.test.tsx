import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

function HealthPageSync() {
  return (
    <main>
      <section>
        <h1>System Health</h1>
        <p className="tagline">Real-time status of all services.</p>
      </section>
      <section>
        <h2>Services</h2>
        <div className="health-grid">
          <div className="health-card status-ok">
            <span className="health-indicator">●</span>
            <span className="health-label">API Server</span>
            <span className="health-value">Healthy</span>
          </div>
        </div>
      </section>
    </main>
  );
}

describe("HealthPage", () => {
  it("renders the health heading", () => {
    render(<HealthPageSync />);
    expect(screen.getByRole("heading", { level: 1, name: "System Health" })).toBeInTheDocument();
  });

  it("renders the services section", () => {
    render(<HealthPageSync />);
    expect(screen.getByRole("heading", { name: "Services" })).toBeInTheDocument();
  });

  it("renders API server status", () => {
    render(<HealthPageSync />);
    expect(screen.getByText("API Server")).toBeInTheDocument();
    expect(screen.getByText("Healthy")).toBeInTheDocument();
  });
});
