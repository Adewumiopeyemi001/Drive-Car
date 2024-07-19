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
**middleware**: Contains middleware files for authentication and authorization
**models**: Contains model files for user, car, and booking
**routes**: Contains route files for user, car, booking, and payment
**lib**: Contains utility files for response messages and error handling
**public**: Contains public files for images and other assets
