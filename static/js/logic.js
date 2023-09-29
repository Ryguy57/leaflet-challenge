// determine circle size based on  magnitude
let determineSize = (magnitude) => magnitude * 15000;

// select color based on earthquake depth
let selectColor = (earthDepth) => {
  if (earthDepth <= 10) return "lightblue";
  else if (earthDepth <= 30) return "deepskyblue";
  else if (earthDepth <= 50) return "dodgerblue";
  else if (earthDepth <= 70) return "royalblue";
  else if (earthDepth <= 90) return "blue";
  else return "midnightblue";
};

// create a marker for each earthquake
let generateMarker = (feature) => {
  let magnitude = feature.properties.mag;
  let depth = feature.geometry.coordinates[2];

  return L.circle([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
    color: "black",
    fillColor: selectColor(depth),
    radius: determineSize(magnitude),
    opacity: 1,
    weight: 1,
    fillOpacity: 0.5,
  }).bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p>`);
};

// Fetch earthquake data and creating the map
let earthquakeLink = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

d3.json(earthquakeLink).then((data) => {
  let earthquakeMarkers = data.features.map(generateMarker);
  initiateMap(earthquakeMarkers);
});

let initiateMap = (earthquakeMarkers) => {
  let streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  let topoLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  let baseLayers = {
    "Street Map": streetLayer,
    "Topographic Map": topoLayer
  };

  let tectonicPlateStyle = {
    color: "purple",
    weight: 2
  };

  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then((plateData) => {
    let tectonicPlates = L.geoJson(plateData, {
        style: tectonicPlateStyle
    });

    let overlayLayers = {
      Earthquakes: L.layerGroup(earthquakeMarkers),
      "Tectonic Plates": tectonicPlates
    };

    let map = L.map("map", {
      center: [37.09, -95.71],
      zoom: 4.5,
      layers: [streetLayer, L.layerGroup(earthquakeMarkers), tectonicPlates]
    });

    L.control.layers(baseLayers, overlayLayers, {
      collapsed: false
    }).addTo(map);

    const legend = L.control({ position: "bottomright" });
    legend.onAdd = () => {
      const div = L.DomUtil.create("div", "info legend");
      const depthLevels = [-10, 10, 30, 50, 70, 90];

      for (let i = 0; i < depthLevels.length; i++) {
        div.innerHTML +=
          `<i style="background:${selectColor(depthLevels[i] + 1)}"></i> ${depthLevels[i]}${depthLevels[i + 1] ? '&ndash;' + depthLevels[i + 1] + '<br>' : '+'}`;
      }
      return div;
    };
    legend.addTo(map);
  });
};
