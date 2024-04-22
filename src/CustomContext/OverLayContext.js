import React, { createContext, useState, useRef, useContext } from 'react';
import { clearVectorSource } from "../Openlayers/MapLayerManager";
import ImageWMS from 'ol/source/ImageWMS.js';
import ImageLayer from 'ol/layer/Image.js';
import { GeoServerContext } from './GeoServerContext';


export const OverLayPanelContext = createContext();

export const OverLayPanelProvider = ({ children }) => {

    const { clearRtZFileCoordinates } = useContext(GeoServerContext);
    const [baseMapOverLayPanelVisible, setBaseMapOverLayPanelVisible] = useState(false);
    const [measureOverLayPanelVisible, setMeasureOverLayPanelVisible] = useState(false);
    const [attributeQueryOverLayPanelVisible, setAttributeQueryOverLayPanelVisible] = useState(false);
    const [featureInfoFlag, setFeatureInfoFlag] = useState(false);
    const [clickHandlers, setClickHandlers] = useState([]);
    const [collapsed, setCollapsed] = useState(true);
    const [featureData, setFeatureData] = useState([]);
    const typeaheadRef = useRef(null);
    const [attributeQuerySelectedLayer, setAttributeQuerySelectedLayer] = useState('');
    const [queryType, SetQueryType] = useState('');
    const [viewGeometryBtn, SetViewGeometryBtn] = useState(null);
    const [geometryCollection, setGeometryCollection] = useState([]);
    const [selectedCalenderDate, setSelectedCalenderDate] = useState(new Date());
    const [selectedProduct, setSelectedProduct] = useState('select');
    const [featureSearchResults, setFeatureSearchResults] = useState([]);
    const [searchInputloading, setSearchInputloading] = useState(false);
    const [selectedOpt, setSelectedOpt] = useState(null);

    const [zoomWindowBtnFlag, setZoomWindowBtnFlag] = useState(true);
    const [zoomWindowButtonActive, setZoomWindowButtonActive] = useState(false);

    const dragBoxRef = useRef(null);

    const [tabActiveItem, setTabActiveItem] = useState('defaultTab');
    const [isLoading, setLoading] = useState(false);

    const updateLoaderValue = (value) => {
        setLoading(value)
    }

    const updateSelectedTabActiveItem = (value) => {
        setTabActiveItem(value);
    }

    const updateZoomWindowBtnFlag = (value) => {
        setZoomWindowBtnFlag(value)
    }

    const updateZoomWindowButtonActive = (value) => {
        setZoomWindowButtonActive(value)
    }

    const removeZoomWindowFunctionality = (olMap) => {
        if (dragBoxRef.current) {
            olMap.removeInteraction(dragBoxRef.current);
        }
    }

    const updateSelectedOpt = (value) => {
        setSelectedOpt(value);
    }
    const updateSearchInputloading = (value) => {
        setSearchInputloading(value);
    }
    const updateFeatureSearchResults = (data) => {
        setFeatureSearchResults(data);
    }
    const clearFeatureSearchResults = () => {
        setFeatureSearchResults([]);
    }
    const updateSelectedProduct = (layer) => {
        setSelectedProduct(layer)
    }

    const updateSelectedCalenderDate = (newDate) => {
        setSelectedCalenderDate(newDate);
    }
    const toggleBaseMapOverLayPanel = (isValue) => {
        setBaseMapOverLayPanelVisible(isValue);

        const baseMapsActive = document.getElementById('BaseMaps');
        if (isValue === false) {
            if (baseMapsActive !== null) {
                baseMapsActive.classList.remove('active');
            }
        }
        else {
            if (baseMapsActive !== null) {
                baseMapsActive.classList.add('active');
            }
        }
    };

    const toggleMeasureOverLayPanel = (isValue) => {
        setMeasureOverLayPanelVisible(isValue);
        const MeasureActive = document.getElementById('Measure');
        if (isValue === false) {
            if (MeasureActive !== null) {
                MeasureActive.classList.remove('active');
            }
        }
        else {
            if (MeasureActive !== null) {
                MeasureActive.classList.add('active');
            }
        }
    };

    const toggleAttributeQueryOverLayPanel = (isValue) => {
        setAttributeQueryOverLayPanelVisible(isValue);
        const attributeQueryToggleBtnActive = document.getElementById('attributeQueryToggleBtn');
        if (isValue === false) {
            if (attributeQueryToggleBtnActive !== null) {
                attributeQueryToggleBtnActive.classList.remove('active');
            }
        } else {
            if (attributeQueryToggleBtnActive !== null) {
                attributeQueryToggleBtnActive.classList.add('active');
            }
        }
    };

    const registerClickHandler = (type, handler, olMap) => {
        setClickHandlers((prevHandlers) => [...prevHandlers, { type, handler }]);
        olMap.on(type, handler);
    };

    const unregisterClickHandlers = (olMap, type) => {

        olMap.getTargetElement().style.cursor = 'default';

        if (type == 'productFilter' || type == 'attributequery'
            || type == 'featureInfo' || type == 'baseMaps' || type == 'measureArea' || type == 'zoomWindow' || type == 'Home') {
            for (let i = 0; i < 5; i++) {
                clearVectorSource(olMap);
            }
            setFeatureData([]);

            const tooltipStatic = document.querySelectorAll(".ol-tooltip-static");

            if (tooltipStatic) {
                tooltipStatic.forEach(tooltip => {
                    tooltip.style.display = "none";
                });
            }
        }

        clickHandlers.forEach(({ type, handler }) => {
            olMap.un(type, handler);
        });
        setClickHandlers([]);

        let featureInfoBtn = document.getElementById("featureInfoBtn");

        if (featureInfoBtn != null) {
            featureInfoBtn.classList.remove('active');
        }
        var buttons = document.querySelectorAll('.ZoomextentBtn');
        buttons.forEach(function (button) {
            button.classList.remove('active');
        });

        let mapContainer = document.getElementById('map-container');
        if (mapContainer) {
            mapContainer.style.cursor = 'default';
        }

    };

    const deactiveAttributeQueryActivities = () => {
        if (typeaheadRef.current) {
            typeaheadRef.current.clear();
        }
        clearFeatureSearchResults();
        updateAttributeQueryLayer('');
        clearRtZFileCoordinates();
    }

    const toggleFeatureInfoFlag = (isValue) => {
        setFeatureInfoFlag(isValue);
    };

    const toggleCollapsibleTablePanel = (isValue) => {
        setCollapsed(isValue);
    };

    const getAllVisibleLayers = (olMap) => {
        const allLayers = olMap.getLayers().getArray();
        const visibleLayerTitles = [];
        for (let i = 0; i < allLayers.length; i++) {
            const layer = allLayers[i];
            if (layer instanceof ImageLayer && layer.getSource() instanceof ImageWMS) {
                if (layer.getVisible() === true) {
                    visibleLayerTitles.push(layer.get('title'));
                }
            }
        }
        return visibleLayerTitles;
    };

    const updateFeatureData = (data, type, layerName) => {

        if (type === "attributeQuery") {
            setFeatureData((prevFeatureData) => [
                ...prevFeatureData,
                {
                    "layerName": layerName,
                    "data": data,
                },
            ]);
        }
        else {

            setFeatureData((prevFeatureData) => {
                const existingIndex = prevFeatureData.findIndex(item => item.layerName === layerName);

                if (existingIndex !== -1) {
                    // If layerName exists, append new data to existing data
                    const updatedFeatureData = [...prevFeatureData];
                    updatedFeatureData[existingIndex] = {
                        ...updatedFeatureData[existingIndex],
                        data: [...updatedFeatureData[existingIndex].data, ...data],
                    };
                    return updatedFeatureData;
                } else {
                    // If layerName doesn't exist, add a new entry
                    return [
                        ...prevFeatureData,
                        {
                            layerName: layerName,
                            data: data,
                        },
                    ];
                }
            });
        }
    };

    const clearFeatureData = () => {
        setFeatureData([]);
    }

    const updateRZTFileData = (data) => {
        setFeatureData(data);
    }

    const clearComponentState = (allClear) => {
        allClear();
    }

    const updateAttributeQueryLayer = (layerName) => {
        setAttributeQuerySelectedLayer(layerName);
    }

    const updateQueryType = (type) => {
        SetQueryType(type)
    }

    const updateViewGeometryBtn = (value) => {
        SetViewGeometryBtn(value)
    }

    const updateGeometryCollection = (data) => {

        if (data.length > 0) {
            setGeometryCollection(data)
        }
        else {
            setGeometryCollection([]);
        }
    }

    return (
        <OverLayPanelContext.Provider value={{
            baseMapOverLayPanelVisible, toggleBaseMapOverLayPanel,
            measureOverLayPanelVisible, toggleMeasureOverLayPanel,
            attributeQueryOverLayPanelVisible, toggleAttributeQueryOverLayPanel,
            featureInfoFlag, toggleFeatureInfoFlag,
            registerClickHandler, unregisterClickHandlers,
            collapsed, toggleCollapsibleTablePanel,
            getAllVisibleLayers, clearFeatureData, updateFeatureData, featureData,
            updateRZTFileData, clearComponentState, typeaheadRef, updateAttributeQueryLayer,
            attributeQuerySelectedLayer, queryType, updateQueryType, viewGeometryBtn, updateViewGeometryBtn,
            updateGeometryCollection, geometryCollection, selectedCalenderDate, updateSelectedCalenderDate,
            selectedProduct, updateSelectedProduct, featureSearchResults, updateFeatureSearchResults, clearFeatureSearchResults,
            searchInputloading, updateSearchInputloading, updateSelectedOpt, selectedOpt,
            updateZoomWindowBtnFlag, updateZoomWindowButtonActive, zoomWindowBtnFlag,
            zoomWindowButtonActive, dragBoxRef, removeZoomWindowFunctionality, updateSelectedTabActiveItem,
            tabActiveItem, deactiveAttributeQueryActivities, updateLoaderValue, isLoading

        }}>
            {children}
        </OverLayPanelContext.Provider>
    );
};
