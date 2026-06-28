import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import DateTimePicker from './DateTimePicker';

describe('DateTimePicker', () => {
    it('works as a controlled field with a non-submit trigger', () => {
        const selected = new Date(2026, 6, 1, 9, 30);
        const { rerender } = render(
            <DateTimePicker
                value={selected}
                formatString='MMM D, YYYY h:mm A'
                placeholder='Select window'
                aria-invalid
            />,
        );

        const trigger = screen.getByRole('button');
        expect(trigger).toHaveTextContent('Jul 1, 2026 9:30 AM');
        expect(trigger).toHaveAttribute('type', 'button');
        expect(trigger).toHaveAttribute('aria-invalid', 'true');

        rerender(
            <DateTimePicker
                value={undefined}
                formatString='MMM D, YYYY h:mm A'
                placeholder='Select window'
            />,
        );

        expect(screen.getByRole('button')).toHaveTextContent('Select window');
    });
});
