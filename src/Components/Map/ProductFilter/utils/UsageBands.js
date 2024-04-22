import React from 'react'
import { ListGroup } from "react-bootstrap";
import CheckboxList from './CheckBoxList';

function UsageBands({ options, type, bands, handleOnChange, handleOnSelectAll, backgroundColor }) {
    const usgabandbox = {
        maxHeight: '170px',
        height: 'auto',
        overflow: 'auto',
    }
    return (
        <>
            <ListGroup className='linearBgCard' style={usgabandbox}>
                <CheckboxList
                    options={options}
                    type={type}
                    bands={bands}
                    handleOnChange={handleOnChange}
                    handleOnSelectAll={handleOnSelectAll}
                    backgroundColor={backgroundColor}
                />
            </ListGroup>
        </>
    )
}

export default UsageBands;