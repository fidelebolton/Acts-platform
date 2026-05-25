import { useMemo } from 'react';
import type { ScripturePayload, Panel } from '../types';

interface Props {
  scripture: ScripturePayload;
  activePanel: Panel['id'];
  onPanelSelect: (id: Panel['id']) => void;
  onJourneySelect: (id: string | null) => void;
}

// Major chronological milestones in Acts. Dates are approximate scholarly
// consensus dates — most Acts chronologies place the events between
// AD 30 (Pentecost) and AD 62 (Paul's two-year house arrest in Rome).
const TIMELINE_EVENTS = [
  { year: 'AD 30', panel: 1 as const, title: 'Pentecost',                  chapter: 2,  blurb: 'The Spirit is poured out; 3,000 believe.' },
  { year: 'AD 31', panel: 1 as const, title: 'Stephen martyred',           chapter: 7,  blurb: 'First Christian martyr — the church scatters.' },
  { year: 'AD 33', panel: 2 as const, title: 'Saul converted',             chapter: 9,  blurb: 'On the road to Damascus.' },
  { year: 'AD 36', panel: 3 as const, title: 'Cornelius and his household', chapter: 10, blurb: 'The gospel breaks the Jew/Gentile wall.' },
  { year: 'AD 44', panel: 3 as const, title: 'Herod Agrippa I dies',       chapter: 12, blurb: 'Persecution stops — the word multiplies.' },
  { year: 'AD 46', panel: 4 as const, title: 'First Journey begins',       chapter: 13, blurb: 'Antioch sends Paul and Barnabas.', journey: 'journey-1' },
  { year: 'AD 49', panel: 4 as const, title: 'Jerusalem Council',          chapter: 15, blurb: 'Gentiles are saved by grace, not law.' },
  { year: 'AD 49', panel: 5 as const, title: 'Second Journey begins',      chapter: 15, blurb: 'Paul, Silas, Timothy — Europe opens.', journey: 'journey-2' },
  { year: 'AD 50', panel: 5 as const, title: 'Macedonian Vision',          chapter: 16, blurb: '"Come over to Macedonia and help us."' },
  { year: 'AD 51', panel: 5 as const, title: 'Areopagus Sermon',           chapter: 17, blurb: 'The unknown God made known in Athens.' },
  { year: 'AD 53', panel: 5 as const, title: 'Third Journey begins',       chapter: 18, blurb: 'Ephesus — three years of fruit.', journey: 'journey-3' },
  { year: 'AD 56', panel: 5 as const, title: 'Riot of the silversmiths',   chapter: 19, blurb: 'Artemis vs. the kingdom of God.' },
  { year: 'AD 57', panel: 6 as const, title: 'Paul arrested in Jerusalem', chapter: 21, blurb: 'The journey from freedom to chains begins.' },
  { year: 'AD 59', panel: 6 as const, title: 'Voyage to Rome',             chapter: 27, blurb: 'Storm, shipwreck, Malta.', journey: 'journey-4' },
  { year: 'AD 60', panel: 6 as const, title: 'Rome — house arrest',        chapter: 28, blurb: '"Preaching the kingdom… unhindered."' },
];

export function TimelineBar({ activePanel, onPanelSelect, onJourneySelect }: Props) {
  const events = TIMELINE_EVENTS;

  // Compute position of each event along the bar (0–100%)
  const minY = 30;
  const maxY = 62;
  const positioned = useMemo(
    () =>
      events.map(e => {
        const year = parseInt(e.year.replace('AD ', ''), 10);
        const pct = ((year - minY) / (maxY - minY)) * 100;
        return { ...e, pct, year_num: year };
      }),
    [events],
  );

  return (
    <div className="border-t border-cream-dark bg-cream-warm/80 backdrop-blur">
      <div className="px-4 md:px-8 py-2">
        <div className="flex items-center justify-between mb-1">
          <div className="text-[10px] uppercase tracking-widest text-navy/60 font-bold">
            Chronology · AD 30 → AD 62
          </div>
          <div className="text-[10px] text-navy/50 italic">
            Click any event to jump there
          </div>
        </div>

        <div className="relative h-14">
          {/* Track */}
          <div className="absolute left-0 right-0 top-7 h-px bg-navy/20" />
          <div className="absolute left-0 top-7 -translate-y-1/2 text-[10px] text-navy/50">
            30
          </div>
          <div className="absolute right-0 top-7 -translate-y-1/2 text-[10px] text-navy/50">
            62
          </div>

          {/* Events */}
          {positioned.map((e, i) => {
            const isActive = e.panel === activePanel;
            return (
              <button
                key={i}
                onClick={() => {
                  onPanelSelect(e.panel);
                  if (e.journey) onJourneySelect(e.journey);
                }}
                className="absolute top-0 -translate-x-1/2 group"
                style={{ left: `${e.pct}%` }}
                title={`${e.year} — ${e.title}: ${e.blurb}`}
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full mx-auto mt-6 transition-all ${
                    isActive
                      ? 'bg-gold scale-125 ring-2 ring-gold/30'
                      : 'bg-navy/70 group-hover:bg-navy group-hover:scale-110'
                  }`}
                />
                <div className="text-[9px] text-navy/70 mt-1 whitespace-nowrap text-center font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  {e.year}
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 top-12 z-20 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity bg-navy text-cream text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap">
                  <span className="font-semibold">{e.title}</span> · Acts {e.chapter}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
