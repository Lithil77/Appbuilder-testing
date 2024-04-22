import axios from 'axios';
import * as olStyle from 'ol/style';
import * as olSource from 'ol/source';
import * as olFormat from 'ol/format';
import VectorLayer from 'ol/layer/Vector';
import { bbox as loadingStrategyBbox } from 'ol/loadingstrategy';
import rootConfig from "../ExternalUrlConfig.json";
import { clearSailTimerVectorData } from '../Openlayers/MapLayerManager';
import { toast } from 'react-toastify';


export const RunSailTimerApi = async (left, top, right, bottom, timeStampDate, map, serverPort, type) => {
    try {

        // Converting coordinates to sails coordinates
        let stLeft = 180 + parseFloat(left);
        let stTop = top;
        let stRight = 180 + parseFloat(right);
        let stBottom = bottom;

        const year = timeStampDate.getFullYear();
        const month = String(timeStampDate.getMonth() + 1).padStart(2, '0');
        const day = String(timeStampDate.getDate()).padStart(2, '0');
        const hour = String(timeStampDate.getHours()).padStart(2, '0');

        const baseUrl = serverPort === rootConfig.AppBuilderPort ? rootConfig['app-builder-NodeServerUrl'] : rootConfig['downloaded-app-ServerUrl'];
        const url = `${baseUrl}/api/sailtimer?year=${year}&month=${month}&hour=${hour}&day=${day}&toplat=${stTop}&leftlon=${stLeft}&rightlon=${stRight}&bottomlat=${stBottom}`;

        const response = await axios.get(url);
        if (response) {
            if (type == "productFilter") {
                return response;
            } else {
                convertToGeoJSon(response.data, map);
            }
        }

    } catch (error) {
        //console.error('Error fetching data:', error);
        toast.warn('Error fetching sail timer data');
        throw error;
    }
};

const convertToGeoJSon = async (jsonData, map) => {
    let geojson = {
        type: "FeatureCollection",
        features: [],
    }

    let d1 = jsonData;

    for (let i = 0; i < d1['NOAA GFS'].data.length; i++) {
        let ft = d1['NOAA GFS'].metadata.forecast_time
        let rt = d1['NOAA GFS'].metadata.reference_time;
        let lon = d1['NOAA GFS'].data[i].longitude - 180;
        let lat = d1['NOAA GFS'].data[i].latitude;
        let ws = d1['NOAA GFS'].data[i].windSpeed;
        let wd = d1['NOAA GFS'].data[i].windDirection;

        geojson.features.push({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [lon, lat]
            },
            "properties": {
                "forecast_time": ft,
                "referreference_time": rt,
                "windSpeed": ws,
                "windDirection": wd
            }
        })
    }

    if (geojson) {
        addToMap(JSON.stringify(geojson), map);
    }
}

function addToMap(geoJsonData, map) {

    const shaftred = new olStyle.RegularShape({
        points: 2,
        radius: 12,
        stroke: new olStyle.Stroke({
            width: 2,
            color: 'red',
        }),
        rotateWithView: true,
    });

    const headred = new olStyle.RegularShape({
        points: 3,
        radius: 10,
        fill: new olStyle.Fill({
            color: 'red',
        }),
        rotateWithView: true,
    });

    const shaftgreen = new olStyle.RegularShape({
        points: 2,
        radius: 12,
        stroke: new olStyle.Stroke({
            width: 2,
            color: 'green',
        }),
        rotateWithView: true,
    });

    const headgreen = new olStyle.RegularShape({
        points: 3,
        radius: 10,
        fill: new olStyle.Fill({
            color: 'green',
        }),
        rotateWithView: true,
    });

    // Define style functions
    const stylered = [new olStyle.Style({ image: shaftred }), new olStyle.Style({ image: headred })];
    const stylegreen = [new olStyle.Style({ image: shaftgreen }), new olStyle.Style({ image: headgreen })];

    const boxString1 = geoJsonData; // Assuming geoJsonData is available
    const myBlob = new Blob([`${boxString1}`], {
        type: "text/plain"
    });
    const url = window.URL.createObjectURL(myBlob);

    // Create vector source
    const wmjsonsc = new olSource.Vector({
        crossOrigin: "Anonymous",
        format: new olFormat.GeoJSON(),
        url: url,
        strategy: loadingStrategyBbox
    });

    // Create vector layer
    const wmjson = new VectorLayer({
        title: "WindData",
        source: wmjsonsc,
        style: function (feature) {
            const angle = feature.get('windDirection');
            const speed = feature.get('windSpeed');

            if (parseFloat(speed) > 12) {
                shaftred.setRotation(angle);
                headred.setRotation(angle);
                return stylered;
            }
            if (parseFloat(speed) < 12) {
                shaftgreen.setRotation(angle);
                headgreen.setRotation(angle);
                return stylegreen;
            }
        },
    });
    clearSailTimerVectorData(map);
    map.addLayer(wmjson);
}
