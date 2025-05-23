(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('http'), require('fs'), require('crypto')) :
    typeof define === 'function' && define.amd ? define(['http', 'fs', 'crypto'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Server = factory(global.http, global.fs, global.crypto));
}(this, (function (http, fs, crypto) { 'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var http__default = /*#__PURE__*/_interopDefaultLegacy(http);
    var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
    var crypto__default = /*#__PURE__*/_interopDefaultLegacy(crypto);

    class ServiceError extends Error {
        constructor(message = 'Service Error') {
            super(message);
            this.name = 'ServiceError'; 
        }
    }

    class NotFoundError extends ServiceError {
        constructor(message = 'Resource not found') {
            super(message);
            this.name = 'NotFoundError'; 
            this.status = 404;
        }
    }

    class RequestError extends ServiceError {
        constructor(message = 'Request error') {
            super(message);
            this.name = 'RequestError'; 
            this.status = 400;
        }
    }

    class ConflictError extends ServiceError {
        constructor(message = 'Resource conflict') {
            super(message);
            this.name = 'ConflictError'; 
            this.status = 409;
        }
    }

    class AuthorizationError extends ServiceError {
        constructor(message = 'Unauthorized') {
            super(message);
            this.name = 'AuthorizationError'; 
            this.status = 401;
        }
    }

    class CredentialError extends ServiceError {
        constructor(message = 'Forbidden') {
            super(message);
            this.name = 'CredentialError'; 
            this.status = 403;
        }
    }

    var errors = {
        ServiceError,
        NotFoundError,
        RequestError,
        ConflictError,
        AuthorizationError,
        CredentialError
    };

    const { ServiceError: ServiceError$1 } = errors;


    function createHandler(plugins, services) {
        return async function handler(req, res) {
            const method = req.method;
            console.info(`<< ${req.method} ${req.url}`);

            // Redirect fix for admin panel relative paths
            if (req.url.slice(-6) == '/admin') {
                res.writeHead(302, {
                    'Location': `http://${req.headers.host}/admin/`
                });
                return res.end();
            }

            let status = 200;
            let headers = {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            };
            let result = '';
            let context;

            // NOTE: the OPTIONS method results in undefined result and also it never processes plugins - keep this in mind
            if (method == 'OPTIONS') {
                Object.assign(headers, {
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
                    'Access-Control-Allow-Credentials': false,
                    'Access-Control-Max-Age': '86400',
                    'Access-Control-Allow-Headers': 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, X-Authorization, X-Admin, X-Authorisation'
                });
            } else {
                try {
                    context = processPlugins();
                    await handle(context);
                } catch (err) {
                    if (err instanceof ServiceError$1) {
                        status = err.status || 400;
                        result = composeErrorObject(err.code || status, err.message);
                    } else {
                        // Unhandled exception, this is due to an error in the service code - REST consumers should never have to encounter this;
                        // If it happens, it must be debugged in a future version of the server
                        console.error(err);
                        status = 500;
                        result = composeErrorObject(500, 'Server Error');
                    }
                }
            }

            res.writeHead(status, headers);
            if (context != undefined && context.util != undefined && context.util.throttle) {
                await new Promise(r => setTimeout(r, 500 + Math.random() * 500));
            }
            res.end(result);

            function processPlugins() {
                const context = { params: {} };
                plugins.forEach(decorate => decorate(context, req));
                return context;
            }

            async function handle(context) {
                const { serviceName, tokens, query, body } = await parseRequest(req);
                if (serviceName == 'admin') {
                    return ({ headers, result } = services['admin'](method, tokens, query, body));
                } else if (serviceName == 'favicon.ico') {
                    return ({ headers, result } = services['favicon'](method, tokens, query, body));
                }

                const service = services[serviceName];

                if (service === undefined) {
                    status = 400;
                    result = composeErrorObject(400, `Service "${serviceName}" is not supported`);
                    console.error('Missing service ' + serviceName);
                } else {
                    result = await service(context, { method, tokens, query, body });
                }

                // NOTE: logout does not return a result
                // in this case the content type header should be omitted, to allow checks on the client
                if (result !== undefined) {
                    result = JSON.stringify(result);
                } else {
                    status = 204;
                    delete headers['Content-Type'];
                }
            }
        };
    }



    function composeErrorObject(code, message) {
        return JSON.stringify({
            code,
            message
        });
    }

    async function parseRequest(req) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const tokens = url.pathname.split('/').filter(x => x.length > 0);
        const serviceName = tokens.shift();
        const queryString = url.search.split('?')[1] || '';
        const query = queryString
            .split('&')
            .filter(s => s != '')
            .map(x => x.split('='))
            .reduce((p, [k, v]) => Object.assign(p, { [k]: decodeURIComponent(v.replace(/\+/g, " ")) }), {});

        let body;
        // If req stream has ended body has been parsed
        if (req.readableEnded) {
            body = req.body;
        } else {
            body = await parseBody(req);
        }

        return {
            serviceName,
            tokens,
            query,
            body
        };
    }

    function parseBody(req) {
        return new Promise((resolve, reject) => {
            let body = '';
            req.on('data', (chunk) => body += chunk.toString());
            req.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (err) {
                    resolve(body);
                }
            });
        });
    }

    var requestHandler = createHandler;

    class Service {
        constructor() {
            this._actions = [];
            this.parseRequest = this.parseRequest.bind(this);
        }

        /**
         * Handle service request, after it has been processed by a request handler
         * @param {*} context Execution context, contains result of middleware processing
         * @param {{method: string, tokens: string[], query: *, body: *}} request Request parameters
         */
        async parseRequest(context, request) {
            for (let { method, name, handler } of this._actions) {
                if (method === request.method && matchAndAssignParams(context, request.tokens[0], name)) {
                    return await handler(context, request.tokens.slice(1), request.query, request.body);
                }
            }
        }

        /**
         * Register service action
         * @param {string} method HTTP method
         * @param {string} name Action name. Can be a glob pattern.
         * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
         */
        registerAction(method, name, handler) {
            this._actions.push({ method, name, handler });
        }

        /**
         * Register GET action
         * @param {string} name Action name. Can be a glob pattern.
         * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
         */
        get(name, handler) {
            this.registerAction('GET', name, handler);
        }

        /**
         * Register POST action
         * @param {string} name Action name. Can be a glob pattern.
         * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
         */
        post(name, handler) {
            this.registerAction('POST', name, handler);
        }

        /**
         * Register PUT action
         * @param {string} name Action name. Can be a glob pattern.
         * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
         */
        put(name, handler) {
            this.registerAction('PUT', name, handler);
        }

        /**
         * Register PATCH action
         * @param {string} name Action name. Can be a glob pattern.
         * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
         */
        patch(name, handler) {
            this.registerAction('PATCH', name, handler);
        }

        /**
         * Register DELETE action
         * @param {string} name Action name. Can be a glob pattern.
         * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
         */
        delete(name, handler) {
            this.registerAction('DELETE', name, handler);
        }
    }

    function matchAndAssignParams(context, name, pattern) {
        if (pattern == '*') {
            return true;
        } else if (pattern[0] == ':') {
            context.params[pattern.slice(1)] = name;
            return true;
        } else if (name == pattern) {
            return true;
        } else {
            return false;
        }
    }

    var Service_1 = Service;

    function uuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    var util = {
        uuid
    };

    const uuid$1 = util.uuid;


    const data = fs__default['default'].existsSync('./data') ? fs__default['default'].readdirSync('./data').reduce((p, c) => {
        const content = JSON.parse(fs__default['default'].readFileSync('./data/' + c));
        const collection = c.slice(0, -5);
        p[collection] = {};
        for (let endpoint in content) {
            p[collection][endpoint] = content[endpoint];
        }
        return p;
    }, {}) : {};

    const actions = {
        get: (context, tokens, query, body) => {
            tokens = [context.params.collection, ...tokens];
            let responseData = data;
            for (let token of tokens) {
                if (responseData !== undefined) {
                    responseData = responseData[token];
                }
            }
            return responseData;
        },
        post: (context, tokens, query, body) => {
            tokens = [context.params.collection, ...tokens];
            console.log('Request body:\n', body);

            // TODO handle collisions, replacement
            let responseData = data;
            for (let token of tokens) {
                if (responseData.hasOwnProperty(token) == false) {
                    responseData[token] = {};
                }
                responseData = responseData[token];
            }

            const newId = uuid$1();
            responseData[newId] = Object.assign({}, body, { _id: newId });
            return responseData[newId];
        },
        put: (context, tokens, query, body) => {
            tokens = [context.params.collection, ...tokens];
            console.log('Request body:\n', body);

            let responseData = data;
            for (let token of tokens.slice(0, -1)) {
                if (responseData !== undefined) {
                    responseData = responseData[token];
                }
            }
            if (responseData !== undefined && responseData[tokens.slice(-1)] !== undefined) {
                responseData[tokens.slice(-1)] = body;
            }
            return responseData[tokens.slice(-1)];
        },
        patch: (context, tokens, query, body) => {
            tokens = [context.params.collection, ...tokens];
            console.log('Request body:\n', body);

            let responseData = data;
            for (let token of tokens) {
                if (responseData !== undefined) {
                    responseData = responseData[token];
                }
            }
            if (responseData !== undefined) {
                Object.assign(responseData, body);
            }
            return responseData;
        },
        delete: (context, tokens, query, body) => {
            tokens = [context.params.collection, ...tokens];
            let responseData = data;

            for (let i = 0; i < tokens.length; i++) {
                const token = tokens[i];
                if (responseData.hasOwnProperty(token) == false) {
                    return null;
                }
                if (i == tokens.length - 1) {
                    const body = responseData[token];
                    delete responseData[token];
                    return body;
                } else {
                    responseData = responseData[token];
                }
            }
        }
    };

    const dataService = new Service_1();
    dataService.get(':collection', actions.get);
    dataService.post(':collection', actions.post);
    dataService.put(':collection', actions.put);
    dataService.patch(':collection', actions.patch);
    dataService.delete(':collection', actions.delete);


    var jsonstore = dataService.parseRequest;

    /*
     * This service requires storage and auth plugins
     */

    const { AuthorizationError: AuthorizationError$1 } = errors;



    const userService = new Service_1();

    userService.get('me', getSelf);
    userService.post('register', onRegister);
    userService.post('login', onLogin);
    userService.get('logout', onLogout);


    function getSelf(context, tokens, query, body) {
        if (context.user) {
            const result = Object.assign({}, context.user);
            delete result.hashedPassword;
            return result;
        } else {
            throw new AuthorizationError$1();
        }
    }

    function onRegister(context, tokens, query, body) {
        return context.auth.register(body);
    }

    function onLogin(context, tokens, query, body) {
        return context.auth.login(body);
    }

    function onLogout(context, tokens, query, body) {
        return context.auth.logout();
    }

    var users = userService.parseRequest;

    const { NotFoundError: NotFoundError$1, RequestError: RequestError$1 } = errors;


    var crud = {
        get,
        post,
        put,
        patch,
        delete: del
    };


    function validateRequest(context, tokens, query) {
        /*
        if (context.params.collection == undefined) {
            throw new RequestError('Please, specify collection name');
        }
        */
        if (tokens.length > 1) {
            throw new RequestError$1();
        }
    }

    function parseWhere(query) {
        const operators = {
            '<=': (prop, value) => record => record[prop] <= JSON.parse(value),
            '<': (prop, value) => record => record[prop] < JSON.parse(value),
            '>=': (prop, value) => record => record[prop] >= JSON.parse(value),
            '>': (prop, value) => record => record[prop] > JSON.parse(value),
            '=': (prop, value) => record => record[prop] == JSON.parse(value),
            ' like ': (prop, value) => record => record[prop].toLowerCase().includes(JSON.parse(value).toLowerCase()),
            ' in ': (prop, value) => record => JSON.parse(`[${/\((.+?)\)/.exec(value)[1]}]`).includes(record[prop]),
        };
        const pattern = new RegExp(`^(.+?)(${Object.keys(operators).join('|')})(.+?)$`, 'i');

        try {
            let clauses = [query.trim()];
            let check = (a, b) => b;
            let acc = true;
            if (query.match(/ and /gi)) {
                // inclusive
                clauses = query.split(/ and /gi);
                check = (a, b) => a && b;
                acc = true;
            } else if (query.match(/ or /gi)) {
                // optional
                clauses = query.split(/ or /gi);
                check = (a, b) => a || b;
                acc = false;
            }
            clauses = clauses.map(createChecker);

            return (record) => clauses
                .map(c => c(record))
                .reduce(check, acc);
        } catch (err) {
            throw new Error('Could not parse WHERE clause, check your syntax.');
        }

        function createChecker(clause) {
            let [match, prop, operator, value] = pattern.exec(clause);
            [prop, value] = [prop.trim(), value.trim()];

            return operators[operator.toLowerCase()](prop, value);
        }
    }


    function get(context, tokens, query, body) {
        validateRequest(context, tokens);

        let responseData;

        try {
            if (query.where) {
                responseData = context.storage.get(context.params.collection).filter(parseWhere(query.where));
            } else if (context.params.collection) {
                responseData = context.storage.get(context.params.collection, tokens[0]);
            } else {
                // Get list of collections
                return context.storage.get();
            }

            if (query.sortBy) {
                const props = query.sortBy
                    .split(',')
                    .filter(p => p != '')
                    .map(p => p.split(' ').filter(p => p != ''))
                    .map(([p, desc]) => ({ prop: p, desc: desc ? true : false }));

                // Sorting priority is from first to last, therefore we sort from last to first
                for (let i = props.length - 1; i >= 0; i--) {
                    let { prop, desc } = props[i];
                    responseData.sort(({ [prop]: propA }, { [prop]: propB }) => {
                        if (typeof propA == 'number' && typeof propB == 'number') {
                            return (propA - propB) * (desc ? -1 : 1);
                        } else {
                            return propA.localeCompare(propB) * (desc ? -1 : 1);
                        }
                    });
                }
            }

            if (query.offset) {
                responseData = responseData.slice(Number(query.offset) || 0);
            }
            const pageSize = Number(query.pageSize) || 10;
            if (query.pageSize) {
                responseData = responseData.slice(0, pageSize);
            }
    		
    		if (query.distinct) {
                const props = query.distinct.split(',').filter(p => p != '');
                responseData = Object.values(responseData.reduce((distinct, c) => {
                    const key = props.map(p => c[p]).join('::');
                    if (distinct.hasOwnProperty(key) == false) {
                        distinct[key] = c;
                    }
                    return distinct;
                }, {}));
            }

            if (query.count) {
                return responseData.length;
            }

            if (query.select) {
                const props = query.select.split(',').filter(p => p != '');
                responseData = Array.isArray(responseData) ? responseData.map(transform) : transform(responseData);

                function transform(r) {
                    const result = {};
                    props.forEach(p => result[p] = r[p]);
                    return result;
                }
            }

            if (query.load) {
                const props = query.load.split(',').filter(p => p != '');
                props.map(prop => {
                    const [propName, relationTokens] = prop.split('=');
                    const [idSource, collection] = relationTokens.split(':');
                    console.log(`Loading related records from "${collection}" into "${propName}", joined on "_id"="${idSource}"`);
                    const storageSource = collection == 'users' ? context.protectedStorage : context.storage;
                    responseData = Array.isArray(responseData) ? responseData.map(transform) : transform(responseData);

                    function transform(r) {
                        const seekId = r[idSource];
                        const related = storageSource.get(collection, seekId);
                        delete related.hashedPassword;
                        r[propName] = related;
                        return r;
                    }
                });
            }

        } catch (err) {
            console.error(err);
            if (err.message.includes('does not exist')) {
                throw new NotFoundError$1();
            } else {
                throw new RequestError$1(err.message);
            }
        }

        context.canAccess(responseData);

        return responseData;
    }

    function post(context, tokens, query, body) {
        console.log('Request body:\n', body);

        validateRequest(context, tokens);
        if (tokens.length > 0) {
            throw new RequestError$1('Use PUT to update records');
        }
        context.canAccess(undefined, body);

        body._ownerId = context.user._id;
        let responseData;

        try {
            responseData = context.storage.add(context.params.collection, body);
        } catch (err) {
            throw new RequestError$1();
        }

        return responseData;
    }

    function put(context, tokens, query, body) {
        console.log('Request body:\n', body);

        validateRequest(context, tokens);
        if (tokens.length != 1) {
            throw new RequestError$1('Missing entry ID');
        }

        let responseData;
        let existing;

        try {
            existing = context.storage.get(context.params.collection, tokens[0]);
        } catch (err) {
            throw new NotFoundError$1();
        }

        context.canAccess(existing, body);

        try {
            responseData = context.storage.set(context.params.collection, tokens[0], body);
        } catch (err) {
            throw new RequestError$1();
        }

        return responseData;
    }

    function patch(context, tokens, query, body) {
        console.log('Request body:\n', body);

        validateRequest(context, tokens);
        if (tokens.length != 1) {
            throw new RequestError$1('Missing entry ID');
        }

        let responseData;
        let existing;

        try {
            existing = context.storage.get(context.params.collection, tokens[0]);
        } catch (err) {
            throw new NotFoundError$1();
        }

        context.canAccess(existing, body);

        try {
            responseData = context.storage.merge(context.params.collection, tokens[0], body);
        } catch (err) {
            throw new RequestError$1();
        }

        return responseData;
    }

    function del(context, tokens, query, body) {
        validateRequest(context, tokens);
        if (tokens.length != 1) {
            throw new RequestError$1('Missing entry ID');
        }

        let responseData;
        let existing;

        try {
            existing = context.storage.get(context.params.collection, tokens[0]);
        } catch (err) {
            throw new NotFoundError$1();
        }

        context.canAccess(existing);

        try {
            responseData = context.storage.delete(context.params.collection, tokens[0]);
        } catch (err) {
            throw new RequestError$1();
        }

        return responseData;
    }

    /*
     * This service requires storage and auth plugins
     */

    const dataService$1 = new Service_1();
    dataService$1.get(':collection', crud.get);
    dataService$1.post(':collection', crud.post);
    dataService$1.put(':collection', crud.put);
    dataService$1.patch(':collection', crud.patch);
    dataService$1.delete(':collection', crud.delete);

    var data$1 = dataService$1.parseRequest;

    const imgdata = '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Td4DLneAwSddMiRH8tMU8nng/Yy+KQsM3AKBNbe35j5OH4A0dbV8AxwcAqMFyl73eHd3e2//nmn29wOGi3Kv+RixSgAAEkxpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+Cjx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDQuNC4wLUV4aXYyIj4KIDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+CiAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgIHhtbG5zOmlwdGNFeHQ9Imh0dHA6Ly9pcHRjLm9yZy9zdGQvSXB0YzR4bXBFeHQvMjAwOC0wMi0yOS8iCiAgICB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIKICAgIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiCiAgICB4bWxuczpwbHVzPSJodHRwOi8vbnMudXNlcGx1cy5vcmcvbGRmL3htcC8xLjAvIgogICAgeG1sbnM6R0lNUD0iaHR0cDovL3d3dy5naW1wLm9yZy94bXAvIgogICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICAgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIgogICAgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIgogICAgeG1sbnM6eG1wUmlnaHRzPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvcmlnaHRzLyIKICAgeG1wTU06RG9jdW1lbnRJRD0iZ2ltcDpkb2NpZDpnaW1wOjdjZDM3NWM3LTcwNmItNDlkMy1hOWRkLWNmM2Q3MmMwY2I4ZCIKICAgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo2NGY2YTJlYy04ZjA5LTRkZTMtOTY3ZC05MTUyY2U5NjYxNTAiCiAgIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDoxMmE1NzI5Mi1kNmJkLTRlYjQtOGUxNi1hODEzYjMwZjU0NWYiCiAgIEdJTVA6QVBJPSIyLjAiCiAgIEdJTVA6UGxhdGZvcm09IldpbmRvd3MiCiAgIEdJTVA6VGltZVN0YW1wPSIxNjEzMzAwNzI5NTMwNjQzIgogICBHSU1QOlZlcnNpb249IjIuMTAuMTIiCiAgIGRjOkZvcm1hdD0iaW1hZ2UvcG5nIgogICBwaG90b3Nob3A6Q3JlZGl0PSJHZXR0eSBJbWFnZXMvaVN0b2NrcGhvdG8iCiAgIHhtcDpDcmVhdG9yVG9vbD0iR0lNUCAyLjEwIgogICB4bXBSaWdodHM6V2ViU3RhdGVtZW50PSJodHRwczovL3d3dy5pc3RvY2twaG90by5jb20vbGVnYWwvbGljZW5zZS1hZ3JlZW1lbnQ/dXRtX21lZGl1bT1vcmdhbmljJmFtcDt1dG1fc291cmNlPWdvb2dsZSZhbXA7dXRtX2NhbXBhaWduPWlwdGN1cmwiPgogICA8aXB0Y0V4dDpMb2NhdGlvbkNyZWF0ZWQ+CiAgICA8cmRmOkJhZy8+CiAgIDwvaXB0Y0V4dDpMb2NhdGlvbkNyZWF0ZWQ+CiAgIDxpcHRjRXh0OkxvY2F0aW9uU2hvd24+CiAgICA8cmRmOkJhZy8+CiAgIDwvaXB0Y0V4dDpMb2NhdGlvblNob3duPgogICA8aXB0Y0V4dDpBcnR3b3JrT3JPYmplY3Q+CiAgICA8cmRmOkJhZy8+CiAgIDwvaXB0Y0V4dDpBcnR3b3JrT3JPYmplY3Q+CiAgIDxpcHRjRXh0OlJlZ2lzdHJ5SWQ+CiAgICA8cmRmOkJhZy8+CiAgIDwvaXB0Y0V4dDpSZWdpc3RyeUlkPgogICA8eG1wTU06SGlzdG9yeT4KICAgIDxyZGY6U2VxPgogICAgIDxyZGY6bGkKICAgICAgc3RFdnQ6YWN0aW9uPSJzYXZlZCIKICAgICAgc3RFdnQ6Y2hhbmdlZD0iLyIKICAgICAgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpjOTQ2M2MxMC05OWE4LTQ1NDQtYmRlOS1mNzY0ZjdhODJlZDkiCiAgICAgIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkdpbXAgMi4xMCAoV2luZG93cykiCiAgICAgIHN0RXZ0OndoZW49IjIwMjEtMDItMTRUMTM6MDU6MjkiLz4KICAgIDwvcmRmOlNlcT4KICAgPC94bXBNTTpIaXN0b3J5PgogICA8cGx1czpJbWFnZVN1cHBsaWVyPgogICAgPHJkZjpTZXEvPgogICA8L3BsdXM6SW1hZ2VTdXBwbGllcj4KICAgPHBsdXM6SW1hZ2VDcmVhdG9yPgogICAgPHJkZjpTZXEvPgogICA8L3BsdXM6SW1hZ2VDcmVhdG9yPgogICA8cGx1czpDb3B5cmlnaHRPd25lcj4KICAgIDxyZGY6U2VxLz4KICAgPC9wbHVzOkNvcHlyaWdodE93bmVyPgogICA8cGx1czpMaWNlbnNvcj4KICAgIDxyZGY6U2VxPgogICAgIDxyZGY6bGkKICAgICAgcGx1czpMaWNlbnNvclVSTD0iaHR0cHM6Ly93d3cuaXN0b2NrcGhvdG8uY29tL3Bob3RvL2xpY2Vuc2UtZ20xMTUwMzQ1MzQxLT91dG1fbWVkaXVtPW9yZ2FuaWMmYW1wO3V0bV9zb3VyY2U9Z29vZ2xlJmFtcDt1dG1fY2FtcGFpZ249aXB0Y3VybCIvPgogICAgPC9yZGY6U2VxPgogICA8L3BsdXM6TGljZW5zb3I+CiAgIDxkYzpjcmVhdG9yPgogICAgPHJkZjpTZXE+CiAgICAgPHJkZjpsaT5WbGFkeXNsYXYgU2VyZWRhPC9yZGY6bGk+CiAgICA8L3JkZjpTZXE+CiAgIDwvZGM6Y3JlYXRvcj4KICAgPGRjOmRlc2NyaXB0aW9uPgogICAgPHJkZjpBbHQ+CiAgICAgPHJkZjpsaSB4bWw6bGFuZz0ieC1kZWZhdWx0Ij5TZXJ2aWNlIHRvb2xzIGljb24gb24gd2hpdGUgYmFja2dyb3VuZC4gVmVjdG9yIGlsbHVzdHJhdGlvbi48L3JkZjpsaT4KICAgIDwvcmRmOkFsdD4KICAgPC9kYzpkZXNjcmlwdGlvbj4KICA8L3JkZjpEZXNjcmlwdGlvbj4KIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAKPD94cGFja2V0IGVuZD0idyI/PmWJCnkAAAAGYktHRAD/AP8A/6C9p5MAAAAJcEhZcwAALiMAAC4jAXilP3YAAAAHdElNRQflAg4LBR0CZnO/AAAARHRFWHRDb21tZW50AFNlcnZpY2UgdG9vbHMgaWNvbiBvbiB3aGl0ZSBiYWNrZ3JvdW5kLiBWZWN0b3IgaWxsdXN0cmF0aW9uLlwvEeIAAAMxSURBVHja7Z1bcuQwCEX7qrLQXlp2ynxNVWbK7dgWj3sl9JvYRhxACD369erW7UMzx/cYaychonAQvXM5ABYkpynoYIiEGdoQog6AYfywBrCxF4zNrX/7McBbuXJe8rXx/KBDULcGsMREzCbeZ4J6ME/9wVH5d95rogZp3npEgPLP3m2iUSGqXBJS5Dr6hmLm8kRuZABYti5TMaailV8LodNQwTTUWk4/WZk75l0kM0aZQdaZjMqkrQDAuyMVJWFjMB4GANXr0lbZBxQKr7IjI7QvVWkok/Jn5UHVh61CYPs+/i7eL9j3y/Au8WqoAIC34k8/9k7N8miLcaGWHwgjZXE/awyYX7h41wKMCskZM2HXAddDkTdglpSjz5bcKPbcCEKwT3+DhxtVpJvkEC7rZSgq32NMSBoXaCdiahDCKrND0fpX8oQlVsQ8IFQZ1VARdIF5wroekAjB07gsAgDUIbQHFENIDEX4CQANIVe8Iw/ASiACLXl28eaf579OPuBa9/mrELUYHQ1t3KHlZZnRcXb2/c7ygXIQZqjDMEzeSrOgCAhqYMvTUE+FKXoVxTxgk3DEPREjGzj3nAk/VaKyB9GVIu4oMyOlrQZgrBBEFG9PAZTfs3amYDGrP9Wl964IeFvtz9JFluIvlEvcdoXDOdxggbDxGwTXcxFRi/LdirKgZUBm7SUdJG69IwSUzAMWgOAq/4hyrZVaJISSNWHFVbEoCFEhyBrCtXS9L+so9oTy8wGqxbQDD350WTjNESVFEB5hdKzUGcV5QtYxVWR2Ssl4Mg9qI9u6FCBInJRXgfEEgtS9Cgrg7kKouq4mdcDNBnEHQvWFTdgdgsqP+MiluVeBM13ahx09AYSWi50gsF+I6vn7BmCEoHR3NBzkpIOw4+XdVBBGQUioblaZHbGlodtB+N/jxqwLX/x/NARfD8ADxTOCKIcwE4Lw0OIbguMYcGTlymEpHYLXIKx8zQEqIfS2lGJPaADFEBR/PMH79ErqtpnZmTBlvM4wgihPWDEEhXn1LISj50crNgfCp+dWHYQRCfb2zgfnBZmKGAyi914anK9Coi4LOMhoAn3uVtn+AGnLKxPUZnCuAAAAAElFTkSuQmCC';
    const img = Buffer.from(imgdata, 'base64');

    var favicon = (method, tokens, query, body) => {
        console.log('serving favicon...');
        const headers = {
            'Content-Type': 'image/png',
            'Content-Length': img.length
        };
        let result = img;

        return {
            headers,
            result
        };
    };

    var require$$0 = "<!DOCTYPE html>\r\n<html lang=\"en\">\r\n<head>\r\n    <meta charset=\"UTF-8\">\r\n    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\">\r\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\r\n    <title>SUPS Admin Panel</title>\r\n    <style>\r\n        * {\r\n            padding: 0;\r\n            margin: 0;\r\n        }\r\n\r\n        body {\r\n            padding: 32px;\r\n            font-size: 16px;\r\n        }\r\n\r\n        .layout::after {\r\n            content: '';\r\n            clear: both;\r\n            display: table;\r\n        }\r\n\r\n        .col {\r\n            display: block;\r\n            float: left;\r\n        }\r\n\r\n        p {\r\n            padding: 8px 16px;\r\n        }\r\n\r\n        table {\r\n            border-collapse: collapse;\r\n        }\r\n\r\n        caption {\r\n            font-size: 120%;\r\n            text-align: left;\r\n            padding: 4px 8px;\r\n            font-weight: bold;\r\n            background-color: #ddd;\r\n        }\r\n\r\n        table, tr, th, td {\r\n            border: 1px solid #ddd;\r\n        }\r\n\r\n        th, td {\r\n            padding: 4px 8px;\r\n        }\r\n\r\n        ul {\r\n            list-style: none;\r\n        }\r\n\r\n        .collection-list a {\r\n            display: block;\r\n            width: 120px;\r\n            padding: 4px 8px;\r\n            text-decoration: none;\r\n            color: black;\r\n            background-color: #ccc;\r\n        }\r\n        .collection-list a:hover {\r\n            background-color: #ddd;\r\n        }\r\n        .collection-list a:visited {\r\n            color: black;\r\n        }\r\n    </style>\r\n    <script type=\"module\">\nimport { html, render } from 'https://unpkg.com/lit-html@1.3.0?module';\nimport { until } from 'https://unpkg.com/lit-html@1.3.0/directives/until?module';\n\nconst api = {\r\n    async get(url) {\r\n        return json(url);\r\n    },\r\n    async post(url, body) {\r\n        return json(url, {\r\n            method: 'POST',\r\n            headers: { 'Content-Type': 'application/json' },\r\n            body: JSON.stringify(body)\r\n        });\r\n    }\r\n};\r\n\r\nasync function json(url, options) {\r\n    return await (await fetch('/' + url, options)).json();\r\n}\r\n\r\nasync function getCollections() {\r\n    return api.get('data');\r\n}\r\n\r\nasync function getRecords(collection) {\r\n    return api.get('data/' + collection);\r\n}\r\n\r\nasync function getThrottling() {\r\n    return api.get('util/throttle');\r\n}\r\n\r\nasync function setThrottling(throttle) {\r\n    return api.post('util', { throttle });\r\n}\n\nasync function collectionList(onSelect) {\r\n    const collections = await getCollections();\r\n\r\n    return html`\r\n    <ul class=\"collection-list\">\r\n        ${collections.map(collectionLi)}\r\n    </ul>`;\r\n\r\n    function collectionLi(name) {\r\n        return html`<li><a href=\"javascript:void(0)\" @click=${(ev) => onSelect(ev, name)}>${name}</a></li>`;\r\n    }\r\n}\n\nasync function recordTable(collectionName) {\r\n    const records = await getRecords(collectionName);\r\n    const layout = getLayout(records);\r\n\r\n    return html`\r\n    <table>\r\n        <caption>${collectionName}</caption>\r\n        <thead>\r\n            <tr>${layout.map(f => html`<th>${f}</th>`)}</tr>\r\n        </thead>\r\n        <tbody>\r\n            ${records.map(r => recordRow(r, layout))}\r\n        </tbody>\r\n    </table>`;\r\n}\r\n\r\nfunction getLayout(records) {\r\n    const result = new Set(['_id']);\r\n    records.forEach(r => Object.keys(r).forEach(k => result.add(k)));\r\n\r\n    return [...result.keys()];\r\n}\r\n\r\nfunction recordRow(record, layout) {\r\n    return html`\r\n    <tr>\r\n        ${layout.map(f => html`<td>${JSON.stringify(record[f]) || html`<span>(missing)</span>`}</td>`)}\r\n    </tr>`;\r\n}\n\nasync function throttlePanel(display) {\r\n    const active = await getThrottling();\r\n\r\n    return html`\r\n    <p>\r\n        Request throttling: </span>${active}</span>\r\n        <button @click=${(ev) => set(ev, true)}>Enable</button>\r\n        <button @click=${(ev) => set(ev, false)}>Disable</button>\r\n    </p>`;\r\n\r\n    async function set(ev, state) {\r\n        ev.target.disabled = true;\r\n        await setThrottling(state);\r\n        display();\r\n    }\r\n}\n\n//import page from '//unpkg.com/page/page.mjs';\r\n\r\n\r\nfunction start() {\r\n    const main = document.querySelector('main');\r\n    editor(main);\r\n}\r\n\r\nasync function editor(main) {\r\n    let list = html`<div class=\"col\">Loading&hellip;</div>`;\r\n    let viewer = html`<div class=\"col\">\r\n    <p>Select collection to view records</p>\r\n</div>`;\r\n    display();\r\n\r\n    list = html`<div class=\"col\">${await collectionList(onSelect)}</div>`;\r\n    display();\r\n\r\n    async function display() {\r\n        render(html`\r\n        <section class=\"layout\">\r\n            ${until(throttlePanel(display), html`<p>Loading</p>`)}\r\n        </section>\r\n        <section class=\"layout\">\r\n            ${list}\r\n            ${viewer}\r\n        </section>`, main);\r\n    }\r\n\r\n    async function onSelect(ev, name) {\r\n        ev.preventDefault();\r\n        viewer = html`<div class=\"col\">${await recordTable(name)}</div>`;\r\n        display();\r\n    }\r\n}\r\n\r\nstart();\n\n</script>\r\n</head>\r\n<body>\r\n    <main>\r\n        Loading&hellip;\r\n    </main>\r\n</body>\r\n</html>";

    const mode = process.argv[2] == '-dev' ? 'dev' : 'prod';

    const files = {
        index: mode == 'prod' ? require$$0 : fs__default['default'].readFileSync('./client/index.html', 'utf-8')
    };

    var admin = (method, tokens, query, body) => {
        const headers = {
            'Content-Type': 'text/html'
        };
        let result = '';

        const resource = tokens.join('/');
        if (resource && resource.split('.').pop() == 'js') {
            headers['Content-Type'] = 'application/javascript';

            files[resource] = files[resource] || fs__default['default'].readFileSync('./client/' + resource, 'utf-8');
            result = files[resource];
        } else {
            result = files.index;
        }

        return {
            headers,
            result
        };
    };

    /*
     * This service requires util plugin
     */

    const utilService = new Service_1();

    utilService.post('*', onRequest);
    utilService.get(':service', getStatus);

    function getStatus(context, tokens, query, body) {
        return context.util[context.params.service];
    }

    function onRequest(context, tokens, query, body) {
        Object.entries(body).forEach(([k,v]) => {
            console.log(`${k} ${v ? 'enabled' : 'disabled'}`);
            context.util[k] = v;
        });
        return '';
    }

    var util$1 = utilService.parseRequest;

    var services = {
        jsonstore,
        users,
        data: data$1,
        favicon,
        admin,
        util: util$1
    };

    const { uuid: uuid$2 } = util;


    function initPlugin(settings) {
        const storage = createInstance(settings.seedData);
        const protectedStorage = createInstance(settings.protectedData);

        return function decoreateContext(context, request) {
            context.storage = storage;
            context.protectedStorage = protectedStorage;
        };
    }


    /**
     * Create storage instance and populate with seed data
     * @param {Object=} seedData Associative array with data. Each property is an object with properties in format {key: value}
     */
    function createInstance(seedData = {}) {
        const collections = new Map();

        // Initialize seed data from file    
        for (let collectionName in seedData) {
            if (seedData.hasOwnProperty(collectionName)) {
                const collection = new Map();
                for (let recordId in seedData[collectionName]) {
                    if (seedData.hasOwnProperty(collectionName)) {
                        collection.set(recordId, seedData[collectionName][recordId]);
                    }
                }
                collections.set(collectionName, collection);
            }
        }


        // Manipulation

        /**
         * Get entry by ID or list of all entries from collection or list of all collections
         * @param {string=} collection Name of collection to access. Throws error if not found. If omitted, returns list of all collections.
         * @param {number|string=} id ID of requested entry. Throws error if not found. If omitted, returns of list all entries in collection.
         * @return {Object} Matching entry.
         */
        function get(collection, id) {
            if (!collection) {
                return [...collections.keys()];
            }
            if (!collections.has(collection)) {
                throw new ReferenceError('Collection does not exist: ' + collection);
            }
            const targetCollection = collections.get(collection);
            if (!id) {
                const entries = [...targetCollection.entries()];
                let result = entries.map(([k, v]) => {
                    return Object.assign(deepCopy(v), { _id: k });
                });
                return result;
            }
            if (!targetCollection.has(id)) {
                throw new ReferenceError('Entry does not exist: ' + id);
            }
            const entry = targetCollection.get(id);
            return Object.assign(deepCopy(entry), { _id: id });
        }

        /**
         * Add new entry to collection. ID will be auto-generated
         * @param {string} collection Name of collection to access. If the collection does not exist, it will be created.
         * @param {Object} data Value to store.
         * @return {Object} Original value with resulting ID under _id property.
         */
        function add(collection, data) {
            const record = assignClean({ _ownerId: data._ownerId }, data);

            let targetCollection = collections.get(collection);
            if (!targetCollection) {
                targetCollection = new Map();
                collections.set(collection, targetCollection);
            }
            let id = uuid$2();
            // Make sure new ID does not match existing value
            while (targetCollection.has(id)) {
                id = uuid$2();
            }

            record._createdOn = Date.now();
            targetCollection.set(id, record);
            return Object.assign(deepCopy(record), { _id: id });
        }

        /**
         * Replace entry by ID
         * @param {string} collection Name of collection to access. Throws error if not found.
         * @param {number|string} id ID of entry to update. Throws error if not found.
         * @param {Object} data Value to store. Record will be replaced!
         * @return {Object} Updated entry.
         */
        function set(collection, id, data) {
            if (!collections.has(collection)) {
                throw new ReferenceError('Collection does not exist: ' + collection);
            }
            const targetCollection = collections.get(collection);
            if (!targetCollection.has(id)) {
                throw new ReferenceError('Entry does not exist: ' + id);
            }

            const existing = targetCollection.get(id);
            const record = assignSystemProps(deepCopy(data), existing);
            record._updatedOn = Date.now();
            targetCollection.set(id, record);
            return Object.assign(deepCopy(record), { _id: id });
        }

        /**
         * Modify entry by ID
         * @param {string} collection Name of collection to access. Throws error if not found.
         * @param {number|string} id ID of entry to update. Throws error if not found.
         * @param {Object} data Value to store. Shallow merge will be performed!
         * @return {Object} Updated entry.
         */
         function merge(collection, id, data) {
            if (!collections.has(collection)) {
                throw new ReferenceError('Collection does not exist: ' + collection);
            }
            const targetCollection = collections.get(collection);
            if (!targetCollection.has(id)) {
                throw new ReferenceError('Entry does not exist: ' + id);
            }

            const existing = deepCopy(targetCollection.get(id));
            const record = assignClean(existing, data);
            record._updatedOn = Date.now();
            targetCollection.set(id, record);
            return Object.assign(deepCopy(record), { _id: id });
        }

        /**
         * Delete entry by ID
         * @param {string} collection Name of collection to access. Throws error if not found.
         * @param {number|string} id ID of entry to update. Throws error if not found.
         * @return {{_deletedOn: number}} Server time of deletion.
         */
        function del(collection, id) {
            if (!collections.has(collection)) {
                throw new ReferenceError('Collection does not exist: ' + collection);
            }
            const targetCollection = collections.get(collection);
            if (!targetCollection.has(id)) {
                throw new ReferenceError('Entry does not exist: ' + id);
            }
            targetCollection.delete(id);

            return { _deletedOn: Date.now() };
        }

        /**
         * Search in collection by query object
         * @param {string} collection Name of collection to access. Throws error if not found.
         * @param {Object} query Query object. Format {prop: value}.
         * @return {Object[]} Array of matching entries.
         */
        function query(collection, query) {
            if (!collections.has(collection)) {
                throw new ReferenceError('Collection does not exist: ' + collection);
            }
            const targetCollection = collections.get(collection);
            const result = [];
            // Iterate entries of target collection and compare each property with the given query
            for (let [key, entry] of [...targetCollection.entries()]) {
                let match = true;
                for (let prop in entry) {
                    if (query.hasOwnProperty(prop)) {
                        const targetValue = query[prop];
                        // Perform lowercase search, if value is string
                        if (typeof targetValue === 'string' && typeof entry[prop] === 'string') {
                            if (targetValue.toLocaleLowerCase() !== entry[prop].toLocaleLowerCase()) {
                                match = false;
                                break;
                            }
                        } else if (targetValue != entry[prop]) {
                            match = false;
                            break;
                        }
                    }
                }

                if (match) {
                    result.push(Object.assign(deepCopy(entry), { _id: key }));
                }
            }

            return result;
        }

        return { get, add, set, merge, delete: del, query };
    }


    function assignSystemProps(target, entry, ...rest) {
        const whitelist = [
            '_id',
            '_createdOn',
            '_updatedOn',
            '_ownerId'
        ];
        for (let prop of whitelist) {
            if (entry.hasOwnProperty(prop)) {
                target[prop] = deepCopy(entry[prop]);
            }
        }
        if (rest.length > 0) {
            Object.assign(target, ...rest);
        }

        return target;
    }


    function assignClean(target, entry, ...rest) {
        const blacklist = [
            '_id',
            '_createdOn',
            '_updatedOn',
            '_ownerId'
        ];
        for (let key in entry) {
            if (blacklist.includes(key) == false) {
                target[key] = deepCopy(entry[key]);
            }
        }
        if (rest.length > 0) {
            Object.assign(target, ...rest);
        }

        return target;
    }

    function deepCopy(value) {
        if (Array.isArray(value)) {
            return value.map(deepCopy);
        } else if (typeof value == 'object') {
            return [...Object.entries(value)].reduce((p, [k, v]) => Object.assign(p, { [k]: deepCopy(v) }), {});
        } else {
            return value;
        }
    }

    var storage = initPlugin;

    const { ConflictError: ConflictError$1, CredentialError: CredentialError$1, RequestError: RequestError$2 } = errors;

    function initPlugin$1(settings) {
        const identity = settings.identity;

        return function decorateContext(context, request) {
            context.auth = {
                register,
                login,
                logout
            };

            const userToken = request.headers['x-authorization'];
            if (userToken !== undefined) {
                let user;
                const session = findSessionByToken(userToken);
                if (session !== undefined) {
                    const userData = context.protectedStorage.get('users', session.userId);
                    if (userData !== undefined) {
                        console.log('Authorized as ' + userData[identity]);
                        user = userData;
                    }
                }
                if (user !== undefined) {
                    context.user = user;
                } else {
                    throw new CredentialError$1('Invalid access token');
                }
            }

            function register(body) {
                if (body.hasOwnProperty(identity) === false ||
                    body.hasOwnProperty('password') === false ||
                    body[identity].length == 0 ||
                    body.password.length == 0) {
                    throw new RequestError$2('Missing fields');
                } else if (context.protectedStorage.query('users', { [identity]: body[identity] }).length !== 0) {
                    throw new ConflictError$1(`A user with the same ${identity} already exists`);
                } else {
                    const newUser = Object.assign({}, body, {
                        [identity]: body[identity],
                        hashedPassword: hash(body.password)
                    });
                    const result = context.protectedStorage.add('users', newUser);
                    delete result.hashedPassword;

                    const session = saveSession(result._id);
                    result.accessToken = session.accessToken;

                    return result;
                }
            }

            function login(body) {
                const targetUser = context.protectedStorage.query('users', { [identity]: body[identity] });
                if (targetUser.length == 1) {
                    if (hash(body.password) === targetUser[0].hashedPassword) {
                        const result = targetUser[0];
                        delete result.hashedPassword;

                        const session = saveSession(result._id);
                        result.accessToken = session.accessToken;

                        return result;
                    } else {
                        throw new CredentialError$1('Login or password don\'t match');
                    }
                } else {
                    throw new CredentialError$1('Login or password don\'t match');
                }
            }

            function logout() {
                if (context.user !== undefined) {
                    const session = findSessionByUserId(context.user._id);
                    if (session !== undefined) {
                        context.protectedStorage.delete('sessions', session._id);
                    }
                } else {
                    throw new CredentialError$1('User session does not exist');
                }
            }

            function saveSession(userId) {
                let session = context.protectedStorage.add('sessions', { userId });
                const accessToken = hash(session._id);
                session = context.protectedStorage.set('sessions', session._id, Object.assign({ accessToken }, session));
                return session;
            }

            function findSessionByToken(userToken) {
                return context.protectedStorage.query('sessions', { accessToken: userToken })[0];
            }

            function findSessionByUserId(userId) {
                return context.protectedStorage.query('sessions', { userId })[0];
            }
        };
    }


    const secret = 'This is not a production server';

    function hash(string) {
        const hash = crypto__default['default'].createHmac('sha256', secret);
        hash.update(string);
        return hash.digest('hex');
    }

    var auth = initPlugin$1;

    function initPlugin$2(settings) {
        const util = {
            throttle: false
        };

        return function decoreateContext(context, request) {
            context.util = util;
        };
    }

    var util$2 = initPlugin$2;

    /*
     * This plugin requires auth and storage plugins
     */

    const { RequestError: RequestError$3, ConflictError: ConflictError$2, CredentialError: CredentialError$2, AuthorizationError: AuthorizationError$2 } = errors;

    function initPlugin$3(settings) {
        const actions = {
            'GET': '.read',
            'POST': '.create',
            'PUT': '.update',
            'PATCH': '.update',
            'DELETE': '.delete'
        };
        const rules = Object.assign({
            '*': {
                '.create': ['User'],
                '.update': ['Owner'],
                '.delete': ['Owner']
            }
        }, settings.rules);

        return function decorateContext(context, request) {
            // special rules (evaluated at run-time)
            const get = (collectionName, id) => {
                return context.storage.get(collectionName, id);
            };
            const isOwner = (user, object) => {
                return user._id == object._ownerId;
            };
            context.rules = {
                get,
                isOwner
            };
            const isAdmin = request.headers.hasOwnProperty('x-admin');

            context.canAccess = canAccess;

            function canAccess(data, newData) {
                const user = context.user;
                const action = actions[request.method];
                let { rule, propRules } = getRule(action, context.params.collection, data);

                if (Array.isArray(rule)) {
                    rule = checkRoles(rule, data);
                } else if (typeof rule == 'string') {
                    rule = !!(eval(rule));
                }
                if (!rule && !isAdmin) {
                    throw new CredentialError$2();
                }
                propRules.map(r => applyPropRule(action, r, user, data, newData));
            }

            function applyPropRule(action, [prop, rule], user, data, newData) {
                // NOTE: user needs to be in scope for eval to work on certain rules
                if (typeof rule == 'string') {
                    rule = !!eval(rule);
                }

                if (rule == false) {
                    if (action == '.create' || action == '.update') {
                        delete newData[prop];
                    } else if (action == '.read') {
                        delete data[prop];
                    }
                }
            }

            function checkRoles(roles, data, newData) {
                if (roles.includes('Guest')) {
                    return true;
                } else if (!context.user && !isAdmin) {
                    throw new AuthorizationError$2();
                } else if (roles.includes('User')) {
                    return true;
                } else if (context.user && roles.includes('Owner')) {
                    return context.user._id == data._ownerId;
                } else {
                    return false;
                }
            }
        };



        function getRule(action, collection, data = {}) {
            let currentRule = ruleOrDefault(true, rules['*'][action]);
            let propRules = [];

            // Top-level rules for the collection
            const collectionRules = rules[collection];
            if (collectionRules !== undefined) {
                // Top-level rule for the specific action for the collection
                currentRule = ruleOrDefault(currentRule, collectionRules[action]);

                // Prop rules
                const allPropRules = collectionRules['*'];
                if (allPropRules !== undefined) {
                    propRules = ruleOrDefault(propRules, getPropRule(allPropRules, action));
                }

                // Rules by record id 
                const recordRules = collectionRules[data._id];
                if (recordRules !== undefined) {
                    currentRule = ruleOrDefault(currentRule, recordRules[action]);
                    propRules = ruleOrDefault(propRules, getPropRule(recordRules, action));
                }
            }

            return {
                rule: currentRule,
                propRules
            };
        }

        function ruleOrDefault(current, rule) {
            return (rule === undefined || rule.length === 0) ? current : rule;
        }

        function getPropRule(record, action) {
            const props = Object
                .entries(record)
                .filter(([k]) => k[0] != '.')
                .filter(([k, v]) => v.hasOwnProperty(action))
                .map(([k, v]) => [k, v[action]]);

            return props;
        }
    }

    var rules = initPlugin$3;

    var identity = "email";
    var protectedData = {
    	users: {
    		"60f0cf0b-34b0-4abd-9769-8c42f830dffc": {
    			email: "admin@abv.bg",
    			username: "Admin",
                role: "Admin",
    			hashedPassword: "fac7060c3e17e6f151f247eacb2cd5ae80b8c36aedb8764e18a41bbdc16aa302"
    		}
    	},
    	sessions: {
    	}
    };
    var seedData = {
        products: {
            // FRUITS - 18 products
            "f0001": {
                _id: "f0001",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Red Apples",
                imageUrl: "https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743532206063_apple.png?alt=media&token=ce58746e-8cae-4326-a7e3-872dd6d2980a",
                price: 3.99,
                pricePerKg: 7.98,
                weight: 0.5,
                origin: "Bulgaria",
                category: "fruits",
                stock: 45,
                featured: true,
                description: "Fresh and crisp red apples from local Bulgarian farms. Rich in flavor and perfect for snacking or baking."
            },
            "f0002": {
                _id: "f0002",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Bananas",
                price: 2.49,
                pricePerKg: 4.98,
                imageUrl: "https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743609768249_banana.jpeg?alt=media&token=497cea37-d186-49cd-94f4-2e26fbab5e9c",
                weight: 0.5,
                origin: "Ecuador",
                category: "fruits",
                stock: 60,
                featured: true,
                description: "Sweet and nutritious bananas, perfect for smoothies, baking, or a quick healthy snack."
            },
            "f0003": {
                _id: "f0003",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Oranges",
                price: 4.29,
                pricePerKg: 8.58,
                weight: 0.5,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743615935751_orange.jpg?alt=media&token=e865c390-7765-4208-9e7a-b91b11fc4973',
                origin: "Spain",
                category: "fruits",
                stock: 35,
                featured: false,
                description: "Juicy and tangy oranges packed with vitamin C. Great for juicing or eating fresh."
            },
            "f0004": {
                _id: "f0004",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Strawberries",
                price: 5.99,
                pricePerKg: 17.11,
                weight: 0.35,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743616964518_strawberries.jpg?alt=media&token=d7fa3073-8f94-4843-bb69-3d2c296f3fac',
                origin: "Bulgaria",
                category: "fruits",
                stock: 25,
                featured: true,
                description: "Sweet and aromatic strawberries. Locally grown and harvested at peak ripeness."
            },
            "f0005": {
                _id: "f0005",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Grapes",
                price: 4.49,
                pricePerKg: 8.98,
                weight: 0.5,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743614442937_grapes.jpeg?alt=media&token=c2dd4018-ad83-484b-b034-b678dae1b0c0',
                origin: "Italy",
                category: "fruits",
                stock: 30,
                featured: false,
                description: "Seedless green grapes with a perfect balance of sweetness and tartness."
            },
            "f0006": {
                _id: "f0006",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Blueberries",
                price: 6.99,
                pricePerKg: 23.30,
                weight: 0.3,
                imageUrl: "https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743610084653_blubbery.jpeg?alt=media&token=1a585c91-ce25-44a9-a6e3-50c86f6e3c93",
                origin: "Poland",
                category: "fruits",
                stock: 20,
                featured: true,
                description: "Plump and juicy blueberries, loaded with antioxidants and natural sweetness."
            },
            "f0007": {
                _id: "f0007",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Pineapple",
                price: 5.49,
                pricePerKg: 5.49,
                weight: 1,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743617577995_pineapple.jpeg?alt=media&token=562d1684-80dd-4b02-9170-9835505a2760',
                origin: "Costa Rica",
                category: "fruits",
                stock: 15,
                featured: false,
                description: "Tropical and sweet pineapple. Perfect for desserts, fruit salads, or grilling."
            },
            "f0008": {
                _id: "f0008",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Watermelon",
                price: 7.99,
                pricePerKg: 2.66,
                weight: 3,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743617283002_watermelon.avif?alt=media&token=66816b7d-a34b-4172-ba02-b38c1814908d',
                origin: "Greece",
                category: "fruits",
                stock: 10,
                featured: true,
                description: "Sweet and refreshing watermelon, perfect for hot summer days. Sold as a quarter melon."
            },
            "f0009": {
                _id: "f0009",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Kiwi",
                price: 3.99,
                pricePerKg: 13.30,
                weight: 0.3,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743614921914_kiwi.webp?alt=media&token=4ca9fd49-dfd9-47ef-af5e-e3d27d8bbf03',
                origin: "New Zealand",
                category: "fruits",
                stock: 40,
                featured: false,
                description: "Tangy and sweet kiwi fruit loaded with vitamin C and dietary fiber."
            },
            "f0010": {
                _id: "f0010",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Peaches",
                price: 4.79,
                pricePerKg: 9.58,
                weight: 0.5,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743615963824_peaches.webp?alt=media&token=e58e7532-5995-4d93-8c49-26da07cd7a87',
                origin: "Bulgaria",
                category: "fruits",
                stock: 25,
                featured: false,
                description: "Juicy and fragrant peaches from local farms. Perfect for fresh eating or desserts."
            },
            "f0011": {
                _id: "f0011",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Mangoes",
                price: 6.49,
                pricePerKg: 12.98,
                weight: 0.5,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743615689833_Mangojuice.webp?alt=media&token=cf6db1f3-f037-4a48-96b7-7bcc8c1a17ab',
                origin: "Brazil",
                category: "fruits",
                stock: 20,
                featured: true,
                description: "Sweet and tropical mangoes with a rich, creamy texture and exotic flavor."
            },
            "f0012": {
                _id: "f0012",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Lemons",
                price: 3.49,
                pricePerKg: 11.63,
                weight: 0.3,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743615135236_lemons.jpg?alt=media&token=279125d2-dc5f-4b26-8112-ecd12e5ae598',
                origin: "Italy",
                category: "fruits",
                stock: 45,
                featured: false,
                description: "Bright and tangy lemons, perfect for cooking, baking, or making refreshing beverages."
            },
            "f0013": {
                _id: "f0013",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Pears",
                price: 4.29,
                pricePerKg: 8.58,
                weight: 0.5,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743616382916_pears.png?alt=media&token=37960d1b-51cf-4da0-a914-2cfd5ecbfcd2',
                origin: "Belgium",
                category: "fruits",
                stock: 35,
                featured: false,
                description: "Sweet and juicy pears with a soft, buttery texture. Great for snacking or desserts."
            },
            "f0014": {
                _id: "f0014",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Raspberries",
                price: 6.99,
                pricePerKg: 34.95,
                weight: 0.2,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743616570664_raspberries.jpg?alt=media&token=b7feb271-39e7-4854-bc7d-9982cab7cfd2',
                origin: "Poland",
                category: "fruits",
                stock: 15,
                featured: true,
                description: "Delicate and sweet raspberries with a slight tartness. Perfect for desserts or enjoying fresh."
            },
            "f0015": {
                _id: "f0015",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Cherries",
                price: 7.99,
                pricePerKg: 15.98,
                weight: 0.5,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743613235920_fruits_cherry_500x500.webp?alt=media&token=0db9d4a6-9920-4cac-b534-be0f35ce3d34',
                origin: "Bulgaria",
                category: "fruits",
                stock: 20,
                featured: true,
                description: "Plump and sweet cherries with deep red color. A seasonal delight."
            },
            "f0016": {
                _id: "f0016",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Avocados",
                price: 5.99,
                pricePerKg: 11.98,
                imageUrl: "https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743609693763_avocados.jpeg?alt=media&token=13df15d7-52e9-4908-a449-8d7ab7e733e5",
                weight: 0.5,
                origin: "Mexico",
                category: "fruits",
                stock: 30,
                featured: false,
                description: "Creamy and nutritious avocados, perfect for toast, salads, or guacamole."
            },
            "f0017": {
                _id: "f0017",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Plums",
                price: 4.49,
                pricePerKg: 8.98,
                weight: 0.5,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743616500408_plums.jpg?alt=media&token=71c18fd8-2eaf-4d7e-9e7b-016840b51228',
                origin: "Bulgaria",
                category: "fruits",
                stock: 25,
                featured: false,
                description: "Sweet and juicy plums with a hint of tartness. Great for snacking or baking."
            },
            "f0018": {
                _id: "f0018",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Dragon Fruit",
                price: 8.99,
                pricePerKg: 17.98,
                weight: 0.5,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743614236879_dragonfruit.jpg?alt=media&token=98b8ff15-35a5-4f72-a3c6-8b689142e172',
                origin: "Vietnam",
                category: "fruits",
                stock: 10,
                featured: true,
                description: "Exotic dragon fruit with mildly sweet flavor and striking appearance. Rich in antioxidants."
            },

            // VEGETABLES - 18 products
            "v0001": {
                _id: "v0001",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Tomatoes",
                price: 3.49,
                pricePerKg: 6.98,
                weight: 0.5,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743617233709_tomato.jpg?alt=media&token=dd673ba7-af09-4f31-b19d-0b5bd1a198c8',
                origin: "Bulgaria",
                category: "vegetables",
                stock: 50,
                featured: true,
                description: "Ripe and juicy tomatoes, locally grown and perfect for salads, sandwiches, or cooking."
            },
            "v0002": {
                _id: "v0002",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Cucumbers",
                price: 2.99,
                pricePerKg: 5.98,
                weight: 0.5,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743613891643_freshpoint_english_cucumber_scaled.jpg?alt=media&token=6460817e-e367-4555-a212-e38cd16204be',
                origin: "Bulgaria",
                category: "vegetables",
                stock: 45,
                featured: false,
                description: "Fresh and crisp cucumbers. Great for salads, tzatziki, or as a refreshing snack."
            },
            "v0003": {
                _id: "v0003",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Bell Peppers",
                price: 4.29,
                pricePerKg: 8.58,
                weight: 0.5,
                imageUrl: "https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743609991442_bell_pepper.jpeg?alt=media&token=da1ee3bf-98da-42f1-a0ac-9d1a93bee99a",
                origin: "Spain",
                category: "vegetables",
                stock: 35,
                featured: true,
                description: "Colorful bell peppers with sweet flavor. Perfect for stir-fries, salads, or stuffing."
            },
            "v0004": {
                _id: "v0004",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Carrots",
                price: 2.79,
                pricePerKg: 5.58,
                weight: 0.5,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743611373682_carrots.jpg?alt=media&token=13b81d78-d303-49ed-9307-ab49e566192a',
                origin: "Netherlands",
                category: "vegetables",
                stock: 60,
                featured: false,
                description: "Sweet and crunchy carrots, excellent for snacking, cooking, or juicing."
            },
            "v0005": {
                _id: "v0005",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Broccoli",
                price: 3.99,
                pricePerKg: 7.98,
                weight: 0.5,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743610815144_Green_Broccoli_Transparent_Images_PNG.png?alt=media&token=16f019b0-ee4b-41de-befb-2108bd7e9a74',
                origin: "Italy",
                category: "vegetables",
                stock: 30,
                featured: true,
                description: "Nutritious broccoli florets, perfect for steaming, stir-frying, or roasting."
            },
            "v0006": {
                _id: "v0006",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Zucchini",
                price: 3.49,
                pricePerKg: 6.98,
                weight: 0.5,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743617319527_zuccini.jpeg?alt=media&token=faca64f3-96ea-4c47-8b0a-2cfe8752b4d8',
                origin: "Bulgaria",
                category: "vegetables",
                stock: 40,
                featured: false,
                description: "Tender and versatile zucchini. Great for grilling, sautéing, or making zoodles."
            },
            "v0007": {
                _id: "v0007",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Potatoes",
                price: 2.99,
                pricePerKg: 2.99,
                weight: 1,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743616539428_potatoes.webp?alt=media&token=d053f246-eadd-4dfa-b19e-6af54c433ea9',
                origin: "Bulgaria",
                category: "vegetables",
                stock: 70,
                featured: true,
                description: "Versatile potatoes ideal for roasting, mashing, or frying. A kitchen staple."
            },
            "v0008": {
                _id: "v0008",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Onions",
                price: 2.49,
                pricePerKg: 2.49,
                weight: 1,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743615866558_onion.jpeg?alt=media&token=ba225e90-07ec-43d4-910c-08dad7b7f7a1',
                origin: "Bulgaria",
                category: "vegetables",
                stock: 65,
                featured: false,
                description: "Yellow onions with balanced flavor. Essential for countless recipes."
            },
            "v0009": {
                _id: "v0009",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Spinach",
                price: 3.79,
                pricePerKg: 12.63,
                weight: 0.3,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743616918116_spinach.jpg?alt=media&token=1a16880e-c19d-40f3-9088-d67d902559da',
                origin: "Bulgaria",
                category: "vegetables",
                stock: 25,
                featured: true,
                description: "Fresh and tender spinach leaves. Packed with nutrients and perfect for salads or cooking."
            },
            "v0010": {
                _id: "v0010",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Mushrooms",
                price: 4.49,
                pricePerKg: 14.97,
                weight: 0.3,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743615834436_mushrooms.jpg?alt=media&token=e0b0f135-6c51-4580-9dea-53aacdb580a4',
                origin: "Poland",
                category: "vegetables",
                stock: 35,
                featured: false,
                description: "Fresh button mushrooms with earthy flavor. Great for salads, stir-fries, or soups."
            },
            "v0011": {
                _id: "v0011",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Eggplant",
                price: 3.99,
                pricePerKg: 7.98,
                weight: 0.5,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743614288996_eggplant.webp?alt=media&token=1e94c70d-0c9c-45e0-af2d-7c13f23f276b',
                origin: "Turkey",
                category: "vegetables",
                stock: 20,
                featured: false,
                description: "Glossy purple eggplants, perfect for roasting, grilling, or making baba ganoush."
            },
            "v0012": {  
                _id: "v0012",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Cauliflower",
                price: 4.29,
                pricePerKg: 8.58,
                weight: 0.5,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743611424322_Amazing_Iso_21.webp?alt=media&token=0bd6267f-eb01-4d54-ac16-b19df7e5ad45',
                origin: "France",
                category: "vegetables",
                stock: 25,
                featured: true,
                description: "Fresh cauliflower, versatile for roasting, steaming, or making cauliflower rice."
            },
            "v0013": {
                _id: "v0013",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Red Cabbage",
                price: 2.99,
                pricePerKg: 2.99,
                weight: 1,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743616890613_redcabbage.jpeg?alt=media&token=6c7ca827-8c1d-443f-b950-7401075c6be8',
                origin: "Bulgaria",
                category: "vegetables",
                stock: 40,
                featured: false,
                description: "Vibrant red cabbage, perfect for slaws, salads, or pickling."
            },
            "v0014": {
                _id: "v0014",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Sweet Corn",
                price: 4.99,
                pricePerKg: 9.98,
                weight: 0.5,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743617103166_sweetcorn.jpg?alt=media&token=2ad4a2af-99eb-4821-8cf7-cf04a8d1ab9f',
                origin: "Bulgaria",
                category: "vegetables",
                stock: 30,
                featured: true,
                description: "Sweet and juicy corn on the cob. Perfect for grilling, boiling, or roasting."
            },
            "v0015": { 
                _id: "v0015",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Asparagus",
                price: 6.99,
                pricePerKg: 13.98,
                imageUrl: "https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743609604877_asparagus.jpeg?alt=media&token=3b1f90db-67f5-4887-b3de-b3d40843c920",
                weight: 0.5,
                origin: "Peru",
                category: "vegetables",
                stock: 15,
                featured: true,
                description: "Tender asparagus spears, delicious roasted, grilled, or steamed."
            },
            "v0016": {
                _id: "v0016",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Brussels Sprouts",
                price: 4.49,
                pricePerKg: 8.98,
                weight: 0.5,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743611084417_Brussels_sprouts.jpg?alt=media&token=cfd02577-e108-4802-914c-6be9645de738',
                origin: "Belgium",
                category: "vegetables",
                stock: 20,
                featured: false,
                description: "Nutrient-rich Brussels sprouts, perfect for roasting with a bit of olive oil and salt."
            },
            "v0017": { 
                _id: "v0017",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Garlic",
                price: 2.99,
                pricePerKg: 19.93,
                weight: 0.15,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743614357717_garlic.webp?alt=media&token=9c4c6ffe-be83-4fbd-8edc-fb7d1ccaa516',
                origin: "Bulgaria",
                category: "vegetables",
                stock: 50,
                featured: false,
                description: "Aromatic garlic bulbs, essential for countless recipes and rich in health benefits."
            },
            "v0018": {
                _id: "v0018",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Artichokes",
                price: 5.99,
                pricePerKg: 11.98,
                imageUrl: "https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743609493029_artichoke.jpeg?alt=media&token=d4982b5c-495a-4f6f-95ce-6b707ec9ec2d",
                weight: 0.5,
                origin: "Italy",
                category: "vegetables",
                stock: 15,
                featured: true,
                description: "Tender artichokes with rich, earthy flavor. Perfect steamed or stuffed."
            },
            
            // JUICES - 18 products
            "j0001": {
                _id: "j0001",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Fresh Orange Juice",
                price: 5.99,
                pricePerKg: 11.98,
                weight: 0.5,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743614329838_orangejuice.webp?alt=media&token=a0e71454-6968-4b54-9b3d-409bceeaeb5c',
                origin: "Bulgaria",
                category: "juices",
                stock: 25,
                featured: true,
                description: "Freshly squeezed orange juice, 100% natural with no added sugar or preservatives."
            },
            "j0002": {  
                _id: "j0002",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Apple Juice",
                price: 4.99,
                pricePerKg: 9.98,
                imageUrl: "https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743609217405_apple_juice.jpeg?alt=media&token=c73ba7ac-c363-4643-9883-73ac4f754018",
                weight: 0.5,
                origin: "Bulgaria",
                category: "juices",
                stock: 30,
                featured: false,
                description: "Cold-pressed apple juice made from local Bulgarian apples. Naturally sweet and refreshing."
            },
            "j0003": {
                _id: "j0003",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Carrot Juice",
                price: 5.49,
                pricePerKg: 10.98,
                weight: 0.5,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743611353664_glass_carrot_juice_slices_fresh_carrot_isolated_white_background_124717_610.avif?alt=media&token=9be3def0-d083-4f99-9267-87014ab7a2cc',
                origin: "Bulgaria",
                category: "juices",
                stock: 20,
                featured: true,
                description: "Fresh carrot juice packed with vitamins and nutrients. A healthy daily boost."
            },
            "j0004": {
                _id: "j0004",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Mixed Berry Juice",
                price: 6.99,
                pricePerKg: 13.98,
                weight: 0.5,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743615769899_mixedberryjuice.avif?alt=media&token=a7351284-45dc-497a-9505-b0267b6e3d8e',
                origin: "Bulgaria",
                category: "juices",
                stock: 15,
                featured: true,
                description: "A delicious blend of strawberries, blueberries, and raspberries. Rich in antioxidants."
            },
            "j0005": {
                _id: "j0005",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Pomegranate Juice",
                price: 7.49,
                pricePerKg: 14.98,
                weight: 0.5,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743616519070_pomegranatejuice.avif?alt=media&token=a9be8c50-8226-4508-aa65-1759002d9999',
                origin: "Bulgaria",
                category: "juices",
                stock: 20,
                featured: true,
                description: "Freshly pressed pomegranate juice, loaded with antioxidants and refreshing taste."
            },
            "j0006": {
                _id: "j0006",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Grapefruit Juice",
                price: 5.99,
                pricePerKg: 11.98,
                weight: 0.5,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743614399856_grapejuice.jpg?alt=media&token=9532e945-65b2-446f-8da1-90a6a25f1e1c',
                origin: "Bulgaria",
                category: "juices",
                stock: 25,
                featured: false,
                description: "Tangy and refreshing grapefruit juice, a perfect start to your morning."
            },
            "j0007": {  
                _id: "j0007",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Watermelon Juice",
                price: 5.49,
                pricePerKg: 10.98,
                weight: 0.5,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743617301393_watermelonjuice.jpg?alt=media&token=5e105b8f-b880-49d2-ad78-3750d74285e5',
                origin: "Bulgaria",
                category: "juices",
                stock: 15,
                featured: true,
                description: "Sweet and refreshing watermelon juice, perfect for hot summer days."
            },
            "j0008": { 
                _id: "j0008",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Pineapple Juice",
                price: 6.49,
                pricePerKg: 12.98,
                weight: 0.5,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743617560648_pineapplejuice.jpg?alt=media&token=b9b65cec-ccee-4a6b-a1b3-d28ecf680d84',
                origin: "Bulgaria",
                category: "juices",
                stock: 20,
                featured: false,
                description: "Tropical pineapple juice, naturally sweet and packed with enzymes."
            },
            "j0009": { 
                _id: "j0009",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Green Detox Juice",
                price: 7.99,
                pricePerKg: 15.98,
                weight: 0.5,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743614754304_greendetoxjuice.webp?alt=media&token=beac22d6-0930-45d1-b1f7-52114ea17c81',
                origin: "Bulgaria",
                category: "juices",
                stock: 15,
                featured: true,
                description: "A nutritious blend of spinach, cucumber, celery, and apple. Perfect for cleansing."
            },
            "j0010": { 
                _id: "j0010",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Beetroot Juice",
                price: 5.99,
                pricePerKg: 11.98,
                weight: 0.5,
                imageUrl: "https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743609884390_beetroor.jpeg?alt=media&token=1612a3ae-4032-412f-b4c2-53767c31242c",
                origin: "Bulgaria",
                category: "juices",
                stock: 20,
                featured: false,
                description: "Earthy and sweet beetroot juice, great for boosting stamina and blood health."
            },
            "j0011": { 
                _id: "j0011",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Mango Juice",
                price: 6.99,
                pricePerKg: 13.98,
                weight: 0.5,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743617795132_mangojuice.avif?alt=media&token=1f36a115-a5fc-43fa-aa42-3e360f0b60b2',
                origin: "Bulgaria",
                category: "juices",
                stock: 20,
                featured: true,
                description: "Tropical mango juice, thick and sweet with rich exotic flavor."
            },
            "j0012": { 
                _id: "j0012",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Celery Juice",
                price: 5.49,
                pricePerKg: 10.98,
                weight: 0.5,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743611528725_Soberish_Easy_Being_Green_Juice2.webp?alt=media&token=14218845-6829-4a66-a398-1ac36fa8ceba',
                origin: "Bulgaria",
                category: "juices",
                stock: 15,
                featured: false,
                description: "Fresh celery juice, light and hydrating with subtle earthy flavor."
            },
            "j0013": { 
                _id: "j0013",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Lemonade",
                price: 4.99,
                pricePerKg: 9.98,
                weight: 0.5,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743615111787_lemonade.jpeg?alt=media&token=2f7273bb-ddca-49e2-805b-9976e9b6422d',
                origin: "Bulgaria",
                category: "juices",
                stock: 30,
                featured: true,
                description: "Classic homemade lemonade, perfectly balanced between sweet and tart."
            },
            "j0014": { 
                _id: "j0014",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Kiwi & Cucumber Juice",
                price: 6.49,
                pricePerKg: 12.98,
                weight: 0.5,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743617863024_kiwicucumber.jpg?alt=media&token=3d61538d-a70a-4d61-987d-fb8e818e2016',
                origin: "Bulgaria",
                category: "juices",
                stock: 15,
                featured: false,
                description: "Refreshing blend of kiwi and cucumber. Light, hydrating, and cleansing."
            },
            "j0015": { 
                _id: "j0015",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Orange & Carrot Juice",
                price: 5.99,
                pricePerKg: 11.98,
                weight: 0.5,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743615888841_orangecarrotjuice.jpg?alt=media&token=bfe0ef50-40bb-4f21-a47c-f0fb56e5c1b5',
                origin: "Bulgaria",
                category: "juices",
                stock: 25,
                featured: true,
                description: "Vibrant blend of orange and carrot, packed with vitamins A and C."
            },
            "j0016": { 
                _id: "j0016",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Cherry Juice",
                price: 7.49,
                pricePerKg: 14.98,
                weight: 0.5,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743613491458_tart_cherry_juice_2023_12_05_191014_tdxm.png?alt=media&token=11ea6959-b8cc-4414-a983-7cfd3ec0d13f',
                origin: "Bulgaria",
                category: "juices",
                stock: 20,
                featured: false,
                description: "Tart cherry juice with potential anti-inflammatory properties. Great for recovery."
            },
            "j0017": { 
                _id: "j0017",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Strawberry & Banana Smoothie",
                price: 6.99,
                pricePerKg: 13.98,
                weight: 0.5,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743617042173_strawberrybananasmoothie.jpg?alt=media&token=d232bfb3-a7a6-4329-9804-198e978729d8',
                origin: "Bulgaria",
                category: "juices",
                stock: 20,
                featured: true,
                description: "Creamy smoothie made with fresh strawberries and bananas. A classic combination."
            },
            "j0018": { 
                _id: "j0018",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Pear & Ginger Juice",
                price: 6.49,
                pricePerKg: 12.98,
                weight: 0.5,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743616352152_pearginger.webp?alt=media&token=2b2fba99-9584-4a8e-88ac-2fa19581e69a',
                origin: "Bulgaria",
                category: "juices",
                stock: 15,
                featured: true,
                description: "Sweet pear juice with a hint of spicy ginger. Soothing and warming."
            },
            
            // NUTS - 18 products
            "n0001": { 
                _id: "n0001",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Almonds",
                price: 8.99,
                pricePerKg: 17.98,
                weight: 0.5,
                imageUrl: "https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743609106925_almonds.jpeg?alt=media&token=5fc559be-834f-40ac-bcaa-3a6e4f09a058",
                origin: "USA",
                category: "nuts",
                stock: 40,
                featured: true,
                description: "Premium raw almonds, packed with protein and healthy fats. Perfect for snacking."
            },
            "n0002": {  
                _id: "n0002",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Walnuts",
                price: 9.49,
                pricePerKg: 18.98,
                weight: 0.5,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743617267947_walnuts.jpg?alt=media&token=45bd8562-c50d-4597-8670-f538d599c554',
                origin: "Bulgaria",
                category: "nuts",
                stock: 35,
                featured: true,
                description: "Locally grown walnuts with rich buttery flavor. Great for baking or snacking."
            },
            "n0003": { 
                _id: "n0003",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Cashews",
                price: 10.99,
                pricePerKg: 21.98,
                weight: 0.5,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743611403914_cashews_45c2c30.jpg?alt=media&token=edc90b6c-3870-4a8b-ad4d-e53d72eaccbb',
                origin: "Vietnam",
                category: "nuts",
                stock: 30,
                featured: false,
                description: "Creamy and slightly sweet cashews, great for snacking or adding to stir-fries."
            },
            "n0004": { 
                _id: "n0004",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Pistachios",
                price: 11.99,
                pricePerKg: 23.98,
                weight: 0.5,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743616481930_pistachio.webp?alt=media&token=d4da91a3-09a9-4c45-974b-bcb84557404e',
                origin: "Turkey",
                category: "nuts",
                stock: 25,
                featured: true,
                description: "Roasted and salted pistachios. A delicious and nutrient-rich snack."
            },
            "n0005": {  
                _id: "n0005",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Hazelnuts",
                price: 9.99,
                pricePerKg: 19.98,
                weight: 0.5,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743614788431_hazelnut.jpg?alt=media&token=ae79203a-d257-408c-829e-7332447ea4bc',
                origin: "Turkey",
                category: "nuts",
                stock: 30,
                featured: false,
                description: "Premium hazelnuts with rich flavor. Perfect for baking or eating as is."
            },
            "n0006": { 
                _id: "n0006",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Brazil Nuts",
                price: 12.49,
                pricePerKg: 24.98,
                weight: 0.5,
                imageUrl: "https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743610230367_brasil_nut.jpg?alt=media&token=3cc9d1f2-bbf7-45a6-be0f-44b30a90063c",
                origin: "Bolivia",
                category: "nuts",
                stock: 20,
                featured: false,
                description: "Large, creamy Brazil nuts, rich in selenium and healthy fats."
            },
            "n0007": { 
                _id: "n0007",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Pecans",
                price: 11.49,
                pricePerKg: 22.98,
                weight: 0.5,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743616401505_pecans.jpg?alt=media&token=7f83d810-2699-462d-9d50-fe9c118604d1',
                origin: "USA",
                category: "nuts",
                stock: 25,
                featured: true,
                description: "Buttery and rich pecans, perfect for baking or adding to salads."
            },
            "n0008": {  
                _id: "n0008",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Pine Nuts",
                price: 14.99,
                pricePerKg: 29.98,
                weight: 0.5,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743617645889_pinenuts.jpeg?alt=media&token=e0201b29-c892-42b0-8098-e4ba72358545',
                origin: "China",
                category: "nuts",
                stock: 15,
                featured: false,
                description: "Delicate pine nuts with unique flavor, perfect for pesto or topping salads."
            },
            "n0009": { 
                _id: "n0009",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Macadamia Nuts",
                price: 15.99,
                pricePerKg: 31.98,
                weight: 0.5,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743615669399_macadamia_nuts.jpg?alt=media&token=7a4d7599-95fc-47fa-832a-bf6fe68633f0',
                origin: "Australia",
                category: "nuts",
                stock: 20,
                featured: true,
                description: "Creamy and buttery macadamia nuts, a luxurious and indulgent treat."
            },
            "n0010": {  
                _id: "n0010",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Mixed Nuts",
                price: 10.99,
                pricePerKg: 21.98,
                weight: 0.5,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743615804819_mixed_nuts.jpg?alt=media&token=35df21a2-22d4-4e2b-bea3-efbdd554df8f',
                origin: "Various",
                category: "nuts",
                stock: 35,
                featured: true,
                description: "A premium blend of almonds, cashews, walnuts, and hazelnuts. The perfect snack mix."
            },
            "n0011": {  
                _id: "n0011",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Peanuts",
                price: 6.99,
                pricePerKg: 13.98,
                weight: 0.5,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743616318181_peanuts.jpg?alt=media&token=b0c40dd9-7782-4837-8788-cefadfdf1d14',
                origin: "Argentina",
                category: "nuts",
                stock: 50,
                featured: false,
                description: "Roasted and lightly salted peanuts. A classic and affordable protein-rich snack."
            },
            "n0012": {  
                _id: "n0012",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Pumpkin Seeds",
                price: 7.99,
                pricePerKg: 15.98,
                weight: 0.5,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743617446552_pumpkingseeds.jpg?alt=media&token=24db4083-089e-456c-8ff1-517a9ba769fd',
                origin: "Bulgaria",
                category: "nuts",
                stock: 40,
                featured: true,
                description: "Crunchy roasted pumpkin seeds, rich in zinc and magnesium. Great for snacking."
            },
            "n0013": {  
                _id: "n0013",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Sunflower Seeds",
                price: 6.49,
                pricePerKg: 12.98,
                weight: 0.5,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743617078837_sunflowerseed.jpg?alt=media&token=5c2044c7-c029-4f9f-8cad-9e95ff4404e3',
                origin: "Bulgaria",
                category: "nuts",
                stock: 45,
                featured: false,
                description: "Shelled and roasted sunflower seeds with mild nutty flavor. Packed with vitamin E."
            },
            "n0014": {  
                _id: "n0014",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Chia Seeds",
                price: 8.49,
                pricePerKg: 16.98,
                weight: 0.5,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743613618851_chia_2119771_1920.avif?alt=media&token=9a65efd0-bbce-4829-8b07-5833286d4a19',
                origin: "Mexico",
                category: "nuts",
                stock: 30,
                featured: true,
                description: "Nutrient-rich chia seeds, perfect for adding to smoothies, puddings, or as a topping."
            },
            "n0015": {  
                _id: "n0015",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Flax Seeds",
                price: 7.49,
                pricePerKg: 14.98,
                weight: 0.5,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743614304045_flaxseeds.jpg?alt=media&token=b39a7804-cb23-49ec-b925-6d962743a601',
                origin: "Canada",
                category: "nuts",
                stock: 35,
                featured: false,
                description: "Omega-3 rich flax seeds, great for adding to baked goods or sprinkling on cereal."
            },
            "n0016": {  
                _id: "n0016",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Almond Butter",
                price: 12.99,
                pricePerKg: 25.98,
                weight: 0.5,
                imageUrl: "https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743608917014_almond_butter.jpeg?alt=media&token=a007db83-7835-4907-aebd-e854bbc89441",
                origin: "USA",
                category: "nuts",
                stock: 20,
                featured: true,
                description: "Creamy almond butter made from roasted almonds. No added sugar or preservatives."
            },
            "n0017": {  
                _id: "n0017",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Chocolate Covered Almonds",
                price: 9.99,
                pricePerKg: 19.98,
                weight: 0.5,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743613720517_milk_chocolate_almonds_6__56193.jpg?alt=media&token=88d8e1f6-c3c9-4137-bb8e-f3ef2d5d0f39',
                origin: "Belgium",
                category: "nuts",
                stock: 25,
                featured: true,
                description: "Premium almonds coated in rich dark chocolate. A perfect treat."
            },
            "n0018": {  
                _id: "n0018",
                _createdOn: 1617194299472,
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc", // Admin user
                name: "Coconut Flakes",
                price: 6.99,
                pricePerKg: 13.98,
                weight: 0.5,
                imageUrl: 'https://firebasestorage.googleapis.com/v0/b/final-exam-softuni-c972c.firebasestorage.app/o/products%2F1743613790318_coconut_flakes_unsweetened_wide_sliced_1S_1234.jpg?alt=media&token=e4d1c61f-77b1-45d4-a5f5-5ac02bf71059',
                origin: "Philippines",
                category: "nuts",
                stock: 30,
                featured: false,
                description: "Unsweetened coconut flakes, perfect for baking, cooking, or adding to smoothies."
            }
        },
        user_profiles: {
            
            "p0001":
            {
                _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                "addresses": [
                    {
                        "address": "ж.к. Люлин 9, бул. „Луи Пастьор“ 19, 1335 София, България",
                        "isDefault": true
                    }
                ],
                "cart": [],
                "_createdOn": 1743509269832,
                "_updatedOn": 1743511487340,
                "_id": "p0001"
              },
              "6f33e9da-b28e-47ac-9090-ffc24f786572": 
              {
                "_ownerId": "302ba663-48f8-4040-b9ea-decafcc81088",
                "addresses": [
                    {
                        "address": "ж.к. Люлин 9, бул. „Луи Пастьор“ 19, 1335 София, България",
                        "isDefault": true
                    }
                ],
                "cart": [],
                "_createdOn": 1743509269832,
                "_updatedOn": 1743511487340,
                "_id": "6f33e9da-b28e-47ac-9090-ffc24f786572"
            }
        },
        orders: [
            {
                "_ownerId": "302ba663-48f8-4040-b9ea-decafcc81088",
                "userInfo": {
                    "email": "spasovgeorgi801@gmail.com",
                    "firstName": "Georgi",
                    "lastName": "Spasov",
                    "phone": "0886238899"
                },
                "address": "ж.к. Люлин 9, бул. „Луи Пастьор“ 19, 1335 София, България",
                "deliveryNotes": "",
                "items": [
                    {
                        "productId": "f0006",
                        "name": "Blueberries",
                        "price": 6.99,
                        "quantity": 1,
                        "imageUrl": ""
                    },
                    {
                        "productId": "f0004",
                        "name": "Strawberries",
                        "price": 5.99,
                        "quantity": 1,
                        "imageUrl": ""
                    }
                ],
                "payment": {
                    "method": "cash"
                },
                "pricing": {
                    "subtotal": 12.98,
                    "deliveryFee": 5.99,
                    "tax": 1.298,
                    "total": 20.268
                },
                "deliveryOption": "express",
                "status": "delivered",
                "_createdOn": 1743509334738,
                "_updatedOn": 1743512261208,
                "_id": "0d42a4b5-adac-47fa-bc64-3709a6dbe6f7"
            },
            {
                "_ownerId": "302ba663-48f8-4040-b9ea-decafcc81088",
                "userInfo": {
                    "email": "spasovgeorgi801@gmail.com",
                    "firstName": "Georgi",
                    "lastName": "Spasov",
                    "phone": "0886238899"
                },
                "address": "ж.к. Люлин 9, бул. „Луи Пастьор“ 19, 1335 София, България",
                "deliveryNotes": "",
                "items": [
                    {
                        "productId": "f0004",
                        "name": "Strawberries",
                        "price": 5.99,
                        "quantity": 6,
                        "imageUrl": ""
                    }
                ],
                "payment": {
                    "method": "cash"
                },
                "pricing": {
                    "subtotal": 35.94,
                    "deliveryFee": 5.99,
                    "tax": 3.594,
                    "total": 45.524
                },
                "deliveryOption": "express",
                "status": "delivered",
                "_createdOn": 1743511487322,
                "_updatedOn": 1743511824709,
                "_id": "2797a614-a989-4d45-8804-704a8de3c0cb"
            }
        ]
    };
    var rules$1 = {
    	users: {
    		".create": false,
    		".read": [
    			"Owner"
    		],
    		".update": false,
    		".delete": false
    	},
    	members: {
    		".update": "isOwner(user, get('teams', data.teamId))",
    		".delete": "isOwner(user, get('teams', data.teamId)) || isOwner(user, data)",
    		"*": {
    			teamId: {
    				".update": "newData.teamId = data.teamId"
    			},
    			status: {
    				".create": "newData.status = 'pending'"
    			}
    		}
    	}
    };
    var settings = {
    	identity: identity,
    	protectedData: protectedData,
    	seedData: seedData,
    	rules: rules$1
    };

    const plugins = [
        storage(settings),
        auth(settings),
        util$2(),
        rules(settings)
    ];

    const server = http__default['default'].createServer(requestHandler(plugins, services));

    const port = process.env.PORT;

    server.listen(port);

    console.log(`Server started on port ${port}. You can make requests to http://localhost:${port}/`);
    console.log(`Admin panel located at http://localhost:${port}/admin`);

    var softuniPracticeServer = server;

    return softuniPracticeServer;

})));
