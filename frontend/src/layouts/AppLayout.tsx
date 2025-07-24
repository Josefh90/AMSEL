import { SidebarProvider, SidebarTrigger } from "../components/ui/sidebar"
import { AppSidebar } from "../components/app-sidebar"
//import { Outlet } from "react-router-dom"; // <- wichtig!
 
export default function AppLayout() {
  return (
    <div className="flex h-screen bg-gray-900 text-white border-none">
    <SidebarProvider>
      <AppSidebar />
      <main>
        <SidebarTrigger />
      
      </main>
    </SidebarProvider>
    </div>
  )
}