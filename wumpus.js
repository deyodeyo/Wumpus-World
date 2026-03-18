// ═══════════════════════════════════════════════════════════════
//  WUMPUS WORLD — Game Logic
// ═══════════════════════════════════════════════════════════════

const DIRS = ["E", "N", "W", "S"];
const DIR_ARROW = ["→", "↑", "←", "↓"];
const DIR_EMOJI = ["→", "↑", "←", "↓"];
const DX = [1, 0, -1, 0];
const DY = [0, 1, 0, -1];

// Arm starts pointing RIGHT (East). Rotates around right shoulder (31, 23).
// E=0°, N=-90°, W=180°, S=90°
const DIR_ROT = [0, -90, 180, 90];

function makeAgentSVG(dir, hasArrow) {
  // ── BOW ARM (two-handed, whole group rotates) ──
  // Base pose: bow on LEFT side, string pulled by RIGHT hand — fires LEFT
  // E=0°→fires right, N=-90°→fires up, W=180°→fires left, S=90°→fires down
  const bowRot = [180, 90, 0, -90]; // E=180,N=90,W=0,S=-90 — fires in dir
  const br = bowRot[dir];
  const bowArm = `
    <g transform="rotate(${br}, 22, 24)">
      <rect x="10" y="19" width="10" height="5" rx="2.5" fill="#122a20" stroke="#4ade80" stroke-width="1"/>
      <rect x="8.5" y="19" width="5" height="5" rx="2" fill="#1a3a2e" stroke="#4ade80" stroke-width="0.9"/>
      <path d="M 8 12 C 2 17 2 27 8 32" stroke="#9B6514" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <line x1="8" y1="12" x2="19" y2="22" stroke="#e8d8b0" stroke-width="0.9"/>
      <line x1="8" y1="32" x2="19" y2="22" stroke="#e8d8b0" stroke-width="0.9"/>
      <line x1="3" y1="22" x2="22" y2="22" stroke="#a07830" stroke-width="1.5" stroke-linecap="round"/>
      <polygon points="1,22 6,19.5 6,24.5" fill="#c8a030"/>
      <line x1="21" y1="22" x2="23" y2="19.5" stroke="#8b1a1a" stroke-width="1.3" stroke-linecap="round"/>
      <line x1="21" y1="22" x2="23" y2="24.5" stroke="#8b1a1a" stroke-width="1.3" stroke-linecap="round"/>
      <rect x="26" y="19" width="8" height="5" rx="2.5" fill="#122a20" stroke="#4ade80" stroke-width="1"/>
      <rect x="18" y="19.5" width="5" height="5" rx="2" fill="#1a3a2e" stroke="#4ade80" stroke-width="0.9"/>
    </g>`;

  // ── RESTING ARMS ──
  const leftRest = `
    <rect x="9.5" y="19" width="5" height="10" rx="2.5" fill="#122a20" stroke="#4ade80" stroke-width="1"/>
    <rect x="9"   y="28" width="6" height="5"  rx="2"   fill="#1a3a2e" stroke="#4ade80" stroke-width="0.9"/>`;
  const rightRest = `
    <rect x="29.5" y="19" width="5" height="10" rx="2.5" fill="#122a20" stroke="#4ade80" stroke-width="1"/>
    <rect x="29"   y="28" width="6" height="5"  rx="2"   fill="#1a3a2e" stroke="#4ade80" stroke-width="0.9"/>`;

  // ── EXPLICIT POINTING ARMS — no rotation ──
  // East: right arm extends RIGHT
  const rightPointEast = `
    <rect x="28" y="19" width="12" height="5" rx="2.5" fill="#122a20" stroke="#4ade80" stroke-width="1"/>
    <rect x="38" y="17.5" width="6" height="7" rx="2.5" fill="#1a3a2e" stroke="#4ade80" stroke-width="1"/>
    <circle cx="40" cy="17.5" r="0.85" fill="#4ade80" opacity="0.8"/>
    <circle cx="43" cy="17.5" r="0.85" fill="#4ade80" opacity="0.8"/>`;

  // North: right arm extends UP
  const rightPointNorth = `
    <rect x="26" y="8"  width="5" height="12" rx="2.5" fill="#122a20" stroke="#4ade80" stroke-width="1"/>
    <rect x="25" y="2"  width="7" height="7"  rx="2.5" fill="#1a3a2e" stroke="#4ade80" stroke-width="1"/>
    <circle cx="26.5" cy="3.5" r="0.85" fill="#4ade80" opacity="0.8"/>
    <circle cx="30"   cy="3"   r="0.85" fill="#4ade80" opacity="0.8"/>`;

  // West: left arm extends LEFT
  const leftPointWest = `
    <rect x="4"  y="19" width="12" height="5" rx="2.5" fill="#122a20" stroke="#4ade80" stroke-width="1"/>
    <rect x="0"  y="17.5" width="6" height="7" rx="2.5" fill="#1a3a2e" stroke="#4ade80" stroke-width="1"/>
    <circle cx="1.5" cy="17.5" r="0.85" fill="#4ade80" opacity="0.8"/>
    <circle cx="4.5" cy="17.5" r="0.85" fill="#4ade80" opacity="0.8"/>`;

  // South: left arm extends DOWN
  const leftPointSouth = `
    <rect x="10" y="19" width="5" height="13" rx="2.5" fill="#122a20" stroke="#4ade80" stroke-width="1"/>
    <rect x="9"  y="31" width="7" height="6"  rx="2.5" fill="#1a3a2e" stroke="#4ade80" stroke-width="1"/>
    <circle cx="11"   cy="36"   r="0.85" fill="#4ade80" opacity="0.8"/>
    <circle cx="14.5" cy="36.5" r="0.85" fill="#4ade80" opacity="0.8"/>`;

  // Pick arms based on dir: E=0, N=1, W=2, S=3
  const armsMap = [
    leftRest + rightPointEast, // East  → right arm right
    leftRest + rightPointNorth, // North → right arm up
    leftPointWest + rightRest, // West  → left arm left
    leftPointSouth + rightRest, // South → left arm down
  ];

  return `<svg viewBox="-6 0 56 46" xmlns="http://www.w3.org/2000/svg"
    style="width:100%;height:100%;filter:drop-shadow(0 0 6px rgba(39,174,96,0.85)) drop-shadow(0 0 14px rgba(39,174,96,0.3))">

    <!-- HELMET -->
    <ellipse cx="22" cy="8.5" rx="6" ry="6.5" fill="#122a20" stroke="#4ade80" stroke-width="1.2"/>
    <path d="M 17.5 6 Q 22 0.5 26.5 6" fill="#0a1f16" stroke="#4ade80" stroke-width="1"/>
    <rect x="17.5" y="9.5" width="9" height="2.5" rx="1" fill="#030a06" stroke="#4ade80" stroke-width="0.7"/>
    <circle cx="19.8" cy="10.7" r="1" fill="#4ade80"/>
    <circle cx="24.2" cy="10.7" r="1" fill="#4ade80"/>
    <rect x="19" y="14" width="6" height="2.5" rx="1" fill="#122a20" stroke="#4ade80" stroke-width="0.8"/>

    <!-- NECK -->
    <rect x="20.5" y="16.5" width="3" height="2.5" rx="1" fill="#122a20"/>

    <!-- TORSO -->
    <path d="M 16 19 Q 15 28 16.5 32 L 27.5 32 Q 29 28 28 19 Q 25 17.5 22 17.5 Q 19 17.5 16 19 Z"
      fill="#122a20" stroke="#4ade80" stroke-width="1.1"/>
    <line x1="22" y1="19" x2="22" y2="31" stroke="#4ade80" stroke-width="0.7" opacity="0.45"/>
    <path d="M 17 23 Q 22 25 27 23" stroke="#4ade80" stroke-width="0.7" fill="none" opacity="0.35"/>
    <circle cx="17.5" cy="20" r="0.8" fill="#4ade80" opacity="0.55"/>
    <circle cx="26.5" cy="20" r="0.8" fill="#4ade80" opacity="0.55"/>

    <!-- ARMS -->
    ${hasArrow ? bowArm : armsMap[dir]}

    <!-- BELT -->
    <rect x="16" y="31.5" width="12" height="3" rx="1.2" fill="#0a1810" stroke="#4ade80" stroke-width="0.9"/>
    <rect x="20.5" y="31" width="3" height="4" rx="0.8" fill="#1a3a2e" stroke="#4ade80" stroke-width="0.8"/>

    <!-- LEGS -->
    <rect x="15.5" y="34.5" width="5.5" height="8" rx="2" fill="#122a20" stroke="#4ade80" stroke-width="1"/>
    <rect x="23"   y="34.5" width="5.5" height="8" rx="2" fill="#122a20" stroke="#4ade80" stroke-width="1"/>
    <rect x="13.5" y="41.5" width="7.5" height="3" rx="1.5" fill="#0a1810" stroke="#4ade80" stroke-width="0.9"/>
    <rect x="23"   y="41.5" width="7.5" height="3" rx="1.5" fill="#0a1810" stroke="#4ade80" stroke-width="0.9"/>

  </svg>`;
}

let G = {};

// ── Helpers ──────────────────────────────────────────────────────
function pos(r, c) {
  return r * 4 + c;
}
function toRC(idx) {
  return { r: Math.floor(idx / 4), c: idx % 4 };
}

function randCell(exclude) {
  let c;
  do {
    c = Math.floor(Math.random() * 16);
  } while (exclude.has(c));
  return c;
}

function getNeighbors(idx) {
  const { r, c } = toRC(idx);
  const out = [];
  if (r > 0) out.push(pos(r - 1, c));
  if (r < 3) out.push(pos(r + 1, c));
  if (c > 0) out.push(pos(r, c - 1));
  if (c < 3) out.push(pos(r, c + 1));
  return out;
}

function getNextCell(idx, dir) {
  const { r, c } = toRC(idx);
  const nr = r + DY[dir],
    nc = c + DX[dir];
  if (nr < 0 || nr > 3 || nc < 0 || nc > 3) return null;
  return pos(nr, nc);
}

// ── Percepts ─────────────────────────────────────────────────────
function computePercepts() {
  const nb = getNeighbors(G.agentPos);
  G.percepts = {
    stench: nb.some((i) => i === G.wumpus && G.wumpusAlive),
    breeze: nb.some((i) => G.pits.includes(i)),
    glitter: G.agentPos === G.gold && !G.hasGold,
    bump: false,
    scream: false,
  };
}

// ── New Game ──────────────────────────────────────────────────────
function newGame() {
  const taken = new Set([0]);

  G.wumpus = randCell(taken);
  taken.add(G.wumpus);

  G.pits = [];
  for (let i = 0; i < 3; i++) {
    const p = randCell(taken);
    G.pits.push(p);
    taken.add(p);
  }

  G.gold = randCell(taken);

  G.agentPos = 0;
  G.agentDir = 0;
  G.hasGold = false;
  G.arrows = 1;
  G.score = 0;
  G.visited = new Set([0]);
  G.wumpusAlive = true;
  G.over = false;

  document.getElementById("log").innerHTML = "";
  document.getElementById("overlay").classList.add("hidden");
  document.querySelector(".grid-wrap").classList.remove("gold-captured");

  computePercepts();
  render();
  addLog("You descend into the cave. Face your fate.", "info");
}

// ── Log ───────────────────────────────────────────────────────────
function addLog(msg, cls = "") {
  const div = document.getElementById("log");
  const el = document.createElement("div");
  el.className = "log-entry" + (cls ? " " + cls : "");
  el.textContent = msg;
  div.prepend(el);
  while (div.children.length > 25) div.removeChild(div.lastChild);
}

// ── Render ────────────────────────────────────────────────────────
function render() {
  const grid = document.getElementById("grid");

  // Save corpse element before wiping so it doesn't re-animate
  let savedCorpse = null;
  if (!G.wumpusAlive) {
    savedCorpse = grid.querySelector(".wumpus-corpse");
    if (savedCorpse) {
      // Remove the animation class so it doesn't replay
      savedCorpse.style.animation = "none";
    }
  }

  grid.innerHTML = "";

  // Draw rows from top (row 3) to bottom (row 0) so (1,1) is bottom-left
  for (let r = 3; r >= 0; r--) {
    for (let c = 0; c < 4; c++) {
      const idx = pos(r, c);
      const visited = G.visited.has(idx);
      const current = idx === G.agentPos;

      const cell = document.createElement("div");
      cell.className = "cell";

      if (!visited && !G.over) {
        cell.classList.add("hidden");
      } else {
        cell.classList.add("visited");
        if (current) cell.classList.add("current");
        if (current && G.hasGold) cell.classList.add("gold-captured");

        // Percept tints on current cell's neighbors
        if (visited && !current) {
          const nb = getNeighbors(idx);
          const isNeighborOfCurrent = nb.includes(G.agentPos);
          if (isNeighborOfCurrent) {
            if (G.percepts.stench) cell.classList.add("stench-hint");
            if (G.percepts.breeze) cell.classList.add("breeze-hint");
          }
        }

        // Gold shimmer
        if (idx === G.gold && !G.hasGold) cell.classList.add("gold-here");

        // Agent
        if (current) {
          const agent = document.createElement("div");
          agent.className = "cell-agent";
          agent.innerHTML = makeAgentSVG(G.agentDir, G.arrows > 0);
          cell.appendChild(agent);
        }

        // Percept tags on current cell — always show, including silence
        if (current) {
          const tags = [];
          if (G.percepts.stench) tags.push(["STENCH", "stench"]);
          if (G.percepts.breeze) tags.push(["BREEZE", "breeze"]);
          if (G.percepts.glitter) tags.push(["GLITTER", "glitter"]);
          if (G.percepts.bump) tags.push(["BUMP", "bump"]);
          if (G.percepts.scream) tags.push(["SCREAM", "scream"]);
          const row = document.createElement("div");
          row.className = "cell-tags";
          if (tags.length === 0) {
            const t = document.createElement("span");
            t.className = "tag silence";
            t.textContent = "SILENCE";
            row.appendChild(t);
          } else {
            tags.forEach(([label, cls]) => {
              const t = document.createElement("span");
              t.className = "tag " + cls;
              t.textContent = label;
              row.appendChild(t);
            });
          }
          cell.appendChild(row);
        }

        // Live wumpus — reveal on game over as white ghost SVG
        if (G.over && idx === G.wumpus && G.wumpusAlive) {
          const e = document.createElement("div");
          e.className = "wumpus-corpse";
          e.style.animation = "none";
          e.innerHTML = `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
            <!-- Ghost body — upright standing -->
            <path d="
              M 40 12
              C 52 12, 62 22, 62 36
              C 62 50, 62 58, 56 62
              C 52 66, 47 62, 40 64
              C 33 62, 28 66, 24 62
              C 18 58, 18 50, 18 36
              C 18 22, 28 12, 40 12 Z
            " fill="white" stroke="#ccc" stroke-width="1"/>
            <!-- Belly sheen -->
            <ellipse cx="40" cy="40" rx="13" ry="18" fill="white" opacity="0.35"/>
            <!-- Left arm raised -->
            <rect x="8"  y="22" width="12" height="18" rx="6" fill="white" stroke="#ccc" stroke-width="1" transform="rotate(-20,14,31)"/>
            <!-- Right arm raised -->
            <rect x="60" y="22" width="12" height="18" rx="6" fill="white" stroke="#ccc" stroke-width="1" transform="rotate(20,66,31)"/>
            <!-- Stubby feet -->
            <ellipse cx="32" cy="63" rx="7" ry="5" fill="white" stroke="#ccc" stroke-width="1"/>
            <ellipse cx="48" cy="63" rx="7" ry="5" fill="white" stroke="#ccc" stroke-width="1"/>
            <!-- Square eyes — alive, dark squares -->
            <rect x="29" y="28" width="8" height="8" rx="1.5" fill="#222"/>
            <rect x="43" y="28" width="8" height="8" rx="1.5" fill="#222"/>
            <!-- Mouth — teeth grin -->
            <rect x="30" y="42" width="20" height="8" rx="2" fill="#333"/>
            <rect x="31" y="42" width="4" height="6" rx="1" fill="white"/>
            <rect x="37" y="42" width="4" height="6" rx="1" fill="white"/>
            <rect x="43" y="42" width="4" height="6" rx="1" fill="white"/>
          </svg>`;
          cell.appendChild(e);
        }
      }

      // Gold bar — visible when visited OR on game over reveal
      if (!current && idx === G.gold && !G.hasGold && (visited || G.over)) {
        const e = document.createElement("div");
        e.className = "cell-entity gold-bar-entity";
        e.innerHTML = `<svg viewBox="0 0 60 36" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="30" cy="33" rx="22" ry="4" fill="rgba(0,0,0,0.4)"/>
            <polygon points="6,28 54,28 58,34 2,34" fill="#a07820"/>
            <rect x="6" y="10" width="48" height="18" rx="3" fill="#d4a017"/>
            <polygon points="6,10 54,10 58,4 2,4" fill="#f5c842"/>
            <polygon points="10,9 30,9 33,4 7,4" fill="#ffe97a" opacity="0.6"/>
            <line x1="18" y1="13" x2="18" y2="25" stroke="#b8901a" stroke-width="1" opacity="0.6"/>
            <line x1="42" y1="13" x2="42" y2="25" stroke="#b8901a" stroke-width="1" opacity="0.6"/>
            <text x="30" y="23" text-anchor="middle" font-family="serif" font-size="9" font-weight="bold" fill="#8a6010" opacity="0.8">AU</text>
            <circle cx="14" cy="14" r="3" fill="white" opacity="0.25"/>
          </svg>`;
        cell.appendChild(e);
      }

      // Pit SVG — reveal on game over
      if (G.over && G.pits.includes(idx) && !current) {
        cell.classList.add("pit-cell");
        const pit = document.createElement("div");
        pit.className = "cell-entity pit-entity";
        pit.innerHTML = `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
          <!-- Outer dark ring -->
          <ellipse cx="30" cy="36" rx="24" ry="10" fill="#0a0008" stroke="#2a0a2a" stroke-width="1.5"/>
          <!-- Mid ring -->
          <ellipse cx="30" cy="34" rx="19" ry="8" fill="#130010"/>
          <!-- Inner void — deep black -->
          <ellipse cx="30" cy="32" rx="14" ry="6" fill="#000"/>
          <!-- Rock edge highlights -->
          <path d="M 8 34 Q 12 28 20 30 Q 26 28 30 30 Q 36 27 42 30 Q 50 28 52 34" stroke="#3a1a3a" stroke-width="1.5" fill="none" opacity="0.8"/>
          <!-- Jagged rock teeth around pit -->
          <polygon points="14,33 17,26 20,33" fill="#1a0818" stroke="#2a0a2a" stroke-width="0.8"/>
          <polygon points="22,31 25,23 28,31" fill="#1a0818" stroke="#2a0a2a" stroke-width="0.8"/>
          <polygon points="32,31 35,23 38,31" fill="#1a0818" stroke="#2a0a2a" stroke-width="0.8"/>
          <polygon points="40,33 43,26 46,33" fill="#1a0818" stroke="#2a0a2a" stroke-width="0.8"/>
          <!-- Eerie glow from inside -->
          <ellipse cx="30" cy="33" rx="10" ry="4" fill="rgba(80,0,120,0.25)"/>
          <!-- Spiral depth lines -->
          <ellipse cx="30" cy="32" rx="9" ry="3.5" fill="none" stroke="rgba(100,0,150,0.2)" stroke-width="0.8"/>
          <ellipse cx="30" cy="32" rx="5" ry="2" fill="none" stroke="rgba(120,0,180,0.2)" stroke-width="0.8"/>
          <!-- Label -->
          <text x="30" y="18" text-anchor="middle" font-family="serif" font-size="8" font-weight="bold" fill="#5a1a5a" letter-spacing="2" opacity="0.8">PIT</text>
        </svg>`;
        cell.appendChild(pit);
      }

      // Safe visited mark — shield with checkmark
      if (
        visited &&
        !current &&
        !G.pits.includes(idx) &&
        idx !== G.wumpus &&
        !(idx === G.gold && !G.hasGold)
      ) {
        const mark = document.createElement("div");
        mark.className = "safe-mark";
        mark.innerHTML = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <!-- Shield shape -->
          <path d="M12 2 L20 5.5 L20 12 Q20 18 12 22 Q4 18 4 12 L4 5.5 Z"
            fill="rgba(15,40,25,0.85)" stroke="#4ade80" stroke-width="1.4" stroke-linejoin="round"/>
          <!-- Checkmark -->
          <polyline points="7.5,12 10.5,15.5 16.5,8.5"
            stroke="#4ade80" stroke-width="2" fill="none"
            stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
        cell.appendChild(mark);
      }

      // Coord label
      const coord = document.createElement("div");
      coord.className = "cell-coord";
      coord.textContent = c + 1 + "," + (r + 1);
      cell.appendChild(coord);

      grid.appendChild(cell);
    }
  }

  // Re-attach saved corpse (no animation replay)
  if (savedCorpse && !G.wumpusAlive) {
    const { r, c } = toRC(G.wumpus);
    const renderRow = 3 - r;
    const cells = grid.querySelectorAll(".cell");
    const wumpusCell = cells[renderRow * 4 + c];
    if (wumpusCell) {
      wumpusCell.classList.add("wumpus-dead-cell");
      const agentOnCorpse = G.agentPos === G.wumpus;
      if (agentOnCorpse) {
        savedCorpse.classList.add("corpse-mini");
      } else {
        savedCorpse.classList.remove("corpse-mini");
      }
      wumpusCell.appendChild(savedCorpse);
    }
  }

  // Status
  document.getElementById("score").textContent = G.score;
  document.getElementById("arrows").textContent = G.arrows;

  // Update facing arrow in dpad center — plain arrow for readability
  document.getElementById("facing-arrow").textContent = DIR_ARROW[G.agentDir];

  const goldEl = document.getElementById("gold-status");
  goldEl.textContent = G.hasGold ? "✓ Held" : "—";
  goldEl.style.color = G.hasGold ? "#c89b3c" : "";

  const wEl = document.getElementById("wumpus-status");
  wEl.textContent = G.wumpusAlive ? "👹 Alive" : "💀 Dead";
  wEl.style.color = G.wumpusAlive ? "#c84040" : "#4ac87a";

  // Percepts panel
  const pList = document.getElementById("percepts-list");
  pList.innerHTML = "";
  const activePercepts = [];
  if (G.percepts.stench)
    activePercepts.push(["🟡", "You smell something foul.", "stench"]);
  if (G.percepts.breeze)
    activePercepts.push(["💨", "A cold wind brushes your skin.", "breeze"]);
  if (G.percepts.glitter)
    activePercepts.push(["✨", "Something glitters in the dark!", "glitter"]);
  if (G.percepts.bump)
    activePercepts.push(["🧱", "You collide with solid rock.", "bump"]);
  if (G.percepts.scream)
    activePercepts.push(["🔊", "A terrible scream echoes.", "scream"]);

  if (activePercepts.length === 0) {
    pList.innerHTML = '<span class="no-percept">— silence —</span>';
  } else {
    activePercepts.forEach(([icon, text, cls]) => {
      const el = document.createElement("div");
      el.className = "percept-item " + cls;
      el.textContent = icon + "  " + text;
      pList.appendChild(el);
    });
  }
}

// ── Wumpus Death Scream (Web Audio) ──────────────────────────────
function playScream() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const t = ctx.currentTime;

    // ── DISTORTION (waveshaper) — makes it harsh and raw ──
    const distortion = ctx.createWaveShaper();
    function makeDistortionCurve(amount) {
      const n = 512,
        curve = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        const x = (i * 2) / n - 1;
        curve[i] = ((Math.PI + amount) * x) / (Math.PI + amount * Math.abs(x));
      }
      return curve;
    }
    distortion.curve = makeDistortionCurve(220);

    // ── MAIN SCREAM — sawtooth vocal source ──
    const scream = ctx.createOscillator();
    scream.type = "sawtooth";
    // Chilling pitch arc: lurches up into a full shriek, voice cracks, then dies
    scream.frequency.setValueAtTime(140, t);
    scream.frequency.linearRampToValueAtTime(880, t + 0.08); // LURCH UP — instant terror
    scream.frequency.linearRampToValueAtTime(820, t + 0.18);
    scream.frequency.linearRampToValueAtTime(950, t + 0.32); // peak shriek
    scream.frequency.linearRampToValueAtTime(860, t + 0.45);
    scream.frequency.linearRampToValueAtTime(920, t + 0.6); // second peak
    scream.frequency.linearRampToValueAtTime(500, t + 0.8); // CRACK — voice breaks
    scream.frequency.linearRampToValueAtTime(260, t + 1.1); // fading
    scream.frequency.linearRampToValueAtTime(110, t + 1.6); // dying
    scream.frequency.linearRampToValueAtTime(55, t + 2.0); // death gurgle

    // ── VIBRATO on the shriek peak — trembling, desperate ──
    const vibrato = ctx.createOscillator();
    vibrato.frequency.value = 7.5; // 7.5 Hz vibrato
    const vibratoGain = ctx.createGain();
    vibratoGain.gain.setValueAtTime(0, t);
    vibratoGain.gain.linearRampToValueAtTime(30, t + 0.3); // kick in during shriek
    vibratoGain.gain.linearRampToValueAtTime(50, t + 0.6); // max trembling
    vibratoGain.gain.linearRampToValueAtTime(0, t + 1.0); // fades as voice dies
    vibrato.connect(vibratoGain);
    vibratoGain.connect(scream.frequency);

    // ── THROAT FORMANTS — give it human character ──
    const f1 = ctx.createBiquadFilter();
    f1.type = "bandpass";
    f1.frequency.setValueAtTime(900, t);
    f1.frequency.linearRampToValueAtTime(700, t + 2.0);
    f1.Q.value = 5;

    const f2 = ctx.createBiquadFilter();
    f2.type = "bandpass";
    f2.frequency.setValueAtTime(2800, t);
    f2.frequency.linearRampToValueAtTime(1200, t + 2.0);
    f2.Q.value = 9;

    // ── DEATH RATTLE noise (low rumble at the end) ──
    const bufSize = ctx.sampleRate * 2.2;
    const nBuf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const nd = nBuf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) nd[i] = Math.random() * 2 - 1;
    const rattle = ctx.createBufferSource();
    rattle.buffer = nBuf;
    const rattleFilter = ctx.createBiquadFilter();
    rattleFilter.type = "bandpass";
    rattleFilter.frequency.value = 180;
    rattleFilter.Q.value = 3;
    const rattleGain = ctx.createGain();
    rattleGain.gain.setValueAtTime(0, t);
    rattleGain.gain.linearRampToValueAtTime(0, t + 0.75);
    rattleGain.gain.linearRampToValueAtTime(0.25, t + 1.1); // rattle kicks in
    rattleGain.gain.linearRampToValueAtTime(0.35, t + 1.5);
    rattleGain.gain.linearRampToValueAtTime(0.0, t + 2.2);

    // ── MASTER envelope — explosive attack, long death tail ──
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, t);
    masterGain.gain.linearRampToValueAtTime(1.0, t + 0.03); // explosive
    masterGain.gain.linearRampToValueAtTime(0.85, t + 0.45);
    masterGain.gain.linearRampToValueAtTime(0.6, t + 0.85);
    masterGain.gain.linearRampToValueAtTime(0.35, t + 1.4);
    masterGain.gain.linearRampToValueAtTime(0.0, t + 2.2);

    // ── Wire it all up ──
    scream.connect(distortion);
    distortion.connect(f1);
    distortion.connect(f2);
    f1.connect(masterGain);
    f2.connect(masterGain);
    rattle.connect(rattleFilter);
    rattleFilter.connect(rattleGain);
    rattleGain.connect(masterGain);
    masterGain.connect(ctx.destination);

    scream.start(t);
    scream.stop(t + 2.2);
    vibrato.start(t);
    vibrato.stop(t + 2.2);
    rattle.start(t);
    rattle.stop(t + 2.2);
  } catch (e) {
    /* Audio not supported */
  }
}

// ── Gold Glitter Burst ────────────────────────────────────────────
function spawnGlitterBurst() {
  const { r, c } = toRC(G.gold);
  const renderRow = 3 - r;
  const cells = document.querySelectorAll("#grid .cell");
  const goldCell = cells[renderRow * 4 + c];
  if (!goldCell) return;

  const wrap = document.querySelector(".grid-wrap");
  const wrapRect = wrap.getBoundingClientRect();
  const cellRect = goldCell.getBoundingClientRect();

  // Cell center relative to grid-wrap
  const cx = cellRect.left - wrapRect.left + cellRect.width / 2;
  const cy = cellRect.top - wrapRect.top + cellRect.height / 2;
  const cw = cellRect.width;
  const ch = cellRect.height;

  const emojis = ["✨", "⭐", "💫", "🌟", "✦", "🪙"];

  function spawnWave(count, delayOffset) {
    setTimeout(() => {
      for (let i = 0; i < count; i++) {
        const p = document.createElement("div");
        p.className = "glitter-particle";
        p.textContent = emojis[Math.floor(Math.random() * emojis.length)];

        // Start randomly within the cell bounds
        const sx = cx + (Math.random() - 0.5) * cw * 0.7;
        const sy = cy + (Math.random() - 0.5) * ch * 0.7;

        // Drift a little but stay near the cell
        const tx = (Math.random() - 0.5) * cw * 0.8;
        const ty = (Math.random() - 0.5) * ch * 0.8;

        const size = 0.6 + Math.random() * 0.9;
        const duration = 700 + Math.random() * 700;
        const delay = Math.random() * 300;

        p.style.cssText = `
          left: ${sx}px; top: ${sy}px;
          font-size: ${size}rem;
          --tx: ${tx}px; --ty: ${ty}px;
          animation: glitter-sparkle ${duration}ms ease-in-out ${delay}ms forwards;
        `;
        wrap.appendChild(p);
        setTimeout(() => p.remove(), duration + delay + 100);
      }
    }, delayOffset);
  }

  spawnWave(20, 0);
  spawnWave(15, 450);
  spawnWave(10, 900);
}

// ── Inject Corpse Once (called after render on kill) ─────────────
function injectCorpse() {
  const { r, c } = toRC(G.wumpus);
  const renderRow = 3 - r;
  const cells = document.querySelectorAll("#grid .cell");
  const wumpusCell = cells[renderRow * 4 + c];
  if (!wumpusCell) return;

  wumpusCell.classList.add("wumpus-dead-cell");
  const corpse = document.createElement("div");
  corpse.className = "wumpus-corpse";
  corpse.innerHTML = `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">

    <!-- Blood pool -->
    <ellipse cx="44" cy="72" rx="22" ry="6" fill="#8b0000" opacity="0.85"/>
    <ellipse cx="32" cy="74" rx="9"  ry="3.5" fill="#a00" opacity="0.6"/>
    <circle  cx="22" cy="70" r="3"  fill="#900" opacity="0.7"/>
    <circle  cx="62" cy="69" r="2.5" fill="#800" opacity="0.6"/>

    <!-- Whole ghost tipped 80° to the right (fallen over) -->
    <g transform="translate(40,42) rotate(80)">

      <!-- Ghost body — round white blob with wavy bottom -->
      <path d="
        M 0 -22
        C 12 -22, 20 -14, 20 0
        C 20 12, 20 20, 14 24
        C 10 28, 6 24, 0 26
        C -6 24, -10 28, -14 24
        C -20 20, -20 12, -20 0
        C -20 -14, -12 -22, 0 -22 Z
      " fill="white" stroke="#ccc" stroke-width="0.8"/>

      <!-- Belly sheen -->
      <ellipse cx="0" cy="2" rx="11" ry="14" fill="white" opacity="0.4"/>

      <!-- Arms raised — stubby rounded rectangles -->
      <!-- Left arm up -->
      <rect x="-28" y="-20" width="10" height="16" rx="5" fill="white" stroke="#ccc" stroke-width="0.8" transform="rotate(-15,-23,-12)"/>
      <!-- Right arm up -->
      <rect x="18"  y="-20" width="10" height="16" rx="5" fill="white" stroke="#ccc" stroke-width="0.8" transform="rotate(15,23,-12)"/>

      <!-- Stubby feet at bottom -->
      <ellipse cx="-10" cy="23" rx="6" ry="5" fill="white" stroke="#ccc" stroke-width="0.8"/>
      <ellipse cx="10"  cy="24" rx="6" ry="5" fill="white" stroke="#ccc" stroke-width="0.8"/>

      <!-- Square eyes — dead X -->
      <line x1="-9" y1="-12" x2="-4" y2="-7"  stroke="#333" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="-4" y1="-12" x2="-9" y2="-7"  stroke="#333" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="4"  y1="-12" x2="9"  y2="-7"  stroke="#333" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="9"  y1="-12" x2="4"  y2="-7"  stroke="#333" stroke-width="2.2" stroke-linecap="round"/>

      <!-- Mouth — open rectangle with teeth -->
      <rect x="-9" y="-3" width="18" height="8" rx="2" fill="#333"/>
      <rect x="-7" y="-3" width="4"  height="6" rx="1" fill="white"/>
      <rect x="-1" y="-3" width="4"  height="6" rx="1" fill="white"/>
      <rect x="5"  y="-3" width="4"  height="6" rx="1" fill="white"/>

      <!-- Arrow through chest -->
      <line x1="0" y1="-26" x2="0" y2="14" stroke="#8B6914" stroke-width="2.5" stroke-linecap="round"/>
      <!-- Arrowhead (tip at top) -->
      <polygon points="0,-26 -4,-16 4,-16" fill="#c0932a"/>
      <!-- Feather tail -->
      <ellipse cx="-3" cy="13" rx="3" ry="5" fill="#8b4513" transform="rotate(12,-3,13)" opacity="0.85"/>
      <ellipse cx="3"  cy="14" rx="3" ry="5" fill="#a0522d" transform="rotate(-12,3,14)"  opacity="0.85"/>

      <!-- Blood wound -->
      <circle cx="0" cy="-3" r="6"   fill="#8b0000" opacity="0.9"/>
      <circle cx="0" cy="-3" r="3.5" fill="#cc0000"/>

    </g>
  </svg>`;
  wumpusCell.appendChild(corpse);
}

// ── Blood Splatter Effect ─────────────────────────────────────────
function spawnBloodSplatter(wumpusIdx) {
  const { r, c } = toRC(wumpusIdx);
  const renderRow = 3 - r;
  const cells = document.querySelectorAll("#grid .cell");
  const targetCell = cells[renderRow * 4 + c];
  if (!targetCell) return;

  const wrap = document.querySelector(".grid-wrap");
  const wrapRect = wrap.getBoundingClientRect();
  const cellRect = targetCell.getBoundingClientRect();

  const cx = cellRect.left - wrapRect.left + cellRect.width / 2;
  const cy = cellRect.top - wrapRect.top + cellRect.height / 2;
  const cw = cellRect.width;
  const ch = cellRect.height;

  // Blood drops — fast burst outward, mostly within the cell
  for (let i = 0; i < 18; i++) {
    const drop = document.createElement("div");
    drop.className = "blood-drop";

    const angle = Math.random() * 360;
    const dist = 8 + Math.random() * (cw * 0.55);
    const tx = Math.cos((angle * Math.PI) / 180) * dist;
    const ty = Math.sin((angle * Math.PI) / 180) * dist;
    const size = 4 + Math.random() * 8;
    const duration = 300 + Math.random() * 400;
    const delay = Math.random() * 150;

    drop.style.cssText = `
      left: ${cx}px; top: ${cy}px;
      width: ${size}px; height: ${size}px;
      --tx: ${tx}px; --ty: ${ty}px;
      animation: blood-fly ${duration}ms ease-out ${delay}ms forwards;
    `;
    wrap.appendChild(drop);
    setTimeout(() => drop.remove(), duration + delay + 50);
  }

  // Big flash on the cell itself
  targetCell.classList.add("blood-flash");
  setTimeout(() => targetCell.classList.remove("blood-flash"), 600);
}

// ── Game Over Sound ───────────────────────────────────────────────
function playGameOverSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const t = ctx.currentTime;

    // Deep cinematic BOOM — kick drum style
    const boom = ctx.createOscillator();
    boom.type = "sine";
    boom.frequency.setValueAtTime(120, t);
    boom.frequency.exponentialRampToValueAtTime(28, t + 0.5);
    const boomGain = ctx.createGain();
    boomGain.gain.setValueAtTime(1.2, t);
    boomGain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
    boom.connect(boomGain);
    boomGain.connect(ctx.destination);
    boom.start(t);
    boom.stop(t + 0.6);

    // Noise burst — like a hit
    const bufSize = ctx.sampleRate * 0.3;
    const nBuf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const nd = nBuf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) nd[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = nBuf;
    const nFilt = ctx.createBiquadFilter();
    nFilt.type = "lowpass";
    nFilt.frequency.value = 200;
    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.6, t);
    nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    noise.connect(nFilt);
    nFilt.connect(nGain);
    nGain.connect(ctx.destination);
    noise.start(t);
    noise.stop(t + 0.3);

    // Descending pipe-organ minor chord — D minor feel (D-F-A)
    const chordNotes = [147, 175, 220, 294]; // D2, F2, A2, D3
    chordNotes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      const filt = ctx.createBiquadFilter();
      filt.type = "lowpass";
      filt.frequency.value = 800;
      const gain = ctx.createGain();
      const delay = 0.08 + i * 0.06;
      gain.gain.setValueAtTime(0, t + delay);
      gain.gain.linearRampToValueAtTime(0.22, t + delay + 0.15);
      gain.gain.linearRampToValueAtTime(0.18, t + delay + 1.0);
      gain.gain.linearRampToValueAtTime(0, t + delay + 2.5);
      osc.frequency.setValueAtTime(freq, t + delay);
      osc.frequency.linearRampToValueAtTime(freq * 0.97, t + delay + 2.5); // slight detune downward
      osc.connect(filt);
      filt.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t + delay);
      osc.stop(t + delay + 2.6);
    });

    // Eerie high tremolo — ghostly wail
    const wail = ctx.createOscillator();
    wail.type = "sine";
    wail.frequency.setValueAtTime(740, t + 0.4);
    wail.frequency.linearRampToValueAtTime(660, t + 2.8);
    const tremoloLFO = ctx.createOscillator();
    tremoloLFO.frequency.value = 5.5;
    const tremoloGain = ctx.createGain();
    tremoloGain.gain.value = 0.06;
    tremoloLFO.connect(tremoloGain);
    tremoloGain.connect(wail.frequency);
    const wailGain = ctx.createGain();
    wailGain.gain.setValueAtTime(0, t + 0.4);
    wailGain.gain.linearRampToValueAtTime(0.13, t + 0.9);
    wailGain.gain.linearRampToValueAtTime(0.08, t + 2.2);
    wailGain.gain.linearRampToValueAtTime(0, t + 3.0);
    wail.connect(wailGain);
    wailGain.connect(ctx.destination);
    wail.start(t + 0.4);
    wail.stop(t + 3.0);
    tremoloLFO.start(t + 0.4);
    tremoloLFO.stop(t + 3.0);
  } catch (e) {}
}

// ── Victory Sound ─────────────────────────────────────────────────
function playVictorySound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const t = ctx.currentTime;

    // Bright chime hit on beat 1
    const chime = ctx.createOscillator();
    chime.type = "sine";
    chime.frequency.value = 1047; // C6
    const chimeGain = ctx.createGain();
    chimeGain.gain.setValueAtTime(0.5, t);
    chimeGain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
    chime.connect(chimeGain);
    chimeGain.connect(ctx.destination);
    chime.start(t);
    chime.stop(t + 0.6);

    // Heroic fanfare — C major: C E G C ascending (classic victory sting)
    const fanfare = [
      { freq: 523.25, start: 0.0, dur: 0.12 }, // C4
      { freq: 523.25, start: 0.13, dur: 0.12 }, // C4
      { freq: 523.25, start: 0.26, dur: 0.12 }, // C4
      { freq: 659.25, start: 0.39, dur: 0.18 }, // E4
      { freq: 783.99, start: 0.58, dur: 0.18 }, // G4
      { freq: 1046.5, start: 0.77, dur: 0.55 }, // C5 — big finish
    ];

    fanfare.forEach(({ freq, start, dur }) => {
      // Brass layer — sawtooth + bandpass
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.value = freq;
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = freq * 1.8;
      bp.Q.value = 3;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, t + start);
      gain.gain.linearRampToValueAtTime(0.35, t + start + 0.018);
      gain.gain.linearRampToValueAtTime(0.28, t + start + dur * 0.6);
      gain.gain.linearRampToValueAtTime(0, t + start + dur);
      osc.connect(bp);
      bp.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t + start);
      osc.stop(t + start + dur + 0.02);

      // Sine warmth underneath
      const osc2 = ctx.createOscillator();
      osc2.type = "sine";
      osc2.frequency.value = freq;
      const gain2 = ctx.createGain();
      gain2.gain.setValueAtTime(0, t + start);
      gain2.gain.linearRampToValueAtTime(0.15, t + start + 0.02);
      gain2.gain.linearRampToValueAtTime(0, t + start + dur);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(t + start);
      osc2.stop(t + start + dur + 0.02);
    });

    // C major chord swell — warm pad resolving
    [261.63, 329.63, 392.0, 523.25].forEach((freq) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, t + 0.6);
      gain.gain.linearRampToValueAtTime(0.1, t + 0.9);
      gain.gain.linearRampToValueAtTime(0.08, t + 1.6);
      gain.gain.linearRampToValueAtTime(0, t + 2.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t + 0.6);
      osc.stop(t + 2.4);
    });

    // Gold sparkle cascade — twinkling high notes
    [1319, 1568, 2093, 1568, 2637].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      const gain = ctx.createGain();
      const d = 1.35 + i * 0.11;
      gain.gain.setValueAtTime(0.18, t + d);
      gain.gain.exponentialRampToValueAtTime(0.001, t + d + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t + d);
      osc.stop(t + d + 0.35);
    });
  } catch (e) {}
}

// ── Flash animation helper ────────────────────────────────────────
function flashCell(idx, cls) {
  // Re-render then add class briefly
  const cells = document.querySelectorAll("#grid .cell");
  // cells are rendered top-to-bottom (row 3 first), find matching cell
  const { r, c } = toRC(idx);
  const renderRow = 3 - r; // row 3 is at render index 0
  const cellEl = cells[renderRow * 4 + c];
  if (cellEl) {
    cellEl.classList.add(cls);
    setTimeout(() => cellEl.classList.remove(cls), 700);
  }
}

// ── Game Over overlay ─────────────────────────────────────────────
function showOverlay(title, cause, score, isWin) {
  const titleEl = document.getElementById("ov-title");
  titleEl.textContent = title;
  titleEl.className = isWin ? "win" : "";
  document.getElementById("ov-cause").textContent = cause;
  document.getElementById("ov-score").textContent = "Final Score: " + score;
  document.getElementById("overlay").classList.remove("hidden");
}

function die(cause) {
  G.over = true;
  G.score -= 1000;
  const causeText =
    cause === "wumpus" ? "Devoured by the Wumpus." : "Swallowed by the pit.";
  addLog(causeText, "danger");
  render();
  flashCell(G.agentPos, "flash-death");
  playGameOverSound();
  setTimeout(() => showOverlay("GAME OVER", causeText, G.score, false), 600);
}

function winGame() {
  G.over = true;
  if (G.hasGold) G.score += 1000;
  const msg = G.hasGold
    ? "You escape with the gold! A legend is born."
    : "You escaped — but the gold remains.";
  addLog(msg, "success");
  render();
  playVictorySound();
  const title = G.hasGold ? "VICTORY" : "ESCAPED";
  const cause = G.hasGold
    ? "You found the gold and lived to tell."
    : "You survived, but left the gold behind.";
  setTimeout(() => showOverlay(title, cause, G.score, true), 300);
}

// ── Main Action ───────────────────────────────────────────────────
function action(type) {
  if (G.over) return;
  G.score -= 1;
  G.percepts.bump = false;
  G.percepts.scream = false;

  if (type === "forward") {
    const next = getNextCell(G.agentPos, G.agentDir);
    if (next === null) {
      G.percepts.bump = true;
      addLog("Your hand meets cold stone. A wall.", "warn");
    } else {
      G.agentPos = next;
      G.visited.add(next);
      const { r, c } = toRC(next);
      addLog("You move to (" + (c + 1) + "," + (r + 1) + ").");
      computePercepts();
      if (G.pits.includes(next)) {
        die("pit");
        return;
      }
      if (next === G.wumpus && G.wumpusAlive) {
        die("wumpus");
        return;
      }
    }
  } else if (type === "turnLeft") {
    G.agentDir = (G.agentDir + 1) % 4;
    addLog("You turn left. Facing " + DIR_ARROW[G.agentDir] + ".");
    computePercepts();
  } else if (type === "turnRight") {
    G.agentDir = (G.agentDir + 3) % 4;
    addLog("You turn right. Facing " + DIR_ARROW[G.agentDir] + ".");
    computePercepts();
  } else if (type === "grab") {
    if (G.agentPos === G.gold && !G.hasGold) {
      G.hasGold = true;
      G.score += 1000;
      spawnGlitterBurst();
      addLog("You snatch the gold. Its weight feels like destiny.", "success");
      computePercepts();
    } else {
      addLog("Nothing of value here.", "warn");
    }
  } else if (type === "shoot") {
    if (G.arrows <= 0) {
      addLog("Your quiver is empty.", "warn");
    } else {
      G.arrows--;
      G.score -= 10;
      let cell = G.agentPos,
        hit = false;
      while (true) {
        const next = getNextCell(cell, G.agentDir);
        if (next === null) break;
        if (next === G.wumpus && G.wumpusAlive) {
          hit = true;
          break;
        }
        cell = next;
      }
      if (hit) {
        G.wumpusAlive = false;
        G.percepts.scream = true;
        playScream();
        addLog(
          "Your arrow finds its mark. A death-rattle fills the cave.",
          "success",
        );
        computePercepts();
        render(); // render corpse immediately
        injectCorpse(); // stamp corpse once with animation
        spawnBloodSplatter(G.wumpus); // splatter on top
        return;
      } else {
        addLog("The arrow clatters into darkness.", "warn");
      }
    }
  } else if (type === "climb") {
    if (G.agentPos === 0) {
      winGame();
      return;
    } else {
      addLog("The exit is at (1,1). Keep moving.", "warn");
    }
  }

  render();
}

// ═══════════════════════════════════════════════════════════════
//  KEYBOARD CONTROLS
// ═══════════════════════════════════════════════════════════════

const KEY_MAP = {
  ArrowUp: { action: "forward", btn: "btn-fwd" },
  ArrowLeft: { action: "turnLeft", btn: "btn-left" },
  ArrowRight: { action: "turnRight", btn: "btn-right" },
  w: { action: "forward", btn: "btn-fwd" },
  W: { action: "forward", btn: "btn-fwd" },
  a: { action: "turnLeft", btn: "btn-left" },
  A: { action: "turnLeft", btn: "btn-left" },
  d: { action: "turnRight", btn: "btn-right" },
  D: { action: "turnRight", btn: "btn-right" },
  g: { action: "grab", btn: null },
  G: { action: "grab", btn: null },
  f: { action: "shoot", btn: null },
  F: { action: "shoot", btn: null },
  e: { action: "climb", btn: null },
  E: { action: "climb", btn: null },
  r: { action: "__restart", btn: null },
  R: { action: "__restart", btn: null },
};

function flashButton(btnId) {
  if (!btnId) return;
  const el = document.getElementById(btnId);
  if (!el) return;
  el.classList.add("key-active");
  setTimeout(() => el.classList.remove("key-active"), 150);
}

document.addEventListener("keydown", (e) => {
  // Don't trigger if typing in an input
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

  const mapping = KEY_MAP[e.key];
  if (!mapping) return;

  e.preventDefault();
  flashButton(mapping.btn);

  if (mapping.action === "__restart") {
    newGame();
  } else {
    action(mapping.action);
  }
});

// ═══════════════════════════════════════════════════════════════
//  START
// ═══════════════════════════════════════════════════════════════
newGame();
