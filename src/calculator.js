import {InputDiscovery} from './inputDiscovery';
import {DoMath, convertToRPN, validateRPN} from './math';
import './style.css';

const CalcButtonPrefix = "PowerToolsCalcButton-";
const CalcIDBaseName = "PowerToolsCalc";
const svgNS = "http://www.w3.org/2000/svg";

export class Calculator {

    showSimplifiInputBox(){
      this.simplifiInputContainerNode.style.display='block';
    }
  
    hideSimplifiInputBox(){
      this.simplifiInputContainerNode.style.display='none'
    }
  
    showPowerToolInputBox(){
      this.powerToolCalcContainerNode.style.display='block';
    }
  
    hidePowerToolInputBox(){
      this.powerToolCalcContainerNode.style.display='none';
      //this.powerToolCalcContainerNode.parentNode.removeChild(this.powerToolCalcContainerNode);
    }
  
    setFocusOnPowerToolBox(){
      requestAnimationFrame(() => {
        this.powerToolCalcInputNode.focus();
      });
    }
  
    // this method triggers the recalc of split items by simplifi 
    // splitsHelpers.adjustSplitLine
    ForceSimplifiRecalcThenRedirect(desiredTarget){
      requestAnimationFrame(() => {
        this.simplifiInputNode.removeEventListener('focus', this.simplifiInputNodefocusHandler)
        console.log("Moving focus to simplifiInputNode to force Calc " + this.simplifiInputNode);
        this.simplifiInputNode.focus();
        if(desiredTarget instanceof HTMLElement && typeof desiredTarget.focus === 'function'){
          console.log("force recalc done redirecting focus to deisred target: "  + desiredTarget);
          desiredTarget.focus(); // todo: need to check for jump back and forth issue
        }else{
          console.log('desired target : ' + desiredTarget + ' is not an html element with a focus function on it')
        }
        
        this.simplifiInputNode.addEventListener('focus',this.simplifiInputNodefocusHandler);
        
      });
    }
  
    ManageRowLines(inputBox){
      let inputValue = inputBox.value;
      let lastChar = inputValue.slice(-1);
      let OperatorKeys = /^[\+\-\/*]$/;
  
      if(OperatorKeys.test(lastChar))
      {
        const beforeOperator = inputValue.slice(0, -1);
        const lines = beforeOperator.split('\n');
        const currentLine = lines[lines.length - 1];
        
        if(currentLine.trim().length > 0) {
          inputBox.value = beforeOperator + '\n' + lastChar;
        }
      }
  
    }
  
    manageTextAreaExpansion(inputBox){
      inputBox.style.height = "auto";
      inputBox.style.height = (inputBox.scrollHeight) + "px";
      if(inputBox.clientHeight > parseInt(window.getComputedStyle(inputBox).maxHeight) ){
        inputBox.style.overflowY ="Auto";
      }else{
        inputBox.style.overflowY = "hidden";
      }
    }
  
    inputChangeHandler(event){
      this.clearValidationError(event.target);
      this.ManageRowLines(event.target);
      this.manageTextAreaExpansion(event.target);
    }
  
    keyDownHandler (event){
      if(event.key === 'Enter'){
        event.preventDefault();
        if(this.validateExpression(event.target.value)) {
          this.runCalculator();
        } else {
          this.showValidationError(event.target);
        }
        return;
      }
      
      if(!this.checkAllowedValues(event.key)){
        event.preventDefault();
      }
    }
  
    checkAllowedValues(inputvalue){
      let allowedKeysPattern = /^[0-9\+\-\/*.]$/;
      if(allowedKeysPattern.test(inputvalue) || inputvalue ==='Enter' || inputvalue === 'Backspace' || inputvalue === 'Delete' || inputvalue === 'ArrowLeft' || inputvalue === 'ArrowRight' ){
        return true;
      }
      return false;
    }
  
    // must be delcared in Public Class Fields Syntax to ensure
    // 1. "this" is correct referring to the current instance of calculator
    // 2. the SimplifiInputNodefocusHandler is pass as the defintion of the event handler (not as an anonymous function which can not be added a removed during lifecycle events) setFocusOnSimplifyInputBox where function is removed and readded when setting focus back on the simplifi inputbox which is needed to ensure recalc of splits is triggerd by simplifi
    simplifiInputNodefocusHandler = (event) => {
  
      this.showPowerToolInputBox();
      
      const currentValue = this.simplifiInputNode.value;
      const isZero = this.isValueZero(currentValue);
      
      this.powerToolCalcInputNode.value = isZero ? '' : currentValue;
      
      this.hideSimplifiInputBox();
      this.setFocusOnPowerToolBox();
    }
  
    getCalcTimeDirectionIndicator(value, startingDirection){
      //this handles what indicator we should use while calulating. in general it is logical with a normal calc
      // with the exception that we show positives with a leading + if we came into the calculator with a +
      if(value > 0 && (startingDirection === '+' || this.originalCalcDirection === '+')){
        return '+';
      }else {
        return '';
      }
    }

    getReturnTimeDirectionIndicator(value){
      //todo: this handles when exiting the Power Tool Calculator back to Simplifi box
      // we must handle calc directions to match simplifi expectations see wiki document on git hub to learn more
      // https://github.com/BinaryBeanCounter/simplifi-power-tools/wiki/How-Does-Simplifi-Handle-(Minus-,-Plus-,-blank)-indicators-in-fields
      
      if(value.startsWith('+') ){
        value = value.slice(1); // for + slice it off we will let the following function decide what is needed
      }
      if(this.originalCalcDirection === '+'){
        if(value > 0 ){
          return this.originalCalcDirection + value;
        }else if ( value < 0){
          return value;
        }else {
          return value;
        }
      }else if (this.originalCalcDirection === '-'){
        if(value > 0 ){
          return value;
        }else if ( value < 0){
          return value;
        }else {
          return value;
        }
      }else if (this.originalCalcDirection === ""){
        return value; // Simply return the calculated value with its sign
      }
    }
  
    // setDefaultCalcDirection(value){
    //   switch(value[0]){
    //     case '+':
    //       this.calcDirection = '+'
    //         break;
    //     case '-':
    //       this.calcDirection = '-'
    //       break;
    //     default:
    //         this.calcDirection = ''
    //   }
    // }

    setOriginalCalcDirection(value){
      switch(value[0]){
        case '+':
          this.originalCalcDirection = '+'
            break;
        case '-':
          this.originalCalcDirection = '-'
          break;
        default:
            this.originalCalcDirection = ''
      }
    }
  
         // this could happen for a few reason
        // 1) did we just enable the calculator and simplify passed us this (+ or -)
        // 2) did we change calc directions while doing some math (-)
        // for + the only way we get this is if simplifi passes it to us but for - we could calc into this 
    runCalculator(){
      let returnvalue = 0;
      let startingDirection = '';
      try{
        let calcutionString = this.powerToolCalcInputNode.value;

        if(calcutionString.startsWith('+') ){
          startingDirection =  '+';
          calcutionString = calcutionString.slice(1); // for + slice it off we will put it back
        } else if(calcutionString.startsWith('-')){
          startingDirection =  '+';
          // no need to strip negatives calculator will handle it
        }
        console.log('Calc String: ' + calcutionString);
        let cleanedCalcString = this.cleanValue(calcutionString);
        console.log('Clean Calc String: ' + cleanedCalcString);
        let calcValue = DoMath(cleanedCalcString);
        console.log('Calc Value: ' + calcValue);
        let roundedValue = parseFloat(calcValue.toFixed(6));
        console.log('Rounded Value: ' + roundedValue);
        returnvalue = roundedValue
        let signedValue = this.getCalcTimeDirectionIndicator(returnvalue, startingDirection) + returnvalue
        console.log('Signed Value : ' + signedValue);
        returnvalue = signedValue;
      }catch(exception){
        returnvalue = this.powerToolCalcInputNode.value
        console.log("error Calculating: " + this.powerToolCalcInputNode.value + " error message " + exception.message);
      } 
      this.powerToolCalcInputNode.value = returnvalue;
    }
  
    cleanValue(expression){
      return expression.replace(/[\n\r,]/g,"");
    }

    isValueZero(value) {
      const cleanValue = value.trim().replace(/^[+\-]/, '');
      return cleanValue === '' || parseFloat(cleanValue) === 0;
    }

    validateExpression(expression) {
      try {
        let cleanedExpression = this.cleanValue(expression);
        
        if(cleanedExpression.startsWith('+')) {
          cleanedExpression = cleanedExpression.slice(1);
        }
        
        const rpn = convertToRPN(cleanedExpression);
        if (!validateRPN(rpn)) {
          console.log("Validation failed: invalid RPN structure");
          return false;
        }
        
        return true;
      } catch(exception) {
        console.log("Validation failed: " + exception.message);
        return false;
      }
    }

    showValidationError(inputBox) {
      inputBox.classList.add('validation-error');
      
      inputBox.classList.add('shimmer-animation');
      
      setTimeout(() => {
        inputBox.classList.remove('shimmer-animation');
      }, 1000);
    }

    clearValidationError(inputBox) {
      inputBox.classList.remove('validation-error');
      inputBox.classList.remove('shimmer-animation');
    }
  
    powerToolInputNodelossFocusHandler(event) {
    if(event.relatedTarget === null || !event.relatedTarget.hasAttribute("id") || (event.relatedTarget.id !=='dlg-close')){
      requestAnimationFrame(() => {
        this.runCalculator();
        let externalOutputValue = this.getReturnTimeDirectionIndicator(this.powerToolCalcInputNode.value);
        this.powerToolCalcInputNode.value = externalOutputValue;
        
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeInputValueSetter.call(this.simplifiInputNode, externalOutputValue);
        
        this.simplifiInputNode.dispatchEvent(new Event('input', { bubbles: true }));
        this.simplifiInputNode.dispatchEvent(new Event('change', { bubbles: true }));
      });
    
      this.hidePowerToolInputBox()
      this.showSimplifiInputBox();

      if(event.relatedTarget !== null){
        console.log("Loss Handler redirecting focus to " + event.relatedTarget);
        this.ForceSimplifiRecalcThenRedirect(event.relatedTarget);
      }
    }
  }
  
    buildCalcNodeAndAttachListeners(){
      //console.log("Input Text Found id =" + this.simplifiInputNode.id + "  node: " + this.simplifiInputNode.cloneNode(false).outerHTML);
      
      this.signToggleContainer = document.createElement("div");
      this.signToggleContainer.style.display = 'flex';
      this.signToggleContainer.style.flexDirection = 'column';
      this.signToggleContainer.style.marginRight = '4px';
      
      this.plusButton = document.createElement("button");
      this.plusButton.textContent = '+';
      this.plusButton.style.width = '1em';
      this.plusButton.style.height = '1em';
      this.plusButton.style.fontSize = '0.8em';
      this.plusButton.style.padding = '0';
      this.plusButton.style.margin = '0';
      this.plusButton.style.border = '1px solid #ccc';
      this.plusButton.style.backgroundColor = '#000000';
      this.plusButton.style.cursor = 'pointer';
      this.plusButton.style.borderRadius = '2px';
      this.plusButton.addEventListener('click', () => {
        let value = this.simplifiInputNode.value;
        if (value.startsWith('+') || value.startsWith('-')) {
          value = value.slice(1);
        }
        this.simplifiInputNode.value = '+' + value;
        this.simplifiInputNode.dispatchEvent(new Event('change', { bubbles: true }));
      });
      
      this.minusButton = document.createElement("button");
      this.minusButton.textContent = '-';
      this.minusButton.style.width = '1em';
      this.minusButton.style.height = '1em';
      this.minusButton.style.fontSize = '0.8em';
      this.minusButton.style.padding = '0';
      this.minusButton.style.margin = '0';
      this.minusButton.style.border = '1px solid #ccc';
      this.minusButton.style.backgroundColor = '#000000';
      this.minusButton.style.cursor = 'pointer';
      this.minusButton.style.borderRadius = '2px';
      this.minusButton.addEventListener('click', () => {
        let value = this.simplifiInputNode.value;
        if (value.startsWith('+') || value.startsWith('-')) {
          value = value.slice(1);
        }
        this.simplifiInputNode.value = '-' + value;
        this.simplifiInputNode.dispatchEvent(new Event('change', { bubbles: true }));
      });
      
      this.signToggleContainer.appendChild(this.plusButton);
      this.signToggleContainer.appendChild(this.minusButton);
      
      this.powerToolActivateCalcButtonContainer = document.createElement("div");
      this.powerToolActivateCalcButtonContainer.style.display ='flex';
      this.powerToolActivateCalcButton = document.createElement("button");
      this.powerToolActivateCalcButton.classList.add("powerToolActivateCalcButton");
      this.powerToolActivateCalcButtonSVG = document.createElementNS(svgNS,"svg");
      this.powerToolActivateCalcButtonSVGPath = document.createElementNS(svgNS,"path");
  
  
      this.powerToolActivateCalcButtonContainer.appendChild(this.powerToolActivateCalcButton);
      this.powerToolActivateCalcButton.appendChild(this.powerToolActivateCalcButtonSVG);
      this.powerToolActivateCalcButtonSVG.appendChild(this.powerToolActivateCalcButtonSVGPath);
      this.powerToolActivateCalcButtonSVG.setAttribute("viewBox","0 0 93.11 122.88");
      this.powerToolActivateCalcButtonSVG.setAttribute("height","2em");
  
      this.powerToolActivateCalcButtonSVGPath.setAttribute("d","M15.11,13.14H78a3.43,3.43,0,0,1,2.43,1,1.07,1.07,0,0,1,.14.16,3.44,3.44,0,0,1,.87,2.29V36.25a3.47,3.47,0,0,1-1,2.44h0a3.42,3.42,0,0,1-2.43,1H15.11a3.43,3.43,0,0,1-2.44-1,1.07,1.07,0,0,1-.14-.16,3.44,3.44,0,0,1-.87-2.29V16.6a3.43,3.43,0,0,1,1-2.43h0a3.39,3.39,0,0,1,2.42-1Zm67.76,98.07a1.21,1.21,0,0,1,.88.37l0,0a1.25,1.25,0,0,1-.9,2.11H74.94a1.22,1.22,0,0,1-.88-.37,1.21,1.21,0,0,1-.37-.88,1.26,1.26,0,0,1,1.25-1.25ZM51,107.34l0,0a1.24,1.24,0,0,1-.35-.86,1.29,1.29,0,0,1,.37-.89h0a1.24,1.24,0,0,1,.88-.36,1.28,1.28,0,0,1,.89.36l2.28,2.29,2.29-2.29a1.24,1.24,0,0,1,.88-.36,1.23,1.23,0,0,1,1.25,1.25,1.24,1.24,0,0,1-.36.88l-2.29,2.29,2.29,2.28a1.28,1.28,0,0,1,.36.89,1.24,1.24,0,0,1-.36.88,1.28,1.28,0,0,1-.89.36,1.24,1.24,0,0,1-.88-.36l-2.29-2.29-2.28,2.29a1.28,1.28,0,0,1-.89.36,1.24,1.24,0,0,1-.88-.36l0,0a1.23,1.23,0,0,1,0-1.74l2.29-2.29L51,107.34Zm40.72-9.12V118.3a4.45,4.45,0,0,1-.35,1.75,4.68,4.68,0,0,1-1,1.49h0a4.56,4.56,0,0,1-1.47,1,4.45,4.45,0,0,1-1.75.35H46.26a4.45,4.45,0,0,1-1.75-.35A4.61,4.61,0,0,1,42,120.05a4.63,4.63,0,0,1-.35-1.75V78.13A4.62,4.62,0,0,1,42,76.39a4.44,4.44,0,0,1,1-1.49v0a4.53,4.53,0,0,1,1.47-1,4.45,4.45,0,0,1,1.75-.35H87.17a4.45,4.45,0,0,1,1.75.35,4.68,4.68,0,0,1,1.49,1,4.57,4.57,0,0,1,1,1.49,4.43,4.43,0,0,1,.35,1.74V98.22Zm-3.4,19.18V99.92H68.42v19.56H86.27a2.06,2.06,0,0,0,.79-.16,2.21,2.21,0,0,0,.68-.46,2.07,2.07,0,0,0,.61-1.46Zm0-20.88V79a2.06,2.06,0,0,0-.16-.79,2.24,2.24,0,0,0-.45-.68,2.18,2.18,0,0,0-.68-.45,2.06,2.06,0,0,0-.79-.16H68.42V96.52ZM45.09,79V96.52H65V77H47.17a2.11,2.11,0,0,0-.8.16,2,2,0,0,0-.67.45A2.07,2.07,0,0,0,45.09,79Zm0,20.88V117.4a2.13,2.13,0,0,0,1.28,1.92,2.11,2.11,0,0,0,.8.16H65V99.92Zm8.74-17.7a1.22,1.22,0,0,1,.37-.88,1.24,1.24,0,0,1,1.77,0,1.26,1.26,0,0,1,.36.88v2.72h2.72a1.27,1.27,0,0,1,.88.36,1.24,1.24,0,0,1,0,1.77,1.27,1.27,0,0,1-.88.36H56.33v2.72a1.25,1.25,0,0,1-1.25,1.25A1.24,1.24,0,0,1,54.2,91a1.22,1.22,0,0,1-.37-.88V87.43H51.12a1.25,1.25,0,1,1,0-2.49h2.71V82.22Zm29,2.72a1.25,1.25,0,1,1,0,2.49H74.94a1.26,1.26,0,0,1-.88-.36,1.24,1.24,0,0,1,0-1.77,1.26,1.26,0,0,1,.88-.36Zm0,20.81A1.34,1.34,0,0,1,84.12,107a1.26,1.26,0,0,1-1.25,1.25H74.94a1.22,1.22,0,0,1-.88-.37,1.21,1.21,0,0,1-.37-.88,1.24,1.24,0,0,1,.37-.88,1.22,1.22,0,0,1,.88-.37Zm-13-85.4h2.27V32.53H69.91V20.35ZM77.56,17h-62V35.8h62V17ZM65.85,51H76.9a1.73,1.73,0,0,1,1.72,1.73V62a1.73,1.73,0,0,1-1.72,1.73H65.85a1.73,1.73,0,0,1-1.73-1.72V52.72A1.74,1.74,0,0,1,65.85,51ZM40.91,51H52a1.74,1.74,0,0,1,1.73,1.73V62A1.74,1.74,0,0,1,52,63.77H40.91a1.73,1.73,0,0,1-1.73-1.72V52.72A1.74,1.74,0,0,1,40.91,51ZM16.44,51h11a1.73,1.73,0,0,1,1.72,1.73V62a1.73,1.73,0,0,1-1.72,1.73h-11a1.73,1.73,0,0,1-1.73-1.72V52.72A1.74,1.74,0,0,1,16.44,51Zm0,44.33h11A1.73,1.73,0,0,1,29.21,97v9.33a1.73,1.73,0,0,1-1.72,1.72h-11a1.73,1.73,0,0,1-1.73-1.72V97a1.74,1.74,0,0,1,1.73-1.72Zm0-22.17h11a1.73,1.73,0,0,1,1.72,1.73v9.33a1.73,1.73,0,0,1-1.72,1.72h-11a1.73,1.73,0,0,1-1.73-1.72V74.88a1.74,1.74,0,0,1,1.73-1.73ZM6.91,0H86.2a6.91,6.91,0,0,1,4.88,2h0a6.9,6.9,0,0,1,2,4.87V65.18H88.47V6.91a2.24,2.24,0,0,0-.66-1.6h0a2.23,2.23,0,0,0-1.6-.66H6.91a2.24,2.24,0,0,0-1.6.66h0a2.24,2.24,0,0,0-.66,1.6V113.82a2.26,2.26,0,0,0,.66,1.6h0a2.29,2.29,0,0,0,1.6.66H33.08v4.64H6.91a6.89,6.89,0,0,1-4.87-2H2a6.9,6.9,0,0,1-2-4.87V6.91A6.89,6.89,0,0,1,2,2V2A6.9,6.9,0,0,1,6.91,0Z");
  
      this.simplifiInputNode.addEventListener('focus',this.simplifiInputNodefocusHandler);
      
      this.powerToolCalcContainerNode = this.simplifiInputContainerNode.cloneNode(true);
      this.powerToolCalcContainerNode.id = CalcIDBaseName + "-Container";
      this.powerToolCalcInputNode = document.createElement("textarea");
      this.powerToolCalcInputNode.id = CalcIDBaseName + "-Input";
      this.powerToolCalcInputNode.setAttribute("associated-amount:", this.inputElementID);
  
      // must append after cloning
      this.simplifiInputDiv.appendChild(this.signToggleContainer);
      this.simplifiInputDiv.appendChild(this.powerToolActivateCalcButtonContainer);
     
  
      this.powerToolCalcInputLabel = this.powerToolCalcContainerNode.querySelector('label');
      if(this.powerToolCalcInputLabel) {
        this.powerToolCalcInputLabel.textContent = "Power Tool Calc";
        this.powerToolCalcInputLabel.setAttribute("associated-amount", this.inputElementID);
      }
      
      const dollarSymbols = this.powerToolCalcContainerNode.querySelectorAll('*');
      for(let i = 0; i < dollarSymbols.length; i++) {
        const elem = dollarSymbols[i];
        if(elem.textContent.trim() === '$' && elem.children.length === 0) {
          elem.parentNode.removeChild(elem);
          break;
        }
      }
  
      let oldNode = this.powerToolCalcContainerNode.querySelector('input[type="text"]'); // find text field and replace it with new input field
      this.powerToolCalcInputNode.className = oldNode.className;
      oldNode.parentNode.replaceChild(this.powerToolCalcInputNode, oldNode);
      //this.powerToolCalcInputNode.type = 'text';
      //this.powerToolCalcInputNode.style.cssText = `width: 100px; height: 50px; position: absolute; background-color: red; z-index: ${ parseInt(window.getComputedStyle(this.transactionModel.parentNode.parentNode).getPropertyValue('z-index'))}`;
      //this.powerToolCalcInputNode.style.cssText = `z-index: ${ parseInt(window.getComputedStyle(this.transactionModel.parentNode.parentNode).getPropertyValue('z-index'))}`;
      this.powerToolCalcInputNode.addEventListener('blur',(event) => this.powerToolInputNodelossFocusHandler(event));
      this.powerToolCalcInputNode.addEventListener('keydown',(event) => this.keyDownHandler(event));
      this.powerToolCalcInputNode.addEventListener('input',(event) => this.inputChangeHandler(event));
      this.hidePowerToolInputBox();
      
      let parentContainer = this.simplifiInputContainerNode.parentNode;
      if(parentContainer) {
        parentContainer.appendChild(this.powerToolCalcContainerNode);
      } else {
        this.simplifiInputDiv.appendChild(this.powerToolCalcContainerNode);
      }
    }
  
  
      // this.simplifiInputNode => <input>(+/-)x.yz</input> - Original Simplifi input element
      // this.simplifiInputDiv => Parent div containing the input and dollar sign
      // this.simplifiInputContainerNode => Container found by InputDiscovery.findInputContainer()
      // this.powerToolCalcContainerNode => Cloned container with textarea replacing input
      //   <label>PowerTools Calc</label> => this.powerToolCalcInputLabel
      //     <textarea>(+/-)x.yz</textarea> => this.powerToolCalcInputNode (supports multiline)
  
      destory(){
        this.simplifiInputNode.removeEventListener('focus', this.simplifiInputNodefocusHandler)
        this.powerToolCalcContainerNode.parentNode.removeChild(this.powerToolCalcContainerNode); // remove Powertool
        this.powerToolActivateCalcButtonContainer.parentNode.removeChild(this.powerToolActivateCalcButtonContainer); // remove calc icon
        this.signToggleContainer.parentNode.removeChild(this.signToggleContainer); // remove sign toggle buttons
      }
  
      constructor(transactionModel, inputElement, parent) {
        this.parent = parent;
        this.simplifiInputNode = inputElement;
        this.simplifiInputDiv = inputElement.parentNode;
        this.simplifiInputContainerNode = InputDiscovery.findInputContainer(inputElement);
        
        if(!this.simplifiInputNode){
          console.log("PowerTool Error: unable to locate input element");
        }
        this.inputElementID = InputDiscovery.generateInputKey(inputElement);
        this.buildCalcNodeAndAttachListeners();
        this.setOriginalCalcDirection(this.simplifiInputNode.value[0]);
      }
  }
