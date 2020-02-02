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

Creating a transformation with a fallback that will recurse into each array element and sub-property:

```ts
import { Transcurses } from "transcurse";

const example = Transcurses.structural.step(c => {
    if (typeof c.val === "number") return c.val + 1;
    return c.next();
})
```





```ts
import { transcurse } from "transcurse";

export const transform = transcurse(c => {
    if (c.val && c.val.type === "ExampleObject") {
        return new ExampleObject(c.val.value);
    }
    return c.next(c.val);
});
```

Creating one that will 

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