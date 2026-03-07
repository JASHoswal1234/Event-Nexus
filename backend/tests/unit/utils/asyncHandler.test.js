/**
 * Unit tests for asyncHandler utility
 * Validates that async errors are properly caught and forwarded to error middleware
 */

const asyncHandler = require('../../../utils/asyncHandler');

describe('asyncHandler', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  it('should call the wrapped function with req, res, next', async () => {
    const mockFn = jest.fn().mockResolvedValue(undefined);
    const wrappedFn = asyncHandler(mockFn);

    await wrappedFn(req, res, next);

    expect(mockFn).toHaveBeenCalledWith(req, res, next);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should not call next when the async function succeeds', async () => {
    const mockFn = jest.fn(async (req, res) => {
      res.status(200).json({ success: true });
    });
    const wrappedFn = asyncHandler(mockFn);

    await wrappedFn(req, res, next);

    expect(mockFn).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('should catch errors and forward them to next middleware', async () => {
    const error = new Error('Test error');
    const mockFn = jest.fn().mockRejectedValue(error);
    const wrappedFn = asyncHandler(mockFn);

    await wrappedFn(req, res, next);

    expect(mockFn).toHaveBeenCalledWith(req, res, next);
    expect(next).toHaveBeenCalledWith(error);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should handle synchronous errors thrown in async functions', async () => {
    const error = new Error('Synchronous error');
    const mockFn = jest.fn(async () => {
      throw error;
    });
    const wrappedFn = asyncHandler(mockFn);

    await wrappedFn(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it('should handle custom error objects', async () => {
    const customError = {
      message: 'Custom error',
      statusCode: 400
    };
    const mockFn = jest.fn().mockRejectedValue(customError);
    const wrappedFn = asyncHandler(mockFn);

    await wrappedFn(req, res, next);

    expect(next).toHaveBeenCalledWith(customError);
  });

  it('should work with functions that return promises', async () => {
    const mockFn = jest.fn(() => Promise.resolve('success'));
    const wrappedFn = asyncHandler(mockFn);

    await wrappedFn(req, res, next);

    expect(mockFn).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });
});
