import React, { useEffect, useState, useContext, useRef } from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Control from "ol/control/Control";
import TileLayer from "ol/layer/Tile";
import TileWMS from 'ol/source/TileWMS';
import BingMaps from "ol/source/BingMaps.js";
import OSM from 'ol/source/OSM';
import { OLMapContext } from "../OLMap";
import { Button, Popover, Card } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import useMapButtonLogic from '../../../CustomHooks/useMapButtonControl';
import rootConfig from "../../../ExternalUrlConfig.json";
import MyModal from '../../General/Modal';
import { useColor } from '../../../CustomContext/ColorContext';
import CloseButtonWrapper from '../../../CustomHooks/closeButton';
import { StyledPopover, StyledMapControlButton } from '../../../CustomHooks/CustomStyledComponents';
import { OverLayPanelContext } from '../../../CustomContext/OverLayContext';
import { SidebarContext } from '../../../CustomContext/SidebarContext';

function BaseMapGallery() {

    const [title] = useState("BaseMaps");
    const olMap = useContext(OLMapContext);

    const {
        baseMapOverLayPanelVisible, toggleBaseMapOverLayPanel,
        toggleMeasureOverLayPanel, toggleAttributeQueryOverLayPanel,
        toggleFeatureInfoFlag, unregisterClickHandlers, clearFeatureData,
         updateZoomWindowButtonActive, removeZoomWindowFunctionality,deactiveAttributeQueryActivities
    } = useContext(OverLayPanelContext);

    const { toggleSidebar, toggleLayersSidebar, toggleFeatureInfoSidebar } = useContext(SidebarContext);

    const { projectId } = useParams();

    const deleteBaseMapGalleryButtonRef = useRef(null);

    const [showModal, setShowModal] = useState(false);
    const [modalContent] = useState('Are you sure you want to delete the base maps component ?');

    const [imgWidth] = useState('60px');
    const [imgHeight] = useState('50px');
    const { backgroundColor, textColor, borderColor, typoColor } = useColor();
    const [activeButton, setActiveButton] = useState(null);

    const imageArray = [
        {
            src: 'https://blogs.bing.com/BingBlogs/media/MapsBlog/2018/07/RouteOptimizationScreenshot_1.png',
            onClick: () => loadBingMapLayer('Road'),
            title: 'Road',
        },
        {
            src: 'https://blogs.bing.com/getmedia/e0997fa5-6974-4279-b5e2-4f9e0927404d/2475.clip_5F00_image005_5F00_035C7AD0.aspx',
            onClick: () => loadBingMapLayer('AerialWithLabels'),
            title: 'Labels',
        },
        {
            src: 'https://learn.microsoft.com/en-us/bingmaps/getting-started/google-maps-to-bing-maps-migration-guide/media/image8.png',
            onClick: () => loadBingMapLayer('RoadDark'),
            title: 'RoadDark',
        },
        {
            src: 'https://static.packt-cdn.com/products/9781782165101/graphics/5101_04_4_512x512.jpg',
            onClick: () => loadingOSM(),
            title: 'OSM',
        },
        {
            src: ' https://www.gebco.net/data_and_products/images/gebco_2020_grid.png',
            onClick: () => loadGebcoMap(),
            title: 'Gebco',
        },
    ];

    const {
        handleMouseEnter, handleMouseLeave, handleDelete, handleDeleteSuccessorError, handleCloseModal,
        deleteButtonStyle, containerStyle } =
        useMapButtonLogic({
            projectId: projectId,
            title: title,
            deleteButtonRef: deleteBaseMapGalleryButtonRef,
            setShowModal
        });

    useEffect(() => {

        const BasemapButton = document.getElementById('basemapbutton');
        const baseMapGalleryContainer = document.getElementById('baseMapGalleryContainer')

        if (BasemapButton && olMap && baseMapGalleryContainer != null) {
            BasemapButton.append(baseMapGalleryContainer);
        }

    }, [olMap]);

    const handleBaseMapGallery = (title) => {
        setActiveButton(title);
        if (olMap) {
            clearFeatureData();
            toggleSidebar(false);
            toggleFeatureInfoSidebar(false);
            toggleLayersSidebar(false);
            toggleMeasureOverLayPanel(false);
            toggleAttributeQueryOverLayPanel(false);
            toggleFeatureInfoFlag(false);
            unregisterClickHandlers(olMap, 'baseMaps');
            updateZoomWindowButtonActive(false);
            removeZoomWindowFunctionality(olMap);
            deactiveAttributeQueryActivities();
            setTimeout(() => {
                toggleBaseMapOverLayPanel(true);
            }, 300);

        }
    }

    const handleClear = () => {
        toggleBaseMapOverLayPanel(false);
    }

    const loadBingMapLayer = (lyrType) => {

        let bingMapsSource = new BingMaps({
            key: rootConfig['BingMap-Key'],
            imagerySet: lyrType,
        });

        const bingMapsLayer = new TileLayer({
            source: bingMapsSource,
        });

        if (olMap != undefined) {
            addLayerToMap(bingMapsLayer);
        }
    };

    const loadingOSM = () => {
        if (olMap) {
            var lyr = new TileLayer({
                title: 'OSM',
                type: 'base',
                visible: true,
                source: new OSM(),
            });
            addLayerToMap(lyr);
        }
    };

    const loadGebcoMap = () => {
        if (olMap) {
            const gebcoLayer = new TileLayer({
                source: new TileWMS({
                    url: rootConfig.GebcoUrl,
                    params: {
                        'LAYERS': 'GEBCO_Latest',
                        'FORMAT': 'image/png',
                        'TRANSPARENT': true
                    }
                })
            });
            addLayerToMap(gebcoLayer);
        }
    }

    const addLayerToMap = (lyr) => {
        const layers = olMap.getLayers().getArray();
        if (layers.length > 0) {
            olMap.removeLayer(layers[0]);
        }
        olMap.getLayers().insertAt(0, lyr);
    };

    return (
        <div id='baseMapGalleryContainer' style={containerStyle}>
            <OverlayTrigger
                trigger="click"
                key="bottom"
                placement="auto"
                className="w-75 position-absolute"
                show={baseMapOverLayPanelVisible}
                overlay={
                    <StyledPopover style={{
                        width: '400px',
                        height: 'auto',

                    }}>
                        <Popover.Header as="h6" className='d-flex justify-content-between align-items-center pe-2' style={{ color: textColor, backgroundColor: backgroundColor, borderColor: borderColor }}>
                            <i className="bi bi-map me-2"></i>
                            Map Gallery
                            <CloseButtonWrapper
                                onClick={handleClear}
                                className='ms-auto'
                            ><i className='bi bi-x'></i>
                            </CloseButtonWrapper>
                        </Popover.Header>
                        <Popover.Body>
                            <div className='d-flex flex-wrap'>
                                {imageArray.map((image, index) => (
                                    <Card key={index} className='m-1' onClick={image.onClick} style={{ cursor: 'pointer', borderColor: borderColor, width: '30%' }}>
                                        <Card.Img variant='top'
                                            src={image.src}
                                            width={imgWidth}
                                            height={imgHeight}
                                            title={image.title}
                                            alt={image.title}
                                        />
                                        <Card.Body className='p-1'>
                                            <Card.Text style={{ color: typoColor }}>{image.title}</Card.Text>
                                        </Card.Body>
                                    </Card>
                                ))}
                            </div>
                        </Popover.Body>
                    </StyledPopover>
                }
            >
                <StyledMapControlButton
                    title={title} id={title}
                    className='p-1 mb-1'
                    onClick={() => handleBaseMapGallery(title)}
                    active={activeButton === title}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <i className="bi bi-map" />
                </StyledMapControlButton>
            </OverlayTrigger >
            <Button ref={deleteBaseMapGalleryButtonRef} onClick={handleDelete} className="btn-sm btn btn-danger" id="baseMapGalleryDeletebutton" style={deleteButtonStyle}>
                <i className="bi bi-x-lg"></i>
            </Button>
            <MyModal
                show={showModal}
                title="Base maps"
                content={modalContent}
                onHide={handleCloseModal}
                onSaveChanges={handleDeleteSuccessorError}
            />
        </div>
    );
}

export default BaseMapGallery;