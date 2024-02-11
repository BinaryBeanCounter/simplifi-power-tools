/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 426:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Z: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(81);
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(645);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `.hello {
    color: red;
  }

  .powerToolActivateCalcButton {
    display: flex;
    background-color: transparent;
    box-shadow: none;
    border: none;
    outline: none;
}`, ""]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ 645:
/***/ ((module) => {



/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
module.exports = function (cssWithMappingToString) {
  var list = [];

  // return the list of modules as css string
  list.toString = function toString() {
    return this.map(function (item) {
      var content = "";
      var needLayer = typeof item[5] !== "undefined";
      if (item[4]) {
        content += "@supports (".concat(item[4], ") {");
      }
      if (item[2]) {
        content += "@media ".concat(item[2], " {");
      }
      if (needLayer) {
        content += "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {");
      }
      content += cssWithMappingToString(item);
      if (needLayer) {
        content += "}";
      }
      if (item[2]) {
        content += "}";
      }
      if (item[4]) {
        content += "}";
      }
      return content;
    }).join("");
  };

  // import a list of modules into the list
  list.i = function i(modules, media, dedupe, supports, layer) {
    if (typeof modules === "string") {
      modules = [[null, modules, undefined]];
    }
    var alreadyImportedModules = {};
    if (dedupe) {
      for (var k = 0; k < this.length; k++) {
        var id = this[k][0];
        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }
    for (var _k = 0; _k < modules.length; _k++) {
      var item = [].concat(modules[_k]);
      if (dedupe && alreadyImportedModules[item[0]]) {
        continue;
      }
      if (typeof layer !== "undefined") {
        if (typeof item[5] === "undefined") {
          item[5] = layer;
        } else {
          item[1] = "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {").concat(item[1], "}");
          item[5] = layer;
        }
      }
      if (media) {
        if (!item[2]) {
          item[2] = media;
        } else {
          item[1] = "@media ".concat(item[2], " {").concat(item[1], "}");
          item[2] = media;
        }
      }
      if (supports) {
        if (!item[4]) {
          item[4] = "".concat(supports);
        } else {
          item[1] = "@supports (".concat(item[4], ") {").concat(item[1], "}");
          item[4] = supports;
        }
      }
      list.push(item);
    }
  };
  return list;
};

/***/ }),

/***/ 81:
/***/ ((module) => {



module.exports = function (i) {
  return i[1];
};

/***/ }),

/***/ 379:
/***/ ((module) => {



var stylesInDOM = [];
function getIndexByIdentifier(identifier) {
  var result = -1;
  for (var i = 0; i < stylesInDOM.length; i++) {
    if (stylesInDOM[i].identifier === identifier) {
      result = i;
      break;
    }
  }
  return result;
}
function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];
  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var indexByIdentifier = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3],
      supports: item[4],
      layer: item[5]
    };
    if (indexByIdentifier !== -1) {
      stylesInDOM[indexByIdentifier].references++;
      stylesInDOM[indexByIdentifier].updater(obj);
    } else {
      var updater = addElementStyle(obj, options);
      options.byIndex = i;
      stylesInDOM.splice(i, 0, {
        identifier: identifier,
        updater: updater,
        references: 1
      });
    }
    identifiers.push(identifier);
  }
  return identifiers;
}
function addElementStyle(obj, options) {
  var api = options.domAPI(options);
  api.update(obj);
  var updater = function updater(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap && newObj.supports === obj.supports && newObj.layer === obj.layer) {
        return;
      }
      api.update(obj = newObj);
    } else {
      api.remove();
    }
  };
  return updater;
}
module.exports = function (list, options) {
  options = options || {};
  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];
    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDOM[index].references--;
    }
    var newLastIdentifiers = modulesToDom(newList, options);
    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];
      var _index = getIndexByIdentifier(_identifier);
      if (stylesInDOM[_index].references === 0) {
        stylesInDOM[_index].updater();
        stylesInDOM.splice(_index, 1);
      }
    }
    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),

/***/ 569:
/***/ ((module) => {



var memo = {};

/* istanbul ignore next  */
function getTarget(target) {
  if (typeof memo[target] === "undefined") {
    var styleTarget = document.querySelector(target);

    // Special case to return head of iframe instead of iframe itself
    if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
      try {
        // This will throw an exception if access to iframe is blocked
        // due to cross-origin restrictions
        styleTarget = styleTarget.contentDocument.head;
      } catch (e) {
        // istanbul ignore next
        styleTarget = null;
      }
    }
    memo[target] = styleTarget;
  }
  return memo[target];
}

/* istanbul ignore next  */
function insertBySelector(insert, style) {
  var target = getTarget(insert);
  if (!target) {
    throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
  }
  target.appendChild(style);
}
module.exports = insertBySelector;

/***/ }),

/***/ 216:
/***/ ((module) => {



/* istanbul ignore next  */
function insertStyleElement(options) {
  var element = document.createElement("style");
  options.setAttributes(element, options.attributes);
  options.insert(element, options.options);
  return element;
}
module.exports = insertStyleElement;

/***/ }),

/***/ 565:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



/* istanbul ignore next  */
function setAttributesWithoutAttributes(styleElement) {
  var nonce =  true ? __webpack_require__.nc : 0;
  if (nonce) {
    styleElement.setAttribute("nonce", nonce);
  }
}
module.exports = setAttributesWithoutAttributes;

/***/ }),

/***/ 795:
/***/ ((module) => {



/* istanbul ignore next  */
function apply(styleElement, options, obj) {
  var css = "";
  if (obj.supports) {
    css += "@supports (".concat(obj.supports, ") {");
  }
  if (obj.media) {
    css += "@media ".concat(obj.media, " {");
  }
  var needLayer = typeof obj.layer !== "undefined";
  if (needLayer) {
    css += "@layer".concat(obj.layer.length > 0 ? " ".concat(obj.layer) : "", " {");
  }
  css += obj.css;
  if (needLayer) {
    css += "}";
  }
  if (obj.media) {
    css += "}";
  }
  if (obj.supports) {
    css += "}";
  }
  var sourceMap = obj.sourceMap;
  if (sourceMap && typeof btoa !== "undefined") {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  }

  // For old IE
  /* istanbul ignore if  */
  options.styleTagTransform(css, styleElement, options.options);
}
function removeStyleElement(styleElement) {
  // istanbul ignore if
  if (styleElement.parentNode === null) {
    return false;
  }
  styleElement.parentNode.removeChild(styleElement);
}

/* istanbul ignore next  */
function domAPI(options) {
  if (typeof document === "undefined") {
    return {
      update: function update() {},
      remove: function remove() {}
    };
  }
  var styleElement = options.insertStyleElement(options);
  return {
    update: function update(obj) {
      apply(styleElement, options, obj);
    },
    remove: function remove() {
      removeStyleElement(styleElement);
    }
  };
}
module.exports = domAPI;

/***/ }),

/***/ 589:
/***/ ((module) => {



/* istanbul ignore next  */
function styleTagTransform(css, styleElement) {
  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css;
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild);
    }
    styleElement.appendChild(document.createTextNode(css));
  }
}
module.exports = styleTagTransform;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/nonce */
/******/ 	(() => {
/******/ 		__webpack_require__.nc = undefined;
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {

;// CONCATENATED MODULE: ./src/helperFunctions.js

function amountFieldKeyGenerator(QAmountField){
    return QAmountField.id
  }
  
 function getImmediateTextOnly(childNodes){
    return Array.from(childNodes).filter(function(node) {
      return node.nodeType === 3; // Text node type
    }).map(function(textNode) {
      return textNode.nodeValue.trim();
    }).join('');
  } 
  
  function findFirst(rootnode, selector, targetText) {
    let elements = rootnode.querySelectorAll(selector);
    return Array.from(elements).find(function(div) {
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

  function isNumeric(str) {
    return !isNaN(str) && !isNaN(parseFloat(str));
  }
;// CONCATENATED MODULE: ./src/math.js


function DoMath (expression) {
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
// EXTERNAL MODULE: ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js
var injectStylesIntoStyleTag = __webpack_require__(379);
var injectStylesIntoStyleTag_default = /*#__PURE__*/__webpack_require__.n(injectStylesIntoStyleTag);
// EXTERNAL MODULE: ./node_modules/style-loader/dist/runtime/styleDomAPI.js
var styleDomAPI = __webpack_require__(795);
var styleDomAPI_default = /*#__PURE__*/__webpack_require__.n(styleDomAPI);
// EXTERNAL MODULE: ./node_modules/style-loader/dist/runtime/insertBySelector.js
var insertBySelector = __webpack_require__(569);
var insertBySelector_default = /*#__PURE__*/__webpack_require__.n(insertBySelector);
// EXTERNAL MODULE: ./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js
var setAttributesWithoutAttributes = __webpack_require__(565);
var setAttributesWithoutAttributes_default = /*#__PURE__*/__webpack_require__.n(setAttributesWithoutAttributes);
// EXTERNAL MODULE: ./node_modules/style-loader/dist/runtime/insertStyleElement.js
var insertStyleElement = __webpack_require__(216);
var insertStyleElement_default = /*#__PURE__*/__webpack_require__.n(insertStyleElement);
// EXTERNAL MODULE: ./node_modules/style-loader/dist/runtime/styleTagTransform.js
var styleTagTransform = __webpack_require__(589);
var styleTagTransform_default = /*#__PURE__*/__webpack_require__.n(styleTagTransform);
// EXTERNAL MODULE: ./node_modules/css-loader/dist/cjs.js!./src/style.css
var style = __webpack_require__(426);
;// CONCATENATED MODULE: ./src/style.css

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (styleTagTransform_default());
options.setAttributes = (setAttributesWithoutAttributes_default());

      options.insert = insertBySelector_default().bind(null, "head");
    
options.domAPI = (styleDomAPI_default());
options.insertStyleElement = (insertStyleElement_default());

var update = injectStylesIntoStyleTag_default()(style/* default */.Z, options);




       /* harmony default export */ const src_style = (style/* default */.Z && style/* default */.Z.locals ? style/* default */.Z.locals : undefined);

;// CONCATENATED MODULE: ./src/calculator.js




const CalcButtonPrefix = "PowerToolsCalcButton-";
const CalcIDBaseName = "PowerToolsCalc";
const svgNS = "http://www.w3.org/2000/svg";

class Calculator {

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
  
    getCalcTimeDirectionIndicator(value, startingDirection){
      //this handles what indicator we should use while calulating. in general it is logical with a normal calc
      // with the exception that we show positives with a leading + if we came into the calculator with a +
      if(value > 0 && (startingDirection === '+' || this.originalCalcDirection === '+')){
        return '+';
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
        if(value > 0 ){
          return value;
        }else if ( value < 0){
          let userInput = prompt("Is this an Expense Category? (yes/no)").toLowerCase();
          if(userInput ==="yes"){
            value = value * -1;
            return value;
          }else{
            return value;
          }
        }else {
          return value;
        }
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
  
    powerToolInputNodelossFocusHandler(event) { 
        //recalculate as long as close button is not clicked
      // ensure no redirect against self on force recalc
      //if(event.target.id ='PowerToolsCalc-Input' and event.relatedTarget.) // redirect is not working
      if(event.relatedTarget === null || !event.relatedTarget.hasAttribute("id") || (event.relatedTarget.id !=='dlg-close')){
        this.runCalculator();
        this.simplifiInputNode.value = this.getReturnTimeDirectionIndicator(this.powerToolCalcInputNode.value);
        //this.simplifyInputNode.dispatchEvent(new Event('click', { bubbles: true }));
        //this.simplifyInputNode.dispatchEvent(new Event('focus', { bubbles: true }));
        this.simplifiInputNode.dispatchEvent(new Event('change', { bubbles: true })); // must dispatch change for value to commit on simplifi side
        //this.simplifyInputNode.dispatchEvent(new Event('blur', { bubbles: true, cancelable: false })); //lr.splitsHelpers.adjustSplitLine
        this.hidePowerToolInputBox()
        this.showSimplifiInputBox();
        //this.setDefaultCalcDirection(this.powerToolCalcInputNode.value);
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
       // this.setDefaultCalcDirection(this.simplifiInputNode.value[0]);
        this.setOriginalCalcDirection(this.simplifiInputNode.value[0]);
      }
  }
;// CONCATENATED MODULE: ./src/transactionModel.js



class TransactionModel{

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
            console.log("removed id =" + element?.id + "  node: " + element.cloneNode(false).outerHTML);
            if(element?.getAttribute('class')?.includes('-catRow')){
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
;// CONCATENATED MODULE: ./src/powerToolApps.js



class PowerToolApps{
 
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
;// CONCATENATED MODULE: ./src/index.js


const powerToolApps = new PowerToolApps();
})();

/******/ })()
;