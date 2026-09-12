"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { MapPin } from "lucide-react";
import { Chip } from "@/components/ui/chip/Chip";
import { ChipGroup } from "@/components/ui/chip/ChipGroup";
import { TulumZone, type TulumZoneType } from "@/types/zones";

export interface ZoneFilterProps {
  activeZone: TulumZoneType;
  onSelectZone: (zone: TulumZoneType) => void;
}

const ZONE_LIST: readonly TulumZoneType[] = [
  TulumZone.ALL,
  TulumZone.LA_VELETA,
  TulumZone.ALDEA_ZAMA,
  TulumZone.CENTRO,
  TulumZone.ZONA_COSTERA,
] as const;

export default function ZoneFilter({
  activeZone,
  onSelectZone,
}: ZoneFilterProps) {
  const tZones = useTranslations("zones");

  return (
    <div className="w-full">
      <ChipGroup>
        {ZONE_LIST.map((zone) => {
          const isSelected = activeZone === zone;
          const label =
            zone === TulumZone.ALL
              ? tZones("all")
              : zone === TulumZone.LA_VELETA
              ? tZones("laVeleta")
              : zone === TulumZone.ALDEA_ZAMA
              ? tZones("aldeaZama")
              : zone === TulumZone.CENTRO
              ? tZones("centro")
              : tZones("zonaCostera");

          return (
            <Chip
              key={zone}
              label={label}
              isSelected={isSelected}
              onClick={() => onSelectZone(zone)}
              icon={<MapPin className="h-3.5 w-3.5" />}
            />
          );
        })}
      </ChipGroup>
    </div>
  );
}
