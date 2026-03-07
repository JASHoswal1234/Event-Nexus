/**
 * Unit tests for validation middleware
 * Tests Requirements 11.1, 11.2, 11.3, 11.4, 11.5, 11.6
 */

const {
  validate,
  registerSchema,
  loginSchema,
  eventSchema,
  teamSchema,
  announcementSchema
} = require('../../../middlewares/validate');

describe('Validation Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  describe('registerSchema validation', () => {
    it('should pass validation with valid email and password', () => {
      req.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      const middleware = validate(registerSchema);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should fail when email is missing', () => {
      req.body = {
        password: 'password123'
      };

      const middleware = validate(registerSchema);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Validation Error',
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'email',
              message: expect.stringContaining('required')
            })
          ])
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should fail when email format is invalid', () => {
      req.body = {
        email: 'invalid-email',
        password: 'password123'
      };

      const middleware = validate(registerSchema);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Validation Error',
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'email',
              message: expect.stringContaining('valid email')
            })
          ])
        })
      );
    });

    it('should fail when password is too short', () => {
      req.body = {
        email: 'test@example.com',
        password: '12345'
      };

      const middleware = validate(registerSchema);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Validation Error',
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'password',
              message: expect.stringContaining('6 characters')
            })
          ])
        })
      );
    });

    it('should return multiple errors for multiple invalid fields', () => {
      req.body = {};

      const middleware = validate(registerSchema);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Validation Error',
          details: expect.arrayContaining([
            expect.objectContaining({ field: 'email' }),
            expect.objectContaining({ field: 'password' })
          ])
        })
      );
    });
  });

  describe('loginSchema validation', () => {
    it('should pass validation with valid credentials', () => {
      req.body = {
        email: 'test@example.com',
        password: 'anypassword'
      };

      const middleware = validate(loginSchema);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should fail when email is missing', () => {
      req.body = {
        password: 'password123'
      };

      const middleware = validate(loginSchema);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('eventSchema validation', () => {
    it('should pass validation with valid event data', () => {
      req.body = {
        title: 'Test Event',
        description: 'Test Description',
        date: '2024-12-31',
        location: 'Test Location',
        capacity: 100,
        registrationDeadline: '2024-12-20',
        mode: 'online'
      };

      const middleware = validate(eventSchema);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should fail when capacity is not a positive integer', () => {
      req.body = {
        title: 'Test Event',
        description: 'Test Description',
        date: '2024-12-31',
        location: 'Test Location',
        capacity: 0,
        registrationDeadline: '2024-12-20',
        mode: 'online'
      };

      const middleware = validate(eventSchema);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'capacity',
              message: expect.stringContaining('at least 1')
            })
          ])
        })
      );
    });

    it('should fail when mode is invalid', () => {
      req.body = {
        title: 'Test Event',
        description: 'Test Description',
        date: '2024-12-31',
        location: 'Test Location',
        capacity: 100,
        registrationDeadline: '2024-12-20',
        mode: 'invalid-mode'
      };

      const middleware = validate(eventSchema);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'mode',
              message: expect.stringContaining('online')
            })
          ])
        })
      );
    });

    it('should fail when date format is invalid', () => {
      req.body = {
        title: 'Test Event',
        description: 'Test Description',
        date: 'invalid-date',
        location: 'Test Location',
        capacity: 100,
        registrationDeadline: '2024-12-20',
        mode: 'online'
      };

      const middleware = validate(eventSchema);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'date',
              message: expect.stringContaining('valid date')
            })
          ])
        })
      );
    });
  });

  describe('teamSchema validation', () => {
    it('should pass validation with valid team data', () => {
      req.body = {
        name: 'Test Team',
        eventId: '507f1f77bcf86cd799439011',
        capacity: 5
      };

      const middleware = validate(teamSchema);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should fail when capacity is less than 1', () => {
      req.body = {
        name: 'Test Team',
        eventId: '507f1f77bcf86cd799439011',
        capacity: 0
      };

      const middleware = validate(teamSchema);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail when required fields are missing', () => {
      req.body = {
        name: 'Test Team'
      };

      const middleware = validate(teamSchema);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          details: expect.arrayContaining([
            expect.objectContaining({ field: 'eventId' }),
            expect.objectContaining({ field: 'capacity' })
          ])
        })
      );
    });
  });

  describe('announcementSchema validation', () => {
    it('should pass validation with valid announcement data', () => {
      req.body = {
        title: 'Test Announcement',
        content: 'Test Content',
        eventId: '507f1f77bcf86cd799439011'
      };

      const middleware = validate(announcementSchema);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should fail when required fields are missing', () => {
      req.body = {
        title: 'Test Announcement'
      };

      const middleware = validate(announcementSchema);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          details: expect.arrayContaining([
            expect.objectContaining({ field: 'content' }),
            expect.objectContaining({ field: 'eventId' })
          ])
        })
      );
    });
  });

  describe('Type validation', () => {
    it('should fail when string field receives non-string value', () => {
      req.body = {
        email: 12345,
        password: 'password123'
      };

      const middleware = validate(registerSchema);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'email',
              message: expect.stringContaining('string')
            })
          ])
        })
      );
    });

    it('should fail when number field receives non-number value', () => {
      req.body = {
        title: 'Test Event',
        description: 'Test Description',
        date: '2024-12-31',
        location: 'Test Location',
        capacity: 'not-a-number',
        registrationDeadline: '2024-12-20',
        mode: 'online'
      };

      const middleware = validate(eventSchema);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'capacity',
              message: expect.stringContaining('number')
            })
          ])
        })
      );
    });
  });
});
