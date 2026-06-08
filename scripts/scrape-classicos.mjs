/**
 * Scrape clássicos data from fluzao.xyz/grafico_adversario/[ID]
 *
 * Usage:
 *   node scripts/scrape-classicos.mjs
 *
 * Requirements: Node 18+ (built-in fetch)
 *
 * How to find coach IDs:
 *   1. Go to https://fluzao.xyz/tecnico in your browser
 *   2. Click a coach → the URL shows the ID (e.g. /link_tecnico/118 → ID = 118)
 *   3. Fill COACH_IDS below and run this script
 */

// ── Fill these IDs from fluzao.xyz/tecnico ──────────────────────────────────
const COACH_IDS = {
  'zeze-moreira':      null,  // find on fluzao.xyz/tecnico
  'abel-braga':        null,
  'ondino-vieira':     null,
  'renato-gaucho':     null,
  'fernando-diniz':    118,   // confirmed
  'tim':               null,
  'nelsinho-rosa':     null,
  'silvio-pirilo':     null,
  'parreira':          null,
  'muricy-ramalho':    null,
  'joel-santana':      null,
  'levir-culpi':       null,
  'cristovao-borges':  null,
  'oswaldo-oliveira':  400,   // example provided by user
  'luis-vinhaes':      null,
};
// ────────────────────────────────────────────────────────────────────────────

const RIVALS = ['Flamengo', 'Vasco', 'Botafogo'];
const DELAY_MS = 800; // be polite

const headers = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
  'Referer': 'https://fluzao.xyz/',
};

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/**
 * Parse the grafico_adversario page HTML and extract V/E/D per rival.
 * The page renders a bar chart. We look for data embedded in the HTML —
 * typically as JSON in a <script> tag or as table rows.
 */
function parseClassicos(html, coachId) {
  const result = { Flamengo: null, Vasco: null, Botafogo: null };

  // Strategy 1: look for JSON data arrays in <script> tags (Chart.js pattern)
  const scriptMatches = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)];
  for (const [, scriptContent] of scriptMatches) {
    if (!scriptContent.includes('data') && !scriptContent.includes('labels')) continue;

    // Look for labels array containing rival names
    const labelsMatch = scriptContent.match(/labels\s*[:=]\s*(\[[^\]]+\])/);
    if (!labelsMatch) continue;

    let labels;
    try { labels = JSON.parse(labelsMatch[1].replace(/'/g, '"')); }
    catch { continue; }

    // Look for datasets with V, E, D
    const datasetMatches = [...scriptContent.matchAll(/data\s*:\s*(\[[^\]]+\])/g)];
    const datasets = datasetMatches.map(m => {
      try { return JSON.parse(m[1]); } catch { return null; }
    }).filter(Boolean);

    if (datasets.length >= 3) {
      // Assume order: [Vitórias, Empates, Derrotas]
      for (let i = 0; i < labels.length; i++) {
        const label = labels[i];
        for (const rival of RIVALS) {
          if (label.toLowerCase().includes(rival.toLowerCase())) {
            result[rival] = {
              v: datasets[0]?.[i] ?? 0,
              e: datasets[1]?.[i] ?? 0,
              d: datasets[2]?.[i] ?? 0,
            };
          }
        }
      }
      const found = Object.values(result).filter(Boolean).length;
      if (found > 0) return result;
    }
  }

  // Strategy 2: look for table rows with rival names and numbers
  const tableRowPattern = /(Flamengo|Vasco|Botafogo)[^<]*<[^>]+>(\d+)[^<]*<[^>]+>(\d+)[^<]*<[^>]+>(\d+)/gi;
  let tableMatch;
  while ((tableMatch = tableRowPattern.exec(html)) !== null) {
    const [, rival, n1, n2, n3] = tableMatch;
    for (const r of RIVALS) {
      if (rival.toLowerCase().includes(r.toLowerCase())) {
        result[r] = { v: +n1, e: +n2, d: +n3 };
      }
    }
  }

  // Strategy 3: look for data-* attributes or inline JSON objects per rival
  for (const rival of RIVALS) {
    if (result[rival]) continue;
    const rivalPattern = new RegExp(
      rival + '[^}]{0,200}?"v(?:itorias?|)"\\s*:\\s*(\\d+)[^}]{0,100}"e(?:mpates?|)"\\s*:\\s*(\\d+)[^}]{0,100}"d(?:errotas?|)"\\s*:\\s*(\\d+)',
      'i'
    );
    const m = html.match(rivalPattern);
    if (m) result[rival] = { v: +m[1], e: +m[2], d: +m[3] };
  }

  return result;
}

async function fetchCoach(coachKey, id) {
  const url = `https://fluzao.xyz/grafico_adversario/${id}`;
  try {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      console.error(`  ✗ ${coachKey} (${id}): HTTP ${res.status}`);
      return null;
    }
    const html = await res.text();
    const classicos = parseClassicos(html, id);

    const found = RIVALS.filter(r => classicos[r] !== null);
    if (found.length === 0) {
      console.warn(`  ⚠ ${coachKey} (${id}): page fetched but no data parsed — check HTML manually`);
      // Dump first 2000 chars to help debug
      console.warn('    HTML snippet:', html.slice(0, 500).replace(/\s+/g, ' '));
    } else {
      console.log(`  ✓ ${coachKey}: ${found.join(', ')}`);
    }
    return classicos;
  } catch (err) {
    console.error(`  ✗ ${coachKey} (${id}): ${err.message}`);
    return null;
  }
}

async function main() {
  const output = {};
  const todo = Object.entries(COACH_IDS).filter(([, id]) => id !== null);
  const skip = Object.entries(COACH_IDS).filter(([, id]) => id === null).map(([k]) => k);

  if (skip.length > 0) {
    console.log(`\nSkipping (no ID): ${skip.join(', ')}\n`);
  }

  console.log(`Fetching ${todo.length} coaches...\n`);

  for (const [coachKey, id] of todo) {
    const data = await fetchCoach(coachKey, id);
    if (data) output[coachKey] = data;
    await sleep(DELAY_MS);
  }

  console.log('\n── Result (paste into maior-treinador.ts) ──────────────────────────\n');
  for (const [key, classicos] of Object.entries(output)) {
    const { Flamengo: f, Vasco: v, Botafogo: b } = classicos;
    const fmt = (r) => r ? `{ v: ${r.v}, e: ${r.e}, d: ${r.d} }` : 'null /* not parsed */';
    console.log(`  // ${key}`);
    console.log(`  classicos: {`);
    console.log(`    Flamengo: ${fmt(f)},`);
    console.log(`    Vasco:    ${fmt(v)},`);
    console.log(`    Botafogo: ${fmt(b)},`);
    console.log(`  },`);
    console.log();
  }

  console.log('────────────────────────────────────────────────────────────────────');
  console.log('\nNext step: fill in the null IDs in COACH_IDS and run again.');
}

main();
