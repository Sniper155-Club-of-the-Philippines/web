/** Merchandise sizes, smallest first. Mirrors the API's `SizeEnum`. */
export const SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'] as const;

export type Size = (typeof SIZES)[number];
