import { describe, expect, it } from 'vitest';
import { centavosToPesos, formatPesos, pesosToCentavos } from '@/lib/money';

describe('money conversion', () => {
    it.each([
        ['0', 0],
        ['12', 1200],
        ['12.5', 1250],
        ['1,250.50', 125050],
    ])('converts %s pesos to integer centavos', (pesos, centavos) => {
        expect(pesosToCentavos(pesos)).toBe(centavos);
    });

    it.each(['', '-1', '1.234', 'abc'])(
        'rejects invalid peso input: %s',
        (value) => {
            expect(() => pesosToCentavos(value)).toThrow();
        },
    );

    it('renders centavos as a two-decimal peso input', () => {
        expect(centavosToPesos(125050)).toBe('1250.50');
    });

    it('formats centavos as a peso currency string', () => {
        expect(formatPesos(125050)).toBe('₱1,250.50');
        expect(formatPesos(0)).toBe('₱0.00');
    });
});
