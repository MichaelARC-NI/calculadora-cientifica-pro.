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
    if (display.value.includes('Error')) {
        updateDisplay(); // Restaura la vista si estaba mostrando un error
    }
    currentExpression += char;
    updateDisplay();
}

function addFunc(func) {
    if (display.value.includes('Error')) {
        updateDisplay();
    }
    currentExpression += `Math.${func}(`;
    updateDisplay();
}

function factorial(n) {
    if (n < 0) return NaN; // Esto disparará el Math Error correctamente
    if (n === 0 || n === 1) return 1;
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
}

function addFact() {
    if (display.value.includes('Error')) {
        updateDisplay();
    }
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

        // 1. Autocompletar paréntesis faltantes al final
        let openP = (evalExp.match(/\(/g) || []).length;
        let closeP = (evalExp.match(/\)/g) || []).length;
        while(openP > closeP) { 
            evalExp += ')'; 
            closeP++; 
        }

        // 2. Multiplicación implícita (ej. 2(3) -> 2*(3) o 5Math.sin -> 5*Math.sin)
        evalExp = evalExp.replace(/(\d)(\()/g, '$1*(');
        evalExp = evalExp.replace(/(\d)(Math)/g, '$1*$2');
        evalExp = evalExp.replace(/(\))(Math)/g, '$1*$2');
        evalExp = evalExp.replace(/(\))(\()/g, '$1*(');
        evalExp = evalExp.replace(/(\d)(factorial)/g, '$1*$2');
        evalExp = evalExp.replace(/(\))(factorial)/g, '$1*$2');

        // 3. Eliminar operadores matemáticos sueltos al final (+, -, *, /)
        evalExp = evalExp.replace(/[+\-*/.]$/, '');
        
        // 4. Porcentajes
        evalExp = evalExp.replace(/%/g, '/100');

        // 5. Conversión a Grados/Radianes
        if (isDeg) {
            evalExp = evalExp.replace(/sin\(([^)]+)\)/g, 'sin(($1) * Math.PI / 180)');
            evalExp = evalExp.replace(/cos\(([^)]+)\)/g, 'cos(($1) * Math.PI / 180)');
            evalExp = evalExp.replace(/tan\(([^)]+)\)/g, 'tan(($1) * Math.PI / 180)');
            evalExp = evalExp.replace(/asin\(([^)]+)\)/g, '(asin($1) * 180 / Math.PI)');
            evalExp = evalExp.replace(/acos\(([^)]+)\)/g, '(acos($1) * 180 / Math.PI)');
            evalExp = evalExp.replace(/atan\(([^)]+)\)/g, '(atan($1) * 180 / Math.PI)');
        }

        // 6. Evaluar la expresión segura
        let result = eval(evalExp);
        
        // 7. Validaciones de resultados matemáticos inválidos
        if (isNaN(result)) throw new Error("Math Error");
        if (!isFinite(result)) throw new Error("Infinity Error");

        result = parseFloat(result.toFixed(8));
        
        // Preparamos la vista visual correcta (con los paréntesis que agregamos si faltaban)
        let view = display.value;
        let cleanView = view;
        let vOpen = (view.match(/\(/g) || []).length;
        let vClose = (view.match(/\)/g) || []).length;
        while(vOpen > vClose) { cleanView += ')'; vClose++; }

        addToHistory(cleanView + " = " + result);
        
        expressionDiv.innerText = cleanView + " =";
        display.value = result;
        currentExpression = result.toString();
        
    } catch (e) {
        // Manejo de errores detallado
        let errorMsg = "Error";
        if(e.message === "Math Error" || e.message === "Infinity Error") {
            errorMsg = "Math Error"; // División por cero, raíz de negativo
        } else {
            errorMsg = "Sintaxis Error"; // Faltan operadores, mal escrita
        }
        
        display.value = errorMsg;
        
        // Restaurar la expresión original después de 1.5s para no perder el trabajo
        setTimeout(() => {
            if (display.value === errorMsg) {
                updateDisplay();
            }
        }, 1500);
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
    if (e.key >= '0' && e.key <= '9' || ['+', '-', '*', '/', '.', '(', ')', '%'].includes(e.key)) {
        addChar(e.key);
    }
    if (e.key === 'Enter') { e.preventDefault(); calculate(); }
    if (e.key === 'Backspace') backspace();
    if (e.key === 'Escape') clearAll();
});
