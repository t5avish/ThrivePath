import React from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend,
  CartesianGrid, ResponsiveContainer
} from "recharts";
import percentiles from "../../../utils/percentiles.json";


const CHART_COLORS = {
  weight: {
    line: "#ff0000",
    dot: "#4b5563",
    hover: "#6b7280"
  },
  height: {
    line: "#ff0000",
    dot: "#4b5563",
    hover: "#6b7280"
  },
  percentiles: {
    P3: "#d1d5db",
    P10: "#9ca3af",
    P25: "#6b7280",
    P50: "#000000",
    P75: "#6b7280",
    P90: "#9ca3af",
    P97: "#d1d5db"
  }
};

const CustomAxisTick = ({ x, y, payload, isXAxis = true }) => {
  const offset = isXAxis ? 16 : -10;
  const anchor = isXAxis ? "middle" : "end";
  const xPos = isXAxis ? 0 : offset;
  const yPos = isXAxis ? offset : 0;
  
  return (
    <g transform={`translate(${x},${y})`}>
      <text 
        x={xPos} 
        y={yPos} 
        textAnchor={anchor} 
        fill="#64748b" 
        fontSize={12}
        fontFamily="Inter, system-ui, sans-serif"
      >
        {isXAxis ? parseFloat(payload.value).toFixed(1) : Math.round(payload.value)}
      </text>
    </g>
  );
};

// Helper function to determine percentile range with improved phrasing
const getPercentileRange = (value, age, percentileData, type) => {
  if (!value || !percentileData) return "Not available";
  
  // Find closest age data point in percentile data
  const closestAgeData = percentileData.reduce((prev, curr) => {
    return Math.abs(curr.ageYears - age) < Math.abs(prev.ageYears - age) ? curr : prev;
  });
  
  if (value < closestAgeData.P3) return "Below 3rd percentile";
  if (value < closestAgeData.P25) return "3rd - 25th percentile";
  if (value < closestAgeData.P50) return "25th - 50th percentile";
  if (value < closestAgeData.P75) return "50th - 75th percentile";
  if (value < closestAgeData.P97) return "75th - 97th percentile";
  return "Above 97th percentile";
};

const CustomTooltip = ({ active, payload, label, unit, percentileData, type }) => {
  if (active && payload && payload.length) {
    // Find the actual data line among all the lines
    const actualDataPoint = payload.find(p => 
      p.dataKey === "weight" || 
      p.dataKey === "height"
    );
    
    if (!actualDataPoint) return null;
    
    // Get percentile range for this measurement
    const percentileRange = getPercentileRange(
      actualDataPoint.value,
      label,
      percentileData,
      type
    );
    
    // Get the data point object
    const dataPoint = actualDataPoint.payload;
    
    let showDateDisplay = false;
    let dateDisplay = '';
    
    try {
      if (dataPoint.fixedDate) {
        const date = new Date(dataPoint.fixedDate);
        if (!isNaN(date.getTime())) {
          dateDisplay = date.toLocaleDateString();
          showDateDisplay = true;
        }
      } else if (dataPoint.recordDate && dataPoint.recordDate !== "Invalid DateTime") {
        const date = new Date(dataPoint.recordDate);
        if (!isNaN(date.getTime())) {
          dateDisplay = date.toLocaleDateString();
          showDateDisplay = true;
        }
      } else if (dataPoint.date) {
        const date = new Date(dataPoint.date);
        if (!isNaN(date.getTime())) {
          dateDisplay = date.toLocaleDateString();
          showDateDisplay = true;
        }
      }
    } catch (e) {
      console.warn("Date formatting failed:", e);
      showDateDisplay = false;
    }
    
    // Format the age value cleanly
    const formattedAge = parseFloat(label).toFixed(2);
    
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-3">
          <p className="font-bold text-gray-800">Age: {formattedAge} years    </p>
          {showDateDisplay && <span className="text-xs text-gray-500">{dateDisplay}</span>}
        </div>
        
        <div className="flex items-center mb-3">
          <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: actualDataPoint.color }}></div>
          <p className="text-gray-800 font-medium">
            {actualDataPoint.value.toFixed(1)} {unit}
          </p>
        </div>
        
        <div className="pt-2 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-2 h-8 bg-blue-500 mr-3 rounded-sm opacity-80"></div>
            <div>
              <p className="text-sm font-medium text-gray-700">Percentile Range:</p>
              <p className="text-sm font-medium">
                {percentileRange}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const getPercentileLinesData = (gender, type) => {
  const data = percentiles[gender][type];
  const formatted = [];

  Object.keys(data).forEach(month => {
    const monthFloat = parseFloat(month);
    const ageYears = monthFloat / 12;
    const entry = { ageYears };

    Object.entries(data[month]).forEach(([percentile, value]) => {
      entry[percentile] = value;
    });

    formatted.push(entry);
  });

  return formatted;
};

const GrowthCharts = ({ historyData, activeTab, birthDate }) => {
  const [zoomLevel, setZoomLevel] = React.useState("auto");
  const [customRange, setCustomRange] = React.useState({ min: "", max: "" });
  const [isCustomRange, setIsCustomRange] = React.useState(false);

  const processedHistoryData = React.useMemo(() => {
    console.log("GrowthCharts received data:", historyData);
    console.log("GrowthCharts received birthDate:", birthDate);
    
    if (!historyData || !historyData.length) return [];
    
    return historyData.map(entry => {
      const processedEntry = { ...entry };
      
      if (entry.recordDate === "Invalid DateTime" && entry.date) {
        const fixedDate = entry.date.replace(/(\d{4}-\d{2}-\d{2}):/, "$1T");
        processedEntry.fixedDate = fixedDate;
      }
      
      return processedEntry;
    });
    
  }, [historyData, birthDate]);

  // Handle custom range input changes
  const handleRangeChange = (e, field) => {
    setCustomRange({
      ...customRange,
      [field]: e.target.value
    });
  };

  // Apply custom range
  const applyCustomRange = () => {
    const min = parseFloat(customRange.min);
    const max = parseFloat(customRange.max);
    
    if (!isNaN(min) && !isNaN(max) && min < max) {
      // Validate the range
      if (min < 0) {
        alert("Minimum age cannot be less than 0");
        return;
      }
      
      if (max > 12) {
        alert("Maximum age cannot be greater than 12");
        return;
      }
      
      setIsCustomRange(true);
      setZoomLevel("custom");
    } else {
      alert("Please enter valid minimum and maximum ages");
    }
  };
  
  return (
    <div className={`grid ${activeTab === "all" ? "grid-cols-1" : "grid-cols-1"} gap-6`}>
      {(activeTab === "all" || activeTab === "weight") && (
        <ChartBlock
          title="Weight Chart"
          description="Track and monitor weight progress over time"
          dataKeyActual="weight"
          strokeColor={CHART_COLORS.weight.line}
          dotColor={CHART_COLORS.weight.dot}
          hoverColor={CHART_COLORS.weight.hover}
          historyData={processedHistoryData}
          yLabel="Weight (kg)"
          gender="boys"
          type="weight"
          zoomLevel={zoomLevel}
          setZoomLevel={setZoomLevel}
          customRange={customRange}
          handleRangeChange={handleRangeChange}
          applyCustomRange={applyCustomRange}
          isCustomRange={isCustomRange}
          setIsCustomRange={setIsCustomRange}
        />
      )}
      {(activeTab === "all" || activeTab === "height") && (
        <ChartBlock
          title="Height Chart"
          description="Monitor height growth relative to standard percentiles"
          dataKeyActual="height"
          strokeColor={CHART_COLORS.height.line}
          dotColor={CHART_COLORS.height.dot}
          hoverColor={CHART_COLORS.height.hover}
          historyData={processedHistoryData}
          yLabel="Height (cm)"
          gender="boys"
          type="height"
          zoomLevel={zoomLevel}
          setZoomLevel={setZoomLevel}
          customRange={customRange}
          handleRangeChange={handleRangeChange}
          applyCustomRange={applyCustomRange}
          isCustomRange={isCustomRange}
          setIsCustomRange={setIsCustomRange}
        />
      )}
    </div>
  );
};

const ChartBlock = ({
  title, description, dataKeyActual, dataKeyTarget,
  strokeColor, dotColor, hoverColor, historyData, yLabel, 
  gender, type, zoomLevel, setZoomLevel, customRange, handleRangeChange,
  applyCustomRange, isCustomRange, setIsCustomRange
}) => {
  const percentileData = getPercentileLinesData(gender, type);
  
  // We'll focus on key percentiles for better readability
  const percentiles = ["P3", "P25", "P50", "P75", "P97"];
  
  // Get min and max ages from actual data to focus the chart
  const actualAges = historyData
    .map(item => item.ageYears)
    .filter(age => !isNaN(age));
  
  // Define age range based on zoom level
  let minAge, maxAge;
  
  if (zoomLevel === "full") {
    // Full range
    minAge = 0;
    maxAge = 12;
  } else if (zoomLevel === "custom" && isCustomRange) {
    // Custom range from input
    minAge = parseFloat(customRange.min);
    maxAge = parseFloat(customRange.max);
  } else if (actualAges.length === 0) {
    // No data, show default range
    minAge = 0;
    maxAge = 5;
  } else {
    // Auto zoom to data range with buffer
    minAge = Math.max(0, Math.floor(Math.min(...actualAges)) - 0.5);
    maxAge = Math.min(12, Math.ceil(Math.max(...actualAges)) + 1);
  }
  
  // Filter data based on the current view range
  const filteredHistoryData = historyData.filter(item => {
    return item.ageYears >= minAge && item.ageYears <= maxAge;
  });
  
  // Get min and max values for better Y axis scaling
  const allValues = [
    ...filteredHistoryData.map(item => item[dataKeyActual]),
    ...percentileData
      .filter(item => item.ageYears >= minAge && item.ageYears <= maxAge)
      .flatMap(item => percentiles.map(p => item[p]))
  ].filter(Boolean);
  
  // Calculate reasonable min/max with buffer
  const dataMin = allValues.length > 0 ? Math.min(...allValues) : 0;
  const dataMax = allValues.length > 0 ? Math.max(...allValues) : 100;
  const valueRange = dataMax - dataMin;
  
  // Add 10% padding above and below the data range
  const minValue = Math.floor(dataMin - (valueRange * 0.1));
  const maxValue = Math.ceil(dataMax + (valueRange * 0.1));
  
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow mb-8 overflow-hidden">
      {/* Chart header with gradient background */}
      <div className={`p-6 bg-gradient-to-r from-slate-50 to-slate-100`}>
        <h2 className="text-2xl font-semibold mb-2 text-gray-800">{title}</h2>
        <p className="text-sm text-gray-600">{description}</p>
        
        {/* Data point indicator */}
        <div className="mt-2 flex items-center">
          <span className="inline-block h-2 w-2 rounded-full mr-2 bg-black"></span>
          <span className="text-sm text-gray-600">
            {filteredHistoryData.length} data point{filteredHistoryData.length !== 1 ? 's' : ''} in range
          </span>
        </div>
      </div>
      
      {/* Make the chart container have a light background */}
      <div className="bg-gray-50 p-6">
        {/* Chart container */}
        <ResponsiveContainer width="100%" height={500}>
          <LineChart 
            margin={{ 
              top: 30, 
              right: 30, 
              left: 10, 
              bottom: 60 
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="ageYears"
              type="number"
              domain={[minAge, maxAge]}
              tickCount={Math.min(10, maxAge - minAge + 1)}
              tick={(props) => <CustomAxisTick {...props} isXAxis={true} />}
              height={60}
              label={{
                value: "Age (years)",
                position: "insideBottom",
                offset: -10,
                style: { 
                  textAnchor: 'middle', 
                  fill: '#64748b', 
                  fontSize: 13,
                  fontWeight: 500
                }
              }}
            />
            <YAxis
              label={{
                value: yLabel,
                angle: -90,
                position: 'insideLeft',
                offset: 5,
                style: { 
                  textAnchor: 'middle', 
                  fill: '#64748b', 
                  fontSize: 13,
                  fontWeight: 500 
                }
              }}
              domain={[minValue, maxValue]}
              tick={(props) => <CustomAxisTick {...props} isXAxis={false} />}
              width={60}
            />
            <Tooltip 
              content={<CustomTooltip 
                unit={yLabel.includes("Weight") ? "kg" : "cm"} 
                percentileData={percentileData}
                type={type}
              />}
              isAnimationActive={false}
            />
            <Legend 
              verticalAlign="top" 
              height={40}
              wrapperStyle={{ 
                fontSize: '13px', 
                fontWeight: 500,
                paddingTop: '5px'
              }}
              formatter={(value) => {
                // Better formatting for legend labels
                if (value.startsWith('P')) {
                  return `${value} percentile`;
                }
                // Update patient data line label
                if (value === "Patient Weight (kg)") {
                  return "Patient Weight";
                }
                if (value === "Patient Height (cm)") {
                  return "Patient Height";
                }
                return value;
              }}
            />

            {/* Draw percentile lines with improved styling - all solid lines now */}
            {percentiles.map((p) => {
              // Get percentile data for the full range
              const allPercentileData = [...percentileData];
              
              // Generate smooth data across the entire visible range
              const step = 0.25; // 3-month intervals for smoother curves
              const enhancedData = [];
              
              for (let age = minAge; age <= maxAge; age += step) {
                // Find the closest existing data points for interpolation
                const lowerPoint = allPercentileData
                  .filter(d => d.ageYears <= age)
                  .sort((a, b) => b.ageYears - a.ageYears)[0];
                  
                const upperPoint = allPercentileData
                  .filter(d => d.ageYears >= age)
                  .sort((a, b) => a.ageYears - b.ageYears)[0];
                
                // If we have both points for interpolation
                if (lowerPoint && upperPoint) {
                  // If we have an exact match, use it
                  if (Math.abs(lowerPoint.ageYears - age) < 0.01) {
                    enhancedData.push({
                      ageYears: age,
                      [p]: lowerPoint[p]
                    });
                  } 
                  // Otherwise interpolate between the closest points
                  else {
                    const ageRange = upperPoint.ageYears - lowerPoint.ageYears;
                    if (ageRange > 0) {
                      const ratio = (age - lowerPoint.ageYears) / ageRange;
                      const value = lowerPoint[p] + ratio * (upperPoint[p] - lowerPoint[p]);
                      
                      enhancedData.push({
                        ageYears: age,
                        [p]: value
                      });
                    }
                  }
                }
                // If we only have data on one side, use the closest available point
                else if (lowerPoint) {
                  enhancedData.push({
                    ageYears: age,
                    [p]: lowerPoint[p]
                  });
                }
                else if (upperPoint) {
                  enhancedData.push({
                    ageYears: age,
                    [p]: upperPoint[p]
                  });
                }
              }
              
              // Apply different styles based on percentile importance
              const isMainPercentile = p === "P50";
              
              return (
                <Line
                  key={p}
                  type="monotone"
                  data={enhancedData}
                  dataKey={p}
                  name={p}
                  stroke={CHART_COLORS.percentiles[p]}
                  strokeWidth={isMainPercentile ? 2 : 1.5}
                  strokeOpacity={isMainPercentile ? 1 : 0.8}
                  dot={false}
                  activeDot={false}
                  isAnimationActive={false}
                />
              );
            })}

            {/* Patient data line with improved styling */}
            <Line
              type="monotone"
              data={filteredHistoryData}
              dataKey={dataKeyActual}
              name={`Patient ${yLabel.split(' ')[0]}`}
              stroke={strokeColor}
              strokeWidth={3}
              activeDot={{ 
                r: 6, 
                strokeWidth: 2,
                fill: hoverColor || dotColor || strokeColor, 
                stroke: 'white' 
              }}
              dot={{ 
                r: 5, 
                strokeWidth: 2, 
                fill: dotColor || strokeColor, 
                stroke: 'white' 
              }}
              isAnimationActive={false}
              connectNulls={true}
            />
          </LineChart>
        </ResponsiveContainer>
        
        {/* Show empty state message if no data points in current range */}
        {filteredHistoryData.length === 0 && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            <p><strong>No data points in the current age range.</strong> Try adjusting the age range or checking if there are data entries with age values in this range.</p>
          </div>
        )}
      </div>
      
      {/* Controls section */}
      <div className="p-6 border-t border-gray-200">
        {/* Percentile guide and explanation */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Percentile Guide</h3>
          <div className="flex flex-wrap gap-3">
            {percentiles.map(p => (
              <div key={p} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-1" 
                  style={{ backgroundColor: CHART_COLORS.percentiles[p] }}
                ></div>
                <span className="text-xs text-gray-600">{p}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            P50 represents the median (50th percentile).
          </p>
        </div>
        
        {/* Custom range input with improved design */}
        <div className="p-3 bg-gray-50 rounded-lg mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Current view: Ages {minAge} to {maxAge} years
          </p>
          
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-gray-600">Custom range:</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="12"
                step="0.5"
                placeholder="From"
                value={customRange.min}
                onChange={(e) => handleRangeChange(e, 'min')}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
              />
              <span className="text-gray-500">to</span>
              <input
                type="number"
                min="0"
                max="12"
                step="0.5"
                placeholder="To"
                value={customRange.max}
                onChange={(e) => handleRangeChange(e, 'max')}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
              />
              <button
                onClick={applyCustomRange}
                disabled={!customRange.min || !customRange.max || parseFloat(customRange.min) >= parseFloat(customRange.max)}
                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
        
        {/* View toggle buttons with updated design (no red) */}
        <div className="flex gap-2">
          <button 
            className={`px-4 py-2 rounded-md text-sm transition-colors ${
              zoomLevel === "auto" 
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => {
              setZoomLevel("auto");
              setIsCustomRange(false);
            }}
          >
            Auto Zoom
          </button>
          <button 
            className={`px-4 py-2 rounded-md text-sm transition-colors ${
              zoomLevel === "full" 
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => {
              setZoomLevel("full");
              setIsCustomRange(false);
            }}
          >
            Full Range (0-12 yrs)
          </button>
          {isCustomRange && (
            <button 
              className="px-4 py-2 rounded-md text-sm transition-colors bg-blue-100 text-blue-800"
              onClick={() => {}}
            >
              Custom: {customRange.min} - {customRange.max} yrs
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GrowthCharts;