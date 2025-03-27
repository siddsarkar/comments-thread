import React from "react";
import { ErrorBoundary } from "./error-boundary";

// Reusable fallback component
const LoadingFallback = () => <div>lazy loading...</div>;
const LoadingErrorFallback = () => <div>lazy loading error!</div>;

// HOC with Suspense and lazy
// A higher-order component to wrap lazy-loaded components with a suspense fallback
const Loadable = (
  Component: () => Promise<{ default: React.ComponentType }>
) => {
  const LazyComponent = React.lazy(Component);

  return (props: React.ComponentProps<typeof LazyComponent>) => (
    <ErrorBoundary fallback={<LoadingErrorFallback />}>
      <React.Suspense fallback={<LoadingFallback />}>
        <LazyComponent {...props} />
      </React.Suspense>
    </ErrorBoundary>
  );
};

export { Loadable };
