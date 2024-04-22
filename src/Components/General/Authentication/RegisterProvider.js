import React, { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import axios from 'axios';
import rootConfig from '../../../ExternalUrlConfig.json';
import config from '../../../utils/ApplicationTitleConfig';
import { StyledButton, StyledLoaderInner, StyledLoaderWraper } from '../../../CustomHooks/CustomStyledComponents';
import { toast } from 'react-toastify';
var serverPort = null;


const RegisterProvider = ({ fetchProviderData, closeModal }) => {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    agencyCode: '',
    agencyName: '',
    agencyNumber: '',
    countryName: '',
    countryCode: '',
    Members: ''
  });

  const [errors, setErrors] = useState({
    agencyCode: '',
    agencyName: '',
    agencyNumber: '',
    countryName: '',
    countryCode: '',
    Members: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear validation error when user starts typing
    setErrors({
      ...errors,
      [name]: '',
    });
  };

  useEffect(() => {
    if (config?._data?.PortID !== undefined && config._data.PortID !== "") {
      serverPort = config?._data?.PortID;
    }
  }, [serverPort]);
  const handleValidation = () => {
    let formIsValid = true;
    const newErrors = { ...errors };

    if (!formData.agencyCode.trim()) {
      newErrors.agencyCode = 'Agency code is required.';
      formIsValid = false;
    }
    if (!formData.agencyName.trim()) {
      newErrors.agencyName = 'Agency name is required.';
      formIsValid = false;
    }

    if (!formData.agencyNumber) {
      newErrors.agencyNumber = 'Agency number is required.';
      formIsValid = false;
    }
    if (!formData.countryName) {
      newErrors.countryName = 'Country name is required.';
      formIsValid = false;
    }
    if (!formData.countryCode) {
      newErrors.countryCode = 'Country code is required.';
      formIsValid = false;
    }
    if (!formData.Members) {
      newErrors.Members = 'Members file is required.';
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

    try {
      setLoading(true);

      let provideraddobj = {
        "id": '',
        "Agency Codes": formData.agencyCode,
        "Agency Name": formData.agencyName,
        "Agency Number": formData.agencyNumber,
        "Country Name": formData.countryName,
        "Country Code": formData.countryCode,
        "Members": formData.Members
      }
      const registerProviderUrl = (serverPort === rootConfig.AppBuilderPort)
        ? `${rootConfig["app-builder-NodeServerUrl"]}/providers`
        : `${rootConfig["downloaded-app-ServerUrl"]}/providers`
      const response = await axios.post(registerProviderUrl, provideraddobj, {
        headers: {
          'Content-Type': 'application/json'
        },

      });
      const result = await response.data;
      if (result.success === true) {
        setLoading(false);
        toast.success('Provider added successfully');
        fetchProviderData();
        await closeModal(false);
        //alert(closeModal);
      }
    } catch (error) {
      setLoading(false);
      toast.error('Error adding Provider: ' + error.message);
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

        <Form.Group className='mb-3' controlId='agencyCode'>
          <Form.Control
            type='text'
            placeholder='Agency Code'
            name='agencyCode'
            value={formData.agencyCode}
            onChange={handleInputChange}
            autoComplete='off'
          />
          <small id='agencyCodeHelp' className='text-danger form-text'>
            {errors.agencyCode}
          </small>
        </Form.Group>
        <Form.Group className='mb-3' controlId='agencyName'>
          <Form.Control
            type='text'
            placeholder='Agency Name'
            name='agencyName'
            value={formData.agencyName}
            onChange={handleInputChange}
            autoComplete='off'
          />
          <small id='agencyNameHelp' className='text-danger form-text'>
            {errors.agencyName}
          </small>
        </Form.Group>
        <Form.Group className='mb-3' controlId='agencyNumber'>
          <Form.Control
            type='text'
            placeholder='Agency Number'
            name='agencyNumber'
            value={formData.agencyNumber}
            onChange={handleInputChange}
            autoComplete='off'
          />
          <small id='agencyNumberHelp' className='text-danger form-text'>
            {errors.agencyNumber}
          </small>
        </Form.Group>
        <Form.Group className='mb-3' controlId='countryName'>
          <Form.Control
            type='text'
            placeholder='Country Name'
            name='countryName'
            value={formData.countryName}
            onChange={handleInputChange}
            autoComplete='off'
          />
          <small id='countryNameHelp' className='text-danger form-text'>
            {errors.countryName}
          </small>
        </Form.Group>
        <Form.Group className='mb-3' controlId='countryCode'>
          <Form.Control
            type='text'
            placeholder='Country Code'
            name='countryCode'
            value={formData.countryCode}
            onChange={handleInputChange}
            autoComplete='off'
          />
          <small id='countryCodeHelp' className='text-danger form-text'>
            {errors.countryCode}
          </small>
        </Form.Group>

        <Form.Group className='mb-3' controlId='Members'>
          <Form.Control
            type='text'
            placeholder='Members'
            name='Members'
            value={formData.Members}
            onChange={handleInputChange}
            autoComplete='off'
          />
          <small id='MembersHelp' className='text-danger form-text'>
            {errors.Members}
          </small>
        </Form.Group>
        <StyledButton type='submit' className='w-100 btn_clr'>
          Submit
        </StyledButton>
      </Form>

    </>
  );
};


export default RegisterProvider;
