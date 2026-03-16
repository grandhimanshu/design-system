import React from 'react';
import { Button } from '@/index';

interface DebugLog {
  message: string;
  timestamp: number;
}

export const ComboboxDebugLogPanel = () => {
  const [logs, setLogs] = React.useState<DebugLog[]>([]);
  const logsEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Register global debug log function
    (window as any).addDebugLog = (message: string) => {
      const timestamp = Date.now();
      setLogs((prev) => [...prev, { message, timestamp }]);
      console.log(`[COMBOBOX DEBUG ${new Date(timestamp).toISOString()}]`, message);
    };

    return () => {
      delete (window as any).addDebugLog;
    };
  }, []);

  React.useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const clearLogs = () => setLogs([]);

  const copyLogs = () => {
    const logText = logs.map((log) => log.message).join('\n');
    navigator.clipboard.writeText(logText);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        width: '400px',
        maxHeight: '500px',
        backgroundColor: 'white',
        border: '2px solid #333',
        borderRadius: '8px',
        padding: '12px',
        zIndex: 9999,
        fontFamily: 'monospace',
        fontSize: '11px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <strong style={{ fontSize: '13px' }}>Combobox Debug Logs</strong>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button size="tiny" onClick={copyLogs}>
            Copy
          </Button>
          <Button size="tiny" onClick={clearLogs}>
            Clear
          </Button>
        </div>
      </div>
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          backgroundColor: '#f5f5f5',
          padding: '8px',
          borderRadius: '4px',
          maxHeight: '420px',
        }}
      >
        {logs.length === 0 && <div style={{ color: '#999' }}>No logs yet...</div>}
        {logs.map((log, index) => (
          <div
            key={index}
            style={{
              marginBottom: '4px',
              paddingBottom: '4px',
              borderBottom: '1px solid #ddd',
              wordBreak: 'break-word',
            }}
          >
            {log.message}
          </div>
        ))}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
};
