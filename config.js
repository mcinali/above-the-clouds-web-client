// Establish runtime environment
const env = process.env.RUNTIME_ENV
// Create local URLs for APIs/sockets
const localhostURL = 'http://localhost'
const port = '8080'
const socketPort = '8000'
const localhost = localhostURL + ':' + port
const localsockethost = localhostURL + ':' + socketPort
// Create GCP URLs for APIs/sockets
const gcphost = 'https://api.abovethecloudsapp.com'
// Set hostname based on runtime environment
const hostname = (env=='prod') ? gcphost : localhost
// Set socket hostname based on runtime environment
const sockethostname = (env=='prod') ? gcphost : localsockethost

module.exports = {
  hostname,
  sockethostname,
}
