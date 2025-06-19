import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import config from './config';

// Configure axios defaults
axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';
// Don't set baseURL in development mode to allow proxy to work
if (process.env.NODE_ENV !== 'development') {
  axios.defaults.baseURL = config.publicPath + config.basePath;
}

// Set reasonable timeout
axios.defaults.timeout = 10000; // 10 seconds

/**
 * Requests a URL, returning a promise
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to axios
 *
 * @return {Promise<any>}     The response data
 */
export default function request<T = any>(url: string, options?: AxiosRequestConfig): Promise<T> {
  return axios({ url, ...options })
    .then(checkStatus)
    .then(parseJSON)
    .catch(handleError);
}

/**
 * Checks if a network request came back fine, and throws an error if not
 *
 * @param  {AxiosResponse} response   A response from a network request
 *
 * @return {AxiosResponse} Returns the response if successful
 * @throws {Error} Throws an error if the request failed
 */
function checkStatus(response: AxiosResponse): AxiosResponse {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  const error: Error & { response?: AxiosResponse } = new Error(
    response.statusText || `Error ${response.status}`
  );
  error.response = response;
  throw error;
}

/**
 * Parses the JSON returned by a network request
 *
 * @param  {AxiosResponse} response A response from a network request
 *
 * @return {any|null}      The parsed JSON from the request or null for empty responses
 */
function parseJSON(response: AxiosResponse): any | null {
  if (response.status === 204 || response.status === 205 || response.status === 504) {
    return null;
  }
  return response.data;
}

/**
 * Handles errors from the API request
 *
 * @param {AxiosError|Error} error The error that occurred
 * @throws {Error} Rethrows the error with additional context
 */
function handleError(error: AxiosError | Error): never {
  // Handle Axios errors with response
  if (axios.isAxiosError(error) && error.response) {
    const { status, statusText, data } = error.response;
    const errorMessage = data?.message || statusText || `Error ${status}`;

    // Enhance error with more context
    const enhancedError = new Error(`API Error (${status}): ${errorMessage}`);
    throw enhancedError;
  }

  // Handle network errors (no response)
  if (axios.isAxiosError(error) && error.request) {
    throw new Error('Network Error: Unable to connect to the server');
  }

  // Handle other errors
  throw error;
}
