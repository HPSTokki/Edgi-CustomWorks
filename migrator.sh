#!/bin/bash

cd "./BACKEND"

npm install

npm run db:generate
npm run db:migrate
