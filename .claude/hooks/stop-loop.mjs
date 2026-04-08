#!/usr/bin/env node

/**
 * Stop Hook Orchestrator — the brain of the recursive self-improvement loop.
 *
 * Called by Claude Code's Stop hook after stop-gate.sh.
 * Reads loop-state.json, determines the current phase, outputs the next
 * instruction to stderr, and exits 2 to block Claude from stopping.
 *
 * Phase transitions: IMPLEMENTING → QA → EVOLVING → DREAMING → IMPLEMENTING
 * Exit 0 (allow stop) only when phase == "idle" or loop-state.json is absent.
 */

import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PROJECT_DIR = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const STATE_PATH = join(PROJECT_DIR, "loop-state.json");
const STATE_TMP = join(PROJECT_DIR, "loop-state.json.tmp");
const EXPERIMENTS_PATH = join(PROJECT_DIR, "experiments.tsv");

// ── Helpers ──────────────────────────────────────────────────────────────────

function readState() {
  if (!existsSync(STATE_PATH)) return null;
  try {
    return JSON.parse(readFileSync(STATE_PATH, "utf-8"));
  } catch (err) {
    emit(
      `ERROR: loop-state.json is corrupted and cannot be parsed.\nRaw error: ${err.message}\n\nTo recover:\n1. Check loop-state.json for syntax errors (missing commas, brackets)\n2. Fix the JSON manually, or delete loop-state.json and re-run: node .claude/hooks/init-loop.mjs\n3. If you have a git backup: git checkout -- loop-state.json`,
    );
    process.exit(0); // Allow stop — can't orchestrate with broken state
  }
}

/** Atomic write: write to .tmp, then rename. Prevents mid-write corruption. */
function writeState(state) {
  const json = `${JSON.stringify(state, null, 2)}\n`;
  writeFileSync(STATE_TMP, json, "utf-8");
  renameSync(STATE_TMP, STATE_PATH);
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

  try {
    const lines = readFileSync(EXPERIMENTS_PATH, "utf-8").trim().split("\n");
    const titleLower = feature.title.toLowerCase();
    let consecutive = 0;

    for (let i = lines.length - 1; i >= 0; i--) {
      const cols = lines[i].split("\t");
      if (cols.length < 7) continue; // Skip malformed rows
      const status = cols[2];
      const description = (cols[6] || "").toLowerCase();

      if (!description.includes(titleLower)) continue;
      if (status === "discarded") {
        consecutive++;
      } else {
        break;
      }
    }
    return consecutive;
  } catch {
    return 0; // TSV unreadable — don't block on it
  }
}

/** Pick the pending feature with the highest impact score. */
function pickNextFeature(state) {
  const pending = state.features.filter(
    (f) =>
      f.status === "pending" &&
      f.impact &&
      typeof f.impact.score === "number" &&
      f.impact.score > 0,
  );
  if (pending.length === 0) return null;
  pending.sort((a, b) => b.impact.score - a.impact.score);
  return pending[0];
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

/**
 * Build crash-recovery context from git log + loop state.
 * Helps Claude reconstruct what was happening if session died.
 */
function buildRecoveryContext(state) {
  const current = state.features.find((f) => f.id === state.currentFeature);
  const featureCtx = current
    ? `Current feature: "${current.title}" (${current.status})`
    : "No current feature";
  const stats = {
    done: state.features.filter((f) => f.status === "done").length,
    pending: state.features.filter((f) => f.status === "pending").length,
    inProgress: state.features.filter((f) => f.status === "in_progress").length,
  };
  return `\n--- Recovery Context ---\nPhase: ${state.phase} | Cycle: ${state.cycle}\n${featureCtx}\nFeatures: ${stats.done} done, ${stats.inProgress} in progress, ${stats.pending} pending\nRead loop-state.json and git log --oneline -10 if you need more context.\n--- End Recovery Context ---`;
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
      `You're in the autonomous loop (cycle ${state.cycle}). Feature "${current.title}" is still in_progress.\n\nContinue working: /ralph ${current.title} — ${current.description}\n\nIMPORTANT: When ralph completes ALL stories for this feature, you MUST update loop-state.json:\nRead the file, find the feature with id "${current.id}", set its status to "done", write the file back.${buildRecoveryContext(state)}`,
    );
  }

  // Current feature done or no current — pick next
  if (current && current.status === "done") {
    state.currentFeature = null;
  }

  // Check for unscored features — prompt scoring before picking
  const unscored = state.features.filter(
    (f) => f.status === "pending" && (!f.impact || !f.impact.score || f.impact.score === 0),
  );
  if (
    unscored.length > 0 &&
    state.features.filter((f) => f.status === "pending").length === unscored.length
  ) {
    blockStop(
      `Autonomous loop (cycle ${state.cycle}): ${unscored.length} features need impact scores before implementation.\n\nFor each feature in loop-state.json with score 0:\n- userValue (1-10): How much does this improve the end user experience?\n- differentiation (1-10): How much does this set the project apart?\n- feasibility (1-10): How likely is the agent to succeed autonomously?\n- score = (userValue * 0.4) + (differentiation * 0.3) + (feasibility * 0.3)\n\nUpdate loop-state.json with the scores. The loop will pick the highest-scored feature automatically.`,
    );
  }

  const next = pickNextFeature(state);

  if (next) {
    next.status = "in_progress";
    state.currentFeature = next.id;
    writeState(state);
    blockStop(
      `Autonomous loop (cycle ${state.cycle}). Next feature (impact: ${next.impact.score}):\n\n/ralph ${next.title} — ${next.description}\n\nScope: ${next.scope.join(", ")}\n\nIMPORTANT: When ralph completes ALL stories, you MUST update loop-state.json:\nRead the file, find the feature with id "${next.id}", set its status to "done", write the file back.`,
    );
  }

  // No features left — transition to QA
  state.phase = "qa";
  state.qa = { build: null, soak: null, e2e: null, review: null, deslop: null };
  writeState(state);
  blockStop(
    `All features for cycle ${state.cycle} are complete! Transitioning to QA audit.\n\nQA Step 1/5: BUILD VERIFICATION\n- Run: pnpm build\n- If the build fails, fix the issue and re-run.\n- When it passes, update loop-state.json: set qa.build to "pass".`,
  );
}

function handleQa(state) {
  const qa = state.qa;
  const steps = ["build", "soak", "e2e", "review", "deslop"];
  const instructions = {
    build:
      "QA Step 1/5: BUILD VERIFICATION\n" +
      "- Run: pnpm build\n" +
      "- This catches bundler-specific errors (webpack resolution, missing modules) that typecheck misses.\n" +
      "- If the build fails, fix the issue and re-run.\n" +
      `- When it passes, update loop-state.json: set qa.build to "pass".`,
    soak:
      "QA Step 2/5: BROWSER SOAK TEST\n" +
      "- Dispatch a Sonnet subagent: Agent(model: 'sonnet', prompt: '/soak --full')\n" +
      "- Sonnet navigates every route, clicks interactive elements, checks console errors, takes screenshots.\n" +
      "- Read soak-report.json when the subagent finishes.\n" +
      "- If any route fails: fix the issues, then re-dispatch the soak.\n" +
      `- When all routes pass, update loop-state.json: set qa.soak to "pass".`,
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

  // All passed — transition to EVOLVING (meta-loop)
  state.phase = "evolving";
  writeState(state);

  const completed = state.features.filter((f) => f.status === "done").length;
  const decomposed = state.features.filter((f) => f.status === "decomposed").length;

  blockStop(
    `QA audit PASSED for cycle ${state.cycle}! (${completed} done, ${decomposed} decomposed)\n\nTransitioning to EVOLVING phase — the meta-loop.\n\nRun /evolve-harness to analyze this cycle's experiment data and improve the harness:\n1. Read experiments.tsv — what was the kept/discarded ratio this cycle?\n2. Read logs/ for failure patterns — what class of errors kept recurring?\n3. Propose CLAUDE.md rule updates based on evidence (not speculation).\n4. If discard rate > 30%, investigate root causes and add preventive rules.\n5. Commit any rule changes.\n\nWhen done, update loop-state.json: set phase to "dreaming".`,
  );
}

function handleEvolving(state) {
  // Evolving is done when the agent sets phase to "dreaming"
  // If we're still here, nudge them to finish
  blockStop(
    `Autonomous loop — EVOLVING phase (cycle ${state.cycle}).\n\nThe meta-loop: analyze what worked and what didn't, then improve the harness.\n\nIf you haven't already:\n1. Run /evolve-harness or manually review experiments.tsv\n2. Check the kept/discarded ratio — if < 70%, something is wrong\n3. Update CLAUDE.md rules based on evidence\n4. Run /scorecard to see agent performance metrics\n\nWhen satisfied, update loop-state.json: set phase to "dreaming".\nThen run /dream-bigger to generate the next cycle's features.`,
  );
}

function handleDreaming(state) {
  const pendingFeatures = state.features.filter((f) => f.status === "pending");

  if (pendingFeatures.length > 0) {
    // Check if any have scores
    const scored = pendingFeatures.filter((f) => f.impact && f.impact.score > 0);
    if (scored.length === 0) {
      blockStop(
        `Autonomous loop — DREAMING phase: ${pendingFeatures.length} features exist but none have impact scores.\n\nScore each feature in loop-state.json:\n- userValue (1-10), differentiation (1-10), feasibility (1-10)\n- score = (userValue * 0.4) + (differentiation * 0.3) + (feasibility * 0.3)\n\nThe loop will transition to IMPLEMENTING once scores are set.`,
      );
    }

    // New features are ready — log history, transition to implementing
    const completed = state.features.filter((f) => f.status === "done").length;
    const decomposed = state.features.filter((f) => f.status === "decomposed").length;
    if (!state.history.find((h) => h.cycle === state.cycle)) {
      state.history.push({
        cycle: state.cycle,
        completed,
        decomposed,
        timestamp: new Date().toISOString(),
      });
    }

    // Clear old done/decomposed features
    state.features = state.features.filter((f) => f.status === "pending");
    state.phase = "implementing";
    state.cycle++;
    const next = pickNextFeature(state);
    if (next) {
      next.status = "in_progress";
      state.currentFeature = next.id;
    }
    writeState(state);
    blockStop(
      `Cycle ${state.cycle} starting! ${scored.length} scored features queued.\n\nFirst feature (impact: ${next.impact.score}): /ralph ${next.title} — ${next.description}\n\nScope: ${next.scope.join(", ")}\n\nIMPORTANT: When ralph completes ALL stories, update loop-state.json:\nFind feature "${next.id}", set status to "done", write the file back.`,
    );
  }

  // No features yet — tell Claude to run dream-bigger
  blockStop(
    `Autonomous loop — DREAMING phase (cycle ${state.cycle} complete).\n\nRun /dream-bigger to generate the next cycle's features.\n\nAfter generating features, write them to loop-state.json:\n- Score each: userValue (1-10), differentiation (1-10), feasibility (1-10)\n- Compute: score = (userValue * 0.4) + (differentiation * 0.3) + (feasibility * 0.3)\n- Set status "pending", generate unique IDs (feat-<cycle+1>-<n>)\n- Remove old done/decomposed features from the array\n- Keep phase as "dreaming" — the loop will transition automatically`,
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

try {
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
    case "evolving":
      handleEvolving(state);
      break;
    case "dreaming":
      handleDreaming(state);
      break;
    default:
      allowStop();
  }
} catch (err) {
  // Catch-all: never let the hook crash silently
  emit(
    `STOP-LOOP ERROR: ${err.message}\n\nThe autonomous loop hit an unexpected error. To recover:\n1. Check loop-state.json for issues\n2. Check experiments.tsv format\n3. Run: node .claude/hooks/stop-loop.mjs to debug\n\nStack: ${err.stack}`,
  );
  process.exit(0); // Allow stop on unrecoverable error
}
