
export function amountFieldKeyGenerator(QAmountField){
    return QAmountField.id
  }
  
 function getImmediateTextOnly(childNodes){
    return immediateTextContent = Array.from(childNodes).filter(function(node) {
      return node.nodeType === 3; // Text node type
    }).map(function(textNode) {
      return textNode.nodeValue.trim();
    }).join('');
  } 
  
  export function findFirst(rootnode, selector, targetText) {
    var elements = rootnode.querySelectorAll(selector);
    return targetDiv = Array.from(elements).find(function(div) {
      let immediatetext = getImmediateTextOnly(div.childNodes);
      return immediatetext===targetText;
    });
  }
  
  //  function round(number, decimalPlaces) {
  //   if (typeof number !== 'number' || typeof decimalPlaces !== 'number') {
  //     throw new Error('Both arguments must be numbers.');
  //   }
  
  //   const factor = 10 ** decimalPlaces;
  //   const roundedValue = parseInt((number * factor) + 0.5) / factor;
  
  //   return roundedValue;
  // }

  export function isNumeric(str) {
    return !isNaN(str) && !isNaN(parseFloat(str));
  }