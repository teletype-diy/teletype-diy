

module.exports =
class SignalView {
    constructor(callback) {
        this.signalInjectCallback = callback;

        this.element = document.createElement('div');
        // this.element.textContent = "Waiting for signal";
        // Steps to connect directly P2P
        // 1. exchange invite link
        // 2. Once the editor generates the signal exchange them (Share-starter to Guests and vise versa)
        // 3. editor connects

        const tutorialDiv = document.createElement('div');
        tutorialDiv.classList.add('padded');
        tutorialDiv.innerHTML = `
            Welcome to the signalserver mini-game:<br><br>

            Your mission, should you choose to accept it: Connect to peers.<br><br>

            How to connect w/o signal-server:<br>

            <ol>
                <li>
                    Connect with invite link as normal.
                </li>
                <li>
                    Once a signal gets generated, send it to your friend/coworker/peer/archnemesis.
                </li>
                <li>
                    Enter the signal you just got send and press enter.
                </li>
            </ol>
        `;
        this.element.appendChild(tutorialDiv);


        const signalboxDiv = document.createElement('div');
        signalboxDiv.classList.add('padded');
        // signalboxDiv
        this.signalbox = document.createElement('textarea');
        this.signalbox.classList.add('input-textarea');
        this.signalbox.placeholder = "Waiting for signal";
        this.signalbox.disabled = "disabled";
        // <textarea class='input-textarea' placeholder='Text Area'></textarea>
        signalboxDiv.appendChild(this.signalbox);

        const signalCopyBtn = document.createElement('button');
        signalCopyBtn.setAttribute("type", "text");
        signalCopyBtn.classList.add("btn");
        signalCopyBtn.textContent = "Copy Signal";
        signalCopyBtn.addEventListener("click", () => {
            atom.clipboard.write(this.signalbox.value);
        });
        signalboxDiv.appendChild(signalCopyBtn);

        // this.inputbox = document.createElement('div');
        // this.inputbox =

        // create input box
        const inputBoxDiv = document.createElement('div');
        inputBoxDiv.classList.add('padded', 'input-container');
        this.inputBox = document.createElement("input");
        this.inputBox.setAttribute("type", "text");
        this.inputBox.autofocus = "autofocus";
        this.inputBox.placeholder = "Enter signal...";
        // .native-key-bindings fixes backspace not working issue...
        this.inputBox.classList.add('input-text', 'native-key-bindings');
        // <input class='input-text' type='text' placeholder='Text'>


        this.inputBox.addEventListener('keydown', (event) => {
          if (event.key === 'Enter') {
            console.log('Enter key pressed!');
            // fetch msg
            const msg = this.inputBox.value;
            this.inputBox.value = "";

            // send msg to signal inject
            this.signalInjectCallback(msg);
          }
        });
        inputBoxDiv.appendChild(this.inputBox);

        this.element.appendChild(signalboxDiv);
        this.element.appendChild(inputBoxDiv);
    }

    updateSignal(signal) {
        // this.signalbox.textContent = signal;
        this.signalbox.value = signal;
    }

    getTitle() {
      // Used by Atom for tab text
      return 'Teletype P2P Signal';
    }

    getURI() {
      // Used by Atom to identify the view when toggling.
      return 'atom://teletype-diy/signal-view';
    }

    getDefaultLocation() {
       // This location will be used if the user hasn't overridden it by dragging the item elsewhere.
       // Valid values are "left", "right", "bottom", and "center" (the default).
       return 'right';
     }

     getAllowedLocations() {
       // The locations into which the item can be moved.
       return ['right'];
     }

}
