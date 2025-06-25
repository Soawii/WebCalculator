let bar_top = document.querySelector(".calculator-bar-top");
let bar_bottom = document.querySelector(".calculator-bar-bottom");
let pointer = [0, 0];
let allowed_characters = ""; // filled later

let globalkey_to_button = {};
let name_to_button = {};
const all_buttons = document.querySelectorAll("button");
for (let i = 0; i < all_buttons.length; i++) {
    name_to_button[all_buttons[i].textContent] = all_buttons[i];
    if (all_buttons[i].id != '') {
        const keys = all_buttons[i].id.split('_');
        for (let j = 0; j < keys.length; j++) {
            globalkey_to_button[keys[j]] = all_buttons[i];
        }
    }
}

function checkAllowedCharacters(string) {
    for (let i = 0; i < string.length; i++) {
        if (!allowed_characters.includes(string[i]))
            return false;
    }
    return true;
}

function getCursorPosition() {
    const pos = bar_bottom.selectionStart;
    updateInfo();
    return pos;
}

function insertText(textToInsert) {
    updateInfo();

    const input = bar_bottom;
    const currentValue = input.value;
    
    const newValue = currentValue.substring(0, pointer[0]) + 
                    textToInsert + 
                    currentValue.substring(pointer[1]);
    
    input.value = newValue;
    const newCursorPos = pointer[0] + textToInsert.length;
    selectText(newCursorPos, newCursorPos);
    updateInfo();
}

function deleteText() {
    const input = bar_bottom;
    const startPos = input.selectionStart;
    const endPos = input.selectionEnd;

    if (startPos < endPos) {
        insertText('');
    }
    else if (startPos != 0) {
        selectText(startPos - 1, endPos);
        insertText('');
    }
    updateInfo();
}

function selectText(start, end) {
    if (start < 0)
        start = 0;
    if (end < 0)
        end = 0;
    if (start > bar_bottom.value.length)
        start = bar_bottom.value.length;
    if (end > bar_bottom.value.length)
        end = bar_bottom.value.length;
    if (end < start)
        end = start;

    bar_bottom.focus();
    bar_bottom.setSelectionRange(start, end);
    updateInfo();
}

function moveCursor(amount) { // can be negative
    const pos = getCursorPosition();
    selectText(pos + amount, pos + amount);
}

function updateInfo() {
    const selStart = bar_bottom.selectionStart;
    const selEnd = bar_bottom.selectionEnd;
    
    pointer[0] = selStart;
    pointer[1] = selEnd;

    console.log(selStart, selEnd);
}

function insertFunction(string) {
    insertText(string);
    insertText('()');
    const pos = getCursorPosition();
    selectText(pos - 1, pos - 1);
}

function Description(name, type, buttonFunc, data) {
    this.name = name;
    this.type = type;
    this.buttonFunc = buttonFunc;
    this.data = data;
}

const buttonname_to_description = {
    // digits, dot and brackets
    '0': new Description('0', "number", (e) => { insertText('0');  }),
    '1': new Description('1', "number", (e) => { insertText('1'); }),
    '2': new Description('2', "number", (e) => { insertText('2'); }),
    '3': new Description('3', "number", (e) => { insertText('3'); }),
    '4': new Description('4', "number", (e) => { insertText('4'); }),
    '5': new Description('5', "number", (e) => { insertText('5'); }),
    '6': new Description('6', "number", (e) => { insertText('6'); }),
    '7': new Description('7', "number", (e) => { insertText('7'); }),
    '8': new Description('8', "number", (e) => { insertText('8'); }),
    '9': new Description('9', "number", (e) => { insertText('9'); }),
    '.': new Description('.', "number", (e) => { insertText('.'); }),
    '(': new Description('(', "operator", (e) => { insertText('('); }, []),
    ')': new Description(')', "operator", (e) => { insertText(')'); }, []),

    // constants
    'e': new Description('E', "constant", (e) => { insertText('E'); }, Math.E),
    'π': new Description('pi', "constant", (e) => { insertText('pi'); }, Math.PI),

    // binary operators
    '+': new Description('+', "operator", (e) => { insertText('+'); }, [1, "left", (a, b) => a + b]),
    '-': new Description('-', "operator", (e) => { insertText('-'); }, [1, "left", (a, b) => a - b]),
    '/': new Description('/', "operator", (e) => { insertText('/'); }, [2, "left", (a, b) => a / b]),
    '*': new Description('*', "operator", (e) => { insertText('*'); }, [2, "left", (a, b) => a * b]),
    '^': new Description('^', "operator", (e) => { insertText('^'); }, [3, "right", (a, b) => a ** b]),

    // unary operators / functions
    '√': new Description('sqrt', "function", (e) => { insertFunction('sqrt'); }, [4, (a) => Math.sqrt(a)]),
    'sin': new Description('sin', "function", (e) => { insertFunction('sin'); }, [4, (a) => Math.sin(a)]),
    'cos': new Description('cos', "function", (e) => { insertFunction('cos'); }, [4, (a) => Math.cos(a)]),
    'ln': new Description('ln', "function", (e) => { insertFunction('ln'); }, [4, (a) => Math.log(a)]),

    // other operators    
    '⌫': new Description('⌫', "other", (e) => {deleteText(); }),
    '←': new Description('←', "other", (e) => { moveCursor(-1); }),
    '→': new Description('→', "other", (e) => { moveCursor(1); }),
    'C': new Description('C', "other", (e) => { 
        selectText(0, bar_bottom.value.length);
        deleteText();
    }),
    'CE': new Description('CE', "other", (e) => { 
        selectText(0, bar_bottom.value.length);
        deleteText();
    }),
    '=': new Description("=", "other", (e) => { 
        const value = evaluateString(bar_bottom.value);
        if (isFinite(Number(value)) && !isNaN(Number(value))) {
            selectText(0, bar_bottom.value.length);
            insertText(value);
            bar_top.textContent = '0';
        }
        else {
            alert("WRONG!");
        }
    }),
};

const dontneed_revaluation = ['←', '→', '='];

let constant_names = [];
let operator_names = [];
let function_names = [];

let constant_to_value = {};
let operatorname_to_desciption = {};

for (const key in buttonname_to_description) {
    name_to_button[key].addEventListener("click", (e) => {
        buttonname_to_description[key].buttonFunc(e);
        bar_top.textContent = String(evaluateString(bar_bottom.value));
    });
    const type = buttonname_to_description[key].type;
    buttonname_to_description[key]
    operatorname_to_desciption[buttonname_to_description[key].name] = buttonname_to_description[key];
    if (type != "other") {
        for (let i = 0; i < buttonname_to_description[key].name.length; i++) {
            if (!allowed_characters.includes(buttonname_to_description[key].name[i])) {
                allowed_characters += buttonname_to_description[key].name[i];
            }
        }
    }
    if (type == "constant") {
        constant_names.push(buttonname_to_description[key].name);
        constant_to_value[buttonname_to_description[key].name] = buttonname_to_description[key].data;
    }
    else if (type == "operator") {
        operator_names.push(buttonname_to_description[key].name);
    }
    else if (type == "function") {
        function_names.push(buttonname_to_description[key].name);
    }
}
allowed_characters += 'e';

function Token(type, data) {
    this.type = type;
    this.data = data;
}

function tokenize(string) {
    let allowed_number_start = "";
    let allowed_text_start = "";
    let allowed_operator_start = "";

    for (let i = 0; i < allowed_characters.length; i++) {
        const c = allowed_characters[i];
        if ((c >= '0' && c <= '9') || c == '.') {
            allowed_number_start = allowed_number_start + c;
        }
        else if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z')){
            allowed_text_start = allowed_text_start + c;
        }
        else {
            allowed_operator_start = allowed_operator_start + c;
        }
    }

    function parseInt(string, start) {
        let i = start;
        if (string[start] == '+' || string[start] == '-') {
            i++;
        }
        for (; i < string.length; i++) {
            if (string[i] < '0' || string[i] > '9')
                return string.slice(start, i);
        }
        return string.slice(start);
    }

    function parseFloat(string, start) {
        const firstPart = parseInt(string, start);
        if (start + firstPart.length >= string.length || string[start + firstPart.length] != '.')
            return firstPart;
        const secondPart = parseInt(string, start + firstPart.length + 1);
        const result = firstPart + '.' + secondPart;
        if (result == '.')
            return '';
        return result;
    }

    function parseNumber(string, start) {
        const firstPart = parseFloat(string, start);
        if (start + firstPart.length >= string.length || string[start + firstPart.length] != 'e')
            return firstPart;
        const sign = string[start + firstPart.length + 1];
        if (sign != '+' && sign != '-')
            return '';
        const secondPart = parseInt(string, start + firstPart.length + 2);
        if (secondPart == '')
            return '';
        return firstPart + 'e' + sign + secondPart;
    }

    function parseText(string, start) {
        for (let i = start; i < string.length; i++) {
            if (!allowed_text_start.includes(string[i])) {
                return string.slice(start, i);
            }
        }
        return string.slice(start);
    }

    function tokenizeText(string) {
        if (string.length == 0)
            return [];
        for (let i = string.length - 1; i >= 0; i--) {
            const substr = string.slice(0, i + 1);
            let token = null;
            if (function_names.includes(substr)) {
                token = new Token("function", substr);
            }
            else if (constant_names.includes(substr)) {
                token = new Token("constant", substr);
            }
            if (token != null) {
                const remainingTokens = tokenizeText(string.slice(i + 1));
                if (remainingTokens != null)
                    return [token].concat(remainingTokens);
            }
        }
        return null;
    }

    let tokens = [];

    let idx = 0;
    let parse_state = null;

    while (idx < string.length) {
        const char = string[idx];
        if (parse_state == null) {
            if (allowed_number_start.includes(char)) {
                parse_state = "number";
            }
            else if (allowed_text_start.includes(char)) {
                parse_state = "text";
            }
            else if (allowed_operator_start.includes(char)) {
                parse_state = "operator";
            }
            else {
                console.log("Something went wrong");
            }
            continue;
        }
        else if (parse_state == "number") {
            const number = parseNumber(string, idx);
            if (number == '')
                return null;
            idx += number.length;
            tokens.push(new Token("number", Number(number)));
        }
        else if (parse_state == "text") {
            const text = parseText(string, idx);
            if (text == '')
                return null;
            const textTokens = tokenizeText(text);
            if (textTokens === null || textTokens.length == 0)
                return null;
            idx += text.length;
            tokens.push(...textTokens);
        }
        else if (parse_state == "operator") {
            const operator = string[idx];
            if (!operator_names.includes(operator))
                return null;
            idx++;
            tokens.push(new Token("operator", operator));
        }
        else {
            console.log(`Weird parse_state: ${parse_state}`);
            return null;
        }
        parse_state = null;
    }
    return tokens;
}

function processTokens(tokens) {
    if (tokens === null) {
        return null;
    }

    if (tokens.length > 0 && tokens[0].type == "operator" && (tokens[0].data == '-' || tokens[0].data == '+')) {
        tokens.unshift(new Token("number", 0));
    }

    for (let i = 1; i < tokens.length; i++) {
        const prev = tokens[i - 1], curr = tokens[i];
        if (prev.type == "number" && curr.type == "constant") {
            tokens = tokens.slice(0, i).concat(new Token("operator", '*')).concat(tokens.slice(i));
        }
        else if ((prev.type == "number" || prev.type == "constant") && curr.type == "function") {
            tokens = tokens.slice(0, i).concat(new Token("operator", '*')).concat(tokens.slice(i));
        }
        else if ((prev.type == "operator" && prev.data == "(") && (curr.type == "operator" && (curr.data == '-' || curr.data == '+'))) {
            tokens = tokens.slice(0, i).concat(new Token("number", 0)).concat(tokens.slice(i));
        }
    }

    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].type == "constant") {
            tokens[i] = new Token("number", constant_to_value[tokens[i].data]);
        }
    }

    return tokens;
}


let minPriority = 1000, maxPriority = 0;
for (let key in buttonname_to_description) {
    if ((buttonname_to_description[key].type == "operator" || buttonname_to_description[key].type == "function") && buttonname_to_description[key].data.length > 0) {
        minPriority = Math.min(minPriority, buttonname_to_description[key].data[0]);
        maxPriority = Math.max(maxPriority, buttonname_to_description[key].data[0]);
    }
}

function evaluateTokens(tokens) {
    if (tokens.length == 0)
        return null;
    if (tokens.length == 1) {
        if (tokens[0].type == "number")
            return tokens[0].data;
        return null;
    }

    // brackets
    let bracket_count = 0;
    let opening_bracket_idx = 0;
    let idx = 0;
    while (idx < tokens.length) {
        if (tokens[idx].type == "operator") {
            if (tokens[idx].data == "(") {
                if (bracket_count == 0)
                    opening_bracket_idx = idx;
                bracket_count++;
            }
            else if (tokens[idx].data == ")") {
                bracket_count--;
                if (bracket_count < 0)
                    return null;
                if (bracket_count == 0) {
                    const evaluation = evaluateTokens(tokens.slice(opening_bracket_idx + 1, idx));
                    if (evaluation === null)
                        return null;
                    tokens = tokens.slice(0, opening_bracket_idx).concat(new Token("number", evaluation)).concat(tokens.slice(idx + 1));
                    idx = opening_bracket_idx;
                }
            }
        }
        idx++;
    }

    if (bracket_count != 0)
        return null;

    for (let p = maxPriority; p >= minPriority; p--) {

        // right first
        idx = tokens.length - 1;
        while (idx >= 0) {
            if (tokens[idx].type == "function" && operatorname_to_desciption[tokens[idx].data].data[0] == p) {
                const func = operatorname_to_desciption[tokens[idx].data].data[1];
                if (idx == tokens.length - 1 || tokens[idx + 1].type != "number")
                    return null;
                const funcValue = func(tokens[idx + 1].data);
                tokens = tokens.slice(0, idx).concat(new Token("number", funcValue)).concat(tokens.slice(idx + 2));
                idx--;
            }
            else if (tokens[idx].type == "operator" && operatorname_to_desciption[tokens[idx].data].data[0] == p && operatorname_to_desciption[tokens[idx].data].data[1] == "right") {
                const func = operatorname_to_desciption[tokens[idx].data].data[2];
                if (idx == tokens.length - 1 || idx == 0 || tokens[idx + 1].type != "number" || tokens[idx - 1].type != "number")
                    return null;
                const funcValue = func(tokens[idx - 1].data, tokens[idx + 1].data);
                tokens = tokens.slice(0, idx - 1).concat(new Token("number", funcValue)).concat(tokens.slice(idx + 2));
                idx--;
            } 
            else idx--;
        }

        // left secon
        idx = 0;
        while (idx < tokens.length) {
            if (tokens[idx].type == "operator" && operatorname_to_desciption[tokens[idx].data].data[0] == p && operatorname_to_desciption[tokens[idx].data].data[1] == "left") {
                const func = operatorname_to_desciption[tokens[idx].data].data[2];
                if (idx == tokens.length - 1 || idx == 0 || tokens[idx + 1].type != "number" || tokens[idx - 1].type != "number")
                    return null;
                const funcValue = func(tokens[idx - 1].data, tokens[idx + 1].data);
                tokens = tokens.slice(0, idx - 1).concat(new Token("number", funcValue)).concat(tokens.slice(idx + 2));
            }
            else idx++;
        }
    }

    if (tokens.length != 1 || tokens[0].type != "number")
        return null;
    return tokens[0].data;
}

function processValue(value) {
    if (String(value).includes('e'))
        return value.toExponential(10);
    let retValue = value.toFixed(10);
    while (retValue.slice(-1) == '0') 
        retValue = retValue.slice(0, -1);
    if (retValue.slice(-1) == '.')
        retValue = retValue.slice(0, -1);
    return retValue;
}

function evaluateString(string) {
    let tokens = tokenize(string);
    tokens = processTokens(tokens);
    if (tokens === null)
        return '0';
    let value = evaluateTokens(tokens);
    if (value === null)
        return '0';
    value = processValue(value);
    return value;
}

let valueBeforeInput = "";
let pointerBefore = [0, 0];

bar_bottom.addEventListener('beforeinput', (e) => {
    valueBeforeInput = e.target.value;
    pointerBefore = Array.from(pointer);
});

bar_bottom.addEventListener('input', (e) => {
    const valueAfterInput = e.target.value;
    if (!checkAllowedCharacters(valueAfterInput)) {
        e.target.value = valueBeforeInput;
        selectText(pointerBefore[0], pointerBefore[1]);
    }
    else {
        bar_top.textContent = evaluateString(valueAfterInput);
    }
});

bar_bottom.addEventListener('click', updateInfo);
bar_bottom.addEventListener('keyup', updateInfo);
bar_bottom.addEventListener('select', updateInfo);

window.addEventListener("keydown", (e) => {
    const prefixes = ['', 'SHIFT-', 'NOSHIFT-'];
    for (let i = 0; i < prefixes.length; i++) {
        const newValue = prefixes[i] + e.code;
        if (newValue in globalkey_to_button) {
            globalkey_to_button[newValue].click();
        }
    }
});