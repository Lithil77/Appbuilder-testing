import React, { useEffect, useState, useContext, useRef } from 'react';
import { OLMapContext } from '../OLMap';
import { Card, Stack, Form, Row, Col, Overlay, Popover, ButtonGroup } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import useMapButtonLogic from '../../../CustomHooks/useMapButtonControl';
import MyModal from '../../General/Modal';

import { useColor } from '../../../CustomContext/ColorContext';
import { SidebarContext } from '../../../CustomContext/SidebarContext';
import GeoJSON from 'ol/format/GeoJSON.js';

import axios from 'axios';
import rootConfig from '../../../ExternalUrlConfig.json';
import config from '../../../utils/ApplicationTitleConfig';
import Calendar from './utils/Calender.js';
import UsageBands from './utils/UsageBands';
import { initializeDrawAndVectorLayers } from './utils/ProductFilterUtils';
import { clearVectorSource, clearHighLightVectorData, findImageLayerByTitle } from '../../../Openlayers/MapLayerManager.js';
import { useAlert } from '../../../CustomContext/AlertContext.js';
import { StyledLoaderInner, StyledLoaderWraper, StyledMapControlButton, StyledButton }
    from '../../../CustomHooks/CustomStyledComponents.js';
import CloseButtonWrapper from '../../../CustomHooks/closeButton.js';
import { OverLayPanelContext } from '../../../CustomContext/OverLayContext';
import { initialBandsState, handleBandToggle, handleSelectAllToggle } from "../../../GeoServer/UsageBandProcess.js"
import { GetAttributeValueDataFromGeoServer } from "../../../GeoServer/GetAttributeValue.js";
import { stopDrawAction } from "../../../Openlayers/MapLayerManager.js";
import { GeoServerContext } from '../../../CustomContext/GeoServerContext.js';
import { RunSailTimerApi } from '../../../GeoServer/SailTimer.js';
import { useMapControlMenuButton } from '../../../CustomContext/MapControlMenuButtonContext.js';

var serverPort = null;
let wfsUrl;
var productTypeFlag = true;

function ProductFilters() {

    const [title] = useState('ProductFilters');

    const { projectId } = useParams();
    const [flag, setFlag] = useState(false);

    const olMap = useContext(OLMapContext);
    const { backgroundColor, textColor, borderColor, typoColor, cardbodyColor, fontFamily } = useColor();

    const { fetchAgencyCodes, fetchCountryCodes, fetchProductTypes, fetchNavUsageBands,
        getQueryLayerUrl, processRTZFile, clearRtZFileCoordinates } = useContext(GeoServerContext);

    const showAlert = useAlert();

    const { toggleBaseMapOverLayPanel, toggleMeasureOverLayPanel, toggleAttributeQueryOverLayPanel,
        toggleFeatureInfoFlag, unregisterClickHandlers, toggleCollapsibleTablePanel,
        getAllVisibleLayers, clearFeatureData, updateFeatureData,
        updateQueryType, updateGeometryCollection,
        updateSelectedCalenderDate, selectedCalenderDate, selectedProduct,
        updateSelectedProduct, clearFeatureSearchResults,
        updateSearchInputloading, updateSelectedOpt, featureData, updateZoomWindowButtonActive, removeZoomWindowFunctionality,
        deactiveAttributeQueryActivities, updateLoaderValue, isLoading
    } = useContext(OverLayPanelContext);

    const { sideBarVisible, toggleSidebar, toggleBottombar, toggleLayersSidebar, toggleFeatureInfoSidebar } = useContext(SidebarContext);

    const deleteProductFilterButtonRef = useRef(null);
    const popupCloserRef = useRef(null);
    const columnRef = useRef(null);
    const fileInputRef = useRef(null);

    const [showModal, setShowModal] = useState(false);
    const [bands, setbands] = useState(initialBandsState);

    const activeUsageBandsCheckBox = () => {
        setbands(prevBands => ({
            ...prevBands,
            encUsageBands: prevBands.encUsageBands.map(opt => ({
                ...opt,
                selected: true,
            })),
        }));
    }

    const [modalContent] = useState(
        `Are you sure you want to delete the product filter component ?`
    );
    const [showClearModal, setShowClearModal] = useState(false);
    const [showGeometryClearDialog, setShowGeometryClearDialog] = useState(false);

    const [modalContentClear] = useState(
        'Are you sure you want to clear the results ?'
    );

    const [selectedAgencyCode, setSelectedAgencyCode] = useState('select');
    const [selectedCountry, setSelectedCountry] = useState('select');

    const [productList, setProductList] = useState([]);
    const [productTypes, setProductTypes] = useState([]);
    const [agencyCodeList, setAgencyCodeList] = useState([]);

    const [countryList, setCountryList] = useState([]);
    const [showCalendarDialog, setShowCalendarDialog] = useState(false);
    const [target, setTarget] = useState(null);
    const [selectedProductTypes, setSelectedProductTypes] = useState([]);
    const [enableGeomertyContainer, SetEnableGeomertyContainer] = useState(false);

    const [activeControlButton, setActiveControlButton] = useState(null);

    const { handleMouseEnter, handleMouseLeave, handleDelete, handleDeleteSuccessorError,
        handleCloseModal, deleteButtonStyle, containerStyle } = useMapButtonLogic(
            {
                projectId: projectId,
                title: title,
                deleteButtonRef: deleteProductFilterButtonRef,
                setShowModal,
            }
        );

    const hasHeader = config?._data?.Header;
    const hasFooter = config?._data?.Footer;
    const [sidebarHeight, setSidebarHeight] = useState(0);
    const [sidebarTop, setSidebarTop] = useState(0);
    const [cqlFilterString, setCqlFilterString] = useState('include');
    const [lineButtonActive, setLineButtonActive] = useState(false);
    const [polygonButtonActive, setPolygonButtonActive] = useState(false);
    const [pointButtonActive, setPointButtonActive] = useState(false);
    const [rtzButtonActive, setRtzButtonActive] = useState(false);
    const [S1412DataSetDates, setS1412DataSetDates] = useState([]);

    const [lineButtonVisible, setlineButtonVisible] = useState(false);
    const [polygonButtonVisible, setPolygonButtonVisible] = useState(false);
    const [pointButtonVisible, setPointButtonVisible] = useState(false);
    const [rtzButtonVisible, setRtzButtonVisible] = useState(false);
    const [calenderBtnVisible, setCalenderBtnVisible] = useState(false);

    const [open, setOpen] = useMapControlMenuButton();
    const initialCoordinates = {
        left: -124.5,
        top: 52.5,
        right: -124,
        bottom: 52,
        ID: 'WM-1'
    };

    const [calenderSelectedInfoSucess, setCalenderSelectedInfoSucess] = useState(false);

    useEffect(() => {

        const headerHeight = hasHeader ? 72 : 0;
        const footerHeight = hasFooter ? 57 : 0;
        const viewportHeight = window.innerHeight;

        const adjustedMapHeight = viewportHeight - headerHeight - footerHeight;
        const onlyFooterHeight = viewportHeight - footerHeight;
        const onlyHeaderHeight = viewportHeight - headerHeight;

        const setSidebarProps = (height, top) => {
            setSidebarHeight(height);
        };

        if (!hasHeader && !hasFooter) {
            setSidebarProps(viewportHeight, '0');
            setSidebarTop('0px');
        } else if (!hasHeader && hasFooter) {
            setSidebarProps(onlyFooterHeight, '0');
            setSidebarTop('0px');
        } else if (hasHeader && !hasFooter) {
            setSidebarProps(onlyHeaderHeight, '72px');
            setSidebarTop(72);
        } else {
            setSidebarProps(adjustedMapHeight, '72px');
            setSidebarTop(72);
        }
    }, [sidebarHeight, sidebarTop]);

    /* ---------------------------------------------------
    This functionality is used to load layers
    --------------------------------------------------- */

    useEffect(() => {

        if (config?._data?.PortID !== undefined && config._data.PortID !== "" && olMap) {
            serverPort = config?._data?.PortID;
            if (olMap) {
                const allVisibleLayers = getAllVisibleLayers(olMap);
                setProductList((prevList) => {
                    const uniqueTitles = [...new Set([...prevList, ...allVisibleLayers])];
                    return uniqueTitles;
                });
            }
        }

    }, [serverPort, olMap]);

    useEffect(() => {
        const encPanel = document.getElementById('productfilterbutton');
        const mapContainer = document.getElementById('map-container');
        const productFilterContainer = document.getElementById('productFilterContainer');
        const productFilterSideBar = document.getElementById('productFilterSideBar');
        const rightsidebar = document.getElementById('rightsidebar');

        if (encPanel && mapContainer && olMap && productFilterContainer && productFilterSideBar) {
            encPanel.append(productFilterContainer);
            mapContainer.append(productFilterSideBar);
            mapContainer.append(rightsidebar);
        }

    }, [olMap]);

    /* ---------------------------------------------------
   This function initializes the drawing and vector layers, and sets up interactions for drawing features on the map
    --------------------------------------------------- */
    const selectGeometryFeature = async (drawType, vectorFillStyle, vectorStrokeStyle) => {

        if (cqlFilterString === 'UnSelectedAll') {
            showAlert('warning', 'Product filter', 'Kindly select the usage band.');
            return;
        }

        const layerName = selectedProduct;

        const customCursorStyle = 'crosshair';
        const geoserverQueryLayerUrl = getQueryLayerUrl(layerName, olMap);
        const dynamicUrl =
            serverPort === rootConfig.AppBuilderPort
                ? `${rootConfig['app-builder-NodeServerUrl']}/api/getProducerCodes`
                : `${rootConfig['downloaded-app-ServerUrl']}/api/getProducerCodes`;

        if (selectedProduct !== rootConfig?.S1412WindDataLayerName) {
            const propertyName = 'producercode,country_code,producttype,featurename,chartnumber,compilationscale,polygon';
            const outputFormat = 'application/json';
            wfsUrl = `${geoserverQueryLayerUrl}?service=WFS&version=1.1.0&request=GetFeature&typename=${layerName}&outputFormat=${outputFormat}&cql_filter=${encodeURIComponent(cqlFilterString)}&propertyName=${propertyName}`;

        } else {
            wfsUrl = `${geoserverQueryLayerUrl}?service=WFS&version=1.1.0&request=GetFeature&typename=${layerName}&outputFormat=application/json&cql_filter=${encodeURIComponent(
                cqlFilterString
            )}`;
        }

        const queryParams = { param: wfsUrl };

        try {
            stopDrawAction(olMap);
            updateLoaderValue(true);

            const res = await axios.get(dynamicUrl, { params: queryParams });

            const { drawLayer, drawInteraction, vectorLayer, sourceProjection, destinationProjection } =
                initializeDrawAndVectorLayers(drawType, vectorFillStyle, vectorStrokeStyle);
            olMap.addLayer(vectorLayer);
            olMap.addLayer(drawLayer);
            olMap.addInteraction(drawInteraction);
            updateLoaderValue(false);

            drawInteraction.on('drawstart', function (event) {
                olMap.getViewport().style.cursor = customCursorStyle;
            });

            drawInteraction.on('drawend', event => {
                const feature = event.feature;
                const drawGeometry = feature.getGeometry();
                const geoJSONData = res.data.features;

                if (selectedProduct === rootConfig.S1412WindDataLayerName) {
                    updateGeometryCollection(geoJSONData);
                }

                const drawGeometryEPSG4326 = drawGeometry.clone().transform(destinationProjection, sourceProjection);

                setTimeout(() => {

                    const features = geoJSONData.filter(geoJSONFeature => {

                        if (geoJSONFeature.geometry) {

                            const geoJSONGeometry = new GeoJSON().readGeometry(
                                geoJSONFeature.geometry
                            );
                            return drawGeometryEPSG4326.intersectsExtent(
                                geoJSONGeometry.getExtent()
                            );
                        } else {
                            console.warn('Invalid GeoJSON feature:', geoJSONFeature);
                            return false;
                        }
                    });

                    if (features.length > 0) {

                        const geoJsonFormat = new GeoJSON();
                        const featureslist = geoJsonFormat.readFeatures(
                            {
                                type: 'FeatureCollection',
                                features: features,
                            },
                            {
                                dataProjection: 'EPSG:4326',
                                featureProjection: 'EPSG:3857',
                            }
                        );

                        if (selectedProduct !== rootConfig.S1412WindDataLayerName) {
                            if (features[0].properties.producercode !== selectedAgencyCode && features[0].properties.country_code !== selectedCountry) {
                                showAlert('warning', 'Product filter', 'No results found.');
                                olMap.removeInteraction(drawInteraction);
                                olMap.getViewport().style.cursor = 'auto';
                                toggleGeometryButtons();
                                return;
                            }
                        }

                        vectorLayer.getSource().addFeatures(featureslist);

                        const uniqueChartData = features
                            .map(feature => {
                                feature.properties.layername = layerName;
                                if (selectedProduct === rootConfig.S1412WindDataLayerName) {
                                    const formatdate = new Date(selectedCalenderDate);
                                    const day = ('0' + formatdate.getDate()).slice(-2);
                                    const month = ('0' + (formatdate.getMonth() + 1)).slice(-2);
                                    const year = formatdate.getFullYear();
                                    const formattedDateString = `${day}-${month}-${year}`;
                                    feature.properties.Date = formattedDateString;
                                }
                                return feature.properties;
                            });

                        updateFeatureData(uniqueChartData, "productFilter", selectedProduct);
                        updateQueryType("productFilter");
                        toggleCollapsibleTablePanel(true);
                        toggleBottombar(true);
                        setOpen(false);
                    }
                    else {
                        showAlert('warning', 'Product filter', 'No results found.');
                    }
                    olMap.removeInteraction(drawInteraction);
                    olMap.getViewport().style.cursor = 'auto';
                    toggleGeometryButtons();
                }, 500);
            });

        } catch (error) {
            console.error('Error:', error);
        }
    };

    /* ---------------------------------------------------
       This funtionality is used to select the product..
       Note: 
       Here Product is nothing but layer like S-101,S-1412..etc
    --------------------------------------------------- */
    const handleChangeProduct = async (event) => {

        if (event.target.value !== 'select') {
            setShowCalendarDialog(false);
            const lyrName = event.target.value;

            var foundLayer = findImageLayerByTitle(olMap, lyrName);

            if (foundLayer) {
                var isVisible = foundLayer.getVisible();
                if (!isVisible) {
                    showAlert('warning', 'Product filter', `Layer preview is not available.`);
                    return;
                }
            }

            if (flag && featureData.length > 0) {
                handleshowGeometryClearDialog();
                setFlag(false);
            }
            setCalenderSelectedInfoSucess(false);

            toggleGeometryButtons();

            setCqlFilterString('include');
            updateSelectedProduct(lyrName);
            unableBtns(lyrName);
            clearSomeFields();
            updateLoaderValue(true);
            const agencyCodes = await fetchAgencyCodes(lyrName, olMap);
            updateLoaderValue(false);

            if (agencyCodes.length == 0) {
                if (lyrName !== rootConfig.S1412WindDataLayerName) {
                    showAlert('warning', 'Product filter', `No agency codes are available for ${lyrName}`);
                }
            }
            else {
                setAgencyCodeList(agencyCodes);
            }

            setFlag(true);
        } else {
            showAlert('warning', 'Product filter', 'Please select a product.');
        }
    };

    const clearSomeFields = () => {
        stopDrawAction(olMap);
        setSelectedAgencyCode('select');
        setSelectedCountry('select');
        setProductTypes([]);
        setSelectedProductTypes([]);
        setAgencyCodeList([]);
        setCountryList([]);
        /* for (let i = 0; i <= 4; i++) {
             clearVectorSource(olMap);
         }
         clearHighLightVectorData(olMap);*/
    }

    /* ---------------------------------------------------
       This funtionality is used to select a agency code and based on that fetching countrycode from geoserver
       Note: 
       Here agency code is nothing but CCG ..etc
       Here country code is nothing but CA IN..etc
    --------------------------------------------------- */

    const handleChangeAgencyCode = async (e) => {
        if (e.target.value === 'select') {
            showAlert('warning', 'Product filter', 'Please select an agency code.');
        } else {
            setSelectedAgencyCode('select');
            setSelectedCountry('select');
            setCountryList([]);
            setProductTypes([]);
            const agencyCode = e.target.value;
            setSelectedAgencyCode(agencyCode);
            const layerName = selectedProduct;
            updateLoaderValue(true);
            const countrycodes = await fetchCountryCodes(olMap, layerName, agencyCode);
            updateLoaderValue(false);

            if (countrycodes.length == 0) {
                showAlert('warning', 'Product filter', `No country codes are available for ${agencyCode}`);
            }
            else {
                setCountryList(countrycodes);
            }
        }
    };

    /* ---------------------------------------------------
    This funtionality is used to select a countrycode and based on that fetching product type from geoserver.
           Note: 
              Here country code is nothing but CA IN..etc
              Here product type is nothing but ENC PAPERCHARTS ..etc
    --------------------------------------------------- */

    const handleChangeCountry = async (e) => {

        if (e.target.value === 'select') {
            showAlert('warning', 'Product filter', 'Please select a country code.');
            SetEnableGeomertyContainer(enableGeomertyContainer);
        } else {
            setSelectedCountry('select');
            setProductTypes([]);
            const countryCode = e.target.value;
            setSelectedCountry(countryCode);
            const layerName = selectedProduct;
            updateLoaderValue(true);
            const producttypes = await fetchProductTypes(olMap, layerName, selectedAgencyCode, countryCode)
            updateLoaderValue(false);

            if (producttypes.length > 0) {

                setTimeout(() => {
                    enableGeomertyButtonsOnCountrySelection(countryCode);
                    setProductTypes(producttypes);
                }, 1500);
            }
            else {
                showAlert('warning', 'Product filter', `No product types are available for ${countryCode}`);
            }

            SetEnableGeomertyContainer(!enableGeomertyContainer);
        }
    };

    /* ---------------------------------------------------
       This function handles the click event when a product type button is clicked.
    --------------------------------------------------- */

    const handleProductTypeClick = async (productType) => {
        const productTypeBtn = document.getElementById(productType);
        if (productTypeBtn != null && productTypeFlag === true) {
            productTypeBtn.classList.add('active');
            productTypeFlag = false;
        } else {
            productTypeFlag = true;
            productTypeBtn.classList.remove('active');
        }
        updateLoaderValue(true);
        const navUsageBands = await fetchNavUsageBands(olMap, selectedProduct, selectedAgencyCode, selectedCountry, productType);
        updateLoaderValue(false);

        if (navUsageBands) {
            setbands(navUsageBands);
            activeBands(true, 'encUsageBands');
        }
        else {
            showAlert('warning', 'Product filter', `No nav bands are available for ${productType}`);
        }

        deactiveGeometryBtns();
        activeUsageBandsCheckBox();
        setSelectedProductTypes([]);

        if (selectedProductTypes.includes(productType)) {
            setSelectedProductTypes(
                selectedProductTypes.filter(type => type !== productType)
            );
        } else {
            setSelectedProductTypes([...selectedProductTypes, productType]);
        }
    };

    /* ---------------------------------------------------
       This function handles the "Select All" checkbox change event for a specific type of layers.
     --------------------------------------------------- */

    const handleOnSelectAll = (e, type) => {
        const { checked } = e.target;
        activeBands(checked, type);
    };

    const activeBands = (checked, type) => {
        const { filterString, newbands } = handleSelectAllToggle(checked, type, olMap, bands, selectedProduct, selectedAgencyCode)
        setCqlFilterString(filterString);
        setbands(h => ({ ...h, [type]: newbands }));
    }

    /* ---------------------------------------------------
    This function handles the change event when a checkbox is clicked for a specific band.
    --------------------------------------------------- */
    const handleOnChange = (event, type) => {
        const { filterString, newbands } = handleBandToggle(event, type, olMap, bands, selectedAgencyCode, selectedProduct);
        setbands(h => ({ ...h, [type]: newbands }));
        setCqlFilterString(filterString);
    };

    /* ---------------------------------------------------
    This function sets up the map for drawing LineString geometry and updates button states
    --------------------------------------------------- */

    const handleDrawLine = () => {
        setLineButtonActive(true);
        setPolygonButtonActive(false);
        setPointButtonActive(false);
        setRtzButtonActive(false);

        selectGeometryFeature('LineString',
            {
                color: 'rgba(0, 0, 255, 0.3)',
                // Blue color for vector layer fill
            },
            {
                color: 'rgba(0, 0, 0, 1)',
                // Black stroke color for vector layer
                width: 2,
            }
        );
    };

    /* ---------------------------------------------------
    This function sets up the map for drawing Polygon geometry and updates button states
    --------------------------------------------------- */

    const handleDrawPolygon = () => {
        setLineButtonActive(false);
        setPolygonButtonActive(true);
        setPointButtonActive(false);
        setRtzButtonActive(false);
        selectGeometryFeature('Polygon',
            {
                color: 'rgba(14, 183, 142, 0.3)',
                // Green color for vector layer fill
            },
            {
                color: 'rgba(0, 0, 0, 0.7)',
                // Black stroke color for vector layer
                width: 3,
            }
        );
    };

    /* ---------------------------------------------------
    This function sets up the map for drawing Point geometry and updates button states
    --------------------------------------------------- */

    const handleDrawPoint = () => {
        setLineButtonActive(false);
        setPolygonButtonActive(false);
        setPointButtonActive(true);
        setRtzButtonActive(false);

        selectGeometryFeature('Point',
            {
                color: 'rgba(255, 0, 0, 0.1)',
                // Red color for vector layer fill
            },
            {
                color: 'rgba(0, 0, 0, 1)',
                // Black stroke color for vector layer
                width: 3,
            }
        );
    };

    /* ---------------------------------------------------
     This function handles the button click event for activating the RTZ file upload.
    --------------------------------------------------- */

    const handleRtzFileClick = () => {
        // Deactivate other drawing buttons.
        setLineButtonActive(false);
        setPolygonButtonActive(false);
        setPointButtonActive(false);
        setRtzButtonActive(true);
        updateLoaderValue(true);

        if (fileInputRef.current !== null) {
            stopDrawAction(olMap);
            /*clearVectorSource(olMap);
            clearHighLightVectorData(olMap);*/
            fileInputRef.current.click();
        }
        updateLoaderValue(false);
    };

    /* ---------------------------------------------------
    This function handles the change event when a user selects an RTZ file.
    --------------------------------------------------- */
    const handleFileChange = (event) => {

        const file = event.target.files[0];

        if (cqlFilterString === 'UnSelectedAll') {
            showAlert('warning', 'Product filter', 'Kindly select the usage band.');
            updateLoaderValue(false);
            return;
        }
        event.target.value = null;
        setTimeout(async () => {
            updateLoaderValue(true);

            const data = await processRTZFile(file, olMap, showAlert, selectedProduct, cqlFilterString, selectedCalenderDate);
            if (data.length > 0) {
                if (selectedProduct != rootConfig.S1412WindDataLayerName) {
                    const firstObject = data[0];
                    const agencyCode = firstObject.producercode;
                    const countryCode = firstObject.country_code;

                    if (agencyCode === selectedAgencyCode && countryCode === selectedCountry) {
                        updateFeatures(data);
                    }
                    else {
                        showAlert('warning', 'Product filter', `Selected RTZ file coordinates are not available at ${selectedCountry} location.`);
                    }
                } else {
                    updateFeatures(data);
                }
            }else{
                updateLoaderValue(false);
            }
        }, 3500);
        updateLoaderValue(false);
    };

    const updateFeatures = (data) => {
        updateFeatureData(data, "productFilter", selectedProduct);
        updateQueryType("productFilter");
        setRtzButtonActive(false);

        setTimeout(() => {
            toggleCollapsibleTablePanel(true);
            toggleBottombar(true);
        }, 1000);
        setFlag(true);
        updateLoaderValue(false);

    }

    const handleOpenCalendar = async (event) => {
        event.preventDefault();
        setTarget(event.target);
        setShowCalendarDialog(true);
        const attributeValue = 'time';
        const layerName = selectedProduct;
        const geoserverQueryLayerUrl = getQueryLayerUrl(layerName, olMap);

        updateLoaderValue(true);
        const dates = await GetAttributeValueDataFromGeoServer(olMap, serverPort, geoserverQueryLayerUrl, layerName, attributeValue);
        if (dates.length > 0) {
            setS1412DataSetDates(dates);
        }
        updateLoaderValue(false);
    };

    const handleCalendarChange = async (selectedDate) => {

        if (selectedDate instanceof Date && !isNaN(selectedDate)) {

            let isSelectedDate = selectedDate;
            updateLoaderValue(true);
            updateSelectedCalenderDate(isSelectedDate);

            const response = await RunSailTimerApi(initialCoordinates.left, initialCoordinates.top, initialCoordinates.right,
                initialCoordinates.bottom, isSelectedDate, olMap, serverPort, 'productFilter');
            if (response.data === 'Datetime of request is in the past') {
                showAlert('warning', 'Product filter', `No sail timer data available for selected date.`);
                setlineButtonVisible(false);
                setPolygonButtonVisible(false);
                setPointButtonVisible(false);
                setRtzButtonVisible(false);
                setCalenderSelectedInfoSucess(false);
            }
            else if (response.status === 200) {
                setCalenderSelectedInfoSucess(true);
                setlineButtonVisible(true);
                setPolygonButtonVisible(true);
                setPointButtonVisible(true);
                setRtzButtonVisible(true);
            }
            setShowCalendarDialog(false);
            updateLoaderValue(false);
        } else {
            console.error('Invalid date:', selectedDate);
        }
    };

    const handleCloseClearModal = () => {
        setShowClearModal(false);

    }
    const handleShowClearModal = () => {
        setShowClearModal(true);
    }

    const handleshowGeometryClearDialog = () => {
        setShowGeometryClearDialog(true)
    }
    const handleCloseGeometryClearDialog = () => {
        setShowGeometryClearDialog(false);
    }

    const deactiveGeometryBtns = () => {
        setLineButtonActive(false);
        setPolygonButtonActive(false);
        setPointButtonActive(false);
        setRtzButtonActive(false);
    }

    const clearSource = () => {
        if (flag === true) {
            setFlag(false);
        }
        clearFeatureData();
        for (let i = 0; i <= 4; i++) {
            clearVectorSource(olMap);
        }
        clearHighLightVectorData(olMap)
    }

    const handleProductFilterBtnClick = (buttonId) => {
        setActiveControlButton(buttonId);
        toggleSidebar(true);
        toggleLayersSidebar(false);
        toggleFeatureInfoSidebar(false);
        toggleBaseMapOverLayPanel(false);
        toggleAttributeQueryOverLayPanel(false);
        toggleMeasureOverLayPanel(false);
        toggleFeatureInfoFlag(false);
        unregisterClickHandlers(olMap, 'productFilter');
        updateZoomWindowButtonActive(false);
        removeZoomWindowFunctionality(olMap);
        deactiveAttributeQueryActivities();
        toggleCollapsibleTablePanel(false);
        clearFeatureSearchResults();
        updateSearchInputloading(false);
        updateSelectedOpt(null);
    };

    const handleClear = () => {
        if (flag === true) {
            setFlag(false);
        }
        activeBands(true, 'encUsageBands');

        toggleBottombar(false);
        makeInitialState();
        setlineButtonVisible(false);
        setPolygonButtonVisible(false);
        setPointButtonVisible(false);
        setRtzButtonVisible(false);
        setCalenderBtnVisible(false);
        enableGeomertyButtonsOnCountrySelection('select')
        for (let i = 0; i <= 4; i++) {
            clearVectorSource(olMap);
        }
        clearRtZFileCoordinates();
    };

    const handleCloseSideBar = () => {
        toggleBottombar(false);
        clearFeatureData();
        toggleSidebar(false);
        toggleLayersSidebar(false);
        toggleFeatureInfoSidebar(false);
        stopDrawAction(olMap);
        for (let i = 0; i <= 4; i++) {
            clearVectorSource(olMap);
        }
        clearRtZFileCoordinates();
    }

    const makeInitialState = () => {
        updateSelectedProduct('select');
        setSelectedCountry('select');
        setSelectedAgencyCode('select');
        toggleBottombar(false);
        stopDrawAction(olMap);
        setTarget(null);
        setCountryList([]);
        setProductTypes([]);
        setSelectedProductTypes([]);
        setAgencyCodeList([]);
        deactiveGeometryBtns();
        clearFeatureData();
        toggleCollapsibleTablePanel(false);
    }

    const unableBtns = (lyrName) => {
        if (lyrName === 'S-101') {
            setlineButtonVisible(false);
            setPolygonButtonVisible(false);
            setPointButtonVisible(false);
            setRtzButtonVisible(false);
            setCalenderBtnVisible(false);
        } else {
            setCalenderBtnVisible(true);
            setlineButtonVisible(false);
            setPolygonButtonVisible(false);
            setPointButtonVisible(false);
            setRtzButtonVisible(false);
        }
    }

    const enableGeomertyButtonsOnCountrySelection = (value) => {
        if (value === 'select') {
            setlineButtonVisible(false);
            setPolygonButtonVisible(false);
            setPointButtonVisible(false);
            setRtzButtonVisible(false);
        }
        else {
            setlineButtonVisible(true);
            setPolygonButtonVisible(true);
            setPointButtonVisible(true);
            setRtzButtonVisible(true);
            setCalenderBtnVisible(false);
        }
    }

    const toggleGeometryButtons = () => {
        setLineButtonActive(false);
        setPolygonButtonActive(false);
        setPointButtonActive(false);
        setRtzButtonActive(false);
    }

    return (
        <>
            <div id='productFilterContainer' style={containerStyle}>
                <StyledMapControlButton title={title} id={title} className='p-1 mb-1' onClick={() => handleProductFilterBtnClick(title)} active={activeControlButton === title} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}><i className="bi bi-funnel" /></StyledMapControlButton>
                <button ref={deleteProductFilterButtonRef} onClick={handleDelete} className="btn-sm btn btn-danger" id="productFilterDeletebutton" style={deleteButtonStyle}>
                    <i className="bi bi-x-lg"></i>
                </button>
                <MyModal show={showModal} title='Product filter' content={modalContent} onHide={handleCloseModal} onSaveChanges={handleDeleteSuccessorError} />
            </div>
            <div id='productFilterSideBar' className={`sidebar ${sideBarVisible ? 'active' : ''}`} style={{ height: `${sidebarHeight}px`, top: `${sidebarTop}px`, overflow: 'hidden', backgroundColor: cardbodyColor, border: `1px solid ${borderColor}` }}>
                <Card id='popup-content' style={{ borderColor: borderColor, minHeight: '500px' }}>
                    <Card.Header className='pe-2' style={{ backgroundColor, color: textColor, borderColor, fontFamily }}>
                        <Stack direction='horizontal'>
                            <div className='mb-0'><i className='bi bi-funnel me-2'></i>Query</div>
                            <CloseButtonWrapper onClick={handleCloseSideBar} ref={popupCloserRef} id='popup-closer' className='ms-auto'><i className='bi bi-x'></i></CloseButtonWrapper>
                        </Stack>
                    </Card.Header>
                    <Card.Body style={{ position: 'relative', maxHeight: `calc(${sidebarHeight}px - 105px)`, height: 'auto', minHeight: '100px', overflow: 'auto' }}>
                        {isLoading && (
                            <StyledLoaderWraper>
                                <StyledLoaderInner />
                            </StyledLoaderWraper>
                        )}
                        <div className='filterPanel'>
                            <div style={{ fontFamily: fontFamily }}>
                                <Form>
                                    <Row className='mx-0 mt-3'>
                                        <Col sm={12} className='px-0'>
                                            <Form.Group controlId='productSelection'>
                                                <Form.Select as='select' custom value={selectedProduct} onChange={handleChangeProduct} style={{ color: typoColor, borderColor }}>
                                                    <option value='select'>Select a Product</option>
                                                    {productList && productList.map((item, index) => <option key={index} value={item}>{item}</option>)}
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Form>
                                {<div>
                                    {agencyCodeList.length > 0 && (
                                        <Form>
                                            <Row className='mx-0 mt-3'>
                                                <Col sm={12} className='px-0'>
                                                    <Form.Group>
                                                        <Form.Select title='Agency Code' value={selectedAgencyCode} style={{ borderColor, color: typoColor }} onChange={e => handleChangeAgencyCode(e)}>
                                                            <option key='default' value='select'>Select a Agency code</option>
                                                            {agencyCodeList && agencyCodeList.map(option => <option key={option} value={option}>{option}</option>)}
                                                        </Form.Select>
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        </Form>
                                    )}
                                    {countryList.length > 0 && (<Form>
                                        <Row className='mx-0 mt-3'>
                                            <Col sm={12} className='px-0'>
                                                <Form.Select title='Country' value={selectedCountry} style={{ borderColor, color: typoColor }} onChange={e => handleChangeCountry(e)}>
                                                    <option key='default' value='select'>Select a Country</option>
                                                    {countryList && countryList.map(option => <option key={option} value={option}>{option}</option>)}
                                                </Form.Select>
                                            </Col>
                                        </Row>
                                    </Form>)}
                                </div>
                                }
                                {selectedProduct !== rootConfig.S1412WindDataLayerName && productTypes.length > 0 &&
                                    productTypes.map((productType, index) => {
                                        return (
                                            <StyledButton key={index} className={`mt-3`} onClick={() => handleProductTypeClick(productType)} id={productType}>{productType}</StyledButton>
                                        );
                                    })}

                                {selectedProduct !== rootConfig.S1412WindDataLayerName &&
                                    selectedProductTypes.length > 0 &&
                                    selectedProductTypes.map(type => (
                                        <>
                                            <div className='mt-3' style={{ fontFamily: fontFamily }}>
                                                <h6 className="rounded-top p-2 mb-0 border-bottom-0" style={{ color: textColor, backgroundColor: backgroundColor, border: `1px solid ${borderColor}` }}>{`${type} Usage Bands`}</h6>
                                                <UsageBands options={bands.encUsageBands} type='encUsageBands' bands={bands} handleOnChange={handleOnChange} handleOnSelectAll={handleOnSelectAll} backgroundColor={backgroundColor} />
                                            </div>
                                        </>
                                    ))}
                            </div>

                            <Stack direction="horizontal" ref={columnRef} className='mt-3'>
                                <div className="p-0">
                                    <ButtonGroup className='mt-0'>
                                        <StyledButton title='Line' id="btn-LineString" onClick={handleDrawLine} active={lineButtonActive} className={`drawBtn ${lineButtonActive ? 'active' : ''} ${lineButtonVisible ? '' : 'disabled'}`}>
                                            <i className="bi bi-activity"></i>
                                        </StyledButton>
                                        <StyledButton title='Polygon' id="btn-Polygon" onClick={handleDrawPolygon} active={polygonButtonActive} className={`drawBtn ${polygonButtonActive ? 'active' : ''} ${polygonButtonVisible ? '' : 'disabled'}  `}>
                                            <i className="bi bi-pentagon"></i>
                                        </StyledButton>
                                        <StyledButton title='Point' id="btn-Point" onClick={handleDrawPoint} active={pointButtonActive} className={`drawBtn ${pointButtonActive ? 'active' : ''} ${pointButtonVisible ? '' : 'disabled'}`}>
                                            <i className="bi bi-geo-fill"></i>
                                        </StyledButton>
                                        <input ref={fileInputRef} type='file' accept='.rtz' onChange={handleFileChange} style={{ display: 'none' }} />
                                        <StyledButton title='rtz' id='btn-Rtz' onClick={handleRtzFileClick} active={rtzButtonActive} className={`drawBtn ${rtzButtonActive ? 'active' : ''} ${rtzButtonVisible ? '' : 'disabled'}`}>
                                            <i className='bi bi-upload' />
                                        </StyledButton>
                                    </ButtonGroup>
                                </div>
                                <div className="p-0 ms-auto">
                                    <StyledButton title='Calendar' className={`${calenderBtnVisible ? '' : 'disabled'}`} id="btn-Calender" onClick={handleOpenCalendar} style={{ backgroundColor, color: textColor, borderColor }}>
                                        <i className='bi bi-calendar'></i>
                                    </StyledButton>
                                    <Overlay show={showCalendarDialog} target={target} placement='bottom' container={columnRef}>
                                        <Popover id='popover-contained'>
                                            <Popover.Body className='p-0'>
                                                <Calendar selectedDate={selectedCalenderDate} dynamicDates={S1412DataSetDates} handleCalendarChange={handleCalendarChange} />
                                            </Popover.Body>
                                        </Popover>
                                    </Overlay>
                                </div>
                            </Stack>
                            {calenderSelectedInfoSucess && selectedProduct == rootConfig.S1412WindDataLayerName && <p>Now you can select the windmap grids by using spatial query</p>}
                        </div>
                    </Card.Body>
                    <Card.Footer className='text-end' style={{ borderColor: borderColor, fontFamily: fontFamily }}>
                        {selectedProduct != 'select' && <StyledButton id="btn-Clear" onClick={handleShowClearModal}>Clear</StyledButton>}
                    </Card.Footer>
                </Card>
                <MyModal show={showClearModal} title='Product filter' content={modalContentClear} onHide={handleCloseClearModal} onSaveChanges={() => { handleClear() }} />
                <MyModal show={showGeometryClearDialog} title='Product filter' content={modalContentClear} onHide={handleCloseGeometryClearDialog} onSaveChanges={() => { clearSource() }} />
            </div>
        </>
    );
}

export default ProductFilters;