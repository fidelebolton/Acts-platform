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
const OUT_PATH = resolve(__dirname, '../public/data/bsb-acts.json');

const API_BASE = 'https://bible.helloao.org/api/BSB/ACT';

// Six-panel structure from the research document.
// Each entry: [chapter, verse] start, [chapter, verse] end, panel id, panel name.
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

  const payload = {
    translation: {
      id: translationMeta.id,
      name: translationMeta.name,
      shortName: translationMeta.shortName,
      website: translationMeta.website,
      licenseUrl: translationMeta.licenseUrl,
      language: translationMeta.language,
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

  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(payload, null, 2));

  console.log();
  console.log(`✅ Wrote ${OUT_PATH}`);
  console.log(`   • Translation: ${payload.translation.name} (${payload.translation.shortName})`);
  console.log(`   • 28 chapters, ${totalVerses} verses`);
  console.log(`   • 6 panels mapped`);
  console.log(`   • Audio links included from openbible.com`);
}

main().catch(err => {
  console.error('❌ fetch-bsb.mjs failed:', err);
  process.exit(1);
});
