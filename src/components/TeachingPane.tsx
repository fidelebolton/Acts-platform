import { useEffect, useState, type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Panel, TeachingEntry } from '../types';
import { useT } from '../i18n/LanguageContext';

interface Props {
  activePanel: Panel['id'];
}

export function TeachingPane({ activePanel }: Props) {
  const { t, fmt } = useT();
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
    // Render the comingSoonBody with a `{curriculum}` placeholder, splitting
    // around the marker so the curriculum name can be rendered as <em>.
    const body = t.teaching.comingSoonBody;
    const marker = '{curriculum}';
    const [bodyBefore, bodyAfter] = body.includes(marker)
      ? [body.slice(0, body.indexOf(marker)), body.slice(body.indexOf(marker) + marker.length)]
      : [body, ''];

    return (
      <div className="px-6 py-10 max-w-2xl mx-auto">
        <div className="text-xs uppercase tracking-widest text-gold-dark font-bold mb-2">
          {t.teaching.section}
        </div>
        <h2 className="font-heading text-2xl text-navy mb-3">
          {t.teaching.comingSoonTitle}
        </h2>
        <p className="text-sm text-navy/70 mb-4 leading-relaxed">
          {bodyBefore}
          <em>{t.teaching.curriculumName}</em>
          {bodyAfter}
        </p>
        <div className="bg-cream-warm border border-cream-dark rounded-lg p-4 text-sm text-navy/80">
          <div className="font-semibold mb-1">{t.teaching.forTheBuilder}</div>
          <ol className="list-decimal list-inside space-y-1 text-xs">
            <li>{fmtWithCode(fmt, t.teaching.builderStep1, { uploads: '/uploads' })}</li>
            <li>{fmtWithCode(fmt, t.teaching.builderStep2, { cmd: 'npm run data:teachings' })}</li>
            <li>{fmtWithCode(fmt, t.teaching.builderStep3, { manifest: '/data/teachings/index.json' })}</li>
          </ol>
        </div>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="px-6 py-10 max-w-2xl mx-auto text-center">
        <div className="text-sm text-navy/60 italic">
          {t.teaching.noContent}
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
              {t.teaching.type[active.type]}
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
                  {t.teaching.bigIdea}
                </div>
                {active.big_idea}
              </div>
            )}

            {active.key_verses && (
              <div className="grid md:grid-cols-2 gap-3 my-4">
                <div className="callout-key-verse">
                  <div className="text-xs uppercase tracking-wider text-navy font-bold not-italic mb-1">
                    {t.teaching.knowTheWord}
                  </div>
                  {active.key_verses.kw}
                </div>
                <div className="callout-key-verse">
                  <div className="text-xs uppercase tracking-wider text-navy font-bold not-italic mb-1">
                    {t.teaching.trustTheSpirit}
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

// Render a builder-help string that contains a single `{placeholder}` token
// as React children with the placeholder rendered as <code>. Used by the
// "For the builder" ordered list in the teaching pane's empty state.
function fmtWithCode(
  fmt: (s: string, vars?: Record<string, string | number>) => string,
  template: string,
  vars: Record<string, string>,
): ReactNode {
  const keys = Object.keys(vars);
  if (keys.length === 0) return fmt(template, vars);
  const key = keys[0];
  const marker = `{${key}}`;
  if (!template.includes(marker)) return fmt(template, vars);
  const [before, after] = [
    template.slice(0, template.indexOf(marker)),
    template.slice(template.indexOf(marker) + marker.length),
  ];
  return (
    <>
      {before}
      <code className="bg-cream-dark px-1 rounded">{vars[key]}</code>
      {after}
    </>
  );
}
