"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CampaignOption } from "../../../application/campaigns/use-cases/build-campaign-options.js";
import type { AtlasEntryDto } from "../../../infrastructure/atlas-data/dto/atlas-entry.dto.js";
import type { AtlasGroupDto } from "../../../infrastructure/atlas-data/dto/atlas-group.dto.js";
import { transitionCampaignPlayback } from "../state/campaign-playback.state.js";
import { CAMPAIGN_PLAYBACK_CONFIG } from "../../../shared/config/campaign-playback.config.js";

type Campaign = CampaignOption<AtlasGroupDto, AtlasEntryDto>;
type Transport = ReturnType<typeof transitionCampaignPlayback>;
type Session = {
  campaign: Campaign;
  filterScope: AtlasGroupDto[];
  selectionVersion: number;
  transport: Transport;
};

export function useCampaignPlayback({ campaign, filterScope, selectionVersion, ready, onVisit }: {
  campaign: Campaign | null;
  filterScope: AtlasGroupDto[];
  selectionVersion: number;
  ready: boolean;
  onVisit: (level: Campaign["levels"][number], reason: "start" | "step") => void;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [secondsPerMission, setSecondsPerMission] = useState(CAMPAIGN_PLAYBACK_CONFIG.defaultSecondsPerMission);
  const onVisitRef = useRef(onVisit);
  useEffect(() => { onVisitRef.current = onVisit; }, [onVisit]);

  const active = session !== null && session.campaign === campaign
    && session.filterScope === filterScope && session.selectionVersion === selectionVersion;
  // A user selection, navigation, or filter change ends the old tour permanently.
  if (session && !active) setSession(null);

  const stop = useCallback(() => setSession(null), []);
  const pause = useCallback(() => {
    setSession((current) => current ? {
      ...current,
      transport: transitionCampaignPlayback(current.transport, "pause", current.campaign.levels.length),
    } : null);
  }, []);
  const start = () => {
    if (!campaign?.levels.length) return;
    setSession({ campaign, filterScope, selectionVersion,
      transport: transitionCampaignPlayback({ index: 0, status: "idle" }, "start", campaign.levels.length) });
    onVisit(campaign.levels[0], "start");
  };
  const resume = () => {
    if (!active || !session) return;
    setSession({ ...session,
      transport: transitionCampaignPlayback(session.transport, "resume", session.campaign.levels.length) });
  };
  const step = (action: "previous" | "next") => {
    if (!active || !session) return;
    const transport = transitionCampaignPlayback(session.transport, action, session.campaign.levels.length);
    if (transport.index === session.transport.index) return;
    setSession({ ...session, transport });
    onVisit(session.campaign.levels[transport.index], "step");
  };

  useEffect(() => {
    if (!active || !session || session.transport.status !== "playing" || !ready) return;
    const timer = window.setTimeout(() => {
      if (document.hidden || document.querySelector("dialog[open]")) { pause(); return; }
      if (session.transport.index === session.campaign.levels.length - 1) {
        setSession({ ...session,
          transport: transitionCampaignPlayback(session.transport, "finish", session.campaign.levels.length) });
        return;
      }
      const transport = transitionCampaignPlayback(session.transport, "next", session.campaign.levels.length);
      setSession({ ...session, transport });
      onVisitRef.current(session.campaign.levels[transport.index], "step");
    }, secondsPerMission * 1000);
    return () => window.clearTimeout(timer);
  }, [active, pause, ready, secondsPerMission, session]);

  useEffect(() => {
    const handleVisibility = () => { if (document.hidden) pause(); };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [pause]);

  return {
    active,
    index: active && session ? session.transport.index : 0,
    status: active && session ? session.transport.status : "idle" as Transport["status"],
    pause, resume, start, stop,
    next: () => step("next"),
    previous: () => step("previous"),
    secondsPerMission, setSecondsPerMission,
  };
}
