import React, { useState } from 'react';
import './CIStyle.css';
import axios from 'axios';

interface PageStartProps {
  setPage: (page: number) => void;
}

const PageStart: React.FC<PageStartProps> = ({ setPage }) => {  

  return (
    <img src={require('../../images/PrésentationSiteSAE.png')} className="PageStart-image" />
  );
}

export default PageStart;