import React from "react";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";

const ChipsList = ({ items = [], labelKey = "label", emptyText = "N/A" }) => {
  if (!items.length) {
    return <span className="text-gray-500">{emptyText}</span>;
  }

  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      {items.map((item, index) => {
        const label = labelKey.includes(".")
          ? labelKey.split(".").reduce((obj, key) => obj?.[key], item)
          : item[labelKey];

        return (
          <Chip
            key={index}
            label={label || "N/A"}
            size="small"
            sx={{
              backgroundColor: "rgba(59, 192, 195, 0.6)",
              color: "#003333",
              fontWeight: 500,
              fontSize: "0.9rem",
              borderRadius: "4px", // 🔷 Rectangle style
              height: "28px", // optional: uniform height
            }}
          />
        );
      })}
    </Stack>
  );
};

export default ChipsList;
