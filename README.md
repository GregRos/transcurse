# Transcurse
[![Build Status](https://travis-ci.org/GregRos/transcurse.svg?branch=master)](https://travis-ci.org/GregRos/transcurse)
[![codecov](https://codecov.io/gh/GregRos/transcurse/branch/master/graph/badge.svg)](https://codecov.io/gh/GregRos/transcurse)
[![npm version](https://badge.fury.io/js/transcurse.svg)](https://badge.fury.io/js/transcurse)

Transcurse is a library for creating controllable, recursive, and composable data transformations.

A Transcurse transformation is composed of multiple functions, each being a distinct step. Each such step that change the value being transformed, invoke proceeding transformation steps, or perform recursion by applying the entire transformation on a different value (such as the value of a property).

These transformations are composable, because you can use existing transformations instead of individual transformation steps. This lets different parts of the code add transformation handlers for different cases, without knowing about each other.