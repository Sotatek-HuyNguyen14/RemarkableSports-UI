import React from "react";
import { ScrollView } from "react-native";

import FilterBadge, { FilterBadgeProps } from "../Badge/FilterBadge";

export default function FilterList({
  options,
}: {
  options: FilterBadgeProps[];
}) {
  return (
    <ScrollView
      horizontal
      style={{ paddingBottom: 16, marginBottom: -16 }}
      showsHorizontalScrollIndicator={false}
    >
      {options.map((val, index) => {
        return (
          <FilterBadge
            // eslint-disable-next-line react/no-array-index-key
            key={`${val.label} ${index}`}
            label={val.label}
            isActive={val.isActive}
            onPress={val.onPress}
          />
        );
      })}
    </ScrollView>
  );
}
