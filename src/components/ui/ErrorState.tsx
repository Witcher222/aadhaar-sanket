import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ErrorStateProps {
    error?: Error | { message: string } | string;
    title?: string;
    message?: string;
    onRetry?: () => void;
    showHomeButton?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
    error,
    title = 'Failed to Load Data',
    message,
    onRetry,
    showHomeButton = true,
}) => {
    const errorMessage = message || (
        typeof error === 'string'
            ? error
            : error instanceof Error
                ? error.message
                : 'An unexpected error occurred while fetching data. Please try again.'
    );

    return (
        <Card className="p-8 text-center max-w-md mx-auto my-12">
            <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-red-50 rounded-full">
                    <AlertCircle className="w-12 h-12 text-red-500" />
                </div>

                <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
                    <p className="text-gray-600 text-sm">{errorMessage}</p>
                </div>

                {error instanceof Error && error.stack && (
                    <details className="text-left w-full">
                        <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                            Technical Details
                        </summary>
                        <pre className="text-xs text-gray-600 mt-2 p-2 bg-gray-50 rounded overflow-x-auto">
                            {error.stack}
                        </pre>
                    </details>
                )}

                <div className="flex gap-3 pt-2">
                    {onRetry && (
                        <Button onClick={onRetry} className="gap-2">
                            <RefreshCw className="w-4 h-4" />
                            Try Again
                        </Button>
                    )}
                    {showHomeButton && (
                        <Button
                            variant="outline"
                            onClick={() => (window.location.href = '/dashboard')}
                            className="gap-2"
                        >
                            <Home className="w-4 h-4" />
                            Dashboard
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
};
