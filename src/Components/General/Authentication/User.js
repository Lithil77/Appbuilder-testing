import React, { useState, useEffect, useContext, useRef } from 'react';
import { OLMapContext } from '../../Map/OLMap';
import { Control } from 'ol/control';
import useMapButtonLogic from '../../../CustomHooks/useMapButtonControl';
import { useParams } from 'react-router-dom';
import MyModal from '../../General/Modal';
import UserProfile from './UserProfile';

function User() {
    const olMap = useContext(OLMapContext);
    const { projectId } = useParams();
    const deleteHomeButtonRef = useRef(null);
    const [showModal, setShowModal] = useState(false);
    const [modalContent] = useState('Are you sure you want to delete the profile component ?');
    const [title] = useState('User');
    const {
        handleMouseEnter, handleMouseLeave, handleDelete, handleDeleteSuccessorError, handleCloseModal, deleteButtonStyle, containerStyle } =
        useMapButtonLogic({
            projectId: projectId,
            title: title,
            deleteButtonRef: deleteHomeButtonRef,
            setShowModal
        });

    useEffect(() => {
        var ProfileButton = document.getElementById('profileButton');
        if (ProfileButton) {
            const ProfileContainer = document.getElementById('ProfileContainer');
            if (ProfileButton && olMap && ProfileContainer != null) {
                ProfileButton.append(ProfileContainer);
            }
        }
    }, [olMap]);

    return (
        <>
            <div id="ProfileContainer" style={{ position: 'relative' }} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                <UserProfile />
                <button ref={deleteHomeButtonRef} onClick={handleDelete} className="btn-sm btn btn-danger" id="profileDeletebutton" style={deleteButtonStyle}>
                    <i className="bi bi-x-lg"></i>
                </button>
            </div>
            <MyModal
                show={showModal}
                title="User"
                content={modalContent}
                onHide={handleCloseModal}
                onSaveChanges={handleDeleteSuccessorError}
            />
        </>
    );
}

export default User;