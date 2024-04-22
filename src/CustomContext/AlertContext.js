import React, { createContext, useContext, useState } from 'react';
import AlertMessage from '../Components/General/CustomAlert';

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {

    const [customalert, setAlert] = useState(null);

    const showAlert = (type, title, message ) => {
        setAlert(<AlertMessage type={type} title={title} message={message} />);
        setTimeout(() => setAlert(null), 5000);
    };

    return (
        <AlertContext.Provider value={showAlert}>
            {children}
            {customalert}
        </AlertContext.Provider>
    );
};

export const useAlert = () => {
    return useContext(AlertContext);
};
