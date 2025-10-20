import {Calculator} from './calculator';
import {InputDiscovery} from './inputDiscovery';

export class TransactionModel{

    addCalculators(ModelNode){
      let allInputs = InputDiscovery.findAllNumericInputs(ModelNode);
      for (let i = 0; i < allInputs.length; i++) {
        let inputInfo = allInputs[i];
        console.log("Numeric Input Detected via " + inputInfo.detectionMethod + " - input: " + inputInfo.inputElement.cloneNode(false).outerHTML);
        this.createCalculator(inputInfo.inputElement, ModelNode);
      }
    }
  
    createCalculator(inputElement, ModelNode){
      let currentCalc = new Calculator(ModelNode, inputElement, this);
      this.calculatorMap.set(currentCalc.inputElementID, currentCalc);
    }
  
    checkIfCalculatorExists(inputElement){
        let id = InputDiscovery.generateInputKey(inputElement);
        return this.calculatorMap.has(id);
    }
  
    setupSplitObserver(detailPaneRoot){
      this.config = { attributes: false, childList: true, subtree: true };
      this.observer = new MutationObserver((mutationList, observer) => this.detailPaneMutuationCallBack(mutationList, observer));
      this.observer.observe(detailPaneRoot, this.config);
    }
  
    detailPaneMutuationCallBack(mutationList, observer){
      for (const mutation of mutationList) {
        if(mutation.addedNodes.length > 0){
          mutation.addedNodes.forEach( (element) => {
            console.log("added id =" + element?.id + "  node: " + element.cloneNode(false).outerHTML);
            if(element?.getAttribute('class')?.includes('-catRow')){
              let inputInfos = InputDiscovery.findAllNumericInputs(element);
              if(inputInfos.length > 0) {
                let inputInfo = inputInfos[0];
                console.log("Numeric Input Detected via " + inputInfo.detectionMethod + " - input: " + inputInfo.inputElement.cloneNode(false).outerHTML);
                if(!this.checkIfCalculatorExists(inputInfo.inputElement)){
                  this.createCalculator(inputInfo.inputElement, this.parentModel);
                }
              }
            }
          })
        }
        if(mutation.removedNodes.length > 0){
          mutation.removedNodes.forEach( (element) => {
            console.log("removed id =" + element?.id + "  node: " + element.cloneNode(false).outerHTML);
            if(element?.getAttribute('class')?.includes('-catRow')){
              console.log("cat remove removed id =" + element.id + "  node: " + element.cloneNode(false).outerHTML);
              for( let [key,value] of this.calculatorMap.entries()){
                value.destory();
              }
              this.calculatorMap = new Map();
              this.addCalculators(this.parentModel);
            }
          });
        }
      }
    }
  
    constructor (transactionDetailHeader, parent){
      this.parent = parent;
      this.parentModel = transactionDetailHeader.parentNode;
      this.detailPane = transactionDetailHeader.parentNode.querySelector(`.css-4rizef-root`);
      console.log("Detail Root Pane Found id =" + this.detailPane.id + "  node: " + this.detailPane.cloneNode(false).outerHTML);
      this.calculatorMap = new Map();
      this.addCalculators(this.parentModel);
      this.setupSplitObserver(this.detailPane);
    }
  }
