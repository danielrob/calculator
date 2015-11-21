(function() {
  "use strict";

  /*
    Screen
  */
  var Screen = window.Screen = function(node) {
    this.node = node;
  };

  Screen.prototype = {
    write: function(html) {
      this.node.innerHTML = html;
    },
    clear: function() {
      this.node.innerHTML = null;
    },
    read: function() {
      return this.node.innerHTML;
    }
  };

  var screen = new Screen(document.getElementById('historyScreen'));
  var answerScreen = new Screen(document.getElementById('screen'));
  /*
    Calculator operates on a screen in response to its .newKey method calls.
  */
  var Calculator = window.Calculator = (function(screen, answerScreen) {
    var lastKey = '';

    var ops = {
      "+": function(a, b) { return a + b; },
      "-": function(a, b) { return a - b; },
      "x": function(a, b) { return a * b; },
      "/": function(a, b) { return a / b; },
    };

    function equate() {
      // This variable is mutated throughout this function execution.
      var input = screen.read(),

        /*
          Computes 'item-operation-item' triplet where an 'item' is
          a number or percentage (e.g. 34 or 79%).
        */
        computeTriplet = function computeTriplet(triplet) {
          var a = triplet[1],
            op = triplet[2],
            b = triplet[3],
            aIsPercentage = a.match(/(.+)\%/),
            bIsPercentage = b.match(/(.+)\%/);

          // cast
          a = !aIsPercentage ? Number(a) : Number(aIsPercentage[1]) / 100;
          b = !bIsPercentage ? Number(b) : Number(bIsPercentage[1]) / 100;
          // a +- b% = a +- (a * b/100);
          if (bIsPercentage && (op === '+' || op === '-')) b = a * b;
          // apply the operation
          return ops[op](a, b);
        },

        /*
          Compute finds the next triplet to compute, gets the result,
           and updates input repditively, until there are no triplets left.
        */
        compute = function compute() {

          // First are there any triplets inside brackets
          var brackets = input.match(/\(([0-9.]+[\+\-\/x]\-?[0-9.])\)/),

            // Regex a triplet from inside brackets or the input.
              triplet = (function(matchable) {
                  return matchable.match(
                  /(\-?[0-9.]+\%?)([\+\-\/x])(\-?[0-9.]+\%?)/);
              })(!!brackets ? brackets[1] : input);

          // Nothing found? Handle the percentage case (e.g. 34%=) then return.
          if (!triplet) {
            var isPercentage = input.match(/(^\-?[0-9.]+)%$/);
            if (!!isPercentage) input = String(Number(isPercentage[1]) / 100);
            return;
          }

          // Otherwise compute the triplet
          var result = computeTriplet(triplet);
          input = input.replace(
            /\(?\-?[0-9.]+\%?[\+\-\/x]\-?[0-9.]+\%?\)?/,
            result);

          // Repeat
          compute();
        },

        //  Clean up the likes of (((7))) or --12
        sanitizeOutput = function sanitizeOutput() {
          var inCopy = input;
          input = input.replace(/\((\-?[0-9]+)\)/, '$1');
          input = input.replace(/\-{2}/, '');
          if (inCopy !== input) sanitizeOutput();
        },

        // Take a heuristic (most-cases) approach to double float representation
        displayFormattted = function displayFormattted() {
          var outFormat = parseFloat(input, 10);
          if (outFormat >  Math.pow(10, 11)) {
            return Number(outFormat.toExponential(11)).toPrecision(8);
          } else {
            return parseFloat(outFormat.toPrecision(12));
          }
        };

      // Remove superfluous brackets before we start (e.g. (4) )
      input = input.replace(/\((\-?[0-9.]+)\)/g, '$1');
      // Go!
      compute();
      // Make the computation result clean.
      sanitizeOutput();

      // Return the formatted result
      return isNaN(parseFloat(input, 10)) ? 'Error' : displayFormattted();
    }

    function sanitizeInput(str) {
      // change of operation (e.g. +x -> x)
      return str.replace(/[x\+\/\-]([x\+\/])/, '$1')
      // too many minuses (e.g. --- -> -)
      .replace(/\-{3}/, '--')
      // Leading zeros
      .replace(/^0([0-9])/, '$1')
      // Misplaced decimals
      .replace(/\.{2}/, '.')
      .replace(/(\.[0-9]+)\./, '$1')
      // Implicit Multiplication
      .replace(/([0-9.]+)\(/, '$1x(');
    }

    var functions = {
      '=': function() { answerScreen.write(equate()); },
      'AC': function() {
        screen.clear();
        answerScreen.clear();
      },
    };

    // Calculator API
    return {
      sendKey: function(theKey) {
        if (lastKey === '=') {
          if (typeof theKey === 'number') {
            screen.clear();
          } else {
            screen.write('(' + screen.read() + ')');
          }
        }
        lastKey = theKey;

        if (typeof functions[theKey] === 'function') {
          functions[theKey]();
          return;
        }
        screen.write(sanitizeInput(screen.read() + theKey));
      }
    };

  })(screen, answerScreen);

  // Create Event Handlers for the calculator keys in the DOM.
  (function createKeyEventHandlers() {
    var keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, "AC", "=", ".", "/", "+", "-",
      "x", "(", ")", "%"
    ];
    var createHandler = function(el, key) {
      el.addEventListener("click", function() {
        Calculator.sendKey(key);
      });
    };
    for (var i = 0; i <  keys.length; i++) {
      var key = keys[i];
      createHandler(document.getElementById(key), key);
    }
  })();

  // Set clock and make it run.
  (function clock() {
    var timeNode = document.getElementById('time');

    function update() {
      var date = new Date();
      var meridies = date.getHours() <  12 ? 'AM' : 'PM';
      var hours = date.getHours() === 12 ? 12 : date.getHours() % 12;
      var minutes = date.getMinutes() <  10 ?
        '0' + date.getMinutes() : date.getMinutes();
      timeNode.innerHTML = hours + ':' + minutes + ' ' + meridies;
    }
    update();
    setInterval(update, 1000 * 60);
  })();

  // Add Fast Click to remove 300ms delay from mobile devices
  if ('addEventListener' in document) {
      document.addEventListener('DOMContentLoaded', function() {
          FastClick.attach(document.body);
      }, false);
  }

  // Activate the no-touch class on non-touch devices.
  if (!("ontouchstart" in document.documentElement)) {
    document.body.className += "no-touch";
  }

})();
