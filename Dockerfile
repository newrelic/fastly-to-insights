# Copyright 2018 New Relic, Inc.  Licensed under the Apache License, version 2.0 (the "License"); you may not use this file except in compliance with the License.  You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, either express or implied. 

FROM alpine:3.21.1

RUN apk add --update nodejs npm

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY index.js .

CMD ["node", "index.js"]
