var calculator = {

	input 											: null,

	digit											: null,
	digitsCount										: null,
	number 											: null,

	decimalOn										: null,				//decimalOn: bool representing whether the number has decimal point.
	decimalDigitsCount								: null,
	decimalDigit 									: null,
	decimalNumber									: null,

	operatorCount									: null,				//operatorCount: integer showing how many times operator buttons are pressed.
	operator										: null,

	answer											: null,
	oldAnswer										: null,				//oldAnswer: to start an operation directly from the answer.

	output											: null,

	errorOn											: null,

	$output											: null,
	$error											: null,
	$buttonNumber									: null,
	$buttonOperator									: null,
	$buttonEqualTo									: null,
	$buttonDecimal									: null,
	$buttonAC 										: null,
	$buttonCE 										: null,

	init : function() {
		calculator.input 							= '';

		calculator.digit							= 0;
		calculator.digitsCount						= 0;
		calculator.number							= 0;

		calculator.decimalOn						= false;
		calculator.decimalDigitsCount				= 0;
		calculator.decimalDigit 					= 0;
		calculator.decimalNumber					= 0.0;

		calculator.operatorCount					= 0;
		calculator.operator							= '';

		calculator.answer							= 0;
		calculator.oldAnswer						= 0;

		calculator.output							= 0;

		calculator.errorOn							= false;

		calculator.$output							= $("#output");
		calculator.$error 							= $("#error");
		calculator.$buttonNumber					= $("button.button-number");
		calculator.$buttonOperator					= $("button.button-operator");
		calculator.$buttonEqualTo					= $("button.button-equalTo");
		calculator.$buttonDecimal					= $("button.button-decimal");
		calculator.$buttonAC						= $("button.button-AC");
		calculator.$buttonCE						= $("button.button-CE");

		calculator.$output.text(0);
		calculator.$error.hide();
	},

	attachEventHandlers : function() {
		calculator.$buttonNumber.unbind('click').on('click', function() {
			if(calculator.checkError()) {
				return;
			}
			calculator.input = $(this).val();

			if(calculator.decimalOn) {

				//prevent inserting digits if max digit limit (ie 12) is reached
				if(calculator.digitsCount + calculator.decimalDigitsCount >= 11) {
					return;
				}

				calculator.decimalDigitsCount ++;
				if(calculator.decimalDigitsCount === 1) {
					calculator.operatorCount = 0;
				}

				calculator.decimalDigit = calculator.input / (10 ** calculator.decimalDigitsCount);

				//using math.round to tackle 'floating point math abnormalities'.
				calculator.number = Math.round((calculator.number + calculator.decimalDigit) * (10 ** calculator.decimalDigitsCount)) / 10 ** calculator.decimalDigitsCount;
			
				calculator.output = calculator.number.toFixed(calculator.decimalDigitsCount);	//using 'toFixed' to display trailing zeroes (Eg. 0.0)
			}
			else {

				//prevent inserting digits if max digit limit (ie 12) is reached
				if(calculator.digitsCount >= 12) {
					return;
				}

				calculator.digitsCount ++;
				if(calculator.digitsCount === 1) {
					calculator.operatorCount = 0;
				}

				calculator.digit = parseInt(calculator.input);

				calculator.number = calculator.number * 10 + calculator.digit;

				calculator.output = calculator.number;
			}

			calculator.displayOutput();
		});

		calculator.$buttonOperator.unbind('click').on('click', function() {
			calculator.checkError();
			calculator.input = $(this).val();

			calculator.operatorCount ++;
			if(calculator.operatorCount === 1) {
				calculator.calculateAnswer();
				calculator.digitsCount = 0;
				calculator.number = 0;
				calculator.decimalOn = false;
				calculator.decimalDigitsCount = 0;
			}
			
			calculator.operator = calculator.input;

			calculator.output = calculator.operator

			calculator.displayOutput();
		});

		calculator.$buttonEqualTo.unbind('click').on('click', function() {
			calculator.checkError();

			calculator.calculateAnswer();
			calculator.digitsCount = 0;
			calculator.number = 0;
			calculator.decimalOn = false;
			calculator.decimalDigitsCount = 0;
			calculator.operatorCount = 0;

			calculator.output = calculator.oldAnswer = calculator.answer;
			calculator.answer = 0;

			calculator.displayOutput();
		});

		calculator.$buttonDecimal.unbind('click').on('click', function() {
			calculator.checkError();

			//prevent inserting decimal if max digit limit (ie 12) is reached
			if (calculator.digitsCount >= 12) {
				return;
			}
			if(!calculator.decimalOn) {
				calculator.decimalOn = true;

				calculator.input = $(this).val();

				calculator.output = calculator.number.toString() + calculator.input;

				calculator.displayOutput();
			}
		});

		calculator.$buttonAC.unbind('click').on('click', function() {
			calculator.init();
		});

		calculator.$buttonCE.unbind('click').on('click', function() {
			calculator.checkError();

			if(calculator.decimalDigitsCount !== 0) {

				calculator.decimalDigitsCount --;
				calculator.number = parseFloat(calculator.number.toFixed(calculator.decimalDigitsCount));

				if(calculator.decimalDigitsCount === 0) {
					calculator.output = calculator.number.toFixed(calculator.decimalDigitsCount) + '.';
				}
				else {
					calculator.output = calculator.number.toFixed(calculator.decimalDigitsCount);
				}

				calculator.displayOutput();
				return;
			}

			else if (calculator.decimalOn) {
				calculator.decimalOn = false;

				calculator.output = calculator.number;
				calculator.displayOutput();
				return;
			}

			else if (calculator.digitsCount !== 0) {

				calculator.digitsCount --;

				calculator.number = Math.floor(calculator.number / 10);

				calculator.output = calculator.number;
				calculator.displayOutput();
				return;
			}
		});
	},

	calculateAnswer : function() {
		if(calculator.answer === 0 && calculator.digitsCount === 0) {
			calculator.answer = calculator.oldAnswer;
			return;
		}

		switch (calculator.operator) {
			case '+':
				calculator.answer = calculator.answer + calculator.number;
				break;
			case '-':
				calculator.answer = calculator.answer - calculator.number;
				break;
			case '*':
				calculator.answer = calculator.answer * calculator.number;
				break;
			case '/':
				calculator.answer = calculator.answer / calculator.number;
				//to limit the number of decimal digits in recurring numbers
				if (calculator.answer.toString().length > 17) {
					calculator.answer = parseFloat(calculator.answer.toFixed(2));
				}
				break;
			default:
				calculator.answer = calculator.number;
		}
	},

	displayOutput : function() {
		console.log(calculator.errorOn);

		if(calculator.output.toString().length > 12) {
			calculator.output = parseFloat(calculator.output).toExponential(6);
			calculator.displayError();
			return;
		}

		if(calculator.output === Infinity) {
			calculator.output = 0;
			calculator.displayError();
			return;
		}
		
		calculator.$output.text(calculator.output);
	},

	displayError : function() {
		calculator.errorOn = true;
		calculator.$output.text(calculator.output);
		calculator.$error.show();

		setTimeout(
			function() {
				//calculator.init();
			},
			3000
		);
	},

	checkError : function() {
		if(calculator.errorOn) {
			return true;
		}
		return false;
	}
}

$(document).ready(function() {
	calculator.init();
	calculator.attachEventHandlers();

	console.log("ready");
});