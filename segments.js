function test (a, b) {
	function split (s) {
		return s.split ('').map (function (s) {
			return parseInt (s);
		});
	}

	console.log ('Test', a, b);
	var Si = split (a),
		Sj = split (b);


	function segments (Si, Sj) {
		var segments = [],
			p = -1,
			rewind = true;

		for (var i = 0; i < Si.length; i++) {
			if (Si [i]) {
				if (rewind) {
					segments [++p] = 0;
					rewind = false;
				}

				segments [p] += 1;
			} else if (Sj [i]) {
				rewind = true;
			}
		}

		return segments;
	}

	console.log (
		segments (Si, Sj),
		segments (Sj, Si)
	);
}

test ('100100100', '011011011');
test ('100010000100010001000', '000000010000000010000');
