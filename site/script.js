(function() {
  "use strict";


  function keyPressed(theKey) {
    document.getElementById("screen").innerHTML = theKey;
  };

  (function createKeyEventHandlers(keys) {
    var keys =
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, "AC", "CE", "=", ".", "%", "+", "-", "x"];
    for (var i = 0; i <  keys.length; i++) {
      var el = document.getElementById(keys[i]);
      (function(key) {
        el.addEventListener("click", function() { keyPressed(key); })
      })(keys[i]);
    }
  })();

})();