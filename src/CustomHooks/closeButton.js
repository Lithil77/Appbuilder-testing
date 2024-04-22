// Import the styled function from styled-components
import styled from 'styled-components';

const CloseButtonWrapper = () => {

  // Create a styled component inside the functional component
  const CloseButton = styled.button`
    background-color:  ${props => props.theme.backgroundColor};
    color:  ${props => props.theme.textColor};
    border: 1px solid  ${props => props.theme.borderColor};
    border-radius: 4px;
    cursor: pointer;
    width: 30px;
    height: 30px;
    padding: 4px;
    font-size: 20px;
    display: block;
    line-height: 20px;
    
    &:hover,
    &:focus,
    &:active{
      background-color: ${props => props.theme.borderColor};
      border-color: ${props => props.theme.backgroundColor};
      color: ${props => props.theme.backgroundColor};
      box-shadow: none;
    }
    
    &:disabled {
        color: #000;
        background-color: #999;
        border-color: #ccc;
        cursor: no-drop;
        pointer-events: auto;
    }

    &.active{
      background-color: ${props => props.theme.borderColor};
      border-color: ${props => props.theme.backgroundColor};
      color: ${props => props.theme.backgroundColor};
    }
  `;

  return CloseButton;
};

export default CloseButtonWrapper();
