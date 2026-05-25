import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Panel, TeachingEntry } from '../types';

interface Props {
  activePanel: Panel['id'];
}

export function TeachingPane({ activePanel }: Props) {
  const [teachings, setTeachings] = useState<TeachingEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/data/teachings/index.json')
      .then(r => {
        if (!r.ok) throw new Error(`Manifest ${r.status}`);
        return r.json();
      })
      .then((manifest: { entries: TeachingEntry[] }) => {
        setTeachings(manifest.entries);
        if (manifest.entries.length > 0) setActiveId(manifest.entries[0].id);
      })
      .catch(err => setError(err.message));
  }, []);

  // Filter teachings to the active panel
  const filtered = (teachings || []).filter(t => t.panel === activePanel);
  const active = filtered.find(t => t.id === activeId) || filtered[0];

  if (error || !teachings) {
    return (
      <div className="px-6 py-10 max-w-2xl mx-auto">
        <div className="text-xs uppercase tracking-widest text-gold-dark font-bold mb-2">
          Teaching
        </div>
        <h2 className="font-heading text-2xl text-navy mb-3">
          Pastoral teaching coming soon
        </h2>
        <p className="text-sm text-navy/70 mb-4 leading-relaxed">
          This pane will hold Pastor Fidele Bolton's teaching for each panel of Acts —
          drawn from PSOS course manuals, the <em>Know the Word | Trust the Spirit</em>{' '}
          curriculum book, sermons, and articles.
        </p>
        <div className="bg-cream-warm border border-cream-dark rounded-lg p-4 text-sm text-navy/80">
          <div className="font-semibold mb-1">For the builder:</div>
          <ol className="list-decimal list-inside space-y-1 text-xs">
            <li>Drop PSOS Acts 1–12 .docx files into <code className="bg-cream-dark px-1 rounded">/uploads</code></li>
            <li>Run <code className="bg-cream-dark px-1 rounded">npm run data:teachings</code></li>
            <li>This pane will populate automatically from{' '}
              <code className="bg-cream-dark px-1 rounded">/data/teachings/index.json</code></li>
          </ol>
        </div>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="px-6 py-10 max-w-2xl mx-auto text-center">
        <div className="text-sm text-navy/60 italic">
          No teaching content yet for this panel.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Lesson tabs */}
      {filtered.length > 1 && (
        <div className="flex gap-1 px-4 pt-3 pb-2 border-b border-cream-dark overflow-x-auto bg-cream/50">
          {filtered.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveId(t.id)}
              className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
                t.id === active?.id
                  ? 'bg-navy text-cream'
                  : 'text-navy/70 hover:bg-cream-warm'
              }`}
            >
              {t.title}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="px-4 md:px-8 py-6 max-w-3xl mx-auto overflow-y-auto">
        {active && (
          <article>
            <div className="text-xs uppercase tracking-widest text-gold-dark font-bold mb-2">
              {labelForType(active.type)}
            </div>
            <h2 className="font-heading text-2xl md:text-3xl text-navy mb-1">
              {active.title}
            </h2>
            {active.subtitle && (
              <p className="text-sm text-navy/70 italic mb-4">{active.subtitle}</p>
            )}

            {active.big_idea && (
              <div className="callout-big-idea">
                <div className="text-xs uppercase tracking-wider opacity-70 mb-1 not-italic font-body font-bold">
                  Big Idea
                </div>
                {active.big_idea}
              </div>
            )}

            {active.key_verses && (
              <div className="grid md:grid-cols-2 gap-3 my-4">
                <div className="callout-key-verse">
                  <div className="text-xs uppercase tracking-wider text-navy font-bold not-italic mb-1">
                    Know the Word
                  </div>
                  {active.key_verses.kw}
                </div>
                <div className="callout-key-verse">
                  <div className="text-xs uppercase tracking-wider text-navy font-bold not-italic mb-1">
                    Trust the Spirit
                  </div>
                  {active.key_verses.ts}
                </div>
              </div>
            )}

            <div className="prose prose-navy max-w-none teaching-prose">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {active.content_md}
              </ReactMarkdown>
            </div>
          </article>
        )}
      </div>
    </div>
  );
}

function labelForType(type: TeachingEntry['type']): string {
  switch (type) {
    case 'psos-lesson': return 'PSOS Lesson';
    case 'article':     return 'Teaching Article';
    case 'sermon':      return 'Sermon';
    case 'devotional':  return 'Devotional';
    case 'book-section': return 'From: Know the Word | Trust the Spirit';
  }
}
