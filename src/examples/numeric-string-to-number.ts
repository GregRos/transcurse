import {cloneDeep, transcurse} from "../lib";
export const numericStringToNumber = transcurse(x => {
    return typeof x.val === "string" ? parseFloat(x.val) : x.next();
}, cloneDeep);
