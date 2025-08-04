import { useState, useEffect } from "react";
import {
  SquareTerminal,
  Columns,
  Trash2,
  Info,
  ChevronRight,
  ChevronDown
} from "lucide-react";

import { Button } from "../../components/ui/button";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Separator } from "../../components/ui/separator";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "../../components/ui/tooltip";

type TerminalTab = {
  id: number;
  name: string;
  startTime: number;
  groupId: number;
};

interface SidebarProps {
  terminals: TerminalTab[];
  selectedTerminal: number;
  onSelect: (id: number) => void;
  onAdd: (groupId?: number) => void;
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
  const [width, setWidth] = useState(220);
  const [isResizing, setIsResizing] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<number[]>([]);

  const startResizing = () => setIsResizing(true);
  const stopResizing = () => setIsResizing(false);

  const handleResizing = (e: MouseEvent) => {
    if (isResizing) {
      const newWidth = Math.max(180, Math.min(e.clientX, window.innerWidth - 200));
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

  const toggleGroup = (groupId: number) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  const renderTerminalGroups = () => {
    const groups = terminals.reduce((acc, terminal) => {
      acc[terminal.groupId] = acc[terminal.groupId] || [];
      acc[terminal.groupId].push(terminal);
      return acc;
    }, {} as Record<number, TerminalTab[]>);

    return Object.entries(groups).map(([groupIdStr, groupTerminals]) => {
      const groupId = parseInt(groupIdStr);
      const expanded = expandedGroups.includes(groupId);

      return (
        <div key={groupId} className="pb-2">
          <div
            onClick={() => toggleGroup(groupId)}
            className="flex items-center px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-primary"
          >
            {expanded ? <ChevronDown className="w-4 h-4 mr-1" /> : <ChevronRight className="w-4 h-4 mr-1" />}
            Group {groupId}
          </div>

          {expanded &&
            groupTerminals.map((terminal) => (
              <div
                key={terminal.id}
                onClick={() => onSelect(terminal.id)}
                className={`flex items-center justify-between px-3 py-2 text-sm rounded-md cursor-pointer transition-colors ${selectedTerminal === terminal.id
                  ? "bg-muted text-primary"
                  : "hover:bg-muted/60"
                  }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <SquareTerminal className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="truncate">{terminal.name}</span>
                </div>

                <div className="flex gap-1 ml-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAdd(terminal.groupId);
                          }}
                        >
                          <Columns className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Split</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(terminals.findIndex((t) => t.id === terminal.id));
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            showAlert("This feature is coming soon!");
                          }}
                        >
                          <Info className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Info</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            ))}

          <Separator className="my-2" />
        </div>
      );
    });
  };

  return (
    <div className="relative bg-background border-r border-border" style={{ width }}>
      <ScrollArea className="h-full">
        <aside className="px-1 pt-2">{renderTerminalGroups()}</aside>
      </ScrollArea>

      <div
        onMouseDown={startResizing}
        className="absolute top-0 right-0 h-full w-1 cursor-col-resize z-50 bg-transparent hover:bg-border"
      />
    </div>
  );
}
