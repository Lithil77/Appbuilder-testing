import React, { useState } from 'react';
import { Alert, Button } from 'react-bootstrap';
import { useColor } from '../../CustomContext/ColorContext';
import CloseButtonWrapper from '../../CustomHooks/closeButton';
import { StyledButton } from '../../CustomHooks/CustomStyledComponents';

const AlertMessage = ({ type, title, message }) => {
    const [show, setShow] = useState(true);

    const handleClose = () => {
        setShow(false);
    };

    let alertIcon;

    if (type === 'success') {
        alertIcon = <i className="bi bi-check-circle-fill text-success"></i>;
    }
    else if (type === 'warning') {
        alertIcon = <i className="bi bi-exclamation-circle-fill text-warning"></i>;
    }
    else if (type === 'danger') {
        alertIcon = <i className="bi bi-x-circle text-danger"></i>;
    }
    if (show) {
        return (
            <Alert variant={type} className="alert-width position-absolute p-0 top-50 start-50" style={{ transform: 'translate(-50%, -50%)', zIndex: '9999' }}>
                <Alert.Heading className='py-2 px-3 mb-0'>
                    <div className="d-flex">
                        <span className="me-2">{alertIcon}</span>
                        <h5 className='mb-0'>{title}</h5>
                        <CloseButtonWrapper
                                onClick={handleClose}
                                className='ms-auto'
                             ><i className='bi bi-x'></i>
                            </CloseButtonWrapper>
                    </div>
                </Alert.Heading>
                <hr className='mt-0'/>
                <div className='px-3 py-2'>
                    <p className='mb-0'>{message}</p>
                </div>
                <hr className='mb-0'/>
                <div className="d-flex justify-content-end px-3 py-2">
                    <StyledButton onClick={handleClose} variant={type}>
                        Close
                    </StyledButton>
                </div>
            </Alert>
        );
    }
    return null;
};

export default AlertMessage;
