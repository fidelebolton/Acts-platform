import { useEffect, useMemo, useRef } from 'react';
import type { ScripturePayload, Panel, VerseBlock, PlaceholderBlock } from '../types';
import { useT } from '../i18n/LanguageContext';

interface Props {
  scripture: ScripturePayload;
  activePanel: Panel['id'];
  activeVerseId: string | null;
  onVerseInView: (verseId: string, panel: Panel['id']) => void;
}

export function ScripturePane({ scripture, activePanel, activeVerseId, onVerseInView }: Props) {
  const { t, fmt } = useT();
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Chapters within the active panel
  const activePanelMeta = scripture.panels.find(p => p.id === activePanel);
  const chaptersInPanel = useMemo(() => {
    if (!activePanelMeta) return [];
    return scripture.chapters.filter(c =>
      c.number >= activePanelMeta.startChapter && c.number <= activePanelMeta.endChapter,
    );
  }, [scripture, activePanelMeta]);

  // Scroll to top of panel when panel changes
  useEffect(() => {
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activePanel]);

  // Intersection observer — track which verse is in the middle of the viewport
  useEffect(() => {
    if (!containerRef.current) return;

    observerRef.current?.disconnect();

    const verses = containerRef.current.querySelectorAll<HTMLElement>('[data-verse-id]');
    if (verses.length === 0) return;

    observerRef.current = new IntersectionObserver(
      entries => {
        // Pick the entry closest to the top of the viewport that's intersecting
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const top = visible[0];
        if (top) {
          const verseId = top.target.getAttribute('data-verse-id');
          const panelStr = top.target.getAttribute('data-panel');
          if (verseId && panelStr) {
            onVerseInView(verseId, Number(panelStr) as Panel['id']);
          }
        }
      },
      {
        root: containerRef.current,
        rootMargin: '-30% 0px -50% 0px',
        threshold: 0,
      },
    );

    verses.forEach(v => observerRef.current!.observe(v));
    return () => observerRef.current?.disconnect();
  }, [chaptersInPanel, onVerseInView]);

  if (!activePanelMeta) {
    return <div className="p-6 text-navy/60">{t.scripture.panelNotFound}</div>;
  }

  const bookLabel = t.scripture.chapterPrefix;

  return (
    <div ref={containerRef} className="px-4 md:px-8 py-6 max-w-3xl mx-auto">
      <header className="mb-6">
        <div className="text-xs text-gold-dark uppercase tracking-widest font-bold mb-1">
          {fmt(t.scripture.panelOf, { n: activePanelMeta.id })}
        </div>
        <h2 className="panel-heading">{activePanelMeta.name}</h2>
        <p className="text-sm text-navy/70 italic">
          {bookLabel} {activePanelMeta.startChapter}:{activePanelMeta.startVerse}
          {' — '}
          {bookLabel} {activePanelMeta.endChapter}:{activePanelMeta.endVerse}
        </p>
      </header>

      {chaptersInPanel.length === 0 ? (
        // Defensive: every active panel should match at least one chapter
        // in the loaded Scripture file. If it doesn't, surface a clean
        // message in the active language — never silently fall back.
        <div className="text-sm text-navy/60 italic py-6">
          {t.scripture.chapterUnavailable}
        </div>
      ) : (
        chaptersInPanel.map(chapter => (
          <ChapterBlock
            key={chapter.number}
            chapter={chapter}
            bookLabel={bookLabel}
            unavailableMessage={t.scripture.chapterUnavailable}
            activeVerseId={activeVerseId}
            panelStart={activePanelMeta.startChapter === chapter.number ? activePanelMeta.startVerse : null}
            panelEnd={activePanelMeta.endChapter === chapter.number ? activePanelMeta.endVerse : null}
          />
        ))
      )}
    </div>
  );
}

interface ChapterBlockProps {
  chapter: ScripturePayload['chapters'][number];
  bookLabel: string;
  unavailableMessage: string;
  activeVerseId: string | null;
  panelStart: number | null; // verse where this panel begins in this chapter
  panelEnd: number | null;   // verse where this panel ends in this chapter
}

function ChapterBlock({ chapter, bookLabel, unavailableMessage, activeVerseId, panelStart, panelEnd }: ChapterBlockProps) {
  // Defensive: an empty chapter (no headings, no verses, no placeholders)
  // means the language's data file is missing this chapter. Render the
  // localized unavailable message instead of an empty space.
  if (!chapter.content || chapter.content.length === 0) {
    return (
      <section className="mb-8">
        <h3 className="chapter-heading">
          <span>{bookLabel} {chapter.number}</span>
        </h3>
        <div className="text-sm text-navy/60 italic py-4">{unavailableMessage}</div>
      </section>
    );
  }

  return (
    <section className="mb-8 animate-fade-in">
      <h3 className="chapter-heading">
        <span>{bookLabel} {chapter.number}</span>
      </h3>

      <div className="scripture-text">
        {chapter.content.map((block, i) => {
          if (block.type === 'heading') {
            return (
              <h4 key={i} className="scripture-heading">
                {block.text}
              </h4>
            );
          }

          if (block.type === 'placeholder') {
            // Used by languages without a verse-by-verse translation yet
            // (currently Kinyarwanda). One block per section, with the
            // localized verse-range note above the placeholder text.
            const ph = block as PlaceholderBlock;
            return (
              <div
                key={i}
                className="scripture-placeholder my-3 px-3 py-2 border-l-2 border-gold/40 bg-cream-warm/40 rounded-r text-navy/70"
              >
                {ph.reference && (
                  <div className="text-[10px] uppercase tracking-wider text-gold-dark/80 font-bold mb-1 not-italic">
                    {ph.reference}
                  </div>
                )}
                <div className="text-sm italic leading-relaxed">{ph.text}</div>
              </div>
            );
          }

          const verse = block as VerseBlock;

          // Trim verses outside the panel's range within this chapter
          if (panelStart !== null && verse.number < panelStart) return null;
          if (panelEnd !== null && verse.number > panelEnd) return null;

          const isActive = activeVerseId === verse.id;
          return (
            <span
              key={verse.id}
              id={verse.id}
              data-verse-id={verse.id}
              data-panel={verse.panel}
              data-chapter={verse.chapter}
              data-verse={verse.number}
              className={`verse ${isActive ? 'active' : ''}`}
            >
              <sup className="verse-number">{verse.number}</sup>
              <span dangerouslySetInnerHTML={{ __html: verse.html }} />
              {' '}
            </span>
          );
        })}
      </div>
    </section>
  );
}
