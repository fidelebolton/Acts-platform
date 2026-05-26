#!/usr/bin/env node
/**
 * build-journeys.mjs
 *
 * Builds a GeoJSON FeatureCollection covering the full geographic
 * narrative of Acts 1–28 — early-church movements + Paul's four journeys:
 *
 *   Movements (Acts 1–12, the foundational years):
 *     1. Jerusalem and the Early Church     (Acts 1–7,           AD 30–35)
 *     2. Philip and the Scattered Church    (Acts 8,             AD 35)
 *     3. Saul's Conversion                  (Acts 9 + Gal 1:17,  AD 35–c.46)
 *     4. Peter to the Gentiles              (Acts 9:32–10:48,    AD 38–41)
 *     5. Antioch and Herod                  (Acts 11–12,         AD 41–47)
 *
 *   Paul's journeys (Acts 13–28, the missionary expansion):
 *     6. First Missionary Journey           (Acts 13–14,         AD 46–49)
 *     7. Second Missionary Journey          (Acts 15:36–18:22,   AD 49–52)
 *     8. Third Missionary Journey           (Acts 18:23–21:17,   AD 53–58)
 *     9. Voyage to Rome                     (Acts 27:1–28:31,    AD 59–60)
 *
 * Each entry is emitted as:
 *   - One LineString feature (the route, in narrative order)
 *   - One Point feature per stop (with Acts references and pastoral notes)
 *
 * For Acts 1–7 the "route" runs between sub-Jerusalem teaching sites
 * (Mount of Olives, Upper Room, Solomon's Portico, Beautiful Gate,
 * Sanhedrin chambers, Akeldama). All other stops are at the canonical
 * modern coordinates of each ancient city, cross-checked against the
 * OpenBible.info dataset emitted by parse-locations.mjs.
 */

import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = resolve(__dirname, '../public/data/journeys.geojson');
const LOC_PATH = resolve(__dirname, '../public/data/locations.json');

// Each waypoint: [ancient_name, lon, lat, acts_ref, notes]
// Coordinates correspond to the modern equivalent of each ancient location.
const JOURNEYS = [
  {
    id: 'movement-jerusalem',
    name: 'Jerusalem and the Early Church',
    period: 'AD 30–35',
    acts_range: 'Acts 1–7',
    color: '#3D6B7A', // slate teal — foundational waters of Pentecost
    narrative: 'Before the church moves out, it must wait in. Power for mission comes from intimacy with the Father. Pentecost falls on a praying community, and a Spirit-filled witness rises in the very Temple courts where Jesus was condemned.',
    stops: [
      ['Mount of Olives',    35.2453, 31.7794, 'Acts 1:9–12',  'Jesus ascends from this hill; the apostles return to Jerusalem waiting for the promised Spirit.'],
      ['Upper Room',         35.2294, 31.7717, 'Acts 1:13–2:4', 'One hundred twenty in one accord; tongues of fire fall — the church is born in prayer and power.'],
      ['Solomon\'s Portico', 35.2370, 31.7780, 'Acts 3:11; 5:12', 'Daily teaching ground in the Temple — bold witness "with one accord" in the very courts where Jesus walked.'],
      ['Beautiful Gate',     35.2380, 31.7782, 'Acts 3:1–10',  'Peter and John heal the lame man; the Name of Jesus opens what no silver could.'],
      ['Sanhedrin Council',  35.2346, 31.7779, 'Acts 4:5–22; 5:27–40', 'Twice before the council: "We cannot but speak of what we have seen and heard."'],
      ['Akeldama',           35.2329, 31.7684, 'Acts 1:18–19', 'The field bought with Judas\'s silver — a sobering reminder that betrayal has a place, and Christ still builds his church.'],
    ],
  },
  {
    id: 'movement-philip',
    name: 'Philip and the Scattered Church',
    period: 'AD 35',
    acts_range: 'Acts 8',
    color: '#5A9FB8', // sky blue — Spirit-driven wind
    narrative: 'Persecution scatters what worship gathered. What enemies intend for ruin, God uses for mission — Philip preaches Christ in Samaria, then runs alongside a chariot on a desert road, and the gospel begins to cross the borders Jesus named in Acts 1:8.',
    stops: [
      ['Jerusalem',     35.2342, 31.7777, 'Acts 8:1–4',   'Saul ravages the church; the believers are scattered — and as they go, they preach the word.'],
      ['Samaria',       35.1893, 32.2767, 'Acts 8:5–25',  'Philip proclaims Christ; the city receives the word with great joy; Peter and John lay hands and the Spirit falls.'],
      ['Gaza Road',     34.9333, 31.5667, 'Acts 8:26–38', 'An angel sends Philip south; the Ethiopian reads Isaiah 53 — "How can I understand, unless someone guides me?"'],
      ['Azotus',        34.6553, 31.8044, 'Acts 8:40',    'Caught up by the Spirit — Philip\'s next preaching post on the old Philistine plain.'],
      ['Caesarea',      34.8920, 32.5000, 'Acts 8:40; 21:8', 'Philip settles here as an evangelist; years later his four daughters prophesy and Paul stays in his home.'],
    ],
  },
  {
    id: 'movement-saul',
    name: 'Saul\'s Conversion',
    period: 'AD 35–c.46',
    acts_range: 'Acts 9; Galatians 1:17',
    color: '#8B4F9F', // royal violet — transformation
    narrative: 'The persecutor becomes the preacher. A light from heaven and a voice from heaven turn Saul\'s zeal inside out. He is led blind into Damascus, hidden away in Arabia, run out through a window — and finally sent home to Tarsus, waiting for the years when the Spirit will call him back.',
    stops: [
      ['Jerusalem',         35.2342, 31.7777, 'Acts 9:1–2',   'Breathing threats and murder; letters in hand to drag the Way\'s disciples back in chains.'],
      ['Damascus',          36.2765, 33.5138, 'Acts 9:3–9',   'Light from heaven; voice from heaven — "Why do you persecute me?" The persecutor falls.'],
      ['Straight Street',   36.3092, 33.5117, 'Acts 9:10–19', 'Three blind days; Ananias lays hands — scales fall, Saul is filled with the Spirit, and is baptized.'],
      ['Arabia',            35.4419, 30.3286, 'Galatians 1:17', 'A hidden season in the desert; the gospel reshapes him before he speaks it.'],
      ['Damascus (return)', 36.2765, 33.5138, 'Acts 9:20–25', 'Bold synagogue preaching: "He is the Son of God." Let down through the wall in a basket to escape the plot.'],
      ['Jerusalem (return)', 35.2342, 31.7777, 'Acts 9:26–29', 'The disciples fear him; Barnabas vouches for him; he debates the Hellenists boldly until they too plot his death.'],
      ['Tarsus',            34.8956, 36.9168, 'Acts 9:30',    'Sent home for safety — years of obscurity preparing for what the Spirit will do at Antioch.'],
    ],
  },
  {
    id: 'movement-peter',
    name: 'Peter to the Gentiles',
    period: 'AD 38–41',
    acts_range: 'Acts 9:32–11:18',
    color: '#4A8B5C', // forest green — new life
    narrative: 'While Saul waits in Tarsus, Peter walks down to the coast. Healings at Lydda and Joppa open the way; a rooftop vision in Joppa breaks the wall — and at Caesarea, in Cornelius\'s house, the Gentile Pentecost falls. What God has cleansed, no one may call common.',
    stops: [
      ['Jerusalem',          35.2342, 31.7777, 'Acts 9:32',     'Peter ministering at the heart of the Jewish church before the door opens to the nations.'],
      ['Lydda',              34.8956, 31.9519, 'Acts 9:32–35',  'Aeneas, bedridden eight years, healed in the Name; all who lived in Lydda and Sharon turned to the Lord.'],
      ['Joppa',              34.7569, 32.0500, 'Acts 9:36–10:23', 'Tabitha raised at Simon the tanner\'s house; the rooftop vision: "Do not call unclean what God has cleansed."'],
      ['Caesarea',           34.8920, 32.5000, 'Acts 10:24–48', 'Cornelius\'s household receives the Spirit while Peter is still preaching — the Gentile Pentecost.'],
      ['Jerusalem (return)', 35.2342, 31.7777, 'Acts 11:1–18',  'Peter explains; the church glorifies God — "to the Gentiles also God has granted repentance unto life."'],
    ],
  },
  {
    id: 'movement-antioch',
    name: 'Antioch and Herod',
    period: 'AD 41–47',
    acts_range: 'Acts 11:19–12:25',
    color: '#D97742', // warm orange — the new center
    narrative: 'The scattered believers preach as they go, and a Gentile church is born in Antioch. Barnabas finds Saul in Tarsus and brings him in. There the disciples are first called *Christians* — the name fits, because they belong to Him. Meanwhile Herod\'s persecution rises in Jerusalem and falls under God\'s hand at Caesarea.',
    stops: [
      ['Jerusalem',                   35.2342, 31.7777, 'Acts 11:19; 12:1', 'Persecution scatters; later Herod kills James and arrests Peter — but the church prays without ceasing.'],
      ['Phoenicia',                   35.1970, 33.2720, 'Acts 11:19',      'Believers travel as far as Phoenicia — preaching, but at first only to Jews.'],
      ['Cyprus',                      33.9010, 35.1810, 'Acts 11:19',      'Among the dispersed, the gospel travels in the holds of trade ships.'],
      ['Antioch',                     36.1720, 36.2270, 'Acts 11:20–21',   'Cypriots and Cyrenians speak to Greeks; "the hand of the Lord was with them" — a Gentile church is born.'],
      ['Jerusalem (sends Barnabas)',  35.2342, 31.7777, 'Acts 11:22',      'The mother church hears and sends a good man — "full of the Holy Spirit and of faith."'],
      ['Antioch (Barnabas arrives)',  36.1720, 36.2270, 'Acts 11:23–24',   'He sees the grace of God and rejoices; exhorts them to remain near the Lord with steadfast hearts.'],
      ['Tarsus',                      34.8956, 36.9168, 'Acts 11:25',      'Barnabas seeks Saul out — God has been preparing him in the hidden years.'],
      ['Antioch (a whole year)',      36.1720, 36.2270, 'Acts 11:26',      'A year of teaching together; the disciples are first called *Christians* — the name fits.'],
      ['Caesarea',                    34.8920, 32.5000, 'Acts 12:19–23',   'Herod accepts the crowd\'s "voice of a god" and is struck down — a king who refused glory to God.'],
      ['Jerusalem (Peter freed)',     35.2342, 31.7777, 'Acts 12:1–17',    'Angel-led from prison; "now I know the Lord has sent his angel" — the praying church amazed.'],
      ['Antioch (return)',            36.1720, 36.2270, 'Acts 12:25',      'Barnabas and Saul return from famine relief, bringing John Mark — and the missionary chapter begins.'],
    ],
  },
  {
    id: 'journey-1',
    name: 'First Missionary Journey',
    period: 'AD 46–49',
    acts_range: 'Acts 13:1–14:28',
    color: '#C9A84C', // gold
    narrative: 'Sent out by the Spirit through the church at Antioch, Paul and Barnabas sail to Cyprus and push inland through the rugged southern provinces of Asia Minor — preaching, planting, and suffering for the gospel.',
    stops: [
      ['Antioch (Syrian)',   36.172, 36.227, 'Acts 13:1–3',   'Sent out by the church with prayer and fasting.'],
      ['Seleucia',           35.927, 36.119, 'Acts 13:4',     'Port of departure for Cyprus.'],
      ['Salamis',            33.901, 35.181, 'Acts 13:5',     'First preaching in Jewish synagogues on Cyprus.'],
      ['Paphos',             32.404, 34.756, 'Acts 13:6–12',  'Elymas blinded; the proconsul Sergius Paulus believes.'],
      ['Perga',              30.852, 36.961, 'Acts 13:13',    'John Mark departs back to Jerusalem.'],
      ['Pisidian Antioch',   31.187, 38.305, 'Acts 13:14–50', 'Synagogue sermon — Gentiles receive the word with joy.'],
      ['Iconium',            32.492, 37.872, 'Acts 13:51–14:5', 'Bold preaching; plot to stone them — they flee.'],
      ['Lystra',             32.338, 37.602, 'Acts 14:6–20',  'Lame man healed; mistaken for gods, then Paul is stoned.'],
      ['Derbe',              33.361, 37.349, 'Acts 14:20–21', 'Many disciples made — furthest point of the journey.'],
      ['Lystra (return)',    32.338, 37.602, 'Acts 14:21',    'Strengthening the churches, appointing elders.'],
      ['Iconium (return)',   32.492, 37.872, 'Acts 14:21',    'Same — strengthening, appointing.'],
      ['Pisidian Antioch (r)', 31.187, 38.305, 'Acts 14:21',  'Same — strengthening, appointing.'],
      ['Perga (return)',     30.852, 36.961, 'Acts 14:25',    'Preaching the word in Perga.'],
      ['Attalia',            30.708, 36.886, 'Acts 14:25',    'Port of return.'],
      ['Antioch (return)',   36.172, 36.227, 'Acts 14:26–28', 'Report to the sending church — the door of faith opened to the Gentiles.'],
    ],
  },
  {
    id: 'journey-2',
    name: 'Second Missionary Journey',
    period: 'AD 49–52',
    acts_range: 'Acts 15:36–18:22',
    color: '#8B5A3C', // ochre
    narrative: 'After the Jerusalem Council, Paul takes Silas and revisits the churches. The Spirit redirects them to Troas, where the Macedonian vision opens Europe to the gospel.',
    stops: [
      ['Antioch (Syrian)', 36.172, 36.227, 'Acts 15:36–40', 'Paul and Silas commissioned; Barnabas takes John Mark to Cyprus.'],
      ['Derbe',            33.361, 37.349, 'Acts 16:1',     'Strengthening the churches.'],
      ['Lystra',           32.338, 37.602, 'Acts 16:1–3',   'Timothy joins the team.'],
      ['Troas',            26.159, 39.752, 'Acts 16:8–10',  'Vision of the man of Macedonia — "Come over and help us."'],
      ['Samothrace',       25.531, 40.494, 'Acts 16:11',    'Overnight stop at sea.'],
      ['Neapolis',         24.405, 40.937, 'Acts 16:11',    'First step onto European soil.'],
      ['Philippi',         24.285, 41.012, 'Acts 16:12–40', 'Lydia, the slave-girl, the jailer — Europe\'s first church.'],
      ['Amphipolis',       23.842, 40.823, 'Acts 17:1',     'Passing through.'],
      ['Apollonia',        23.439, 40.747, 'Acts 17:1',     'Passing through.'],
      ['Thessalonica',     22.946, 40.638, 'Acts 17:1–9',   'Three Sabbaths of bold preaching; mob and accusation.'],
      ['Berea',            22.200, 40.518, 'Acts 17:10–14', 'The "noble Bereans" — searching the Scriptures daily.'],
      ['Athens',           23.727, 37.972, 'Acts 17:15–34', 'The Areopagus sermon — the unknown God made known.'],
      ['Corinth',          22.879, 37.906, 'Acts 18:1–17',  'Eighteen months with Aquila and Priscilla; 1 and 2 Thessalonians written here.'],
      ['Cenchrea',         22.985, 37.881, 'Acts 18:18',    'Port east of Corinth — Paul shaves his head.'],
      ['Ephesus (brief)',  27.341, 37.939, 'Acts 18:19–21', 'Brief reasoning in the synagogue — "I will return."'],
      ['Caesarea',         34.892, 32.500, 'Acts 18:22',    'Greeting the church.'],
      ['Antioch (return)', 36.172, 36.227, 'Acts 18:22',    'Home base after the second journey.'],
    ],
  },
  {
    id: 'journey-3',
    name: 'Third Missionary Journey',
    period: 'AD 53–58',
    acts_range: 'Acts 18:23–21:17',
    color: '#1B2A4A', // deep navy
    narrative: 'Paul revisits Galatia and Phrygia, then settles in Ephesus for nearly three years — the longest single ministry of his life. The whole province of Asia hears the word of the Lord.',
    stops: [
      ['Antioch (Syrian)',   36.172, 36.227, 'Acts 18:23',    'Third departure from the sending church.'],
      ['Galatia & Phrygia',  32.500, 39.500, 'Acts 18:23',    'Strengthening all the disciples in turn.'],
      ['Ephesus',            27.341, 37.939, 'Acts 19:1–41',  'Three-year ministry; the riot of the silversmiths; the word grew mightily.'],
      ['Macedonia',          22.946, 40.638, 'Acts 20:1–2',   'Revisiting Philippi, Thessalonica, Berea.'],
      ['Greece (Corinth)',   22.879, 37.906, 'Acts 20:2–3',   'Three months — likely writing Romans.'],
      ['Philippi (Passover)', 24.285, 41.012, 'Acts 20:6',     'Sailing after the Feast of Unleavened Bread.'],
      ['Troas',              26.159, 39.752, 'Acts 20:6–12',  'Eutychus falls from a window — and is raised.'],
      ['Assos',              26.337, 39.491, 'Acts 20:13–14', 'Paul walks ahead by land; rejoins the ship.'],
      ['Mitylene',           26.555, 39.110, 'Acts 20:14',    'Overnight stop on Lesbos.'],
      ['Chios',              26.137, 38.368, 'Acts 20:15',    'Passing the island.'],
      ['Samos',              26.973, 37.755, 'Acts 20:15',    'Touching the island.'],
      ['Miletus',            27.276, 37.531, 'Acts 20:17–38', 'Tearful farewell to the Ephesian elders.'],
      ['Cos',                27.290, 36.893, 'Acts 21:1',     'Day\'s sail to Cos.'],
      ['Rhodes',             28.224, 36.434, 'Acts 21:1',     'Onward to Rhodes.'],
      ['Patara',             29.318, 36.262, 'Acts 21:1–2',   'Transferring ships to one bound for Phoenicia.'],
      ['Tyre',               35.197, 33.272, 'Acts 21:3–6',   'Disciples warn Paul through the Spirit not to go up to Jerusalem.'],
      ['Ptolemais',          35.082, 32.929, 'Acts 21:7',     'One day with the brothers.'],
      ['Caesarea',           34.892, 32.500, 'Acts 21:8–14',  'Philip the evangelist hosts; Agabus binds his hands.'],
      ['Jerusalem',          35.234, 31.777, 'Acts 21:15–17', 'Arrested in the temple — the journey ends in chains.'],
    ],
  },
  {
    id: 'journey-4',
    name: 'Voyage to Rome',
    period: 'AD 59–60',
    acts_range: 'Acts 27:1–28:31',
    color: '#7B2D26', // wine red
    narrative: 'As a prisoner appealing to Caesar, Paul sails through storm and shipwreck — and proclaims the kingdom of God in the heart of the empire.',
    stops: [
      ['Caesarea',     34.892, 32.500, 'Acts 27:1–2',   'Embarking under centurion Julius.'],
      ['Sidon',        35.376, 33.560, 'Acts 27:3',     'Julius kindly allows Paul to visit friends.'],
      ['Myra',         29.985, 36.260, 'Acts 27:5–6',   'Transferring to an Alexandrian grain ship bound for Italy.'],
      ['Cnidus',       27.376, 36.687, 'Acts 27:7',     'Sailing with difficulty against the wind.'],
      ['Cape Salmone', 26.299, 35.305, 'Acts 27:7',     'Rounding the eastern tip of Crete.'],
      ['Fair Havens',  24.769, 34.945, 'Acts 27:8–12',  'Paul\'s warning rejected — they sail on.'],
      ['Driven adrift', 21.0,  35.0,   'Acts 27:13–38', 'Fourteen days in the storm; Paul sees an angel; 276 souls saved.'],
      ['Malta',        14.412, 35.933, 'Acts 27:39–28:10', 'Shipwreck; the viper; the chief Publius healed; three months on the island.'],
      ['Syracuse',     15.292, 37.069, 'Acts 28:12',    'Three days in Sicily.'],
      ['Rhegium',      15.651, 38.115, 'Acts 28:13',    'A favorable south wind rises.'],
      ['Puteoli',      14.121, 40.823, 'Acts 28:13–14', 'Brothers in Italy — seven days together.'],
      ['Forum of Appius', 12.989, 41.581, 'Acts 28:15', 'Roman believers come 43 miles to meet him.'],
      ['Three Taverns', 12.776, 41.671, 'Acts 28:15',   '"On seeing them, Paul thanked God and took courage."'],
      ['Rome',         12.485, 41.892, 'Acts 28:16–31', 'Two years of house arrest — preaching the kingdom with all boldness, and unhindered.'],
    ],
  },
];

function buildFeature(journey) {
  // The route LineString — connects all stops in order.
  const coords = journey.stops.map(([_, lon, lat]) => [lon, lat]);
  return {
    type: 'Feature',
    id: `${journey.id}-route`,
    geometry: { type: 'LineString', coordinates: coords },
    properties: {
      kind: 'route',
      journey_id: journey.id,
      name: journey.name,
      period: journey.period,
      acts_range: journey.acts_range,
      color: journey.color,
      narrative: journey.narrative,
      stop_count: journey.stops.length,
    },
  };
}

function buildStopFeatures(journey) {
  return journey.stops.map(([name, lon, lat, ref, notes], i) => ({
    type: 'Feature',
    id: `${journey.id}-stop-${i + 1}`,
    geometry: { type: 'Point', coordinates: [lon, lat] },
    properties: {
      kind: 'stop',
      journey_id: journey.id,
      journey_name: journey.name,
      color: journey.color,
      sequence: i + 1,
      total_stops: journey.stops.length,
      name,
      acts_ref: ref,
      notes,
    },
  }));
}

function main() {
  console.log('🛤️  Building Acts 1–28 movements & journeys GeoJSON');
  console.log();

  // Optionally cross-check coordinates against locations.json to ensure
  // we're not drifting from the canonical modern coords used elsewhere
  // on the site. This is informational — it doesn't fail the build.
  let locMap = new Map();
  if (existsSync(LOC_PATH)) {
    const loc = JSON.parse(readFileSync(LOC_PATH, 'utf-8'));
    for (const l of loc.locations) {
      locMap.set(l.ancient_name.toLowerCase().replace(/\s+\d+$/, '').trim(), l);
    }
  }

  const features = [];
  let totalStops = 0;

  for (const j of JOURNEYS) {
    features.push(buildFeature(j));
    features.push(...buildStopFeatures(j));
    totalStops += j.stops.length;

    // Cross-check a few stops against OpenBible coords (informational)
    let drift = 0;
    for (const [name, lon, lat] of j.stops) {
      const key = name.split(' (')[0].toLowerCase();
      const match = locMap.get(key);
      if (match) {
        const dlon = Math.abs(match.lon - lon);
        const dlat = Math.abs(match.lat - lat);
        if (dlon > 0.5 || dlat > 0.5) drift++;
      }
    }
    console.log(`   • ${j.name.padEnd(28)} ${String(j.stops.length).padStart(2)} stops${drift ? `  (⚠ ${drift} drift>0.5°)` : ''}`);
  }

  const collection = {
    type: 'FeatureCollection',
    name: 'Movements and Journeys in the Book of Acts',
    crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' } },
    metadata: {
      journeys: JOURNEYS.length,
      total_stops: totalStops,
      attribution: 'Early-church movements (Acts 1–12) and Paul\'s four journeys (Acts 13–28). Coordinates aligned to OpenBible.info modern equivalents; sub-Jerusalem teaching sites at traditional locations.',
      generatedAt: new Date().toISOString(),
    },
    features,
  };

  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(collection, null, 2));

  console.log();
  console.log(`✅ Wrote ${OUT_PATH}`);
  console.log(`   • ${JOURNEYS.length} routes (5 movements + 4 Pauline journeys), ${totalStops} stops`);
  console.log(`   • ${features.length} GeoJSON features (${JOURNEYS.length} routes + ${totalStops} stops)`);
}

main();
