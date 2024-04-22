// React component
import React, { useEffect, useState, useRef } from 'react';
import { Card, Table, Stack, Modal, Form } from 'react-bootstrap';
import axios from 'axios';
import rootConfig from '../../../ExternalUrlConfig.json';
import config from '../../../utils/ApplicationTitleConfig';
import { StyledButton } from '../../../CustomHooks/CustomStyledComponents';
import { useColor } from '../../../CustomContext/ColorContext';
import CloseButtonWrapper from '../../../CustomHooks/closeButton';
import MyModal from '../Modal';
import { toast } from 'react-toastify';
import { useGlobalData } from './GlobalFetchData';
import AddDataSet from './AddDataSet';
import $ from 'jquery';

var serverPort = null;

const GetDataSet = () => {
  const { dataSet, fetchDataSet } = useGlobalData();
  const { backgroundColor, textColor, borderColor, cardbodyColor, fontFamily } = useColor();
  const [showModal, setShowModal] = useState(false);
  const [modalContent] = useState('Are you sure you want to delete the Dataset ?');
  const [deletedItem, setDeletedItem] = useState(null);
  const [importModalShow, setImportModalShow] = useState(false);
  const handleImportModalClose = () => setImportModalShow(false);
  const [getImportId, setGetImportId] = useState(null);
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
        { title: 'Dataset ID', className: 'text-center', data: 'dataset_id' },
        { title: 'Created', className: 'text-center', data: 'created' },
        { title: 'Dataset Name', data: 'dataset_name' },
        { title: 'Dataset Type', className: 'text-center', data: 'dataset_type' },
        { title: 'File Format', className: 'text-center', data: 'file_format' },
        { title: 'Product', className: 'text-center', data: 'product' },
        { title: 'Updated', className: 'text-center', data: 'updated' },
        { title: 'Exchange Set ID', data: 'exchange_set_id' },
        {
          title: 'Delete',
          className: 'text-center',
          render: (data, type, row) => {
            return generateDeleteButtonHTML(row.dataset_id);
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
    getDataSet();
    return () => {
      if (dataTableRef.current) {
        dataTableRef.current.destroy();
        dataTableRef.current = null;
      }
    };
  }, []);
  const getDataSet = async () => {

    const dynamicUrl = (serverPort === rootConfig.AppBuilderPort)
      ? `${rootConfig["app-builder-NodeServerUrl"]}/dataset`
      : `${rootConfig["downloaded-app-ServerUrl"]}/dataset`;

    try {
      const response = await axios.get(dynamicUrl);
      console.log('Dataset response:', response.data); // Log the dataset to inspect its structure
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
        console.error('Invalid dataset format:', response.data);
      }
    } catch (error) {
      console.error('Error fetching dataset:', error);
    }
  };


  const generateDeleteButtonHTML = (datasetId) => {
    return `<i class="bi bi-trash text-danger" style="cursor: pointer;" title="Delete" onclick="handledatasetDeleteConfirmation('${datasetId}')"></i>`;
  };
  window.handledatasetDeleteConfirmation = async (dataset_id) => {
    setShowModal(true);
    setDeletedItem(dataset_id);

  }
  const handleDeleteProvider = async () => {

    try {
      const updateDeleteProviderUrl = (serverPort === rootConfig.AppBuilderPort)
        ? `${rootConfig["app-builder-NodeServerUrl"]}/dataset/${deletedItem}`
        : `${rootConfig["downloaded-app-ServerUrl"]}/dataset/${deletedItem}`;
      console.log("updateDeleteProviderUrl", updateDeleteProviderUrl)
      const deleteresponse = await axios.delete(updateDeleteProviderUrl);
      if (deleteresponse.data.success === true) {
        toast.success('Dataset deleted successfully');
        const dataTable = $(staticTableref.current).DataTable();
        const rowIndex = dataTable.rows().indexes().toArray().find(index => {
          const rowData = dataTable.row(index).data();
          const datasetId = rowData.dataset_id;
          return datasetId == deletedItem;
        });
        if (rowIndex !== undefined) {
          const rowNode = dataTable.row(rowIndex).node();
          $(rowNode).addClass('d-none');
        }
      } else {
        toast.error('Error deleting Dataset: ' + deleteresponse.data.message);
      }
    } catch (error) {
      toast.error('Error deleting Dataset: ' + error.message);
    }

  };
  const handleExchangeSetProvider = async () => {
    try {
      const deleteProviderUrl = (serverPort === rootConfig.AppBuilderPort)
        ? `${rootConfig["app-builder-NodeServerUrl"]}/exchangeset`
        : `${rootConfig["downloaded-app-ServerUrl"]}/exchangeset`;

      const response = await axios.get(deleteProviderUrl);
      const exchangeSetId = response.data.map(obj => obj.exchangeSet);
      setGetImportId(exchangeSetId);
      setImportModalShow(true);

    } catch (error) {
      toast.error('Error getting Dataset: ' + error.message);
    }
  };
  const handleCloseModal = () => {
    setShowModal(false);
  }

  return (
    <>
      <Card className='mb-3' style={{ fontFamily: fontFamily, borderColor: borderColor, backgroundColor: cardbodyColor }}>
        <Card.Header className='p-2' style={{ backgroundColor: backgroundColor, color: textColor, borderColor: borderColor }}>
          <Stack direction="horizontal" gap={3}>
            <div><h5 className='mb-0'><i className="bi bi-clipboard-data me-1"></i> Data Set</h5></div>
            <div className="ms-auto">
              <StyledButton variant="primary" onClick={handleExchangeSetProvider}>
                <i className="bi bi-file-earmark-plus me-2"></i>Add Dataset
              </StyledButton>
            </div>
          </Stack>
        </Card.Header>
        <Card.Body className='p-2'>
          <Table responsive bordered striped className='mb-0 w-100' ref={staticTableref}>
            <thead>
              <tr>
                <th className='text-center'>Dataset ID</th>
                <th className='text-center'>Created</th>
                <th>Dataset Name</th>
                <th className='text-center'>Dataset Type</th>
                <th className='text-center'>File Format</th>
                <th className='text-center'>Product</th>
                <th className='text-center'>Updated</th>
                <th>Exchange Set ID</th>
                <th className='text-center'>Delete</th>
              </tr>
            </thead>
            <tbody>
              {/*   {dataSet.map((item, index) => (
        <tr key={index}>
          <td className='text-center'>{item.dataset_id}</td>
          <td className='text-center'>{item.created}</td>
          <td>{item.dataset_name}</td>
          <td className='text-center'>{item.dataset_type}</td>
          <td className='text-center'>{item.file_format}</td>
          <td className='text-center'>{item.product}</td>
          <td className='text-center'>{item.updated}</td>
          <td>{item.exchange_set_id}</td>
          <td className='text-center'>
              <i onClick={() => handleDeleteConfirmation(item.dataset_id)} className='bi bi-trash text-danger' style={{cursor: 'pointer'}} title='Delete'></i>
            </td>
        </tr>
        
      ))}  */}
            </tbody>
          </Table>

        </Card.Body>
      </Card>

      <MyModal
        show={showModal}
        title="Dataset"
        content={modalContent}
        onHide={handleCloseModal}
        onSaveChanges={handleDeleteProvider}
      />
      <Modal show={importModalShow} onHide={handleImportModalClose}>
        <Modal.Header className='d-flex justify-content-between align-items-center py-2 pe-2' style={{ backgroundColor: backgroundColor, color: textColor }}>
          <Modal.Title><h6 className='mb-0'><i className="bi bi-file-earmark-plus me-2"></i>Add Dataset</h6></Modal.Title>
          <CloseButtonWrapper
            onClick={handleImportModalClose}
            className='ms-auto'
          ><i className='bi bi-x'></i>
          </CloseButtonWrapper>
        </Modal.Header>
        <Modal.Body>
          {getImportId && <AddDataSet getImportId={getImportId} closeModal={handleImportModalClose} getDataSet={getDataSet} />}
        </Modal.Body>
      </Modal>
    </>
  );
};


export default GetDataSet;
