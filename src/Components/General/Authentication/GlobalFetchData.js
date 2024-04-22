import { useState, useEffect } from 'react';
import axios from 'axios';
import rootConfig from '../../../ExternalUrlConfig.json';
import config from '../../../utils/ApplicationTitleConfig';

export const useGlobalData = () => {
  const [providerData, setProviderData] = useState([]);
  const [exchangeData, setexchangeData] = useState([]);
  const [dataSet, setDataSet] = useState([]);
  var serverPort = null;
  useEffect(() => {
    if (config?._data?.PortID !== undefined && config._data.PortID !== "") {
      serverPort = config?._data?.PortID;
    }
  }, [serverPort]);
  const fetchData = async () => {
    serverPort = config?._data?.PortID || rootConfig.AppBuilderPort;
    const dynamicUrl = (serverPort === rootConfig.AppBuilderPort)
      ? `${rootConfig["app-builder-NodeServerUrl"]}/providers`
      : `${rootConfig["downloaded-app-ServerUrl"]}/providers`;

    try {
      const response = await axios.get(dynamicUrl);
      if (response.data) {
        setProviderData(response.data);
        console.log("response:", response.data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };


  const fetchExchangeData = async () => {
    serverPort = config?._data?.PortID || rootConfig.AppBuilderPort;
    const dynamicUrl = (serverPort === rootConfig.AppBuilderPort)
      ? `${rootConfig["app-builder-NodeServerUrl"]}/exchangeset`
      : `${rootConfig["downloaded-app-ServerUrl"]}/exchangeset`;
    // const dynamicUrl = `${rootConfig["downloaded-app-ServerUrl"]}/exchangeset`;
    try {
      const response = await axios.get(dynamicUrl);
      if (response.data) {
        setexchangeData(response.data);
        console.log("response:", response.data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchDataSet = async () => {
    serverPort = config?._data?.PortID || rootConfig.AppBuilderPort;
    const dynamicUrl = (serverPort === rootConfig.AppBuilderPort)
      ? `${rootConfig["app-builder-NodeServerUrl"]}/dataset`
      : `${rootConfig["downloaded-app-ServerUrl"]}/dataset`;
    //const dynamicUrl = `${rootConfig["downloaded-app-ServerUrl"]}/dataset`;
    try {
      const response = await axios.get(dynamicUrl);
      if (response.data) {
        setDataSet(response.data);
        console.log("response:", response.data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return { providerData, fetchData, fetchExchangeData, exchangeData, fetchDataSet, dataSet };

};
