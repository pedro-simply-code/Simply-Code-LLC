/* Temporary CDP screenshots of the /work filter for design review. */
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const WebSocket = require("ws");

const EDGE = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const PORT = 9351;
const URL_TO_TEST = "http://localhost:3000/work";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForJson(url, attempts = 80) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch {
      /* not up yet */
    }
    await sleep(250);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function main() {
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "filter-ui-"));
  const browser = spawn(
    EDGE,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${userDataDir}`,
      "--window-size=1440,1000",
      "about:blank",
    ],
    { stdio: "ignore" },
  );

  try {
    await waitForJson(`http://127.0.0.1:${PORT}/json/version`);
    const target = await fetch(`http://127.0.0.1:${PORT}/json/new`, {
      method: "PUT",
    }).then((r) => r.json());

    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.once("open", resolve);
      ws.once("error", reject);
    });

    let id = 0;
    const pending = new Map();
    ws.on("message", (raw) => {
      const msg = JSON.parse(raw.toString());
      if (msg.id && pending.has(msg.id)) {
        const p = pending.get(msg.id);
        pending.delete(msg.id);
        msg.error ? p.reject(new Error(JSON.stringify(msg.error))) : p.resolve(msg.result);
      }
    });
    const send = (method, params = {}) => {
      const messageId = ++id;
      return new Promise((resolve, reject) => {
        pending.set(messageId, { resolve, reject });
        ws.send(JSON.stringify({ id: messageId, method, params }));
      });
    };
    const evaluate = async (expression) => {
      const result = await send("Runtime.evaluate", {
        expression,
        returnByValue: true,
        awaitPromise: true,
      });
      if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
      return result.result.value;
    };

    await send("Page.enable");
    await send("Runtime.enable");
    await send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-reduced-motion", value: "reduce" }],
    });

    const shoot = async (width, height, file, scrollTo = 0) => {
      await send("Emulation.setDeviceMetricsOverride", {
        width,
        height,
        deviceScaleFactor: 1,
        mobile: width < 600,
      });
      await send("Page.navigate", { url: URL_TO_TEST });
      for (let i = 0; i < 120; i++) {
        const ok = await evaluate(
          `Array.from(document.querySelectorAll('button')).some((b) => b.textContent.trim() === 'All')`,
        );
        if (ok) break;
        await sleep(250);
      }
      await sleep(1200);
      if (scrollTo > 0) {
        // The site scrolls inside a PerfectScrollbar root, not the document.
        await evaluate(
          `(() => { const el = document.querySelector(".site-perfect-scroll-root") || document.scrollingElement; el.scrollTop = ${scrollTo}; })()`,
        );
        await sleep(700);
      }
      const shot = await send("Page.captureScreenshot", {
        format: "png",
        captureBeyondViewport: scrollTo === 0,
      });
      fs.writeFileSync(file, Buffer.from(shot.data, "base64"));
      console.log(file, await evaluate(`(() => {
        const allButton = Array.from(document.querySelectorAll('button')).find((b) => b.textContent.trim() === 'All');
        const row = allButton ? allButton.parentElement : null;
        const scroller = document.querySelector('.site-perfect-scroll-root') || document.scrollingElement || document.documentElement;
        if (!row) return { error: 'filter row not found', scrollY: Math.round(scroller.scrollTop) };
        const tops = new Set(Array.from(row.querySelectorAll('button')).map((b) => Math.round(b.getBoundingClientRect().top)));
        return {
          filterRows: tops.size,
          filterHeight: Math.round(row.getBoundingClientRect().height),
          scrollY: Math.round(scroller.scrollTop),
          groupTop: Math.round(row.getBoundingClientRect().top),
        };
      })()`));
    };

    await shoot(1440, 1000, "filter-desktop.png");
    await shoot(390, 844, "filter-mobile.png");

    ws.close();
  } finally {
    browser.kill();
    await sleep(300);
    fs.rmSync(userDataDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error("FAIL:", error.message);
  process.exit(1);
});
