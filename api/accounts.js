const { hostname } = require('../config')
const axios = require('axios')

function registerAccount(userInfo) {
  try {
    const response = axios.post(hostname+'/account/register', {
      'username': userInfo.username,
      'password': userInfo.password,
      'email': userInfo.email,
      'phone': userInfo.phone,
      'firstname': userInfo.firstname,
      'lastname': userInfo.lastname,
    })
    .then(function(response) {return response})
    .catch(function(error) {new Error(error)})
  } catch (error) {
    throw new Error(error)
  }
}

module.exports = {
  registerAccount,
}
