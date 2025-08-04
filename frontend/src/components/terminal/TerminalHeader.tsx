import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "../../components/ui/dropdown-menu";
import { Button } from "../../components/ui/button";
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
    TooltipProvider,
} from "../../components/ui/tooltip";

import { ChevronDown, Minimize2, X, Plus } from "lucide-react";
import { useTerminal } from "./context/TerminalContext";

export function TerminalHeader() {
    const { addTerminal, hideTerminal } = useTerminal();

    return (
        <div className="flex items-center justify-between px-2 py-1 border-b border-border bg-muted text-sm h-7">
            {/* Label */}
            <div className="px-2 py-[2px] rounded bg-background font-semibold text-xs tracking-tight leading-none text-muted-foreground">
                Shellbird
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
                <TooltipProvider>
                    {/* Add Button */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                onClick={() => addTerminal()}
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-primary border border-border"
                            >
                                <Plus className="w-4 h-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Neues Terminal</TooltipContent>
                    </Tooltip>

                    {/* Dropdown */}
                    <DropdownMenu>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-muted-foreground hover:text-primary border border-border"
                                    >
                                        <ChevronDown className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                            </TooltipTrigger>
                            <TooltipContent>Mehr Optionen</TooltipContent>
                        </Tooltip>

                        <DropdownMenuContent
                            side="bottom"
                            align="end"
                            className="z-50 w-40"
                        >
                            <DropdownMenuItem onClick={() => addTerminal()}>
                                Split Terminal
                            </DropdownMenuItem>
                            <DropdownMenuItem disabled>
                                Rename (coming soon)
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Minimize Button (placeholder logic) */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-primary border border-border"
                            >
                                <Minimize2 className="w-4 h-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Minimieren</TooltipContent>
                    </Tooltip>

                    {/* Close Button */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                onClick={hideTerminal}
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-destructive border border-border"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Schließen</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    );
}
