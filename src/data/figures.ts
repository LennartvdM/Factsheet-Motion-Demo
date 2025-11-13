import fig1 from '../../figures_chart/fig1.json';
import fig2 from '../../figures_chart/fig2.json';
import fig3 from '../../figures_chart/fig3.json';
import fig4 from '../../figures_chart/fig4.json';
import fig5 from '../../figures_chart/fig5.json';
import fig6 from '../../figures_chart/fig6.json';
import fig7 from '../../figures_chart/fig7.json';
import fig8 from '../../figures_chart/fig8.json';
import fig9 from '../../figures_chart/fig9.json';
import fig10 from '../../figures_chart/fig10.json';
import fig11 from '../../figures_chart/fig11.json';
import fig12 from '../../figures_chart/fig12.json';
import fig19 from '../../figures_chart/fig19.json';
import fig20 from '../../figures_chart/fig20.json';
import fig21 from '../../figures_chart/fig21.json';
import fig22 from '../../figures_chart/fig22.json';
import fig23 from '../../figures_chart/fig23.json';
import fig24 from '../../figures_chart/fig24.json';

import type { ChartFigure } from '../types/ChartFigure';

const rawFigures = {
  fig1,
  fig2,
  fig3,
  fig4,
  fig5,
  fig6,
  fig7,
  fig8,
  fig9,
  fig10,
  fig11,
  fig12,
  fig19,
  fig20,
  fig21,
  fig22,
  fig23,
  fig24,
} as const;

export const Figures: Record<string, ChartFigure> = Object.fromEntries(
  Object.entries(rawFigures).map(([key, value]) => [key, value as ChartFigure]),
);

export function getFigure(id: string): ChartFigure {
  const figure = Figures[id];

  if (!figure) {
    throw new Error(`Unknown figure: ${id}`);
  }

  return figure;
}
