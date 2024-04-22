import React, {useEffect} from 'react';
import { useColor } from '../../CustomContext/ColorContext';
import { Form } from 'react-bootstrap';

function CssEditor() {

    const {
        newBackgroundColor,
        newTextColor,
        newBorderColor,
        newTypoColor,
        newCardbodyColor,
        fontFamily,
        handleBackgroundColorChange,
        handleTextColorChange,
        handleBorderColorChange,
        handleTypoColorChange,
        handlecardbodyColorChange,
        handleFontFamilyChange
    } = useColor();
    let defaultfont = "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen','Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue' sans-serif";
    const fontOptions = [
         defaultfont,
        'Arial, sans-serif',
        'Times New Roman, serif',
        'Courier New, monospace',
        'Verdana, Geneva, sans-serif',
        // Add other font options as needed
    ];

    return (
        <Form>
            <Form.Group className='mb-3'>
                <Form.Label>Background-color:</Form.Label>
                <Form.Control size='sm'
                    type='color'
                    value={newBackgroundColor}
                    onChange={(e) => handleBackgroundColorChange(e.target.value)}
                ></Form.Control>
            </Form.Group>
            <Form.Group className='mb-3'>
                <Form.Label>Text-color:</Form.Label>
                <Form.Control
                    type='color'
                    size='sm'
                    value={newTextColor}
                    onChange={(e) => handleTextColorChange(e.target.value)}
                ></Form.Control>
            </Form.Group>
            <Form.Group className='mb-3'>
                <Form.Label>Border-color:</Form.Label>
                <Form.Control
                    type='color'
                    size='sm'
                    value={newBorderColor}
                    onChange={(e) => handleBorderColorChange(e.target.value)}
                ></Form.Control>
            </Form.Group>
            <Form.Group className='mb-3'>
                <Form.Label>To change the colour of tags p,a,label,h1,h2,h3,h4,h5,h6,span:</Form.Label>
                <Form.Control
                    type='color'
                    size='sm'
                    value={newTypoColor}
                    onChange={(e) => handleTypoColorChange(e.target.value)}
                />
            </Form.Group>
            <Form.Group className='mb-3'>
                <Form.Label>To change the colour of input type and cardbodys:</Form.Label>
                <Form.Control
                    type='color'
                    size='sm'
                    value={newCardbodyColor}
                    onChange={(e) => handlecardbodyColorChange(e.target.value)}
                />
            </Form.Group>
            <Form.Group className='mb-3'>
                <Form.Label>Font-Family:</Form.Label>
                <Form.Select
                    value={fontFamily}
                    onChange={(e) => handleFontFamilyChange(e.target.value)}
                >
                    {fontOptions.map((option, index) => (
                        <option key={index} value={option}>
                            {option}
                        </option>
                    ))}
                </Form.Select>
            </Form.Group>
        </Form>
    );
}

export default CssEditor;
