<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
# Secure User Management With JWT Implementation
# Presentation Attached
# Overview
Introduction  01
JWT Token, Scrypt  02
APIs Overview  03
Architecture Diagram  04
SignUp, Login  05
UpdateUser, DeleteUser  06
GetDetails, GenerateAccessToken  07
ChangePassword, Revoke, Revoke All  08
Indexing with Unique and TTL, Rate Limiter  09

# Introduction
The Secure User Management System project is designed to handle user
authentication, authorization, and profile management securely. The project
implements JSON Web Tokens (JWT) for authentication, role-based access
control (RBAC) with admin and user roles, and scopes for fine-grained
permissions such as UPDATE, DELETE, GET, and POST operations. Security
measures include rate limiting to prevent Dos attack or traffic, custom
validation for data integrity, and password hashing using scrypt for secure
storage. The project also includes functionalities for generating, validating,
refreshing, and revoking JWT tokens, ensuring robust security throughout the
user management process.

# Hashing Method -Scrypt
Scrypt is a method used for password hashing, similar to bcrypt. However, Scrypt incorporates a key advantage by including a "salt" parameter directly within the hashing
process. This salt, which is a random data input, helps prevent rainbow table attacks by ensuring that each password hash is unique, even if the passwords are identical.
This internal handling of salts in Scrypt enhances security and adds an extra layer of protection against password cracking attempts.

# JWT- TOKEN

JSON Web Tokens (JWT) are a compact and secure way of transmitting information between parties as a JSON object. They are primarily used for authorization in web applications.

JWTs consist of three parts: header, payload, and signature, which are base64-encoded and concatenated with periods. The header contains
the token type and hashing algorithm, the payload contains the actual data (claims), and the signature is used to verify the token's authenticity.

JWTs are stateless tokens, meaning the server does not need to maintain session data for each user. This reduces the server's workload and
makes it easier to scale the application. Unlike traditional session-based authentication methods, which require the server to store session data (like session IDs) for each user.

# API
![image](https://github.com/Rohityadav0412/User-Management/assets/77201112/83e94ee2-fe52-49e9-bdd1-883732684729)

# Architecture
![image](https://github.com/Rohityadav0412/User-Management/assets/77201112/9c071e4b-6c79-4e98-b996-fb4af815a91a)

# SignUp
In this we are providing all the users details like name, mobile number, email, password, age, country and scope as an optional.
We are providing X-Secret Key. If it is provided correct then it is treated as Admin.
If the X-Secret Key is wrong/empty then it is treated as User.
Admin has all the scopes if the scope is not provided in the request body and user has GET, UPDATE, POST. If the scopes are given then the particular scopes are treated.
Password is hashed using scrypt and then stored in the collection.
All the details are stored in the User Collection with UUID.

# Login
User is asked to provide Email and password in the request Body.
Only the required request body key value pairs are allowed. No extra or empty body is allowed.
After Checking credentials Access and Refresh Tokens are generated and stored in different Collections based on the roles in UserToken and AdminToken collection.
Tokens are generated using sign function with private key, payload and SignInOptions. RSA algorithm is used with roles, scope, UUID in payload.

# Update User
In this we are updating the individual details based on checking the role and scope.
We are providing header as Access Token and password needed for updating email, mobile Number of self.
Admin can update other admin or user by giving mobile number in the query params.
Admin cannot update email, mobile number of other admin/user. User can update only his details.
If User updates his email or phone number he has to provide password.
NOTE- Scope is checked for every individual before updating details.

# Delete User
In this we are deleting the user from the User collection.
User is asked to provide access token in the header.
Admin can delete the particular user if he provides the mobile number of the user. If the admin do not provide any params then he can delete himself.
User can only delete himself if he has a scope of deleting himself.

# Get Details
In this we are getting the individual details based on checking the role and scope.

We are providing header as Access Token and users=”all”, mobile number as params.
Admin can get details of other admin or user by giving mobile number in the query params.
Admin can get all the users and other admins details if he provides users = “all” in the params.
User can only get his details.
NOTE- Scope is checked for every individual before getting details.

# Generate Access Token
In this we are generating access token from the refresh token.
User is asked to provide refresh token in the header.
Both admin and user can generate their access token when it expires.
After generating the access token it is replaced by the expired access token in the collection.

# Change Password
In this we are changing the individual password.
We are providing header as Access Token and old password which is first checked if it matches.
New Password is passed in the request body and it is hashed using scrypt.
Old password is replaced by the new password in the User collection.
Both user and admin are allowed to change password and have rate limiter which allows to change password once in a month.

# Revoke and Revoke All
In this we are revoking access token and the refresh token in revoke API.
User is asked to provide refresh token in the header.
In revokeAll API all the access token and refresh token associated with the user/admin are revoked.
It is always checked in every API after the login that the tokens are revoked or not. If the tokens are revoked then the boolean value is true in the collection.

# Indexing With
Unique and TTL
Indexing in MongoDB refers to creating data structures that enhance the speed of data retrieval operations, such as queries and sorting, by allowing MongoDB to quickly locate and access relevant documents.
Indexes are created on specific fields or combinations of fields within a collection. MongoDB uses B-tree data structures for indexing, which provide efficient search and retrieval capabilities
Index Types: Single Field, Compound,
Multi-key, geospatial, text index.
Properties : A unique index ensures that indexed fields have unique values across documents in a collection.
A TTL index allows MongoDB to automatically remove documents from a collection after a specified period (time- to-live) has elapsed.

# Rate Limiter
A rate limiter is a mechanism to control the rate of incoming requests or actions from a client or user.
It sets limits on how many requests or actions a client can make within a specified timeframe. 
Helping to prevent abuse, maintain system stability, and ensure fair usage of resources.
Helps to prevent denial-of-service (DoS) attacks or excessive usage that could degrade system performance. It helps maintain system stability and prevents overload / traffic.
