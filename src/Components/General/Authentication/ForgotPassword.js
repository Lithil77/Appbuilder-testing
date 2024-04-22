import React, { useState } from 'react';
import { Card, Form, Modal, Container, Row } from 'react-bootstrap'
import { useColor } from '../../../CustomContext/ColorContext';
import { useAlert } from "../../../CustomContext/AlertContext";
import rootConfig from "../../../ExternalUrlConfig.json";
import logoimg from '../../../assets/images/OSCLogo.png';
import { StyledButton } from '../../../CustomHooks/CustomStyledComponents';
import CloseButtonWrapper from '../../../CustomHooks/closeButton';
import { StyledLoaderWraper, StyledLoaderInner } from '../../../CustomHooks/CustomStyledComponents';
import projectTitle from "../../../../src/utils/ApplicationTitleConfig";

function ForgotPassword({ show, onHide, fullscreen }) {

    const { borderColor, fontFamily, typoColor } = useColor();
    const [username, setUsername] = useState("");
    const showAlert = useAlert();
    const [usernameError, setusernameError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleValidation = (event) => {
        let formIsValid = true;
        if (!username) {
            setusernameError("Username should not be empty.");
            formIsValid = false;
       /*  } else if (!username.match(/^[a-zA-Z0-9\-]{3,18}$/)) {
            setusernameError("Invalid Username.");
            formIsValid = false; */
        } else {
            setusernameError("");
        }
        return formIsValid;
    };

    const handleUsernameChange = (event) => {
        setUsername(event.target.value);
        if (event.target.value && usernameError) {
            setusernameError("");
        }
    };
    const ClearForm = ()=>{
        setUsername('');
        setusernameError('');
    }
    const handleClose = () => {
        ClearForm();
         onHide();
         };
    const forgotSubmit = async (e) => {
        e.preventDefault();
        if (handleValidation()) {
            const formData = new FormData();
            formData.append('userName', username);
            try{
                setLoading(true);
            const response = await fetch(`${rootConfig.AuthenticationURL}/user/forgotpassword`, {
                method: 'POST',
                body: formData
            });
            const result = await response.text();
            console.log(result);
            if (result ==='MAIL SENT TO REGISTERED EMAIL') {
                setLoading(false);
                showAlert('success', 'Reset Password', result.toLowerCase());
                setTimeout(() => {
                    window.location.reload();
                }, 5000);
            } else {
                ClearForm();
                setLoading(false);
                showAlert('warning', 'Reset Password', result);
            }
        } catch (error) {
            // Handle fetch errors
            console.error('Fetch error:', error);
            ClearForm();
            setLoading(false);
            showAlert('danger', 'Reset Password', 'Failed due to network error, Please try after some time.');
        }
        }
    };

    return (
        <>
        <Modal show={show} onHide={onHide} fullscreen={fullscreen} className="userModal">
        {loading && (
                <StyledLoaderWraper>
                    <StyledLoaderInner />
                </StyledLoaderWraper>
            )}
        <Modal.Header className='border-0 position-absolute' style={{ zIndex: '999', top: '10px', right: '10px' }}>
        <CloseButtonWrapper
                        onClick={handleClose}
                        className='ms-auto'
                    ><i className='bi bi-x'></i>
                    </CloseButtonWrapper>
        </Modal.Header>
        <Modal.Body className='p-0 d-flex flex-wrap align-content-center align-items-center bblury'>
            <Container>
            <Card className='col-sm-12 col-md-9 mx-auto bg-transparent border-0 px-0'>
                        <Card.Body className='p-4' style={{ position: 'relative' }}>
                            <div className='bordermask_hz'></div>
                            <div className='bordermask_hz_bottom'></div>
                            <div className='bordermask_vr'></div>
                            <div className='bordermask_vr_end'></div>
                            <Row className='m-0 p-0'>
                                <Card className='col-sm-12 col-md-6 shadow rounded-start rounded-0 bgsvg text-white'>
                                    <Card.Body className='d-flex align-items-center text-center'>
                                        <div className='text-center w-100'>
                                            <Card.Img src={projectTitle?._data?.image || logoimg} style={{ width: '200px' }}></Card.Img>
                                        </div>
                                    </Card.Body>
                                </Card>
                                <Card className='col-sm-12 col-md-6 shadow rounded-end rounded-0 px-0 border-0'>
                <Card.Title className='text-center'><h4 className="p-0 my-2 main-heading mb-0" style={{ color: typoColor, fontFamily: fontFamily }}>Forgot Password</h4></Card.Title>
                <Card.Body className='linearBgCard'>
                    <Form id="forgotform" onSubmit={forgotSubmit} className='bgovelshaped' style={{fontFamily: fontFamily}}>
                        <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                           {/*  <Form.Label style={{ color: typoColor }}>User Name</Form.Label> */}
                            <Form.Control type="text" placeholder="Username"
                                style={{ borderColor: borderColor }}
                                value={username}
                                onChange={handleUsernameChange}
                                autoComplete='off' />
                            <small id="usernameHelp" className="text-danger form-text">
                                {usernameError}
                            </small>
                        </Form.Group>
                        <StyledButton type="submit" className="w-100 btn_clr">
                           Submit
                        </StyledButton>
                    </Form>
                </Card.Body>
            </Card>
        </Row>
    </Card.Body>
    </Card>
</Container>
</Modal.Body>
</Modal>
</>
    );
}

export default ForgotPassword;
