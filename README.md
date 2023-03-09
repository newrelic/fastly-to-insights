# Fastly to Insights

This is the New Relic blessed way to get your Fastly metrics into Insights, packaged as a Docker container image for ease of use!

In order to use the Fastly to Insights Docker image, you will need an active New Relic account with Insights, an active Fastly account with Read access, a New Relic Insights Insert key and a Fastly API Key. The Docker image can be found [here](https://cloud.docker.com/swarm/newrelic/repository/docker/newrelic/fastly-to-insights/general).

Once reporting starts, a `FastlySample` event will become available to query:

```nrql
FROM FastlySample select *
```

## How to use this image

Before you get started, make sure that you have a [Fastly API Key](https://docs.fastly.com/guides/account-management-and-security/using-api-tokens) and a [New Relic Insert Key](https://docs.newrelic.com/docs/insights/insights-data-sources/custom-data/insert-custom-events-insights-api#register).

The Fastly to Insights image is configured by environment variables. These are mandatory:

* `ACCOUNT_ID`
* `FASTLY_KEY`
* `INSERT_KEY`
* `SERVICES`

`SERVICES` needs to be a string with the ids of the Fastly services you want to see data for in Insights, separated by a space. I know that's not ideal. A limitation of Fastly is that you have to query one service at a time, so I chose to create an array of service ids and loop through them to query Fastly. A limitation of Docker is that you can't pass an array via the command line, so I chose to split a string on "` `". If you have a better idea, I would love to hear it - please contribute!

Additionally, the polling interval (how often realtime metrics are requested from Fastly) can be configured by setting the `POLL_INTERVAL` which, by default, is 3 minutes.

### Example

```shell
$ docker run \
  -e ACCOUNT_ID='yourNewRelicAccountId' \
  -e FASTLY_KEY='yourFastlyKey' \
  -e INSERT_KEY='yourNewRelicInsertKey' \
  -e SERVICES='list of services' \
  newrelic/fastly-to-insights
```

## Contributing

You are welcome to send pull requests to us - however, by doing so you agree that you are granting New Relic a non-exclusive, non-revokable, no-cost license to use the code, algorithms, patents, and ideas in that code in our products if we so choose. You also agree the code is provided as-is and you provide no warranties as to its fitness or correctness for any purpose.

## Developing

### Building and running the image locally

A Makefile is provided which you can use to build and run the fastly to insights integration locally -- `make run` will build and then run the image. You can provide configuration via a `.env` file (`.env.example` provided as an example).

## More Information

For more information on the Fastly Real-Time Analytics API, look [here](https://docs.fastly.com/api/analytics).

For more information on the New Relic Insights API, look [here](https://docs.newrelic.com/docs/insights/insights-data-sources/custom-data/insert-custom-events-insights-api). 

This project is provided AS-IS WITHOUT WARRANTY OR SUPPORT, although you can report issues and contribute to the project.
