const ERROR_MSG = "NO NO NO NO NO NO NO NO NO NO NO NO NO";

let state = "left"; // [left, right]
let bar_top = document.querySelector(".calculator-bar-top");
let bar_bottom = document.querySelector(".calculator-bar-bottom");

function isStringGood(string) {
    return !isNaN(Number(string)) && isFinite(Number(string));
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
        return number.toExponential(8);
    let string = number.toFixed(8);
    while (string.slice(-1) == '0') {
        string = string.slice(0,-1);
    }
    while (string.slice(-1) == '0') {
        string = string.slice(0,-1);
    }
    if (string.slice(-1) == '.')
        string = string.slice(0, -1);
    return string;
}

let operator_to_function = {
    // binary operators
    '+': (a, b) => a + b,
    '-': (a, b) => a - b,
    '/': (a, b) => a / b,
    '*': (a, b) => a * b,
    '^': (a, b) => a ** b,

    // unary operators
    '√': a => Math.sqrt(a),

    // other operators
    '.': () => {
        if (!bar_bottom.textContent.includes('.'))
            bar_bottom.textContent += '.';
    },
    '=': () => {
        if (state != "right")
            return;
        if (!isStringGood(bar_bottom.textContent))
            return;
        let number = performBinaryOperation(getOperator(), getNumber(), Number(bar_bottom.textContent));
        if (!isStringGood(String(number))) {
            alert(ERROR_MSG);
            return;
        }
        bar_bottom.textContent = getNumberReadyForDisplay(number);
        bar_top.textContent = "0";
        state = "left";
    },
    '⌫': () => {
        if (bar_bottom.textContent.length > 1) {
            bar_bottom.textContent = bar_bottom.textContent.slice(0, -1);
            return;
        }
        if (bar_top.textContent != '0' && bar_bottom.textContent == '0') {
            state = "left";
            bar_bottom.textContent = bar_top.textContent.split(' ')[0];
            bar_top.textContent = '0';
            return;
        }
        bar_bottom.textContent = '0';
    },
    'C': () => {
        bar_bottom.textContent = '0';
        bar_top.textContent = '0';
        state = "left";
    },
};

function Operator(name, button, func) {
    this.name = name;
    this.button_id = button;
    this.func = func;
}

let numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
let operators = [];
let all_buttons = document.querySelectorAll("button");
let id_to_button = {};
id_to_button["Enter"] = document.querySelector("#NOSHIFT-Equal");

for (let i = 0; i < all_buttons.length; i++) {
    id_to_button[all_buttons[i].id] = all_buttons[i];
    if (all_buttons[i].textContent in operator_to_function)
        operators.push(new Operator(all_buttons[i].textContent, all_buttons[i], operator_to_function[all_buttons[i].textContent]));
}

let argumentNumberToOperators = Array.of([], [], []);

for (let i = 0; i < operators.length; i++) {
    argumentNumberToOperators[operators[i].func.length].push(operators[i].name);
}

console.log(argumentNumberToOperators);

document.querySelector(".calculator-input").addEventListener("click", (e) => {
    if (!e.target.classList.contains("calculator-input-button"))
        return;

    let buttonText = e.target.textContent;

    if (numbers.includes(buttonText)) {
        if (bar_bottom.textContent == '0')
            bar_bottom.textContent = buttonText;
        else 
            bar_bottom.textContent += buttonText
    }
    else if (argumentNumberToOperators[2].includes(buttonText)) { // binary operators
        if (!isStringGood(bar_bottom.textContent))
            return;
        if (state == "right") {
            if (bar_bottom.textContent == '0') {
                bar_top.textContent = getNumber() + " " + buttonText;
                return;
            }
            let number = performBinaryOperation(getOperator(), getNumber(), Number(bar_bottom.textContent));
            if (!isStringGood(String(number))) {
                alert(ERROR_MSG);
                return;
            }
            bar_bottom.textContent = getNumberReadyForDisplay(number);
            bar_top.textContent = '0';
            state = "left";
        }
        if (state == "left") {
            bar_top.textContent = bar_bottom.textContent + " " + buttonText;
            bar_bottom.textContent = '0';
            state = "right";
        }
    }
    else if (argumentNumberToOperators[1].includes(buttonText)) { // unary operators
        if (!isStringGood(bar_bottom.textContent))
            return;
        if (state == "left") {
            let number = performUnaryOperation(buttonText, Number(bar_bottom.textContent));
            if (!isStringGood(String(number))) {
                alert(ERROR_MSG);
                return;
            }
            bar_bottom.textContent = getNumberReadyForDisplay(number);
        }
        else if (state == "right") {
            let number = performBinaryOperation(getOperator(), getNumber(), Number(bar_bottom.textContent));
            if (!isStringGood(String(number))) {
                alert(ERROR_MSG);
                return;
            }
            bar_top.textContent = '0';
            bar_bottom.textContent = getNumberReadyForDisplay(performUnaryOperation(buttonText, number));
            state = "left";
        }
    }
    else if (argumentNumberToOperators[0].includes(buttonText)) { // other operators
        operator_to_function[buttonText]();
    }
    else {
        console.log(`Unknown operator: ${buttonText}`);
    }
});


window.addEventListener("keydown", (e) => {
    if (e.code in id_to_button) {
        id_to_button[e.code].focus();
        if (e.code != "Enter")
            id_to_button[e.code].click();
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