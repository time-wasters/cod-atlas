"use client";

import type { useCampaignPlayback } from "../hooks/use-campaign-playback.js";

export function CampaignPlaybackControls({ label, count, playback }: {
  label: string;
  count: number;
  playback: ReturnType<typeof useCampaignPlayback>;
}) {
  const playing = playback.status === "playing";
  const finished = playback.status === "finished";
  return (
    <section className="campaign-playback" aria-label="Campaign playback">
      <div className="campaign-playback-heading">
        <strong>{label}</strong>
        {playback.active && <button type="button" onClick={playback.stop} aria-label="Stop following campaign" title="Stop following campaign">×</button>}
      </div>
      <p role="status" aria-live="polite" aria-atomic="true">
        {playback.active
          ? `Mission ${playback.index + 1} of ${count} · ${finished ? "Complete" : playing ? "Following" : "Paused"}`
          : `${count} ${count === 1 ? "mission" : "missions"} · Briefings and map stops`}
      </p>
      <div className="campaign-playback-buttons">
        {playback.active && <button type="button" disabled={playback.index === 0} onClick={playback.previous} aria-label="Previous campaign mission">← Previous</button>}
        <button className="campaign-playback-primary" type="button"
          onClick={playing ? playback.pause : !playback.active || finished ? playback.start : playback.resume}>
          {playing ? "Pause" : finished ? "Replay" : playback.active ? "Resume" : "Follow campaign"}
        </button>
        {playback.active && <button type="button" disabled={playback.index === count - 1} onClick={playback.next} aria-label="Next campaign mission">Next →</button>}
      </div>
      {playback.active && <label className="campaign-playback-speed">
        Time per mission
        <select value={playback.secondsPerMission} onChange={(event) => playback.setSecondsPerMission(Number(event.target.value))}>
          {[10, 15, 30, 60].map((seconds) => <option key={seconds} value={seconds}>{seconds} seconds</option>)}
        </select>
      </label>}
    </section>
  );
}
