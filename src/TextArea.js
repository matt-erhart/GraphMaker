import React from 'react';
import styled from 'styled-components'
import TextareaAutosize from 'react-autosize-textarea';

const TextArea = styled(TextareaAutosize)`
  display:block;
  box-sizing: padding-box;
  overflow:hidden;
  background-color: #2C6CC3;
  color: white;
  padding:3px;
  width:150px;
  font-size:14px;
  margin:50px auto;
  border-radius:6px;
  border:0;
  opacity: .8;
  white-space: normal;
  text-align: center;
  font-weight: bold;
  outline: none;
  margin: 0;
  &:focus {
      box-shadow:2px 2px 8px rgba(0,0,0,.3);
  }
    `
export default TextArea;
