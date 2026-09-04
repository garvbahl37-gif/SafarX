/**
 * The two catalogues that live in JavaScript rather than JSON, dumped so the
 * Python pipeline can read them. Parsing JS with a regex was guessing at a
 * shape the file is free to change; importing it asks the file itself.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const { PLACES } = await import(path.join(root, 'src/data/indiaPlaces.js'));
const { culturalSites } = await import(path.join(root, 'src/data/itineraryData.js'));

const attractions = [];
for (const [state, list] of Object.entries(culturalSites || {})) {
  for (const a of list) attractions.push({ ...a, state });
}

const out = path.join(root, 'data/recsys/_source.json');
fs.writeFileSync(out, JSON.stringify({ places: PLACES, attractions }, null, 1));
console.log(`  places ${PLACES.length} · attractions ${attractions.length} → ${path.relative(root, out)}`);
