# Site-Whist


Site-Whist is a website for playing the card game whist with other players. (Due to Heroku removing the free tier, this project is not deployed anywhere as of this moment).

## Installation

Clone the repository

```bash
cd server
npm i
npm start
cd ../client
npm i
npm start
```

## How it works
It uses sockets in order to make the online play work without reloading the page. More specifically it uses the concept of 'room' from the socket.io open source library.

## License
[MIT](https://choosealicense.com/licenses/mit/)
