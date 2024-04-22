import axios from 'axios';
import rootConfig from "../ExternalUrlConfig.json";
import { hightLight_SelectedFeature, clearVectorSource } from "../Openlayers/MapLayerManager";
let baseUrl;

export const getAttributeValues = async (olMap, dynamicUrl, targetUrl, lyrName, showAlert) => {
    // Get references to the map container and an empty list for products
    const mapContainer = document.getElementById('map-container');
    const productslist = [];

    // Check if the OpenLayers map, map container, and required URLs are available
    if (olMap && mapContainer && dynamicUrl !== null && targetUrl !== null && lyrName !== '') {
        // Construct the base URL for the WFS request
        const baseUrl = `${targetUrl}?service=WFS&version=1.1.0&request=GetFeature&typename=${lyrName}&outputFormat=application/json`;
        const queryParams = { param: baseUrl };

        try {
            // Set loading state to true while fetching data
           

            // Fetch data from the dynamic URL with the constructed query parameters
            const resultData = await axios.get(dynamicUrl, { params: queryParams });
            const features = resultData.data.features;

            // Check if features are available in the result
            if (features) {
                // Process features based on the layer type
                if (lyrName !== rootConfig?.S1412WindDataLayerName) {
                    features.forEach((feature) => {
                        const producercode = feature.properties['producercode'];
                        const productName = feature.properties['product'];
                        const featurename = feature.properties['featurename'];
                        const chartnumber = feature.properties['chartnumber'];

                        // Check if producer code is not null and the product is not already in the list
                        if (producercode !== null && !productslist.some(item => item.chartnumber === chartnumber)) {
                            // Create a combined label and add the product to the list
                            const combinedLabel = `${productName}, ${featurename}, ${chartnumber}, ${producercode}`;
                            productslist.push({ productName, featurename, chartnumber, producercode, combinedLabel });
                        }
                    });
                } else {
                    // Process features for a specific layer type (e.g., S1412WindDataLayer)
                    features.forEach((feature) => {
                        const Id = feature.properties['ID'];
                        if (Id !== null) {
                            // Create a combined label and add the product to the list
                            const combinedLabel = `${Id}`;
                            productslist.push({ Id, combinedLabel });
                        }
                    });
                }

            } else {
                // Show a warning alert if no records are found for the layer
                showAlert("warning", "Attribute Query", `No records found for this layer ${lyrName}`);
            }

        } catch (error) {
            // Show an error alert if there's an issue fetching data
            showAlert("warning", "Attribute Query", "Error fetching data");
        } 

        return productslist;
    }
};


// Function to perform attribute query based on selected option
export const performAttributeQuery = async (olMap, dynamicUrl, targetUrl, lyrName, selectedOption, showAlert) => {
    let featureData = [];

    if (targetUrl) {

        if (lyrName !== rootConfig?.S1412WindDataLayerName) {
            const { chartnumber, featurename, producercode, productName } = selectedOption;

            const propertyName = 'producercode,country_code,producttype,featurename,chartnumber,compilationscale,polygon';
            const outputFormat = 'application/json';
            const cqlFilter = `chartnumber='${chartnumber}' AND product='${productName}' AND producercode='${producercode}' AND featurename='${featurename}'`;
            baseUrl = `${targetUrl}?service=WFS&version=1.1.0&request=GetFeature&typename=${lyrName}&outputFormat=${outputFormat}&cql_filter=${encodeURIComponent(cqlFilter)}&propertyName=${propertyName}`;
        } else {
            const { Id } = selectedOption;
            baseUrl = `${targetUrl}?service=WFS&version=1.1.0&request=GetFeature&typename=${lyrName}&outputFormat=application/json&cql_filter=ID='${Id}'`;
        }

        const queryParams = { param: baseUrl };

        try {
            const resultData = await axios.get(dynamicUrl, { params: queryParams });

            // Check if features are found in the result
            if (resultData?.data?.features?.length > 0) {
                const targetOverlay = olMap.getOverlays().getArray()[0];
                if (targetOverlay) {
                    targetOverlay.setPosition(undefined);
                }
                clearVectorSource(olMap);
                hightLight_SelectedFeature(olMap, resultData.data);
                featureData.push(resultData.data.features[0].properties);
               
            } else {
                showAlert("warning", "Attribute Query", "No features found for the selected option.");
                console.warn("No features found for the selected option.");
            }
        } catch (error) {
            showAlert("warning", "Attribute Query", `Error fetching data: ${error.message}`);
            console.error("Error fetching data:", error);
        }
    } else {
        showAlert("warning", "Attribute Query", `Layer '${lyrName}' not found.`);
        console.error(`Layer '${lyrName}' not found.`);
    }

    return featureData;
};


