export interface Role {
    id: string;
    name: string;
    permissions?: Permission[];
    users_count?: number;
}

export interface Permission {
    id: string;
    name: string;
}
