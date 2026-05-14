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
    stability: number | null;
    difficulty: number | null;
    last_review: string | null;
    special_type: string | null;
}

export interface CardStats {
    stability: number | null;
    difficulty?: number | null;
    last_review: string | null;
}

export interface UserType {
    user_id: string;
    email: string;
    created_at?: string;
}
