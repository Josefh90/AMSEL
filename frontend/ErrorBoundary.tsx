// ErrorBoundary.tsx
import React from "react";

type ErrorBoundaryProps = {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    onReset?: () => void;
};

type ErrorBoundaryState = {
    hasError: boolean;
    error?: Error;
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("Caught by ErrorBoundary:", error, errorInfo);
        // Optional: send error to monitoring service
    }

    handleReset = () => {
        this.setState({ hasError: false, error: undefined });
        if (this.props.onReset) this.props.onReset();
    };

    render() {
        if (this.state.hasError) {
            return (
                this.props.fallback || (
                    <div style={{ padding: "1rem", textAlign: "center" }}>
                        <h2>Something went wrong 😞</h2>
                        <pre>{this.state.error?.message}</pre>
                        <button onClick={this.handleReset}>Try Again</button>
                    </div>
                )
            );
        }

        return this.props.children;
    }
}
