const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Event = require('../../models/Event');
const User = require('../../models/User');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Event.deleteMany({});
  await User.deleteMany({});
});

describe('Event Model', () => {
  let testUser;

  beforeEach(async () => {
    testUser = await User.create({
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin'
    });
  });

  describe('Schema Validation', () => {
    it('should create an event with all required fields', async () => {
      const eventDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
      const deadline = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000); // 5 days from now

      const eventData = {
        title: 'Tech Conference 2024',
        description: 'Annual technology conference',
        date: eventDate,
        location: 'Convention Center',
        capacity: 100,
        registrationDeadline: deadline,
        mode: 'offline',
        createdBy: testUser._id
      };

      const event = await Event.create(eventData);

      expect(event.title).toBe(eventData.title);
      expect(event.description).toBe(eventData.description);
      expect(event.date).toEqual(eventData.date);
      expect(event.location).toBe(eventData.location);
      expect(event.capacity).toBe(eventData.capacity);
      expect(event.registrationDeadline).toEqual(eventData.registrationDeadline);
      expect(event.mode).toBe(eventData.mode);
      expect(event.registrationCount).toBe(0);
      expect(event.createdBy.toString()).toBe(testUser._id.toString());
    });

    it('should fail when required fields are missing', async () => {
      const event = new Event({});
      
      await expect(event.save()).rejects.toThrow();
    });

    it('should enforce capacity minimum of 1', async () => {
      const eventDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const deadline = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

      const event = new Event({
        title: 'Test Event',
        description: 'Test Description',
        date: eventDate,
        location: 'Test Location',
        capacity: 0,
        registrationDeadline: deadline,
        mode: 'online',
        createdBy: testUser._id
      });

      await expect(event.save()).rejects.toThrow('Capacity must be at least 1');
    });

    it('should only accept online or offline as mode', async () => {
      const eventDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const deadline = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

      const event = new Event({
        title: 'Test Event',
        description: 'Test Description',
        date: eventDate,
        location: 'Test Location',
        capacity: 50,
        registrationDeadline: deadline,
        mode: 'hybrid',
        createdBy: testUser._id
      });

      await expect(event.save()).rejects.toThrow('Mode must be either online or offline');
    });
  });

  describe('Custom Validation', () => {
    it('should reject when registrationDeadline is after event date', async () => {
      const eventDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
      const deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // After event date

      const event = new Event({
        title: 'Test Event',
        description: 'Test Description',
        date: eventDate,
        location: 'Test Location',
        capacity: 50,
        registrationDeadline: deadline,
        mode: 'online',
        createdBy: testUser._id
      });

      await expect(event.save()).rejects.toThrow('Registration deadline must be before event date');
    });

    it('should reject when registrationDeadline equals event date', async () => {
      const eventDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const deadline = new Date(eventDate); // Same as event date

      const event = new Event({
        title: 'Test Event',
        description: 'Test Description',
        date: eventDate,
        location: 'Test Location',
        capacity: 50,
        registrationDeadline: deadline,
        mode: 'online',
        createdBy: testUser._id
      });

      await expect(event.save()).rejects.toThrow('Registration deadline must be before event date');
    });

    it('should accept when registrationDeadline is before event date', async () => {
      const eventDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const deadline = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

      const event = new Event({
        title: 'Test Event',
        description: 'Test Description',
        date: eventDate,
        location: 'Test Location',
        capacity: 50,
        registrationDeadline: deadline,
        mode: 'online',
        createdBy: testUser._id
      });

      const savedEvent = await event.save();
      expect(savedEvent._id).toBeDefined();
    });
  });

  describe('Virtual Fields', () => {
    it('should calculate availableSlots correctly', async () => {
      const eventDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const deadline = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

      const event = await Event.create({
        title: 'Test Event',
        description: 'Test Description',
        date: eventDate,
        location: 'Test Location',
        capacity: 100,
        registrationDeadline: deadline,
        mode: 'online',
        createdBy: testUser._id,
        registrationCount: 30
      });

      expect(event.availableSlots).toBe(70);
    });

    it('should return isFull as false when not at capacity', async () => {
      const eventDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const deadline = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

      const event = await Event.create({
        title: 'Test Event',
        description: 'Test Description',
        date: eventDate,
        location: 'Test Location',
        capacity: 100,
        registrationDeadline: deadline,
        mode: 'online',
        createdBy: testUser._id,
        registrationCount: 50
      });

      expect(event.isFull).toBe(false);
    });

    it('should return isFull as true when at capacity', async () => {
      const eventDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const deadline = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

      const event = await Event.create({
        title: 'Test Event',
        description: 'Test Description',
        date: eventDate,
        location: 'Test Location',
        capacity: 100,
        registrationDeadline: deadline,
        mode: 'online',
        createdBy: testUser._id,
        registrationCount: 100
      });

      expect(event.isFull).toBe(true);
    });

    it('should return isFull as true when over capacity', async () => {
      const eventDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const deadline = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

      const event = await Event.create({
        title: 'Test Event',
        description: 'Test Description',
        date: eventDate,
        location: 'Test Location',
        capacity: 100,
        registrationDeadline: deadline,
        mode: 'online',
        createdBy: testUser._id,
        registrationCount: 105
      });

      expect(event.isFull).toBe(true);
    });

    it('should return isRegistrationOpen as true when before deadline', async () => {
      const eventDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const deadline = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000); // 5 days in future

      const event = await Event.create({
        title: 'Test Event',
        description: 'Test Description',
        date: eventDate,
        location: 'Test Location',
        capacity: 100,
        registrationDeadline: deadline,
        mode: 'online',
        createdBy: testUser._id
      });

      expect(event.isRegistrationOpen).toBe(true);
    });

    it('should return isRegistrationOpen as false when after deadline', async () => {
      const eventDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const deadline = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000); // 1 day in past

      const event = await Event.create({
        title: 'Test Event',
        description: 'Test Description',
        date: eventDate,
        location: 'Test Location',
        capacity: 100,
        registrationDeadline: deadline,
        mode: 'online',
        createdBy: testUser._id
      });

      expect(event.isRegistrationOpen).toBe(false);
    });
  });

  describe('Indexes', () => {
    it('should have indexes on date, mode, and createdBy', () => {
      const indexes = Event.schema.indexes();
      
      const dateIndex = indexes.find(idx => idx[0].date === 1);
      const modeIndex = indexes.find(idx => idx[0].mode === 1);
      const createdByIndex = indexes.find(idx => idx[0].createdBy === 1);

      expect(dateIndex).toBeDefined();
      expect(modeIndex).toBeDefined();
      expect(createdByIndex).toBeDefined();
    });
  });

  describe('Timestamps', () => {
    it('should set createdAt and updatedAt on creation', async () => {
      const eventDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const deadline = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

      const event = await Event.create({
        title: 'Test Event',
        description: 'Test Description',
        date: eventDate,
        location: 'Test Location',
        capacity: 100,
        registrationDeadline: deadline,
        mode: 'online',
        createdBy: testUser._id
      });

      expect(event.createdAt).toBeDefined();
      expect(event.updatedAt).toBeDefined();
      expect(event.createdAt).toBeInstanceOf(Date);
      expect(event.updatedAt).toBeInstanceOf(Date);
    });

    it('should update updatedAt on save', async () => {
      const eventDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const deadline = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

      const event = await Event.create({
        title: 'Test Event',
        description: 'Test Description',
        date: eventDate,
        location: 'Test Location',
        capacity: 100,
        registrationDeadline: deadline,
        mode: 'online',
        createdBy: testUser._id
      });

      const originalUpdatedAt = event.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      event.title = 'Updated Event';
      await event.save();

      expect(event.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });
});
