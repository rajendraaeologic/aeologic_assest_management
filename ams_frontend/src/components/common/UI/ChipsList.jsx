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
                    color: "#003333",
                    fontWeight: 500,
                    fontSize: "1rem",
                    borderRadius: "4px",
                    height: "auto",
                    maxWidth: 120,
                    cursor: "default",
                    "& .MuiChip-label": {
                      whiteSpace: "nowrap",
                      overflow: "hidden",
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
