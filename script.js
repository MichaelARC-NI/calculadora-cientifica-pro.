const display = document.getElementById('display');
const expressionDiv = document.getElementById('expression');
const historyDiv = document.getElementById('history');
let isDeg = true;
let currentExpression = "";

function toggleTheme() {
    const body = document.body;
    body.setAttribute('data-theme', body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
}

function toggleDegRad() {
    isDeg = !isDeg;
    document.getElementById('mode-info').innerText = isDeg ? 'DEG' : 'RAD';
    document.getElementById('deg-rad').innerText = isDeg ? 'Modo: DEG' : 'Modo: RAD';
}

function addChar(char) {
    if (display.value === 'Error') clearAll();
    currentExpression += char;
    updateDisplay();
}

function addFunc(func) {
    if (display.value === 'Error') clearAll();
    currentExpression += `Math.${func}(`;
    updateDisplay();
}

function factorial(n) {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
}

function addFact() {
    if (display.value === 'Error') clearAll();
    currentExpression += `factorial(`;
    updateDisplay();
}

function updateDisplay() {
    let view = currentExpression
        .replace(/Math\.PI/g, 'π')
        .replace(/Math\.E/g, 'e')
        .replace(/Math\./g, '')
        .replace(/factorial\(/g, 'fact(')
        .replace(/\*\*+/g, '^');
    display.value = view || "0";
}

function calculate() {
    try {
        if(currentExpression.trim() === "") return;
        let evalExp = currentExpression;
        
        evalExp = evalExp.replace(/%/g, '/100');

        if (isDeg) {
            evalExp = evalExp.replace(/sin\(([^)]+)\)/g, 'sin(($1) * Math.PI / 180)');
            evalExp = evalExp.replace(/cos\(([^)]+)\)/g, 'cos(($1) * Math.PI / 180)');
            evalExp = evalExp.replace(/tan\(([^)]+)\)/g, 'tan(($1) * Math.PI / 180)');
            
            evalExp = evalExp.replace(/asin\(([^)]+)\)/g, '(asin($1) * 180 / Math.PI)');
            evalExp = evalExp.replace(/acos\(([^)]+)\)/g, '(acos($1) * 180 / Math.PI)');
            evalExp = evalExp.replace(/atan\(([^)]+)\)/g, '(atan($1) * 180 / Math.PI)');
        }

        let result = eval(evalExp);
        if (isNaN(result) || !isFinite(result)) throw new Error();

        result = parseFloat(result.toFixed(8));
        
        let view = display.value;
        addToHistory(view + " = " + result);
        
        expressionDiv.innerText = view + " =";
        display.value = result;
        currentExpression = result.toString();
    } catch (e) {
        display.value = "Error";
        setTimeout(clearAll, 1500);
    }
}

function addToHistory(item) {
    if (historyDiv.innerText.includes("vacío")) historyDiv.innerHTML = "";
    const p = document.createElement('p');
    p.innerText = item;
    historyDiv.prepend(p);
}

function clearAll() {
    display.value = "0";
    currentExpression = "";
    expressionDiv.innerText = "";
}

function backspace() {
    currentExpression = currentExpression.slice(0, -1);
    updateDisplay();
}

document.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9' || ['+', '-', '*', '/', '.', '(', ')', '%'].includes(e.key)) addChar(e.key);
    if (e.key === 'Enter') { e.preventDefault(); calculate(); }
    if (e.key === 'Backspace') backspace();
    if (e.key === 'Escape') clearAll();
});
