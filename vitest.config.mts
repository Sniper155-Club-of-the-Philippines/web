import { defineConfig, type Plugin } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

/**
 * Make static asset imports (`import img from '@/assets/x.png'`) resolve to a
 * Next-like object ({ src, height, width }) instead of a bare URL string, so
 * modules that read `img.src` behave the same under test as in Next.
 */
function stubAssets(): Plugin {
    return {
        name: 'stub-assets',
        enforce: 'pre',
        load(id) {
            const clean = id.split('?')[0];
            if (/\.(jpe?g|png|gif|svg|webp|avif)$/i.test(clean)) {
                return 'export default { src: "/stub-asset.png", height: 1, width: 1 };';
            }
        },
    };
}

export default defineConfig({
    plugins: [stubAssets(), tsconfigPaths(), react()],
    // Don't load the project's Tailwind v4 PostCSS config during unit tests.
    css: { postcss: { plugins: [] } },
    // Use the automatic JSX runtime so files don't need an explicit React import.
    esbuild: { jsx: 'automatic' },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./vitest.setup.ts'],
        include: ['src/**/*.{test,spec}.{ts,tsx}'],
        css: false,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'text-summary'],
            include: [
                'src/lib/**',
                'src/api/**',
                'src/atoms/**',
                'src/hooks/**',
                'src/constants.tsx',
            ],
            exclude: [
                '**/*.{test,spec}.{ts,tsx}',
                // NDEFReader-based, browser-only hardware module — not unit-testable.
                'src/lib/web-nfc.ts',
                // Barrel of re-exports; covered transitively via the api modules.
                'src/api/index.ts',
            ],
        },
    },
});
