// Real-time motion check. Opens the page in headless Chrome over the DevTools protocol (no dependencies) and, for each app:
// click → trace every frame of the swing + dolly → Esc → trace the flight back. Then asserts what the motion should look like.
//   node trace.mjs [url] [app ids...]        defaults: http://localhost:63483/files/city-sf.html  books about dev
// Headless frames come slowly (SwiftShader), but they are real time, so durations are real; tolerances allow one frame.
import { spawn } from 'node:child_process';

const args = process.argv.slice(2);
const url = args[0]?.startsWith('http') ? args.shift() : 'http://localhost:63483/files/city-sf.html';
const apps = args.length ? args : ['books', 'about', 'dev'];
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9333;
const sleep = ms => new Promise(r => setTimeout(r, ms));

// --- minimal CDP client ---
const chrome = spawn(CHROME, ['--headless=new', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', `--remote-debugging-port=${PORT}`,
  `--user-data-dir=/tmp/city-trace-${process.pid}`, '--window-size=1440,900', 'about:blank'], { stdio: 'ignore' });
let tabs;
for (let i = 0; i < 40 && !tabs; i++) tabs = await fetch(`http://127.0.0.1:${PORT}/json`).then(r => r.json(), () => sleep(250));
const ws = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl);
await new Promise(r => { ws.onopen = r; });
let id = 0;
const pending = {};
ws.onmessage = m => { const d = JSON.parse(m.data); pending[d.id]?.(d); delete pending[d.id]; };
const send = (method, params = {}) => new Promise(r => { pending[++id] = r; ws.send(JSON.stringify({ id, method, params })); });
const evaluate = async (expr, awaitPromise = false) => {
  const d = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise });
  if (d.result.exceptionDetails) throw new Error(d.result.exceptionDetails.exception?.description ?? 'page error');
  return d.result.result.value;
};

// --- in the page: open one app, record every frame until both flights finish ---
const RECORD = async appId => {
  const c = window.city, pin = c.icons.pins.find(p => p.app.id === appId), DEG = 180 / Math.PI;
  const rows = [];
  let t0 = performance.now();
  const sample = phase => {
    const o = c.flights.orbit();
    rows.push({ phase, t: performance.now() - t0, leg: c.flights.leg, yaw: o.yaw * DEG, pitch: o.pitch * DEG, dist: o.dist,
                tx: o.target.x, tz: o.target.z, dx: pin.x === null ? null : pin.x - pin.ax });
  };
  const until = (phase, done) => new Promise(res => {
    const f = () => { sample(phase); done() ? res() : requestAnimationFrame(f); };
    requestAnimationFrame(f);
  });
  const settled = () => performance.now() - t0 > 300 && !c.flights.busy;
  const before = c.flights.orbit();
  pin.el.click();
  await until('open', settled);
  t0 = performance.now();
  dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  await until('close', settled);
  return { rows, before: { yaw: before.yaw * DEG, pitch: before.pitch * DEG, dist: before.dist, tx: before.target.x, tz: before.target.z },
           ground: { x: pin.ground.x, z: pin.ground.z }, MOTION: c.MOTION };
};

// --- checks ---
const legSpan = (rows, name) => {                                   // first frame of the leg → first frame after it
  const i = rows.findIndex(r => r.leg === name), j = rows.findIndex((r, k) => k > i && r.leg !== name);
  return i < 0 || j < 0 ? NaN : rows[j].t - rows[i].t;
};
const maxGap = rows => Math.max(...rows.slice(1).map((r, i) => r.t - rows[i].t));
const angle = (a, b) => Math.abs(((a - b + 540) % 360) - 180);

function check({ rows, before, ground, MOTION }) {
  const open = rows.filter(r => r.phase === 'open'), close = rows.filter(r => r.phase === 'close');
  const tol = maxGap(rows) + 60, dolly = open.filter(r => r.leg === 'dolly'), end = open.at(-1), back = close.at(-1);
  const swingMs = legSpan(open, 'swing'), dollyMs = legSpan(open, 'dolly');
  const dx = Math.max(...open.filter(r => r.dx !== null).map(r => Math.abs(r.dx)));
  return [
    [`swing lasts ${MOTION.swing.ms} ms`, Math.abs(swingMs - MOTION.swing.ms) <= tol, `${swingMs.toFixed(0)} ms`],
    [`dolly lasts ${MOTION.dolly.ms} ms`, Math.abs(dollyMs - MOTION.dolly.ms) <= tol, `${dollyMs.toFixed(0)} ms`],
    ['dolly is a straight push (yaw, pitch, target fixed)', dolly.length > 0 && dolly.every(r => angle(r.yaw, dolly[0].yaw) < .1 && Math.abs(r.pitch - dolly[0].pitch) < .1
      && Math.hypot(r.tx - dolly[0].tx, r.tz - dolly[0].tz) < .5), `${dolly.length} frames`],
    ['leader stays vertical', dx < .5, `max |icon x − landmark x| ${dx.toFixed(2)} px`],
    ['lands on the landmark', Math.hypot(end.tx - ground.x, end.tz - ground.z) < 1, `target off by ${Math.hypot(end.tx - ground.x, end.tz - ground.z).toFixed(2)} m`],
    [`framing ${MOTION.view.pitch}° / ${MOTION.view.dist} m`, Math.abs(end.pitch - MOTION.view.pitch) < .2 && Math.abs(end.dist - MOTION.view.dist) < 2,
      `${end.pitch.toFixed(2)}° / ${end.dist.toFixed(0)} m`],
    ['close returns to the previous view', angle(back.yaw, before.yaw) < .5 && Math.abs(back.pitch - before.pitch) < .2
      && Math.abs(back.dist / before.dist - 1) < .002 && Math.hypot(back.tx - before.tx, back.tz - before.tz) < 1,
      `Δyaw ${angle(back.yaw, before.yaw).toFixed(2)}°, Δdist ${(back.dist - before.dist).toFixed(0)} m`],
  ];
}

// --- run ---
let failed = 0;
try {
  await send('Page.navigate', { url: url + '#trace' });
  for (let i = 0; i < 240 && !(await evaluate('!!window.city?.icons').catch(() => false)); i++) await sleep(500);
  for (const app of apps) {
    const trace = await evaluate(`(${RECORD})(${JSON.stringify(app)})`, true);
    console.log(`\n${app}  (${trace.rows.length} frames, max frame gap ${maxGap(trace.rows).toFixed(0)} ms)`);
    for (const [name, ok, got] of check(trace)) {
      if (!ok) failed++;
      console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${name.padEnd(52)} ${got}`);
    }
  }
} finally {
  chrome.kill();
}
console.log(failed ? `\n${failed} check(s) failed` : '\nall checks passed');
process.exit(failed ? 1 : 0);
