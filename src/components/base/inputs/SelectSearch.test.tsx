import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import SelectSearch from './SelectSearch';

// cmdk scrolls the active item into view and Radix Popover observes size;
// jsdom implements neither, so stub them before the components mount.
beforeAll(() => {
    Element.prototype.scrollIntoView = vi.fn();
    globalThis.ResizeObserver ??= class {
        observe() {}
        unobserve() {}
        disconnect() {}
    };
});

const options = [
    { value: '1', label: 'Reyes, Ana' },
    { value: '2', label: 'Cruz, Ben' },
];

// Both the trigger and the hidden native <select> expose the combobox role
// (Tailwind's `hidden` class is not applied under jsdom), so target the button.
const trigger = () =>
    document.querySelector('button[role="combobox"]') as HTMLElement;

// The labels also appear as native <option>s, so scope popover queries to the
// cmdk list to keep text lookups unambiguous.
const list = () =>
    within(document.querySelector('[cmdk-list]') as HTMLElement);

describe('SelectSearch', () => {
    it('shows the placeholder and mirrors options into a hidden native select', () => {
        render(
            <SelectSearch
                placeholder='Select a member'
                options={options}
                name='member'
            />,
        );

        expect(trigger()).toHaveTextContent(
            'Select a member',
        );

        // The hidden <select> keeps the field submittable and enumerates options.
        const native = document.querySelector('select[name="member"]');
        expect(native).not.toBeNull();
        expect(native?.querySelectorAll('option')).toHaveLength(2);
    });

    it('renders the selected option label on the trigger', () => {
        render(
            <SelectSearch options={options} value='2' placeholder='Pick one' />,
        );

        expect(trigger()).toHaveTextContent('Cruz, Ben');
    });

    it('opens the list and emits the chosen value through onChange', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(
            <SelectSearch
                options={options}
                placeholder='Pick one'
                onChange={onChange}
            />,
        );

        await user.click(trigger());
        await waitFor(() =>
            expect(document.querySelector('[cmdk-list]')).not.toBeNull(),
        );
        await user.click(list().getByText('Reyes, Ana'));

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange.mock.calls[0][0].target.value).toBe('1');
    });

    it('filters options by the typed query', async () => {
        const user = userEvent.setup();
        render(<SelectSearch options={options} placeholder='Pick one' />);

        await user.click(trigger());
        await user.type(
            await screen.findByPlaceholderText('Pick one'),
            'cruz',
        );

        expect(list().getByText('Cruz, Ben')).toBeInTheDocument();
        expect(list().queryByText('Reyes, Ana')).not.toBeInTheDocument();
    });
});
