import React, { useState, useRef } from "react";
import { SquareTerminal, Trash2, Columns, PictureInPicture2 } from "lucide-react";

interface TerminalData {
  id: number;
  name: string;
  // track popup window reference
  popupWindow?: Window | null;
  startTime?: number; // optional, for tracking start time

}

export function TerminalSplit({ terminalCount }: { terminalCount: number }) {
  const [terminals, setTerminals] = useState<TerminalData[]>([
    {
      id: terminalCount,
      name: "Terminal " + terminalCount,
      startTime: Date.now(),
    },
  ]);
  const [widths, setWidths] = useState<number[]>([100]);

  const draggingIndex = useRef<number | null>(null);
  const startX = useRef(0);
  const startWidths = useRef<number[]>([]);

  // Open popup window for terminal at idx
  function popOutTerminal(idx: number) {
    setTerminals((prev) => {
      const term = prev[idx];
      // If popup already open and not closed, focus it
      if (term.popupWindow && !term.popupWindow.closed) {
        term.popupWindow.focus();
        return prev;
      }
      // Open new popup window
      const popup = window.open(
        "",
        `TerminalPopup_${term.id}`,
        "width=600,height=400,left=200,top=200"
      );

      if (popup) {
        // Write initial HTML content into popup
        popup.document.title = term.name;
        popup.document.body.style.background = "#1e1e1e";
        popup.document.body.style.color = "white";
        popup.document.body.style.fontFamily = "monospace";
        popup.document.body.style.margin = "0";
        popup.document.body.style.padding = "10px";
        popup.document.body.innerText = `[${term.name} terminal content here]`;

        // Optional: handle popup unload (closed by user)
        popup.addEventListener("beforeunload", () => {
          setTerminals((current) => {
            const updated = [...current];
            updated[idx] = { ...updated[idx], popupWindow: null };
            return updated;
          });
        });

        // Save popup reference in terminal object
        const updatedTerminals = [...prev];
        updatedTerminals[idx] = { ...term, popupWindow: popup };
        return updatedTerminals;
      }

      return prev; // popup failed to open (popup blocker?)
    });
  }

  function splitTerminal(atIndex: number) {
    setTerminals((prev) => {
      const newId = prev.length ? prev[prev.length - 1].id + 1 : 1;
      const newTerm = { id: newId, name: `Terminal ${newId}` };
      const newList = [...prev];
      newList.splice(atIndex + 1, 0, newTerm);

      const newCount = newList.length;
      setWidths(Array(newCount).fill(100 / newCount));

      return newList;
    });
  }

  function removeTerminal(idx: number) {
    setTerminals((prev) => {
      if (prev.length === 1) return prev;
      // Close popup if open
      if (prev[idx].popupWindow && !prev[idx].popupWindow?.closed) {
        prev[idx].popupWindow.close();
      }
      const newList = prev.filter((_, i) => i !== idx);

      const newCount = newList.length;
      setWidths(Array(newCount).fill(100 / newCount));

      return newList;
    });
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
    if (leftWidth < minWidth) {
      leftWidth = minWidth;
      rightWidth = startWidths.current[idx] + startWidths.current[idx + 1] - minWidth;
    } else if (rightWidth < minWidth) {
      rightWidth = minWidth;
      leftWidth = startWidths.current[idx] + startWidths.current[idx + 1] - minWidth;
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
      {/* Terminal split container */}
      <div
        className="flex flex-row flex-grow relative overflow-hidden"
        style={{ height: "calc(100% - 40px)" }}
      >
        {terminals.map((term, i) => (
          <React.Fragment key={term.id}>
            {/* Terminal panel */}
            <div
              className="relative flex flex-col bg-[#252526] border-r border-neutral-700 overflow-auto"
              style={{ width: `${widths[i]}%`, minWidth: "10%" }}
            >
              {/* Terminal header */}
              <div className="flex items-center justify-between px-2 py-1 border-b border-neutral-800">
                <div className="flex items-center gap-2 min-w-0">
                  <SquareTerminal className="w-4 h-4 shrink-0" />
                  <span className="truncate">{term.name}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => splitTerminal(i)}
                    title="Split Terminal"
                    className="p-1 hover:text-amselblue"
                    aria-label={`Split ${term.name}`}
                    type="button"
                  >
                    <Columns className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeTerminal(i)}
                    title="Delete Terminal"
                    className="p-1 hover:text-red-500"
                    aria-label={`Delete ${term.name}`}
                    type="button"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {/* Pop Out Button */}
                  <button
                    onClick={() => popOutTerminal(i)}
                    title="Pop Out Terminal"
                    className="p-1 hover:text-green-400"
                    aria-label={`Pop Out ${term.name}`}
                    type="button"
                  >
                    {/* You can use any icon here, using SquareTerminal for simplicity */}
                    <PictureInPicture2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Terminal content placeholder */}
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

            {/* Splitter bar (except after last terminal) */}
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
