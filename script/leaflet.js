/**
 * Leaflet app
 */
const Leaflet = function () {

    let nextItem = null;//holds the data for the next item

    const userId = "id"; //hard coded userId as per instructions

    let currentItem = {
        "author": ko.observable("Michael J Fox")
        , "description": ko.observable("There was a problem on the server. So we are showing this great movie.")
        , "id": ko.observable(userId)
        , "thumbnail": ko.observable("/img/backtothefuture.jpg")
        , "title": ko.observable("Back to the Future")
        , "type": ko.observable("FILM")
    }

    /**
     * Messages 
     * 
     * TODO In a real project messaging would be  moved to it's own reusable class
     */

    /**
     * Creats the KO observables for messages
     */
    let messages = {
        "message": ko.observableArray([])
        , "error": ko.observableArray([])
    };

    /**
     * What the user should see when some errors happen. Other times it just what is sent. 
     */
    const userMessages = {
        "commsError": "We could not get the media from the server. We are on it. Please try again another time."
    };
    /**
     * Placeholder for logging to another source right now just a 
     * console log. But here I would imagine having a error handling class
     * that would report errors to the developers
     */
    function logError() {
        console.log(arguments);
    }
    /**
     * Handles errors that come along. Displays errors on the page. and logs them but obviously only to the console
     * but a FUTURE would be to send them somewhere a developer would see them. 
     * 
     * @param String errortype optional but if the type as a usermessage asscociated with it it will display that message instead of message
     * @param {*} message  the message you want display if it doesn't have an error type. if it is displayed this message is logged.
     * @param int duration the amount of time in miliseconds to show the message. null or 0 will show it forever.
     */
    function handleErrors(message, errortype, duration) {
        logError(errortype, message);
        let userMessage = "";

        if (userMessages.hasOwnProperty(errortype)) {
            userMessage = userMessages[errortype];
        } else {
            userMessage = message;
        }

        messages.error.push(userMessage);
        timeoutMessage(message.error, duration);
    }
    /**
     * If there was a message with a duration then this will execute that. 
     * 
     * @param DOMnode node the node of the display message container that needs to be toggled when durattion ends
     * @param int duration time in miliseconds
     */
    function timeoutMessage(msgArrayPtr, duration) {
        if (duration > 0) {
            setTimeout(function () {
                msgArrayPtr.shift();
            }, duration);
        }
    }
    /**
     * Displays a message to the user with an optional duration.
     * 
     * @param String msg 
     * @param int duration time in milliseconds that the message should be displayed. 0 means it will display for ever. 
     */
    function displayMessage(msg, duration) {
        messages.message.push(msg);
        timeoutMessage(messages.message, duration);
    }
    /**
     * Communication. 
     * 
     * This would also be broken out into its own class
     * 
     */

    /**
     * Sets up the endpoints and destination for the service
     */
    const settings = {
        "baseUrl": "https://api.lib.byu.edu/leaflet"
        //"baseUrl":"https://example.com/leaflet"
        , "endpoints": {
            "item": "/item"
            , "rate": "/users/" + currentItem.id() + "/ratings"
        }
    };

    /**
     * Handles grabbing the data from the server and handling the response and
     * sending it along. 
     * 
     * Expects a sendObj as follows
     * 
     * {
     *  "endpoint":"getItem" | "rate", //the endpoint is which api call you want to do. 
     *  "rating":{ // if it is "rate" then the server expects this rating object. not expected for getItem
     *      "itemId":"string"
     *      ,"rating":boolean
     *      }
     *  "callback": function to call getItem Success
     *  }
     * 
     * @param {*} sendObj 
     * @returns 
     */
    async function serviceComms(sendObj) {

        /**
         * These are the js Fetch settings. 
         * @see https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
         */
        let sendSettings = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            body: null
        };

        //Make sure we are calling an known endpoint
        if (!settings.endpoints.hasOwnProperty(sendObj.endpoint)) {
            handleErrors("commsError", "Unknown Endppoint");
            return;
        }

        try {
            const url = settings.baseUrl + settings.endpoints[sendObj.endpoint];
            if (sendObj.endpoint !== "item") {
                sendSettings.body = JSON.stringify(sendObj.data);
                sendSettings.method = "POST";
            }

            const response = await fetch(url, sendSettings);
            return response.json(); // parses JSON response into native JavaScript objects
        } catch (error) {
            handleErrors("commsError", error);
        }
    }

    /**
     * Changes the knockout binding to update the UI.
     * 
     * @param {*} item @see item model on https://api.lib.byu.edu/leaflet/swagger-ui.html
     */
    async function moveToNextItem() {
        currentItem.author(nextItem.author)
            .description(nextItem.description)
            .id(nextItem.id)
            .thumbnail(nextItem.thumbnail)
            .title(nextItem.title)
            .type(nextItem.type);

        nextItem = await serviceComms({ "endpoint": "item" });
    }
    /**
     * Displays the thank you message and processing
     * the next item and gets a new one from the service.
     */
    function handleRating() {
        displayMessage("Thank you for rating \"" + currentItem.title() + "\" :) ", 3000);
        moveToNextItem(nextItem);
    }

    /**
     * Initializes the app. Sets up the knockout bindings and the
     * messeging system. Then it retrieves the first 2 media items 
     * from the service. 
     */
    async function init() {
        ko.applyBindings(currentItem, document.getElementById("mediaCard"));
        ko.applyBindings(messages, document.getElementById("messages"));
        nextItem = await serviceComms({ "endpoint": "item" });
        moveToNextItem();
    }
    /**
     * Collects the data to send to the service for the rating
     * and send it.
     * 
     * @param boolean wouldread 
     */
    async function rate(wouldread) {
        const data = {
            "rating": wouldread
            , "itemId": currentItem.id()
        };

        await serviceComms({ "endpoint": "rate", "data": data });
        handleRating();
    }

    /**
     * Public interface for Leaflet
     */
    return {
        "rate": rate
        , "init": init
    }
}();

window.onload = function () {
    Leaflet.init();
};