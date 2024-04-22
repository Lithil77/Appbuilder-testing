import React, { useState, useEffect, useContext } from 'react';
import { Form } from 'react-bootstrap';
import axios from 'axios';
import rootConfig from '../../../ExternalUrlConfig.json';
import config from '../../../utils/ApplicationTitleConfig';
import { StyledButton, StyledLoaderInner, StyledLoaderWraper } from '../../../CustomHooks/CustomStyledComponents';
import { toast } from 'react-toastify';
import { OLMapContext } from '../../Map/OLMap';
import { useGlobalData } from './GlobalFetchData';
import { useAlert } from '../../../CustomContext/AlertContext';

var serverPort = null;

const AddExchangeSet = ({ closeModal, getExchangeData }) => {
  const { providerData, fetchData } = useGlobalData();
  const [countryOptions, setCountryOptions] = useState(''); // Added loading state
  const [loading, setLoading] = useState(false);
  const showAlert = useAlert();

  useEffect(() => {
    fetchData();
    console.log(providerData);

  }, []);

  const [formData, setFormData] = useState({
    agencyCode: '',
    Country: '',
    fileName: null,
  });

  const [errors, setErrors] = useState({
    agencyCode: '',
    Country: '',
    fileName: '',
  });

  const handleInputChange = async (e) => {

    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
    //Clear validation error when user starts typing
    setErrors({
      ...errors,
      [name]: '',
    });

    if (name === 'agencyCode') {
      const selectedProvider = providerData.find(option => option['Agency Codes'] === value);
      const countriesForSelectedAgency = selectedProvider ? [{ value: selectedProvider['Country Code'], label: selectedProvider['Country Code'] }] : [];
      setCountryOptions(countriesForSelectedAgency);
    }
  };


  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      fileName: e.target.files[0],
    });
    setErrors({
      ...errors,
      fileName: '',
    });
  };

  const handleValidation = () => {
    let formIsValid = true;
    const newErrors = { ...errors };

    if (!formData.agencyCode.trim()) {
      newErrors.agencyCode = 'Agency code is required.';
      formIsValid = false;
    }

    if (!formData.Country.trim()) {
      newErrors.Country = 'Country code is required.';
      formIsValid = false;
    }

    if (!formData.fileName) {
      newErrors.fileName = 'Add exchange set file is required.';
      formIsValid = false;
    }

    setErrors(newErrors);
    return formIsValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!handleValidation()) {
      return;
    }

    if (config?._data?.PortID !== undefined && config._data.PortID !== '') {
      serverPort = config?._data?.PortID;
    }

    const dynamicUrl = `${rootConfig.dashBoardApiUrl}/exchangeset`
    const queryParams = {
      agencycode: formData.agencyCode,
      country: formData.Country,
    };

    const urlWithParams = `${dynamicUrl}?${new URLSearchParams(queryParams).toString()}`;
    try {
      setLoading(true);
      const formDataToSend = new FormData();
      formDataToSend.append('fileName', formData.fileName);
      const response = await axios.post(urlWithParams, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const result = await response.data;

      if (result === "Successfully uploaded") {
        setLoading(false);
        toast.success(result);
        getExchangeData();
        closeModal();

      } else if (result === "Already Exists") {
        setLoading(false);
        toast.error(result);
      }
    } catch (error) {
      setLoading(false);
      toast.error('Error adding exchangeset: ' + error.message);
    }

  };


  return (
    <>
      {loading && (
        <StyledLoaderWraper>
          <StyledLoaderInner />
        </StyledLoaderWraper>
      )}
      <Form onSubmit={handleSubmit}>
        <Form.Group className='mb-3' controlId='formagencyCode'>
          <Form.Select onChange={e => handleInputChange(e)}
            aria-label='Agency Code'
            name='agencyCode'
            value={formData.agencyCode}
          >
            <option key='default' value='select'>Select a Agency code</option>
            {providerData && providerData.map((option, index) => (
              <option key={`${option['Agency Codes']}_${index}`} value={option['Agency Codes']}>{option['Agency Codes']}</option>
            ))}
          </Form.Select>
          <small id='agencycodeHelp' className='text-danger form-text'>
            {errors.agencyCode}
          </small>
        </Form.Group>

        <Form.Group className='mb-3' controlId='formCountry'>
          <Form.Select
            aria-label='Country'
            name='Country'
            value={formData.Country}
            onChange={e => handleInputChange(e)}
          >
            <option key='default' value='select'>Select a Country</option>
            {countryOptions && countryOptions.map((option, index) => (
              <option key={`${option.value}_${index}`} value={option.value}>{option.label}</option>
            ))}
          </Form.Select>
          <small id='CountryHelp' className='text-danger form-text'>
            {errors.Country}
          </small>
        </Form.Group>

        <Form.Group className='mb-3' controlId='fileName'>
          <Form.Control
            type='file'
            name='fileName'
            accept='.zip'
            onChange={handleFileChange}
          />
          <small id='AddexchangesetHelp' className='text-danger form-text'>
            {errors.fileName}
          </small>
        </Form.Group>

        <StyledButton type='submit' className='w-100 btn_clr'>
          Submit
        </StyledButton>
      </Form>
    </>
  );
};

export default AddExchangeSet;
