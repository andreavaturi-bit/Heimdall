
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';

console.log("Heimdall: Initializing application...");

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("Heimdall: Could not find root element to mount to");
} else {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
  console.log("Heimdall: Application mounted successfully.");
}
