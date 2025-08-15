import {Calculator} from './calculator';
import {amountFieldKeyGenerator} from './helperFunctions';

export class TransactionModel{

    static AMOUNT_FIELD_SELECTORS = [
      '[sharedcomponentid="QAmountField"]',
      '[data-testid*="amount"]',
      'input[type="text"][id*="amount"]',
      'div[id*="amount"] input[type="text"]'
    ];

    findAmountFields(ModelNode) {
      for (const selector of TransactionModel.AMOUNT_FIELD_SELECTORS) {
        try {
          const nodes = ModelNode.querySelectorAll(selector);
          if (nodes.length > 0) {
            console.log(`Found ${nodes.length} amount fields using selector: ${selector}`);
            return Array.from(nodes).filter(node => {
              const hasTextInput = node.tagName === 'INPUT' || node.querySelector('input[type="text"]');
              const hasAmountContext = node.id?.includes('amount') || 
                                     node.getAttribute('sharedcomponentid')?.includes('Amount') ||
                                     node.closest('[id*="amount"]');
              return hasTextInput && hasAmountContext;
            });
          }
        } catch (error) {
          console.warn(`Selector failed: ${selector}`, error);
          continue;
        }
      }
      console.warn('No amount fields found with any known selector');
      return [];
    }

    addCalculators(ModelNode){
      if (!this.cachedAmountNodes || this.cachedAmountNodes.length === 0) {
        this.cachedAmountNodes = this.findAmountFields(ModelNode);
      }
      
      for (let i = 0; i < this.cachedAmountNodes.length; i++) {
        let AmountNode = this.cachedAmountNodes[i];
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
              const amountNodes = this.findAmountFields(element);
              amountNodes.forEach(AmountNode => {
                console.log("QAmountField Detected id =" + AmountNode.id + "  node: " + AmountNode.cloneNode(false).outerHTML);
                if(!this.checkIfCalculatorExists(AmountNode)){
                  this.createCalculator(AmountNode, this.parentModel);
                }
              });
            }
          })
        }
        if(mutation.removedNodes.length > 0){
          mutation.removedNodes.forEach( (element) => {
            console.log("removed id =" + element?.id + "  node: " + element.cloneNode(false).outerHTML);
            if(element?.getAttribute('class')?.includes('-catRow')){
              console.log("cat remove removed id =" + element.id + "  node: " + element.cloneNode(false).outerHTML);
              // todo: I think i need to detach all of these nodes from the dom and recreate them in case you are on a amount field and directly click the garbage icon
              for( let [key,value] of this.calculatorMap.entries()){
                value.destory();
              }
              this.calculatorMap = new Map(); // clear all calculators and recreate because simplifi always removes the last QAmountField node regardless of which row is deleted and then it reassigns values to all of the previous QAmountFields to make it look like you removed a middle one but this can be confirmed by looking at the ID field of the split row
              this.cachedAmountNodes = null;
              //recreate all calculators
              this.addCalculators(this.parentModel);
            }
          });
        }
      }
    }
  
    static DETAIL_PANE_SELECTORS = [
      '.css-4rizef-root',
      '[data-testid*="detail"]',
      '[role="main"]',
      'div[class*="detail"]',
      'div[class*="root"]'
    ];

    findDetailPane(parentNode) {
      for (const selector of TransactionModel.DETAIL_PANE_SELECTORS) {
        try {
          const pane = parentNode.querySelector(selector);
          if (pane) {
            console.log(`Found detail pane using selector: ${selector}`);
            return pane;
          }
        } catch (error) {
          console.warn(`Detail pane selector failed: ${selector}`, error);
          continue;
        }
      }
      console.warn('No detail pane found with any known selector, using parentNode as fallback');
      return parentNode;
    }

    constructor (transactionDetailHeader, parent){
      this.parent = parent;
      this.parentModel = transactionDetailHeader.parentNode;
      this.detailPane = this.findDetailPane(transactionDetailHeader.parentNode);
      console.log("Detail Root Pane Found id =" + this.detailPane.id + "  node: " + this.detailPane.cloneNode(false).outerHTML);
      this.calculatorMap = new Map();
      this.cachedAmountNodes = null;
      this.addCalculators(this.parentModel);
      this.setupSplitObserver(this.detailPane);
    }
  }
