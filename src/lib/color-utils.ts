export const getColorForDepth = (idx: number) => {
  const colors = [
    // "#000000", // Black
    // "#A9A9A9", // Dark Gray
    "#696969", // Dim Gray
    "#708090", // Slate Gray
    "#2F4F4F", // Dark Slate Gray
    "#808080", // Gray
    // "#8B0000", // Dark Red
    // "#800000", // Maroon
    // "#654321", // Dark Brown
    // "#8B4513", // Saddle Brown
    // "#556B2F", // Dark Olive Green
    // "#808000", // Olive
    // "#006400", // Dark Green
    // "#008000", // Green
    // "#228B22", // Forest Green
    "#2E8B57", // Sea Green
    // "#008B8B", // Dark Cyan
    // "#008080", // Teal
    // "#000080", // Navy
    // "#191970", // Midnight Blue
    // "#00008B", // Dark Blue
    // "#4B0082", // Indigo
    // "#9400D3", // Dark Violet
    // "#8B008B", // Dark Magenta
    // "#800080", // Purple
  ];

  const index = idx % colors.length;
  return colors[index];
};

export const alpha = (hex: string, alpha: number) => {
  return hex + Math.round(alpha * 255).toString(16);
};
