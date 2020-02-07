import test from "ava";
import {transcurse, Transcurses} from "../../lib";
import {exampleInput, exampleOutput, exampleTransform} from "../../examples/parse-using-type-property";
import {numericStringToNumber} from "../../examples/numeric-string-to-number";

test("parse using type property example", t => {
    t.deepEqual(exampleTransform.apply(exampleInput), exampleOutput);
});

test("parse numeric string to number", t => {
    const input = {
        a: [{
            b: "150"
        }]
    };
    t.deepEqual(numericStringToNumber.apply(input), {
        a: [{
            b: 150
        }]
    });
});