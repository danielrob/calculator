(function() {
  "use strict";

  /*
    Screen
  */
  function Screen(node) {
    this.node = node;
  }

  Screen.prototype = {
    write: function(html) {
      this.node.innerHTML = html;
    },
    clear: function() {
      this.node.innerHTML = null;
    }
  };

  var screen = new Screen(document.getElementById('screen'));

  /*
    Calculator operates on a screen in response to its .newKey method calls.
  */
  var Calculator = (function(screen) {
    /*
      Numbr - so we can build decimal numbers from a stream of key inputs.
    */
    function Numbr(value) {
      this.value = value;
      this.decimals = 0;
    }

    Numbr.prototype = {
      shift: function(num) {
        if (!this.isValued() && !this.startDecimaling) {
          this.value = num;
          return;
        }
        this.value = this.value * 10 + num;
        if (this.startDecimaling) this.decimals++;
      },
      toDecimal: function() {
        return this.value /  Math.pow(10, this.decimals);
      },
      startDecimal: function() {
        this.startDecimaling = true;
        if (!this.value) this.value = 0;
      },
      isValued: function() {
        return (this.value || this.value === 0);
      }
    };

    // Init Calculator
    var firstNumbr = new Numbr(),
      secondNumbr = new Numbr(),
      opPending = false;

    function applyOperation() {
      firstNumbr = opPending(firstNumbr, secondNumbr);
      secondNumbr = new Numbr();
    }

    function applyToCurrentNumber(fn) {
      if (!opPending) fn(firstNumbr);
      else fn(secondNumbr);
    }

    var operations = {
      "+": function plus(a, b) {
        return new Numbr(a.toDecimal() + b.toDecimal());
      },
      "-": function minus(a, b) {
        return new Numbr(a.toDecimal() - b.toDecimal());
      },
      "x": function multiply(a, b) {
        return new Numbr(a.toDecimal() * b.toDecimal());
      },
      "%": function divide(a, b) {
        return new Numbr(a.toDecimal() / b.toDecimal());
      },
    };

    var functions = {
      "AC": function allClear() {
        firstNumbr = new Numbr();
        secondNumbr = new Numbr();
        opPending = false;
        screen.clear();
      },
      "CE": function clearEntry() {
        applyToCurrentNumber(function(num) {
          num = new Numbr();
          screen.clear();
        });
      },
      "=": function equals() {
        if (!!opPending && secondNumbr.isValued()) {
          applyOperation();
          screen.write(firstNumbr.value);
        }
      },
      ".": function decimal() {
        applyToCurrentNumber(function(num) {
          num.startDecimal();
          screen.write(num.toDecimal());
        });
      },
    };

    return {
      sendKey: function(theKey) {

        if (typeof theKey === 'number') {
          applyToCurrentNumber(function(num) {
            num.shift(theKey);
            screen.write(num.toDecimal());
          });

        } else if (typeof operations[theKey] === 'function') {
          // A first number is required for an operation to be applicable.
          if (!firstNumbr.isValued()) return;
           // If we already have a (firstNumber, operation, secondNumber) triplet.
          if (!!opPending && secondNumbr.isValued()) {
            applyOperation();
            screen.write(firstNumbr.toDecimal());
          }
          // Set or Overwrite the next operation.
          opPending = operations[theKey];

        } else if (typeof functions[theKey] === 'function') {
          functions[theKey]();
        }

      }
    };

  })(screen);


  (function createKeyEventHandlers() {
    var keys =
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, "AC", "CE", "=", ".", "%", "+", "-", "x"];
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

})();