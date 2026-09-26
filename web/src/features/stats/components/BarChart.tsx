interface BarChartItem {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarChartItem[];
  orientation?: 'vertical' | 'horizontal';
}

// Gráfico de magnitude com um único tom (o accent do app) — sem paleta categórica,
// então dispensa validação de contraste entre cores (só há uma cor).
export function BarChart({ data, orientation = 'vertical' }: BarChartProps) {
  const max = Math.max(...data.map((item) => item.value), 1);

  if (orientation === 'horizontal') {
    return (
      <div className="bar-chart bar-chart--horizontal">
        {data.map((item) => (
          <div key={item.label} className="bar-chart__row" title={`${item.label}: ${item.value}`}>
            <span className="bar-chart__row-label">{item.label}</span>
            <div className="bar-chart__row-track">
              <div className="bar-chart__row-bar" style={{ width: `${(item.value / max) * 100}%` }} />
            </div>
            <span className="bar-chart__row-value">{item.value}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bar-chart bar-chart--vertical">
      {data.map((item) => (
        <div key={item.label} className="bar-chart__col" title={`${item.label}: ${item.value}`}>
          <span className="bar-chart__col-value">{item.value > 0 ? item.value : ''}</span>
          <div className="bar-chart__col-track">
            <div className="bar-chart__col-bar" style={{ height: `${(item.value / max) * 100}%` }} />
          </div>
          <span className="bar-chart__col-label">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
