import {Calculator} from './calculator';
import {InputDiscovery} from './inputDiscovery';

export class PowerToolApps{
 
  setupDocumentObserver(){
    this.config = { attributes: false, childList: true, subtree: true };
    this.observer = new MutationObserver((mutationList, observer) => this.documentMutationCallback(mutationList, observer));
    this.observer.observe(this.targetNode, this.config);
  }

  documentMutationCallback(mutationList, observer){
    for (const mutation of mutationList) {
      if(mutation.addedNodes.length > 0){
        mutation.addedNodes.forEach( (element) => {
          if(element.nodeType === Node.ELEMENT_NODE) {
            this.scanForInputs(element);
          }
        })
      }
      if(mutation.removedNodes.length > 0){
        mutation.removedNodes.forEach((element) => {
          if(element.nodeType === Node.ELEMENT_NODE) {
            this.cleanupRemovedInputs(element);
          }
        });
      }
    }
  }

  scanForInputs(rootElement){
    const inputInfos = InputDiscovery.findAllNumericInputs(rootElement);
    for(let i = 0; i < inputInfos.length; i++) {
      const inputInfo = inputInfos[i];
      const inputElement = inputInfo.inputElement;
      
      if(!this.checkIfCalculatorExists(inputElement)){
        console.log("Numeric Input Detected via " + inputInfo.detectionMethod + " - input: " + inputElement.cloneNode(false).outerHTML);
        this.createCalculator(inputElement);
      }
    }
  }

  cleanupRemovedInputs(rootElement){
    const inputsToRemove = [];
    
    for(let [key, calculator] of this.calculatorMap.entries()){
      if(!document.body.contains(calculator.simplifiInputNode)){
        inputsToRemove.push(key);
      }
    }
    
    for(let key of inputsToRemove){
      const calculator = this.calculatorMap.get(key);
      console.log("Removing calculator for input: " + key);
      calculator.destory();
      this.calculatorMap.delete(key);
    }
  }

  createCalculator(inputElement){
    const currentCalc = new Calculator(null, inputElement, this);
    this.calculatorMap.set(currentCalc.inputElementID, currentCalc);
  }

  checkIfCalculatorExists(inputElement){
    const id = InputDiscovery.generateInputKey(inputElement);
    return this.calculatorMap.has(id);
  }

  constructor(){
    this.targetNode = document.body;
    this.calculatorMap = new Map();
    this.setupDocumentObserver();
    
    requestAnimationFrame(() => {
      this.scanForInputs(document.body);
    });
  }
}
