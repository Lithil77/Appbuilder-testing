import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import axios from 'axios';
import rootConfig from '../../../ExternalUrlConfig.json';
import { StyledButton, StyledLoaderInner, StyledLoaderWraper } from '../../../CustomHooks/CustomStyledComponents';
import { toast } from 'react-toastify';
import { useAlert } from '../../../CustomContext/AlertContext';

const AddDataSet = ({ getImportId, getDataSet, closeModal }) => {
  const [selectedId, setSelectedId] = useState((getImportId[0] || ''));
  const [loading, setLoading] = useState(false);
  const showAlert = useAlert();
  const [formData, setFormData] = useState({
    uuid: getImportId[0] || '',
    addDatasetFile: null,
  });

  const [errors, setErrors] = useState({
    uuid: '',
    addDatasetFile: '',
  });

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      addDatasetFile: e.target.files[0],
    });
    setErrors({
      ...errors,
      addDatasetFile: '',
    });
  };
  const handleValidation = () => {
    let formIsValid = true;
    const newErrors = { ...errors };
    const requiredFields = ['uuid', 'addDatasetFile',];
    requiredFields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = `${field} is required.`;
        formIsValid = false;
      }
    });

    setErrors(newErrors);
    return formIsValid;
  };
  const handleSelectChange = (event) => {
    const selectedIds = Array.from(event.target.selectedOptions, (option) => option.value);
    console.log('Selected IDs:', selectedIds);
    setSelectedId(selectedIds);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!handleValidation()) {
      toast.error('Please fill in all required fields.');
      return;
    }


    const dynamicUrl = `${rootConfig.dashBoardApiUrl}/dataset/${selectedId}`
    try {
      setLoading(true);
      const formDataToSend = new FormData();
      formDataToSend.append('fileName', formData.addDatasetFile);
      const response = await axios.post(dynamicUrl, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(response);
      const result = await response.data;
      if (result === 'Done') {
        setLoading(false);
        toast.success('Dataset Added Successfully');
        getDataSet();
        closeModal();
      } else if (result === 'Dataset Already Present') {
        setLoading(false);
        toast.warning(result);
      }
    } catch (error) {
      setLoading(false);
      toast.error('Error Adding Dataset: ' + error.message);
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
        <Form.Group className='mb-3' controlId='uuid'>
          <Form.Select onChange={handleSelectChange}>
            {getImportId.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </Form.Select>
          <small id='uuidHelp' className='text-danger form-text'>
            {errors.uuid}
          </small>
        </Form.Group>
        <Form.Group controlId="addDatasetFile" className="mb-3">
          <Form.Control
            type='file'
            name='addDatasetFile'
            accept='.gml'
            onChange={handleFileChange}
          />
          <small id='addDatasetFileHelp' className='text-danger form-text'>
            {errors.addDatasetFile}
          </small>
        </Form.Group>
        <StyledButton type='submit' className='w-100 btn_clr'>
          Submit
        </StyledButton>
      </Form>
    </>
  )

}
export default AddDataSet;