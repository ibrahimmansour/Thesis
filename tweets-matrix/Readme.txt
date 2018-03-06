This is a nodejs project that utilizes MongoDB. A pre-requisite to run this project is to have nodejs and mongodb installed. 
Also the following nodejs modules need to be first installed with npm:

1-express
2-wordnet
3-mongodb
4-async
5-body-parser
6-fs

After installing those requirements, the project can be run as follows:

mongod --dbpath "Path to the database which is our data folder in the root project (IbrahimThesis/data)"
node webserver.js