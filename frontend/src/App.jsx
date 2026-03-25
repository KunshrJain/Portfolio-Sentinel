import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ResponsiveContainer, Treemap, Tooltip } from 'recharts';
import './index.css';

const CustomizedContent = (props) => {
  const { root, depth, x, y, width, height, index, payload, colors, rank, name } = props;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: depth < 2 ? colors[Math.floor((index / root.children.length) * 6)] : '#ffffff00',
          stroke: '#30363d',
          strokeWidth: 2 / (depth + 1e-10),
          strokeOpacity: 1 / (depth + 1e-10),
        }}
        rx={4}
        ry={4}
      />
      {width > 50 && height > 30 && (
        <text x={x + width / 2} y={y + height / 2 + 7} textAnchor="middle" fill="#fff" fontSize={14}>
          {name}
        </text>
      )}
    </g>
  );
};

export default function App() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("Connecting...");
  const [rateShock, setRateShock] = useState(0);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:8000/portfolio');
        if (res.data && res.data.status === "Active") {
          setData(res.data.metrics);
        }
        setStatus(res.data?.status || "Connected");
      } catch (err) {
        setStatus("Backend Offline");
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const getHeatmapData = () => {
    if (!data) return [];
    
    const children = Object.keys(data).map(sym => {
      const item = data[sym];
      const allocValue = Math.max(0.01, item.allocation || 0) * 100;
      
      let baseShock = 0;
      if (rateShock > 0) baseShock = - (rateShock * 0.5) * (Math.abs(item.var || 0) * 100);
      else if (rateShock < 0) baseShock = Math.abs(rateShock * 0.5) * (Math.abs(item.alpha || 0) * 100);
      
      const simulatedSize = Math.max(0, allocValue + baseShock);
      
      return {
        name: sym,
        size: isNaN(simulatedSize) ? 1 : simulatedSize,
        price: item.latest_price,
        sentiment: item.sentiment,
        alpha: item.alpha
      };
    });
    
    if (children.length === 0) return [];
    
    return [
      {
        name: 'Portfolio',
        children: children
      }
    ];
  };

  const COLORS = ['#3fb950', '#58a6ff', '#a371f7', '#f85149'];

  return (
    <div className="app-container">
      <header className="header">
        <h1>Portfolio-Sentinel</h1>
        <div className="status-badge">{status}</div>
      </header>

      <div className="grid">
        <div className="panel">
          <h2 className="panel-title">Heat Map of Opportunity</h2>
          {data ? (
            <div style={{ width: '100%', height: 400 }}>
              <ResponsiveContainer>
                <Treemap
                  data={getHeatmapData()}
                  dataKey="size"
                  aspectRatio={4 / 3}
                  stroke="#fff"
                  fill="#58a6ff"
                  content={<CustomizedContent colors={COLORS} />}
                >
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '8px' }}
                    itemStyle={{ color: '#c9d1d9' }}
                    formatter={(value, name, props) => {
                      const { price, sentiment, alpha } = props?.payload || {};
                      return [
                        `Price: $${price?.toFixed(2)} | Sentiment: ${sentiment?.toFixed(2)} | Alpha: ${(alpha*100)?.toFixed(2)}%`,
                        name
                      ];
                    }}
                  />
                </Treemap>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b949e' }}>
              Waiting for data accumulation...
            </div>
          )}
        </div>

        <div className="panel">
          <h2 className="panel-title">Scenario Simulator</h2>
          <div className="simulator-controls">
            <div className="control-group">
              <label>Interest Rate Shock (bps): {rateShock}</label>
              <input 
                type="range" 
                min="-100" 
                max="100" 
                step="25"
                value={rateShock}
                onChange={(e) => setRateShock(parseInt(e.target.value))}
              />
            </div>
            
            <button className="simulate-btn" onClick={() => setRateShock(0)}>
              Reset Simulation
            </button>
          </div>
          
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Asset Metrics</h3>
            {data && Object.keys(data).map(sym => (
              <div key={sym} className="asset-card">
                <div className="asset-info">
                  <h3>{sym}</h3>
                  <div className="asset-metrics">
                    <span>Alloc: {(data[sym].allocation * 100).toFixed(1)}%</span>
                    <span>VaR: {(data[sym].var * 100).toFixed(2)}%</span>
                  </div>
                </div>
                <div className={`asset-metrics ${data[sym].alpha > 0 ? 'positive' : 'negative'}`}>
                  {(data[sym].alpha * 100).toFixed(2)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
