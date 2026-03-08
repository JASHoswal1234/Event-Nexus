# Implementation Plan: EventNexus Backend

## Overview

This implementation plan breaks down the EventNexus backend into discrete coding tasks following a layered architecture approach. The implementation progresses from foundational infrastructure (database, models) through business logic (controllers) to API endpoints (routes), with property-based testing integrated throughout to validate correctness properties early.

## Tasks

- [x] 1. Project setup and configuration
  - Initialize Node.js project with package.json
  - Install dependencies: express, mongoose, bcryptjs, jsonwebtoken, cors, dotenv
  - Install dev dependencies: jest, supertest, fast-check, mongodb-memory-server, nodemon
  - Create folder structure: config/, models/, controllers/, middlewares/, routes/, utils/, tests/
  - Create .env.example with required environment variables (MONGO_URI, JWT_SECRET, JWT_EXPIRE, PORT, NODE_ENV, CORS_ORIGIN)
  - Create .gitignore for node_modules, .env, coverage
  - _Requirements: 13.1, 14.1_

- [x] 2. Database configuration and connection
  - [x] 2.1 Implement MongoDB connection with retry logic
    - Create config/db.js with connectDB function
    - Implement exponential backoff retry mechanism (max 5 retries)
    - Add connection event handlers (connected, disconnected, error)
    - Add graceful shutdown handler
    - _Requirements: 13.1, 13.2, 13.3, 13.5_
  
  - [ ]* 2.2 Write property test for database connection resilience
    - **Property: Database connection retry mechanism**
    - **Validates: Requirements 13.2, 13.3**

- [x] 3. Utility functions and error classes
  - [x] 3.1 Create custom error classes
    - Create utils/errors.js with AppError base class
    - Implement ValidationError, AuthenticationError, AuthorizationError, NotFoundError, ConflictError
    - Each error class should set appropriate statusCode
    - _Requirements: 12.4_
  
  - [x] 3.2 Create async handler wrapper
    - Create utils/asyncHandler.js to wrap async route handlers
    - Automatically catch and forward errors to error middleware
    - _Requirements: 12.1_
  
  - [x] 3.3 Create join code generator
    - Create utils/generateCode.js for unique alphanumeric code generation
    - Generate 6-8 character uppercase codes
    - _Requirements: 7.1, 7.5_
  
  - [x] 3.4 Create logger utility
    - Create utils/logger.js with structured logging
    - Support different log levels (info, warn, error)
    - _Requirements: 12.2_

- [x] 4. Implement data models
  - [x] 4.1 Create User model
    - Define User schema with email (unique, required), password (required, min 6), role (enum: admin/participant, default: participant), createdAt
    - Add email index
    - Add pre-save hook to hash password with bcrypt if modified
    - _Requirements: 1.1, 1.3, 2.1, 15.5, 15.6_
  
  - [ ]* 4.2 Write property tests for User model
    - **Property 1: User Registration Creates Participant Account**
    - **Validates: Requirements 1.1, 2.1**
    - **Property 3: Password Hashing**
    - **Validates: Requirements 1.3**
  
  - [x] 4.3 Create Event model
    - Define Event schema with title, description, date, location, capacity (min: 1), registrationDeadline, mode (enum: online/offline), registrationCount (default: 0), createdBy (ref: User), timestamps
    - Add indexes on date, mode, createdBy
    - Add custom validation: registrationDeadline < date
    - Add virtual fields: availableSlots, isFull, isRegistrationOpen
    - _Requirements: 3.1, 3.2, 3.6, 3.7, 15.1_
  
  - [ ]* 4.4 Write property tests for Event model
    - **Property 9: Event Creation Round-Trip**
    - **Validates: Requirements 3.1, 4.2**
    - **Property 14: Positive Capacity Enforcement**
    - **Validates: Requirements 3.6, 7.6**
    - **Property 15: Deadline Before Event Date**
    - **Validates: Requirements 3.7**
  
  - [x] 4.5 Create Registration model
    - Define Registration schema with user (ref: User, required), event (ref: Event, required), registrationDate (default: now), checkedIn (default: false), checkInTime
    - Add compound unique index on user + event
    - Add indexes on event and user
    - Add post-save hook to increment event.registrationCount
    - Add post-remove hook to decrement event.registrationCount
    - _Requirements: 5.1, 5.5, 6.1, 15.2_
  
  - [ ]* 4.6 Write property tests for Registration model
    - **Property 13: Event Registration Count Accuracy**
    - **Validates: Requirements 3.5, 4.5**
    - **Property 19: Registration Creation**
    - **Validates: Requirements 5.1, 5.5**
  
  - [x] 4.7 Create Team model
    - Define Team schema with name, event (ref: Event, required), joinCode (unique, uppercase), capacity (min: 1), members (array of ObjectId ref: User), createdBy (ref: User), createdAt
    - Add indexes on joinCode (unique), event, members
    - Add custom validation: members.length <= capacity
    - Add virtual fields: memberCount, isFull, availableSlots
    - Add pre-save hook to generate unique joinCode if not present
    - _Requirements: 7.1, 7.2, 7.5, 7.6, 15.3, 15.6_
  
  - [ ]* 4.8 Write property tests for Team model
    - **Property 27: Unique Join Code Generation**
    - **Validates: Requirements 7.1, 7.5, 15.6**
    - **Property 28: Team Creation Round-Trip**
    - **Validates: Requirements 7.2**
  
  - [x] 4.9 Create Announcement model
    - Define Announcement schema with title, content, event (ref: Event, required), author (ref: User, required), createdAt (default: now)
    - Add compound index on event + createdAt (descending)
    - Add index on author
    - _Requirements: 9.1, 15.4_
  
  - [ ]* 4.10 Write property tests for Announcement model
    - **Property 37: Announcement Creation Round-Trip**
    - **Validates: Requirements 9.1**
    - **Property 51: Required Fields Enforcement**
    - **Validates: Requirements 15.1, 15.2, 15.3, 15.4, 15.5**

- [ ] 5. Checkpoint - Ensure model tests pass
  - Run all model tests and verify schemas are correctly defined
  - Ensure all tests pass, ask the user if questions arise

- [x] 6. Implement authentication middleware
  - [x] 6.1 Create JWT configuration
    - Create config/jwt.js with JWT_SECRET and JWT_EXPIRE from environment
    - Export configuration object
    - _Requirements: 1.6_
  
  - [x] 6.2 Implement protect middleware
    - Create middlewares/auth.js with protect function
    - Extract token from Authorization header (Bearer token)
    - Verify token with jwt.verify
    - Load user from database by decoded ID
    - Attach user to req.user
    - Throw AuthenticationError if token invalid/expired or user not found
    - _Requirements: 1.7, 2.2_
  
  - [ ]* 6.3 Write property tests for protect middleware
    - **Property 7: JWT Validation**
    - **Validates: Requirements 1.7**
  
  - [x] 6.4 Implement adminOnly middleware
    - Create adminOnly function in middlewares/auth.js
    - Check req.user.role === 'admin'
    - Throw AuthorizationError if not admin
    - _Requirements: 2.2, 2.3_
  
  - [ ]* 6.5 Write property tests for adminOnly middleware
    - **Property 8: Role-Based Access Control**
    - **Validates: Requirements 2.2, 2.3**

- [x] 7. Implement validation middleware
  - [x] 7.1 Create validation schemas and middleware
    - Create middlewares/validate.js with validate function
    - Define validation schemas for: registerSchema, loginSchema, eventSchema, teamSchema, announcementSchema
    - Validate req.body against schema
    - Return 400 with field-specific errors if validation fails
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_
  
  - [ ]* 7.2 Write property tests for validation middleware
    - **Property 43: Input Validation Error Responses**
    - **Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5**

- [x] 8. Implement error handling middleware
  - [x] 8.1 Create centralized error handler
    - Create middlewares/errorHandler.js with errorHandler function
    - Log error with stack trace, method, path, user, timestamp
    - Handle Mongoose ValidationError (400)
    - Handle Mongoose duplicate key error (409)
    - Handle JWT errors (401)
    - Return sanitized error responses (hide internal details in production)
    - Use appropriate status codes (4xx for client errors, 5xx for server errors)
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_
  
  - [ ]* 8.2 Write property tests for error handler
    - **Property 44: Error Message Sanitization**
    - **Validates: Requirements 12.1**
    - **Property 45: Error Logging Completeness**
    - **Validates: Requirements 12.2**
    - **Property 46: Error Status Code Correctness**
    - **Validates: Requirements 12.3, 12.4**
    - **Property 47: Not Found Responses**
    - **Validates: Requirements 12.5**

- [x] 9. Implement authentication controller
  - [x] 9.1 Create auth controller with register and login
    - Create controllers/authController.js
    - Implement register: create user with email/password, return success message
    - Implement login: validate credentials with bcrypt.compare, generate JWT with user ID and role, return token and user info
    - Handle duplicate email error (409)
    - Handle invalid credentials error (401)
    - _Requirements: 1.1, 1.2, 1.4, 1.5, 2.4_
  
  - [ ]* 9.2 Write property tests for auth controller
    - **Property 2: Duplicate Email Rejection**
    - **Validates: Requirements 1.2, 15.6**
    - **Property 4: Login Returns Valid JWT**
    - **Validates: Requirements 1.4, 2.4**
    - **Property 5: Invalid Credentials Rejection**
    - **Validates: Requirements 1.5**
    - **Property 6: JWT Expiration Configuration**
    - **Validates: Requirements 1.6**

- [x] 10. Implement event controller
  - [x] 10.1 Create event controller with CRUD operations
    - Create controllers/eventController.js
    - Implement createEvent: validate admin, create event with createdBy, return event
    - Implement getEvents: support query filters (mode, startDate, endDate), return events with registration info
    - Implement getEventById: find by ID, populate registration count, return event or 404
    - Implement updateEvent: validate admin, partial update, return updated event
    - Implement deleteEvent: validate admin, cascade delete registrations/teams/announcements, return success
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [ ]* 10.2 Write property tests for event controller
    - **Property 10: Event Mode Support**
    - **Validates: Requirements 3.2**
    - **Property 11: Partial Event Updates**
    - **Validates: Requirements 3.3**
    - **Property 12: Cascading Event Deletion**
    - **Validates: Requirements 3.4**
    - **Property 16: Event List Completeness**
    - **Validates: Requirements 4.1**
    - **Property 17: Mode Filtering Accuracy**
    - **Validates: Requirements 4.3**
    - **Property 18: Date Range Filtering Accuracy**
    - **Validates: Requirements 4.4**

- [x] 11. Implement registration controller
  - [x] 11.1 Create registration controller
    - Create controllers/regController.js
    - Implement registerForEvent: check duplicate, check capacity, check deadline, create registration, return registration
    - Implement cancelRegistration: find and delete registration, return success
    - Implement checkInParticipant: validate admin, find registration, update checkedIn and checkInTime, return registration
    - Implement getEventRegistrations: validate admin, find all registrations for event, populate user info, return list
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 6.1, 6.2, 6.3, 6.4_
  
  - [ ]* 11.2 Write property tests for registration controller
    - **Property 20: Duplicate Registration Prevention**
    - **Validates: Requirements 5.2**
    - **Property 21: Capacity Enforcement**
    - **Validates: Requirements 5.3**
    - **Property 22: Deadline Enforcement**
    - **Validates: Requirements 5.4**
    - **Property 23: Registration Cancellation**
    - **Validates: Requirements 5.6**
    - **Property 24: Check-In Status Update**
    - **Validates: Requirements 6.1, 6.2**
    - **Property 25: Check-In Validation**
    - **Validates: Requirements 6.3**
    - **Property 26: Registration Response Completeness**
    - **Validates: Requirements 6.4**

- [x] 12. Implement team controller
  - [x] 12.1 Create team controller
    - Create controllers/teamController.js
    - Implement createTeam: validate admin, validate event exists, create team with generated joinCode, return team
    - Implement joinTeam: find team by joinCode, validate registration exists, check capacity, check not already in team for event, add user to members, return team
    - Implement getEventTeams: find all teams for event, populate member info, return list with memberCount
    - Implement deleteTeam: validate admin, delete team, return success
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 9.2_
  
  - [ ]* 12.2 Write property tests for team controller
    - **Property 29: Team Event Validation**
    - **Validates: Requirements 7.3, 9.2**
    - **Property 30: Team Deletion**
    - **Validates: Requirements 7.4**
    - **Property 31: Team Joining**
    - **Validates: Requirements 8.1**
    - **Property 32: Team Capacity Enforcement**
    - **Validates: Requirements 8.2**
    - **Property 33: Invalid Join Code Rejection**
    - **Validates: Requirements 8.3**
    - **Property 34: Team Join Registration Prerequisite**
    - **Validates: Requirements 8.4**
    - **Property 35: Single Team Per Event Constraint**
    - **Validates: Requirements 8.5**
    - **Property 36: Team Response Completeness**
    - **Validates: Requirements 8.6**

- [x] 13. Implement announcement controller
  - [x] 13.1 Create announcement controller
    - Create controllers/annController.js
    - Implement createAnnouncement: validate admin, validate event exists, create announcement with author, return announcement
    - Implement getEventAnnouncements: find all announcements for event, sort by createdAt descending, populate author, return list
    - Implement deleteAnnouncement: validate admin, delete announcement, return success
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  
  - [ ]* 13.2 Write property tests for announcement controller
    - **Property 38: Announcement Timestamp Ordering**
    - **Validates: Requirements 9.3**
    - **Property 39: Announcement Deletion**
    - **Validates: Requirements 9.4**
    - **Property 40: Announcement Author Inclusion**
    - **Validates: Requirements 9.5**

- [x] 14. Implement statistics controller
  - [x] 14.1 Create statistics controller
    - Create controllers/statsController.js
    - Implement getSystemStats: count documents in User, Event, Registration, Team collections, return totals
    - Implement getEventStats: count registrations, teams, and checked-in registrations for specific event, return counts
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_
  
  - [ ]* 14.2 Write property tests for statistics controller
    - **Property 41: System Statistics Accuracy**
    - **Validates: Requirements 10.1, 10.2, 10.3, 10.4**
    - **Property 42: Event Statistics Accuracy**
    - **Validates: Requirements 10.5, 10.6, 10.7**

- [ ] 15. Checkpoint - Ensure controller tests pass
  - Run all controller tests and verify business logic is correct
  - Ensure all tests pass, ask the user if questions arise

- [x] 16. Create API routes
  - [x] 16.1 Create authentication routes
    - Create routes/authRoutes.js
    - POST /api/auth/register with validation
    - POST /api/auth/login with validation
    - _Requirements: 1.1, 1.4_
  
  - [x] 16.2 Create event routes
    - Create routes/eventRoutes.js
    - POST /api/events (protect, adminOnly, validation)
    - GET /api/events (protect)
    - GET /api/events/:id (protect)
    - PUT /api/events/:id (protect, adminOnly, validation)
    - DELETE /api/events/:id (protect, adminOnly)
    - _Requirements: 3.1, 3.3, 3.4, 4.1, 4.2_
  
  - [x] 16.3 Create registration routes
    - Create routes/regRoutes.js
    - POST /api/registrations/:eventId (protect)
    - DELETE /api/registrations/:eventId (protect)
    - POST /api/registrations/:eventId/checkin (protect, adminOnly)
    - GET /api/registrations/event/:eventId (protect, adminOnly)
    - _Requirements: 5.1, 5.6, 6.1, 6.4_
  
  - [x] 16.4 Create team routes
    - Create routes/teamRoutes.js
    - POST /api/teams (protect, adminOnly, validation)
    - POST /api/teams/join (protect, validation)
    - GET /api/teams/event/:eventId (protect)
    - DELETE /api/teams/:id (protect, adminOnly)
    - _Requirements: 7.2, 8.1, 8.6, 7.4_
  
  - [x] 16.5 Create announcement routes
    - Create routes/annRoutes.js
    - POST /api/announcements (protect, adminOnly, validation)
    - GET /api/announcements/event/:eventId (protect)
    - DELETE /api/announcements/:id (protect, adminOnly)
    - _Requirements: 9.1, 9.3, 9.4_
  
  - [x] 16.6 Create statistics routes
    - Create routes/statsRoutes.js
    - GET /api/stats (protect, adminOnly)
    - GET /api/stats/event/:eventId (protect, adminOnly)
    - _Requirements: 10.1, 10.5_

- [x] 17. Create Express application and server
  - [x] 17.1 Create Express app configuration
    - Create server.js with Express app setup
    - Configure CORS with allowed origins from environment
    - Add express.json() middleware
    - Mount all route modules
    - Add error handler middleware as last middleware
    - Export app for testing
    - _Requirements: 14.1, 14.2, 14.3, 14.4_
  
  - [ ]* 17.2 Write property tests for CORS configuration
    - **Property 48: Origin Validation**
    - **Validates: Requirements 14.1, 14.3**
    - **Property 49: CORS Headers Presence**
    - **Validates: Requirements 14.2**
    - **Property 50: Preflight Request Support**
    - **Validates: Requirements 14.4**
  
  - [x] 17.3 Create application entry point
    - Create index.js to start server
    - Call connectDB before starting server
    - Start Express server on configured PORT
    - Add graceful shutdown handlers (SIGTERM, SIGINT)
    - _Requirements: 13.1, 13.4, 13.5_

- [ ] 18. Create test infrastructure
  - [ ] 18.1 Set up test database helpers
    - Create tests/helpers/testDb.js with MongoDB Memory Server
    - Implement connectTestDB, closeTestDB, clearTestDB functions
    - _Requirements: Testing infrastructure_
  
  - [ ] 18.2 Create fast-check generators
    - Create tests/helpers/generators.js
    - Implement arbitraries: emailArbitrary, passwordArbitrary, eventArbitrary, teamArbitrary, announcementArbitrary
    - Ensure generated data meets validation constraints
    - _Requirements: Testing infrastructure_
  
  - [ ] 18.3 Configure Jest
    - Create jest.config.js with test environment and coverage settings
    - Add test scripts to package.json (test:unit, test:properties, test:integration, test:coverage)
    - Set up test setup/teardown files
    - _Requirements: Testing infrastructure_

- [ ] 19. Write integration tests
  - [ ]* 19.1 Write end-to-end API integration tests
    - Create tests/integration/api.integration.test.js
    - Test complete event lifecycle: create event → register participant → create team → join team → create announcement → check statistics
    - Test authentication flow: register → login → access protected endpoint
    - Test authorization: participant attempts admin operation
    - Use supertest for HTTP assertions
    - _Requirements: All requirements (integration validation)_

- [ ] 20. Final checkpoint and documentation
  - [x] 20.1 Run full test suite
    - Execute all unit tests, property tests, and integration tests
    - Verify test coverage meets 80%+ goal
    - Ensure all 51 correctness properties pass
    - _Requirements: All requirements_
  
  - [x] 20.2 Create README documentation
    - Document API endpoints with request/response examples
    - Document environment variables
    - Document setup and running instructions
    - Document testing commands
    - _Requirements: Documentation_
  
  - [x] 20.3 Final verification checkpoint
    - Ensure all tests pass, ask the user if questions arise
    - Verify all requirements are implemented
    - Verify all correctness properties are validated

## Notes

- Tasks marked with `*` are optional property-based tests that can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties with 100+ iterations each
- Unit tests validate specific examples and edge cases
- Checkpoints ensure incremental validation at key milestones
- All 51 correctness properties from the design document are covered in property test tasks
- The implementation follows a bottom-up approach: models → controllers → routes → integration
