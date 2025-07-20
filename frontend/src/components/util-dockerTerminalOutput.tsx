import { useEffect, useState } from "react";
import TerminalOutput from "./util-terminalOutput";
import { Events  } from "@wailsapp/runtime";

export default function DockerTerminalOutput() {
  const [output, setOutput] = useState("");


useEffect(() => {
  let mounted = true;

  function onOutput(line: string) {
    if (!mounted) return;
    setOutput((prev) => prev + line + "\n");
  }

  Events.On("docker-output", onOutput);

  return () => {
    mounted = false;
  };
}, []);


  return (
    <div>
      {/* Hier renderst du TerminalOutput */}
      <TerminalOutput output={output} />
    </div>
  );
}
