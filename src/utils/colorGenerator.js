
const GOLDEN_RATIO_CONJUGATE = 0.618033988749895;

export const generateUniqueColor = (index) => {
    const hue = (index * GOLDEN_RATIO_CONJUGATE * 360) % 360;
    const saturation = 65 + (index % 3) * 5;
    const lightness = 45 + (index % 3) * 5;

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

export const generateColorPalette = (count) => {
    return Array.from({ length: count }, (_, i) => generateUniqueColor(i));
};