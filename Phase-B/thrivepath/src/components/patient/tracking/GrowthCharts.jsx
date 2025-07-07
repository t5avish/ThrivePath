import React from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend,
  CartesianGrid, ResponsiveContainer
} from "recharts";
import percentiles from "../../../utils/percentiles.json";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

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
  const offset = isXAxis ? 12 : -8;
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
        fontSize={10}
        fontFamily="Inter, system-ui, sans-serif"
      >
        {isXAxis ? parseFloat(payload.value).toFixed(1) : Math.round(payload.value)}
      </text>
    </g>
  );
};

const getPercentileRange = (value, age, percentileData, type) => {
  if (!value || !percentileData) return "Not available";
  
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
    const actualDataPoint = payload.find(p => 
      p.dataKey === "weight" || 
      p.dataKey === "height"
    );
    
    if (!actualDataPoint) return null;
    
    const percentileRange = getPercentileRange(
      actualDataPoint.value,
      label,
      percentileData,
      type
    );
    
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
    
    const formattedAge = parseFloat(label).toFixed(2);
    
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-xl max-w-xs">
        <div className="mb-2">
          <p className="font-bold text-gray-800 text-sm sm:text-base">
            Age: <span className="ml-1">{formattedAge} years</span>
          </p>
          {showDateDisplay && (
            <p className="text-xs text-gray-500 mt-1">
              Measured on <span className="font-medium">{dateDisplay}</span>
            </p>
          )}
        </div>
        
        <div className="flex items-center mb-2">
          <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: actualDataPoint.color }}></div>
          <p className="text-gray-800 font-medium text-sm">
            {actualDataPoint.value.toFixed(1)} {unit}
          </p>
        </div>
        
        <div className="pt-2 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-2 h-6 bg-blue-500 mr-2 rounded-sm opacity-80"></div>
            <div>
              <p className="text-xs font-medium text-gray-700">Percentile Range:</p>
              <p className="text-xs font-medium">
                {percentileRange}
              </p>
            </div>
          </div>
        </div>
        
        {/* Add delete instruction */}
        <div className="pt-2 border-t border-gray-200 mt-2">
          <p className="text-xs text-gray-400 italic">
            Double click on the checkpoint to delete
          </p>
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

const GrowthCharts = ({ historyData, activeTab, birthDate, onDeleteCheckpoint, patientId }) => {
  const navigate = useNavigate();
  const [zoomLevel, setZoomLevel] = React.useState("auto");
  const [customRange, setCustomRange] = React.useState({ min: "", max: "" });
  const [isCustomRange, setIsCustomRange] = React.useState(false);
  const [deleteModal, setDeleteModal] = React.useState({ isOpen: false, dataPoint: null });
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const processedHistoryData = React.useMemo(() => {
    
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

  const handleDoubleClick = (data) => {
    if (!data || !data.payload) return;
    
    const dataPoint = data.payload;
    
    setDeleteModal({
      isOpen: true,
      dataPoint: dataPoint
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.dataPoint) return;
    
    setIsDeleting(true);
    
    try {
      const dataPoint = deleteModal.dataPoint;
      
      let dateForDeletion = dataPoint.date;
      
      if (dataPoint.fixedDate && dataPoint.recordDate === "Invalid DateTime") {
        dateForDeletion = dataPoint.date;
      }
      
      const token = localStorage.getItem("token");
      
      const response = await fetch('/api/delete-patient-history', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          patientId: patientId,
          date: dateForDeletion
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete checkpoint');
      }
      
      if (onDeleteCheckpoint) {
        onDeleteCheckpoint(dateForDeletion);
      }
      
      setDeleteModal({ isOpen: false, dataPoint: null });
      navigate(`/treatment/${patientId}`);
      
    } catch (error) {
      console.error('Error deleting checkpoint:', error);
      alert('Error deleting checkpoint: ' + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModal({ isOpen: false, dataPoint: null });
  };

  const handleRangeChange = (e, field) => {
    setCustomRange({
      ...customRange,
      [field]: e.target.value
    });
  };

  const applyCustomRange = () => {
    const min = parseFloat(customRange.min);
    const max = parseFloat(customRange.max);
    
    if (!isNaN(min) && !isNaN(max) && min < max) {
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
    <>
      <div className={`grid ${activeTab === "all" ? "grid-cols-1" : "grid-cols-1"} gap-4 sm:gap-6`}>
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
            onDoubleClick={handleDoubleClick}
            isMobile={isMobile}
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
            onDoubleClick={handleDoubleClick}
            isMobile={isMobile}
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        dataPoint={deleteModal.dataPoint}
        isLoading={isDeleting}
      />
    </>
  );
};

const ChartBlock = ({
  title, description, dataKeyActual, dataKeyTarget,
  strokeColor, dotColor, hoverColor, historyData, yLabel, 
  gender, type, zoomLevel, setZoomLevel, customRange, handleRangeChange,
  applyCustomRange, isCustomRange, setIsCustomRange, onDoubleClick, isMobile
}) => {
  const percentileData = getPercentileLinesData(gender, type);
  
  const percentiles = ["P3", "P25", "P50", "P75", "P97"];
  
  const actualAges = historyData
    .map(item => item.ageYears)
    .filter(age => !isNaN(age));
  
  let minAge, maxAge;
  
  if (zoomLevel === "full") {
    minAge = 0;
    maxAge = 12;
  } else if (zoomLevel === "custom" && isCustomRange) {
    minAge = parseFloat(customRange.min);
    maxAge = parseFloat(customRange.max);
  } else if (actualAges.length === 0) {
    minAge = 0;
    maxAge = 5;
  } else {
    minAge = Math.max(0, Math.floor(Math.min(...actualAges)) - 0.5);
    maxAge = Math.min(12, Math.ceil(Math.max(...actualAges)) + 1);
  }
  
  const filteredHistoryData = historyData.filter(item => {
    return item.ageYears >= minAge && item.ageYears <= maxAge;
  });
  
  const allValues = [
    ...filteredHistoryData.map(item => item[dataKeyActual]),
    ...percentileData
      .filter(item => item.ageYears >= minAge && item.ageYears <= maxAge)
      .flatMap(item => percentiles.map(p => item[p]))
  ].filter(Boolean);
  
  const dataMin = allValues.length > 0 ? Math.min(...allValues) : 0;
  const dataMax = allValues.length > 0 ? Math.max(...allValues) : 100;
  const valueRange = dataMax - dataMin;
  
  const minValue = Math.floor(dataMin - (valueRange * 0.1));
  const maxValue = Math.ceil(dataMax + (valueRange * 0.1));
  
  const chartHeight = isMobile ? 350 : 500;
  const chartMargin = isMobile 
    ? { top: 20, right: 15, left: 5, bottom: 40 }
    : { top: 30, right: 30, left: 10, bottom: 60 };
  
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow mb-4 sm:mb-8 overflow-hidden">
      {/* Chart header with gradient background */}
      <div className={`p-3 sm:p-6 bg-gradient-to-r from-slate-50 to-slate-100`}>
        <h2 className="text-lg sm:text-2xl font-semibold mb-1 sm:mb-2 text-gray-800">{title}</h2>
        <p className="text-xs sm:text-sm text-gray-600">{description}</p>
        
        {/* Data point indicator */}
        <div className="mt-2 flex items-center">
          <span className="inline-block h-2 w-2 rounded-full mr-2 bg-black"></span>
          <span className="text-xs sm:text-sm text-gray-600">
            {filteredHistoryData.length} data point{filteredHistoryData.length !== 1 ? 's' : ''} in range
          </span>
        </div>
      </div>
      
      <div className="bg-gray-50 p-2 sm:p-6">
        {/* Chart container */}
        <ResponsiveContainer width="100%" height={chartHeight}>
          <LineChart margin={chartMargin}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="ageYears"
              type="number"
              domain={[minAge, maxAge]}
              tickCount={isMobile ? 6 : Math.min(10, maxAge - minAge + 1)}
              tick={(props) => <CustomAxisTick {...props} isXAxis={true} />}
              height={isMobile ? 40 : 60}
              label={!isMobile ? {
                value: "Age (years)",
                position: "insideBottom",
                offset: -10,
                style: { 
                  textAnchor: 'middle', 
                  fill: '#64748b', 
                  fontSize: 13,
                  fontWeight: 500
                }
              } : undefined}
            />
            <YAxis
              label={!isMobile ? {
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
              } : undefined}
              domain={[minValue, maxValue]}
              tick={(props) => <CustomAxisTick {...props} isXAxis={false} />}
              width={isMobile ? 40 : 60}
            />
            <Tooltip 
              content={<CustomTooltip 
                unit={yLabel.includes("Weight") ? "kg" : "cm"} 
                percentileData={percentileData}
                type={type}
              />}
              isAnimationActive={false}
            />
            {!isMobile && (
              <Legend 
                verticalAlign="top" 
                height={40}
                wrapperStyle={{ 
                  fontSize: '12px', 
                  fontWeight: 500,
                  paddingTop: '5px'
                }}
                formatter={(value) => {
                  if (value.startsWith('P')) {
                    return `${value} percentile`;
                  }
                  if (value === "Patient Weight (kg)") {
                    return "Patient Weight";
                  }
                  if (value === "Patient Height (cm)") {
                    return "Patient Height";
                  }
                  return value;
                }}
              />
            )}

            {percentiles.map((p) => {
              const allPercentileData = [...percentileData];
              
              const step = 0.25;
              const enhancedData = [];
              
              for (let age = minAge; age <= maxAge; age += step) {
                const lowerPoint = allPercentileData
                  .filter(d => d.ageYears <= age)
                  .sort((a, b) => b.ageYears - a.ageYears)[0];
                  
                const upperPoint = allPercentileData
                  .filter(d => d.ageYears >= age)
                  .sort((a, b) => a.ageYears - b.ageYears)[0];
                
                if (lowerPoint && upperPoint) {
                  if (Math.abs(lowerPoint.ageYears - age) < 0.01) {
                    enhancedData.push({
                      ageYears: age,
                      [p]: lowerPoint[p]
                    });
                  } 
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
              
              const isMainPercentile = p === "P50";
              
              return (
                <Line
                  key={p}
                  type="monotone"
                  data={enhancedData}
                  dataKey={p}
                  name={p}
                  stroke={CHART_COLORS.percentiles[p]}
                  strokeWidth={isMainPercentile ? 2 : (isMobile ? 1 : 1.5)}
                  strokeOpacity={isMainPercentile ? 1 : 0.8}
                  dot={false}
                  activeDot={false}
                  isAnimationActive={false}
                />
              );
            })}

            <Line
              type="monotone"
              data={filteredHistoryData}
              dataKey={dataKeyActual}
              name={`Patient ${yLabel.split(' ')[0]}`}
              stroke={strokeColor}
              strokeWidth={isMobile ? 2 : 3}
              activeDot={{ 
                r: isMobile ? 4 : 6, 
                strokeWidth: 2,
                fill: hoverColor || dotColor || strokeColor, 
                stroke: 'white',
                onDoubleClick: onDoubleClick
              }}
              dot={{ 
                r: isMobile ? 3 : 5, 
                strokeWidth: 2, 
                fill: dotColor || strokeColor, 
                stroke: 'white',
                onDoubleClick: onDoubleClick,
                style: { cursor: 'pointer' }
              }}
              isAnimationActive={false}
              connectNulls={true}
            />
          </LineChart>
        </ResponsiveContainer>
        
      </div>
      
      {/* Controls section */}
      <div className="p-3 sm:p-6 border-t border-gray-200">
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Percentile Guide</h3>
          <div className="flex flex-wrap gap-2 sm:gap-3">
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
        
        <div className="p-3 bg-gray-50 rounded-lg mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Current view: Ages {minAge} to {maxAge} years
          </p>
          
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-3">
            <span className="text-sm font-medium text-gray-600">Custom range:</span>
            <div className="flex items-center gap-2 flex-wrap">
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
        
        <div className="flex flex-col sm:flex-row gap-2">
          <button 
            className={`px-3 sm:px-4 py-2 rounded-md text-sm transition-colors ${
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
            className={`px-3 sm:px-4 py-2 rounded-md text-sm transition-colors ${
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
              className="px-3 sm:px-4 py-2 rounded-md text-sm transition-colors bg-blue-100 text-blue-800"
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