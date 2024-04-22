import React from 'react';
import Form from 'react-bootstrap/Form';
import ListGroup from 'react-bootstrap/ListGroup';
import { useColor } from '../../../../CustomContext/ColorContext';

function CheckboxList({ options, type, bands, handleOnChange, handleOnSelectAll, backgroundColor }) {
    const { textColor, borderColor, typoColor } = useColor();
    const renderCheckboxList = () =>
        options.map(opt => (
            <ListGroup.Item key={opt.value} style={{ borderColor: borderColor }} className='px-2'>
                <Form.Check type="switch" style={{ borderColor: borderColor }}>
                    <Form.Check.Input
                        type="checkbox"
                        name={opt.band}
                        onChange={e => handleOnChange(e, type)}
                        checked={opt.selected}
                        className="me-2 d-flex"
                        style={{ backgroundColor: opt.selected ? backgroundColor : 'transparent', borderColor: borderColor }}
                        id={opt.band}
                    />
                    <Form.Check.Label className="ms-auto" style={{ color: typoColor }}>{opt.value}</Form.Check.Label>
                </Form.Check>
            </ListGroup.Item>
        ));

    const renderSelectAllCheckbox = () => (
        <div>
            <ListGroup.Item style={{ borderColor: borderColor }} className='px-2'>
                <Form.Check type="switch" style={{ borderColor: borderColor }}>
                    <Form.Check.Input
                        className="me-1"
                        type="checkbox"
                        onChange={e => handleOnSelectAll(e, type)}
                        checked={bands[type].every(opt => opt.selected)}
                        style={{ backgroundColor: bands[type].every(opt => opt.selected) ? backgroundColor : 'transparent', borderColor: borderColor }}
                    />
                    <Form.Check.Label style={{ color: typoColor, borderColor: borderColor }}>{`Select All`}</Form.Check.Label>
                </Form.Check>
            </ListGroup.Item>
        </div>
    );

    return (
        <>
            {renderSelectAllCheckbox()}
            {renderCheckboxList()}
        </>
    );
}

export default CheckboxList;
