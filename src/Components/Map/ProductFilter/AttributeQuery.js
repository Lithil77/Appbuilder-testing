import React, { useState, useRef, useContext, useEffect } from 'react';
import { OLMapContext } from "../../Map/OLMap";
import { Form, InputGroup, Button, Row, Col } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import ComponentService from '../../../Services/ComponentService';
import FetchClient from '../../../ServiceClients/FetchClient';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';

import ImageWMS from "ol/source/ImageWMS.js";
import ImageLayer from "ol/layer/Image.js";
import Control from "ol/control/Control";
import config from "../../../utils/ApplicationTitleConfig";
import rootConfig from "../../../ExternalUrlConfig.json";

import { SidebarContext } from '../../../CustomContext/SidebarContext';
import { useColor } from '../../../CustomContext/ColorContext';
import { clearVectorSource, stopDrawAction } from "../../../Openlayers/MapLayerManager.js";
import CloseButtonWrapper from '../../../CustomHooks/closeButton.js';
import PopoverFooterWrapper, { StyledButton, StyledLoaderInner, StyledLoaderWraper, StyledPopover } from '../../../CustomHooks/CustomStyledComponents.js';
import { useAlert } from "../../../CustomContext/AlertContext.js";
import { OverLayPanelContext } from '../../../CustomContext/OverLayContext.js';
import MyModal from '../../General/Modal.js';
import { getAttributeValues, performAttributeQuery } from "../../../GeoServer/GetAttributeValues.js";
import { useMapControlMenuButton } from '../../../CustomContext/MapControlMenuButtonContext.js';

var serverPort = null;

function AttributeQuery() {

    const olMap = useContext(OLMapContext);
const [open, setOpen] = useMapControlMenuButton();
    const {
        attributeQueryOverLayPanelVisible, toggleBaseMapOverLayPanel,
        toggleMeasureOverLayPanel, toggleAttributeQueryOverLayPanel,
        toggleFeatureInfoFlag, unregisterClickHandlers, toggleCollapsibleTablePanel, getAllVisibleLayers,
        updateFeatureData, clearFeatureData, clearComponentState, updateAttributeQueryLayer,
        attributeQuerySelectedLayer, updateQueryType, featureSearchResults, updateFeatureSearchResults, clearFeatureSearchResults,
        searchInputloading, updateSearchInputloading, updateSelectedOpt, selectedOpt, typeaheadRef,updateZoomWindowButtonActive, removeZoomWindowFunctionality
    } = useContext(OverLayPanelContext);

    const mapSeachRef = useRef(null);
    const { toggleBottombar, toggleSidebar, toggleLayersSidebar, toggleFeatureInfoSidebar } = useContext(SidebarContext);
    const { textColor, backgroundColor, borderColor, typoColor } = useColor();
    const [dynamicUrl, setDynamicUrl] = useState(null);

    const [productList, setProductList] = useState([]);
    const [loading, setLoading] = useState(false);

    const [targetUrl, setTargetUrl] = useState(null);
    const [showDeleteIcon, setShowDeleteIcon] = useState(false);
    const { projectId } = useParams();
    const showAlert = useAlert();
    const [showModal, setShowModal] = useState(false);
    const [modalContent] = useState('Are you sure you want to delete component ?');
    const componentService = new ComponentService(FetchClient, rootConfig['app-builder-NodeServerUrl']);
    const typeValue = "attributeQuery";

    const attrListBtn = {
        width: '42px',
        height: '54px'
    }

    useEffect(() => {

        if (olMap) {
            let searchControl = document.getElementById('search-control');
            if (searchControl) {
                const buttonSearchControl = new Control({ element: searchControl });
                buttonSearchControl.set('name', 'SearchControl');
                olMap.addControl(buttonSearchControl);
            }
        }

    }, [olMap]);

    useEffect(() => {

        if (config?._data?.PortID !== undefined && config._data.PortID !== "" && olMap) {
            serverPort = config?._data?.PortID;
            const url = (serverPort === rootConfig.AppBuilderPort) ? `${rootConfig['app-builder-NodeServerUrl']}/api/getProducerCodes` : `${rootConfig['downloaded-app-ServerUrl']}/api/getProducerCodes`;
            setDynamicUrl(url);
            setProductList(getAllVisibleLayers(olMap));
        }

    }, [serverPort, olMap]);

    useEffect(() => {
        if (attributeQuerySelectedLayer !== '') {
            setTimeout(async () => {
                updateSearchInputloading(true);
                const arributesData = await getAttributeValues(olMap, dynamicUrl, targetUrl, attributeQuerySelectedLayer, showAlert);
                updateSearchInputloading(false);
                if (arributesData.length > 0) {
                    updateFeatureSearchResults(arributesData);
                }
                toggleAttributeQueryOverLayPanel(false);
            }, 1000);
        }
    }, [attributeQuerySelectedLayer]);

    /* ---------------------------------------------------
       This funtionality is used highlight the geometry based on attribute value 
   --------------------------------------------------- */
    const handleSelect = async (selectedOptions) => {
        const lyrName = attributeQuerySelectedLayer;

        if (selectedOptions.length > 0 && olMap) {
            const selectedOption = selectedOptions[0];
            updateSelectedOpt(selectedOption);
            const data = await performAttributeQuery(olMap, dynamicUrl, targetUrl, lyrName, selectedOption, showAlert);
            if (data.length > 0) {
                clearFeatureData();
                updateFeatureData(data, typeValue, lyrName);
                updateQueryType(typeValue);
                toggleCollapsibleTablePanel(true);
                toggleBottombar(true);
                setOpen(false);
            }
        }
    };

    /* ---------------------------------------------------
        This funtionality is used to select a layer 
    --------------------------------------------------- */

    const handleComboBoxLayerSelectionChange = (event) => {
        const selectedValue = event.target.value;

        if (selectedValue === "select") {
            showAlert("warning", "Attribute Query", "Please select a product.");
            updateAttributeQueryLayer('')
            clearFeatureSearchResults();
        } else {
            const layersList = olMap.getLayers().getArray();
            const targetLayer = layersList.find((lyr) =>
                lyr instanceof ImageLayer &&
                lyr.getSource() instanceof ImageWMS &&
                selectedValue === lyr.get('title') &&
                lyr.getVisible()
            );

            if (targetLayer) {
                const selectedLayerName = targetLayer.get('title');
                updateAttributeQueryLayer(selectedLayerName);
                const wmsUrl = targetLayer.getSource().getUrl();
                if (wmsUrl !== null && wmsUrl !== undefined) {
                    setTargetUrl(wmsUrl);
                }
            } else {
                showAlert("warning", "Attribute Query", "The selected layer is not visible.");
            }
        }
    };

    const handleToggleDialog = () => {
        toggleSidebar(false);
        toggleLayersSidebar(false);
        toggleFeatureInfoSidebar(false);
        toggleBaseMapOverLayPanel(false);
        toggleMeasureOverLayPanel(false);
        toggleAttributeQueryOverLayPanel(true);
        toggleFeatureInfoFlag(false);
        unregisterClickHandlers(olMap, 'attributequery');
        clearComponentState(makeInitialState);
        stopDrawAction(olMap);
        updateZoomWindowButtonActive(false);
        removeZoomWindowFunctionality(olMap);

        if (typeaheadRef.current) {
            typeaheadRef.current.clear();
        }
        clearFeatureSearchResults();
        toggleCollapsibleTablePanel(false);

    };

    const handlePopoverClose = () => {
        clearFeatureSearchResults();
        updateAttributeQueryLayer('')
        toggleAttributeQueryOverLayPanel(false);
    };

    const handleClear = () => {
        makeInitialState();
        toggleCollapsibleTablePanel(false);
    }

    const makeInitialState = () => {
        clearVectorSource(olMap)
        if (typeaheadRef.current) {
            typeaheadRef.current.clear();
        }
        clearFeatureData();
        toggleBottombar(false);
        updateSelectedOpt(null);
    }

   /* const handleListClear = () => {
        toggleBottombar(false);
        clearFeatureSearchResults();
        updateAttributeQueryLayer('')
        setLoading(false);
    };*/

    const handleMouseEnter = () => {
        const attributeSearch = document.getElementById('search-control');
        if (projectId) {
            setShowDeleteIcon(true);
            attributeSearch.style.border = '1px solid red';
        }
        else {
            setShowDeleteIcon(false);
            attributeSearch.style.border = '0px';
        }
    };

    const handleMouseLeave = () => {
        const attributeSearch = document.getElementById('search-control');
        setTimeout(() => {
            setShowDeleteIcon(false);
            attributeSearch.style.border = '0px';
        }, 1000)
    };

    const handledelete = () => {
        const storedArrayAsString = localStorage.getItem('componentlist');
        const storedArray = JSON.parse(storedArrayAsString);
        if (storedArray.includes('AttributeQuery')) {
            setShowModal(true);
        } else {
            showAlert("warning", "Attribute Query", "Please save component before delete.");
        }
    };

    const handleDeleteSuccessorError = async (event) => {
        const Component = 'AttributeQuery';
        let response = await componentService.deleteComponent(projectId, Component);
        if (response.status === 200) {
            showAlert('success', 'Attribute Query', 'Component deleted successfully.');
            setTimeout(() => {
                window.location.reload();
            }, 500);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const style = document.createElement('style');
    style.innerHTML = `
        .custom-typeahead .rbt-menu {
          width: auto !important;
        }
      `;
    document.head.appendChild(style);

    return (
        <>
            <div id="search-control" className='ms-2 mt-2 position-absolute top-0 start-0' style={{ width: 'auto' }} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                {showDeleteIcon && (
                    <Button className="delete-button rounded-circle attrquery-delete-button" size='sm' variant="danger" onClick={() => handledelete('AttributeQuery')}>
                        <i className="bi bi-x-lg"></i>
                    </Button>
                )}
                <Row>
                    <Col sm={2} className='pe-0'>
                        <div>
                            <OverlayTrigger trigger="click" key="bottom" placement="bottom" className="w-25 position-absolute" show={attributeQueryOverLayPanelVisible} rootClose={true} overlay={
                                <StyledPopover style={{ width: '400px', height: 'auto' }}>
                                    <Popover.Header as="h6" className='d-flex justify-content-between align-items-center pe-2' style={{ color: textColor, backgroundColor: backgroundColor, borderColor: borderColor }}>
                                        <i className="bi bi-filter me-2" style={{ fontSize: '20px' }}></i>
                                        IHO-Products
                                        <CloseButtonWrapper onClick={handlePopoverClose} className='ms-auto'>
                                            <i className='bi bi-x'></i>
                                        </CloseButtonWrapper>
                                    </Popover.Header>
                                    <Popover.Body className='pb-1' style={{ position: 'relative' }}>
                                        {loading && (
                                            <StyledLoaderWraper>
                                                <StyledLoaderInner />
                                            </StyledLoaderWraper>
                                        )}
                                        <select className='form-select mb-2' value={attributeQuerySelectedLayer} onChange={handleComboBoxLayerSelectionChange} style={{ color: typoColor, borderColor: borderColor }}>
                                            <option value="select">Select a Product</option>
                                            {productList && productList.map((item, index) => (
                                                <option key={index} value={item}>
                                                    {item}
                                                </option>
                                            ))}
                                        </select>
                                    </Popover.Body>

                                    {/*<PopoverFooterWrapper>
                                        <StyledButton id="btn-Clear" onClick={handleListClear}>
                                            Clear
                                        </StyledButton>
                                    </PopoverFooterWrapper> */}

                                </StyledPopover>
                            }>
                                <StyledButton title='Attribute query tool' id='attributeQueryToggleBtn' onClick={handleToggleDialog} style={attrListBtn}><i className="bi bi-list"></i></StyledButton>
                            </OverlayTrigger >
                        </div>
                    </Col>
                    <Col sm={10} className='ps-1'>
                        <div>
                            {featureSearchResults.length > 0 &&
                                <Form ref={mapSeachRef} className="w-100">
                                    <InputGroup className="rounded shadow" 
                                    style={{ padding: '6px', backgroundColor: backgroundColor, color: textColor, border: `1px solid ${borderColor}` }}
                                    title={attributeQuerySelectedLayer != rootConfig.S1412WindDataLayerName ? `Product Id, Feature Name, Chart Number, Country or Location` : 'Id'}>
                                        <Typeahead
                                            id="searchBox"
                                            labelKey="combinedLabel"
                                            onChange={handleSelect}
                                            placeholder={attributeQuerySelectedLayer != rootConfig.S1412WindDataLayerName ? `Product Id, Feature Name, Chart Number, Country or Location` : 'Id'}
                                            options={featureSearchResults}
                                            ref={typeaheadRef}
                                            className="custom-typeahead"
                                            style={{ backgroundColor: 'transparent', color: typoColor, borderColor: borderColor }}
                                           
                                        />
                                        <InputGroup.Text style={{ backgroundColor: backgroundColor, color: textColor, borderColor: borderColor }}>
                                            {searchInputloading === true ? (
                                                <StyledLoaderInner style={{ top: 'unset', left: 'unset', width: '25px', height: '25px', borderWidth: '5px' }} />
                                            ) : selectedOpt ? (
                                                <i className="bi bi-x-lg clear-icon" onClick={handleClear}></i>
                                            ) : (
                                                <i className="bi bi-search"></i>
                                            )}
                                        </InputGroup.Text>
                                    </InputGroup>
                                </Form>
                            }

                        </div>
                    </Col>
                </Row>
            </div>
            <MyModal show={showModal} onHide={handleCloseModal} title="Attribute Query" content={modalContent} onSaveChanges={handleDeleteSuccessorError} />
        </>
    )
}

export default AttributeQuery;
