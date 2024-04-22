import React, { useState, useEffect, useContext } from "react";
import { Table, Form } from "react-bootstrap";
import { StyledButton, StyledLoaderInner, StyledLoaderWraper } from "../../../CustomHooks/CustomStyledComponents.js";
import rootConfig from "../../../ExternalUrlConfig.json";
import { useCheckedItems } from '../../../CustomContext/CheckedItemContext';
import { clearSailTimerVectorData, clearHighLightVectorData, rtzfeatureGeometryhighLight } from "../../../Openlayers/MapLayerManager.js"
import { RunSailTimerApi } from "../../../GeoServer/SailTimer.js";
import { OLMapContext } from "../OLMap";
import config from "../../../utils/ApplicationTitleConfig";
import { useColor } from "../../../CustomContext/ColorContext";

var serverPort = null;

const FeatureTable = ({ featureGeometryData, title, queryType, geometryData, headers, selectedCalenderDate }) => {

    const rowStyle = {
        paddingRight: title === rootConfig.S1412WindDataLayerName ? '28px' : '17px'
    };
    const olMap = useContext(OLMapContext);
    const [layerName, setLayerName] = useState([]);
    const [selectAllChecked, setSelectAllChecked] = useState(false);
    const { checkedItems, setCheckedItems, toggleCheckedItem, removeItem } = useCheckedItems();
    const [activeButtonIndex, setActiveButtonIndex] = useState(null);
    const [cart, setCart] = useState(true);
    const { backgroundColor, textColor, borderColor, typoColor } = useColor();
    const storedUsername = sessionStorage.getItem('username');
    const [loading, setLoading] = useState(false);

    useEffect(() => {

        if (config?._data?.PortID !== undefined && config._data.PortID !== "" && olMap) {
            serverPort = config?._data?.PortID;
        }
        localStorage.removeItem('checkedItems');
    }, [serverPort]);

    const handleSelectAllChange = (data, title) => {

        setSelectAllChecked(prevSelectAllChecked => {
            const newState = { ...prevSelectAllChecked };
            newState[title] = !newState[title];
            return newState;
        });

        setLayerName(prevLayerName => {
            if (!prevLayerName.includes(title)) {
                return [...prevLayerName, title];
            } else {
                return prevLayerName.filter(name => name !== title);
            }
        });

        if (!selectAllChecked[title]) {
            data.forEach(item => {
                toggleCheckedItem(item);
            });
        } else {
            data.forEach(item => {
                removeItem(item);
            });
        }
    };

    const handleCheckboxChange = async (item) => {

        const isChecked = checkedItems.some(i => i.ID === item.ID && i.chartnumber === item.chartnumber);
        const isCheckedInLocalStorage = JSON.parse(localStorage.getItem('checkedItems') || '[]').includes(item.ID);

        if (isChecked || isCheckedInLocalStorage) {
            const updatedCheckedItems = checkedItems.filter(i => !(i.ID === item.ID && i.chartnumber === item.chartnumber));
            setCheckedItems(updatedCheckedItems);

            const updatedCheckedItemsLocalStorage = JSON.parse(localStorage.getItem('checkedItems') || '[]')
                .filter(id => id !== item.ID);
            localStorage.setItem('checkedItems', JSON.stringify(updatedCheckedItemsLocalStorage));


        } else {

            const updatedCheckedItems = [...checkedItems, item];
            setCheckedItems(updatedCheckedItems);

            const updatedCheckedItemsLocalStorage = JSON.parse(localStorage.getItem('checkedItems') || '[]');
            updatedCheckedItemsLocalStorage.push(item.ID);
            localStorage.setItem('checkedItems', JSON.stringify(updatedCheckedItemsLocalStorage));

            const allChecked = checkedItems.length === item.length;
            setSelectAllChecked(allChecked);
            setCart(!cart);

        }
    };

    const handleViewClick = (viewFeatures, index) => {
        setActiveButtonIndex(index);
        const { left, top, right, bottom, ID } = viewFeatures;
        clearSailTimerVectorData(olMap);
        clearHighLightVectorData(olMap);
        rtzfeatureGeometryhighLight(left, top, right, bottom, olMap);
        setLoading(true);
        RunSailTimerApi(left, top, right, bottom, selectedCalenderDate, olMap, serverPort);
        setLoading(false);
    }

    return (
        featureGeometryData && <Table responsive striped className="featureTable_attr mb-0 fixed_header" size='sm'>
            <thead>
                <tr style={rowStyle}>
                    {queryType == "productFilter" ? (
                        <>
                            {storedUsername !== null && (<th>
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={storedUsername !== null && layerName.some(name => name.includes(title)) ? selectAllChecked : false}
                                        onChange={() => handleSelectAllChange(featureGeometryData, title)}
                                        className="form-check-input"
                                        disabled={storedUsername === null}
                                        style={{ backgroundColor, color: textColor, borderColor }}
                                    />
                                    <i className="bi bi-cart-plus mx-2" style={{ color: typoColor }}></i>
                                    Select All
                                </label>
                            </th>)
                            }
                            {headers.map((header) => (
                                header !== 'layername' && header !== 'time' && (<th key={header}>{header}</th>)
                            ))}
                            {title == rootConfig.S1412WindDataLayerName && (<th>Visualize</th>)}
                        </>
                    ) : (
                        <>
                            {headers.map((header) => (
                                header !== 'layername' && header !== 'time' && (<th key={header}>{header}</th>)
                            ))}
                        </>
                    )}
                </tr>
            </thead>
            <tbody>
                {loading==true && (
                    <StyledLoaderWraper>
                        <StyledLoaderInner />
                    </StyledLoaderWraper>
                )}
                {queryType === "productFilter" ? (
                    featureGeometryData.length >= 1 && featureGeometryData.map((feature, index) => (
                        <tr key={index}>
                            {storedUsername !== null && (
                                <td>
                                    <div className="p-1" style={{ color: typoColor, borderColor }}>
                                        <Form.Check style={{ borderColor }}>
                                            <Form.Label className="mb-0">
                                                {cart ? <i className="bi bi-cart-plus me-2"></i> : <i className="bi bi-cart-x me-2"></i>}
                                            </Form.Label>
                                            <input
                                                type="checkbox"
                                                style={{
                                                    backgroundColor: checkedItems.some(i => i.ID === feature.ID && i.chartnumber === feature.chartnumber) ? backgroundColor : 'transparent',
                                                    color: textColor,
                                                    borderColor
                                                }}
                                                className="form-check-input"
                                                disabled={storedUsername === null}
                                                checked={checkedItems.some(i => i.ID === feature.ID && i.chartnumber === feature.chartnumber)}
                                                onChange={() => handleCheckboxChange(feature)}
                                            />
                                        </Form.Check>
                                    </div>
                                </td>
                            )}
                            {Object.entries(feature).map(([key, value]) => (
                                key !== 'layername' && key !== 'time' && (
                                    <td key={key}>
                                        {typeof value === 'object' ? JSON.stringify(value) : value}
                                    </td>
                                )
                            ))}
                            {title === rootConfig.S1412WindDataLayerName && (
                                <td key={index} className="">
                                    <StyledButton
                                        className={`drawBtn ${activeButtonIndex === index ? 'active' : ''}`}
                                        onClick={(index) => { handleViewClick(feature, index); }}
                                    >
                                        View
                                    </StyledButton>
                                </td>
                            )}
                        </tr>
                    ))
                ) : (
                    <tr>
                        {featureGeometryData && (
                            Object.entries(featureGeometryData[0]).map(([key, value]) => (
                                key !== 'layername' && key !== 'time' && (
                                    <td key={key}>
                                        {typeof value === 'object' ? JSON.stringify(value) : value}
                                    </td>
                                )
                            ))
                        )}
                    </tr>
                )}

            </tbody>
        </Table>
    );
};

export default FeatureTable;
