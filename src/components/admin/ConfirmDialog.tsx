'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

export function ConfirmDialog({
    title,
    description,
    onConfirm,
    disabled,
}: {
    title: string;
    description: string;
    onConfirm: () => void;
    disabled?: boolean;
}) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant='destructive' size='sm' disabled={disabled}>
                    Delete
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant='outline'>Cancel</Button>
                    </DialogClose>
                    <DialogClose asChild>
                        <Button variant='destructive' onClick={onConfirm}>
                            Delete
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
