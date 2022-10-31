# Example-3

Example number 3 from Chapter 4 of [Bootstrapping Microservices](https://www.bootstrapping-microservices.com).

In Chapter 4 of Bootstrapping Microservices you learn to develop and test a microservices application using Docker-Compose.

You need Docker and Docker-Compose installed to run this.

Boot it up from the terminal using:

    docker-compose up --build

You must now load the database fixture ./db-fixture/videos.json into your database. You can do this using Robo 3T or mongoimport.

Then point your browser at http://localhost:4002/video?id=5d9e690ad76fe06a3d7ae416