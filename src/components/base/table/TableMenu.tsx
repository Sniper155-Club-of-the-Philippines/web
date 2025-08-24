import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarTrigger,
} from '@/components/ui/menubar';

type DisableKeys = 'print' | 'export' | 'create' | 'refresh';

type Props = {
    onRefresh?: () => void;
    onCreate?: () => void;
    onExport?: () => void;
    onPrint?: () => void;
    disable?: DisableKeys[];
};

export default function TableMenu(props: Props) {
    return (
        <Menubar>
            <MenubarMenu>
                <MenubarTrigger>Actions</MenubarTrigger>
                <MenubarContent>
                    {!props?.disable?.includes('refresh') && (
                        <MenubarItem
                            onSelect={() => {
                                props.onRefresh?.();
                            }}
                        >
                            Refresh
                        </MenubarItem>
                    )}
                    {!props?.disable?.includes('create') && (
                        <MenubarItem
                            onSelect={() => {
                                props.onCreate?.();
                            }}
                        >
                            Create
                        </MenubarItem>
                    )}
                    {!props?.disable?.includes('export') && (
                        <MenubarItem
                            onSelect={() => {
                                props.onExport?.();
                            }}
                        >
                            Export
                        </MenubarItem>
                    )}
                    {!props?.disable?.includes('print') && (
                        <MenubarItem
                            onSelect={() => {
                                props.onPrint?.();
                            }}
                        >
                            Print
                        </MenubarItem>
                    )}
                </MenubarContent>
            </MenubarMenu>
        </Menubar>
    );
}
