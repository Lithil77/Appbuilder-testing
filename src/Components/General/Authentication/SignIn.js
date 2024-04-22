import React, { useState } from 'react';
import { Button, Card, Container, Form, Row, Modal } from 'react-bootstrap'
import { useColor } from '../../../CustomContext/ColorContext';
import { useAlert } from "../../../CustomContext/AlertContext";
import logoimg from '../../../assets/images/OSCLogo.png';
import SignUp from './SignUp';
import ForgotPassword from './ForgotPassword';
import rootConfig from "../../../ExternalUrlConfig.json";
import { StyledButton } from '../../../CustomHooks/CustomStyledComponents';
import ValidateEmail from './ValidateEmail';
import CloseButtonWrapper from '../../../CustomHooks/closeButton';
import { StyledLoaderWraper, StyledLoaderInner } from '../../../CustomHooks/CustomStyledComponents';
import projectTitle from "../../../../src/utils/ApplicationTitleConfig";

function SignIn({ show, onHide, fullscreen }) {

    const { backgroundColor, textColor, borderColor, fontFamily, typoColor } = useColor();
    const [username, setUsername] = useState("");

    const [password, setPassword] = useState('');
    const showAlert = useAlert();
    const [usernameError, setusernameError] = useState("");
    
    const [passwordError, setPasswordError] = useState('');
    const [rememberMe, setRememberMe] = useState('');
    const [remembererror, setrememberError] = useState('');
    //const [Forgotshow, setForgotshow] = useState(false);
    const [logincard, setLogincardshow] = useState(true);
    const [Loginshow, setLoginshow] = useState(false);
    const handleLoginClose = () => setLoginshow(false);
    const [RegistartionShow, setRegistartionShow] = useState(false);
    const [forgotPasswordShow, setForgotPasswordShow] = useState(false);
    const [validateemailShow, setValidateEmailShow] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleRegistartionClose = () => setRegistartionShow(false);
    const handleForgotPageClose = () => setForgotPasswordShow(false);
    const handlevalidateclose = () => setValidateEmailShow(false);


    const handleRegistrationShow = () => {
        setRegistartionShow(true);
        handleLoginClose();
    }
    const handleForgotPageShow = () => {
        setForgotPasswordShow(true);
        handleLoginClose();
    }
    const handlevalidateemail = () => {
        setValidateEmailShow(true);
        handleLoginClose();
    }
    const handleValidation = (event) => {
        let formIsValid = true;
        if (!username) {
            setusernameError("Username should not be empty.");
            formIsValid = false;
       /*  } else if (!username.match(/^[a-zA-Z0-9\-]{3,18}$/)) {
            setusernameError("Invalid Username");
            formIsValid = false; */
        } else {
            setusernameError("");
        }

        if (!password) {
            setPasswordError("Password should not be empty.");
            formIsValid = false;

        } 
           /*  else if(!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%"^&*()_+=\-[\]{};:'",.<>?/\\|])(?=.*\d).{8,20}$/)){
            setPasswordError("Invalid Password.");
            formIsValid = false;
        } */
        else {
            setPasswordError("");
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

    const handleRememberMeChange = (event) => {
        setRememberMe(event.target.value);
        if (event.target.value && setrememberError) {
            setrememberError("");
        }
    };
    const ClearForm = ()=>{
        var form = document.getElementById("loginform");
        form.reset();
        setUsername('');
        setusernameError('');
        setPassword('');
        setPasswordError('');
    }
    const handleClose = () => {
        ClearForm();
         onHide();
         };
    const loginSubmit = async (e) => {
        e.preventDefault();
        if (handleValidation()) {
            let signinobject = {
                'username': username,
                'password': password,
            }
            try {
                setLoading(true);
            const response = await fetch(`${rootConfig.AuthenticationURL}/user/login`, {
                method: 'POST',
                body: JSON.stringify(signinobject),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();
            if (result && !(result.role==null)) {
                sessionStorage.setItem('username',username);
                sessionStorage.setItem('role', result.role);
                setLoading(false);
                const sessionId = generateSessionId(); // Generate session ID
                sessionStorage.setItem('sessionId', sessionId); // Store session ID
                window.location.reload();
            } else if(result.token ==='user not valided') {
                ClearForm();
                setLoading(false);
                showAlert('warning', 'Login', result.token);
                handlevalidateemail();                
            } else  {
                ClearForm();
                setLoading(false);
                showAlert('warning', 'Login', 'Invalid Credentials.');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            ClearForm();
            showAlert('danger', 'Login', 'Login failed due to network error, Please try after some time.');
        }
    }
    };
    const generateSessionId = () => {
        // Generate a random string
        return Math.random().toString(36).substr(2, 9);
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
                                <div className='bordermask_vr heigh_1'></div>
                                <div className='bordermask_vr_end heigh_1'></div>
                                <Row className='m-0 p-0'>
                                    <Card className='col-sm-12 col-md-6 shadow rounded-start rounded-0 bgsvg text-white'>
                                        <Card.Body className='d-flex align-items-center text-center'>
                                            <div className='text-center w-100'>
                                                <Card.Img src={projectTitle?._data?.image || logoimg} style={{ width: '200px' }}></Card.Img>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                    {logincard &&
                                        <Card className='col-sm-12 col-md-6 shadow rounded-end rounded-0 px-0 border-0'>
                                            <Card.Title className='text-center'><h4 className="p-0 my-2 main-heading mb-0" style={{ color: typoColor, fontFamily: fontFamily }}>Login</h4></Card.Title>
                                            <Card.Body className='linearBgCard'>
                                                <Form id="loginform" onSubmit={loginSubmit} className='bgovelshaped' style={{fontFamily: fontFamily}}>
                                                    <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                                                        {/* <Form.Label style={{ color: typoColor }}>User Name</Form.Label> */}
                                                        <Form.Control type="text" placeholder="UserName"
                                                            style={{ borderColor: borderColor, color: typoColor, fontFamily: fontFamily }}
                                                            value={username}
                                                            onChange={handleUsernameChange}
                                                            autoComplete='off' />
                                                        <small id="usernameHelp" className="text-danger form-text">
                                                            {usernameError}
                                                        </small>
                                                    </Form.Group>
                                                    <Form.Group className="mb-3" controlId="exampleForm.ControlInput2">
                                                        {/* <Form.Label style={{ color: typoColor }}>Password</Form.Label> */}
                                                        <Form.Control type="password" placeholder="Password"
                                                            style={{ borderColor: borderColor, color: typoColor, fontFamily: fontFamily }}
                                                            value={password}
                                                            onChange={handlePasswordChange} />
                                                        <small id="passwordHelp" className="text-danger form-text">
                                                            {passwordError}
                                                        </small>
                                                    </Form.Group>
                                                    <StyledButton type="submit" className="w-100 btn_clr">
                                                        Login
                                                    </StyledButton>
                                                    <Form.Group className="mb-3 mt-2">
                                                    <Button variant="link" onClick={handleForgotPageShow}>Forgot Password</Button>
                                                    <Button variant="link" className="float-end" onClick={handleRegistrationShow}>Register</Button>
                                                    {/* <Button variant="link" className="float-end" onClick={handlevalidateemail}>email</Button> */}

                                                </Form.Group>
                                                </Form>
                                            </Card.Body>
                                        </Card>
                                    }
                                    {/* {Forgotshow && (
                                        <>
                                            <ForgotPassword />
                                        </>
                                    )} */}
                                </Row>
                            </Card.Body>
                        </Card>
                    </Container>
                </Modal.Body>

                
            </Modal>

           
            <SignUp
                show={RegistartionShow}
                onHide={handleRegistartionClose}
                fullscreen={fullscreen}
            />
            <ForgotPassword 
                show={forgotPasswordShow}
                onHide={handleForgotPageClose}
                fullscreen={fullscreen}
            />
             <ValidateEmail 
                show={validateemailShow}
                onHide={handlevalidateclose}
                fullscreen={fullscreen}
            />
        </>
    );
}

export default SignIn;
