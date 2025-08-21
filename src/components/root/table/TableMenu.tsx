import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarTrigger,
} from '@/components/ui/menubar';

type Props = {
    onRefresh?: () => void;
    onCreate?: () => void;
    onExport?: () => void;
    onPrint?: () => void;
};

export default function TableMenu(props: Props) {
    return (
        <Menubar>
            <MenubarMenu>
                <MenubarTrigger>Actions</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem
                        onSelect={() => {
                            props.onRefresh?.();
                        }}
                    >
                        Refresh
                    </MenubarItem>
                    <MenubarItem
                        onSelect={() => {
                            props.onCreate?.();
                        }}
                    >
                        Create
                    </MenubarItem>
                    <MenubarItem
                        onSelect={() => {
                            props.onExport?.();
                        }}
                    >
                        Export
                    </MenubarItem>
                    <MenubarItem
                        onSelect={() => {
                            props.onPrint?.();
                        }}
                    >
                        Print
                    </MenubarItem>
                </MenubarContent>
            </MenubarMenu>
        </Menubar>
    );
}
