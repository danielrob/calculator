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

afterEach(function() {
  input(["AC"])
})

describe("Calculator", function() {

  describe('input behaviour', function() {

    test('should display input history on screen',
      '3+3x9/7-44', '3+3x9/7-44');

    test('number entry after equals starts again',
      '3+4=5+6', '5+6');

    test(
      'operation entry after equals continues with collapsed history',
      '3+4=+5+6', '7+5+6');

    test('allows for changing operations',
      '3-+x/x+x7-+4', '3x7+4');

    test('negative numbers can follow operations',
      '3+x/x+x-7-+-4', '3x-7+-4');

    test("allows for double negative inputs",
      '-+3--0.7', '+3--0.7')

    test("doesn't allow leading zeros",
      '0000444000', '444000');

    test('allows one leading zeros on decimal input',
      '00.8898000', '0.8898000');
  });

  describe('computation', function() {

    test('stringed operations',
      '8+8+8-2x3/4=', '16.5');

    test('changed operations',
      '3+x79-+4=', '241');

    test('changed operations with negative inputs',
      '-3+-0.7=', '-3.7');
  });


  describe('brackets', function() {

    test('change operation ordering with brackets',
      '(3+4)x(5+22)=', '189');

    test('negate brackets',
      '-(3-4)x-(5+22)=', '-27');

    test('nest brackets',
      '-(((3+4)x-(5x2)))=', '70');

    // TODO: add intelligence on uneven brackets?
    test('uneven brackets',
      '((3)=', 'Error');
  });


  describe('number output display', function() {
    test('numbers of 11 digits output naturally',
      '88888888888=', '88888888888');

    test('numbers of 12 digits output in exponential form',
      '888888888888=', '8.8888889e+11');

    test('decimals wont round until 11 digits',
      '0.500000000001=', '0.500000000001');

    test('decimals round after 11 digits',
      '0.5000000000001=', '0.5');

    test('decimals use exponential form if they are 9e-7 or less',
      '0.0000009=', '9e-7');

    test('large numbers with decimal precision output to 11 digits',
      '1234567.89101112=', '1234567.89101');

    test('large numbers with decimal precision output will round',
      '12345678910.12131415=', '12345678910.1');

    test('0.1 displayed naturally',
      '0.1+0.2=', '0.3');

    test('decimals displayed with leading zero',
      '.4=', '0.4');

  });

  describe('percentages: percent on', function() {

    test('first number',
      '3%+10=', '10.03');

    test('add adds percentage of first number',
      '10+49%=', '14.9');

    test('subtract subtracts percentage of first number',
      '10-49%=', '5.1');

    test('multiply',
      '100x49%=', '49');

    test('divide',
      '100/49%=', '204.081632653');

    test('brackets',
      '3-(10+10)%=', '2.4');
  });

  describe('decimals', function() {

    test('. cannot add multiple decimals',
      '3.323.123=', '3.323123')

    test('. can decimalise a number without leading digit',
      '.999=', '0.999')
  });

  describe('expected errors', function() {
    test('',
      '))))8((((=', 'Error');
    test('',
      '))))8=', 'Error');
    test('',
      ')8)))8=', 'Error');
    test('',
      '%(3)=', 'Error');
  });

});
