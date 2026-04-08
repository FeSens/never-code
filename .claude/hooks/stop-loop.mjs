#!/usr/bin/env node

/**
 * Stop Hook Orchestrator — the brain of the recursive self-improvement loop.
 *
 * Called by Claude Code's Stop hook after stop-gate.sh.
 * Reads loop-state.json, determines the current phase, outputs the next
 * instruction to stderr, and exits 2 to block Claude from stopping.
 *
 * Phase transitions: IMPLEMENTING → QA → DREAMING → IMPLEMENTING → ...
 * Exit 0 (allow stop) only when phase == "idle" or loop-state.json is absent.
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PROJECT_DIR = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const STATE_PATH = join(PROJECT_DIR, "loop-state.json");
const EXPERIMENTS_PATH = join(PROJECT_DIR, "experiments.tsv");

// ── Helpers ──────────────────────────────────────────────────────────────────

function readState() {
  if (!existsSync(STATE_PATH)) return null;
  return JSON.parse(readFileSync(STATE_PATH, "utf-8"));
}

function writeState(state) {
  writeFileSync(STATE_PATH, `${JSON.stringify(state, null, 2)}\n`, "utf-8");
}

function emit(message) {
  process.stderr.write(`${message}\n`);
}

function blockStop(message) {
  emit(message);
  process.exit(2);
}

function allowStop() {
  process.exit(0);
}

/**
 * Count recent consecutive discards for a feature by scanning experiments.tsv.
 * Looks for "discarded" entries whose description contains the feature title.
 */
function countRecentDiscards(state) {
  if (!existsSync(EXPERIMENTS_PATH)) return 0;
  const feature = state.features.find((f) => f.id === state.currentFeature);
  if (!feature) return 0;

  const lines = readFileSync(EXPERIMENTS_PATH, "utf-8").trim().split("\n");
  const titleLower = feature.title.toLowerCase();
  let consecutive = 0;

  // Walk from the end — count consecutive discards matching this feature
  for (let i = lines.length - 1; i >= 0; i--) {
    const cols = lines[i].split("\t");
    const status = cols[2];
    const description = (cols[6] || "").toLowerCase();

    if (!description.includes(titleLower)) continue;
    if (status === "discarded") {
      consecutive++;
    } else {
      break; // streak broken
    }
  }
  return consecutive;
}

/** Pick the pending feature with the highest impact score. */
function pickNextFeature(state) {
  return (
    state.features
      .filter((f) => f.status === "pending")
      .sort((a, b) => b.impact.score - a.impact.score)[0] || null
  );
}

/** Check if all children of a decomposed feature are done. */
function checkDecomposedComplete(state) {
  for (const feature of state.features) {
    if (feature.status !== "decomposed") continue;
    const children = state.features.filter((f) => f.parent === feature.id);
    if (children.length > 0 && children.every((c) => c.status === "done")) {
      feature.status = "done";
    }
  }
}

// ── Phase Handlers ───────────────────────────────────────────────────────────

function handleImplementing(state) {
  checkDecomposedComplete(state);

  const current = state.features.find((f) => f.id === state.currentFeature);

  // Current feature still in progress — check for stuck
  if (current && current.status === "in_progress") {
    const discards = countRecentDiscards(state);
    if (discards >= 3) {
      current.status = "decomposed";
      writeState(state);
      blockStop(
        `The feature "${current.title}" has failed 3+ times. Self-healing: decompose it.\n\nDO THIS NOW:\n1. Analyze why "${current.title}" kept failing (check experiments.tsv and logs/).\n2. Break it into 2-3 smaller, independently implementable sub-features.\n3. For each sub-feature, score: userValue (inherit ${current.impact.userValue}), differentiation (inherit ${current.impact.differentiation}), feasibility (estimate fresh).\n4. Compute score = (userValue * 0.4) + (differentiation * 0.3) + (feasibility * 0.3).\n5. Read loop-state.json, add the sub-features with status "pending" and parent "${current.id}".\n6. Write the updated loop-state.json.\n7. Then pick the highest-scored pending feature and run /ralph on it.`,
      );
    }
    // Still working on it — nudge to continue
    blockStop(
      `You're in the autonomous loop (cycle ${state.cycle}). ` +
        `Feature "${current.title}" is still in_progress.\n\n` +
        `Continue working: /ralph ${current.title} — ${current.description}`,
    );
  }

  // Current feature done or no current — pick next
  if (current && current.status === "done") {
    state.currentFeature = null;
  }

  const next = pickNextFeature(state);

  if (next) {
    next.status = "in_progress";
    state.currentFeature = next.id;
    writeState(state);
    blockStop(
      `Autonomous loop (cycle ${state.cycle}). Next feature (impact: ${next.impact.score}):\n\n/ralph ${next.title} — ${next.description}\n\nScope: ${next.scope.join(", ")}\nWhen done, update loop-state.json: set this feature's status to "done".`,
    );
  }

  // No features left — transition to QA
  state.phase = "qa";
  state.qa = { build: null, screenshots: null, e2e: null, review: null, deslop: null };
  writeState(state);
  blockStop(
    `All features for cycle ${state.cycle} are complete! Transitioning to QA audit.\n\nStep 1 of 4: SCREENSHOTS\n- Discover all routes in apps/web/src/app/ (look for page.tsx files).\n- Screenshot each route using /screenshot <path>.\n- Visually inspect each screenshot for broken layouts, missing content, styling issues.\n- Fix any issues found.\n- When all screenshots look good, update loop-state.json: set qa.screenshots to "pass".`,
  );
}

function handleQa(state) {
  const qa = state.qa;
  const steps = ["build", "screenshots", "e2e", "review", "deslop"];
  const instructions = {
    build:
      "QA Step 1/5: BUILD VERIFICATION\n" +
      "- Run: pnpm build\n" +
      "- This catches bundler-specific errors (webpack resolution, missing modules) that typecheck misses.\n" +
      "- If the build fails, fix the issue and re-run.\n" +
      `- When it passes, update loop-state.json: set qa.build to "pass".`,
    screenshots:
      "QA Step 2/5: SCREENSHOTS\n" +
      "- Discover all routes in apps/web/src/app/ (look for page.tsx files).\n" +
      "- Screenshot each route using /screenshot <path>.\n" +
      "- Visually inspect for broken layouts, missing content, styling issues.\n" +
      "- Fix any issues found.\n" +
      `- When done, update loop-state.json: set qa.screenshots to "pass".`,
    e2e:
      "QA Step 3/5: E2E TESTS\n" +
      "- Run: cd apps/web && PLAYWRIGHT_HTML_OPEN=never npx playwright test --reporter=line\n" +
      "- If tests fail, fix the issues and re-run.\n" +
      `- When all pass, update loop-state.json: set qa.e2e to "pass".`,
    review:
      "QA Step 4/5: CODE REVIEW\n" +
      "- Run /review on all changes made during this cycle.\n" +
      "- Fix any issues the review identifies.\n" +
      `- When clean, update loop-state.json: set qa.review to "pass".`,
    deslop:
      "QA Step 5/5: DESLOP\n" +
      "- Run /deslop to clean up AI-generated bloat across the entire cycle.\n" +
      "- Run pnpm check to verify nothing broke.\n" +
      `- When clean, update loop-state.json: set qa.deslop to "pass".`,
  };

  // Find first failed step — re-run it
  for (const step of steps) {
    if (qa[step] === "fail") {
      blockStop(`QA FAILED on: ${step}. Fix the issues and re-run.\n\n${instructions[step]}`);
    }
  }

  // Find first null step — run it
  for (const step of steps) {
    if (qa[step] === null) {
      blockStop(
        `Autonomous loop (cycle ${state.cycle}) — QA audit in progress.\n\n${instructions[step]}`,
      );
    }
  }

  // All passed — transition to dreaming
  state.phase = "dreaming";
  const completed = state.features.filter((f) => f.status === "done").length;
  const decomposed = state.features.filter((f) => f.status === "decomposed").length;
  state.history.push({
    cycle: state.cycle,
    completed,
    decomposed,
    timestamp: new Date().toISOString(),
  });
  writeState(state);
  blockStop(
    `QA audit PASSED for cycle ${state.cycle}! (${completed} features completed, ${decomposed} decomposed)\n\nTransitioning to DREAMING phase.\nRun /dream-bigger to generate the next cycle's features.\n\nIMPORTANT: After /dream-bigger finishes, score each feature and write them to loop-state.json:\n- For each feature: userValue (1-10), differentiation (1-10), feasibility (1-10)\n- score = (userValue * 0.4) + (differentiation * 0.3) + (feasibility * 0.3)\n- Set status to "pending", parent to null\n- Clear old done/decomposed features from the features array\n- Keep the phase as "dreaming" until features are written`,
  );
}

function handleDreaming(state) {
  const pendingFeatures = state.features.filter((f) => f.status === "pending");

  if (pendingFeatures.length > 0) {
    // New features are ready — transition to implementing
    state.phase = "implementing";
    state.cycle++;
    const next = pickNextFeature(state);
    if (next) {
      next.status = "in_progress";
      state.currentFeature = next.id;
    }
    writeState(state);
    blockStop(
      `Cycle ${state.cycle} starting! ${pendingFeatures.length} new features queued.\n\nFirst feature (impact: ${next.impact.score}): /ralph ${next.title} — ${next.description}\n\nScope: ${next.scope.join(", ")}\nWhen done, update loop-state.json: set this feature's status to "done".`,
    );
  }

  // No features yet — tell Claude to run dream-bigger
  blockStop(
    `Autonomous loop — DREAMING phase (cycle ${state.cycle} complete).\n\nRun /dream-bigger to generate the next cycle's features.\n\nAfter generating features, write them to loop-state.json:\n- Score each: userValue (1-10), differentiation (1-10), feasibility (1-10)\n- Compute: score = (userValue * 0.4) + (differentiation * 0.3) + (feasibility * 0.3)\n- Set status "pending", generate unique IDs (feat-<cycle>-<n>)\n- Remove old done/decomposed features from the array\n- Keep phase as "dreaming" — the loop will transition automatically`,
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

const state = readState();

if (!state || state.phase === "idle") {
  allowStop();
}

switch (state.phase) {
  case "implementing":
    handleImplementing(state);
    break;
  case "qa":
    handleQa(state);
    break;
  case "dreaming":
    handleDreaming(state);
    break;
  default:
    allowStop();
}
