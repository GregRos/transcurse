import {transcurse, Transcurse} from "./basics";
/**
 * A structural transformation that recurses over array elements and own object properties.
 */
export const cloneDeep: Transcurse = transcurse(c => {
    const {val} = c;
    if (!val || typeof val !== "object") return c.next(val);
    if (Array.isArray(val)) {
        return val.map((item, i) => c.recurse(item, i));
    }
    let newObj = Object.create(Object.getPrototypeOf(val));
    for (let key of Object.keys(val)) {
        newObj[key] = c.recurse(val[key], key);
    }
    return newObj;
});

export const forOwnDeep: Transcurse = transcurse(c => {
    const {val} = c;
    if (!val || typeof val !== "object") return c.next(val);
    if (Array.isArray(val)) {
        val.forEach((item, i) => c.recurse(item, i));
    }
    for (let key of Object.keys(val)) {
        c.recurse(val[key], key);
    }
});

/**
 * The identity transformation.
 */
export const id: Transcurse = transcurse();
