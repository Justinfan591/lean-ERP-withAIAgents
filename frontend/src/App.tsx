import TopBar from "./components/TopBar";
import GameBoard from "./components/GameBoard";
import AgentConsole from "./components/AgentConsole";
import EventFeed from "./components/EventFeed";
import DevBanner from "./components/DevBanner";

export default function App() {
  return (
    <div className="h-full grid grid-rows-[auto_1fr_auto]">
      <DevBanner />
      <TopBar />
      <div className="grid grid-cols-[1fr_320px]">
        <GameBoard />
        <AgentConsole />
      </div>
      <EventFeed />
    </div>
  );
}
