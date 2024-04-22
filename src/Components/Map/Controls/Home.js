import React, { useEffect, useState, useContext, useRef } from 'react'
import { OLMapContext } from "../OLMap";
import { useParams } from 'react-router-dom';
import useMapButtonLogic from '../../../CustomHooks/useMapButtonControl';
import { setHomeView } from '../../../Openlayers/MapNavigationActions';
import MyModal from '../../General/Modal';
import { StyledMapControlButton } from '../../../CustomHooks/CustomStyledComponents';
import { OverLayPanelContext } from '../../../CustomContext/OverLayContext';
import { SidebarContext } from '../../../CustomContext/SidebarContext';
import { clearVectorSource } from '../../../Openlayers/MapLayerManager';

function Home() {

    const [title] = useState('Home');
    const [center] = useState([0, 0]);

    const olMap = useContext(OLMapContext);

    const { toggleBaseMapOverLayPanel, toggleMeasureOverLayPanel, toggleAttributeQueryOverLayPanel,
        toggleFeatureInfoFlag, unregisterClickHandlers, updateZoomWindowButtonActive, removeZoomWindowFunctionality,
        deactiveAttributeQueryActivities } = useContext(OverLayPanelContext);

    const { toggleSidebar, toggleLayersSidebar, toggleFeatureInfoSidebar } = useContext(SidebarContext);

    const { projectId } = useParams();
    const deleteHomeButtonRef = useRef(null);
    const [showModal, setShowModal] = useState(false);
    const [modalContent] = useState('Are you sure you want to delete the home component ?');

    const {
        handleMouseEnter, handleMouseLeave, handleDelete, handleDeleteSuccessorError, handleCloseModal, deleteButtonStyle, containerStyle } =
        useMapButtonLogic({
            projectId: projectId,
            title: title,
            deleteButtonRef: deleteHomeButtonRef,
            setShowModal
        });

    useEffect(() => {
        var HomeButton = document.getElementById('homebutton');
        if (HomeButton) {
            const homeContainer = document.getElementById('homeContainer');
            if (HomeButton && olMap && homeContainer != null) {
                HomeButton.append(homeContainer);
            }
        }

    }, [olMap]);

    const handleHome = () => {
        if (olMap) {
            toggleSidebar(false);
            toggleFeatureInfoSidebar(false);
            toggleLayersSidebar(false);
            toggleBaseMapOverLayPanel(false);
            toggleMeasureOverLayPanel(false);
            toggleAttributeQueryOverLayPanel(false);
            toggleFeatureInfoFlag(false);
            unregisterClickHandlers(olMap, 'Home');
            setHomeView(olMap, center);
            updateZoomWindowButtonActive(false);
            removeZoomWindowFunctionality(olMap);
            deactiveAttributeQueryActivities();

            for (let index = 0; index < 10; index++) {
                clearVectorSource(olMap);
            }
        }
    }

    return (
        <div id='homeContainer' style={containerStyle}>
            <StyledMapControlButton
                title="Zoom Extent" id={title}
                className='p-1 mb-1'
                onClick={handleHome}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <i className="bi bi-arrows-fullscreen" />
            </StyledMapControlButton>
            <button ref={deleteHomeButtonRef} onClick={handleDelete} className="btn-sm btn btn-danger" id="homeDeletebutton" style={deleteButtonStyle}>
                <i className="bi bi-x-lg"></i>
            </button>
            <MyModal
                show={showModal}
                title="Home"
                content={modalContent}
                onHide={handleCloseModal}
                onSaveChanges={handleDeleteSuccessorError}
            />
        </div>
    );
}

export default Home;