// @see Item model on https://api.lib.byu.edu/leaflet/swagger-ui.html
interface Item {
    author: string;
    description: string;
    id: string;
    thumbnail: string;
    title: string;
    type: "BOOK" | "FILM";
}

// @see RatingRequest model on https://api.lib.byu.edu/leaflet/swagger-ui.html
interface RatingRequest {
    itemId: string;
    rating: boolean;
}