// Copyright 2018 New Relic, Inc.  Licensed under the Apache License, version 2.0 (the "License"); you may not use this file except in compliance with the License.  You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, either express or implied. 
//Copyright 2018 New Relic Inc. All rights reserved.

import fetch from 'node-fetch';
import { ApiClient, RealtimeApi, ServiceApi } from "fastly";

const ACCOUNT_ID = process.env.ACCOUNT_ID
const INSERT_KEY = process.env.INSERT_KEY
const FASTLY_KEY = process.env.FASTLY_KEY
const INSIGHTS_HOST = process.env.INSIGHTS_HOST || "insights-collector.newrelic.com";
const EVENT_TYPE = process.env.EVENT_TYPE || "FastlySample";
const POLL_INTERVAL = process.env.POLL_INTERVAL || 180000 // 3 minutes.

// A limitation of Fastly is that you have to query one service at a time. I chose to create an array of my service ids, and loop through them.
const LIST_OF_SERVICES = process.env.SERVICES.split(" ");

let timestamp = 0;

const realtimeApiClient = new ApiClient();
realtimeApiClient.basePath = "https://rt.fastly.com";
realtimeApiClient.authenticate(FASTLY_KEY);
const realtimeApi = new RealtimeApi(realtimeApiClient);
const apiClient = new ApiClient();
apiClient.authenticate(FASTLY_KEY);
const serviceApi = new ServiceApi(apiClient);

// Perform an initial poll of the services and then set an interval to poll every 3 minutes.
pollServices();
setInterval(pollServices, POLL_INTERVAL) // 3 minutes

function pollServices() {
  LIST_OF_SERVICES.map(async (service) => {
    pollFromFastly(service);
  });
}

async function pollFromFastly(service) {
  console.log(`Polling ${service}`);

  try {
    const serviceDetail = await serviceApi.getService({ service_id: service });
    const valuableData = await realtimeApi.getStatsLastSecond({
      service_id: service,
      timestamp_in_seconds: timestamp
    });

    if (valuableData.Error) {
      console.log('error in stats', valuableData.Error)
    } else {
      timestamp = valuableData.Timestamp
      valuableData.Data.map((data) => {
        batchAndSend(data.aggregated, { id: service, name: serviceDetail.name });
      })
    }

  } catch (error) {
    console.log('error fetching stats', error)
  }
}

async function batchAndSend(aggregate, service) {
  let message = {
    "eventType": EVENT_TYPE,
    "service_id": service.id,
    "service_name": service.name,
    ...aggregate,
  }
  await sendToInsights(message)
}

async function sendToInsights(logMessages) {
  let insights_url = `https://${INSIGHTS_HOST}/v1/accounts/${ACCOUNT_ID}/events`;
  try {
    fetch(insights_url, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        "X-Insert-Key": INSERT_KEY
      },
      body: JSON.stringify(logMessages)
    });
  } catch (error) {
    console.log('error posting to insights', error);
  }
}
