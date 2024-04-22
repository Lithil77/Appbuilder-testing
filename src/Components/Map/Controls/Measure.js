import React, { useEffect, useState, useContext, useRef } from 'react'
import Control from "ol/control/Control";
import { OLMapContext } from "../OLMap.js";
import { Button, Form } from 'react-bootstrap';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import { useParams } from 'react-router-dom';
import useMapButtonLogic from '../../../CustomHooks/useMapButtonControl.js';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import { Style, Fill, Stroke, Circle as CircleStyle } from 'ol/style';
import { LineString, Polygon } from 'ol/geom';
import MyModal from '../../General/Modal.js';
import { useColor } from '../../../CustomContext/ColorContext.js';
import Draw from 'ol/interaction/Draw';
import Overlay from 'ol/Overlay';
import { unByKey } from 'ol/Observable';
import { clearVectorSource } from '../../../Openlayers/MapLayerManager.js';
import { useAlert } from "../../../CustomContext/AlertContext.js";
import CloseButtonWrapper from '../../../CustomHooks/closeButton.js';
import PopoverFooterWrapper, { StyledButton, StyledPopover, StyledMapControlButton } from '../../../CustomHooks/CustomStyledComponents.js';
import { OverLayPanelContext } from '../../../CustomContext/OverLayContext';
import { SidebarContext } from '../../../CustomContext/SidebarContext.js';

let draw, sketch;
let helpTooltipElement, helpTooltip, measureTooltipElement, measureTooltip;
var drawCount = 0;

function Measure() {

    const [title] = useState('Measure');
    const showAlert = useAlert();
    const { backgroundColor, textColor, borderColor, typoColor } = useColor();

    const olMap = useContext(OLMapContext);

    const { measureOverLayPanelVisible, toggleBaseMapOverLayPanel,
        toggleMeasureOverLayPanel, toggleAttributeQueryOverLayPanel,
        unregisterClickHandlers, toggleFeatureInfoFlag, clearFeatureData,
        updateZoomWindowButtonActive, removeZoomWindowFunctionality, 
        deactiveAttributeQueryActivities } = useContext(OverLayPanelContext);

    const { toggleSidebar, toggleLayersSidebar, toggleFeatureInfoSidebar } = useContext(SidebarContext);

    const { projectId } = useParams();

    const deleteMeasureAreaToolButtonRef = useRef(null);
    const measureRefButton = useRef(null);

    const [showModal, setShowModal] = useState(false);

    const [modalContent] = useState('Are you sure you want to delete the measure component ?');

    const [selectedType, setSelectedType] = useState('length');
    const [selectedUnits, setSelectedUnits] = useState('Select');

    const {
        handleMouseEnter, handleMouseLeave, handleDelete,
        handleDeleteSuccessorError, handleCloseModal, deleteButtonStyle, containerStyle } =
        useMapButtonLogic({
            projectId: projectId,
            title: title,
            deleteButtonRef: deleteMeasureAreaToolButtonRef,
            setShowModal,
        });

    useEffect(() => {
        var MeasureButton = document.getElementById('measurebutton');
        if (MeasureButton) {
            const measureAreaToolContainer = document.getElementById('measureAreaToolContainer');
            if (MeasureButton && olMap && measureAreaToolContainer != null) {
                MeasureButton.append(measureAreaToolContainer);
            }
        }

    }, [olMap]);

    const formatLength = function (line) {
        const length = line.getLength();
        const conversionFactor = getConversionFactor(selectedUnits);
        const unitAbbreviation = (selectedUnits === 'meters') ? ' meters' : (selectedUnits === 'km') ? ' km' : (selectedUnits === 'miles') ? ' miles' : (selectedUnits === 'feet') ? ' feet' : '';

        const output = (Math.round(length * conversionFactor * 100) / 100).toFixed(2) + unitAbbreviation;
        return output;
    };

    const formatArea = function (polygon) {
        const area = polygon.getArea();
        const conversionFactor = getConversionFactor(selectedUnits);
        const unitAbbreviation = (selectedUnits === 'meters') ? ' meters²' : (selectedUnits === 'km') ? ' km²' : (selectedUnits === 'miles') ? ' miles²' : (selectedUnits === 'feet') ? ' feet²' : '';

        const output = (Math.round(area * conversionFactor * 100) / 100).toFixed(2) + unitAbbreviation;
        return output;
    };

    const getConversionFactor = (unit) => {
        switch (unit) {
            case 'km':
                return 0.001;
            case 'miles':
                return 0.000621371;
            case 'feet':
                return 3.28084;
            case 'meters':
                return 1;
            default:
                return 1;
        }
    };

    function createHelpTooltip() {
        if (helpTooltipElement) {
            helpTooltipElement.parentNode.removeChild(helpTooltipElement);
        }
        helpTooltipElement = document.createElement('div');
        helpTooltipElement.className = 'ol-tooltip hidden';
        helpTooltip = new Overlay({
            element: helpTooltipElement,
            offset: [15, 0],
            positioning: 'center-left',
        });
        olMap.addOverlay(helpTooltip);
    }

    function createMeasureTooltip() {
        if (measureTooltipElement) {
            measureTooltipElement.parentNode.removeChild(measureTooltipElement);
        }
        measureTooltipElement = document.createElement('div');
        measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
        measureTooltip = new Overlay({
            element: measureTooltipElement,
            offset: [0, -15],
            positioning: 'bottom-center',
            stopEvent: false,
            insertFirst: false,
        });
        olMap.addOverlay(measureTooltip);
    }

    const style = new Style({
        fill: new Fill({
            color: 'rgba(255, 255, 255, 0.2)',
        }),
        stroke: new Stroke({
            color: 'rgba(0, 0, 0, 0.5)',
            lineDash: [10, 10],
            width: 2,
        }),
        image: new CircleStyle({
            radius: 5,
            stroke: new Stroke({
                color: 'rgba(0, 0, 0, 0.7)',
            }),
            fill: new Fill({
                color: 'rgba(255, 255, 255, 0.2)',
            }),
        }),
    })

    function addInteraction(source, measureBtn) {

        if ((selectedType === "Select" && selectedUnits === "Select") ||
            (selectedType === "Select Type" && selectedUnits === "Select Unit")) {
            showAlert(
                "warning",
                "Measure",
                "Please select valid measure type and unit."
            );
        } else if (selectedType === "Select Type" || selectedType === "Select") {
            showAlert(
                "warning",
                "Measure",
                "Please select valid measure type."
            );
        } else if (selectedUnits === "Select Unit" || selectedUnits === "Select") {
            showAlert(
                "warning",
                "Measure",
                "Please select valid measure unit."
            );
        } else {
            const type = selectedType === 'area' ? 'Polygon' : 'LineString';
            draw = new Draw({
                source: source,
                type: type,
                style: function (feature) {
                    const geometryType = feature.getGeometry().getType();
                    if (geometryType === type || geometryType === 'Point') {
                        return style;
                    }
                },
            });
            olMap.addInteraction(draw);

            createMeasureTooltip();
            createHelpTooltip();

            let listener;

            draw.on('drawstart', function (evt) {
                sketch = evt.feature;

                let tooltipCoord = evt.coordinate;

                listener = sketch.getGeometry().on('change', function (evt) {
                    const geom = evt.target;
                    let output;
                    if (geom instanceof Polygon) {
                        output = formatArea(geom);
                        tooltipCoord = geom.getInteriorPoint().getCoordinates();
                    } else if (geom instanceof LineString) {
                        output = formatLength(geom);
                        tooltipCoord = geom.getLastCoordinate();
                    }
                    measureTooltipElement.innerHTML = output;
                    measureTooltip.setPosition(tooltipCoord);
                });
            });

            draw.on('drawend', function () {
                drawCount++;
                measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
                measureTooltip.setOffset([0, -7]);
                sketch = null;
                measureTooltipElement = null;
                createMeasureTooltip();
                unByKey(listener);
                stopDrawAction();
                measureBtn.classList.remove('active');
            });
        }
    }

    const handleMeasureArea = () => {
        clearFeatureData();
        toggleSidebar(false);
        toggleFeatureInfoSidebar(false);
        toggleLayersSidebar(false);
        toggleAttributeQueryOverLayPanel(false);
        toggleBaseMapOverLayPanel(false);
        toggleFeatureInfoFlag(false);
        unregisterClickHandlers(olMap, 'measureArea');
        updateZoomWindowButtonActive(false);
        removeZoomWindowFunctionality(olMap);
        deactiveAttributeQueryActivities();
        setTimeout(() => {
            toggleMeasureOverLayPanel(true);
        }, 300);
    }

    const handleTypeChange = (event) => {
        setSelectedType(event.target.value);
    };

    const handleUnitsChange = (event) => {
        setSelectedUnits(event.target.value);
    };

    const handleListClear = () => {
        if (measureTooltipElement) {
            stopDrawAction();
            measureTooltipElement.innerHTML = "";
            const tooltips = document.querySelectorAll(".ol-tooltip");
            measureTooltip.setPosition(undefined);

            if (tooltips && helpTooltip) {
                tooltips.forEach(tooltip => {
                    tooltip.style.display = "none";
                });

                helpTooltip.setPosition(undefined);
                olMap.removeOverlay(helpTooltip);
            }

            const tooltipStatic = document.querySelectorAll(".ol-tooltip-static");

            if (tooltipStatic) {
                tooltipStatic.forEach(tooltip => {
                    tooltip.style.display = "none";
                });
            }

            for (let index = 0; index <= drawCount; index++) {
                clearVectorSource(olMap);
            }
            drawCount = 0;
            clearComboxFileds();
            const measureBtn = document.getElementById('measureBtn');
            if (measureBtn) {
                measureBtn.classList.remove('active');
            }
        } else {
            clearComboxFileds();
        }
    };

    const clearComboxFileds = () => {
        setSelectedType("");
        setSelectedUnits("");
        setSelectedType("Select Type");
        setSelectedUnits("Select Unit");
    };

    const stopDrawAction = () => {
        const interactions = olMap.getInteractions();
        interactions.forEach((interaction) => {
            if (interaction instanceof Draw) {
                if (interaction.getActive()) {
                    interaction.finishDrawing();
                    interaction.setActive(false);
                    olMap.removeInteraction(interaction);
                }
            }
        });
    };

    const handleDraw = () => {
        const measureBtn = document.getElementById('measureBtn');
        if (measureBtn) {
            measureBtn.classList.add('active');

            const vectorSource = new VectorSource();
            const vectorLayer = new VectorLayer({
                source: vectorSource,
                style: new Style({
                    fill: new Fill({
                        color: "rgba(255, 255, 255, 0.2)",
                    }),
                    stroke: new Stroke({
                        color: "#ffcc33",
                        width: 2,
                    }),
                }),
            });
            addInteraction(vectorSource, measureBtn);
            olMap.addLayer(vectorLayer);
        }
    };

    const handleClose = () => {
        clearComboxFileds();
        toggleMeasureOverLayPanel(false)
        handleListClear();
    }

    return (
        <div id='measureAreaToolContainer' style={containerStyle}>
            <OverlayTrigger
                trigger="click"
                key="bottom"
                placement="auto"
                className="w-75 position-absolute"
                show={measureOverLayPanelVisible}
                overlay={
                    <StyledPopover style={{
                        width: '400px',
                        height: 'auto',

                    }}>
                        <Popover.Header as="h6" className='d-flex justify-content-between align-items-center pe-2' style={{ color: textColor, backgroundColor: backgroundColor, borderColor: borderColor }}>
                            <i className="bi bi-rulers me-2"></i>
                            Measure
                            <CloseButtonWrapper
                                className='ms-auto'
                                onClick={handleClose}
                            ><i className='bi bi-x'></i>
                            </CloseButtonWrapper>
                        </Popover.Header>
                        <Popover.Body>
                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Select value={selectedType} onChange={handleTypeChange} id="type" style={{ color: typoColor, borderColor: borderColor }}>
                                        <option value="Select">Select Type</option>
                                        <option value="length">Distance</option>
                                        <option value="area">Area</option>
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Select value={selectedUnits} onChange={handleUnitsChange} id="units" style={{ color: typoColor, borderColor: borderColor }}>
                                        <option value="Select">Select Unit</option>
                                        <option value="meters">Meters</option>
                                        <option value="km">Kilometers</option>
                                        <option value="miles">Miles</option>
                                        <option value="feet">Feet</option>
                                    </Form.Select>
                                </Form.Group>
                            </Form>
                        </Popover.Body>
                        <PopoverFooterWrapper>
                            <StyledButton ref={measureRefButton} onClick={handleDraw} id="measureBtn">Measure</StyledButton>
                            <StyledButton
                                className="ms-2" id="btn-Clear" onClick={handleListClear}>
                                Clear
                            </StyledButton>
                        </PopoverFooterWrapper>
                    </StyledPopover>
                }
            >
                <StyledMapControlButton title={title} id={title} className='p-1 mb-1' onClick={(e) => handleMeasureArea(e)}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <i className="bi bi-rulers" />
                </StyledMapControlButton>
            </OverlayTrigger >
            <Button ref={deleteMeasureAreaToolButtonRef} onClick={handleDelete} className="btn-sm btn btn-danger" id="measureAreaToolDeletebutton" style={deleteButtonStyle}>
                <i className="bi bi-x-lg"></i>
            </Button>
            <MyModal
                show={showModal}
                title="Measure"
                content={modalContent}
                onHide={handleCloseModal}
                onSaveChanges={handleDeleteSuccessorError}
            />
        </div>
    );
}

export default Measure;