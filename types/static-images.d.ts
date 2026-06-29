// Tracked in git so static image imports (.png/.jpg/.svg → { src, width, height })
// are typed during `next lint`, which runs before `next build` regenerates
// the gitignored next-env.d.ts (e.g. on a fresh CI/Vercel checkout).
/// <reference types="next/image-types/global" />
