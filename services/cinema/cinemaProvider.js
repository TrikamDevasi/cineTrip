/**
 * Cinema and Showtime Provider Interface
 * Provides a uniform contract for fetching regional theaters, showtime schedules,
 * interactive seat maps, and ticketing provider integration.
 */
export class CinemaProvider {
  constructor() {
    this.dataSource = 'LIVE'; // 'LIVE' | 'CACHED' | 'REGIONAL SCHEDULE' | 'USER CREATED'
    this.isLiveSource = true;
    this.sourceLabel = 'Live Ticketing API';
  }

  /**
   * Fetch nearby auditoriums and certified screens
   * @param {Object} location - { latitude, longitude, city }
   * @returns {Promise<Array>} List of cinema objects
   */
  async getNearbyCinemas(location) {
    throw new Error('getNearbyCinemas() must be implemented by provider');
  }

  /**
   * Fetch available showtimes for a specific film and theater
   * @param {string|number} movieId
   * @param {string} cinemaId
   * @param {string} date
   * @returns {Promise<Array>} List of showtime objects
   */
  async getShowtimes(movieId, cinemaId, date) {
    throw new Error('getShowtimes() must be implemented by provider');
  }

  /**
   * Fetch auditorium seat map configuration & availability
   * @param {string} showtimeId
   * @returns {Promise<Object>} Seat map configuration
   */
  async getSeatMap(showtimeId) {
    throw new Error('getSeatMap() must be implemented by provider');
  }

  /**
   * Create or reserve a booking with commercial ticketing provider
   * @param {Object} bookingPayload
   * @returns {Promise<Object>} Booking confirmation
   */
  async createBooking(bookingPayload) {
    throw new Error('createBooking() must be implemented by provider');
  }

  /**
   * Check status of a booking reference
   * @param {string} bookingRef
   * @returns {Promise<Object>} Status object
   */
  async getBookingStatus(bookingRef) {
    throw new Error('getBookingStatus() must be implemented by provider');
  }
}
