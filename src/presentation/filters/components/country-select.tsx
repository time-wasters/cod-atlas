"use client";

import * as Select from "@radix-ui/react-select";
import type { CountryAvailability } from "../../../application/atlas/use-cases/filter-atlas-groups.js";
import { CountryFlag } from "../../shared/components/country-flag.js";

type CountrySelectProps = {
  countries: CountryAvailability[];
  value: string;
  onValueChange: (value: string) => void;
};

export function CountrySelect({ countries, value, onValueChange }: CountrySelectProps) {
  const selectedCountry = countries.find((item) => item.name === value) ?? null;

  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      <Select.Trigger
        className={`country-select-trigger${selectedCountry && !selectedCountry.available ? " is-unavailable" : ""}`}
        aria-label="Filter by country"
      >
        <Select.Value>{selectedCountry?.name ?? "All countries"}</Select.Value>
        {selectedCountry ? <CountryFlag code={selectedCountry.flagCode} /> : null}
        <Select.Icon className="country-select-chevron" aria-hidden="true">
          <svg viewBox="0 0 10 6"><path d="m1 1 4 4 4-4" /></svg>
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          className="country-select-content"
          position="popper"
          align="start"
          sideOffset={4}
          collisionPadding={8}
        >
          <Select.ScrollUpButton className="country-select-scroll-button" aria-label="Scroll up">▲</Select.ScrollUpButton>
          <Select.Viewport className="country-select-viewport">
            <Select.Item className="country-select-item" value="all">
              <Select.ItemText>All countries</Select.ItemText>
            </Select.Item>
            {countries.map((item) => (
              <Select.Item
                className={`country-select-item${item.available ? "" : " is-unavailable"}`}
                key={item.name}
                value={item.name}
                aria-label={item.available ? item.name : `${item.name}, no matching levels`}
              >
                <Select.ItemText>{item.name}</Select.ItemText>
                <CountryFlag code={item.flagCode} />
              </Select.Item>
            ))}
          </Select.Viewport>
          <Select.ScrollDownButton className="country-select-scroll-button" aria-label="Scroll down">▼</Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
