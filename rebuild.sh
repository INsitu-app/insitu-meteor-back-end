#!/bin/sh

cd output
tar -zxf insitu-back.tar.gz
cd bundle/programs/server
npm install
cd ../../../../
pm2 restart insitu-back
