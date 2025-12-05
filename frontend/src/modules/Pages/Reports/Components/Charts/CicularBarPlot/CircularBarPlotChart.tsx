
// frontend/src/modules/Pages/Reports/Components/Charts/BarChar/CicularBarPlot.tsx
import { useMemo } from 'react';

type Datum = { name: string; value: number };

type Props = {
  width?: number;
  height?: number;
  data?: Datum[];
  innerRadius?: number;
  margin?: number;
  padding?: number;
};

function toXY(r: number, a: number) {
  return { x: r * Math.cos(a), y: r * Math.sin(a) };
}

function colorFor(value: number): string {
  if (value >= 1 && value <= 3) return '#9CCC65';
  if (value >= 4 && value <= 7) return '#FDD835';
  if (value >= 8 && value <= 14) return '#FB8C00';
  if (value >= 15 && value <= 30) return '#E53935';
  if (value >= 31 && value <= 180) return '#AD1457';
  if (value > 365) return '#000000';
  return '#7B1FA2';
}

export default function CicularBarPlot({
  width = 540,
  height = 300,
  data,
  innerRadius: innerRadiusProp,
  margin: marginProp,
  padding: paddingProp,
}: Props): JSX.Element {
  const innerRadius = innerRadiusProp ?? 36;
  const margin = marginProp ?? 16;
  const padding = paddingProp ?? 0.12;

  const outerRadius = Math.min(width, height) / 2 - margin;

  const source: Datum[] = useMemo(() => {
    if (data && data.length > 0) return [...data];
    const count = Math.floor(Math.random() * 9) + 12;
    return Array.from({ length: count }).map((_, i) => ({
      name: `Item ${i + 1}`,
      value: Math.floor(Math.random() * 420) + 1,
    }));
  }, [data]);

  const ordered = useMemo(
    () => source.slice().sort((a, b) => b.value - a.value),
    [source]
  );

  const n = ordered.length;
  const total = Math.PI * 2;
  const band = total / n;
  const gap = band * padding;
  const barSpan = band - gap;

  const maxVal = useMemo(() => Math.max(1, ...ordered.map((d) => d.value)), [ordered]);

  const shapes = ordered.map((d, i) => {
    const startAngle = i * band + gap / 2;
    const endAngle = startAngle + barSpan;
    const span = endAngle - startAngle;
    const largeArc = span > Math.PI ? 1 : 0;

    const targetOuter = innerRadius + (outerRadius - innerRadius) * (d.value / maxVal);

    const p0 = toXY(innerRadius, startAngle);
    const p1 = toXY(innerRadius, endAngle);
    const p2 = toXY(targetOuter, endAngle);
    const p3 = toXY(targetOuter, startAngle);

    const arcInner = `A ${innerRadius} ${innerRadius} 0 ${largeArc} 1 ${p1.x} ${p1.y}`;
    const arcOuter = `A ${targetOuter} ${targetOuter} 0 ${largeArc} 0 ${p3.x} ${p3.y}`;
    const dPath = `M ${p0.x} ${p0.y} ${arcInner} L ${p2.x} ${p2.y} ${arcOuter} Z`;

    const midAngle = startAngle + span / 2;
    const labelRotateDeg = (midAngle * 180) / Math.PI - 90;
    const flip = ((midAngle + Math.PI) % (Math.PI * 2)) < Math.PI;

    const labelR = targetOuter + 6;
    const innerTextR = innerRadius + (targetOuter - innerRadius) * 0.55;

    const fill = colorFor(d.value);
    const stroke = fill;

    return (
      <g key={`${d.name}-${i}`}>
        <path d={dPath} opacity={0.9} stroke={stroke} fill={fill} fillOpacity={0.7} strokeWidth={1} />
        <g transform={`rotate(${labelRotateDeg}),translate(${labelR},0)`}>
          <text
            textAnchor={flip ? 'end' : 'start'}
            alignmentBaseline="middle"
            fontSize={14}
            transform={flip ? 'rotate(180)' : 'rotate(0)'}
          >
            {d.name}
          </text>
        </g>
        <g transform={`rotate(${labelRotateDeg}),translate(${innerTextR},0)`}>
          <text
            textAnchor="middle"
            alignmentBaseline="middle"
            fontSize={12}
            fill="#ffffff"
          >
            {d.value}
          </text>
        </g>
      </g>
    );
  });

  return (
    <svg width={width} height={height}>
      <g transform={`translate(${width / 2},${height / 2})`}>{shapes}</g>
    </svg>
  );
}
