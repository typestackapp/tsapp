#!/bin/sh
cd /tsapp/;

# link cli tsa cli
npm link ./packages/cli;

# chmod, sometimes tsa command is not executable
command_path=$(command -v tsa) && chmod 777 "$command_path";

# start all package services
tsa service --up --env ${ENV};

pm2 logs;