# Copyright 2018 New Relic, Inc.  Licensed under the Apache License, version 2.0 (the "License"); you may not use this file except in compliance with the License.  You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, either express or implied. 

FROM alpine:3.23.4

# Force-upgrade OS packages carried over from the base layer (libssl3,
# libcrypto3, c-ares, etc.), not just the ones added below -- `apk add`
# alone won't upgrade an already-installed package if its current version
# still satisfies nodejs/npm's dependency constraints.
RUN apk update && \
    apk upgrade --no-cache && \
    apk add --no-cache nodejs npm && \
    rm -rf /var/cache/apk/*

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY index.js .

CMD ["node", "index.js"]
