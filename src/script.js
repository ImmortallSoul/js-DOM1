document.addEventListener('DOMContentLoaded', () => {
    const number1Input = document.getElementById('number1');
    const number2Input = document.getElementById('number2');
    const resultOutput = document.getElementById('result-output');
    const errorMessage = document.getElementById('error-message');
    const buttons = document.querySelectorAll('.btn');

    let currentInput = '0';
    let firstOperand = null;
    let operator = null;
    let waitingForSecondOperand = false;
    let lastOperationIsEquals = false;

    function clearError() {
        errorMessage.textContent = '';
    }

    function showError(message) {
        errorMessage.textContent = message;
        resultOutput.textContent = 'Error';
    }

    function updateDisplay() {
        if (waitingForSecondOperand && operator !== null && firstOperand !== null) {
            number1Input.value = firstOperand;
            number2Input.value = operator + ' ' + currentInput;
            resultOutput.textContent = currentInput;
        } else {
            number1Input.value = '';
            number2Input.value = '';
            resultOutput.textContent = currentInput;
        }

        if (resultOutput.textContent.length > 9) {
            resultOutput.style.fontSize = '40px';
        } else {
            resultOutput.style.fontSize = '60px';
        }
    }

    function resetCalculator() {
        currentInput = '0';
        firstOperand = null;
        operator = null;
        waitingForSecondOperand = false;
        lastOperationIsEquals = false;
        clearError();
        updateDisplay();
        deactivateOperatorButtons();
    }

    function inputDigit(digit) {
        clearError();
        if (lastOperationIsEquals) {
            resetCalculator();
            currentInput = digit;
            lastOperationIsEquals = false;
        } else if (waitingForSecondOperand) {
            currentInput = digit;
            waitingForSecondOperand = false;
        } else {
            currentInput = currentInput === '0' ? digit : currentInput + digit;
        }
        updateDisplay();
    }

    function inputDecimal(dot) {
        clearError();
        if (lastOperationIsEquals) {
            resetCalculator();
            currentInput = '0.';
            lastOperationIsEquals = false;
        } else if (waitingForSecondOperand) {
            currentInput = '0.';
            waitingForSecondOperand = false;
        } else if (!currentInput.includes(dot)) {
            currentInput += dot;
        }
        updateDisplay();
    }

    function performCalculation() {
        if (firstOperand === null || operator === null || waitingForSecondOperand) {
            return parseFloat(currentInput);
        }

        const inputValue = parseFloat(currentInput);

        if (isNaN(inputValue)) {
            showError('Некоректні дані для операції!');
            return null;
        }

        let result;
        switch (operator) {
            case '+':
                result = firstOperand + inputValue;
                break;
            case '-':
                result = firstOperand - inputValue;
                break;
            case '*':
                result = firstOperand * inputValue;
                break;
            case '/':
                if (inputValue === 0) {
                    showError('Ділення на нуль неможливе!');
                    return null;
                }
                result = firstOperand / inputValue;
                break;
            default:
                return null;
        }

        if (!Number.isInteger(result) || String(result).includes('.')) {
            result = parseFloat(result.toFixed(2));
        }
        return result;
    }

    function handleOperator(nextOperator) {
        clearError();
        deactivateOperatorButtons();

        const inputValue = parseFloat(currentInput);

        if (firstOperand === null && !isNaN(inputValue)) {
            firstOperand = inputValue;
        } else if (operator) {
            const result = performCalculation();
            if (result !== null) {
                currentInput = String(result);
                firstOperand = result;
            } else {
                resetCalculator();
                return;
            }
        }

        waitingForSecondOperand = true;
        operator = nextOperator;
        lastOperationIsEquals = false;

        if (nextOperator !== '=') {
            document.querySelector(`.operator-btn[data-operation="${nextOperator}"]`).classList.add('active');
        }

        updateDisplay();
    }

    function deactivateOperatorButtons() {
        document.querySelectorAll('.operator-btn').forEach(btn => {
            btn.classList.remove('active');
        });
    }

    function handleFunction(action) {
        clearError();
        switch (action) {
            case 'clear':
                resetCalculator();
                break;
            case 'toggleSign':
                currentInput = String(parseFloat(currentInput) * -1);
                updateDisplay();
                break;
            case 'percent':
                currentInput = String(parseFloat(currentInput) / 100);
                updateDisplay();
                break;
        }
        lastOperationIsEquals = false;
    }

    buttons.forEach(button => {
        button.addEventListener('click', (event) => {
            const { classList, textContent, dataset } = event.target;

            if (classList.contains('digit-btn')) {
                if (textContent === '.') {
                    inputDecimal('.');
                } else {
                    inputDigit(textContent);
                }
            } else if (classList.contains('operator-btn')) {
                if (dataset.operation === '=') {
                    const finalResult = performCalculation();
                    if (finalResult !== null) {
                        currentInput = String(finalResult);
                        firstOperand = null;
                        operator = null;
                        waitingForSecondOperand = false;
                        lastOperationIsEquals = true;
                        deactivateOperatorButtons();
                    } else {
                        waitingForSecondOperand = false;
                        operator = null;
                        lastOperationIsEquals = false;
                    }
                    updateDisplay();
                } else {
                    handleOperator(dataset.operation);
                }
            } else if (classList.contains('function-btn')) {
                handleFunction(dataset.action);
            }
        });
    });

    resetCalculator();

    document.addEventListener('keydown', (event) => {
        clearError();
        const key = event.key;

        if (['+', '-', '*', '/', 'Enter', '='].includes(key) || (key >= '0' && key <= '9') || key === '.') {
            event.preventDefault();
        }

        if (key >= '0' && key <= '9') {
            inputDigit(key);
        } else if (key === '.' || key === ',') {
            inputDecimal('.');
        } else if (['+', '-', '*', '/'].includes(key)) {
            let operation = key;
            if (key === '*') operation = '*';
            if (key === '/') operation = '/';

            const operatorButton = document.querySelector(`.operator-btn[data-operation="${operation}"]`);
            if (operatorButton) {
                operatorButton.click();
            }
        } else if (key === 'Enter' || key === '=') {
            const equalsButton = document.querySelector(`.operator-btn[data-operation="="]`);
            if (equalsButton) {
                equalsButton.click();
            }
        } else if (key === 'Backspace') {
            if (currentInput.length > 1) {
                currentInput = currentInput.slice(0, -1);
            } else {
                currentInput = '0';
            }
            lastOperationIsEquals = false;
            updateDisplay();
        } else if (key === 'Escape' || key === 'c') {
            const clearButton = document.querySelector(`.function-btn[data-action="clear"]`);
            if (clearButton) {
                clearButton.click();
            }
        } else if (key === '%') {
            const percentButton = document.querySelector(`.function-btn[data-action="percent"]`);
            if (percentButton) {
                percentButton.click();
            }
        }
    });
});