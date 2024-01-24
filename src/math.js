import { isNumeric } from './helperFunctions';

export function DoMath (expression) {
    const outputQueue = [];
    const operatorStack = [];
    const operatorPrecedence = {
        '+': 1,
        '-': 1,
        '*': 2,
        '/': 2
    };
    let previousToken = null;
    const tokens = expression.match(/[\d.]+|\+|\-|\*|\/|\(|\)/g);
  
    if (!tokens) {
        throw new Error('Invalid expression');
    }
  
    tokens.forEach(token => {
        if (isNumeric(token)) {
            outputQueue.push(token);
        } else if ("+-*/".includes(token)) {
            if (token === '-' && (previousToken === null || previousToken === '(')) {
                // Handle unary minus
                outputQueue.push('0');
            }
            while (operatorStack.length > 0 && operatorPrecedence[operatorStack[operatorStack.length - 1]] >= operatorPrecedence[token]) {
                outputQueue.push(operatorStack.pop());
            }
            operatorStack.push(token);
        } else if (token === '(') {
            operatorStack.push(token);
        } else if (token === ')') {
            while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(') {
                outputQueue.push(operatorStack.pop());
            }
            operatorStack.pop(); // Pop the '('
        }
        previousToken = token;
    });
  
    while (operatorStack.length > 0) {
        outputQueue.push(operatorStack.pop());
    }
  
    return evaluateRPN(outputQueue);
  }
  
  function evaluateRPN(rpn) {
    const stack = [];
  
    rpn.forEach(token => {
        if (isNumeric(token)) {
            stack.push(parseFloat(token));
        } else {
            const b = stack.pop();
            const a = stack.pop();
  
            switch (token) {
                case '+':
                    stack.push(a + b);
                    break;
                case '-':
                    stack.push(a - b);
                    break;
                case '*':
                    stack.push(a * b);
                    break;
                case '/':
                    if (b === 0) throw new Error('Division by zero');
                    stack.push(a / b);
                    break;
            }
        }
    });
  
    return stack.pop();
  }