#!/bin/sh

cd output
tar -zxf insitu-meteor-back-end.tar.gz
cd bundle/programs/server
npm run install
cd ../../../../
pm2 start process.json
