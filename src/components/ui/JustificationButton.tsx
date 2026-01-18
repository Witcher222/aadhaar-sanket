import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MetricJustification } from '@/components/DataJustificationModal';

interface JustificationButtonProps {
    metricId?: string;
    metricData?: MetricJustification;
    label?: string;
    variant?: 'default' | 'outline' | 'ghost' | 'icon';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    className?: string;
    children?: React.ReactNode;
}

export const JustificationButton: React.FC<JustificationButtonProps> = ({
    metricId,
    metricData,
    label = 'View Details',
    variant = 'ghost',
    size = 'icon',
    className = '',
    children
}) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleOpen = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent bubbling

        let data = metricData;

        if (!data && metricId) {
            setLoading(true);
            // Simulate fetch or logic if needed, but usually data is provided
            data = {
                title: "Metric Details",
                value: "N/A",
                calculation: { formula: "Sum(Records)", logic: "Standard Aggregation" },
                dataSource: { file: "system_data.csv", ingested_at: new Date().toISOString(), records_total: 0, records_used: 0 },
                sampleData: []
            };
            setLoading(false);
        }

        navigate('/justification', { state: { metric: data } });
    };

    return (
        <>
            {children ? (
                <div onClick={handleOpen} className={className} role="button" tabIndex={0}>
                    {children}
                </div>
            ) : (
                <Button
                    variant={variant === 'icon' ? 'ghost' : variant}
                    size={size}
                    onClick={handleOpen}
                    className={`text-muted-foreground hover:text-primary transition-colors ${className}`}
                    title="View Data Source & Calculation"
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Info className="w-4 h-4" />
                    )}
                    {size !== 'icon' && variant !== 'icon' && <span className="ml-2">{label}</span>}
                </Button>
            )}
        </>
    );
};
