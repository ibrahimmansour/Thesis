This is a nodejs project that utilizes MongoDB. A pre-requisite to run this project is to have node,npm and mongodb installed. 

After installing those requirements, the project can be run as follows:

npm install //to install the modules
mongod --dbpath "Path to the database which is our data folder in the root project (tweets-matrix/data)" //to run the Mongodb server
node webserver.js //entry point

The project runs on the localhost, port 8080. So to start type localhost:8080 on a browser.