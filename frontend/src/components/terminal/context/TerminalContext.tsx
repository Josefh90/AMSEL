// src/components/terminal/TerminalContext.tsx
import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

export type TerminalTab = {
    id: number;
    name: string;
    startTime: number,
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
    const [terminals, setTerminals] = useState<TerminalTab[]>([{ id: 1, name: "Terminal 1", startTime: Date.now() }]);
    const [selectedTerminal, setSelectedTerminal] = useState(0);
    const [height, setHeight] = useState(300);
    const [isVisible, setIsVisible] = useState(true);

    const hideTerminal = () => setIsVisible(false);
    const showTerminal = () => setIsVisible(true);

    const addTerminal = () => {
        setTerminals((prev) => {
            const newId = prev.length ? prev[prev.length - 1].id + 1 : 1;
            const newTerm: TerminalTab = {
                id: newId,
                name: `Terminal ${newId}`,
                startTime: Date.now(), // Set start time to current timestamp
            };
            return [...prev, newTerm];
        });
        setSelectedTerminal(terminals.length);
    };



    const removeTerminal = (index: number) => {
        setTerminals((prev) => {
            if (prev.length === 1) return prev;
            const newList = prev.filter((_, i) => i !== index);
            return newList;
        });

        setSelectedTerminal((prevSelected) => (prevSelected === index ? 0 : prevSelected));
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
            }}
        >
            {children}
        </TerminalContext.Provider>
    );
}
