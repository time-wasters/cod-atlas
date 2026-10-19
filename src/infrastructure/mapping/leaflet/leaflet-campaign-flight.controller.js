/**
 * Own the complete flight so an overview arrival cannot finish the mission visit.
 * @param {{
 *   map: import("leaflet").Map,
 *   bounds: import("leaflet").LatLngBounds,
 *   stages: number[],
 *   animate: boolean,
 *   getPadding: () => Pick<import("leaflet").FitBoundsOptions, "paddingTopLeft" | "paddingBottomRight">,
 *   durationFor: (zoom: number) => number,
 *   waitForOverview: (signal: AbortSignal) => Promise<unknown>,
 *   onComplete: () => void,
 *   onCancel: () => void,
 * }} options
 */
export function createLeafletCampaignFlight({
  map, bounds, stages, animate, getPadding, durationFor, waitForOverview, onComplete, onCancel,
}) {
  const abortController = new AbortController();
  let arrival = null;
  let finished = false;
  let started = false;

  /** @param {{ stopMap?: boolean }} [options] */
  const cancel = ({ stopMap = true } = {}) => {
    if (finished) return;
    finished = true;
    if (arrival) map.off("moveend", arrival);
    arrival = null;
    abortController.abort();
    if (stopMap) map.stop();
    onCancel();
  };

  const move = (index) => {
    if (finished) return;
    const zoom = stages[index];
    arrival = () => {
      arrival = null;
      if (finished) return;
      if (index === stages.length - 1) {
        finished = true;
        onComplete();
        return;
      }
      void waitForOverview(abortController.signal).then(() => {
        if (!finished) move(index + 1);
      }).catch(() => cancel());
    };
    map.once("moveend", arrival);
    const movement = { ...getPadding(), animate, maxZoom: zoom, duration: durationFor(zoom) };
    if (animate) map.flyToBounds(bounds, movement);
    else map.fitBounds(bounds, movement);
  };

  return {
    start() {
      if (started || finished) return;
      started = true;
      move(0);
    },
    cancel,
  };
}
