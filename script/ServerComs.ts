// Interfaces and types for ServerComs
type ServerEndpoints = "getItem" | "rate";
// Join future parameters to this type
type ServerRequestParameters = RatingRequest;
// Makes the settings map strongly typed with server endpoints so none are missed
type ServerEndpointMap = {
    [key in ServerEndpoints]: {
        suffix: string;
        method: "GET" | "POST";
    };
};
interface ServerSettings {
    baseUrl: string;
    endpoints: ServerEndpointMap;
}

namespace ServerComs {
    //hard coded userId as per instructions
    const userId = "someidthatisastring";

    /**
     * Sets up the endpoints and destination for the service and map for endpoints
     */
    const settings: ServerSettings = {
        baseUrl: "https://api.lib.byu.edu/leaflet"
        , endpoints: {
            getItem: { suffix: "/item", method: "GET" }
            , rate: { suffix: `/users/${userId}/ratings`, method: "POST" }
        }
    };

    /**
     * Sends a request to the server and returns the response to the caller
     * @param destination map string for the url suffix
     * @param parameters optional parameters to send with the payload
     * @returns Promise<T> that was specified by caller
     */
    export async function sendRequest<T>(destination: ServerEndpoints, parameters?: ServerRequestParameters): Promise<T | undefined> {
        /**
         * These are the js Fetch settings. 
         * @see https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
         */
        const url = settings.baseUrl + settings.endpoints[destination].suffix;
        const sendSettings: RequestInit = {
            method: settings.endpoints[destination].method // *GET, POST, PUT, DELETE, etc.
            , mode: 'cors' // no-cors, *cors, same-origin
            , cache: 'default' // *default, no-cache, reload, force-cache, only-if-cached
            , credentials: 'omit' // include, *same-origin, omit
            , headers: {
                'Content-Type': 'application/json'
            }
        };
        if (parameters) {
            sendSettings.body = JSON.stringify(parameters);
        }

        try {
            const response = await fetch(url, sendSettings);
            return response?.json() as unknown as T; // parses JSON response into native JavaScript objects
        } catch (error: any) {
            Messaging.handleErrors("We could not get the media from the server. We are on it. Please try again another time.", error);
        }
    }
}
