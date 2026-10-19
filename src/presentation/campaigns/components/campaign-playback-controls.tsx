"use client";

import type { useCampaignPlayback } from "../hooks/use-campaign-playback.js";

function PlaybackIcon({ kind }: { kind: "previous" | "next" | "play" | "pause" | "replay" | "stop" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {kind === "previous" && <><path d="M6 5v14" /><path d="m18 5-10 7 10 7Z" /></>}
      {kind === "next" && <><path d="M18 5v14" /><path d="m6 5 10 7-10 7Z" /></>}
      {kind === "play" && <path d="m8 5 11 7-11 7Z" />}
      {kind === "pause" && <path d="M8 5v14M16 5v14" />}
      {kind === "replay" && <><path d="M4 10a8 8 0 1 1 1 7" /><path d="M4 4v6h6" /></>}
      {kind === "stop" && <rect x="6" y="6" width="12" height="12" rx="2" />}
    </svg>
  );
}

export function CampaignPlaybackControls({ label, count, playback }: {
  label: string;
  count: number;
  playback: ReturnType<typeof useCampaignPlayback>;
}) {
  const playing = playback.status === "playing";
  const finished = playback.status === "finished";
  const action = playing ? "Pause" : finished ? "Replay" : playback.active ? "Resume" : "Follow campaign";
  const durations = [10, 15, 30, 60];
  const nextDuration = durations[(durations.indexOf(playback.secondsPerMission) + 1) % durations.length];
  const timeAction = `Time per mission: ${playback.secondsPerMission} seconds. Change to ${nextDuration} seconds`;
  return (
    <div className="campaign-playback" role="group" aria-label={`${label} campaign tour`}>
      <button type="button" disabled={!playback.active || playback.index === 0}
        onClick={playback.previous} aria-label="Previous campaign mission" title="Previous mission">
        <PlaybackIcon kind="previous" />
      </button>
      <button className="campaign-playback-primary" type="button" aria-label={action} title={action}
        onClick={playing ? playback.pause : !playback.active || finished ? playback.start : playback.resume}>
        <PlaybackIcon kind={playing ? "pause" : finished ? "replay" : "play"} />
      </button>
      <button type="button" disabled={!playback.active || playback.index === count - 1}
        onClick={playback.next} aria-label="Next campaign mission" title="Next mission">
        <PlaybackIcon kind="next" />
      </button>
      <button type="button" onClick={playback.stop}
        disabled={!playback.active} aria-label="Stop following campaign" title="Stop following campaign">
        <PlaybackIcon kind="stop" />
      </button>
      <button className="campaign-playback-speed" type="button" aria-label={timeAction} title={timeAction}
        onClick={() => playback.setSecondsPerMission(nextDuration)}>
        {playback.secondsPerMission}
      </button>
    </div>
  );
}
