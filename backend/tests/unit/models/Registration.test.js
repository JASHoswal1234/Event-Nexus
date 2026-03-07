const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Registration = require('../../../models/Registration');
const User = require('../../../models/User');
const Event = require('../../../models/Event');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

afterEach(async () => {
  await Registration.deleteMany({});
  await User.deleteMany({});
  await Event.deleteMany({});
});

describe('Registration Model', () => {
  let user;
  let event;

  beforeEach(async () => {
    // Create a test user
    user = await User.create({
      email: 'test@example.com',
      password: 'password123',
      role: 'participant'
    });

    // Create a test event
    event = await Event.create({
      title: 'Test Event',
      description: 'Test Description',
      date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      location: 'Test Location',
      capacity: 10,
      registrationDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      mode: 'online',
      createdBy: user._id
    });
  });

  describe('Schema Validation', () => {
    it('should create a registration with required fields', async () => {
      const registration = await Registration.create({
        user: user._id,
        event: event._id
      });

      expect(registration.user).toEqual(user._id);
      expect(registration.event).toEqual(event._id);
      expect(registration.registrationDate).toBeDefined();
      expect(registration.checkedIn).toBe(false);
      expect(registration.checkInTime).toBeUndefined();
    });

    it('should fail without user field', async () => {
      await expect(
        Registration.create({
          event: event._id
        })
      ).rejects.toThrow();
    });

    it('should fail without event field', async () => {
      await expect(
        Registration.create({
          user: user._id
        })
      ).rejects.toThrow();
    });

    it('should have default values', async () => {
      const registration = await Registration.create({
        user: user._id,
        event: event._id
      });

      expect(registration.checkedIn).toBe(false);
      expect(registration.registrationDate).toBeInstanceOf(Date);
    });
  });

  describe('Indexes', () => {
    it('should enforce unique compound index on user + event', async () => {
      await Registration.create({
        user: user._id,
        event: event._id
      });

      await expect(
        Registration.create({
          user: user._id,
          event: event._id
        })
      ).rejects.toThrow();
    });

    it('should allow same user to register for different events', async () => {
      const event2 = await Event.create({
        title: 'Test Event 2',
        description: 'Test Description 2',
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        location: 'Test Location 2',
        capacity: 10,
        registrationDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        mode: 'offline',
        createdBy: user._id
      });

      const reg1 = await Registration.create({
        user: user._id,
        event: event._id
      });

      const reg2 = await Registration.create({
        user: user._id,
        event: event2._id
      });

      expect(reg1._id).toBeDefined();
      expect(reg2._id).toBeDefined();
      expect(reg1._id).not.toEqual(reg2._id);
    });
  });

  describe('Post-save Hook', () => {
    it('should increment event.registrationCount on save', async () => {
      const initialCount = event.registrationCount;

      await Registration.create({
        user: user._id,
        event: event._id
      });

      const updatedEvent = await Event.findById(event._id);
      expect(updatedEvent.registrationCount).toBe(initialCount + 1);
    });

    it('should increment count for multiple registrations', async () => {
      const user2 = await User.create({
        email: 'test2@example.com',
        password: 'password123',
        role: 'participant'
      });

      await Registration.create({
        user: user._id,
        event: event._id
      });

      await Registration.create({
        user: user2._id,
        event: event._id
      });

      const updatedEvent = await Event.findById(event._id);
      expect(updatedEvent.registrationCount).toBe(2);
    });
  });

  describe('Post-remove Hook', () => {
    it('should decrement event.registrationCount on remove', async () => {
      const registration = await Registration.create({
        user: user._id,
        event: event._id
      });

      let updatedEvent = await Event.findById(event._id);
      const countAfterCreate = updatedEvent.registrationCount;

      await registration.deleteOne();

      updatedEvent = await Event.findById(event._id);
      expect(updatedEvent.registrationCount).toBe(countAfterCreate - 1);
    });

    it('should decrement count on findOneAndDelete', async () => {
      await Registration.create({
        user: user._id,
        event: event._id
      });

      let updatedEvent = await Event.findById(event._id);
      const countAfterCreate = updatedEvent.registrationCount;

      await Registration.findOneAndDelete({ user: user._id, event: event._id });

      updatedEvent = await Event.findById(event._id);
      expect(updatedEvent.registrationCount).toBe(countAfterCreate - 1);
    });
  });

  describe('Check-in Functionality', () => {
    it('should allow updating checkedIn status', async () => {
      const registration = await Registration.create({
        user: user._id,
        event: event._id
      });

      registration.checkedIn = true;
      registration.checkInTime = new Date();
      await registration.save();

      const updated = await Registration.findById(registration._id);
      expect(updated.checkedIn).toBe(true);
      expect(updated.checkInTime).toBeInstanceOf(Date);
    });
  });
});
