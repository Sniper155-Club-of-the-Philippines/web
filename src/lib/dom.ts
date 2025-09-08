import { toPng } from 'html-to-image';

/**
 * Exports a DOM element as PNG with customizable DPI.
 *
 * @param element - The HTMLElement to capture.
 * @param fileName - The filename for the PNG (default: "download.png").
 * @param dpi - Desired DPI (acts as scale factor). Common values: 1 (72dpi), 2 (~150dpi), 3 (~300dpi).
 */
export async function exportAsPNG(
    element: HTMLElement,
    fileName: string = 'download.png',
    dpi: number = 3
): Promise<void> {
    if (!element) return;

    const scale = dpi;

    const dataUrl = await toPng(element, {
        cacheBust: true,
        pixelRatio: scale, // main quality control
        style: {
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            width: `${element.offsetWidth}px`,
            height: `${element.offsetHeight}px`,
        },
        width: element.offsetWidth * scale,
        height: element.offsetHeight * scale,
    });

    const link = document.createElement('a');
    link.download = fileName;
    link.href = dataUrl;
    link.click();
}
