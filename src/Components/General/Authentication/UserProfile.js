import React, { useState, useEffect, useContext, useRef } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import SignIn from '../../General/Authentication/SignIn';
import SignUp from '../../General/Authentication/SignUp';
import { useAlert } from '../../../CustomContext/AlertContext';
import { useNavigate } from 'react-router-dom';
import { useColor } from '../../../CustomContext/ColorContext';
import ChangePassword from './ChangePassword';
import { Link } from 'react-router-dom';
import { useLocation } from "react-router-dom";
import MyModal from '../Modal';

function UserProfile() {
    const { backgroundColor, textColor, borderColor, fontFamily } = useColor();
    const [sessionusername, setsessionusername] = useState('');
    const [loginandRegisterBtnHandle, setLoginandRegisterBtnHandle] = useState(true);
    const [username, setusername] = useState('');
    const [getrole, setrole] = useState('');
    const showAlert = useAlert();
    const navigate = useNavigate();
    const [dashboardvalue, setdashboardvalue] = useState(false);
    const [Loginshow, setLoginshow] = useState(false);
    const handleLoginClose = () => setLoginshow(false);
    const [changepasswordshow, setChangepasswordshow] = useState(false);

    const handleChangepasswordClose = () => setChangepasswordshow(false);

    const [fullscreen, setFullscreen] = useState(true);
    const [RegistartionShow, setRegistartionShow] = useState(false);
    const handleRegistartionClose = () => setRegistartionShow(false);
    const handleRegistrationShow = () => setRegistartionShow(true);
    const location = useLocation();
    const [modalContent] = useState('Your Session is expired, Are you sure want Extend your session again?');
    const [sessionShowModal, setsessionShowModal] = useState(false);
    const [sessionTimeout, setSessionTimeout] = useState(null);

    useEffect(() => {
    const storedUsername = sessionStorage.getItem('username');
        const role = sessionStorage.getItem('role');
        setrole(role);
        setusername(storedUsername);

        if (storedUsername) {
            setsessionusername(storedUsername);
            setLoginandRegisterBtnHandle(false);
            const sessionTimeoutDuration = 30 * 60 * 1000;
            const timeoutId = setTimeout(() => {
                setsessionShowModal(true);
            }, sessionTimeoutDuration);
            setSessionTimeout(timeoutId);

        }
       
        getdashboardpath();
    }, []);

  
    function handleLoginShow(breakpoint) {
        setFullscreen(breakpoint);
        setLoginshow(true);
    }
    const logoutclick = (event) => {
        if (username) {
            sessionStorage.removeItem('username');
            sessionStorage.removeItem('checkedItems');
            sessionStorage.removeItem('sessionId'); 
            showAlert("success", "Login", "Successfully logged out into the application.");
            navigateToHome();
        }
    }
    const navigateToDashboard = () => {
        navigate('/dashboard', { replace: true });
       //window.location.reload();
    }

    const changepasswordclick = (event) => {
       setChangepasswordshow(true);
    }
    const navigateToHome = (event) => {
        if (username || dashboardvalue) {
            navigate('/dashboard');

            window.location.reload();
        }
    }
    const getdashboardpath = () => {
        const currentURL = window.location.href;
        const url = new URL(currentURL);
        const path = url.pathname;
        const pathSegments = path.split('/');
        const dashboardString = pathSegments[pathSegments.length - 1];
        if (dashboardString === 'dashboard') {
            setdashboardvalue(dashboardString)
        } 
    }

      
    const handleSaveChangesClick = () => {    
        const sessionTimeoutDuration = 30 * 60 * 1000;
        setsessionShowModal(false);
        // Restart session timeout
        const newSessionTimeout = setTimeout(() => {
            setsessionShowModal(true);
        }, sessionTimeoutDuration);

        // Save the new session timeout in state
        setSessionTimeout(newSessionTimeout);
    };
    const handlesessionModalClose = () => {        
        setsessionShowModal(false);
        if(location.pathname == "/dashboard")
        {
            navigate('/', { replace: true });
            sessionStorage.removeItem('username');
            sessionStorage.removeItem('checkedItems');
            sessionStorage.removeItem('sessionId'); 
        }else
        {

            window.location.reload();
            sessionStorage.removeItem('username');
            sessionStorage.removeItem('checkedItems');
            sessionStorage.removeItem('sessionId'); 
        }
        
    };
  return (
    <>
 
    <Dropdown className='w-100'>
                   
    <Dropdown.Toggle style={{ backgroundColor, color: textColor, borderColor: borderColor, height: '40px' }} className='p-1 d-flex flex-wrap align-content-center align-items-center justify-items-center w-100 mb-3'>
        <i className="bi bi-person-circle me-1" style={{ fontSize: '18.7px' }}></i>
        <div>{sessionusername}</div>
    </Dropdown.Toggle>

        {loginandRegisterBtnHandle &&
       <Dropdown.Menu>
        <Dropdown.Item onClick={handleLoginShow} id="login-btn"><i className="bi bi-person-down me-1 p-1"></i>Login</Dropdown.Item>
        <Dropdown.Item onClick={handleRegistrationShow} id="register-button"><i className="bi bi-person-up me-1 p-1" ></i>Register</Dropdown.Item>
        </Dropdown.Menu>
        }

        {sessionusername &&
            <Dropdown.Menu>   
               {getrole === '0' && location.pathname !== "/dashboard" && (
             <Dropdown.Item onClick={(e) => navigateToDashboard()}>
             <i className="bi bi-layout-text-sidebar-reverse me-1 p-1"></i>Dashboard
           </Dropdown.Item>
)}

                {dashboardvalue &&
                <Dropdown.Item as={Link} to="/"><i className="bi bi-layout-text-sidebar-reverse me-1 p-1"></i>Map</Dropdown.Item>
                }
                <Dropdown.Item onClick={(e) => changepasswordclick()}><i className="bi bi-pass me-1 p-1"></i>Change Password</Dropdown.Item>
           
                <Dropdown.Item onClick={(e) => logoutclick()} as={Link} to="/"><i className="bi bi-box-arrow-right me-1 p-1"></i>Logout</Dropdown.Item>
            </Dropdown.Menu>
        }
      
    </Dropdown>
    <SignIn
    show={Loginshow}
    onHide={handleLoginClose}
    fullscreen={fullscreen} />
     <SignUp
    show={RegistartionShow}
    onHide={handleRegistartionClose}
    fullscreen={fullscreen} />
      <ChangePassword
    show={changepasswordshow}
    onHide={handleChangepasswordClose}
    fullscreen={fullscreen} />
    
    <MyModal
                show={sessionShowModal}
                title="Session Expired"
                content={modalContent}
                onHide={handlesessionModalClose}
                onSaveChanges={handleSaveChangesClick}
            />
</>
  );
}

export default UserProfile;


