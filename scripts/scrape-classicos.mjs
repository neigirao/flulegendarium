/**
 * Scrape clássicos data from fluzao.xyz/grafico_adversario/[ADVERSARY_ID]
 *
 * Usage:
 *   node scripts/scrape-classicos.mjs
 *
 * Requirements: Node 18+ (built-in fetch)
 *
 * How to find adversary IDs:
 *   1. Go to https://fluzao.xyz/grafico_adversario/400 in your browser
 *   2. Use the "Adversário" dropdown to switch between Flamengo / Vasco / Botafogo
 *   3. Check the URL after selecting each — it will change to the adversary's ID
 *   4. Fill ADVERSARY_IDS below with what you find
 *
 * What you get:
 *   For each adversary page the script extracts every coach's V/E/D
 *   and cross-references to produce the classicos matrix for maior-treinador.ts
 */

// ── Fill these from the URL when selecting each rival ───────────────────────
const ADVERSARY_IDS = {
  Flamengo: 400,   // confirmed from user screenshot
  Vasco:    null,  // open the dropdown, select Vasco, check URL
  Botafogo: null,  // open the dropdown, select Botafogo, check URL
};
// ────────────────────────────────────────────────────────────────────────────

// Coaches we care about — key must match id in maior-treinador.ts
const TARGET_COACHES = [
  'Zezé Moreira',
  'Abel Braga',
  'Ondino Vieira',
  'Renato Gaúcho',
  'Fernando Diniz',
  'Tim',
  'Nelsinho',
  'Sílvio Pirilo',
  'Carlos Alberto Parreira',
  'Muricy Ramalho',
  'Joel Santana',
  'Levir Culpi',
  'Cristóvão Borges',
  'Oswaldo de Oliveira',
  'Luís Vinhaes',
];

// Map display name → our id key
const NAME_TO_ID = {
  'Zezé Moreira':           'zeze-moreira',
  'Abel Braga':             'abel-braga',
  'Ondino Vieira':          'ondino-vieira',
  'Renato Gaúcho':          'renato-gaucho',
  'Fernando Diniz':         'fernando-diniz',
  'Tim':                    'tim',
  'Nelsinho':               'nelsinho-rosa',
  'Sílvio Pirilo':          'silvio-pirilo',
  'Carlos Alberto Parreira':'parreira',
  'Muricy Ramalho':         'muricy-ramalho',
  'Joel Santana':           'joel-santana',
  'Levir Culpi':            'levir-culpi',
  'Cristóvão Borges':       'cristovao-borges',
  'Oswaldo de Oliveira':    'oswaldo-oliveira',
  'Luís Vinhaes':           'luis-vinhaes',
};

const DELAY_MS = 800;

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
 * Parse a grafico_adversario page HTML.
 * The page renders a Chart.js bar chart. Data is embedded in a <script> block
 * as a JavaScript object like: { labels: [...], datasets: [...] }
 * Each dataset typically represents one metric (Vitórias, Empates, Derrotas).
 */
function parsePage(html) {
  const result = {}; // coachName → { v, e, d, jogos }

  // ── Strategy 1: find Chart.js data in <script> ──────────────────────────
  const scriptBlocks = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);

  for (const script of scriptBlocks) {
    if (!script.includes('labels') || !script.includes('data')) continue;

    // Extract labels array (coach names)
    const labelsRaw = script.match(/labels\s*[:=]\s*(\[[\s\S]*?\])/);
    if (!labelsRaw) continue;

    let labels;
    try {
      // Normalize: replace single-quoted strings and trailing commas
      const cleaned = labelsRaw[1]
        .replace(/'/g, '"')
        .replace(/,\s*]/g, ']');
      labels = JSON.parse(cleaned);
    } catch {
      // Fallback: extract strings manually
      labels = [...labelsRaw[1].matchAll(/['"]([^'"]+)['"]/g)].map(m => m[1]);
    }
    if (!labels?.length) continue;

    // Extract all data arrays
    const dataArrays = [];
    for (const m of script.matchAll(/\bdata\s*:\s*(\[[^\]]*\])/g)) {
      try {
        dataArrays.push(JSON.parse(m[1]));
      } catch {
        const nums = m[1].match(/-?\d+(?:\.\d+)?/g);
        if (nums) dataArrays.push(nums.map(Number));
      }
    }

    // Also look for dataset labels (Vitórias/Empates/Derrotas) to map order
    const datasetLabels = [...script.matchAll(/label\s*:\s*['"]([^'"]+)['"]/g)].map(m => m[1].toLowerCase());

    let vIdx = -1, eIdx = -1, dIdx = -1, jogosIdx = -1;
    datasetLabels.forEach((l, i) => {
      if (/vit/i.test(l)) vIdx = i;
      else if (/emp/i.test(l)) eIdx = i;
      else if (/der/i.test(l)) dIdx = i;
      else if (/jogo/i.test(l)) jogosIdx = i;
    });

    // If we can't determine order by label, assume V=0, E=1, D=2
    if (vIdx === -1 && dataArrays.length >= 3) { vIdx = 0; eIdx = 1; dIdx = 2; }

    if (vIdx === -1 || dataArrays.length === 0) continue;

    for (let i = 0; i < labels.length; i++) {
      const rawName = labels[i].replace(/-\d{4}$/, '').trim(); // remove year suffix "Zezé Moreira-1973" → "Zezé Moreira"
      result[rawName] = {
        v:     dataArrays[vIdx]?.[i]     ?? 0,
        e:     dataArrays[eIdx]?.[i]     ?? 0,
        d:     dataArrays[dIdx]?.[i]     ?? 0,
        jogos: dataArrays[jogosIdx]?.[i] ?? null,
      };
    }

    if (Object.keys(result).length > 0) {
      console.log(`    Parsed ${Object.keys(result).length} entries via Chart.js script block`);
      return result;
    }
  }

  // ── Strategy 2: look for data table in HTML ──────────────────────────────
  // Some pages render a <table> alongside or instead of the chart
  const tableRows = [...html.matchAll(/<tr[^>]*>[\s\S]*?<\/tr>/gi)];
  for (const [row] of tableRows) {
    const cells = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
    if (cells.length < 4) continue;
    const name = cells[0].replace(/-\d{4}$/, '').trim();
    const nums = cells.slice(1).map(Number).filter(n => !isNaN(n));
    if (nums.length >= 3 && TARGET_COACHES.some(t => name.includes(t.split(' ')[0]))) {
      result[name] = { v: nums[0], e: nums[1], d: nums[2] };
    }
  }

  if (Object.keys(result).length > 0) {
    console.log(`    Parsed ${Object.keys(result).length} entries via HTML table`);
  }
  return result;
}

async function fetchAdversary(rivalName, id) {
  const url = `https://fluzao.xyz/grafico_adversario/${id}`;
  console.log(`\nFetching ${rivalName} (${url})...`);
  try {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      console.error(`  ✗ HTTP ${res.status} — run this script on a residential IP`);
      return null;
    }
    const html = await res.text();
    const data = parsePage(html);
    if (Object.keys(data).length === 0) {
      console.warn(`  ⚠ No data parsed — saving HTML to /tmp/fluzao_${rivalName.toLowerCase()}.html for inspection`);
      const { writeFileSync } = await import('fs');
      writeFileSync(`/tmp/fluzao_${rivalName.toLowerCase()}.html`, html);
    }
    return data;
  } catch (err) {
    console.error(`  ✗ ${err.message}`);
    return null;
  }
}

async function main() {
  const byRival = {}; // rival → { coachName → { v, e, d } }

  for (const [rival, id] of Object.entries(ADVERSARY_IDS)) {
    if (id === null) {
      console.log(`\nSkipping ${rival} — fill ADVERSARY_IDS with the URL id`);
      continue;
    }
    const data = await fetchAdversary(rival, id);
    if (data) byRival[rival] = data;
    await sleep(DELAY_MS);
  }

  if (Object.keys(byRival).length === 0) {
    console.log('\nNo data fetched. Make sure you run this on a machine with residential internet access.');
    return;
  }

  // Build output per coach
  console.log('\n── Paste into maior-treinador.ts (classicos field) ─────────────────\n');

  for (const [displayName, id] of Object.entries(NAME_TO_ID)) {
    const rivals = ['Flamengo', 'Vasco', 'Botafogo'];
    const lines = rivals.map(r => {
      const d = byRival[r]?.[displayName];
      if (!d) return `    ${r.padEnd(8)}: null /* not fetched */`;
      return `    ${r.padEnd(8)}: { v: ${d.v}, e: ${d.e}, d: ${d.d} }`;
    });
    console.log(`  // ${id}`);
    console.log('  classicos: {');
    lines.forEach(l => console.log(l + ','));
    console.log('  },');
    console.log();
  }

  console.log('─────────────────────────────────────────────────────────────────────');
  console.log('\nDone! Copy the classicos blocks above into src/data/maior-treinador.ts');
}

main();
