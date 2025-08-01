import { useState, useEffect } from "react";
import { SquareTerminal, Columns, Trash2, CornerDownRight, Info } from "lucide-react";
//import { TerminalTimer } from "./TerminalInstance";

type TerminalTab = {
  id: number;
  name: string;
  startTime: number;
  parentId: number | null;
};

interface SidebarProps {
  terminals: TerminalTab[];
  selectedTerminal: number;
  onSelect: (index: number) => void;
  onAdd: (index?: number) => void; // Allow optional index to split at specific position
  onDelete: (index: number) => void;
  showAlert: (message: string) => void;
}

export function TerminalSidebar({
  terminals,
  selectedTerminal,
  onSelect,
  onAdd,
  onDelete,
  showAlert
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

  // 🔁 NEW: Recursive rendering of terminals
  function renderTerminalTree(terminals: TerminalTab[], parentId: number | null, level: number = 0) {
    return terminals
      .filter((t) => t.parentId === parentId)
      .map((terminal) => (
        <div key={terminal.id}>
          <div
            onClick={() => onSelect(terminal.id)}
            style={{ paddingLeft: `${level}px` }}
            className={`flex justify-between px-3 py-2 cursor-pointer border-b border-neutral-800 text-sm ${selectedTerminal === terminal.id
              ? "bg-neutral-700 text-amselblue"
              : "hover:bg-neutral-700"
              }`}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              {level > 0 && <CornerDownRight className="w-4 h-4 text-neutral-500" />}
              <SquareTerminal className="w-4 h-4 shrink-0" />
              <span className="truncate">{terminal.name}</span>
            </div>

            <div className="flex gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAdd(terminals.findIndex((t) => t.id === terminal.id));
                }}
                title="Split"
                className="text-neutral-400 hover:text-white"
              >
                <Columns className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(terminals.findIndex((t) => t.id === terminal.id));
                }}
                title="Close"
                className="text-neutral-400 hover:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  showAlert("This feature is coming soon!");
                }}
                title="Info"
                className="text-neutral-400 hover:text-white"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Recursively render children */}
          {renderTerminalTree(terminals, terminal.id, level + 1)}
        </div>
      ));
  }

  // ✅ REPLACE your existing return (...) with this
  return (
    <div className="relative" style={{ width }}>
      <aside className="h-full border-l border-neutral-800 bg-[#252526] text-white overflow-y-auto">
        {renderTerminalTree(terminals, null)}
      </aside>
      <div
        onMouseDown={startResizing}
        className="absolute top-0 left-0 h-full w-1 cursor-col-resize z-50 bg-transparent hover:bg-neutral-700"
        style={{ left: `calc(100% - 1px)` }}
      />
    </div>
  );
}
