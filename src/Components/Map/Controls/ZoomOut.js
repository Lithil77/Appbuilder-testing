import React, { useEffect, useState, useContext, useRef } from 'react'
import Control from "ol/control/Control";
import { OLMapContext } from "../OLMap";
import { useParams } from 'react-router-dom';
import useMapButtonLogic from '../../../CustomHooks/useMapButtonControl';
import { setZoomOut } from '../../../Openlayers/MapNavigationActions.js';
import MyModal from '../../General/Modal';
import { StyledMapControlButton } from '../../../CustomHooks/CustomStyledComponents.js';
import { OverLayPanelContext } from '../../../CustomContext/OverLayContext';
import { SidebarContext } from '../../../CustomContext/SidebarContext';

function ZoomIn() {

    const [title] = useState('ZoomOut');

    const olMap = useContext(OLMapContext);
    const { toggleBaseMapOverLayPanel, toggleMeasureOverLayPanel,
        toggleAttributeQueryOverLayPanel, toggleFeatureInfoFlag,
        unregisterClickHandlers, updateZoomWindowButtonActive, 
        removeZoomWindowFunctionality ,deactiveAttributeQueryActivities} = useContext(OverLayPanelContext);
    const { projectId } = useParams();
    const deleteZoomOutButtonRef = useRef(null);
    const [showModal, setShowModal] = useState(false);
    const [modalContent] = useState('Are you sure you want to delete the zoom out component ?');
    const {
        handleMouseEnter, handleMouseLeave, handleDelete, handleDeleteSuccessorError,
        handleCloseModal, deleteButtonStyle, containerStyle } =
        useMapButtonLogic({
            projectId: projectId,
            title: title,
            deleteButtonRef: deleteZoomOutButtonRef,
            setShowModal
        });

    useEffect(() => {
        var ZoomOutButton = document.getElementById('zoomoutbutton');
        const zoomOutContainer = document.getElementById('zoomOutContainer');
        if (ZoomOutButton && olMap && zoomOutContainer != null) {
            ZoomOutButton.append(zoomOutContainer);
        }

    }, [olMap]);

    const handleZoomOut = () => {
        if (olMap) {
            toggleBaseMapOverLayPanel(false);
            toggleAttributeQueryOverLayPanel(false);
            toggleMeasureOverLayPanel(false);
            toggleFeatureInfoFlag(false);
            unregisterClickHandlers(olMap,title);
            updateZoomWindowButtonActive(false);
            removeZoomWindowFunctionality(olMap);
            setZoomOut(olMap)
            deactiveAttributeQueryActivities();
        }
    }

    return (
        <div id='zoomOutContainer' style={containerStyle}>
            <StyledMapControlButton title={title} id={title} className='p-1 mb-1'
                onClick={handleZoomOut}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <i className="bi bi-zoom-out" />
            </StyledMapControlButton>
            <button ref={deleteZoomOutButtonRef} onClick={handleDelete} className="btn-sm btn btn-danger" id="zoomOutDeletebutton" style={deleteButtonStyle}>
                <i className="bi bi-x-lg"></i>
            </button>
            <MyModal
                show={showModal}
                title="Zoom out"
                content={modalContent}
                onHide={handleCloseModal}
                onSaveChanges={handleDeleteSuccessorError}
            />
        </div>
    );
}

export default ZoomIn;