const ERROR_MSG = "NO NO NO NO NO NO NO NO NO NO NO NO NO";

let state = "left"; // [left, right]
let bar_top = document.querySelector(".calculator-bar-top");
let bar_bottom = document.querySelector(".calculator-bar-bottom");
let selectionPointer = [0, 0];
let prevText = "";

function updatePointer(newSelectionPointer) {
    selectionPointer = newSelectionPointer;
    bar_bottom.setSelectionRange(selectionPointer[0], selectionPointer[1]);
    bar_bottom.focus();
}   

function isStringGood(string) {
    return !isNaN(Number(string)) && isFinite(Number(string));
}

function addStringAt(string, pointer) {
    const newValue = bar_bottom.value.slice(0, pointer[0]) + string + bar_bottom.value.slice(pointer[1]);
    if (!isStringGood(newValue)) {
        updatePointer([bar_bottom.value.length, bar_bottom.value.length]);
        return false;
    }
    bar_bottom.value = newValue;
    updatePointer([pointer[0] + string.length, pointer[0] + string.length]);
    return true;
}

function deleteStringAt(pointer) {
    if (pointer[0] < pointer[1]) {
        addStringAt('', pointer);
    }
    else if (pointer[0] > 0) {
        bar_bottom.value = bar_bottom.value.slice(0, pointer[0] - 1) + bar_bottom.value.slice(pointer[0]);
        updatePointer([pointer[0] - 1, pointer[0] - 1]);
    }
    else if (bar_top.textContent != '0' && bar_bottom.value == '') {
        state = "left";
        addStringAt(bar_top.textContent.split(' ')[0], [0, bar_bottom.value.length]);
        bar_top.textContent = '0';
    }
}

function clearString() {
    deleteStringAt([0, bar_bottom.value.length]);
}

function isScientific(num) {
    return String(num).includes('e');
}

function performUnaryOperation(operator, a) {
    let func = operator_to_func[operator];
    return func(a);
}

function performBinaryOperation(operator, a, b) {
    let func = operator_to_func[operator];
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
    if (string.slice(-1) == '.')
        string = string.slice(0, -1);
    return string;
}

let operator_to_func = {
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
        addStringAt('.', selectionPointer);
    },
    '=': () => {
        if (state != "right")
            return;
        if (!isStringGood(bar_bottom.value))
            return;
        let number = performBinaryOperation(getOperator(), getNumber(), Number(bar_bottom.value));
        if (addStringAt(getNumberReadyForDisplay(number), [0, bar_bottom.value.length])) {
            bar_top.textContent = "0";
            state = "left";
        }
    },
    '⌫': () => {
        deleteStringAt(selectionPointer);
    },
    'C': () => {
        clearString();
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
    if (all_buttons[i].textContent in operator_to_func)
        operators.push(new Operator(all_buttons[i].textContent, all_buttons[i], operator_to_func[all_buttons[i].textContent]));
}

let argumentNumberToOperators = Array.of([], [], []);
for (let i = 0; i < operators.length; i++) {
    argumentNumberToOperators[operators[i].func.length].push(operators[i].name);
}

function processButtonPress(buttonText) {
    if (numbers.includes(buttonText)) {
        if (bar_bottom.value == '') {
            addStringAt(buttonText, [0, 0]);
        }
        else {
            addStringAt(buttonText, selectionPointer);
        }
    }
    else if (argumentNumberToOperators[2].includes(buttonText)) { // binary operators
        if (!isStringGood(bar_bottom.value))
            return;
        if (state == "right") {
            if (bar_bottom.value == '') {
                bar_top.textContent = getNumber() + " " + buttonText;
                return;
            }
            let number = performBinaryOperation(getOperator(), getNumber(), Number(bar_bottom.value));
            addStringAt(getNumberReadyForDisplay(number), [0, bar_bottom.value.length]);
            bar_top.textContent = '0';
            state = "left";
        }
        if (state == "left") {
            bar_top.textContent = bar_bottom.value + " " + buttonText;
            clearString();
            state = "right";
        }
    }
    else if (argumentNumberToOperators[1].includes(buttonText)) { // unary operators
        if (!isStringGood(bar_bottom.value))
            return;
        if (state == "left") {
            let number = performUnaryOperation(buttonText, Number(bar_bottom.value));
            addStringAt(getNumberReadyForDisplay(number), [0, bar_bottom.value.length]);
        }
        else if (state == "right") {
            let number = performBinaryOperation(getOperator(), getNumber(), Number(bar_bottom.value));
            if (!isStringGood(String(number))) {
                alert(ERROR_MSG);
                return;
            }
            bar_top.textContent = '0';
            addStringAt(getNumberReadyForDisplay(performUnaryOperation(buttonText, number)), [0, bar_bottom.value.length]);
            state = "left";
        }
    }
    else if (argumentNumberToOperators[0].includes(buttonText)) { // other operators
        operator_to_func[buttonText]();
    }
}

document.querySelector(".calculator-input").addEventListener("click", (e) => {
    if (!e.target.classList.contains("calculator-input-button"))
        return;
    processButtonPress(e.target.textContent);
    prevText = bar_bottom.value;
});

bar_bottom.addEventListener("selectionchange", (e) => {
    selectionPointer = [bar_bottom.selectionStart, bar_bottom.selectionEnd];
});

const allowedRegex = /^[0-9]*(\.[0-9]*)?$/;
bar_bottom.addEventListener("input", (e) => {
    if (!bar_bottom.value.match(allowedRegex)) {
        bar_bottom.value = prevText;
    }
    prevText = bar_bottom.value;
});

bar_bottom.addEventListener("keydown", (e) => {
    if (e.code == "Backspace" && bar_bottom.value == '' && bar_top.textContent != '0') {
        processButtonPress('⌫');
        e.preventDefault();
    }
});

window.addEventListener("keydown", (e) => {
    if (e.code in id_to_button) {
        id_to_button[e.code].click();
    }
    else {
        if (e.shiftKey) {
            if (("SHIFT-" + e.code) in id_to_button) {
                id_to_button["SHIFT-" + e.code].click();
            }
        }
        else {
            if (("NOSHIFT-" + e.code) in id_to_button) {
                id_to_button["NOSHIFT-" + e.code].click();
            }
        }
    }
});

bar_bottom.focus();