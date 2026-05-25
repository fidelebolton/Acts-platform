import { useEffect, useMemo, useRef } from 'react';
import type { ScripturePayload, Panel, VerseBlock } from '../types';

interface Props {
  scripture: ScripturePayload;
  activePanel: Panel['id'];
  activeVerseId: string | null;
  onVerseInView: (verseId: string, panel: Panel['id']) => void;
}

export function ScripturePane({ scripture, activePanel, activeVerseId, onVerseInView }: Props) {
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
    return <div className="p-6 text-navy/60">Panel not found.</div>;
  }

  return (
    <div ref={containerRef} className="px-4 md:px-8 py-6 max-w-3xl mx-auto">
      <header className="mb-6">
        <div className="text-xs text-gold-dark uppercase tracking-widest font-bold mb-1">
          Panel {activePanelMeta.id} of 6
        </div>
        <h2 className="panel-heading">{activePanelMeta.name}</h2>
        <p className="text-sm text-navy/70 italic">
          Acts {activePanelMeta.startChapter}:{activePanelMeta.startVerse}
          {' — '}
          Acts {activePanelMeta.endChapter}:{activePanelMeta.endVerse}
        </p>
      </header>

      {chaptersInPanel.map(chapter => (
        <ChapterBlock
          key={chapter.number}
          chapter={chapter}
          activeVerseId={activeVerseId}
          panelStart={activePanelMeta.startChapter === chapter.number ? activePanelMeta.startVerse : null}
          panelEnd={activePanelMeta.endChapter === chapter.number ? activePanelMeta.endVerse : null}
        />
      ))}
    </div>
  );
}

interface ChapterBlockProps {
  chapter: ScripturePayload['chapters'][number];
  activeVerseId: string | null;
  panelStart: number | null; // verse where this panel begins in this chapter
  panelEnd: number | null;   // verse where this panel ends in this chapter
}

function ChapterBlock({ chapter, activeVerseId, panelStart, panelEnd }: ChapterBlockProps) {
  return (
    <section className="mb-8 animate-fade-in">
      <h3 className="chapter-heading">
        <span>Acts {chapter.number}</span>
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
