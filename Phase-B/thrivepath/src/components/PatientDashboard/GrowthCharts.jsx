import React from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend,
  CartesianGrid, ResponsiveContainer
} from "recharts";
import percentiles from "../../utils/percentiles.json";

const CustomXAxisTick = ({ x, y, payload }) => {
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} textAnchor="middle" fill="#666" fontSize={12}>
        {Math.round(payload.value)}
      </text>
    </g>
  );
};

const CustomYAxisTick = ({ x, y, payload }) => {
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dx={-4} textAnchor="end" fill="#666" fontSize={12}>
        {Math.round(payload.value)}
      </text>
    </g>
  );
};

// Helper function to determine percentile range
const getPercentileRange = (value, age, percentileData, type) => {
  if (!value || !percentileData) return "Unknown";
  
  // Find closest age data point in percentile data
  const closestAgeData = percentileData.reduce((prev, curr) => {
    return Math.abs(curr.ageYears - age) < Math.abs(prev.ageYears - age) ? curr : prev;
  });
  
  if (value < closestAgeData.P3) return "Below P3 (significantly below average)";
  if (value < closestAgeData.P25) return "Between P3-P25 (below average)";
  if (value < closestAgeData.P50) return "Between P25-P50 (slightly below average)";
  if (value < closestAgeData.P75) return "Between P50-P75 (slightly above average)";
  if (value < closestAgeData.P97) return "Between P75-P97 (above average)";
  return "Above P97 (significantly above average)";
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
      label, // label is the age
      percentileData,
      type
    );
    
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-bold text-gray-800 mb-2">Age: {parseFloat(label).toFixed(2)} years</p>
        <p className="text-sm text-gray-600 mb-3">Recorded: {actualDataPoint.payload.recordDate || 'N/A'}</p>
        <div className="flex items-center mb-1">
          <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: actualDataPoint.color }}></div>
          <p className="text-gray-700">
            <span className="font-medium">{actualDataPoint.name}:</span> {actualDataPoint.value.toFixed(1)} {unit}
          </p>
        </div>
        
        {/* Show percentile classification instead of ranges */}
        <div className="mt-2 pt-2 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700">Growth Status:</p>
          <p className="text-sm text-gray-600 mt-1">{percentileRange}</p>
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
  // State for zoom levels
  const [zoomLevel, setZoomLevel] = React.useState("auto");
  // Custom range state
  const [customRange, setCustomRange] = React.useState({ min: "", max: "" });
  const [isCustomRange, setIsCustomRange] = React.useState(false);
  
  // Process history data to add ageYears and format dates properly
  const processedHistoryData = React.useMemo(() => {
    console.log("GrowthCharts received data:", historyData);
    console.log("GrowthCharts received birthDate:", birthDate);
    
    if (!historyData || !historyData.length) return [];
    
    // Check for invalid dates and fix them
    return historyData.map(entry => {
      // Clone the entry to avoid mutating the original
      const processedEntry = { ...entry };
      
      // If we have an invalid recordDate, attempt to fix the date
      if (entry.recordDate === "Invalid DateTime" && entry.date) {
        // Fix invalid date format by replacing ":" after date with "T"
        const fixedDate = entry.date.replace(/(\d{4}-\d{2}-\d{2}):/, "$1T");
        processedEntry.fixedDate = fixedDate;
        // Note: The actual date formatting would need to happen in the parent component
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
          title="Weight Tracking (kg)"
          description="Track the patient's weight progress."
          dataKeyActual="weight"
          strokeColor="#22c55e"
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
          title="Height Tracking (cm)"
          description="Monitor height growth."
          dataKeyActual="height"
          strokeColor="#3b82f6"
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
  strokeColor, historyData, yLabel, gender, type,
  zoomLevel, setZoomLevel, customRange, handleRangeChange,
  applyCustomRange, isCustomRange, setIsCustomRange
}) => {
  const percentileData = getPercentileLinesData(gender, type);
  
  // Only show key percentiles for better readability
  const percentiles = ["P3", "P25", "P50", "P75", "P97"];
  
  // Improved color palette with better contrast
  const colors = {
    P3: "#d1d5db", 
    P25: "#93c5fd",
    P50: "#3b82f6", 
    P75: "#2563eb", 
    P97: "#1e40af"
  };
  
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
  // This is the key fix: We filter the data outside the Line component
  const filteredHistoryData = historyData.filter(item => {
    return item.ageYears >= minAge && item.ageYears <= maxAge;
  });
  
  // Get min and max values for better Y axis scaling
  const allValues = [
    ...filteredHistoryData.map(item => item[dataKeyActual]),
    // Only include percentile data within our focused age range
    ...percentileData
      .filter(item => item.ageYears >= minAge && item.ageYears <= maxAge)
      .flatMap(item => percentiles.map(p => item[p]))
  ].filter(Boolean);
  
  // Calculate reasonable min/max with buffer
  const dataMin = allValues.length > 0 ? Math.min(...allValues) : 0;
  const dataMax = allValues.length > 0 ? Math.max(...allValues) : 100;
  const valueRange = dataMax - dataMin;
  
  // Add 15% padding above and below the data range
  const minValue = Math.floor(dataMin - (valueRange * 0.15));
  const maxValue = Math.ceil(dataMax + (valueRange * 0.15));
  
  // Debug the filtered data in custom range
  React.useEffect(() => {
    if (zoomLevel === "custom" && isCustomRange) {
      console.log("Custom range:", minAge, "to", maxAge);
      console.log("Filtered data points:", filteredHistoryData.length);
      console.log("Filtered data:", filteredHistoryData);
    }
  }, [zoomLevel, isCustomRange, minAge, maxAge, filteredHistoryData]);
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow mb-10">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">{title}</h2>
      <div className="bg-gray-50 p-2 rounded-lg mb-4 text-sm text-gray-600">{description}</div>
      
      {/* Show data point summary */}
      <div className="text-sm text-gray-600 mb-4">
        Showing {filteredHistoryData.length} data point(s) in this age range.
      </div>
      
      {/* Make the chart taller */}
      <ResponsiveContainer width="100%" height={500}>
        <LineChart 
          margin={{ 
            top: 20, 
            right: 30, 
            left: 20, 
            bottom: 50 
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="ageYears"
            type="number"
            domain={[minAge, maxAge]}
            tickCount={Math.min(6, maxAge - minAge + 1)}
            tick={<CustomXAxisTick />}
            height={60}
            label={{
              value: "Age (years)",
              position: "insideBottom",
              offset: -20,
              style: { textAnchor: 'middle', fill: '#666', fontSize: 14 }
            }}
          />
          <YAxis
            label={{
              value: yLabel,
              angle: -90,
              position: 'insideLeft',
              offset: -10,
              style: { textAnchor: 'middle', fill: '#666', fontSize: 14 }
            }}
            domain={[minValue, maxValue]}
            tick={<CustomYAxisTick />}
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
            height={50}
            wrapperStyle={{ fontSize: '14px', paddingBottom: '10px' }}
          />

          {/* Draw percentile lines with varying opacity and thickness */}
          {percentiles.map((p, index) => {
            // Get percentile data for the full range to ensure smoother curves
            const allPercentileData = [...percentileData];
            
            // For each age in the current view range, ensure we have data points
            const step = 0.25; // 3-month intervals for smoother curves
            const enhancedData = [];
            
            // Generate smooth data across the entire visible range
            for (let age = minAge; age <= maxAge; age += step) {
              // Find the closest existing data points we can use for interpolation
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
            
            return (
              <Line
                key={p}
                type="monotone"
                data={enhancedData}
                dataKey={p}
                name={p}
                stroke={colors[p] || "#999"}
                strokeWidth={p === "P50" ? 2 : 1.5}
                strokeOpacity={p === "P50" ? 1 : 0.8}
                dot={false}
                activeDot={false}
                isAnimationActive={false}
              />
            );
          })}

          {/* Make the actual data line more prominent - Now using filtered data */}
          <Line
            type="monotone"
            data={filteredHistoryData}
            dataKey={dataKeyActual}
            name={`Actual ${yLabel.split(' ')[0]}`}
            stroke={strokeColor}
            strokeWidth={2}
            activeDot={{ 
              r: 5, 
              strokeWidth: 1.5, 
              fill: strokeColor, 
              stroke: 'white' 
            }}
            dot={{ 
              r: 4, 
              strokeWidth: 1.5, 
              fill: strokeColor, 
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
      
      {/* Add a legend explaining percentiles and zoom controls */}
      <div className="mt-4 text-sm text-gray-600 p-3 bg-gray-50 rounded-lg flex flex-col gap-2">
        <p><strong>Percentile Guide:</strong> P3, P25, P50, P75, P97 represent percentile curves. P50 is the median (50th percentile).</p>
        <p><strong>Current View:</strong> Showing ages {minAge} to {maxAge} years{zoomLevel === "custom" ? " (custom range)" : ""}.</p>
        
        {/* Custom range input */}
        <div className="flex flex-wrap items-center gap-2 mt-2 p-2 bg-gray-100 rounded">
          <span className="text-sm font-medium">Custom Age Range:</span>
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
            <span>to</span>
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
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Apply
            </button>
          </div>
        </div>
        
        {/* View toggle buttons */}
        <div className="flex gap-2 mt-2">
          <button 
            className={`px-3 py-1 ${zoomLevel === "auto" ? "bg-blue-500 text-white" : "bg-blue-100 text-blue-800"} hover:bg-blue-200 rounded text-sm`}
            onClick={() => {
              setZoomLevel("auto");
              setIsCustomRange(false);
            }}
          >
            Auto Zoom (Data Range)
          </button>
          <button 
            className={`px-3 py-1 ${zoomLevel === "full" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"} hover:bg-gray-200 rounded text-sm`}
            onClick={() => {
              setZoomLevel("full");
              setIsCustomRange(false);
            }}
          >
            Show Full Range (0-12 years)
          </button>
        </div>
      </div>
    </div>
  );
};

export default GrowthCharts;