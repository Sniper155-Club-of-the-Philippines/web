import { EventEmitter } from 'events';
import { invoke } from '@tauri-apps/api/core';

// --- Types for events ---
export type TagDetected = string;
export type TagIgnored = string;
export type TagRecords = string[]; // raw records (stringified for now)
export type ReadStart = void;
export type ReadStop = string | undefined;
export type WriteStart = void;
export type WriteStop = string | undefined;
export type PermissionGranted = void;
export type PermissionDenied = void;

export const nfcEvents = new EventEmitter();

let isScanning = false;
let isWriting = false;

let scanTimeout: ReturnType<typeof setTimeout> | null = null;
let writeTimeout: ReturnType<typeof setTimeout> | null = null;

let lastReadSerialNumber: string | undefined;
let lastReadTimeout: ReturnType<typeof setTimeout> | null = null;
const lastReadCooldownDuration = 2500; // ms

// --- Utilities ---
export async function deviceSupportsNFC(): Promise<boolean> {
    const status = await invoke<string>('nfc_status');
    const parsed = JSON.parse(status);
    return parsed.supported;
}

export async function deviceAllowsNFC(): Promise<boolean> {
    // In Tauri, if NFC device is found we consider permission granted
    const status = await invoke<string>('nfc_status');
    const parsed = JSON.parse(status);
    return parsed.device_found;
}

export async function requestAccessToNFC(): Promise<void> {
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
    if (scanTimeout) clearTimeout(scanTimeout);
    scanTimeout = null;
    isScanning = false;

    if (lastReadTimeout) clearTimeout(lastReadTimeout);
    lastReadSerialNumber = undefined;

    nfcEvents.emit('ReadStop', reason);
}

export async function stopWritingToTag(reason?: string): Promise<void> {
    if (!isWriting) return;
    if (writeTimeout) clearTimeout(writeTimeout);
    writeTimeout = null;
    isWriting = false;

    nfcEvents.emit('WriteStop', reason);
}

async function stopDeviceOperation(reason?: string) {
    await stopReadingFromTags(reason);
    await stopWritingToTag(reason);
}

// --- Read helpers ---
function handleTag(raw: string | null): void {
    if (!raw) return;

    const serialNumber = raw; // Simplified: Rust should eventually return parsed NDEF
    if (serialNumber === lastReadSerialNumber) {
        nfcEvents.emit('TagIgnored', serialNumber);
        return;
    }

    lastReadSerialNumber = serialNumber;
    if (lastReadTimeout) clearTimeout(lastReadTimeout);
    lastReadTimeout = setTimeout(() => {
        lastReadSerialNumber = undefined;
    }, lastReadCooldownDuration);

    nfcEvents.emit('TagDetected', serialNumber);
    nfcEvents.emit('TagRecords', [serialNumber]); // placeholder
}

async function handleTagThenStop(raw: string | null) {
    handleTag(raw);
    await stopDeviceOperation('completed single read');
}

// --- Public Read API ---
export async function listenForTags(
    timeoutInSeconds = 0,
    stopAfterOne = false
): Promise<void> {
    await stopDeviceOperation('starting new read');

    isScanning = true;
    nfcEvents.emit('ReadStart');

    const tag = await invoke<string | null>('nfc_read');
    if (stopAfterOne) {
        handleTagThenStop(tag);
    } else {
        handleTag(tag);
    }

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
    records: string[],
    options: { timeoutInSeconds?: number } = {}
): Promise<void> {
    await stopDeviceOperation('starting new write');

    isWriting = true;
    nfcEvents.emit('WriteStart');

    const data = records.join('\n'); // crude payload for now
    await invoke<boolean>('nfc_write', { data });

    if (options.timeoutInSeconds && options.timeoutInSeconds > 0) {
        writeTimeout = setTimeout(
            () => stopWritingToTag('write operation timed out'),
            options.timeoutInSeconds * 1000
        );
    }

    isWriting = false;
    if (writeTimeout) {
        clearTimeout(writeTimeout);
        writeTimeout = null;
    }
    nfcEvents.emit('WriteStop');
}
