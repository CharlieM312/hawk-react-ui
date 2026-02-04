# Hawk React UI

A single page web application for an [Eclipse Hawk](https://www.eclipse.org/hawk/) Docker image, built using React.

## Getting Started

  1. If you already have a Hawk Docker image set up, skip to step 3
  2. Follow the instructions in the README of [this folder](https://gitlab.com/hawklabs/hawk-docker/-/tree/master/example-gradle) to set up a new Hawk Docker image
  3. Clone this repo and run `npm install` from the root directory to install the necessary packages
  4. Run `npm start` and the website will launch in your browser
  5. Enter the url of the Hawk Server (if using the example project, this will likely be 'http://localhost:8080/thrift/hawk/json')

## Running from prebuilt Docker image

You can run the latest Docker image for this web UI in one command:

```shell
docker run --rm -it -p 8081:80 registry.gitlab.com/hawklabs/hawk-react-ui:latest
```

The web UI will be available from http://localhost:8081.

This requires that you have a Docker server running on the local machine: you may want to check the [Hawk Docker image](https://gitlab.com/hawklabs/hawk-docker).

## Building and running your own Docker image

Alternatively, to build and run your own image:

```shell
docker build -t hawk-react-ui:latest .
docker run --rm -it -p 8081:80 hawk-react-ui
```

## Building and running docker image from the web

To build and run the latest docker image from the repository:

```shell
docker pull ghcr.io/charliem312/hawk-react-ui:latest
docker run --rm -it -p 8081:80 hawk-react-ui
```
Also, if you are not logged in to the Github container registry - you may need to run these commands on Powershell:
```shell
docker login ghcr.io -u YOUR_USERNAME
```
You will then be prompted for a password which will be a token generated through this link:
[GitHub Settings](https://github.com/settings/tokens/new?scopes=write:packages)

## License

[![License](https://img.shields.io/badge/License-EPL_2.0-red.svg)](https://opensource.org/licenses/EPL-2.0)
