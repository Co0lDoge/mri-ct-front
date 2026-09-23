export type Tools = "rectangle" | "polygon" | "move";
export type Modes = "view" | "edit";
export type Modals = "addNode" | "editNode";

export interface IPaginated<T> {
    count: number;
    next: string;
    previous: string;
    results: T[];
}
