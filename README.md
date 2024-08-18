# 1-mile
Gamified online chat. Walk and make new friends.

## Description

1-mile is a gamified online chat application that connects you with nearby strangers. The two participants in a chat only know the distance between them and are encouraged to guess each other’s location. As they chat and walk towards each other, the distance updates. The game ends when they meet in real life.

Users are encouraged to walk and meet in real life. It’s healthy, fun, and a great way to make new friends.

Strangers must be within 1 to 8 miles of each other to be connected. The distance is calculated using the Haversine great-circle distance formula.

## Testing on Your machine

### Docker:
1. Clone the repository.
2. Run `docker-compose up` within the cloned repository.
3. Open `localhost:3000` in your browser.
4. You can now simulate another browser tab with a different location or use another physical device on your local network.

### Manual:
1. Clone the repository.
2. Configure a [PostgreSQL](https://www.postgresql.org/) database with the [PostGIS](https://postgis.net/) extension.
3. Run `npm install` within the cloned repository.
4. Run `npm build` and `npm start` within the cloned repository.
5. Open `localhost:3000` in your browser.
6. You can now simulate another browser tab with a different location or use another physical device on your local network.
