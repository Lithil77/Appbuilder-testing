import axios from 'axios';
import WMSCapabilities from 'ol/format/WMSCapabilities';
import { transformExtent } from 'ol/proj';
import rootConfig from "../ExternalUrlConfig.json";
import { toast } from 'react-toastify';

export const getLayerExtent = async (geoserverUrl, title, serverPort, olMap) => {
    try {
        const endIndex = geoserverUrl.indexOf('/geoserver') + '/geoserver'.length;
        const updatedUrl = geoserverUrl.slice(0, endIndex);

        const url = `${updatedUrl}/ows?service=WMS&version=1.3.0&request=GetCapabilities`;
        const queryParams = { param: url };
        const dynamicUrl = (serverPort === rootConfig.AppBuilderPort) ? `${rootConfig["app-builder-NodeServerUrl"]}/api/getFeatures` : `${rootConfig["downloaded-app-ServerUrl"]}/api/getFeatures`;
        const response = await axios.get(dynamicUrl, { params: queryParams });

        const parser = new WMSCapabilities();
        const result = parser.read(response.data);

        if (result && result.Capability && result.Capability.Layer) {
            const layers = result.Capability.Layer.Layer;
            const desiredLayerName = title;

            const selectedLayer = layers.find(layer => layer.Name === desiredLayerName);

            console.log(selectedLayer);

            if (selectedLayer) {
                var extent = selectedLayer.EX_GeographicBoundingBox || selectedLayer.BoundingBox[0].extent;
                var layerExtent = transformExtent(extent, 'EPSG:4326', 'EPSG:3857');
                olMap.getView().fit(layerExtent, { padding: [10, 10, 10, 0] });
            }
        } else {
            // console.error('Error parsing GetCapabilities response');
            toast.warn('Error parsing GetCapabilities response');
        }
    } catch (error) {
        toast.warn('Error parsing GetCapabilities response');
        //console.error('Error parsing GetCapabilities response:', error);
    }
};

