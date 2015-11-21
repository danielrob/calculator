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
          Reduces an 'item-operation-item' triplet where an 'item' is
          a number or percentage (e.g. 34 or 79%) to the resulting number.
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
          if (Math.abs(outFormat) >  Math.pow(10, 11)) {
            return String(Number(outFormat.toExponential(11)).toPrecision(7));
          } else {
            return String(parseFloat(outFormat.toPrecision(12))).substring(0,13);
          }
        };

      if (input === '') return 0;
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
      return str
      // change of operation (e.g. +/ -> /)
      .replace(/[x\+\/\-]([x\+\/])/, '$1')
      // leading minuses (e.g. --9 -> -9)
      .replace(/^--/, '-')
      // too many minuses (e.g. +-- -> -)
      .replace(/([\+\-\/x])--/, '$1-')
      // Leading zeros
      .replace(/^(\-?)0([0-9])/, '$1$2')
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
      'C': function(){
        screen.write(screen.read().slice(0, -1));
      }
    };

    return {
    // Calculator API
      sendKey: function(theKey) {
        if (lastKey === '=') {
          if (!isNaN(Number(theKey))) {
            screen.clear();
          } else if (theKey !== 'C' && theKey !== '=' && screen.read() !==
                      answerScreen.read()){
            screen.write('(' + screen.read() + ')');
          }
          if (theKey === '=') screen.write(answerScreen.read());
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
  // End var = Calculator

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
  FastClick.attach(document.body);

  // Activate the no-touch class on non-touch devices.
  if (!("ontouchstart" in document.documentElement)) {
    document.body.className += "no-touch";
  }

  // Create all event handlers
  (function createEventHandlers() {
    var buttons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', "AC", "=", ".",
     "/", "+", "-", "x", "(", ")", "%"
      ],
    // Touchstart is more suitable than click on mobile.
    clickType = ("ontouchstart" in document.documentElement) ? 'touchstart' :
                 'click';

    // Calc button click event handlers
    var createHandler = function(el, button) {
        el.addEventListener(clickType, function() {
        Calculator.sendKey(button);
      });
    };
    for (var i = 0; i <  buttons.length; i++) {
      var button = buttons[i];
      createHandler(document.getElementById(button), button);
    }

    // Handle key events
    document.addEventListener('keypress', function(event) {
      // polyfill event.key in Chrome
      if (!event.key) event.key = keyCodeMap[event.keyCode];
      // send the keys which correspond to button ids.
      if (buttons.indexOf(event.key) !== -1) Calculator.sendKey(event.key);
      // send a couple others too.
      if(!!keyMap[event.key]) Calculator.sendKey(keyMap[event.key]);
    });

    // Backspace key event handler (override default browsing behaviour)
    document.addEventListener('keydown', function(event){
      if (event.keyCode === 8) {
        event.preventDefault();
        Calculator.sendKey('C');
      }
    });

    var keyMap = {
      'Enter': '=',
      'A': 'AC',
      'a': 'AC',
      ',': '.',
    };

    // Map to polyfill event.key in Chrome.
    var keyCodeMap = {
      '97': 'a',
      '65': 'A',
      '40': '(',
      '41': ')',
      '48': '0',
      '49': '1',
      '50': '2',
      '51': '3',
      '52': '4',
      '53': '5',
      '54': '6',
      '55': '7',
      '56': '8',
      '57': '9',
      '42': 'x',
      '120': 'x',
      '106': 'x',
      '43': '+',
      '107': '+',
      '45': '-',
      '109': '-',
      '189': '-',
      '44': ',',
      '110': '.',
      '190': '.',
      '47': '/',
      '111': '/',
      '191': '/',
      '13': '=',
      '61': '=',
      '187': '=',
    };

  }());
  // End Event Handler creation
})();
