# Contact Identification API

Welcome to the Contact Identification API project! This project is designed to provide services that help identify and manage user contact information. Whether it's identifying unique contacts, linking related contacts, or managing data cleanup, this API is built to support these essential operations.

## Endpoints Overview

### 1. **Identify Contact Endpoint**
   - **Description**: This endpoint identifies whether the contact details provided are unique or associated with an existing contact in the database.
   - **Method**: `POST`
   - **Endpoint**: `/api/identify`
   - **Request Parameters**:
     - `email` (String) - The contact's email address.
     - `phoneNumber` (String) - The contact's phone number.
   - **Usage**: 
     Send a `POST` request with the contact's email and phone number in the request body to identify if the contact already exists in the system.
   - **Example**: 
     ```json
     {
       "email": "example@email.com",
       "phoneNumber": "1234567890"
     }
     ```

### 2. **Add Contact Endpoint**
   - **Description**: This endpoint allows you to add a new contact to the database with additional details, such as linking to an existing contact.
   - **Method**: `POST`
   - **Endpoint**: `/api/add-contact`
   - **Request Parameters**:
     - `email` (String) - The contact's email address.
     - `phoneNumber` (String) - The contact's phone number.
     - `linkedId` (Integer) - The ID of the contact this new record is linked to, if applicable.
     - `linkedPrecedence` (String) - Defines the precedence of the link, typically either `primary` or `secondary`.
   - **Usage**: 
     Send a `POST` request with the contact details and linking information in the request body to add a new record or link an existing one.
   - **Example**: 
     ```json
     {
       "email": "newuser@email.com",
       "phoneNumber": "0987654321",
       "linkedId": 1,
       "linkedPrecedence": "secondary"
     }
     ```

### 3. **Delete All Contacts Endpoint**
   - **Description**: This endpoint will remove all the records from the database, allowing for cleanup or resetting of the data.
   - **Method**: `DELETE`
   - **Endpoint**: `/api/delete`
   - **Usage**: 
     Send a `DELETE` request to remove all records in the contact database.

## Usage Instructions

To interact with this API, use tools like Postman or any HTTP client of your choice. Make sure to format your requests according to the given parameters for each endpoint.

### Example with `curl`:
#### Identify Contact:
```bash
curl -X POST https://bitespeed-ps19.onrender.com/api/identify \
-H "Content-Type: application/json" \
-d '{"email": "example@email.com", "phoneNumber": "1234567890"}'
