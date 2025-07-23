import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import MatrixTyping from "../components/ui/matrixTyping";
import logo from "../assets/logos/v2.0.3_logo_amsel_black.png";
import { PullSecLists } from "../../wailsjs/go/app/App";
import { Progress } from "../components/ui/progress";
//import { Events } from "@wailsio/runtime";
import warnings from "../constants/warnings";
import { EventsOff, EventsOn } from "../../wailsjs/runtime/runtime";
import { useNavigate } from "react-router-dom";

function Landing() {
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [startHackingActive, setStartHackingActive] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const navigate = useNavigate();

useEffect(() => {
  EventsOn("progress", (data: any) => {
    if (data?.progress !== undefined) {
      setProgress(data.progress);
      setStatusMessage(data.message);
      if (data.progress >= 100) {
        navigate("/dashboard");
      }
    }
  });

  return () => {
     // Clean up listener
      EventsOff("progress");
  };
}, []);


function handleClick() {
  setProgress(0);
  setStatusMessage("Starting download...");
  setLoading(true);

  PullSecLists(); // kein await mehr!

  // optional: Reset nach ein paar Sekunden
 /* setTimeout(() => {
    setLoading(false);
  }, 10000); */
}

  const stopHacking = () => {
    setStartHackingActive(false);
    setShowOutput(false);
  };

  return (
    <div className="min-w-[320px] min-h-screen flex flex-col items-center justify-center bg-black relative overflow-hidden px-4 py-8">
      <img
        src={logo}
        alt="Logo"
        className={`absolute top-4 left-4 w-16 sm:w-24 transition-all duration-700 ease-in-out
          ${startHackingActive ? "opacity-100 translate-x-0 translate-y-0" : "opacity-0 translate-x-20 translate-y-20"}`}
      />

      <div className="relative w-full max-w-[32rem] mb-6 px-4">
        <img
          src={logo}
          alt="Big Logo"
          className={`w-full h-auto transition-all duration-700 ease-in-out
            ${startHackingActive ? "opacity-0 -translate-x-20 -translate-y-20" : "opacity-100 translate-x-0 translate-y-0"}`}
        />
      </div>

      {!startHackingActive && (
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <Button
            onClick={handleClick}
             //className="bg-gray-800 border text-amselblue px-6 py-3 font-mono tracking-widest uppercase shadow-md transition-all duration-200 rounded-none hover:bg-amselblue hover:text-white"
             className="bg-gray-800 border text-amselblue px-6 py-3 font-mono tracking-widest uppercase shadow-md hover:text-white transition-all duration-200 rounded-none"
            //className="-gray-800 border text-white px-6 py-3 font-mono tracking-widest uppercase shadow-md hover:text-amselblue transition-all duration-200 rounded-none"
            //className="bg-gray-800 border text-amselblue text-amselblue px-6 py-3 font-mono tracking-widest uppercase shadow-md hover:text-amselblue hover:text-amselblue transition-all duration-200 rounded-none"
          >
            Start Hacking
          </Button>
        </div>
      )}

      <div className="w-full max-w-sm space-y-4 text-center">
        <button
          onClick={handleClick}
          className="bg-black text-white w-full py-2 px-4 rounded hover:bg-gray-800 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Downloading..." : "Download SecLists"}
        </button>
        {loading && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-white font-mono">{statusMessage}</p>
          </div>
        )}
      </div>

      {startHackingActive && (
        <div className="flex flex-wrap justify-center gap-4 mt-6 mb-6">
          <Button
            onClick={stopHacking}
            className="bg-gray-800 border border-red-500 text-green-400 px-6 py-3 font-mono tracking-widest uppercase shadow-md hover:bg-green-500 hover:text-black transition-all duration-200 rounded-none"
          >
            Stop Hacking
          </Button>
        </div>
      )}

      <div
        className={`w-full px-2 sm:px-8 flex justify-center transition-all duration-300 ${
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
  );
}

export default Landing;
