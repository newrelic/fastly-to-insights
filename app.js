// Copyright 2018 New Relic, Inc.  Licensed under the Apache License, version 2.0 (the "License"); you may not use this file except in compliance with the License.  You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, either express or implied. 
//Copyright 2018 New Relic Inc. All rights reserved.

const ACCOUNT_ID = process.env.ACCOUNT_ID
const INSERT_KEY = process.env.INSERT_KEY
const FASTLY_KEY = process.env.FASTLY_KEY

// A limitation of Fastly is that you have to query one service at a time. I chose to create an array of my service ids, and loop through them.
const LIST_OF_SERVICES = process.env.SERVICES.split(" ")

const request = require('request')

let timestamp = 0

setInterval( () => {
  //This will create 1920 events per day, or 13440 events per week.
   LIST_OF_SERVICES.map( (service) => {
       pollFromFastly(service)
   })
}, 180000) // 3 minutes

pollFromFastly = (service) => {
  let fastly_url = "https://rt.fastly.com/v1/channel/" + service +  "/ts/" + timestamp
  request({
    method: "GET",
    url: fastly_url,
    headers: {
      'Content-Type': 'application/json',
      "Fastly-Key": FASTLY_KEY,
    }
  }, (err, response, body) => {
    if (response) {
      let valuableData = JSON.parse(response.body)
      timestamp = valuableData.Timestamp
      valuableData.Data.map( (data) => {
          batchAndSend(data.aggregated, service)
      })
    }
    if (err) console.log(err)
  })
}

let batchAndSend = (aggregate, service) => {

  let message  = {
    "eventType":                       "LogAggregate",
    "service":                         service,
    /*
    These are all the attributes that Fastly returns. I included every one; if there are any that are less interesting to you feel free to delete those. 

    The Fastly API doesn't return an attribute if the value is 0. So instead of throwing an error, I'm just replacing missing attributes with 0. 

    For more information on the Fastly API, see https://docs.fastly.com/api/.
    */
    "num_requests":                    aggregate.requests || 0,
    "num_tls":                         aggregate.tls || 0,
    "num_http2":                       aggregate.http2 || 0,
    "num_logs":                        aggregate.log || 0,
    "num_pci":                         aggregate.pci || 0,
    "num_video":                       aggregate.video || 0,
    "ipv6":                            aggregate.ipv6 || 0,
    "pipe":                            aggregate.pipe || 0, //This is a legacy attribute
    "uncacheable":                     aggregate.uncacheable || 0,
    "shield":                          aggregate.shield || 0,
    "shield_resp_header_bytes":        aggregate.shield_resp_header_bytes || 0,
    "shield_resp_body_bytes":          aggregate.shield_resp_body_bytes || 0,
    //OTFP = On-the-Fly Packager for On Demand Streaming service for video-on-demand
    "otfp":                            aggregate.otfp || 0,
    "otfp_shield_time":                aggregate.otfp_shield_time || 0.0,
    "otfp_deliver_time":               aggregate.otfp_deliver_time || 0.0,
    "otfp_manifests":                  aggregate.otfp_manifests || 0.0,
    "otfp_shield_resp_header_bytes":   aggregate.otfp_shield_resp_header_bytes || 0,
    "otfp_shield_resp_body_bytes":     aggregate.otfp_shield_resp_body_bytes || 0,
    "otfp_resp_header_bytes":          aggregate.otfp_resp_header_bytes || 0,
    "otfp_resp_body_bytes":            aggregate.otfp_resp_body_bytes || 0,
    "bandwidth":                       aggregate.bandwidth || 0, //resp_header_bytes + resp_body_bytes + bereq_header_bytes + bereq_body_bytes
    "resp_header_bytes":               aggregate.resp_header_bytes || 0,
    "header_size":                     aggregate.header_size || 0,
    "resp_body_bytes":                 aggregate.resp_body_bytes || 0,
    "body_size":                       aggregate.body_size || 0,
    "req_body_bytes":                  aggregate.req_body_bytes || 0,
    "req_header_bytes":                aggregate.req_header_bytes || 0,
    "bereq_header_bytes":              aggregate.bereq_header_bytes || 0,
    "bereq_body_bytes":                aggregate.bereq_body_bytes || 0,
    "billed_header_bytes":             aggregate.billed_header_bytes || 0,
    "billed_body_bytes":               aggregate.billed_body_bytes || 0,
    "status_2xx":                      aggregate.status_2xx || 0,
    "status_3xx":                      aggregate.status_3xx || 0,
    "status_4xx":                      aggregate.status_4xx || 0,
    "status_5xx":                      aggregate.status_5xx || 0,
    "status_200":                      aggregate.status_200 || 0,
    "status_204":                      aggregate.status_204 || 0,
    "status_301":                      aggregate.status_301 || 0,
    "status_304":                      aggregate.status_304 || 0,
    "status_400":                      aggregate.status_400 || 0,
    "status_401":                      aggregate.status_401 || 0,
    "status_403":                      aggregate.status_403 || 0,
    "status_404":                      aggregate.status_404 || 0,
    "status_500":                      aggregate.status_500 || 0,
    "status_501":                      aggregate.status_501 || 0,
    "status_502":                      aggregate.status_502 || 0,
    "status_503":                      aggregate.status_503 || 0,
    "status_504":                      aggregate.status_504 || 0,
    "status_505":                      aggregate.status_505 || 0,
    "status_1xx":                      aggregate.status_1xx || 0,
    "waf_logged":                      aggregate.waf_logged || 0,
    "waf_blocked":                     aggregate.waf_blocked || 0,
    "waf_passed":                      aggregate.waf_passed || 0,
    "attack_req_body_bytes":           aggregate.attack_req_body_bytes || 0,
    "attack_req_header_bytes":         aggregate.attack_req_header_bytes || 0,
    "attack_logged_req_body_bytes":    aggregate.attack_logged_req_body_bytes || 0,
    "attack_logged_req_header_bytes":  aggregate.attack_logged_req_header_bytes || 0,
    "attack_blocked_req_body_bytes":   aggregate.attack_blocked_req_body_bytes || 0,
    "attack_blocked_req_header_bytes": aggregate.attack_blocked_req_header_bytes || 0,
    "attack_passed_req_body_bytes":    aggregate.attack_passed_req_body_bytes || 0,
    "attack_passed_req_header_bytes":  aggregate.attack_passed_req_header_bytes || 0,
    "attack_resp_synth_bytes":         aggregate.attack_resp_synth_bytes || 0,
    "hits":                            aggregate.hits || 0,
    "hit_ratio":                       aggregate.hit_ratio || 0.0,
    "miss":                            aggregate.miss || 0,
    "pass":                            aggregate.pass || 0,
    "pass_time":                       aggregate.pass_time || 0.0,
    "synth":                           aggregate.synth || 0,
    "errors":                          aggregate.errors || 0,
    "restarts":                        aggregate.restarts || 0,
    "hits_time":                       aggregate.hits_time || 0,
    "miss_time":                       aggregate.miss_time || 0,
    "tls":                             aggregate.tls || 0,
    "tls_v10":                         aggregate.tls_v10 || 0,
    "tls_v11":                         aggregate.tls_v11 || 0,
    "tls_v12":                         aggregate.tls_v12 || 0,
    "tls_v13":                         aggregate.tls_v13 || 0,
    //imgopto = Fastly Image Optimizer
    "imgopto":                         aggregate.imgopto || 0,
    "imgopto_resp_body_bytes":         aggregate.imgopto_resp_body_bytes || 0,
    "imgopto_resp_header_bytes":       aggregate.imgopto_resp_header_bytes || 0,
    "imgopto_shield_resp_body_bytes":  aggregate.imgopto_shield_resp_body_bytes || 0, 
    "imgopto_shield_resp_header_bytes": aggregate.imgopto_shield_resp_header_bytes || 0,
    "object_size_1k":                  aggregate.object_size_1k || 0,
    "object_size_10k":                 aggregate.object_size_10k || 0, 
    "object_size_100k":                aggregate.object_size_100k || 0,
    "object_size_1m":                  aggregate.object_size_1m || 0, 
    "object_size_10m":                 aggregate.object_size_10m || 0,
    "object_size_100m":                aggregate.object_size_100m || 0,
    "object_size_1g":                  aggregate.object_size_1g || 0,
    "recv_sub_time":                   aggregate.recv_sub_time || 0,
    "recv_sub_count":                  aggregate.recv_sub_count || 0,
    "hash_sub_time":                   aggregate.hash_sub_time || 0,
    "hash_sub_count":                  aggregate.hash_sub_count || 0,
    "deliver_sub_time":                aggregate.deliver_sub_time || 0,
    "deliver_sub_count":               aggregate.deliver_sub_count || 0,
    "hit_sub_time":                    aggregate.hit_sub_time || 0,
    "hit_sub_count":                   aggregate.hit_sub_count || 0,
    "prehash_sub_time":                aggregate.prehash_sub_time || 0,
    "prehash_sub_count":               aggregate.prehash_sub_count || 0,
    "predeliver_sub_time":             aggregate.predeliver_sub_time || 0,
    "predeliver_sub_count":            aggregate.predeliver_sub_count || 0
  }
  sendToInsights(message)
}

sendToInsights = (logMessages) => {
  let insights_url = 'https://insights-collector.newrelic.com/v1/accounts/'+ ACCOUNT_ID +'/events'
  request({
    method: "POST",
    url: insights_url,
    headers: {
      'Content-Type': 'application/json',
      "X-Insert-Key": INSERT_KEY
    }, 
    body: JSON.stringify(logMessages)
  }, (err, response, body) => {
    console.log(body)
    console.log(err)
  })
}