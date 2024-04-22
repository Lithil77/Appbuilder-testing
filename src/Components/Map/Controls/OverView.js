import React, { useEffect, useContext, useState } from 'react';
import { OLMapContext } from "../OLMap";
import OSM from 'ol/source/OSM.js';
import TileLayer from 'ol/layer/Tile.js';
import { OverviewMap } from 'ol/control.js';
import { useColor } from '../../../CustomContext/ColorContext';
import { useParams } from 'react-router-dom';
import ComponentService from '../../../Services/ComponentService';
import rootConfig from '../../../ExternalUrlConfig.json';
import FetchClient from '../../../ServiceClients/FetchClient';
import { useAlert } from '../../../CustomContext/AlertContext';
import MyModal from '../../General/Modal';

/*Handling overview button is positioned on map*/
function OverView() {

    const map = useContext(OLMapContext);
    const { backgroundColor, textColor, borderColor } = useColor();
    const componentService = new ComponentService(FetchClient, rootConfig['app-builder-NodeServerUrl']);
    const { projectId } = useParams();
    const showAlert = useAlert();
    const [showModal, setShowModal] = useState(false);
    const [modalContent] = useState('Are you sure you want to delete the overview component ?');

    const handledelete = () => {

        const storedArrayAsString = localStorage.getItem('componentlist');
        const storedArray = JSON.parse(storedArrayAsString);
        if (storedArray.includes('OverView')) {
            setShowModal(true);
        } else {
            showAlert("warning", "Overview", "Please save component before delete.");
        }
    };
    const handleDeleteSuccessorError = async (event) => {
        const Component = 'OverView';
        let response = await componentService.deleteComponent(projectId, Component);
        if (response.status === 200) {
            showAlert('success', 'Overview', 'Component deleted Successfully.');
            setTimeout(() => {
                window.location.reload();
            }, 500);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    useEffect(() => {
        const source = new OSM();
        const overviewMapControl = new OverviewMap({
            className: 'ol-overviewmap',
            layers: [
                new TileLayer({
                    source: source,
                }),
            ],
        });

        if (map) {
            map.addControl(overviewMapControl);
            const style = document.createElement('style');
            style.innerHTML = `
                .ol-overviewmap button {
                  background-color: ${backgroundColor};
                  color: ${textColor};
                  border: 1px solid ${borderColor};
                  margin:0;
                  border-radius: 0.5rem !important;

                  &:hover,
                  &:focus,
                  &:active{
                    background-color: ${borderColor};
                    border-color: ${backgroundColor};
                    color: ${backgroundColor} !important;
                    box-shadow: none;
                  }
                }
              `;
            document.head.appendChild(style);

            let deleteButton;
            const overviewButton = document.querySelector('.ol-overviewmap button');

            if (overviewButton) {
                overviewButton.addEventListener('mouseenter', (event) => {
                    if (projectId) {
                        deleteButton = document.createElement('button');
                        deleteButton.className = 'overview-delete-button btn btn-sm btn-danger rounded-circle';
                        deleteButton.innerHTML = ' <i class="bi bi-x-lg"></i>';
                        deleteButton.style.backgroundColor = 'red';
                        deleteButton.addEventListener('click', (event) => {
                            event.stopPropagation();
                            if (projectId) {
                                handledelete('OverView');
                            }
                        });
                        if (map && deleteButton) {
                            overviewButton.appendChild(deleteButton);
                        }
                    }
                });
                overviewButton.addEventListener('mouseleave', () => {
                    if (deleteButton) {
                        deleteButton.remove();
                    }
                });
            }
        }
    }, [map, backgroundColor, textColor]);

    return (
        <>
            <MyModal
                show={showModal}
                onHide={handleCloseModal}
                title="Overview"
                content={modalContent}
                onSaveChanges={handleDeleteSuccessorError}

            />
        </>
    );
}

export default OverView;


