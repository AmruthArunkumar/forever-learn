export interface Set {
    set_id: number;
    user_id: string;
    name: string;
    maintain: boolean;
    type: string;
    created_at: string;
}

export interface Card {
    card_id: number;
    set_id: number;
    front: string;
    back: string;
    created_at: string;
}