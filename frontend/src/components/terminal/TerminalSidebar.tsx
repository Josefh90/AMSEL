import { useState, useEffect } from "react";
import { SquareTerminal, Columns, Trash2 } from "lucide-react";
import { TerminalTimer } from "./TerminalInstance";

type TerminalTab = {
  id: number;
  name: string;
  startTime: number;
};

interface SidebarProps {
  terminals: TerminalTab[];
  selectedTerminal: number;
  onSelect: (index: number) => void;
  onAdd: (index?: number) => void; // Allow optional index to split at specific position
  onDelete: (index: number) => void;
}

export function TerminalSidebar({
  terminals,
  selectedTerminal,
  onSelect,
  onAdd,
  onDelete,
}: SidebarProps) {
  const [width, setWidth] = useState(200);
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = () => setIsResizing(true);
  const stopResizing = () => setIsResizing(false);

  const handleResizing = (e: MouseEvent) => {
    if (isResizing) {
      const newWidth = Math.max(150, Math.min(e.clientX, window.innerWidth - 200));
      setWidth(newWidth);
    }
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleResizing(e);
    const onMouseUp = () => stopResizing();

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isResizing]);

  return (
    <div className="relative" style={{ width }}>
      <aside
        className="h-full border-l border-neutral-800 bg-[#252526] text-white text-sm overflow-y-auto"
        style={{ width }}
      >
        {terminals.map((terminal, idx) => (
          <div
            key={terminal.id}
            onClick={() => onSelect(idx)}
            className={`px-3 py-2 cursor-pointer flex flex-col transition-colors border-b border-neutral-800 ${selectedTerminal === idx
              ? "bg-neutral-700 text-amselblue"
              : "hover:bg-neutral-700"
              }`}
          >
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-2 overflow-hidden">
                <SquareTerminal className="w-4 h-4 shrink-0" />
                <span className="truncate">{terminal.name}</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAdd(idx); // Split at this terminal index
                  }}
                  title="Split"
                  className="hover:text-white text-neutral-400"
                >
                  <Columns className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(idx);
                  }}
                  title="Close"
                  className="hover:text-red-400 text-neutral-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="text-xs text-neutral-400">
              <TerminalTimer startTime={terminal.startTime} />
            </div>
          </div>
        ))}
      </aside>

      <div
        onMouseDown={startResizing}
        className="absolute top-0 left-0 h-full w-1 cursor-col-resize z-50 bg-transparent hover:bg-neutral-700"
        style={{ left: `calc(100% - 1px)` }}
      />
    </div>
  );
}
