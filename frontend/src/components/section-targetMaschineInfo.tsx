//import { useState } from "react";
import { Button } from "../components/ui/button";
import { DockerBuild, RunDockerContainer } from "../../wailsjs/go/app/App"; // Adjust if needed

type Props = {
   setTerminalOutput: React.Dispatch<React.SetStateAction<string>>
}

export default function TargetMachineInfo({ setTerminalOutput }: Props) {
 // const [showOutput, setShowOutput] = useState(false);
 // const [output, setOutput] = useState("");

  const StartBox = async () => {
   // setShowOutput(true);
    setTerminalOutput("Building Docker image...\n");
    try {
      const buildOutput = await DockerBuild(); // Pass an empty context or appropriate context object
      setTerminalOutput((prev) => prev + buildOutput + "\n");
      console.log("Docker build output:", buildOutput);

      const lowered = buildOutput.toLowerCase();
      if (
        lowered.includes("naming to docker") ||
        lowered.includes("successfully tagged")
      ) {
            setTerminalOutput((prev) => prev + "Build successful, running container...\n")
         await RunDockerContainer(); // ← Uncomment when implemented
         
      } else {
         setTerminalOutput((prev) => prev + "Build might have failed, not running container.\n")
      }
    } catch (err) {
      setTerminalOutput((prev) => prev + "Build might have failed, not running container.\n")
      console.error(err);
    }
  };



  return (
    <div className="rounded-lg overflow-hidden border border-black shadow">
      {/* Header */}
      <div className="bg-red-700 text-white font-bold text-center py-2">
        Target Machine Information
      </div>

      {/* Content */}
      <div className="bg-[#1a1f2c] text-white p-4 flex items-center justify-between">
        {/* Info Columns */}
        <div className="flex gap-16">
          {/* Title */}
          <div>
            <div className="font-semibold">Title</div>
            <div className="text-sm opacity-90">acmeitsupportv10-badr (savagenj)</div>
          </div>

          {/* Target IP Address */}
          <div>
            <div className="font-semibold">Target IP Address</div>
            <div className="text-sm opacity-90 flex items-center gap-2">
              Shown in 0min 25s
              <button
                className="text-gray-400 hover:text-white"
                onClick={() => navigator.clipboard.writeText("192.168.0.1")}
              >
                📋
              </button>
            </div>
          </div>

          {/* Expires */}
          <div>
            <div className="font-semibold">Expires</div>
            <div className="text-sm opacity-90">1h 59min 23s</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button className="border border-gray-500 px-3 py-1 rounded text-white text-sm hover:bg-gray-700">
            ?
          </button>
          <button className="border border-gray-500 px-4 py-1 rounded text-white text-sm hover:bg-gray-700">
            Add 1 hour
          </button>
          <Button
            className="bg-red-500 hover:bg-green-600 text-white px-4 py-1 rounded text-sm"
            onClick={StartBox}
          >
            Start box
          </Button>
        </div>
      </div>

    </div>
  );
}
