import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Info } from 'lucide-react';
import Plot from 'react-plotly.js';

interface CorrelationMatrixProps {
    data: {
        matrix: Array<{ variable: string;[key: string]: number | string }>;
        variables: string[];
        strong_correlations?: Array<{
            var1: string;
            var2: string;
            correlation: number;
            strength: string;
        }>;
    };
}

const CorrelationMatrix = ({ data }: CorrelationMatrixProps) => {
    const [selectedCell, setSelectedCell] = useState<{ var1: string; var2: string; value: number } | null>(null);

    // Safety checks
    if (!data || !data.matrix || !data.variables) {
        return (
            <Card>
                <CardContent className="py-12 text-center text-slate-500">
                    No correlation data available
                </CardContent>
            </Card>
        );
    }

    const { matrix, variables, strong_correlations: strongCorrelations = [] } = data;

    // Build z-matrix for heatmap
    const zMatrix = matrix.map(row => {
        return variables.map(v => typeof row[v] === 'number' ? row[v] as number : 0);
    });

    const exportToCSV = () => {
        const csvContent = [
            ['Variable', ...variables],
            ...matrix.map(row => [
                row.variable,
                ...variables.map(v => typeof row[v] === 'number' ? row[v] : '')
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'correlation_matrix.csv';
        a.click();
    };

    const formatVariableName = (name: string) => {
        return name
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Correlation Matrix</CardTitle>
                        <CardDescription>
                            Relationship strength between key metrics (-1 to +1)
                        </CardDescription>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={exportToCSV}
                        className="h-8"
                    >
                        <Download className="w-4 h-4 mr-1" />
                        Export CSV
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[500px] w-full border rounded-xl overflow-hidden bg-white shadow-inner">
                    <Plot
                        data={[{
                            type: 'heatmap',
                            z: zMatrix,
                            x: variables.map(formatVariableName),
                            y: variables.map(formatVariableName),
                            colorscale: [
                                [0, '#dc2626'],      // -1: Red (strong negative)
                                [0.25, '#f97316'],   // -0.5: Orange
                                [0.5, '#f3f4f6'],    // 0: Light gray (no correlation)
                                [0.75, '#60a5fa'],   // 0.5: Light blue
                                [1, '#2563eb']       // 1: Blue (strong positive)
                            ],
                            zmin: -1,
                            zmax: 1,
                            text: zMatrix.map(row => row.map(val => val.toFixed(3))),
                            texttemplate: '%{text}',
                            textfont: { size: 11, color: '#000' },
                            hoverongaps: false,
                            hovertemplate: '<b>%{y} vs %{x}</b><br>Correlation: %{z:.3f}<extra></extra>'
                        }]}
                        layout={{
                            width: 600,
                            height: 500,
                            margin: { t: 40, b: 120, l: 120, r: 40 },
                            xaxis: {
                                tickangle: -45,
                                tickfont: { size: 10 },
                                side: 'bottom'
                            },
                            yaxis: {
                                tickfont: { size: 10 },
                                autorange: 'reversed'
                            },
                            paper_bgcolor: 'white',
                            plot_bgcolor: 'white'
                        }}
                        config={{ responsive: true, displayModeBar: false }}
                        style={{ width: '100%', height: '100%' }}
                    />
                </div>

                {/* Strong Correlations List */}
                {strongCorrelations.length > 0 && (
                    <div className="mt-6 space-y-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <Info className="w-4 h-4 text-primary" />
                            Strong Correlations Detected
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {strongCorrelations.slice(0, 6).map((corr, idx) => (
                                <div
                                    key={idx}
                                    className="p-3 bg-gradient-to-r from-muted/30 to-muted/10 rounded-lg border border-border"
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="text-sm">
                                            <span className="font-semibold text-foreground">
                                                {formatVariableName(corr.var1)}
                                            </span>
                                            {' ↔ '}
                                            <span className="font-semibold text-foreground">
                                                {formatVariableName(corr.var2)}
                                            </span>
                                        </div>
                                        <div className={`text-lg font-bold ${corr.correlation > 0 ? 'text-blue-600' : 'text-red-600'
                                            }`}>
                                            {corr.correlation > 0 ? '+' : ''}{(corr.correlation).toFixed(2)}
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1 capitalize">
                                        {corr.strength}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Legend */}
                <div className="mt-6 p-4 bg-muted/30 rounded-xl border border-border">
                    <h4 className="text-sm font-semibold mb-2">How to Read This Matrix:</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• <strong className="text-blue-600">Blue (positive)</strong>: Variables increase together</li>
                        <li>• <strong className="text-red-600">Red (negative)</strong>: One increases, other decreases</li>
                        <li>• <strong className="text-gray-600">Gray (neutral)</strong>: Little to no relationship</li>
                        <li>• Values closer to ±1 indicate stronger relationships</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
};

export default CorrelationMatrix;
