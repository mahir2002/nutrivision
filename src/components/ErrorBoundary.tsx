'use client';

import { useEffect, useState } from 'react';

export default function ErrorBoundary({
    children,
    fallback
}: {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}) {
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const handleError = (event: ErrorEvent) => {
            console.error('Error caught by boundary:', event.error);
            setHasError(true);
            setErrorMessage(event.message || 'An error occurred');
        };

        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            console.error('Unhandled promise rejection:', event.reason);
            setHasError(true);
            setErrorMessage(event.reason?.message || 'An error occurred');
        };

        window.addEventListener('error', handleError);
        window.addEventListener('unhandledrejection', handleUnhandledRejection);

        return () => {
            window.removeEventListener('error', handleError);
            window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        };
    }, []);

    if (hasError) {
        if (fallback) {
            return <>{fallback}</>;
        }

        return (
            <div style={{
                padding: '2rem',
                textAlign: 'center',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#0a0a0f',
                color: '#fff'
            }}>
                <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Something went wrong</h1>
                <p style={{ color: '#888', marginBottom: '1rem' }}>{errorMessage}</p>
                <button
                    onClick={() => {
                        setHasError(false);
                        window.location.reload();
                    }}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: '#00d4aa',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#000',
                        cursor: 'pointer',
                        fontWeight: 600
                    }}
                >
                    Reload Page
                </button>
            </div>
        );
    }

    return <>{children}</>;
}
