import { useState } from "react";
import { Button } from "../components/ui/button";
import MatrixTyping from "../components/ui/matrixTyping";
import logo from "../assets/logos/v2.0.1_logo_amsel_black_orange_beak.png";
//import { DockerBuild, RunDockerContainer } from "../../wailsjs/go/main/App";
import warnings from "../constants/warnings";
import { useNavigate } from "react-router-dom";
//import { SidebarProvider, SidebarTrigger } from "./components/ui/sidebar"
//import { AppSidebar } from "./components/app-sidebar";

// npx shadcn@latest add avatar
// npx shadcn@latest add hover-card
// npx shadcn@latest add navigation-menu
// npx shadcn@latest add progress
// npx shadcn@latest add sheet
// npx shadcn@latest add sidebar
// npx shadcn@latest add tooltip
// Dark Mode https://ui.shadcn.com/docs/dark-mode


/*
  {startHackingActive && showOutput && (
    <pre className="mb-6 w-3/4 max-h-64 overflow-auto bg-black text-green-400 p-4 rounded-md font-mono whitespace-pre-wrap">
      {output}
    </pre>
  )}  */



function Landing() {
  //const [output, setOutput] = useState<string>("");
  const [showOutput, setShowOutput] = useState(false);
  const [startHackingActive, setStartHackingActive] = useState(false);
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/app"); // ← Hier navigierst du zur App
  };



const stopHacking = () => {
  setStartHackingActive(false);
  setShowOutput(false); 
}

  /*const handleOpenTerminalClick = async () => {
    const navigate = useNavigate();
    setStartHackingActive(true);
    setShowOutput(true);
    setOutput("Building Docker image...\n");
    try {
      const buildOutput = await DockerBuild();
      setOutput((prev) => prev + buildOutput + "\n");
      console.log("Docker build output:", buildOutput);

      setOutput((prev) => prev + buildOutput.toLowerCase() + "\n");

      const lowered = buildOutput.toLowerCase();
      if (
        lowered.includes("naming to docker") ||
        lowered.includes("successfully tagged")
      ) {
        setOutput((prev) => prev + "Build successful, running container...\n");
        await RunDockerContainer();
      } else {
        setOutput((prev) => prev + "Build might have failed, not running container.\n");
      }
    } catch (err) {
      setOutput("Error: " + err + "\n");
      console.error(err);
    }
  }; */

  return (

        /*<SidebarProvider>
      <AppSidebar />
      <main>
<SidebarTrigger /> */
      <div className="min-w-[320px] h-screen flex flex-col items-center justify-center bg-gray-900 relative overflow-hidden px-4">
        <div>
          <img
            src={logo}
            alt="Small Hacker Cat Logo"
    className={`absolute top-0 left-0 w-24 h-auto transition-all duration-700 ease-in-out
      ${startHackingActive ? "opacity-100 translate-x-0 translate-y-0" : "opacity-0 translate-x-20 translate-y-20"}`}
     // className="absolute top-0 left-0 w-24 h-auto"

  />
  </div>

  

  <div className="relative w-[32rem] h-[32rem] mb-6">
  {/* Big Hacker Cat */}
  <img
    src={logo}
    alt="Big Hacker Cat"
    className={`absolute top-0 left-0 w-[32rem] h-auto transition-all duration-700 ease-in-out
      ${startHackingActive ? "opacity-0 -translate-x-20 -translate-y-20" : "opacity-100 translate-x-0 translate-y-0"}`}
  />

</div>


  {/* Buttons */}
  {!startHackingActive && (
  <div className="flex space-x-4 mb-6">
    <Button
      onClick={handleStart}
      className="bg-gray-800 border border-green-500 text-green-400 px-6 py-3 font-mono tracking-widest uppercase shadow-md hover:bg-green-500 hover:text-black transition-all duration-200 rounded-none"
    >
      Start Hacking
    </Button>

  </div>
  )}

  {/* Stop Hacking button */}
{startHackingActive && (
    <div className="flex space-x-4 mb-6">
    <Button
      onClick={stopHacking}
      className="bg-gray-800 border border-red-500 text-green-400 px-6 py-3 font-mono tracking-widest uppercase shadow-md hover:bg-green-500 hover:text-black transition-all duration-200 rounded-none"
    >
      Stop Hacking
    </Button>

  </div>
)}

  <div
    className={`w-full flex justify-center transition-all duration-300 ${
      showOutput ? "h-24" : "h-48"
    }`}
    style={{ overflow: "hidden" }}
  >
    <MatrixTyping
      messages={warnings}
      typingSpeed={100}
      pauseBeforeScroll={1500}
      deleteSpeed={10}
      deleteDirection="left"
    />
  </div>
</div>


     // </main>
    //</SidebarProvider>




  );
}

export default Landing;
