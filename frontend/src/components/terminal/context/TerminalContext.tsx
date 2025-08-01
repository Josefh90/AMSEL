// src/components/terminal/TerminalContext.tsx
import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

export type TerminalTab = {
    id: number;
    name: string;
    startTime: number,
    parentId: number | null;
    // hier kannst du bei Bedarf weitere Props hinzufügen
};

type TerminalContextType = {
    terminals: TerminalTab[];
    selectedTerminal: number;
    height: number;
    isVisible: boolean;

    // Aktionen / Setter
    addTerminal: () => void;
    removeTerminal: (index: number) => void;
    selectTerminal: (index: number) => void;
    setHeight: (height: number) => void;
    setIsVisible: (visible: boolean) => void;
    hideTerminal: () => void;
    showTerminal: () => void;
    showAlert: (message: string) => void; // Optional: Alert-Funktion
    // splitTerminal: (index: number) => void; // Funktion zum Aufteilen eines Terminals
};

const TerminalContext = createContext<TerminalContextType | undefined>(undefined);



export function useTerminal() {
    const context = useContext(TerminalContext);
    if (!context) {
        throw new Error("useTerminal must be used within a TerminalProvider");
    }
    return context;
}

export function TerminalProvider({ children }: { children: ReactNode }) {
    const [terminals, setTerminals] = useState<TerminalTab[]>([
        {
            id: 1,
            name: "Terminal 1",
            startTime: Date.now(),
            parentId: null,
        },
    ]);
    const [selectedTerminal, setSelectedTerminal] = useState(0);
    const [height, setHeight] = useState(300);
    const [isVisible, setIsVisible] = useState(true);

    const hideTerminal = () => setIsVisible(false);
    const showTerminal = () => setIsVisible(true);

    const showAlert = (message: string) => {
        window.alert(message);
    };

    const addTerminal = (parentIndex?: number) => {
        setTerminals((prev) => {

            const nextId = prev.length ? Math.max(...prev.map(t => t.id)) + 1 : 1;

            const parentTerminal = parentIndex !== undefined ? prev[parentIndex] : undefined;
            const newTerminal: TerminalTab = {
                id: nextId,
                name: `Terminal ${nextId}`,
                startTime: Date.now(),
                parentId: parentTerminal?.id ?? null,
            };

            return [...prev, newTerminal];
        });

        setSelectedTerminal(terminals.length); // You may adjust selection logic
    };


    const removeTerminal = (index: number) => {
        setTerminals((prev) => {
            const toRemove = prev[index];
            const parentId = toRemove.parentId;

            const updated = prev
                .filter((_, i) => i !== index)
                .map((t) =>
                    t.parentId === toRemove.id
                        ? { ...t, parentId } // reparent children
                        : t
                );

            return updated;
        });

        setSelectedTerminal(0);
    };

    const selectTerminal = (index: number) => {
        setSelectedTerminal(index);
    };

    return (
        <TerminalContext.Provider
            value={{
                terminals,
                selectedTerminal,
                height,
                isVisible,
                addTerminal,
                removeTerminal,
                selectTerminal,
                setHeight,
                setIsVisible,
                hideTerminal,
                showTerminal,
                showAlert


            }}
        >
            {children}
        </TerminalContext.Provider>
    );
}
