import { Style, Stroke, Circle as CircleStyle, Fill } from 'ol/style';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import Draw from 'ol/interaction/Draw';

export function initializeDrawAndVectorLayers(drawType, vectorFillStyle, vectorStrokeStyle) {

    const sourceProjection = 'EPSG:4326';
    const destinationProjection = 'EPSG:3857';

    const drawStrokeStyle = {
        color: 'rgba(14, 183, 142, 0.8)',
        width: 3,
    };

    const drawLayerStyle = new Style({
        stroke: new Stroke(drawStrokeStyle),
        image: new CircleStyle({
            radius: 5,
            stroke: new Stroke({
                color: 'rgba(0, 0, 0, 1)',
                width: 1,
            }),
            fill: new Fill({
                color: 'rgba(14, 183, 142, 1)',
            }),
        }),
    });

    const drawSource = new VectorSource({ projection: destinationProjection });

    const DrawLayer = new VectorLayer({
        source: drawSource,
        style: drawLayerStyle,
    });

    const draw = new Draw({
        source: drawSource,
        type: drawType,
    });

    const vectorLayer = new VectorLayer({
        source: new VectorSource(),
        style: new Style({
            fill: new Fill(vectorFillStyle),
            stroke: new Stroke(vectorStrokeStyle),
        }),
    });

    return {
        drawLayer: DrawLayer,
        drawInteraction: draw,
        vectorLayer: vectorLayer,
        sourceProjection: sourceProjection,
        destinationProjection: destinationProjection
    };
}





