'use client';

import { useState, useEffect } from 'react';
import { getSalesTrend, type SalesTrendData, type SalesDataPoint } from './actions';

type Period = 'today' | '7days' | '30days' | 'custom';

export default function SalesChart() {
    const [activeTab, setActiveTab] = useState<Period>('today');
    const [data, setData] = useState<SalesTrendData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadData(activeTab);
    }, [activeTab]);

    const loadData = async (period: Period) => {
        setLoading(true);
        setError(null);
        try {
            const result = await getSalesTrend(period);
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load data');
            console.error('Error loading sales data:', err);
        } finally {
            setLoading(false);
        }
    };

    const renderChart = () => {
        if (!data || data.data.length === 0) {
            return (
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '100%',
                    color: '#9ca3af',
                    fontSize: '14px'
                }}>
                    Aucune donnée disponible
                </div>
            );
        }

        const chartData = data.data;
        const amounts = chartData.map(d => d.amount);
        const maxAmount = Math.max(...amounts, 0);
        const minAmount = Math.min(...amounts, 0);
        const range = maxAmount - minAmount || maxAmount || 1;

        // Chart dimensions
        const padding = { top: 20, right: 50, bottom: 40, left: 60 };
        const width = 600;
        const height = 250;
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        // Calculate points
        const points = chartData.map((point, index) => {
            const x = chartData.length === 1 
                ? padding.left + chartWidth / 2
                : padding.left + (index / (chartData.length - 1 || 1)) * chartWidth;
            const normalizedAmount = range > 0 ? (point.amount - minAmount) / range : 0.5;
            const y = padding.top + chartHeight - (normalizedAmount * chartHeight);
            return { x, y, ...point };
        });

        // Generate polyline points string
        const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');

        // Format labels based on period
        const formatLabel = (dateStr: string) => {
            // Handle both date format (YYYY-MM-DD) and datetime format (YYYY-MM-DDTHH:00)
            let date: Date;
            if (dateStr.includes('T') && dateStr.includes(':')) {
                date = new Date(dateStr);
            } else {
                date = new Date(dateStr + 'T00:00:00');
            }
            
            if (activeTab === 'today') {
                return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
            } else if (activeTab === '7days') {
                return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
            } else {
                return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
            }
        };

        // Y-axis labels
        const yAxisSteps = 5;
        const yAxisLabels = [];
        for (let i = 0; i <= yAxisSteps; i++) {
            const value = minAmount + (range * (i / yAxisSteps));
            const y = padding.top + chartHeight - (i / yAxisSteps) * chartHeight;
            yAxisLabels.push({ value, y });
        }

        return (
            <svg viewBox={`0 0 ${width} ${height}`} className="apercu-chart-svg" preserveAspectRatio="xMidYMid meet">
                {/* Grid lines */}
                {yAxisLabels.map((label, i) => (
                    <line
                        key={i}
                        x1={padding.left}
                        y1={label.y}
                        x2={width - padding.right}
                        y2={label.y}
                        stroke={i === 0 ? "#e5e7eb" : "#e5e7eb"}
                        strokeWidth={i === 0 ? 1 : 0.5}
                        opacity={i === 0 ? 1 : 0.5}
                    />
                ))}
                
                {/* Y-axis */}
                <line
                    x1={padding.left}
                    y1={padding.top}
                    x2={padding.left}
                    y2={height - padding.bottom}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                />
                
                {/* X-axis */}
                <line
                    x1={padding.left}
                    y1={height - padding.bottom}
                    x2={width - padding.right}
                    y2={height - padding.bottom}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                />

                {/* Y-axis labels */}
                {yAxisLabels.map((label, i) => (
                    <text
                        key={i}
                        x={padding.left - 10}
                        y={label.y + 4}
                        fontSize="12"
                        fill="#9ca3af"
                        textAnchor="end"
                        alignmentBaseline="middle"
                    >
                        {label.value.toFixed(0)}
                    </text>
                ))}

                {/* Chart line */}
                {points.length > 1 ? (
                    <polyline
                        points={polylinePoints}
                        fill="none"
                        stroke="#0ea5e9"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                ) : points.length === 1 && (
                    <line
                        x1={points[0].x}
                        y1={height - padding.bottom}
                        x2={points[0].x}
                        y2={points[0].y}
                        stroke="#0ea5e9"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />
                )}

                {/* Data points */}
                {points.map((point, index) => (
                    <g key={index}>
                        <circle
                            cx={point.x}
                            cy={point.y}
                            r="4"
                            fill="#0ea5e9"
                            stroke="white"
                            strokeWidth="2"
                        />
                        {/* Tooltip on hover */}
                        <title>
                            {formatLabel(point.date)}: {point.amount.toFixed(2)} DT ({point.count} commande{point.count !== 1 ? 's' : ''})
                        </title>
                    </g>
                ))}

                {/* X-axis labels */}
                {points.map((point, index) => {
                    // Show labels for first, last, and evenly spaced middle points
                    const showLabel = index === 0 || 
                                    index === points.length - 1 || 
                                    (points.length > 2 && index === Math.floor(points.length / 2)) ||
                                    (points.length > 4 && index % Math.ceil(points.length / 4) === 0);
                    
                    if (!showLabel) return null;
                    
                    return (
                        <text
                            key={index}
                            x={point.x}
                            y={height - padding.bottom + 20}
                            fontSize="12"
                            fill="#0ea5e9"
                            textAnchor="middle"
                            fontWeight="600"
                        >
                            {formatLabel(point.date)}
                        </text>
                    );
                })}
            </svg>
        );
    };

    return (
        <div className="apercu-chart-section">
            <h3 className="apercu-chart-title">Tendance des ventes</h3>

            <div className="apercu-chart-tabs">
                <button
                    className={`apercu-tab ${activeTab === 'today' ? 'active' : ''}`}
                    onClick={() => setActiveTab('today')}
                >
                    Aujourd&apos;hui
                </button>
                <button
                    className={`apercu-tab ${activeTab === '7days' ? 'active' : ''}`}
                    onClick={() => setActiveTab('7days')}
                >
                    7 Jours
                </button>
                <button
                    className={`apercu-tab ${activeTab === '30days' ? 'active' : ''}`}
                    onClick={() => setActiveTab('30days')}
                >
                    30 Jours
                </button>
                <button
                    className={`apercu-tab ${activeTab === 'custom' ? 'active' : ''}`}
                    onClick={() => {
                        // For now, custom will use last 60 days
                        // In a full implementation, you'd show a date picker
                        setActiveTab('30days');
                    }}
                    title="Personnalisé (à venir)"
                >
                    Personnalisé
                </button>
            </div>

            <div className="apercu-chart-card">
                {loading ? (
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        height: '300px',
                        color: '#9ca3af',
                        fontSize: '14px'
                    }}>
                        Chargement...
                    </div>
                ) : error ? (
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        height: '300px',
                        color: '#ef4444',
                        fontSize: '14px'
                    }}>
                        {error}
                    </div>
                ) : (
                    <>
                        <div className="apercu-chart-header">
                            <div className="apercu-chart-label">Ventes</div>
                            <div className="apercu-chart-value-row">
                                <span className="apercu-chart-value">{data?.total.toFixed(0) || 0}</span>
                                <span className="apercu-chart-currency"> DT</span>
                            </div>
                        </div>
                        <div className="apercu-chart-subtext">
                            {data?.period || 'Aujourd\'hui'} 
                            {data && data.previousTotal > 0 && (
                                <span className={`apercu-chart-change ${data.changePercent >= 0 ? '' : 'negative'}`}>
                                    {data.changePercent >= 0 ? '+' : ''}{data.changePercent.toFixed(1)}%
                                </span>
                            )}
                        </div>

                        <div className="apercu-chart">
                            {renderChart()}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

