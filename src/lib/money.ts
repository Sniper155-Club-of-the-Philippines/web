export function pesosToCentavos(value: string): number {
    const normalized = value.trim().replace(/,/g, '');

    if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) {
        throw new Error('Enter a valid peso amount with up to two decimals.');
    }

    const [pesos, fraction = ''] = normalized.split('.');
    return Number(pesos) * 100 + Number(fraction.padEnd(2, '0'));
}

export function centavosToPesos(value: number): string {
    return (value / 100).toFixed(2);
}

export function formatPesos(value: number): string {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    }).format(value / 100);
}
