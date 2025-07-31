import { useState } from "react";

export interface TerminalTab {
    id: number;
    name: string;
    startTime: number; // Track start time for elapsed time display
}

export function useTerminalManager() {
    const [terminals, setTerminals] = useState<TerminalTab[]>([
        { id: 1, name: "Terminal 1", startTime: Date.now() },
    ]);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const addTerminal = () => {
        setTerminals((prev) => {
            const nextId = prev.length ? prev[prev.length - 1].id + 1 : 1;
            const newTerm: TerminalTab = {
                id: nextId,
                name: `Terminal ${nextId}`,
                startTime: Date.now()
            };
            setSelectedIndex(prev.length);
            return [...prev, newTerm];
        });
    };

    const removeTerminal = (index: number) => {
        if (terminals.length === 1) return;
        setTerminals((prev) => {
            const updated = prev.filter((_, i) => i !== index);
            setSelectedIndex((prevSelected) =>
                prevSelected >= updated.length ? updated.length - 1 : prevSelected
            );
            return updated;
        });
    };



    return {
        terminals,
        selectedIndex,
        setSelectedIndex,
        addTerminal,
        removeTerminal,
    };
}
