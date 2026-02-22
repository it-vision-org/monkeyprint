'use client';

import { useState, useEffect } from 'react';
import { getSalesTrend, type SalesTrendData, type SalesDataPoint } from './actions';
import styles from './apercu.module.css';

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
                    fontSize: '14px',
                    fontWeight: 500
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

        // Chart dimensions - responsive padding
        const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
        const padding = isMobile
            ? { top: 20, right: 20, bottom: 40, left: 45 }
            : { top: 30, right: 20, bottom: 40, left: 60 };
        const width = isMobile ? 400 : 800;
        const height = isMobile ? 220 : 320;
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

        const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');

        // Fill polygon points for gradient
        let polygonPoints = '';
        if (points.length > 1) {
            polygonPoints = `${points[0].x},${height - padding.bottom} ` +
                polylinePoints +
                ` ${points[points.length - 1].x},${height - padding.bottom}`;
        }

        const formatLabel = (dateStr: string) => {
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

        const yAxisSteps = isMobile ? 4 : 5;
        const yAxisLabels = [];
        for (let i = 0; i <= yAxisSteps; i++) {
            const value = minAmount + (range * (i / yAxisSteps));
            const y = padding.top + chartHeight - (i / yAxisSteps) * chartHeight;
            yAxisLabels.push({ value, y });
        }

        return (
            <svg viewBox={`0 0 ${width} ${height}`} className={styles.chartSvgWrapper} preserveAspectRatio="xMidYMid meet">
                <defs>
                    <linearGradient id="chartLineGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#c026d3" />
                    </linearGradient>
                    <linearGradient id="chartFillGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#c026d3" stopOpacity="0.0" />
                    </linearGradient>
                </defs>

                {/* Area Fill */}
                {points.length > 1 && (
                    <polygon
                        points={polygonPoints}
                        fill="url(#chartFillGradient)"
                    />
                )}

                {/* Grid horizontal lines */}
                {yAxisLabels.map((label, i) => (
                    <line
                        key={i}
                        x1={padding.left}
                        y1={label.y}
                        x2={width - padding.right}
                        y2={label.y}
                        stroke="#f1f5f9"
                        strokeWidth="1.5"
                    />
                ))}

                {/* Y-axis labels */}
                {yAxisLabels.map((label, i) => (
                    <text
                        key={i}
                        x={padding.left - 16}
                        y={label.y}
                        fontFamily="inherit"
                        fontSize={isMobile ? "11" : "13"}
                        fontWeight="600"
                        fill="#94a3b8"
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
                        stroke="url(#chartLineGradient)"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                ) : points.length === 1 && (
                    <line
                        x1={points[0].x}
                        y1={height - padding.bottom}
                        x2={points[0].x}
                        y2={points[0].y}
                        stroke="url(#chartLineGradient)"
                        strokeWidth="4"
                        strokeLinecap="round"
                    />
                )}

                {/* Data points */}
                {points.map((point, index) => (
                    <g key={index} className={styles.chartPointGroup}>
                        <circle
                            cx={point.x}
                            cy={point.y}
                            r="6"
                            fill="white"
                            stroke="#c026d3"
                            strokeWidth="3"
                            className={styles.chartDot}
                        />
                        <title>
                            {formatLabel(point.date)}: {point.amount.toFixed(2)} DT ({point.count} commande{point.count !== 1 ? 's' : ''})
                        </title>
                    </g>
                ))}

                {/* X-axis labels */}
                {points.map((point, index) => {
                    const showLabel = index === 0 ||
                        index === points.length - 1 ||
                        (points.length > 2 && index === Math.floor(points.length / 2)) ||
                        (points.length > 4 && index % Math.ceil(points.length / 4) === 0);

                    if (!showLabel) return null;

                    return (
                        <text
                            key={index}
                            x={point.x}
                            y={height - padding.bottom + (isMobile ? 24 : 28)}
                            fontFamily="inherit"
                            fontSize={isMobile ? "11" : "13"}
                            fill="#94a3b8"
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
        <div className={styles.chartSection}>
            <div className={styles.chartHeaderArea}>
                <div>
                    <h3 className={styles.chartTitle}>Tendance des ventes</h3>
                    <p className={styles.chartSubtitle}>Suivi chronologique de vos revenus</p>
                </div>
                <div className={styles.chartTabs}>
                    <button
                        className={`${styles.chartTab} ${activeTab === 'today' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('today')}
                    >
                        Aujourd&apos;hui
                    </button>
                    <button
                        className={`${styles.chartTab} ${activeTab === '7days' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('7days')}
                    >
                        7 Jours
                    </button>
                    <button
                        className={`${styles.chartTab} ${activeTab === '30days' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('30days')}
                    >
                        30 Jours
                    </button>
                </div>
            </div>

            <div className={styles.chartCardBody}>
                {loading ? (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '320px',
                        color: '#9ca3af',
                        fontSize: '15px',
                        fontWeight: 500
                    }}>
                        Chargement de l&apos;analyse...
                    </div>
                ) : error ? (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '320px',
                        color: '#ef4444',
                        fontSize: '15px',
                        fontWeight: 500
                    }}>
                        {error}
                    </div>
                ) : (
                    <>
                        <div className={styles.chartSummaryHeader}>
                            <div className={styles.chartSummaryValueRow}>
                                <span className={styles.chartSummaryValue}>{data?.total.toFixed(0) || 0}</span>
                                <span className={styles.chartSummaryCurrency}>DT</span>
                            </div>
                            <div className={styles.chartSummarySubtext}>
                                {data?.period || 'Aujourd\'hui'}
                                {data && data.previousTotal > 0 && (
                                    <span className={`${styles.change} ${data.changePercent >= 0 ? styles.changePositiveChart : styles.changeNegativeChart}`}>
                                        {data.changePercent >= 0 ? '+' : ''}{data.changePercent.toFixed(1)}%
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className={styles.chartGraphWrapper}>
                            {renderChart()}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
