import { useMemo } from 'react';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    Brush,
    Area,
    AreaChart
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TimeSeriesDataPoint {
    date?: string;
    month?: string;
    [key: string]: any;
}

interface TimeSeriesChartProps {
    data: TimeSeriesDataPoint[];
    metric: string;
    title?: string;
    description?: string;
    showBrush?: boolean;
    showPeriodSelector?: boolean;
    onPeriodChange?: (period: string) => void;
    color?: string;
    selectedPeriod?: string;
}

const TimeSeriesChart = ({
    data,
    metric,
    title = "Time Series Analysis",
    description,
    showBrush = true,
    showPeriodSelector = true,
    onPeriodChange,
    color = "#3b82f6",
    selectedPeriod
}: TimeSeriesChartProps) => {
    const periods = ['7D', '1M', '3M', '1Y', 'ALL'];

    // Calculate trend
    const trend = useMemo(() => {
        if (data.length < 2) return 'stable';
        const values = data.map(d => d[metric]).filter(v => v !== undefined);
        if (values.length < 2) return 'stable';

        const first = values[0];
        const last = values[values.length - 1];
        const change = ((last - first) / first) * 100;

        if (change > 5) return 'increasing';
        if (change < -5) return 'decreasing';
        return 'stable';
    }, [data, metric]);

    const trendIcon = () => {
        switch (trend) {
            case 'increasing':
                return <TrendingUp className="w-5 h-5 text-green-600" />;
            case 'decreasing':
                return <TrendingDown className="w-5 h-5 text-red-600" />;
            default:
                return <Minus className="w-5 h-5 text-gray-600" />;
        }
    };

    const exportChart = () => {
        const csvContent = [
            ['Date', metric],
            ...data.map(d => [d.date || d.month, d[metric]])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${metric}_timeseries.csv`;
        a.click();
    };

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 rounded-lg shadow-lg border border-border">
                    <p className="font-semibold text-sm mb-1">{label}</p>
                    <p className="text-primary font-bold text-lg">
                        {metric}: {payload[0].value.toFixed(2)}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                {title}
                                {trendIcon()}
                            </CardTitle>
                            {description && <CardDescription>{description}</CardDescription>}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {showPeriodSelector && (
                            <div className="flex gap-1 bg-muted p-1 rounded-lg">
                                {periods.map(p => (
                                    <Button
                                        key={p}
                                        variant={selectedPeriod === p ? "default" : "ghost"}
                                        size="sm"
                                        onClick={() => onPeriodChange?.(p)}
                                        className="h-7 text-xs font-medium"
                                    >
                                        {p}
                                    </Button>
                                ))}
                            </div>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={exportChart}
                            className="h-8"
                        >
                            <Download className="w-4 h-4 mr-1" />
                            Export
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis
                            dataKey={data[0]?.date ? "date" : "month"}
                            tick={{ fontSize: 11 }}
                            stroke="#6b7280"
                        />
                        <YAxis
                            tick={{ fontSize: 11 }}
                            stroke="#6b7280"
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            wrapperStyle={{ paddingTop: '10px' }}
                            iconType="line"
                        />
                        <Area
                            type="monotone"
                            dataKey={metric}
                            stroke={color}
                            strokeWidth={3}
                            fill="url(#colorMetric)"
                            name={metric.toUpperCase()}
                        />
                        {showBrush && data.length > 10 && (
                            <Brush
                                dataKey={data[0]?.date ? "date" : "month"}
                                height={30}
                                stroke={color}
                            />
                        )}
                    </AreaChart>
                </ResponsiveContainer>

                {/* Insight Box */}
                <div className="mt-4 p-4 bg-muted/50 rounded-xl border border-border">
                    <p className="text-sm text-muted-foreground">
                        <strong>Trend Analysis:</strong> The {metric} shows a{' '}
                        <span className={`font-semibold ${trend === 'increasing' ? 'text-green-600' :
                                trend === 'decreasing' ? 'text-red-600' : 'text-gray-600'
                            }`}>
                            {trend}
                        </span> pattern over the selected period with {data.length} data points.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};

export default TimeSeriesChart;
