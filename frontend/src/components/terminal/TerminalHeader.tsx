import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "../ui/dropdown-menu";

import { ChevronDown, Minimize2, X, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { useTerminalManager } from "./hooks/useTerminalManager";
//import { useTerminal } from "./context/TerminalContext";

export function TerminalHeader() {
    // const { isVisible, hideTerminal } = useTerminal();
    const {
        addTerminal,
    } = useTerminalManager();


    return (
        <div className="flex items-center justify-between text-sm bg-[#2d2d2d] text-white px-3 py-[2px] border-b border-neutral-700 h-8">
            {/* Terminal Label */}
            <div className="px-2 py-[1px] rounded-t bg-[#1e1e1e] font-semibold text-xs leading-tight">
                Shellbird
                {/* <Button onClick={hideTerminal}>Close</Button> */}
            </div>

            {/* Button-Gruppe */}
            <div className="flex items-center space-x-1">
                {/* Kombinierter Button */}
                <div className="flex">
                    <Button
                        onClick={addTerminal}
                        variant="ghost"
                        size="icon"
                        className="rounded-r-none hover:text-amselblue transition-colors border border-neutral-700 h-6 w-6"
                        title="Neues Terminal öffnen"
                    >
                        <Plus className="w-4 h-4" />
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-l-none -ml-px hover:text-amselblue transition-colors border border-neutral-700 h-6 w-6"
                                title="Mehr Optionen"
                            >
                                <ChevronDown className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            side="bottom"
                            align="end"
                            className="z-50 bg-[#1e1e1e] text-white border border-neutral-700 rounded shadow-md"
                        >
                            <DropdownMenuItem
                                className="hover:bg-neutral-800 cursor-pointer"
                                onClick={addTerminal}
                            >
                                Split Terminal
                            </DropdownMenuItem>
                            <DropdownMenuItem className="hover:bg-neutral-800 cursor-pointer">
                                Rename (coming soon)
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Weitere Buttons */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="hover:text-amselblue transition-colors border border-neutral-700 h-6 w-6"
                    title="Minimieren"
                >
                    <Minimize2 className="w-4 h-4" />
                </Button>

                <Button
                    /* onClick={() => hideTerminal()} */
                    variant="ghost"
                    size="icon"
                    className="hover:text-amselblue transition-colors border border-neutral-700 h-6 w-6"
                    title="Terminal schließen"
                >
                    <X className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}