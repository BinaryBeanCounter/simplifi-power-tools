
import {TransactionModel} from './transactionModel';

export class PowerToolApps{
 
  setupTransactionObserver(){
    this.config = { attributes: false, childList: true, subtree: false };
    this.observer = new MutationObserver((mutationList, observer) => this.bodyMutationCallback(mutationList, observer));
    this.observer.observe(this.targetNode, this.config);
  }

  bodyMutationCallback(mutationList, observer){
    for (const mutation of mutationList) {
      if(mutation.addedNodes.length > 0){
        mutation.addedNodes.forEach( (element) => {
          let transactionDetailDialogNode = this.getTransactionDetailDialog(element);
          if( transactionDetailDialogNode !== null){
            console.log("Transaction Detail Dialog Detected id =" + transactionDetailDialogNode.id + "  node: " + transactionDetailDialogNode.cloneNode(false).outerHTML);
            this.activeTransactionModel = new TransactionModel (transactionDetailDialogNode,this);
          }
        })
      }
      if(mutation.removedNodes.length > 0){
        mutation.removedNodes.forEach((element) => {
          let transactionDetailDialogNode = this.getTransactionDetailDialog(element);
          if(transactionDetailDialogNode !== null) {
            console.log("Transaction Detail Dialog has been removedid =" + transactionDetailDialogNode.id + " node: " + transactionDetailDialogNode.cloneNode(false).outerHTML);
            this.activeTransactionModel = null;
          }
        });
      }
    }
  }

  getTransactionDetailDialog (item){
    if(item)
    {
      //console.log(typeof item);
      try{
          let TransactionDetailPage = item.querySelector('[sharedcomponentid="TRANSACTION_DETAILS_DIALOG"]');
          if (TransactionDetailPage)
          {
              return TransactionDetailPage;
          }
      }catch(error){
          console.error("An error occurred:", error.message);
      }
    }
    else
    {
      console.log("items is nothing" );
    }
    return null;
  }

  constructor(){
    this.targetNode = document.body;
    this.setupTransactionObserver();
    this.activeTransactionModel = null;
  }
}