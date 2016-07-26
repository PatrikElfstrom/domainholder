(function(){

    const fitText = function() {

        function getRealWidth( element ) {
            const elementPosition = element.style.position; // get position
            element.style.position = 'absolute';      // set position to absolute

            const elementWidth = element.offsetWidth; // get current width
            element.style.position = elementPosition; // reset position

            return elementWidth;
        }

        // https://github.com/Olical/binary-search
        function binarySearch(maxValue, increase, callback) {
            var min = 0;
            var max = maxValue;
            var guess;

            var bitwise = (max <= 2147483647) ? true : false;
            if (bitwise) {
                while (min <= max) {
                    guess = (min + max) >> 1;
                    if (callback(guess)) { return guess; }
                    if (increase(guess)) { min = guess + 1; }
                    else { max = guess - 1; }
                }
            } else {
                while (min <= max) {
                    guess = Math.floor((min + max) / 2);
                    if (callback(guess)) { return guess; }
                    if (increase(guess)) { min = guess + 1; }
                    else { max = guess - 1; }
                }
            }

            return -1;
        }

        const fit = function( element ) {
            const elementWidth = element.offsetWidth; // Desired width
            let newElementWidth = getRealWidth( element ); // get current width

            element.classList.remove("fittext-complete");
            element.classList.add("fittext-loading");

            // returns fontsize if exact fontsize was found otherwise -1
            // We dont need the return since the last tested is always the closest
            binarySearch(10000, function(guess) {
                fontSize = guess/100; // we do max 10000 and divide by 100 to get two decimals (ex. 8.43)
                element.style.fontSize = fontSize + 'vw'; // set the new fontSize
                newElementWidth = getRealWidth( element ); // get the new width

                return newElementWidth < elementWidth;
            }, function(guess) {
                fontSize = guess/100; // we do max 10000 and divide by 100 to get two decimals (ex. 8.43)
                element.style.fontSize = fontSize + 'vw'; // set the new fontSize
                newElementWidth = getRealWidth( element ); // get the new width

                return newElementWidth === elementWidth;
            });

            element.classList.remove("fittext-loading");
            element.classList.add("fittext-complete");
        };

        if (this.length) {
            for(let i = 0; i < this.length; i++) {
                fit(this[i]);
            }
        } else {
            fit(this);
        }

        return this;
    };

    Element.prototype.fitText = fitText;
    HTMLCollection.prototype.fitText = fitText;

})();