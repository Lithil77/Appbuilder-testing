import React, { useState, useEffect, useContext } from "react";
import { Card, Stack, Collapse, Tabs, Tab } from "react-bootstrap";
import { useColor } from "../../../CustomContext/ColorContext";
import CloseButtonWrapper from "../../../CustomHooks/closeButton";
import { OverLayPanelContext } from '../../../CustomContext/OverLayContext';
import { SidebarContext } from "../../../CustomContext/SidebarContext";
import { StyledButton } from "../../../CustomHooks/CustomStyledComponents.js";
import FeatureTable from "./FeatureTable.js";

const CollapsibleTable = () => {

    const { collapsed, toggleCollapsibleTablePanel,
        queryType, featureData, geometryCollection, selectedCalenderDate } = useContext(OverLayPanelContext);

    const { backgroundColor, textColor, borderColor } = useColor();
    const [geometryData, setGeometryData] = useState([]);
    const { sideBarVisible, sideBarLayersVisible } = useContext(SidebarContext);
    const [tabActiveItem, setTabActiveItem] = useState('defaultTab');
    const [headers, setHeaders] = useState([]);

    const featureCardStyles = {
        height: collapsed ? 'auto' : '0px',
        transition: 'all 4s'
    }

    const dragtableCardHeder = {
        backgroundColor: backgroundColor,
        color: textColor,
        padding: collapsed ? '0.5rem 1rem' : '8px',
        borderRadius: collapsed ? '' : '6px'
    }
    const style = document.createElement('style');
    style.innerHTML = `
    .nav-pills .nav-link.active, .nav-pills .show > .nav-link{
          background-color: ${backgroundColor};
          color: ${textColor};
          border: 1px solid ${borderColor};
          margin:0;
          border-radius: 0.5rem !important;

          &:hover,
          &:focus,
          &:active{
            background-color: ${borderColor};
            border-color: ${backgroundColor};
            color: ${backgroundColor} !important;
            box-shadow: none;
          }
        }
      `;
    document.head.appendChild(style);
    useEffect(() => {
        setTabActiveItem(featureData[0]?.layerName || 'defaultTab')
    }, [])

    useEffect(() => {
        if (queryType == "productFilter" && featureData.length > 0 && featureData[0]?.data && featureData[0]?.data.length > 0) {
            const headings = Object.keys(featureData[0]?.data[0]);
            setHeaders(headings);
        } else if (featureData.length > 0 && featureData[0]?.data) {
            const headings = Object.keys(featureData[0]?.data[0]);
            setHeaders(headings);
        }
    }, [queryType, featureData]);

    useEffect(() => {
        if (geometryCollection.length > 0) {
            setGeometryData(geometryCollection);
        }
    }, [geometryCollection]);


    const handleTabClick = (layerName) => {
        setTabActiveItem(layerName);
        const newHeading = featureData.find((feature) => feature.layerName === layerName);
        if (newHeading) {
            const { data } = newHeading;
            const headings = Object.keys(data[0] || {});
            setHeaders(headings);
        }

    };

    return (
        <div div id="collapseBottomTable" className={`collapseBottomTable ${sideBarVisible || sideBarLayersVisible ? 'active' : ''}`} style={{ transition: 'all 4s', width: '100%', position: 'absolute', bottom: '0', left: '50%', transform: 'translate(-50%, 0)', zIndex: '99' }}>
            <div className='transition'>
                <StyledButton id="collapsedBtn" style={{ position: 'absolute', bottom: '0', left: '50%', borderRadius: '0', transform: 'translate(-50%, 0)' }} onClick={() => {
                    if (collapsed) {
                        toggleCollapsibleTablePanel(false);
                    }
                    else {
                        toggleCollapsibleTablePanel(true);
                    }
                }}><i className="bi bi-arrow-bar-up"></i></StyledButton>
                <Card className={`${collapsed ? 'collapsed' : ''}`} style={featureCardStyles}>
                    <Card.Header className="pe-2" style={dragtableCardHeder}>
                        <Stack direction="horizontal">
                            {collapsed ? <div className="mb-0 me-3 align-items-center" id="featureTable" style={{ color: textColor, display: 'flex' }}>
                                <i className="bi bi-funnel me-2" style={{ marginTop: '2px' }}>
                                </i>{featureData.length > 0 && <h6 className="mb-0">Search Result</h6>}</div> : null}
                            <CloseButtonWrapper
                                onClick={() => {
                                    if (collapsed) {
                                        toggleCollapsibleTablePanel(false);
                                    }
                                    else {
                                        toggleCollapsibleTablePanel(true);
                                    }
                                }}
                                aria-expanded={collapsed}
                                className='ms-auto'
                            >
                                <i className="bi bi-dash"></i>
                            </CloseButtonWrapper>
                        </Stack>
                    </Card.Header>
                    <Collapse in={collapsed}>
                        <Card.Body className='p-1' style={{ minHeight: '250px', maxHeight: '250px', overflow: 'hidden' }}>
                            <div>
                                {queryType == "productFilter" ? (
                                    <Tabs activeKey={tabActiveItem} onSelect={handleTabClick} variant="pills">
                                        {featureData?.map((feature, index) => (
                                            <Tab eventKey={feature?.layerName} title={feature?.layerName} key={index}>
                                                <Card className="mt-2">
                                                    <FeatureTable featureGeometryData={feature?.data} title={feature?.layerName}
                                                        queryType={queryType} geometryData={geometryData}
                                                        headers={headers} selectedCalenderDate={selectedCalenderDate}
                                                    />
                                                </Card>
                                            </Tab>
                                        ))}
                                    </Tabs>
                                ) : (
                                    <Card className="mt-2">
                                        <FeatureTable featureGeometryData={featureData[0]?.data}
                                            queryType={queryType} geometryData={geometryData}
                                            headers={headers} selectedCalenderDate={selectedCalenderDate}
                                        />
                                    </Card>
                                )}
                            </div>
                        </Card.Body>
                    </Collapse>
                </Card>
            </div>
        </div>
    )
}

export default CollapsibleTable;

