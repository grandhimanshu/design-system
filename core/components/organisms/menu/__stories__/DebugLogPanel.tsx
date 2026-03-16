import React from 'react';

interface LogEntry {
  timestamp: number;
  message: string;
  data?: any;
}

let logEntries: LogEntry[] = [];
let listeners: Array<() => void> = [];

export const addDebugLog = (message: string, data?: any) => {
  const entry = {
    timestamp: Date.now(),
    message,
    data,
  };
  logEntries.push(entry);
  listeners.forEach((fn) => fn());
  
  // Also log to browser console for easy copying
  console.log(`[DEBUG] ${message}`, data || '');
};

export const clearDebugLogs = () => {
  logEntries = [];
  listeners.forEach((fn) => fn());
};

export const DebugLogPanel = () => {
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  React.useEffect(() => {
    listeners.push(forceUpdate);
    return () => {
      listeners = listeners.filter((fn) => fn !== forceUpdate);
    };
  }, []);

  const copyToClipboard = () => {
    const text = logEntries.map((entry) => `${entry.message}`).join('\n');
    navigator.clipboard.writeText(text);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '400px',
        maxHeight: '80vh',
        background: '#1e1e1e',
        color: '#d4d4d4',
        fontSize: '11px',
        fontFamily: 'monospace',
        overflow: 'auto',
        zIndex: 99999,
        border: '2px solid #007acc',
        padding: '8px',
      }}
    >
      <div style={{ marginBottom: '8px', display: 'flex', gap: '8px' }}>
        <button
          onClick={copyToClipboard}
          style={{
            padding: '4px 8px',
            background: '#007acc',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '11px',
          }}
        >
          Copy All
        </button>
        <button
          onClick={clearDebugLogs}
          style={{
            padding: '4px 8px',
            background: '#c5c5c5',
            color: 'black',
            border: 'none',
            cursor: 'pointer',
            fontSize: '11px',
          }}
        >
          Clear
        </button>
        <span style={{ color: '#858585', fontSize: '10px', alignSelf: 'center' }}>
          {logEntries.length} logs
        </span>
      </div>
      <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
        {logEntries.map((entry, i) => (
          <div key={i} style={{ marginBottom: '4px', paddingBottom: '4px', borderBottom: '1px solid #333' }}>
            {entry.message}
          </div>
        ))}
      </div>
    </div>
  );
};
