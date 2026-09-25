import React, { useState } from "react";
import { PieChart, Pie, Cell, Sector } from "recharts";
import "./OrigenDonut.css";

const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload } = props;
  return (
    <g>
      <text x={cx} y={cy - 10} textAnchor="middle" fill="#fff" fontSize={22} fontWeight={700} fontFamily="Barlow Condensed, sans-serif">
        {payload.cantidad}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize={10} letterSpacing={1}>
        {payload.origen.toUpperCase()}
      </text>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 6} startAngle={startAngle} endAngle={endAngle} fill={fill} />
      <Sector cx={cx} cy={cy} innerRadius={innerRadius - 4} outerRadius={innerRadius - 2} startAngle={startAngle} endAngle={endAngle} fill={fill} />
    </g>
  );
};

export default function OrigenDonut({ datos = [] }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const total = datos.reduce((acc, d) => acc + d.cantidad, 0);

  return (
    <div className="origen-donut">
      <PieChart width={130} height={130}>
        <Pie
          activeIndex={activeIdx}
          activeShape={renderActiveShape}
          data={datos}
          cx={65} cy={65}
          innerRadius={42} outerRadius={58}
          dataKey="cantidad"
          onMouseEnter={(_, i) => setActiveIdx(i)}
        >
          {datos.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>

      <div className="origen-donut__leyenda">
        {datos.map((o, i) => (
          <div
            key={o.origen}
            className={`origen-donut__item ${activeIdx === i ? "origen-donut__item--active" : ""}`}
            onMouseEnter={() => setActiveIdx(i)}
          >
            <span className="origen-donut__dot" style={{ background: o.color }} />
            <span className="origen-donut__nombre">{o.origen}</span>
            <span className="origen-donut__pct">{o.porcentaje}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}