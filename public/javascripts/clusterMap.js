// File for Cluster Map from Mapbox

//  use ejs to create a js variable what we have access to in our js file
//  hand data off from the server side to the client side
//  need to get access to token in a .ejs file to .js file
//  just like in show.ejs and showPageMap.js
mapboxgl.accessToken = mapToken;

// create map with container, styles, center of map, and zoom
// makes a generic map
const map = new mapboxgl.Map({
    container: 'cluster-map',
    style: 'mapbox://styles/mapbox/outdoors-v10',
    center: [-100.5917, 56.0099],
    zoom: 3
});

// add map controls on map
map.addControl(new mapboxgl.NavigationControl());

// .on(load) event that we listen for
map.on('load', () => {
    // Add a new source from our GeoJSON data and
    // set the 'cluster' option to true. GL-JS will
    // add the point_count property to your source data.
    // This example visualizes all M1.0+ earthquakes
    // from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
    // data: 'https://docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson'
    // previous earthquake data used, everything was located under a key of features
    // our data is not located under a key of features, it is just an array
    // Mapbox expects an object with the key of features set to an array will all of the data
    // we can fix this by making our data conform to that pattern in index.ejs
    // set campgrounds to an object with features that equals all of our campgrounds
    // now it matches the earthquake dataset
    //.addSource() registering a srouce of data for the map
    // then reference that data when we add different layers
    map.addSource('campgrounds', {
        type: 'geojson',
        // Point to GeoJSON data. Pass our data set through to show campground locations
        // passed through all campgrounds in index.ejs file, now has access to that immediately on the client side
        data: campgrounds,
        cluster: true,
        clusterMaxZoom: 14, // Max zoom to cluster points on
        clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
    });

    map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'campgrounds',
        filter: ['has', 'point_count'],
        paint: {
            // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
            // with three steps to implement three types of circles:
            //   * Blue, 20px circles when point count is less than 100
            //   * Yellow, 30px circles when point count is between 100 and 750
            //   * Pink, 40px circles when point count is greater than or equal to 750
            'circle-color': [
                'step',
                ['get', 'point_count'],
                '#51bbd6',
                10,
                '#f1f075',
                30,
                '#f28cb1'
            ],
            // controls the size of a circle and the color of a circle depending on the number of points in it
            'circle-radius': [
                'step',
                ['get', 'point_count'],
                15,
                10,
                20,
                30,
                25
            ]
        }
    });

    map.addLayer({
        id: 'cluster-count', // see the count of things in the cluster
        type: 'symbol',
        source: 'campgrounds',
        filter: ['has', 'point_count'],
        layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
        }
    });

    // determines what the single tiny point should look like
    map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'campgrounds',
        filter: ['!', ['has', 'point_count']],
        paint: {
            'circle-color': 'red',
            'circle-radius': 4,
            'circle-stroke-width': 1,
            'circle-stroke-color': 'black'
        }
    });

    // inspect a cluster on click
    map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, {
            layers: ['clusters']
        });
        const clusterId = features[0].properties.cluster_id;
        map.getSource('campgrounds').getClusterExpansionZoom(
            clusterId,
            (err, zoom) => {
                if (err) return;

                map.easeTo({
                    center: features[0].geometry.coordinates,
                    zoom: zoom
                });
            }
        );
    });

    // When a click event occurs on a feature in
    // the unclustered-point layer, open a popup at
    // the location of the feature, with
    // description HTML from its properties.
    map.on('click', 'unclustered-point', (e) => {
        // set popUpMarkup to equal the popUpMarkup defined as a vritual in our campground model, destructured to obtain popUpMarkup
        const { popUpMarkup} = e.features[0].properties;
        const coordinates = e.features[0].geometry.coordinates.slice();

        // popup with text
        // using virtual piece of information that's populated for us automatically
        // need to conform data to match pattern again to have a properties key and add popupMarkup
        // so we can use it in the popup
        // but don't need to change our entire schema or entire structure of our document
        // can be a virtual since we don't need to store it but use the information we have already 
        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(popUpMarkup)
            .addTo(map);
    });

    // when mouse enters over a cluster
    map.on('mouseenter', 'clusters', () => {
        map.getCanvas().style.cursor = 'pointer';
    });

    // when mouse leaves a cluster
    map.on('mouseleave', 'clusters', () => {
        map.getCanvas().style.cursor = '';
    });
});