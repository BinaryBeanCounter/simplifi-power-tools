import {amountFieldKeyGenerator, findFirst} from './helperFunctions';
import {DoMath} from './math';
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
        inputBox.value = inputValue.slice(0,-1) + '\n' + lastChar;
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
  
    manageEnter(inputBox){
      let inputValue = inputBox.value;
      let lastChar = inputValue.slice(-1);
      if(lastChar === '\n'){
        this.runCalculator();
        this.powerToolCalcInputNode.value = this.simplifiInputNode.value;
      }
    }
  
    inputChangeHandler(event){
      this.ManageRowLines(event.target);
      this.manageEnter(event.target);
      this.manageTextAreaExpansion(event.target);
    }
  
    keyDownHandler (event){
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
      this.powerToolCalcInputNode.value = this.simplifiInputNode.value;
      this.hideSimplifiInputBox();
      this.setFocusOnPowerToolBox();
    }
  
    getCalcDirectionIndicator(value){
      //todo: this is not working when value does not start with a + and instead is blank
      // need to understand what default really means
      if(this.calcDirection === '+'){
        if(value > 0 ){
          return this.calcDirection
        }else if ( value < 0){
          return '';
        }else {
          return '';
        }
      }else if (this.calcDirection === '-'){
        if(value > 0 ){
          return '';
        }else if ( value < 0){
          return '';
        }else {
          return '';
        }
      }else if (this.calcDirection === ""){
        if(value > 0 ){
          return '';
        }else if ( value < 0){
          return '';
        }else {
          return '';
        }
      }
    }
  
    setDefaultCalcDirection(value){
      switch(value[0]){
        case '+':
          this.calcDirection = '+'
            break;
        case '-':
          this.calcDirection = '-'
          break;
        default:
            this.calcDirection = ''
      }
    }
  
  
    runCalculator(){
      let returnvalue = 0;
      try{
        let calcutionString = this.powerToolCalcInputNode.value;
        if(calcutionString.startsWith('+') ){
          calcutionString = calcutionString.slice(1);
        }
        console.log('Calc String: ' + calcutionString);
        let cleanedCalcString = this.cleanValue(calcutionString);
        console.log('Clean Calc String: ' + cleanedCalcString);
        let calcValue = DoMath(cleanedCalcString);
        console.log('Calc Value: ' + calcValue);
        let roundedValue = parseFloat(calcValue.toFixed(6));
        console.log('Rounded Value: ' + roundedValue);
        returnvalue = roundedValue
        let signedValue = this.getCalcDirectionIndicator(returnvalue) + returnvalue
        console.log('Signed Value : ' + signedValue);
        returnvalue = signedValue;
  
      }catch(exception){
        returnvalue = this.powerToolCalcInputNode.value
        console.log("error Calculating: " + this.powerToolCalcInputNode.value + " error message " + exception.message);
      } 
      this.simplifiInputNode.value =  returnvalue;
    }
  
    cleanValue(expression){
      return expression.replace(/[\n\r,]/g,"");
    }
  
    powerToolInputNodelossFocusHandler(event) { 
        //recalculate as long as close button is not clicked
      // ensure no redirect against self on force recalc
      //if(event.target.id ='PowerToolsCalc-Input' and event.relatedTarget.) // redirect is not working
      if(event.relatedTarget === null || !event.relatedTarget.hasAttribute("id") || (event.relatedTarget.id !=='dlg-close')){
        this.runCalculator();
      
        //this.simplifyInputNode.dispatchEvent(new Event('click', { bubbles: true }));
        //this.simplifyInputNode.dispatchEvent(new Event('focus', { bubbles: true }));
        this.simplifiInputNode.dispatchEvent(new Event('change', { bubbles: true })); // must dispatch change for value to commit on simplifi side
        //this.simplifyInputNode.dispatchEvent(new Event('blur', { bubbles: true, cancelable: false })); //lr.splitsHelpers.adjustSplitLine
        this.hidePowerToolInputBox()
        this.showSimplifiInputBox();
        this.setDefaultCalcDirection(this.powerToolCalcInputNode.value);
        if(event.relatedTarget !== null){
          console.log("Loss Handler redirecting focus to " + event.relatedTarget);
          this.ForceSimplifiRecalcThenRedirect(event.relatedTarget);
        }
      }
     
      
    }
  
    buildCalcNodeAndAttachListeners(){
      //console.log("Input Text Found id =" + this.simplifiInputNode.id + "  node: " + this.simplifiInputNode.cloneNode(false).outerHTML);
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
      this.powerToolCalcInputNode.setAttribute("associated-amount:",this.simplifiQAmountFieldNodeID);
  
      // must append after cloning
      this.simplifiInputDiv.appendChild(this.powerToolActivateCalcButtonContainer);
     
  
      this.powerToolCalcInputLabel = this.powerToolCalcContainerNode.querySelector('label');
      this.powerToolCalcInputLabel.textContent = "Power Tool Calc" 
      this.powerToolCalcInputLabel.classList.add('hello');
      //this.powerToolCalcInputLabel.addAttribute("associated-amount");
      this.powerToolCalcInputLabel.setAttribute("associated-amount",this.simplifiQAmountFieldNodeID);
     
      // this is not workng presently
      if (this.powerToolCalcInputNode.hasAttribute("sharedcomponentid")) {
        this.powerToolCalcInputNode.removeAttribute("sharedcomponentid");
      }
      // find $ and remove it
      let dollarSymbolDiv = findFirst(this.powerToolCalcContainerNode,"div","$");
      if(dollarSymbolDiv){
        // remove dollar sign div
        dollarSymbolDiv.parentNode.removeChild(dollarSymbolDiv);
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
      this.hidePowerToolInputBox(); // don't show until user clicks on an associated simplifi input box
      this.simplifiQAmountFieldNode.appendChild(this.powerToolCalcContainerNode);
    }
  
  
      // structure of a simplifi split node and associated PowerTool Calc node is as follows and fields are mapped as follows
      // <div id="details-amount" sharedcomponentid="QAmountField"> => this.simplifiSplitNode 
      //  <div> => this.simplifiInputContainerNode (first child under QAmountField) we will use this to hide and show the field (this is cloned and added as a child to the this.simplifiSplitNode  to become this.powerToolCalcContainerNode node to ensure styles are consistent)
      //    <label>Amount</label>
      //    <div> => this.simplifiInputDiv
      //      <span>$</span> // removed in clone
      //      <input>(+/-)x.yz</input> => this.simplifiInputNode
      //    </div>
      //    <div>
      //      <>
      //    </div>
      //  </div>
      //  <div> => this.powerToolCalcContainerNode (now second child under QAmountField) we will use this to hide and show the field (this was cloned from this.simplifiInputContainerNode and added as a child to the this.simplifiSplitNode  to become this.powerToolCalcContainerNode node to ensure styles are consistent)
      //    <label>PowerTools Calc</label> => this.powerToolCalcInputLabel
      //    <div>
      //      <textarea>(+/-)x.yz</textarea> => this.powerToolCalcInputNode (replaced the input to support multiline)
      //    </div>
      //  </div> 
      // </div>
  
      destory(){
        this.simplifiInputNode.removeEventListener('focus', this.simplifiInputNodefocusHandler)
        this.powerToolCalcContainerNode.parentNode.removeChild(this.powerToolCalcContainerNode); // remove Powertool
        this.powerToolActivateCalcButtonContainer.parentNode.removeChild(this.powerToolActivateCalcButtonContainer); // remove calc icon
      }
  
      constructor(transactionModel, simplifiQAmountFieldNode, parent) {
        this.parent = parent;
        this.simplifiQAmountFieldNode = simplifiQAmountFieldNode;
        this.simplifiInputContainerNode = simplifiQAmountFieldNode.childNodes[0];
        this.transactionModel = transactionModel;
        this.simplifiInputNode = this.simplifiQAmountFieldNode.querySelector('input[type="text"]');
        this.simplifiInputDiv = this.simplifiInputNode.parentNode;
        if(!this.simplifiInputNode){
          console.log("PowerTool Error: unable to locate input[type=text] field as a child of " + this.simplifiQAmountFieldNode.cloneNode(false).outerHTML);
        }
        this.simplifiQAmountFieldNodeID = amountFieldKeyGenerator(simplifiQAmountFieldNode);
        this.buildCalcNodeAndAttachListeners();
        this.setDefaultCalcDirection(this.simplifiInputNode.value[0]);
      }
  }