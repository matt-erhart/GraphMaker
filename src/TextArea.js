import React from 'react';
import styled from 'styled-components'
import TextareaAutosize from 'react-autosize-textarea';

const TextAreaCss = styled(TextareaAutosize)`
  display:block;
  box-sizing: padding-box;
  overflow:hidden;
  background-color: ${props => props.readOnly? '#2C6CC3': 'grey'};
  color: white;
  padding:3px;
  width:150px;
  font-size:14px;
  margin:3px;
  border-radius:6px;
  border-width: ${props => props.selected? 10: 0};
  border-color: ${props => props.selected? 'black': 'white'};
  outline: ${props => props.selected? 'black': 'white'};
  opacity: .8;
  white-space: normal;
  text-align: center;
  font-weight: bold;
  margin: 0;
  &:focus {
      box-shadow:2px 2px 8px rgba(0,0,0,.3);
  }
    `
export default TextAreaCss;
