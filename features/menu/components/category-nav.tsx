"use client";

import { Chip, ChipTrack } from "@/components/ui";

type CategoryNavProps = {
  categories: { id: string; name: string }[];
  activeId: string | null;
  onSelect: (id: string) => void;
};

export function CategoryNav({ categories, activeId, onSelect }: CategoryNavProps) {
  return (
    <ChipTrack className="-mx-margin px-margin md:mx-0 md:px-0">
      {categories.map((category) => (
        <Chip
          key={category.id}
          variant={activeId === category.id ? "active" : "inactive"}
          onClick={() => onSelect(category.id)}
        >
          {category.name}
        </Chip>
      ))}
    </ChipTrack>
  );
}
