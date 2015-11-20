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
    correction: function(char, count) {
      count = count || 2;
      var current = this.node.innerHTML;
      this.write(current.substr(0, current.length - count) + char);
    },
    addChar: function(char) {
      this.node.innerHTML += char;
    },
    read: function() {
      return this.node.innerHTML;
    }
  };

  var screen = new Screen(document.getElementById('screen'));

  /*
    Calculator operates on a screen in response to its .newKey method calls.
  */
  var Calculator = window.Calculator = (function(screen) {
    /*
      Numbr - so we can build decimal numbers from a stream of key inputs.
    */
    function Numbr(value) {
      this.value = value;
      this.decimals = 0;
      this.startDecimaling = false;
      this.negated = false;
    }

    function strip(number) {
      return parseFloat(number.toPrecision(12));
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
        this.value = this.value || 0;
        var unNegated = this.value /  Math.pow(10, this.decimals);
        var negated = this.negated ? -unNegated : unNegated;
        if (negated >  Math.pow(10, 11)) {
          return Number(negated.toExponential(11)).toPrecision(8);
        } else {
          return strip(negated);
        }
      },
      startDecimal: function() {
        this.startDecimaling = true;
        if (!this.value) this.value = 0;
      },
      isValued: function() {
        return (this.value || this.value === 0);
      },
      negate: function() {
        this.negated = !this.negated;
      }
    };

    // Init Calculator
    var firstNumbr = new Numbr(),
      secondNumbr = new Numbr(),
      opPending = false,
      equalsApplied = false;

    function applyOperation() {
      if (firstNumbr.isValued() && secondNumbr.isValued() && !!opPending) {
        firstNumbr = opPending(firstNumbr, secondNumbr);
        secondNumbr = new Numbr();
        opPending = false;
        return true;
      }
      return false;
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
      "/": function divide(a, b) {
        return new Numbr(a.toDecimal() / b.toDecimal());
      },
      "x^y": function powerOf(a, b) {
        return new Numbr(Math.pow(a.toDecimal(), b.toDecimal()));
      }
    };

    var functions = {
      "AC": function allClear() {
        firstNumbr = new Numbr();
        secondNumbr = new Numbr();
        opPending = false;
        equalsApplied = false;
        screen.clear();
      },
      "CE": function clearEntry() {
        if (!opPending) {
          firstNumbr = new Numbr();
          screen.clear();
        } else {
          opPending = null;
          secondNumbr = new Numbr();
          screen.write(firstNumbr.toDecimal());
        }
      },
      "=": function equals() {
        applyOperation();
        equalsApplied = true;
        screen.clear();
        screen.write(firstNumbr.toDecimal());
      },
      ".": function decimal() {
        applyToCurrentNumber(function(num) {
          if (num.startDecimaling) screen.correction('', 1);
          num.startDecimal();
        });
        equalsApplied = false;
      },
      "%": function percent() {
        var first;
        applyToCurrentNumber(function(num) {
          num.decimals += 2;
        });
        if (opPending === operations['+']) {
          first = firstNumbr;
          opPending = operations.x;
          functions['=']();
          opPending = operations['+'];
          secondNumbr = first;
          functions['=']();
        } else if (opPending === operations['-']) {
          first = firstNumbr;
          opPending = operations.x;
          functions['=']();
          opPending = operations['-'];
          secondNumbr = firstNumbr;
          firstNumbr = first;
          functions['=']();
        } else {
          functions['=']();
        }
      },
      "+/-": function swapSign() {
        if (!firstNumbr.isValued()) {
          screen.clear();
          return;
        }
        this['=']();
        applyToCurrentNumber(function(num) {
          num.negate();
        });
        screen.write(firstNumbr.toDecimal());
      }
    };


    return {
      sendKey: function(theKey) {


        if (theKey !== '=') screen.addChar(theKey);

        if (typeof theKey === 'number') {

          if (equalsApplied) {
            firstNumbr = new Numbr();
            opPending = false;
            equalsApplied = false;
            screen.write(theKey);
          }


          applyToCurrentNumber(function(num) {
            // Leading zeros problem
            if (num.isValued() && !num.startDecimaling && num.value ===
              0) {
              if (theKey === 0) {
                screen.correction('', 1);
              } else {
                screen.correction(theKey);
              }
            }
            // Build the number up
            num.shift(theKey);
          });

        } else if (typeof operations[theKey] === 'function') {

          // Minus is special
          if (theKey === "-") {
            if (!firstNumbr.isValued()) {
              firstNumbr.negate();
              screen.correction('-');
              return;
            } else if (!!opPending && !secondNumbr.isValued() && !
              secondNumbr.negated) {
              secondNumbr.negate();
              return;
            }
          }

          // No first number? Correct screen and get out of here.
          if (!firstNumbr.isValued()) {
            screen.correction('', 1);
            return;
          }

          // Now, if triplet exists, reduce it & wipe pending operations.
          applyOperation();

          // Don't enter pending operation set/overwrite after negated number.
          if (!!opPending && secondNumbr.negated) {
            screen.correction('', 1);
            return;
          }

          // Set / Overwrite the pending operation.
          if (!!opPending) screen.correction(theKey);
          opPending = operations[theKey];

          // Ensure we will accept new numbers after equals
          equalsApplied = false;

        } else if (typeof functions[theKey] === 'function') functions[
          theKey]();
      },

      error: function() {
        functions.AC();
      }
    };

  })(screen);



  (function createKeyEventHandlers() {
    var keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, "AC", "=", ".", "/", "+", "-",
      "x", "x^y", "+/-", "%"
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

  (function clock() {
    var timeNode = document.getElementById('time');

    function update() {
      var date = new Date();
      var meridies = date.getHours() <  13 ? 'AM' : 'PM';
      var hours = date.getHours() % 12;
      var minutes = date.getMinutes() <  10 ?
        '0' + date.getMinutes() : date.getMinutes();
      timeNode.innerHTML = hours + ':' + minutes + ' ' + meridies;
    }
    update();
    setInterval(update, 1000 * 60);
  })();

})();
