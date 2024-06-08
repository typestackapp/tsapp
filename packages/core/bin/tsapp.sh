#!/bin/sh
cd /tsapp/;

# should install packages to create symlinks to node_modules
npm install;

# link cli tsa cli
npm link ./packages/cli;

# chmod, sometimes tsa command is not executable
command_path=$(command -v tsa) && chmod 777 "$command_path";

# create new config with symlinks
tsa config --link;

# start all package services
tsa service --up --env=${ENV};

pm2 logs;