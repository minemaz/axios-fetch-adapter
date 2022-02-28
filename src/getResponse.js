import createError from 'axios/lib/core/createError';
import buildFullPath from 'axios/lib/core/buildFullPath';

/**
 * Fetch API stage two is to get response body. This funtion tries to retrieve
 * response body based on response's type
 */
export default async function getResponse(request, config) {
    let stageOne;
    try {
      stageOne = await new Promise((res, rej) => {
        let options = config;
        if (!options.hasOwnProperty('headers')) {
          options = Object.assign(options, { "headers": {}});
        }
        if (!options.hasOwnProperty('data')) {
          options = Object.assign(options, { "data": {}});
        }
        options.url = buildFullPath(options.baseURL, options.url);
        if (options.method === 'post') {
          if (options.headers['Content-Type'] === 'application/json') {
            cordova.plugin.http.setDataSerializer('json');
            options.data = JSON.parse(options.data);
          } else if (options.headers['Content-Type'].match(/^multipart\/form-data;/)){
            cordova.plugin.http.setDataSerializer('multipart');
          } else {
            cordova.plugin.http.setDataSerializer('urlencoded');
          }
        }
        cordova.plugin.http.sendRequest(options.url, options, res, rej);
      });
    } catch (e) {
        return Promise.reject(createError(JSON.stringify(e), config, null, request));
    }
    const response = {
        // ok: stageOne.ok,
        status: stageOne.status,
        statusText: stageOne.statusText,
        // headers: new Headers(stageOne.headers), // Make a copy of headers
        headers: stageOne.headers, // Make a copy of headers
        config: config,
        request,
    };

    if (stageOne.status >= 200 && stageOne.status !== 204) {
      response.data = stageOne.data;
    }

    return Promise.resolve(response);
}
