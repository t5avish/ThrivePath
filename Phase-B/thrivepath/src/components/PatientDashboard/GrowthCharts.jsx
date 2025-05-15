import React from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend,
  CartesianGrid, ResponsiveContainer
} from "recharts";
import { DateTime } from "luxon";

const CustomXAxisTick = ({ x, y, payload }) => {
  const dateTime = DateTime.fromFormat(payload.value, "dd/MM/yyyy HH:mm:ss");
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} textAnchor="middle" fill="#666" fontSize={12}>
        {dateTime.toFormat('dd/MM')}
      </text>
      <text x={0} y={16} dy={12} textAnchor="middle" fontSize={10} fill="#666">
        {dateTime.toFormat('HH:mm')}
      </text>
    </g>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const dateTime = DateTime.fromFormat(label, "dd/MM/yyyy HH:mm:ss");
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-bold text-gray-800 mb-2">{dateTime.toFormat('dd/MM/yyyy')}</p>
        <p className="text-sm text-gray-600 mb-3">{dateTime.toFormat('HH:mm:ss')}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center mb-1">
            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></div>
            <p className="text-gray-700">
              <span className="font-medium">{entry.name}:</span> {entry.value} {entry.name.includes('Weight') ? 'kg' : 'cm'}
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const GrowthCharts = ({ historyData, activeTab }) => {
  return (
    <div className={`grid ${activeTab === "all" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"} gap-6`}>
      {(activeTab === "all" || activeTab === "weight") && (
        <ChartBlock
          title="Weight Tracking (kg)"
          description="Track the patient's weight progress compared to target values for their age group."
          dataKeyActual="weight"
          dataKeyTarget="targetWeight"
          strokeColor="#22c55e"
          historyData={historyData}
          yLabel="Weight (kg)"
        />
      )}
      {(activeTab === "all" || activeTab === "height") && (
        <ChartBlock
          title="Height Tracking (cm)"
          description="Monitor height growth compared to age-appropriate target values."
          dataKeyActual="height"
          dataKeyTarget="targetHeight"
          strokeColor="#3b82f6"
          historyData={historyData}
          yLabel="Height (cm)"
        />
      )}
    </div>
  );
};

const ChartBlock = ({ title, description, dataKeyActual, dataKeyTarget, strokeColor, historyData, yLabel }) => (
  <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
    <h2 className="text-lg font-semibold mb-4 text-gray-800">{title}</h2>
    <div className="bg-gray-50 p-2 rounded-lg mb-4 text-sm text-gray-600">{description}</div>
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={historyData} margin={{ top: 10, right: 30, left: 10, bottom: 30 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tick={<CustomXAxisTick />} interval="preserveStartEnd" height={60} />
        <YAxis
          label={{
            value: yLabel,
            angle: -90,
            position: 'insideLeft',
            offset: -5,
            style: { textAnchor: 'middle', fill: '#666' }
          }}
          domain={['dataMin - 2', 'dataMax + 2']}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend verticalAlign="top" height={36} />
        <Line
          type="monotone"
          dataKey={dataKeyActual}
          name={`Actual ${yLabel.split(' ')[0]}`}
          stroke={strokeColor}
          strokeWidth={3}
          activeDot={{ r: 8, strokeWidth: 2, fill: strokeColor, stroke: 'white' }}
          dot={{ r: 5, strokeWidth: 2, fill: strokeColor, stroke: 'white' }}
        />
        <Line
          type="monotone"
          dataKey={dataKeyTarget}
          name="Target"
          stroke="#ef4444"
          strokeDasharray="6 6"
          strokeWidth={2}
          dot={{ r: 4, strokeWidth: 1, fill: '#ef4444', stroke: 'white' }}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export default GrowthCharts;
