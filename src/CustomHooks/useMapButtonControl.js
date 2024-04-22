import ComponentService from '../Services/ComponentService';
import FetchClient from '../ServiceClients/FetchClient';
import rootConfig from '../ExternalUrlConfig.json';
import { useAlert } from '../CustomContext/AlertContext';
import projectTitle from '../utils/ApplicationTitleConfig'

function useMapButtonLogic({ projectId, title, deleteButtonRef, setShowModal }) {

    const showAlert = useAlert();

    const handleMouseEnter = () => {

        if (projectId && deleteButtonRef.current !== null) {
            deleteButtonRef.current.style.display = 'block';
        } else {
            deleteButtonRef.current.style.display = 'none';
        }
    }

    const handleMouseLeave = () => {

        if (deleteButtonRef.current === null) {
            return;
        }
        const delay = 2500;
        const timeoutId = setTimeout(() => {
            if (deleteButtonRef && deleteButtonRef.current) {
                if (deleteButtonRef.current.style) {
                    deleteButtonRef.current.style.display = 'none';
                }
            }
            clearTimeout(timeoutId);
        }, delay);
    }

    const handleDelete = async () => {
        const componentName = title;
        const storedComponentList = JSON.parse(localStorage.getItem('componentlist'));
        if (storedComponentList.includes(componentName)) {
            setShowModal(true);
        } else {
            showAlert("warning", `${componentName}`, "Please save component before delete.");
        }
    };

    const handleDeleteSuccessorError = async () => {
        const componentService = new ComponentService(FetchClient, rootConfig['app-builder-NodeServerUrl']);
        const componentName = title;
        let response = await componentService.deleteComponent(projectId, componentName);
        if (response.status === 200) {
            showAlert('success', `${componentName}`, `Component deleted successfully.`);
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        }
    }
    const handleCloseModal = () => {
        setShowModal(false);
    };

    const deleteButtonStyle = {
        width: '20px',
        height: '20px',
        position: 'absolute',
        display: "none",
        fontSize: '12px',
        lineHeight: '12px',
        top: '1px',
        right: '5px',
        zIndex: '9999',
        textAlign: 'center',
        padding: '0',
        borderRadius: '50%',
    };

    const containerStyle = {
        position: 'relative'
    }

    const buttonStyleClass = "me-1 p-1 mb-1 oscAppBtn".split(' ');

    return {
        handleMouseEnter,
        handleMouseLeave,
        handleDelete,
        handleDeleteSuccessorError,
        handleCloseModal,
        deleteButtonStyle,
        containerStyle,
        buttonStyleClass,
    };
}

export default useMapButtonLogic;
