import React, { useState, useEffect } from 'react'
import Router, { useRouter } from "next/router"
import loginStyles from '../../styles/Login.module.css'
import commonStyles from '../../styles/Common.module.css'
import { setCookie } from '../../utilities'
const { hostname } = require('../../config')
const axios = require('axios')

export async function getServerSideProps({ res, query }) {
  try {
    return { props: { email: query.email } }
  } catch (error) {
    res.writeHead(307, { Location: '/oops' }).end()
    return { props: {ok: false, reason: 'Issues accessing page' } }
  }
}

export default function PasswordResetEmailConfirm({ email }) {

  return (
    <div className={commonStyles.container}>
      <div className={loginStyles.main}>
        <div className={loginStyles.description}>An email has been sent to <b>{email}</b> to reset your password.</div>
      </div>
    </div>
  )
}
