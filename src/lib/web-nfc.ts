/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { EventEmitter } from 'events';

// --- Types for events ---
export type TagDetected = string;
export type TagIgnored = string;
export type TagRecords = NDEFRecord[];
export type ReadStart = void;
export type ReadStop = string | undefined;
export type WriteStart = void;
export type WriteStop = string | undefined;
export type PermissionGranted = void;
export type PermissionDenied = void;

export const nfcEvents = new EventEmitter();

let nfcReader: NDEFReader | undefined;
let scanController: AbortController | null = null;
let writeController: AbortController | null = null;

let isScanning = false;
let isWriting = false;

let scanTimeout: ReturnType<typeof setTimeout> | null = null;
let writeTimeout: ReturnType<typeof setTimeout> | null = null;

let lastReadSerialNumber: string | undefined;
let lastReadTimeout: ReturnType<typeof setTimeout> | null = null;
const lastReadCooldownDuration = 2500; // ms

// --- Utilities ---
export async function deviceSupportsNFC(): Promise<boolean> {
    return 'NDEFReader' in window;
}

export async function deviceAllowsNFC(): Promise<boolean> {
    // @ts-ignore: nfc is not yet fully typed in TS DOM lib
    const status = await navigator.permissions.query({ name: 'nfc' });
    return status.state === 'granted';
}

export async function requestAccessToNFC(): Promise<void> {
    if (!nfcReader) nfcReader = new NDEFReader();

    const ctrl = new AbortController();
    try {
        await nfcReader.scan({ signal: ctrl.signal });
    } catch (err) {
        // Permission denied
    } finally {
        ctrl.abort();
    }

    if (await deviceAllowsNFC()) {
        nfcEvents.emit('PermissionGranted');
    } else {
        nfcEvents.emit('PermissionDenied');
    }
}

export function isReadingTags(): boolean {
    return isScanning;
}

export function isWritingTags(): boolean {
    return isWriting;
}

// --- Stop helpers ---
export async function stopReadingFromTags(reason?: string): Promise<void> {
    if (!isScanning) return;
    if (scanTimeout) {
        clearTimeout(scanTimeout);
    }
    scanTimeout = null;

    scanController?.abort(reason);
    scanController = null;
    isScanning = false;

    if (lastReadTimeout) {
        clearTimeout(lastReadTimeout);
    }
    lastReadSerialNumber = undefined;

    nfcEvents.emit('ReadStop', reason);
}

export async function stopWritingToTag(reason?: string): Promise<void> {
    if (!isWriting) return;
    if (writeTimeout) {
        clearTimeout(writeTimeout);
    }
    writeTimeout = null;

    writeController?.abort(reason);
    writeController = null;
    isWriting = false;

    nfcEvents.emit('WriteStop', reason);
}

async function stopDeviceOperation(reason?: string) {
    await stopReadingFromTags(reason);
    await stopWritingToTag(reason);
}

// --- Read helpers ---
function handleTag(event: NDEFReadingEvent): void {
    const { serialNumber, message } = event;
    const { records } = message;

    if (serialNumber === lastReadSerialNumber) {
        nfcEvents.emit('TagIgnored', serialNumber);
        return;
    }

    lastReadSerialNumber = serialNumber;
    if (lastReadTimeout) {
        clearTimeout(lastReadTimeout);
    }
    lastReadTimeout = setTimeout(() => {
        lastReadSerialNumber = undefined;
    }, lastReadCooldownDuration);

    nfcEvents.emit('TagDetected', serialNumber);
    nfcEvents.emit('TagRecords', Array.from(records));
}

async function handleTagThenStop(event: NDEFReadingEvent) {
    handleTag(event);
    await stopDeviceOperation('completed single read');
}

// --- Public Read API ---
export async function listenForTags(
    timeoutInSeconds = 0,
    stopAfterOne = false
): Promise<void> {
    if (!nfcReader) nfcReader = new NDEFReader();

    await stopDeviceOperation('starting new read');

    scanController = new AbortController();

    nfcReader.onreading = stopAfterOne ? handleTagThenStop : handleTag;
    nfcReader.onreadingerror = (e) => {
        console.error('NFC reading error:', e);
    };

    await nfcReader.scan({ signal: scanController.signal });

    isScanning = true;
    nfcEvents.emit('ReadStart');

    if (timeoutInSeconds > 0) {
        scanTimeout = setTimeout(
            () => stopReadingFromTags('read operation timed out'),
            timeoutInSeconds * 1000
        );
    }
}

export async function readFromTag(timeoutInSeconds = 0): Promise<void> {
    return listenForTags(timeoutInSeconds, true);
}

// --- Public Write API ---
export async function writeToTag(
    records: NDEFRecordInit[],
    options: { overwrite?: boolean; timeoutInSeconds?: number } = {}
): Promise<void> {
    if (!nfcReader) nfcReader = new NDEFReader();

    await stopDeviceOperation('starting new write');

    writeController = new AbortController();

    const ndefOptions: NDEFWriteOptions = {
        overwrite: options.overwrite ?? false,
        signal: writeController.signal,
    };

    const message: NDEFMessageInit = { records };

    const writePromise = nfcReader.write(message, ndefOptions);

    isWriting = true;
    nfcEvents.emit('WriteStart');

    if (options.timeoutInSeconds && options.timeoutInSeconds > 0) {
        writeTimeout = setTimeout(
            () => stopWritingToTag('write operation timed out'),
            options.timeoutInSeconds * 1000
        );
    }

    return writePromise.finally(() => {
        isWriting = false;
        nfcEvents.emit('WriteStop');
    });
}
