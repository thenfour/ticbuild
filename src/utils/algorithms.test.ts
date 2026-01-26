import { debounce } from "./algorithms";

describe("Algorithm utilities", () => {
  describe("debounce", () => {
    jest.useFakeTimers();

    it("should debounce function calls", () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      // Call multiple times rapidly
      debouncedFn("test1");
      debouncedFn("test2");
      debouncedFn("test3");

      // Function should not be called yet
      expect(mockFn).not.toHaveBeenCalled();

      // Fast-forward time
      jest.advanceTimersByTime(100);

      // Function should be called once with the last arguments
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("test3");
    });

    it("should reset timer on subsequent calls", () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn("first");
      jest.advanceTimersByTime(50);

      debouncedFn("second");
      jest.advanceTimersByTime(50);

      // Should not be called yet (timer was reset)
      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(50);

      // Now it should be called with the last value
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("second");
    });
  });
});
