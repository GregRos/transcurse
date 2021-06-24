import test from "ava";
import {isObjectLike} from "lodash";
import {cloneDeep} from "../../lib";

test("scalars", t => {
    const my = cloneDeep.pre(c => c.next(c.val));
    t.is(my.apply(5), 5);
    t.is(my.apply("abc"), "abc");
    t.is(my.apply(null), null);
    t.is(my.apply(undefined), undefined);
    const symb = Symbol("abc");
    t.is(my.apply(symb), symb);
});

test("array", t => {
    const my = cloneDeep.pre(c => Array.isArray(c.val) ? c.next() : `${String(c.key)} ${typeof c.val}`);
    t.deepEqual(my.apply([1, "abc", {}]), ["0 number", "1 string", "2 object"]);
});

test("nested array", t => {
    const my = cloneDeep.pre(c => Array.isArray(c.val) ? c.next() : `${String(c.key)} ${typeof c.val}`);
    t.deepEqual(my.apply([[1], [2]]), [["0 number"], ["0 number"]]);
});

test("object", t => {
    const my = cloneDeep.pre(c => isObjectLike(c.val) ? c.next() : `${String(c.key)} ${typeof c.val}`);
    t.deepEqual(my.apply({
        a: "abc",
        b: "def"
    }), {
        a: "a string",
        b: "b string"
    });
});

test("nested object/array", t => {
    const my = cloneDeep.pre(c => isObjectLike(c.val) ? c.next() : `${String(c.key)} ${typeof c.val}`);
    t.deepEqual(my.apply({
        a: {
            b: [1]
        },
        b: []
    }), {
        a: {
            b: ["0 number"]
        },
        b: []
    });
});

