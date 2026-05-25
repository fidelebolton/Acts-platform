#!/usr/bin/env node
/**
 * convert-teachings.mjs
 *
 * Converts Pastor Fidele Bolton's PSOS / ASOS lesson .docx files into
 * structured Markdown + JSON for the teaching pane.
 *
 * INPUT  — any .docx in /uploads (or passed as CLI args), plus any
 *          .md files already present in /data/teachings/sources/
 *
 * OUTPUT — /data/teachings/<id>.md (one per teaching)
 *        — /data/teachings/index.json (manifest with metadata)
 *
 * Each lesson is expected to follow the PSOS structure:
 *   • Title (Lesson N — Acts X: subtitle)
 *   • Big Idea
 *   • Key Verses (Know the Word / Trust the Spirit)
 *   • Walking Through sections (A–J)
 *   • Know the Word: Teaching Focus
 *   • Trust the Spirit: Teaching Focus
 *   • Word and Spirit side-by-side table
 *   • Forming Christ in the Believer
 *   • Discussion Questions
 *   • Weekly Assignment
 *   • Closing Prayer
 *
 * Where structure is missing, the converter falls back to a flat markdown dump.
 */

import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { dirname, resolve, basename, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import mammoth from 'mammoth';

const __dirname = dirname(fileURLToPath(import.meta.url));
const UPLOADS  = resolve(__dirname, '../../user-data/uploads');
const SOURCES  = resolve(__dirname, '../public/data/teachings/sources');
const TEACHINGS_DIR = resolve(__dirname, '../public/data/teachings');
const INDEX_PATH = resolve(TEACHINGS_DIR, 'index.json');

const PANELS = [
  { id: 1, range: [1, 1, 6, 7]   },
  { id: 2, range: [6, 8, 9, 31]  },
  { id: 3, range: [9, 32, 12, 24] },
  { id: 4, range: [12, 25, 16, 5] },
  { id: 5, range: [16, 6, 19, 20] },
  { id: 6, range: [19, 21, 28, 31] },
];

function panelForChapter(ch) {
  for (const p of PANELS) {
    const [sCh, _sV, eCh] = p.range;
    if (ch >= sCh && ch <= eCh) return p.id;
  }
  return 1;
}

/**
 * Extract chapter number from filename or title.
 * Handles: "PSOS_Lesson1_Acts1.docx", "Acts 8 — Discernment", etc.
 */
function inferChapter(filename, title) {
  const candidates = [filename, title].filter(Boolean).join(' ');
  // Try Acts X first, then Lesson X
  const actsMatch = candidates.match(/Acts[\s_-]*(\d{1,2})/i);
  if (actsMatch) return parseInt(actsMatch[1], 10);
  const lessonMatch = candidates.match(/Lesson[\s_-]*(\d{1,2})/i);
  if (lessonMatch) return parseInt(lessonMatch[1], 10);
  return null;
}

/**
 * Try to find Big Idea, Key Verses, etc. in the raw markdown.
 * The PSOS docs use clear section labels so we can pattern-match.
 */
function extractStructure(markdown) {
  const out = {};

  // Big Idea — typically a single sentence under a "Big Idea" heading or callout
  const bigIdea = markdown.match(/(?:Big Idea|BIG IDEA)[:\s]*\n+([^\n]+(?:\n[^\n#]+)?)/);
  if (bigIdea) out.big_idea = bigIdea[1].trim().replace(/\s+/g, ' ');

  // Key Verses — Know the Word + Trust the Spirit
  const kw = markdown.match(/Know the Word[^A-Za-z]*([^\n]+)/);
  const ts = markdown.match(/Trust the Spirit[^A-Za-z]*([^\n]+)/);
  if (kw && ts) {
    // Only treat as key verses if they look like verse refs (Acts X:Y)
    const kwHasRef = /Acts\s+\d+[:.]\d+/.test(kw[1]);
    const tsHasRef = /Acts\s+\d+[:.]\d+/.test(ts[1]);
    if (kwHasRef && tsHasRef) {
      out.key_verses = { kw: kw[1].trim(), ts: ts[1].trim() };
    }
  }

  // Excerpt — first paragraph after the title
  const firstPara = markdown.match(/^#[^\n]+\n+([^\n]{40,400})/m);
  if (firstPara) out.excerpt = firstPara[1].trim();

  return out;
}

/**
 * Convert a single .docx file to a teaching entry.
 */
async function convertDocx(filePath) {
  console.log(`   • ${basename(filePath)}`);
  const buffer = readFileSync(filePath);

  // Convert to markdown with mammoth
  const { value: html } = await mammoth.convertToHtml({ buffer });
  // mammoth gives HTML — convert to a simple markdown shape
  const md = htmlToMarkdown(html);

  // Title = first H1, fallback to filename
  const titleMatch = md.match(/^#\s+(.+)$/m);
  const filename = basename(filePath, extname(filePath));
  const title = titleMatch ? titleMatch[1].trim() : filename;

  const chapter = inferChapter(filename, title) || 1;
  const panel = panelForChapter(chapter);
  const structure = extractStructure(md);

  const id = `psos-acts-${chapter}-${slugify(title).slice(0, 40)}`;

  return {
    id,
    type: 'psos-lesson',
    title,
    chapter,
    panel,
    source_file: basename(filePath),
    ...structure,
    content_md: md,
  };
}

/**
 * Lightweight HTML → Markdown for mammoth output.
 * We don't need full fidelity — just readable Markdown with headings and lists.
 */
function htmlToMarkdown(html) {
  return html
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '\n# $1\n\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\n## $1\n\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '\n### $1\n\n')
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '\n#### $1\n\n')
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
    .replace(/<\/?ul[^>]*>/gi, '\n')
    .replace(/<\/?ol[^>]*>/gi, '\n')
    .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, (_, c) =>
      c.trim().split('\n').map(l => `> ${l}`).join('\n') + '\n\n')
    .replace(/<table[^>]*>[\s\S]*?<\/table>/gi, '\n*(Table content — see source document)*\n\n')
    .replace(/<[^>]+>/g, '')      // strip remaining tags
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'").replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function slugify(s) {
  return String(s).toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Read pre-existing .md sources (for content we already authored, like
 * the Acts 8 article — drop these into /data/teachings/sources/ to include
 * them without needing a .docx).
 */
function loadMarkdownSources() {
  if (!existsSync(SOURCES)) return [];
  return readdirSync(SOURCES)
    .filter(f => f.endsWith('.md') || f.endsWith('.markdown'))
    .map(f => {
      const fullPath = join(SOURCES, f);
      const md = readFileSync(fullPath, 'utf-8');

      // Front matter — simple "---\nkey: value\n---" preamble
      const fm = md.match(/^---\n([\s\S]*?)\n---\n+([\s\S]*)$/);
      const meta = {};
      let body = md;
      if (fm) {
        body = fm[2];
        for (const line of fm[1].split('\n')) {
          const m = line.match(/^([a-z_]+):\s*(.+)$/);
          if (m) meta[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
        }
      }

      const title = meta.title || f.replace(/\.[^.]+$/, '');
      const chapter = parseInt(meta.chapter, 10) || inferChapter(f, title) || 1;
      const panel = panelForChapter(chapter);
      const type = (meta.type || 'article');

      const structure = extractStructure(body);

      return {
        id: meta.id || slugify(title).slice(0, 60),
        type,
        title,
        subtitle: meta.subtitle,
        chapter,
        panel,
        source_file: f,
        ...structure,
        ...(meta.big_idea ? { big_idea: meta.big_idea } : {}),
        content_md: body.trim(),
      };
    });
}

async function main() {
  console.log('📝 Converting teaching content');
  console.log();

  mkdirSync(TEACHINGS_DIR, { recursive: true });
  mkdirSync(SOURCES, { recursive: true });

  const entries = [];

  // 1. Markdown sources (pre-authored articles, sermon outlines, etc.)
  const mdSources = loadMarkdownSources();
  if (mdSources.length) {
    console.log(`   ${mdSources.length} markdown source(s) in /data/teachings/sources/:`);
    for (const e of mdSources) {
      console.log(`     • ${e.title} (Acts ${e.chapter}, panel ${e.panel})`);
      entries.push(e);
    }
  }

  // 2. .docx files in /uploads
  const uploadFiles = existsSync(UPLOADS)
    ? readdirSync(UPLOADS).filter(f => f.toLowerCase().endsWith('.docx')).map(f => join(UPLOADS, f))
    : [];

  if (uploadFiles.length) {
    console.log();
    console.log(`   ${uploadFiles.length} .docx file(s) in /uploads:`);
    for (const filePath of uploadFiles) {
      try {
        const entry = await convertDocx(filePath);
        entries.push(entry);
        // Also write the individual .md for archival
        writeFileSync(resolve(TEACHINGS_DIR, `${entry.id}.md`), entry.content_md);
      } catch (err) {
        console.error(`     ❌ ${basename(filePath)}: ${err.message}`);
      }
    }
  } else {
    console.log('   (no .docx in /uploads yet — drop your PSOS lesson files there to convert)');
  }

  // Sort: chapter, then type weight (lessons first, then articles, then sermons)
  const typeWeight = { 'psos-lesson': 0, 'book-section': 1, 'article': 2, 'sermon': 3, 'devotional': 4 };
  entries.sort((a, b) =>
    a.chapter - b.chapter ||
    (typeWeight[a.type] ?? 9) - (typeWeight[b.type] ?? 9) ||
    a.title.localeCompare(b.title),
  );

  const manifest = {
    count: entries.length,
    entries,
    generatedAt: new Date().toISOString(),
  };

  writeFileSync(INDEX_PATH, JSON.stringify(manifest, null, 2));

  console.log();
  console.log(`✅ Wrote ${INDEX_PATH}`);
  console.log(`   • ${entries.length} teaching entries`);
  if (entries.length > 0) {
    console.log(`   • Chapter coverage: ${[...new Set(entries.map(e => e.chapter))].sort((a, b) => a - b).join(', ')}`);
  }
}

main().catch(err => {
  console.error('❌ convert-teachings.mjs failed:', err);
  process.exit(1);
});
