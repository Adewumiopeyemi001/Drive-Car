# Drive-Car
------------
## Description
This project is an API service built with Node.js and Express.js for managing a car rental service. It includes endpoints for user management, car management, booking management, and payment processing. The project also integrates Google OAuth for authentication.

### Features
1. **User Management**: Register, login, update user details, and manage forgotten and reset passwords.
2. **Car Management**: Create, update, delete, retrieve, filter, and search cars.
3. **Booking Management**: Create, update, approve, cancel, retrieve, and delete bookings.
4. **Payment Processing**: Initialize and verify payments.
5. **Authentication**: Secure endpoints with user authentication and integrate Facebook OAuth for login.

### Project Structure
* **controllers**: Contains controller files for user, car, booking, and payment
* **middleware**: Contains middleware files for authentication and authorization
* **models**: Contains model files for user, car, and booking
* **routes**: Contains route files for user, car, booking, and payment
* **lib**: Contains utility files for response messages and error handling
* **public**: Contains public files for images and other assets

## Dependencies

```
json
{
  "bcryptjs": "^2.4.3",
  "cloudinary": "^2.2.0",
  "dotenv": "^16.4.5",
  "ejs": "^3.1.10",
  "express": "^4.19.2",
  "express-session": "^1.18.0",
  "jsonwebtoken": "^9.0.2",
  "mongoose": "^8.5.0",
  "morgan": "^1.10.0",
  "multer": "^1.4.5-lts.1",
  "nodemailer": "^6.9.14",
  "passport": "^0.7.0",
  "passport-facebook": "^3.0.0",
  "passport-google-oauth20": "^2.0.0",
  "paystack-api": "^2.0.6",
  "pg": "^8.12.0",
  "uuid": "^10.0.0"
}
```
____
-------
### To Start Project 
npm i

npm start
____
#### Postman Documetation
[Postman link](https://documenter.getpostman.com/view/32389429/2sA3kSp45M)

- 📫 How to reach me **adewumiopeyemimathew@gmail.com**
