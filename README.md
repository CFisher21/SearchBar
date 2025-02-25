# Search Bar Web Application

## Important Notice
This website is hosted on Render. It is using a free tier service. When you access the website please allow up to 60 seconds for the service to become available



**Notes about live webpage**
- Use **email:** *a@a* **Password:** *1* to log into the service

## Contact Information
- Email: fishercody23@gmail.com
- LinkedIn: https://www.linkedin.com/in/fishercody21/

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
### Register Desktop
![Imgur](https://i.imgur.com/cvzo4nr.png)
### Login Desktop
![Imgur](https://i.imgur.com/D8EZzdk.png)
### Search Desktop 
![Imgur](https://i.imgur.com/wboboNC.png)
### Register Mobile
![Imgur](https://i.imgur.com/I40xDNP.png)
### Login Mobile
![Imgur](https://i.imgur.com/UvmIz9C.png)
### Search Mobile
![Imgur](https://i.imgur.com/iOUZmUj.png)
### Mobile Navigation
![Imgur](https://i.imgur.com/cpAWTa5.png)
