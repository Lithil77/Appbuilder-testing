import React, { useState, useContext, useRef, useEffect } from 'react'
import { OLMapContext } from '../OLMap';
import useMapButtonLogic from '../../../CustomHooks/useMapButtonControl';
import { useParams } from 'react-router-dom';
import MyModal from '../../General/Modal';
import { StyledMapControlButton } from '../../../CustomHooks/CustomStyledComponents';
import { OverLayPanelContext } from '../../../CustomContext/OverLayContext';
import { SidebarContext } from '../../../CustomContext/SidebarContext';
import { clearVectorSource } from '../../../Openlayers/MapLayerManager';
import DragBox from 'ol/interaction/DragBox';
import { TbZoomPan } from "react-icons/tb";

function ZoomWindow() {

  const [title] = useState('ZoomWindow');
  const olMap = useContext(OLMapContext);

  const { toggleBaseMapOverLayPanel, toggleMeasureOverLayPanel,
    toggleAttributeQueryOverLayPanel, toggleFeatureInfoFlag, unregisterClickHandlers, updateZoomWindowBtnFlag,
    updateZoomWindowButtonActive, zoomWindowBtnFlag, zoomWindowButtonActive, dragBoxRef,
    removeZoomWindowFunctionality, deactiveAttributeQueryActivities } = useContext(OverLayPanelContext);

  const { toggleSidebar, toggleLayersSidebar, toggleFeatureInfoSidebar } = useContext(SidebarContext);

  const { projectId } = useParams();
  const deleteZoomWindowRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [modalContent] = useState('Are you sure you want to delete the Zoom Window component ?');

  const {
    handleMouseEnter, handleMouseLeave, handleDelete, handleDeleteSuccessorError, handleCloseModal, deleteButtonStyle, containerStyle } =
    useMapButtonLogic({
      projectId: projectId,
      title: title,
      deleteButtonRef: deleteZoomWindowRef,
      setShowModal
    });

  useEffect(() => {
    var zoomWindowbutton = document.getElementById('zoomWindowbutton');
    if (zoomWindowbutton) {
      const zoomWindowContainer = document.getElementById('zoomWindowContainer');
      if (zoomWindowbutton && olMap && zoomWindowContainer != null) {
        zoomWindowbutton.append(zoomWindowContainer);
      }
    }

  }, [olMap]);

  const handleZoomWindow = () => {
    if (olMap) {
      toggleSidebar(false);
      toggleFeatureInfoSidebar(false);
      toggleLayersSidebar(false);
      toggleBaseMapOverLayPanel(false);
      toggleMeasureOverLayPanel(false);
      toggleAttributeQueryOverLayPanel(false);
      toggleFeatureInfoFlag(false);
      unregisterClickHandlers(olMap, 'zoomWindow');
      deactiveAttributeQueryActivities();

      for (let index = 0; index < 10; index++) {
        clearVectorSource(olMap);
      }

      if (zoomWindowBtnFlag) {
        zoomWindowFunctionality();
        updateZoomWindowBtnFlag(false);
        updateZoomWindowButtonActive(true);

      }
      else {
        removeZoomWindowFunctionality(olMap);
        updateZoomWindowBtnFlag(true);
        updateZoomWindowButtonActive(false);
      }
    }
  }

  const zoomWindowFunctionality = () => {
    const dragBox = new DragBox({
      condition: function (event) {
        return event.type === 'pointerdown';
      },
      style: {
        stroke: {
          color: 'rgba(0, 0, 255, 1)',
        },
        fill: {
          color: 'rgba(0, 0, 255, 0.1)',
        },
      },
    });

    olMap.addInteraction(dragBox);
    dragBoxRef.current = dragBox;

    dragBox.on('boxend', function () {
      const extent = dragBox.getGeometry().getExtent();
      olMap.getView().fit(extent, { duration: 1000 });
    });
  }

  return (
    <div id='zoomWindowContainer' style={containerStyle}>
      <StyledMapControlButton
        title="ZoomWindow" id={title}
        active={zoomWindowButtonActive} className={`p-1 mb-1 drawBtn ${zoomWindowButtonActive ? 'active' : ''}`}
        onClick={handleZoomWindow}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <TbZoomPan style={{width: '24px', height: '24px', position: 'relative', bottom: '3px'}}/>
      </StyledMapControlButton>
      <button ref={deleteZoomWindowRef} onClick={handleDelete} className="btn-sm btn btn-danger" id="zoomWindowDeletebutton" style={deleteButtonStyle}>
        <i className="bi bi-x-lg"></i>
      </button>
      <MyModal
        show={showModal}
        title="Zoom window"
        content={modalContent}
        onHide={handleCloseModal}
        onSaveChanges={handleDeleteSuccessorError}
      />
    </div>
  )
}

export default ZoomWindow;