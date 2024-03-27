#!/bin/sh
cd /tsapp/;

# link cli tsa cli
# chmod, sometimes the command is not executable
npm link ./packages/cli;
command_path=$(command -v tsa) && chmod 777 "$command_path";

# start servers
tsa service up --env ${ENV};

pm2 logs;

sleep infinity;