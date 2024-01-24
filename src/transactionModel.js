import {Calculator} from './calculator';
import {amountFieldKeyGenerator} from './helperFunctions';

export class TransactionModel{

    addCalculators(ModelNode){
      let allAmountNodes = ModelNode.querySelectorAll('[sharedcomponentid="QAmountField"]');
      for (let i = 0; i < allAmountNodes.length; i++) {
        let AmountNode = allAmountNodes[i];
        console.log("QAmountField Detected id =" + AmountNode.id + "  node: " + AmountNode.cloneNode(false).outerHTML);
        this.createCalculator(AmountNode, ModelNode);
      }
    }
  
    createCalculator(qAmountNode, ModelNode){
      let currentCalc = new Calculator(ModelNode,qAmountNode,this);
      this.calculatorMap.set(currentCalc.simplifiQAmountFieldNodeID, currentCalc);
    }
  
    checkIfCalculatorExists(qAmountNode){
        let id = amountFieldKeyGenerator(qAmountNode);
        return this.calculatorMap.has(id);
    }
  
    setupSplitObserver(detailPaneRoot){
      this.config = { attributes: false, childList: true, subtree: false };
      this.observer = new MutationObserver((mutationList, observer) => this.detailPaneMutuationCallBack(mutationList, observer));
      this.observer.observe(detailPaneRoot, this.config);
    }
  
    detailPaneMutuationCallBack(mutationList, observer){
      for (const mutation of mutationList) {
        if(mutation.addedNodes.length > 0){
          mutation.addedNodes.forEach( (element) => {
            console.log("added id =" + element.id + "  node: " + element.cloneNode(false).outerHTML);
            if(element.getAttribute('class').includes('-catRow')){
              let AmountNode = element.querySelector('[sharedcomponentid="QAmountField"]');
              console.log("QAmountField Detected id =" + AmountNode.id + "  node: " + AmountNode.cloneNode(false).outerHTML);
              if(!this.checkIfCalculatorExists(AmountNode)){
                this.createCalculator(AmountNode, this.parentModel);
              }
            }
          })
        }
        if(mutation.removedNodes.length > 0){
          mutation.removedNodes.forEach( (element) => {
            console.log("removed id =" + element.id + "  node: " + element.cloneNode(false).outerHTML);
            if(element.getAttribute('class').includes('-catRow')){
              console.log("cat remove removed id =" + element.id + "  node: " + element.cloneNode(false).outerHTML);
              // todo: I think i need to detach all of these nodes from the dom and recreate them in case you are on a amount field and directly click the garbage icon
              for( let [key,value] of this.calculatorMap.entries()){
                value.destory();
              }
              this.calculatorMap = new Map(); // clear all calculators and recreate because simplifi always removes the last QAmountField node regardless of which row is deleted and then it reassigns values to all of the previous QAmountFields to make it look like you removed a middle one but this can be confirmed by looking at the ID field of the split row
              //recreate all calculators
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