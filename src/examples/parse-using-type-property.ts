import {transformation, Transforms} from "../lib";

class ExampleObject {
    constructor(public blah: string) {

    }

    testProperty = 52;
}

export const transform = transformation(c => {
    if (c.val.type === "number") {
        return c.val.num;
    }
    return c.next(c.val);
}, c => {
    if (c.val.type === "string") {
        return c.val.str;
    }
    return c.next(c.val);
}, c => {
    if (c.val.type === "ExampleObject") {
        return new ExampleObject(c.val.arg);
    }
    return c.next(c.val);
}, c => {
    if (c.val.type === "nested") {
        return c.recurse(c.val.nested);
    }
    return c.next(c.val);
}, Transforms.structural);

export const exampleInput = {
    a: {
        type: "number",
        num: 52
    },
    b: {
        c: {
            type: "string",
            str: "abc"
        }
    },
    c: {
        type: "ExampleObject",
        arg: "abc"
    },
    d: {
        type: "nested",
        nested: {
            a: {
                type: "number",
                num: 10
            }
        }
    }
};

export const exampleOutput = {
    a: 52,
    b: {
        c: "abc"
    },
    c: new ExampleObject("abc"),
    d: {
        a: 10
    }
};
