# Collaborative Model Editor

## How to run standalone?
- The backend address is set in package.json
- Needed signaling server is set in the main component in WebRtcProvider constructor
- These services are up and running
- The following commands will start the front-end
  - ```git clone <This repo>```
  - ```cd bp``` 
  -  ```npm i```
  -  ```npm start```

## How to run locally?
- Run back-end (c# project)
  - ```dotnet run --project API```
- Run signaling server
  - ```node src/server.js``` 


## Deployment?
- This project could not be deployed because of webSocket requests, which cannot be redirected to the Signaling server
