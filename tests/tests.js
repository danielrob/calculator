var screen = function screen() {
  if (!screen.node) {
    screen.node = document.getElementById('screen');
  }
  return screen.node.innerHTML;
}

function input(keys) {
  var keyArray = (typeof keys === 'string') ? keys.split('') : keys;
  for (var i = 0; i < keyArray.length; i++) {
    document.getElementById(keyArray[i]).click();
  }
}

function test(desc, keysInput, expectedOutput) {
  return it(desc, function() {
    input(keysInput);
    expect(screen()).toBe(expectedOutput);
  });
}

afterEach(function(){
  input(["AC"])
})

describe("Calculator", function(){

  describe('input behaviour', function() {

    test('should display input history on screen',
         '3+3x9/7-44', '3+3x9/7-44');

    test('number entry after equals starts again',
         '3+4=5+6', '5+6');

    test('operation entry after equals continues with collapsed history',
         '3+4=+5+6', '7+5+6');

    test('allows for changing operations',
         '3-+x/x+x7-+4', '3x7+4');

    test("won't change operations for negative inputs",
         '-+3+-+0.7', '-3+-0.7')

    test("doesn't allow leading zeros",
         '0000444000', '444000');

    test('allows one leading zeros on decimal input',
         '00.8898000', '0.8898000');

  });

  describe('number output display', function() {
    test('numbers of 14 digits output naturally',
         '88888888888888=', '88888888888888');

    test('numbers of 15 digits output in exponential form',
         '888888888888889=', '8.88888888888889e+14');

    test('decimals wont round until 14 digits',
         '0.500000000000001=', '0.500000000000001');

    test('decimals round after 14 digits',
         '0.5000000000000001=', '0.5');

    test('decimals use exponential form if they are 9e-7 or less',
         '0.0000009=', '9e-7');

    test('large numbers with decimal precision output naturally',
         '1234567.89101112=','1234567.89101112');

    test('large numbers with decimal precision output will round',
         '1234567891011.12131415=','1234567891011.12');

    test('0.1 displayed naturally',
         '0.1+0.2=', '0.3');

    test('decimals displayed with leading zero',
         '.4=', '0.4');

  });

  describe('input computation', function() {

    test('changed operations',
         '3+x79-+4=', '241');

    test('changed operations with negative inputs',
         '-3+-0.7=', '-3.7');
  });

  describe('functions', function() {

    test('CE clears a pending operation',
         ["3","+","CE","3"], '33');

    test('CE clears a pending operation and a number',
         ["3","+","5","6","CE","3"], '33');

    test('% on addition adds percentage of first number',
         '10+49%=', '14.9');

    test('% on subtraction subtracts percentage of first number',
         '10-49%=', '5.1');

    test('% on multiplication returns percentage of first number',
         '100x49%=', '49');

    test('% on division returns percentage division of first number',
         '100/49%=', '204.081632653061');

    test('. cannot decimalise a number twice',
         '3.323.123=', '3.323123')

    test('. can decimalise a number without leading digit',
         '.999=', '0.999')
  });

  describe('operations', function() {

    test('x^y performs the power operation',
         [7,"x^y",7,"="], '823543')

    test('x^y performs the power operation on negative numbers',
         [7,"x^y","-",7,"="], '0.00000121426567890201')

  });

});
