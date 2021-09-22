// Defines an object that has all the properties of LealetItem but are all observables
type DisplayItem = {
    [Property in keyof Item]: KnockoutObservable<Item[Property]>;
}

/**
 * Leaflet app
 * 
 */
namespace Leaflet {
    // The item currently being displayed to the user
    let currentItem: DisplayItem = {
        author: ko.observable("Michael J Fox")
        , description: ko.observable("There was a problem on the server")
        , id: ko.observable("someid")
        , thumbnail: ko.observable("/img/backtothefuture.jpg")
        , title: ko.observable("Back to the Future")
        , type: ko.observable("FILM")
    };
    // Cache for the next item so use doesn't have to wait. 
    let nextItem: Item | undefined;

    /**
     * Changes the knockout binding to update the UI.
     * 
     * @param LeafletItem item
     */
    async function moveToNextItem() {
        if (nextItem) {
            currentItem?.author(nextItem.author);
            currentItem?.description(nextItem.description);
            currentItem?.id(nextItem.id);
            currentItem?.thumbnail(nextItem.thumbnail);
            currentItem?.title(nextItem.title);
            currentItem?.type(nextItem.type);
        }
        nextItem = await ServerComs.sendRequest<Item>("getItem");
    }
    /**
     * Displays the thank you message and processing
     * the next item and gets a new one from the service.
     */
    async function handleRating(ratedItem: RatingRequest) {
        const ratingResult = ratedItem.rating ? "Yes" : "No";
        Messaging.displayMessage(`Thank you for rating ${currentItem?.title()}. We have saved your "${ratingResult}" response`);
        moveToNextItem();
    }
    /**
     * Initializes the app. Sets up the knockout bindings and the
     * messeging system. Then it retrieves the first 2 media items 
     * from the service. 
     */
    export async function init() {
        ko.applyBindings(currentItem, document.getElementById("mediaCard"));
        nextItem = await ServerComs.sendRequest<Item>("getItem");
        moveToNextItem();
    }
    /**
     * Collects the data to send to the service for the rating
     * and send it.
     * 
     * @param boolean approve 
     */
    export async function rate(approve: boolean) {
        if (currentItem) {
            const ratingResponse = await ServerComs.sendRequest<RatingRequest>("rate", {
                rating: approve
                , itemId: currentItem.id()
            });
            if (ratingResponse) {
                handleRating(ratingResponse);
            }
        }
    }
}

window.onload = () => {
    Messaging.init();
    Leaflet.init();
}