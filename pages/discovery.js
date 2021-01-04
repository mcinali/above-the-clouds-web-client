import React from 'react'
import Link from 'next/link'
import Router from "next/router"
import commonStyles from '../styles/Common.module.css'
import discoveryStyles from '../styles/Discovery.module.css'
const { hostname } = require('../config')
const axios = require('axios')

export default function Discover() {
  return (
    <div className={commonStyles.container}>
      <header className={commonStyles.header}></header>
      <div id="leftPanel" className={discoveryStyles.leftPanel}>Hello</div>
      <div id="rightPanel" className={discoveryStyles.rightPanel}>Friend</div>
    </div>
  )
}

// TO DO:
// Discovery component
// Connections component
// Header/Account component
