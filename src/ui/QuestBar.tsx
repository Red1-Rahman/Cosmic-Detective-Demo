import type { Palette } from '../theme';
import { fonts } from '../theme';
import type { Quest } from '../game/quests';

interface Props {
  palette: Palette;
  quest: Quest;
  found: number;
}

export function QuestBar({ palette: p, quest, found }: Props) {
  const pct = Math.min(100, (found / quest.target) * 100);
  return (
    <section style={{ background: p.panel, border: `1px solid ${p.border}`, borderRadius: 10, padding: 16 }}>
      <div style={{ fontFamily: fonts.mono, fontSize: 11, color: p.accent, letterSpacing: 1 }}>CURRENT LEAD</div>
      <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.5, color: p.text }}>{quest.instruction}</div>
      <div style={{ marginTop: 10, height: 8, borderRadius: 6, background: p.border, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: p.pass, transition: 'width 300ms ease' }} />
      </div>
      <div style={{ marginTop: 6, fontFamily: fonts.mono, fontSize: 11, color: p.muted }}>
        {found} / {quest.target} FOUND
      </div>
    </section>
  );
}
