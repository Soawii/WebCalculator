const ERROR_MSG = "NO NO NO NO NO NO NO NO NO NO NO NO NO";

let state = "left"; // [left, right]
let bar_top = document.querySelector(".calculator-bar-top");
let bar_bottom = document.querySelector(".calculator-bar-bottom");

let history_list = document.querySelector(".history-list");
let operation_type = null, operation_text = null;
let global_a = null, global_b = null, global_c = null;

function createHistoryItem() {
    if (operation_type === null || global_a === null || global_c === null || (operation_type == "binary" && global_b === null))
        return;
    let history_item = document.createElement("div");
    history_item.classList.add("history-item");
    let history_item_top = document.createElement("div");
    history_item_top.classList.add("history-item-top");
    let history_item_bottom = document.createElement("div");
    history_item_bottom.classList.add("history-item-bottom");

    if (operation_type == "binary") {
        history_item_top.textContent = String(global_a) + operation_text + String(global_b);
    }
    else {
        history_item_top.textContent = operation_text + "(" + String(global_a) + ")";
    }
    history_item_bottom.textContent = String(global_c);

    history_item.appendChild(history_item_top);
    history_item.appendChild(history_item_bottom);

    history_list.prepend(history_item);
}

function isStringGood(string) {
    return !isNaN(Number(string)) && isFinite(Number(string));
}

function isScientific(num) {
    return String(num).includes('e');
}

function performUnaryOperation(operator, a) {
    let func = operator_to_function[operator];
    operation_type = "unary";
    global_a = a;
    operation_text = "sqrt";
    return func(a);
}

function performBinaryOperation(operator, a, b) {
    let func = operator_to_function[operator];
    operation_type = "binary";
    global_a = a;
    global_b = b;
    operation_text = operator;
    return func(a, b);
}

function getNumber() {
    return Number(bar_top.textContent.split(' ')[0]);
}

function getOperator() {
    return bar_top.textContent.split(' ')[1];
}

function getNumberReadyForDisplay(number) {
    let string = null;
    if (isScientific(number)) {
        string = number.toExponential(8);
    }
    else {
        string = number.toFixed(8);
        while (string.slice(-1) == '0') {
            string = string.slice(0,-1);
        }
        while (string.slice(-1) == '0') {
            string = string.slice(0,-1);
        }
        if (string.slice(-1) == '.')
            string = string.slice(0, -1);
    }

    global_c = string;
    createHistoryItem();
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
    'CE': () => {
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


let prev_height = "";
let history = document.querySelector(".history");
let history_heading = document.querySelector(".history-heading");
history_heading.addEventListener("click", (e) => {
    if (history_list.style.display == "none") {
        history_list.style.display = "flex";
        history.style.height = prev_height;
    }
    else {
        prev_height = history.style.height;
        history_list.style.display = "none";
        history.style.height = "auto";
    }
    history.toggleAttribute("data-open");
});

history_list.addEventListener("click", (e) => {
    if (e.target.classList.contains("history-item-top") || e.target.classList.contains("history-item-bottom")) {
        const target = e.target.parentNode.firstElementChild.nextElementSibling;
        const number = target.textContent;


        bar_bottom.textContent = number;
    }
});