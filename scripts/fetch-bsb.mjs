#!/usr/bin/env node
/**
 * fetch-bsb.mjs
 *
 * Pulls all 28 chapters of Acts from the HelloAO Free Use Bible API
 * (Berean Standard Bible, public domain) and writes a single normalized
 * JSON file to data/bsb-acts.json for the frontend to consume.
 *
 * Runs at build time on Netlify (full internet) — no API key required.
 *
 * Output schema:
 * {
 *   translation: { id, name, ... },
 *   chapters: [
 *     {
 *       number: 1,
 *       content: [
 *         { type: 'heading', text: '...' },
 *         { type: 'verse', number: 1, text: '...', html: '...' },
 *         ...
 *       ],
 *       footnotes: [...],
 *       panel: 1   // six-panel index (1-6)
 *     }
 *   ]
 * }
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Per-language Scripture output paths.
 *
 * Each language's Acts JSON lives at `public/data/scripture/<lang>/acts.json`.
 * The frontend (`src/App.tsx`) fetches the file matching the active language
 * from `LanguageContext` — so adding a real Kinyarwanda Bible only requires
 * dropping a file at the corresponding path and ensuring the language code
 * matches the i18n LangCode.
 */
function outPathFor(lang) {
  return resolve(__dirname, `../public/data/scripture/${lang}/acts.json`);
}

// ─── Scripture translation source ─────────────────────────────────────
// The site currently fetches the public-domain Berean Standard Bible.
//
// TODO: Add a Kinyarwanda Acts feed.
//   1. Check HelloAO's available translations for a Kinyarwanda Acts:
//        https://bible.helloao.org/api/available_translations.json
//      (look for language code "kin" / "rw" — common Rwandan Bible is
//      *Bibiliya Yera*; confirm with Pastor Fidele which translation
//      he wants to use). If found, swap BSB for that translation id.
//   2. If HelloAO doesn't have Kinyarwanda Acts, alternatives:
//        - YouVersion API (requires key; many Kinyarwanda translations)
//        - STEPBible open data
//        - Manual import of an approved public-domain Kinyarwanda
//          Acts text via a separate fetch step.
//   3. To support BOTH English and Kinyarwanda Scripture simultaneously,
//      output two files (bsb-acts.en.json + bsb-acts.rw.json) keyed by
//      language, and let App.tsx fetch the file matching the active
//      language from LanguageContext.
//
// The UI chrome (panel names, chapter labels, references, tabs, legend,
// timeline) is already translated via src/i18n/{en,rw}.json — only the
// Scripture verses + BSB-supplied section headings ("Prologue", "The
// Ascension", etc.) are still English when Kinyarwanda is selected.
const TRANSLATION_ID = process.env.BIBLE_TRANSLATION || 'BSB';
const API_BASE = `https://bible.helloao.org/api/${TRANSLATION_ID}/ACT`;

// Six-panel structure from the research document.
// Each entry: [chapter, verse] start, [chapter, verse] end, panel id, panel name.
//
// Panel `name` values here are English. The frontend overlays translated
// panel names at render time using `t.panels.{id}` from src/i18n/{en,rw}.json,
// so changing this list affects data shape only — translations live in JSON.
const PANELS = [
  { id: 1, name: 'Jerusalem',                 start: [1, 1],   end: [6, 7]   },
  { id: 2, name: 'Judea and Samaria',         start: [6, 8],   end: [9, 31]  },
  { id: 3, name: 'To the Gentiles',           start: [9, 32],  end: [12, 24] },
  { id: 4, name: 'Asia Minor',                start: [12, 25], end: [16, 5]  },
  { id: 5, name: 'Europe',                    start: [16, 6],  end: [19, 20] },
  { id: 6, name: 'Rome — to the Ends of the Earth', start: [19, 21], end: [28, 31] },
];

function panelForChapter(ch) {
  // Returns the panel id for a given chapter (first verse of chapter).
  for (const p of PANELS) {
    const [sCh] = p.start;
    const [eCh] = p.end;
    if (ch >= sCh && ch <= eCh) return p.id;
  }
  return 1;
}

function panelForVerse(ch, v) {
  for (const p of PANELS) {
    const [sCh, sV] = p.start;
    const [eCh, eV] = p.end;
    const afterStart = ch > sCh || (ch === sCh && v >= sV);
    const beforeEnd  = ch < eCh || (ch === eCh && v <= eV);
    if (afterStart && beforeEnd) return p.id;
  }
  return 1;
}

/**
 * The HelloAO API returns verse content as an array of mixed types:
 * - plain string
 * - { text, wordsOfJesus?, poem? } formatted text
 * - { lineBreak: true } inline line break
 * - { heading: string } inline heading
 * - { noteId: number } footnote reference
 *
 * We normalize to: plain text + an HTML-ready string with spans for
 * words-of-Jesus, footnote callers, etc.
 */
function flattenVerseContent(content, footnotes) {
  let plain = '';
  let html = '';
  for (const piece of content) {
    if (typeof piece === 'string') {
      plain += piece;
      html += escapeHtml(piece);
    } else if (piece.text !== undefined) {
      plain += piece.text;
      if (piece.wordsOfJesus) {
        html += `<span class="words-of-jesus">${escapeHtml(piece.text)}</span>`;
      } else if (piece.poem !== undefined) {
        html += `<span class="poem-line poem-${piece.poem}">${escapeHtml(piece.text)}</span>`;
      } else {
        html += escapeHtml(piece.text);
      }
    } else if (piece.lineBreak) {
      html += '<br/>';
    } else if (piece.heading) {
      html += `<span class="inline-heading">${escapeHtml(piece.heading)}</span>`;
    } else if (piece.noteId !== undefined) {
      const fn = footnotes.find(f => f.noteId === piece.noteId);
      const caller = fn?.caller === '+' ? '*' : (fn?.caller || '*');
      html += `<sup class="footnote-ref" data-note="${piece.noteId}" title="${fn ? escapeHtml(fn.text).replace(/"/g, '&quot;') : ''}">${escapeHtml(String(caller))}</sup>`;
    }
  }
  return { plain: plain.trim(), html: html.trim() };
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function fetchChapter(num) {
  const url = `${API_BASE}/${num}.json`;
  console.log(`  → fetching ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HelloAO API ${num}: ${res.status} ${res.statusText}`);
  return res.json();
}

function normalizeChapter(raw) {
  const ch = raw.chapter.number;
  const footnotes = raw.chapter.footnotes || [];
  const content = [];

  for (const block of raw.chapter.content) {
    if (block.type === 'heading') {
      content.push({
        type: 'heading',
        text: Array.isArray(block.content) ? block.content.join(' ') : String(block.content),
      });
    } else if (block.type === 'line_break') {
      // Skip — we handle spacing with CSS
    } else if (block.type === 'verse') {
      const { plain, html } = flattenVerseContent(block.content, footnotes);
      content.push({
        type: 'verse',
        chapter: ch,
        number: block.number,
        text: plain,
        html,
        panel: panelForVerse(ch, block.number),
        id: `act-${ch}-${block.number}`,
      });
    }
  }

  return {
    number: ch,
    panel: panelForChapter(ch),
    content,
    footnotes: footnotes.map(f => ({
      id: f.noteId,
      text: f.text,
      caller: f.caller,
      ref: f.reference,
    })),
    audio: raw.thisChapterAudioLinks || {},
  };
}

// ─── Kinyarwanda placeholder generator ─────────────────────────────────
//
// Until an approved Kinyarwanda Acts text is available (see TODO above),
// we generate a STRUCTURAL placeholder so the Kinyarwanda UI doesn't show
// English BSB verses. Section headings are translated best-effort; verse
// bodies are replaced with a single Kinyarwanda placeholder note per
// section, marked with the verse range.
//
// Pastor Fidele can refine any of these translations by editing this
// dictionary — the script regenerates the data on every build.
const KW_PLACEHOLDER_TEXT = 'Umwandiko wa Bibiliya mu Kinyarwanda uzongerwamo hano.';
const KW_BOOK_NAME = "Ibyakozwe n'Intumwa";

// Translations for common BSB section headings in Acts. Anything not in
// this dictionary falls back to a clear "Umutwe uzongerwamo" marker so
// untranslated headings are visibly placeholders, not bad guesses.
const KW_HEADINGS = {
  // Acts 1
  'Prologue': 'Intangiriro',
  'The Promise of the Holy Spirit': 'Isezerano ry\'Umwuka Wera',
  'The Ascension': 'Kuzamuka kwa Yesu mu ijuru',
  'Matthias Replaces Judas': 'Matia atoranywa gusimbura Yuda',

  // Acts 2
  'The Holy Spirit at Pentecost': 'Umwuka Wera kuri Pentekote',
  'Peter Addresses the Crowd': 'Petero abwira imbaga y\'abantu',
  'The Fellowship of Believers': 'Ubumwe bw\'abizera',

  // Acts 3
  'Peter Heals the Lame Beggar': 'Petero akiza umucumbamye usaba imfashanyo',
  'Peter Preaches at Solomon\'s Portico': 'Petero abwiriza ku biraro bya Salomo',

  // Acts 4
  'Peter and John Before the Sanhedrin': 'Petero na Yohana imbere y\'Inteko Nkuru',
  'The Believers Pray': 'Abizera barasenga',
  'Sharing in All Things': 'Bagasangira byose',

  // Acts 5
  'Ananias and Sapphira': 'Ananiya na Safira',
  'The Apostles Heal Many': 'Intumwa zikiza benshi',
  'The Apostles Are Persecuted': 'Intumwa zirahigwa',
  'Gamaliel Speaks': 'Gamariyeli atanga inama',

  // Acts 6
  'The Choosing of the Seven': 'Gutoranywa kw\'abagabo barindwi',
  'Stephen Seized': 'Stefano arafatwa',

  // Acts 7
  'Stephen\'s Address': 'Inyigisho ya Stefano',
  'The Stoning of Stephen': 'Stefano aterwa amabuye',

  // Acts 8
  'Saul Persecutes the Church': 'Sawuli ahiga Itorero',
  'Philip in Samaria': 'Filipo i Samariya',
  'Simon the Sorcerer': 'Simoni umuruzi',
  'Philip and the Ethiopian': 'Filipo n\'Umunyetiyopiya',

  // Acts 9
  'The Conversion of Saul': 'Guhinduka kwa Sawuli',
  'Saul Preaches in Damascus': 'Sawuli abwiriza i Damasiko',
  'Saul Returns to Jerusalem': 'Sawuli asubira i Yerusalemu',
  'Aeneas Healed': 'Eneya arakira',
  'Tabitha Restored to Life': 'Tabita arazurwa',

  // Acts 10
  'Cornelius Calls for Peter': 'Korineliyo atumiza Petero',
  'Peter\'s Vision': 'Iyerekwa rya Petero',
  'Peter Meets Cornelius': 'Petero ahura na Korineliyo',
  'Peter Preaches to the Gentiles': 'Petero abwiriza Abanyamahanga',
  'The Gentiles Receive the Holy Spirit': 'Abanyamahanga babonye Umwuka Wera',

  // Acts 11
  'Peter Reports to the Church': 'Petero abwira Itorero',
  'The Church in Antioch': 'Itorero ry\'i Antiyokiya',

  // Acts 12
  'James Killed, Peter Imprisoned': 'Yakobo arahanagurwa; Petero ashyirwa muri gereza',
  'Peter Released from Prison': 'Petero arekurwa muri gereza',
  'The Death of Herod': 'Urupfu rwa Herode',

  // Acts 13–14: First Missionary Journey
  'Barnabas and Saul Sent Off': 'Barinaba na Sawuli boherezwa',
  'On Cyprus': 'I Kupuro',
  'In Pisidian Antioch': 'I Antiyokiya ya Pisidiya',
  'Paul Turns to the Gentiles': 'Pawulo ahindukirira Abanyamahanga',
  'In Iconium': 'I Ikoniyo',
  'In Lystra and Derbe': 'I Lusitira na Derebe',
  'The Return to Antioch in Syria': 'Gusubira i Antiyokiya yo muri Siriya',

  // Acts 15
  'The Council at Jerusalem': 'Inama ya Yerusalemu',
  'The Council\'s Letter': 'Ibaruwa y\'Inama',
  'Paul and Barnabas Separate': 'Pawulo na Barinaba baratandukana',

  // Acts 16
  'Timothy Joins Paul and Silas': 'Timoteyo yifatanya na Pawulo na Sila',
  'Paul\'s Vision of the Macedonian': 'Iyerekwa rya Pawulo ry\'Umunya-Makedoniya',
  'Lydia\'s Conversion in Philippi': 'Guhinduka kwa Lidiya i Filipi',
  'Paul and Silas Imprisoned': 'Pawulo na Sila bashyirwa muri gereza',
  'The Conversion of the Jailer': 'Guhinduka k\'umurinzi w\'imbohe',

  // Acts 17
  'In Thessalonica': 'I Tesaloniki',
  'In Berea': 'I Beroya',
  'Paul in Athens': 'Pawulo i Atene',
  'The Areopagus Address': 'Inyigisho yo ku Aleopago',

  // Acts 18
  'In Corinth': 'I Korinto',
  'Paul Returns to Antioch': 'Pawulo asubira i Antiyokiya',
  'Apollos in Ephesus': 'Apolo i Efeso',

  // Acts 19
  'Paul in Ephesus': 'Pawulo i Efeso',
  'The Sons of Sceva': 'Abana ba Sukewa',
  'The Riot in Ephesus': 'Imvururu i Efeso',

  // Acts 20
  'Through Macedonia and Greece': 'Anyura muri Makedoniya no mu Bugiriki',
  'Eutychus Raised at Troas': 'Eyutiko arazurwa i Trowa',
  'Paul\'s Farewell to the Ephesian Elders': 'Pawulo asezera abakuru b\'Itorero ry\'i Efeso',

  // Acts 21
  'On to Jerusalem': 'Bagana i Yerusalemu',
  'Paul Arrives in Jerusalem': 'Pawulo agera i Yerusalemu',
  'Paul Arrested in the Temple': 'Pawulo afatirwa mu rusengero',
  'Paul Addresses the Crowd': 'Pawulo abwira imbaga',

  // Acts 22
  'Paul\'s Defense': 'Pawulo arisobanura',
  'Paul the Roman Citizen': 'Pawulo umunyagihugu w\'i Roma',

  // Acts 23
  'Paul Before the Sanhedrin': 'Pawulo imbere y\'Inteko Nkuru',
  'The Plot to Kill Paul': 'Umugambi wo kwica Pawulo',
  'Paul Sent to Caesarea': 'Pawulo yoherezwa i Kayisariya',

  // Acts 24
  'Paul on Trial Before Felix': 'Pawulo aburanishwa imbere ya Felige',
  'Paul Held Two Years': 'Pawulo amara imyaka ibiri',

  // Acts 25
  'Paul Appeals to Caesar': 'Pawulo asaba kujurira kuri Kayisari',
  'Festus Consults King Agrippa': 'Festo abaza Umwami Agripa',

  // Acts 26
  'Paul Before Agrippa': 'Pawulo imbere ya Agripa',

  // Acts 27
  'Paul Sails for Rome': 'Pawulo ajya i Roma mu bwato',
  'The Storm at Sea': 'Inkubi yo mu nyanja',
  'The Shipwreck': 'Ubwato bwaracitse',

  // Acts 28
  'Paul on Malta': 'Pawulo ku kirwa cya Malita',
  'Paul Arrives in Rome': 'Pawulo agera i Roma',
  'Paul Preaches in Rome': 'Pawulo abwiriza i Roma',
};

const KW_PANELS = {
  1: 'Yerusalemu',
  2: 'Yudaya na Samariya',
  3: 'Ku Banyamahanga',
  4: 'Aziya Nto',
  5: 'Uburayi',
  6: "Roma — kugera ku mpera z'isi",
};

/** Translate a section heading; fall back to a clear "needs translation" marker. */
function translateHeading(eng) {
  if (eng in KW_HEADINGS) return KW_HEADINGS[eng];
  return 'Umutwe uzongerwamo';
}

/**
 * Given an English-BSB payload, produce a same-shaped Kinyarwanda payload
 * with translated section headings and placeholder verse blocks. Each
 * section (between two headings, or chapter start → first heading, or
 * last heading → chapter end) collapses into ONE placeholder block
 * tagged with the verse range so the user knows which passage is pending.
 */
function buildKinyarwandaPlaceholder(englishPayload) {
  const chapters = englishPayload.chapters.map(ch => {
    // Group the chapter content into sections delimited by headings.
    // Each section becomes: [heading?, placeholder].
    const sections = [];
    let currentHeading = null;
    let currentVerses = [];

    const flush = () => {
      if (currentHeading === null && currentVerses.length === 0) return;
      const firstV = currentVerses[0]?.number;
      const lastV = currentVerses[currentVerses.length - 1]?.number;
      const reference = firstV
        ? `${KW_BOOK_NAME} ${ch.number}:${firstV}${lastV && lastV !== firstV ? `–${lastV}` : ''}`
        : `${KW_BOOK_NAME} ${ch.number}`;
      sections.push({
        heading: currentHeading,
        verseRange: reference,
      });
      currentHeading = null;
      currentVerses = [];
    };

    for (const block of ch.content) {
      if (block.type === 'heading') {
        flush();
        currentHeading = block.text;
      } else if (block.type === 'verse') {
        currentVerses.push(block);
      }
    }
    flush();

    // Materialize into the actual content array — heading + placeholder.
    const content = [];
    for (const s of sections) {
      if (s.heading) {
        content.push({
          type: 'heading',
          text: translateHeading(s.heading),
        });
      }
      content.push({
        type: 'placeholder',
        text: KW_PLACEHOLDER_TEXT,
        reference: s.verseRange,
        panel: ch.panel,
      });
    }

    return {
      number: ch.number,
      panel: ch.panel,
      content,
      footnotes: [],
      audio: {},
    };
  });

  return {
    translation: {
      id: 'placeholder-rw',
      name: "Umwandiko w'Ikinyarwanda uzongerwamo",
      shortName: 'RW',
      website: '',
      licenseUrl: '',
      language: 'kin',
      isPlaceholder: true,
      langCode: 'rw',
    },
    book: englishPayload.book,
    panels: englishPayload.panels.map(p => ({
      ...p,
      name: KW_PANELS[p.id] ?? p.name,
    })),
    chapters,
    fetchedAt: new Date().toISOString(),
  };
}

async function main() {
  console.log('📖 Fetching Berean Standard Bible — Acts from HelloAO');
  console.log('   (https://bible.helloao.org — public domain, no API key)');
  console.log();

  const chapters = [];
  let translationMeta = null;

  for (let n = 1; n <= 28; n++) {
    const raw = await fetchChapter(n);
    if (!translationMeta) translationMeta = raw.translation;
    chapters.push(normalizeChapter(raw));
  }

  const totalVerses = chapters.reduce(
    (sum, c) => sum + c.content.filter(b => b.type === 'verse').length,
    0,
  );

  const englishPayload = {
    translation: {
      id: translationMeta.id,
      name: translationMeta.name,
      shortName: translationMeta.shortName,
      website: translationMeta.website,
      licenseUrl: translationMeta.licenseUrl,
      language: translationMeta.language,
      isPlaceholder: false,
      langCode: 'en',
    },
    book: {
      id: 'ACT',
      name: 'Acts',
      commonName: 'Acts of the Apostles',
      numberOfChapters: 28,
      totalNumberOfVerses: totalVerses,
    },
    panels: PANELS.map(p => ({
      id: p.id,
      name: p.name,
      startChapter: p.start[0],
      startVerse: p.start[1],
      endChapter: p.end[0],
      endVerse: p.end[1],
    })),
    chapters,
    fetchedAt: new Date().toISOString(),
  };

  // English BSB → public/data/scripture/en/acts.json
  const enPath = outPathFor('en');
  mkdirSync(dirname(enPath), { recursive: true });
  writeFileSync(enPath, JSON.stringify(englishPayload, null, 2));

  // Kinyarwanda placeholder → public/data/scripture/rw/acts.json
  const rwPayload = buildKinyarwandaPlaceholder(englishPayload);
  const rwPath = outPathFor('rw');
  mkdirSync(dirname(rwPath), { recursive: true });
  writeFileSync(rwPath, JSON.stringify(rwPayload, null, 2));

  const rwSections = rwPayload.chapters.reduce(
    (sum, c) => sum + c.content.filter(b => b.type === 'placeholder').length,
    0,
  );
  const rwTranslatedHeadings = rwPayload.chapters.reduce(
    (sum, c) => sum + c.content.filter(b => b.type === 'heading' && b.text !== 'Umutwe uzongerwamo').length,
    0,
  );
  const rwUntranslatedHeadings = rwPayload.chapters.reduce(
    (sum, c) => sum + c.content.filter(b => b.type === 'heading' && b.text === 'Umutwe uzongerwamo').length,
    0,
  );

  console.log();
  console.log(`✅ Wrote ${enPath}`);
  console.log(`   • Translation: ${englishPayload.translation.name} (${englishPayload.translation.shortName})`);
  console.log(`   • 28 chapters, ${totalVerses} verses`);
  console.log(`   • 6 panels mapped`);
  console.log(`   • Audio links included from openbible.com`);
  console.log();
  console.log(`✅ Wrote ${rwPath}`);
  console.log(`   • Translation: ${rwPayload.translation.name} (placeholder)`);
  console.log(`   • 28 chapters, ${rwSections} placeholder sections`);
  console.log(`   • Headings: ${rwTranslatedHeadings} translated, ${rwUntranslatedHeadings} still pending (rendered as "Umutwe uzongerwamo")`);
}

main().catch(err => {
  console.error('❌ fetch-bsb.mjs failed:', err);
  process.exit(1);
});
