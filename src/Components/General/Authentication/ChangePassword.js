import React, { useState } from 'react';
import { Button, Card, Container, Form, Row, Modal } from 'react-bootstrap'
import { useColor } from '../../../CustomContext/ColorContext';
import { useAlert } from "../../../CustomContext/AlertContext";
import logoimg from '../../../assets/images/OSCLogo.png';
import SignUp from './SignUp';
import ForgotPassword from './ForgotPassword';
import rootConfig from "../../../ExternalUrlConfig.json";
import { StyledButton } from '../../../CustomHooks/CustomStyledComponents';
import { useNavigate } from 'react-router-dom';
import { StyledLoaderWraper, StyledLoaderInner } from '../../../CustomHooks/CustomStyledComponents';

function ChangePassword({ show, onHide, fullscreen }) {

    const { backgroundColor, textColor, borderColor, fontFamily, typoColor } = useColor();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState('');
    const [newpassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const showAlert = useAlert();
    const [usernameError, setusernameError] = useState("");
    const [passwordError, setPasswordError] = useState('');
    const [newpasswordError, setNewPasswordError] = useState('');

    const navigate = useNavigate();



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

        if (!password) {
            setPasswordError("OldPassword should not be empty.");
            formIsValid = false;

      /*   } else if (!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%"^&*()_+=\-[\]{};:'",.<>?/\\|])(?=.*\d).{8,20}$/)) {
            setPasswordError("invalid password");
            formIsValid = false; */
        }
        else {
            setPasswordError("");
        }
        if (!newpassword) {
            setNewPasswordError("NewPassword should not be empty.");
            formIsValid = false;

        } else if (!newpassword.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%"^&*()_+=\-[\]{};:'",.<>?/\\|])(?=.*\d).{8,20}$/)) {
            setNewPasswordError("Password should be atleast 1 uppercase, lowercase, numbers, and symbols.");
            formIsValid = false;
        }
        else {
            setNewPasswordError("");
        }
        return formIsValid;
    };

    const handleUsernameChange = (event) => {
        setUsername(event.target.value);
        if (event.target.value && usernameError) {
            setusernameError("");
        }
    };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
        if (event.target.value && passwordError) {
            setPasswordError("");
        }
    };

    const handleNewPasswordChange = (event) => {
        setNewPassword(event.target.value);
        if (event.target.value && newpasswordError) {
            setNewPasswordError("");
        }
    };

    
    const ClearForm = ()=>{
        var form = document.getElementById("loginform");
        form.reset();
        setUsername('');
        setPassword('');
        setNewPassword('');
    }
    const UpdatePasswordSubmit = async (e) => {
        e.preventDefault();
        if (handleValidation()) {
            let updatepasswordobject = {
                'userName': username,
                'oldpassword': password,
                'newpassword': newpassword
            };
            const queryParams = new URLSearchParams(updatepasswordobject);
            try {
                setLoading(true);
                const apiUrl = `${rootConfig.AuthenticationURL}/user/changepassword?${queryParams.toString()}`;
    
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
    
                const result = await response.text();

                if (result === "password changed") {
                    setLoading(false);
                    showAlert('success', 'Change password', result);
                    ClearForm();
                    onHide();
                } else {
                    ClearForm();
                    setLoading(false);
                    showAlert('warning', 'Change password', result);
                } 
            } catch (error) {
                console.error('Fetch error:', error);
                ClearForm();
                setLoading(false);
                showAlert('danger', 'Change password', 'Password update failed due to network error, Please try after some time.');
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
        <Modal.Header closeButton className='border-0 position-absolute' style={{ zIndex: '999', top: '10px', right: '10px' }}>

        </Modal.Header>
        <Modal.Body className='p-0 d-flex flex-wrap align-content-center align-items-center bblury'>
                    <Container>
                        <div className='d-flex align-items-center' style={{height: '100vh'}}>
                        <Card className='col-sm-12 col-md-9 mx-auto bg-transparent border-0 px-0'>
                            <Card.Body className='p-4' style={{ position: 'relative' }}>
                                <div className='bordermask_hz'></div>
                                <div className='bordermask_hz_bottom'></div>
                                <div className='bordermask_vr heigh_1'></div>
                                <div className='bordermask_vr_end heigh_1'></div>
                                <Row className='m-0 p-0'>
                                    <Card className='col-sm-12 col-md-6 shadow rounded-start rounded-0 bgsvg text-white'>
                                        <Card.Body className='d-flex align-items-center text-center'>
                                            <div className='text-center w-100'>
                                                <Card.Img src={logoimg} style={{ width: '200px' }}></Card.Img>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                    
                                        <Card className='col-sm-12 col-md-6 shadow rounded-end rounded-0 px-0 border-0'>
                                            <Card.Title className='text-center'><h4 className="p-0 my-2 main-heading mb-0" style={{ color: typoColor, fontFamily: fontFamily }}>Change password</h4></Card.Title>
                                            <Card.Body className='linearBgCard'>
                                                <Form id="loginform" onSubmit={UpdatePasswordSubmit} className='bgovelshaped' style={{fontFamily: fontFamily}}>
                                                    <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                                                        {/* <Form.Label style={{ color: typoColor }}>User Name</Form.Label> */}
                                                        <Form.Control type="text" placeholder="UserName"
                                                            style={{ borderColor: borderColor, color: typoColor, fontFamily: fontFamily }}
                                                            value={username}
                                                            onChange={handleUsernameChange} autoComplete='off'/>
                                                        <small id="usernameHelp" className="text-danger form-text">
                                                            {usernameError}
                                                        </small>
                                                    </Form.Group>
                                                    <Form.Group className="mb-3" controlId="exampleForm.ControlInput2">
                                                        {/* <Form.Label style={{ color: typoColor }}>Password</Form.Label> */}
                                                        <Form.Control type="password" placeholder="OldPassword"
                                                            style={{ borderColor: borderColor, color: typoColor, fontFamily: fontFamily }}
                                                            value={password}
                                                            onChange={handlePasswordChange} />
                                                        <small id="passwordHelp" className="text-danger form-text">
                                                            {passwordError}
                                                        </small>
                                                    </Form.Group>
                                                    <Form.Group className="mb-3" controlId="exampleForm.ControlInput3">
                                                        {/* <Form.Label style={{ color: typoColor }}>Password</Form.Label> */}
                                                        <Form.Control type="password" placeholder="NewPassword"
                                                            style={{ borderColor: borderColor, color: typoColor, fontFamily: fontFamily }}
                                                            value={newpassword}
                                                            onChange={handleNewPasswordChange} />
                                                        <small id="passwordHelp" className="text-danger form-text">
                                                            {newpasswordError}
                                                        </small>
                                                    </Form.Group>
                                                  
                                                    <StyledButton type="submit" className="w-100 btn_clr">
                                                        UpdatePassword
                                                    </StyledButton>
                                                    
                                                </Form>
                                            </Card.Body>
                                        </Card>
                                </Row>
                            </Card.Body>
                        </Card>
                        </div>
                    </Container>
                   
           </Modal.Body>
           </Modal>
        </>
    );
}

export default ChangePassword;
