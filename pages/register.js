import React from 'react'
import Link from 'next/link'
import Router from "next/router"
import commonStyles from '../styles/Common.module.css'
import registrationStyles from '../styles/Registration.module.css'
const { hostname } = require('../config')
const axios = require('axios')



export default function Register() {
  return (
    <div className={commonStyles.container}>
      <body className={registrationStyles.main}>
        <h1 className={registrationStyles.title}>
          <a> Above the Clouds</a>
        </h1>
        <p className={registrationStyles.description}>A Space for Meaningful Conversations</p>
        <RegistrationForm></RegistrationForm>
        <p className={registrationStyles.textlink}>
          <Link href="/login">Already have an account? Login here</Link>
        </p>
      </body>
    </div>
  )
}

class RegistrationForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      username: '',
      password: '',
      firstname: '',
      lastname: '',
      email: '',
      phone: '',
      submitDisabled: true,
      validationErrors: new Array(),
    }
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value.trim()})
    const uglyBoolean = !(
      ((event.target.name=="username") ? Boolean(event.target.value.trim()) : Boolean(this.state.username)) &&
      ((event.target.name=="password") ? Boolean(event.target.value.trim()) : Boolean(this.state.password)) &&
      ((event.target.name=="firstname") ? Boolean(event.target.value.trim()) : Boolean(this.state.firstname)) &&
      ((event.target.name=="lastname") ? Boolean(event.target.value.trim()) : Boolean(this.state.lastname)) &&
      ((event.target.name=="email") ? Boolean(event.target.value.trim()) : Boolean(this.state.email)) &&
      ((event.target.name=="phone") ? Boolean(event.target.value.trim()) : Boolean(this.state.phone))
    )
    this.setState({submitDisabled: uglyBoolean})
  }

  handleSubmit(event) {
    event.preventDefault()
    axios.post(hostname+'/account/register', {
      'username': this.state.username,
      'password': this.state.password,
      'email': this.state.email,
      'phone': this.state.phone,
      'firstname': this.state.firstname,
      'lastname': this.state.lastname,
    })
    .then(res => {
      Router.push("/discovery")
    })
    .catch(error => {
      if (error.response && error.response.data && error.response.data.errors){
        this.setState({validationErrors: error.response.data.errors})
      } else {
        new Error(error)
      }
    })
  }

  render(){
    console.log(this.state.validationErrors)
    return (
      <form onSubmit={this.handleSubmit} className={registrationStyles.form}>
        <input name="username" placeholder="username" value={this.state.username} onChange={this.handleChange} className={registrationStyles.input}/>
        <input name="password" type='password' placeholder="password" value={this.state.password} onChange={this.handleChange} className={registrationStyles.input}/>
        <input name="firstname" placeholder="first name" value={this.state.firstname} onChange={this.handleChange} className={registrationStyles.input}/>
        <input name="lastname" placeholder="last name" value={this.state.lastname} onChange={this.handleChange} className={registrationStyles.input}/>
        <input name="email" placeholder="email" value={this.state.email} onChange={this.handleChange} className={registrationStyles.input}/>
        <input name="phone" placeholder="phone number" value={this.state.phone} onChange={this.handleChange} className={registrationStyles.input}/>
        <p></p>
        <button type="submit" className={registrationStyles.registrationButton} disabled={this.state.submitDisabled}>Create Account</button>
        <ul>{this.state.validationErrors.map((item,index) => <li key={index.toString()} className={registrationStyles.error}>{item}</li>)}</ul>
    </form>
    )
  }
}
