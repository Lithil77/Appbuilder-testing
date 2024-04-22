import ImageWMS from "ol/source/ImageWMS.js";
import ImageLayer from "ol/layer/Image.js";
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Image as ImageSource } from 'ol/source';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import rootConfig from "../ExternalUrlConfig.json";
import Draw from 'ol/interaction/Draw';
import Feature from 'ol/Feature.js';
import Polygon from 'ol/geom/Polygon.js';
import { transform } from 'ol/proj';

var parser = new GeoJSON();

/**
 * addWMSLayerToMap - Adds a Web Map Service (WMS) layer to an OpenLayers map.
 * @param {ol.Map} olMap - The OpenLayers map.
 * @param {string} wmsUrl - The URL of the WMS service.
 * @param {string} workspace - The workspace for the layer.
 * @param {string} layerName - The name of the layer to be added.
 */
export const addWMSLayerToMap = (olMap, wmsUrl, workspace, layerName) => {
    const wmsSource = new ImageWMS({
        url: wmsUrl,
        params: {
            LAYERS: `${workspace}:${layerName}`,
            TILED: false,
        },
        serverType: "geoserver",
    });

    const wmsLayer = new ImageLayer({
        title: layerName,
        visible: true,
        source: wmsSource,
    });

    olMap.addLayer(wmsLayer);

};

/**
 * Shows highlighted features on the map using a styling vector layer.
 * @param {ol.Map} olMap - The OpenLayers map.
 * @param {string} data - Data representing features to be highlighted.
 */
export const renderHighlightedFeatures = (data) => {
    const vectorLayer = createStylingVectorLayerWithStyles(featureInformationStyles);
    if (data) {
        const features = parser.readFeatures(data);
        vectorLayer.getSource().addFeatures(features);
    }
    return vectorLayer;
};

export const hightLight_SelectedFeature = (olMap, _data) => {

    if (_data && olMap) {
        //clearVectorSource(olMap);
        const vectorLayer = new VectorLayer({
            title: 'Highlight-Vector-Layer',
            source: new VectorSource(),
            style: featureInformationStyles,
        });
        var features = parser.readFeatures(_data, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
        });

        vectorLayer.getSource().addFeatures(features);
        var extent = vectorLayer.getSource().getExtent();
        olMap.getView().fit(extent, {
            padding: [250, 250, 350, 250], minResolution: 10,
            duration: 1000
        });
        olMap.addLayer(vectorLayer);
    }
}

/**
 * Creates a vector layer with the specified styles.
 * @param {ol.Map} olMap - The OpenLayers map to which the layer will be added.
 * @param {ol.style.Style} styles - The styles to be applied to features in the layer.
 */
export const createStylingVectorLayerWithStyles = (styles) => {
    const vectorLayer = new VectorLayer({
        source: new VectorSource(),
        style: styles,
    });
    return vectorLayer;
};

/**
 * Creates a vector layer with provided features.
 * @param {Array<Feature>} features - Features to be added to the layer.
 **/
export const createVectorLayerWithFeatures = (features) => {
    const vectorSource = new VectorSource({
        features: features,
    });

    const vectorLayer = new VectorLayer({
        source: vectorSource,
        style: null,
    });
    return vectorLayer;
};

export const rtzWayGeometryStyles = () => {
    const pointStyle = new Style({
        image: new CircleStyle({
            radius: 7,
            fill: new Fill({ color: 'blue' }),
            stroke: new Stroke({ color: 'white', width: 3 }),
        }),
    });

    const lineStringStyle = new Style({
        stroke: new Stroke({
            color: 'red',
            width: 3,
        }),
    });
    return { pointStyle, lineStringStyle };
}

export const featureInformationStyles = new Style({
    fill: new Fill({
        color: rootConfig["feature-Info-Styles"].Fill,
    }),
    stroke: new Stroke({
        color: rootConfig["feature-Info-Styles"].Stroke,
        width: 3,
    }),
    image: new CircleStyle({
        radius: 5,
        stroke: new Stroke({
            color: rootConfig["feature-Info-Styles"]["Circle-Style-Stroke"],
        }),
        fill: new Fill({
            color: rootConfig["feature-Info-Styles"]["Circle-Style-Fill"],
        }),
    }),
});

export const rtzGeometryHighlightStyles = new Style({
    fill: new Fill({
        color: 'rgba(255, 0, 0, 0.1)',
    }),
    stroke: new Stroke({
        color: 'yellow',
        width: 2,
    }),
    image: new CircleStyle({
        radius: 6,
        fill: new Fill({
            color: 'rgba(255, 0, 0, 0.1)',
        }),
        stroke: new Stroke({
            color: 'yellow',
            width: 2,
        }),
    }),
});

export const clearVectorSource = (olMap) => {

    if (olMap) {
        var layers = olMap.getLayers().getArray();
        layers.map((lyr) => {
            if (lyr instanceof VectorLayer && lyr.getSource() instanceof VectorSource) {
                lyr.getSource().clear();
                olMap.removeLayer(lyr);
                olMap.render();
            }
        })
    }
}

export const clearImageSource = (olMap) => {

    if (olMap) {
        var layers = olMap.getLayers().getArray();
        layers.map((lyr) => {
            if (lyr instanceof ImageLayer && lyr.getSource() instanceof ImageSource) {
                olMap.removeLayer(lyr);
                olMap.render();
            }
        })
    }
}

export const stopDrawAction = (olMap) => {
    const interactions = olMap.getInteractions();
    interactions.forEach(interaction => {
        if (interaction instanceof Draw) {
            if (interaction.getActive()) {
                interaction.finishDrawing();
                interaction.setActive(false);
                olMap.removeInteraction(interaction);
            }
        }
    });
};

export const clearSailTimerVectorData = (olMap) => {
    if (olMap) {
        var layers = olMap.getLayers().getArray();
        layers.map((lyr) => {
            if (lyr instanceof VectorLayer && lyr.getSource() instanceof VectorSource) {
                if (lyr.get('title') == 'WindData') {
                    lyr.getSource().clear();
                    olMap.removeLayer(lyr);
                    olMap.render();
                }
            }
        })
    }
}

export const clearHighLightVectorData = (olMap) => {
    if (olMap) {
        var layers = olMap.getLayers().getArray();
        layers.map((lyr) => {
            if (lyr instanceof VectorLayer && lyr.getSource() instanceof VectorSource) {
                if (lyr.get('title') == 'Highlight-Vector-Layer') {
                    lyr.getSource().clear();
                    olMap.removeLayer(lyr);
                    olMap.render();
                }
            }
        })
    }
}

export function findImageLayerByTitle(olMap, layerName) {
    var layers = olMap.getLayers().getArray();
    var foundLayer = null;

    layers.forEach((lyr) => {
        if (lyr instanceof ImageLayer && lyr.getSource() instanceof ImageSource) {
            if (lyr.get('title') === layerName) {
                foundLayer = lyr;
            }
        }
    });

    return foundLayer;
}

export function findVectorLayerByTitle(olMap, layerName) {
    var layers = olMap.getLayers().getArray();
    var foundLayer = null;

    layers.forEach((lyr) => {
        if (lyr instanceof VectorLayer && lyr.getSource() instanceof VectorSource) {
            if (lyr.get('title') === layerName) {
                foundLayer = lyr;
            }
        }
    });

    return foundLayer;
}

export function rtzfeatureGeometryhighLight(left, top, right, bottom, olMap) {
    const topLeft3857 = transform([left, top], 'EPSG:4326', 'EPSG:3857');
    const topRight3857 = transform([right, top], 'EPSG:4326', 'EPSG:3857');
    const bottomRight3857 = transform([right, bottom], 'EPSG:4326', 'EPSG:3857');
    const bottomLeft3857 = transform([left, bottom], 'EPSG:4326', 'EPSG:3857');

    const rectangleFeature = new Feature({
        geometry: new Polygon([[topLeft3857, topRight3857, bottomRight3857, bottomLeft3857, topLeft3857]])
    });

    const vectorSource = new VectorSource({
        features: [rectangleFeature]
    });

    const vectorLayer = new VectorLayer({
        title: 'Highlight-Vector-Layer',
        source: vectorSource,
        style: featureInformationStyles,
    });

    var extent = vectorLayer.getSource().getExtent();
    olMap.getView().fit(extent, {
        padding: [250, 250, 350, 250], minResolution: 10,
        duration: 1000
    });
    olMap.addLayer(vectorLayer);
}











