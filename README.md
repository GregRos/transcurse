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
import {Transcurses} from "transcurse";

const transform = Transcurses.structural.pre(c => {
    return typeof c.val === "number" ? c.val + 1 : c.next();
}, c => {
    return typeof c.val === "string" ? c.val + "abc" : c.next();
})
```

The `structural` transform provides a fallback that will recurse into sub-properties of objects. In the transformation step, `c.next()` will invoke the following transformation steps.

Calling `c.next()` on the last transformation step will enter the fallback part of the transformation.

## Transformation step

Each transformation step is a function that takes a `context` parameter. This parameter gives the current state of the transformation, and has the following interface:

```typescript
interface TranscurseControl {
	readonly val: any;
    recurse(nested): any;
	next(value): any;
	readonly isLast: boolean;
}
```

This interface is supposed to be immutable from the point of view of the caller; you shouldn't mutate any of its properties.

1. `val` allows access the current value being transformed.
2. `recurse` will perform recursion, invoking the entire transformation, including the current step on a new input.