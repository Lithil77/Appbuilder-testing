import React, { useEffect, useState, useContext, useRef } from 'react'
import Control from "ol/control/Control";
import { OLMapContext } from "../OLMap";
import { useParams } from 'react-router-dom';
import useMapButtonLogic from '../../../CustomHooks/useMapButtonControl';
import { setZoomIn } from '../../../Openlayers/MapNavigationActions.js';
import MyModal from '../../General/Modal';
import { StyledMapControlButton } from '../../../CustomHooks/CustomStyledComponents.js';
import { OverLayPanelContext } from '../../../CustomContext/OverLayContext';
import { SidebarContext } from '../../../CustomContext/SidebarContext';

function ZoomIn() {

    const [title] = useState('ZoomIn');

    const olMap = useContext(OLMapContext);

    const { toggleBaseMapOverLayPanel, toggleMeasureOverLayPanel,
        toggleAttributeQueryOverLayPanel, toggleFeatureInfoFlag,
        unregisterClickHandlers, updateZoomWindowButtonActive,
        removeZoomWindowFunctionality, deactiveAttributeQueryActivities } = useContext(OverLayPanelContext);

    const { projectId } = useParams();
    const deleteZoomInButtonRef = useRef(null);
    const [showModal, setShowModal] = useState(false);

    const [modalContent] = useState('Are you sure you want to delete the zoom in component ?');

    const {
        handleMouseEnter, handleMouseLeave, handleDelete, handleDeleteSuccessorError,
        handleCloseModal, deleteButtonStyle, containerStyle } =
        useMapButtonLogic({
            projectId: projectId,
            title: title,
            deleteButtonRef: deleteZoomInButtonRef,
            setShowModal
        });

    useEffect(() => {
        var ZoomInButton = document.getElementById('zoominbutton');
        const zoomInContainer = document.getElementById('zoomInContainer');
        if (ZoomInButton && olMap && zoomInContainer != null) {
            ZoomInButton.append(zoomInContainer);
        }
    }, [olMap]);

    const handleZoomIn = () => {
        toggleBaseMapOverLayPanel(false);
        toggleAttributeQueryOverLayPanel(false);
        toggleMeasureOverLayPanel(false);
        toggleFeatureInfoFlag(false);
        unregisterClickHandlers(olMap, title);
        updateZoomWindowButtonActive(false);
        removeZoomWindowFunctionality(olMap);
        deactiveAttributeQueryActivities();
        setZoomIn(olMap);
    }

    return (
        <div id='zoomInContainer' style={containerStyle}>
            <StyledMapControlButton title={title} id={title} className='p-1 mb-1'
                onClick={handleZoomIn}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <i className="bi bi-zoom-in" />
            </StyledMapControlButton>
            <button ref={deleteZoomInButtonRef} onClick={handleDelete} className="btn-sm btn btn-danger" id="zoomInDeletebutton" style={deleteButtonStyle}>
                <i className="bi bi-x-lg"></i>
            </button>
            <MyModal
                show={showModal}
                title="Zoom in"
                content={modalContent}
                onHide={handleCloseModal}
                onSaveChanges={handleDeleteSuccessorError}
            />
        </div>
    );
}

export default ZoomIn;