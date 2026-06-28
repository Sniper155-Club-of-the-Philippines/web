/** Laravel length-aware paginator payload (the fields the UI relies on). */
export interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}
