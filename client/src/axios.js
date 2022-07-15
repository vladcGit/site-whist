const axios = require('axios');
const client = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

export default client;
