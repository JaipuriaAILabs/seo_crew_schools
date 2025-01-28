import React from 'react';

/**
 * ErrorBoundary component to catch JavaScript errors in its child component tree.
 * It provides a fallback UI when an error occurs, preventing the entire app from crashing.
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null }; // Initialize state to track errors
    }

    // Updates state when an error is caught
    static getDerivedStateFromError(error) {
        return { hasError: true, error }; // Set hasError to true and store the error
    }

    // Logs error information to the console
    componentDidCatch(error, errorInfo) {
        console.error('Error caught by ErrorBoundary:', error, errorInfo);
        // Here you could also log the error to an external service
    }

    render() {
        // If an error has occurred, render the fallback UI
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                        <h2 className="text-2xl font-bold text-red-600 mb-4">
                            Oops! Something went wrong
                        </h2>
                        <p className="text-gray-600 mb-6">
                            We're sorry, but there was an error. Please try refreshing the page.
                        </p>
                        <button
                            onClick={() => window.location.reload()} // Refresh the page on button click
                            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            );
        }

        // Render child components if no error has occurred
        return this.props.children;
    }
}

export default ErrorBoundary;
