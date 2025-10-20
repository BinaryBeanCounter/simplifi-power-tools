export class InputDiscovery {
  
  static isCurrencyInput(inputElement) {
    if (!inputElement || inputElement.tagName !== 'INPUT') {
      return false;
    }
    
    const value = inputElement.value || '';
    const placeholder = inputElement.placeholder || '';
    
    const currencyPattern = /^[+\-]?\$?\d*\.?\d*$/;
    
    if (currencyPattern.test(value) && value.trim() !== '') {
      return true;
    }
    
    if (placeholder && (placeholder.includes('$') || placeholder.includes('amount') || placeholder.includes('Amount'))) {
      return true;
    }
    
    const inputMode = inputElement.getAttribute('inputmode');
    if (inputMode === 'decimal' || inputMode === 'numeric') {
      return true;
    }
    
    const label = this.findAssociatedLabel(inputElement);
    if (label) {
      const labelText = label.textContent.toLowerCase();
      if (labelText.includes('amount') || labelText.includes('$')) {
        return true;
      }
    }
    
    const parentDiv = inputElement.parentNode;
    if (parentDiv) {
      const dollarSign = Array.from(parentDiv.children).find(child => 
        child.textContent.trim() === '$'
      );
      if (dollarSign) {
        return true;
      }
    }
    
    return false;
  }
  
  static findAssociatedLabel(inputElement) {
    if (inputElement.id) {
      const label = document.querySelector(`label[for="${inputElement.id}"]`);
      if (label) return label;
    }
    
    let parent = inputElement.parentNode;
    while (parent && parent !== document.body) {
      if (parent.tagName === 'LABEL') {
        return parent;
      }
      const label = parent.querySelector('label');
      if (label) {
        return label;
      }
      parent = parent.parentNode;
    }
    
    return null;
  }
  
  static findAllNumericInputs(rootNode) {
    const inputs = [];
    
    const allInputs = rootNode.querySelectorAll('input[type="text"]');
    for (let i = 0; i < allInputs.length; i++) {
      const input = allInputs[i];
      if (this.isCurrencyInput(input)) {
        inputs.push({
          inputElement: input,
          containerElement: this.findInputContainer(input),
          detectionMethod: 'heuristic'
        });
      }
    }
    
    return inputs;
  }
  
  static findInputContainer(inputElement) {
    let parent = inputElement.parentNode;
    let depth = 0;
    const maxDepth = 5;
    
    while (parent && depth < maxDepth && parent !== document.body) {
      const hasLabel = parent.querySelector('label') !== null;
      const hasMultipleChildren = parent.children.length > 1;
      
      if (hasLabel && hasMultipleChildren) {
        return parent;
      }
      
      parent = parent.parentNode;
      depth++;
    }
    
    return inputElement.parentNode || inputElement;
  }
  
  static generateInputKey(inputElement) {
    if (inputElement.id) {
      return inputElement.id;
    }
    
    const container = this.findInputContainer(inputElement);
    if (container && container.id) {
      return container.id;
    }
    
    const label = this.findAssociatedLabel(inputElement);
    const labelText = label ? label.textContent.trim() : 'unknown';
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    
    return `input-${labelText.replace(/\s+/g, '-').toLowerCase()}-${timestamp}-${random}`;
  }
}
