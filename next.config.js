module.exports = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/entry',
        permanent: false,
      }
    ]
  },
}
