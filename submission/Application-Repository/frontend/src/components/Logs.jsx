export default function Logs({ logs }) {
  if (!logs || logs.length === 0) return <p className="text-gray-500 text-sm italic">No logs available.</p>;

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden font-mono text-sm shadow-inner border border-gray-800">
      <div className="bg-gray-800 px-4 py-2 text-gray-400 text-xs border-b border-gray-700 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
        </div>
        <span className="ml-2">worker-execution.log</span>
      </div>
      <div className="p-4 max-h-64 overflow-y-auto">
        <ul className="space-y-1.5">
          {logs.map((log, index) => {
            let colorClass = 'text-gray-300';
            if (log.toLowerCase().includes('error') || log.toLowerCase().includes('failed')) colorClass = 'text-red-400';
            else if (log.toLowerCase().includes('completed') || log.toLowerCase().includes('success')) colorClass = 'text-green-400';
            else if (log.toLowerCase().includes('started') || log.toLowerCase().includes('running')) colorClass = 'text-blue-400';

            return (
              <li key={index} className="flex">
                <span className="text-gray-600 select-none w-8 text-right pr-3">{index + 1}</span>
                <span className={colorClass}>{log}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
