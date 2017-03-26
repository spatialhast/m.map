var map = L.map('map', {
    center: [50.0064, 36.2351],
    zoom: 8
});

var layerMapSurfer = new L.tileLayer("http://korona.geog.uni-heidelberg.de/tiles/roads/x={x}&y={y}&z={z}", {
    attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

var layerOSM = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

var layerGoogle = new L.Google('ROADMAP', {
    attribution: '&copy; <a href="https://www.google.com/maps">Google Maps</a> contributors'
});

var layerMapboxImagery = new L.tileLayer('https://{s}.tiles.mapbox.com/v4/openstreetmap.map-inh7ifmo/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoib3BlbnN0cmVldG1hcCIsImEiOiJhNVlHd29ZIn0.ti6wATGDWOmCnCYen-Ip7Q', {
    maxNativeZoom: 17,
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a>'
});

var BingLayer = L.TileLayer.extend({
    getTileUrl: function (tilePoint) {
        this._adjustTilePoint(tilePoint);
        return L.Util.template(this._url, {
            s: this._getSubdomain(tilePoint),
            q: this._quadKey(tilePoint.x, tilePoint.y, this._getZoomForUrl())
        });
    },
    _quadKey: function (x, y, z) {
        var quadKey = [];
        for (var i = z; i > 0; i--) {
            var digit = '0';
            var mask = 1 << (i - 1);
            if ((x & mask) != 0) {
                digit++;
            }
            if ((y & mask) != 0) {
                digit++;
                digit++;
            }
            quadKey.push(digit);
        }
        return quadKey.join('');
    }
});

var layerBingAerial = new BingLayer('http://t{s}.tiles.virtualearth.net/tiles/a{q}.jpeg?g=2732', {
    subdomains: ['0', '1', '2', '3', '4'],
    attribution: '&copy; <a href="http://bing.com/maps">Bing Maps</a>'
});




var baseLayers = {
    "MapSurfer": layerMapSurfer,
    "OpenStreetMap": layerOSM,
    "Google Road": layerGoogle,
    "Mapbox Imagery": layerMapboxImagery,
    "Bing Aerial": layerBingAerial
};

L.control.layers(baseLayers, null, {
    collapsed: false,
    autoZIndex: false
}).addTo(map);


map.addLayer(layerMapSurfer);



$.ajax({
    url: 'data/project_01.csv',
    cache: false,
    success: function (csv) {
        csv2geojson.csv2geojson(csv, {
            latfield: 'Y',
            lonfield: 'X',
            delimiter: ','
        }, function (err, data) {
            drawLayer(data);
        });
    }
});


function drawLayer(data) {

    var pointLayer = L.geoJson(null, {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng);
        }
    }).on('click', function (e) {

        var layer = e.layer;
        var feature = layer.feature.properties;
        var address = feature['Address'];
        var zipcode = feature['Zip Code'];
        var sate = feature['State'];
        var country = feature['Country'];

        var popupContent = address + ', ' + zipcode + '<br>' + sate + ', ' + country;
        layer.bindPopup(popupContent).openPopup();

    });

    pointLayer.addData(data);
    map.fitBounds(pointLayer);

    map.addLayer(pointLayer);


};