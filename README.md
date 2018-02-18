# Gemsearch web-client

This is the webclient for the Gemsearch system.

## Requirements

* Node.js
* yarn or npm

## Installation

Run `yarn install` in this folder to install all required node modules.


Use the command `yarn run serve` to start the interactive development server. This starts webpack to compile required modules and serves them with a build-in webserver. Changed files are recompiled and hot-reloaded in the client.

This starts only the client project. If you want to execute real queries, the server must also be started and reachable under `http://localhost:5000`.

## Build

To create a single bundle with all required modules run `yarn run build-production`. This builds the client project and copies all required files into the `dist` folder. Just copy this files to your static production webserver to deploy the client.
