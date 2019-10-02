// var platesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";

// API endpoint for earthquake data past 7 days
var usgsUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";


// marker Size 
function markerSize(magnitude) {
  return magnitude * 5;
}

// colors for legend
function colorScale(magnitude) {
  return magnitude >= 5 ? '#D73027':
         magnitude >= 4 ? '#FC8D59':
         magnitude >= 3 ? '#FEE08B':
         magnitude >= 2 ? '#D9EF8B':
         magnitude >= 1 ? '#91CF60':
                          '#1A9850';
}

//make the map
function createMap(earthquakes) {
  
  // Map layer choices
  var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors,\
     <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
    });

  var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors,\
     <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
    });

  var outdoorsmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors,\
     <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
    });

  // Selection Legend
  var baseMaps = {
    "Satellite": satellitemap,
    "Boarders": lightmap,
    "Elevation": outdoorsmap
  };

  // Earthquakes LAyer
  var overlayMaps = {
    "Earthquakes": earthquakes
  };

  // Create map object
  var myMap = L.map("map", {
    center: [39.83333, -98.58333],
    zoom: 5,
    layers: [satellitemap, earthquakes]
  });

  // Control Panel
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Legend details
  var info = L.control({
    position: 'bottomright'
  });

  // Insert 'legend' div when layer control is added
  info.onAdd = function(){
    labels = ['0-1', '1-2', '2-3', '3-4', '4-5', '5+']
    var div = L.DomUtil.create('div', 'legend');
    div.innerHTML += '<h3>Magnitude</h3>'
    for (var i = 0; i <= 5; i++) {
      div.innerHTML += '<p><span style="font-size:20px; background-color:' + colorScale(i) +
        ';">&nbsp;&nbsp;&nbsp;&nbsp;</span> ' + labels[i] + '</p>';
    }
    
    return div;
  };

  // Add legend
  info.addTo(myMap);
}

//Add more Features
function createFeatures(earthquakeData) {
  
  // Function for feature pop-up
  function popUpText(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" +
      "<p>Magnitude: " + feature.properties.mag + "</p>" +
      "<p>Type: " + feature.properties.type + "</p>");
  }
  
  // Define maker color
  var baseMarkerOptions = {
    color: '#191919',
    weight: 1,
    fillOpacity: 0.9
  }

  // Create GeoJSON layer containing the features array
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, baseMarkerOptions);
    }, 
    style: function(feature) {
      return {
        radius: markerSize(feature.properties.mag),
        fillColor: colorScale(feature.properties.mag)
      }
    },
    onEachFeature: popUpText
  });

  // Send earthquake layer to the createMap function
  createMap(earthquakes);
}

// GET request for JSON data
d3.json(usgsUrl, function(data) {
  createFeatures(data.features);
});