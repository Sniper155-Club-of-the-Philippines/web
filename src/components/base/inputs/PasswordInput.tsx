'use client';

import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type Props = Omit<React.ComponentProps<'input'>, 'type'>;

/**
 * A password field that stays masked while typing, with an eye button to
 * reveal what was typed (many members check their input before submitting).
 */
const PasswordInput = React.forwardRef<HTMLInputElement, Props>(
    ({ className, disabled, ...props }, ref) => {
        const [visible, setVisible] = React.useState(false);

        return (
            <div className='relative'>
                <Input
                    ref={ref}
                    type={visible ? 'text' : 'password'}
                    disabled={disabled}
                    className={cn('pr-10', className)}
                    {...props}
                />
                <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    disabled={disabled}
                    aria-label={visible ? 'Hide password' : 'Show password'}
                    aria-pressed={visible}
                    onClick={() => setVisible((value) => !value)}
                    className='text-muted-foreground hover:text-foreground absolute top-1/2 right-0.5 size-8 -translate-y-1/2 hover:bg-transparent dark:hover:bg-transparent'
                >
                    {visible ? <EyeOff /> : <Eye />}
                </Button>
            </div>
        );
    },
);

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
