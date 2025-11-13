import type { ChartFigure } from '../types/ChartFigure';

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

export const Figures = {
  fig1: fig1 as ChartFigure,
  fig2: fig2 as ChartFigure,
  fig3: fig3 as ChartFigure,
  fig4: fig4 as ChartFigure,
  fig5: fig5 as ChartFigure,
  fig6: fig6 as ChartFigure,
  fig7: fig7 as ChartFigure,
  fig8: fig8 as ChartFigure,
  fig9: fig9 as ChartFigure,
  fig10: fig10 as ChartFigure,
  fig11: fig11 as ChartFigure,
  fig12: fig12 as ChartFigure,
  fig19: fig19 as ChartFigure,
  fig20: fig20 as ChartFigure,
  fig21: fig21 as ChartFigure,
  fig22: fig22 as ChartFigure,
  fig23: fig23 as ChartFigure,
  fig24: fig24 as ChartFigure,
} satisfies Record<string, ChartFigure>;

export function getFigure(id: string): ChartFigure {
  return Figures[id];
}
