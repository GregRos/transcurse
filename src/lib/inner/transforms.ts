import {TranscurseStep} from "./basics";

/**
 * A namespace for different standard transformations.
 */
export namespace Transforms {
    /**
     * A structural transformation that recurses over array elements and object properties.
     */
    export const structural: TranscurseStep = c => {
        const {val} = c;
        if (!val || typeof val !== "object") return c.next ? c.next(val) : val;
        if (Array.isArray(val)) {
            return val.map(item => c.recurse(item));
        }
        let newObj = Object.create(Object.getPrototypeOf(val));
        for (let key of Object.keys(val)) {
            newObj[key] = c.recurse(val[key]);
        }
        return newObj;
    };

    /**
     * The identity transformation.
     */
    const id: TranscurseStep = c => {
        return c.next ? c.next(c.val) : c.val;
    };

}
