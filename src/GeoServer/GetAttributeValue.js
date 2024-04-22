import rootConfig from "../ExternalUrlConfig.json";
import axios from "axios";
import { toast } from 'react-toastify';

/* ---------------------------------------------------
   This functionality is designed to retrieve attribute values for a product (layer) from GeoServer.
   In this context, a "product" refers to layers such as S-101, S-1412, etc.
   The attribute values may vary dynamically based on specific requirements.
   Examples of such attributes include agencycode, countrycode, and producttype.
   --------------------------------------------------- */

export const GetAttributeValueDataFromGeoServer = async (olMap, serverPort, geoServerUrl, lyrName, attributeValue) => {
    var data = [];
    if (!olMap) {
        return;
    }

    const url =
        serverPort === rootConfig.AppBuilderPort
            ? `${rootConfig['app-builder-NodeServerUrl']}/api/getProducerCodes`
            : `${rootConfig['downloaded-app-ServerUrl']}/api/getProducerCodes`;
    const baseUrl = `${geoServerUrl}?service=WFS&version=1.1.0&request=GetFeature&typename=${lyrName}&outputFormat=application/json`;

    const queryParams = { param: baseUrl };

    try {
        const res = await axios.get(url, { params: queryParams });
        const features = res.data.features;
        if (features) {
            features.forEach((feature) => {
                const _attributeValue = feature.properties[attributeValue];
                if (_attributeValue !== undefined && !data.includes(_attributeValue) && _attributeValue !== null) {
                    feature.properties.layername = lyrName;
                    if (attributeValue === 'time') {
                        const dateString = _attributeValue;
                        const dateObject = new Date(dateString);
                        if (!data.some((date) => date.getTime() === dateObject.getTime())) {
                            data.push(dateObject);
                        }
                    } else {
                        data.push(_attributeValue);
                    }
                }
            });
        }
    } catch (error) {
       // console.error('Error fetching data from GeoServer:', error);
        toast.warn('Error fetching data from GeoServer');
    }
    return data;
};