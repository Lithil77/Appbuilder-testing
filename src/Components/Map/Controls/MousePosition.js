import React, { useEffect, useContext, useState } from 'react';
import { OLMapContext } from "../OLMap";
import MousePosition from "ol/control/MousePosition";
import { useParams } from 'react-router-dom';
import ComponentService from '../../../Services/ComponentService';
import rootConfig from '../../../ExternalUrlConfig.json';
import FetchClient from '../../../ServiceClients/FetchClient';
import { useAlert } from '../../../CustomContext/AlertContext';
import MyModal from '../../General/Modal';

/* ---------------------------------------------------
                Mouse Position
----------------------------------------------------- */
function Mouse_Position() {

    const OlMap = useContext(OLMapContext);
    const componentService = new ComponentService(FetchClient, rootConfig['app-builder-NodeServerUrl']);
    const { projectId } = useParams();
    const showAlert = useAlert();
    const [showModal, setShowModal] = useState(false);
    const [modalContent] = useState('Are you sure you want to delete the component ?');

    const handledelete = () => {
        const storedArrayAsString = localStorage.getItem('componentlist');
        const storedArray = JSON.parse(storedArrayAsString);
        if (storedArray.includes('MousePosition')) {
            setShowModal(true);
        } else {
            showAlert("warning", "Mouse Position", "Please save component before delete.");
        }
    };
    const handleDeleteSuccessorError = async (event) => {
        const Component = 'MousePosition';
        let response = await componentService.deleteComponent(projectId, Component);
        if (response.status === 200) {
            showAlert('success', 'Mouse Position', 'Component deleted Successfully.');
            setTimeout(() => {
                window.location.reload();
            }, 500);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    useEffect(() => {

        let mapContainer = document.getElementById('map-container');
        const mousePosition = document.getElementById('mouse-position');

        if (OlMap && mousePosition && mapContainer) {
            mapContainer.append(mousePosition);

            const customCoordinateFormat = function (coordinate) {
                return `Long: ${coordinate[0].toFixed(2)} Lat: ${coordinate[1].toFixed(2)}`;
            };

            const mousePositionControl = new MousePosition({
                coordinateFormat: customCoordinateFormat,
                projection: 'EPSG:4326',
                className: 'custom-mouse-position',
                target: mousePosition,
                undefinedHTML: 'Mouse not hovering on the map',
            });

            OlMap.addControl(mousePositionControl);
            let deleteButton;

            if (mousePosition) {
                mousePosition.addEventListener('mouseenter', (event) => {
                    if (projectId) {
                        deleteButton = document.createElement('button');
                        deleteButton.className = 'mouseposition-delete-button btn btn-sm btn-danger rounded-circle';
                        deleteButton.innerHTML = ' <i class="bi bi-x-lg"></i>';
                        deleteButton.style.backgroundColor = 'red';
                        deleteButton.addEventListener('click', (event) => {
                            event.stopPropagation();
                            if (projectId) {
                                handledelete('MousePosition');
                            }
                        });
                        if (OlMap && deleteButton) {
                            mousePosition.appendChild(deleteButton);
                        }
                        mousePosition.style.border = '1px solid red';
                    }
                });
                mousePosition.addEventListener('mouseleave', () => {
                    if (deleteButton) {
                        deleteButton.remove();
                        mousePosition.style.border = '0px';
                    }
                });
            }

            return () => {
                OlMap.removeControl(mousePositionControl);
            };
        }

    }, [OlMap]);

    return (
        <>
            <div id="mouse-position" className='mouse-position'></div>
            <MyModal
                show={showModal}
                onHide={handleCloseModal}
                title="Mouse Position"
                content={modalContent}
                onSaveChanges={handleDeleteSuccessorError}

            />
        </>
    )
}

export default Mouse_Position;