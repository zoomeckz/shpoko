/**
 * Makes the spoken Bulgarian for the course with Azure text-to-speech.
 *
 *   node scripts/generate-audio.mjs
 *
 * Needs AZURE_SPEECH_KEY and AZURE_SPEECH_REGION in .env.local (never commit
 * that file). Clips that already exist are skipped, so after adding lessons
 * just run it again: only the new text costs anything. Saves the clips to
 * public/audio/bg/ and their list to src/data/speechClips.ts.
 */
import { createServer } from "vite";
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public", "audio", "bg");
const listFile = path.join(root, "src", "data", "speechClips.ts");

const VOICE = process.env.SHPOKO_VOICE || "bg-BG-KalinaNeural";
// A little slower than normal speech, for learners.
const RATE = "-10%";
// The free tier allows 20 requests a minute.
const PAUSE_MS = 3200;

function readEnv() {
  const file = path.join(root, ".env.local");
  const env = {};
  if (existsSync(file)) {
    for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
      const m = /^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/.exec(line);
      if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
  return { ...env, ...process.env };
}

const escapeXml = (s) => s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function loadTexts() {
  const server = await createServer({
    configFile: false,
    root,
    logLevel: "silent",
    appType: "custom",
    server: { middlewareMode: true, hmr: false },
    resolve: { alias: { "@": path.join(root, "src") } },
  });
  try {
    const { courseSpeechTexts } = await server.ssrLoadModule("/src/data/speechTexts.ts");
    return courseSpeechTexts();
  } finally {
    await server.close();
  }
}

async function synthesize({ key, region }, say) {
  const ssml =
    `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="bg-BG">` +
    `<voice name="${VOICE}"><prosody rate="${RATE}">${escapeXml(say)}</prosody></voice></speak>`;
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
        "User-Agent": "shpoko-audio",
      },
      body: ssml,
    });
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    if ((res.status === 429 || res.status >= 500) && attempt < 6) {
      const wait = Number(res.headers.get("retry-after")) * 1000 || 15000 * attempt;
      console.log(`  busy (${res.status}), waiting ${Math.round(wait / 1000)} s…`);
      await sleep(wait);
      continue;
    }
    throw new Error(`Azure said ${res.status}: ${await res.text()}`);
  }
}

function writeList() {
  const ids = existsSync(outDir)
    ? readdirSync(outDir)
        .filter((f) => f.endsWith(".mp3"))
        .map((f) => f.slice(0, -4))
        .sort()
    : [];
  const body = ids.map((id) => `  "${id}",`).join("\n");
  writeFileSync(
    listFile,
    `// Written by scripts/generate-audio.mjs: the clips in public/audio/bg/. Don't edit by hand.\nexport const SPEECH_CLIPS: string[] = [\n${body}\n];\n`
  );
  return ids.length;
}

const env = readEnv();
const azure = { key: env.AZURE_SPEECH_KEY, region: env.AZURE_SPEECH_REGION };
const dryRun = process.argv.includes("--dry-run");
if (!dryRun && (!azure.key || !azure.region)) {
  console.error("Add AZURE_SPEECH_KEY and AZURE_SPEECH_REGION to .env.local first.");
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
const texts = await loadTexts();
const todo = texts.filter((t) => !existsSync(path.join(outDir, `${t.id}.mp3`)));
const chars = todo.reduce((n, t) => n + t.say.length, 0);
console.log(`${texts.length} texts in the course, ${todo.length} new (${chars} characters).`);
if (dryRun) {
  for (const t of todo) console.log(`  ${t.id}  ${t.text}${t.say !== t.text ? `  → "${t.say}"` : ""}`);
  process.exit(0);
}

let made = 0;
try {
  for (const t of todo) {
    const mp3 = await synthesize(azure, t.say);
    writeFileSync(path.join(outDir, `${t.id}.mp3`), mp3);
    made++;
    console.log(`  ${made}/${todo.length}  ${t.text}`);
    if (made < todo.length) await sleep(PAUSE_MS);
  }
} finally {
  console.log(`Made ${made} clip(s); ${writeList()} in total.`);
}
