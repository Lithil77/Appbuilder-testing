import React, { useEffect, useState, useContext, useRef } from 'react'
import { OLMapContext } from "../OLMap";
import { Table, Card, Stack, Container } from "react-bootstrap";
import useMapButtonLogic from '../../../CustomHooks/useMapButtonControl';
import MyModal from '../../General/Modal';
import config from "../../../utils/ApplicationTitleConfig";
import ImageWMS from "ol/source/ImageWMS.js";
import ImageLayer from "ol/layer/Image.js";
import { useColor } from "../../../CustomContext/ColorContext";
import { useParams } from 'react-router-dom';
import { renderHighlightedFeatures, clearVectorSource, stopDrawAction } from "../../../Openlayers/MapLayerManager.js";
import rootConfig from '../../../ExternalUrlConfig.json';
import axios from 'axios';
import { StyledMapControlButton, StyledReactPaginateComp } from '../../../CustomHooks/CustomStyledComponents.js';
import CloseButtonWrapper from '../../../CustomHooks/closeButton.js';
import { OverLayPanelContext } from '../../../CustomContext/OverLayContext.js';
import { SidebarContext } from '../../../CustomContext/SidebarContext.js';
import Pagination from 'react-bootstrap/Pagination';
import projectTitle from '../../../utils/ApplicationTitleConfig.js'

var serverPort = null;

function FeatureInfo() {

    const [title] = useState('FeatureInfo');
    var FeatureInfoButton = document.getElementById('featureinfobutton');
    var mapContainer = document.getElementById('map-container');

    const {
        featureInfoFlag, toggleFeatureInfoFlag,
        toggleBaseMapOverLayPanel,
        toggleMeasureOverLayPanel, toggleAttributeQueryOverLayPanel,
        registerClickHandler, unregisterClickHandlers, 
        updateZoomWindowButtonActive,removeZoomWindowFunctionality,clearFeatureData,deactiveAttributeQueryActivities
    } = useContext(OverLayPanelContext);

    const { toggleSidebar, toggleLayersSidebar, sideBarFeatureInfoVisible, toggleFeatureInfoSidebar } = useContext(SidebarContext);

    const olMap = useContext(OLMapContext);
    const { projectId } = useParams();
    const { backgroundColor, textColor, borderColor, typoColor, cardbodyColor, fontFamily } = useColor();

    const deleteFeatureInfoButtonRef = useRef(null);

    const [uniqueFeatureRecords, setUniqueFeatureRecords] = useState([]);
    const [featuresGeometry, setFeaturesGeometry] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalContent] = useState('Are you sure you want to delete the feature information component ?');

    const {
        handleMouseEnter, handleMouseLeave, handleDelete, handleDeleteSuccessorError,
        handleCloseModal, deleteButtonStyle, containerStyle, } =
        useMapButtonLogic({
            projectId: projectId,
            title: title,
            deleteButtonRef: deleteFeatureInfoButtonRef,
            setShowModal
        });

    const [layerName, setLayerName] = useState(null);
    const hasHeader = projectTitle?._data?.Header;
    const hasFooter = projectTitle?._data?.Footer;
    const [columns, setColumns] = useState([]);
    const recordsPerPage = 1;
    const [currentPage, setCurrentPage] = useState(1);
    const lastIndex = currentPage * recordsPerPage;
    const firstIndex = lastIndex - recordsPerPage;
    const [records, setRecords] = useState([]);
    const numberOfPages = Math.ceil(uniqueFeatureRecords.length / recordsPerPage);
    const pageNumbers = Array.from({ length: numberOfPages }, (_, i) => i + 1);


    const [sidebarHeight, setSidebarHeight] = useState(0);
    const [sidebarTop, setSidebarTop] = useState(0);

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

    useEffect(() => {

        if (FeatureInfoButton && olMap) {
            const featureInfoContainer = document.getElementById('featureInfoContainer');
            if (featureInfoContainer != null) {
                FeatureInfoButton.append(featureInfoContainer);
            }
        }

    }, [olMap, FeatureInfoButton]);

    useEffect(() => {

        if (mapContainer && olMap) {
            const featureInfoBox = document.getElementById('featureInfoBox');
            if (featureInfoBox != null) {
                mapContainer.append(featureInfoBox);
            }
        }

    }, [olMap, mapContainer]);


    useEffect(() => {
        setCurrentPage(1);
        if (uniqueFeatureRecords.length > 0) {
            setColumns(Object.keys(uniqueFeatureRecords[0]));
            var data = uniqueFeatureRecords.slice(firstIndex, lastIndex);
            setRecords(data);
        } else {
            setColumns([]);
        }
    }, [uniqueFeatureRecords]);


    useEffect(() => {
        if (config?._data?.PortID !== undefined && config._data.PortID !== "") {
            serverPort = config?._data?.PortID
        }
    }, [serverPort]);

    const handleGetFeaures = () => {

        let featureInfoBtn = document.getElementById("featureInfoBtn");

        if (featureInfoBtn) {
            featureInfoBtn.classList.add('active');
        }
        stopDrawAction(olMap);
        toggleAttributeQueryOverLayPanel(false);
        toggleBaseMapOverLayPanel(false);
        toggleMeasureOverLayPanel(false);
        toggleSidebar(false);
        toggleLayersSidebar(false);
        deactiveAttributeQueryActivities();

        if (featureInfoFlag === false) {
            setRecords([]);
            olMap.getTargetElement().style.cursor = 'pointer';
            registerClickHandler('click', handleMapClick, olMap);
            toggleFeatureInfoFlag(true);
            toggleFeatureInfoSidebar(true);
            updateZoomWindowButtonActive(false);
            removeZoomWindowFunctionality(olMap);
            const tooltipStatic = document.querySelectorAll(".ol-tooltip-static");

            if (tooltipStatic) {
                tooltipStatic.forEach(tooltip => {
                    tooltip.style.display = "none";
                });
            }
            clearFeatureData();
            for (let i = 0; i < 3; i++) {
                clearVectorSource(olMap);
            }

        } else {
            if (featureInfoBtn) {
                featureInfoBtn.classList.remove('active');
            }

            olMap.getTargetElement().style.cursor = 'default';
            unregisterClickHandlers(olMap, 'featureInfo');
            toggleFeatureInfoFlag(false);
            toggleFeatureInfoSidebar(false);
        }
    }

    const handleMapClick = (event) => {
        stopDrawAction(olMap);
        clearVectorSource(olMap);
        clearVectorSource(olMap);
        setRecords([]);
        setUniqueFeatureRecords([]);
        var allfeaturesList = [];
        var layers = olMap.getLayers().getArray();

        layers.forEach(async function (lyr) {

            if (lyr instanceof ImageLayer && lyr.getSource() instanceof ImageWMS) {
                if (lyr.getVisible() === true) {
                    var viewResolution = (
                        event.target.getView().getResolution()
                    );
                    var featureUrl = lyr
                        .getSource()
                        .getFeatureInfoUrl(event.coordinate, viewResolution, "EPSG:3857", {
                            INFO_FORMAT: "application/json",
                            FEATURE_COUNT: 20
                        });

                    if (featureUrl) {
                        const queryParams = { param: featureUrl };
                        const dynamicUrl = (serverPort === rootConfig.AppBuilderPort) ? `${rootConfig["app-builder-NodeServerUrl"]}/api/getFeatures` : `${rootConfig["downloaded-app-ServerUrl"]}/api/getFeatures`;
                        try {

                            setTimeout(async () => {
                                const res = await axios.get(dynamicUrl, { params: queryParams });
                                if (res.data.features) {
                                    let lyrTitle = lyr.get('title');
                                    setFeaturesGeometry(res.data.features);
                                    for (let index = 0; index < res.data.features.length; index++) {
                                        let properties = res.data.features[index].properties;
                                        properties.layerName = lyrTitle;
                                        allfeaturesList.push(properties);
                                    }
                                }

                                if (allfeaturesList.length > 0) {
                                    setUniqueFeatureRecords(allfeaturesList);
                                    setLayerName(allfeaturesList[0].layerName);
                                    const vectorLayer = renderHighlightedFeatures(res.data);
                                    /*var extent = vectorLayer.getSource().getExtent();
                                    olMap.getView().fit(extent, {
                                        padding: [250, 250, 350, 250], minResolution: 10,
                                        duration: 1000
                                    });*/
                                    olMap.addLayer(vectorLayer);
                                }

                            }, 500);


                        } catch (error) {
                            console.error('Error fetching features:', error);
                        }
                    }
                }
            }
        });

        /* ---------------------------------------------------
        This funtionality is used to add features to map overlay
        --------------------------------------------------- */

        /*setTimeout(() => {

            if (allfeaturesList.length > 0) {
                setUniqueFeatureRecords(allfeaturesList);
                setLayerName(allfeaturesList[0].layerName);
                 var lonlat = olProj.transform(event.coordinate, 'EPSG:3857', 'EPSG:4326');
                 var lon = lonlat[0];
                 var lat = lonlat[1];
                 olMap.getView().setCenter(olProj.transform([lon, lat], 'EPSG:4326', 'EPSG:3857'));
            }

        }, 500)*/
    };

    const renderPageNumbers = () => {
        const visiblePages = 4;
        const middleIndex = Math.floor(visiblePages / 2);

        if (numberOfPages <= visiblePages) {
            return pageNumbers.map((n) => (
                <Pagination.Item key={n} active={currentPage === n} onClick={() => changeCurrentPage(n)}>
                    {n}
                </Pagination.Item>
            ));
        } else {
            let pagesToDisplay = [];

            if (currentPage <= middleIndex) {
                pagesToDisplay = [...pageNumbers.slice(0, visiblePages), 'ellipsis', numberOfPages];
            } else if (currentPage > numberOfPages - middleIndex) {
                pagesToDisplay = [1, 'ellipsis', ...pageNumbers.slice(-visiblePages)];
            } else {
                pagesToDisplay = [
                    1,
                    'ellipsis',
                    ...pageNumbers.slice(currentPage - middleIndex, currentPage + middleIndex - 1),
                    'ellipsis',
                    numberOfPages
                ];
            }

            return pagesToDisplay.map((page, index) => (
                <React.Fragment key={index}>
                    {page === 'ellipsis' ? (
                        <Pagination.Ellipsis />
                    ) : (
                        <Pagination.Item active={currentPage === page} onClick={() => changeCurrentPage(page)}>
                            {page}
                        </Pagination.Item>
                    )}
                </React.Fragment>
            ));
        }
    };

    const handleCloseSideBar = () => {
        handleGetFeaures();
    }


    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= numberOfPages) {
            setCurrentPage(newPage);

            const startIndex = (newPage - 1) * recordsPerPage;
            const endIndex = startIndex + recordsPerPage;
            const newRecords = [];

            for (let i = startIndex; i < endIndex && i < uniqueFeatureRecords.length; i++) {
                newRecords.push(uniqueFeatureRecords[i]);
            }

            setRecords(newRecords);
            const newColumns = Object.keys(newRecords[0] || {});
            setColumns(newColumns);

            if (newRecords.length > 0) {
                const updatedLayerName = newRecords[0].layerName;
                setLayerName(updatedLayerName);
            }

            if (featuresGeometry.length > 0) {
                const data = featuresGeometry[newPage - 1];
                if (data) {
                    clearVectorSource(olMap);
                    clearVectorSource(olMap);
                    const vectorLayer = renderHighlightedFeatures(data);
                    var extent = vectorLayer.getSource().getExtent();
                    olMap.getView().fit(extent, {
                        padding: [180, 180, 350, 180], minResolution: 10,
                        duration: 1000
                    });
                    olMap.addLayer(vectorLayer);
                }
            }
        }
    };

    const prePage = () => {
        handlePageChange(currentPage - 1);
    };

    const changeCurrentPage = (page) => {
        handlePageChange(page);
    };

    const nextPage = () => {
        handlePageChange(currentPage + 1);
    };

    return (
        <>
            <div id='featureInfoContainer' style={containerStyle}>
                <StyledMapControlButton
                    title={title} id='featureInfoBtn'
                    className='p-1 mb-1'
                    onClick={handleGetFeaures}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <i className="bi bi-info-circle" />
                </StyledMapControlButton>
                <button ref={deleteFeatureInfoButtonRef} onClick={handleDelete} className="btn-sm btn btn-danger" id="featureInfoDeletebutton" style={deleteButtonStyle}>
                    <i className="bi bi-x-lg"></i>
                </button>
            </div>

            <div id='featureInfoBox' className={`sidebar ${sideBarFeatureInfoVisible ? 'active' : ''}`} style={{ height: `${sidebarHeight}px`, top: `${sidebarTop}px`, overflow: 'hidden', border: `1px solid ${borderColor}` }}>
                {records && records.length > 0 ? (<Card id='popup-content' style={{ borderColor: borderColor, minHeight: '800px' }}>
                    <Card.Header className="pe-1" style={{ backgroundColor: backgroundColor, color: textColor }}>
                        <Stack direction="horizontal">
                            <i className="bi bi-info-circle me-2"></i>
                            {records.length > 0 && <h6 className="mb-0">{layerName !== null && layerName}</h6>}
                            <CloseButtonWrapper onClick={handleCloseSideBar} id="popup-closer" className="ms-auto"><i className="bi bi-x"></i></CloseButtonWrapper>
                        </Stack>
                    </Card.Header>
                    <Card.Body className="p-0" style={{ position: 'relative', maxHeight: `calc(${sidebarHeight}px - 105px)`, height: 'auto', minHeight: '100px', overflow: 'auto' }}>
                        <Table responsive className="table table-striped featureinfoTable">
                            <tbody>
                                {
                                    records && records.map((item, index) => (
                                        columns.map((column, columnIndex) => (
                                            <tr key={columnIndex}>
                                                <th style={{ width: '56%' }}>{column}</th>
                                                <td style={{ width: '44%' }}>
                                                    {item[column] &&
                                                        (typeof item[column] === "object" ? (
                                                            // If it's an object, render its properties
                                                            Object.entries(item[column]).map(([key, value]) => (
                                                                <div key={key}>
                                                                    <strong>{key}:</strong> {value}
                                                                </div>
                                                            ))
                                                        ) : (
                                                            // Otherwise, render the value directly50
                                                            item[column]
                                                        ))}
                                                </td>
                                            </tr>
                                        ))
                                    ))}
                            </tbody>
                        </Table>
                    </Card.Body>
                    <Card.Footer className="px-1" style={{ borderColor: borderColor, fontFamily: fontFamily }}>
                        <Container className='px-0'>
                            <nav style={{ overflow: 'auto' }}>
                                <StyledReactPaginateComp className='mb-0 justify-content-center'>
                                    <Pagination.Prev onClick={prePage} />
                                    {renderPageNumbers()}
                                    <Pagination.Next onClick={nextPage} />
                                </StyledReactPaginateComp>
                            </nav>
                        </Container>
                    </Card.Footer>
                </Card>) : (
                    <Card>
                        <Card.Header className="pe-1" style={{ backgroundColor: backgroundColor, color: textColor }}>
                            <Stack direction='horizontal'>
                                <div className='mb-0'>
                                    <i className="bi bi-info-circle me-2"></i>
                                    Feature information</div>
                                <CloseButtonWrapper onClick={handleCloseSideBar} id='popup-closer' className='ms-auto'><i className='bi bi-x'></i></CloseButtonWrapper>
                            </Stack>
                        </Card.Header>
                        <Card.Body>
                            <h6>Please Select feature on the map to see the information.</h6>
                        </Card.Body>
                    </Card>
                )}
                <MyModal
                    show={showModal}
                    title="Feature information"
                    content={modalContent}
                    onHide={handleCloseModal}
                    onSaveChanges={handleDeleteSuccessorError}
                />
            </div>
        </>
    );
}

export default FeatureInfo;