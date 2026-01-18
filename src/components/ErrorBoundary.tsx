import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({
            error,
            errorInfo,
        });
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    private handleGoHome = () => {
        window.location.href = '/dashboard';
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
                    <Card className="max-w-2xl w-full p-8 shadow-xl">
                        <div className="flex flex-col items-center text-center space-y-6">
                            <div className="p-4 bg-red-100 rounded-full">
                                <AlertTriangle className="w-12 h-12 text-red-600" />
                            </div>

                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    Oops! Something went wrong
                                </h1>
                                <p className="text-gray-600 text-lg">
                                    We encountered an unexpected error. Our team has been notified.
                                </p>
                            </div>

                            {this.state.error && (
                                <div className="w-full bg-gray-50 rounded-lg p-4 text-left">
                                    <details className="cursor-pointer">
                                        <summary className="font-semibold text-gray-700 hover:text-gray-900">
                                            Error Details (for developers)
                                        </summary>
                                        <div className="mt-3 space-y-2">
                                            <div>
                                                <span className="font-medium text-gray-600">Message:</span>
                                                <p className="text-sm text-red-600 font-mono mt-1">
                                                    {this.state.error.message}
                                                </p>
                                            </div>
                                            {this.state.error.stack && (
                                                <div>
                                                    <span className="font-medium text-gray-600">Stack Trace:</span>
                                                    <pre className="text-xs text-gray-700 mt-1 overflow-x-auto bg-white p-3 rounded border">
                                                        {this.state.error.stack}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>
                                    </details>
                                </div>
                            )}

                            <div className="flex gap-4">
                                <Button onClick={this.handleReset} size="lg" className="gap-2">
                                    <RefreshCw className="w-4 h-4" />
                                    Try Again
                                </Button>
                                <Button
                                    onClick={this.handleGoHome}
                                    variant="outline"
                                    size="lg"
                                    className="gap-2"
                                >
                                    <Home className="w-4 h-4" />
                                    Go to Dashboard
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}
