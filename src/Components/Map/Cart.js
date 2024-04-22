import React, { useEffect, useState, useContext, useRef } from 'react'
import { OLMapContext } from "./OLMap";
import { Modal, Accordion, ListGroup, Stack } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import useMapButtonLogic from '../../CustomHooks/useMapButtonControl';
import { useCheckedItems } from '../../CustomContext/CheckedItemContext';
import { useColor } from "../../CustomContext/ColorContext";
import MyModal from '../General/Modal';
import CloseButtonWrapper from '../../CustomHooks/closeButton';
import { StyledMapControlButton, StyledButton, StyledLoaderInner, StyledLoaderWraper } from '../../CustomHooks/CustomStyledComponents';
import { OverLayPanelContext } from '../../CustomContext/OverLayContext';
import { SidebarContext } from '../../CustomContext/SidebarContext';
import rootConfig from "../../ExternalUrlConfig.json";
import { useAlert } from '../../CustomContext/AlertContext';
import config from '../../utils/ApplicationTitleConfig';
import axios from 'axios';

var serverPort = null;

function Cart() {

    const [title] = useState('Cart');
    const { projectId } = useParams();
    const olMap = useContext(OLMapContext);
    const { toggleBaseMapOverLayPanel, toggleMeasureOverLayPanel, toggleAttributeQueryOverLayPanel, selectedCalenderDate } = useContext(OverLayPanelContext);
    const { toggleSidebar, toggleLayersSidebar, } = useContext(SidebarContext);

    const { checkedItems, removeItem, setCheckedItems } = useCheckedItems();

    const showAlert = useAlert();

    const { backgroundColor, textColor, fontFamily } = useColor();
    const [showModal, setShowModal] = useState(false);
    const [modalContent] = useState('Are you sure you want to delete the cart component ?');
    const deleteCartButtonRef = useRef(null);
    const [show, setShow] = useState(false);
    const handleClose = () => { setShow(false); setIsLoading(false); };
    const handleShow = () => setShow(true);
    const [isLoading, setIsLoading] = useState(false);

    const {
        handleMouseEnter, handleMouseLeave, handleDelete, handleDeleteSuccessorError,
        handleCloseModal, deleteButtonStyle, containerStyle } =
        useMapButtonLogic({
            projectId: projectId,
            title: title,
            deleteButtonRef: deleteCartButtonRef,
            setShowModal
        });

    useEffect(() => {
        if (config?._data?.PortID !== undefined && config._data.PortID !== "") {
            serverPort = config?._data?.PortID;
        }
    }, [serverPort]);

    useEffect(() => {
        var CartButton = document.getElementById('cartButton');

        if (CartButton) {
            const cartContainer = document.getElementById('cartContainer');
            if (CartButton && olMap && cartContainer != null) {
                CartButton.append(cartContainer);
            }
        }
        const registeredUser = sessionStorage.getItem('username');
        const cartDisable = document.getElementById(title);
        if (registeredUser) {
            if (cartDisable) {
                cartDisable.disabled = false;
            }
        } else if (cartDisable) {
            cartDisable.disabled = true;
        }

    }, [olMap]);

    const handleDeleteClick = (item, e) => {
        e.stopPropagation()
        removeItem(item)
    };

    const handleCart = () => {
        toggleBaseMapOverLayPanel(false);
        toggleAttributeQueryOverLayPanel(false);
        toggleMeasureOverLayPanel(false);
        toggleLayersSidebar(false);
        handleShow();
    }

    const downloadMap = async (checkedItems) => {

        // Filter out duplicate entries based on id and chartnumber
        const uniqueItems = checkedItems.filter((item, index, self) =>
            index === self.findIndex(i => i.ID === item.ID && i.chartnumber === item.chartnumber)
        );

        const spatialquery = uniqueItems;
        const dataArray = spatialquery.length > 0 ? spatialquery : [];
        const itemsS1412 = dataArray.filter(item => item.layername === "S-1412" || item.ID);
        const otherItems = dataArray.filter(item => item.layername !== "S-1412");

        const selecteddate = selectedCalenderDate;
        const day = ('0' + selecteddate.getDate()).slice(-2);
        const month = ('0' + (selecteddate.getMonth() + 1)).slice(-2);
        const year = selecteddate.getFullYear();
        const finalDate = `${year}-${month}-${day}`;
        const [yearStr, monthStr, dayStr] = finalDate.split('-');
        const finalmonth = parseInt(monthStr, 10);
        const finalday = parseInt(dayStr, 10);
        const finalyear = parseInt(yearStr, 10);
        const windPoints = [];

        itemsS1412.forEach(item => {
            const numWindpoints = item.ID !== undefined
            for (let i = 0; i < numWindpoints; i++) {
                windPoints.push({
                    year: finalyear,
                    month: finalmonth,
                    hour: 0,
                    day: finalday,
                    leftlon: item.left || '',
                    toplat: item.top || '',
                    rightlon: item.right || '',
                    bottomlat: item.bottom || '',
                });
            }
        });

        const dynamicUrl = (serverPort === rootConfig.AppBuilderPort)
            ? `${rootConfig["app-builder-NodeServerUrl"]}/windpointsfromsail?`
            : `${rootConfig["downloaded-app-ServerUrl"]}/windpointsfromsail?`;

        try {
            let listArray = [];
            setIsLoading(true);
            const apiResponses = await Promise.all(windPoints.map(async (queryParamsObject) => {
                const response = await axios.get(dynamicUrl + new URLSearchParams(queryParamsObject).toString());
                const sailtimerobj = response.data;
                const firstObject = Object.values(sailtimerobj)[0];
                if (firstObject === 'Datetime of request is in the past.') {
                    showAlert('warning', 'Cart', firstObject);
                    return firstObject;
                }
                const obj = JSON.parse(response.data);
                const windpointsfromsail = obj["NOAA GFS"]["data"]
                return windpointsfromsail
            }));

            listArray = listArray.concat(...apiResponses);

            const chunkSize = 9;
            const chunkedArrays = [];
            for (let i = 0; i < listArray.length; i += chunkSize) {
                chunkedArrays.push(listArray.slice(i, i + chunkSize));
            }

            const windgridData = itemsS1412.map((item, index) => ({
                gridId: item.ID !== undefined ? item.ID : '',
                date: finalDate,
                bottomlat: item.bottom || '',
                leftlon: item.left || '',
                rightlon: item.right || '',
                toplat: item.top || '',

                windPoints: chunkedArrays[index].map(chunkItem => ({
                    latitude: chunkItem.latitude || 0,
                    longitude: chunkItem.longitude || 0,
                    windSpeed: chunkItem.windSpeed || 0,
                    windDirection: chunkItem.windDirection || 0
                }))
            }));

            const storedItems = spatialquery.map(item => item.chartnumber || '');
            const nonEmptyFiles = storedItems.filter(item => item !== '');
            const countryCode = otherItems.length > 0 && otherItems[0].country_code ? otherItems[0].country_code : 'CA';
            const producerCode = otherItems.length > 0 && otherItems[0].producercode ? otherItems[0].producercode : 'CCG';
            const requestBody = {
                files: nonEmptyFiles.length > 0 ? nonEmptyFiles : [],
                countryname: countryCode,
                agencycode: producerCode,
                windgrid: windgridData
            };

            console.log("requestBody", requestBody);

            try {
                const response = await fetch(`${rootConfig.dashBoardApiUrl}/exchangeset/download`, {
                    method: 'POST',
                    body: JSON.stringify(requestBody),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const contentDisposition = response.headers.get('content-disposition');
                    const filenameMatch = contentDisposition && contentDisposition.match(/filename=(.+)$/);

                    const filename = filenameMatch ? filenameMatch[1] : 'download.zip';

                    // Convert response data to blob
                    const blob = await response.blob();
                    const link = document.createElement('a');
                    link.href = window.URL.createObjectURL(blob);
                    link.download = filename;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
                setIsLoading(false);

            } catch (error) {
                console.error('Fetch error:', error);
                setIsLoading(false);

            }

        } catch (error) {
            console.error('Error:', error);
            setIsLoading(false);

        }
        setIsLoading(false);

    };

    useEffect(() => {
        const storedCheckedItemsString = sessionStorage.getItem('checkedItems');
        console.log("storedCheckedItemsString:", storedCheckedItemsString);
        const storedCheckedItems = JSON.parse(storedCheckedItemsString);
        console.log("storedCheckedItems:", storedCheckedItems);
        if (storedCheckedItems && storedCheckedItems.length > 0) {
            console.log("storedCheckedItems is not empty. Setting checkedItems state.");
            setCheckedItems(storedCheckedItems);
            //  setIsLoading(false); 
        } else {
            //  setIsLoading(false);
        }
    }, []);


    useEffect(() => {

        sessionStorage.removeItem('checkedItems');

        if (sessionStorage.getItem('sessionId')) {
            sessionStorage.setItem('checkedItems', JSON.stringify(checkedItems));
            console.log("checkedItems stored in sessionStorage:", checkedItems);
        }
    }, [checkedItems, setCheckedItems]);

    return (
        <>
            <div id='cartContainer' style={containerStyle}>
                <StyledMapControlButton title={title} id={title} className='me-1 p-1 mb-1'
                    onClick={handleCart}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <i className="bi bi-cart3" />
                    <span className="px-1 py-0 bg-danger rounded-circle cartcount">{checkedItems.reduce((count, item, index, self) => {
                        if (self.findIndex(i => i.ID === item.ID && i.chartnumber === item.chartnumber) === index) {
                            count++;
                        }
                        return count;
                    }, 0)}</span>
                </StyledMapControlButton>
                <button ref={deleteCartButtonRef} onClick={handleDelete} className="btn-sm btn btn-danger" id="cartDeletebutton" style={deleteButtonStyle}>
                    <i className="bi bi-x-lg"></i>
                </button>
            </div>

            <Modal show={show} onHide={handleClose} centered id="CartModalBox" size='xl' style={{ fontFamily: fontFamily }}>
                <Modal.Header className='d-flex justify-content-between align-items-center py-2 pe-2' style={{ backgroundColor: backgroundColor, color: textColor }}>
                    <Modal.Title><h6 className='mb-0'><i className='bi bi-cart3 me-2'></i>Cart Products</h6></Modal.Title>
                    <CloseButtonWrapper
                        onClick={handleClose}
                        className='ms-auto'
                    ><i className='bi bi-x'></i>
                    </CloseButtonWrapper>
                </Modal.Header>
                <Modal.Body>
                    {isLoading === true ? (
                        <StyledLoaderWraper>
                            <StyledLoaderInner />
                        </StyledLoaderWraper>
                    ) : null}
                    {checkedItems.length === 0 && (
                        <h4 className='mx-auto text-center text-secondary'>No items are added into cart</h4>
                    )}
                    <Accordion defaultActiveKey="0" style={{ maxHeight: '500px', overflowY: 'auto' }} className="cartListAccord">
                        {checkedItems.map((item, index) => {
                            // Check if the current item's ID already exists in any previous item
                            const isDuplicate = checkedItems.slice(0, index).some(prevItem =>
                                prevItem.ID === item.ID && prevItem.chartnumber === item.chartnumber
                            );
                            // Render the item only if it's not a duplicate
                            if (!isDuplicate) {
                                return (
                                    <Accordion.Item key={index} eventKey={index.toString()}>
                                        <Accordion.Header className="w-100">
                                            <Stack direction="horizontal" className='w-100 me-5'>
                                                <div className="p-2">
                                                    {item.ID}
                                                    {item.chartnumber}
                                                </div>
                                                <div className="p-2 ms-auto">
                                                    <i className="bi bi-trash text-danger" title="Delete" onClick={(e) => handleDeleteClick(item, e)}></i>
                                                </div>
                                            </Stack>
                                        </Accordion.Header>
                                        <Accordion.Body style={{ maxHeight: '200px', overflowY: 'auto' }} className='p-1'>
                                            <ListGroup>
                                                {Object.entries(item).map(([key, value]) => (
                                                    key !== 'layername' && (
                                                        <ListGroup.Item key={key} className='py-1'>
                                                            <strong>{key}:</strong> {value}
                                                        </ListGroup.Item>
                                                    )
                                                ))}
                                            </ListGroup>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                );
                            } else {
                                return null; // Skip rendering the item if it's a duplicate
                            }
                        })}
                    </Accordion>
                </Modal.Body>
                <Modal.Footer>
                    {checkedItems.length !== 0 && (
                        <StyledButton onClick={() => downloadMap(checkedItems)} id="downloadBtn">Download</StyledButton>
                    )}
                </Modal.Footer>
            </Modal>
            <MyModal
                show={showModal}
                title="Cart"
                content={modalContent}
                onHide={handleCloseModal}
                onSaveChanges={handleDeleteSuccessorError}
            />
        </>
    );
}

export default Cart;
