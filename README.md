# A Javascript Calculator

Implemented with respect to the following criterion:

1. No use of eval().
2. Vanilla javascript (ES5) only.

The implementation uses regex recursively against the key-input. 

There is a [no-number-coercion](https://github.com/danielrob/calculator/blob/no-number-coercion/) branch which contains a (more convoluted) implementation with the additional constraint of not coercing numbers to strings and vice versa (except for final display). 

## Demo
See it in action [here](https://danielrob.github.io/calculator/site/). 


## Tests

[E2E style tests](https://github.com/danielrob/calculator/blob/master/tests/tests.js) with jasmine & karma. Key-input is tested against the expected screen output. Bug reports welcome. 

## Credits

All credit to [@GeoffStorbeck](https://twitter.com/GeoffStorbeck/status/657974198233526272) for the design and its implementation. This was a [FreeCodeCamp](http://www.freecodecamp.com/challenges/zipline-build-a-javascript-calculator) zipline exercise. 
