import AsyncStorage from '@react-native-async-storage/async-storage';
import ConnectivityService from './ConnectivityService';

const QUEUE_STORAGE_KEY = 'resilient_api_queue';
const MAX_QUEUE_SIZE = 100;
const MAX_RETRY_ATTEMPTS = 5;
const BASE_RETRY_DELAY = 1000; // 1 second
const MAX_RETRY_DELAY = 60000; // 1 minute
const REQUEST_TIMEOUT = 30000; // 30 seconds
const QUEUE_EXPIRY_HOURS = 24; // 24 hours

// Request priority levels
const PRIORITY = {
  LOW: 1,
  NORMAL: 2,
  HIGH: 3,
  CRITICAL: 4
};

// Request status
const STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
  EXPIRED: 'expired'
};

class ResilientApiService {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.listeners = [];
    this.isInitialized = false;
    this.statistics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      retriedRequests: 0,
      queuedRequests: 0
    };
  }

  // Initialize the service
  async initialize() {
    if (this.isInitialized) return;

    try {
      console.log('[ResilientApiService] Initializing...');
      
      // Load existing queue from storage
      await this.loadQueue();
      
      // Clean expired requests
      this.cleanExpiredRequests();
      
      // Set up connectivity monitoring
      this.setupConnectivityMonitoring();
      
      // Start processing if we have connectivity
      const networkInfo = ConnectivityService.getCurrentNetworkInfo();
      if (networkInfo.state?.isInternetReachable) {
        this.startProcessing();
      }
      
      this.isInitialized = true;
      console.log('[ResilientApiService] Initialized with', this.queue.length, 'queued requests');
    } catch (error) {
      console.error('[ResilientApiService] Initialization failed:', error);
      throw error;
    }
  }

  // Set up connectivity monitoring
  setupConnectivityMonitoring() {
    // Listen for connectivity changes
    ConnectivityService.addEventListener('stateChange', (data) => {
      if (data.current?.isInternetReachable && !data.previous?.isInternetReachable) {
        console.log('[ResilientApiService] Internet connectivity restored, starting queue processing');
        this.startProcessing();
      }
    });

    // Listen for successful network switches
    ConnectivityService.addEventListener('switchSuccess', () => {
      console.log('[ResilientApiService] Network switch successful, resuming queue processing');
      this.startProcessing();
    });
  }

  // Add a request to the queue
  async queueRequest(url, options = {}, priority = PRIORITY.NORMAL, metadata = {}) {
    try {
      const request = {
        id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        url,
        options: {
          method: 'GET',
          headers: {},
          ...options
        },
        priority,
        metadata: {
          description: 'API Request',
          ...metadata
        },
        status: STATUS.PENDING,
        attempts: 0,
        maxAttempts: MAX_RETRY_ATTEMPTS,
        createdAt: Date.now(),
        lastAttemptAt: null,
        error: null,
        response: null
      };

      // Add to queue
      this.queue.push(request);
      this.statistics.queuedRequests++;
      this.statistics.totalRequests++;

      // Sort queue by priority (highest first)
      this.queue.sort((a, b) => b.priority - a.priority);

      // Limit queue size
      if (this.queue.length > MAX_QUEUE_SIZE) {
        const removed = this.queue.splice(MAX_QUEUE_SIZE);
        console.warn('[ResilientApiService] Queue size exceeded, removed', removed.length, 'oldest requests');
      }

      // Save queue to storage
      await this.saveQueue();

      // Notify listeners
      this.notifyListeners('requestQueued', { request });

      console.log(`[ResilientApiService] Queued request: ${request.id} (${request.metadata.description})`);

      // Try to process immediately if connected
      const networkInfo = ConnectivityService.getCurrentNetworkInfo();
      if (networkInfo.state?.isInternetReachable) {
        this.startProcessing();
      }

      return request.id;
    } catch (error) {
      console.error('[ResilientApiService] Failed to queue request:', error);
      throw error;
    }
  }

  // Start processing the queue
  async startProcessing() {
    if (this.isProcessing) {
      console.log('[ResilientApiService] Processing already in progress');
      return;
    }

    if (this.queue.length === 0) {
      console.log('[ResilientApiService] Queue is empty');
      return;
    }

    console.log('[ResilientApiService] Starting queue processing with', this.queue.length, 'requests');
    this.isProcessing = true;
    this.notifyListeners('processingStarted');

    try {
      while (this.queue.length > 0) {
        // Check connectivity before each request
        const networkInfo = ConnectivityService.getCurrentNetworkInfo();
        if (!networkInfo.state?.isInternetReachable) {
          console.log('[ResilientApiService] No internet connectivity, pausing processing');
          break;
        }

        // Get the next request (highest priority, least recently attempted)
        const request = this.getNextRequest();
        if (!request) break;

        // Process the request
        await this.processRequest(request);

        // Small delay between requests
        await this.delay(100);
      }
    } catch (error) {
      console.error('[ResilientApiService] Processing error:', error);
    } finally {
      this.isProcessing = false;
      this.notifyListeners('processingStopped');
      console.log('[ResilientApiService] Processing stopped');
    }
  }

  // Get the next request to process
  getNextRequest() {
    const pendingRequests = this.queue.filter(req => 
      req.status === STATUS.PENDING && 
      req.attempts < req.maxAttempts &&
      !this.isRequestExpired(req)
    );

    if (pendingRequests.length === 0) return null;

    // Sort by priority first, then by creation time
    pendingRequests.sort((a, b) => {
      if (a.priority !== b.priority) return b.priority - a.priority;
      return a.createdAt - b.createdAt;
    });

    return pendingRequests[0];
  }

  // Process a single request
  async processRequest(request) {
    try {
      console.log(`[ResilientApiService] Processing request: ${request.id} (attempt ${request.attempts + 1})`);
      
      request.status = STATUS.IN_PROGRESS;
      request.attempts++;
      request.lastAttemptAt = Date.now();
      this.statistics.retriedRequests++;

      this.notifyListeners('requestStarted', { request });

      // Execute the request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      const requestOptions = {
        ...request.options,
        signal: controller.signal
      };

      const response = await fetch(request.url, requestOptions);
      clearTimeout(timeoutId);

      // Check if response is successful
      if (response.ok) {
        // Success
        const responseData = await this.parseResponse(response);
        request.status = STATUS.COMPLETED;
        request.response = responseData;
        request.error = null;

        this.statistics.successfulRequests++;
        this.statistics.queuedRequests = Math.max(0, this.statistics.queuedRequests - 1);

        // Remove from queue
        this.queue = this.queue.filter(req => req.id !== request.id);

        console.log(`[ResilientApiService] Request completed: ${request.id}`);
        this.notifyListeners('requestCompleted', { request });
      } else {
        // HTTP error
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

    } catch (error) {
      console.error(`[ResilientApiService] Request failed: ${request.id}`, error.message);
      
      request.error = error.message;
      
      // Check if we should retry
      if (request.attempts < request.maxAttempts && !this.isNetworkError(error)) {
        // Retry with exponential backoff
        request.status = STATUS.PENDING;
        const delay = Math.min(
          BASE_RETRY_DELAY * Math.pow(2, request.attempts - 1),
          MAX_RETRY_DELAY
        );
        
        console.log(`[ResilientApiService] Will retry request ${request.id} in ${delay}ms`);
        
        // Schedule retry
        setTimeout(() => {
          if (this.queue.find(req => req.id === request.id)) {
            this.startProcessing();
          }
        }, delay);
        
        this.notifyListeners('requestRetrying', { request, delay });
      } else {
        // Max attempts reached or network error
        request.status = STATUS.FAILED;
        this.statistics.failedRequests++;
        this.statistics.queuedRequests = Math.max(0, this.statistics.queuedRequests - 1);
        
        console.error(`[ResilientApiService] Request permanently failed: ${request.id}`);
        this.notifyListeners('requestFailed', { request });
      }
    } finally {
      // Save queue state
      await this.saveQueue();
    }
  }

  // Parse response based on content type
  async parseResponse(response) {
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else if (contentType && contentType.includes('text/')) {
      return await response.text();
    } else {
      // For binary data, return as blob info
      const blob = await response.blob();
      return {
        type: 'blob',
        size: blob.size,
        contentType: blob.type
      };
    }
  }

  // Check if error is network-related
  isNetworkError(error) {
    const networkErrorMessages = [
      'Network request failed',
      'Unable to resolve host',
      'Connection refused',
      'Timeout',
      'No network connection'
    ];
    
    return networkErrorMessages.some(msg => 
      error.message.toLowerCase().includes(msg.toLowerCase())
    );
  }

  // Check if request has expired
  isRequestExpired(request) {
    const expiryTime = request.createdAt + (QUEUE_EXPIRY_HOURS * 60 * 60 * 1000);
    return Date.now() > expiryTime;
  }

  // Clean expired requests
  cleanExpiredRequests() {
    const originalLength = this.queue.length;
    this.queue = this.queue.filter(request => {
      if (this.isRequestExpired(request)) {
        request.status = STATUS.EXPIRED;
        return false;
      }
      return true;
    });

    const removed = originalLength - this.queue.length;
    if (removed > 0) {
      console.log(`[ResilientApiService] Cleaned ${removed} expired requests`);
      this.saveQueue();
    }
  }

  // Save queue to AsyncStorage
  async saveQueue() {
    try {
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('[ResilientApiService] Failed to save queue:', error);
    }
  }

  // Load queue from AsyncStorage
  async loadQueue() {
    try {
      const queueData = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      if (queueData) {
        this.queue = JSON.parse(queueData);
        console.log(`[ResilientApiService] Loaded ${this.queue.length} requests from storage`);
      }
    } catch (error) {
      console.error('[ResilientApiService] Failed to load queue:', error);
      this.queue = [];
    }
  }

  // Get queue status
  getQueueStatus() {
    const statusCounts = this.queue.reduce((acc, req) => {
      acc[req.status] = (acc[req.status] || 0) + 1;
      return acc;
    }, {});

    return {
      total: this.queue.length,
      statusCounts,
      isProcessing: this.isProcessing,
      statistics: this.statistics,
      oldestRequest: this.queue.length > 0 ? 
        Math.min(...this.queue.map(req => req.createdAt)) : null
    };
  }

  // Get specific request status
  getRequestStatus(requestId) {
    return this.queue.find(req => req.id === requestId) || null;
  }

  // Cancel a request
  async cancelRequest(requestId) {
    const index = this.queue.findIndex(req => req.id === requestId);
    if (index !== -1) {
      const request = this.queue[index];
      this.queue.splice(index, 1);
      this.statistics.queuedRequests = Math.max(0, this.statistics.queuedRequests - 1);
      
      await this.saveQueue();
      this.notifyListeners('requestCancelled', { request });
      
      console.log(`[ResilientApiService] Cancelled request: ${requestId}`);
      return true;
    }
    return false;
  }

  // Clear all requests
  async clearQueue() {
    const count = this.queue.length;
    this.queue = [];
    this.statistics.queuedRequests = 0;
    
    await this.saveQueue();
    this.notifyListeners('queueCleared', { count });
    
    console.log(`[ResilientApiService] Cleared ${count} requests from queue`);
  }

  // Add event listener
  addEventListener(eventType, callback) {
    const listener = { eventType, callback, id: Date.now() + Math.random() };
    this.listeners.push(listener);
    
    return () => {
      this.listeners = this.listeners.filter(l => l.id !== listener.id);
    };
  }

  // Notify listeners
  notifyListeners(eventType, data = null) {
    this.listeners
      .filter(listener => listener.eventType === eventType)
      .forEach(listener => {
        try {
          listener.callback(data);
        } catch (error) {
          console.error('[ResilientApiService] Listener error:', error);
        }
      });
  }

  // Utility function for delays
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Make a resilient API call (convenience method)
  async makeResilientCall(url, options = {}, priority = PRIORITY.NORMAL, metadata = {}) {
    const networkInfo = ConnectivityService.getCurrentNetworkInfo();
    
    // If we have good connectivity, try direct call first
    if (networkInfo.state?.isInternetReachable && networkInfo.quality !== 'poor') {
      try {
        console.log('[ResilientApiService] Attempting direct call to:', url);
        const response = await fetch(url, {
          timeout: REQUEST_TIMEOUT,
          ...options
        });
        
        if (response.ok) {
          this.statistics.successfulRequests++;
          return await this.parseResponse(response);
        }
      } catch (error) {
        console.log('[ResilientApiService] Direct call failed, queuing request:', error.message);
      }
    }

    // Queue the request for resilient handling
    const requestId = await this.queueRequest(url, options, priority, metadata);
    
    // Return a promise that resolves when the request completes
    return new Promise((resolve, reject) => {
      const unsubscribe = this.addEventListener('requestCompleted', (data) => {
        if (data.request.id === requestId) {
          unsubscribe();
          resolve(data.request.response);
        }
      });
      
      const unsubscribeFailed = this.addEventListener('requestFailed', (data) => {
        if (data.request.id === requestId) {
          unsubscribe();
          unsubscribeFailed();
          reject(new Error(data.request.error));
        }
      });
    });
  }
}

// Export singleton instance and priority constants
const resilientApiService = new ResilientApiService();

export { PRIORITY, STATUS };
export default resilientApiService;