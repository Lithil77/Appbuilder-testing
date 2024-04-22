import React, { useEffect, useState, useRef } from 'react';
import { Table, Card, Modal, Stack } from 'react-bootstrap';
import axios from 'axios';
import rootConfig from '../../../ExternalUrlConfig.json';
import config from '../../../utils/ApplicationTitleConfig';
import { StyledButton } from '../../../CustomHooks/CustomStyledComponents';
import { useColor } from '../../../CustomContext/ColorContext';
import CloseButtonWrapper from '../../../CustomHooks/closeButton';
import RegisterProvider from './RegisterProvider';
import { toast } from 'react-toastify';
import { useGlobalData } from './GlobalFetchData';
import UpdateProviderForm from './UpdateProviders';
import $ from 'jquery';
import MyModal from '../Modal';
import { StyledLoaderWraper, StyledLoaderInner } from '../../../CustomHooks/CustomStyledComponents';
var serverPort = null;

const Providers = () => {
  const { providerData, fetchData } = useGlobalData();
  const [details, setDetails] = useState(null);
  const { backgroundColor, textColor, borderColor, cardbodyColor, fontFamily } = useColor();
  const [show, setShow] = useState(false);
  const [updateModalShow, setUpdateModalShow] = useState(false);
  const [deletedItem, setDeletedItem] = useState(null);
  const handleUpdateModalClose = () => setUpdateModalShow(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [showModal, setShowModal] = useState(false);
  const [modalContent] = useState('Are you sure you want to delete the Provider ?');
  const [loading, setLoading] = useState(false);

  const staticTableref = useRef(null);
  const dataTableRef = useRef(null);

  useEffect(() => {
    if (config?._data?.PortID !== undefined && config._data.PortID !== "") {
      serverPort = config?._data?.PortID;
    }
  }, [serverPort]);


  useEffect(() => {

    if (staticTableref.current && !dataTableRef.current) {
      const columns = [
        { title: 'Agency Codes', className: 'text-center', data: 'Agency Codes' },
        { title: 'Agency Name', className: 'text-center', data: 'Agency Name' },
        { title: 'Agency Number', className: 'text-center', data: 'Agency Number' },
        { title: 'Country Name', className: 'text-center', data: 'Country Name' },
        { title: 'Country Code', className: 'text-center', data: 'Country Code' },
        { title: 'Members', className: 'text-center', data: 'Members' },
        {
          title: 'Update',
          className: 'text-center',
          render: (data, type, row) => {
            return generateUpdateButtonHTML(row.id);
          }
        },
        {
          title: 'Delete',
          className: 'text-center',
          render: (data, type, row) => {
            return generateDeleteButtonHTML(row.id);
          }
        }
      ];

      const dataTable = $(staticTableref.current).DataTable({
        paging: true,
        lengthMenu: [5, 10, 25, 50],
        pageLength: 5,
        columns: columns,
        React: true,
      });

      dataTableRef.current = dataTable;
    }
    fetchProviderData();
    return () => {
      if (dataTableRef.current) {
        dataTableRef.current.destroy();
        dataTableRef.current = null;
      }
    };
  }, []);


  const fetchProviderData = async () => {
    if (serverPort !== null) {
      const dynamicUrl = (serverPort === rootConfig.AppBuilderPort)
        ? `${rootConfig["app-builder-NodeServerUrl"]}/providers`
        : `${rootConfig["downloaded-app-ServerUrl"]}/providers`;
      try {
        const response = await axios.get(dynamicUrl);
        console.log('Dataset response:', response.data);

        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          if (dataTableRef.current) {
            const dataTable = dataTableRef.current;

            dataTable.clear();

            response.data.forEach(row => {
              dataTable.row.add(row);
            });

            dataTable.draw();
          }
        } else {
          console.error('Invalid provider format:', response.data);
        }
      } catch (error) {
        console.error('Error fetching providers:', error);
      }
    }

  };

  const generateDeleteButtonHTML = (providerid) => {
    return `<i class="bi bi-trash text-danger" style="cursor: pointer;" title="Delete" onclick="handleproviderDeleteConfirmation('${providerid}')"></i>`;
  };
  const generateUpdateButtonHTML = (providerid) => {
    return `<i class="bi bi-pencil text-danger" style="cursor: pointer;" title="Update" onclick="handleProviderDetails('${providerid}')"></i>`;
  };

  window.handleproviderDeleteConfirmation = async (id) => {
    setDeletedItem(id);
    setShowModal(true);
  }
  window.handleProviderDetails = async (id) => {
    console.log("details", id);
    try {
      const providerDetailsUrl = (serverPort === rootConfig.AppBuilderPort)
        ? `${rootConfig["app-builder-NodeServerUrl"]}/providers/${id}`
        : `${rootConfig["downloaded-app-ServerUrl"]}/providers/${id}`;

      const response = await axios.get(providerDetailsUrl);
      console.log('Provider details response:', response.data);
      setDetails(response.data);
      setUpdateModalShow(true);
    } catch (error) {
      console.error('Error fetching provider details:', error);
    }
  };
  const handleCloseModal = () => {
    setShowModal(false);
  }

  const handleDeleteProvider = async () => {


    try {
      const updateDeleteProviderUrl = (serverPort === rootConfig.AppBuilderPort)
        ? `${rootConfig["app-builder-NodeServerUrl"]}/providers/${deletedItem}`
        : `${rootConfig["downloaded-app-ServerUrl"]}/providers/${deletedItem}`;

      const deleteresponse = await axios.delete(updateDeleteProviderUrl);
      const result = await deleteresponse.data;
      if (result.success === true) {
        toast.success(deleteresponse.data.message);
        const dataTable = $(staticTableref.current).DataTable();
        const rowIndex = dataTable.rows().indexes().toArray().find(index => {
          return dataTable.row(index).data().id === deletedItem;
        });
        if (rowIndex !== undefined) {
          const rowNode = dataTable.row(rowIndex).node();
          $(rowNode).addClass('d-none');
        }
      }
    } catch (error) {
      toast.error('Error deleting Provider: ' + error.message);
    }
  };

  return (
    <>
      <Card className='mb-3' style={{ fontFamily: fontFamily, borderColor: borderColor, backgroundColor: cardbodyColor }}>
        <Card.Header className='p-2' style={{ backgroundColor: backgroundColor, color: textColor, borderColor: borderColor }}>
          <Stack direction="horizontal" gap={3}>
            <div><h5 className='mb-0'><i className="bi bi-person-lines-fill me-1"></i> Providers</h5></div>
            <div className="ms-auto">
              <StyledButton variant="primary" onClick={handleShow}>
                <i className="bi bi-person-add me-1"></i> Add Provider
              </StyledButton>
            </div>
          </Stack>
        </Card.Header>
        <Card.Body className='p-2'>
          <Table responsive bordered striped className='mb-0 w-100' ref={staticTableref}>
            <thead>
              <tr>
                <th className='text-center'>Agency Codes</th>
                <th className='text-center'>Agency Name</th>
                <th className='text-center'>Agency Number</th>
                <th className='text-center'>Country Name</th>
                <th className='text-center'>Country Code</th>
                <th className='text-center'>Members</th>
                <th className='text-center'>Update</th>
                <th className='text-center'>Delete</th>
              </tr>
            </thead>
            <tbody>
              {/* {providerData.map((item, index) => (
              <tr key={index}>
                <td className='text-center'>{item['Agency Codes']}</td>
                <td className='text-center'>{item['Agency Name']}</td>
                <td className='text-center'>{item['Agency Number']}</td>
                <td className='text-center'>{item['Country Name']}</td>
                <td className='text-center'>{item['Country Code']}</td>
                <td className='text-center'>{item.Members}</td>
              
                <td className='text-center'>
                  <i onClick={() => handleProviderDetails(item.id)} className='bi bi-pencil text-warning' style={{cursor: 'pointer'}} title='Update'>
                  </i>
                </td>
                <td className='text-center'>
                  <i onClick={() => handleDeleteConfirmation(item.id)} className='bi bi-trash text-danger' style={{cursor: 'pointer'}} title='Delete'></i>
                </td>
              </tr>
            ))} */}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header className='d-flex justify-content-between align-items-center py-2 pe-2' style={{ backgroundColor: backgroundColor, color: textColor }}>
          <Modal.Title><h6 className='mb-0'><i className='bi bi-file-plus me-2'></i>Add Provider</h6></Modal.Title>
          <CloseButtonWrapper
            onClick={handleClose}
            className='ms-auto'
          ><i className='bi bi-x'></i>
          </CloseButtonWrapper>
        </Modal.Header>
        <Modal.Body>
          {loading && (
            <StyledLoaderWraper>
              <StyledLoaderInner />
            </StyledLoaderWraper>
          )}
          <RegisterProvider fetchProviderData={fetchProviderData} closeModal={handleClose} />

        </Modal.Body>
      </Modal>
      <Modal show={updateModalShow} onHide={handleUpdateModalClose}>
        <Modal.Header className='d-flex justify-content-between align-items-center py-2 pe-2' style={{ backgroundColor: backgroundColor, color: textColor }}>
          <Modal.Title><h6 className='mb-0'><i className='bi bi-pencil-square me-2'></i>Update Provider</h6></Modal.Title>
          <CloseButtonWrapper
            onClick={handleUpdateModalClose}
            className='ms-auto'
          ><i className='bi bi-x'></i>
          </CloseButtonWrapper>
        </Modal.Header>
        <Modal.Body>
          {details && <UpdateProviderForm details={details} fetchProviderData={fetchProviderData} closeModal={handleUpdateModalClose} />}
        </Modal.Body>
      </Modal>
      <MyModal
        show={showModal}
        title="Provider"
        content={modalContent}
        onHide={handleCloseModal}
        onSaveChanges={handleDeleteProvider}
      />
    </>

  );
};

export default Providers;
