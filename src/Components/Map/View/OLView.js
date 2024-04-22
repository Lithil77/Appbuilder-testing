import React, { useEffect, useRef, useContext, useState } from 'react';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { Container, Card, Button, Collapse, Stack, Accordion, Form, ListGroup } from 'react-bootstrap';
import { OLMapContext } from "../OLMap.js";
import layersConfig from "../../../utils/LayersData.js";
import { useColor } from '../../../CustomContext/ColorContext.js';
import { SidebarContext } from '../../../CustomContext/SidebarContext.js';
import { addWMSLayerToMap } from "../../../Openlayers/MapLayerManager.js";
import { clearImageSource } from "../../../Openlayers/MapLayerManager.js";
import projectTitle from '../../../utils/ApplicationTitleConfig.js'
import CloseButtonWrapper from '../../../CustomHooks/closeButton.js';
import ComponentService from '../../../Services/ComponentService.js';
import FetchClient from '../../../ServiceClients/FetchClient.js';
import rootConfig from '../../../ExternalUrlConfig.json';
import MyModal from '../../General/Modal.js';
import { useParams } from 'react-router-dom';
import { useAlert } from '../../../CustomContext/AlertContext.js';
import config from "../../../utils/ApplicationTitleConfig.js";
import { StyledMapControlButton }
    from '../../../CustomHooks/CustomStyledComponents.js';
import { getLayerExtent } from "../../../GeoServer/GetLayerExtent.js"
import { OverLayPanelContext } from '../../../CustomContext/OverLayContext';
import CollapsibleTable from '../utils/CollapsibleTable.js';
import { StyledButton } from '../../../CustomHooks/CustomStyledComponents';
import { ShimmerButton } from 'react-shimmer-effects';
import { useMapControlMenuButton } from '../../../CustomContext/MapControlMenuButtonContext.js';

function MapControlMenu() {
    const [open, setOpen] = useMapControlMenuButton();
    const [shimmerloading, setShimmerloading] = useState(true);
    const toggleOpen = () => {
        setOpen(!open); // Ensure setOpen is properly defined
    };
    useEffect(() => {

        const delay = setTimeout(() => {
            setShimmerloading(false);
        }, 1000);
        return () => clearTimeout(delay);

    }, []);
    return (
        <div>
            <div style={{ position: 'relative' }} className='text-center'>
                {shimmerloading ? (
                    <ShimmerButton />
                ) : (
                    <StyledButton
                        onClick={toggleOpen}
                        aria-controls="navbarScroll"
                        aria-expanded={open}
                        className='mx-1 menuButton'
                        style={{ zIndex: '99' }}
                    >
                        <i className="bi bi-list"></i>
                    </StyledButton>
                )}
                <Collapse in={open}>
                    <ListGroup className='mt-1'>
                        <ListGroup.Item id="homebutton" className='p-0 border-0' style={{ backgroundColor: 'transparent' }}></ListGroup.Item>
                        <ListGroup.Item id="zoominbutton" className='p-0 border-0' style={{ backgroundColor: 'transparent' }}></ListGroup.Item>
                        <ListGroup.Item id="zoomoutbutton" className='p-0 border-0' style={{ backgroundColor: 'transparent' }}></ListGroup.Item>
                        <ListGroup.Item id="prevextbutton" className='p-0 border-0' style={{ backgroundColor: 'transparent' }}></ListGroup.Item>
                        <ListGroup.Item id="nextextbutton" className='p-0 border-0' style={{ backgroundColor: 'transparent' }}></ListGroup.Item>
                        <ListGroup.Item id="zoomWindowbutton" className='p-0 border-0' style={{ backgroundColor: 'transparent' }}></ListGroup.Item>
                        <ListGroup.Item id="featureinfobutton" className='p-0 border-0' style={{ backgroundColor: 'transparent' }}></ListGroup.Item>
                        <ListGroup.Item id="measurebutton" className='p-0 border-0' style={{ backgroundColor: 'transparent' }}></ListGroup.Item>
                        <ListGroup.Item id="basemapbutton" className='p-0 border-0' style={{ backgroundColor: 'transparent' }}></ListGroup.Item>
                        <ListGroup.Item id="productfilterbutton" className='p-0 border-0' style={{ backgroundColor: 'transparent' }}></ListGroup.Item>
                        <ListGroup.Item id="layerOptionButton" className='p-0 border-0' style={{ backgroundColor: 'transparent' }}></ListGroup.Item>
                    </ListGroup>
                </Collapse>
            </div>
        </div>
    );
}

function OLView() {
    const map = useContext(OLMapContext);
    const mapRef = useRef();
    const { backgroundColor, textColor, borderColor, cardbodyColor, fontFamily, typoColor } = useColor();
    const { sideBarVisible, toggleLayersSidebar, sideBarLayersVisible, toggleSidebar, toggleFeatureInfoSidebar, sideBarFeatureInfoVisible } = useContext(SidebarContext);
    const hasHeader = projectTitle?._data?.Header;
    const hasFooter = projectTitle?._data?.Footer;
    const hasBuilder = true;
    const [mapHeight, setMapHeight] = useState(0);
    const [landingValue, setLandingValue] = useState(false);
    const { projectId } = useParams();
    const [modalContent] = useState('Are you sure you want to delete map and it`s related controls ?');
    const [showModal, setShowModal] = useState(false);
    const showAlert = useAlert();
    const [showDeleteIcon, setShowDeleteIcon] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const [serverPort, setServerPort] = useState(null);
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [layersList, setLayersList] = useState([]);
    const [layerOpacities, setLayerOpacities] = useState({});

    var mapContainer = document.getElementById('map-container');
    var encPanel = document.getElementById('ENCPanel');
    var navigationPanel = document.getElementById('NavigationPanel');
    var layerOptionButton = document.getElementById('layerOptionButton');

    const { toggleBaseMapOverLayPanel,
        toggleMeasureOverLayPanel, toggleAttributeQueryOverLayPanel, toggleFeatureInfoFlag, featureData
    } = useContext(OverLayPanelContext);

    const deleteButtonStyle = {
        width: '20px',
        height: '20px',
        position: 'absolute',
        fontSize: '12px',
        lineHeight: '12px',
        top: '1px',
        left: '50%',
        transform: `translate(-50%, 0)`,
        zIndex: '9999',
        textAlign: 'center',
        padding: '0',
        borderRadius: '50%'
    }

    useEffect(() => {
        const currentURL = window.location.href;
        const url = new URL(currentURL);
        const path = url.pathname;
        const pathSegments = path.split('/');
        const landString = pathSegments[pathSegments.length - 3];
        setLandingValue(landString === 'Landing');
    }, []);

    useEffect(() => {
        const headerHeight = hasHeader ? 72 : 0;
        const footerHeight = hasFooter ? 57 : 0;
        const builderHeight = hasBuilder ? 90 : 0;
        const viewportHeight = window.innerHeight - '1';

        let adjustedMapHeight = viewportHeight - headerHeight - footerHeight;
        let onlyFooterHeight = viewportHeight - footerHeight;
        let onlyHeaderHeight = viewportHeight - headerHeight;
        let viewBuilderMapHeight = viewportHeight - builderHeight;
        let builderHFPresent = adjustedMapHeight - builderHeight

        if (landingValue === true && !hasHeader && !hasFooter) {
            setMapHeight(viewBuilderMapHeight);
        }
        else if (landingValue === true && !hasHeader && hasFooter) {
            setMapHeight(viewBuilderMapHeight - onlyFooterHeight);
        }
        else if (landingValue === true && hasHeader && !hasFooter) {
            setMapHeight(viewBuilderMapHeight - onlyHeaderHeight);
        }
        if (landingValue === false && !hasHeader && !hasFooter) {
            setMapHeight(viewportHeight);
        }
        else if (landingValue === false && !hasHeader && hasFooter) {
            setMapHeight(onlyFooterHeight);
        }
        else if (landingValue === false && hasHeader && !hasFooter) {
            setMapHeight(onlyHeaderHeight);
        }
        else if (landingValue === false && hasHeader && hasFooter) {
            setMapHeight(adjustedMapHeight);
        }
        else {
            setMapHeight(builderHFPresent);
        }
    }, [mapHeight]);

    useEffect(() => {
        const LayersContainer = document.getElementById('Layers');
        if (layerOptionButton && LayersContainer != null) {
            layerOptionButton.append(LayersContainer);
        }
    }, [layerOptionButton]);

    /* to get map layers display on map*/
    useEffect(() => {
        if (map) {
            removePreviousAddedLayersFromMap();
            var view = new View({
                center: [0, 0],
                zoom: 1,
            });
            var lyr = new TileLayer({
                title: 'OSM',
                type: 'base',
                visible: true,
                source: new OSM(),
            });

            map.setView(view);
            map.addLayer(lyr);
            map.setTarget(mapRef.current);

            map.on('loadstart', function () {
                map.getTargetElement().classList.add('spinner');
            });
            map.on('loadend', function () {
                map.getTargetElement().classList.remove('spinner');
            });

            if (config?._data?.PortID !== undefined && config._data.PortID !== "") {
                setServerPort(config?._data?.PortID);
            }

            if (layersConfig?._data?.length > 0) {
                const allLayerNames = layersConfig?._data?.map(item => item.layers.layername);
                setLayersList(allLayerNames);

                layersConfig._data.map((lyr) => {
                    if (map) {
                        addWMSLayerToMap(map, lyr.layers.url, lyr.layers.workspace, lyr.layers.layername);
                    }
                })
            }
            if (mapContainer && encPanel && navigationPanel) {
                mapContainer.append(encPanel);
                mapContainer.append(navigationPanel);
            }
        }
    }, [mapContainer, encPanel, navigationPanel]);

    useEffect(() => {
        const defaultSelectedItems = layersConfig?._data?.map(item => item.layers.layername);
        setSelectedItems(defaultSelectedItems);
    }, []);

    const removePreviousAddedLayersFromMap = () => {
        var layers = map.getLayers().getArray();
        if (layers.length > 0) {
            layers.forEach(function (layer) {
                map.removeLayer(layer);
            });
        }
        clearImageSource(map);
    }

    /* After clicking checkbox checked and unchecked how data is displaying functionality is written here"*/
    const handleCheckboxChange = (event) => {
        const { value, checked } = event.target;
        const layers = map.getLayers().getArray();
        setSelectedItems((prevSelected) => {
            if (checked) {
                layers.forEach(function (lyr) {
                    if (value === lyr.get('title')) {
                        lyr.setVisible(true);
                    }
                });
                return [...prevSelected, value];
            } else {
                layers.forEach(function (lyr) {
                    if (value === lyr.get('title')) {
                        lyr.setVisible(false);
                    }
                });
                return prevSelected.filter(item => item !== value);
            }
        });
    };

    const handleOpacityChange = (event, lyr) => {
        const newOpacity = parseFloat(event.target.value);
        setLayerOpacities((prevOpacities) => ({
            ...prevOpacities,
            [lyr]: newOpacity,
        }));
    };

    const updateMap = (lyr) => {
        const allLayers = map.getLayers().getArray();
        if (allLayers.length > 0) {
            allLayers.forEach(function (layer) {
                if (layer.getVisible() && layer.get('title') === lyr) {
                    const opacity = layerOpacities[lyr] || 0;
                    layer.setOpacity(opacity);
                }
            });
        }
    };

    const handleButtonClick = (lyr) => {
        var buttons = document.querySelectorAll('.ZoomextentBtn');
        buttons.forEach(function (button) {
            if (button.id === lyr) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });

        if (map) {
            const allLayers = map.getLayers().getArray();
            if (allLayers.length > 0) {
                allLayers.forEach((layer) => {
                    if (layer.get('title') === lyr) {
                        const source = layer.getSource();
                        const params = source.getParams();
                        var wmsUrl = source.getUrl();
                        getLayerExtent(wmsUrl, params.LAYERS, serverPort, map);
                    }
                });
            }
        }
    };

    const handleDragStart = (index, e) => {
        setDraggedIndex(index);
    };


    const handleDragOver = (index, e) => {
        if (draggedIndex === null || draggedIndex === index) return;

        const updatedLayers = [...layersList];
        const draggedLayer = updatedLayers[draggedIndex];

        updatedLayers.splice(draggedIndex, 1);
        updatedLayers.splice(index, 0, draggedLayer);
        setLayersList(updatedLayers);

        setDraggedIndex(index);

        updatedLayers.forEach((layerName) => {
            const layerConfig = layersConfig._data.find((lyr) => lyr.layers.layername === layerName);
            if (layerConfig && map) {
                const isLayerFound = selectedItems.includes(layerName);
                if (isLayerFound) {
                    addWMSLayerToMap(map, layerConfig.layers.url, layerConfig.layers.workspace, layerConfig.layers.layername);
                }
            }
        });
    };

    const handleMouseEnter = () => {
        if (projectId) {
            setShowDeleteIcon(true);
        }
        else {
            setShowDeleteIcon(false);
        }
    };

    const handleMouseLeave = () => {
        setTimeout(() => {
            setShowDeleteIcon(false);
        }, 1000)
    };

    const handledelete = () => {
        const storedArrayAsString = localStorage.getItem('componentlist');
        const storedArray = JSON.parse(storedArrayAsString);

        if (storedArray.length > 0) {
            if (storedArray.includes('Map')) {
                setShowModal(true);
            }
        }
        else {
            showAlert("warning", "Map", "Kindly Save and refresh the app builder before deleting the map component.");
        }
    };

    const handleDeleteSuccessorError = async () => {
        const componentService = new ComponentService(FetchClient, rootConfig['app-builder-NodeServerUrl']);
        const componentName = 'Map';
        let response = await componentService.deleteComponent(projectId, componentName);
        if (response.status === 200) {
            showAlert('success', 'Map', `Component deleted successfully.`);
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        }
    }
    const handleCloseModal = () => {
        setShowModal(false);
    };

    const [sidebarHeight, setSidebarHeight] = useState(0);

    useEffect(() => {
        const headerHeight = hasHeader ? 72 : 0;
        const footerHeight = hasFooter ? 57 : 0;
        const viewportHeight = window.innerHeight;

        const adjustedMapHeight = viewportHeight - headerHeight - footerHeight;
        const onlyFooterHeight = viewportHeight - footerHeight;
        const onlyHeaderHeight = viewportHeight - headerHeight;

        const sidebarElement = document.querySelector('.sidebar');

        const setSidebarProps = (height, top) => {
            setSidebarHeight(height);
            if (sidebarElement) {
                sidebarElement.style.top = top;
            }
        };

        if (!hasHeader && !hasFooter) {
            setSidebarProps(viewportHeight, '0');
        } else if (!hasHeader && hasFooter) {
            setSidebarProps(onlyFooterHeight, '0');
        } else if (hasHeader && !hasFooter) {
            setSidebarProps(onlyHeaderHeight, '72px');
        } else {
            setSidebarProps(adjustedMapHeight, '72px');
        }
    }, [sidebarHeight]);

    const handleClick = () => {
        toggleBaseMapOverLayPanel(false);
        toggleAttributeQueryOverLayPanel(false);
        toggleMeasureOverLayPanel(false);
        toggleSidebar(false);
        toggleFeatureInfoFlag(false);
        toggleLayersSidebar(true);
        toggleFeatureInfoSidebar(false);
    };

    const handleCloseSideBar = () => {
        toggleLayersSidebar(false);
    }

    return (
        <>
            <Container fluid className={`main-content ${sideBarVisible || sideBarLayersVisible || sideBarFeatureInfoVisible ? 'active' : ''}`} id="mainContent">
                <div ref={mapRef} id="map-container" className={`map-container ${sideBarVisible || sideBarLayersVisible || sideBarFeatureInfoVisible ? 'active' : ''}`} style={{ height: `${mapHeight}px`, position: 'relative', overflow: 'hidden' }}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}>

                    <div id='NavigationPanel' className='NavigationPanel d-flex w-auto mt-2 position-absolute top-0' style={{ right: '50px' }}>
                        <ListGroup horizontal className=''>
                            <ListGroup.Item id="cartButton" className='p-0 border-0' style={{ backgroundColor: 'transparent' }}></ListGroup.Item>
                            <ListGroup.Item id="addlayerbutton" className='p-0 border-0' style={{ backgroundColor: 'transparent' }}></ListGroup.Item>
                            <ListGroup.Item id="profileButton" className='p-0 border-0' style={{ backgroundColor: 'transparent' }}></ListGroup.Item>
                        </ListGroup>
                    </div>
                    <div id='ENCPanel' className='d-flex flex-column w-auto position-absolute top-0 end-0 mt-2'>
                        <MapControlMenu />
                    </div>

                    <StyledMapControlButton title='Layers' id='Layers' className='p-1 mb-1' onClick={() => handleClick()}><i className="bi bi-layers"></i></StyledMapControlButton>
                    <div id='layersList' className={`sidebar ${sideBarLayersVisible ? 'active' : ''}`} style={{ height: `${sidebarHeight}px`, overflow: 'hidden', backgroundColor: cardbodyColor, border: `1px solid ${borderColor}` }}>
                    <Card.Header className='p-2' id="cardHeader" style={{ backgroundColor: backgroundColor, color: textColor, borderColor: borderColor }}>
                                <Stack direction="horizontal">
                                    <h6 id="productList" className='mb-0' style={{ color: textColor }}><i className="bi bi-layers me-1"></i> Layers</h6>
                                    <CloseButtonWrapper onClick={handleCloseSideBar} id='popup-closer' className='ms-auto'><i className='bi bi-x'></i></CloseButtonWrapper>
                                </Stack>
                            </Card.Header>
                        {layersList.length > 0 && layersList && <Card className='layersList' style={{ fontFamily: fontFamily, borderColor: borderColor, backgroundColor: cardbodyColor }}>
                            <Card.Body label="Layer switcher p-1" style={{ position: 'relative', maxHeight: `calc(${sidebarHeight}px - 105px)`, height: 'auto', minHeight: '100px', overflow: 'auto' }}>
                                <Accordion defaultActiveKey="0" className='layerlistAccord'>

                                    {layersList && layersList.map((lyr, index) => {
                                        return (
                                            <Accordion.Item key={index} eventKey={index} className='p-0' >
                                                <Accordion.Header
                                                    key={index}
                                                    onDragStart={(e) => handleDragStart(index, e)}
                                                    onDragOver={(e) => handleDragOver(index, e)}
                                                    cancel=".no-drag"
                                                    draggable
                                                    className='p-0'
                                                >
                                                    <Form.Check style={{ borderColor: borderColor }} className='no-drag'>

                                                        <Form.Check.Input
                                                            type="checkbox"
                                                            name={lyr}
                                                            onChange={(event) => handleCheckboxChange(event, lyr)}
                                                            onClick={(e) => e.stopPropagation()}
                                                            checked={(selectedItems && selectedItems.includes(lyr)) || false}
                                                            className="me-2"
                                                            id={`checkbox- ${lyr}`}
                                                            value={lyr}  // or use a unique identifier from lyr
                                                            style={{
                                                                backgroundColor: selectedItems?.includes(lyr) ? backgroundColor : 'transparent',
                                                                color: textColor,
                                                                borderColor: borderColor
                                                            }}
                                                        />
                                                        <Form.Check.Label title={lyr} style={{ color: typoColor, textOverflow: 'ellipsis', width: '125px', whiteSpace: 'nowrap', overflow: 'hidden' }}>{lyr}</Form.Check.Label>
                                                    </Form.Check>
                                                </Accordion.Header>
                                                <Accordion.Body className='px-1 py-2'>
                                                    <div className='d-flex align-content-center align-items-center'>
                                                        <StyledMapControlButton
                                                            className='me-3 py-1 px-2'
                                                            title='layer zoom extent'
                                                            id={lyr}
                                                            onClick={() => handleButtonClick(lyr)}
                                                        >
                                                            <i className="bi bi-arrows-fullscreen"></i>
                                                        </StyledMapControlButton>
                                                        <Form.Range id="opacity-input"
                                                            min="0"
                                                            max="1"
                                                            step="0.01"
                                                            value={layerOpacities[lyr] || 1}
                                                            title='opacity'
                                                            onChange={(e) => handleOpacityChange(e, lyr)}
                                                            onClick={() => updateMap(lyr)}
                                                            className="me-2"
                                                            style={{
                                                                backgroundColor: 'transparent',
                                                                '--track-color': backgroundColor,
                                                                '--thumb-color': backgroundColor,

                                                            }}
                                                        ></Form.Range>
                                                    </div>
                                                </Accordion.Body>
                                            </Accordion.Item>
                                        )
                                    })}
                                </Accordion>
                            </Card.Body>
                        </Card>
                        }
                    </div>
                    <div>
                        {showDeleteIcon && (
                            <Button className="allmap-delete-button" style={deleteButtonStyle} size='sm' variant="danger" onClick={() => handledelete('Map')}>
                                <i className="bi bi-x-lg"></i>
                            </Button>
                        )}
                    </div>
                    <MyModal
                        show={showModal}
                        title="Map"
                        content={modalContent}
                        onHide={handleCloseModal}
                        onSaveChanges={handleDeleteSuccessorError}
                    />
                    {featureData.length > 0 && <CollapsibleTable></CollapsibleTable>}
                </div>
            </Container>
        </>
    )
}
export default OLView;