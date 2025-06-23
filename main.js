let numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
let binary_operators = ['+', '-', '/', '*', '^'];
let unary_operators = ['√'];
let other_operators = ['.', '=', '⌫', 'C'];

let calculator = document.querySelector(".calculator");
let bar_top = calculator.querySelector(".calculator-bar-top");
let bar_bottom = calculator.querySelector(".calculator-bar-bottom");
let input = calculator.querySelector(".calculator-input");

let all_buttons = input.querySelectorAll("button");
let id_to_button = {};

for (let i = 0; i < all_buttons.length; i++) {
    id_to_button[all_buttons[i].id] = all_buttons[i];
}

id_to_button["Enter"] = input.querySelector("#NOSHIFT-Equal");

console.log(id_to_button);

let operator_to_function = {
    '+': (a, b) => a + b,
    '-': (a, b) => a - b,
    '/': (a, b) => a / b,
    '*': (a, b) => a * b,
    '^': (a, b) => a ** b,
    '√': a => Math.sqrt(a),
};

let state = "left"; // left right

function isStringGood(string) {
    return !isNaN(Number(string));
}

function isScientific(num) {
    return String(num).includes('e');
}

function performUnaryOperation(operator, a) {
    let func = operator_to_function[operator];
    return func(a);
}

function performBinaryOperation(operator, a, b) {
    let func = operator_to_function[operator];
    return func(a, b);
}

function getNumber() {
    return Number(bar_top.textContent.split(' ')[0]);
}

function getOperator() {
    return bar_top.textContent.split(' ')[1];
}

function getNumberReadyForDisplay(number) {
    if (isScientific(number))
        return String(number);
    let string = number.toFixed(10);
    while (string.slice(-1) == '0' || string.slice(-1) == '.') {
        string = string.slice(0,-1);
    }
    return string;
}

input.addEventListener("click", (e) => {
    if (!e.target.classList.contains("calculator-input-button"))
        return;
    let buttonText = e.target.textContent;

    if (numbers.includes(buttonText)) {
        if (bar_bottom.textContent == '0')
            bar_bottom.textContent = buttonText;
        else 
            bar_bottom.textContent += buttonText
    }
    else if (binary_operators.includes(buttonText)) {
        if (!isStringGood(bar_bottom.textContent))
            return;
        if (state == "right") {
            bar_bottom.textContent = getNumberReadyForDisplay(performBinaryOperation(getOperator(), getNumber(), Number(bar_bottom.textContent)));
            bar_top.textContent = '0';
            state = "left";
        }
        if (state == "left") {
            bar_top.textContent = bar_bottom.textContent + " " + buttonText;
            bar_bottom.textContent = '0';
            state = "right";
        }
    }
    else if (unary_operators.includes(buttonText)) {
        if (!isStringGood(bar_bottom.textContent))
            return;
        if (state == "left") {
            bar_bottom.textContent = getNumberReadyForDisplay(performUnaryOperation(buttonText, Number(bar_bottom.textContent)));
        }
        else if (state == "right") {
            let new_left_number = performBinaryOperation(getOperator(), getNumber(), Number(bar_bottom.textContent));
            if (!isStringGood(String(new_left_number)))
                return;
            bar_top.textContent = '0';
            bar_bottom.textContent = getNumberReadyForDisplay(performUnaryOperation(buttonText, new_left_number));
            state = "left";
        }
    }
    else if (other_operators.includes(buttonText)) {
        if (buttonText == '.') {
            if (!bar_bottom.textContent.includes('.'))
                bar_bottom.textContent += '.';
        }
        else if (buttonText == 'C') {
            if (bar_bottom.textContent != '0')
                bar_bottom.textContent = '0';
            else if (bar_top.textContent != '0') {
                state = "left";
                bar_bottom.textContent = bar_top.textContent.split(' ')[0];
                bar_top.textContent = '0';
            }
        }
        else if (buttonText == '⌫') {
            if (bar_bottom.textContent.length > 1)
                bar_bottom.textContent = bar_bottom.textContent.slice(0, -1);
            else {
                if (bar_top.textContent != '0' && bar_bottom.textContent == '0') {
                    state = "left";
                    bar_bottom.textContent = bar_top.textContent.split(' ')[0];
                    bar_top.textContent = '0';
                }
                else {
                    bar_bottom.textContent = '0';
                }
            }
        }
        else if (buttonText == '=') {
            if (state != "right")
                return;
            if (!isStringGood(bar_bottom.textContent))
                return;
            bar_bottom.textContent = getNumberReadyForDisplay(performBinaryOperation(getOperator(), getNumber(), Number(bar_bottom.textContent)));
            bar_top.textContent = "0";
            state = "left";
        }
    }
    else {
        console.log(`Unknown operator: ${buttonText}`);
    }
});


window.addEventListener("keydown", (e) => {
    if (e.code in id_to_button) {
        id_to_button[e.code].click();
        id_to_button[e.code].focus();
    }
    else {
        if (e.shiftKey) {
            if (("SHIFT-" + e.code) in id_to_button) {
                id_to_button["SHIFT-" + e.code].click();
                id_to_button["SHIFT-" + e.code].focus();
            }
        }
        else {
            if (("NOSHIFT-" + e.code) in id_to_button) {
                id_to_button["NOSHIFT-" + e.code].click();
                id_to_button["NOSHIFT-" + e.code].focus();
            }
        }
    }
});

window.addEventListener('paste', (e) => {
    const clipboardData = e.clipboardData || window.clipboardData; 
    const pastedText = clipboardData.getData('text');
    if (!isStringGood(pastedText))
        return;
    bar_bottom.textContent = pastedText;
});