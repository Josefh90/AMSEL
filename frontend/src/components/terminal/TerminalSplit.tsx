// src/components/terminal/TerminalSplit.tsx

import React, { useEffect, useRef, useState } from "react";
import { SquareTerminal, Trash2, PictureInPicture2 } from "lucide-react";
import { useTerminal } from "./context/TerminalContext";

export function TerminalSplit() {
  const { terminals, removeTerminal } = useTerminal();

  const [widths, setWidths] = useState<number[]>([]);

  const draggingIndex = useRef<number | null>(null);
  const startX = useRef(0);
  const startWidths = useRef<number[]>([]);

  // Initialize widths when terminals change
  useEffect(() => {
    if (terminals.length > 0) {
      setWidths(Array(terminals.length).fill(100 / terminals.length));
    }
  }, [terminals.length]);

  function popOutTerminal(idx: number) {
    const term = terminals[idx];

    if ((term as any).popupWindow && !(term as any).popupWindow.closed) {
      (term as any).popupWindow.focus();
      return;
    }

    const popup = window.open(
      "",
      `TerminalPopup_${term.id}`,
      "width=600,height=400,left=200,top=200"
    );

    if (popup) {
      popup.document.title = term.name;
      popup.document.body.style.background = "#1e1e1e";
      popup.document.body.style.color = "white";
      popup.document.body.style.fontFamily = "monospace";
      popup.document.body.style.margin = "0";
      popup.document.body.style.padding = "10px";
      popup.document.body.innerText = `[${term.name} terminal content here]`;

      popup.addEventListener("beforeunload", () => {
        // You could add logic here to update state if you store popupWindow
      });
    }
  }

  function onMouseDownSplitter(e: React.MouseEvent, idx: number) {
    draggingIndex.current = idx;
    startX.current = e.clientX;
    startWidths.current = [...widths];

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }

  function onMouseMove(e: MouseEvent) {
    if (draggingIndex.current === null) return;

    const deltaX = e.clientX - startX.current;
    const idx = draggingIndex.current;

    const deltaPercent = (deltaX / window.innerWidth) * 100;

    let leftWidth = startWidths.current[idx] + deltaPercent;
    let rightWidth = startWidths.current[idx + 1] - deltaPercent;

    const minWidth = 10;
    const total = startWidths.current[idx] + startWidths.current[idx + 1];

    if (leftWidth < minWidth) {
      leftWidth = minWidth;
      rightWidth = total - minWidth;
    } else if (rightWidth < minWidth) {
      rightWidth = minWidth;
      leftWidth = total - minWidth;
    }

    const newWidths = [...startWidths.current];
    newWidths[idx] = leftWidth;
    newWidths[idx + 1] = rightWidth;

    setWidths(newWidths);
  }

  function onMouseUp() {
    draggingIndex.current = null;
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  }

  return (
    <div className="flex flex-col h-full w-full bg-[#1e1e1e] text-white select-none">
      <div
        className="flex flex-row flex-grow relative overflow-hidden"
        style={{ height: "calc(100% - 40px)" }}
      >
        {terminals.map((term, i) => (
          <React.Fragment key={term.id}>
            <div
              className="relative flex flex-col bg-[#252526] border-r border-neutral-700 overflow-auto"
              style={{ width: `${widths[i]}%`, minWidth: "10%" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-2 py-1 border-b border-neutral-800">
                <div className="flex items-center gap-2 min-w-0">
                  <SquareTerminal className="w-4 h-4 shrink-0" />
                  <span className="truncate">{term.name}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => removeTerminal(i)}
                    title="Delete Terminal"
                    className="p-1 hover:text-red-500"
                    aria-label={`Delete ${term.name}`}
                    type="button"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => popOutTerminal(i)}
                    title="Pop Out Terminal"
                    className="p-1 hover:text-green-400"
                    aria-label={`Pop Out ${term.name}`}
                    type="button"
                  >
                    <PictureInPicture2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-grow p-2 text-sm overflow-auto text-neutral-300">
                <div
                  style={{
                    background: "#1e1e1e",
                    height: "100%",
                    borderRadius: 4,
                    padding: 8,
                    fontFamily: "monospace",
                    whiteSpace: "pre-wrap",
                    overflowY: "auto",
                  }}
                >
                  {`[${term.name} terminal content here]`}
                </div>
              </div>
            </div>

            {/* Resizable splitter bar */}
            {i < terminals.length - 1 && (
              <div
                onMouseDown={(e) => onMouseDownSplitter(e, i)}
                className="w-1 cursor-col-resize bg-neutral-700 hover:bg-amselblue transition-colors"
                style={{ userSelect: "none" }}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
