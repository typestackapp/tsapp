#!/bin/sh

# install google chrome
echo 'install google chrome for puppeteer';
apt-get update && apt-get install gnupg wget -y;
wget --quiet --output-document=- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg;
sh -c 'echo ""deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main"" >> /etc/apt/sources.list.d/google.list';
apt-get update;
apt-get install google-chrome-stable -y --no-install-recommends;
rm -rf /var/lib/apt/lists/*;

# install git
echo 'install git';
apt-get update && apt-get install git -y;

# install pm2 and tsapp binaries
npm install pm2 nodemon -g;
cd /tsapp/;

# link cli comand tsapp
# chmod, sometimes the command is not executable
npm link ./packages/cli;
command_path=$(command -v tsapp) && chmod 777 "$command_path";

# start servers
tsapp server --server express --env ${ENV} --name EXPRESS --log;
tsapp server --server jobs --env ${ENV} --name JOBS --log;
tsapp server --server graphql --env ${ENV} --name GRAPHQL --log;
tsapp server --server next --env ${ENV} --name NEXT --log;
tsapp server --server consumers --env ${ENV} --name CONSUMER-TSAPP --log --e RCS=tsapp;

pm2 logs;

sleep infinity;