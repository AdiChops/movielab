COMP 2406 Final Project

Erica Li 101179636
Aaditya Chopra 101205807


How to install, initialize database, and run server
	Option 1: 
	1.	Make sure your mongo daemon is running and listening on port 27017.
	2.	To install the dependencies and start the server, simply enter the npm run clean-start command. This command will install the node modules, run the database initialization script, and then start the server. 
	3.	Once the ‘server is listening at http://localhost:3000’ message appears, then the login page can be found by entering http://localhost:3000 in the browser of choice.
	4.	To only run the server (once the dependencies are installed), simply enter the npm start command.
	5.	Use Ctrl-C to stop the server.
	Option 2: 
	1.	To install the dependencies, enter the npm install command. 
	2.	Make sure your mongo daemon is running and listening on port 27017. 
	3.	Enter ‘node database_initializer.js’ into your command line to initialize the mongoose database.  
	4.	Once the node modules are installed, enter the node app.js command to start the server. Once the ‘Server listening at http://localhost:3000’ message appears, then the login page can be found by entering http://localhost:3000 in the browser of choice.
	5.	Use Ctrl-C to stop the server.
	

How to access the homepage: 
	1.	To login as a non-contributing user, use the following credentials: 
		Username: userPogging1
		Password: password123
	2.	To login as a contributing user, use the following credentials:
		Username: poggerUser20
		Password: verysecure
	3.	Once you're logged in, you will be redirected to the home page. The sidebar allows you to navigate to the different pages on our website.

Project Report Document:
	Name: achopra_eli_2406ProjectReport.pdf
	Location: docs
