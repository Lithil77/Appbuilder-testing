import { useEffect, useContext, useState } from 'react';
import { OLMapContext } from "../OLMap";
import ScaleLine from "ol/control/ScaleLine";
import { useParams } from 'react-router-dom';
import ComponentService from '../../../Services/ComponentService';
import rootConfig from '../../../ExternalUrlConfig.json';
import FetchClient from '../../../ServiceClients/FetchClient';
import { useAlert } from '../../../CustomContext/AlertContext';
import MyModal from '../../General/Modal';

function Scale() {

    const OlMap = useContext(OLMapContext);
    const componentService = new ComponentService(FetchClient, rootConfig['app-builder-NodeServerUrl']);
    const { projectId } = useParams();
    const showAlert = useAlert();
    const [showModal, setShowModal] = useState(false);
    const [modalContent] = useState('Are you sure you want to delete the component ?');

    const handledelete = () => {

        const storedArrayAsString = localStorage.getItem('componentlist');
        const storedArray = JSON.parse(storedArrayAsString);
        if (storedArray.includes('Scale')) {
            setShowModal(true);
        } else {
            showAlert("warning", "Scale", "Please save component before delete.");
        }
    };
    const handleDeleteSuccessorError = async (event) => {
        const Component = 'Scale';
        let response = await componentService.deleteComponent(projectId, Component);
        if (response.status === 200) {
            showAlert('success', 'Scale', 'Component deleted Successfully.');
            setTimeout(() => {
                window.location.reload();
            }, 500);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    useEffect(() => {
        if (OlMap) {
            const scaleControl = new ScaleLine(
                {
                    units: 'metric',
                    bar: true,
                    steps: 4,
                    text: true,
                    minWidth: 120,
                }
            );
           // OlMap.addControl(scaleControl);
            if (OlMap) {
                OlMap.addControl(scaleControl);
                const style = document.createElement('style');
                style.innerHTML = `
                    .ol-scale-bar {
                     pointer-events: auto !important;
                    }
                  `;
                document.head.appendChild(style);

            let deleteButton;
            const scaleView = document.querySelector('.ol-scale-bar');

            if (scaleView) {
                scaleView.addEventListener('mouseenter', (event) => {
                    if (projectId) {
                        deleteButton = document.createElement('button');
                        deleteButton.className = 'scale-delete-button btn btn-sm btn-danger rounded-circle';
                        deleteButton.innerHTML = ' <i class="bi bi-x-lg"></i>';
                        deleteButton.style.backgroundColor = 'red';
                        deleteButton.addEventListener('click', (event) => {
                            event.stopPropagation();
                            if (projectId) {
                                handledelete('Scale');
                            }
                        });
                        if (OlMap && deleteButton) {
                            scaleView.appendChild(deleteButton);
                        }
                        scaleView.style.border = '1px solid red';
                    }
                });
                 scaleView.addEventListener('mouseleave', () => {
                    if (deleteButton) {
                        deleteButton.remove();
                        scaleView.style.border = '0px';
                    }
                });
            }
        }
    }
    }, [OlMap])
    return (
        <>
            <MyModal
                show={showModal}
                onHide={handleCloseModal}
                title="Scale"
                content={modalContent}
                onSaveChanges={handleDeleteSuccessorError}

            />
        </>
    );
}

export default Scale;