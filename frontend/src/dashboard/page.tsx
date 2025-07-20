import { AppSidebar } from "../components/app-sidebar"
import { useState } from "react"
//mport { ChartAreaInteractive } from "../components/chart-area-interactive"
//import { DataTable } from "../components/data-table"
import { SectionCards } from "../components/section-cards"
import { SiteHeader } from "../components/site-header"
import TargetMachineInfo from "../components/section-targetMaschineInfo"
import TerminalOutput from "../components/util-terminalOutput"; // Adjust path if needed
import {
  SidebarInset,
  SidebarProvider,
} from "../components/ui/sidebar"

//import data from "./data.json"


export default function Page() {
    const [terminalOutput, setTerminalOutput] = useState("")
  return (
    <SidebarProvider 
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar  variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col bg-black ">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="p-6">
                <TargetMachineInfo setTerminalOutput={setTerminalOutput} />
              </div>
              <SectionCards />
            </div>
            <div className="p-6">
              <TerminalOutput output={terminalOutput} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
