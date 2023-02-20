# Search Bar Web Application

## Contact Information
- Email: fishercody23@gmail.com
- LinkedIn: https://www.linkedin.com/in/fishercody21/
- Twitter: https://twitter.com/codyfiisher

## Description

Search bar web application built for demo purposes.

This project is wrote in **JavaScript** using **Node.js**

The point of this project was to make a web application that someone could use to look up potiental employees. You can log into the webpage and from there you have the option to search three different databases for employees with the third being a combination of the first two, meaning you can search both databases at the same time. Fuzzy string matching has been incorparated as well so the search term does not have to be an exact match. There is a user log which records what the user has searched. This project is made with fully custom CSS and it is dynamic so ***it will work on both computer and mobile.*** It's worth to note that this is one of the first projects made by this developer.

The Node.js modules used for this project include:
- Express.js
- Passport.js
- Bcrypt
- Ejs (Embedded JavaScript templates)
- File System
- Fuse.js 

This project also incorpirates the use of two different databases:
- MongoDB (non-relational)
- PostgreSQL (relational)

## How to use
To use this application we recommend using **Visual Studio Code** by microsoft. Link - https://visualstudio.microsoft.com/

#### Setting up PostgresSQL server
We Recommend using pgAdmin4 for the local database Link - https://www.pgadmin.org/download/
1. Download pgAdmin4 from the link above and install it.
2. Once install set up the admin user and password.
3. Right click on PostgreSQL 14 and hit create Login/Group role.
4. Create a user with the name "qap3" and set the password to "1234".
5. Click the query tool at the top and run the following SQL statement:

    CREATE DATABASE sprint02</br>
    WITH</br>
    OWNER = postgres</br>
    ENCODING = 'UTF8'</br>
    LC_COLLATE = 'English_Canada.1252'</br>
    LC_CTYPE = 'English_Canada.1252'</br>
    TABLESPACE = pg_default</br>
    CONNECTION LIMIT = -1;
    
6. Then run this statement:

   CREATE TABLE IF NOT EXISTS public.mock_data</br>
(</br>
    employee_id integer,</br>
    first_name character varying(50) COLLATE pg_catalog."default",</br>
    last_name character varying(50) COLLATE pg_catalog."default",</br>
    email character varying(50) COLLATE pg_catalog."default",</br>
    occupation character varying(50) COLLATE pg_catalog."default",</br>
    currently_working character varying(50) COLLATE pg_catalog."default"</br>
)</br>

    TABLESPACE pg_default;</br>

    ALTER TABLE IF EXISTS public.mock_data</br>
    OWNER to postgres;</br>
    
7. Then run this statement: 

  	INSERT INTO public.mock_data(</br>
	employee_id, first_name, last_name, email, occupation, currently_working)</br>
	VALUES (?, ?, ?, ?, ?, ?);</br>
  
  **Replace the ?,'s inside the value brackets with all the data that is inside the SearchBarDatabase.csv** **Do not remove the brackets or ;**
  
#### Running the application
1. Install Node.js. Go to this link https://nodejs.org/en/ and install the latest version of Node.js.
2. Clone this repository and open it inside of Visal Stuido Code.
3. In the terminal run the command **cd SearchBar** to ensure you're in the proper folder.
4. Create a file called **.env** in the main folder structure and inside it write **SESSION_SECRET=secret** on line one, save the file.
5. In the terminal run the command **npm install** to installed needed node modules.
6. In the terminal run the command **npm start** to start the application.
7. In a web broswers go to the url http://localhost:3000/
8. Register an account, log in and then you're free to search whatever you like

## Screenshots
### Register Page Desktop
![Imgur](https://i.imgur.com/cvzo4nr.png)
### Login Page Desktop
![Imgur](https://i.imgur.com/D8EZzdk.png)
### Search Page Desktop 
![Imgur](https://i.imgur.com/wboboNC.png)
### Register Page Mobile
![Imgur](https://i.imgur.com/I40xDNP.png)
### Login Page Mobile
![Imgur](https://i.imgur.com/UvmIz9C.png)
### Search Page Mobile
![Imgur](https://i.imgur.com/iOUZmUj.png)
### Search Page Showing Navigation
![Imgur](https://i.imgur.com/cpAWTa5.png)
