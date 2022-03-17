# YelpCamp

## Overview

YelpCamp is a full-stack CRUD (Create, Read, Upate, Delete) web application that is similar to Yelp which publishes reviews about businesses but for campgrounds instead.

I created this web application as part of a code-along of Colt Steele's Udemy Course: The Web Development Course 2022. 

You can visit the live application here: [cynn000-yelpcamp.herokuapp.com](https://cynn000-yelpcamp.herokuapp.com/)

## Features

- Creating new campgrounds
- Viewing existing campgrounds
- Updating campgrounds
- Deleting campgrounds
- Register as a new user
- Login as an existing user
- Authentication and authorization of users
- Uploading images to a campground
- Writing reviews for a campground

## Built With

This application was built using **JavaScript** along with **Node.js** and **Express** for server-side scripting. **MongoDB** was used for the databases as well as 
**MongoDB Atlas** for cloud database services, to have our database accessible through a cloud platform as opposed to locally on our machine when in production. **Bootstrap** 
was utilized in creating responsive and visually appealing pages. To render interactive maps and a cluster map, **MapBox** was employed. **Passport** was used for the 
authentication of user requests. **Cloudinary**, was implemented to store the non-user images uploaded in the application, these non-user images were obtained from **Unsplash**.

For deployment, we used **Heroku** to store and host our web application.

## Dependencies

- Mapbox
- Mapbox-sdk
- Cloudinary
- Connect-Flash
- Connect-Mongo
- Dotenv
- EJS
- EJS-Mate
- Express
- Express-Mongo-Sanitize
- Express-Session
- Helmet
- Joi
- Method-Override
- Mongoose
- Multer
- Multer-Storage-Cloudinary
- Passport
- Passport-Local
- Passport-Local-Mongoose
- Sanitize-HTML
 
## Acknowledgements

[The Web Developer Bootcamp 2022 on Udemy](https://www.udemy.com/course/the-web-developer-bootcamp/) by Colt Steele

Images from [Unsplash](https://unsplash.com/)

Canadian Cites Data from [Simple Maps Canadian Cities](https://simplemaps.com/data/canada-cities)
