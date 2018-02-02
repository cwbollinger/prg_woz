
export class ChatHistory {
  constructor(inputElement, historyElement) {
    this.inputElement = inputElement;
    this.historyElement = historyElement;
    this.chatHistory = [];
    this.historyPointer = -1;

    this.inputElement.addEventListener('keydown', (ev) => {
      if(ev.which === 13) { // enter
        const text = this.inputElement.value;
        if(text != '') { // don't waste time if there's no speech
          this.addText(text);
          this.clearHistoryPointer();
          this.inputElement.value = this.getHistory();
          this.onEnterCallback(text);
        }
        return false;
      } else if (ev.which === 27) { // esc
        this.clearHistoryPointer();
        this.inputElement.value = this.getHistory();
        return false;
      } else if (ev.which === 38) { // up arrow
        this.decrementHistoryPointer();
        this.inputElement.value = this.getHistory();
        return false;
      } else if (ev.which === 40) { // down arrow
        this.incrementHistoryPointer();
        this.inputElement.value = this.getHistory();
        return false;
      }
    });
  }

  incrementHistoryPointer() {
    this.historyPointer += 1;
    if(this.historyPointer >= this.chatHistory.length) {
      this.historyPointer = this.chatHistory.length - 1;
    }
  }

  decrementHistoryPointer() {
    this.historyPointer -= 1;
    if(this.historyPointer < -1) {
      this.historyPointer = -1;
    }
  }

  clearHistoryPointer() {
    this.historyPointer = -1; // clear
  }

  getHistory() {
    console.log("history: " + this.historyPointer);
    let retval = ""
    if(this.historyPointer >= 0) {
      retval = this.chatHistory[this.historyPointer];
    }
    console.log(`history: "${retval}"`);
    return retval;
  }

  addText(text) {
    this.chatHistory.unshift(text);
    this.historyElement.innerHTML = this.chatHistory.join('\n');
    //this.historyElement.scrollTop(this.chatHistory[0].scrollHeight);
  }

}
