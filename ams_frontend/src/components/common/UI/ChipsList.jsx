// export default ChipsList;
import React, { useState } from "react";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";

const ChipsList = ({ items = [], labelKey = "label", emptyText = "N/A" }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const handleChipClick = (index) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  if (!items.length) {
    return <span className="text-gray-500">{emptyText}</span>;
  }

  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      {items.map((item, index) => {
        const label = labelKey.includes(".")
          ? labelKey.split(".").reduce((obj, key) => obj?.[key], item)
          : item[labelKey];

        const isExpanded = expandedIndex === index;

        return (
          <Chip
            key={index}
            label={label || "N/A"}
            size="small"
            onClick={() => handleChipClick(index)}
            sx={{
              backgroundColor: "rgba(59, 192, 195, 0.6)",
              color: "#003333",
              fontWeight: 500,
              fontSize: "0.9rem",
              borderRadius: "4px",
              height: "auto",
              maxWidth: isExpanded ? "none" : 120,
              cursor: "pointer",
              "& .MuiChip-label": {
                whiteSpace: isExpanded ? "normal" : "nowrap",
                overflow: isExpanded ? "visible" : "hidden",
                textOverflow: "ellipsis",
                padding: "0 8px",
                display: "block",
              },
            }}
          />
        );
      })}
    </Stack>
  );
};

export default ChipsList;
