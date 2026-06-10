import { useEffect, useState, useMemo, useCallback } from 'react';
import type {
  ScripturePayload,
  LocationsPayload,
  JourneysCollection,
  Panel,
} from './types';
import { PanelNav } from './components/PanelNav';
import { ScripturePane } from './components/ScripturePane';
import { MapPane } from './components/MapPane';
import { TeachingPane } from './components/TeachingPane';
import { TimelineBar } from './components/TimelineBar';
import { TimelineView } from './components/TimelineView';
import { useT, DICTIONARIES, type LangCode } from './i18n/LanguageContext';

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready';
      scripture: ScripturePayload;
      locations: LocationsPayload;
      journeys: JourneysCollection;
    };

export default function App() {
  const { t, lang, setLang, panelName } = useT();
  const [data, setData] = useState<LoadState>({ status: 'loading' });
  const [activePanel, setActivePanel] = useState<Panel['id']>(1);
  const [activeVerseId, setActiveVerseId] = useState<string | null>(null);
  const [showTeaching, setShowTeaching] = useState(true);
  const [activeJourney, setActiveJourney] = useState<string | null>(null);
  const [timelineOpen, setTimelineOpen] = useState(false);

  // Keep the browser tab title in the active language.
  useEffect(() => {
    document.title = `${t.app.title} — Pastor Fidele Bolton`;
  }, [t]);

  // Re-fetch Scripture whenever the language changes — each language has
  // its own Acts file under public/data/scripture/<lang>/acts.json.
  // Locations and journeys are language-agnostic (their visible names are
  // overlaid via i18n at render time) so we still load them once per session.
  useEffect(() => {
    let cancelled = false;
    setData({ status: 'loading' });
    Promise.all([
      fetch(`/data/scripture/${lang}/acts.json`).then(r => r.ok ? r.json() : Promise.reject(new Error(`scripture/${lang}/acts.json: ${r.status}`))),
      fetch('/data/locations.json').then(r => r.ok ? r.json() : Promise.reject(new Error('locations.json: ' + r.status))),
      fetch('/data/journeys.geojson').then(r => r.ok ? r.json() : Promise.reject(new Error('journeys.geojson: ' + r.status))),
    ])
      .then(([scripture, locations, journeys]) => {
        if (cancelled) return;
        setData({ status: 'ready', scripture, locations, journeys });
      })
      .catch(err => {
        if (cancelled) return;
        console.error('Data load failed', err);
        setData({ status: 'error', message: err.message });
      });
    return () => { cancelled = true; };
  }, [lang]);

  // Track active panel based on the verse currently in view
  const handleVerseInView = useCallback((verseId: string, panel: Panel['id']) => {
    setActiveVerseId(verseId);
    setActivePanel(panel);
  }, []);

  // T2.2 — When the user clicks "Jump to verse" inside a map popup
  // (added in commit-after-Tier-1 — verse↔map sync, bi-directional).
  // switch to the Scripture tab, scroll the matching verse element into
  // view, and briefly mark it active. The verse element id matches
  // `act-<chapter>-<verse>`.
  const handleOpenVerse = useCallback((chapter: number, verse: number) => {
    setShowTeaching(false); // Switch left pane to Scripture
    const verseId = `act-${chapter}-${verse}`;
    setActiveVerseId(verseId);
    // Give the Scripture pane a tick to render, then scroll the verse
    // element to the middle of its container.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = document.getElementById(verseId);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });
  }, []);

  // Jump straight to a chapter from the full-timeline overlay.
  const handleOpenChapter = useCallback((chapter: number) => {
    handleOpenVerse(chapter, 1);
  }, [handleOpenVerse]);

  // Locations currently in scope (filtered by active panel/chapter)
  const visibleLocations = useMemo(() => {
    if (data.status !== 'ready') return [];
    // Show locations whose Acts chapters intersect the active panel's chapter range
    const panel = data.scripture.panels.find(p => p.id === activePanel);
    if (!panel) return data.locations.locations;
    return data.locations.locations.filter(loc =>
      loc.chapters_in_acts.some(ch => ch >= panel.startChapter && ch <= panel.endChapter),
    );
  }, [data, activePanel]);

  if (data.status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream gap-4">
        <div className="font-heading text-3xl text-navy">{t.app.title}</div>
        <div className="text-navy/60 text-sm">{t.app.loading}</div>
        <div className="w-32 h-1 bg-cream-dark rounded overflow-hidden">
          <div className="h-full bg-gold animate-pulse w-full" />
        </div>
      </div>
    );
  }

  if (data.status === 'error') {
    // The errorHelp string contains a `{cmd}` placeholder — render it as
    // a styled <code> element instead of plain text.
    const tmpl = t.app.errorHelp;
    const marker = '{cmd}';
    const i = tmpl.indexOf(marker);
    const [helpBefore, helpAfter] = i >= 0
      ? [tmpl.slice(0, i), tmpl.slice(i + marker.length)]
      : [tmpl, ''];

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="font-heading text-2xl text-navy mb-2">{t.app.errorTitle}</div>
        <div className="text-sm text-navy/70 mb-4 max-w-md">{data.message}</div>
        <div className="text-xs text-navy/50 max-w-md">
          {helpBefore}
          <code className="bg-cream-dark px-1 rounded">npm run data</code>
          {helpAfter}
        </div>
      </div>
    );
  }

  const { scripture, locations, journeys } = data;

  // Build a panel list with translated names while keeping the original
  // verse-range metadata from bsb-acts.json. Panel names are looked up by
  // id so adding a new language only requires editing the i18n JSON files.
  const translatedPanels: Panel[] = scripture.panels.map(p => ({
    ...p,
    name: panelName(p.id, p.name),
  }));

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      {/* Header */}
      <header className="border-b border-cream-dark bg-cream-warm/80 backdrop-blur sticky top-0 z-30">
        <div className="px-4 md:px-8 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl text-navy leading-tight">
              {t.app.title}
            </h1>
            <p className="text-xs md:text-sm text-navy/70 italic">
              {t.app.tagline}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Language selector */}
            <label className="flex items-center gap-1.5 text-xs text-navy/70">
              <span className="sr-only">{t.app.languageLabel}</span>
              <span aria-hidden="true" className="text-base">🌐</span>
              <select
                value={lang}
                onChange={e => setLang(e.target.value as LangCode)}
                aria-label={t.app.languageLabel}
                className="bg-cream border border-cream-dark rounded px-1.5 py-0.5 text-xs text-navy font-body cursor-pointer hover:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              >
                {(Object.keys(DICTIONARIES) as LangCode[]).map(code => (
                  <option key={code} value={code}>
                    {DICTIONARIES[code].lang.nativeName}
                  </option>
                ))}
              </select>
            </label>

            <div className="text-right text-xs text-navy/60">
              <div>Pastor Fidele Bolton</div>
              <a href="https://fidelebolton.com" className="text-gold-dark hover:text-navy">fidelebolton.com</a>
            </div>
          </div>
        </div>
        <PanelNav
          panels={translatedPanels}
          activePanel={activePanel}
          onSelect={setActivePanel}
        />
      </header>

      {/* Main 3-pane layout */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-0">
        {/* Left: Scripture + Teaching pane */}
        <div className="flex flex-col overflow-hidden border-r border-cream-dark">
          <div className="flex border-b border-cream-dark bg-cream-warm/50">
            <button
              onClick={() => setShowTeaching(false)}
              className={`flex-1 py-2 text-sm font-body transition-colors ${!showTeaching ? 'bg-cream text-navy font-semibold' : 'text-navy/60 hover:bg-cream/50'}`}
            >
              {t.tabs.scripture}
            </button>
            <button
              onClick={() => setShowTeaching(true)}
              className={`flex-1 py-2 text-sm font-body transition-colors ${showTeaching ? 'bg-cream text-navy font-semibold' : 'text-navy/60 hover:bg-cream/50'}`}
            >
              {t.tabs.teaching}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {!showTeaching ? (
              <ScripturePane
                scripture={{ ...scripture, panels: translatedPanels }}
                activePanel={activePanel}
                activeVerseId={activeVerseId}
                onVerseInView={handleVerseInView}
              />
            ) : (
              <TeachingPane activePanel={activePanel} />
            )}
          </div>
        </div>

        {/* Right: Map pane */}
        <div className="h-[60vh] lg:h-auto lg:min-h-0 relative">
          <MapPane
            locations={visibleLocations}
            allLocations={locations.locations}
            journeys={journeys}
            activeJourney={activeJourney}
            onJourneySelect={setActiveJourney}
            activePanel={activePanel}
            activeVerseId={activeVerseId}
            onOpenVerse={handleOpenVerse}
          />
        </div>
      </main>

      {/* Bottom: Timeline */}
      <TimelineBar
        scripture={scripture}
        activePanel={activePanel}
        onPanelSelect={setActivePanel}
        onJourneySelect={setActiveJourney}
        onExpand={() => setTimelineOpen(true)}
      />

      <TimelineView
        open={timelineOpen}
        onClose={() => setTimelineOpen(false)}
        activePanel={activePanel}
        onPanelSelect={setActivePanel}
        onJourneySelect={setActiveJourney}
        onOpenChapter={handleOpenChapter}
      />

      {/* Footer — Scripture credit changes by language.
            • Real translation (e.g. BSB): name + shortName + "public domain".
            • Draft translation (e.g. Kinyarwanda Acts 1–12 draft): italic
              name only; a small caveat note renders on its own row below.
            • Placeholder only (no verses): italic name only. */}
      <footer className="border-t border-cream-dark bg-cream-warm/80 text-xs text-navy/60">
        <div className="py-3 px-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            {t.app.scriptureCredit}:{' '}
            {scripture.translation.isPlaceholder || scripture.translation.isDraft ? (
              <span className="italic">{scripture.translation.name}</span>
            ) : (
              <>
                {scripture.translation.name} ({scripture.translation.shortName}) · {t.app.publicDomain}
              </>
            )}
          </div>
          <div>
            {t.app.locationsCredit}: {locations.attribution}
          </div>
          <div>
            Potter's Wheel Church · <a href="https://potterswheelchurch.com" className="text-gold-dark hover:text-navy">potterswheelchurch.com</a>
          </div>
        </div>
        {scripture.translation.isDraft && scripture.translation.draftNote && (
          <div className="px-4 pb-3 -mt-1 text-[11px] italic text-navy/55 max-w-4xl leading-snug">
            {scripture.translation.draftNote}
          </div>
        )}
      </footer>
    </div>
  );
}
