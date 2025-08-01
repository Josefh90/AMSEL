import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "../ui/dropdown-menu";

import { ChevronDown, Minimize2, X, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { useTerminal } from "./context/TerminalContext"; // ✅ Use context

export function TerminalHeader() {
    const {
        addTerminal,
        hideTerminal, // ✅ Optional: implement hide on "X" or minimize if needed
    } = useTerminal();

    return (
        <div className="flex items-center justify-between text-sm bg-[#2d2d2d] text-white px-3 py-[2px] border-b border-neutral-700 h-8">
            {/* Terminal Label */}
            <div className="px-2 py-[1px] rounded-t bg-[#1e1e1e] font-semibold text-xs leading-tight">
                Shellbird
            </div>

            {/* Button Group */}
            <div className="flex items-center space-x-1">
                <div className="flex">
                    {/* Add Terminal Button */}
                    <Button
                        onClick={() => addTerminal()} // ✅ opens new tab at end
                        variant="ghost"
                        size="icon"
                        className="rounded-r-none hover:text-amselblue transition-colors border border-neutral-700 h-6 w-6"
                        title="Neues Terminal öffnen"
                    >
                        <Plus className="w-4 h-4" />
                    </Button>

                    {/* Dropdown Menu */}
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
                                onClick={() => addTerminal()} // same function, but could also be customized
                            >
                                Split Terminal
                            </DropdownMenuItem>
                            <DropdownMenuItem className="hover:bg-neutral-800 cursor-pointer">
                                Rename (coming soon)
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Minimize Button (optional logic) */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="hover:text-amselblue transition-colors border border-neutral-700 h-6 w-6"
                    title="Minimieren"
                // onClick={() => hideTerminal()} // Add logic if needed
                >
                    <Minimize2 className="w-4 h-4" />
                </Button>

                {/* Close Button */}
                <Button
                    onClick={hideTerminal}
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
