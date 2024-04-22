import { fromLonLat } from "ol/proj.js";
import View from "ol/View";

var previousExtends = [];
var nextExtends = [];

/* ---------------------------------------------------
        Home 
----------------------------------------------------- */
export function setHomeView(olMap, _lonLat) {
    if (olMap) {
        var view = new View({
            center: fromLonLat(_lonLat),
            zoom: 2,
        });

        olMap.setView(view);
        previousExtends.push(olMap.getView().calculateExtent(olMap.getSize()));
    }
}

/* ---------------------------------------------------
        Zoom in 
----------------------------------------------------- */
export function setZoomIn(olMap) {
    if (olMap) {
        previousExtends.push(olMap.getView().calculateExtent(olMap.getSize()));
        const view = olMap.getView();
        let currentZoom = view.getZoom();
        olMap.getView().setZoom(currentZoom + 0.5);
    }
}

/* ---------------------------------------------------
        Zoom out 
----------------------------------------------------- */
export function setZoomOut(olMap) {
    if (olMap) {
        previousExtends.push(olMap.getView().calculateExtent(olMap.getSize()));
        const view = olMap.getView();
        let currentZoom = view.getZoom();
        olMap.getView().setZoom(currentZoom - 0.5);
    }
}

/* ---------------------------------------------------
        Previous extend
----------------------------------------------------- */
export function restorePreviousExtend(olMap) {
    if (olMap) {
        var previousExtent = previousExtends.pop();
        if (previousExtent) {
            olMap.getView().fit(previousExtent);
            nextExtends.push(previousExtent);
        }
    }
}

/* ---------------------------------------------------
        Next extend 
----------------------------------------------------- */
export function restoreNextExtend(olMap) {
    if (olMap) {
        var nextExtent = nextExtends.pop();
        if (nextExtent) {
            olMap.getView().fit(nextExtent);
            previousExtends.push(nextExtent);
        }
    }
}
