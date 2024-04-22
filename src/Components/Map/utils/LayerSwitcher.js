import React, { useState, useContext, useEffect } from 'react';
import { Form, ListGroup } from 'react-bootstrap';
import { OLMapContext } from "../OLMap";
import layersConfig from "../../../utils/LayersData";
import { useColor } from '../../../CustomContext/ColorContext';

export default function LayerSwitcher({ workspace }) {

    const [selectedItems, setSelectedItems] = useState([]);
    const _map = useContext(OLMapContext);
    const { backgroundColor, textColor, borderColor, typoColor } = useColor();
    var layers;
    var layersList;

    if (layersConfig?._data?.length > 0 && _map) {
        layersList = layersConfig._data.filter(obj => obj.layers.workspace === workspace);
        layers = _map.getLayers().getArray();
    }
    /*  whatever layers are added on map that data is fetching from here*/
    useEffect(() => {
        const defaultSelectedItems = layersList ? layersList.map(lyr => lyr.layers.layername) : [];
        setSelectedItems(defaultSelectedItems);
    }, []);

    /* After clicking checkbox checked and unchecked how data is displaying functionality is written here"*/
    const handleCheckboxChange = (event) => {

        const { value, checked } = event.target;

        setSelectedItems((prevSelected) => {
            if (checked) {
                layers.forEach(function (lyr) {
                    if (value === lyr.get('title')) {
                        lyr.setVisible(true);
                    }
                });
                return [...prevSelected, value];
            } else {
                layers.forEach(function (lyr) {
                    if (value === lyr.get('title')) {
                        lyr.setVisible(false);
                    }
                });
                return prevSelected.filter(item => item !== value);
            }
        });
    };

    return (
        <div>
            <Form>
                <ListGroup className='linearBgCard'>
                    {layersList && layersList.map((lyr, item) => (
                        <ListGroup.Item key={item} className='px-2'>
                            <Form.Check style={{ borderColor: borderColor }}>
                                <Form.Check.Input
                                    type="checkbox"
                                    name={lyr.layers.layername}
                                    onChange={handleCheckboxChange}
                                    checked={selectedItems.includes(lyr.layers.layername)}
                                    className="me-2"
                                    id={`checkbox-${lyr.layers.layername}`}
                                    value={lyr.layers.layername}
                                    style={{ backgroundColor: selectedItems.includes(lyr.layers.layername) ? backgroundColor : 'transparent', color: textColor, borderColor: borderColor }}
                                ></Form.Check.Input>
                                <Form.Check.Label style={{ color: typoColor, wordBreak: 'break-all' }}>{lyr.layers.layername}</Form.Check.Label>
                            </Form.Check>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </Form>
        </div>
    )
}
