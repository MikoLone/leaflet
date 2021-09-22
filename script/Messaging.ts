// interface for messages shown to the user
interface ActiveMessages {
    message: KnockoutObservableArray<string>;
    error: KnockoutObservableArray<string>;
}

namespace Messaging {
    // Default time to show a message
    const defaultMessageTime = 3000;
    /**
     * Creats the KO observables for messages
     */
    const messages: ActiveMessages = {
        "message": ko.observableArray([])
        , "error": ko.observableArray([])
    };

    /**
     * Initializes the KO bindings for the messages
     */
    export function init() {
        ko.applyBindings(messages, document.getElementById("alerts"));
    }

    /**
     * Handles errors that come along. Displays errors on the page.
     * 
     * @param message message to be displayed to the user
     * @param duration how long to show the error, default to forever
     */
    export function handleErrors(message: string, error?: Error, duration: number = 0): void {
        Logging.log(message, error);
        // default to passed in message, fallback to default message
        showMessage(messages.error, message, duration);
    }

    /**
     * Displays a message to the user with an optional duration.
     * 
     * @param msg message to be shown to the user
     * @param duration how long in ms to show message, 0 means forever, defaults to defaultMessageTime
     */
    export function displayMessage(msg: string, duration: number = defaultMessageTime): void {
        showMessage(messages.message, msg, duration);
    }

    /**
     * Common code for showing messages
     * @param messages internal messages array to modify
     * @param message message to add onto the array
     * @param duration how long to show the message
     */
    function showMessage(messages: KnockoutObservableArray<string>, message: string, duration: number): void {
        messages.push(message);
        timeoutMessage(messages, duration);
    }

    /**
     * If there was a message with a duration then this will execute that.
     * @param messages array of message to remove the last message from
     * @param duration how long for the message to be shown
     */
    function timeoutMessage(messages: KnockoutObservableArray<string>, duration: number): void {
        if (messages === null) {
            Logging.log("messages is null timeout will be ignored");
            return;
        }

        if (duration > 0) {
            setTimeout(() => messages.shift(), duration);
        }
    }
}
