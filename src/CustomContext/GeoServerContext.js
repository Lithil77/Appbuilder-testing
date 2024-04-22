import React, { createContext, useEffect, useState } from 'react';
import appConfig from '../utils/ApplicationTitleConfig.js';
import rootConfig from '../ExternalUrlConfig.json';
import ImageWMS from 'ol/source/ImageWMS.js';
import ImageLayer from 'ol/layer/Image.js';
import axios from 'axios';
import * as olExtent from 'ol/extent';
import GeoJSON from 'ol/format/GeoJSON.js';
import Feature from 'ol/Feature';
import { Point, LineString } from 'ol/geom';
import { get as getProjection } from 'ol/proj';
import { transform } from 'ol/proj';
import { toast } from 'react-toastify';

import {
    createVectorLayerWithFeatures, createStylingVectorLayerWithStyles,
    rtzWayGeometryStyles, rtzGeometryHighlightStyles, findVectorLayerByTitle
} from '../Openlayers/MapLayerManager.js';

export const GeoServerContext = createContext();

export const GeoServerContextProvider = ({ children }) => {

    const [serverPort, setServerPort] = useState();
    const [serverUrl, setServerUrl] = useState('');
    const [rtzFileCoordinates, setRTZFileCoordinates] = useState([]);

    const clearRtZFileCoordinates = () => {
        setRTZFileCoordinates([]);
    }

    const parser = new GeoJSON();

    const [bands] = useState([
        { band: '1', value: 'Overview', },
        { band: '2', value: 'General', },
        { band: '3', value: 'Coastal', },
        { band: '4', value: 'Approach', },
        { band: '5', value: 'Harbor', },
        { band: '6', value: 'Berthing', },
    ]);

    useEffect(() => {

        if (appConfig?._data?.PortID !== undefined && appConfig?._data.PortID !== "") {
            setServerPort(appConfig?._data?.PortID);
            const url = (serverPort === rootConfig.AppBuilderPort) ? `${rootConfig['app-builder-NodeServerUrl']}/api/getProducerCodes` : `${rootConfig['downloaded-app-ServerUrl']}/api/getProducerCodes`;
            setServerUrl(url);
        }

    }, [serverPort]);

    const getQueryLayerUrl = (lyrName, olMap) => {
        let layerUrl;
        const layersList = olMap.getLayers().getArray();

        const targetLayer = layersList.find(lyr =>
            lyr instanceof ImageLayer &&
            lyr.getSource() instanceof ImageWMS &&
            lyrName === lyr.get('title') &&
            lyr.getVisible() === true
        );

        if (targetLayer) {
            layerUrl = targetLayer.getSource().getUrl();
            if (layerUrl !== null && layerUrl !== undefined) {
                return layerUrl;
            }
        } else {
            // console.error("Target layer not found or is not visible.");
            toast.warn('Target layer not found or is not visible.');
        }

        return layerUrl;
    }


    const fetchAgencyCodes = async (layerName, olMap) => {
        let agencyCodes = [];
        const geoserverQueryLayerUrl = getQueryLayerUrl(layerName, olMap);
        const propertyName = 'producercode';
        const outputFormat = 'application/json';
        const baseUrl = `${geoserverQueryLayerUrl}?service=WFS&version=1.1.0
        &request=GetFeature&typename=${layerName}&outputFormat=${outputFormat}&propertyName=${propertyName}`;

        const queryParams = { param: baseUrl };
        try {
            const fetchedAgencyCodes = await axios.get(serverUrl, { params: queryParams });
            const features = fetchedAgencyCodes.data;

            if (features && features.features) {
                const producerCodes = new Set(features.features.map(feature => feature.properties.producercode));
                agencyCodes.push(...producerCodes);
            } else {
                //console.error(`There are no agency codes available in code geoserver for this ${layerName}}`);
                toast.warn(`There are no agency codes available in code geoserver for this ${layerName}`);
            }
        } catch (error) {
            //console.error(`Fetching error for agency codes from geoserver for this ${layerName}} :`, error);
            toast.warn(`Fetching error for agency codes from geoserver for this ${layerName}`);
        }
        return agencyCodes;
    };

    const fetchCountryCodes = async (olMap, layerName, agencyCode) => {

        let countryCodes = [];
        const geoserverQueryLayerUrl = getQueryLayerUrl(layerName, olMap);
        const propertyName = 'country_code';
        const outputFormat = 'application/json';
        const cqlFilter = `producercode='${agencyCode}'`;

        const baseUrl = `${geoserverQueryLayerUrl}?service=WFS&version=1.1.0
        &request=GetFeature&typename=${layerName}&outputFormat=${outputFormat}&cql_filter=${encodeURIComponent(cqlFilter)}&propertyName=${propertyName}`;

        const queryParams = { param: baseUrl };
        try {
            const fetchedAgencyCodes = await axios.get(serverUrl, { params: queryParams });
            const features = fetchedAgencyCodes.data;
            if (features && features.features) {
                const codes = new Set(features.features.map(feature => feature.properties.country_code));
                countryCodes.push(...codes);
            } else {
                //console.error(`There are no country codes available in code geoserver for this ${layerName}}`);
                toast.warn(`There are no country codes available in code geoserver for this ${layerName}`);
            }
        } catch (error) {
            //console.error(`Fetching error for counry codes from geoserver for this ${layerName}} :`, error);
            toast.warn(`Fetching error for counry codes from geoserver for this ${layerName}`);
        }
        return countryCodes;
    };


    const fetchProductTypes = async (olMap, layerName, agencyCode, countryCode) => {

        let productTypes = [];
        const geoserverQueryLayerUrl = getQueryLayerUrl(layerName, olMap);
        const propertyName = 'producttype';
        const outputFormat = 'application/json';
        const cqlFilter = `producercode='${agencyCode}' AND country_code='${countryCode}'`;
        const baseUrl = `${geoserverQueryLayerUrl}?service=WFS&version=1.1.0
        &request=GetFeature&typename=${layerName}&outputFormat=${outputFormat}&cql_filter=${encodeURIComponent(cqlFilter)}&propertyName=${propertyName}`;

        const queryParams = { param: baseUrl };
        try {
            const fetchedAgencyCodes = await axios.get(serverUrl, { params: queryParams });
            const features = fetchedAgencyCodes.data;
            if (features && features.features) {
                const _productTypes = new Set(features.features.map(feature => feature.properties.producttype));
                productTypes.push(..._productTypes);
            } else {
                //console.error(`There are no product types available in code geoserver for this ${layerName}}`);
                toast.warn(`There are no product types available in code geoserver for this ${layerName}`);
            }
        } catch (error) {
            //console.error(`Fetching error for product types from geoserver for this ${layerName}} :`, error);
            toast.warn(`Fetching error for product types from geoserver for this ${layerName}`);
        }

        fitLayerExtentToMap(olMap, layerName, countryCode);

        return productTypes;
    };

    const fetchNavUsageBands = async (olMap, layerName, agencyCode, countryCode, productType) => {
        let usageBands = [];
        const geoserverQueryLayerUrl = getQueryLayerUrl(layerName, olMap);
        const propertyName = 'navusage';
        const outputFormat = 'application/json';
        const cqlFilter = `producercode='${agencyCode}' AND country_code='${countryCode}' AND producttype='${productType}'`;
        const baseUrl = `${geoserverQueryLayerUrl}?service=WFS&version=1.1.0&request=GetFeature&typename=${layerName}&outputFormat=${outputFormat}&cql_filter=${encodeURIComponent(cqlFilter)}&propertyName=${propertyName}`;
        const queryParams = { param: baseUrl };

        try {
            const fetchedNavUsages = await axios.get(serverUrl, { params: queryParams });
            const features = fetchedNavUsages.data;

            if (features && features.features && features.features.length > 0) {
                const navUsages = features.features.map(feature => feature.properties.navusage);
                usageBands = Array.from(new Set(navUsages)).map(navUsage => {
                    const foundBand = bands.find(item => item.band === navUsage);
                    return {
                        band: navUsage,
                        value: foundBand ? foundBand.value : '',
                        selected: true
                    };
                });
            } else {
                //console.error(`There are no navusage available in GeoServer for this ${layerName}`);
                toast.warn(`There are no navusage available in GeoServer for this ${layerName}`);
            }
        } catch (error) {
            //console.error(`Fetching error for navusage from GeoServer for this ${layerName}:`, error);
            toast.warn(`Fetching error for navusage from GeoServer for this ${layerName}`);
        }

        usageBands.sort((a, b) => parseInt(a.band) - parseInt(b.band));

        return { encUsageBands: usageBands };
    };


    const fitLayerExtentToMap = async (olMap, layerName, countryCode) => {

        const geoserverQueryLayerUrl = getQueryLayerUrl(layerName, olMap);
        const cqlFilter = `country_code='${countryCode}'`;
        const outputFormat = 'application/json';
        const baseUrl = `${geoserverQueryLayerUrl}?service=WFS&version=1.1.0&request=GetFeature&typename=${layerName}&outputFormat=${outputFormat}&cql_filter=${encodeURIComponent(cqlFilter)}`;

        const queryParams = { param: baseUrl };
        try {
            const resultData = await axios.get(serverUrl, { params: queryParams });

            var features = parser.readFeatures(resultData.data, {
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:3857'
            });

            const extent = features.reduce((acc, feature) => {
                const featureExtent = feature.getGeometry().getExtent();
                return acc ? olExtent.extend(acc, featureExtent) : featureExtent;
            }, null);

            olMap.getView().fit(extent, {
                padding: [250, 250, 350, 250], minResolution: 10,
                duration: 1000
            });

        } catch (error) {
            //console.error('Error fetching layer extent:', error);
            toast.warn('Error fetching layer extent');
        }
    };

    const processWaypointFeatures = async (waypointFeatures, olMap, showAlert, selectedLayer, cqlFilterString, selectedCalendarDate) => {
        const lineStringFeatures = createLineStringFeatures(waypointFeatures);
        const { pointStyle, lineStringStyle } = rtzWayGeometryStyles();

        waypointFeatures.forEach(feature => feature.setStyle(pointStyle));
        lineStringFeatures.forEach(feature => feature.setStyle(lineStringStyle));

        const vectorLayer = createVectorLayerWithFeatures([...lineStringFeatures, ...waypointFeatures]);
        vectorLayer.set('name', 'RTZLayer');
        vectorLayer.set('title', 'RTZFileLayer');

        olMap.addLayer(vectorLayer);
        const extent = vectorLayer.getSource().getExtent();
        olMap.getView().fit(extent, { padding: [200, 200, 200, 200] });

        const rztGeometryHighLightVector = createStylingVectorLayerWithStyles(rtzGeometryHighlightStyles);
        olMap.addLayer(rztGeometryHighLightVector);

        try {
            const data = await processIntersectingFeatures(vectorLayer, rztGeometryHighLightVector, selectedLayer,
                cqlFilterString, showAlert, olMap, selectedCalendarDate);

            return data;
        } catch (error) {
            throw error;
        }
    };

    const processRTZFile = async (file, olMap, showAlert, selectedLayer, cqlFilterString, selectedCalendarDate) => {
        return new Promise((resolve, reject) => {
            if (!file) {
                showAlert('warning', 'Product filter', 'No file selected.');
                return resolve([]);
            }

            const reader = new FileReader();

            reader.onload = async (event) => {
                try {
                    const rtzData = event.target.result;
                    const result = parseRTZXML(rtzData);
                    const waypointFeatures = result.features;
                    setRTZFileCoordinates(result.coordinates);

                    if (rtzFileCoordinates.length > 0) {
                        // if (rtzFileCoordinates[0].lat === result.coordinates[0].lat) {
                        const foundLayer = findVectorLayerByTitle(olMap, 'RTZFileLayer');
                        if (foundLayer) {
                            foundLayer.getSource().clear();
                            olMap.removeLayer(foundLayer);
                            olMap.render();
                            setTimeout(async () => {
                                try {
                                    const data = await processWaypointFeatures(waypointFeatures, olMap, showAlert, selectedLayer, cqlFilterString, selectedCalendarDate);
                                    resolve(data);
                                } catch (error) {
                                    reject(error);
                                }
                            }, 1500);
                        }

                    } else {
                        if (waypointFeatures.length > 0) {
                            const data = await processWaypointFeatures(waypointFeatures, olMap, showAlert, selectedLayer, cqlFilterString, selectedCalendarDate);
                            resolve(data);
                        } else {
                            showAlert('warning', 'Product filter', 'No Results found.');
                            resolve([]);
                        }
                    }
                } catch (error) {
                    console.error('Error processing RTZ file:', error);
                    showAlert('warning', 'Product filter', 'Error processing RTZ file.');
                    reject(error);
                }
            };

            reader.onerror = (event) => {
                console.error('Error reading the RTZ file:', event.target.error);
                showAlert('warning', 'Product filter', 'Error reading RTZ file.');
                reject(event.target.error);
            };

            reader.readAsText(file);
        });
    };

    const processIntersectingFeatures = async (vectorLayer, highLightVectorLayer, layerName,
        cqlFilterString, showAlert, olMap, selectedCalenderDate) => {

        var wfsUrl;
        var featureslist;
        try {
            if (cqlFilterString === 'UnSelectedAll') {
                showAlert('warning', 'Product filter', 'Kindly select the usage band..');
                return [];
            }

            const geoserverQueryLayerUrl = getQueryLayerUrl(layerName, olMap);

            const propertyName = 'producercode,country_code,producttype,featurename,chartnumber,compilationscale,polygon';

            if (layerName === rootConfig.S1412WindDataLayerName) {
                wfsUrl = `${geoserverQueryLayerUrl}?service=WFS&version=1.1.0&request=GetFeature&typename=${layerName}&outputFormat=application/json&cql_filter=${encodeURIComponent(cqlFilterString)}`;
            }
            else {
                wfsUrl = `${geoserverQueryLayerUrl}?service=WFS&version=1.1.0&request=GetFeature&typename=${layerName}&outputFormat=application/json&cql_filter=${encodeURIComponent(cqlFilterString)}&propertyName=${propertyName}`;
            }

            const queryParams = { param: wfsUrl };

            const res = await axios.get(serverUrl, { params: queryParams });

            const geoJSONData = res.data.features;

            const features = vectorLayer.getSource().getFeatures();
            const sourceProjection = vectorLayer.getSource().getProjection() || getProjection('EPSG:3857');

            const intersectingFeatures = features.flatMap(vectorFeature => {
                const vectorGeometry = vectorFeature.getGeometry();
                const intersectingFeaturesForVector = [];

                geoJSONData.forEach(geoJSONFeature => {
                    if (geoJSONFeature.geometry) {
                        const geoJSONGeometry = new GeoJSON().readGeometry(geoJSONFeature.geometry);
                        const transformedVectorGeometry = vectorGeometry.clone().transform(sourceProjection, 'EPSG:4326');

                        if (transformedVectorGeometry.intersectsExtent(geoJSONGeometry.getExtent())) {
                            intersectingFeaturesForVector.push(geoJSONFeature);
                        }
                    } else {
                        console.warn('Invalid GeoJSON feature:', geoJSONFeature);
                    }
                });

                return intersectingFeaturesForVector;
            });

            const geometryFeaturesData = intersectingFeatures.map(feature => {
                const properties = { ...feature.properties };
                if (layerName === rootConfig.S1412WindDataLayerName) {

                    const formatdate = new Date(selectedCalenderDate);
                    const day = ('0' + formatdate.getDate()).slice(-2);
                    const month = ('0' + (formatdate.getMonth() + 1)).slice(-2);
                    const year = formatdate.getFullYear();
                    const formattedDateString = `${day}-${month}-${year}`;
                    properties.Date = formattedDateString;
                }
                return properties;
            });

            if (geometryFeaturesData.length > 0) {
                const geoJsonFormat = new GeoJSON();
                featureslist = geoJsonFormat.readFeatures(
                    {
                        type: 'FeatureCollection',
                        features: intersectingFeatures,
                    },
                    {
                        dataProjection: 'EPSG:4326',
                        featureProjection: 'EPSG:3857',
                    }
                );
                highLightVectorLayer.getSource().addFeatures(featureslist);
            } else {
                showAlert('warning', 'Product filter', 'No results found..!');
            }

            return geometryFeaturesData;

        } catch (error) {
            console.error('Error:', error);
            return [];
        }
    };

    const createLineStringFeatures = (waypointFeatures) => {
        const lineStringFeatures = [];

        for (let i = 0; i < waypointFeatures.length - 1; i++) {
            const currentPoint = waypointFeatures[i].getGeometry().getCoordinates();
            const nextPoint = waypointFeatures[i + 1].getGeometry().getCoordinates();
            const lineString = new LineString([currentPoint, nextPoint]);

            const lineStringFeature = new Feature({
                geometry: lineString,
            });

            lineStringFeatures.push(lineStringFeature);
        }

        return lineStringFeatures;
    };

    function parseRTZXML(xmlString) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
        const waypoints = xmlDoc.getElementsByTagName('waypoint');
        const features = [];
        const coordinates = []

        for (let i = 0; i < waypoints.length; i++) {
            const waypoint = waypoints[i];
            const name = waypoint.getAttribute('name');
            const position = waypoint.getElementsByTagName('position')[0];

            if (position) {
                const lat = parseFloat(position.getAttribute('lat'));
                const lon = parseFloat(position.getAttribute('lon'));

                if (!isNaN(lat) && !isNaN(lon)) {

                    coordinates.push({
                        lat: lat,
                        lon: lon,
                    })
                    const transformedCoordinates = transform(
                        [lon, lat],
                        'EPSG:4326',
                        'EPSG:3857'
                    );

                    const feature = new Feature({
                        geometry: new Point(transformedCoordinates),
                        name: name || 'Unnamed Waypoint',
                    });

                    features.push(feature);
                }
            }
        }
        return { features: features, coordinates: coordinates };
    }

    return (
        <GeoServerContext.Provider
            value={{
                getQueryLayerUrl,
                fetchAgencyCodes,
                fetchCountryCodes,
                fetchProductTypes,
                fetchNavUsageBands,
                processRTZFile,
                clearRtZFileCoordinates
            }}
        >
            {children}
        </GeoServerContext.Provider>
    );
};









