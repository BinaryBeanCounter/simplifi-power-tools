// Later, you can stop observing
// observer.disconnect();
// const CalcButtonID = "CalcButton"
// function onButtonClick() {
//   alert('Button clicked!');
// }
// window.onload = function() {
//   console.log('window onload event detected:');
// };

// document.addEventListener('input', function (event) {
//   // Your code to handle the click event
//   console.log('input event detected:', event);
//   console.log('input event detected value is:', event.target.value);
//   const TransactionDetailPage = document.querySelector('[sharedcomponentid="TRANSACTION_DETAILS_DIALOG"]');
//   if (TransactionDetailPage)
//   {
//   console.log ("is TransactionDetailPage");
//   let ParentDiv  = findClosestParentDiv(event.target,'DIV','sharedcomponentid','QAmountField',4);
//   console.log ("Found Parent DIV: " + ParentDiv.id);
//   LoadUpButton(event.target);
//   }else{
//     console.log ("is not TransactionDetailPage");
//   }

// });

// function LoadUpButton(InputBox){
//   //const TransactionDetailPage = document.querySelector('[id="undefinedqCard-add-account"]');
//   const existingbtn = InputBox.parentElement.querySelector(`[id=${CalcButtonID}]`);

//   // `document.querySelector` may return null if the selector doesn't match anything
//   if (!existingbtn) {
//     console.log ("Found it")
//     const mybttn  = document.createElement("button");
//     mybttn.id = CalcButtonID;
//     mybttn.textContent ="This is Cool";
//     mybttn.addEventListener('click',onButtonClick);
//     InputBox.insertAdjacentElement ("afterend", mybttn);
//     //   const text = article.textContent;
//     //   const wordMatchRegExp = /[^\s]+/g; // Regular expression
//     //   const words = text.matchAll(wordMatchRegExp);
//     //   // matchAll returns an iterator, convert to array to get word count
//     //   const wordCount = [...words].length;
//     //   const readingTime = Math.round(wordCount / 200);
//     //   const mybttn  = document.createElement("button");
//     //   mybttn.textContent ="This is Cool";
//     //   mybttn.addEventListener('click',onButtonClick);
  
//     //   const badge = document.createElement("p");
//     //   // Use the same styling as the publish information in an article's header
//     //   badge.classList.add("color-secondary-text", "type--caption");
//     //   badge.textContent = `⏱️ ${readingTime} min read`;
  
//     //   // Support for API reference docs
//     // const heading = article.querySelector("h1");
//     // // Support for article docs with date
//     // const date = article.querySelector("time")?.parentNode;
  
//     // (date ?? heading).insertAdjacentElement("afterend", badge);
//     // badge.insertAdjacentElement("afterend", mybttn);
//   } else {
//     console.log ("nothing found")
//   }
// }

// function findClosestParentDiv(element, elementType, Attribute, AttributeValue, maxIterations) {
//   let currentElement = element.parentElement;
//   let iterations = 0;
//   while (currentElement && currentElement.nodeName !== 'HTML' && iterations < maxIterations) {
//     if (currentElement.nodeName === elementType && currentElement.getAttribute(Attribute) === AttributeValue) {
//       return currentElement;
//     }
//     currentElement = currentElement.parentElement;
//     iterations++;
//   }

//   return null; // Return null if no matching parent is found
// }

// /**
//  * Wait for an element before resolving a promise
//  * @param {String} querySelector - Selector of element to wait for
//  * @param {Integer} timeout - Milliseconds to wait before timing out, or 0 for no timeout              
//  */
// function waitForElement(querySelector, timeout){
//   return new Promise((resolve, reject)=>{
//     var timer = false;
//     if(document.querySelectorAll(querySelector).length) return resolve();
//     const observer = new MutationObserver(()=>{
//       if(document.querySelectorAll(querySelector).length){
//         observer.disconnect();
//         if(timer !== false) clearTimeout(timer);
//         return resolve();
//       }
//     });
//     observer.observe(document.body, {
//       childList: true, 
//       subtree: true
//     });
//     if(timeout) timer = setTimeout(()=>{
//       observer.disconnect();
//       reject();
//     }, timeout);
//   });
// }

// waitForElement("#app-main-feature-frame", 3000).then(function(){
//   alert("element is loaded.. do stuff");
// }).catch(()=>{
//   alert("element did not load in 3 seconds");
// });