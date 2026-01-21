![Build](https://github.com/defra/fcp-fdm-pay-adapter/actions/workflows/publish.yml/badge.svg)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_fcp-fdm-pay-adapter&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=DEFRA_fcp-fdm-pay-adapter)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_fcp-fdm-pay-adapter&metric=bugs)](https://sonarcloud.io/summary/new_code?id=DEFRA_fcp-fdm-pay-adapter)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_fcp-fdm-pay-adapter&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=DEFRA_fcp-fdm-pay-adapter)
[![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_fcp-fdm-pay-adapter&metric=duplicated_lines_density)](https://sonarcloud.io/summary/new_code?id=DEFRA_fcp-fdm-pay-adapter)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_fcp-fdm-pay-adapter&metric=coverage)](https://sonarcloud.io/summary/new_code?id=DEFRA_fcp-fdm-pay-adapter)

# Farming Data Model (FDM) Payment Hub Adapter

The FDM Payment Hub Adapter consumes payment events from Azure Service Bus and forwards them to the CDP hosted Farming Data Model.

## Requirements

### Docker

This application is intended to be run in a Docker container to ensure consistency across environments.

Docker can be installed from [Docker's official website](https://docs.docker.com/get-docker/).

> The test suite includes integration tests which are dependent on a Postgres container so cannot be run without Docker.

## Local development

### Setup

Install application dependencies:

```bash
npm install
```

### Development

To run the application in `development` mode run:

```bash
npm run docker:dev
```

### Testing

To test the application run:

```bash
npm run docker:test
```

Tests can also be run in watch mode to support Test Driven Development (TDD):

```bash
npm run docker:test:watch
```

## Licence

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government license v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable
information providers in the public sector to license the use and re-use of their information under a common open
licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.
