import {transcurse, Transcurses} from "../lib";

class ExampleObject {
    constructor(public exampleProperty: number) {
    }
}

export const transform = transcurse(c => {
    if (c.val && c.val.type === "ExampleObject") {
        return new ExampleObject(c.val.value);
    }
    return c.next(c.val);
}, Transcurses.structural);

export const exampleInput = {
    property1: {
        value1: "abc"
    },
    property2: {
        value2: {
            type: "ExampleObject",
            value: 10
        }
    },
    property3: {
        type: "ExampleObject",
        value: 52
    }
};

