import {transcurse, Transcurse} from "./basics";

/**
 * A structural transformation that recurses over array elements and own object properties.
 */
export const structural: Transcurse = transcurse(c => {
    const {val} = c;
    if (!val || typeof val !== "object") return c.next(val);
    if (Array.isArray(val)) {
        return val.map(item => c.recurse(item));
    }
    let newObj = Object.create(Object.getPrototypeOf(val));
    for (let key of Object.keys(val)) {
        newObj[key] = c.recurse(val[key]);
    }
    return newObj;
});

/**
 * The identity transformation.
 */
export const id: Transcurse = transcurse();