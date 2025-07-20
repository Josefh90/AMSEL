import { useState } from "react";
import { cn } from "../lib/utils"; 

type Props = {
  output: string
}

export default function TerminalOutput({ output }: Props) {
  const [minimized, setMinimized] = useState(false);

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 w-[600px] max-w-full rounded-xl shadow-lg border border-gray-700 bg-[#1e1e1e] text-green-400 text-sm z-50 transition-all duration-300",
        minimized ? "h-10 overflow-hidden" : "max-h-[50vh] overflow-auto"
      )}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] text-white font-semibold text-sm">
        <span>Terminal Output</span>
        <button
          onClick={() => setMinimized(!minimized)}
          className="text-gray-400 hover:text-white"
        >
          {minimized ? "▲" : "▼"}
        </button>
      </div>

      {/* Terminal Content */}
      {!minimized && (
        <pre className="px-4 py-2 whitespace-pre-wrap">{output}</pre>
      )}
    </div>
  );
}
