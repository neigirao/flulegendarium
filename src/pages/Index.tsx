
import { PlayerDataCollector } from "@/components/PlayerDataCollector";

export default function Index() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Flu Legendarium</h1>
      <div className="max-w-md mx-auto">
        <PlayerDataCollector />
      </div>
    </div>
  );
}
