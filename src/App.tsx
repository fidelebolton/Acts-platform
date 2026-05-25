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

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready';
      scripture: ScripturePayload;
      locations: LocationsPayload;
      journeys: JourneysCollection;
    };

export default function App() {
  const [data, setData] = useState<LoadState>({ status: 'loading' });
  const [activePanel, setActivePanel] = useState<Panel['id']>(1);
  const [activeVerseId, setActiveVerseId] = useState<string | null>(null);
  const [showTeaching, setShowTeaching] = useState(true);
  const [activeJourney, setActiveJourney] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/data/bsb-acts.json').then(r => r.ok ? r.json() : Promise.reject(new Error('bsb-acts.json: ' + r.status))),
      fetch('/data/locations.json').then(r => r.ok ? r.json() : Promise.reject(new Error('locations.json: ' + r.status))),
      fetch('/data/journeys.geojson').then(r => r.ok ? r.json() : Promise.reject(new Error('journeys.geojson: ' + r.status))),
    ])
      .then(([scripture, locations, journeys]) => {
        setData({ status: 'ready', scripture, locations, journeys });
      })
      .catch(err => {
        console.error('Data load failed', err);
        setData({ status: 'error', message: err.message });
      });
  }, []);

  // Track active panel based on the verse currently in view
  const handleVerseInView = useCallback((verseId: string, panel: Panel['id']) => {
    setActiveVerseId(verseId);
    setActivePanel(panel);
  }, []);

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
        <div className="font-heading text-3xl text-navy">The Book of Acts</div>
        <div className="text-navy/60 text-sm">Loading scripture, locations, journeys…</div>
        <div className="w-32 h-1 bg-cream-dark rounded overflow-hidden">
          <div className="h-full bg-gold animate-pulse w-full" />
        </div>
      </div>
    );
  }

  if (data.status === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="font-heading text-2xl text-navy mb-2">Couldn't load the data</div>
        <div className="text-sm text-navy/70 mb-4 max-w-md">{data.message}</div>
        <div className="text-xs text-navy/50 max-w-md">
          Run <code className="bg-cream-dark px-1 rounded">npm run data</code> locally,
          or check that the Netlify build completed successfully.
        </div>
      </div>
    );
  }

  const { scripture, locations, journeys } = data;

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      {/* Header */}
      <header className="border-b border-cream-dark bg-cream-warm/80 backdrop-blur sticky top-0 z-30">
        <div className="px-4 md:px-8 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl text-navy leading-tight">
              The Book of Acts
            </h1>
            <p className="text-xs md:text-sm text-navy/70 italic">
              Know the Word · Trust the Spirit · Preach the Name
            </p>
          </div>
          <div className="text-right text-xs text-navy/60">
            <div>Pastor Fidele Bolton</div>
            <a href="https://fidelebolton.com" className="text-gold-dark hover:text-navy">fidelebolton.com</a>
          </div>
        </div>
        <PanelNav
          panels={scripture.panels}
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
              Scripture
            </button>
            <button
              onClick={() => setShowTeaching(true)}
              className={`flex-1 py-2 text-sm font-body transition-colors ${showTeaching ? 'bg-cream text-navy font-semibold' : 'text-navy/60 hover:bg-cream/50'}`}
            >
              Teaching
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {!showTeaching ? (
              <ScripturePane
                scripture={scripture}
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
            journeys={journeys}
            activeJourney={activeJourney}
            onJourneySelect={setActiveJourney}
            activePanel={activePanel}
          />
        </div>
      </main>

      {/* Bottom: Timeline */}
      <TimelineBar
        scripture={scripture}
        activePanel={activePanel}
        onPanelSelect={setActivePanel}
        onJourneySelect={setActiveJourney}
      />

      {/* Footer */}
      <footer className="border-t border-cream-dark bg-cream-warm/80 py-3 px-4 text-xs text-navy/60 flex flex-wrap items-center justify-between gap-2">
        <div>
          Scripture: {scripture.translation.name} ({scripture.translation.shortName}) · public domain
        </div>
        <div>
          Locations: {locations.attribution}
        </div>
        <div>
          Potter's Wheel Church · <a href="https://potterswheelchurch.com" className="text-gold-dark hover:text-navy">potterswheelchurch.com</a>
        </div>
      </footer>
    </div>
  );
}
