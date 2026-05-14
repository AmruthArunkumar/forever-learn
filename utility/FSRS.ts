import { Card, CardStats } from "./types";

const F: number = 19.0 / 81.0;
const C: number = -0.5;
const W: number[] = [
    0.40255, // initial stability for Grade.Forgot
    1.18385, // initial stability for Grade.Hard
    3.173, // initial stability for Grade.Good
    15.69105, // initial stability for Grade.Easy
    7.1949,
    0.5345,
    1.4604,
    0.0046,
    1.54575,
    0.1192,
    1.01925,
    1.9395,
    0.11,
    0.29605,
    2.2698,
    0.2315, // hard penalty for stability
    2.9898, // easy bonus for stability
    0.51655,
    0.6621,
];

export enum Grade {
    Forgot = 1.0,
    Hard = 2.0,
    Good = 3.0,
    Easy = 4.0,
}

// F: constant
// C: constant
// W: 19 learned parameter constants
// s: stability of card
// t: time in days since last review
// r: retrievability
// rd: desired retention/retrievability
// g: grade

// retrievability at time t
export function retrievability(t: number, s: number) {
    return Math.pow(1.0 + F * (t / s), C);
}

// time at which retrievability goes to desired retention
export function interval(rd: number, s: number) {
    return (s / F) * (Math.pow(rd, 1.0 / C) - 1.0);
}

// initial stability given grade
export function initialStability(g: Grade) {
    switch (g) {
        case Grade.Forgot:
            return W[0];
        case Grade.Hard:
            return W[1];
        case Grade.Good:
            return W[2];
        case Grade.Easy:
            return W[3];
    }
}

// stability on success
export function successStability(d: number, s: number, r: number, g: Grade) {
    const Td = 11.0 - d;
    const Ts = Math.pow(s, -W[9]);
    const Tr = Math.exp(W[10] * (1 - r)) - 1;
    const h = g == Grade.Hard ? W[15] : 1.0;
    const b = g == Grade.Easy ? W[16] : 1.0;
    const c = Math.exp(W[8]);
    const alpha = 1.0 + Td * Ts * Tr * h * b * c;
    return s * alpha;
}

// stability on failure
export function failureStability(d: number, s: number, r: number) {
    const Df = Math.pow(d, -W[12]);
    const Sf = Math.pow(s + 1.0, W[13]) - 1.0;
    const Rf = Math.exp(W[14] * (1.0 - r));
    const Cf = W[11];
    return Math.min(Df * Sf * Rf * Cf, s);
}

// stability for failure or success
export function stability(d: number, s: number, r: number, g: Grade) {
    return g == Grade.Forgot ? failureStability(d, s, r) : successStability(d, s, r, g);
}

// clamp difficulty between 1 and 10
export function clampD(d: number) {
    return Math.max(1.0, Math.min(10.0, d));
}

// initial difficulty
export function initialDifficulty(g: Grade) {
    const grade = g as number;
    return clampD(W[4] - Math.exp(W[5] * (grade - 1.0)) + 1.0);
}

// delta D
export function deltaD(g: Grade) {
    const grade = g as number;
    return -W[6] * (grade - 3.0);
}

// delta prime
export function deltaPrime(d: number, g: Grade) {
    return d + deltaD(g) * ((10.0 - d) / 9.0);
}

// difficulty
export function difficulty(d: number, g: Grade) {
    return clampD(W[7] * initialDifficulty(Grade.Easy) + (1.0 - W[7]) * deltaPrime(d, g));
}

// check strong
export function checkStrong(c: Card | CardStats) {
    if (!c.last_review || !c.stability) return false;
    const timeDiff = new Date().getTime() - new Date(c.last_review!).getTime();
    const r = retrievability(Math.max(0, timeDiff / (1000 * 60 * 60 * 24)), c.stability);
    return r >= 0.9 && interval(0.9, c.stability) >= 2.0;
}

// check learning
export function checkLearning(c: Card | CardStats) {
    if (!c.last_review || !c.stability) return false;
    return interval(0.9, c.stability) < 2.0;
}

// check fading
export function checkFading(c: Card | CardStats) {
    if (!c.last_review || !c.stability) return false;
    const timeDiff = new Date().getTime() - new Date(c.last_review!).getTime();
    const r = retrievability(Math.max(0, timeDiff / (1000 * 60 * 60 * 24)), c.stability);
    return r < 0.9 && r >= 0.8 && interval(0.9, c.stability) >= 2.0;
}

// check forgotten
export function checkForgotten(c: Card | CardStats) {
    if (!c.last_review || !c.stability) return false;
    const timeDiff = new Date().getTime() - new Date(c.last_review!).getTime();
    const r = retrievability(Math.max(0, timeDiff / (1000 * 60 * 60 * 24)), c.stability);
    return r <= 0.8 && interval(0.9, c.stability) >= 2.0;
}
