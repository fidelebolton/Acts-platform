import type { Panel } from '../types';

interface Props {
  panels: Panel[];
  activePanel: Panel['id'];
  onSelect: (id: Panel['id']) => void;
}

export function PanelNav({ panels, activePanel, onSelect }: Props) {
  return (
    <nav className="px-4 md:px-8 pb-3 flex gap-2 overflow-x-auto" aria-label="Six-panel navigation">
      {panels.map(p => {
        const isActive = p.id === activePanel;
        return (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className={`panel-pill ${isActive ? 'active' : 'inactive'} whitespace-nowrap`}
            aria-pressed={isActive}
            title={`${p.name} — Acts ${p.startChapter}:${p.startVerse}–${p.endChapter}:${p.endVerse}`}
          >
            <span className="font-bold mr-1.5 opacity-70">{p.id}</span>
            {p.name}
          </button>
        );
      })}
    </nav>
  );
}
