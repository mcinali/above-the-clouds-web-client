// Establish runtime environment
const env = process.env.RUNTIME_ENV
// Create local URLs for APIs/sockets
const localhostURL = 'http://localhost'
const restPort = '8080'
const socketPort = '8000'
const localhost = localhostURL + ':' + restPort
const sockethost = localhostURL + ':' + socketPort
// Create GCP URLs for APIs/sockets
const gcphost = 'https://api.abovethecloudsapp.com'
const gcpsockethost = 'https://api.abovethecloudsapp.com:8000'
// Set hostname based on runtime environment
const hostname = (env=='prod') ? gcphost : localhost
// Set socket hostname based on runtime environment
const sockethostname = (env=='prod') ? gcpsockethost : sockethost

module.exports = {
  hostname,
  sockethostname,
}
