"use client";

import type { RefObject } from "react";

export function ProjectInfoDialog({ dialogRef }: { dialogRef: RefObject<HTMLDialogElement | null> }) {
  return (
    <dialog
      ref={dialogRef}
      className="project-info-dialog"
      aria-labelledby="project-info-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
    >
      <div className="project-info-content">
        <header>
          <h2 id="project-info-title">About CoD Atlas</h2>
          <form method="dialog">
            <button aria-label="Close project information"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg></button>
          </form>
        </header>
        <p>This website was made by me, <a href="https://github.com/plp-gtr" target="_blank" rel="noreferrer">Philipp Gächter</a>.</p>
        <p>It is a pure hobby project that resulted from the urge to start the Call of Duty series from the first game and play all major instances, especially the console games I missed when I was young.</p>
        <p>While playing I was scouting the locations on Google Streetview and Maps to see how accurate the game is and out of pure interest.</p>
        <p>When searching for a map of all CoD levels in real life, I stumbled across the map from <a href="https://www.reddit.com/r/CallOfDuty/comments/10c3jbd/cod_every_location_visited_in_the_cod_franchise/" target="_blank" rel="noreferrer">u/robracer97</a>. Unfortunately it is not dynamic or zoomable, so I&apos;ve started this project.</p>
        <p>Have fun!</p>
      </div>
    </dialog>
  );
}
