"use client";

import { useCallback, useRef, useState } from "react";

export type AtlasSelection<TGroup, TEntry> = {
  group: TGroup;
  entry: TEntry;
};

export function useAtlasSelection<TGroup, TEntry>(initialSelection: AtlasSelection<TGroup, TEntry>) {
  const initialSelectionRef = useRef(initialSelection);
  const [selected, setSelected] = useState(initialSelection);
  const [selectionInUrl, setSelectionInUrl] = useState(false);

  const select = useCallback((group: TGroup, entry: TEntry) => {
    setSelected({ group, entry });
    setSelectionInUrl(true);
  }, []);

  const applyUrlSelection = useCallback((selection: AtlasSelection<TGroup, TEntry> | null) => {
    setSelected(selection ?? initialSelectionRef.current);
    setSelectionInUrl(selection !== null);
  }, []);

  return {
    selected,
    selectionInUrl,
    select,
    applyUrlSelection,
  };
}
