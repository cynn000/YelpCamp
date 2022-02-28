// File for showing Mapbox map
// include this in our show.ejs file as a script

// why we can't use process.env.MAPBOX_TOKEN for accessToekn
// ejs engine creates templates on frontend so when we use this script on show.ejs page
// it does not have access to the backend where process.env.MAPBOX_TOKEN is
// so we use ejs tags to access process.env.MAPBOX_TOKEN first and inject it into the rendered template

// to mark the pin of coordinates on map we need to do the same thing with
// the process.env.MAPBOX_TOKEN.
// use ejs to create a js variable what we have access to in our js file
// hand data off from the server side to the client side
// need to get access to token in a .ejs file to .js file
// pass through a campground variable, then will have access to that immediately on the client side


// display mapbox map
mapboxgl.accessToken = mapToken; // reference the mapToken in the show.ejs file
const map = new mapboxgl.Map({
    container: "map", // container ID
    style: "mapbox://styles/mapbox/streets-v10", // style URL
    center: campground.geometry.coordinates, // starting position [lng, lat] reference the campground in the show.ejs file
    zoom: 10 // starting zoom
});

// add map controls on map
map.addControl(new mapboxgl.NavigationControl());


// add marker to map
new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates) // marker should be set to the coordinates of campground
    // what should happens when a user clicks on it
    .setPopup(
        new mapboxgl.Popup( { offset: 25 })
        .setHTML(
            // show campground title and location
            `<h3>${campground.title}</h3><p>${campground.location}</p>` 
        )
    )
    // add marker to map
    .addTo(map);
