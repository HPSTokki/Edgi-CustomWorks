#!/bin/bash

echo "Please input the method number you want to execute: "
echo "1. Generate"
echo "2. Migrate"
echo "3. Drop Schema"

read number

case "$number" in
    "1")
        echo "You are executing Generate"
        cd "./BACKEND"
        npm run db:generate
        ;;
    "2")
        echo "You are executing Migrate"
        cd "./BACKEND"
        npm run db:migrate
        ;;
    "3")
        echo "You are executing Drop Schema"
        cd "./BACKEND"
        npm run db:drop
        ;;
    *)
        echo "Invalid method number"
        ;;
esac