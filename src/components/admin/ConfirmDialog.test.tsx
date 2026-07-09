import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { ConfirmDialog } from './ConfirmDialog';

beforeAll(() => {
    Element.prototype.scrollIntoView = vi.fn();
    globalThis.ResizeObserver ??= class {
        observe() {}
        unobserve() {}
        disconnect() {}
    };
});

const setup = (disabled = false) => {
    const onConfirm = vi.fn();
    render(
        <ConfirmDialog
            title='Delete role?'
            description='This cannot be undone.'
            onConfirm={onConfirm}
            disabled={disabled}
        />,
    );
    // The trigger and the footer both label a button "Delete"; the trigger is
    // the only one rendered before the dialog opens.
    return { onConfirm };
};

describe('ConfirmDialog', () => {
    it('reveals the title and description only after the trigger is pressed', async () => {
        const user = userEvent.setup();
        setup();

        expect(screen.queryByText('Delete role?')).not.toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Delete' }));

        expect(await screen.findByText('Delete role?')).toBeInTheDocument();
        expect(screen.getByText('This cannot be undone.')).toBeInTheDocument();
    });

    it('confirms only when the destructive action is chosen', async () => {
        const user = userEvent.setup();
        const { onConfirm } = setup();

        await user.click(screen.getByRole('button', { name: 'Delete' }));
        const dialog = await screen.findByRole('dialog');
        await user.click(within(dialog).getByRole('button', { name: 'Delete' }));

        expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('does not confirm when the dialog is dismissed', async () => {
        const user = userEvent.setup();
        const { onConfirm } = setup();

        await user.click(screen.getByRole('button', { name: 'Delete' }));
        await user.click(await screen.findByRole('button', { name: 'Cancel' }));

        expect(onConfirm).not.toHaveBeenCalled();
        expect(screen.queryByText('Delete role?')).not.toBeInTheDocument();
    });

    it('cannot be opened while disabled', async () => {
        const user = userEvent.setup();
        setup(true);

        const trigger = screen.getByRole('button', { name: 'Delete' });
        expect(trigger).toBeDisabled();

        await user.click(trigger);
        expect(screen.queryByText('Delete role?')).not.toBeInTheDocument();
    });
});
