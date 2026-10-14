import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import PasswordInput from './PasswordInput';

describe('PasswordInput', () => {
    it('masks the value until the eye button reveals it', async () => {
        const user = userEvent.setup();
        render(<PasswordInput aria-label='Password' />);

        const input = screen.getByLabelText('Password');
        await user.type(input, 'kT4m@Qz9');

        expect(input).toHaveAttribute('type', 'password');

        await user.click(screen.getByRole('button', { name: 'Show password' }));
        expect(input).toHaveAttribute('type', 'text');
        expect(input).toHaveValue('kT4m@Qz9');

        await user.click(screen.getByRole('button', { name: 'Hide password' }));
        expect(input).toHaveAttribute('type', 'password');
    });

    it('does not submit the surrounding form when toggled', async () => {
        const user = userEvent.setup();
        let submitted = false;
        render(
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    submitted = true;
                }}
            >
                <PasswordInput aria-label='Password' />
            </form>,
        );

        await user.click(screen.getByRole('button', { name: 'Show password' }));

        expect(submitted).toBe(false);
    });

    it('forwards the ref so react-hook-form can register it', () => {
        const ref = createRef<HTMLInputElement>();
        render(<PasswordInput ref={ref} aria-label='Password' />);

        expect(ref.current).toBe(screen.getByLabelText('Password'));
    });

    it('disables the toggle with the input', () => {
        render(<PasswordInput aria-label='Password' disabled />);

        expect(
            screen.getByRole('button', { name: 'Show password' }),
        ).toBeDisabled();
    });
});
