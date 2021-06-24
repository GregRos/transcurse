# Transcurse
![CI](https://github.com/GregRos/transcurse/workflows/CI/badge.svg)
[![Coverage Status](https://coveralls.io/repos/github/GregRos/transcurse/badge.svg?branch=master)](https://coveralls.io/github/GregRos/transcurse?branch=master)
[![npm version](https://badge.fury.io/js/transcurse.svg)](https://badge.fury.io/js/transcurse)

Transcurse is a library for creating controllable, recursive, and composable data transformations.

1. Composable, because they form a composition of multiple individual transformation functions, each changing the value being transformed.
2. Controllable, because each function step in the transformation can halt the process, move on to the next step, or restart the whole transformation with a different input - that is, recursively invoke the entire transformation.

Transcurse is great for building transformations step by step, adding individual handlers for specific inputs, and for transforming deeply nested structures.

## Installation

```bash
yarn add transcurse
```

or,

```
npm install --save transcurse
```

## Example

Let's say you want a transformation that recurses into object properties and array elements, and increments all numbers by 1 and addes `"abc"` to the end of all strings.

```ts
import {transcurse, Transcurses} from "transcurse"
export const numericStringToNumber = transcurse(x => {
    return typeof x.val === "string" ? parseFloat(x.val) : x.next();
}, Transcurses.structural);
```

The `structural` transform provides a fallback that will recurse into sub-properties of objects. In the transformation step, `c.next()` will invoke the following transformation steps.

Calling `c.next()` on the last transformation step will enter the fallback part of the transformation.

## Transformation step

Each transformation step is a function that takes a `ctrl` parameter and returns an output. This parameter lets you inspect and control the current step of the transformation. It lets you:

1. Inspect the current input being transformed. (`ctrl.val`)
2. Execute the next step of the transformation. (`ctrl.next(v)`)
3. Restart the transformation with a different input, usually a sub-value. (`ctrl.recurse(v)`)
4. Determine if this is the last step of the transformation. (`ctrl.isLast`)

The step after the last step is an identity transformation.

