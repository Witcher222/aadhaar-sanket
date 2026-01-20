import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Users, MapPin } from 'lucide-react';
import {
    ResponsiveContainer,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Tooltip,
    Legend
} from 'recharts';

interface District {
    geo_key: string;
    name: string;
    state: string;
    mvi: number;
    population: number;
    updates: number;
    trend_type: string;
    growth_rate: number;
    mvi_rank?: number;
}

interface DistrictComparatorProps {
    districts: District[];
    comparison: {
        district_count: number;
        avg_mvi: number;
        avg_population: number;
        highest_mvi: string;
        lowest_mvi: string;
    };
}

const DistrictComparator = ({ districts, comparison }: DistrictComparatorProps) => {
    const [viewMode, setViewMode] = useState<'radar' | 'table'>('radar');

    // Prepare radar chart data
    const radarData = [
        { metric: 'MVI', ...Object.fromEntries(districts.map(d => [d.name, d.mvi])) },
        { metric: 'Population (k)', ...Object.fromEntries(districts.map(d => [d.name, d.population / 1000])) },
        { metric: 'Updates (k)', ...Object.fromEntries(districts.map(d => [d.name, d.updates / 1000])) },
        { metric: 'Growth %', ...Object.fromEntries(districts.map(d => [d.name, Math.abs(d.growth_rate)])) }
    ];

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    const getTrendIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'explosive':
            case 'rapid':
                return <TrendingUp className="w-4 h-4 text-red-500" />;
            case 'declining':
                return <TrendingDown className="w-4 h-4 text-blue-500" />;
            default:
                return <Users className="w-4 h-4 text-gray-500" />;
        }
    };

    const getTrendColor = (type: string) => {
        switch (type.toLowerCase()) {
            case 'explosive':
            case 'rapid':
                return 'bg-red-100 text-red-700 border-red-200';
            case 'declining':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'stable':
                return 'bg-green-100 text-green-700 border-green-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>District Comparison Dashboard</CardTitle>
                        <CardDescription>
                            Comparing {comparison.district_count} districts across multiple metrics
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant={viewMode === 'radar' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewMode('radar')}
                        >
                            Chart View
                        </Button>
                        <Button
                            variant={viewMode === 'table' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewMode('table')}
                        >
                            Table View
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-100">
                        <p className="text-xs text-blue-600 font-semibold uppercase">Avg MVI</p>
                        <p className="text-2xl font-bold text-blue-900 mt-1">{comparison.avg_mvi}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-purple-50 to-white rounded-lg border border-purple-100">
                        <p className="text-xs text-purple-600 font-semibold uppercase">Avg Population</p>
                        <p className="text-2xl font-bold text-purple-900 mt-1">
                            {(comparison.avg_population / 1000).toFixed(0)}k
                        </p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-green-50 to-white rounded-lg border border-green-100">
                        <p className="text-xs text-green-600 font-semibold uppercase">Highest MVI</p>
                        <p className="text-sm font-bold text-green-900 mt-1 truncate">{comparison.highest_mvi}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-amber-50 to-white rounded-lg border border-amber-100">
                        <p className="text-xs text-amber-600 font-semibold uppercase">Lowest MVI</p>
                        <p className="text-sm font-bold text-amber-900 mt-1 truncate">{comparison.lowest_mvi}</p>
                    </div>
                </div>

                {/* Visualization */}
                {viewMode === 'radar' ? (
                    <div>
                        <div className="h-[400px] w-full bg-white rounded-lg p-4 border">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart data={radarData}>
                                    <PolarGrid stroke="#e5e7eb" />
                                    <PolarAngleAxis
                                        dataKey="metric"
                                        tick={{ fontSize: 12, fill: '#374151' }}
                                    />
                                    <PolarRadiusAxis tick={{ fontSize: 10 }} />
                                    {districts.map((district, idx) => (
                                        <Radar
                                            key={district.geo_key}
                                            name={district.name}
                                            dataKey={district.name}
                                            stroke={colors[idx % colors.length]}
                                            fill={colors[idx % colors.length]}
                                            fillOpacity={0.3}
                                        />
                                    ))}
                                    <Tooltip />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="text-xs text-muted-foreground mt-3 text-center">
                            Radar chart showing normalized metrics across all selected districts
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-muted/50">
                                    <th className="p-3 text-left text-sm font-semibold border-b">District</th>
                                    <th className="p-3 text-left text-sm font-semibold border-b">State</th>
                                    <th className="p-3 text-center text-sm font-semibold border-b">MVI</th>
                                    <th className="p-3 text-center text-sm font-semibold border-b">Rank</th>
                                    <th className="p-3 text-right text-sm font-semibold border-b">Population</th>
                                    <th className="p-3 text-center text-sm font-semibold border-b">Trend</th>
                                    <th className="p-3 text-right text-sm font-semibold border-b">Growth</th>
                                </tr>
                            </thead>
                            <tbody>
                                {districts.map((district, idx) => (
                                    <tr
                                        key={district.geo_key}
                                        className={idx % 2 === 0 ? 'bg-white' : 'bg-muted/20'}
                                    >
                                        <td className="p-3 font-medium text-sm border-b">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-primary" />
                                                {district.name}
                                            </div>
                                        </td>
                                        <td className="p-3 text-sm text-muted-foreground border-b">
                                            {district.state}
                                        </td>
                                        <td className="p-3 text-center border-b">
                                            <span className="font-bold text-primary">{district.mvi}</span>
                                        </td>
                                        <td className="p-3 text-center border-b">
                                            <Badge variant="outline">#{district.mvi_rank || idx + 1}</Badge>
                                        </td>
                                        <td className="p-3 text-right text-sm border-b">
                                            {(district.population / 1000).toFixed(0)}k
                                        </td>
                                        <td className="p-3 border-b">
                                            <Badge className={getTrendColor(district.trend_type)}>
                                                <span className="flex items-center gap-1">
                                                    {getTrendIcon(district.trend_type)}
                                                    {district.trend_type}
                                                </span>
                                            </Badge>
                                        </td>
                                        <td className="p-3 text-right text-sm border-b">
                                            <span className={district.growth_rate > 0 ? 'text-red-600' : 'text-green-600'}>
                                                {district.growth_rate > 0 ? '+' : ''}{district.growth_rate}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default DistrictComparator;
