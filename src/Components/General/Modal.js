import React from 'react';
import { Modal } from 'react-bootstrap';
import { useColor } from '../../CustomContext/ColorContext';
import CloseButtonWrapper from '../../CustomHooks/closeButton';
import { StyledButton } from '../../CustomHooks/CustomStyledComponents';

function MyModal({ show, onHide, content, onSaveChanges, title }) {

    const handleSaveChangesClick = () => {
        onSaveChanges();
        if(title!=='Session Expired')
        {
        onHide();
        }
    };
    const {backgroundColor, textColor} = useColor();
    return (
        <Modal show={show} onHide={onHide} centered className='confiramtionDialog' backdrop={false}>
            <Modal.Header className='d-flex justify-content-between align-items-center py-1 pe-2' style={{backgroundColor: backgroundColor, color: textColor}}>
                <Modal.Title className='d-flex align-items-center' style={{color: textColor}}><i className="bi bi-exclamation-circle-fill me-2"></i>
                    <h6 className='mb-0' style={{color: textColor}}>{title}</h6>
                </Modal.Title>
                <CloseButtonWrapper
                        onClick={onHide}   
                        className='ms-auto'
                        ><i className='bi bi-x'></i>
                    </CloseButtonWrapper>
            </Modal.Header>
            <Modal.Body>{content}</Modal.Body>
            <Modal.Footer className='py-1'>
                <StyledButton variant="warning" onClick={handleSaveChangesClick}>
                    Yes
                </StyledButton>
                <StyledButton variant="secondary" onClick={onHide}>
                    No
                </StyledButton>
            </Modal.Footer>
        </Modal>
    );
}

export default MyModal;
