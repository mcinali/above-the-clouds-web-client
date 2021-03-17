// Establish runtime environment
const env = process.env.ENV
// Create local URLs for APIs/sockets
const localhostURL = 'http://localhost'

const localhost = localhostURL + ':8080'
const localsockethost = localhostURL + ':8000'

// Set hostname based on runtime environment
const hostname = (env=='prod' || env=='staging') ? process.env.BACKEND_WEB_URL : localhost
// Set socket hostname based on runtime environment
const sockethostname = (env=='prod' || env=='staging') ? process.env.BACKEND_WEB_URL : localsockethost

module.exports = {
  hostname,
  sockethostname,
}
