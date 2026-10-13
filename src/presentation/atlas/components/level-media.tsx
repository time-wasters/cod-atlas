"use client";

import { useEffect, useState, type RefObject } from "react";
import type { WikiImageDto } from "../../../infrastructure/atlas-data/dto/wiki-image.dto.js";

export type LevelMediaViewModel = {
  appearanceTitle: string;
  bannerKey: string;
  failed: boolean;
  image: WikiImageDto;
  imageKey: string;
  isLocal: boolean;
  loaded: boolean;
};

function LevelMediaFrame({
  media,
  retained,
  onFailed,
  onLoaded,
}: {
  media: LevelMediaViewModel;
  retained: boolean;
  onFailed: (media: LevelMediaViewModel) => void;
  onLoaded: (media: LevelMediaViewModel) => void;
}) {
  const [loaded, setLoaded] = useState(media.loaded);
  const className = `${!media.failed && (loaded || media.loaded) ? "is-loaded" : ""}${retained ? " is-retained" : ""}`;
  const handleLoaded = () => {
    setLoaded(true);
    if (!retained) onLoaded(media);
  };
  const handleFailed = () => { if (!retained) onFailed(media); };

  useEffect(() => {
    // A retained frame can become selected again without another browser load
    // event. Report its existing readiness so the new crossfade can finish.
    if (!retained && loaded && !media.loaded && !media.failed) onLoaded(media);
  }, [loaded, media, onLoaded, retained]);

  return media.image.mediaType === "video" ? (
    <video
      className={className}
      src={media.image.thumbnailUrl}
      aria-hidden={retained || undefined}
      aria-label={retained ? undefined : `${media.appearanceTitle} level banner`}
      autoPlay
      loop
      muted
      playsInline
      onLoadedData={handleLoaded}
      onError={handleFailed}
    />
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={className}
      src={media.image.thumbnailUrl}
      aria-hidden={retained || undefined}
      alt={retained ? "" : `${media.appearanceTitle} level banner`}
      referrerPolicy={media.isLocal ? undefined : "no-referrer"}
      onLoad={handleLoaded}
      onError={handleFailed}
    />
  );
}

export function LevelMedia({
  dialogRef,
  media,
  onFailed,
  onLoaded,
}: {
  dialogRef: RefObject<HTMLDialogElement | null>;
  media: LevelMediaViewModel;
  onFailed: (media: LevelMediaViewModel) => void;
  onLoaded: (imageKey: string) => void;
}) {
  const [frames, setFrames] = useState<{
    current: LevelMediaViewModel | null;
    previous: LevelMediaViewModel | null;
  }>({ current: null, previous: null });
  const retainedMedia = media.failed ? null
    : frames.current?.imageKey === media.imageKey ? frames.previous : frames.current;
  const loaded = !media.failed && (media.loaded || frames.current?.imageKey === media.imageKey);

  const handleLoaded = (loadedMedia: LevelMediaViewModel) => {
    setFrames((current) => current.current?.imageKey === loadedMedia.imageKey ? current : {
      current: { ...loadedMedia, loaded: true },
      previous: current.current,
    });
    onLoaded(loadedMedia.imageKey);
  };

  useEffect(() => {
    if (!frames.previous) return;
    // Release the old image/video after the 200 ms crossfade, including when
    // reduced motion disables the animation.
    const timer = window.setTimeout(() => {
      setFrames((current) => current === frames ? { ...current, previous: null } : current);
    }, 220);
    return () => window.clearTimeout(timer);
  }, [frames]);

  return (
    <figure className={`intel-media${retainedMedia ? " has-retained-media" : ""}`}>
        {retainedMedia && (
          <LevelMediaFrame
            key={retainedMedia.imageKey}
            media={retainedMedia}
            retained
            onLoaded={handleLoaded}
            onFailed={onFailed}
          />
        )}
        <LevelMediaFrame
          key={media.imageKey}
          media={{ ...media, loaded }}
          retained={false}
          onLoaded={handleLoaded}
          onFailed={onFailed}
        />
        {!loaded && (
          <span className="media-load-state" role="status">
            {media.failed ? "Image unavailable" : "Loading image…"}
          </span>
        )}
        <button
          className="media-info-button"
          type="button"
          aria-label="Show image copyright and attribution information"
          title="Image information"
          disabled={!loaded}
          onClick={() => dialogRef.current?.showModal()}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 10.8v6M12 7.2h.01" /></svg>
        </button>
    </figure>
  );
}

export function LevelMediaDialog({
  dialogRef,
  media,
}: {
  dialogRef: RefObject<HTMLDialogElement | null>;
  media: LevelMediaViewModel;
}) {
  const { image } = media;
  return (
    <dialog
      ref={dialogRef}
      className="media-info-dialog"
      aria-labelledby="media-info-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
    >
        <div className="media-info-content">
          <header>
            <div>
              <span>{image.rights.status === "non-free" ? "Copyrighted media" : image.rights.status === "licensed" ? "Licensed media" : "Wiki media"}</span>
              <h2 id="media-info-title">Image information</h2>
            </div>
            <form method="dialog">
              <button aria-label="Close image information"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg></button>
            </form>
          </header>
          {image.rights.notice && <div className="media-rights-notice">{image.rights.notice}</div>}
          <dl>
            {image.author.name && image.author.userUrl && (
              <div>
                <dt>{media.isLocal ? "Captured by" : image.author.role === "uploader" ? "Uploaded by" : "Author"}</dt>
                <dd><a href={image.author.userUrl} target="_blank" rel="noreferrer">{image.author.name}</a></dd>
              </div>
            )}
            {image.license.name && image.license.url && (
              <div>
                <dt>License</dt>
                <dd><a href={image.license.url} target="_blank" rel="noreferrer">{image.license.name}</a></dd>
              </div>
            )}
            {image.rights.noticeUrl && (
              <div>
                <dt>Rights notice</dt>
                <dd><a href={image.rights.noticeUrl} target="_blank" rel="noreferrer">{media.isLocal ? "Rights terms" : "Read on CoD Wiki"}</a></dd>
              </div>
            )}
            <div>
              <dt>Source</dt>
              <dd><a href={image.detailPageUrl} target="_blank" rel="noreferrer">{media.isLocal ? "Open repository image" : "Open file page"}</a></dd>
            </div>
          </dl>
          <p className="media-notice-credit">{media.isLocal
            ? "Image extracted or captured by plp-gtr; the underlying game artwork remains subject to its original copyright."
            : "Notice reproduced from the Call of Duty Wiki; the image remains subject to its original copyright status."}</p>
        </div>
    </dialog>
  );
}
