import { Button } from "../components/ui/button"
import { Separator } from "../components/ui/separator"
import { SidebarTrigger } from "../components/ui/sidebar"
import { NavActions } from "../components/nav-actions"

export function SiteHeader() {
  return (
    /*  flex                        Use flexbox layout (horizontal row) 
        h-[--header-height]         Height set to CSS variable --header-height 
        shrink-0                    Prevent shrinking when space is tight 
        items-center                Vertically center items 
        gap-2                       Gap of 0.5rem (8px) between flex children 
        border-b                    Bottom border 
        transition-[width,height]   Animate changes in width and height 
        ease-linear                 Linear timing function for transitions 
        group-has-data-[collapsible=icon]/sidebar-wrapper:h-[--header-height]  if parent sidebar-wrapper has data-collapsible="icon", 
                                                                               set height to --header-height 
        rounded-none                No rounded corners
    */
    <header className="flex h-[--header-height] shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-[--header-height] ">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6 ">
        <SidebarTrigger className="-ml-1 text-white" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">Dashboard</h1>
        <div className="ml-auto flex items-center gap-2">
                    <div className="ml-auto px-3">
           
          </div>
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex rounded-none">
            <a
              href="https://github.com/Josefh90"
              rel="noopener noreferrer"
              target="_blank"
              className="text-white"
            >
              GitHub
            </a>
          </Button>
                  <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
           <NavActions />
        </div>
      </div>
    </header>
  )
}
