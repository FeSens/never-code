#!/usr/bin/env node

/**
 * Initialize the recursive self-improvement loop.
 *
 * Reads vision.md, parses the roadmap, and creates loop-state.json
 * with all unchecked features as pending items ready for scoring.
 *
 * Usage: node .claude/hooks/init-loop.mjs
 *
 * After running this, start Claude Code — the Stop hook will take over
 * and drive the loop. Claude's first task will be to score the features
 * by impact and start implementing the highest-scored one.
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PROJECT_DIR = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const VISION_PATH = join(PROJECT_DIR, "vision.md");
const STATE_PATH = join(PROJECT_DIR, "loop-state.json");

if (existsSync(STATE_PATH)) {
  console.error(
    "loop-state.json already exists. Delete it first to reinitialize, " +
      'or set "phase": "idle" to stop the loop.',
  );
  process.exit(1);
}

if (!existsSync(VISION_PATH)) {
  console.error("vision.md not found. Run /dream-bigger first to create it.");
  process.exit(1);
}

const vision = readFileSync(VISION_PATH, "utf-8");

/**
 * Parse unchecked items from vision.md roadmap.
 * Looks for lines like: - [ ] Feature description
 */
function parseFeatures(content) {
  const features = [];
  const lines = content.split("\n");
  let counter = 1;

  for (const line of lines) {
    // Match unchecked items: - [ ] description
    const match = line.match(/^-\s+\[\s\]\s+(.+)/);
    if (!match) continue;

    const raw = match[1].trim();
    // Split on " — " to separate title from description
    const dashIndex = raw.indexOf(" — ");
    const title = dashIndex > -1 ? raw.slice(0, dashIndex) : raw;
    const description = dashIndex > -1 ? raw.slice(dashIndex + 3) : "";

    features.push({
      id: `feat-1-${counter}`,
      title,
      description,
      scope: inferScope(`${title} ${description}`),
      impact: {
        userValue: 0,
        differentiation: 0,
        feasibility: 0,
        score: 0,
      },
      status: "pending",
      parent: null,
    });
    counter++;
  }

  return features;
}

/**
 * Rough scope inference from feature text.
 * The agent will refine this when it starts working.
 */
function inferScope(text) {
  const scopes = [];
  const lower = text.toLowerCase();
  if (
    lower.includes("ui") ||
    lower.includes("page") ||
    lower.includes("component") ||
    lower.includes("dashboard") ||
    lower.includes("frontend")
  ) {
    scopes.push("apps/web");
  }
  if (
    lower.includes("api") ||
    lower.includes("endpoint") ||
    lower.includes("route") ||
    lower.includes("backend") ||
    lower.includes("server")
  ) {
    scopes.push("apps/api");
  }
  if (
    lower.includes("database") ||
    lower.includes("schema") ||
    lower.includes("migration") ||
    lower.includes("db")
  ) {
    scopes.push("packages/db");
  }
  if (
    lower.includes("type") ||
    lower.includes("validator") ||
    lower.includes("shared") ||
    lower.includes("util")
  ) {
    scopes.push("packages/shared");
  }
  // Default to full-stack if unclear
  if (scopes.length === 0) {
    scopes.push("apps/web", "apps/api");
  }
  return scopes;
}

const features = parseFeatures(vision);

if (features.length === 0) {
  console.error(
    "No unchecked features found in vision.md. " + "Run /dream-bigger to generate new features.",
  );
  process.exit(1);
}

const state = {
  phase: "implementing",
  cycle: 1,
  currentFeature: null,
  features,
  qa: {
    build: null,
    soak: null,
    e2e: null,
    review: null,
    deslop: null,
  },
  history: [],
};

writeFileSync(STATE_PATH, `${JSON.stringify(state, null, 2)}\n`, "utf-8");

console.info(`Initialized loop-state.json with ${features.length} features:`);
for (const f of features) {
  console.info(`  - ${f.id}: ${f.title}`);
}
console.info(
  "\nFeatures have zero impact scores. When Claude starts, the stop hook will " +
    "instruct it to score each feature and begin implementing the highest-scored one.",
);
console.info("\nStart Claude Code to begin the autonomous loop.");
