import { AppSidebar } from "../components/app-sidebar"
//import { useState } from "react"
//mport { ChartAreaInteractive } from "../components/chart-area-interactive"
//import { DataTable } from "../components/data-table"
import { SectionCards } from "../components/section-cards"
import { SiteHeader } from "../components/site-header"
import { useEffect, useState, useRef } from "react"

//import TargetMachineInfo from "../components/section-targetMaschineInfo"

import { TerminalInstance } from "../components/terminal";
import { TerminalProvider } from "../components/terminal/context/TerminalContext"
//import { useNavigate } from 'react-router-dom';
import {
  SidebarInset,
  SidebarProvider,

} from "../components/ui/sidebar"




export default function Page() {
  const [sidebarWidth, setSidebarWidth] = useState(288);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sidebarRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.contentRect) {
          setSidebarWidth(entry.contentRect.width);
        }
      }
    });

    observer.observe(sidebarRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      {/* Sidebar mit Ref */}
      <div ref={sidebarRef}>
        <AppSidebar ref={sidebarRef} variant="inset" />
      </div>

      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col bg-black">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="p-6">{/* ... */}</div>
              <SectionCards />
            </div>
            <div className="flex flex-1 flex-col gap-4 p-4">

            </div>


            {/* Terminal mit dynamischer Left-Position */}
            <div

            >
              <TerminalProvider>
                <TerminalInstance sidebarWidth={sidebarWidth} />
              </TerminalProvider>

            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

