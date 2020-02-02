import test from "ava";
import {transcurse, Transcurses} from "../../lib";
import {exampleInput, exampleOutput, exampleTransform} from "../../examples/parse-using-type-property";

test("parse using type property example", t => {
    t.deepEqual(exampleTransform.apply(exampleInput), exampleOutput);
});
