var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
define("utility/Env", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Env {
        #loaded = false;
        #onLoad = [];
        get isDev() {
            return this.ENVIRONMENT === 'dev';
        }
        async load() {
            const origin = location.origin;
            const root = location.pathname.startsWith('/beta/') ? '/beta/' : '/';
            Object.assign(this, await fetch(origin + root + 'env.json').then(response => response.json()));
            document.documentElement.classList.add(`environment-${this.ENVIRONMENT}`);
            this.#loaded = true;
            for (const handler of this.#onLoad)
                handler();
            this.#onLoad.length = 0;
        }
        onLoad(environment, handler) {
            if (typeof environment === 'function') {
                handler = environment;
                environment = undefined;
            }
            else if (environment) {
                const originalHandler = handler;
                handler = () => this.ENVIRONMENT === environment && originalHandler?.();
            }
            if (this.#loaded)
                handler?.();
            else if (handler)
                this.#onLoad.push(handler);
        }
    }
    exports.default = new Env();
});
define("utility/Type", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Type;
    (function (Type) {
        function as(type, value) {
            return typeof value === type ? value : undefined;
        }
        Type.as = as;
    })(Type || (Type = {}));
    exports.default = Type;
});
define("utility/Objects", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Objects;
    (function (Objects) {
        Objects.EMPTY = {};
        function keys(object) {
            return Object.keys(object);
        }
        Objects.keys = keys;
        function values(object) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return Object.values(object);
        }
        Objects.values = values;
        function inherit(obj, inherits) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
            Object.setPrototypeOf(obj, inherits.prototype);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return obj;
        }
        Objects.inherit = inherit;
        function filterNullish(object) {
            return filter(object, p => p[1] !== null && p[1] !== undefined);
        }
        Objects.filterNullish = filterNullish;
        function filter(object, filter) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            return Object.fromEntries(Object.entries(object).filter(filter));
        }
        Objects.filter = filter;
        function map(object, mapper) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unnecessary-type-assertion
            return Object.fromEntries(Object.entries(object).map(mapper));
        }
        Objects.map = map;
        async function mapAsync(object, mapper) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            return Object.fromEntries(await Promise.all(Object.entries(object).map(mapper)));
        }
        Objects.mapAsync = mapAsync;
        function followPath(obj, keys) {
            for (const key of keys)
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
                obj = obj?.[key];
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return obj;
        }
        Objects.followPath = followPath;
        function applyJIT(obj, key, compute) {
            const get = (() => {
                const promise = compute();
                delete obj[key];
                obj[key] = promise;
                if (promise instanceof Promise)
                    void promise.then(value => obj[key] = value);
                return promise;
            });
            get.compute = compute;
            Object.defineProperty(obj, key, {
                configurable: true,
                get,
            });
        }
        Objects.applyJIT = applyJIT;
        function copyJIT(target, from, key) {
            const descriptor = Object.getOwnPropertyDescriptor(from, key);
            if (!descriptor)
                return;
            if ('value' in descriptor) {
                target[key] = from[key];
                return;
            }
            const compute = descriptor.get?.compute;
            if (!compute)
                return;
            applyJIT(target, key, compute);
        }
        Objects.copyJIT = copyJIT;
        Objects.assign = function (target, ...sources) {
            for (const source of sources) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                for (const key of Object.keys(source)) {
                    const descriptor = Object.getOwnPropertyDescriptor(target, key);
                    if (!descriptor || descriptor.writable) {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
                        target[key] = source[key];
                    }
                }
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return target;
        };
        function merge(a, b) {
            if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null || Array.isArray(a) || Array.isArray(b))
                return (b === undefined ? a : b);
            const result = {};
            for (const key of new Set([...Object.keys(a), ...Object.keys(b)]))
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
                result[key] = merge(a[key], b[key]);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return result;
        }
        Objects.merge = merge;
    })(Objects || (Objects = {}));
    exports.default = Objects;
});
define("utility/string/Strings", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Strings;
    (function (Strings) {
        function includesAt(string, substring, index) {
            if (index < 0)
                index = string.length + index;
            if (index + substring.length > string.length)
                return false;
            for (let i = 0; i < substring.length; i++)
                if (string[i + index] !== substring[i])
                    return false;
            return true;
        }
        Strings.includesAt = includesAt;
        function splitOnce(string, separator) {
            const index = string.indexOf(separator);
            if (index === -1)
                return [string];
            return [string.slice(0, index), string.slice(index + separator.length)];
        }
        Strings.splitOnce = splitOnce;
        function sliceTo(string, substring, startAt) {
            const index = string.indexOf(substring, startAt);
            if (index === -1)
                return string;
            return string.slice(0, index);
        }
        Strings.sliceTo = sliceTo;
        function sliceAfter(string, substring, startAt) {
            const index = string.indexOf(substring, startAt);
            if (index === -1)
                return string;
            return string.slice(index + substring.length);
        }
        Strings.sliceAfter = sliceAfter;
        function trimTextMatchingFromStart(string, substring, startAt) {
            if (string.length < substring.length)
                return string;
            const index = string.indexOf(substring, startAt);
            if (index !== 0)
                return string;
            return string.slice(index + substring.length);
        }
        Strings.trimTextMatchingFromStart = trimTextMatchingFromStart;
        function trimTextMatchingFromEnd(string, substring, startAt) {
            if (string.length < substring.length)
                return string;
            const index = string.lastIndexOf(substring, startAt);
            if (index !== string.length - substring.length)
                return string;
            return string.slice(0, index);
        }
        Strings.trimTextMatchingFromEnd = trimTextMatchingFromEnd;
        function extractFromQuotes(string) {
            let substring = (string ?? '').trim();
            if (substring[0] === '"')
                substring = substring.slice(1);
            if (substring[substring.length - 1] === '"')
                substring = substring.slice(0, -1);
            return substring.trim();
        }
        Strings.extractFromQuotes = extractFromQuotes;
        function extractFromSquareBrackets(string) {
            let substring = (string ?? '');
            if (substring[0] === '[')
                substring = substring.slice(1).trimStart();
            if (substring[substring.length - 1] === ']')
                substring = substring.slice(0, -1).trimEnd();
            return substring;
        }
        Strings.extractFromSquareBrackets = extractFromSquareBrackets;
        function mergeRegularExpressions(flags, ...expressions) {
            let exprString = '';
            for (const expr of expressions)
                exprString += '|' + expr.source;
            return new RegExp(exprString.slice(1), flags);
        }
        Strings.mergeRegularExpressions = mergeRegularExpressions;
        function count(string, substring, stopAtCount = Infinity) {
            let count = 0;
            let lastIndex = -1;
            while (count < stopAtCount) {
                const index = string.indexOf(substring, lastIndex + 1);
                if (index === -1)
                    return count;
                count++;
                lastIndex = index;
            }
            return count;
        }
        Strings.count = count;
        function includesOnce(string, substring) {
            return count(string, substring, 2) === 1;
        }
        Strings.includesOnce = includesOnce;
        function getVariations(name) {
            const variations = [name];
            variations.push(name + 'd', name + 'ed');
            if (name.endsWith('d'))
                variations.push(...getVariations(name.slice(0, -1)));
            if (name.endsWith('ed'))
                variations.push(...getVariations(name.slice(0, -2)));
            if (name.endsWith('ing')) {
                variations.push(name.slice(0, -3));
                if (name[name.length - 4] === name[name.length - 5])
                    variations.push(name.slice(0, -4));
            }
            else {
                variations.push(name + 'ing', name + name[name.length - 1] + 'ing');
                if (name.endsWith('y'))
                    variations.push(name.slice(0, -1) + 'ing');
            }
            if (name.endsWith('ion')) {
                variations.push(...getVariations(name.slice(0, -3)));
                if (name[name.length - 4] === name[name.length - 5])
                    variations.push(name.slice(0, -4));
            }
            else
                variations.push(name + 'ion');
            if (name.endsWith('er'))
                variations.push(name.slice(0, -1), name.slice(0, -2));
            else {
                variations.push(name + 'r', name + 'er');
                if (name.endsWith('y'))
                    variations.push(name.slice(0, -1) + 'ier');
            }
            if (name.endsWith('ier'))
                variations.push(name.slice(0, -3) + 'y');
            variations.push(name + 's', name + 'es');
            if (name.endsWith('s'))
                variations.push(name.slice(0, -1));
            else {
                if (name.endsWith('y'))
                    variations.push(name.slice(0, -1) + 'ies');
            }
            return variations;
        }
        Strings.getVariations = getVariations;
        function shiftLine(lines, count = 1) {
            for (let i = 0; i < count; i++) {
                const index = lines.indexOf('\n');
                if (index === -1)
                    return lines;
                lines = lines.slice(index + 1);
            }
            return lines;
        }
        Strings.shiftLine = shiftLine;
        const REGEX_APOSTROPHE = /'/g;
        const REGEX_NON_WORD_MULTI = /\W+/g;
        function getWords(text) {
            return text.toLowerCase()
                .replace(REGEX_APOSTROPHE, '')
                .split(REGEX_NON_WORD_MULTI)
                .filter(Boolean);
        }
        Strings.getWords = getWords;
        function fuzzyMatches(a, b, options) {
            options ??= {};
            options.missingWordsThreshold ??= 0.4;
            options.maxMissingWordsForFuzzy = 4;
            const wordsA = getWords(a).map(getVariations);
            const wordsB = getWords(b).map(getVariations);
            let matches = 0;
            let misses = 0;
            let ia = 0;
            let ib = 0;
            NextMain: while (true) {
                const va = wordsA[ia];
                const vb = wordsB[ib];
                if (!va && !vb)
                    break;
                if (!va || !vb) {
                    ia++;
                    ib++;
                    misses++;
                    continue;
                }
                let loopMisses = 0;
                for (let ia2 = ia; ia2 < wordsA.length && loopMisses <= options.maxMissingWordsForFuzzy; ia2++) {
                    const va = wordsA[ia2];
                    if (va.some(va => vb.includes(va))) {
                        ia = ia2 + 1;
                        ib++;
                        matches++;
                        misses += loopMisses;
                        continue NextMain;
                    }
                    loopMisses++;
                }
                loopMisses = 0;
                for (let ib2 = ib; ib2 < wordsB.length && loopMisses <= options.maxMissingWordsForFuzzy; ib2++) {
                    const vb = wordsB[ib2];
                    if (vb.some(vb => va.includes(vb))) {
                        ia++;
                        ib = ib2 + 1;
                        matches++;
                        misses += loopMisses;
                        continue NextMain;
                    }
                    loopMisses++;
                }
                misses++;
                ia++;
                ib++;
            }
            return matches / (matches + misses) >= options.missingWordsThreshold;
        }
        Strings.fuzzyMatches = fuzzyMatches;
        const REGEX_NON_WORD_MULTI_PREV = /(?<=\W+)/g;
        function toTitleCase(text) {
            return text.split(REGEX_NON_WORD_MULTI_PREV)
                .map(word => word[0].toUpperCase() + word.slice(1))
                .join('');
        }
        Strings.toTitleCase = toTitleCase;
    })(Strings || (Strings = {}));
    exports.default = Strings;
});
define("utility/Time", ["require", "exports", "utility/string/Strings"], function (require, exports, Strings_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Strings_1 = __importDefault(Strings_1);
    var Time;
    (function (Time) {
        function floor(interval) {
            return Math.floor(Date.now() / interval) * interval;
        }
        Time.floor = floor;
        Time.frame = seconds(1) / 144;
        function ms(ms) { return ms; }
        Time.ms = ms;
        function seconds(seconds) { return seconds * 1000; }
        Time.seconds = seconds;
        function minutes(minutes) { return minutes * 1000 * 60; }
        Time.minutes = minutes;
        function hours(hours) { return hours * 1000 * 60 * 60; }
        Time.hours = hours;
        function days(days) { return days * 1000 * 60 * 60 * 24; }
        Time.days = days;
        function weeks(weeks) { return weeks * 1000 * 60 * 60 * 24 * 7; }
        Time.weeks = weeks;
        function months(months) { return Math.floor(months * 1000 * 60 * 60 * 24 * (365.2422 / 12)); }
        Time.months = months;
        function years(years) { return Math.floor(years * 1000 * 60 * 60 * 24 * 365.2422); }
        Time.years = years;
        function decades(decades) { return Math.floor(decades * 1000 * 60 * 60 * 24 * 365.2422 * 10); }
        Time.decades = decades;
        function centuries(centuries) { return Math.floor(centuries * 1000 * 60 * 60 * 24 * 365.2422 * 10 * 10); }
        Time.centuries = centuries;
        function millenia(millenia) { return Math.floor(millenia * 1000 * 60 * 60 * 24 * 365.2422 * 10 * 10 * 10); }
        Time.millenia = millenia;
        function relative(unixTimeMs, options = {}) {
            let ms = unixTimeMs - Date.now();
            const locale = navigator.language || 'en-NZ';
            if (!locale.startsWith('en'))
                return relativeIntl(ms, locale, options);
            if (Math.abs(ms) < seconds(1))
                return 'now';
            const ago = ms < 0;
            if (ago)
                ms = Math.abs(ms);
            let limit = options.components ?? Infinity;
            let value = ms;
            let result = !ago && options.label !== false ? 'in ' : '';
            value = Math.floor(ms / years(1));
            ms -= value * years(1);
            if (value && limit-- > 0)
                result += `${value} year${value === 1 ? '' : 's'}${limit > 0 ? ', ' : ''}`;
            value = Math.floor(ms / months(1));
            ms -= value * months(1);
            if (value && limit-- > 0)
                result += `${value} month${value === 1 ? '' : 's'}${limit > 0 ? ', ' : ''}`;
            value = Math.floor(ms / weeks(1));
            ms -= value * weeks(1);
            if (value && limit-- > 0)
                result += `${value} week${value === 1 ? '' : 's'}${limit > 0 ? ', ' : ''}`;
            value = Math.floor(ms / days(1));
            ms -= value * days(1);
            if (value && limit-- > 0)
                result += `${value} day${value === 1 ? '' : 's'}${limit > 0 ? ', ' : ''}`;
            value = Math.floor(ms / hours(1));
            ms -= value * hours(1);
            if (value && limit-- > 0)
                result += `${value} hour${value === 1 ? '' : 's'}${limit > 0 ? ', ' : ''}`;
            value = Math.floor(ms / minutes(1));
            ms -= value * minutes(1);
            if (value && limit-- > 0)
                result += `${value} minute${value === 1 ? '' : 's'}${limit > 0 ? ', ' : ''}`;
            value = Math.floor(ms / seconds(1));
            if (value && limit-- > 0 && (!options.secondsExclusive || !result.includes(',')))
                result += `${value} second${value === 1 ? '' : 's'}`;
            result = Strings_1.default.trimTextMatchingFromEnd(result, ', ');
            return `${result}${ago && options.label !== false ? ' ago' : ''}`;
        }
        Time.relative = relative;
        function relativeIntl(ms, locale, options) {
            const rtf = new Intl.RelativeTimeFormat(locale, options);
            let value = ms;
            value = Math.floor(ms / years(1));
            if (value)
                return rtf.format(value, 'year');
            value = Math.floor(ms / months(1));
            if (value)
                return rtf.format(value, 'month');
            value = Math.floor(ms / weeks(1));
            if (value)
                return rtf.format(value, 'week');
            value = Math.floor(ms / days(1));
            if (value)
                return rtf.format(value, 'day');
            value = Math.floor(ms / hours(1));
            if (value)
                return rtf.format(value, 'hour');
            value = Math.floor(ms / minutes(1));
            if (value)
                return rtf.format(value, 'minute');
            value = Math.floor(ms / seconds(1));
            return rtf.format(value, 'second');
        }
        function absolute(ms, options = { dateStyle: 'full', timeStyle: 'medium' }) {
            const locale = navigator.language || 'en-NZ';
            const rtf = new Intl.DateTimeFormat(locale, options);
            return rtf.format(ms);
        }
        Time.absolute = absolute;
    })(Time || (Time = {}));
    Object.assign(window, { Time });
    exports.default = Time;
});
define("endpoint/Endpoint", ["require", "exports", "utility/Env", "utility/Objects", "utility/Time"], function (require, exports, Env_1, Objects_1, Time_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Env_1 = __importDefault(Env_1);
    Objects_1 = __importDefault(Objects_1);
    Time_1 = __importDefault(Time_1);
    function Endpoint(route, method, headers) {
        let pageSize;
        const endpoint = {
            header(header, value) {
                headers ??= {};
                headers[header] = value;
                return endpoint;
            },
            headers(h) {
                headers = { ...headers, ...h };
                return endpoint;
            },
            removeHeader(header) {
                delete headers?.[header];
                return endpoint;
            },
            getPageSize: () => pageSize,
            setPageSize: (size) => {
                pageSize = size;
                return endpoint;
            },
            noResponse: () => endpoint.removeHeader('Accept'),
            query: query,
            prep: (...parameters) => {
                const endpoint = Endpoint(route, method, headers);
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                return Object.assign(endpoint, {
                    query: (...p2) => {
                        const newParameters = [];
                        const length = Math.max(parameters.length, p2.length);
                        for (let i = 0; i < length; i++)
                            newParameters.push(Objects_1.default.merge(parameters[i], p2[i]));
                        const ownPageSize = pageSize;
                        pageSize = endpoint.getPageSize();
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                        const result = query(...newParameters);
                        pageSize = ownPageSize;
                        return result;
                    },
                });
            },
        };
        return endpoint;
        async function query(data, search) {
            const body = !data?.body ? undefined : JSON.stringify(data.body);
            const url = route.slice(1)
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
                .replaceAll(/\{([^}]+)\}/g, (match, paramName) => data?.params?.[paramName]);
            const params = new URLSearchParams(search);
            if (pageSize)
                params.set('page_size', `${pageSize}`);
            const qs = params.size ? '?' + params.toString() : '';
            let error;
            const response = await fetch(`${Env_1.default.API_ORIGIN}${url}${qs}`, {
                method,
                headers: {
                    'Content-Type': body ? 'application/json' : undefined,
                    'Accept': 'application/json',
                    ...headers,
                },
                credentials: 'include',
                body,
                signal: AbortSignal.timeout(Time_1.default.seconds(5)),
            }).catch((e) => {
                if (e.name === 'AbortError') {
                    error = Object.assign(new Error('Request timed out'), {
                        code: 408,
                        data: null,
                        headers: new Headers(),
                    });
                    return;
                }
                if (e.name === 'TypeError' && /invalid URL|Failed to construct/.test(e.message))
                    throw e;
                if (e.name === 'TypeError' || e.name === 'NetworkError') {
                    error = Object.assign(new Error('Network connection failed'), {
                        code: 503,
                        data: null,
                        headers: new Headers(),
                    });
                    return;
                }
                if (!error)
                    throw e;
            });
            if (error || !response) // will always mean the same thing, but ts doesn't know that
                return error;
            const code = response.status;
            if (code !== 200) {
                error = Object.assign(new Error(response.statusText), { code, retry: () => query(data) });
                delete error.stack;
            }
            const responseHeaders = { headers: response.headers };
            if (!response.body)
                return Object.assign(error ?? {}, responseHeaders);
            const responseType = response.headers.get('Content-Type');
            if (responseType === 'application/json') {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const json = await response.json().catch(e => {
                    error ??= Object.assign(e instanceof Error ? e : new Error('Failed to parse JSON'), { code, retry: () => query(data) });
                    delete error.stack;
                });
                if (error)
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                    return Object.assign(error, json, responseHeaders);
                const paginated = json;
                if (paginated.has_more) {
                    Object.assign(json, {
                        next: () => query(data, {
                            ...search,
                            ...[...params].toObject(),
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                            page: +(params.get('page') ?? search?.page ?? json.page ?? 0) + 1,
                        }),
                        getPage: (page) => query(data, { ...search, page }),
                    });
                }
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                return Object.assign(json, responseHeaders);
            }
            throw new Error(`Response type ${responseType} is not supported`);
        }
    }
    exports.default = Endpoint;
});
define("endpoint/manifest/EndpointFormInputLengths", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_1 = __importDefault(Endpoint_1);
    exports.default = (0, Endpoint_1.default)('/manifest/form/lengths', 'get');
});
define("model/Manifest", ["require", "exports", "utility/Time"], function (require, exports, Time_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Time_2 = __importDefault(Time_2);
    function Manifest(definition) {
        let manifestTime;
        let promise;
        const result = {
            manifest: undefined,
            isFresh(manifest) {
                return !!manifest && Date.now() - (manifestTime ?? 0) < Time_2.default.minutes(5);
            },
            async getManifest(force) {
                // don't re-request the tag manifest if it was requested less than 5 minutes ago
                if (!force && result.isFresh(result.manifest))
                    return result.manifest;
                return promise ??= (async () => {
                    try {
                        const response = await definition.get();
                        if (response instanceof Error)
                            throw response;
                        result.manifest = response.data;
                    }
                    catch (err) {
                        if (definition.orElse)
                            result.manifest = definition.orElse();
                        else
                            throw err;
                    }
                    manifestTime = Date.now();
                    promise = undefined;
                    return result.manifest;
                })();
            },
        };
        return result;
    }
    exports.default = Manifest;
});
define("model/FormInputLengths", ["require", "exports", "endpoint/manifest/EndpointFormInputLengths", "model/Manifest"], function (require, exports, EndpointFormInputLengths_1, Manifest_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    EndpointFormInputLengths_1 = __importDefault(EndpointFormInputLengths_1);
    Manifest_1 = __importDefault(Manifest_1);
    exports.default = (0, Manifest_1.default)({
        get() {
            return EndpointFormInputLengths_1.default.query();
        },
        orElse() {
            const empy = {};
            return new Proxy({}, {
                get(target, p, receiver) {
                    return empy;
                },
            });
        },
    });
});
define("endpoint/auth/EndpointAuthDelete", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_2 = __importDefault(Endpoint_2);
    exports.default = (0, Endpoint_2.default)('/auth/delete', 'post')
        .noResponse();
});
define("endpoint/session/EndpointSessionGet", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_3 = __importDefault(Endpoint_3);
    exports.default = (0, Endpoint_3.default)('/session', 'get');
});
define("endpoint/session/EndpointSessionReset", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_4 = __importDefault(Endpoint_4);
    exports.default = (0, Endpoint_4.default)('/session/reset', 'post')
        .noResponse();
});
define("ui/component/core/ActionRow", ["require", "exports", "ui/Component"], function (require, exports, Component_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Component_1 = __importDefault(Component_1);
    const ActionRow = Component_1.default.Builder((row) => {
        row.style('action-row');
        let hasRight = false;
        return row
            .extend(row => ({
            left: undefined,
            middle: undefined,
            right: undefined,
        }))
            .extendJIT('left', row => (0, Component_1.default)()
            .style('action-row-left')
            .appendTo(row))
            .extendJIT('middle', row => {
            const middle = (0, Component_1.default)()
                .style('action-row-middle');
            return hasRight
                ? middle.insertTo(row, 'before', row.right)
                : middle.appendTo(row);
        })
            .extendJIT('right', row => {
            hasRight = true;
            return (0, Component_1.default)()
                .style('action-row-right')
                .appendTo(row);
        });
    });
    exports.default = ActionRow;
});
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../tasks/server/messages/MessageTypeRegistry.d.ts" />
define("utility/DevServer", ["require", "exports", "utility/Env"], function (require, exports, Env_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Env_2 = __importDefault(Env_2);
    const handlerRegistry = {};
    let socket = undefined;
    const DevServer = {
        connect() {
            if (socket)
                return;
            if (Env_2.default.ENVIRONMENT !== 'dev')
                return;
            const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = `${wsProtocol}//${window.location.host}`;
            socket = new WebSocket(wsUrl);
            socket.addEventListener('message', event => {
                try {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                    const message = JSON.parse(event.data);
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    const { type, data } = typeof message === 'object' && message !== null ? message : {};
                    const handlers = handlerRegistry[type];
                    if (!handlers?.length) {
                        console.warn('No handler for devserver message type:', type);
                        return;
                    }
                    for (const handler of handlers)
                        handler(type, data);
                }
                catch {
                    console.warn('Unsupported devserver message:', event.data);
                }
            });
        },
        onMessage(type, handler) {
            handlerRegistry[type] ??= [];
            handlerRegistry[type].push(handler);
        },
        close() {
            socket?.close();
            socket = undefined;
        },
    };
    exports.default = DevServer;
});
define("utility/Script", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Script;
    (function (Script) {
        function allowModuleRedefinition(...paths) {
            for (const path of paths)
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                window.allowRedefine(path);
        }
        Script.allowModuleRedefinition = allowModuleRedefinition;
        async function reload(path) {
            document.querySelector(`script[src^="${path}"]`)?.remove();
            const script = document.createElement('script');
            script.src = `${path}?${Date.now()}`;
            return new Promise((resolve, reject) => {
                script.onload = () => resolve();
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }
        Script.reload = reload;
    })(Script || (Script = {}));
    exports.default = Script;
});
define("ui/component/core/ext/ComponentInsertionTransaction", ["require", "exports", "utility/State"], function (require, exports, State_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    State_1 = __importDefault(State_1);
    function ComponentInsertionTransaction(component, onEnd) {
        let unuseComponentRemove = component?.removed.useManual(removed => removed && onComponentRemove());
        let removed = false;
        const result = {
            isInsertionDestination: true,
            closed: (0, State_1.default)(false),
            get size() {
                return component?.element.children.length ?? 0;
            },
            append(...contents) {
                if (result.closed)
                    return result;
                component?.append(...contents);
                return result;
            },
            prepend(...contents) {
                if (result.closed)
                    return result;
                component?.prepend(...contents);
                return result;
            },
            insert(direction, sibling, ...contents) {
                if (result.closed)
                    return result;
                component?.insert(direction, sibling, ...contents);
                return result;
            },
            abort() {
                if (result.closed)
                    return;
                close();
            },
            close() {
                if (result.closed)
                    return;
                if (!removed)
                    onEnd?.(result);
                close();
            },
        };
        return result;
        function close() {
            result.closed.asMutable?.setValue(true);
            unuseComponentRemove?.();
            unuseComponentRemove = undefined;
            component = undefined;
        }
        function onComponentRemove() {
            unuseComponentRemove?.();
            unuseComponentRemove = undefined;
            removed = true;
            result.close();
        }
    }
    exports.default = ComponentInsertionTransaction;
});
define("utility/Define", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function Define(proto, key, implementation) {
        try {
            Object.defineProperty(proto, key, {
                configurable: true,
                writable: true,
                value: implementation,
            });
        }
        catch { }
    }
    (function (Define) {
        function all(protos, key, implementation) {
            for (const proto of protos) {
                Define(proto, key, implementation);
            }
        }
        Define.all = all;
        function magic(obj, key, implementation) {
            try {
                Object.defineProperty(obj, key, {
                    configurable: true,
                    ...implementation,
                });
            }
            catch { }
        }
        Define.magic = magic;
        function set(obj, key, value) {
            try {
                Object.defineProperty(obj, key, {
                    configurable: true,
                    writable: true,
                    value,
                });
            }
            catch { }
            return value;
        }
        Define.set = set;
    })(Define || (Define = {}));
    exports.default = Define;
});
define("utility/Arrays", ["require", "exports", "utility/Define"], function (require, exports, Define_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NonNullish = NonNullish;
    exports.Truthy = Truthy;
    Define_1 = __importDefault(Define_1);
    function NonNullish(value) {
        return value !== null && value !== undefined;
    }
    function Truthy(value) {
        return !!value;
    }
    var Arrays;
    (function (Arrays) {
        Arrays.EMPTY = [];
        function resolve(or) {
            return Array.isArray(or) ? or : or === undefined ? [] : [or];
        }
        Arrays.resolve = resolve;
        function includes(array, value) {
            return Array.isArray(array) ? array.includes(value) : array === value;
        }
        Arrays.includes = includes;
        function slice(or) {
            return Array.isArray(or) ? or.slice() : or === undefined ? [] : [or];
        }
        Arrays.slice = slice;
        /**
         * Removes one instance of the given value from the given array.
         * @returns `true` if removed, `false` otherwise
         */
        function remove(array, ...values) {
            if (!array)
                return false;
            let removed = false;
            for (const value of values) {
                const index = array.indexOf(value);
                if (index === -1)
                    continue;
                array.splice(index, 1);
                removed = true;
            }
            return removed;
        }
        Arrays.remove = remove;
        /**
         * Remove all instances of the given value from the given array.
         * @returns `true` if anything removed, `false` otherwise
         */
        function removeAll(array, ...values) {
            if (!array)
                return false;
            let removed = false;
            let insertIndex = 0;
            for (let i = 0; i < array.length; i++) {
                if (values.includes(array[i])) {
                    removed = true;
                    // do not increment insertion index so subsequent values will be swapped over the removed one
                    continue;
                }
                if (insertIndex !== i)
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    array[insertIndex] = array[i];
                insertIndex++;
            }
            array.length = insertIndex; // trim
            return removed;
        }
        Arrays.removeAll = removeAll;
        /**
         * Removes all values matching the given predicate from the array.
         * @returns `true` if removed, `false` otherwise
         */
        function removeWhere(array, predicate) {
            if (!array)
                return false;
            let removed = false;
            let insertIndex = 0;
            for (let i = 0; i < array.length; i++) {
                if (predicate(array[i], i, array)) {
                    removed = true;
                    // do not increment insertion index so subsequent values will be swapped over the removed one
                    continue;
                }
                if (insertIndex !== i)
                    array[insertIndex] = array[i];
                insertIndex++;
            }
            array.length = insertIndex; // trim
            return removed;
        }
        Arrays.removeWhere = removeWhere;
        /**
         * Adds the given value to the given array if not present.
         * @returns `true` if added, `false` otherwise
         */
        function add(array, value) {
            if (!array)
                return false;
            const index = array.indexOf(value);
            if (index !== -1)
                return false;
            array.push(value);
            return true;
        }
        Arrays.add = add;
        function tuple(...values) {
            return values;
        }
        Arrays.tuple = tuple;
        function range(start, end, step) {
            if (step === 0)
                throw new Error('Invalid step for range');
            const result = [];
            if (end === undefined)
                end = start, start = 0;
            step = end < start ? -1 : 1;
            for (let i = start; step > 0 ? i < end : i > end; i += step)
                result.push(i);
            return result;
        }
        Arrays.range = range;
        function mergeSorted(...arrays) {
            return arrays.reduce((prev, curr) => mergeSorted2(prev, curr), []);
        }
        Arrays.mergeSorted = mergeSorted;
        function mergeSorted2(array1, array2) {
            const merged = [];
            let index1 = 0;
            let index2 = 0;
            while (index1 < array1.length || index2 < array2.length) {
                const v1 = index1 < array1.length ? array1[index1] : undefined;
                const v2 = index2 < array2.length ? array2[index2] : undefined;
                if (v1 === v2) {
                    merged.push(v1);
                    index1++;
                    index2++;
                    continue;
                }
                if (v1 === undefined && v2 !== undefined) {
                    merged.push(v2);
                    index2++;
                    continue;
                }
                if (v2 === undefined && v1 !== undefined) {
                    merged.push(v1);
                    index1++;
                    continue;
                }
                const indexOfPerson1InList2 = array2.indexOf(v1, index2);
                if (indexOfPerson1InList2 === -1) {
                    merged.push(v1);
                    index1++;
                }
                else {
                    merged.push(v2);
                    index2++;
                }
            }
            return merged;
        }
        function applyPrototypes() {
            (0, Define_1.default)(Array.prototype, 'findLast', function (predicate) {
                if (this.length > 0)
                    for (let i = this.length - 1; i >= 0; i--)
                        if (predicate(this[i], i, this))
                            return this[i];
                return undefined;
            });
            (0, Define_1.default)(Array.prototype, 'findLastIndex', function (predicate) {
                if (this.length > 0)
                    for (let i = this.length - 1; i >= 0; i--)
                        if (predicate(this[i], i, this))
                            return i;
                return -1;
            });
            const originalSort = Array.prototype.sort;
            (0, Define_1.default)(Array.prototype, 'sort', function (...sorters) {
                if (this.length <= 1)
                    return this;
                if (!sorters.length)
                    return originalSort.call(this);
                return originalSort.call(this, (a, b) => {
                    for (const sorter of sorters) {
                        if (sorter.length === 1) {
                            const mapper = sorter;
                            const sortValue = mapper(b) - mapper(a);
                            if (sortValue)
                                return sortValue;
                        }
                        else {
                            const sortValue = sorter(a, b);
                            if (sortValue)
                                return sortValue;
                        }
                    }
                    return 0;
                });
            });
            (0, Define_1.default)(Array.prototype, 'collect', function (collector, ...args) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                return collector?.(this, ...args);
            });
            (0, Define_1.default)(Array.prototype, 'splat', function (collector, ...args) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                return collector?.(...this, ...args);
            });
            (0, Define_1.default)(Array.prototype, 'toObject', function (mapper) {
                return Object.fromEntries(mapper ? this.map(mapper) : this);
            });
            (0, Define_1.default)(Array.prototype, 'toMap', function (mapper) {
                return new Map(mapper ? this.map(mapper) : this);
            });
            (0, Define_1.default)(Array.prototype, 'distinct', function (mapper) {
                const result = [];
                const encountered = mapper ? [] : result;
                for (const value of this) {
                    const encounterValue = mapper ? mapper(value) : value;
                    if (encountered.includes(encounterValue))
                        continue;
                    if (mapper)
                        encountered.push(encounterValue);
                    result.push(value);
                }
                return result;
            });
            (0, Define_1.default)(Array.prototype, 'findMap', function (predicate, mapper) {
                for (let i = 0; i < this.length; i++)
                    if (predicate(this[i], i, this))
                        return mapper(this[i], i, this);
                return undefined;
            });
            (0, Define_1.default)(Array.prototype, 'groupBy', function (grouper) {
                const result = {};
                for (let i = 0; i < this.length; i++)
                    (result[String(grouper(this[i], i, this))] ??= []).push(this[i]);
                return Object.entries(result);
            });
            (0, Define_1.default)(Array.prototype, 'filterInPlace', function (filter) {
                Arrays.removeWhere(this, (value, index, arr) => !filter(value, index, arr));
                return this;
            });
            (0, Define_1.default)(Array.prototype, 'mapInPlace', function (mapper) {
                return this.splice(0, Infinity, ...this.map(mapper));
            });
        }
        Arrays.applyPrototypes = applyPrototypes;
    })(Arrays || (Arrays = {}));
    exports.default = Arrays;
});
define("utility/Functions", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Functions;
    (function (Functions) {
        Functions.NO_OP = () => { };
        function resolve(fn, ...args) {
            return typeof fn === 'function' ? fn(...args) : fn;
        }
        Functions.resolve = resolve;
    })(Functions || (Functions = {}));
    exports.default = Functions;
});
define("utility/State", ["require", "exports", "utility/Arrays", "utility/Define", "utility/Functions"], function (require, exports, Arrays_1, Define_2, Functions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Define_2 = __importDefault(Define_2);
    Functions_1 = __importDefault(Functions_1);
    var Owner;
    (function (Owner) {
        function getOwnershipState(ownerIn) {
            const owner = ownerIn;
            return owner.removed ?? owner.closed;
        }
        Owner.getOwnershipState = getOwnershipState;
    })(Owner || (Owner = {}));
    const SYMBOL_UNSUBSCRIBE = Symbol('UNSUBSCRIBE');
    const SYMBOL_VALUE = Symbol('VALUE');
    const SYMBOL_SUBSCRIBERS = Symbol('SUBSCRIBERS');
    function State(defaultValue, equals) {
        let unuseBoundState;
        const result = {
            isState: true,
            [SYMBOL_VALUE]: defaultValue,
            [SYMBOL_SUBSCRIBERS]: [],
            get value() {
                return result[SYMBOL_VALUE];
            },
            set value(value) {
                unuseBoundState?.();
                setValue(value);
            },
            setValue(value) {
                unuseBoundState?.();
                setValue(value);
                return result;
            },
            equals: value => result[SYMBOL_VALUE] === value || equals?.(result[SYMBOL_VALUE], value) || false,
            emit: oldValue => {
                for (const subscriber of result[SYMBOL_SUBSCRIBERS].slice())
                    subscriber(result[SYMBOL_VALUE], oldValue);
                return result;
            },
            bind(owner, state) {
                unuseBoundState?.();
                unuseBoundState = state.use(owner, setValue);
                return unuseBoundState;
            },
            use: (owner, subscriber) => {
                result.subscribe(owner, subscriber);
                subscriber(result[SYMBOL_VALUE], undefined);
                return () => result.unsubscribe(subscriber);
            },
            useManual: subscriber => {
                result.subscribeManual(subscriber);
                subscriber(result[SYMBOL_VALUE], undefined);
                return () => result.unsubscribe(subscriber);
            },
            subscribe: (owner, subscriber) => {
                const ownerClosedState = Owner.getOwnershipState(owner);
                if (!ownerClosedState || ownerClosedState.value)
                    return Functions_1.default.NO_OP;
                function cleanup() {
                    ownerClosedState.unsubscribe(cleanup);
                    result.unsubscribe(subscriber);
                    fn[SYMBOL_UNSUBSCRIBE]?.delete(cleanup);
                }
                State.OwnerMetadata.setHasSubscriptions(owner);
                const fn = subscriber;
                fn[SYMBOL_UNSUBSCRIBE] ??= new Set();
                fn[SYMBOL_UNSUBSCRIBE].add(cleanup);
                ownerClosedState.subscribeManual(cleanup);
                result.subscribeManual(subscriber);
                return cleanup;
            },
            subscribeManual: subscriber => {
                result[SYMBOL_SUBSCRIBERS].push(subscriber);
                return () => result.unsubscribe(subscriber);
            },
            unsubscribe: subscriber => {
                result[SYMBOL_SUBSCRIBERS].filterInPlace(s => s !== subscriber);
                return result;
            },
            await(owner, values, then) {
                result.subscribe(owner, function awaitValue(newValue) {
                    if (newValue !== values && (!Array.isArray(values) || !values.includes(newValue)))
                        return;
                    result.unsubscribe(awaitValue);
                    then(newValue);
                });
                return result;
            },
            awaitManual(values, then) {
                result.subscribeManual(function awaitValue(newValue) {
                    if (newValue !== values && (!Array.isArray(values) || !values.includes(newValue)))
                        return;
                    result.unsubscribe(awaitValue);
                    then(newValue);
                });
                return result;
            },
            map: (owner, mapper) => State.Map(owner, [result], mapper),
            mapManual: mapper => State.MapManual([result], mapper),
            get nonNullish() {
                return Define_2.default.set(result, 'nonNullish', State
                    .Generator(() => result.value !== undefined && result.value !== null)
                    .observeManual(result));
            },
            get truthy() {
                return Define_2.default.set(result, 'truthy', State
                    .Generator(() => !!result.value)
                    .observeManual(result));
            },
            get not() {
                return getNot();
            },
            get falsy() {
                return getNot();
            },
        };
        result.asMutable = result;
        return result;
        function setValue(value) {
            if (result[SYMBOL_VALUE] === value || equals?.(result[SYMBOL_VALUE], value))
                return;
            const oldValue = result[SYMBOL_VALUE];
            result[SYMBOL_VALUE] = value;
            result.emit(oldValue);
        }
        function getNot() {
            const not = State
                .Generator(() => !result.value)
                .observeManual(result);
            Define_2.default.set(result, 'not', not);
            Define_2.default.set(result, 'falsy', not);
            return not;
        }
    }
    (function (State) {
        function is(value) {
            return typeof value === 'object' && value?.isState === true;
        }
        State.is = is;
        function get(value) {
            return is(value) ? value : State(value);
        }
        State.get = get;
        const SYMBOL_HAS_SUBSCRIPTIONS = Symbol('HAS_SUBSCRIPTIONS');
        let OwnerMetadata;
        (function (OwnerMetadata) {
            function setHasSubscriptions(owner) {
                owner[SYMBOL_HAS_SUBSCRIPTIONS] = true;
            }
            OwnerMetadata.setHasSubscriptions = setHasSubscriptions;
            function hasSubscriptions(owner) {
                return owner[SYMBOL_HAS_SUBSCRIPTIONS] === true;
            }
            OwnerMetadata.hasSubscriptions = hasSubscriptions;
        })(OwnerMetadata = State.OwnerMetadata || (State.OwnerMetadata = {}));
        function Generator(generate) {
            const result = State(generate());
            delete result.asMutable;
            Define_2.default.magic(result, 'value', {
                get: () => result[SYMBOL_VALUE],
            });
            let unuseInternalState;
            result.refresh = () => {
                unuseInternalState?.();
                unuseInternalState = undefined;
                const value = generate();
                if (State.is(value)) {
                    unuseInternalState = value.useManual(value => {
                        if (result.equals(value))
                            return result;
                        const oldValue = result[SYMBOL_VALUE];
                        result[SYMBOL_VALUE] = value;
                        result.emit(oldValue);
                    });
                    return result;
                }
                if (result.equals(value))
                    return result;
                const oldValue = result[SYMBOL_VALUE];
                result[SYMBOL_VALUE] = value;
                result.emit(oldValue);
                return result;
            };
            result.observe = (owner, ...states) => {
                const ownerClosedState = Owner.getOwnershipState(owner);
                if (!ownerClosedState || ownerClosedState.value)
                    return result;
                OwnerMetadata.setHasSubscriptions(owner);
                for (const state of states)
                    state?.subscribeManual(result.refresh);
                let unuseOwnerRemove = ownerClosedState.subscribeManual(removed => removed && onRemove());
                return result;
                function onRemove() {
                    unuseOwnerRemove?.();
                    unuseOwnerRemove = undefined;
                    for (const state of states)
                        state?.unsubscribe(result.refresh);
                }
            };
            result.observeManual = (...states) => {
                for (const state of states)
                    state?.subscribeManual(result.refresh);
                return result;
            };
            result.unobserve = (...states) => {
                for (const state of states)
                    state?.unsubscribe(result.refresh);
                return result;
            };
            return result;
        }
        State.Generator = Generator;
        function JIT(generate) {
            const result = State(undefined);
            delete result.asMutable;
            let isCached = false;
            let cached;
            let unuseInternalState;
            Define_2.default.magic(result, 'value', {
                get: () => {
                    if (!isCached) {
                        unuseInternalState?.();
                        unuseInternalState = undefined;
                        isCached = true;
                        const result = generate();
                        if (State.is(result))
                            unuseInternalState = result.useManual(value => cached = value);
                        else
                            cached = result;
                    }
                    return cached;
                },
            });
            result.emit = () => {
                for (const subscriber of result[SYMBOL_SUBSCRIBERS].slice())
                    subscriber(undefined, cached);
                return result;
            };
            result.markDirty = () => {
                unuseInternalState?.();
                unuseInternalState = undefined;
                const oldValue = cached;
                isCached = false;
                cached = undefined;
                result.emit(oldValue);
                return result;
            };
            result.observe = (...states) => {
                for (const state of states)
                    state.subscribeManual(result.markDirty);
                return result;
            };
            result.unobserve = (...states) => {
                for (const state of states)
                    state.unsubscribe(result.markDirty);
                return result;
            };
            return result;
        }
        State.JIT = JIT;
        function Truthy(owner, state) {
            return Generator(() => !!state.value)
                .observe(owner, state);
        }
        State.Truthy = Truthy;
        function NonNullish(owner, state) {
            return Generator(() => state.value !== undefined && state.value !== null)
                .observe(owner, state);
        }
        State.NonNullish = NonNullish;
        function Falsy(owner, state) {
            return Generator(() => !!state.value)
                .observe(owner, state);
        }
        State.Falsy = Falsy;
        function Some(owner, ...anyOfStates) {
            return Generator(() => anyOfStates.some(state => state.value))
                .observe(owner, ...anyOfStates);
        }
        State.Some = Some;
        function Every(owner, ...anyOfStates) {
            return Generator(() => anyOfStates.every(state => state.value))
                .observe(owner, ...anyOfStates);
        }
        State.Every = Every;
        function Map(owner, inputs, outputGenerator) {
            return Generator(() => outputGenerator(...inputs.map(input => input?.value)))
                .observe(owner, ...inputs.filter(Arrays_1.NonNullish));
        }
        State.Map = Map;
        function MapManual(inputs, outputGenerator) {
            return Generator(() => outputGenerator(...inputs.map(input => input?.value)))
                .observeManual(...inputs.filter(Arrays_1.NonNullish));
        }
        State.MapManual = MapManual;
        function Use(owner, input) {
            return Generator(() => Object.entries(input).toObject(([key, state]) => [key, state?.value]))
                .observe(owner, ...Object.values(input).filter(Arrays_1.NonNullish));
        }
        State.Use = Use;
        function UseManual(input) {
            return Generator(() => Object.entries(input).toObject(([key, state]) => [key, state?.value]))
                .observeManual(...Object.values(input).filter(Arrays_1.NonNullish));
        }
        State.UseManual = UseManual;
    })(State || (State = {}));
    exports.default = State;
});
define("utility/Style", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Style;
    (function (Style) {
        async function reload(path) {
            const oldStyle = document.querySelector(`link[rel=stylesheet][href^="${path}"]`);
            const style = document.createElement('link');
            style.rel = 'stylesheet';
            style.href = `${path}?${Date.now()}`;
            return new Promise((resolve, reject) => {
                style.onload = () => resolve();
                style.onerror = reject;
                document.head.appendChild(style);
            }).finally(() => oldStyle?.remove());
        }
        Style.reload = reload;
    })(Style || (Style = {}));
    exports.default = Style;
});
define("ui/utility/StyleManipulator", ["require", "exports", "style", "utility/DevServer", "utility/Env", "utility/Script", "utility/State", "utility/Style"], function (require, exports, style_1, DevServer_1, Env_3, Script_1, State_2, Style_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    style_1 = __importDefault(style_1);
    DevServer_1 = __importDefault(DevServer_1);
    Env_3 = __importDefault(Env_3);
    Script_1 = __importDefault(Script_1);
    State_2 = __importDefault(State_2);
    Style_1 = __importDefault(Style_1);
    const style = (0, State_2.default)(style_1.default);
    DevServer_1.default.onMessage('updateStyle', async () => {
        Script_1.default.allowModuleRedefinition('style');
        void Style_1.default.reload(`${Env_3.default.URL_ORIGIN}style/index.css`);
        await Script_1.default.reload(`${Env_3.default.URL_ORIGIN}style/index.js`);
        style.value = await new Promise((resolve_1, reject_1) => { require(['style'], resolve_1, reject_1); }).then(__importStar).then(module => module.default);
        writeChiridata();
    });
    Env_3.default.onLoad('dev', () => {
        Object.assign(window, { writeChiridata });
        writeChiridata();
    });
    function writeChiridata() {
        for (const attribute of [...document.documentElement.attributes])
            if (attribute.name.startsWith('chiridata:'))
                document.documentElement.removeAttribute(attribute.name);
        for (const component in style.value) {
            const classes = style.value[component];
            if (classes.length)
                document.documentElement.setAttribute(`chiridata:${component}`, JSON.stringify(classes));
        }
    }
    function StyleManipulator(component) {
        const styles = new Set();
        const currentClasses = [];
        const stateUnsubscribers = new WeakMap();
        const unbindPropertyState = {};
        if (Env_3.default.isDev)
            style.subscribe(component, () => updateClasses());
        const result = Object.assign(((...names) => {
            for (const name of names)
                styles.add(name);
            updateClasses();
            return component;
        }), {
            get: () => [...styles].sort(),
            remove(...names) {
                for (const name of names)
                    styles.delete(name);
                updateClasses();
                return component;
            },
            toggle(enabled, ...names) {
                if (enabled)
                    for (const name of names)
                        styles.add(name);
                else
                    for (const name of names)
                        styles.delete(name);
                updateClasses();
                return component;
            },
            bind(state, ...names) {
                if (!State_2.default.is(state))
                    return result.toggle(state, ...names);
                result.unbind(state);
                const unsubscribe = state.use(component, active => {
                    if (active)
                        for (const name of names)
                            styles.add(name);
                    else
                        for (const name of names)
                            styles.delete(name);
                    updateClasses();
                });
                stateUnsubscribers.set(state, [unsubscribe, names]);
                return component;
            },
            unbind(state) {
                const bound = state && stateUnsubscribers.get(state);
                if (!bound)
                    return component;
                const [unsubscribe, names] = bound;
                unsubscribe?.();
                stateUnsubscribers.delete(state);
                result.remove(...names);
                return component;
            },
            refresh: () => updateClasses(),
            hasProperty(property) {
                return component.element.style.getPropertyValue(property) !== '';
            },
            setProperty(property, value) {
                unbindPropertyState[property]?.();
                setProperty(property, value);
                return component;
            },
            toggleProperty(enabled, property, value) {
                enabled ??= !result.hasProperty(property);
                if (enabled === true)
                    return result.setProperty(property, enabled ? value : undefined);
                else
                    return result.removeProperties(property);
            },
            setVariable(variable, value) {
                return result.setProperty(`--${variable}`, value);
            },
            bindProperty(property, state) {
                unbindPropertyState[property]?.();
                if (State_2.default.is(state))
                    unbindPropertyState[property] = state.use(component, value => setProperty(property, value));
                else {
                    setProperty(property, state);
                    unbindPropertyState[property] = undefined;
                }
                return component;
            },
            bindVariable(variable, state) {
                return result.bindProperty(`--${variable}`, state);
            },
            removeProperties(...properties) {
                for (const property of properties)
                    component.element.style.removeProperty(property);
                return component;
            },
            removeVariables(...variables) {
                for (const variable of variables)
                    component.element.style.removeProperty(`--${variable}`);
                return component;
            },
        });
        return result;
        function updateClasses() {
            const stylesArray = [...styles];
            if (!component.attributes.has('component'))
                component.attributes.insertBefore('class', 'component');
            component.attributes.set('component', stylesArray.join(' '));
            const toAdd = stylesArray.flatMap(component => style.value[component]);
            const toRemove = currentClasses.filter(cls => !toAdd.includes(cls));
            if (toRemove)
                component.element.classList.remove(...toRemove);
            component.element.classList.add(...toAdd);
            currentClasses.push(...toAdd);
            return component;
        }
        function setProperty(property, value) {
            if (value === undefined || value === null)
                component.element.style.removeProperty(property);
            else
                component.element.style.setProperty(property, `${value}`);
        }
    }
    exports.default = StyleManipulator;
});
define("ui/component/core/Button", ["require", "exports", "ui/Component", "utility/State", "utility/Type"], function (require, exports, Component_2, State_3, Type_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Component_2 = __importDefault(Component_2);
    State_3 = __importDefault(State_3);
    Type_1 = __importDefault(Type_1);
    const Button = Component_2.default.Builder('button', (button) => {
        const disabledReasons = new Set();
        const disabled = State_3.default.Generator(() => !!disabledReasons.size);
        let icon;
        const unuseDisabledStateMap = new WeakMap();
        return button
            .attributes.set('type', 'button')
            .style('button')
            .style.bind(disabled, 'button--disabled')
            .attributes.bind(disabled, 'disabled')
            .extend(button => ({
            textWrapper: undefined,
            disabled,
            type: Object.assign((...types) => {
                for (const type of types)
                    button.style(`button-type-${type}`);
                return button;
            }, {
                remove(...types) {
                    for (const type of types)
                        button.style.remove(`button-type-${type}`);
                    return button;
                },
            }),
            setDisabled(newState, reason) {
                const size = disabledReasons.size;
                if (newState)
                    disabledReasons.add(reason);
                else
                    disabledReasons.delete(reason);
                if (disabledReasons.size !== size)
                    disabled.refresh();
                return button;
            },
            bindDisabled(state, reason) {
                unuseDisabledStateMap.get(state)?.();
                unuseDisabledStateMap.set(state, state.use(button, (newState, oldState) => {
                    if (typeof newState === 'string')
                        button.setDisabled(!!newState, newState || oldState);
                    else
                        button.setDisabled(!!newState, reason ?? '');
                }));
                return button;
            },
            unbindDisabled(state, reason) {
                unuseDisabledStateMap.get(state)?.();
                unuseDisabledStateMap.delete(state);
                button.setDisabled(false, reason ?? Type_1.default.as('string', state.value) ?? '');
                return button;
            },
            setIcon(newIcon) {
                if (icon)
                    button.style.remove(`button-icon-${icon}`);
                icon = newIcon;
                if (icon)
                    button.style(`button-icon-${icon}`)
                        .type('icon');
                else
                    button.type.remove('icon');
                return button;
            },
        }))
            .extendJIT('textWrapper', button => (0, Component_2.default)()
            .style('button-text')
            .appendTo(button));
    });
    exports.default = Button;
});
define("utility/EventManager", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EventManager = void 0;
    class EventManager {
        static global = EventManager.make();
        static make() {
            return new EventManager({});
        }
        static emit(target, event, init) {
            if (init instanceof Event)
                event = init;
            if (typeof event === 'string')
                event = new Event(event, { cancelable: true });
            if (typeof init === 'function')
                init?.(event);
            else if (init && event !== init)
                Object.assign(event, init);
            target?.dispatchEvent(event);
            return event;
        }
        host;
        _target;
        get target() {
            return this._target instanceof WeakRef ? this._target.deref() : this._target;
        }
        constructor(host, target = new EventTarget()) {
            this.host = new WeakRef(host);
            this._target = target;
        }
        subscribe(type, listener) {
            if (!Array.isArray(type))
                type = [type];
            for (const t of type)
                this.target?.addEventListener(t, listener);
            return this.host.deref();
        }
        subscriptions = {};
        subscribeOnce(types, listener) {
            if (!Array.isArray(types))
                types = [types];
            if (this.target) {
                const target = this.target;
                const subscriptions = this.subscriptions;
                function realListener(event) {
                    listener.call(this, event);
                    for (const type of types) {
                        subscriptions[type]?.delete(listener);
                        target?.removeEventListener(type, realListener);
                    }
                }
                for (const type of types) {
                    subscriptions[type] ??= new WeakMap();
                    subscriptions[type].set(listener, realListener);
                    this.target?.addEventListener(type, realListener);
                }
            }
            return this.host.deref();
        }
        unsubscribe(types, listener) {
            if (!Array.isArray(types))
                types = [types];
            for (const type of types) {
                this.target?.removeEventListener(type, listener);
                const realListener = this.subscriptions[type]?.get(listener);
                if (realListener) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                    this.target?.removeEventListener(type, realListener);
                    this.subscriptions[type].delete(listener);
                }
            }
            return this.host.deref();
        }
        async waitFor(types) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return new Promise(resolve => this.subscribeOnce(types, resolve));
        }
        until(promise, initialiser) {
            if (typeof promise !== 'object')
                promise = this.waitFor(promise);
            const manager = {
                subscribe: (type, listener) => {
                    this.subscribe(type, listener);
                    void (promise).then(() => this.unsubscribe(type, listener));
                    return manager;
                },
                subscribeOnce: (type, listener) => {
                    this.subscribeOnce(type, listener);
                    void (promise).then(() => this.unsubscribe(type, listener));
                    return manager;
                },
            };
            initialiser?.(manager);
            return this.host.deref();
        }
        emit(event, init) {
            event = EventManager.emit(this.target, event, init);
            // const pipeTargets = this.pipeTargets.get(event.type)
            // if (pipeTargets) {
            // 	for (let i = 0; i < pipeTargets.length; i++) {
            // 		const pipeTarget = pipeTargets[i].deref()
            // 		if (pipeTarget)
            // 			pipeTarget.dispatchEvent(event)
            // 		else
            // 			pipeTargets.splice(i--, 1)
            // 	}
            // 	if (!pipeTargets.length)
            // 		this.pipeTargets.delete(event.type)
            // }
            return this.host.deref();
        }
    }
    exports.EventManager = EventManager;
});
define("ui/InputBus", ["require", "exports", "ui/Component", "utility/EventManager"], function (require, exports, Component_3, EventManager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Component_3 = __importDefault(Component_3);
    var Classes;
    (function (Classes) {
        Classes["ReceiveFocusedClickEvents"] = "_receieve-focused-click-events";
    })(Classes || (Classes = {}));
    Component_3.default.extend(component => {
        component.extend(component => ({
            receiveFocusedClickEvents: () => component.classes.add(Classes.ReceiveFocusedClickEvents),
        }));
    });
    const MOUSE_KEYNAME_MAP = {
        [0]: 'MouseLeft',
        [1]: 'MouseMiddle',
        [2]: 'MouseRight',
        [3]: 'Mouse3',
        [4]: 'Mouse4',
        [5]: 'Mouse5',
        [`${undefined}`]: 'Mouse?',
    };
    let lastUsed = 0;
    const inputDownTime = {};
    const InputBus = Object.assign(EventManager_1.EventManager.make(), {
        getPressStart: (name) => inputDownTime[name],
        getPressDuration: (name) => inputDownTime[name] === undefined ? undefined : Date.now() - inputDownTime[name],
        isDown: (name) => !!inputDownTime[name],
        isUp: (name) => !inputDownTime[name],
    });
    function emitKeyEvent(e) {
        const target = e.target;
        const input = target.closest('input[type=text], textarea, [contenteditable]');
        let usedByInput = !!input;
        const isClick = true
            && !usedByInput
            && e.type === 'keydown'
            && (e.key === 'Enter' || e.key === 'Space')
            && !e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey
            && target.classList.contains(Classes.ReceiveFocusedClickEvents);
        if (isClick) {
            const result = target.component?.event.emit('click');
            if (result?.defaultPrevented) {
                e.preventDefault();
                return;
            }
        }
        const eventKey = e.key ?? MOUSE_KEYNAME_MAP[e.button];
        const eventType = e.type === 'mousedown' ? 'keydown' : e.type === 'mouseup' ? 'keyup' : e.type;
        if (eventType === 'keydown')
            inputDownTime[eventKey] = Date.now();
        let cancelInput = false;
        const event = {
            key: eventKey,
            ctrl: e.ctrlKey,
            shift: e.shiftKey,
            alt: e.altKey,
            used: usedByInput,
            input,
            use: (key, ...modifiers) => {
                if (event.used)
                    return false;
                const matches = event.matches(key, ...modifiers);
                if (matches)
                    event.used = true;
                return matches;
            },
            useOverInput: (key, ...modifiers) => {
                if (event.used && !usedByInput)
                    return false;
                const matches = event.matches(key, ...modifiers);
                if (matches) {
                    event.used = true;
                    usedByInput = false;
                }
                return matches;
            },
            matches: (key, ...modifiers) => {
                if (eventKey !== key)
                    return false;
                if (!modifiers.every(modifier => event[modifier]))
                    return false;
                return true;
            },
            cancelInput: () => cancelInput = true,
            hovering: selector => {
                const hovered = [...document.querySelectorAll(':hover')];
                return selector ? hovered[hovered.length - 1]?.closest(selector) ?? undefined : hovered[hovered.length - 1];
            },
        };
        if (eventType === 'keyup') {
            event.usedAnotherKeyDuring = lastUsed > (inputDownTime[eventKey] ?? 0);
            delete inputDownTime[eventKey];
        }
        InputBus.emit(eventType === 'keydown' ? 'down' : 'up', event);
        if ((event.used && !usedByInput) || (usedByInput && cancelInput)) {
            e.preventDefault();
            lastUsed = Date.now();
        }
        if (usedByInput) {
            if (e.type === 'keydown' && eventKey === 'Enter' && !event.shift && !event.alt) {
                const form = target.closest('form');
                if (form && (target.tagName.toLowerCase() === 'input' || target.closest('[contenteditable]')) && !event.ctrl) {
                    e.preventDefault();
                }
                else {
                    form?.requestSubmit();
                }
            }
        }
    }
    document.addEventListener('keydown', emitKeyEvent);
    document.addEventListener('keyup', emitKeyEvent);
    document.addEventListener('mousedown', emitKeyEvent);
    document.addEventListener('mouseup', emitKeyEvent);
    document.addEventListener('click', emitKeyEvent);
    Object.defineProperty(MouseEvent.prototype, 'used', {
        get() {
            return this._used ?? false;
        },
    });
    Object.defineProperty(MouseEvent.prototype, 'use', {
        value: function (key, ...modifiers) {
            if (this._used)
                return false;
            const matches = this.matches(key, ...modifiers);
            if (matches) {
                this._used = true;
                // allow click & contextmenu handlers to be considered "used" for IKeyUpEvents
                lastUsed = Date.now();
            }
            return matches;
        },
    });
    Object.defineProperty(MouseEvent.prototype, 'matches', {
        value: function (key, ...modifiers) {
            if (MOUSE_KEYNAME_MAP[this.button] !== key)
                return false;
            if (!modifiers.every(modifier => this[`${modifier}Key`]))
                return false;
            return true;
        },
    });
    exports.default = InputBus;
});
define("ui/utility/FocusListener", ["require", "exports", "utility/State"], function (require, exports, State_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    State_4 = __importDefault(State_4);
    var FocusListener;
    (function (FocusListener) {
        FocusListener.hasFocus = (0, State_4.default)(false);
        FocusListener.focused = (0, State_4.default)(undefined);
        FocusListener.focusedLast = (0, State_4.default)(undefined);
        function focusedComponent() {
            return FocusListener.focused.value?.component;
        }
        FocusListener.focusedComponent = focusedComponent;
        // interface QueuedFocusChange {
        // 	type: "focus" | "blur"
        // 	element: HTMLElement
        // }
        // let updatingFocusState = false
        // let cursor = 0
        // const queue: QueuedFocusChange[] = []
        function focus(element) {
            // if (updatingFocusState || exhaustingQueue) {
            // 	queue.splice(cursor, 0, { type: "focus", element })
            // 	cursor++
            // 	return
            // }
            focusInternal(element);
        }
        FocusListener.focus = focus;
        function focusInternal(element) {
            if (document.querySelector(':focus-visible') === element)
                return;
            element.focus();
        }
        function blur(element) {
            // if (updatingFocusState || exhaustingQueue) {
            // 	queue.splice(cursor, 0, { type: "blur", element })
            // 	cursor++
            // 	return
            // }
            blurInternal(element);
        }
        FocusListener.blur = blur;
        function blurInternal(element) {
            if (document.querySelector(':focus-visible') !== element)
                return;
            element.blur();
        }
        function listen() {
            document.addEventListener('focusin', onFocusIn);
            document.addEventListener('focusout', onFocusOut);
        }
        FocusListener.listen = listen;
        function onFocusIn() {
            updateFocusState();
        }
        function onFocusOut(event) {
            if (event.relatedTarget === null)
                updateFocusState();
        }
        // let exhaustingQueue = false
        function updateFocusState() {
            if (document.activeElement && document.activeElement !== document.body && location.hash && document.activeElement.id !== location.hash.slice(1))
                history.pushState(undefined, '', ' ');
            const newFocused = document.querySelector(':focus-visible') ?? undefined;
            if (newFocused === FocusListener.focused.value)
                return;
            // updatingFocusState = true
            const lastLastFocusedComponent = FocusListener.focusedLast.value?.component;
            if (lastLastFocusedComponent) {
                lastLastFocusedComponent.hadFocusedLast.asMutable?.setValue(false);
                for (const ancestor of lastLastFocusedComponent.getAncestorComponents())
                    ancestor.hadFocusedLast.asMutable?.setValue(false);
            }
            const lastFocusedComponent = FocusListener.focused.value?.component;
            const focusedComponent = newFocused?.component;
            const oldAncestors = !lastFocusedComponent ? undefined : [...lastFocusedComponent.getAncestorComponents()];
            const newAncestors = !focusedComponent ? undefined : [...focusedComponent.getAncestorComponents()];
            const lastFocusedContainsFocused = FocusListener.focused.value?.contains(newFocused ?? null);
            FocusListener.focusedLast.value = FocusListener.focused.value;
            FocusListener.focused.value = newFocused;
            FocusListener.hasFocus.value = !!newFocused;
            if (lastFocusedComponent) {
                if (!lastFocusedContainsFocused) {
                    if (!focusedComponent)
                        // setting "had focused" must happen before clearing "has focused"
                        // just in case anything is listening for hasFocused || hadFocusedLast
                        lastFocusedComponent.hadFocusedLast.asMutable?.setValue(true);
                    lastFocusedComponent.hasFocused.asMutable?.setValue(false);
                }
                lastFocusedComponent.focused.asMutable?.setValue(false);
            }
            if (focusedComponent) {
                focusedComponent.focused.asMutable?.setValue(true);
                focusedComponent.hasFocused.asMutable?.setValue(true);
            }
            if (oldAncestors)
                for (const ancestor of oldAncestors)
                    if (!newAncestors?.includes(ancestor))
                        if (ancestor) {
                            if (!focusedComponent)
                                // setting "had focused" must happen before clearing "has focused"
                                // just in case anything is listening for hasFocused || hadFocusedLast
                                ancestor.hadFocusedLast.asMutable?.setValue(true);
                            ancestor.hasFocused.asMutable?.setValue(false);
                        }
            if (newAncestors)
                for (const ancestor of newAncestors)
                    if (ancestor)
                        ancestor.hasFocused.asMutable?.setValue(true);
            // updatingFocusState = false
            // if (exhaustingQueue)
            // 	return
            // exhaustingQueue = true
            // for (cursor = 0; cursor < queue.length; cursor++) {
            // 	const change = queue[cursor]
            // 	if (change.type === "blur")
            // 		blurInternal(change.element)
            // 	else if (change.type === "focus")
            // 		focusInternal(change.element)
            // }
            // queue.splice(0, Infinity)
            // cursor = 0
            // exhaustingQueue = false
        }
    })(FocusListener || (FocusListener = {}));
    exports.default = FocusListener;
    Object.assign(window, { FocusListener });
});
define("utility/maths/Vector2", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function Vector2(x = 0, y) {
        if (y === undefined)
            y = x;
        return { x, y };
    }
    (function (Vector2) {
        ////////////////////////////////////
        //#region Constructors
        Vector2.ZERO = { x: 0, y: 0 };
        Vector2.ONE = { x: 1, y: 1 };
        function mutable(x = 0, y) {
            if (y === undefined)
                y = x;
            return { x, y };
        }
        Vector2.mutable = mutable;
        function fromClient(clientSource) {
            return { x: clientSource.clientX, y: clientSource.clientY };
        }
        Vector2.fromClient = fromClient;
        //#endregion
        ////////////////////////////////////
        function equals(v1, v2) {
            return v1.x === v2.x && v1.y === v2.y;
        }
        Vector2.equals = equals;
        function distance(v1, v2) {
            return Math.sqrt((v2.x - v1.x) ** 2 + (v2.y - v1.y) ** 2);
        }
        Vector2.distance = distance;
        function distanceWithin(within, v1, v2) {
            return (v2.x - v1.x) ** 2 + (v2.y - v1.y) ** 2 < within ** 2;
        }
        Vector2.distanceWithin = distanceWithin;
        function add(v1, v2) {
            return { x: v1.x + v2.x, y: v1.y + v2.y };
        }
        Vector2.add = add;
        function addInPlace(v1, v2) {
            v1.x += v2.x;
            v1.y += v2.y;
            return v1;
        }
        Vector2.addInPlace = addInPlace;
        function subtract(v1, v2) {
            return { x: v1.x - v2.x, y: v1.y - v2.y };
        }
        Vector2.subtract = subtract;
        function subtractInPlace(v1, v2) {
            v1.x -= v2.x;
            v1.y -= v2.y;
            return v1;
        }
        Vector2.subtractInPlace = subtractInPlace;
        function multiply(v, scalar) {
            return { x: v.x * scalar, y: v.y * scalar };
        }
        Vector2.multiply = multiply;
        function multiplyInPlace(v, scalar) {
            v.x *= scalar;
            v.y *= scalar;
            return v;
        }
        Vector2.multiplyInPlace = multiplyInPlace;
        function divide(v, scalar) {
            return { x: v.x / scalar, y: v.y / scalar };
        }
        Vector2.divide = divide;
        function divideInPlace(v, scalar) {
            v.x /= scalar;
            v.y /= scalar;
            return v;
        }
        Vector2.divideInPlace = divideInPlace;
        function modTruncate(v, scalar) {
            return { x: v.x % scalar, y: v.y % scalar };
        }
        Vector2.modTruncate = modTruncate;
        function modTruncateInPlace(v, scalar) {
            v.x %= scalar;
            v.y %= scalar;
            return v;
        }
        Vector2.modTruncateInPlace = modTruncateInPlace;
        function modFloor(v, scalar) {
            return {
                x: (v.x % scalar + scalar) % scalar,
                y: (v.y % scalar + scalar) % scalar,
            };
        }
        Vector2.modFloor = modFloor;
        function modFloorInPlace(v, scalar) {
            v.x = (v.x % scalar + scalar) % scalar;
            v.y = (v.y % scalar + scalar) % scalar;
            return v;
        }
        Vector2.modFloorInPlace = modFloorInPlace;
        function dot(v1, v2) {
            return v1.x * v2.x + v1.y * v2.y;
        }
        Vector2.dot = dot;
        /** IE, distance from 0,0 */
        function magnitude(v) {
            return Math.sqrt(v.x ** 2 + v.y ** 2);
        }
        Vector2.magnitude = magnitude;
        function normalise(v) {
            const magnitude = Vector2.magnitude(v);
            return Vector2.divide(v, magnitude);
        }
        Vector2.normalise = normalise;
        function normaliseInPlace(v) {
            const magnitude = Vector2.magnitude(v);
            return Vector2.divideInPlace(v, magnitude);
        }
        Vector2.normaliseInPlace = normaliseInPlace;
        function angle(v1, v2) {
            const dot = Vector2.dot(v1, v2);
            const lengths = Vector2.magnitude(v1) * Vector2.magnitude(v2);
            const cosTheta = Math.max(-1, Math.min(1, dot / lengths));
            return Math.acos(cosTheta);
        }
        Vector2.angle = angle;
        function rotate(v, angle) {
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            return {
                x: v.x * cos - v.y * sin,
                y: v.x * sin + v.y * cos,
            };
        }
        Vector2.rotate = rotate;
        function rotateInPlace(v, angle) {
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            const x = v.x;
            v.x = x * cos - v.y * sin;
            v.y = x * sin + v.y * cos;
            return v;
        }
        Vector2.rotateInPlace = rotateInPlace;
        function lerp(v1, v2, t) {
            return {
                x: v1.x + (v2.x - v1.x) * t,
                y: v1.y + (v2.y - v1.y) * t,
            };
        }
        Vector2.lerp = lerp;
        function clamp(v, min, max) {
            return {
                x: Math.min(Math.max(v.x, min.x), max.x),
                y: Math.min(Math.max(v.y, min.y), max.y),
            };
        }
        Vector2.clamp = clamp;
        function clampInPlace(v, min, max) {
            v.x = Math.min(Math.max(v.x, min.x), max.x);
            v.y = Math.min(Math.max(v.y, min.y), max.y);
            return v;
        }
        Vector2.clampInPlace = clampInPlace;
    })(Vector2 || (Vector2 = {}));
    exports.default = Vector2;
});
define("ui/utility/Mouse", ["require", "exports", "utility/State"], function (require, exports, State_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    State_5 = __importDefault(State_5);
    var Mouse;
    (function (Mouse) {
        const pos = { x: 0, y: 0 };
        Mouse.state = (0, State_5.default)(pos);
        const handlers = new Set();
        function onMove(handler) {
            handlers.add(handler);
        }
        Mouse.onMove = onMove;
        function offMove(handler) {
            handlers.delete(handler);
        }
        Mouse.offMove = offMove;
        function listen() {
            document.addEventListener('mousemove', event => {
                if (pos.x === event.clientX && pos.y === event.clientY)
                    return;
                pos.x = event.clientX;
                pos.y = event.clientY;
                Mouse.state.emit();
                for (const handler of handlers)
                    handler(pos);
            });
        }
        Mouse.listen = listen;
    })(Mouse || (Mouse = {}));
    exports.default = Mouse;
});
define("ui/utility/HoverListener", ["require", "exports", "ui/utility/Mouse"], function (require, exports, Mouse_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Mouse_1 = __importDefault(Mouse_1);
    var HoverListener;
    (function (HoverListener) {
        let lastHovered = [];
        function allHovered() {
            return lastHovered;
        }
        HoverListener.allHovered = allHovered;
        function hovered() {
            return lastHovered.at(-1);
        }
        HoverListener.hovered = hovered;
        function* allHoveredComponents() {
            for (const element of lastHovered) {
                const component = element.component;
                if (component)
                    yield component;
            }
        }
        HoverListener.allHoveredComponents = allHoveredComponents;
        function hoveredComponent() {
            return lastHovered.at(-1)?.component;
        }
        HoverListener.hoveredComponent = hoveredComponent;
        function listen() {
            Mouse_1.default.onMove(() => {
                const allHovered = document.querySelectorAll(':hover');
                const hovered = allHovered[allHovered.length - 1];
                if (hovered === lastHovered[lastHovered.length - 1])
                    return;
                const newHovered = [...allHovered];
                for (const element of lastHovered)
                    if (element.component && !newHovered.includes(element))
                        element.component.hovered.asMutable?.setValue(false);
                for (const element of newHovered)
                    if (element.component && !lastHovered.includes(element))
                        element.component.hovered.asMutable?.setValue(true);
                lastHovered = newHovered;
            });
        }
        HoverListener.listen = listen;
    })(HoverListener || (HoverListener = {}));
    exports.default = HoverListener;
    Object.assign(window, { HoverListener });
});
define("utility/Async", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Async;
    (function (Async) {
        async function sleep(ms, signal) {
            // let stack = new Error().stack;
            // stack = stack?.slice(stack.indexOf("\n") + 1);
            // stack = stack?.slice(stack.indexOf("\n") + 1);
            // stack = stack?.slice(0, stack.indexOf("\n"));
            // console.log("sleep", stack);
            if (!signal) {
                return new Promise(resolve => {
                    window.setTimeout(() => resolve(undefined), ms);
                });
            }
            if (signal.aborted) {
                return true;
            }
            return new Promise(resolve => {
                // eslint-disable-next-line prefer-const
                let timeoutId;
                const onAbort = () => {
                    window.clearTimeout(timeoutId);
                    resolve(true);
                };
                timeoutId = window.setTimeout(() => {
                    signal.removeEventListener('abort', onAbort);
                    resolve(false);
                }, ms);
                signal.addEventListener('abort', onAbort, { once: true });
            });
        }
        Async.sleep = sleep;
        function debounce(...args) {
            let ms;
            let callback;
            if (typeof args[0] === 'function') {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                [callback, ...args] = args;
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                return debounceByPromise(callback, ...args);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                [ms, callback, ...args] = args;
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return
                return debounceByTime(ms, callback, ...args);
            }
        }
        Async.debounce = debounce;
        const debouncedByTime = new WeakMap();
        function debounceByTime(ms, callback, ...args) {
            let info = debouncedByTime.get(callback);
            if (info && Date.now() - info.last < ms) {
                const callbackRef = new WeakRef(callback);
                callback = undefined;
                const newAbortController = new AbortController();
                info.queued = sleep(Date.now() - info.last + ms, newAbortController.signal).then(aborted => {
                    if (aborted) {
                        return info?.queued;
                    }
                    delete info.queued;
                    delete info.abortController;
                    info.last = Date.now();
                    return callbackRef.deref()?.(...args);
                });
                info.abortController?.abort();
                info.abortController = newAbortController;
                return info.queued;
            }
            if (!info) {
                debouncedByTime.set(callback, info = { last: 0 });
            }
            info.last = Date.now();
            return callback(...args);
        }
        const debouncedByPromise = new WeakMap();
        function debounceByPromise(callback, ...args) {
            const debounceInfo = debouncedByPromise.get(callback);
            if (debounceInfo?.nextQueued) {
                return debounceInfo.promise;
            }
            const callbackRef = new WeakRef(callback);
            callback = undefined;
            const realCallback = () => {
                try {
                    const callback = callbackRef.deref();
                    if (!callback) {
                        return;
                    }
                    const result = callback(...args);
                    const promise = Promise.resolve(result);
                    debouncedByPromise.set(callback, {
                        promise,
                        nextQueued: false,
                    });
                    callback = undefined;
                    promise.catch(reason => {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        window.dispatchEvent(new PromiseRejectionEvent('unhandledrejection', { promise, reason }));
                    });
                    return promise;
                }
                catch (error) {
                    window.dispatchEvent(new ErrorEvent('error', { error }));
                    return;
                }
            };
            if (debounceInfo) {
                debounceInfo.nextQueued = true;
                return debounceInfo.promise.catch(realCallback).then(realCallback);
            }
            else {
                return realCallback();
            }
        }
        function schedule(...args) {
            let ms = 0;
            let callback;
            let debounceMs = false;
            let signal;
            if (typeof args[0] === 'function') {
                // (cb, ...args)
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                [callback, ...args] = args;
            }
            else if (typeof args[1] === 'function') {
                // (ms, cb, ...args)
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                [ms, callback, ...args] = args;
            }
            else if (typeof args[2] === 'function') {
                // (ms, debounce | signal, cb, ...args)
                if (typeof args[1] === 'object') {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    [ms, signal, callback, ...args] = args;
                }
                else {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    [ms, debounceMs, callback, ...args] = args;
                }
            }
            else {
                // (ms, debounce, signal, cb, ...args)
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                [ms, debounceMs, signal, callback, ...args] = args;
            }
            if (debounceMs === true) {
                debounceMs = ms;
            }
            const cancelCallbacks = [];
            // eslint-disable-next-line prefer-const
            let timeoutId;
            const result = {
                cancelled: false,
                completed: false,
                cancel: () => {
                    if (result.cancelled || result.completed) {
                        return;
                    }
                    signal?.removeEventListener('abort', result.cancel);
                    result.cancelled = true;
                    window.clearTimeout(timeoutId);
                    for (const callback of cancelCallbacks) {
                        try {
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment
                            const result = callback(...args);
                            const promise = Promise.resolve(result);
                            promise.catch(reason => {
                                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                                window.dispatchEvent(new PromiseRejectionEvent('unhandledrejection', { promise, reason }));
                            });
                        }
                        catch (error) {
                            window.dispatchEvent(new ErrorEvent('error', { error }));
                        }
                    }
                    cancelCallbacks.length = 0;
                    args.length = 0;
                },
                onCancel: callback => {
                    if (result.completed) {
                        return result;
                    }
                    if (result.cancelled) {
                        try {
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                            const result = callback(...args);
                            const promise = Promise.resolve(result);
                            promise.catch(reason => {
                                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                                window.dispatchEvent(new PromiseRejectionEvent('unhandledrejection', { promise, reason }));
                            });
                        }
                        catch (error) {
                            window.dispatchEvent(new ErrorEvent('error', { error }));
                        }
                    }
                    else {
                        cancelCallbacks.push(callback);
                    }
                    return result;
                },
            };
            signal?.addEventListener('abort', result.cancel, { once: true });
            timeoutId = window.setTimeout(() => {
                if (result.cancelled) {
                    return;
                }
                signal?.removeEventListener('abort', result.cancel);
                result.completed = true;
                cancelCallbacks.length = 0;
                try {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment
                    const result = debounceMs ? debounce(debounceMs, callback, ...args) : callback(...args);
                    const promise = Promise.resolve(result);
                    promise.catch(reason => {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        window.dispatchEvent(new PromiseRejectionEvent('unhandledrejection', { promise, reason }));
                    });
                }
                catch (error) {
                    window.dispatchEvent(new ErrorEvent('error', { error }));
                }
            }, ms);
            return result;
        }
        Async.schedule = schedule;
        /**
         * Create an AbortSignal that will be emitted after `ms`.
         * @param ms The time until the signal will be emitted.
         * @param controller An optional existing `AbortController`.
         * @param message An optional custom timeout message.
         */
        function timeout(ms, controller = new AbortController(), message = `Timed out after ${ms} ms`) {
            schedule(ms, () => controller.abort(message));
            return controller.signal;
        }
        Async.timeout = timeout;
    })(Async || (Async = {}));
    exports.default = Async;
});
define("utility/Task", ["require", "exports", "utility/Async", "utility/Time"], function (require, exports, Async_1, Time_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Async_1 = __importDefault(Async_1);
    Time_3 = __importDefault(Time_3);
    const DEFAULT_INTERVAL = Time_3.default.seconds(1) / 144;
    class Task {
        interval;
        static async yield(instantIfUnsupported = false) {
            if (typeof scheduler !== 'undefined' && typeof scheduler.yield === 'function')
                return scheduler.yield();
            if (!instantIfUnsupported)
                await Async_1.default.sleep(1);
        }
        static post(callback, priority) {
            if (typeof scheduler === 'undefined' || typeof scheduler.postTask !== 'function')
                return callback();
            return scheduler.postTask(callback, { priority });
        }
        lastYieldEnd = Date.now();
        constructor(interval = DEFAULT_INTERVAL) {
            this.interval = interval;
        }
        reset() {
            this.lastYieldEnd = Date.now();
        }
        async yield(instantIfUnsupported = false) {
            if (Date.now() - this.lastYieldEnd > this.interval) {
                await Task.yield(instantIfUnsupported);
                this.lastYieldEnd = Date.now();
            }
        }
    }
    exports.default = Task;
});
define("ui/component/core/Popover", ["require", "exports", "ui/Component", "ui/InputBus", "ui/utility/FocusListener", "ui/utility/HoverListener", "ui/utility/Mouse", "utility/State", "utility/Task"], function (require, exports, Component_4, InputBus_1, FocusListener_1, HoverListener_1, Mouse_2, State_6, Task_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Component_4 = __importDefault(Component_4);
    InputBus_1 = __importDefault(InputBus_1);
    FocusListener_1 = __importDefault(FocusListener_1);
    HoverListener_1 = __importDefault(HoverListener_1);
    Mouse_2 = __importDefault(Mouse_2);
    State_6 = __importDefault(State_6);
    Task_1 = __importDefault(Task_1);
    const FOCUS_TRAP = (0, Component_4.default)()
        .tabIndex('auto')
        .ariaHidden()
        .style.setProperty('display', 'none')
        .prependTo(document.body);
    Component_4.default.extend(component => {
        component.extend((component) => ({
            clearPopover: () => component
                .attributes.set('data-clear-popover', 'true'),
            setPopover: (popoverEvent, initialiser) => {
                if (component.popover)
                    component.popover.remove();
                let isShown = false;
                const popover = Popover()
                    .anchor.from(component)
                    .setOwner(component)
                    .tweak(initialiser, component)
                    .event.subscribe('toggle', e => {
                    const event = e;
                    if (event.newState === 'closed') {
                        isShown = false;
                        component.clickState = false;
                        Mouse_2.default.offMove(updatePopoverState);
                    }
                })
                    .appendTo(document.body);
                if (popoverEvent === 'hover' && !component.popover)
                    component.hoveredOrFocused.subscribe(component, updatePopoverState);
                const ariaLabel = component.attributes.getUsing('aria-label') ?? popover.attributes.get('aria-label');
                const ariaRole = popover.attributes.getUsing('role') ?? popover.attributes.get('role');
                component.ariaLabel.use((quilt, { arg }) => quilt['component/popover/button'](arg(ariaLabel), arg(ariaRole)));
                popover.ariaLabel.use((quilt, { arg }) => quilt['component/popover'](arg(ariaLabel)));
                component.clickState = false;
                if (!component.popover) {
                    component.event.subscribe('click', async (event) => {
                        // always subscribe click because we need to handle it for keyboard navigation
                        if (!component.focused.value && popoverEvent !== 'click')
                            return;
                        event.stopPropagation();
                        event.preventDefault();
                        component.clickState = true;
                        component.popover?.show();
                        component.popover?.focus();
                        component.popover?.style.removeProperties('left', 'top');
                        await Task_1.default.yield();
                        component.popover?.anchor.apply();
                    });
                    component.receiveAncestorInsertEvents();
                    component.event.subscribe(['insert', 'ancestorInsert'], updatePopoverParent);
                }
                popover.popoverHasFocus.subscribe(component, hasFocused => {
                    if (hasFocused)
                        return;
                    component.clickState = false;
                    component.popover?.hide();
                    component.focus();
                });
                return component.extend(component => ({
                    popover,
                    popoverDescendants: [],
                    tweakPopover: initialiser => {
                        initialiser(component.popover, component);
                        return component;
                    },
                }));
                function updatePopoverParent() {
                    if (!component.popover)
                        return;
                    const oldParent = component.popover.popoverParent.value;
                    component.popover.popoverParent.asMutable?.setValue(component.closest(Popover));
                    if (oldParent && oldParent !== component.popover.popoverParent.value)
                        oldParent.popoverChildren.asMutable?.setValue(oldParent.popoverChildren.value.filter(c => c !== component.popover));
                    if (component.popover.popoverParent.value && component.popover.popoverParent.value !== oldParent)
                        component.popover.popoverParent.value.popoverChildren.asMutable?.setValue([...component.popover.popoverParent.value.popoverChildren.value, component.popover]);
                }
                async function updatePopoverState() {
                    if (!component.popover)
                        return;
                    const shouldShow = false
                        || component.hoveredOrFocused.value
                        || (true
                            && isShown
                            && (false
                                || (component.popover.isMouseWithin(true) && !shouldClearPopover())
                                || InputBus_1.default.isDown('F4')))
                        || !!component.clickState;
                    if (isShown === shouldShow)
                        return;
                    if (component.hoveredOrFocused.value && !isShown)
                        Mouse_2.default.onMove(updatePopoverState);
                    if (!shouldShow)
                        Mouse_2.default.offMove(updatePopoverState);
                    if (!shouldShow)
                        FOCUS_TRAP.style.setProperty('display', 'none');
                    isShown = shouldShow;
                    component.popover.toggle(shouldShow);
                    if (!shouldShow)
                        return;
                    FOCUS_TRAP.style.setProperty('display', 'inline');
                    component.popover.style.removeProperties('left', 'top');
                    await Task_1.default.yield();
                    component.popover.anchor.apply();
                }
                function shouldClearPopover() {
                    if (!component.popover)
                        return false;
                    const hovered = HoverListener_1.default.hovered() ?? null;
                    if (component.element.contains(hovered) || component.popover.element.contains(hovered))
                        return false;
                    const clearsPopover = hovered?.closest('[data-clear-popover]');
                    if (!clearsPopover)
                        return false;
                    const clearsPopoverWithinPopover = clearsPopover.component?.closest(Popover);
                    if (component.popover.containsPopoverDescendant(clearsPopoverWithinPopover))
                        return false;
                    return true;
                }
            },
        }));
    });
    const Popover = Component_4.default.Builder((component) => {
        let mousePadding;
        let unbind;
        const visible = (0, State_6.default)(false);
        let shouldCloseOnInput = true;
        let normalStacking = false;
        const popover = component
            .style('popover')
            .tabIndex('programmatic')
            .attributes.set('popover', 'manual')
            .extend(popover => ({
            visible,
            popoverChildren: (0, State_6.default)([]),
            popoverParent: (0, State_6.default)(undefined),
            popoverHasFocus: FocusListener_1.default.focused.map(popover, focused => visible.value && containsPopoverDescendant(focused)),
            setCloseOnInput(closeOnInput = true) {
                shouldCloseOnInput = closeOnInput;
                return popover;
            },
            setMousePadding: padding => {
                mousePadding = padding;
                return popover;
            },
            setNormalStacking() {
                popover.style('popover--normal-stacking');
                popover.attributes.remove('popover');
                normalStacking = true;
                togglePopover(visible.value);
                return popover;
            },
            isMouseWithin: (checkDescendants = false) => {
                if (popover.rect.value.expand(mousePadding ?? 100).intersects(Mouse_2.default.state.value))
                    return true;
                if (checkDescendants)
                    for (const child of popover.popoverChildren.value)
                        if (child.isMouseWithin(true))
                            return true;
                return false;
            },
            containsPopoverDescendant,
            show: () => {
                unbind?.();
                togglePopover(true);
                popover.visible.asMutable?.setValue(true);
                return popover;
            },
            hide: () => {
                unbind?.();
                togglePopover(false);
                popover.visible.asMutable?.setValue(false);
                return popover;
            },
            toggle: shown => {
                unbind?.();
                togglePopover(shown);
                popover.visible.asMutable?.setValue(shown ?? !popover.visible.value);
                return popover;
            },
            bind: state => {
                unbind?.();
                unbind = state.use(popover, shown => {
                    togglePopover(shown);
                    popover.visible.asMutable?.setValue(shown);
                });
                return popover;
            },
            unbind: () => {
                unbind?.();
                return popover;
            },
        }));
        popover.event.subscribe('toggle', event => {
            popover.visible.asMutable?.setValue(event.newState === 'open');
        });
        popover.onRooted(() => {
            InputBus_1.default.subscribe('down', onInputDown);
            popover.removed.awaitManual(true, () => InputBus_1.default.unsubscribe('down', onInputDown));
        });
        return popover;
        function togglePopover(shown) {
            if (normalStacking)
                popover.style.toggle(!shown, 'popover--normal-stacking--hidden');
            else
                popover.element.togglePopover(shown);
        }
        function onInputDown(event) {
            if (!popover.visible.value || !shouldCloseOnInput)
                return;
            if (!event.key.startsWith('Mouse') || popover.containsPopoverDescendant(HoverListener_1.default.hovered()))
                return;
            popover.element.togglePopover(false);
            popover.visible.asMutable?.setValue(false);
        }
        function containsPopoverDescendant(descendant) {
            if (!descendant)
                return false;
            const node = Component_4.default.is(descendant) ? descendant.element : descendant;
            if (popover.element.contains(node))
                return true;
            for (const child of popover.popoverChildren.value)
                if (child === descendant)
                    return true;
                else if (child.containsPopoverDescendant(descendant))
                    return true;
            return false;
        }
    });
    exports.default = Popover;
});
define("ui/component/core/ext/CanHasActionsMenuButton", ["require", "exports", "ui/Component", "ui/component/core/Button"], function (require, exports, Component_5, Button_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Component_5 = __importDefault(Component_5);
    Button_1 = __importDefault(Button_1);
    const CanHasActionsMenuButton = Component_5.default.Extension((component, inserter) => {
        let actionsMenuPopoverInitialiser = () => { };
        return component
            .extend(component => ({
            actionsMenuButton: undefined,
            setActionsMenu(initialiser) {
                actionsMenuPopoverInitialiser = initialiser;
                component.actionsMenuButton.setPopover('click', (popover, button) => {
                    popover.anchor.add('off right', 'aligned top');
                    popover.anchor.add('off right', 'aligned bottom');
                    initialiser(popover, button);
                });
                return component;
            },
        }))
            .extendJIT('actionsMenuButton', component => {
            const button = (0, Button_1.default)()
                .style('block-actions-menu-button')
                .setIcon('ellipsis-vertical')
                .setPopover('click', actionsMenuPopoverInitialiser);
            if (inserter)
                inserter(button);
            else
                button.appendTo(component);
            return button;
        });
    });
    exports.default = CanHasActionsMenuButton;
});
define("utility/string/MarkdownItHTML", ["require", "exports", "entities"], function (require, exports, entities_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    entities_1 = __importDefault(entities_1);
    const html = Object.assign(((md, options) => {
        const state = {
            block: undefined,
            inline: undefined,
            i: 0,
            l: 0,
            e: 0,
            src: '',
            silent: false,
            options: {
                ...html.defaultOptions,
                ...options,
            },
        };
        md.block.ruler.at('html_block', (block, startLine, endLine, silent) => {
            state.block = block;
            state.src = state.block.src;
            state.l = startLine;
            state.i = state.block.bMarks[state.l] + state.block.tShift[state.l];
            state.e = state.src.length;
            state.silent = silent;
            const result = html.consumeBlock(state);
            state.block = undefined;
            return result;
        }, { alt: ['paragraph'] });
        md.inline.ruler.at('html_inline', (inline, silent) => {
            state.inline = inline;
            state.e = inline.posMax;
            state.i = inline.pos;
            state.src = inline.src;
            state.silent = silent;
            const result = html.consumeInline(state);
            state.inline = undefined;
            return result;
        });
    }), {
        regexCSSProperty: /^[-a-zA-Z_][a-zA-Z0-9_-]*$/,
        defaultOptions: {
            voidElements: [
                'area',
                'base',
                'br',
                'col',
                'embed',
                'hr',
                'img',
                'input',
                'link',
                'meta',
                'source',
                'track',
                'wbr',
            ],
            allowedTags: [
                // headings
                'hgroup',
                'h1',
                'h2',
                'h3',
                'h4',
                'h5',
                'h6',
                // layout
                'div',
                'p',
                'br',
                'wbr',
                'hr',
                'details',
                'summary',
                'label',
                // lists
                'ol',
                'ul',
                'li',
                // tables
                'table',
                'tr',
                'th',
                'td',
                'caption',
                'thead',
                'tbody',
                'tfoot',
                // text
                'span',
                // text style
                'i',
                'b',
                'u',
                's',
                'strike',
                'sup',
                'sub',
                'em',
                'mark',
                'small',
                'strong',
                // quoting/referencing
                'q',
                'cite',
                'blockquote',
                // links
                'a',
                // definitions
                'abbr',
                'dfn',
                'dd',
                'dt',
                'dl',
                // code
                'code',
                'samp',
                'kbd',
                // images
                'img',
                'figure',
                'figcaption',
                'area',
                'map',
            ],
            allTagsAllowedAttributes: [
                'title',
                'name',
                'style',
                'aria-label',
                'aria-labelledby',
                'aria-describedby',
                'aria-hidden',
            ],
            allTagsAllowedAttributeValues: {},
            perTagAllowedAttributes: {
                a: ['href'],
                img: ['src', 'alt', 'usemap', 'width', 'height'],
                area: ['shape', 'coords'],
                details: ['open'],
                ol: ['type', 'start', 'reversed'],
                li: ['value'],
                th: ['colspan', 'rowspan', 'headers', 'scope', 'abbr'],
                td: ['colspan', 'rowspan', 'headers'],
                q: ['cite'],
            },
            perTagAllowedAttributeValues: {
                a: { href: /^https?:/ },
                img: { src: /^https?:/ },
                area: { href: /^https?:/ },
                q: { cite: /^https?:/ },
                blockquote: { cite: /^https?:/ },
            },
            allTagsAllowedStyleProperties: [
                'color',
                'text-align',
                'font-family',
                'font-style',
                'font-weight',
                'text-decoration',
                'text-transform',
                'line-height',
                'letter-spacing',
                'word-spacing',
                'vertical-align',
                'background-color',
                'opacity',
                'margin',
                'padding',
                'width',
                'height',
                'vertical-align',
                'box-shadow',
                'border-width',
                'border-style',
                'border-color',
                'border-radius',
                'text-indent',
                'display',
                'position',
            ],
            allTagsAllowedStylePropertyValues: {
                position: ['relative', 'absolute', 'sticky'],
            },
            perTagAllowedStyleProperties: {},
            perTagAllowedStylePropertyValues: {},
        },
        Options(options) {
            const factory = Object.assign({ ...structuredClone(html.defaultOptions), ...options }, {
                disallowTags(...tags) {
                    const disallowed = tags.map(tag => tag.toLowerCase());
                    factory.allowedTags = factory.allowedTags.filter(tag => !disallowed.includes(tag));
                    return factory;
                },
                allowTags(...tags) {
                    factory.allowedTags = [...new Set([...factory.allowedTags, ...tags.map(tag => tag.toLowerCase())])];
                    return factory;
                },
                disallowAttributes(...attributes) {
                    const disallowed = attributes.map(attr => attr.toLowerCase());
                    factory.allTagsAllowedAttributes = factory.allTagsAllowedAttributes.filter(attr => !disallowed.includes(attr));
                    for (const [tag, allowedAttributes] of Object.entries(factory.perTagAllowedAttributes))
                        factory.perTagAllowedAttributes[tag] = allowedAttributes.filter(attr => !disallowed.includes(attr));
                    return factory;
                },
                allowAttributes(...attributes) {
                    factory.allTagsAllowedAttributes = [...new Set([...factory.allTagsAllowedAttributes, ...attributes.map(attr => attr.toLowerCase())])];
                    return factory;
                },
            });
            return factory;
        },
        use(md, options) {
            return md.use(html, options);
        },
        consumeBlock(state) {
            if (!state.block)
                return false;
            html.consumeInlineWhitespace(state);
            if (state.silent)
                return html.consumeTerminator(state);
            const result = html.consumeTagsLine(state);
            if (!result)
                return false;
            state.l++;
            state.block.line = state.l;
            const indent = html.consumeInlineWhitespace(state) || 0;
            if (indent >= state.block.blkIndent + 4)
                state.block.blkIndent = indent - 4; // allow for indented code blocks within html block
            else
                state.block.blkIndent = indent;
            return true;
        },
        consumeInline(state) {
            if (!state.inline || state.src[state.i] !== '<')
                return false;
            const tag = html.consumeTag(state);
            if (!tag)
                return false;
            state.inline.pos = state.i;
            return true;
        },
        consumeTerminator(state) {
            const noSetBlockIndent = new Error().stack?.split('\n')?.at(4)?.includes('Array.lheading');
            const indent = html.consumeInlineWhitespace(state) || 0;
            if (!html.consumeTagsLine(state))
                return false;
            if (!noSetBlockIndent && state.block)
                state.block.blkIndent = indent;
            return true;
        },
        consumeTagsLine(state) {
            let consumed = false;
            const tokens = [];
            let token;
            while ((token = html.consumeTag(state))) {
                if (typeof token === 'object')
                    tokens.push(token);
                consumed = true;
                html.consumeInlineWhitespace(state);
            }
            if (!consumed)
                return undefined;
            if (state.i < state.src.length && !html.consumeNewline(state)) {
                // a line of tags MUST end in a newline — if this doesn't, remove all the tokens we added and don't match
                if (tokens.length)
                    state.block?.tokens.splice(0, Infinity, ...state.block.tokens
                        .filter(token => !tokens.includes(token)));
                return undefined;
            }
            return {
                tokens,
            };
        },
        consumeNewline(state) {
            if (state.inline)
                return false;
            if (state.src[state.i] === '\n') {
                state.i++;
                return true;
            }
            if (state.src[state.i] !== '\r')
                return false;
            state.i++;
            if (state.src[state.i] === '\n')
                state.i++;
            return true;
        },
        consumeWhitespace(state) {
            if (state.inline)
                return !!html.consumeInlineWhitespace(state);
            const start = state.i;
            if (state.i >= state.e)
                return false;
            for (state.i; state.i < state.e; state.i++) {
                if (!html.isWhitespace(state))
                    break;
                if (html.consumeNewline(state)) {
                    state.l++;
                    state.i--;
                }
            }
            return state.i > start;
        },
        consumeInlineWhitespace(state) {
            if (state.i >= state.e)
                return undefined;
            let indent = 0;
            for (state.i; state.i < state.e; state.i++) {
                if (state.src[state.i] === ' ')
                    indent++;
                else if (state.src[state.i] === '\t')
                    indent += 4;
                else
                    break;
            }
            return indent || undefined;
        },
        consumeTag(state) {
            if (state.src[state.i] !== '<')
                return undefined;
            state.i++;
            return html.consumeOpenTag(state) ?? html.consumeCloseTag(state);
        },
        consumeOpenTag(state) {
            const start = state.i;
            const tagNameRaw = html.consumeTagName(state);
            if (!tagNameRaw)
                return undefined;
            const tagName = tagNameRaw.toLowerCase();
            const o = state.options;
            if (!o.allowedTags.includes(tagNameRaw)) {
                state.i = start;
                return undefined;
            }
            const attributes = [];
            let style;
            while (html.consumeWhitespace(state)) {
                const attribute = html.consumeAttribute(state);
                if (!attribute)
                    break;
                let [name, value] = attribute;
                name = name.toLowerCase();
                if (!o.allTagsAllowedAttributes.includes(name) && !o.perTagAllowedAttributes[tagName]?.includes(name))
                    continue;
                value = entities_1.default.decodeHTML5Strict(value);
                if (name !== 'style') {
                    const allowedValues = o.perTagAllowedAttributeValues[tagName]?.[name] ?? o.allTagsAllowedAttributeValues[name];
                    if (allowedValues !== undefined && !html.matchesAllowedValues(value, allowedValues))
                        continue;
                    attributes.push(attribute);
                    continue;
                }
                style = html.parseStyleAttributeValue(value);
                let styleValue = '';
                for (let [property, value] of style) {
                    property = property.toLowerCase();
                    if (!o.allTagsAllowedStyleProperties.includes(property) && !o.perTagAllowedStyleProperties[tagName]?.includes(property))
                        continue;
                    const importantToken = '!important';
                    const important = value.slice(-importantToken.length).toLowerCase() === importantToken;
                    if (important)
                        value = value.slice(0, -importantToken.length).trim();
                    const allowedValues = o.perTagAllowedStylePropertyValues[tagName]?.[property] ?? o.allTagsAllowedStylePropertyValues[property];
                    if (allowedValues !== undefined && !html.matchesAllowedValues(value, allowedValues))
                        continue;
                    styleValue += `${property}:${value}${important ? importantToken : ''};`;
                }
                if (styleValue.length)
                    attributes.push(['style', styleValue.slice(0, -1)]);
            }
            if (state.src[state.i] === '/')
                state.i++;
            if (state.src[state.i] !== '>') {
                state.i = start;
                return undefined;
            }
            state.i++;
            const nesting = state.options.voidElements.includes(tagName) ? 0 : 1;
            if (state.silent)
                return true;
            let type = `html_${state.block ? 'block' : 'inline'}${nesting ? '_open' : ''}`;
            if (tagName === 'br')
                type = 'softbreak';
            const mdState = state.block ?? state.inline;
            const token = mdState.push(type, tagName, nesting);
            Object.assign(token, {
                style,
                raw: state.src.slice(start - 1, state.i),
            });
            for (const attribute of attributes)
                token.attrPush(attribute);
            return token;
        },
        consumeCloseTag(state) {
            const start = state.i;
            if (state.src[state.i] !== '/')
                return undefined;
            state.i++;
            const tagNameRaw = html.consumeTagName(state);
            if (!tagNameRaw)
                return undefined;
            if (state.src[state.i] !== '>') {
                state.i = start;
                return undefined;
            }
            state.i++;
            const tagName = tagNameRaw.toLowerCase();
            if (!state.options.allowedTags.includes(tagName)) {
                state.i = start;
                return undefined;
            }
            if (state.silent || state.options.voidElements.includes(tagName))
                return true;
            const type = `html_${state.block ? 'block' : 'inline'}_close`;
            const mdState = state.block ?? state.inline;
            const token = mdState.push(type, tagName, -1);
            Object.assign(token, { raw: state.src.slice(start - 1, state.i) });
            if (state.inline && !state.inline.delimiters)
                state.inline.delimiters = [];
            return token;
        },
        consumeTagName(state) {
            const start = state.i;
            if (state.i >= state.e)
                return undefined;
            if (!html.isAlpha(state))
                return undefined;
            for (state.i++; state.i < state.e; state.i++)
                if (!html.isAlphaNumeric(state))
                    break;
            return state.src.slice(start, state.i);
        },
        consumeAttribute(state) {
            const start = state.i;
            const name = html.consumeAttributeName(state);
            if (!name)
                return undefined;
            const valueStart = state.i;
            html.consumeWhitespace(state);
            if (state.src[state.i] !== '=') {
                state.i = valueStart;
                return [name, ''];
            }
            state.i++;
            html.consumeWhitespace(state);
            const value = html.consumeAttributeValue(state);
            if (!value) {
                state.i = start;
                return undefined;
            }
            return [name, value];
        },
        consumeAttributeName(state) {
            const start = state.i;
            if (state.i >= state.e)
                return undefined;
            for (state.i; state.i < state.e; state.i++) {
                const charCode = state.src.charCodeAt(state.i);
                const isInvalidChar = false
                    || charCode === 0x0020 // SPACE
                    || charCode === 0x0022 // "
                    || charCode === 0x0027 // '
                    || charCode === 0x003E // >
                    || charCode === 0x002F // /
                    || charCode === 0x003D // =
                    || html.isNonCharacter(state, charCode)
                    || html.isControl(state, charCode);
                if (isInvalidChar)
                    break;
            }
            return state.i > start ? state.src.slice(start, state.i) : undefined;
        },
        consumeAttributeValue(state) {
            return false
                || html.consumeUnquotedAttributeValue(state)
                || html.consumeQuotedAttributeValue(state)
                || undefined;
        },
        consumeUnquotedAttributeValue(state) {
            let result = '';
            while (state.i < state.e) {
                const charCode = state.src.charCodeAt(state.i);
                // Check for invalid characters in unquoted attribute values
                const isInvalidChar = false
                    || charCode === 0x0022 // "
                    || charCode === 0x0027 // '
                    || charCode === 0x003D // =
                    || charCode === 0x003C // <
                    || charCode === 0x003E // >
                    || charCode === 0x0060 // `
                    || html.isWhitespace(state, charCode); // ASCII whitespace
                if (isInvalidChar)
                    break;
                if (charCode !== 0x0026) { // not &
                    result += state.src[state.i];
                    state.i++;
                    continue;
                }
                const charRef = html.consumeCharacterReference(state);
                if (!charRef) {
                    result += '&amp;';
                    state.i++;
                    continue;
                }
                result += charRef;
                // `i` is already at the next pos
            }
            return result || undefined;
        },
        consumeQuotedAttributeValue(state) {
            const start = state.i;
            const quoteChar = state.src[state.i];
            if (quoteChar !== '\'' && quoteChar !== '"')
                return undefined;
            state.i++;
            let result = '';
            while (state.i < state.e) {
                const charCode = state.src.charCodeAt(state.i);
                if (state.src[state.i] === quoteChar) {
                    state.i++;
                    return result;
                }
                if (charCode !== 0x0026) { // not &
                    const charStart = state.i;
                    if (html.consumeNewline(state)) {
                        state.l++;
                        result += state.src.slice(charStart, state.i);
                        continue;
                    }
                    const isNewlineInInlineMode = state.inline && html.isWhitespace(state) && state.src[state.i] !== ' ' && state.src[state.i] !== '\t';
                    if (isNewlineInInlineMode) {
                        state.i = start;
                        return undefined;
                    }
                    result += state.src[state.i];
                    state.i++;
                    continue;
                }
                const charRef = html.consumeCharacterReference(state);
                if (!charRef) {
                    result += '&amp;';
                    state.i++;
                    continue;
                }
                result += charRef;
                // `i` is already at the next pos
            }
            // no closing quote before the end of `src`
            state.i = start;
            return undefined;
        },
        consumeCharacterReference(state) {
            const start = state.i;
            if (state.src[state.i] !== '&')
                return undefined;
            state.i++;
            const isValid = html.consumeNumericCharacterReference(state) || html.consumeNamedCharacterReference(state);
            if (!isValid) {
                state.i = start;
                return undefined;
            }
            return state.src.slice(start, state.i);
        },
        consumeNamedCharacterReference(state) {
            const nameStart = state.i;
            for (state.i; state.i < state.e; state.i++)
                if (!html.isAlpha(state))
                    break;
            if (state.i === nameStart || state.src[state.i] !== ';')
                return false;
            state.i++;
            return true;
        },
        consumeNumericCharacterReference(state) {
            if (state.src[state.i] !== '#')
                return false;
            state.i++;
            const isHex = state.src[state.i] === 'x' || state.src[state.i] === 'X';
            if (isHex)
                state.i++;
            const digitsStart = state.i;
            for (state.i; state.i < state.e; state.i++)
                if (isHex ? !html.isHexadecimal(state) : !html.isNumeric(state))
                    break;
            if (state.i === digitsStart || state.src[state.i] !== ';')
                return false;
            const codePoint = parseInt(state.src.slice(digitsStart, state.i), isHex ? 16 : 10);
            if (codePoint === 0x000D || html.isNonCharacter(state, codePoint) || (html.isControl(state, codePoint) && !html.isWhitespace(state, codePoint)))
                return false;
            state.i++;
            return true;
        },
        parseStyleAttributeValue: ((style) => {
            if (style === undefined || style === null)
                return undefined;
            const styles = new Map();
            let key = '';
            let value = '';
            let inValue = false;
            let isEscaped = false;
            let isQuoted = false;
            let isComment = false;
            let quoteChar = '';
            let parenCount = 0;
            for (let i = 0; i < style.length; i++) {
                const char = style[i];
                if (isComment) {
                    if (char !== '*' && style[i + 1] !== '/')
                        continue;
                    isComment = false;
                    i++;
                    continue;
                }
                if (char === '\\') {
                    isEscaped = true;
                    continue;
                }
                if (isEscaped) {
                    value += char;
                    isEscaped = false;
                    continue;
                }
                if (!isComment && char === '/' && style[i + 1] === '*') {
                    isComment = true;
                    i++;
                    continue;
                }
                if (isQuoted) {
                    if (char === quoteChar) {
                        isQuoted = false;
                        value += char;
                        continue;
                    }
                }
                else {
                    if (char === '"' || char === '\'') {
                        isQuoted = true;
                        quoteChar = char;
                        value += char;
                        continue;
                    }
                }
                if (char === '(' && !isQuoted) {
                    parenCount++;
                    value += char;
                    continue;
                }
                if (char === ')' && !isQuoted) {
                    parenCount--;
                    value += char;
                    continue;
                }
                if (char === ':' && !isQuoted && parenCount === 0) {
                    inValue = true;
                    continue;
                }
                if (char === ';' && !isQuoted && parenCount === 0) {
                    if (key && value) {
                        key = key.trim();
                        if (!html.regexCSSProperty.test(key))
                            console.warn(`Invalid CSS property "${key}"`);
                        else
                            styles.set(key, value.trim());
                        key = '';
                        value = '';
                    }
                    inValue = false;
                    continue;
                }
                if (inValue) {
                    value += char;
                }
                else {
                    key += char;
                }
            }
            if (key && value) {
                key = key.trim();
                if (!html.regexCSSProperty.test(key))
                    console.warn(`Invalid CSS property "${key}"`);
                else
                    styles.set(key, value.trim());
            }
            return styles;
        }),
        isAlpha(state, charCode = state.src.charCodeAt(state.i)) {
            return (charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122); // A-Z, a-z
        },
        isNumeric(state, charCode = state.src.charCodeAt(state.i)) {
            return charCode >= 48 && charCode <= 57;
        },
        isHexadecimal(state, charCode = state.src.charCodeAt(state.i)) {
            return (charCode >= 65 && charCode <= 70) || (charCode >= 97 && charCode <= 102) || html.isNumeric(state, charCode);
        },
        isAlphaNumeric(state, charCode = state.src.charCodeAt(state.i)) {
            return html.isAlpha(state, charCode) || html.isNumeric(state, charCode);
        },
        isNonCharacter(state, charCode = state.src.charCodeAt(state.i)) {
            return false
                || (charCode >= 0xFDD0 && charCode <= 0xFDEF)
                || charCode === 0xFFFE || charCode === 0xFFFF
                || charCode === 0x1FFFE || charCode === 0x1FFFF
                || charCode === 0x2FFFE || charCode === 0x2FFFF
                || charCode === 0x3FFFE || charCode === 0x3FFFF
                || charCode === 0x4FFFE || charCode === 0x4FFFF
                || charCode === 0x5FFFE || charCode === 0x5FFFF
                || charCode === 0x6FFFE || charCode === 0x6FFFF
                || charCode === 0x7FFFE || charCode === 0x7FFFF
                || charCode === 0x8FFFE || charCode === 0x8FFFF
                || charCode === 0x9FFFE || charCode === 0x9FFFF
                || charCode === 0xAFFFE || charCode === 0xAFFFF
                || charCode === 0xBFFFE || charCode === 0xBFFFF
                || charCode === 0xCFFFE || charCode === 0xCFFFF
                || charCode === 0xDFFFE || charCode === 0xDFFFF
                || charCode === 0xEFFFE || charCode === 0xEFFFF
                || charCode === 0xFFFFE || charCode === 0xFFFFF
                || charCode === 0x10FFFE || charCode === 0x10FFFF;
        },
        isControl(state, charCode = state.src.charCodeAt(state.i)) {
            return false
                || (charCode >= 0x0000 && charCode <= 0x001F)
                || (charCode >= 0x007F && charCode <= 0x009F);
        },
        isWhitespace(state, charCode = state.src.charCodeAt(state.i)) {
            return false
                || charCode === 0x0009 // TAB
                || charCode === 0x000A // LF
                || charCode === 0x000C // FF
                || charCode === 0x000D // CR
                || charCode === 0x0020; // SPACE
        },
        matchesAllowedValues(value, allowed) {
            if (Array.isArray(allowed))
                return allowed.some(allowed => html.matchesAllowedValues(value, allowed));
            if (typeof allowed === 'string')
                return value === allowed;
            if (typeof allowed === 'function')
                return allowed(value);
            return allowed.test(value);
        },
    });
    const MarkdownItHTML = html;
    exports.default = MarkdownItHTML;
});
define("utility/string/Markdown", ["require", "exports", "markdown-it", "utility/string/MarkdownItHTML"], function (require, exports, markdown_it_1, MarkdownItHTML_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    markdown_it_1 = __importDefault(markdown_it_1);
    MarkdownItHTML_1 = __importDefault(MarkdownItHTML_1);
    exports.default = Object.assign(createMarkdownInstance(), {
        clone: createMarkdownInstance,
    });
    function createMarkdownInstance() {
        const Markdown = new markdown_it_1.default('commonmark', { html: true, breaks: true });
        MarkdownItHTML_1.default.use(Markdown, MarkdownItHTML_1.default.Options()
            .disallowTags('img', 'figure', 'figcaption', 'map', 'area'));
        Markdown.inline.ruler.enable('strikethrough');
        Markdown.inline.ruler2.enable('strikethrough');
        ////////////////////////////////////
        //#region Underline Parse
        // Based on https://github.com/Markdown-it/Markdown-it/blob/0fe7ccb4b7f30236fb05f623be6924961d296d3d/lib/rules_inline/strikethrough.mjs
        Markdown.inline.ruler.before('emphasis', 'underline', function underline_tokenize(state, silent) {
            const start = state.pos;
            const marker = state.src.charCodeAt(start);
            if (silent || marker !== 0x5F /* _ */)
                return false;
            const scanned = state.scanDelims(state.pos, true);
            let len = scanned.length;
            if (len < 2)
                return false;
            const ch = String.fromCharCode(marker);
            let token;
            if (len % 2) {
                token = state.push('text', '', 0);
                token.content = ch;
                len--;
            }
            for (let i = 0; i < len; i += 2) {
                token = state.push('text', '', 0);
                token.content = ch + ch;
                state.delimiters.push({
                    marker,
                    length: 0, // disable "rule of 3" length checks meant for emphasis
                    token: state.tokens.length - 1,
                    end: -1,
                    open: scanned.can_open,
                    close: scanned.can_close,
                });
            }
            state.pos += scanned.length;
            return true;
        });
        Markdown.inline.ruler2.before('emphasis', 'underline', function underline_postProcess(state) {
            const tokens_meta = state.tokens_meta;
            const max = state.tokens_meta.length;
            postProcess(state, state.delimiters);
            for (let curr = 0; curr < max; curr++) {
                const delimiters = tokens_meta[curr]?.delimiters;
                if (delimiters)
                    postProcess(state, delimiters);
            }
            state.delimiters = state.delimiters.filter(delim => delim.marker !== 0x5F /* _ */);
            return true;
            function postProcess(state, delimiters) {
                let token;
                const loneMarkers = [];
                const max = delimiters.length;
                for (let i = 0; i < max; i++) {
                    const startDelim = delimiters[i];
                    if (startDelim.marker !== 0x5F /* _ */)
                        continue;
                    if (startDelim.end === -1)
                        continue;
                    const endDelim = delimiters[startDelim.end];
                    token = state.tokens[startDelim.token];
                    token.type = 'u_open';
                    token.tag = 'u';
                    token.nesting = 1;
                    token.markup = '__';
                    token.content = '';
                    token = state.tokens[endDelim.token];
                    token.type = 'u_close';
                    token.tag = 'u';
                    token.nesting = -1;
                    token.markup = '__';
                    token.content = '';
                    if (state.tokens[endDelim.token - 1].type === 'text'
                        && state.tokens[endDelim.token - 1].content === '_') {
                        loneMarkers.push(endDelim.token - 1);
                    }
                }
                // If a marker sequence has an odd number of characters, it's splitted
                // like this: `_____` -> `_` + `__` + `__`, leaving one marker at the
                // start of the sequence.
                //
                // So, we have to move all those markers after subsequent u_close tags.
                //
                while (loneMarkers.length) {
                    const i = loneMarkers.pop() ?? 0;
                    let j = i + 1;
                    while (j < state.tokens.length && state.tokens[j].type === 'u_close') {
                        j++;
                    }
                    j--;
                    if (i !== j) {
                        token = state.tokens[j];
                        state.tokens[j] = state.tokens[i];
                        state.tokens[i] = token;
                    }
                }
            }
        });
        //#endregion
        ////////////////////////////////////
        return Markdown;
    }
});
define("ui/utility/MarkdownContent", ["require", "exports", "ui/Component", "utility/string/Markdown"], function (require, exports, Component_6, Markdown_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Component_6 = __importDefault(Component_6);
    Markdown_1 = __importDefault(Markdown_1);
    const handlers = [];
    const ELEMENT_TYPES_TO_SIMPLIFY_INTO_SPAN = Object.entries({
        SPAN: [
            'DIV',
            'P',
            'UL', 'OL', 'LI',
        ],
        STRONG: [
            'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
        ],
        EM: [
            'BLOCKQUOTE',
        ],
        CODE: [
            'PRE',
        ],
    })
        .flatMap(([toTag, fromTags]) => fromTags
        .map(fromTag => [fromTag, toTag]))
        .toObject();
    const ELEMENT_TYPES_TO_SIMPLIFY_BY_REMOVAL = new Set([
        'IMG',
        'HR',
        'BR',
        'TABLE',
    ]);
    Component_6.default.extend(component => component.extend(component => ({
        setMarkdownContent(markdown, maxLength) {
            console.log(maxLength);
            component.classes.add('markdown');
            component.element.innerHTML = Markdown_1.default.render(markdown);
            if (maxLength)
                simplifyTree(component.element, maxLength);
            const walker = document.createTreeWalker(component.element, NodeFilter.SHOW_ELEMENT);
            while (walker.nextNode())
                for (const handler of handlers)
                    handler(walker.currentNode);
            return component;
        },
    })));
    function simplifyTree(root, maxLength) {
        let length = 0;
        let clipped = false;
        const nodesToRemove = [];
        const elementsToReplace = [];
        let walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
            const node = walker.currentNode;
            const tagName = node.tagName;
            if (ELEMENT_TYPES_TO_SIMPLIFY_BY_REMOVAL.has(tagName)) {
                nodesToRemove.push(node);
                continue;
            }
            if (length >= maxLength) {
                nodesToRemove.push(node);
                clipped = true;
                continue;
            }
            if (node.nodeType === Node.TEXT_NODE) {
                const nodeLength = node.textContent?.length ?? 0;
                length += nodeLength;
                const clipLength = Math.max(0, length - maxLength);
                if (clipLength) {
                    clipped = true;
                    node.textContent = node.textContent?.slice(0, nodeLength - clipLength) ?? null;
                    length = maxLength;
                }
            }
            const replacementTagName = ELEMENT_TYPES_TO_SIMPLIFY_INTO_SPAN[tagName];
            if (replacementTagName)
                elementsToReplace.push(node);
        }
        for (let i = nodesToRemove.length - 1; i >= 0; i--)
            nodesToRemove[i].parentNode?.removeChild(nodesToRemove[i]);
        for (let i = elementsToReplace.length - 1; i >= 0; i--) {
            const element = elementsToReplace[i];
            const replacementTagName = ELEMENT_TYPES_TO_SIMPLIFY_INTO_SPAN[element.tagName];
            const replacementTag = document.createElement(replacementTagName);
            replacementTag.replaceChildren(...element.childNodes);
            element.replaceWith(replacementTag);
        }
        const elementsToStrip = [];
        walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
        while (walker.nextNode()) {
            const element = walker.currentNode;
            if (element.tagName === 'SPAN')
                continue;
            if (element.parentElement?.closest(element.tagName))
                elementsToStrip.push(element);
        }
        for (let i = elementsToStrip.length - 1; i >= 0; i--)
            elementsToStrip[i].replaceWith(...elementsToStrip[i].childNodes);
        if (clipped)
            root.append('…');
    }
    var MarkdownContent;
    (function (MarkdownContent) {
        function handle(handler) {
            handlers.push(handler);
        }
        MarkdownContent.handle = handle;
    })(MarkdownContent || (MarkdownContent = {}));
    exports.default = MarkdownContent;
});
define("ui/utility/StringApplicator", ["require", "exports", "lang/en-nz", "utility/State"], function (require, exports, en_nz_1, State_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.QuiltHelper = void 0;
    en_nz_1 = __importStar(en_nz_1);
    State_7 = __importDefault(State_7);
    Object.assign(window, { quilt: en_nz_1.default });
    var QuiltHelper;
    (function (QuiltHelper) {
        let isComponent;
        let Break;
        function setComponent(ComponentFunction) {
            isComponent = ComponentFunction.is;
            Break = ComponentFunction
                .Builder('br', component => component.style('break'))
                .setName('Break');
        }
        QuiltHelper.setComponent = setComponent;
        function renderWeave(weave) {
            return weave.content.map(renderWeft);
        }
        QuiltHelper.renderWeave = renderWeave;
        // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
        function arg(arg) {
            if (typeof arg === 'object' && arg && 'map' in arg)
                arg = arg.value;
            if (typeof arg === 'function')
                arg = arg(en_nz_1.default, QuiltHelper);
            if (typeof arg === 'string' && arg in en_nz_1.default)
                arg = en_nz_1.default[arg]();
            return arg;
        }
        QuiltHelper.arg = arg;
        function isPlaintextWeft(weft) {
            return true
                && typeof weft.content === 'string'
                && !weft.content.includes('\n');
        }
        function renderWeft(weft) {
            if (isPlaintextWeft(weft))
                return document.createTextNode(weft.content);
            let element;
            const tag = weft.tag?.toLowerCase();
            if (tag) {
                if (tag.startsWith('link(')) {
                    const link = element = document.createElement('a');
                    const href = tag.slice(5, -1);
                    link.href = href;
                    link.addEventListener('click', event => {
                        event.preventDefault();
                        navigate.toRawURL(href);
                    });
                }
                switch (tag) {
                    case 'b':
                        element = document.createElement('strong');
                        break;
                    case 'i':
                        element = document.createElement('em');
                        break;
                    case 'u':
                        element = document.createElement('u');
                        break;
                    case 's':
                        element = document.createElement('s');
                        break;
                }
            }
            element ??= document.createElement('span');
            if (Array.isArray(weft.content))
                element.append(...weft.content.map(renderWeft));
            else if (typeof weft.content === 'object' && weft.content) {
                if (!en_nz_1.WeavingArg.isRenderable(weft.content))
                    element.append(...renderWeave(weft.content));
                else if (isComponent(weft.content))
                    element.append(weft.content.element);
                else if (weft.content instanceof Node)
                    element.append(weft.content);
                else
                    console.warn('Unrenderable weave content:', weft.content);
            }
            else {
                const value = `${weft.content ?? ''}`;
                const texts = value.split('\n');
                for (let i = 0; i < texts.length; i++) {
                    if (i > 0)
                        element.append(Break().element);
                    element.append(document.createTextNode(texts[i]));
                }
            }
            return element;
        }
    })(QuiltHelper || (exports.QuiltHelper = QuiltHelper = {}));
    function BaseStringApplicator(host, defaultValue, set) {
        let translationHandler;
        let unbind;
        const result = makeApplicator(host);
        const setInternal = set.bind(null, result);
        return result;
        function makeApplicator(host) {
            return {
                state: (0, State_7.default)(defaultValue),
                set: value => {
                    unbind?.();
                    translationHandler = undefined;
                    setInternal(value);
                    return host;
                },
                use: translation => {
                    unbind?.();
                    if (typeof translation === 'string') {
                        translationHandler = undefined;
                        setInternal(en_nz_1.default[translation]().toString());
                        return host;
                    }
                    translationHandler = translation;
                    result.refresh();
                    return host;
                },
                bind: state => {
                    translationHandler = undefined;
                    unbind?.();
                    unbind = undefined;
                    if (state === undefined || state === null) {
                        setInternal(defaultValue);
                        return host;
                    }
                    if (!State_7.default.is(state)) {
                        setInternal(state);
                        return host;
                    }
                    unbind = state?.use(host, setInternal);
                    return host;
                },
                unbind: () => {
                    unbind?.();
                    setInternal(defaultValue);
                    return host;
                },
                refresh: () => {
                    if (!translationHandler)
                        return;
                    setInternal(translationHandler(en_nz_1.default, QuiltHelper).toString());
                },
                rehost: makeApplicator,
            };
        }
    }
    function StringApplicator(host, defaultValueOrApply, maybeApply) {
        const defaultValue = !maybeApply ? undefined : defaultValueOrApply;
        const apply = (maybeApply ?? defaultValueOrApply);
        return BaseStringApplicator(host, defaultValue, (result, value) => {
            if (typeof value === 'object' && value !== null)
                value = value.toString();
            if (result.state.value !== value) {
                result.state.asMutable?.setValue(value);
                apply(value ?? undefined);
            }
        });
    }
    (function (StringApplicator) {
        function render(content) {
            if (typeof content === 'string')
                content = { content: [{ content }] };
            return !content ? [] : QuiltHelper.renderWeave(content);
        }
        StringApplicator.render = render;
        function Nodes(host, defaultValueOrApply, maybeApply) {
            const defaultValue = !maybeApply ? undefined : defaultValueOrApply;
            const apply = (maybeApply ?? defaultValueOrApply);
            return BaseStringApplicator(host, defaultValue, (result, value) => {
                const valueString = typeof value === 'object' && value !== null ? value.toString() : value;
                if (result.state.value === valueString)
                    return;
                result.state.asMutable?.setValue(valueString);
                apply(render(value));
            });
        }
        StringApplicator.Nodes = Nodes;
    })(StringApplicator || (StringApplicator = {}));
    exports.default = StringApplicator;
});
define("ui/utility/TextManipulator", ["require", "exports", "ui/utility/StringApplicator"], function (require, exports, StringApplicator_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    StringApplicator_1 = __importDefault(StringApplicator_1);
    function TextManipulator(component, target = component) {
        return Object.assign(StringApplicator_1.default.Nodes(component, nodes => {
            target.removeContents();
            target.append(...nodes);
            return nodes;
        }), {
            prepend(text) {
                target.prepend(...StringApplicator_1.default.render(text));
                return component;
            },
            append(text) {
                target.append(...StringApplicator_1.default.render(text));
                return component;
            },
        });
    }
    exports.default = TextManipulator;
});
define("utility/maths/Maths", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Maths;
    (function (Maths) {
        function sum(...nums) {
            let result = 0;
            for (const num of nums)
                result += num;
            return result;
        }
        Maths.sum = sum;
        function average(...nums) {
            let result = 0;
            for (const num of nums)
                result += num;
            return result / nums.length;
        }
        Maths.average = average;
        function bits(number) {
            const result = new BitsSet();
            for (let i = 52; i >= 0; i--) {
                const v = 1 << i;
                if (number & v)
                    result.add(v);
            }
            return result;
        }
        Maths.bits = bits;
        class BitsSet extends Set {
            everyIn(type) {
                const t = type ?? 0;
                for (const bit of this)
                    if (!(t & bit))
                        return false;
                return true;
            }
            someIn(type) {
                const t = type ?? 0;
                for (const bit of this)
                    if (t & bit)
                        return true;
                return false;
            }
            every(predicate) {
                for (const bit of this)
                    if (!predicate(bit))
                        return false;
                return true;
            }
            some(predicate) {
                for (const bit of this)
                    if (predicate(bit))
                        return true;
                return false;
            }
        }
        Maths.BitsSet = BitsSet;
        function bitsn(flag) {
            const result = new BitsSetN();
            for (let i = 52n; i >= 0n; i--) {
                const v = 1n << i;
                if (flag & v)
                    result.add(v);
            }
            return result;
        }
        Maths.bitsn = bitsn;
        class BitsSetN extends Set {
            everyIn(type) {
                const t = type ?? 0n;
                for (const bit of this)
                    if (!(t & bit))
                        return false;
                return true;
            }
            someIn(type) {
                const t = type ?? 0n;
                for (const bit of this)
                    if (t & bit)
                        return true;
                return false;
            }
            every(predicate) {
                for (const bit of this)
                    if (!predicate(bit))
                        return false;
                return true;
            }
            some(predicate) {
                for (const bit of this)
                    if (predicate(bit))
                        return true;
                return false;
            }
        }
        Maths.BitsSetN = BitsSetN;
        function lerp(from, to, t) {
            return (1 - t) * from + t * to;
        }
        Maths.lerp = lerp;
        function unlerp(from, to, value) {
            const reverse = from > to;
            if (reverse) {
                const temp = to;
                to = from;
                from = temp;
            }
            const result = value <= from ? 0
                : value >= to ? 1
                    : (value - from) / (to - from);
            return reverse ? 1 - result : result;
        }
        Maths.unlerp = unlerp;
        function parseIntOrUndefined(value) {
            const result = parseFloat(value);
            return isNaN(result) || !Number.isInteger(result) ? undefined : result;
        }
        Maths.parseIntOrUndefined = parseIntOrUndefined;
        function clamp1(value) {
            return value < 0 ? 0 : value > 1 ? 1 : value;
        }
        Maths.clamp1 = clamp1;
    })(Maths || (Maths = {}));
    exports.default = Maths;
});
define("ui/component/core/Heading", ["require", "exports", "ui/Component", "ui/utility/MarkdownContent", "ui/utility/TextManipulator", "utility/Define", "utility/maths/Maths", "utility/State"], function (require, exports, Component_7, MarkdownContent_1, TextManipulator_1, Define_3, Maths_1, State_8) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HeadingClasses = void 0;
    Component_7 = __importDefault(Component_7);
    MarkdownContent_1 = __importDefault(MarkdownContent_1);
    TextManipulator_1 = __importDefault(TextManipulator_1);
    Define_3 = __importDefault(Define_3);
    Maths_1 = __importDefault(Maths_1);
    State_8 = __importDefault(State_8);
    var HeadingClasses;
    (function (HeadingClasses) {
        HeadingClasses["_ContainsHeading"] = "_contains-heading";
    })(HeadingClasses || (exports.HeadingClasses = HeadingClasses = {}));
    Component_7.default.extend(component => component.extend(component => ({
        containsHeading: () => component.classes.has(HeadingClasses._ContainsHeading),
        setContainsHeading() {
            component.classes.add(HeadingClasses._ContainsHeading);
            return component;
        },
    })));
    const Heading = Component_7.default.Builder('h1', (component) => {
        component.style('heading');
        const textWrapper = (0, Component_7.default)()
            .style('heading-text')
            .appendTo(component);
        Define_3.default.set(component, 'text', (0, TextManipulator_1.default)(component, textWrapper));
        let initial = true;
        let aestheticLevel;
        let aestheticStyle;
        const resizeRange = (0, State_8.default)(undefined);
        State_8.default.Map(component, [component.text.state, resizeRange], (...args) => args)
            .use(component, ([text, resizeRange]) => {
            component.setId(text?.toString().toLowerCase().replace(/\W+/g, '-'));
            if (!resizeRange)
                return;
            const length = text?.length ?? 0;
            const t = 1 - Maths_1.default.clamp1(Maths_1.default.unlerp(resizeRange.minLength, resizeRange.maxLength, length));
            const size = Maths_1.default.lerp(0.5, 1, t);
            textWrapper.style.setProperty('font-size', `${size}em`);
        });
        component.tabIndex('programmatic');
        component.receiveAncestorInsertEvents();
        component.event.subscribe(['insert', 'ancestorInsert'], updateHeadingLevel);
        component.rooted.subscribeManual(updateHeadingLevel);
        return component.extend(heading => ({
            setAestheticLevel(level) {
                const style = aestheticStyle ?? 'heading';
                const oldLevel = getHeadingLevel(component.element);
                if (isStyledHeadingLevel(oldLevel))
                    component.style.remove(`${style}-${oldLevel}`);
                if (aestheticLevel)
                    component.style.remove(`${style}-${aestheticLevel}`);
                aestheticLevel = level;
                if (isStyledHeadingLevel(aestheticLevel))
                    component.style(`${style}-${aestheticLevel}`);
                return heading;
            },
            setAestheticStyle(style) {
                const level = aestheticLevel ?? getHeadingLevel(component.element);
                if (isStyledHeadingLevel(level))
                    component.style.remove(`${aestheticStyle ?? 'heading'}`, `${aestheticStyle ?? 'heading'}-${level}`);
                aestheticStyle = style;
                if (isStyledHeadingLevel(level))
                    component.style(`${style ?? 'heading'}`, `${style ?? 'heading'}-${level}`);
                return heading;
            },
            updateLevel: () => {
                updateHeadingLevel();
                return heading;
            },
            setResizeRange(minLength, maxLength) {
                resizeRange.value = minLength === undefined || maxLength === undefined ? undefined : { minLength, maxLength };
                return heading;
            },
            clearResizeRange() {
                resizeRange.value = undefined;
                return heading;
            },
        }));
        function updateHeadingLevel() {
            const newLevel = computeHeadingLevel(component.element);
            const oldLevel = getHeadingLevel(component.element);
            const isSameLevel = newLevel === oldLevel;
            if (isSameLevel && !initial)
                return;
            const style = aestheticStyle ?? 'heading';
            initial = false;
            if (isStyledHeadingLevel(oldLevel))
                component.style.remove(`${style}-${oldLevel}`);
            const isStyledLevel = isStyledHeadingLevel(newLevel);
            if (!aestheticLevel && isStyledLevel)
                component.style(`${style}-${newLevel}`);
            if (aestheticLevel)
                component.style(`${style}-${aestheticLevel}`);
            if (isSameLevel)
                return;
            component.event.unsubscribe(['insert', 'ancestorInsert'], updateHeadingLevel);
            component.replaceElement(isStyledLevel ? `h${newLevel}` : 'span');
            component.attributes.toggle(!isStyledLevel, 'role', 'heading');
            component.attributes.toggle(!isStyledLevel && typeof newLevel === 'number', 'aria-level', `${newLevel}`);
            component.event.subscribe(['insert', 'ancestorInsert'], updateHeadingLevel);
        }
    });
    function computeHeadingLevel(node) {
        let currentNode = node;
        let incrementHeading = false;
        while (currentNode) {
            const heading = getPreviousSiblingHeading(currentNode);
            if (heading) {
                const level = getHeadingLevel(heading);
                if (!incrementHeading && level !== 1)
                    return level;
                if (level === undefined || level > 6)
                    return level;
                return level + 1;
            }
            currentNode = currentNode.parentNode ?? undefined;
            incrementHeading ||= true;
        }
        return 1;
    }
    function getPreviousSiblingHeading(node) {
        let sibling = node;
        while (sibling) {
            sibling = sibling.previousSibling ?? undefined;
            if (sibling?.nodeType !== Node.ELEMENT_NODE)
                continue;
            const siblingElement = sibling;
            if (isHeadingElement(siblingElement))
                return siblingElement;
            if (siblingElement.getAttribute('role') === 'heading')
                return siblingElement;
            if (siblingElement.tagName === 'HGROUP') {
                const [heading] = siblingElement.querySelectorAll('h1, h2, h3, h4, h5, h6, [role=\'heading\']');
                if (heading)
                    return heading;
            }
            if (siblingElement.component?.containsHeading()) {
                const [heading] = siblingElement.querySelectorAll('h1, h2, h3, h4, h5, h6, [role=\'heading\']');
                if (heading)
                    return heading;
            }
        }
    }
    function isHeadingElement(value) {
        if (!value || typeof value !== 'object' || !('tagName' in value))
            return false;
        const element = value;
        return element.tagName[0] === 'H' && element.tagName.length === 2 && !isNaN(+element.tagName[1]);
    }
    function getHeadingLevel(element) {
        return +element.tagName.slice(1) || +element.getAttribute('aria-level') || undefined;
    }
    function isStyledHeadingLevel(level) {
        return typeof level === 'number' && level >= 1 && level <= 6;
    }
    //#endregion
    ////////////////////////////////////
    MarkdownContent_1.default.handle(element => {
        if (isHeadingElement(element)) {
            const level = getHeadingLevel(element);
            const heading = Heading().setAestheticStyle('markdown-heading');
            Component_7.default.removeContents(heading.element);
            heading.element.replaceChildren(...element.childNodes);
            element.replaceWith(heading.element);
            heading.emitInsert();
            if (isStyledHeadingLevel(level))
                heading.setAestheticLevel(level);
        }
    });
    exports.default = Heading;
});
define("ui/component/core/Paragraph", ["require", "exports", "ui/Component"], function (require, exports, Component_8) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Component_8 = __importDefault(Component_8);
    const Paragraph = Component_8.default.Builder(component => component
        .style('paragraph'));
    exports.default = Paragraph;
});
define("ui/component/core/Block", ["require", "exports", "ui/Component", "ui/component/core/ActionRow", "ui/component/core/ext/CanHasActionsMenuButton", "ui/component/core/Heading", "ui/component/core/Paragraph", "utility/State"], function (require, exports, Component_9, ActionRow_1, CanHasActionsMenuButton_1, Heading_1, Paragraph_1, State_9) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BlockClasses = void 0;
    Component_9 = __importDefault(Component_9);
    ActionRow_1 = __importDefault(ActionRow_1);
    CanHasActionsMenuButton_1 = __importDefault(CanHasActionsMenuButton_1);
    Heading_1 = __importDefault(Heading_1);
    Paragraph_1 = __importDefault(Paragraph_1);
    State_9 = __importDefault(State_9);
    var BlockClasses;
    (function (BlockClasses) {
        BlockClasses["Main"] = "$block";
    })(BlockClasses || (exports.BlockClasses = BlockClasses = {}));
    const Block = Component_9.default.Builder((component) => {
        const types = (0, State_9.default)(new Set());
        let header;
        let footer;
        const block = component
            .classes.add(BlockClasses.Main)
            .viewTransition('block')
            .style('block')
            .extend(block => ({
            title: undefined,
            header: undefined,
            description: undefined,
            primaryActions: undefined,
            content: (0, Component_9.default)().style('block-content').appendTo(component),
            footer: undefined,
            type: Object.assign((...newTypes) => {
                const oldSize = types.value.size;
                for (const type of newTypes) {
                    types.value.add(type);
                    block.style(`block-type-${type}`);
                    header?.style(`block-type-${type}-header`);
                    footer?.style(`block-type-${type}-footer`);
                }
                if (types.value.size !== oldSize)
                    types.emit();
                return block;
            }, {
                state: types,
                remove(...removeTypes) {
                    let removed = false;
                    for (const type of removeTypes) {
                        removed ||= types.value.delete(type);
                        block.style.remove(`block-type-${type}`);
                        header?.style.remove(`block-type-${type}-header`);
                        footer?.style.remove(`block-type-${type}-footer`);
                    }
                    if (removed)
                        types.emit();
                    return block;
                },
            }),
        }))
            .extendJIT('header', block => header = (0, Component_9.default)('hgroup')
            .style('block-header', ...[...types.value].map(t => `block-type-${t}-header`))
            .prependTo(block))
            .extendJIT('title', block => (0, Heading_1.default)().style('block-title').prependTo(block.header))
            .extendJIT('primaryActions', block => (0, Component_9.default)().style('block-actions-primary').appendTo(block.header))
            .extendJIT('description', block => (0, Paragraph_1.default)().style('block-description').appendTo(block.header))
            .extendJIT('footer', block => footer = (0, ActionRow_1.default)()
            .style('block-footer', ...[...types.value].map(t => `block-type-${t}-footer`))
            .appendTo(block));
        return block
            .and(CanHasActionsMenuButton_1.default, button => button.appendTo(block.primaryActions));
    });
    exports.default = Block;
});
define("utility/AbortPromise", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AbortPromise extends Promise {
        #controller;
        /**
         * Note that `signal` is not handled for you.
         * If you need to resolve or reject on abort, you will need to add an abort listener.
         */
        constructor(executor) {
            const controller = new AbortController();
            super((resolve, reject) => executor(resolve, reject, controller.signal));
            this.#controller = controller;
            this.abort = this.abort.bind(this);
        }
        /**
         * Sends an abort signal to the promise handler
         */
        abort() {
            if (this.#controller?.signal.aborted)
                return;
            this.#controller?.abort();
        }
    }
    (function (AbortPromise) {
        function asyncFunction(asyncFunction) {
            return (...args) => new AbortPromise((resolve, reject, signal) => void asyncFunction(signal, ...args).then(resolve, reject));
        }
        AbortPromise.asyncFunction = asyncFunction;
    })(AbortPromise || (AbortPromise = {}));
    exports.default = AbortPromise;
});
define("ui/component/core/Slot", ["require", "exports", "ui/Component", "ui/component/core/ext/ComponentInsertionTransaction", "utility/AbortPromise", "utility/State"], function (require, exports, Component_10, ComponentInsertionTransaction_1, AbortPromise_1, State_10) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Component_10 = __importDefault(Component_10);
    ComponentInsertionTransaction_1 = __importDefault(ComponentInsertionTransaction_1);
    AbortPromise_1 = __importDefault(AbortPromise_1);
    State_10 = __importDefault(State_10);
    const Slot = Object.assign(Component_10.default.Builder((slot) => {
        slot.style('slot');
        let unuse;
        let cleanup;
        let abort;
        let abortTransaction;
        return slot
            .extend(slot => ({
            use: (state, initialiser) => {
                state = State_10.default.get(state);
                unuse?.();
                unuse = undefined;
                abort?.();
                abort = undefined;
                abortTransaction?.();
                abortTransaction = undefined;
                unuse = state.use(slot, value => {
                    abort?.();
                    abort = undefined;
                    cleanup?.();
                    cleanup = undefined;
                    abortTransaction?.();
                    abortTransaction = undefined;
                    const component = (0, Component_10.default)();
                    const transaction = (0, ComponentInsertionTransaction_1.default)(component, () => {
                        slot.removeContents();
                        slot.append(...component.element.children);
                    });
                    abortTransaction = transaction.abort;
                    handleSlotInitialiserReturn(transaction, initialiser(transaction, value));
                });
                return slot;
            },
            if: (state, initialiser) => {
                unuse?.();
                unuse = undefined;
                abort?.();
                abort = undefined;
                abortTransaction?.();
                abortTransaction = undefined;
                state.use(slot, value => {
                    abort?.();
                    abort = undefined;
                    cleanup?.();
                    cleanup = undefined;
                    abortTransaction?.();
                    abortTransaction = undefined;
                    if (!value) {
                        slot.removeContents();
                        return;
                    }
                    const component = (0, Component_10.default)();
                    const transaction = (0, ComponentInsertionTransaction_1.default)(component, () => {
                        slot.removeContents();
                        slot.append(...component.element.children);
                    });
                    abortTransaction = transaction.abort;
                    handleSlotInitialiserReturn(transaction, initialiser(transaction));
                });
                return slot;
            },
        }))
            .tweak(slot => slot.removed.awaitManual(true, () => cleanup?.()));
        function handleSlotInitialiserReturn(transaction, result) {
            if (!(result instanceof AbortPromise_1.default))
                return handleSlotInitialiserReturnNonPromise(transaction, result || undefined);
            abort = result.abort;
            result.then(result => handleSlotInitialiserReturnNonPromise(transaction, result || undefined))
                .catch(err => console.error('Slot initialiser promise rejection:', err));
        }
        function handleSlotInitialiserReturnNonPromise(transaction, result) {
            result ||= undefined;
            if (result === slot)
                result = undefined;
            transaction.close();
            abortTransaction = undefined;
            if (Component_10.default.is(result)) {
                result.appendTo(slot);
                cleanup = undefined;
                return;
            }
            cleanup = result;
        }
    }), {
        using: (value, initialiser) => Slot().use(State_10.default.get(value), initialiser),
    });
    exports.default = Slot;
});
define("ui/component/core/ProgressWheel", ["require", "exports", "lang/en-nz", "ui/Component", "ui/component/core/Slot", "utility/State"], function (require, exports, en_nz_2, Component_11, Slot_1, State_11) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    en_nz_2 = __importDefault(en_nz_2);
    Component_11 = __importDefault(Component_11);
    Slot_1 = __importDefault(Slot_1);
    State_11 = __importDefault(State_11);
    const ProgressWheelBuilder = Component_11.default.Builder((component) => {
        return component
            .style('progress-wheel')
            .extend(wheel => ({
            set(definition) {
                wheel.removeContents();
                (0, Component_11.default)()
                    .style('progress-wheel-icon')
                    .tweak(definition.initialiseIcon)
                    .appendTo(wheel);
                const label = (0, Component_11.default)()
                    .style('progress-wheel-label')
                    .tweak(definition.initialiseLabel)
                    .appendTo(wheel);
                label.text.bind(definition.label);
                wheel.style.bindVariable('progress', definition.progress);
                return wheel;
            },
        }));
    });
    const ProgressWheel = Object.assign(ProgressWheelBuilder, {
        Length(length, maxLength) {
            const unusedPercent = State_11.default.MapManual([length, maxLength], (length, maxLength) => length === undefined || !maxLength ? undefined : 1 - length / maxLength);
            const unusedChars = State_11.default.MapManual([length, maxLength], (length, maxLength) => length === undefined || !maxLength ? undefined : maxLength - length);
            return Slot_1.default.using(State_11.default.UseManual({ unusedPercent, unusedChars }), (slot, { unusedPercent, unusedChars }) => unusedPercent === undefined || unusedChars === undefined ? undefined
                : ProgressWheelBuilder()
                    .set({
                    progress: unusedPercent,
                    label: en_nz_2.default['shared/form/progress-wheel/remaining/label'](unusedChars),
                    initialiseIcon: icon => icon
                        .style.bind(unusedPercent < 0, 'progress-wheel-icon--overflowing'),
                }));
        },
        Progress(progress) {
            return ProgressWheelBuilder()
                .set({
                progress,
                label: progress.mapManual(p => en_nz_2.default['shared/form/progress-wheel/progress/label']((p ?? 0) * 100)),
            });
        },
    });
    exports.default = ProgressWheel;
});
define("ui/utility/Viewport", ["require", "exports", "utility/State"], function (require, exports, State_12) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    State_12 = __importDefault(State_12);
    var Viewport;
    (function (Viewport) {
        Viewport.size = State_12.default.JIT(() => ({ w: window.innerWidth, h: window.innerHeight }));
        function listen() {
            window.addEventListener('resize', Viewport.size.markDirty);
        }
        Viewport.listen = listen;
    })(Viewport || (Viewport = {}));
    exports.default = Viewport;
});
define("ui/utility/AnchorManipulator", ["require", "exports", "ui/utility/Mouse", "ui/utility/Viewport", "utility/Time"], function (require, exports, Mouse_3, Viewport_1, Time_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AllowXOffscreen = exports.AllowYOffscreen = exports.ANCHOR_LOCATION_ALIGNMENTS = exports.ANCHOR_SIDE_VERTICAL = exports.ANCHOR_SIDE_HORIZONTAL = exports.ANCHOR_TYPES = void 0;
    Mouse_3 = __importDefault(Mouse_3);
    Viewport_1 = __importDefault(Viewport_1);
    Time_4 = __importDefault(Time_4);
    ////////////////////////////////////
    //#region Anchor Strings
    exports.ANCHOR_TYPES = ['off', 'aligned'];
    exports.ANCHOR_SIDE_HORIZONTAL = ['left', 'right'];
    exports.ANCHOR_SIDE_VERTICAL = ['top', 'bottom'];
    const anchorStrings = new Set(exports.ANCHOR_TYPES
        .flatMap(type => [exports.ANCHOR_SIDE_HORIZONTAL, exports.ANCHOR_SIDE_VERTICAL]
        .flatMap(sides => sides
        .map(side => `${type} ${side}`)))
        .flatMap(type => [type, `sticky ${type}`]));
    anchorStrings.add('centre');
    anchorStrings.add('sticky centre');
    function isAnchorString(value) {
        if (anchorStrings.has(value)) {
            return true;
        }
        if (typeof value !== 'string') {
            return false;
        }
        const lastSpace = value.lastIndexOf(' ');
        if (lastSpace === -1) {
            return false;
        }
        const simpleAnchorString = value.slice(0, lastSpace);
        if (!anchorStrings.has(simpleAnchorString)) {
            return false;
        }
        const offsetString = value.slice(lastSpace + 1);
        return !isNaN(+offsetString);
    }
    function parseAnchor(anchor) {
        const sticky = anchor.startsWith('sticky');
        if (sticky) {
            anchor = anchor.slice(7);
        }
        const simpleAnchor = anchor;
        if (simpleAnchor === 'centre') {
            return { sticky, type: 'centre', side: 'centre', offset: 0 };
        }
        const [type, side, offset] = simpleAnchor.split(' ');
        return {
            sticky,
            type,
            side,
            offset: offset ? +offset : 0,
        };
    }
    exports.ANCHOR_LOCATION_ALIGNMENTS = ['left', 'centre', 'right'];
    //#endregion
    ////////////////////////////////////
    ////////////////////////////////////
    //#region Implementation
    exports.AllowYOffscreen = { allowYOffscreen: true };
    exports.AllowXOffscreen = { allowXOffscreen: true };
    function AnchorManipulator(host) {
        let locationPreference;
        let refCache;
        let location;
        let currentAlignment;
        let from;
        let lastRender = 0;
        let rerenderTimeout;
        const subscribed = [];
        const addSubscription = (use) => use && subscribed.push(use);
        let unuseFrom;
        const result = {
            isMouse: () => !locationPreference?.length,
            from: component => {
                unuseFrom?.();
                from = component;
                unuseFrom = from?.removed.useManual(removed => {
                    if (removed) {
                        from = undefined;
                        unuseFrom?.();
                        unuseFrom = undefined;
                    }
                });
                return host;
            },
            reset: () => {
                locationPreference = undefined;
                result.markDirty();
                return host;
            },
            add: (...config) => {
                const options = typeof config[config.length - 1] === 'string' ? undefined
                    : config.pop();
                let [xAnchor, xRefSelector, yAnchor, yRefSelector] = config;
                if (isAnchorString(xRefSelector)) {
                    yRefSelector = yAnchor;
                    yAnchor = xRefSelector;
                    xRefSelector = '*';
                }
                yRefSelector ??= '*';
                locationPreference ??= [];
                locationPreference.push({
                    xAnchor: parseAnchor(xAnchor),
                    xRefSelector,
                    yAnchor: parseAnchor(yAnchor),
                    yRefSelector,
                    options,
                });
                result.markDirty();
                return host;
            },
            markDirty: () => {
                location = undefined;
                if (lastRender) {
                    const timeSinceLastRender = Date.now() - lastRender;
                    if (timeSinceLastRender > Time_4.default.frame)
                        result.apply();
                    else if (rerenderTimeout === undefined)
                        rerenderTimeout = window.setTimeout(result.apply, Time_4.default.frame - timeSinceLastRender);
                }
                return host;
            },
            get: () => {
                if (location)
                    return location;
                for (const unuse of subscribed)
                    unuse();
                const tooltipBox = host?.rect.value;
                if (tooltipBox && locationPreference && from) {
                    for (const preference of locationPreference) {
                        let alignment = 'left';
                        const xConf = preference.xAnchor;
                        const xRef = resolveAnchorRef(preference.xRefSelector);
                        const xBox = xRef?.rect.value;
                        addSubscription(xRef?.rect.subscribe(host, result.markDirty));
                        const xCenter = (xBox?.left ?? 0) + (xBox?.width ?? Viewport_1.default.size.value.w) / 2;
                        const xRefX = (xConf.side === 'right' ? xBox?.right : xConf.side === 'left' ? xBox?.left : xCenter) ?? xCenter;
                        let x;
                        switch (xConf.type) {
                            case 'aligned':
                                x = xConf.side === 'right' ? xRefX - tooltipBox.width - xConf.offset : xRefX + xConf.offset;
                                alignment = xConf.side;
                                break;
                            case 'off':
                                x = xConf.side === 'right' ? xRefX + xConf.offset : xRefX - tooltipBox.width - xConf.offset;
                                // alignment is inverted side for "off"
                                alignment = xConf.side === 'left' ? 'right' : 'left';
                                break;
                            case 'centre':
                                x = xRefX - tooltipBox.width / 2;
                                alignment = 'centre';
                                break;
                        }
                        if (preference.options?.xValid?.(x, xBox, tooltipBox) === false) {
                            continue;
                        }
                        if (!xConf.sticky && tooltipBox.width < Viewport_1.default.size.value.w && !preference.options?.allowXOffscreen) {
                            const isXOffScreen = x < 0 || x + tooltipBox.width > Viewport_1.default.size.value.w;
                            if (isXOffScreen) {
                                continue;
                            }
                        }
                        const yConf = preference.yAnchor;
                        const yRef = resolveAnchorRef(preference.yRefSelector);
                        const yBox = yRef?.rect.value;
                        addSubscription(yRef?.rect.subscribe(host, result.markDirty));
                        const yCenter = (yBox?.top ?? 0) + (yBox?.height ?? Viewport_1.default.size.value.h) / 2;
                        const yRefY = (yConf.side === 'bottom' ? yBox?.bottom : yConf.side === 'top' ? yBox?.top : yCenter) ?? yCenter;
                        let y;
                        switch (yConf.type) {
                            case 'aligned':
                                y = yConf.side === 'bottom' ? yRefY - tooltipBox.height - yConf.offset : yRefY + yConf.offset;
                                break;
                            case 'off':
                                y = yConf.side === 'bottom' ? yRefY + yConf.offset : yRefY - tooltipBox.height - yConf.offset;
                                break;
                            case 'centre':
                                y = yRefY - tooltipBox.height / 2;
                                break;
                        }
                        if (preference.options?.yValid?.(y, yBox, tooltipBox) === false) {
                            continue;
                        }
                        if (!yConf.sticky && tooltipBox.height < Viewport_1.default.size.value.h && !preference.options?.allowYOffscreen) {
                            const isYOffScreen = y < 0
                                || y + tooltipBox.height > Viewport_1.default.size.value.h;
                            if (isYOffScreen) {
                                continue;
                            }
                        }
                        return location ??= { mouse: false, padX: xConf.type === 'off', alignment, x, y };
                    }
                }
                return location ??= { mouse: true, padX: true, ...Mouse_3.default.state.value };
            },
            apply: () => {
                const location = result.get();
                let alignment = location.alignment ?? currentAlignment;
                if (location.mouse) {
                    const shouldFlip = currentAlignment === 'centre' || (currentAlignment === 'right' ? location.x < Viewport_1.default.size.value.w / 2 - 200 : location.x > Viewport_1.default.size.value.w / 2 + 200);
                    if (shouldFlip) {
                        alignment = currentAlignment === 'left' ? 'right' : 'left';
                    }
                }
                if (currentAlignment !== alignment) {
                    currentAlignment = alignment;
                    // this.surface.classes.removeStartingWith("aligned-")
                    // this.surface.classes.add(`aligned-${this.currentAlignment}`)
                }
                // this.surface.classes.toggle(location.padX, "pad-x")
                host.element.style.left = `${location.x}px`;
                host.element.style.top = `${location.y}px`;
                host.rect.markDirty();
                rerenderTimeout = undefined;
                lastRender = Date.now();
                return host;
            },
        };
        return result;
        function resolveAnchorRef(selector) {
            const refRef = refCache?.[selector];
            let ref;
            if (refRef) {
                ref = refRef.deref();
            }
            else {
                ref = from?.element.closest(selector)?.component;
                if (ref) {
                    if (getComputedStyle(ref.element).display === 'contents') {
                        const children = ref.element.children;
                        if (!children.length)
                            console.warn('Anchor ref has display: contents and no children');
                        else {
                            ref = children[0].component ?? ref;
                            if (children.length > 1)
                                console.warn('Anchor ref has display: contents and multiple children');
                        }
                    }
                    refCache ??= {};
                    refCache[selector] = new WeakRef(ref);
                }
            }
            return ref;
        }
    }
    exports.default = AnchorManipulator;
});
//#endregion
////////////////////////////////////
define("ui/component/core/ext/Input", ["require", "exports", "ui/Component", "ui/component/core/Block", "ui/component/core/Popover", "ui/component/core/ProgressWheel", "ui/component/core/Slot", "ui/utility/AnchorManipulator", "ui/utility/StringApplicator", "utility/State"], function (require, exports, Component_12, Block_1, Popover_1, ProgressWheel_1, Slot_2, AnchorManipulator_1, StringApplicator_2, State_13) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Component_12 = __importDefault(Component_12);
    Popover_1 = __importDefault(Popover_1);
    ProgressWheel_1 = __importDefault(ProgressWheel_1);
    Slot_2 = __importDefault(Slot_2);
    StringApplicator_2 = __importDefault(StringApplicator_2);
    State_13 = __importDefault(State_13);
    function createHintText(hint) {
        return (0, Component_12.default)()
            .style('input-popover-hint-text')
            .text.bind(hint);
    }
    const Input = Object.assign(Component_12.default.Extension((component) => {
        const hintText = (0, State_13.default)(undefined);
        const maxLength = (0, State_13.default)(undefined);
        const length = (0, State_13.default)(undefined);
        const invalid = (0, State_13.default)('');
        const popoverOverride = (0, State_13.default)(false);
        const hasPopover = State_13.default.MapManual([hintText, maxLength, popoverOverride], (hintText, maxLength, override) => override || !!hintText || !!maxLength);
        let popover;
        hasPopover.subscribeManual(hasPopover => {
            if (!hasPopover) {
                popover?.remove();
                popover = undefined;
                return;
            }
            if (component.removed.value)
                return;
            popover = (0, Popover_1.default)()
                .anchor.from(component)
                .anchor.add('off right', `.\\${Block_1.BlockClasses.Main}`, 'aligned top', {
                ...AnchorManipulator_1.AllowYOffscreen,
                yValid(y, hostBox, popoverBox) {
                    // only align top if the popover box is taller than the host box
                    return popoverBox.height > (hostBox?.height ?? 0);
                },
            })
                .anchor.add('off right', `.\\${Block_1.BlockClasses.Main}`, 'centre', AnchorManipulator_1.AllowYOffscreen)
                .setNormalStacking()
                .setCloseOnInput(false)
                .style('input-popover')
                .setOwner(component)
                .tweak(popover => {
                if (popoverOverride.value)
                    return;
                Slot_2.default.using(hintText, (slot, hintText) => !hintText ? undefined : createHintText(hintText))
                    .appendTo(popover);
                ProgressWheel_1.default.Length(length, maxLength)
                    .appendTo(popover);
            })
                .tweak(popoverInitialiser, component)
                .appendTo(document.body);
        });
        let customPopoverVisibilityHandling = false;
        component.hasFocused.subscribeManual(hasFocused => {
            if (customPopoverVisibilityHandling)
                return;
            popover?.toggle(hasFocused).anchor.apply();
        });
        const customInvalidMessage = (0, State_13.default)(undefined);
        let validityPipeComponent;
        customInvalidMessage.subscribe(component, invalidMessage => {
            const validity = typeof invalidMessage === 'object' ? invalidMessage.toString() : invalidMessage;
            const input = validityPipeComponent?.element ?? component.element;
            input.setCustomValidity?.(validity ?? '');
        });
        component.event.subscribe(['input', 'change'], refreshValidity);
        let popoverInitialiser;
        const input = component.extend(component => ({
            required: (0, State_13.default)(false),
            hint: (0, StringApplicator_2.default)(component, value => hintText.value = value),
            maxLength,
            length,
            invalid,
            disableDefaultHintPopoverVisibilityHandling() {
                customPopoverVisibilityHandling = true;
                return component;
            },
            getPopover: () => popover,
            setMaxLength(newLength) {
                maxLength.value = newLength;
                return component;
            },
            setRequired: (required = true) => {
                component.attributes.toggle(required, 'required');
                component.required.asMutable?.setValue(required);
                return component;
            },
            setLabel: label => {
                component.setName(label?.for);
                component.setId(label?.for);
                label?.setInput(component);
                return component;
            },
            tweakPopover(initialiser) {
                popoverInitialiser = initialiser;
                return component;
            },
            setCustomHintPopover(initialiser) {
                popoverInitialiser = initialiser;
                popoverOverride.value = true;
                return component;
            },
            pipeValidity(to) {
                validityPipeComponent = to;
                return component;
            },
            setCustomInvalidMessage(message) {
                customInvalidMessage.value = message;
                refreshValidity();
                return component;
            },
            refreshValidity,
        }));
        return input;
        function refreshValidity() {
            invalid.value = _
                ?? customInvalidMessage.value?.toString()
                ?? component.element.validationMessage
                ?? '';
            return input;
        }
    }), {
        createHintText,
    });
    exports.default = Input;
});
define("ui/component/core/Form", ["require", "exports", "ui/Component", "ui/component/core/ActionRow", "ui/component/core/Block", "ui/component/core/Button", "utility/State"], function (require, exports, Component_13, ActionRow_2, Block_2, Button_2, State_14) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Component_13 = __importDefault(Component_13);
    ActionRow_2 = __importDefault(ActionRow_2);
    Block_2 = __importDefault(Block_2);
    Button_2 = __importDefault(Button_2);
    State_14 = __importDefault(State_14);
    const Form = Component_13.default.Builder((component, label) => {
        const form = (component.replaceElement('form')
            .style('form')
            .ariaRole('form')
            .ariaLabelledBy(label));
        form.receiveDescendantInsertEvents();
        const valid = State_14.default.Generator(() => (form.element).checkValidity());
        form.event.subscribe(['input', 'change', 'descendantInsert'], () => valid.refresh());
        const content = (form.is(Block_2.default) ? form.content : (0, Component_13.default)())
            .style('form-content');
        const footer = (form.is(Block_2.default) ? form.footer : (0, ActionRow_2.default)())
            .style('form-footer');
        let submitButtonWrapper;
        return form
            .append(content, footer)
            .extend(() => ({
            content, footer,
            submit: undefined,
        }))
            .extendJIT('submit', () => (0, Button_2.default)()
            .type('primary')
            .attributes.set('type', 'submit')
            .bindDisabled(valid.not, 'invalid')
            .appendTo(submitButtonWrapper ??= (0, Component_13.default)()
            .event.subscribe('click', () => {
            if (!form.element.checkValidity())
                form.element.reportValidity();
        })
            .appendTo(footer.right))
            .tweak(submitButton => submitButton
            .style.bind(State_14.default.Every(form, submitButtonWrapper.hovered, submitButton.disabled), 'button--disabled--hover')
            .style.bind(State_14.default.Every(form, submitButtonWrapper.active, submitButton.disabled), 'button--disabled--active')));
    });
    exports.default = Form;
});
define("ui/view/shared/component/View", ["require", "exports", "ui/Component"], function (require, exports, Component_14) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Component_14 = __importDefault(Component_14);
    const View = Component_14.default.Builder((_, id) => (0, Component_14.default)()
        .style('view', `view-type-${id}`)
        .attributes.set('data-view', id)
        .extend(view => ({
        viewId: id,
        hash: '',
    }))
        .extendJIT('hash', view => `${view.viewId}${view.params ? `_${JSON.stringify(view.params)}` : ''}`
        .replaceAll(/\W+/g, '-')));
    exports.default = View;
});
define("ui/component/core/Label", ["require", "exports", "ui/Component", "ui/component/core/Form", "ui/view/shared/component/View", "utility/State"], function (require, exports, Component_15, Form_1, View_1, State_15) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AutoLabel = void 0;
    Component_15 = __importDefault(Component_15);
    Form_1 = __importDefault(Form_1);
    View_1 = __importDefault(View_1);
    State_15 = __importDefault(State_15);
    const Label = Component_15.default.Builder('label', (label) => {
        label.style('label');
        let requiredState;
        let unuseInput;
        return label
            .extend(label => ({
            for: (0, State_15.default)(undefined),
            setFor: inputName => {
                label.attributes.set('for', inputName);
                label.for.asMutable?.setValue(inputName);
                return label;
            },
            setRequired: (required = true) => {
                label.style.unbind(requiredState);
                requiredState = undefined;
                if (typeof required === 'boolean')
                    label.style.toggle('label-required');
                else
                    label.style.bind(requiredState = required, 'label-required');
                return label;
            },
            setInput: input => {
                unuseInput?.();
                if (!label.is(exports.AutoLabel))
                    label.setFor(input?.name.value);
                label.setRequired(input?.required);
                unuseInput = input?.invalid.use(label, invalid => label.style.toggle(!!invalid, 'label--invalid'));
                return label;
            },
        }));
    });
    exports.default = Label;
    let globalI = 0;
    exports.AutoLabel = Component_15.default.Builder('label', (component) => {
        const i = globalI++;
        const label = component.and(Label);
        let formName;
        let viewPath;
        let unuseFormName;
        label.receiveAncestorInsertEvents();
        label.event.subscribe(['insert', 'ancestorInsert'], () => {
            unuseFormName?.();
            const form = label.closest(Form_1.default);
            unuseFormName = form?.name.use(label, name => formName = name);
            const view = label.closest(View_1.default);
            viewPath = view ? view.hash : '_';
            updateFor();
        });
        label.text.state.use(label, () => updateFor());
        return label.extend(label => ({}));
        function updateFor() {
            const text = label.text.state.value?.toString().toLowerCase().replace(/\W+/g, '-');
            if (!text) {
                label.setFor();
                return;
            }
            if (!formName)
                label.setFor(`${viewPath}--${text}--${i}`);
            else
                label.setFor(`${viewPath}--${formName}--${text}`);
        }
    });
});
define("ui/utility/AttributeManipulator", ["require", "exports", "lang/en-nz", "ui/utility/StringApplicator"], function (require, exports, en_nz_3, StringApplicator_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    en_nz_3 = __importDefault(en_nz_3);
    function AttributeManipulator(component) {
        let translationHandlers;
        const unuseAttributeMap = new Map();
        const result = {
            has(attribute) {
                return component.element.hasAttribute(attribute);
            },
            get(attribute) {
                return component.element.getAttribute(attribute) ?? undefined;
            },
            append(...attributes) {
                for (const attribute of attributes) {
                    delete translationHandlers?.[attribute];
                    component.element.setAttribute(attribute, '');
                }
                return component;
            },
            prepend(...attributes) {
                const oldAttributes = {};
                for (const attribute of [...component.element.attributes]) {
                    oldAttributes[attribute.name] = attribute.value;
                    component.element.removeAttribute(attribute.name);
                }
                for (const attribute of attributes)
                    component.element.setAttribute(attribute, oldAttributes[attribute] ?? '');
                for (const name of Object.keys(oldAttributes))
                    component.element.setAttribute(name, oldAttributes[name]);
                return component;
            },
            insertBefore(referenceAttribute, ...attributes) {
                const oldAttributes = {};
                for (const attribute of [...component.element.attributes]) {
                    oldAttributes[attribute.name] = attribute.value;
                    component.element.removeAttribute(attribute.name);
                }
                for (const attribute of Object.keys(oldAttributes)) {
                    if (attribute === referenceAttribute)
                        for (const attribute of attributes)
                            component.element.setAttribute(attribute, oldAttributes[attribute] ?? '');
                    component.element.setAttribute(attribute, oldAttributes[attribute]);
                }
                return component;
            },
            insertAfter(referenceAttribute, ...attributes) {
                const oldAttributes = {};
                for (const attribute of [...component.element.attributes]) {
                    oldAttributes[attribute.name] = attribute.value;
                    component.element.removeAttribute(attribute.name);
                }
                if (!(referenceAttribute in oldAttributes))
                    for (const attribute of attributes)
                        component.element.setAttribute(attribute, oldAttributes[attribute] ?? '');
                for (const attribute of Object.keys(oldAttributes)) {
                    component.element.setAttribute(attribute, oldAttributes[attribute]);
                    if (attribute === referenceAttribute)
                        for (const attribute of attributes)
                            component.element.setAttribute(attribute, oldAttributes[attribute] ?? '');
                }
                return component;
            },
            set(attribute, value) {
                delete translationHandlers?.[attribute];
                if (value === undefined)
                    component.element.removeAttribute(attribute);
                else
                    component.element.setAttribute(attribute, value);
                return component;
            },
            bind(state, attribute, value) {
                unuseAttributeMap.get(attribute)?.();
                unuseAttributeMap.set(attribute, state.use(component, active => {
                    if (active)
                        component.element.setAttribute(attribute, value ?? '');
                    else
                        component.element.removeAttribute(attribute);
                }));
                return component;
            },
            compute(attribute, supplier) {
                if (component.element.hasAttribute(attribute))
                    return component;
                delete translationHandlers?.[attribute];
                const value = supplier(component);
                if (value === undefined)
                    component.element.removeAttribute(attribute);
                else
                    component.element.setAttribute(attribute, value);
                return component;
            },
            getUsing(attribute) {
                return translationHandlers?.[attribute];
            },
            use(attribute, handler) {
                translationHandlers ??= {};
                translationHandlers[attribute] = handler;
                result.refresh();
                return component;
            },
            refresh() {
                if (!translationHandlers)
                    return;
                for (const attribute in translationHandlers) {
                    const translationHandler = translationHandlers[attribute];
                    const weave = typeof translationHandler === 'string' ? en_nz_3.default[translationHandler]() : translationHandler(en_nz_3.default, StringApplicator_3.QuiltHelper);
                    component.element.setAttribute(attribute, weave.toString());
                }
            },
            remove(...attributes) {
                for (const attribute of attributes) {
                    delete translationHandlers?.[attribute];
                    component.element.removeAttribute(attribute);
                }
                return component;
            },
            toggle(present, attribute, value = '') {
                return this[present ? 'set' : 'remove'](attribute, value);
            },
            copy(element) {
                if ('element' in element)
                    element = element.element;
                for (const attribute of element.attributes)
                    component.element.setAttribute(attribute.name, attribute.value);
                return component;
            },
        };
        return result;
    }
    exports.default = AttributeManipulator;
});
define("ui/utility/ClassManipulator", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function ClassManipulator(component) {
        return {
            has(...classes) {
                return classes.every(className => component.element.classList.contains(className));
            },
            some(...classes) {
                return classes.some(className => component.element.classList.contains(className));
            },
            add(...classes) {
                component.element.classList.add(...classes);
                return component;
            },
            remove(...classes) {
                component.element.classList.remove(...classes);
                return component;
            },
            toggle(present, ...classes) {
                return this[present ? 'add' : 'remove'](...classes);
            },
            copy(element) {
                if ('element' in element)
                    element = element.element;
                component.element.classList.add(...element.classList);
                return component;
            },
        };
    }
    exports.default = ClassManipulator;
});
define("ui/utility/EventManipulator", ["require", "exports", "utility/Arrays"], function (require, exports, Arrays_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Arrays_2 = __importDefault(Arrays_2);
    const SYMBOL_REGISTERED_FUNCTION = Symbol('REGISTERED_FUNCTION');
    function EventManipulator(component) {
        return {
            emit(event, ...params) {
                const detail = { result: [], params };
                const eventObject = new CustomEvent(event, { detail });
                component.element.dispatchEvent(eventObject);
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                return Object.assign(detail.result, { defaultPrevented: eventObject.defaultPrevented });
            },
            bubble(event, ...params) {
                const detail = { result: [], params };
                const eventObject = new CustomEvent(event, { detail, bubbles: true });
                component.element.dispatchEvent(eventObject);
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                return Object.assign(detail.result, { defaultPrevented: eventObject.defaultPrevented });
            },
            subscribe(events, handler) {
                return subscribe(handler, events);
            },
            subscribePassive(events, handler) {
                return subscribe(handler, events, { passive: true });
            },
            unsubscribe(events, handler) {
                const realHandler = handler[SYMBOL_REGISTERED_FUNCTION];
                if (!realHandler)
                    return component;
                delete handler[SYMBOL_REGISTERED_FUNCTION];
                for (const event of Arrays_2.default.resolve(events))
                    component.element.removeEventListener(event, realHandler);
                return component;
            },
        };
        function subscribe(handler, events, options) {
            if (handler[SYMBOL_REGISTERED_FUNCTION]) {
                console.error(`Can't register handler for event(s) ${Arrays_2.default.resolve(events).join(', ')}, already used for other events`, handler);
                return component;
            }
            const realHandler = (event) => {
                const customEvent = event instanceof CustomEvent ? event : undefined;
                const eventDetail = customEvent?.detail;
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
                const result = handler(Object.assign(event, { component }), ...eventDetail?.params ?? []);
                eventDetail?.result.push(result);
            };
            Object.assign(handler, { [SYMBOL_REGISTERED_FUNCTION]: realHandler });
            for (const event of Arrays_2.default.resolve(events))
                component.element.addEventListener(event, realHandler, options);
            return component;
        }
    }
    exports.default = EventManipulator;
});
define("utility/Errors", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Errors;
    (function (Errors) {
        Errors.Impossible = () => new Error('Something impossible appears to have happened, what are you?');
        Errors.NotFound = () => Object.assign(new Error('Not found'), { code: 404 });
        Errors.BadData = (message) => Object.assign(new Error('Bad data was sent by the server', { cause: message }), { code: 500 });
    })(Errors || (Errors = {}));
    exports.default = Errors;
});
define("ui/Component", ["require", "exports", "lang/en-nz", "ui/utility/AnchorManipulator", "ui/utility/AttributeManipulator", "ui/utility/ClassManipulator", "ui/utility/EventManipulator", "ui/utility/FocusListener", "ui/utility/StringApplicator", "ui/utility/StyleManipulator", "ui/utility/TextManipulator", "ui/utility/Viewport", "utility/Arrays", "utility/Async", "utility/Define", "utility/Env", "utility/Errors", "utility/State", "utility/string/Strings"], function (require, exports, en_nz_4, AnchorManipulator_2, AttributeManipulator_1, ClassManipulator_1, EventManipulator_1, FocusListener_2, StringApplicator_4, StyleManipulator_1, TextManipulator_2, Viewport_2, Arrays_3, Async_2, Define_4, Env_4, Errors_1, State_16, Strings_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ComponentInsertionDestination = void 0;
    AnchorManipulator_2 = __importDefault(AnchorManipulator_2);
    AttributeManipulator_1 = __importDefault(AttributeManipulator_1);
    ClassManipulator_1 = __importDefault(ClassManipulator_1);
    EventManipulator_1 = __importDefault(EventManipulator_1);
    FocusListener_2 = __importDefault(FocusListener_2);
    StringApplicator_4 = __importStar(StringApplicator_4);
    StyleManipulator_1 = __importDefault(StyleManipulator_1);
    TextManipulator_2 = __importDefault(TextManipulator_2);
    Viewport_2 = __importDefault(Viewport_2);
    Async_2 = __importDefault(Async_2);
    Define_4 = __importDefault(Define_4);
    Env_4 = __importDefault(Env_4);
    Errors_1 = __importDefault(Errors_1);
    State_16 = __importDefault(State_16);
    Strings_2 = __importDefault(Strings_2);
    const SYMBOL_COMPONENT_BRAND = Symbol('COMPONENT_BRAND');
    const ELEMENT_TO_COMPONENT_MAP = new WeakMap();
    Define_4.default.magic(Element.prototype, 'component', {
        get() {
            return ELEMENT_TO_COMPONENT_MAP.get(this);
        },
        set(component) {
            if (component) {
                ELEMENT_TO_COMPONENT_MAP.set(this, component);
            }
            else {
                ELEMENT_TO_COMPONENT_MAP.delete(this);
            }
        },
    });
    var ComponentInsertionDestination;
    (function (ComponentInsertionDestination) {
        function is(value) {
            return typeof value === 'object' && !!value?.isInsertionDestination;
        }
        ComponentInsertionDestination.is = is;
    })(ComponentInsertionDestination || (exports.ComponentInsertionDestination = ComponentInsertionDestination = {}));
    var Classes;
    (function (Classes) {
        Classes["ReceiveAncestorInsertEvents"] = "_receieve-ancestor-insert-events";
        Classes["ReceiveDescendantInsertEvents"] = "_receieve-descendant-insert-events";
        Classes["ReceiveAncestorRectDirtyEvents"] = "_receieve-ancestor-rect-dirty-events";
        Classes["ReceiveScrollEvents"] = "_receieve-scroll-events";
    })(Classes || (Classes = {}));
    const componentExtensionsRegistry = [];
    function Component(type = 'span') {
        let unuseIdState;
        let unuseNameState;
        let unuseAriaLabelledByIdState;
        let unuseAriaControlsIdState;
        let unuseOwnerRemove;
        let descendantsListeningForScroll;
        let component = {
            supers: (0, State_16.default)([]),
            isComponent: true,
            isInsertionDestination: true,
            element: document.createElement(type),
            removed: (0, State_16.default)(false),
            rooted: (0, State_16.default)(false),
            get tagName() {
                return component.element.tagName;
            },
            setOwner: newOwner => {
                unuseOwnerRemove?.();
                unuseOwnerRemove = newOwner.removed.use(component, removed => removed && component.remove());
                return component;
            },
            replaceElement: newElement => {
                if (typeof newElement === 'string')
                    newElement = document.createElement(newElement);
                const oldElement = component.element;
                Component.removeContents(newElement);
                newElement.replaceChildren(...component.element.childNodes);
                if (component.element.parentNode)
                    component.element.replaceWith(newElement);
                component.element = newElement;
                type = component.element.tagName;
                ELEMENT_TO_COMPONENT_MAP.delete(oldElement);
                ELEMENT_TO_COMPONENT_MAP.set(newElement, component);
                component.attributes.copy(oldElement);
                component.style.refresh();
                return component;
            },
            is: (builder) => !builder || (Array.isArray(builder) ? builder : [builder]).some(builder => component.supers.value.includes(builder)),
            as: (builder) => !builder || component.supers.value.includes(builder) ? component : undefined,
            cast: () => component,
            and(builder, ...params) {
                if (component.is(builder))
                    return component;
                const result = builder.from(component, ...params);
                if (result instanceof Promise)
                    return result.then(result => {
                        component = result;
                        component.supers.value.push(builder);
                        component.supers.emit();
                        if (builder.name)
                            component.attributes.prepend(`:${builder.name.kebabcase}`);
                        return component;
                    });
                component = result;
                component.supers.value.push(builder);
                component.supers.emit();
                if (builder.name)
                    component.attributes.prepend(`:${builder.name.kebabcase}`);
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                return component;
            },
            extend: extension => Object.assign(component, extension(component)),
            extendMagic: (property, magic) => {
                Define_4.default.magic(component, property, magic(component));
                return component;
            },
            extendJIT: (property, supplier) => {
                Define_4.default.magic(component, property, {
                    get: () => {
                        const value = supplier(component);
                        Define_4.default.set(component, property, value);
                        return value;
                    },
                    set: value => {
                        Define_4.default.set(component, property, value);
                    },
                });
                return component;
            },
            tweak: (tweaker, ...params) => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                tweaker?.(component, ...params);
                return component;
            },
            get style() {
                return Define_4.default.set(component, 'style', (0, StyleManipulator_1.default)(component));
            },
            get classes() {
                return Define_4.default.set(component, 'classes', (0, ClassManipulator_1.default)(component));
            },
            get attributes() {
                return Define_4.default.set(component, 'attributes', (0, AttributeManipulator_1.default)(component));
            },
            get event() {
                return Define_4.default.set(component, 'event', (0, EventManipulator_1.default)(component));
            },
            get text() {
                return Define_4.default.set(component, 'text', (0, TextManipulator_2.default)(component));
            },
            get anchor() {
                return Define_4.default.set(component, 'anchor', (0, AnchorManipulator_2.default)(component));
            },
            get hovered() {
                return Define_4.default.set(component, 'hovered', (0, State_16.default)(false));
            },
            get focused() {
                return Define_4.default.set(component, 'focused', (0, State_16.default)(false));
            },
            get hasFocused() {
                return Define_4.default.set(component, 'hasFocused', (0, State_16.default)(false));
            },
            get hadFocusedLast() {
                return Define_4.default.set(component, 'hadFocusedLast', (0, State_16.default)(false));
            },
            get hoveredOrFocused() {
                return Define_4.default.set(component, 'hoveredOrFocused', State_16.default.Generator(() => component.hovered.value || component.focused.value)
                    .observe(component, component.hovered, component.focused));
            },
            get hoveredOrHasFocused() {
                return Define_4.default.set(component, 'hoveredOrHasFocused', State_16.default.Generator(() => component.hovered.value || component.hasFocused.value)
                    .observe(component, component.hovered, component.hasFocused));
            },
            get active() {
                return Define_4.default.set(component, 'active', (0, State_16.default)(false));
            },
            get id() {
                return Define_4.default.set(component, 'id', (0, State_16.default)(undefined));
            },
            get name() {
                return Define_4.default.set(component, 'name', (0, State_16.default)(undefined));
            },
            get rect() {
                const rectState = State_16.default.JIT(() => component.element.getBoundingClientRect());
                const oldMarkDirty = rectState.markDirty;
                rectState.markDirty = () => {
                    oldMarkDirty();
                    for (const descendant of this.element.getElementsByClassName(Classes.ReceiveAncestorRectDirtyEvents))
                        descendant.component?.event.emit('ancestorRectDirty');
                    return rectState;
                };
                this.receiveAncestorInsertEvents();
                this.receiveAncestorScrollEvents();
                this.classes.add(Classes.ReceiveAncestorRectDirtyEvents);
                this.event.subscribe(['insert', 'ancestorInsert', 'ancestorScroll', 'ancestorRectDirty'], rectState.markDirty);
                Viewport_2.default.size.subscribe(component, rectState.markDirty);
                return Define_4.default.set(component, 'rect', rectState);
            },
            setId: id => {
                unuseIdState?.();
                unuseIdState = undefined;
                if (id && typeof id !== 'string')
                    unuseIdState = id.use(component, setId);
                else
                    setId(id);
                return component;
                function setId(id) {
                    if (id) {
                        component.element.setAttribute('id', id);
                        component.id.asMutable?.setValue(id);
                    }
                    else {
                        component.element.removeAttribute('id');
                        component.id.asMutable?.setValue(undefined);
                    }
                }
            },
            setName: name => {
                unuseNameState?.();
                unuseNameState = undefined;
                if (name && typeof name !== 'string')
                    unuseNameState = name.use(component, setName);
                else
                    setName(name);
                return component;
                function setName(name) {
                    if (name) {
                        name = name.replace(/[^\w-]+/g, '-').toLowerCase();
                        component.element.setAttribute('name', name);
                        component.name.asMutable?.setValue(name);
                    }
                    else {
                        component.element.removeAttribute('name');
                        component.name.asMutable?.setValue(undefined);
                    }
                }
            },
            disableInsertion() {
                return component;
            },
            remove() {
                component.removeContents();
                component.removed.asMutable?.setValue(true);
                component.rooted.asMutable?.setValue(false);
                component.element.component = undefined;
                component.element.remove();
                component.event.emit('unroot');
                unuseOwnerRemove?.();
            },
            appendTo(destination) {
                destination.append(component.element);
                component.emitInsert();
                return component;
            },
            prependTo(destination) {
                destination.prepend(component.element);
                component.emitInsert();
                return component;
            },
            insertTo(destination, direction, sibling) {
                if (ComponentInsertionDestination.is(destination)) {
                    destination.insert(direction, sibling, component);
                    component.emitInsert();
                    return component;
                }
                const siblingElement = sibling ? Component.element(sibling) : null;
                if (direction === 'before')
                    destination.insertBefore(component.element, siblingElement);
                else
                    destination.insertBefore(component.element, siblingElement?.nextSibling ?? null);
                component.emitInsert();
                return component;
            },
            append(...contents) {
                const elements = contents.filter(Arrays_3.Truthy).map(Component.element);
                component.element.append(...elements);
                for (const element of elements)
                    element.component?.emitInsert();
                component.event.emit('childrenInsert', elements);
                return component;
            },
            prepend(...contents) {
                const elements = contents.filter(Arrays_3.Truthy).map(Component.element);
                component.element.prepend(...elements);
                for (const element of elements)
                    element.component?.emitInsert();
                component.event.emit('childrenInsert', elements);
                return component;
            },
            insert(direction, sibling, ...contents) {
                const siblingElement = sibling ? Component.element(sibling) : null;
                const elements = contents.filter(Arrays_3.Truthy).map(Component.element);
                if (direction === 'before')
                    for (let i = elements.length - 1; i >= 0; i--)
                        component.element.insertBefore(elements[i], siblingElement);
                else
                    for (const element of elements)
                        component.element.insertBefore(element, siblingElement?.nextSibling ?? null);
                for (const element of elements)
                    element.component?.emitInsert();
                component.event.emit('childrenInsert', elements);
                return component;
            },
            removeContents() {
                Component.removeContents(component.element);
                return component;
            },
            closest(builder) {
                let cursor = component.element;
                while (cursor) {
                    cursor = cursor.parentElement;
                    const component = cursor?.component;
                    if (component?.is(builder))
                        return component;
                }
            },
            get parent() {
                return component.element.parentElement?.component;
            },
            get previousSibling() {
                return component.element.previousElementSibling?.component;
            },
            getPreviousSibling(builder) {
                const [sibling] = component.getPreviousSiblings(builder);
                return sibling;
            },
            get nextSibling() {
                return component.element.nextElementSibling?.component;
            },
            getNextSibling(builder) {
                const [sibling] = component.getNextSiblings(builder);
                return sibling;
            },
            *getAncestorComponents(builder) {
                let cursor = component.element;
                while (cursor) {
                    cursor = cursor.parentElement;
                    const component = cursor?.component;
                    if (component?.is(builder))
                        yield component;
                }
            },
            *getChildren(builder) {
                for (const child of component.element.children) {
                    const component = child.component;
                    if (component?.is(builder))
                        yield component;
                }
            },
            *getSiblings(builder) {
                const parent = component.element.parentElement;
                for (const child of parent?.children ?? [])
                    if (child !== component.element) {
                        const component = child.component;
                        if (component?.is(builder))
                            yield component;
                    }
            },
            *getPreviousSiblings(builder) {
                const parent = component.element.parentElement;
                for (const child of parent?.children ?? []) {
                    if (child === component.element)
                        break;
                    const childComponent = child.component;
                    if (childComponent?.is(builder))
                        yield childComponent;
                }
            },
            *getNextSiblings(builder) {
                let cursor = component.element;
                while ((cursor = cursor.nextElementSibling)) {
                    const component = cursor.component;
                    if (component?.is(builder))
                        yield component;
                }
            },
            *getDescendants(builder) {
                const walker = document.createTreeWalker(component.element, NodeFilter.SHOW_ELEMENT);
                let node;
                while ((node = walker.nextNode())) {
                    const component = node.component;
                    if (component?.is(builder))
                        yield component;
                }
            },
            getFirstDescendant(builder) {
                const [first] = component.getDescendants(builder);
                return first;
            },
            receiveAncestorInsertEvents: () => {
                component.element.classList.add(Classes.ReceiveAncestorInsertEvents);
                return component;
            },
            receiveDescendantInsertEvents: () => {
                component.element.classList.add(Classes.ReceiveAncestorInsertEvents);
                return component;
            },
            receiveAncestorScrollEvents() {
                component.element.classList.add(Classes.ReceiveScrollEvents);
                return component;
            },
            emitInsert: () => {
                updateRooted(component);
                emitInsert(component);
                return component;
            },
            monitorScrollEvents() {
                descendantsListeningForScroll ??= component.element.getElementsByClassName(Classes.ReceiveScrollEvents);
                component.event.subscribe('scroll', () => {
                    for (const descendant of [...descendantsListeningForScroll])
                        descendant.component?.event.emit('ancestorScroll');
                });
                return component;
            },
            onRooted(callback) {
                component.rooted.awaitManual(true, () => callback(component));
                return component;
            },
            onRemove(owner, callback) {
                component.removed.await(owner, true, () => callback(component));
                return component;
            },
            onRemoveManual(callback) {
                component.removed.awaitManual(true, () => callback(component));
                return component;
            },
            ariaRole: (role) => {
                if (!role)
                    return component.attributes.remove('role');
                return component.attributes.set('role', role);
            },
            get ariaLabel() {
                return Define_4.default.set(component, 'ariaLabel', (0, StringApplicator_4.default)(component, value => component.attributes.set('aria-label', value)));
            },
            ariaLabelledBy: labelledBy => {
                unuseAriaLabelledByIdState?.();
                if (labelledBy) {
                    const state = State_16.default.Generator(() => labelledBy.id.value ?? labelledBy.attributes.get('for'))
                        .observe(component, labelledBy.id, labelledBy.cast()?.for);
                    unuseAriaLabelledByIdState = state.use(component, id => component.attributes.set('aria-labelledby', id));
                }
                return component;
            },
            ariaHidden: () => component.attributes.set('aria-hidden', 'true'),
            ariaChecked: state => {
                state.use(component, state => component.attributes.set('aria-checked', `${state}`));
                return component;
            },
            ariaControls: target => {
                unuseAriaControlsIdState?.();
                unuseAriaControlsIdState = target?.id.use(component, id => component.attributes.set('aria-controls', id));
                return component;
            },
            tabIndex: index => {
                if (index === undefined)
                    component.element.removeAttribute('tabindex');
                else if (index === 'programmatic')
                    component.element.setAttribute('tabindex', '-1');
                else if (index === 'auto')
                    component.element.setAttribute('tabindex', '0');
                else
                    component.element.setAttribute('tabindex', `${index}`);
                return component;
            },
            focus: () => {
                FocusListener_2.default.focus(component.element);
                return component;
            },
            blur: () => {
                FocusListener_2.default.blur(component.element);
                return component;
            },
        };
        en_nz_4.WeavingArg.setRenderable(component);
        for (const extension of componentExtensionsRegistry)
            extension(component);
        if (!Component.is(component))
            throw Errors_1.default.Impossible();
        component.element.component = component;
        return component;
    }
    function emitInsert(component) {
        if (!component)
            return;
        component.event.emit('insert');
        const descendantsListeningForEvent = component.element.getElementsByClassName(Classes.ReceiveAncestorInsertEvents);
        for (const descendant of descendantsListeningForEvent)
            descendant.component?.event.emit('ancestorInsert');
        let cursor = component.element.parentElement;
        while (cursor) {
            cursor.component?.event.emit('descendantInsert');
            cursor = cursor.parentElement;
        }
    }
    function updateRooted(component) {
        if (component) {
            const rooted = document.documentElement.contains(component.element);
            if (component.rooted.value === rooted)
                return;
            component.rooted.asMutable?.setValue(rooted);
            component.event.emit(rooted ? 'root' : 'unroot');
            for (const descendant of component.element.querySelectorAll('*')) {
                const component = descendant.component;
                if (component) {
                    component.rooted.asMutable?.setValue(rooted);
                    component.event.emit(rooted ? 'root' : 'unroot');
                }
            }
        }
    }
    (function (Component) {
        function is(value) {
            return typeof value === 'object' && !!value?.isComponent;
        }
        Component.is = is;
        function element(from) {
            return is(from) ? from.element : from;
        }
        Component.element = element;
        const SYMBOL_COMPONENT_TYPE_BRAND = Symbol('COMPONENT_TYPE_BRAND');
        const defaultBuilder = (type) => Component(type);
        function Builder(initialOrBuilder, builder) {
            let name = getBuilderName();
            const type = typeof initialOrBuilder === 'string' ? initialOrBuilder : undefined;
            const initialBuilder = !builder || typeof initialOrBuilder === 'string' ? defaultBuilder : initialOrBuilder;
            builder ??= initialOrBuilder;
            const realBuilder = (component = initialBuilder(type), ...params) => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                const result = builder(component, ...params);
                if (result instanceof Promise)
                    return result.then(result => {
                        if (result !== component)
                            void ensureOriginalComponentNotSubscriptionOwner(component);
                        return result;
                    });
                if (result !== component)
                    void ensureOriginalComponentNotSubscriptionOwner(component);
                return result;
            };
            const simpleBuilder = (...params) => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                const component = realBuilder(undefined, ...params);
                if (component instanceof Promise)
                    return component.then(completeComponent);
                return completeComponent(component);
            };
            Object.defineProperty(simpleBuilder, 'name', { value: name, configurable: true });
            const resultBuilder = Object.assign(simpleBuilder, {
                from: realBuilder,
                setName(newName) {
                    name = addKebabCase(newName);
                    Object.defineProperty(simpleBuilder, 'name', { value: name });
                    return resultBuilder;
                },
            });
            return resultBuilder;
            function completeComponent(component) {
                if (!component)
                    return component;
                if (name && Env_4.default.isDev) {
                    component[Symbol.toStringTag] ??= name.toString();
                    const tagName = `:${name.kebabcase}`;
                    if (component.element.tagName === 'SPAN') {
                        component.replaceElement(tagName);
                    }
                    else {
                        component.attributes.prepend(tagName);
                    }
                }
                component.supers.value.push(simpleBuilder);
                component.supers.emit();
                return component;
            }
            async function ensureOriginalComponentNotSubscriptionOwner(original) {
                if (!original || !State_16.default.OwnerMetadata.hasSubscriptions(original))
                    return;
                const originalRef = new WeakRef(original);
                original = undefined;
                await Async_2.default.sleep(1000);
                original = originalRef.deref();
                if (!original || original.rooted.value || original.removed.value)
                    return;
                console.error(`${String(name ?? 'Component')} builder returned a replacement component, but the original component was used as a subscription owner and is not in the tree!`);
            }
        }
        Component.Builder = Builder;
        function Extension(builder) {
            return {
                name: getBuilderName(),
                from: builder,
            };
        }
        Component.Extension = Extension;
        function extend(extension) {
            componentExtensionsRegistry.push(extension);
        }
        Component.extend = extend;
        /**
         * Returns the component for the given element, if it exists
         */
        function get(element) {
            if (!element || (typeof element !== 'object' && typeof element !== 'function'))
                return undefined;
            return ELEMENT_TO_COMPONENT_MAP.get(element);
        }
        Component.get = get;
        const STACK_FILE_NAME_REGEX = /\(http.*?(\w+)\.ts:\d+:\d+\)/;
        const PASCAL_CASE_WORD_START = /(?<=[a-z0-9_-])(?=[A-Z])/g;
        function addKebabCase(name) {
            return Object.assign(String(name), {
                kebabcase: name.replaceAll(PASCAL_CASE_WORD_START, '-').toLowerCase(),
            });
        }
        function getBuilderName() {
            const stack = Strings_2.default.shiftLine((new Error().stack ?? ''), 3);
            const name = stack.match(STACK_FILE_NAME_REGEX)?.[1];
            if (!name || name === 'Component')
                return undefined;
            return addKebabCase(name);
        }
        function removeContents(element) {
            for (const child of [...element.childNodes]) {
                if (child.component)
                    child.component.remove();
                else {
                    removeContents(child);
                    child.remove();
                }
            }
        }
        Component.removeContents = removeContents;
    })(Component || (Component = {}));
    StringApplicator_4.QuiltHelper.setComponent(Component);
    exports.default = Component;
});
define("utility/Store", ["require", "exports", "utility/State"], function (require, exports, State_17) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    State_17 = __importDefault(State_17);
    // export type IStoreEvents =
    // 	& { [KEY in keyof ILocalStorage as `set${Capitalize<KEY>}`]: { value: ILocalStorage[KEY]; oldValue: ILocalStorage[KEY] } }
    // 	& { [KEY in keyof ILocalStorage as `delete${Capitalize<KEY>}`]: { oldValue: ILocalStorage[KEY] } }
    let storage;
    let statesProxy;
    let states;
    class Store {
        // public static readonly event = EventManager.make<IStoreEvents>()
        static get items() {
            return storage ??= new Proxy({}, {
                has(_, key) {
                    return Store.has(key);
                },
                get(_, key) {
                    return Store.get(key);
                },
                set(_, key, value) {
                    return Store.set(key, value);
                },
                deleteProperty(_, key) {
                    return Store.delete(key);
                },
            });
        }
        static get state() {
            const s = states ??= {};
            return statesProxy ??= new Proxy({}, {
                has(_, key) {
                    return Store.has(key);
                },
                get(_, key) {
                    return s[key] ??= (0, State_17.default)(Store.get(key));
                },
            });
        }
        static get full() {
            const result = {};
            for (const [key, value] of Object.entries(localStorage))
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
                result[key] = JSON.parse(value);
            return result;
        }
        static has(key) {
            return localStorage.getItem(key) !== null;
        }
        static get(key) {
            const value = localStorage.getItem(key);
            try {
                return value === null ? null : JSON.parse(value);
            }
            catch {
                localStorage.removeItem(key);
                return null;
            }
        }
        static set(key, value) {
            // const oldValue = Store.get(key)
            if (value === undefined)
                localStorage.removeItem(key);
            else
                localStorage.setItem(key, JSON.stringify(value));
            // Store.event.emit(`set${key[0].toUpperCase()}${key.slice(1)}` as keyof IStoreEvents, { value, oldValue } as never)
            const state = states?.[key];
            if (state)
                state.value = value;
            return true;
        }
        static delete(key) {
            // const oldValue = Store.get(key)
            localStorage.removeItem(key);
            // Store.event.emit(`delete${key[0].toUpperCase()}${key.slice(1)}` as keyof IStoreEvents, { oldValue } as never)
            const state = states?.[key];
            if (state)
                state.value = undefined;
            return true;
        }
    }
    exports.default = Store;
    Object.assign(window, { Store });
});
define("utility/Popup", ["require", "exports", "utility/Store"], function (require, exports, Store_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = popup;
    Store_1 = __importDefault(Store_1);
    function popup(name, url, width = 600, height = 800) {
        const left = (window.innerWidth - width) / 2 + window.screenLeft;
        const top = (window.innerHeight - height) / 2 + window.screenTop;
        return new Promise((resolve, reject) => {
            delete Store_1.default.items.popupError;
            const options = 'width=' + width + ',height=' + height + ',top=' + top + ',left=' + left;
            const oauthPopup = window.open(url, name, options);
            const interval = setInterval(() => {
                if (oauthPopup?.closed) {
                    clearInterval(interval);
                    const popupError = Store_1.default.items.popupError;
                    if (popupError)
                        return reject(Object.assign(new Error(popupError.message ?? 'Internal Server Error'), { code: popupError.code }));
                    resolve();
                }
            }, 100);
        });
    }
});
define("model/Session", ["require", "exports", "endpoint/auth/EndpointAuthDelete", "endpoint/session/EndpointSessionGet", "endpoint/session/EndpointSessionReset", "utility/Env", "utility/Popup", "utility/State", "utility/Store"], function (require, exports, EndpointAuthDelete_1, EndpointSessionGet_1, EndpointSessionReset_1, Env_5, Popup_1, State_18, Store_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    EndpointAuthDelete_1 = __importDefault(EndpointAuthDelete_1);
    EndpointSessionGet_1 = __importDefault(EndpointSessionGet_1);
    EndpointSessionReset_1 = __importDefault(EndpointSessionReset_1);
    Env_5 = __importDefault(Env_5);
    Popup_1 = __importDefault(Popup_1);
    State_18 = __importDefault(State_18);
    Store_2 = __importDefault(Store_2);
    var Session;
    (function (Session) {
        const clearedWithSessionChange = [];
        function setClearedWithSessionChange(...keys) {
            clearedWithSessionChange.push(...keys);
        }
        Session.setClearedWithSessionChange = setClearedWithSessionChange;
        async function refresh() {
            const session = await EndpointSessionGet_1.default.query();
            const stateToken = session.headers.get('State-Token');
            if (stateToken)
                Store_2.default.items.stateToken = stateToken;
            if (Store_2.default.items.session?.created !== session.data?.created)
                for (const key of clearedWithSessionChange)
                    Store_2.default.delete(key);
            Store_2.default.items.session = session?.data ?? undefined;
            updateState();
        }
        Session.refresh = refresh;
        async function reset() {
            await EndpointSessionReset_1.default.query();
            delete Store_2.default.items.session;
            updateState();
        }
        Session.reset = reset;
        function setAuthor(author) {
            const session = Store_2.default.items.session;
            if (!session)
                return void refresh();
            Store_2.default.items.session = {
                ...session,
                author: {
                    ...author,
                    authorisations: undefined,
                },
                authorisations: author.authorisations ?? session.authorisations,
            };
            updateState();
        }
        Session.setAuthor = setAuthor;
        function updateState() {
            Auth.state.value = Store_2.default.items.session?.author ? 'logged-in' : Store_2.default.items.session?.authorisations?.length ? 'has-authorisations' : 'none';
            Auth.authorisations.value = Store_2.default.items.session?.authorisations ?? [];
            Auth.author.value = Store_2.default.items.session?.author ?? undefined;
        }
        function getStateToken() {
            return Store_2.default.items.stateToken;
        }
        Session.getStateToken = getStateToken;
        let Auth;
        (function (Auth) {
            Auth.state = (0, State_18.default)('none');
            Auth.loggedIn = State_18.default.Generator(() => Auth.state.value === 'logged-in').observeManual(Auth.state);
            Auth.authorisations = (0, State_18.default)([]);
            Auth.author = (0, State_18.default)(undefined, (a, b) => a?.vanity === b?.vanity);
            function getAll() {
                return Store_2.default.items.session?.authorisations ?? [];
            }
            Auth.getAll = getAll;
            function get(service) {
                return Store_2.default.items.session?.authorisations?.find(auth => auth.service === service);
            }
            Auth.get = get;
            function isAuthed(service) {
                return Session.Auth.authorisations.value.some(auth => auth.service === service.name);
            }
            Auth.isAuthed = isAuthed;
            async function unauth(authOrId) {
                const id = typeof authOrId === 'string' ? authOrId : authOrId.id;
                await EndpointAuthDelete_1.default.query({ body: { id } });
                const session = Store_2.default.items.session;
                if (session?.authorisations) {
                    let authorisations = session.authorisations.filter(auth => auth.id !== id);
                    if (!authorisations.length)
                        authorisations = null;
                    Store_2.default.items.session = {
                        ...session,
                        authorisations,
                    };
                }
                updateState();
            }
            Auth.unauth = unauth;
            async function auth(service) {
                await (0, Popup_1.default)(`Login Using ${service.name}`, service.url_begin, 600, 900)
                    .then(() => true).catch(err => { console.warn(err); return false; });
                await Session.refresh();
            }
            Auth.auth = auth;
            let isRequestingDangerToken = false;
            function canRequestDangerToken() {
                return !isRequestingDangerToken;
            }
            Auth.canRequestDangerToken = canRequestDangerToken;
            async function requestDangerToken(type, service) {
                if (isRequestingDangerToken)
                    return false;
                isRequestingDangerToken = true;
                const result = await (0, Popup_1.default)(`Re-authenticate Using ${service.name}`, `${Env_5.default.API_ORIGIN}danger-token/request/${type}/${service.id}/begin`, 600, 900)
                    .then(() => true).catch(err => { console.warn(err); return false; });
                isRequestingDangerToken = false;
                return result;
            }
            Auth.requestDangerToken = requestDangerToken;
            async function await(owner) {
                if (Auth.state.value === 'logged-in')
                    return true;
                return new Promise(resolve => {
                    Auth.state.subscribe(owner, handleStateChange);
                    function handleStateChange(value) {
                        if (value !== 'logged-in')
                            return;
                        resolve();
                        Auth.state.unsubscribe(handleStateChange);
                    }
                });
            }
            Auth.await = await;
        })(Auth = Session.Auth || (Session.Auth = {}));
    })(Session || (Session = {}));
    Object.assign(window, { Session });
    exports.default = Session;
});
define("navigation/Route", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function Route(path, route) {
        const segments = (path.startsWith('/') ? path.slice(1) : path).split('/');
        const varGroups = [];
        let regexString = '^';
        for (const segment of segments) {
            regexString += '/+';
            if (segment[0] !== '$') {
                regexString += segment;
                continue;
            }
            if (segment[1] === '$') {
                varGroups.push(segment.slice(2));
                regexString += '(.*)';
                continue;
            }
            varGroups.push(segment.slice(1));
            regexString += '([^/]+)';
        }
        regexString += '$';
        const regex = new RegExp(regexString);
        const rawRoutePath = path;
        return {
            path,
            ...typeof route === 'function' ? { handler: route } : route,
            match: path => {
                const match = path.match(regex);
                if (!match)
                    return undefined;
                const params = {};
                for (let i = 0; i < varGroups.length; i++) {
                    const groupName = varGroups[i];
                    const group = match[i + 1];
                    if (group === undefined) {
                        console.warn(`${rawRoutePath} matched, but $${groupName} was unset`);
                        return undefined;
                    }
                    params[groupName] = group;
                }
                return params;
            },
        };
    }
    exports.default = Route;
});
define("endpoint/author/EndpointAuthorDelete", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_5 = __importDefault(Endpoint_5);
    exports.default = (0, Endpoint_5.default)('/author/delete', 'post')
        .noResponse();
});
define("ui/component/core/Dialog", ["require", "exports", "ui/Component", "utility/State"], function (require, exports, Component_16, State_19) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Component_16 = __importDefault(Component_16);
    State_19 = __importDefault(State_19);
    const Dialog = Component_16.default.Builder(() => {
        const opened = (0, State_19.default)(false);
        const willOpen = (0, State_19.default)(false);
        const willClose = (0, State_19.default)(false);
        let modal = true;
        let unbind;
        const dialog = (0, Component_16.default)('dialog')
            .style('dialog')
            .style.bind(opened, 'dialog--open')
            .extend(dialog => ({
            opened,
            willClose,
            willOpen,
            setNotModal: (notModal = true) => {
                modal = !notModal;
                dialog.style.toggle(notModal, 'dialog--not-modal');
                return dialog;
            },
            setFullscreen: (fullscreen = true) => dialog.style.toggle(fullscreen, 'dialog--fullscreen'),
            open: () => {
                willOpen.value = true;
                if (!dialog.willOpen.value)
                    return dialog;
                unbind?.();
                dialog.element[modal ? 'showModal' : 'show']();
                opened.value = true;
                willOpen.value = false;
                return dialog;
            },
            close: () => {
                willClose.value = true;
                if (!dialog.willClose.value)
                    return dialog;
                unbind?.();
                dialog.element.close();
                opened.value = false;
                willClose.value = false;
                return dialog;
            },
            toggle: (open = !dialog.opened.value) => {
                const willChangeStateName = open ? 'willOpen' : 'willClose';
                dialog[willChangeStateName].asMutable?.setValue(true);
                if (!dialog[willChangeStateName].value)
                    return dialog;
                unbind?.();
                if (open)
                    dialog.element[modal ? 'showModal' : 'show']();
                else
                    dialog.element.close();
                opened.value = open ?? !opened.value;
                dialog[willChangeStateName].asMutable?.setValue(false);
                return dialog;
            },
            bind: state => {
                unbind?.();
                unbind = state.use(dialog, open => {
                    const willChangeStateName = open ? 'willOpen' : 'willClose';
                    dialog[willChangeStateName].asMutable?.setValue(true);
                    if (open)
                        dialog.element[modal ? 'showModal' : 'show']();
                    else
                        dialog.element.close();
                    opened.value = open;
                    dialog[willChangeStateName].asMutable?.setValue(false);
                });
                return dialog;
            },
            unbind: () => {
                unbind?.();
                return dialog;
            },
        }));
        return dialog;
    });
    exports.default = Dialog;
});
define("ui/component/core/BlockDialog", ["require", "exports", "ui/Component", "ui/component/core/Block", "ui/component/core/Dialog", "utility/Task"], function (require, exports, Component_17, Block_3, Dialog_1, Task_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Component_17 = __importDefault(Component_17);
    Block_3 = __importDefault(Block_3);
    Dialog_1 = __importDefault(Dialog_1);
    Task_2 = __importDefault(Task_2);
    const BlockDialog = Component_17.default.Builder((component) => {
        const dialog = component.and(Dialog_1.default).and(Block_3.default)
            .viewTransition()
            .style.remove('block');
        dialog
            .style('dialog-block-wrapper')
            .style.bind(dialog.opened.not, 'dialog-block-wrapper--closed');
        const block = (0, Block_3.default)()
            .style('dialog-block')
            .style.bind(dialog.opened.not, 'dialog-block--closed')
            .appendTo(dialog);
        dialog
            .extend(dialog => ({
            type: block.type,
            content: block.content,
            setActionsMenu: block.setActionsMenu,
        }))
            .extendJIT('header', () => block.header)
            .extendJIT('title', () => block.title)
            .extendJIT('primaryActions', () => block.primaryActions)
            .extendJIT('description', () => block.description)
            .extendJIT('footer', () => block.footer)
            .extendJIT('actionsMenuButton', () => block.actionsMenuButton);
        const superOpen = dialog.open;
        return dialog.extend(dialog => ({
            open() {
                superOpen();
                block.style('dialog-block--opening');
                void Task_2.default.yield().then(() => block.style.remove('dialog-block--opening'));
                return dialog;
            },
        }));
    });
    exports.default = BlockDialog;
});
define("endpoint/auth/EndpointAuthServices", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_6 = __importDefault(Endpoint_6);
    exports.default = (0, Endpoint_6.default)('/auth/services', 'get');
});
define("ui/component/core/Checkbutton", ["require", "exports", "ui/Component", "ui/component/core/Button", "utility/State"], function (require, exports, Component_18, Button_3, State_20) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Component_18 = __importDefault(Component_18);
    Button_3 = __importDefault(Button_3);
    State_20 = __importDefault(State_20);
    const Checkbutton = Component_18.default.Builder('label', (component) => {
        const input = (0, Component_18.default)('input')
            .style('checkbutton-input')
            .attributes.set('type', 'checkbox');
        const inputElement = input.element;
        const state = (0, State_20.default)(false);
        let unuse;
        const checkbutton = component
            .and(Button_3.default)
            .style('checkbutton')
            .tabIndex('auto')
            .ariaChecked(state)
            .ariaRole('checkbox')
            .append(input)
            .extend(() => ({
            input,
            checked: state,
            isChecked: () => inputElement.checked,
            setChecked: (checked) => {
                if (checked === inputElement.checked)
                    return checkbutton;
                if (unuse) {
                    checkbutton.event.emit('trySetChecked', checked);
                    return checkbutton;
                }
                inputElement.checked = checked;
                onChange();
                return checkbutton;
            },
            use: sourceState => {
                unuse = sourceState.use(checkbutton, checked => {
                    if (inputElement.checked === checked)
                        return;
                    inputElement.checked = checked;
                    onChange();
                });
                return checkbutton;
            },
            unuse: () => {
                unuse?.();
                unuse = undefined;
                return checkbutton;
            },
        }));
        input.event.subscribe('change', () => {
            if (unuse) {
                const checked = inputElement.checked;
                inputElement.checked = !checked; // undo because it's managed by a State.Mutable<boolean>
                checkbutton.event.emit('trySetChecked', checked);
                return;
            }
            onChange();
        });
        function onChange() {
            state.value = inputElement.checked;
            checkbutton.style.toggle(inputElement.checked, 'checkbutton--checked');
            checkbutton.event.emit('setChecked', inputElement.checked);
        }
        return checkbutton;
    });
    exports.default = Checkbutton;
});
define("ui/component/OAuthService", ["require", "exports", "model/Session", "ui/Component", "ui/component/core/Checkbutton", "utility/State"], function (require, exports, Session_1, Component_19, Checkbutton_1, State_21) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Session_1 = __importDefault(Session_1);
    Component_19 = __importDefault(Component_19);
    Checkbutton_1 = __importDefault(Checkbutton_1);
    State_21 = __importDefault(State_21);
    const OAuthService = Component_19.default.Builder((component, service, reauthDangerToken) => {
        const authedAtStart = !!Session_1.default.Auth.get(service.name);
        const authorisationState = Session_1.default.Auth.authorisations.map(component, authorisations => authorisations.find(authorisation => authorisation.service === service.name));
        const isAuthed = State_21.default.Truthy(component, authorisationState);
        const button = component
            .and(Checkbutton_1.default)
            .setChecked(authedAtStart)
            .style('oauth-service')
            .ariaRole('button')
            .attributes.remove('aria-checked')
            .style.bind(isAuthed, 'oauth-service--authenticated')
            .style.setVariable('colour', `#${service.colour.toString(16)}`)
            .append((0, Component_19.default)('img')
            .style('oauth-service-icon')
            .attributes.set('src', service.icon))
            .append((0, Component_19.default)()
            .style('oauth-service-name')
            .text.set(service.name))
            .extend(button => ({}));
        button.style.bind(button.disabled, 'button--disabled', 'oauth-service--disabled');
        if (!reauthDangerToken)
            (0, Component_19.default)()
                .style('oauth-service-state')
                .style.bind(isAuthed, 'oauth-service-state--authenticated')
                .style.bind(State_21.default.Map(button, [button.hoveredOrFocused, button.disabled], (focus, disabled) => focus && !disabled), 'oauth-service-state--focus')
                .appendTo((0, Component_19.default)()
                .style('oauth-service-state-wrapper')
                .style.bind(button.hoveredOrFocused, 'oauth-service-state-wrapper--focus')
                .appendTo(button));
        const username = (0, Component_19.default)()
            .style('oauth-service-username')
            .style.bind(isAuthed, 'oauth-service-username--has-username')
            .ariaHidden()
            .appendTo(button);
        authorisationState.use(button, authorisation => {
            button.ariaLabel.use(quilt => quilt[`view/account/auth/service/accessibility/${authorisation ? 'disconnect' : 'connect'}`](service.name, authorisation?.display_name));
            username.text.set(authorisation?.display_name ?? '');
        });
        button.onRooted(() => {
            button.event.subscribe('click', async (event) => {
                if (button.disabled.value)
                    return;
                event.preventDefault();
                if (reauthDangerToken) {
                    if (!Session_1.default.Auth.canRequestDangerToken())
                        return;
                    const granted = await Session_1.default.Auth.requestDangerToken(reauthDangerToken, service);
                    if (granted)
                        button.event.bubble('dangerTokenGranted', reauthDangerToken);
                    else
                        ;
                    // TODO show notification
                    return;
                }
                let auth = Session_1.default.Auth.get(service.name);
                if (auth)
                    await Session_1.default.Auth.unauth(auth.id);
                else
                    await Session_1.default.Auth.auth(service);
                auth = Session_1.default.Auth.get(service.name);
                event.component.setChecked(!!auth);
            });
        });
        return button;
    });
    exports.default = OAuthService;
});
define("ui/component/OAuthServices", ["require", "exports", "endpoint/auth/EndpointAuthServices", "model/Session", "ui/Component", "ui/component/core/Block", "ui/component/OAuthService", "utility/Objects", "utility/State"], function (require, exports, EndpointAuthServices_1, Session_2, Component_20, Block_4, OAuthService_1, Objects_2, State_22) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    EndpointAuthServices_1 = __importDefault(EndpointAuthServices_1);
    Session_2 = __importDefault(Session_2);
    Component_20 = __importDefault(Component_20);
    Block_4 = __importDefault(Block_4);
    OAuthService_1 = __importDefault(OAuthService_1);
    Objects_2 = __importDefault(Objects_2);
    State_22 = __importDefault(State_22);
    const OAuthServices = Component_20.default.Builder(async (component, state, reauthDangerToken) => {
        const block = component
            .and(Block_4.default)
            .viewTransition('oauth-services')
            .style('oauth-service-container')
            .style.toggle(!!reauthDangerToken, 'oauth-service-container--reauth-list')
            .extend(block => ({}));
        if (reauthDangerToken) {
            block.type('flush');
        }
        else {
            state.use(component, state => {
                block.title.text.use(`view/account/auth/${state}/title`);
                block.description.text.use(`view/account/auth/${state}/description`);
            });
        }
        const list = (0, Component_20.default)()
            .style('oauth-service-list')
            .appendTo(block);
        const services = await EndpointAuthServices_1.default.query();
        if (toast.handleError(services)) {
            console.error(services);
            return block;
        }
        for (const service of Objects_2.default.values(services.data))
            if (!reauthDangerToken || Session_2.default.Auth.isAuthed(service))
                (0, OAuthService_1.default)(service, reauthDangerToken)
                    .bindDisabled(State_22.default
                    .Use(component, { authorisations: Session_2.default.Auth.authorisations, author: Session_2.default.Auth.author })
                    .map(component, ({ authorisations, author }) => true
                    && !!author
                    && authorisations.length === 1
                    && authorisations[0].service === service.name), 'singly-authed-service')
                    // .event.subscribe("dangerTokenGranted", event => block.event.emit("dangerTokenGranted"))
                    .appendTo(list);
        return block;
    });
    exports.default = OAuthServices;
});
define("ui/component/core/ConfirmDialog", ["require", "exports", "model/Session", "ui/Component", "ui/component/core/BlockDialog", "ui/component/core/Button", "ui/component/core/Paragraph", "ui/component/OAuthServices", "utility/State"], function (require, exports, Session_3, Component_21, BlockDialog_1, Button_4, Paragraph_2, OAuthServices_1, State_23) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Session_3 = __importDefault(Session_3);
    Component_21 = __importDefault(Component_21);
    BlockDialog_1 = __importDefault(BlockDialog_1);
    Button_4 = __importDefault(Button_4);
    Paragraph_2 = __importDefault(Paragraph_2);
    OAuthServices_1 = __importDefault(OAuthServices_1);
    State_23 = __importDefault(State_23);
    const ConfirmDialog = Object.assign(Component_21.default.Builder(async (component, definition) => {
        const dialog = component.and(BlockDialog_1.default);
        const state = (0, State_23.default)(undefined);
        dialog.title.text.use(definition?.titleTranslation ?? 'shared/prompt/confirm');
        const cancelButton = (0, Button_4.default)()
            .text.use(definition?.confirmButtonTranslation ?? 'shared/action/cancel')
            .appendTo(dialog.footer.right);
        const confirmButton = (0, Button_4.default)()
            .type('primary')
            .text.use(definition?.confirmButtonTranslation ?? 'shared/action/confirm')
            .appendTo(dialog.footer.right);
        if (definition?.dangerToken) {
            confirmButton.setDisabled(true, 'danger-token');
            (0, Paragraph_2.default)()
                .text.use('shared/prompt/reauth')
                .appendTo(dialog.content);
            const authServices = await (0, OAuthServices_1.default)(Session_3.default.Auth.state, definition.dangerToken);
            authServices
                .event.subscribe('dangerTokenGranted', () => confirmButton.setDisabled(false, 'danger-token'))
                .appendTo(dialog.content);
        }
        return dialog
            .extend(dialog => ({
            state,
            cancelButton,
            confirmButton,
            await(owner) {
                state.value = undefined;
                dialog.open();
                return new Promise(resolve => dialog.state.await(owner, [true, false], resolve));
            },
            cancel() {
                state.value = false;
                dialog.close();
            },
            confirm() {
                state.value = true;
                dialog.close();
            },
        }))
            .onRooted(dialog => {
            dialog.cancelButton.event.subscribe('click', dialog.cancel);
            dialog.confirmButton.event.subscribe('click', dialog.confirm);
        });
    }), {
        prompt: async (owner, definition) => (await ConfirmDialog(definition))
            .appendTo(document.body)
            .event.subscribe('close', event => event.component.event.subscribe('transitionend', event => event.component.remove()))
            .await(owner),
    });
    exports.default = ConfirmDialog;
});
define("endpoint/author/EndpointAuthorCreate", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_7 = __importDefault(Endpoint_7);
    exports.default = (0, Endpoint_7.default)('/author/create', 'post');
});
define("endpoint/author/EndpointAuthorUpdate", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_8) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_8 = __importDefault(Endpoint_8);
    exports.default = (0, Endpoint_8.default)('/author/update', 'post');
});
define("ui/component/core/LabelledRow", ["require", "exports", "ui/Component", "ui/component/core/Label"], function (require, exports, Component_22, Label_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Component_22 = __importDefault(Component_22);
    const LabelledRow = Component_22.default.Builder((row) => {
        row.style('labelled-row');
        let label = (0, Label_1.AutoLabel)().style('labelled-row-label').appendTo(row);
        let content = (0, Component_22.default)().style('labelled-row-content').appendTo(row);
        return row
            .extend(row => ({
            label, content,
        }))
            .extendMagic('label', row => ({
            get: () => label,
            set: newLabel => {
                if (label === newLabel)
                    return;
                Component_22.default.removeContents(label.element);
                label.element.replaceWith(newLabel.element);
                label = newLabel;
            },
        }))
            .extendMagic('content', row => ({
            get: () => content,
            set: newContent => {
                if (content === newContent)
                    return;
                Component_22.default.removeContents(content.element);
                content.element.replaceWith(newContent.element);
                content = newContent;
            },
        }));
    });
    exports.default = LabelledRow;
});
define("ui/component/core/LabelledTable", ["require", "exports", "ui/Component", "ui/component/core/LabelledRow"], function (require, exports, Component_23, LabelledRow_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Component_23 = __importDefault(Component_23);
    LabelledRow_1 = __importDefault(LabelledRow_1);
    const LabelledTable = Component_23.default.Builder((table) => {
        table.style('labelled-table');
        let labelInitialiser;
        let factory;
        return table.extend(table => ({
            label: initialiser => {
                labelInitialiser = initialiser;
                return factory ??= {
                    content: contentInitialiser => {
                        const row = (0, LabelledRow_1.default)()
                            .style('labelled-row--in-labelled-table')
                            .appendTo(table);
                        row.label = labelInitialiser(row.label, row);
                        row.content = contentInitialiser(row.content, row.label, row) ?? row.content;
                        labelInitialiser = undefined;
                        return table;
                    },
                };
            },
        }));
    });
    exports.default = LabelledTable;
});
define("ui/component/core/TextInput", ["require", "exports", "lang/en-nz", "ui/Component", "ui/component/core/ext/Input", "ui/utility/StringApplicator", "utility/State"], function (require, exports, en_nz_5, Component_24, Input_1, StringApplicator_5, State_24) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FilterFunction = FilterFunction;
    en_nz_5 = __importDefault(en_nz_5);
    Component_24 = __importDefault(Component_24);
    Input_1 = __importDefault(Input_1);
    StringApplicator_5 = __importDefault(StringApplicator_5);
    State_24 = __importDefault(State_24);
    function FilterFunction(fn) {
        return ((before, selected, after) => selected === undefined
            ? fn('', before, '').join('')
            : fn(before, selected, after));
    }
    const TextInput = Component_24.default.Builder('input', (component) => {
        let shouldIgnoreInputEvent = false;
        let filterFunction;
        const state = (0, State_24.default)('');
        const input = component
            .and(Input_1.default)
            .style('text-input')
            .attributes.set('type', 'text')
            .extend(input => ({
            value: '',
            state,
            default: (0, StringApplicator_5.default)(input, value => {
                if (input.value === '') {
                    input.value = value ?? '';
                    state.value = value ?? '';
                    input.length.asMutable?.setValue(value?.length ?? 0);
                }
            }),
            placeholder: (0, StringApplicator_5.default)(input, value => {
                input.attributes.set('placeholder', value);
            }),
            ignoreInputEvent: (ignore = true) => {
                shouldIgnoreInputEvent = ignore;
                return input;
            },
            filter: filter => {
                filterFunction = filter;
                return input;
            },
        }))
            .extendMagic('value', input => ({
            get: () => input.element.value || '',
            set: (value) => {
                const element = input.element;
                element.value = value;
                applyFilter('change');
                state.value = element.value;
                input.length.asMutable?.setValue(element.value.length);
            },
        }));
        input.length.asMutable?.setValue(0);
        input.event.subscribe(['input', 'change'], event => {
            applyFilter(event.type);
            if (shouldIgnoreInputEvent)
                return;
            state.value = input.value;
            input.length.asMutable?.setValue(input.value.length);
            let invalid;
            if ((input.length.value ?? 0) > (input.maxLength.value ?? Infinity))
                invalid = en_nz_5.default['shared/form/invalid/too-long']();
            input.setCustomInvalidMessage(invalid);
        });
        return input;
        function applyFilter(type) {
            const element = input.element.asType('input');
            if (filterFunction && element) {
                if (type === 'change') {
                    element.value = filterFunction('', input.value, '').join('');
                }
                else {
                    let { selectionStart, selectionEnd, value } = element;
                    const hasSelection = selectionStart !== null || selectionEnd !== null;
                    selectionStart ??= value.length;
                    selectionEnd ??= value.length;
                    const [beforeSelection, selection, afterSelection] = filterFunction(value.slice(0, selectionStart), value.slice(selectionStart, selectionEnd), value.slice(selectionEnd));
                    element.value = beforeSelection + selection + afterSelection;
                    if (hasSelection)
                        element.setSelectionRange(beforeSelection.length, beforeSelection.length + selection.length);
                }
            }
        }
    });
    exports.default = TextInput;
});
define("ui/component/core/TextInputBlock", ["require", "exports", "ui/Component", "ui/component/core/TextInput"], function (require, exports, Component_25, TextInput_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Component_25 = __importDefault(Component_25);
    TextInput_1 = __importDefault(TextInput_1);
    const TextInputBlock = Component_25.default.Builder((component) => {
        const inputs = [];
        const block = component
            .style('text-input-block')
            .extend(block => ({
            inputs,
            addInput: (initialiser) => {
                const input = (0, TextInput_1.default)()
                    .style('text-input-block-input')
                    .tweak(initialiser)
                    .tweak(input => input.removed.awaitManual(true, () => {
                    inputs.filterInPlace(i => i !== input);
                    const firstInput = inputs.at(0);
                    firstInput?.style('text-input-block-input--first');
                    firstInput?.previousSibling?.remove(); // remove previous divider if it exists
                    inputs.at(-1)?.style('text-input-block-input--last');
                    inputs.at(-1)?.parent?.style('text-input-block-input-wrapper--last');
                }))
                    .appendTo((0, Component_25.default)()
                    .style('text-input-block-input-wrapper')
                    .appendTo(block));
                if (!inputs.length)
                    input.style('text-input-block-input--first');
                inputs.at(-1)?.style.remove('text-input-block-input--last');
                inputs.at(-1)?.parent?.style.remove('text-input-block-input-wrapper--last');
                inputs.push(input);
                input.style('text-input-block-input--last');
                input.parent?.style('text-input-block-input-wrapper--last');
                return block;
            },
        }));
        return block;
    });
    exports.default = TextInputBlock;
});
define("ui/component/core/LabelledTextInputBlock", ["require", "exports", "ui/Component", "ui/component/core/Label", "ui/component/core/TextInputBlock"], function (require, exports, Component_26, Label_2, TextInputBlock_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Component_26 = __importDefault(Component_26);
    TextInputBlock_1 = __importDefault(TextInputBlock_1);
    const LabelledTextInputBlock = Component_26.default.Builder((block) => {
        block.style('labelled-text-input-block', 'labelled-row')
            .ariaRole('group');
        const labels = (0, Component_26.default)()
            .style('labelled-text-input-block-labels')
            .appendTo(block);
        const inputs = (0, TextInputBlock_1.default)()
            .style('labelled-text-input-block-inputs')
            .appendTo(block);
        let labelInitialiser;
        let factory;
        return block.extend(block => ({
            labels,
            inputs,
            label: initialiser => {
                labelInitialiser = initialiser;
                return factory ??= {
                    input: inputInitialiser => {
                        const rowNumber = inputs.inputs.length + 1;
                        const label = (0, Label_2.AutoLabel)()
                            .style('labelled-text-input-block-label')
                            .style.setProperty('grid-row', `${rowNumber}`)
                            .appendTo(labels);
                        labelInitialiser(label);
                        inputs.addInput(input => input
                            .style('labelled-text-input-block-input')
                            .style.setProperty('grid-row', `${rowNumber}`)
                            .tweak(input => inputInitialiser(input.setLabel(label), label)));
                        labelInitialiser = undefined;
                        return block;
                    },
                };
            },
        }));
    });
    exports.default = LabelledTextInputBlock;
});
define("ui/Announcer", ["require", "exports", "ui/Component"], function (require, exports, Component_27) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Component_27 = __importDefault(Component_27);
    var Announcer;
    (function (Announcer) {
        const assertive = (0, Component_27.default)()
            .attributes.set('aria-live', 'assertive')
            .style.setProperty('opacity', '0')
            .style.setProperty('user-select', 'none')
            .style.setProperty('pointer-events', 'none')
            .style.setProperty('position', 'fixed')
            .appendTo(document.body);
        const polite = (0, Component_27.default)()
            .attributes.set('aria-live', 'polite')
            .style.setProperty('opacity', '0')
            .style.setProperty('user-select', 'none')
            .style.setProperty('pointer-events', 'none')
            .style.setProperty('position', 'fixed')
            .appendTo(document.body);
        function interrupt(id, announcer) {
            announceInternal(assertive, id, announcer);
        }
        Announcer.interrupt = interrupt;
        function announce(id, announcer) {
            announceInternal(polite, id, announcer);
        }
        Announcer.announce = announce;
        function announceInternal(within, id, announcer) {
            const components = [];
            announcer(keyOrHandler => {
                components.push((0, Component_27.default)('p')
                    .attributes.set('data-id', id)
                    .text.use(keyOrHandler));
            });
            const current = getAnnouncementElements(within, id);
            if (current.length) {
                const currentText = current.map(el => el.textContent).join('\n');
                const newText = components.map(component => component.element.textContent).join('\n');
                if (newText === currentText)
                    return;
                for (const element of current)
                    element.remove();
            }
            for (const component of components)
                component.appendTo(within);
        }
        function getAnnouncementElements(within, id) {
            return [
                ...within.element.querySelectorAll(`[data-id="${id}"]`),
            ];
        }
    })(Announcer || (Announcer = {}));
    exports.default = Announcer;
});
define("ui/component/core/RadioButton", ["require", "exports", "ui/Component", "ui/component/core/Checkbutton"], function (require, exports, Component_28, Checkbutton_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Component_28 = __importDefault(Component_28);
    Checkbutton_2 = __importDefault(Checkbutton_2);
    exports.default = Component_28.default.Builder(() => {
        const cb = (0, Checkbutton_2.default)();
        cb.ariaRole("radio");
        cb.input.attributes.set("type", "radio");
        return cb;
    });
});
define("ui/view/shared/ext/ViewTransition", ["require", "exports", "ui/Component", "utility/Arrays"], function (require, exports, Component_29, Arrays_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Component_29 = __importDefault(Component_29);
    var ViewTransition;
    (function (ViewTransition) {
        const DATA_VIEW_TRANSITION_NAME = 'data-view-transition-name';
        const DATA_SUBVIEW_TRANSITION_NAME = 'data-subview-transition-name';
        const DATA_ID = 'data-view-transition-id';
        const VIEW_TRANSITION_CLASS_VIEW = 'view-transition';
        const VIEW_TRANSITION_CLASS_SUBVIEW = 'subview-transition';
        const VIEW_TRANSITION_CLASS_DELAY = 'view-transition-delay';
        const PADDING = 100;
        Component_29.default.extend(component => component.extend(component => ({
            viewTransition(name) {
                if (name) {
                    name = name.replace(/[^a-z0-9-]+/g, '-').toLowerCase();
                    component.attributes.set(DATA_VIEW_TRANSITION_NAME, name);
                    component.attributes.compute(DATA_ID, () => `${id++}`);
                }
                else {
                    component.attributes.remove(DATA_VIEW_TRANSITION_NAME);
                    component.attributes.remove(DATA_ID);
                }
                return component;
            },
            subviewTransition(name) {
                if (name) {
                    name = name.replace(/[^a-z0-9-]+/g, '-').toLowerCase();
                    component.attributes.set(DATA_SUBVIEW_TRANSITION_NAME, name);
                    component.attributes.compute(DATA_ID, () => `${id++}`);
                }
                else {
                    component.attributes.remove(DATA_SUBVIEW_TRANSITION_NAME);
                    component.attributes.remove(DATA_ID);
                }
                return component;
            },
        })));
        let id = 0;
        let i = 0;
        let queuedUnapply;
        function perform(type, name, swap) {
            queuedUnapply = undefined;
            if (typeof name === 'function') {
                swap = name;
                name = undefined;
            }
            reapply(type, name);
            const transition = document.startViewTransition(async () => {
                await swap();
                reapply(type, name);
            });
            const id = queuedUnapply = i++;
            void transition.finished.then(() => {
                if (queuedUnapply !== id)
                    // another view transition started, no unapply
                    return;
                unapply(type);
            });
            return transition;
        }
        ViewTransition.perform = perform;
        function reapply(type, name) {
            const components = getComponents(type, name).filter(isInView);
            let i = 0;
            if (type === 'view')
                for (const component of components) {
                    component.classes.add(VIEW_TRANSITION_CLASS_VIEW);
                    const name = component.attributes.get(DATA_VIEW_TRANSITION_NAME);
                    component.style.setVariable('view-transition-delay', `${VIEW_TRANSITION_CLASS_DELAY}-${i}`);
                    component.style.setProperty('view-transition-name', `${VIEW_TRANSITION_CLASS_VIEW}-${name}-${i++}`);
                }
            else
                for (const component of components) {
                    component.classes.add(VIEW_TRANSITION_CLASS_SUBVIEW);
                    const name = component.attributes.get(DATA_SUBVIEW_TRANSITION_NAME);
                    const id = +component.attributes.get(DATA_ID) || 0;
                    component.style.setProperty('view-transition-name', `${VIEW_TRANSITION_CLASS_SUBVIEW}-${name}-${id}`);
                    component.style.setVariable('view-transition-delay', `${VIEW_TRANSITION_CLASS_DELAY}-${i++}`);
                }
        }
        ViewTransition.reapply = reapply;
        function unapply(type) {
            for (const component of getComponents(type)) {
                component.classes.remove(VIEW_TRANSITION_CLASS_VIEW);
                component.classes.remove(VIEW_TRANSITION_CLASS_SUBVIEW);
                component.style.removeProperties('view-transition-name');
                component.style.removeVariables('view-transition-delay');
            }
        }
        ViewTransition.unapply = unapply;
        function isInView(component) {
            const rect = component.element.getBoundingClientRect();
            return true
                && rect.bottom > -PADDING && rect.top < window.innerHeight + PADDING
                && rect.right > -PADDING && rect.left < window.innerWidth + PADDING;
        }
        function getComponents(type, name) {
            return [...document.querySelectorAll(`[${type === 'view' ? DATA_VIEW_TRANSITION_NAME : DATA_SUBVIEW_TRANSITION_NAME}${name ? `="${name}"` : ''}]`)]
                .map(e => e.component)
                .filter(Arrays_4.NonNullish);
        }
    })(ViewTransition || (ViewTransition = {}));
    exports.default = ViewTransition;
});
define("ui/component/core/TextEditor", ["require", "exports", "lang/en-nz", "model/Session", "prosemirror-commands", "prosemirror-dropcursor", "prosemirror-example-setup", "prosemirror-gapcursor", "prosemirror-history", "prosemirror-inputrules", "prosemirror-keymap", "prosemirror-markdown", "prosemirror-model", "prosemirror-schema-list", "prosemirror-state", "prosemirror-transform", "prosemirror-view", "ui/Announcer", "ui/Component", "ui/component/core/Button", "ui/component/core/Checkbutton", "ui/component/core/Dialog", "ui/component/core/ext/Input", "ui/component/core/Popover", "ui/component/core/RadioButton", "ui/component/core/Slot", "ui/utility/StringApplicator", "ui/utility/Viewport", "ui/view/shared/ext/ViewTransition", "utility/Arrays", "utility/Define", "utility/Objects", "utility/State", "utility/Store", "utility/string/Markdown", "utility/Time", "w3c-keyname"], function (require, exports, en_nz_6, Session_4, prosemirror_commands_1, prosemirror_dropcursor_1, prosemirror_example_setup_1, prosemirror_gapcursor_1, prosemirror_history_1, prosemirror_inputrules_1, prosemirror_keymap_1, prosemirror_markdown_1, prosemirror_model_1, prosemirror_schema_list_1, prosemirror_state_1, prosemirror_transform_1, prosemirror_view_1, Announcer_1, Component_30, Button_5, Checkbutton_3, Dialog_2, Input_2, Popover_2, RadioButton_1, Slot_3, StringApplicator_6, Viewport_3, ViewTransition_1, Arrays_5, Define_5, Objects_3, State_25, Store_3, Markdown_2, Time_5, w3c_keyname_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    en_nz_6 = __importDefault(en_nz_6);
    Session_4 = __importDefault(Session_4);
    Announcer_1 = __importDefault(Announcer_1);
    Component_30 = __importDefault(Component_30);
    Button_5 = __importDefault(Button_5);
    Checkbutton_3 = __importDefault(Checkbutton_3);
    Dialog_2 = __importDefault(Dialog_2);
    Input_2 = __importDefault(Input_2);
    Popover_2 = __importDefault(Popover_2);
    RadioButton_1 = __importDefault(RadioButton_1);
    Slot_3 = __importDefault(Slot_3);
    StringApplicator_6 = __importDefault(StringApplicator_6);
    Viewport_3 = __importDefault(Viewport_3);
    ViewTransition_1 = __importDefault(ViewTransition_1);
    Arrays_5 = __importDefault(Arrays_5);
    Define_5 = __importDefault(Define_5);
    Objects_3 = __importDefault(Objects_3);
    State_25 = __importDefault(State_25);
    Store_3 = __importDefault(Store_3);
    Markdown_2 = __importDefault(Markdown_2);
    Time_5 = __importDefault(Time_5);
    w3c_keyname_1 = __importDefault(w3c_keyname_1);
    function vars(...params) { }
    function types() { }
    ////////////////////////////////////
    //#region Module Augmentation
    const baseKeyName = w3c_keyname_1.default.keyName;
    w3c_keyname_1.default.keyName = (event) => {
        const keyboardEvent = event;
        if (keyboardEvent.code.startsWith('Numpad') && !keyboardEvent.shiftKey && (keyboardEvent.ctrlKey || keyboardEvent.altKey)) {
            Object.defineProperty(event, 'shiftKey', { value: true });
            const str = keyboardEvent.code.slice(6);
            if (str === 'Decimal')
                return '.';
            if (!isNaN(+str))
                return str;
        }
        return baseKeyName(event);
    };
    (0, Define_5.default)(prosemirror_model_1.ResolvedPos.prototype, 'closest', function (node, attrsOrStartingAtDepth, startingAtDepth) {
        if (typeof attrsOrStartingAtDepth === 'number') {
            startingAtDepth = attrsOrStartingAtDepth;
            attrsOrStartingAtDepth = undefined;
        }
        const attrs = attrsOrStartingAtDepth;
        startingAtDepth ??= this.depth;
        for (let depth = startingAtDepth; depth >= 0; depth--) {
            const current = this.node(depth);
            if (current.type === node && (!attrs || current.hasAttrs(attrs)))
                return current;
        }
        return undefined;
    });
    (0, Define_5.default)(prosemirror_model_1.Node.prototype, 'matches', function (type, attrs) {
        if (type !== undefined && this.type !== type)
            return false;
        return attrs === undefined || this.hasAttrs(attrs);
    });
    (0, Define_5.default)(prosemirror_model_1.Node.prototype, 'hasAttrs', function (attrs) {
        for (const [attr, val] of Object.entries(attrs))
            if (this.attrs[attr] !== val)
                return false;
        return true;
    });
    (0, Define_5.default)(prosemirror_model_1.Node.prototype, 'pos', function (document) {
        if (document === this)
            return 0;
        let result;
        document.descendants((node, pos) => {
            if (result !== undefined)
                return false;
            if (node === this) {
                result = pos;
                return false;
            }
        });
        return result;
    });
    (0, Define_5.default)(prosemirror_model_1.Node.prototype, 'parent', function (document) {
        if (document === this)
            return undefined;
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const searchNode = this;
        return searchChildren(document);
        function searchChildren(parent) {
            let result;
            parent.forEach(child => {
                result ??= (child === searchNode ? parent : undefined)
                    ?? searchChildren(child);
            });
            return result;
        }
    });
    (0, Define_5.default)(prosemirror_model_1.Node.prototype, 'depth', function (document) {
        if (document === this)
            return 0;
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const searchNode = this;
        return searchChildren(document, 1);
        function searchChildren(parent, depth) {
            let result;
            parent.forEach(child => {
                result ??= (child === searchNode ? depth : undefined)
                    ?? searchChildren(child, depth + 1);
            });
            return result;
        }
    });
    (0, Define_5.default)(prosemirror_model_1.Fragment.prototype, 'pos', function (document) {
        let result;
        document.descendants((node, pos) => {
            if (result !== undefined)
                return false;
            if (node.content === this) {
                result = pos + 1;
                return false;
            }
        });
        return result;
    });
    (0, Define_5.default)(prosemirror_model_1.Fragment.prototype, 'range', function (document) {
        const pos = this.pos(document);
        if (!pos)
            return undefined;
        const $from = document.resolve(pos);
        const $to = document.resolve(pos + this.size);
        return new prosemirror_model_1.NodeRange($from, $to, Math.min($from.depth, $to.depth));
    });
    (0, Define_5.default)(prosemirror_model_1.Fragment.prototype, 'parent', function (document) {
        if (document.content === this)
            return document;
        let result;
        document.descendants((node, pos) => {
            if (result !== undefined)
                return false;
            if (node.content === this) {
                result = node;
                return false;
            }
        });
        return result;
    });
    (0, Define_5.default)(prosemirror_transform_1.Transform.prototype, 'stripNodeType', function (from, type) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const tr = this;
        let range = from instanceof prosemirror_model_1.Fragment ? from.range(tr.doc) : from;
        if (!range)
            return this;
        while (stripRange())
            ;
        return this;
        function stripRange() {
            let stripped = false;
            range.parent.forEach((node, pos, index) => {
                if (stripped)
                    return;
                if (index >= range.startIndex && index < range.endIndex) {
                    if (node.type === type) {
                        stripNode(node);
                        stripped = true;
                        return;
                    }
                    if (stripDescendants(node)) {
                        stripped = true;
                        return;
                    }
                }
            });
            return stripped;
        }
        function stripDescendants(node) {
            let stripped = false;
            node.descendants((node, pos) => {
                if (stripped)
                    return;
                if (node.type === type) {
                    stripNode(node);
                    stripped = true;
                    return;
                }
            });
            return stripped;
        }
        function stripNode(node) {
            const nodePos = node.pos(tr.doc);
            if (nodePos === undefined)
                throw new Error('Unable to continue stripping, no pos');
            const liftRange = node.content.range(tr.doc);
            if (!liftRange)
                throw new Error('Unable to continue stripping, unable to resolve node range');
            const depth = (0, prosemirror_transform_1.liftTarget)(liftRange);
            if (depth !== null)
                tr.lift(liftRange, depth);
            if (range) {
                let start = range.$from.pos;
                start = start <= nodePos ? start : start - 1;
                let end = range.$to.pos;
                end = end < nodePos + node.nodeSize ? end - 1 : end - 2;
                const newRange = tr.doc.resolve(start).blockRange(tr.doc.resolve(end));
                if (!newRange)
                    throw new Error('Unable to continue stripping, unable to resolve new range');
                range = newRange;
            }
        }
    });
    //#endregion
    types();
    Session_4.default.setClearedWithSessionChange('textEditorDrafts');
    //#endregion
    vars(w3c_keyname_1.default.keyName);
    types();
    types();
    const schema = new prosemirror_model_1.Schema({
        nodes: Objects_3.default.filterNullish({
            ...prosemirror_markdown_1.schema.spec.nodes.toObject(),
            image: undefined,
            heading: {
                ...prosemirror_markdown_1.schema.spec.nodes.get('heading'),
                content: 'text*',
                toDOM(node) {
                    const heading = (0, Component_30.default)(`h${node.attrs.level}`);
                    heading.style('markdown-heading', `markdown-heading-${node.attrs.level}`);
                    return {
                        dom: heading.element,
                        contentDOM: heading.element,
                    };
                },
            },
            text_align: {
                attrs: { align: { default: 'left', validate: (value) => value === 'left' || value === 'center' || value === 'right' } },
                content: 'block+',
                group: 'block',
                defining: true,
                parseDOM: [
                    { tag: 'center', getAttrs: () => ({ align: 'center' }) },
                    {
                        tag: '*', getAttrs: (element) => {
                            const textAlign = element.style.getPropertyValue('text-align');
                            if (!textAlign)
                                return false;
                            return {
                                align: textAlign === 'justify' || textAlign === 'start' ? 'left'
                                    : textAlign === 'end' ? 'right'
                                        : textAlign,
                            };
                        },
                        priority: 51,
                    },
                ],
                toDOM: (node) => ['div', Objects_3.default.filterNullish({
                        class: node.attrs.align === 'left' ? 'align-left' : undefined,
                        style: `text-align:${node.attrs.align}`,
                    }), 0],
            },
        }),
        marks: {
            ...prosemirror_markdown_1.schema.spec.marks.toObject(),
            underline: {
                parseDOM: [
                    { tag: 'u' },
                    { style: 'text-decoration=underline', clearMark: m => m.type.name === 'underline' },
                ],
                toDOM() { return ['u']; },
            },
            strikethrough: {
                parseDOM: [
                    { tag: 's' },
                    { style: 'text-decoration=line-through', clearMark: m => m.type.name === 'strikethrough' },
                ],
                // toDOM () { return ["s"] },
                toDOM() {
                    const span = document.createElement('span');
                    span.style.setProperty('text-decoration', 'line-through');
                    return span;
                },
            },
            subscript: {
                parseDOM: [
                    { tag: 'sub' },
                ],
                toDOM() { return ['sub']; },
            },
            superscript: {
                parseDOM: [
                    { tag: 'sup' },
                ],
                toDOM() { return ['sup']; },
            },
        },
    });
    //#endregion
    vars(schema);
    types();
    ////////////////////////////////////
    ////////////////////////////////////
    //#region Markdown
    const markdown = Markdown_2.default.clone();
    const REGEX_ATTRIBUTE = (() => {
        const attr_name = '[a-zA-Z_:][a-zA-Z0-9:._-]*';
        const unquoted = '[^"\'=<>`\\x00-\\x20]+';
        const single_quoted = '\'[^\']*\'';
        const double_quoted = '"[^"]*"';
        const attr_value = `(?:${unquoted}|${single_quoted}|${double_quoted})`;
        const attribute = `(${attr_name})(?:\\s*=\\s*(${attr_value}))(?= |$)`;
        return new RegExp(attribute, 'g');
    })();
    const REGEX_CSS_PROPERTY = /^[-a-zA-Z_][a-zA-Z0-9_-]*$/;
    const markdownHTMLNodeRegistry = {
        text_align: {
            getAttrs: token => {
                const align = token.style?.get('text-align');
                if (!['left', 'center', 'right'].includes(align))
                    return undefined;
                return { align };
            },
        },
    };
    const originalParse = markdown.parse;
    markdown.parse = (src, env) => {
        const rawTokens = originalParse.call(markdown, src, env);
        const tokens = [];
        // the `level` of the parent `_open` token
        let level = 0;
        for (const token of rawTokens) {
            if (token.type !== 'html_block_open' && token.type !== 'html_block_close') {
                tokens.push(token);
                continue;
            }
            if (token.nesting < 0) {
                const opening = tokens.findLast(token => token.level === level);
                if (!opening) {
                    console.warn('Invalid HTML in markdown:', token.raw);
                    continue;
                }
                token.type = `${opening.type.slice(0, -5)}_close`;
                tokens.push(token);
                level = token.level;
                continue;
            }
            for (const [nodeType, spec] of Object.entries(markdownHTMLNodeRegistry)) {
                const attrs = spec.getAttrs(token);
                if (attrs) {
                    token.type = nodeType;
                    if (attrs !== true)
                        token.nodeAttrs = attrs;
                    break;
                }
            }
            token.type = `${token.type}_open`;
            level = token.level;
            tokens.push(token);
        }
        return tokens;
    };
    const markdownParser = new prosemirror_markdown_1.MarkdownParser(schema, markdown, Objects_3.default.filterNullish({
        ...prosemirror_markdown_1.defaultMarkdownParser.tokens,
        image: undefined,
        u: {
            mark: 'underline',
        },
        s: {
            mark: 'strikethrough',
        },
        ...Object.entries(markdownHTMLNodeRegistry)
            .toObject(([tokenType, spec]) => [tokenType, {
                block: tokenType,
                getAttrs: token => token.nodeAttrs ?? {},
            }]),
    }));
    const markdownSerializer = new prosemirror_markdown_1.MarkdownSerializer({
        ...prosemirror_markdown_1.defaultMarkdownSerializer.nodes,
        text_align: (state, node, parent, index) => {
            state.write(`<div style="text-align:${node.attrs.align}">\n`);
            state.renderContent(node);
            state.write('</div>');
            state.closeBlock(node);
        },
    }, {
        ...prosemirror_markdown_1.defaultMarkdownSerializer.marks,
        strikethrough: {
            open: '~~',
            close: '~~',
            expelEnclosingWhitespace: true,
        },
        underline: {
            open: '__',
            close: '__',
            expelEnclosingWhitespace: true,
        },
    });
    function parseStyleAttributeValue(style) {
        if (style === undefined || style === null)
            return undefined;
        const styles = new Map();
        let key = '';
        let value = '';
        let inValue = false;
        let isEscaped = false;
        let isQuoted = false;
        let quoteChar = '';
        let parenCount = 0;
        for (let i = 0; i < style.length; i++) {
            const char = style[i];
            if (char === '\\') {
                isEscaped = true;
                continue;
            }
            if (isEscaped) {
                value += char;
                isEscaped = false;
                continue;
            }
            if ((char === '"' || char === '\'') && !isQuoted) {
                isQuoted = true;
                quoteChar = char;
                continue;
            }
            if (char === quoteChar && isQuoted) {
                isQuoted = false;
                continue;
            }
            if (char === '(' && !isQuoted) {
                parenCount++;
                value += char;
                continue;
            }
            if (char === ')' && !isQuoted) {
                parenCount--;
                value += char;
                continue;
            }
            if (char === ':' && !isQuoted && parenCount === 0) {
                inValue = true;
                continue;
            }
            if (char === ';' && !isQuoted && parenCount === 0) {
                if (key && value) {
                    key = key.trim();
                    if (!REGEX_CSS_PROPERTY.test(key))
                        console.warn(`Invalid CSS property "${key}"`);
                    else
                        styles.set(key, value.trim());
                    key = '';
                    value = '';
                }
                inValue = false;
                continue;
            }
            if (inValue) {
                value += char;
            }
            else {
                key += char;
            }
        }
        if (key && value) {
            key = key.trim();
            if (!REGEX_CSS_PROPERTY.test(key))
                console.warn(`Invalid CSS property "${key}"`);
            else
                styles.set(key, value.trim());
        }
        return styles;
    }
    //#endregion
    vars(REGEX_ATTRIBUTE, REGEX_CSS_PROPERTY, markdownParser, markdownSerializer, parseStyleAttributeValue);
    ////////////////////////////////////
    const BLOCK_TYPES = [
        'paragraph',
        'code_block',
    ];
    let globalid = 0;
    const TextEditor = Component_30.default.Builder((component) => {
        const id = globalid++;
        const isMarkdown = (0, State_25.default)(false);
        const content = (0, State_25.default)('');
        const isFullscreen = (0, State_25.default)(false);
        // eslint-disable-next-line prefer-const
        let editor;
        const state = (0, State_25.default)(undefined);
        ////////////////////////////////////
        //#region Announcements
        state.subscribe(component, () => {
            if (!editor.mirror?.hasFocus() || !editor.mirror.state.selection.empty)
                return;
            const pos = editor.mirror.state.selection.from + 1;
            const $pos = editor.mirror.state.doc.resolve(pos > editor.mirror.state.doc.content.size ? pos - 1 : pos);
            Announcer_1.default.interrupt('text-editor/format/inline', announce => {
                const markTypes = Object.keys(schema.marks);
                let hadActive = false;
                for (const type of markTypes) {
                    if (!isMarkActive(schema.marks[type], $pos))
                        continue;
                    hadActive = true;
                    announce(`component/text-editor/formatting/${type}`);
                }
                if (!hadActive)
                    announce('component/text-editor/formatting/none');
            });
        });
        ////////////////////////////////////
        //#region Types
        const ToolbarButtonTypeMark = Component_30.default.Extension((component, type) => {
            const mark = schema.marks[type];
            return component
                .style(`text-editor-toolbar-${type}`)
                .ariaLabel.use(`component/text-editor/toolbar/button/${type}`)
                .extend(() => ({ mark }));
        });
        const ToolbarButtonTypeNode = Component_30.default.Extension((component, type) => {
            const node = schema.nodes[type.replaceAll('-', '_')];
            return component
                .style(`text-editor-toolbar-${type}`)
                .ariaLabel.use(`component/text-editor/toolbar/button/${type}`)
                .extend(() => ({ node }));
        });
        const ToolbarButtonTypeOther = Component_30.default.Extension((component, type) => {
            return component
                .style(`text-editor-toolbar-${type}`)
                .ariaLabel.use(`component/text-editor/toolbar/button/${type}`);
        });
        //#endregion
        vars(ToolbarButtonTypeMark, ToolbarButtonTypeNode, ToolbarButtonTypeOther);
        ////////////////////////////////////
        ////////////////////////////////////
        //#region Components
        const ToolbarButtonGroup = Component_30.default.Builder(component => component
            .ariaRole('group')
            .style('text-editor-toolbar-button-group'));
        const ToolbarButton = Component_30.default.Builder((_, handler) => {
            return (0, Button_5.default)()
                .style('text-editor-toolbar-button')
                .clearPopover()
                .receiveFocusedClickEvents()
                .event.subscribe('click', event => {
                event.preventDefault();
                handler(event.component);
            });
        });
        const ToolbarCheckbutton = Component_30.default.Builder((_, state, toggler) => {
            return (0, Checkbutton_3.default)()
                .style('text-editor-toolbar-button')
                .style.bind(state, 'text-editor-toolbar-button--enabled')
                .use(state)
                .clearPopover()
                .receiveFocusedClickEvents()
                .event.subscribe('click', event => {
                event.preventDefault();
                toggler(event.component);
            });
        });
        const ToolbarRadioButton = Component_30.default.Builder((_, name, state, toggler) => {
            return (0, RadioButton_1.default)()
                .style('text-editor-toolbar-button')
                .setName(name)
                .style.bind(state, 'text-editor-toolbar-button--enabled')
                .use(state)
                .clearPopover()
                .receiveFocusedClickEvents()
                .event.subscribe('click', event => {
                event.preventDefault();
                toggler(event.component);
            });
        });
        const ToolbarButtonPopover = Component_30.default.Builder((_, align) => {
            return (0, Button_5.default)()
                .style('text-editor-toolbar-button', 'text-editor-toolbar-button--has-popover')
                .clearPopover()
                .setPopover('hover', (popover, button) => {
                popover
                    .style('text-editor-toolbar-popover')
                    .style.bind(popover.popoverParent.nonNullish, 'text-editor-toolbar-popover-sub', `text-editor-toolbar-popover-sub--${align}`)
                    .anchor.add(align === 'centre' ? align : `aligned ${align}`, 'off bottom')
                    .style.toggle(align === 'left', 'text-editor-toolbar-popover--left')
                    .style.toggle(align === 'right', 'text-editor-toolbar-popover--right')
                    .setMousePadding(20);
                button.style.bind(popover.visible, 'text-editor-toolbar-button--has-popover-visible');
            })
                .receiveAncestorInsertEvents()
                .event.subscribe(['insert', 'ancestorInsert'], event => event.component.style.toggle(!!event.component.closest(Popover_2.default), 'text-editor-toolbar-button--has-popover--within-popover'));
        });
        //#endregion
        vars(ToolbarButtonGroup, ToolbarButton, ToolbarCheckbutton, ToolbarRadioButton, ToolbarButtonPopover);
        ////////////////////////////////////
        ////////////////////////////////////
        //#region Specifics
        const ToolbarButtonMark = Component_30.default.Builder((_, type) => {
            const mark = schema.marks[type];
            const toggler = markToggler(mark);
            const markActive = state.map(component, state => isMarkActive(mark));
            return ToolbarCheckbutton(markActive, toggler)
                .and(ToolbarButtonTypeMark, type);
        });
        const ToolbarButtonAlign = Component_30.default.Builder((_, align) => {
            const toggler = wrapper(schema.nodes.text_align, { align: align === 'centre' ? 'center' : align });
            const alignActive = state.map(component, state => isAlignActive(align));
            return ToolbarRadioButton(`text-editor-${id}-text-align`, alignActive, toggler)
                .and(ToolbarButtonTypeOther, `align-${align}`);
        });
        const ToolbarButtonBlockType = Component_30.default.Builder((_, type) => {
            const node = schema.nodes[type.replaceAll('-', '_')];
            const toggle = blockTypeToggler(node);
            const typeActive = state.map(component, state => isTypeActive(node));
            return ToolbarRadioButton(`text-editor-${id}-block-type`, typeActive, toggle)
                .and(ToolbarButtonTypeNode, type);
        });
        const ToolbarButtonHeading = Component_30.default.Builder((_, level) => {
            const node = schema.nodes.heading;
            const toggle = blockTypeToggler(node, { level });
            const typeActive = state.map(component, state => isTypeActive(node, { level }));
            return ToolbarRadioButton(`text-editor-${id}-block-type`, typeActive, toggle)
                .style(`text-editor-toolbar-h${level}`);
        });
        const ToolbarButtonWrap = Component_30.default.Builder((_, type) => ToolbarButton(wrapper(schema.nodes[type.replaceAll('-', '_')]))
            .and(ToolbarButtonTypeNode, type));
        const ToolbarButtonList = Component_30.default.Builder((_, type) => ToolbarButton(listWrapper(schema.nodes[type.replaceAll('-', '_')]))
            .and(ToolbarButtonTypeNode, type));
        //#endregion
        vars(ToolbarButtonMark, ToolbarButtonAlign, ToolbarButtonBlockType, ToolbarButtonHeading, ToolbarButtonWrap, ToolbarButtonList);
        types();
        ////////////////////////////////////
        ////////////////////////////////////
        //#region Commands
        let inTransaction = false;
        function wrapCmd(cmd) {
            return (component) => {
                if (!state.value)
                    return;
                inTransaction = true;
                cmd(state.value, editor.mirror?.dispatch, editor.mirror);
                inTransaction = false;
                if (!component.hasFocused.value)
                    editor.document?.focus();
            };
        }
        function markToggler(type) {
            return wrapCmd((0, prosemirror_commands_1.toggleMark)(type));
        }
        function wrapper(node, attrs) {
            if (node === schema.nodes.text_align)
                return wrapCmd((state, dispatch) => {
                    const { $from, $to } = state.selection;
                    let range = $from.blockRange($to);
                    if (range) {
                        const textAlignBlock = $from.closest(schema.nodes.text_align, range.depth);
                        if (textAlignBlock && !range.startIndex && range.endIndex === textAlignBlock.childCount) {
                            const pos = textAlignBlock.pos(state.doc);
                            if (pos === undefined)
                                return false;
                            if (dispatch)
                                dispatch(state.tr
                                    .setNodeMarkup(pos, undefined, attrs)
                                    .stripNodeType(textAlignBlock.content, schema.nodes.text_align)
                                    .scrollIntoView());
                            return true;
                        }
                    }
                    const wrapping = range && (0, prosemirror_transform_1.findWrapping)(range, node, attrs);
                    if (!wrapping)
                        return false;
                    if (dispatch) {
                        const tr = state.tr;
                        tr.wrap(range, wrapping);
                        range = tr.doc.resolve($from.pos + 1).blockRange(tr.doc.resolve($to.pos + 1));
                        if (!range)
                            throw new Error('Unable to strip nodes, unable to resolve new range');
                        tr.stripNodeType(range, schema.nodes.text_align);
                        tr.scrollIntoView();
                        dispatch(tr);
                    }
                    return true;
                });
            return wrapCmd((0, prosemirror_commands_1.wrapIn)(node, attrs));
        }
        function blockTypeToggler(node, attrs) {
            return wrapCmd((0, prosemirror_commands_1.setBlockType)(node, attrs));
        }
        function listWrapper(node, attrs) {
            return wrapCmd((0, prosemirror_schema_list_1.wrapInList)(node, attrs));
        }
        //#endregion
        vars(wrapCmd, markToggler, wrapper, blockTypeToggler, listWrapper);
        ////////////////////////////////////
        //#endregion
        vars(ToolbarButtonTypeMark, ToolbarButtonTypeNode, ToolbarButtonTypeOther);
        vars(ToolbarButtonGroup, ToolbarButton, ToolbarCheckbutton, ToolbarRadioButton, ToolbarButtonPopover);
        vars(ToolbarButtonMark, ToolbarButtonAlign, ToolbarButtonBlockType, ToolbarButtonHeading, ToolbarButtonWrap, ToolbarButtonList);
        types();
        ////////////////////////////////////
        const toolbar = (0, Component_30.default)()
            .style('text-editor-toolbar')
            .style.bind(isFullscreen, 'text-editor-toolbar--fullscreen')
            .ariaRole('toolbar')
            .append((0, Component_30.default)()
            .style('text-editor-toolbar-left')
            .append(ToolbarButtonGroup()
            .ariaLabel.use('component/text-editor/toolbar/group/inline')
            .append(ToolbarButtonMark('strong'))
            .append(ToolbarButtonMark('em'))
            .append(ToolbarButtonPopover('left')
            .and(ToolbarButtonTypeOther, 'other-formatting')
            .tweakPopover(popover => popover
            .append(ToolbarButtonMark('underline'))
            .append(ToolbarButtonMark('strikethrough'))
            .append(ToolbarButtonMark('subscript'))
            .append(ToolbarButtonMark('superscript'))
            .append(ToolbarButtonMark('code')))))
            .append(ToolbarButtonGroup()
            .ariaLabel.use('component/text-editor/toolbar/group/block')
            .append(ToolbarButtonPopover('centre')
            .tweakPopover(popover => popover
            .ariaRole('radiogroup')
            .append(ToolbarButtonAlign('left'))
            .append(ToolbarButtonAlign('centre'))
            .append(ToolbarButtonAlign('right')))
            .tweak(button => {
            state.use(button, () => {
                const align = !editor?.mirror?.hasFocus() && !inTransaction ? 'left' : getAlign() ?? 'mixed';
                button.ariaLabel.set(en_nz_6.default['component/text-editor/toolbar/button/align'](en_nz_6.default[`component/text-editor/toolbar/button/align/currently/${align}`]()).toString());
                button.style.remove('text-editor-toolbar-align-left', 'text-editor-toolbar-align-centre', 'text-editor-toolbar-align-right', 'text-editor-toolbar-align-mixed');
                button.style(`text-editor-toolbar-align-${align}`);
            });
        })))
            .append(ToolbarButtonGroup()
            .ariaRole()
            .append(ToolbarButtonPopover('centre')
            .tweakPopover(popover => popover
            .ariaRole('radiogroup')
            .append(ToolbarButtonBlockType('paragraph'))
            .append(ToolbarButtonPopover('centre')
            .style('text-editor-toolbar-heading')
            .tweakPopover(popover => popover
            .append(ToolbarButtonHeading(1))
            .append(ToolbarButtonHeading(2))
            .append(ToolbarButtonHeading(3))
            .append(ToolbarButtonHeading(4))
            .append(ToolbarButtonHeading(5))
            .append(ToolbarButtonHeading(6))))
            .append(ToolbarButtonBlockType('code-block')))
            .tweak(button => {
            state.use(button, () => {
                const blockType = !editor?.mirror?.hasFocus() && !inTransaction ? 'paragraph' : getBlockType() ?? 'mixed';
                button.ariaLabel.set(en_nz_6.default['component/text-editor/toolbar/button/block-type'](en_nz_6.default[`component/text-editor/toolbar/button/block-type/currently/${blockType}`]()).toString());
                button.style.remove('text-editor-toolbar-mixed', ...BLOCK_TYPES
                    .map(type => type.replaceAll('_', '-'))
                    .map(type => `text-editor-toolbar-${type}`));
                button.style(`text-editor-toolbar-${blockType}`);
            });
        })))
            .append(ToolbarButtonGroup()
            .ariaLabel.use('component/text-editor/toolbar/group/wrapper')
            .append(ToolbarButton(wrapCmd(prosemirror_commands_1.lift)).and(ToolbarButtonTypeOther, 'lift')
            .style.bind(state.map(component, value => !value || !(0, prosemirror_commands_1.lift)(value)), 'text-editor-toolbar-button--hidden'))
            .append(ToolbarButtonWrap('blockquote'))
            .append(ToolbarButtonList('bullet-list'))
            .append(ToolbarButtonList('ordered-list')))
            .append(ToolbarButtonGroup()
            .ariaLabel.use('component/text-editor/toolbar/group/insert')
            .append(ToolbarButton(wrapCmd((state, dispatch) => {
            dispatch?.(state.tr.replaceSelectionWith(schema.nodes.horizontal_rule.create()));
            return true;
        }))
            .and(ToolbarButtonTypeOther, 'hr'))))
            .append((0, Component_30.default)()
            .style('text-editor-toolbar-right')
            .append(ToolbarButtonGroup()
            .ariaLabel.use('component/text-editor/toolbar/group/actions')
            .append(ToolbarButton(wrapCmd(prosemirror_history_1.undo)).and(ToolbarButtonTypeOther, 'undo'))
            .append(ToolbarButton(wrapCmd(prosemirror_history_1.redo)).and(ToolbarButtonTypeOther, 'redo'))
            .append(ToolbarButton(toggleFullscreen)
            .style.bind(isFullscreen.not, 'text-editor-toolbar-fullscreen')
            .style.bind(isFullscreen, 'text-editor-toolbar-unfullscreen')
            .ariaLabel.bind(isFullscreen.map(component, fullscreen => en_nz_6.default[`component/text-editor/toolbar/button/${fullscreen ? 'unfullscreen' : 'fullscreen'}`]().toString())))));
        //#endregion
        vars(toolbar);
        ////////////////////////////////////
        ////////////////////////////////////
        //#region Main UI
        let label;
        let unsubscribeLabelFor;
        let unuseLabelRemoved;
        const stopUsingLabel = () => {
            label = undefined;
            unuseLabelRemoved?.();
            unuseLabelRemoved = undefined;
            unsubscribeLabelFor?.();
            unsubscribeLabelFor = undefined;
        };
        const hiddenInput = (0, Component_30.default)('input')
            .style('text-editor-validity-pipe-input')
            .tabIndex('programmatic')
            .attributes.set('type', 'text')
            .setName(`text-editor-validity-pipe-input-${Math.random().toString(36).slice(2)}`);
        const viewTransitionName = 'text-editor';
        const actualEditor = (0, Component_30.default)()
            .subviewTransition(viewTransitionName)
            .style('text-editor')
            .style.bind(isFullscreen, 'text-editor--fullscreen')
            .event.subscribe('click', event => {
            const target = Component_30.default.get(event.target);
            if (target !== toolbar && !target?.is(TextEditor))
                return;
            editor.document?.focus();
        })
            .append(hiddenInput)
            .append(toolbar);
        editor = component
            .and(Slot_3.default)
            .and(Input_2.default)
            .append(actualEditor)
            .pipeValidity(hiddenInput)
            .extend(editor => ({
            content,
            default: (0, StringApplicator_6.default)(editor, value => loadFromMarkdown(value)),
            toolbar,
            setRequired(required = true) {
                editor.style.toggle(required, 'text-editor--required');
                editor.required.asMutable?.setValue(required);
                refresh();
                return editor;
            },
            setLabel(newLabel) {
                stopUsingLabel();
                label = newLabel;
                refresh();
                unuseLabelRemoved = label?.removed.use(editor, removed => removed && stopUsingLabel());
                // the moment a name is assigned to the editor, attempt to replace the doc with a local draft (if it exists)
                unsubscribeLabelFor = label?.for.use(editor, loadLocal);
                return editor;
            },
            useMarkdown: () => {
                clearLocal();
                return !state.value ? '' : markdownSerializer.serialize(state.value?.doc);
            },
        }));
        const documentSlot = (0, Slot_3.default)();
        documentSlot
            .style.bind(isFullscreen, 'text-editor-document-slot--fullscreen')
            .use(isMarkdown, (slot, isMarkdown) => {
            if (isMarkdown) {
                state.value = undefined;
                return;
            }
            return createDefaultView((0, Slot_3.default)().appendTo(slot));
        })
            .appendTo(actualEditor);
        const contentWidth = State_25.default.Generator(() => `${editor.document?.element.scrollWidth ?? 0}px`)
            .observe(component, state, Viewport_3.default.size);
        const scrollbarProxy = (0, Component_30.default)()
            .style('text-editor-document-scrollbar-proxy')
            .style.bind(isFullscreen, 'text-editor-document-scrollbar-proxy--fullscreen')
            .style.bind(contentWidth.map(component, () => (editor.document?.element.scrollWidth ?? 0) > (editor.document?.rect.value.width ?? 0)), 'text-editor-document-scrollbar-proxy--visible')
            .style.bindVariable('content-width', contentWidth)
            .event.subscribe('scroll', () => editor.document?.element.scrollTo({ left: scrollbarProxy.element.scrollLeft, behavior: 'instant' }))
            .appendTo(actualEditor);
        const fullscreenContentWidth = State_25.default.Generator(() => `${documentSlot.element.scrollWidth ?? 0}px`)
            .observe(component, state, Viewport_3.default.size);
        documentSlot.style.bindVariable('content-width', fullscreenContentWidth);
        state.use(editor, state => {
            saveLocal(undefined, state?.doc);
            toolbar.rect.markDirty();
        });
        const fullscreenDialog = (0, Dialog_2.default)()
            .and(Slot_3.default)
            .style.remove('slot')
            .setFullscreen()
            .setOwner(editor)
            .bind(isFullscreen)
            .appendTo(document.body);
        editor.length.use(editor, (length = 0) => {
            let invalid;
            if (length > (editor.maxLength.value ?? Infinity))
                invalid = en_nz_6.default['shared/form/invalid/too-long']();
            editor.setCustomInvalidMessage(invalid);
            editor.document?.setCustomInvalidMessage(invalid);
            hiddenInput.event.bubble('change');
        });
        //#endregion
        vars(editor, actualEditor, documentSlot, scrollbarProxy, fullscreenDialog);
        ////////////////////////////////////
        return editor;
        ////////////////////////////////////
        //#region ProseMirror Init
        function markInputRule(regexp, markType, getAttrs = null, getContent) {
            return new prosemirror_inputrules_1.InputRule(regexp, (state, match, start, end) => {
                const attrs = getAttrs instanceof Function ? getAttrs(match) : getAttrs;
                const content = getContent instanceof Function ? getContent(match) : getContent;
                const tr = state.tr;
                tr.replaceWith(start, end, typeof content === 'string' ? schema.text(content) : content);
                const mark = markType.create(attrs);
                tr.addMark(tr.mapping.map(start), tr.mapping.map(end), mark);
                tr.removeStoredMark(mark);
                return tr;
            });
        }
        function createDefaultView(slot) {
            const view = new prosemirror_view_1.EditorView(slot.element, {
                state: prosemirror_state_1.EditorState.create({
                    doc: markdownParser.parse(content.value),
                    plugins: [
                        (0, prosemirror_example_setup_1.buildInputRules)(schema),
                        (0, prosemirror_inputrules_1.inputRules)({
                            rules: [
                                markInputRule(/\*\*([^*]+?)\*\*/, schema.marks.strong, undefined, match => match[1]),
                                markInputRule(/__([^_]+?)__/, schema.marks.underline, undefined, match => match[1]),
                                markInputRule(/\/\/([^/]+?)\/\//, schema.marks.em, undefined, match => match[1]),
                                markInputRule(/`([^`]+?)`/, schema.marks.code, undefined, match => match[1]),
                                markInputRule(/\[(.+?)\]\(([^ ]+?)(?:[  ](?:\((.+?)\)|["'“”‘’](.+?)["'“”‘’]))?\)/, schema.marks.link, ([match, text, href, title1, title2]) => ({ href, title: title1 || title2 || undefined }), match => match[1]),
                            ],
                        }),
                        (0, prosemirror_keymap_1.keymap)((0, prosemirror_example_setup_1.buildKeymap)(schema, {})),
                        (0, prosemirror_keymap_1.keymap)(prosemirror_commands_1.baseKeymap),
                        (0, prosemirror_keymap_1.keymap)({
                            'Mod-s': (0, prosemirror_commands_1.toggleMark)(schema.marks.strikethrough),
                            'Mod-S': (0, prosemirror_commands_1.toggleMark)(schema.marks.strikethrough),
                            'Mod-.': (0, prosemirror_commands_1.toggleMark)(schema.marks.superscript),
                            'Mod-,': (0, prosemirror_commands_1.toggleMark)(schema.marks.subscript),
                            'Alt-Ctrl-0': (0, prosemirror_commands_1.setBlockType)(schema.nodes.paragraph),
                            ...Arrays_5.default.range(1, 7)
                                .toObject(i => [`Alt-Ctrl-${i}`, (0, prosemirror_commands_1.setBlockType)(schema.nodes.heading, { level: i })]),
                        }),
                        (0, prosemirror_dropcursor_1.dropCursor)(),
                        (0, prosemirror_gapcursor_1.gapCursor)(),
                        (0, prosemirror_history_1.history)(),
                        new prosemirror_state_1.Plugin({
                            view() {
                                return {
                                    update(view, prevState) {
                                        state.value = view.state;
                                        if (state.value === prevState)
                                            state.emit();
                                    },
                                };
                            },
                        }),
                    ],
                }),
            });
            editor.mirror = view;
            editor.document = (0, Component_30.default)()
                .and(Input_2.default)
                .replaceElement(editor.mirror.dom)
                .ariaRole('textbox')
                .classes.add('markdown')
                .style('text-editor-document')
                .style.bind(isFullscreen, 'text-editor-document--fullscreen')
                .setId(`text-editor-${id}`)
                .attributes.set('aria-multiline', 'true')
                .event.subscribe('scroll', () => scrollbarProxy.element.scrollTo({ left: editor.document?.element.scrollLeft ?? 0, behavior: 'instant' }));
            toolbar.ariaControls(editor.document);
            refresh();
            return () => {
                content.value = markdownSerializer.serialize(view.state.doc);
                editor.mirror = undefined;
                editor.document = undefined;
                refresh();
                view.destroy();
            };
        }
        //#endregion
        ////////////////////////////////////
        ////////////////////////////////////
        //#region Events/Actions
        function refresh() {
            label?.setInput(editor.document);
            editor.document?.setName(label?.for);
            editor.document?.setId(label?.for);
            label?.setId(label.for.map(component, v => `${v}-label`));
            toolbar.ariaLabelledBy(label);
            editor.document?.ariaLabelledBy(label);
            editor.document?.attributes.toggle(editor.required.value, 'aria-required', 'true');
        }
        function toggleFullscreen() {
            ViewTransition_1.default.perform('subview', viewTransitionName, () => {
                isFullscreen.value = !isFullscreen.value;
                actualEditor.appendTo(isFullscreen.value ? fullscreenDialog : editor);
                actualEditor.rect.markDirty();
            });
        }
        function clearLocal(name = editor.document?.name.value) {
            if (!name)
                return;
            Store_3.default.items.textEditorDrafts = Store_3.default.items.textEditorDrafts?.filter(draft => draft.name !== name);
        }
        function loadFromMarkdown(markdown = '') {
            // hack to fix it not redrawing when calling updateState now?
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            (editor.mirror?.docView).dirty = 2; // CONTENT_DIRTY
            editor.mirror?.updateState(prosemirror_state_1.EditorState.create({
                plugins: editor.mirror.state.plugins.slice(),
                doc: markdownParser.parse(markdown),
            }));
        }
        function loadLocal(name = editor.document?.name.value) {
            if (!name)
                return;
            const draft = Store_3.default.items.textEditorDrafts?.find(draft => draft.name === name);
            if (!draft)
                return;
            loadFromMarkdown(draft.body);
        }
        function saveLocal(name = editor.document?.name.value, doc) {
            const body = !doc ? '' : markdownSerializer.serialize(doc);
            content.value = body;
            editor.length.asMutable?.setValue(body.length);
            if (!name)
                return;
            if (body === editor.default.state.value)
                return clearLocal();
            Store_3.default.items.textEditorDrafts = [
                ...!body ? [] : [{ name, body, created: Date.now() }],
                ...(Store_3.default.items.textEditorDrafts ?? [])
                    .filter(draft => true
                    && draft.name !== name // keep old drafts that don't share names with the new draft
                    && Date.now() - draft.created < Time_5.default.days(1) // keep old drafts only if they were made in the last day
                    && true),
            ]
                // disallow more than 4 drafts due to localstorage limitations with using localStorage
                // this won't be necessary when drafts are stored in indexeddb
                .slice(0, 4);
        }
        //#endregion
        ////////////////////////////////////
        ////////////////////////////////////
        //#region State
        function isMarkActive(type, pos) {
            if (!state.value)
                return false;
            const selection = state.value.selection;
            pos ??= !selection.empty ? undefined : selection.$from;
            if (pos)
                return !!type.isInSet(state.value.storedMarks || pos.marks());
            return state.value.doc.rangeHasMark(selection.from, selection.to, type);
        }
        function isTypeActive(type, attrs, pos) {
            if (!state.value)
                return false;
            const selection = state.value.selection;
            pos ??= !selection.empty ? undefined : selection.$from;
            if (pos)
                return !!pos.closest(type, attrs);
            let found = false;
            state.value.doc.nodesBetween(selection.from, selection.to, node => {
                found ||= node.matches(type, attrs);
            });
            return found;
        }
        function getBlockType(pos) {
            if (!state.value)
                return undefined;
            const selection = state.value.selection;
            pos ??= !selection.empty ? undefined : selection.$from;
            if (pos) {
                for (const blockType of BLOCK_TYPES)
                    if (isTypeActive(schema.nodes[blockType], pos))
                        return blockType.replaceAll('_', '-');
                return 'paragraph';
            }
            const types = new Set();
            state.value.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
                if (node.type !== schema.nodes.text)
                    return;
                const $pos = state.value?.doc.resolve(pos);
                if (!$pos)
                    return;
                for (const blockType of BLOCK_TYPES)
                    if (isTypeActive(schema.nodes[blockType], $pos)) {
                        types.add(blockType.replaceAll('_', '-'));
                        return;
                    }
            });
            if (!types.size)
                return getBlockType(selection.$from);
            if (types.size > 1)
                return undefined;
            const [type] = types;
            return type;
        }
        function isAlignActive(align, pos) {
            if (!state.value)
                return false;
            align = align === 'centre' ? 'center' : align;
            const selection = state.value.selection;
            pos ??= !selection.empty ? undefined : selection.$from;
            if (pos)
                return (pos.closest(schema.nodes.text_align)?.attrs.align ?? 'left') === align;
            let found = false;
            state.value.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
                const resolved = state.value?.doc.resolve(pos);
                found ||= !resolved ? align === 'left' : isAlignActive(align, resolved);
            });
            return found;
        }
        function getAlign(pos) {
            if (!state.value)
                return undefined;
            const selection = state.value.selection;
            pos ??= !selection.empty ? undefined : selection.$from;
            if (pos) {
                const align = (pos.closest(schema.nodes.text_align)?.attrs.align ?? 'left');
                return align === 'center' ? 'centre' : align;
            }
            const aligns = new Set();
            state.value.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
                if (node.type === schema.nodes.text) {
                    const $pos = state.value?.doc.resolve(pos);
                    if ($pos)
                        aligns.add(getAlign($pos));
                }
            });
            if (!aligns.size)
                return getAlign(selection.$from);
            if (aligns.size > 1)
                return undefined;
            const [align] = aligns;
            return align;
        }
        //#endregion
        ////////////////////////////////////
    });
    exports.default = TextEditor;
});
define("ui/component/core/toast/ToastList", ["require", "exports", "ui/Component", "ui/component/core/toast/Toast", "utility/Async", "utility/Task", "utility/Time"], function (require, exports, Component_31, Toast_1, Async_3, Task_3, Time_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Component_31 = __importDefault(Component_31);
    Async_3 = __importDefault(Async_3);
    Task_3 = __importDefault(Task_3);
    Time_6 = __importDefault(Time_6);
    const ToastComponent = Component_31.default.Builder((component) => {
        const title = (0, Component_31.default)()
            .style('toast-title')
            .appendTo(component);
        return component
            .style('toast')
            .extend(toast => ({
            title,
            content: undefined,
            type: Object.assign((...types) => {
                for (const type of types)
                    toast.style(`toast-type-${type}`);
                return toast;
            }, {
                remove(...types) {
                    for (const type of types)
                        toast.style.remove(`toast-type-${type}`);
                    return toast;
                },
            }),
        }))
            .extendJIT('content', toast => (0, Component_31.default)()
            .style('toast-content')
            .appendTo(toast));
    }).setName('Toast');
    const ToastList = Component_31.default.Builder((component) => {
        const toasts = component
            .style('toast-list')
            .extend(toasts => ({
            info: add.bind(null, 'info'),
            success: add.bind(null, 'success'),
            warning: add.bind(null, 'warning'),
            handleError(response, translation = 'shared/toast/error-occurred') {
                if (response instanceof Error) {
                    toasts.warning(Toast_1.TOAST_ERROR, translation, response);
                    return true;
                }
                return false;
            },
        }));
        Object.assign(window, { toast: toasts });
        return toasts;
        function add(type, toast, ...params) {
            const component = ToastComponent()
                .type(type)
                .style('toast--measuring')
                .tweak(toast.initialise, ...params);
            void lifecycle(toast, component);
            return component;
        }
        async function lifecycle(toast, component) {
            const wrapper = (0, Component_31.default)().style('toast-wrapper').appendTo(toasts);
            component.style('toast--measuring').appendTo(wrapper);
            await Task_3.default.yield();
            const rect = component.rect.value;
            component.style.remove('toast--measuring');
            wrapper.style.setProperty('height', `${rect.height}px`);
            await Async_3.default.sleep(toast.duration);
            component.style('toast--hide');
            wrapper.style.removeProperties('height');
            await Promise.race([
                new Promise(resolve => component.event.subscribe('animationend', resolve)),
                Async_3.default.sleep(Time_6.default.seconds(1)),
            ]);
            wrapper.remove();
        }
    });
    //#endregion
    ////////////////////////////////////
    exports.default = ToastList;
});
define("ui/component/core/toast/Toast", ["require", "exports", "ui/Component"], function (require, exports, Component_32) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TOAST_ERROR = exports.TOAST_SUCCESS = void 0;
    Component_32 = __importDefault(Component_32);
    function Toast(toast) {
        return toast;
    }
    exports.default = Toast;
    exports.TOAST_SUCCESS = Toast({
        duration: 2000,
        initialise(toast, translation) {
            toast.title.text.use(translation);
        },
    });
    function isErrorResponse(error) {
        return error.headers !== undefined;
    }
    exports.TOAST_ERROR = Toast({
        duration: 5000,
        initialise(toast, translation, error) {
            console.error(error);
            toast.title.text.use(translation);
            if (!isErrorResponse(error) || !error.detail)
                toast.content.text.set(error.message);
            else
                toast.content
                    .append((0, Component_32.default)()
                    .style('toast-error-type')
                    .text.set(error.message))
                    .text.append(': ')
                    .text.append(error.detail);
        },
    });
});
define("ui/component/VanityInput", ["require", "exports", "ui/Component", "ui/component/core/ext/Input", "ui/component/core/TextInput"], function (require, exports, Component_33, Input_3, TextInput_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FilterVanity = void 0;
    Component_33 = __importDefault(Component_33);
    Input_3 = __importDefault(Input_3);
    TextInput_2 = __importStar(TextInput_2);
    const VanityInput = Component_33.default.Builder((component) => {
        const input = (0, TextInput_2.default)()
            .style('vanity-input-input')
            .filter(exports.FilterVanity)
            .appendTo(component);
        return component.and(Input_3.default)
            .style('vanity-input')
            .append((0, Component_33.default)()
            .style('vanity-input-prefix')
            .text.set('@'))
            .extend(component => ({
            // vanity input
            input,
            // input
            required: input.required,
            hint: input.hint.rehost(component),
            maxLength: input.maxLength,
            length: input.length,
            invalid: input.invalid,
            getPopover() {
                return input.getPopover();
            },
            disableDefaultHintPopoverVisibilityHandling() {
                input.disableDefaultHintPopoverVisibilityHandling();
                return component;
            },
            setMaxLength(maxLength) {
                input.setMaxLength(maxLength);
                return component;
            },
            setRequired(required) {
                input.setRequired(required);
                return component;
            },
            setLabel(label) {
                input.setLabel(label);
                return component;
            },
            tweakPopover(initialiser) {
                input.tweakPopover(initialiser);
                return component;
            },
            setCustomHintPopover(initialiser) {
                input.setCustomHintPopover(initialiser);
                return component;
            },
            pipeValidity(to) {
                input.pipeValidity(to);
                return component;
            },
            setCustomInvalidMessage(message) {
                input.setCustomInvalidMessage(message);
                return component;
            },
            refreshValidity() {
                input.refreshValidity();
                return component;
            },
            // text input
            state: input.state,
            value: undefined,
            default: input.default.rehost(component),
            placeholder: input.placeholder.rehost(component),
            ignoreInputEvent(ignore = true) {
                input.ignoreInputEvent(ignore);
                return component;
            },
            filter(filter) {
                input.filter(filter);
                return component;
            },
        }))
            .extendMagic('value', component => ({
            get() { return input.value; },
            set(value) { input.value = value; },
        }));
    });
    exports.default = VanityInput;
    exports.FilterVanity = (0, TextInput_2.FilterFunction)((before, selection, after) => {
        before = filterVanitySegment(before);
        selection = filterVanitySegment(selection);
        after = filterVanitySegment(after);
        if (!before && !after)
            selection = selection.replace(/^-|-$/g, '');
        else {
            if (before.startsWith('-'))
                before = before.slice(1);
            if (before.endsWith('-') && selection.startsWith('-'))
                selection = selection.slice(1);
            if (after.endsWith('-'))
                after = after.slice(0, -1);
            if (selection.endsWith('-') && after.startsWith('-'))
                after = after.slice(1);
        }
        return [before, selection, after];
    });
    function filterVanitySegment(segment) {
        return segment.replace(/[\W_-]+/g, '-');
    }
});
define("ui/view/account/AccountViewForm", ["require", "exports", "endpoint/author/EndpointAuthorCreate", "endpoint/author/EndpointAuthorUpdate", "lang/en-nz", "model/FormInputLengths", "model/Session", "ui/Component", "ui/component/core/Block", "ui/component/core/Form", "ui/component/core/LabelledTable", "ui/component/core/LabelledTextInputBlock", "ui/component/core/TextEditor", "ui/component/core/TextInput", "ui/component/core/toast/Toast", "ui/component/VanityInput"], function (require, exports, EndpointAuthorCreate_1, EndpointAuthorUpdate_1, en_nz_7, FormInputLengths_1, Session_5, Component_34, Block_5, Form_2, LabelledTable_1, LabelledTextInputBlock_1, TextEditor_1, TextInput_3, Toast_2, VanityInput_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    EndpointAuthorCreate_1 = __importDefault(EndpointAuthorCreate_1);
    EndpointAuthorUpdate_1 = __importDefault(EndpointAuthorUpdate_1);
    en_nz_7 = __importDefault(en_nz_7);
    FormInputLengths_1 = __importDefault(FormInputLengths_1);
    Session_5 = __importDefault(Session_5);
    Component_34 = __importDefault(Component_34);
    Block_5 = __importDefault(Block_5);
    Form_2 = __importDefault(Form_2);
    LabelledTable_1 = __importDefault(LabelledTable_1);
    LabelledTextInputBlock_1 = __importDefault(LabelledTextInputBlock_1);
    TextEditor_1 = __importDefault(TextEditor_1);
    TextInput_3 = __importDefault(TextInput_3);
    VanityInput_1 = __importStar(VanityInput_1);
    exports.default = Component_34.default.Builder((component, type) => {
        const block = component.and(Block_5.default);
        const form = block.and(Form_2.default, block.title);
        form.viewTransition('account-form');
        form.title.text.use(`view/account/${type}/title`);
        form.setName(en_nz_7.default[`view/account/${type}/title`]().toString());
        if (type === 'create')
            form.description.text.use('view/account/create/description');
        form.submit.textWrapper.text.use(`view/account/${type}/submit`);
        const table = (0, LabelledTable_1.default)().appendTo(form.content);
        const nameInput = (0, TextInput_3.default)()
            .setRequired()
            .default.bind(Session_5.default.Auth.author.map(component, author => author?.name))
            .hint.use('view/account/name/hint')
            .setMaxLength(FormInputLengths_1.default.manifest?.author.name);
        table.label(label => label.text.use('view/account/name/label'))
            .content((content, label) => content.append(nameInput.setLabel(label)));
        const vanityInput = (0, VanityInput_1.default)()
            .placeholder.bind(nameInput.state
            .map(component, name => (0, VanityInput_1.FilterVanity)(name)))
            .default.bind(Session_5.default.Auth.author.map(component, author => author?.vanity))
            .hint.use('view/account/vanity/hint')
            .setMaxLength(FormInputLengths_1.default.manifest?.author.vanity);
        table.label(label => label.text.use('view/account/vanity/label'))
            .content((content, label) => content.append(vanityInput.setLabel(label)));
        const pronounsInput = (0, TextInput_3.default)()
            .default.bind(Session_5.default.Auth.author.map(component, author => author?.pronouns))
            .hint.use('view/account/pronouns/hint')
            .setMaxLength(FormInputLengths_1.default.manifest?.author.pronouns);
        table.label(label => label.text.use('view/account/pronouns/label'))
            .content((content, label) => content.append(pronounsInput.setLabel(label)));
        const descriptionInput = (0, TextEditor_1.default)()
            .default.bind(Session_5.default.Auth.author.map(component, author => author?.description.body))
            .hint.use('view/account/description/hint')
            .setMaxLength(FormInputLengths_1.default.manifest?.author.description);
        table.label(label => label.text.use('view/account/description/label'))
            .content((content, label) => content.append(descriptionInput.setLabel(label)));
        let supportLinkInput;
        let supportMessageInput;
        (0, LabelledTextInputBlock_1.default)()
            .style('labelled-row--in-labelled-table')
            .ariaLabel.use('view/account/support-link/label')
            .label(label => label.text.use('view/account/support-link/label'))
            .input(input => supportLinkInput = input
            .default.bind(Session_5.default.Auth.author.map(component, author => author?.support_link))
            .hint.use('view/account/support-link/hint')
            .setMaxLength(FormInputLengths_1.default.manifest?.author.support_link))
            .label(label => label.text.use('view/account/support-message/label'))
            .input(input => supportMessageInput = input
            .default.bind(Session_5.default.Auth.author.map(component, author => author?.support_message))
            .hint.use('view/account/support-message/hint')
            .setMaxLength(FormInputLengths_1.default.manifest?.author.support_message))
            .appendTo(table);
        form.event.subscribe('submit', async (event) => {
            event.preventDefault();
            const response = await (type === 'create' ? EndpointAuthorCreate_1.default : EndpointAuthorUpdate_1.default).query({
                body: {
                    name: nameInput.value,
                    vanity: vanityInput.value,
                    description: descriptionInput.useMarkdown(),
                    pronouns: pronounsInput.value,
                    support_link: supportLinkInput.value,
                    support_message: supportMessageInput.value,
                },
            });
            if (toast.handleError(response, 'view/account/toast/failed-to-save'))
                return;
            toast.success(Toast_2.TOAST_SUCCESS, 'view/account/toast/saved');
            Session_5.default.setAuthor(response.data);
        });
        return form;
    });
});
define("ui/view/shared/component/ViewDefinition", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function ViewDefinition(definition) {
        const result = {
            ...definition,
            navigate: (app, params) => app.view.show(result, params),
        };
        return result;
    }
    exports.default = ViewDefinition;
});
define("ui/view/AccountView", ["require", "exports", "endpoint/author/EndpointAuthorDelete", "model/Session", "ui/component/core/ActionRow", "ui/component/core/Button", "ui/component/core/ConfirmDialog", "ui/component/core/Slot", "ui/component/OAuthServices", "ui/view/account/AccountViewForm", "ui/view/shared/component/View", "ui/view/shared/component/ViewDefinition", "ui/view/shared/ext/ViewTransition", "utility/State"], function (require, exports, EndpointAuthorDelete_1, Session_6, ActionRow_3, Button_6, ConfirmDialog_1, Slot_4, OAuthServices_2, AccountViewForm_1, View_2, ViewDefinition_1, ViewTransition_2, State_26) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    EndpointAuthorDelete_1 = __importDefault(EndpointAuthorDelete_1);
    Session_6 = __importDefault(Session_6);
    ActionRow_3 = __importDefault(ActionRow_3);
    Button_6 = __importDefault(Button_6);
    ConfirmDialog_1 = __importDefault(ConfirmDialog_1);
    Slot_4 = __importDefault(Slot_4);
    OAuthServices_2 = __importDefault(OAuthServices_2);
    AccountViewForm_1 = __importDefault(AccountViewForm_1);
    View_2 = __importDefault(View_2);
    ViewDefinition_1 = __importDefault(ViewDefinition_1);
    ViewTransition_2 = __importDefault(ViewTransition_2);
    State_26 = __importDefault(State_26);
    exports.default = (0, ViewDefinition_1.default)({
        create: async () => {
            const id = 'account';
            const view = (0, View_2.default)(id);
            const state = (0, State_26.default)(Session_6.default.Auth.state.value);
            (0, Slot_4.default)()
                .use(state, () => createForm()?.subviewTransition(id))
                .appendTo(view);
            const services = await (0, OAuthServices_2.default)(state);
            services.header.subviewTransition(id);
            services.appendTo(view);
            (0, Slot_4.default)()
                .use(state, () => createActionRow()?.subviewTransition(id))
                .appendTo(view);
            Session_6.default.Auth.state.subscribe(view, () => ViewTransition_2.default.perform('subview', id, updateAuthState));
            updateAuthState();
            return view;
            function updateAuthState(newState = Session_6.default.Auth.state.value) {
                state.value = newState;
            }
            function createForm() {
                switch (state.value) {
                    case 'has-authorisations':
                        return (0, AccountViewForm_1.default)('create');
                    case 'logged-in':
                        return (0, AccountViewForm_1.default)('update');
                }
            }
            function createActionRow() {
                switch (state.value) {
                    case 'logged-in':
                        return (0, ActionRow_3.default)()
                            .viewTransition('account-action-row')
                            .tweak(row => row.right
                            .append((0, Button_6.default)()
                            .text.use('view/account/action/logout')
                            .event.subscribe('click', () => Session_6.default.reset()))
                            .append((0, Button_6.default)()
                            .text.use('view/account/action/delete')
                            .event.subscribe('click', async () => {
                            const result = await ConfirmDialog_1.default.prompt(view, { dangerToken: 'delete-account' });
                            if (!result)
                                return;
                            const response = await EndpointAuthorDelete_1.default.query();
                            if (toast.handleError(response))
                                return;
                            return Session_6.default.reset();
                        })));
                }
            }
        },
    });
});
define("endpoint/author/EndpointAuthorGet", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_9) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_9 = __importDefault(Endpoint_9);
    exports.default = (0, Endpoint_9.default)('/author/{vanity}/get', 'get');
});
define("endpoint/work/EndpointWorkGetAllAuthor", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_10) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_10 = __importDefault(Endpoint_10);
    exports.default = (0, Endpoint_10.default)('/works/{author}', 'get');
});
define("ui/component/core/ExternalLink", ["require", "exports", "ui/Component"], function (require, exports, Component_35) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Component_35 = __importDefault(Component_35);
    const ExternalLink = Component_35.default.Builder('a', (component, href) => {
        component.style('link', 'link-external');
        if (href !== undefined)
            component.attributes.set('href', href);
        return component;
    });
    exports.default = ExternalLink;
});
define("ui/component/Author", ["require", "exports", "ui/Component", "ui/component/core/Block", "ui/component/core/ExternalLink", "ui/component/core/Slot"], function (require, exports, Component_36, Block_6, ExternalLink_1, Slot_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Component_36 = __importDefault(Component_36);
    Block_6 = __importDefault(Block_6);
    ExternalLink_1 = __importDefault(ExternalLink_1);
    Slot_5 = __importDefault(Slot_5);
    exports.default = Component_36.default.Builder((component, author) => {
        component
            .viewTransition('author')
            .style('author');
        const block = component.and(Block_6.default);
        block.title
            .style('author-name')
            .text.set(author.name);
        block.description
            .append((0, Component_36.default)()
            .style('author-vanity')
            .text.set(`@${author.vanity}`))
            .append(author.pronouns && (0, Slot_5.default)()
            .text.append(' · ')
            .append((0, Component_36.default)()
            .style('author-pronouns')
            .text.set(author.pronouns)));
        (0, Component_36.default)()
            .style('author-description')
            .append((0, Slot_5.default)().tweak(slot => {
            const body = author.description.body;
            if (body)
                slot.setMarkdownContent(body);
            else
                slot.style('placeholder').text.use('author/description/empty');
        }))
            .appendTo(block.content);
        if (author.support_link && author.support_message)
            (0, ExternalLink_1.default)(author.support_link)
                .style('author-support-link')
                .text.set(author.support_message)
                .appendTo(block.content);
        return block;
    });
});
define("ui/component/core/Link", ["require", "exports", "ui/Component", "utility/Env", "utility/State"], function (require, exports, Component_37, Env_6, State_27) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Component_37 = __importDefault(Component_37);
    Env_6 = __importDefault(Env_6);
    State_27 = __importDefault(State_27);
    const Link = Component_37.default.Builder('a', (component, route) => {
        component.style('link');
        const canNavigate = (0, State_27.default)(true);
        if (route !== undefined) {
            component.attributes.set('href', `${Env_6.default.URL_ORIGIN}${route.slice(1)}`);
            component.event.subscribe('click', event => {
                event.preventDefault();
                // const closestButtonOrLink = (event.target as Partial<HTMLElement>).component?.closest([Button, Link])
                // if (closestButtonOrLink !== component)
                // 	return
                if (!canNavigate.value)
                    return;
                event.stopImmediatePropagation();
                void navigate.toURL(route);
            });
        }
        return component.extend(component => ({
            canNavigate,
            setNavigationDisabled(disabled = true) {
                canNavigate.value = !disabled;
                return component;
            },
        }));
    });
    exports.default = Link;
});
define("ui/component/core/Paginator", ["require", "exports", "ui/Component", "ui/component/core/Block", "ui/component/core/Button", "ui/component/core/Slot", "utility/Async", "utility/State"], function (require, exports, Component_38, Block_7, Button_7, Slot_6, Async_4, State_28) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Component_38 = __importDefault(Component_38);
    Block_7 = __importDefault(Block_7);
    Button_7 = __importDefault(Button_7);
    Slot_6 = __importDefault(Slot_6);
    Async_4 = __importDefault(Async_4);
    State_28 = __importDefault(State_28);
    const Paginator = Component_38.default.Builder((component) => {
        const block = component.and(Block_7.default);
        const isFlush = block.type.state.mapManual(type => type.has('flush'));
        block.style.bind(isFlush, 'paginator--flush');
        block.header
            .style('paginator-header')
            .style.bind(isFlush, 'paginator-header--flush');
        const content = block.content
            .style('paginator-content');
        block.footer
            .style('paginator-footer', 'paginator-footer--hidden')
            .style.bind(isFlush, 'paginator-footer--flush');
        block.footer.left.style('paginator-footer-left');
        block.footer.right.style('paginator-footer-right');
        const buttonFirst = (0, Button_7.default)()
            .setIcon('angles-left')
            .style('paginator-button')
            .event.subscribe('click', () => showPage(0))
            .appendTo(block.footer.left);
        const buttonPrev = (0, Button_7.default)()
            .setIcon('angle-left')
            .style('paginator-button')
            .event.subscribe('click', () => showPage(Math.max(cursor.value - 1, 0)))
            .appendTo(block.footer.left);
        const buttonNext = (0, Button_7.default)()
            .setIcon('angle-right')
            .style('paginator-button')
            .event.subscribe('click', () => showPage(Math.min(cursor.value + 1, using?.pageCount === true ? Infinity : pages.length - 1)))
            .appendTo(block.footer.right);
        const buttonLast = (0, Button_7.default)()
            .setIcon('angles-right')
            .style('paginator-button')
            .event.subscribe('click', () => showPage(pages.length - 1))
            .appendTo(block.footer.right);
        let pageContent = [];
        let pages = [];
        const cursor = (0, State_28.default)(0);
        const data = cursor.mapManual(page => pageContent[page]);
        let showingPage = -1;
        let orElseContentInitialiser;
        let isEmpty = true;
        let using;
        const paginator = block
            .viewTransition('paginator')
            .style('paginator')
            .extend(component => ({
            page: cursor,
            data,
            useInitial(initialData, page, pageCount) {
                resetPages();
                pageContent[page] = initialData;
                cursor.value = page;
                data.refresh();
                using = { endpoint: undefined, initialiser: undefined, pageCount };
                return component;
            },
            thenUse(endpoint) {
                using.endpoint = endpoint;
                return component;
            },
            async withContent(contentInitialiser) {
                clearContent();
                using.initialiser = contentInitialiser;
                await setup(pageContent[cursor.value], cursor.value, using.pageCount);
                return component;
            },
            async useEndpoint(endpoint, initialiser) {
                clearContent();
                resetPages();
                const mainPage = MainPage();
                let response;
                while (true) {
                    const result = await endpoint.query();
                    if (toast.handleError(result)) {
                        mainPage.removeContents();
                        await new Promise(resolve => mainPage.append(RetryDialog(resolve)));
                        continue;
                    }
                    response = result;
                    break;
                }
                using = { endpoint: endpoint, initialiser: initialiser, pageCount: response.page_count };
                await setup(response.data, 0, response.page_count);
                return component;
            },
            orElse(contentInitialiser) {
                orElseContentInitialiser = contentInitialiser;
                if (isEmpty) {
                    clearContent();
                    resetPages();
                    const mainPage = MainPage()
                        .style.remove('paginator-page--hidden');
                    content.style('paginator-content--or-else');
                    contentInitialiser(mainPage);
                }
                return component;
            },
        }));
        return paginator;
        function clearContent() {
            content.removeContents();
            block.footer.style('paginator-footer--hidden');
        }
        function resetPages() {
            pageContent = [];
            pages = [];
            cursor.value = 0;
        }
        async function setup(initialData, page, pageCount) {
            if (pageCount === true || pageCount > 1)
                block.footer.style.remove('paginator-footer--hidden');
            if (pageCount !== true)
                while (pages.length < pageCount)
                    pages.push(Page());
            else if (!pages.length)
                MainPage(); // already gets pushed
            const pageComponent = pages[page]
                .style('paginator-page--initial-load')
                .style.remove('paginator-page--hidden');
            pageContent[page] = initialData;
            cursor.value = page;
            data.refresh();
            if (initialData && (!Array.isArray(initialData) || initialData.length)) {
                await using.initialiser(pageComponent, initialData, paginator);
                isEmpty = false;
            }
            else {
                content.style('paginator-content--or-else');
                orElseContentInitialiser?.(pageComponent);
            }
            updateButtons(page);
        }
        function MainPage() {
            const mainPage = Page()
                .style('paginator-page--initial-load');
            pages.push(mainPage);
            return mainPage;
        }
        function Page() {
            return (0, Slot_6.default)()
                .style('paginator-page', 'paginator-page--hidden')
                .style.bind(isFlush, 'paginator-page--flush')
                .appendTo(content);
        }
        function RetryDialog(retry) {
            return (0, Component_38.default)()
                .style('paginator-error')
                .append((0, Component_38.default)()
                .style('paginator-error-text')
                .text.use('component/paginator/error'))
                .append((0, Button_7.default)()
                .type('primary')
                .style('paginator-error-retry-button')
                .text.use('component/paginator/error/retry')
                .event.subscribe('click', () => retry()));
        }
        function updateButtons(page = cursor.value, pageCount = using?.pageCount ?? 0) {
            buttonFirst.style.toggle(page <= 0, 'paginator-button--disabled');
            buttonPrev.style.toggle(page <= 0, 'paginator-button--disabled');
            buttonNext.style.toggle(pageCount !== true && page >= pageCount - 1, 'paginator-button--disabled');
            buttonLast.style.toggle(pageCount !== true && page >= pageCount - 1, 'paginator-button--disabled');
            buttonLast.style.toggle(pageCount === true, 'paginator-button--hidden');
        }
        async function showPage(number) {
            if (cursor.value === number || !using)
                return;
            const oldNumber = cursor.value;
            const direction = Math.sign(number - oldNumber);
            pages[oldNumber]
                .style.remove('paginator-page--initial-load', 'paginator-page--bounce')
                .style('paginator-page--hidden')
                .style.setVariable('page-direction', direction);
            let page = pages[number];
            if (!page)
                pages.push(page ??= Page());
            page.style.setVariable('page-direction', direction);
            updateButtons(number);
            if (pageContent[number]) {
                cursor.value = number;
                page.style.remove('paginator-page--hidden');
                scrollIntoView(direction);
                return;
            }
            let response;
            while (true) {
                page.removeContents();
                showingPage = number;
                const result = await using?.endpoint.query(undefined, { page: number });
                if (showingPage !== number)
                    return;
                const isError = toast.handleError(result);
                if (!isError && !hasResults(result.data)) {
                    cursor.value = number;
                    pages[oldNumber].style('paginator-page--bounce');
                    await Async_4.default.sleep(200);
                    return showPage(oldNumber);
                }
                page.style.remove('paginator-page--hidden');
                if (isError) {
                    await new Promise(resolve => {
                        RetryDialog(resolve).appendTo(page);
                        block.header.element.scrollIntoView();
                    });
                    if (showingPage !== number)
                        return;
                    continue;
                }
                response = result;
                break;
            }
            pageContent[number] = response.data;
            cursor.value = number;
            await using?.initialiser(page, response.data, paginator);
            scrollIntoView(direction);
        }
        function scrollIntoView(direction) {
            const scrollTarget = direction > 0 ? block.element : pages[cursor.value].element.lastElementChild;
            scrollTarget?.scrollIntoView();
        }
    });
    function hasResults(result) {
        if (result === null || result === undefined)
            return false;
        if (typeof result !== 'object')
            return true;
        if (Array.isArray(result))
            return result.length > 0;
        for (const sub of Object.values(result))
            if (hasResults(sub))
                return true;
        return false;
    }
    exports.default = Paginator;
});
define("endpoint/tag/EndpointTagManifest", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_11) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_11 = __importDefault(Endpoint_11);
    exports.default = (0, Endpoint_11.default)('/manifest/tags', 'get');
});
define("model/Tags", ["require", "exports", "endpoint/tag/EndpointTagManifest", "model/Manifest"], function (require, exports, EndpointTagManifest_1, Manifest_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.resolve = resolve;
    EndpointTagManifest_1 = __importDefault(EndpointTagManifest_1);
    Manifest_2 = __importDefault(Manifest_2);
    const Tags = Object.assign((0, Manifest_2.default)({
        async get() {
            const response = await EndpointTagManifest_1.default.query();
            if (!response.data)
                return response;
            const rawManifest = response.data;
            for (const rawCategory of Object.values(rawManifest.categories)) {
                const category = rawCategory;
                category.nameLowercase = category.name.toLowerCase();
                category.wordsLowercase = category.nameLowercase.split(' ');
            }
            for (const rawTag of Object.values(rawManifest.tags)) {
                const tag = rawTag;
                tag.nameLowercase = tag.name.toLowerCase();
                tag.wordsLowercase = tag.nameLowercase.split(' ');
                tag.categoryLowercase = tag.category.toLowerCase();
                tag.categoryWordsLowercase = tag.categoryLowercase.split(' ');
            }
            return response;
        },
    }), { resolve });
    exports.default = Tags;
    async function resolve(tags, name) {
        if (!tags?.length)
            return [];
        if (Array.isArray(tags))
            return resolveInternal(tags);
        const tag = name ? `${tags}: ${name}` : tags;
        const [result] = await resolveInternal([tag]);
        return result;
    }
    async function resolveInternal(tags) {
        const result = [];
        let manifest = await Tags.getManifest();
        resolveTags();
        if (result.length !== tags.length && !Tags.isFresh()) {
            manifest = await Tags.getManifest(true);
            resolveTags();
        }
        return result;
        function resolveTags() {
            result.splice(0, Infinity);
            for (const tagString of tags) {
                const tag = manifest.tags[tagString];
                if (!tag)
                    continue;
                result.push(tag);
            }
        }
    }
});
define("ui/component/core/TextLabel", ["require", "exports", "ui/Component"], function (require, exports, Component_39) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Component_39 = __importDefault(Component_39);
    const TextLabel = Component_39.default.Builder((component) => {
        component.style("text-label");
        const label = (0, Component_39.default)()
            .style("text-label-label");
        const punctuation = (0, Component_39.default)()
            .style("text-label-punctuation")
            .text.set(": ");
        const content = (0, Component_39.default)()
            .style("text-label-content");
        return component
            .append(label, punctuation, content)
            .extend(() => ({
            label, content,
        }));
    });
    exports.default = TextLabel;
});
define("ui/component/core/Timestamp", ["require", "exports", "ui/Component", "utility/State", "utility/Time"], function (require, exports, Component_40, State_29, Time_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Component_40 = __importDefault(Component_40);
    State_29 = __importDefault(State_29);
    Time_7 = __importDefault(Time_7);
    const Timestamp = Component_40.default.Builder((component, time) => {
        let translation;
        const state = (0, State_29.default)(new Date(time ?? Date.now()));
        state.use(component, update);
        return component
            .style('timestamp')
            .extend(component => ({
            time: state,
            setTranslation(newTranslation) {
                translation = newTranslation;
                return component;
            },
        }))
            .onRooted(component => {
            update();
            const interval = setInterval(update, Time_7.default.seconds(1));
            component.removed.awaitManual(true, () => clearInterval(interval));
        });
        function update() {
            const timeString = Time_7.default.relative(state.value.getTime(), { components: 2, secondsExclusive: true });
            component.text.set(translation?.(timeString) ?? timeString);
        }
    });
    exports.default = Timestamp;
});
define("ui/component/core/ext/Draggable", ["require", "exports", "ui/Component", "utility/maths/Vector2", "utility/State"], function (require, exports, Component_41, Vector2_1, State_30) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Component_41 = __importDefault(Component_41);
    Vector2_1 = __importDefault(Vector2_1);
    State_30 = __importDefault(State_30);
    var DragState;
    (function (DragState) {
        DragState[DragState["None"] = 0] = "None";
        DragState[DragState["Starting"] = 1] = "Starting";
        DragState[DragState["Delayed"] = 2] = "Delayed";
        DragState[DragState["Dragging"] = 3] = "Dragging";
    })(DragState || (DragState = {}));
    const isDraggingAnyDraggable = (0, State_30.default)(false);
    const Draggable = Object.assign(Component_41.default.Extension((component, definition = {}) => {
        component.style('draggable');
        const state = (0, State_30.default)(DragState.None);
        const overrideStickyDistance = (0, State_30.default)(undefined);
        const overrideDelay = (0, State_30.default)(undefined);
        const stickyDistance = State_30.default.MapManual([overrideStickyDistance, definition.stickyDistance], (override, base) => override ?? base ?? 0);
        const delay = State_30.default.MapManual([overrideDelay, definition.delay], (override, base) => override ?? base ?? 0);
        let mouseStartPosition;
        // let startTime: number | undefined
        let delayTimeout;
        component.onRemoveManual(stopDragging);
        component.event.subscribe(['mousedown', 'touchstart'], dragStart);
        const draggable = component.extend(component => ({
            state,
            dragging: state.mapManual(value => value === DragState.Dragging),
            setStickyDistance(value) {
                overrideStickyDistance.value = value;
                return component;
            },
            setDelay(value) {
                overrideDelay.value = value;
                return component;
            },
            stopDragging,
        }));
        return draggable;
        function dragStart(event) {
            const position = getMousePosition(event);
            if (!position)
                return;
            event.preventDefault();
            isDraggingAnyDraggable.value = true;
            mouseStartPosition = position;
            state.value = DragState.Starting;
            // startTime = Date.now()
            if (event.type === 'touchstart') {
                window.addEventListener('touchmove', dragMove, { passive: true });
                window.addEventListener('touchend', dragEnd, { passive: true });
            }
            else {
                window.addEventListener('mousemove', dragMove, { passive: true });
                window.addEventListener('mouseup', dragEnd, { passive: true });
            }
            if (delay) {
                state.value = DragState.Delayed;
                delayTimeout = window.setTimeout(() => {
                    if (state.value === DragState.Delayed) {
                        const result = definition.onMoveStart?.(draggable, position);
                        if (result === false) {
                            dragEnd();
                            return;
                        }
                        state.value = DragState.Dragging;
                        draggable.style('draggable-dragging');
                        dragMove(event);
                    }
                }, delay.value);
            }
        }
        function dragMove(event) {
            if (state.value === DragState.Delayed)
                return;
            const position = getMousePosition(event);
            if (!position)
                return;
            const offset = Vector2_1.default.subtract(position, mouseStartPosition);
            const stickyDistanceValue = stickyDistance.value;
            if (state.value === DragState.Starting && (stickyDistanceValue < 5 || !Vector2_1.default.distanceWithin(stickyDistanceValue, offset, Vector2_1.default.ZERO))) {
                const result = definition.onMoveStart?.(draggable, position);
                if (result === false) {
                    dragEnd();
                    return;
                }
                state.value = DragState.Dragging;
                draggable.style('draggable-dragging');
            }
            if (state.value !== DragState.Dragging)
                return;
            const result = definition.onMove?.(draggable, offset, position);
            if (result === false) {
                dragEnd();
                return;
            }
            return offset;
        }
        function dragEnd(event) {
            removeListeners();
            if (state.value === DragState.Dragging && event) {
                const position = getMousePosition(event);
                const offset = position ? dragMove(event) : undefined;
                definition.onMoveEnd?.(draggable, offset ?? Vector2_1.default.ZERO, position ?? mouseStartPosition);
            }
            stopDragging();
        }
        function removeListeners() {
            window.clearTimeout(delayTimeout);
            window.removeEventListener('touchmove', dragMove);
            window.removeEventListener('mousemove', dragMove);
            window.removeEventListener('touchend', dragEnd);
            window.removeEventListener('mouseup', dragEnd);
        }
        function stopDragging() {
            removeListeners();
            isDraggingAnyDraggable.value = false;
            state.value = DragState.None;
            mouseStartPosition = undefined;
            // startTime = undefined
            draggable.style.remove('draggable-dragging');
            return draggable;
        }
        function getMousePosition(event) {
            const touch = event.touches?.[0];
            if (event.button !== 0 && !touch) {
                return undefined;
            }
            return Vector2_1.default.fromClient(touch ?? event);
        }
    }), {
        isDragging: isDraggingAnyDraggable,
    });
    exports.default = Draggable;
});
define("ui/component/Tag", ["require", "exports", "ui/Component", "ui/component/core/Button", "ui/component/core/ext/Draggable", "ui/component/core/Link"], function (require, exports, Component_42, Button_8, Draggable_1, Link_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Component_42 = __importDefault(Component_42);
    Button_8 = __importDefault(Button_8);
    Draggable_1 = __importDefault(Draggable_1);
    Link_1 = __importDefault(Link_1);
    const toURLRegex = /\W+/g;
    const toURL = (name) => name.replaceAll(toURLRegex, '-').toLowerCase();
    const Tag = Object.assign(Component_42.default.Builder('a', (component, tag) => {
        if (component.tagName === 'A')
            component.and(Link_1.default, typeof tag === 'string' ? `/tag/${tag}` : `/tag/${toURL(tag.category)}/${toURL(tag.name)}`);
        component
            .and(Button_8.default)
            .style('tag')
            .style.toggle(typeof tag === 'string', 'tag-custom')
            .style.toggle(typeof tag !== 'string', 'tag-global');
        if (typeof tag !== 'string')
            (0, Component_42.default)()
                .style('tag-category')
                .text.set(tag.category)
                .appendTo(component);
        (0, Component_42.default)()
            .style('tag-name')
            .text.set(typeof tag === 'string' ? tag : tag.name)
            .appendTo(component);
        const unuseSupers = component.supers.useManual(() => {
            if (!component.is(Draggable_1.default))
                return;
            unuseSupers();
            component.style.bind(component.dragging, 'tag--dragging');
        });
        return component.extend(component => ({
            tag,
            addDeleteButton(handler) {
                (0, Button_8.default)()
                    .style('tag-delete-button')
                    .event.subscribe('click', handler)
                    .appendTo(component);
                return component;
            },
        }));
    }), {
        Category: Component_42.default
            .Builder('button', (component, category) => component.and(Tag, { category: category.name, name: '...', description: { body: category.description } }))
            .setName('TagCategory'),
    });
    exports.default = Tag;
});
define("ui/component/Work", ["require", "exports", "model/FormInputLengths", "model/Session", "model/Tags", "ui/Component", "ui/component/core/Block", "ui/component/core/Button", "ui/component/core/Link", "ui/component/core/Slot", "ui/component/core/TextLabel", "ui/component/core/Timestamp", "ui/component/Tag", "utility/AbortPromise"], function (require, exports, FormInputLengths_2, Session_7, Tags_1, Component_43, Block_8, Button_9, Link_2, Slot_7, TextLabel_1, Timestamp_1, Tag_1, AbortPromise_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    FormInputLengths_2 = __importDefault(FormInputLengths_2);
    Session_7 = __importDefault(Session_7);
    Tags_1 = __importDefault(Tags_1);
    Component_43 = __importDefault(Component_43);
    Block_8 = __importDefault(Block_8);
    Button_9 = __importDefault(Button_9);
    Link_2 = __importDefault(Link_2);
    Slot_7 = __importDefault(Slot_7);
    TextLabel_1 = __importDefault(TextLabel_1);
    Timestamp_1 = __importDefault(Timestamp_1);
    Tag_1 = __importDefault(Tag_1);
    AbortPromise_2 = __importDefault(AbortPromise_2);
    const Work = Component_43.default.Builder((component, work, author, notFullOverride) => {
        author = author ?? work.synopsis?.mentions[0];
        component
            .viewTransition('work')
            .style('work')
            .style.toggle(component.is(Link_2.default), 'work--link');
        const block = component.and(Block_8.default);
        const isFlush = block.type.state.mapManual(types => types.has('flush'));
        block.header.style('work-header');
        block.title
            .style('work-name')
            .text.set(work.name)
            .setResizeRange(32, FormInputLengths_2.default.manifest?.work.name);
        if (author)
            block.description
                .style('work-author-list')
                .style.bind(isFlush, 'work-author-list--flush')
                .append((0, Link_2.default)(`/author/${author.vanity}`)
                .style('work-author')
                .text.set(author.name));
        block.content.style('work-content');
        (0, Slot_7.default)()
            .use(isFlush, (slot, isFlush) => {
            isFlush ||= notFullOverride ?? false;
            const shouldShowDescription = isFlush || (work.synopsis?.body && work.description);
            if (shouldShowDescription)
                (0, Component_43.default)()
                    .style('work-description')
                    .style.toggle(!work.description, 'placeholder')
                    .tweak(component => {
                    if (work.description)
                        component.text.set(work.description);
                    else
                        component.text.use('work/description/empty');
                })
                    .appendTo(slot);
            if (!isFlush)
                (0, Component_43.default)()
                    .style('work-synopsis')
                    .style.toggle(!work.synopsis?.body && !work.description, 'placeholder')
                    .append((0, Slot_7.default)().tweak(slot => {
                    const synopsis = work.synopsis ?? work.description;
                    if (typeof synopsis === 'string')
                        slot.text.set(synopsis);
                    else if (!synopsis.body)
                        slot.text.use('work/description/empty');
                    else
                        slot.setMarkdownContent(synopsis.body);
                }))
                    .appendTo(slot);
        })
            .appendTo(block.content);
        (0, Slot_7.default)()
            .use(work.global_tags, AbortPromise_2.default.asyncFunction(async (signal, slot, tagStrings) => {
            const tags = await Tags_1.default.resolve(tagStrings);
            return tags?.length && (0, Component_43.default)()
                .style('work-tags', 'work-tags-global')
                .style.bind(isFlush, 'work-tags--flush')
                .append(...tags.map(tag => (0, Tag_1.default)(tag)));
        }))
            .appendTo(block.content);
        (0, Slot_7.default)()
            .use(work.custom_tags, (slot, customTags) => customTags?.length && (0, Component_43.default)()
            .style('work-tags', 'work-tags-custom')
            .style.bind(isFlush, 'work-tags--flush')
            .append(...customTags.map(tag => (0, Tag_1.default)(tag))))
            .appendTo(block.content);
        (0, TextLabel_1.default)()
            .tweak(textLabel => textLabel.label.text.use('work/chapters/label'))
            .tweak(textLabel => textLabel.content.text.set(`${work.chapter_count_public}`))
            .appendTo(block.footer.left);
        if (work.time_last_update)
            block.footer.right.append((0, Timestamp_1.default)(work.time_last_update).style('work-timestamp'));
        block.setActionsMenu((popover, button) => {
            (0, Button_9.default)()
                .type('flush')
                .text.use('view/author/works/action/label/view')
                .event.subscribe('click', () => navigate.toURL(`/work/${author?.vanity}/${work.vanity}`))
                .appendTo(popover);
            if (author && author.vanity === Session_7.default.Auth.author.value?.vanity) {
                (0, Button_9.default)()
                    .type('flush')
                    .text.use('view/author/works/action/label/edit')
                    .event.subscribe('click', () => navigate.toURL(`/work/${author.vanity}/${work.vanity}/edit`))
                    .appendTo(popover);
                (0, Button_9.default)()
                    .type('flush')
                    .text.use('view/author/works/action/label/delete')
                    .event.subscribe('click', () => { })
                    .appendTo(popover);
            }
            else if (Session_7.default.Auth.loggedIn.value) {
                (0, Button_9.default)()
                    .type('flush')
                    .text.use('view/author/works/action/label/follow')
                    .event.subscribe('click', () => { })
                    .appendTo(popover);
                (0, Button_9.default)()
                    .type('flush')
                    .text.use('view/author/works/action/label/ignore')
                    .event.subscribe('click', () => { })
                    .appendTo(popover);
            }
        });
        return block.extend(component => ({ work }));
    });
    exports.default = Work;
});
define("ui/view/AuthorView", ["require", "exports", "endpoint/author/EndpointAuthorGet", "endpoint/work/EndpointWorkGetAllAuthor", "model/Session", "ui/Component", "ui/component/Author", "ui/component/core/Button", "ui/component/core/Link", "ui/component/core/Paginator", "ui/component/core/Slot", "ui/component/Work", "ui/view/shared/component/View", "ui/view/shared/component/ViewDefinition"], function (require, exports, EndpointAuthorGet_1, EndpointWorkGetAllAuthor_1, Session_8, Component_44, Author_1, Button_10, Link_3, Paginator_1, Slot_8, Work_1, View_3, ViewDefinition_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    EndpointAuthorGet_1 = __importDefault(EndpointAuthorGet_1);
    EndpointWorkGetAllAuthor_1 = __importDefault(EndpointWorkGetAllAuthor_1);
    Session_8 = __importDefault(Session_8);
    Component_44 = __importDefault(Component_44);
    Author_1 = __importDefault(Author_1);
    Button_10 = __importDefault(Button_10);
    Link_3 = __importDefault(Link_3);
    Paginator_1 = __importDefault(Paginator_1);
    Slot_8 = __importDefault(Slot_8);
    Work_1 = __importDefault(Work_1);
    View_3 = __importDefault(View_3);
    ViewDefinition_2 = __importDefault(ViewDefinition_2);
    exports.default = (0, ViewDefinition_2.default)({
        create: async (params) => {
            const view = (0, View_3.default)('author');
            const author = await EndpointAuthorGet_1.default.query({ params });
            if (author instanceof Error)
                throw author;
            (0, Author_1.default)(author.data)
                .viewTransition('author-view-author')
                .setContainsHeading()
                .appendTo(view);
            const paginator = (0, Paginator_1.default)()
                .viewTransition('author-view-works')
                .tweak(p => p.title.text.use('view/author/works/title'))
                .tweak(p => p.primaryActions.append((0, Slot_8.default)()
                .if(Session_8.default.Auth.loggedIn, () => (0, Button_10.default)()
                .setIcon('plus')
                .ariaLabel.use('view/author/works/action/label/new')
                .event.subscribe('click', () => navigate.toURL('/work/new')))))
                .appendTo(view);
            const worksQuery = EndpointWorkGetAllAuthor_1.default.prep({
                params: {
                    author: params.vanity,
                },
            });
            await paginator.useEndpoint(worksQuery, (slot, works) => slot.append(...works.map(workData => (0, Link_3.default)(`/work/${author.data.vanity}/${workData.vanity}`)
                .and(Work_1.default, workData, author.data)
                .viewTransition()
                .type('flush')
                .appendTo(slot))));
            paginator.orElse(slot => (0, Component_44.default)()
                .style('placeholder')
                .text.use('view/author/works/content/empty')
                .appendTo(slot));
            return view;
        },
    });
});
define("endpoint/chapter/EndpointChapterDelete", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_12) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_12 = __importDefault(Endpoint_12);
    exports.default = (0, Endpoint_12.default)('/work/{author}/{vanity}/chapter/{url}/delete', 'post');
});
define("endpoint/work/EndpointWorkGet", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_13) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_13 = __importDefault(Endpoint_13);
    exports.default = (0, Endpoint_13.default)('/work/{author}/{vanity}/get', 'get');
});
define("endpoint/chapter/EndpointChapterGet", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_14) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_14 = __importDefault(Endpoint_14);
    exports.default = (0, Endpoint_14.default)('/work/{author}/{vanity}/chapter/{url}/get', 'get');
});
define("endpoint/chapter/EndpointChapterCreate", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_15) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_15 = __importDefault(Endpoint_15);
    exports.default = (0, Endpoint_15.default)('/work/{author}/{vanity}/chapter/create', 'post');
});
define("endpoint/chapter/EndpointChapterUpdate", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_16) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_16 = __importDefault(Endpoint_16);
    exports.default = (0, Endpoint_16.default)('/work/{author}/{vanity}/chapter/{url}/update', 'post');
});
define("ui/view/chapter/ChapterEditForm", ["require", "exports", "endpoint/chapter/EndpointChapterCreate", "endpoint/chapter/EndpointChapterUpdate", "lang/en-nz", "model/FormInputLengths", "model/Session", "ui/Component", "ui/component/core/Block", "ui/component/core/Form", "ui/component/core/LabelledTable", "ui/component/core/TextEditor", "ui/component/core/TextInput", "ui/component/core/toast/Toast"], function (require, exports, EndpointChapterCreate_1, EndpointChapterUpdate_1, en_nz_8, FormInputLengths_3, Session_9, Component_45, Block_9, Form_3, LabelledTable_2, TextEditor_2, TextInput_4, Toast_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    EndpointChapterCreate_1 = __importDefault(EndpointChapterCreate_1);
    EndpointChapterUpdate_1 = __importDefault(EndpointChapterUpdate_1);
    en_nz_8 = __importDefault(en_nz_8);
    FormInputLengths_3 = __importDefault(FormInputLengths_3);
    Session_9 = __importDefault(Session_9);
    Component_45 = __importDefault(Component_45);
    Block_9 = __importDefault(Block_9);
    Form_3 = __importDefault(Form_3);
    LabelledTable_2 = __importDefault(LabelledTable_2);
    TextEditor_2 = __importDefault(TextEditor_2);
    TextInput_4 = __importDefault(TextInput_4);
    exports.default = Component_45.default.Builder((component, state, workParams) => {
        const block = component.and(Block_9.default);
        const form = block.and(Form_3.default, block.title);
        form.viewTransition('chapter-edit-form');
        const type = state.value ? 'update' : 'create';
        form.title.text.use(`view/chapter-edit/${type}/title`);
        form.setName(en_nz_8.default[`view/chapter-edit/${type}/title`]().toString());
        // if (params.type === "create")
        // 	form.description.text.use("view/work-edit/create/description")
        form.submit.textWrapper.text.use(`view/chapter-edit/${type}/submit`);
        const table = (0, LabelledTable_2.default)().appendTo(form.content);
        const nameInput = (0, TextInput_4.default)()
            .setRequired()
            .default.bind(state.map(component, work => work?.name))
            .hint.use('view/chapter-edit/shared/form/name/hint')
            .setMaxLength(FormInputLengths_3.default.manifest?.chapter.name);
        table.label(label => label.text.use('view/chapter-edit/shared/form/name/label'))
            .content((content, label) => content.append(nameInput.setLabel(label)));
        const bodyInput = (0, TextEditor_2.default)()
            .default.bind(state.map(component, chapter => chapter?.body ?? undefined))
            .hint.use('view/chapter-edit/shared/form/body/hint');
        table.label(label => label.text.use('view/chapter-edit/shared/form/body/label'))
            .content((content, label) => content.append(bodyInput.setLabel(label)));
        form.event.subscribe('submit', async (event) => {
            event.preventDefault();
            const response = await (() => {
                switch (type) {
                    case 'create':
                        return EndpointChapterCreate_1.default.query({
                            params: workParams,
                            body: {
                                name: nameInput.value,
                                body: bodyInput.useMarkdown(),
                                visibility: 'Private',
                            },
                        });
                    case 'update': {
                        if (!state.value)
                            return;
                        const authorVanity = Session_9.default.Auth.author.value?.vanity;
                        if (!authorVanity)
                            return new Error('Cannot update a work when not signed in');
                        return EndpointChapterUpdate_1.default.query({
                            params: {
                                ...workParams,
                                url: state.value.url,
                            },
                            body: {
                                name: nameInput.value,
                                body: bodyInput.useMarkdown(),
                                visibility: 'Private',
                            },
                        });
                    }
                }
            })();
            if (toast.handleError(response, 'view/chapter-edit/shared/toast/failed-to-save'))
                return;
            toast.success(Toast_3.TOAST_SUCCESS, 'view/chapter-edit/shared/toast/saved');
            state.value = response?.data;
        });
        return form;
    });
});
define("ui/view/ChapterEditView", ["require", "exports", "endpoint/chapter/EndpointChapterDelete", "endpoint/chapter/EndpointChapterGet", "ui/component/core/ActionRow", "ui/component/core/Button", "ui/component/core/Slot", "ui/view/chapter/ChapterEditForm", "ui/view/shared/component/View", "ui/view/shared/component/ViewDefinition", "ui/view/shared/ext/ViewTransition", "utility/State"], function (require, exports, EndpointChapterDelete_1, EndpointChapterGet_1, ActionRow_4, Button_11, Slot_9, ChapterEditForm_1, View_4, ViewDefinition_3, ViewTransition_3, State_31) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    EndpointChapterDelete_1 = __importDefault(EndpointChapterDelete_1);
    EndpointChapterGet_1 = __importDefault(EndpointChapterGet_1);
    ActionRow_4 = __importDefault(ActionRow_4);
    Button_11 = __importDefault(Button_11);
    Slot_9 = __importDefault(Slot_9);
    ChapterEditForm_1 = __importDefault(ChapterEditForm_1);
    View_4 = __importDefault(View_4);
    ViewDefinition_3 = __importDefault(ViewDefinition_3);
    ViewTransition_3 = __importDefault(ViewTransition_3);
    State_31 = __importDefault(State_31);
    exports.default = (0, ViewDefinition_3.default)({
        requiresLogin: true,
        create: async (params) => {
            const id = 'chapter-edit';
            const view = (0, View_4.default)(id);
            const chapter = !params.url ? undefined : await EndpointChapterGet_1.default.query({ params: params });
            if (chapter instanceof Error)
                throw chapter;
            const state = (0, State_31.default)(chapter?.data);
            const stateInternal = (0, State_31.default)(chapter?.data);
            (0, Slot_9.default)()
                .use(state, () => (0, ChapterEditForm_1.default)(stateInternal, params).subviewTransition(id))
                .appendTo(view);
            (0, Slot_9.default)()
                .use(state, () => createActionRow()?.subviewTransition(id))
                .appendTo(view);
            stateInternal.subscribe(view, chapter => ViewTransition_3.default.perform('subview', id, () => state.value = chapter));
            return view;
            function createActionRow() {
                if (!stateInternal.value)
                    return;
                return (0, ActionRow_4.default)()
                    .viewTransition('chapter-edit-action-row')
                    .tweak(row => row.right
                    .append((0, Button_11.default)()
                    .text.use('view/chapter-edit/update/action/delete')
                    .event.subscribe('click', async () => {
                    if (!params.url)
                        return;
                    const response = await EndpointChapterDelete_1.default.query({ params: { ...params, url: params.url } });
                    if (toast.handleError(response))
                        return;
                    await navigate.toURL(`/work/${params.author}/${params.vanity}`);
                })));
            }
        },
    });
});
define("endpoint/chapter/EndpointChapterGetPaged", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_17) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_17 = __importDefault(Endpoint_17);
    exports.default = (0, Endpoint_17.default)('/work/{author}/{vanity}/chapters/paged', 'get');
});
define("endpoint/reaction/EndpointReactChapter", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_18) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_18 = __importDefault(Endpoint_18);
    exports.default = (0, Endpoint_18.default)('/work/{author}/{vanity}/chapter/{url}/react/{type}', 'post');
});
define("endpoint/reaction/EndpointUnreactChapter", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_19) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_19 = __importDefault(Endpoint_19);
    exports.default = (0, Endpoint_19.default)('/work/{author}/{vanity}/chapter/{url}/unreact', 'post');
});
define("endpoint/comment/EndpointCommentGetAllUnder", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_20) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_20 = __importDefault(Endpoint_20);
    exports.default = (0, Endpoint_20.default)('/comments/{under}', 'get');
});
define("endpoint/comment/EndpointCommentAdd", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_21) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_21 = __importDefault(Endpoint_21);
    exports.default = (0, Endpoint_21.default)('/comment/add/{under}', 'post');
});
define("endpoint/comment/EndpointCommentDelete", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_22) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_22 = __importDefault(Endpoint_22);
    exports.default = (0, Endpoint_22.default)('/comment/{id}/delete', 'post');
});
define("endpoint/comment/EndpointCommentUpdate", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_23) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_23 = __importDefault(Endpoint_23);
    exports.default = (0, Endpoint_23.default)('/comment/{id}/update', 'post');
});
define("endpoint/reaction/EndpointReactComment", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_24) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_24 = __importDefault(Endpoint_24);
    exports.default = (0, Endpoint_24.default)('/comment/{comment_id}/react/{type}', 'post');
});
define("endpoint/reaction/EndpointUnreactComment", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_25) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_25 = __importDefault(Endpoint_25);
    exports.default = (0, Endpoint_25.default)('/comment/{comment_id}/unreact', 'post');
});
define("ui/component/Reaction", ["require", "exports", "ui/Component", "ui/component/core/Button", "utility/State"], function (require, exports, Component_46, Button_12, State_32) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Component_46 = __importDefault(Component_46);
    Button_12 = __importDefault(Button_12);
    State_32 = __importDefault(State_32);
    const REACTION_MAP = {
        love: 'heart',
    };
    const Reaction = Component_46.default.Builder((component, type, reactionsIn = (0, State_32.default)(0), reactedIn = (0, State_32.default)(false)) => {
        const reactions = State_32.default.get(reactionsIn);
        const reacted = State_32.default.get(reactedIn);
        return component
            .style('reaction')
            .append((0, Button_12.default)()
            .setIcon(REACTION_MAP[type])
            .style('reaction-button')
            .style.bind(reacted, 'reaction-button--reacted'))
            .append((0, Component_46.default)()
            .style('reaction-count')
            .text.bind(reactions.map(component, reactions => reactions ? `${reactions}` : '')))
            .extend(component => ({
            reactions,
            reacted,
        }));
    });
    exports.default = Reaction;
});
define("ui/component/Comment", ["require", "exports", "endpoint/comment/EndpointCommentAdd", "endpoint/comment/EndpointCommentDelete", "endpoint/comment/EndpointCommentUpdate", "endpoint/reaction/EndpointReactComment", "endpoint/reaction/EndpointUnreactComment", "lang/en-nz", "model/FormInputLengths", "model/Session", "ui/Component", "ui/component/core/ActionRow", "ui/component/core/Button", "ui/component/core/Link", "ui/component/core/Slot", "ui/component/core/TextEditor", "ui/component/core/Timestamp", "ui/component/Reaction"], function (require, exports, EndpointCommentAdd_1, EndpointCommentDelete_1, EndpointCommentUpdate_1, EndpointReactComment_1, EndpointUnreactComment_1, en_nz_9, FormInputLengths_4, Session_10, Component_47, ActionRow_5, Button_13, Link_4, Slot_10, TextEditor_3, Timestamp_2, Reaction_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    EndpointCommentAdd_1 = __importDefault(EndpointCommentAdd_1);
    EndpointCommentDelete_1 = __importDefault(EndpointCommentDelete_1);
    EndpointCommentUpdate_1 = __importDefault(EndpointCommentUpdate_1);
    EndpointReactComment_1 = __importDefault(EndpointReactComment_1);
    EndpointUnreactComment_1 = __importDefault(EndpointUnreactComment_1);
    en_nz_9 = __importDefault(en_nz_9);
    FormInputLengths_4 = __importDefault(FormInputLengths_4);
    Session_10 = __importDefault(Session_10);
    Component_47 = __importDefault(Component_47);
    ActionRow_5 = __importDefault(ActionRow_5);
    Button_13 = __importDefault(Button_13);
    Link_4 = __importDefault(Link_4);
    Slot_10 = __importDefault(Slot_10);
    TextEditor_3 = __importDefault(TextEditor_3);
    Timestamp_2 = __importDefault(Timestamp_2);
    Reaction_1 = __importDefault(Reaction_1);
    const Comment = Component_47.default.Builder((component, source, commentData, meta) => {
        const comment = component.and(Slot_10.default)
            .style('comment')
            .extend(comment => ({}));
        const comments = source.comments.map(comment, comments => comments.filter(comment => comment === commentData || comment.parent_id === commentData.comment_id));
        comment.use(comments, (slot, commentsData) => {
            const isThread = false
                // has siblings & is not a top level comment
                || (!meta?.noSiblings && !!meta?.hasParent)
                // has a parent that is a top level comment
                || !!(meta?.hasParent && !meta.hasGrandparent);
            comment.style.toggle(isThread, 'comment--is-thread');
            const content = (0, Component_47.default)()
                .style('comment-content')
                .style.setProperty('z-index', `${100 - (meta?.depth ?? 0)}`)
                .appendTo(slot);
            if (commentData && !meta?.isRootComment) {
                const header = (0, Component_47.default)('header')
                    .style('comment-header')
                    .style.toggle(!!commentData.edit, 'comment-header--editing')
                    .appendTo(content);
                const author = source.authors.value.find(author => author.vanity === commentData.author);
                (0, Link_4.default)(!author?.vanity ? undefined : `/author/${author.vanity}`)
                    .style('comment-header-author')
                    .text.set(author?.name ?? en_nz_9.default['comment/deleted/author']().toString())
                    .appendTo(header);
                const time = commentData.edited_time ?? commentData.created_time;
                if (time)
                    (0, Timestamp_2.default)(time)
                        .style('comment-header-timestamp')
                        .setTranslation(!commentData.edited_time ? undefined : en_nz_9.default['comment/timestamp/edited'])
                        .appendTo(header);
                if (commentData.edit) {
                    ////////////////////////////////////
                    //#region Text Editor Body
                    const textEditor = (0, TextEditor_3.default)()
                        .default.set(commentData.body?.body ?? '')
                        .setMaxLength(FormInputLengths_4.default.manifest?.comment.body)
                        .hint.use('comment/hint')
                        .appendTo(content);
                    textEditor.content.use(header, markdown => commentData.body = { body: markdown });
                    const footer = (0, Component_47.default)('footer').and(ActionRow_5.default)
                        .style('comment-footer', 'comment-footer--editing')
                        .appendTo(content);
                    if (commentData.comment_id)
                        (0, Button_13.default)()
                            .style('comment-footer-action')
                            .text.use('comment/action/delete')
                            .event.subscribe('click', async () => {
                            const response = await EndpointCommentDelete_1.default.query({ params: { id: commentData.comment_id } });
                            if (toast.handleError(response))
                                return;
                            source.comments.value.filterInPlace(comment => comment !== commentData);
                            source.comments.emit();
                        })
                            .appendTo(footer.right);
                    (0, Button_13.default)()
                        .style('comment-footer-action')
                        .text.use('comment/action/cancel')
                        .event.subscribe('click', () => {
                        if (commentData.created_time)
                            delete commentData.edit;
                        else
                            source.comments.value.filterInPlace(comment => comment !== commentData);
                        source.comments.emit();
                    })
                        .appendTo(footer.right);
                    (0, Button_13.default)()
                        .style('comment-footer-action')
                        .type('primary')
                        .text.use('comment/action/save')
                        .bindDisabled(textEditor.invalid)
                        .event.subscribe('click', async () => {
                        if (!commentData.parent_id)
                            return;
                        const response = commentData.comment_id
                            ? await EndpointCommentUpdate_1.default.query({
                                params: { id: commentData.comment_id },
                                body: { body: textEditor.useMarkdown() },
                            })
                            : await EndpointCommentAdd_1.default.query({
                                params: { under: commentData.parent_id },
                                body: { body: textEditor.useMarkdown() },
                            });
                        if (toast.handleError(response))
                            return;
                        const newComment = response.data;
                        source.comments.value.filterInPlace(comment => comment !== commentData);
                        source.comments.value.push(newComment);
                        source.comments.emit();
                    })
                        .appendTo(footer.right);
                    //#endregion
                    ////////////////////////////////////
                }
                else {
                    ////////////////////////////////////
                    //#region Real Comment Body
                    (0, Component_47.default)()
                        .style('comment-body')
                        .setMarkdownContent(commentData.body?.body ?? en_nz_9.default['comment/deleted/body']().toString())
                        .appendTo(content);
                    (0, Slot_10.default)()
                        .use(Session_10.default.Auth.author, (slot, author) => {
                        if (!author)
                            return;
                        const footer = (0, Component_47.default)('footer')
                            .style('comment-footer')
                            .appendTo(content);
                        (0, Reaction_1.default)('love', commentData.reactions ?? 0, !!commentData.reacted)
                            .event.subscribe('click', async () => {
                            if (commentData.reacted) {
                                const response = await EndpointUnreactComment_1.default.query({ params: { comment_id: commentData.comment_id } });
                                if (toast.handleError(response))
                                    return;
                                delete commentData.reacted;
                                commentData.reactions ??= 0;
                                commentData.reactions--;
                                if (commentData.reactions < 0)
                                    delete commentData.reactions;
                            }
                            else {
                                const response = await EndpointReactComment_1.default.query({ params: { comment_id: commentData.comment_id, type: 'love' } });
                                if (toast.handleError(response))
                                    return;
                                commentData.reacted = true;
                                commentData.reactions ??= 0;
                                commentData.reactions++;
                            }
                            comments.emit();
                        })
                            .appendTo(footer);
                        (0, Button_13.default)()
                            .style('comment-footer-action')
                            .type('flush')
                            .text.use('comment/action/reply')
                            .event.subscribe('click', () => {
                            source.comments.value.unshift({ edit: true, parent_id: commentData.comment_id, author: author.vanity });
                            comments.refresh();
                        })
                            .appendTo(footer);
                        if (commentData.author === author.vanity)
                            (0, Button_13.default)()
                                .style('comment-footer-action')
                                .type('flush')
                                .text.use('comment/action/edit')
                                .event.subscribe('click', () => {
                                commentData.edit = true;
                                comments.refresh();
                            })
                                .appendTo(footer);
                    })
                        .appendTo(slot);
                    //#endregion
                    ////////////////////////////////////
                }
            }
            if (!commentData.comment_id || commentsData.length <= 1)
                return;
            const hasChildren = commentsData.length > 2;
            const shouldBeFlush = false
                || !!meta?.isRootComment
                // this is part of a thread, so flatten it
                || (meta?.noSiblings && !hasChildren)
                // border is handled by child comments rather than being on the wrapper
                || (commentsData.length > 3);
            const childrenWrapper = (0, Component_47.default)()
                .style('comment-children')
                .style.toggle(shouldBeFlush, 'comment-children--flush')
                .appendTo(slot);
            const timeValue = (c) => !c.created_time ? Infinity : new Date(c.created_time).getTime();
            for (const comment of commentsData.sort((a, b) => timeValue(b) - timeValue(a))) {
                if (comment === commentData)
                    continue;
                const noSiblings = commentsData.length <= 2 ? true : undefined;
                Comment(source, comment, { noSiblings, hasParent: !meta?.isRootComment ? true : undefined, hasGrandparent: meta?.hasParent, depth: (meta?.depth ?? 0) + 1 })
                    .appendTo(childrenWrapper);
            }
        });
        return comment;
    });
    exports.default = Comment;
});
define("ui/component/Comments", ["require", "exports", "endpoint/comment/EndpointCommentGetAllUnder", "model/Session", "ui/Component", "ui/component/Comment", "ui/component/core/Block", "ui/component/core/Button", "ui/component/core/Slot", "utility/AbortPromise", "utility/State"], function (require, exports, EndpointCommentGetAllUnder_1, Session_11, Component_48, Comment_1, Block_10, Button_14, Slot_11, AbortPromise_3, State_33) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    EndpointCommentGetAllUnder_1 = __importDefault(EndpointCommentGetAllUnder_1);
    Session_11 = __importDefault(Session_11);
    Component_48 = __importDefault(Component_48);
    Comment_1 = __importDefault(Comment_1);
    Button_14 = __importDefault(Button_14);
    Slot_11 = __importDefault(Slot_11);
    AbortPromise_3 = __importDefault(AbortPromise_3);
    State_33 = __importDefault(State_33);
    const Comments = Component_48.default.Builder((rawComponent, under, isRootComment) => {
        const component = rawComponent
            .classes.add(Block_10.BlockClasses.Main)
            .style('comment-list')
            .viewTransition('comments')
            .extend(component => ({}));
        (0, Slot_11.default)()
            .use(Session_11.default.Auth.author, AbortPromise_3.default.asyncFunction(async (signal, slot, author) => {
            const comment = { comment_id: under };
            const comments = (0, State_33.default)([comment]);
            const authors = (0, State_33.default)(!author ? [] : [author]);
            if (author)
                comments.use(component, commentsData => {
                    if (!commentsData[0].edit) {
                        commentsData.unshift({ edit: true, parent_id: under, author: author.vanity });
                        comments.emit();
                    }
                });
            const query = (0, State_33.default)(undefined);
            query.value = EndpointCommentGetAllUnder_1.default.prep({ params: { under } }).query;
            (0, Comment_1.default)({ comments, authors }, comment, { isRootComment, noSiblings: true })
                .appendTo(component);
            await loadMore();
            if (signal.aborted)
                return;
            (0, Slot_11.default)()
                .if(query.truthy, () => (0, Button_14.default)()
                .event.subscribe('click', loadMore)
                .text.set('load more'))
                .appendTo(component);
            async function loadMore() {
                if (!query.value)
                    return;
                const result = await query.value?.();
                if (toast.handleError(result))
                    throw result;
                authors.value.push(...result.data.authors);
                authors.emit();
                comments.value.push(...result.data.comments);
                comments.emit();
                query.value = result.next;
            }
        }))
            .appendTo(component);
        return component;
    });
    exports.default = Comments;
});
define("ui/view/shared/component/PaginatedView", ["require", "exports", "ui/Component", "ui/component/core/Paginator", "ui/view/shared/component/View"], function (require, exports, Component_49, Paginator_2, View_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Component_49 = __importDefault(Component_49);
    Paginator_2 = __importDefault(Paginator_2);
    View_5 = __importDefault(View_5);
    const PaginatedView = Component_49.default.Builder((_, id) => {
        let paginator;
        const urls = [];
        return (0, View_5.default)(id)
            .extend(view => ({
            setURL,
            paginator: () => {
                paginator ??= (0, Paginator_2.default)().extend(paginator => ({ setURL }));
                paginator.page.subscribeManual(page => {
                    const route = urls[page];
                    if (route)
                        navigate.setURL(route);
                });
                return paginator;
            },
        }));
        function setURL(route) {
            navigate.setURL(route);
            const page = paginator?.page.value;
            if (page !== undefined)
                urls[page] = route;
        }
    });
    exports.default = PaginatedView;
});
define("ui/view/ChapterView", ["require", "exports", "endpoint/chapter/EndpointChapterGet", "endpoint/chapter/EndpointChapterGetPaged", "endpoint/reaction/EndpointReactChapter", "endpoint/reaction/EndpointUnreactChapter", "endpoint/work/EndpointWorkGet", "lang/en-nz", "ui/component/Comments", "ui/component/core/Button", "ui/component/core/Link", "ui/component/core/Slot", "ui/component/Reaction", "ui/component/Work", "ui/view/shared/component/PaginatedView", "ui/view/shared/component/ViewDefinition", "utility/maths/Maths", "utility/State"], function (require, exports, EndpointChapterGet_2, EndpointChapterGetPaged_1, EndpointReactChapter_1, EndpointUnreactChapter_1, EndpointWorkGet_1, en_nz_10, Comments_1, Button_15, Link_5, Slot_12, Reaction_2, Work_2, PaginatedView_1, ViewDefinition_4, Maths_2, State_34) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    EndpointChapterGet_2 = __importDefault(EndpointChapterGet_2);
    EndpointChapterGetPaged_1 = __importDefault(EndpointChapterGetPaged_1);
    EndpointReactChapter_1 = __importDefault(EndpointReactChapter_1);
    EndpointUnreactChapter_1 = __importDefault(EndpointUnreactChapter_1);
    EndpointWorkGet_1 = __importDefault(EndpointWorkGet_1);
    en_nz_10 = __importDefault(en_nz_10);
    Comments_1 = __importDefault(Comments_1);
    Button_15 = __importDefault(Button_15);
    Link_5 = __importDefault(Link_5);
    Slot_12 = __importDefault(Slot_12);
    Reaction_2 = __importDefault(Reaction_2);
    Work_2 = __importDefault(Work_2);
    PaginatedView_1 = __importDefault(PaginatedView_1);
    ViewDefinition_4 = __importDefault(ViewDefinition_4);
    Maths_2 = __importDefault(Maths_2);
    State_34 = __importDefault(State_34);
    exports.default = (0, ViewDefinition_4.default)({
        create: async (params) => {
            const view = (0, PaginatedView_1.default)('chapter');
            const response = await EndpointWorkGet_1.default.query({ params });
            if (response instanceof Error)
                throw response;
            const author = response.data.synopsis.mentions.find(author => author.vanity === params.author);
            const workData = response.data;
            delete workData.synopsis;
            delete workData.custom_tags;
            (0, Link_5.default)(`/work/${author?.vanity}/${workData.vanity}`)
                .and(Work_2.default, workData, author)
                .viewTransition('work-view-work')
                .style('view-type-chapter-work')
                .setContainsHeading()
                .appendTo(view);
            const initialChapterResponse = await EndpointChapterGet_2.default.query({ params });
            if (initialChapterResponse instanceof Error)
                throw initialChapterResponse;
            const chapterState = (0, State_34.default)(initialChapterResponse.data);
            const chaptersQuery = EndpointChapterGetPaged_1.default.prep({ params });
            const paginator = await view.paginator()
                .viewTransition('chapter-view-chapter')
                .style('view-type-chapter-block')
                .type('flush')
                .tweak(p => p.title.text.bind(chapterState.mapManual(chapter => en_nz_10.default['view/chapter/title'](Maths_2.default.parseIntOrUndefined(chapter.url), chapter.name))))
                .appendTo(view)
                .useInitial(initialChapterResponse.data, initialChapterResponse.page, initialChapterResponse.page_count)
                .thenUse(chaptersQuery)
                .withContent((slot, chapter, paginator) => {
                paginator.setURL(`/work/${params.author}/${params.vanity}/chapter/${chapter.url}`);
                slot
                    .style('view-type-chapter-block-body')
                    .setMarkdownContent(chapter.body ?? '');
            });
            paginator.header.style('view-type-chapter-block-header');
            paginator.footer.style('view-type-chapter-block-paginator-actions');
            (0, Link_5.default)(`/work/${params.author}/${params.vanity}`)
                .and(Button_15.default)
                .type('flush')
                .text.use('chapter/action/index')
                .appendTo(paginator.footer.middle);
            const reactions = chapterState.mapManual(chapter => chapter.reactions ?? 0);
            const reacted = chapterState.mapManual(chapter => !!chapter.reacted);
            (0, Reaction_2.default)('love', reactions, reacted)
                .event.subscribe('click', async () => {
                if (!author?.vanity)
                    return;
                const params = { author: author?.vanity, vanity: workData.vanity, url: chapterState.value.url, type: 'love' };
                if (reacted.value) {
                    const response = await EndpointUnreactChapter_1.default.query({ params });
                    if (toast.handleError(response))
                        return;
                    delete chapterState.value.reacted;
                    if (chapterState.value.reactions)
                        chapterState.value.reactions--;
                    chapterState.emit();
                }
                else {
                    const response = await EndpointReactChapter_1.default.query({ params });
                    if (toast.handleError(response))
                        return;
                    chapterState.value.reacted = true;
                    chapterState.value.reactions ??= 0;
                    chapterState.value.reactions++;
                    chapterState.emit();
                }
            })
                .appendTo(paginator.footer.middle);
            paginator.data.use(paginator, chapter => chapterState.value = chapter);
            (0, Slot_12.default)()
                .use(paginator.data, (slot, chapter) => {
                if (!chapter.root_comment)
                    return;
                return (0, Comments_1.default)(chapter.root_comment, true);
            })
                .appendTo(view);
            return view;
        },
    });
});
define("ui/view/debug/ButtonRegistry", ["require", "exports", "model/Session", "utility/Env"], function (require, exports, Session_12, Env_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BUTTON_REGISTRY = void 0;
    Session_12 = __importDefault(Session_12);
    Env_7 = __importDefault(Env_7);
    exports.BUTTON_REGISTRY = {
        createAuthor: {
            name: 'Create Author',
            async execute(name, vanity, description, pronouns) {
                const response = await fetch(`${Env_7.default.API_ORIGIN}author/create`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({
                        name: name,
                        vanity: vanity,
                        description: description,
                        pronouns: pronouns,
                    }),
                }).then(response => response.json());
                console.log(response);
                await Session_12.default.refresh();
            },
        },
        updateAuthor: {
            name: 'Update Author',
            async execute(name, description, vanity, support_link, support_message) {
                await fetch(`${Env_7.default.API_ORIGIN}author/update`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: name,
                        description: description,
                        vanity: vanity,
                        support_link: support_link,
                        support_message: support_message,
                    }),
                });
            },
        },
        deleteAuthor: {
            name: 'Delete Author',
            async execute() {
                await fetch(`${Env_7.default.API_ORIGIN}author/delete`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
            },
        },
        viewAuthor: {
            name: 'View Author',
            async execute(label, vanity) {
                const response = await fetch(`${Env_7.default.API_ORIGIN}author/${vanity}/get`, {
                    credentials: 'include',
                }).then(response => response.json());
                console.log(label, response);
            },
        },
        clearSession: {
            name: 'Clear Session',
            async execute() {
                await fetch(`${Env_7.default.API_ORIGIN}session/reset`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                });
                await Session_12.default.refresh();
            },
        },
        createWork: {
            name: 'Create Work',
            async execute(name, synopsis, description, vanity, status, visibility, globalTags, customTags) {
                const response = await fetch(`${Env_7.default.API_ORIGIN}work/create`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: name,
                        synopsis: synopsis,
                        description: description,
                        vanity: vanity,
                        status: status,
                        visibility: visibility,
                        global_tags: globalTags,
                        custom_tags: customTags,
                    }),
                }).then(response => response.json());
                console.log(response);
            },
        },
        updateWork: {
            name: 'Update Work',
            async execute(author, url, name, description, vanity, status, visibility) {
                await fetch(`${Env_7.default.API_ORIGIN}work/${author}/${url}/update`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: name,
                        description: description,
                        vanity: vanity,
                        status: status,
                        visibility: visibility,
                    }),
                });
            },
        },
        deleteWork: {
            name: 'Delete Work',
            async execute(author, url) {
                await fetch(`${Env_7.default.API_ORIGIN}work/${author}/${url}/delete`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
            },
        },
        viewWork: {
            name: 'View Work',
            async execute(label, author, url) {
                const response = await fetch(`${Env_7.default.API_ORIGIN}work/${author}/${url}/get`, {
                    credentials: 'include',
                }).then(response => response.json());
                console.log(label, response);
            },
        },
        getAllWorksByAuthor: {
            name: 'View All Works By Author',
            async execute(label, author) {
                const response = await fetch(`${Env_7.default.API_ORIGIN}works/${author}`, {
                    credentials: 'include',
                }).then(response => response.json());
                console.log(label, response);
            },
        },
        createChapter: {
            name: 'Create Chapter',
            async execute(author, work_url, name, body, visibility, is_numbered, notesBefore, notesAfter, globalTags, customTags) {
                const response = await fetch(`${Env_7.default.API_ORIGIN}work/${author}/${work_url}/chapter/create`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: name,
                        body: body,
                        visibility: visibility,
                        is_numbered: is_numbered,
                        notes_before: notesBefore,
                        notes_after: notesAfter,
                        global_tags: globalTags,
                        custom_tags: customTags,
                    }),
                }).then(response => response.json());
                console.log(response);
            },
        },
        updateChapter: {
            name: 'Update Chapter',
            async execute(author, work_url, index, name, body, visibility, is_numbered, notesBefore, notesAfter, globalTags, customTags) {
                const response = await fetch(`${Env_7.default.API_ORIGIN}work/${author}/${work_url}/chapter/${index}/update`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name,
                        body,
                        visibility,
                        is_numbered,
                        notes_before: notesBefore,
                        notes_after: notesAfter,
                        global_tags: globalTags,
                        custom_tags: customTags,
                    }),
                }).then(response => response.json());
                console.log(response);
            },
        },
        deleteChapter: {
            name: 'Delete Chapter',
            async execute(author, work_url, index) {
                await fetch(`${Env_7.default.API_ORIGIN}work/${author}/${work_url}/chapter/${index}/delete`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
            },
        },
        viewChapter: {
            name: 'View Chapter',
            async execute(label, author, work_url, index) {
                const response = await fetch(`${Env_7.default.API_ORIGIN}work/${author}/${work_url}/chapter/${index}/get`, {
                    credentials: 'include',
                }).then(response => response.json());
                console.log(label, response);
            },
        },
        viewChapterPaginated: {
            name: 'View Chapter Paginated',
            async execute(label, author, work_url, index) {
                const response = await fetch(`${Env_7.default.API_ORIGIN}work/${author}/${work_url}/chapters/individual?page=${index}`, {
                    credentials: 'include',
                }).then(response => response.json());
                console.log(label, response);
            },
        },
        getAllChapters: {
            name: 'Get All Chapters',
            async execute(author, vanity, page = 0) {
                const response = await fetch(`${Env_7.default.API_ORIGIN}work/${author}/${vanity}/chapters/list?page=${page}`, {
                    credentials: 'include',
                }).then(response => response.json());
                console.log(response);
            },
        },
        follow: {
            name: 'Follow',
            async execute(type, vanity) {
                await fetch(`${Env_7.default.API_ORIGIN}follow/${type}/${vanity}`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
            },
        },
        followWork: {
            name: 'Follow',
            async execute(author_vanity, work_vanity) {
                await fetch(`${Env_7.default.API_ORIGIN}follow/work/${author_vanity}/${work_vanity}`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
            },
        },
        unfollow: {
            name: 'Unfollow',
            async execute(type, vanity) {
                await fetch(`${Env_7.default.API_ORIGIN}unfollow/${type}/${vanity}`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
            },
        },
        unfollowWork: {
            name: 'Unfollow',
            async execute(author_vanity, work_vanity) {
                await fetch(`${Env_7.default.API_ORIGIN}unfollow/work/${author_vanity}/${work_vanity}`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
            },
        },
        getFollow: {
            name: 'Get Follow',
            async execute(type, vanity) {
                const response = await fetch(`${Env_7.default.API_ORIGIN}follows/${type}/${vanity}`, {
                    credentials: 'include',
                }).then(response => response.json());
                console.log(response);
            },
        },
        getFollowWork: {
            name: 'Get Follow',
            async execute(author_vanity, work_vanity) {
                const response = await fetch(`${Env_7.default.API_ORIGIN}follows/work/${author_vanity}/${work_vanity}`, {
                    credentials: 'include',
                }).then(response => response.json());
                console.log(response);
            },
        },
        getAllFollows: {
            name: 'Get All Follows',
            async execute(type, page = 0) {
                const response = await fetch(`${Env_7.default.API_ORIGIN}following/${type}?page=${page}`, {
                    credentials: 'include',
                }).then(response => response.json());
                console.log(response);
            },
        },
        getAllFollowsMerged: {
            name: 'Get All Follows Merged',
            async execute(page = 0) {
                const response = await fetch(`${Env_7.default.API_ORIGIN}following?page=${page}`, {
                    credentials: 'include',
                }).then(response => response.json());
                console.log(response);
            },
        },
        ignore: {
            name: 'Ignore',
            async execute(type, vanity) {
                await fetch(`${Env_7.default.API_ORIGIN}ignore/${type}/${vanity}`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
            },
        },
        ignoreWork: {
            name: 'Ignore',
            async execute(author_vanity, work_vanity) {
                await fetch(`${Env_7.default.API_ORIGIN}ignore/work/${author_vanity}/${work_vanity}`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
            },
        },
        unignore: {
            name: 'Unignore',
            async execute(type, vanity) {
                await fetch(`${Env_7.default.API_ORIGIN}unignore/${type}/${vanity}`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
            },
        },
        unignoreWork: {
            name: 'Unignore',
            async execute(author_vanity, work_vanity) {
                await fetch(`${Env_7.default.API_ORIGIN}unignore/work/${author_vanity}/${work_vanity}`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
            },
        },
        getIgnore: {
            name: 'Get Ignore',
            async execute(type, vanity) {
                const response = await fetch(`${Env_7.default.API_ORIGIN}ignores/${type}/${vanity}`, {
                    credentials: 'include',
                }).then(response => response.json());
                console.log(response);
            },
        },
        getIgnoreWork: {
            name: 'Get Ignore',
            async execute(author_vanity, work_vanity) {
                const response = await fetch(`${Env_7.default.API_ORIGIN}ignores/work/${author_vanity}/${work_vanity}`, {
                    credentials: 'include',
                }).then(response => response.json());
                console.log(response);
            },
        },
        getAllIgnores: {
            name: 'Get All Ignores',
            async execute(type, page = 0) {
                const response = await fetch(`${Env_7.default.API_ORIGIN}ignoring/${type}?page=${page}`, {
                    credentials: 'include',
                }).then(response => response.json());
                console.log(response);
            },
        },
        getAllIgnoresMerged: {
            name: 'Get All Ignores Merged',
            async execute(page = 0) {
                const response = await fetch(`${Env_7.default.API_ORIGIN}ignoring?page=${page}`, {
                    credentials: 'include',
                }).then(response => response.json());
                console.log(response);
            },
        },
        privilegeGetAllAuthor: {
            name: 'Get All Author Privileges',
            async execute(label, vanity) {
                const response = await fetch(`${Env_7.default.API_ORIGIN}privilege/get/${vanity}`, {
                    credentials: 'include',
                }).then(response => response.json());
                console.log(label, response);
            },
        },
        privilegeGrantAuthor: {
            name: 'Grant Privileges to Author',
            async execute(vanity, ...privileges) {
                const response = await fetch(`${Env_7.default.API_ORIGIN}privilege/grant/author/${vanity}`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        privileges,
                    }),
                }).then(response => response.json());
                console.log('granted privileges', response);
            },
        },
        privilegeRevokeAuthor: {
            name: 'Revoke Privileges from Author',
            async execute(vanity, ...privileges) {
                const response = await fetch(`${Env_7.default.API_ORIGIN}privilege/revoke/author/${vanity}`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        privileges,
                    }),
                }).then(response => response.json());
                console.log('revoked privileges', response);
            },
        },
        createRole: {
            name: 'Create Role',
            async execute(roleName, visibilty, roleBelow) {
                const response = await fetch(`${Env_7.default.API_ORIGIN}role/create`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: roleName,
                        below: roleBelow,
                        description: 'idk some test stuff',
                        visibilty: visibilty,
                    }),
                }).then(response => response.json());
                console.log('created role', response);
            },
        },
        deleteRole: {
            name: 'Delete Role',
            async execute(vanity) {
                const response = await fetch(`${Env_7.default.API_ORIGIN}role/delete/${vanity}`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }).then(response => response.json());
                console.log('deleted role', response);
            },
        },
        editRole: {
            name: 'Edit Role',
            async execute(vanity, name, description) {
                const response = await fetch(`${Env_7.default.API_ORIGIN}role/update/${vanity}`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: name,
                        description: description,
                    }),
                }).then(response => response.json());
                console.log('edited role', response);
            },
        },
        grantRoleToAuthor: {
            name: 'Grant Role to Author',
            async execute(roleVanity, authorVanity) {
                const response = await fetch(`${Env_7.default.API_ORIGIN}role/grant/${roleVanity}/${authorVanity}`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }).then(response => response.json());
                console.log('granted role', response);
            },
        },
        revokeRoleFromAuthor: {
            name: 'Revoke Role from Author',
            async execute(roleVanity, authorVanity) {
                const response = await fetch(`${Env_7.default.API_ORIGIN}role/revoke/${roleVanity}/${authorVanity}`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }).then(response => response.json());
                console.log('granted role', response);
            },
        },
        privilegeGrantRole: {
            name: 'Grant Privileges to Role',
            async execute(vanity, ...privileges) {
                const response = await fetch(`${Env_7.default.API_ORIGIN}privilege/grant/role/${vanity}`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        privileges,
                    }),
                }).then(response => response.json());
                console.log('granted privileges to role', response);
            },
        },
        privilegeRevokeRole: {
            name: 'Revoke Privileges from Role',
            async execute(vanity, ...privileges) {
                const response = await fetch(`${Env_7.default.API_ORIGIN}privilege/revoke/role/${vanity}`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        privileges,
                    }),
                }).then(response => response.json());
                console.log('revoked privileges from role', response);
            },
        },
        roleListAll: {
            name: 'List all roles',
            async execute(label) {
                const response = await fetch(`${Env_7.default.API_ORIGIN}role/get`, {
                    credentials: 'include',
                }).then(response => response.json());
                console.log(label, response);
            },
        },
        roleReorder: {
            name: 'Reorder roles',
            async execute(...roles) {
                const response = await fetch(`${Env_7.default.API_ORIGIN}role/reorder`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        roles,
                    }),
                }).then(response => response.json());
                console.log('reordered roles', response);
            },
        },
        createCommentChapter: {
            name: 'Create Comment Chapter',
            async execute(author, vanity, index, body, parent_id) {
                const response = await fetch(`${Env_7.default.API_ORIGIN}work/${author}/${vanity}/chapter/${index}/comment/add`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        body,
                        parent_id,
                    }),
                }).then(response => response.json());
                console.log(response);
            },
        },
        updateCommentChapter: {
            name: 'Update Comment Chapter',
            async execute(id, comment_body) {
                const response = await fetch(`${Env_7.default.API_ORIGIN}comment/update/chapter`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        comment_id: id,
                        body: comment_body,
                    }),
                }).then(response => response.json());
                console.log(response);
            },
        },
        deleteCommentChapter: {
            name: 'Delete Comment Chapter',
            async execute(id) {
                await fetch(`${Env_7.default.API_ORIGIN}comment/remove/chapter`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        comment_id: id,
                    }),
                });
            },
        },
        getComment: {
            name: 'Get Comment',
            async execute(id, label) {
                const response = await fetch(`${Env_7.default.API_ORIGIN}comment/get`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        comment_id: id,
                    }),
                }).then(response => response.json());
                console.log(label, response);
            },
        },
        getAllComments: {
            name: 'Get All Comments',
            async execute(author, vanity, index) {
                const response = await fetch(`${Env_7.default.API_ORIGIN}work/${author}/${vanity}/chapter/${index}/comments`, {
                    credentials: 'include',
                }).then(response => response.json());
                console.log(response);
            },
        },
        patreonGetTiers: {
            name: 'Get Tiers',
            async execute(label) {
                const response = await fetch(`${Env_7.default.API_ORIGIN}patreon/campaign/tiers/get`, {
                    credentials: 'include',
                }).then(response => response.json());
                console.log(label, response);
            },
        },
        patreonSetThresholds: {
            name: 'Set Chapter Thresholds',
            async execute(author_vanity, work_vanity, visibility, chapters, tier_id) {
                const response = await fetch(`${Env_7.default.API_ORIGIN}patreon/campaign/tiers/set/${author_vanity}/${work_vanity}`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        visibility: visibility,
                        chapters: chapters,
                        tier_id: tier_id,
                    }),
                }).then(response => response.json());
                console.log(response);
            },
        },
        tagCreateCategory: {
            name: 'Tag Create Category',
            async execute(categoryName, categoryDescription) {
                const response = await fetch(`${Env_7.default.API_ORIGIN}tag/create/category`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: categoryName,
                        description: categoryDescription,
                    }),
                }).then(response => response.json());
                console.log(response);
            },
        },
        tagCreateGlobal: {
            name: 'Tag Create Global',
            async execute(tagName, tagDescription, tagCategory) {
                const response = await fetch(`${Env_7.default.API_ORIGIN}tag/create/global`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: tagName,
                        description: tagDescription,
                        category: tagCategory,
                    }),
                }).then(response => response.json());
                console.log(response);
            },
        },
        tagPromoteCustom: {
            name: 'Tag Promote Custom',
            async execute(tagName, newDescription, newCategory) {
                const response = await fetch(`${Env_7.default.API_ORIGIN}tag/promote/${tagName}`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        description: newDescription,
                        category: newCategory,
                    }),
                }).then(response => response.json());
                console.log(response);
            },
        },
        tagDemoteGlobal: {
            name: 'Tag Demote Global',
            async execute(tagName) {
                const response = await fetch(`${Env_7.default.API_ORIGIN}tag/demote/${tagName}`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }).then(response => response.json());
                console.log(response);
            },
        },
        tagUpdateCategory: {
            name: 'Tag Update Category',
            async execute(vanity, categoryName, categoryDescription) {
                const response = await fetch(`${Env_7.default.API_ORIGIN}tag/update/category/${vanity}`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: categoryName,
                        description: categoryDescription,
                    }),
                }).then(response => response.json());
                console.log(response);
            },
        },
        tagUpdateGlobal: {
            name: 'Tag Update Global',
            async execute(vanity, tagName, tagDescription, tagCategory) {
                const response = await fetch(`${Env_7.default.API_ORIGIN}tag/update/global/${vanity}`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: tagName,
                        description: tagDescription,
                        category: tagCategory,
                    }),
                }).then(response => response.json());
                console.log(response);
            },
        },
        tagRemoveCategory: {
            name: 'Tag Remove Category',
            async execute(vanity) {
                const response = await fetch(`${Env_7.default.API_ORIGIN}tag/remove/category/${vanity}`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }).then(response => response.json());
                console.log(response);
            },
        },
        tagRemoveGlobal: {
            name: 'Tag Remove Global',
            async execute(vanity) {
                const response = await fetch(`${Env_7.default.API_ORIGIN}tag/remove/global/${vanity}`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }).then(response => response.json());
                console.log(response);
            },
        },
        tagGetManifest: {
            name: 'Tag Get Manifest',
            async execute() {
                const response = await fetch(`${Env_7.default.API_ORIGIN}manifest/tags`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }).then(response => response.json());
                console.log(response);
            },
        },
        manifestFormLengthGet: {
            name: 'Form Length Manifest',
            async execute() {
                const response = await fetch(`${Env_7.default.API_ORIGIN}manifest/form/lengths`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }).then(response => response.json());
                console.log(response);
            },
        },
        notificationsGet: {
            name: 'Get Notifications',
            async execute() {
                const response = await fetch(`${Env_7.default.API_ORIGIN}notifications/get/all`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }).then(response => response.json());
                console.log(response);
            },
        },
        notificationsGetUnread: {
            name: 'Get Unread Notifications',
            async execute() {
                const response = await fetch(`${Env_7.default.API_ORIGIN}notifications/get/unread`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }).then(response => response.json());
                console.log(response);
            },
        },
        notificationsMark: {
            name: 'Mark Notifications Read/Unread',
            async execute(state, notifications) {
                await fetch(`${Env_7.default.API_ORIGIN}notifications/mark/${state}`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        notification_ids: notifications,
                    }),
                });
            },
        },
        seedBulk: {
            name: 'Seed Bulk',
            async execute() {
                await fetch(`${Env_7.default.API_ORIGIN}seed/bulk`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
            },
        },
        feedGet: {
            name: 'Get Feed',
            async execute() {
                const response = await fetch(`${Env_7.default.API_ORIGIN}feed/get`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }).then(response => response.json());
                console.log(response);
            },
        },
    };
});
define("ui/view/DebugView", ["require", "exports", "endpoint/auth/EndpointAuthServices", "model/Session", "ui/Component", "ui/component/core/Button", "ui/view/debug/ButtonRegistry", "ui/view/shared/component/View", "ui/view/shared/component/ViewDefinition", "utility/Env", "utility/Objects", "utility/Popup"], function (require, exports, EndpointAuthServices_2, Session_13, Component_50, Button_16, ButtonRegistry_1, View_6, ViewDefinition_5, Env_8, Objects_4, Popup_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    EndpointAuthServices_2 = __importDefault(EndpointAuthServices_2);
    Session_13 = __importDefault(Session_13);
    Component_50 = __importDefault(Component_50);
    Button_16 = __importDefault(Button_16);
    View_6 = __importDefault(View_6);
    ViewDefinition_5 = __importDefault(ViewDefinition_5);
    Env_8 = __importDefault(Env_8);
    Objects_4 = __importDefault(Objects_4);
    Popup_2 = __importDefault(Popup_2);
    const Block = Component_50.default.Builder(component => component
        .style('debug-block'));
    exports.default = (0, ViewDefinition_5.default)({
        async create() {
            const view = (0, View_6.default)('debug');
            const createButton = (implementation, ...args) => {
                return (0, Button_16.default)()
                    .text.set(implementation.name)
                    .event.subscribe('click', async () => {
                    try {
                        await implementation.execute(...args);
                    }
                    catch (err) {
                        const error = err;
                        console.warn(`Button ${implementation.name} failed to execute:`, error);
                    }
                });
            };
            const oauthDiv = Block().appendTo(view);
            const OAuthServices = await EndpointAuthServices_2.default.query();
            for (const service of Objects_4.default.values(OAuthServices.data ?? {})) {
                if (!service)
                    continue;
                (0, Button_16.default)()
                    .text.set(`OAuth ${service.name}`)
                    .event.subscribe('click', async () => {
                    await (0, Popup_2.default)(`OAuth ${service.name}`, service.url_begin, 600, 900)
                        .then(() => true).catch(err => { console.warn(err); return false; });
                    await Session_13.default.refresh();
                })
                    .appendTo(oauthDiv);
                (0, Button_16.default)()
                    .text.set(`UnOAuth ${service.name}`)
                    .event.subscribe('click', async () => {
                    const id = Session_13.default.Auth.get(service.id)?.id;
                    if (id === undefined)
                        return;
                    await fetch(`${Env_8.default.API_ORIGIN}auth/remove`, {
                        method: 'POST',
                        credentials: 'include',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ id }),
                    });
                })
                    .appendTo(oauthDiv);
            }
            // document.body.append(createButton(BUTTON_REGISTRY.createAuthor, "test author 1", "hi-im-an-author"));
            oauthDiv.append(createButton(ButtonRegistry_1.BUTTON_REGISTRY.clearSession));
            const profileButtons = Block().appendTo(view);
            profileButtons.append(createButton({
                name: 'Seed Bulk Data',
                async execute() {
                    await ButtonRegistry_1.BUTTON_REGISTRY.seedBulk.execute();
                },
            }));
            profileButtons.append(createButton({
                name: 'Create Profile 1',
                async execute() {
                    await ButtonRegistry_1.BUTTON_REGISTRY.createAuthor.execute('prolific author', 'somanystories', 'wow a description that mentions <mention vanity="somanystories">', 'she/her pronies m8');
                    await ButtonRegistry_1.BUTTON_REGISTRY.createWork.execute('a debut work', 'pretty decent by <mention vanity="somanystories">', 'short description', 'debut', 'Complete', 'Public');
                    await ButtonRegistry_1.BUTTON_REGISTRY.createChapter.execute('somanystories', 'debut', 'chapter 1', 'woo look it\'s prolific author\'s first story!', 'Public');
                    await ButtonRegistry_1.BUTTON_REGISTRY.createWork.execute('sequel to debut', 'wow they wrote a sequel', 'sequel short description', 'sequel', 'Ongoing', 'Public');
                    await ButtonRegistry_1.BUTTON_REGISTRY.createChapter.execute('somanystories', 'sequel', 'the chapters', 'pretend there\'s a story here', 'Public');
                    await ButtonRegistry_1.BUTTON_REGISTRY.createWork.execute('work in progress', 'test', 'short description test', 'wip', 'Ongoing', 'Private');
                    await ButtonRegistry_1.BUTTON_REGISTRY.createChapter.execute('somanystories', 'wip', 'draft', 'it\'s a rough draft', 'Private');
                    await ButtonRegistry_1.BUTTON_REGISTRY.viewWork.execute('work', 'somanystories', 'debut');
                    await ButtonRegistry_1.BUTTON_REGISTRY.viewWork.execute('work', 'somanystories', 'sequel');
                    await ButtonRegistry_1.BUTTON_REGISTRY.viewWork.execute('work', 'somanystories', 'wip');
                    await ButtonRegistry_1.BUTTON_REGISTRY.getAllWorksByAuthor.execute('all works', 'somanystories');
                },
            }));
            profileButtons.append(createButton({
                name: 'View Profile 1',
                async execute() {
                    await ButtonRegistry_1.BUTTON_REGISTRY.viewAuthor.execute('author with many stories', 'somanystories');
                    await ButtonRegistry_1.BUTTON_REGISTRY.getAllWorksByAuthor.execute('all works', 'somanystories');
                },
            }));
            profileButtons.append(createButton({
                name: 'Create Profile 2',
                async execute() {
                    await ButtonRegistry_1.BUTTON_REGISTRY.createAuthor.execute('single story author', 'justonestory', '<mention vanity="somanystories"> writes so much');
                    await ButtonRegistry_1.BUTTON_REGISTRY.createWork.execute('one big work', 'made by <mention vanity="justonestory">', 'wow description', 'bigstory', 'Ongoing', 'Public', ['Protagonist: Transgender', 'Genre: Fantasy', 'Genre: Romance', 'Setting: Urban Fantasy'], ['just a test work lmao', 'gotta add some custom tags']);
                    await ButtonRegistry_1.BUTTON_REGISTRY.createChapter.execute('justonestory', 'bigstory', 'big story 1', 'start of a long story', 'Public');
                    await ButtonRegistry_1.BUTTON_REGISTRY.createChapter.execute('justonestory', 'bigstory', 'big story interlude', 'middle of a long story', 'Public', false, 'only notes before');
                    await ButtonRegistry_1.BUTTON_REGISTRY.createChapter.execute('justonestory', 'bigstory', 'big story 2', 'aaaa', 'Public', true, undefined, 'only notes after');
                    await ButtonRegistry_1.BUTTON_REGISTRY.createChapter.execute('justonestory', 'bigstory', 'big story 3', 'aaaaaaa', 'Public', true, 'both notes before', 'and notes after');
                    await ButtonRegistry_1.BUTTON_REGISTRY.createChapter.execute('justonestory', 'bigstory', 'big story 3.1', 'aaaaaaaaaaaaaaaaaaa', 'Public', false);
                    await ButtonRegistry_1.BUTTON_REGISTRY.createChapter.execute('justonestory', 'bigstory', 'big story 3.2', 'aaaaaaaaaaaaaaaaaaa', 'Private', false);
                    await ButtonRegistry_1.BUTTON_REGISTRY.createChapter.execute('justonestory', 'bigstory', 'big story 3.3', 'aaaaaaaaaaaaaaaaaaa', 'Public');
                    for (let i = 4; i < 50; i++) {
                        await ButtonRegistry_1.BUTTON_REGISTRY.createChapter.execute('justonestory', 'bigstory', `big story ${i}`, 'aaaaaaaaaaaaaaaaaaa', 'Public');
                    }
                    await ButtonRegistry_1.BUTTON_REGISTRY.updateChapter.execute('justonestory', 'bigstory', 4, undefined, undefined, undefined, false);
                    await ButtonRegistry_1.BUTTON_REGISTRY.viewChapter.execute('', 'justonestory', 'bigstory', 1);
                    await ButtonRegistry_1.BUTTON_REGISTRY.viewWork.execute('big story five chapters', 'justonestory', 'bigstory');
                    await ButtonRegistry_1.BUTTON_REGISTRY.getAllChapters.execute('justonestory', 'bigstory', 0);
                    await ButtonRegistry_1.BUTTON_REGISTRY.viewChapterPaginated.execute('0', 'justonestory', 'bigstory', 0);
                    await ButtonRegistry_1.BUTTON_REGISTRY.viewChapterPaginated.execute('4 (3.1)', 'justonestory', 'bigstory', 4);
                    await ButtonRegistry_1.BUTTON_REGISTRY.viewChapterPaginated.execute('6 (private)', 'justonestory', 'bigstory', 6);
                    // await BUTTON_REGISTRY.follow.execute("work", "debut");
                },
            }));
            profileButtons.append(createButton({
                name: 'View Profile 2',
                async execute() {
                    await ButtonRegistry_1.BUTTON_REGISTRY.viewAuthor.execute('justonestory author', 'justonestory');
                },
            }));
            profileButtons.append(createButton({
                name: 'View Profile 2\'s stories',
                async execute() {
                    await ButtonRegistry_1.BUTTON_REGISTRY.viewChapter.execute('', 'justonestory', 'bigstory', 1);
                    await ButtonRegistry_1.BUTTON_REGISTRY.viewWork.execute('big story five chapters', 'justonestory', 'bigstory');
                    await ButtonRegistry_1.BUTTON_REGISTRY.getAllChapters.execute('justonestory', 'bigstory', 0);
                    await ButtonRegistry_1.BUTTON_REGISTRY.viewChapterPaginated.execute('0', 'justonestory', 'bigstory', 0);
                    await ButtonRegistry_1.BUTTON_REGISTRY.viewChapterPaginated.execute('4 (3.1)', 'justonestory', 'bigstory', 4);
                    await ButtonRegistry_1.BUTTON_REGISTRY.viewChapterPaginated.execute('6 (private)', 'justonestory', 'bigstory', 6);
                },
            }));
            // profileButtons.append(createButton({
            // 	name: "Set Chiri Patreon chapters",
            // 	async execute () {
            // 		await BUTTON_REGISTRY.patreonSetThresholds.execute("justonestory", "bigstory", "Patreon", ["8", "9"], "4392761")
            // 	},
            // }))
            const followButtons = Block().appendTo(view);
            followButtons.append(createButton({
                name: 'Test New Following',
                async execute() {
                    await ButtonRegistry_1.BUTTON_REGISTRY.createAuthor.execute('new follows', 'thefollower');
                    await ButtonRegistry_1.BUTTON_REGISTRY.createWork.execute('wow a work', 'test pls ignore', 'pls ignore', 'wowawork', 'Ongoing', 'Public');
                    await ButtonRegistry_1.BUTTON_REGISTRY.getAllFollows.execute('work');
                    await ButtonRegistry_1.BUTTON_REGISTRY.getAllFollows.execute('work');
                    await ButtonRegistry_1.BUTTON_REGISTRY.follow.execute('author', 'thefollower');
                    await ButtonRegistry_1.BUTTON_REGISTRY.followWork.execute('thefollower', 'wowawork');
                    await ButtonRegistry_1.BUTTON_REGISTRY.getFollow.execute('author', 'thefollower');
                    await ButtonRegistry_1.BUTTON_REGISTRY.getFollow.execute('author', 'thefollower');
                    await ButtonRegistry_1.BUTTON_REGISTRY.getAllFollows.execute('work');
                    await ButtonRegistry_1.BUTTON_REGISTRY.getAllFollows.execute('work');
                    await ButtonRegistry_1.BUTTON_REGISTRY.getAllFollowsMerged.execute();
                    await ButtonRegistry_1.BUTTON_REGISTRY.getAllFollowsMerged.execute();
                    await ButtonRegistry_1.BUTTON_REGISTRY.unignoreWork.execute('thefollower', 'wowawork');
                    // await BUTTON_REGISTRY.unfollow.execute("work", "wowawork");
                    await ButtonRegistry_1.BUTTON_REGISTRY.getFollowWork.execute('thefollower', 'wowawork');
                },
            }));
            followButtons.append(createButton({
                name: 'Create a work with loads of chapters',
                async execute() {
                    await ButtonRegistry_1.BUTTON_REGISTRY.createWork.execute('even longer story', 'aaaaaaaaa', 'short description aaaaa', 'wowbig', 'Ongoing', 'Public');
                    for (let i = 0; i < 2000; i++) {
                        await ButtonRegistry_1.BUTTON_REGISTRY.createChapter.execute('justonestory', 'wowbig', `chapter ${i}`, `wow chapter body ${i}`, 'Public');
                    }
                },
            }));
            followButtons.append(createButton({
                name: 'Follows testing',
                async execute() {
                    await ButtonRegistry_1.BUTTON_REGISTRY.getAllFollows.execute('work', 0);
                    await ButtonRegistry_1.BUTTON_REGISTRY.getAllFollows.execute('work', 1);
                    await ButtonRegistry_1.BUTTON_REGISTRY.getAllFollowsMerged.execute(0);
                    await ButtonRegistry_1.BUTTON_REGISTRY.getAllFollowsMerged.execute(1);
                },
            }));
            followButtons.append(createButton({
                name: 'Spam Create Follow Work Test',
                async execute() {
                    await ButtonRegistry_1.BUTTON_REGISTRY.createAuthor.execute('spam create works', 'manyworks');
                    for (let i = 0; i < 100; i++) {
                        await ButtonRegistry_1.BUTTON_REGISTRY.createWork.execute(`rapid story ${i}`, 'aaaaaaaaa', 'rapid story aaaaa', `rapidstory${i}`, 'Ongoing', 'Public');
                        await ButtonRegistry_1.BUTTON_REGISTRY.follow.execute('work', `rapidstory${i}`);
                    }
                },
            }));
            followButtons.append(createButton({
                name: 'Test Ignore Endpoints',
                async execute() {
                    await ButtonRegistry_1.BUTTON_REGISTRY.createAuthor.execute('ignoring myself', 'ignorepls');
                    await ButtonRegistry_1.BUTTON_REGISTRY.createWork.execute('to ignore', 'testing ignoring', 'test ignoring', 'worktoignore', 'Ongoing', 'Public');
                    await ButtonRegistry_1.BUTTON_REGISTRY.ignore.execute('author', 'ignorepls');
                    await ButtonRegistry_1.BUTTON_REGISTRY.ignore.execute('work', 'worktoignore');
                    await ButtonRegistry_1.BUTTON_REGISTRY.getIgnore.execute('author', 'ignorepls');
                    await ButtonRegistry_1.BUTTON_REGISTRY.getIgnore.execute('author', 'ignorepls');
                    await ButtonRegistry_1.BUTTON_REGISTRY.getIgnore.execute('work', 'worktoignore');
                    await ButtonRegistry_1.BUTTON_REGISTRY.getIgnore.execute('work', 'worktoignore');
                    await ButtonRegistry_1.BUTTON_REGISTRY.getAllIgnores.execute('author');
                    await ButtonRegistry_1.BUTTON_REGISTRY.getAllIgnores.execute('author');
                    await ButtonRegistry_1.BUTTON_REGISTRY.getAllIgnores.execute('work');
                    await ButtonRegistry_1.BUTTON_REGISTRY.getAllIgnoresMerged.execute();
                    await ButtonRegistry_1.BUTTON_REGISTRY.getAllIgnoresMerged.execute();
                },
            }));
            const privRoleButtons = Block().appendTo(view);
            privRoleButtons.append(createButton({
                name: 'privileges initial test',
                async execute() {
                    await ButtonRegistry_1.BUTTON_REGISTRY.privilegeGrantAuthor.execute('somanystories', 'WorkViewPrivate', 'PrivilegeViewAuthor');
                    await ButtonRegistry_1.BUTTON_REGISTRY.privilegeGetAllAuthor.execute('privileges of somanystories', 'somanystories');
                    await ButtonRegistry_1.BUTTON_REGISTRY.privilegeRevokeAuthor.execute('somanystories', 'WorkViewPrivate');
                    await ButtonRegistry_1.BUTTON_REGISTRY.privilegeGrantAuthor.execute('somanystories', 'RevokePrivilege');
                    await ButtonRegistry_1.BUTTON_REGISTRY.privilegeRevokeAuthor.execute('somanystories', 'WorkViewPrivate');
                    await ButtonRegistry_1.BUTTON_REGISTRY.privilegeGrantAuthor.execute('somanystories', 'ThisPrivilegeDoesntExist');
                    await ButtonRegistry_1.BUTTON_REGISTRY.privilegeGetAllAuthor.execute('privileges of somanystories', 'somanystories');
                },
            }));
            privRoleButtons.append(createButton({
                name: 'grant privs for testing',
                async execute() {
                    await ButtonRegistry_1.BUTTON_REGISTRY.privilegeGrantAuthor.execute('somanystories', 'PrivilegeRevoke', 'RoleCreate', 'RoleEdit', 'RoleDelete', 'RoleGrant', 'RoleRevoke', 'PrivilegeViewAuthor', 'RoleViewAll');
                    await ButtonRegistry_1.BUTTON_REGISTRY.createRole.execute('TestingRevoke', 'Visible');
                    await ButtonRegistry_1.BUTTON_REGISTRY.grantRoleToAuthor.execute('TestingRevoke', 'somanystories');
                    await ButtonRegistry_1.BUTTON_REGISTRY.revokeRoleFromAuthor.execute('TestingRevoke', 'somanystories');
                    await ButtonRegistry_1.BUTTON_REGISTRY.privilegeGrantRole.execute('TestingRevoke', 'ViewAllRoles');
                    await ButtonRegistry_1.BUTTON_REGISTRY.privilegeRevokeRole.execute('TestingRevoke', 'ViewAllRoles');
                    await ButtonRegistry_1.BUTTON_REGISTRY.deleteRole.execute('TestingRevoke');
                    await ButtonRegistry_1.BUTTON_REGISTRY.createRole.execute('SecondAuthorRole', 'Visible');
                    await ButtonRegistry_1.BUTTON_REGISTRY.grantRoleToAuthor.execute('SecondAuthorRole', 'justonestory');
                    await ButtonRegistry_1.BUTTON_REGISTRY.privilegeGrantRole.execute('SecondAuthorRole', 'RoleEdit', 'RoleDelete', 'RoleCreate');
                    // await BUTTON_REGISTRY.privilegeGrantAuthor.execute("justonestory", "ViewPrivateStories");
                },
            }));
            privRoleButtons.append(createButton({
                name: 'second author test stuff',
                async execute() {
                    await ButtonRegistry_1.BUTTON_REGISTRY.createRole.execute('DontWork', 'Admin');
                    await ButtonRegistry_1.BUTTON_REGISTRY.createRole.execute('DoWork', 'SecondAuthorRole');
                    await ButtonRegistry_1.BUTTON_REGISTRY.editRole.execute('Admin', 'CantDoThis');
                    await ButtonRegistry_1.BUTTON_REGISTRY.deleteRole.execute('SecondAuthorRole');
                },
            }));
            privRoleButtons.append(createButton({
                name: 'see highest level',
                async execute() {
                    await ButtonRegistry_1.BUTTON_REGISTRY.privilegeGrantAuthor.execute('somanystories', 'RoleViewAll', 'RoleGrant', 'RoleCreate');
                    await ButtonRegistry_1.BUTTON_REGISTRY.createRole.execute('NotTopRole', 'Admin');
                    await ButtonRegistry_1.BUTTON_REGISTRY.grantRoleToAuthor.execute('NotTopRole', 'somanystories');
                    await ButtonRegistry_1.BUTTON_REGISTRY.roleListAll.execute('listing all roles');
                    await ButtonRegistry_1.BUTTON_REGISTRY.roleListAll.execute('listing all roles');
                },
            }));
            privRoleButtons.append(createButton({
                name: 'role reorder test',
                async execute() {
                    await ButtonRegistry_1.BUTTON_REGISTRY.privilegeGrantAuthor.execute('somanystories', 'RoleViewAll', 'RoleGrant', 'RoleCreate');
                    await ButtonRegistry_1.BUTTON_REGISTRY.createRole.execute('Role1', 'Visible', 'Admin');
                    await ButtonRegistry_1.BUTTON_REGISTRY.createRole.execute('Role2', 'Visible', 'Admin');
                    await ButtonRegistry_1.BUTTON_REGISTRY.createRole.execute('Role3', 'Hidden', 'Admin');
                    await ButtonRegistry_1.BUTTON_REGISTRY.createRole.execute('Role4', 'Hidden', 'Admin');
                    await ButtonRegistry_1.BUTTON_REGISTRY.roleReorder.execute('Role1', 'Role2', 'Role3', 'Role4');
                },
            }));
            const moreRoleButtons = Block().appendTo(view);
            moreRoleButtons.append(createButton({
                name: 'Make ten billion works',
                async execute() {
                    await ButtonRegistry_1.BUTTON_REGISTRY.createAuthor.execute('lots of works test', 'manyworks', 'test description');
                    await ButtonRegistry_1.BUTTON_REGISTRY.privilegeGrantAuthor.execute('manyworks', 'TagGlobalCreate', 'TagGlobalDelete', 'TagGlobalUpdate', 'TagCategoryCreate', 'TagCategoryUpdate', 'TagCategoryDelete', 'TagPromote', 'TagDemote');
                    await ButtonRegistry_1.BUTTON_REGISTRY.tagCreateCategory.execute('Category One', 'the first test category');
                    await ButtonRegistry_1.BUTTON_REGISTRY.tagCreateCategory.execute('Category Two', 'the second test category');
                    await ButtonRegistry_1.BUTTON_REGISTRY.tagCreateCategory.execute('Category Three', 'the third test category');
                    await ButtonRegistry_1.BUTTON_REGISTRY.tagCreateGlobal.execute('Tag One', 'test tag 1', 'Category One');
                    await ButtonRegistry_1.BUTTON_REGISTRY.tagCreateGlobal.execute('Tag Two', 'test tag 1', 'Category Two');
                    await ButtonRegistry_1.BUTTON_REGISTRY.tagCreateGlobal.execute('Tag Three', 'test tag 1', 'Category Three');
                    for (let a = 0; a < 333; a++) {
                        await ButtonRegistry_1.BUTTON_REGISTRY.createWork.execute(`work${a}`, `description no ${a} mentions <mention vanity="manyworks">\n"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."`, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit,', `testwork${a}`, 'Ongoing', 'Public', ['Category One: Tag One', 'Category Two: Tag Two', 'Category Three: Tag Three'], ['custom tag one', `custom tag two ${a}`]);
                    }
                    for (let a = 0; a < 333; a++) {
                        await ButtonRegistry_1.BUTTON_REGISTRY.createChapter.execute('manyworks', `testwork${a}`, `chapter ${a}`, `it's a test chapter ${a}`, 'Public');
                    }
                },
            }));
            moreRoleButtons.append(createButton({
                name: 'view ten billion works',
                async execute() {
                    await ButtonRegistry_1.BUTTON_REGISTRY.getAllWorksByAuthor.execute('many works', 'manyworks');
                },
            }));
            moreRoleButtons.append(createButton({
                name: 'admin list roles test (profile 1)',
                async execute() {
                    await ButtonRegistry_1.BUTTON_REGISTRY.privilegeGrantAuthor.execute('somanystories', 'RoleGrant', 'RoleCreate');
                    await ButtonRegistry_1.BUTTON_REGISTRY.createRole.execute('Role4', 'Hidden', 'Admin');
                    await ButtonRegistry_1.BUTTON_REGISTRY.createRole.execute('Role3', 'Visible', 'Admin');
                    await ButtonRegistry_1.BUTTON_REGISTRY.createRole.execute('Role2', 'Hidden', 'Admin');
                    await ButtonRegistry_1.BUTTON_REGISTRY.createRole.execute('Role1', 'Visible', 'Admin');
                    await ButtonRegistry_1.BUTTON_REGISTRY.grantRoleToAuthor.execute('Role2', 'justonestory');
                    await ButtonRegistry_1.BUTTON_REGISTRY.roleListAll.execute('all roles admin');
                },
            }));
            moreRoleButtons.append(createButton({
                name: 'user list roles test (profile 2)',
                async execute() {
                    await ButtonRegistry_1.BUTTON_REGISTRY.roleListAll.execute('all roles user');
                },
            }));
            moreRoleButtons.append(createButton({
                name: 'Delete Author Test',
                async execute() {
                    await ButtonRegistry_1.BUTTON_REGISTRY.deleteAuthor.execute();
                },
            }));
            const commentsButton = Block().appendTo(view);
            commentsButton.append(createButton({
                name: 'Author 2 lots of comments',
                async execute() {
                    await ButtonRegistry_1.BUTTON_REGISTRY.createCommentChapter.execute('justonestory', 'bigstory', '1', 'base comments 1');
                    await ButtonRegistry_1.BUTTON_REGISTRY.createCommentChapter.execute('justonestory', 'bigstory', '2', 'base comments 2');
                    await ButtonRegistry_1.BUTTON_REGISTRY.createCommentChapter.execute('justonestory', 'bigstory', '3', 'base comments 3');
                    await ButtonRegistry_1.BUTTON_REGISTRY.createCommentChapter.execute('justonestory', 'bigstory', '4', 'base comments 4');
                    await ButtonRegistry_1.BUTTON_REGISTRY.createCommentChapter.execute('justonestory', 'bigstory', '5', 'base comments 5');
                    await ButtonRegistry_1.BUTTON_REGISTRY.createCommentChapter.execute('justonestory', 'bigstory', '1', 'child comment <mention vanity="justonestory">', '6');
                    await ButtonRegistry_1.BUTTON_REGISTRY.createCommentChapter.execute('justonestory', 'bigstory', '1', 'child comment 2', '6');
                    await ButtonRegistry_1.BUTTON_REGISTRY.createCommentChapter.execute('justonestory', 'bigstory', '1', 'child comment 3<mention vanity="justonestory">', '11');
                    await ButtonRegistry_1.BUTTON_REGISTRY.createCommentChapter.execute('justonestory', 'bigstory', '1', 'child comment 4<mention vanity="justonestory">', '12');
                    await ButtonRegistry_1.BUTTON_REGISTRY.createCommentChapter.execute('justonestory', 'bigstory', '1', 'base comment index 1');
                    await ButtonRegistry_1.BUTTON_REGISTRY.createCommentChapter.execute('justonestory', 'bigstory', '1', 'child comment 6', '13');
                    await ButtonRegistry_1.BUTTON_REGISTRY.createCommentChapter.execute('justonestory', 'bigstory', '1', 'child comment 7', '11');
                    await ButtonRegistry_1.BUTTON_REGISTRY.createCommentChapter.execute('justonestory', 'bigstory', '1', 'base comment index 1 again');
                    await ButtonRegistry_1.BUTTON_REGISTRY.getAllComments.execute('justonestory', 'bigstory', '1');
                    await ButtonRegistry_1.BUTTON_REGISTRY.getComment.execute('1', 'get comment');
                },
            }));
            commentsButton.append(createButton({
                name: 'Author 2 just get comments',
                async execute() {
                    await ButtonRegistry_1.BUTTON_REGISTRY.getAllComments.execute('justonestory', 'bigstory', '1');
                },
            }));
            commentsButton.append(createButton({
                name: 'Author 1 single comment ping',
                async execute() {
                    await ButtonRegistry_1.BUTTON_REGISTRY.createCommentChapter.execute('somanystories', 'debut', '1', 'wow you write so many stories @somanystories how do you do it');
                    await ButtonRegistry_1.BUTTON_REGISTRY.createCommentChapter.execute('somanystories', 'debut', '1', '@somanystories you\'re so @somanystories amazing');
                    await ButtonRegistry_1.BUTTON_REGISTRY.getComment.execute('4');
                    await ButtonRegistry_1.BUTTON_REGISTRY.getComment.execute('5');
                    await ButtonRegistry_1.BUTTON_REGISTRY.updateCommentChapter.execute('4', 'okay done fawning over @somanystories now');
                    await ButtonRegistry_1.BUTTON_REGISTRY.getComment.execute('4');
                    await ButtonRegistry_1.BUTTON_REGISTRY.deleteCommentChapter.execute('5');
                    await ButtonRegistry_1.BUTTON_REGISTRY.getComment.execute('5');
                },
            }));
            commentsButton.append(createButton({
                name: 'try to delete author 1\'s comment',
                async execute() {
                    await ButtonRegistry_1.BUTTON_REGISTRY.deleteCommentChapter.execute('4');
                    await ButtonRegistry_1.BUTTON_REGISTRY.getComment.execute('4');
                },
            }));
            const patreonButtons = Block().appendTo(view);
            (0, Button_16.default)()
                .text.set('Campaign Test')
                .event.subscribe('click', async () => {
                await (0, Popup_2.default)('Campaign OAuth', `${Env_8.default.API_ORIGIN}auth/patreon/campaign/begin`, 600, 900)
                    .then(() => true).catch(err => { console.warn(err); return false; });
                await Session_13.default.refresh();
            })
                .appendTo(patreonButtons);
            patreonButtons.append(createButton({
                name: 'create patreon author',
                async execute() {
                    await ButtonRegistry_1.BUTTON_REGISTRY.createAuthor.execute('has a campaign', 'patreonuser');
                    await ButtonRegistry_1.BUTTON_REGISTRY.createWork.execute('patreon only story', 'test', 'short description test', 'exclusive', 'Ongoing', 'Public');
                    await ButtonRegistry_1.BUTTON_REGISTRY.createChapter.execute('patreonuser', 'exclusive', 'chapter 1', 'hewwo', 'Private');
                    await ButtonRegistry_1.BUTTON_REGISTRY.createChapter.execute('patreonuser', 'exclusive', 'chapter 2', 'hewwoo', 'Private');
                    await ButtonRegistry_1.BUTTON_REGISTRY.createChapter.execute('patreonuser', 'exclusive', 'chapter 3', 'hewwooo', 'Private');
                    await ButtonRegistry_1.BUTTON_REGISTRY.createChapter.execute('patreonuser', 'exclusive', 'chapter 4', 'hewwooo', 'Private');
                    await ButtonRegistry_1.BUTTON_REGISTRY.createChapter.execute('patreonuser', 'exclusive', 'chapter 5', 'hewwooo', 'Private');
                },
            }));
            patreonButtons.append(createButton({
                name: 'get patreon tiers',
                async execute() {
                    await ButtonRegistry_1.BUTTON_REGISTRY.patreonGetTiers.execute('patreon tiers');
                    await ButtonRegistry_1.BUTTON_REGISTRY.patreonGetTiers.execute('patreon tiers');
                },
            }));
            patreonButtons.append(createButton({
                name: 'set patreon chapters',
                async execute() {
                    await ButtonRegistry_1.BUTTON_REGISTRY.updateChapter.execute('patreonuser', 'exclusive', 1, undefined, undefined, 'Public');
                    await ButtonRegistry_1.BUTTON_REGISTRY.patreonSetThresholds.execute('patreonuser', 'exclusive', 'Public', ['2', '3']);
                    await ButtonRegistry_1.BUTTON_REGISTRY.patreonSetThresholds.execute('patreonuser', 'exclusive', 'Patreon', ['4', '5'], '4392761');
                },
            }));
            (0, Button_16.default)()
                .text.set('Patron Test')
                .event.subscribe('click', async () => {
                await (0, Popup_2.default)('Patron OAuth', `${Env_8.default.API_ORIGIN}auth/patreon/patron/begin`, 600, 900)
                    .then(() => true).catch(err => { console.warn(err); return false; });
                await Session_13.default.refresh();
            })
                .appendTo(patreonButtons);
            patreonButtons.append(createButton({
                name: 'get patreon-only chapters',
                async execute() {
                    await ButtonRegistry_1.BUTTON_REGISTRY.viewChapter.execute('public:', 'patreonuser', 'exclusive', 3);
                    await ButtonRegistry_1.BUTTON_REGISTRY.viewChapter.execute('public:', 'patreonuser', 'exclusive', 3);
                    await ButtonRegistry_1.BUTTON_REGISTRY.viewChapter.execute('patreon:', 'patreonuser', 'exclusive', 4);
                    await ButtonRegistry_1.BUTTON_REGISTRY.viewChapter.execute('patreon:', 'patreonuser', 'exclusive', 4);
                },
            }));
            patreonButtons.append(createButton({
                name: 'update patreon-only chapters',
                async execute() {
                    await ButtonRegistry_1.BUTTON_REGISTRY.patreonSetThresholds.execute('patreonuser', 'exclusive', 'Public', ['4']);
                },
            }));
            const tagButtons = Block().appendTo(view);
            tagButtons.append(createButton({
                name: 'Create Tag Author',
                async execute() {
                    await ButtonRegistry_1.BUTTON_REGISTRY.createAuthor.execute('tagging test', 'thetagger', 'test description');
                    await ButtonRegistry_1.BUTTON_REGISTRY.privilegeGrantAuthor.execute('thetagger', 'TagGlobalCreate', 'TagGlobalDelete', 'TagGlobalUpdate', 'TagCategoryCreate', 'TagCategoryUpdate', 'TagCategoryDelete', 'TagPromote', 'TagDemote');
                },
            }));
            tagButtons.append(createButton({
                name: 'Update Tag Author',
                async execute() {
                    await ButtonRegistry_1.BUTTON_REGISTRY.viewAuthor.execute('view post-update', 'thetagger');
                    await ButtonRegistry_1.BUTTON_REGISTRY.viewAuthor.execute('view post-update', 'thetagger');
                    await ButtonRegistry_1.BUTTON_REGISTRY.updateAuthor.execute('the tagger 2', 'wow i\'m <mention vanity="thetagger">');
                    await ButtonRegistry_1.BUTTON_REGISTRY.viewAuthor.execute('view post-update', 'thetagger');
                    await ButtonRegistry_1.BUTTON_REGISTRY.viewAuthor.execute('view post-update', 'thetagger');
                },
            }));
            tagButtons.append(createButton({
                name: 'Tag Create Test',
                async execute() {
                    await ButtonRegistry_1.BUTTON_REGISTRY.tagCreateCategory.execute('Category One', 'the first test category');
                    await ButtonRegistry_1.BUTTON_REGISTRY.tagCreateCategory.execute('Category Two', 'the second test category');
                    await ButtonRegistry_1.BUTTON_REGISTRY.tagCreateCategory.execute('Category Three', 'the third test category');
                    await ButtonRegistry_1.BUTTON_REGISTRY.tagCreateGlobal.execute('Tag One', 'test tag 1 <mention vanity="thetagger">', 'Category One');
                    await ButtonRegistry_1.BUTTON_REGISTRY.tagUpdateGlobal.execute('Category One: Tag One', 'Tag One Updated', 'test tag 1 updated', 'Category Two');
                    await ButtonRegistry_1.BUTTON_REGISTRY.tagUpdateCategory.execute('Category One', 'Category One Updated', 'first test category updated');
                    await ButtonRegistry_1.BUTTON_REGISTRY.tagRemoveCategory.execute('Category One Updated');
                    await ButtonRegistry_1.BUTTON_REGISTRY.tagRemoveGlobal.execute('Category Two: Tag One Updated');
                    await ButtonRegistry_1.BUTTON_REGISTRY.tagCreateGlobal.execute('tag conflict', 'conflicting', 'Category Two');
                    await ButtonRegistry_1.BUTTON_REGISTRY.tagCreateGlobal.execute('tag conflict', 'conflicting', 'Category Three');
                    await ButtonRegistry_1.BUTTON_REGISTRY.tagUpdateGlobal.execute('Category Three: tag conflict', undefined, undefined, 'Category Two');
                },
            }));
            tagButtons.append(createButton({
                name: 'Work Tag Test',
                async execute() {
                    await ButtonRegistry_1.BUTTON_REGISTRY.tagCreateGlobal.execute('Tag Two', 'test tag 2', 'Category Two');
                    await ButtonRegistry_1.BUTTON_REGISTRY.tagCreateGlobal.execute('Tag Three', 'test tag 2', 'Category Two');
                    await ButtonRegistry_1.BUTTON_REGISTRY.tagCreateGlobal.execute('Tag Four', 'test tag 2', 'Category Two');
                    await ButtonRegistry_1.BUTTON_REGISTRY.createWork.execute('Tag Test Work', 'test', 'desc test', 'testwork', 'Ongoing', 'Public', ['Category Two: Tag Two', 'Category Two: Tag Three'], ['custom tag 1', 'custom tag 2']);
                    await ButtonRegistry_1.BUTTON_REGISTRY.createWork.execute('Tag Test Work Two', 'test2', 'desc test', 'testworktwo', 'Ongoing', 'Public', ['Category Two: Tag Two', 'Category Two: Tag Three'], ['custom tag 2', 'custom tag 3']);
                    await ButtonRegistry_1.BUTTON_REGISTRY.viewWork.execute('work view 1', 'thetagger', 'testworktwo');
                    await ButtonRegistry_1.BUTTON_REGISTRY.viewWork.execute('work view 2', 'thetagger', 'testworktwo');
                    await ButtonRegistry_1.BUTTON_REGISTRY.updateWork.execute('thetagger', 'testworktwo', 'Test Work Two Updated');
                    await ButtonRegistry_1.BUTTON_REGISTRY.viewWork.execute('work view 3', 'thetagger', 'testworktwo');
                    await ButtonRegistry_1.BUTTON_REGISTRY.viewWork.execute('work view 4', 'thetagger', 'testworktwo');
                    await ButtonRegistry_1.BUTTON_REGISTRY.getAllWorksByAuthor.execute('all works', 'thetagger');
                },
            }));
            tagButtons.append(createButton({
                name: 'Chapter Tag Test',
                async execute() {
                    await ButtonRegistry_1.BUTTON_REGISTRY.createChapter.execute('thetagger', 'testworktwo', 'test chapter', 'test chapter body', 'Public', true, undefined, undefined, ['Category Two: Tag Two', 'Category Two: Tag Three'], ['custom tag 2', 'custom tag 3', 'custom tag 4']);
                    await ButtonRegistry_1.BUTTON_REGISTRY.viewChapter.execute('chapter', 'thetagger', 'testworktwo', 1);
                },
            }));
            tagButtons.append(createButton({
                name: 'Tag Promote/Demote',
                async execute() {
                    await ButtonRegistry_1.BUTTON_REGISTRY.tagPromoteCustom.execute('custom tag 1', 'test description', 'Category Two');
                    await ButtonRegistry_1.BUTTON_REGISTRY.tagDemoteGlobal.execute('Category Two: Tag Three');
                    await ButtonRegistry_1.BUTTON_REGISTRY.viewWork.execute('work view 3', 'thetagger', 'testwork');
                    await ButtonRegistry_1.BUTTON_REGISTRY.viewWork.execute('work view 4', 'thetagger', 'testworktwo');
                },
            }));
            tagButtons.append(createButton({
                name: 'manifest test',
                async execute() {
                    await ButtonRegistry_1.BUTTON_REGISTRY.tagGetManifest.execute();
                },
            }));
            tagButtons.append(createButton({
                name: 'manifest test 2',
                async execute() {
                    await ButtonRegistry_1.BUTTON_REGISTRY.tagCreateGlobal.execute('extra tag', 'wow', 'Category Three');
                    await ButtonRegistry_1.BUTTON_REGISTRY.tagGetManifest.execute();
                },
            }));
            tagButtons.append(createButton({
                name: 'form length manifest',
                async execute() {
                    await ButtonRegistry_1.BUTTON_REGISTRY.manifestFormLengthGet.execute();
                },
            }));
            const notifButtons = Block().appendTo(view);
            notifButtons.append(createButton({
                name: 'Get Notifications',
                async execute() {
                    await ButtonRegistry_1.BUTTON_REGISTRY.notificationsGet.execute();
                    await ButtonRegistry_1.BUTTON_REGISTRY.notificationsGetUnread.execute();
                },
            }));
            notifButtons.append(createButton({
                name: 'Mark Notifications Read',
                async execute() {
                    await ButtonRegistry_1.BUTTON_REGISTRY.notificationsMark.execute('read', ['ba397c1b-02e5-462c-b367-04b007d1f09a', 'd8830a0c-3e2c-4caa-ae4b-679a8c5cefa5']);
                    await ButtonRegistry_1.BUTTON_REGISTRY.notificationsMark.execute('unread', ['ba397c1b-02e5-462c-b367-04b007d1f09a', '3b9781ea-d15d-4915-bbeb-4788ed734453']);
                },
            }));
            notifButtons.append(createButton({
                name: 'Get Front Page Feed',
                async execute() {
                    await ButtonRegistry_1.BUTTON_REGISTRY.feedGet.execute();
                },
            }));
            return view;
        },
    });
});
define("endpoint/feed/EndpointFeedGet", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_26) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_26 = __importDefault(Endpoint_26);
    exports.default = (0, Endpoint_26.default)('/feed/get', 'get');
});
define("ui/view/FeedView", ["require", "exports", "endpoint/feed/EndpointFeedGet", "ui/Component", "ui/component/core/Link", "ui/component/core/Paginator", "ui/component/Work", "ui/view/shared/component/View", "ui/view/shared/component/ViewDefinition"], function (require, exports, EndpointFeedGet_1, Component_51, Link_6, Paginator_3, Work_3, View_7, ViewDefinition_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    EndpointFeedGet_1 = __importDefault(EndpointFeedGet_1);
    Component_51 = __importDefault(Component_51);
    Link_6 = __importDefault(Link_6);
    Paginator_3 = __importDefault(Paginator_3);
    Work_3 = __importDefault(Work_3);
    View_7 = __importDefault(View_7);
    ViewDefinition_6 = __importDefault(ViewDefinition_6);
    exports.default = (0, ViewDefinition_6.default)({
        create: async () => {
            const view = (0, View_7.default)('feed');
            const paginator = (0, Paginator_3.default)()
                .viewTransition('author-view-feed')
                .type('flush')
                .tweak(p => p.title.text.use('view/feed/main/title'))
                .appendTo(view);
            const endpoint = EndpointFeedGet_1.default.prep().setPageSize(3);
            await paginator.useEndpoint(endpoint, (slot, { works, authors }) => {
                for (const workData of works) {
                    const author = authors.find(author => author.vanity === workData.author);
                    (0, Link_6.default)(author && `/work/${author.vanity}/${workData.vanity}`)
                        .and(Work_3.default, workData, author, true)
                        .viewTransition()
                        .appendTo(slot);
                }
            });
            paginator.orElse(slot => (0, Component_51.default)()
                .style('placeholder')
                .text.use('view/feed/content/empty')
                .appendTo(slot));
            return view;
        },
    });
});
define("ui/view/HomeView", ["require", "exports", "markdown-it", "ui/Component", "ui/component/core/Block", "ui/component/core/TextEditor", "ui/view/shared/component/View", "ui/view/shared/component/ViewDefinition", "utility/Env", "utility/string/MarkdownItHTML"], function (require, exports, markdown_it_2, Component_52, Block_11, TextEditor_4, View_8, ViewDefinition_7, Env_9, MarkdownItHTML_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    markdown_it_2 = __importDefault(markdown_it_2);
    Component_52 = __importDefault(Component_52);
    Block_11 = __importDefault(Block_11);
    TextEditor_4 = __importDefault(TextEditor_4);
    View_8 = __importDefault(View_8);
    ViewDefinition_7 = __importDefault(ViewDefinition_7);
    Env_9 = __importDefault(Env_9);
    MarkdownItHTML_2 = __importDefault(MarkdownItHTML_2);
    exports.default = (0, ViewDefinition_7.default)({
        create: () => {
            const view = (0, View_8.default)('home');
            const block = (0, Block_11.default)().appendTo(view);
            block.title.text.set('Test the text editor');
            block.description.text.set('fluff4.me is still a work-in-progress. In the meantime, feel free to play with this!');
            // const form = block.and(Form, block.title)
            (0, TextEditor_4.default)()
                .appendTo(block.content);
            if (Env_9.default.isDev) {
                (0, Component_52.default)('br').appendTo(block.content);
                const output = (0, Component_52.default)('div');
                (0, Component_52.default)('div')
                    .attributes.set('contenteditable', 'plaintext-only')
                    .style.setProperty('white-space', 'pre-wrap')
                    .style.setProperty('font', 'inherit')
                    .style.setProperty('background', '#222')
                    .style.setProperty('width', '100%')
                    .style.setProperty('height', '400px')
                    .style.setProperty('padding', '0.5em')
                    .style.setProperty('box-sizing', 'border-box')
                    .event.subscribe('input', event => {
                    const text = event.component.element.textContent ?? '';
                    const md = new markdown_it_2.default('commonmark', { html: true, breaks: true });
                    MarkdownItHTML_2.default.use(md, MarkdownItHTML_2.default.Options()
                        .disallowTags('img', 'figure', 'figcaption', 'map', 'area'));
                    console.log(md.parse(text, {}));
                    output.element.innerHTML = md.render(text);
                })
                    .appendTo(block.content);
                output
                    .style.setProperty('font', 'inherit')
                    .style.setProperty('background', '#222')
                    .style.setProperty('width', '100%')
                    .style.setProperty('padding', '0.5em')
                    .style.setProperty('margin-top', '1em')
                    .style.setProperty('box-sizing', 'border-box')
                    .appendTo(block.content);
            }
            return view;
        },
    });
});
define("endpoint/notification/EndpointNotificationGetAll", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_27) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_27 = __importDefault(Endpoint_27);
    exports.default = (0, Endpoint_27.default)('/notifications/get/all', 'get');
});
define("endpoint/notification/EndpointNotificationMarkRead", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_28) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_28 = __importDefault(Endpoint_28);
    exports.default = (0, Endpoint_28.default)('/notifications/mark/read', 'post');
});
define("endpoint/notification/EndpointNotificationMarkUnread", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_29) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_29 = __importDefault(Endpoint_29);
    exports.default = (0, Endpoint_29.default)('/notifications/mark/unread', 'post');
});
define("ui/component/Notification", ["require", "exports", "endpoint/notification/EndpointNotificationMarkRead", "endpoint/notification/EndpointNotificationMarkUnread", "lang/en-nz", "ui/Component", "ui/component/core/Button", "ui/component/core/Link", "ui/component/core/Timestamp", "utility/State"], function (require, exports, EndpointNotificationMarkRead_1, EndpointNotificationMarkUnread_1, en_nz_11, Component_53, Button_17, Link_7, Timestamp_3, State_35) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    EndpointNotificationMarkRead_1 = __importDefault(EndpointNotificationMarkRead_1);
    EndpointNotificationMarkUnread_1 = __importDefault(EndpointNotificationMarkUnread_1);
    en_nz_11 = __importDefault(en_nz_11);
    Component_53 = __importDefault(Component_53);
    Button_17 = __importDefault(Button_17);
    Link_7 = __importDefault(Link_7);
    Timestamp_3 = __importDefault(Timestamp_3);
    State_35 = __importDefault(State_35);
    const notificationQuilt = en_nz_11.default;
    const Notification = Component_53.default.Builder('a', (component, data) => {
        const translationFunction = notificationQuilt[`notification/${data.type}`];
        if (!translationFunction)
            return undefined;
        const read = (0, State_35.default)(data.read);
        const notification = component
            .style('notification')
            .style.bind(read, 'notification--read');
        const TRIGGERED_BY = !data.triggered_by ? undefined : (0, Link_7.default)(`/author/${data.triggered_by.vanity}`).text.set(data.triggered_by.name);
        const AUTHOR = !data.author ? undefined : (0, Link_7.default)(`/author/${data.author.vanity}`).text.set(data.author.name);
        const WORK = !data.author || !data.work ? undefined : (0, Link_7.default)(`/work/${data.author.vanity}/${data.work.vanity}`).text.set(data.work.name);
        const CHAPTER = !data.author || !data.work || !data.chapter ? undefined : (0, Link_7.default)(`/work/${data.author.vanity}/${data.work.vanity}/chapter/${data.chapter.url}`).text.set(data.chapter.name);
        const justMarkedUnread = (0, State_35.default)(false);
        const readButton = (0, Button_17.default)()
            .setIcon('check')
            .style('notification-read-button')
            .style.bind(read, 'notification-read-button--read')
            .style.bind(justMarkedUnread, 'notification-read-button--just-marked-unread')
            .event.subscribe('click', async (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();
            const endpoint = read.value ? EndpointNotificationMarkUnread_1.default : EndpointNotificationMarkRead_1.default;
            const response = await endpoint.query({ body: { notification_ids: [data.id] } });
            if (toast.handleError(response))
                return;
            read.value = !read.value;
            if (!read.value) {
                justMarkedUnread.value = true;
                readButton.hoveredOrFocused.await(component, false, () => justMarkedUnread.value = false);
            }
        })
            .appendTo(notification);
        (0, Component_53.default)()
            .style('notification-label')
            .append((0, Component_53.default)().text.set(translationFunction?.({ TRIGGERED_BY, AUTHOR, WORK, CHAPTER })), document.createTextNode('   '), (0, Timestamp_3.default)(data.created_time).style('notification-timestamp'))
            .appendTo(notification);
        if (data.comment) {
            (0, Component_53.default)()
                .style('markdown')
                .append((0, Component_53.default)('blockquote')
                .style('notification-comment')
                .setMarkdownContent(data.comment.body?.body ?? '', 64))
                .appendTo(notification);
            if (data.author && data.work && data.chapter)
                notification.and(Link_7.default, `/work/${data.author.vanity}/${data.work.vanity}/chapter/${data.chapter.url}`);
        }
        return notification
            .extend(notification => ({
            readButton,
        }));
    });
    exports.default = Notification;
});
define("ui/component/NotificationList", ["require", "exports", "endpoint/notification/EndpointNotificationMarkRead", "ui/Component", "ui/component/core/Button", "ui/component/core/Paginator", "ui/component/Notification"], function (require, exports, EndpointNotificationMarkRead_2, Component_54, Button_18, Paginator_4, Notification_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    EndpointNotificationMarkRead_2 = __importDefault(EndpointNotificationMarkRead_2);
    Component_54 = __importDefault(Component_54);
    Button_18 = __importDefault(Button_18);
    Paginator_4 = __importDefault(Paginator_4);
    Notification_1 = __importDefault(Notification_1);
    const NotificationList = Component_54.default.Builder(async (component, query, initialNotifications) => {
        const list = component
            .and(Paginator_4.default)
            .style('notification-list')
            .extend(list => ({}));
        (0, Button_18.default)()
            .setIcon('check-double')
            .event.subscribe('click', async () => {
            const notifs = list.data.value;
            const response = await EndpointNotificationMarkRead_2.default.query({ body: { notification_ids: notifs.map(n => n.id) } });
            if (toast.handleError(response))
                return;
            // TODO figure out how to update render
        })
            .appendTo(list.primaryActions);
        list.header.style('notification-list-header');
        list.title.style('notification-list-title')
            .text.use('masthead/user/notifications/title');
        list.content.style('notification-list-content');
        list.footer.style('notification-list-footer');
        if (initialNotifications)
            await list.useInitial(initialNotifications, 0, true).thenUse(query).withContent(initialiseNotificationsPage);
        else
            await list.useEndpoint(query, initialiseNotificationsPage);
        return list;
        function initialiseNotificationsPage(slot, notifications) {
            slot.style('notification-list-page');
            for (const notification of notifications) {
                (0, Notification_1.default)(notification)
                    ?.appendTo(slot);
            }
        }
    });
    exports.default = NotificationList;
});
define("ui/view/NotificationsView", ["require", "exports", "endpoint/notification/EndpointNotificationGetAll", "ui/component/NotificationList", "ui/view/shared/component/View", "ui/view/shared/component/ViewDefinition"], function (require, exports, EndpointNotificationGetAll_1, NotificationList_1, View_9, ViewDefinition_8) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    EndpointNotificationGetAll_1 = __importDefault(EndpointNotificationGetAll_1);
    NotificationList_1 = __importDefault(NotificationList_1);
    View_9 = __importDefault(View_9);
    ViewDefinition_8 = __importDefault(ViewDefinition_8);
    exports.default = (0, ViewDefinition_8.default)({
        create: async () => {
            const view = (0, View_9.default)('notifications');
            const list = await (0, NotificationList_1.default)(EndpointNotificationGetAll_1.default.prep());
            list.appendTo(view);
            return view;
        },
    });
});
define("ui/view/TagView", ["require", "exports", "model/Tags", "ui/view/shared/component/View", "ui/view/shared/component/ViewDefinition", "utility/Errors"], function (require, exports, Tags_2, View_10, ViewDefinition_9, Errors_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Tags_2 = __importDefault(Tags_2);
    View_10 = __importDefault(View_10);
    ViewDefinition_9 = __importDefault(ViewDefinition_9);
    Errors_2 = __importDefault(Errors_2);
    const fromURLRegex = /(-|^)(.)/g;
    const fromURL = (name) => name.replaceAll(fromURLRegex, (_, dash, char) => `${dash ? ' ' : ''}${char.toUpperCase()}`);
    exports.default = (0, ViewDefinition_9.default)({
        create: async (params) => {
            const view = (0, View_10.default)('tag');
            const tag = params.custom_name ?? await Tags_2.default.resolve(fromURL(params.category), fromURL(params.name));
            if (!tag)
                throw Errors_2.default.NotFound();
            return view;
        },
    });
});
define("endpoint/work/EndpointWorkDelete", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_30) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_30 = __importDefault(Endpoint_30);
    exports.default = (0, Endpoint_30.default)('/work/{author}/{vanity}/delete', 'post');
});
define("endpoint/work/EndpointWorkCreate", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_31) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_31 = __importDefault(Endpoint_31);
    exports.default = (0, Endpoint_31.default)('/work/create', 'post');
});
define("endpoint/work/EndpointWorkUpdate", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_32) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_32 = __importDefault(Endpoint_32);
    exports.default = (0, Endpoint_32.default)('/work/{author}/{vanity}/update', 'post');
});
define("ui/component/core/Textarea", ["require", "exports", "lang/en-nz", "ui/Component", "ui/component/core/ext/Input", "ui/utility/StringApplicator", "utility/State"], function (require, exports, en_nz_12, Component_55, Input_4, StringApplicator_7, State_36) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    en_nz_12 = __importDefault(en_nz_12);
    Component_55 = __importDefault(Component_55);
    Input_4 = __importDefault(Input_4);
    StringApplicator_7 = __importDefault(StringApplicator_7);
    State_36 = __importDefault(State_36);
    const Textarea = Component_55.default.Builder((component) => {
        let shouldIgnoreInputEvent = false;
        const contenteditable = (0, Component_55.default)()
            .style('text-input', 'text-area')
            .attributes.set('contenteditable', 'plaintext-only')
            .ariaRole('textbox')
            .attributes.set('aria-multiline', 'true');
        const hiddenInput = (0, Component_55.default)('input')
            .style('text-area-validity-pipe-input')
            .tabIndex('programmatic')
            .attributes.set('type', 'text')
            .setName(`text-area-validity-pipe-input-${Math.random().toString(36).slice(2)}`);
        const state = (0, State_36.default)('');
        const input = component
            .and(Input_4.default)
            .style('text-area-wrapper')
            .pipeValidity(hiddenInput)
            .append(contenteditable, hiddenInput)
            .extend(input => ({
            value: '',
            state,
            default: (0, StringApplicator_7.default)(input, value => {
                if (input.value === '') {
                    input.value = value ?? '';
                    state.value = value ?? '';
                    input.length.asMutable?.setValue(value?.length ?? 0);
                }
            }),
            placeholder: (0, StringApplicator_7.default)(input, value => {
                contenteditable.attributes.set('placeholder', value);
            }),
            ignoreInputEvent: (ignore = true) => {
                shouldIgnoreInputEvent = ignore;
                return input;
            },
            setLabel(label) {
                contenteditable.setName(label?.for);
                contenteditable.setId(label?.for);
                label?.setInput(input);
                contenteditable.ariaLabelledBy(label);
                return input;
            },
        }))
            .extendMagic('value', input => ({
            get: () => contenteditable.element.textContent || '',
            set: (value) => {
                contenteditable.element.textContent = value;
                state.value = value;
                input.length.asMutable?.setValue(value.length);
            },
        }));
        input.length.asMutable?.setValue(0);
        input.onRooted(input => {
            contenteditable.event.subscribe(['input', 'change'], event => {
                if (shouldIgnoreInputEvent)
                    return;
                state.value = input.value;
                input.length.asMutable?.setValue(input.value.length);
                let invalid;
                if ((input.length.value ?? 0) > (input.maxLength.value ?? Infinity))
                    invalid = en_nz_12.default['shared/form/invalid/too-long']();
                input.setCustomInvalidMessage(invalid);
            });
        });
        return input;
    });
    exports.default = Textarea;
});
define("ui/component/core/ext/Sortable", ["require", "exports", "ui/Component", "ui/component/core/ext/Draggable", "utility/Arrays", "utility/maths/Vector2", "utility/State"], function (require, exports, Component_56, Draggable_2, Arrays_6, Vector2_2, State_37) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SortableDefinition = SortableDefinition;
    Component_56 = __importDefault(Component_56);
    Draggable_2 = __importDefault(Draggable_2);
    Vector2_2 = __importDefault(Vector2_2);
    State_37 = __importDefault(State_37);
    function SortableDefinition(definition) {
        return definition;
    }
    const isSortingAnySortable = (0, State_37.default)(false);
    exports.default = Object.assign(Component_56.default.Extension((component, definition) => {
        const sorting = (0, State_37.default)(false);
        const sortDelay = (0, State_37.default)(definition.sortDelay ?? 0);
        const stickyDistance = (0, State_37.default)(definition.stickyDistance ?? 0);
        const order = (0, State_37.default)([]);
        let sortingDraggable;
        let slot;
        const draggableDefinition = {
            stickyDistance, delay: sortDelay,
            onMoveStart, onMove, onMoveEnd,
        };
        for (const child of component.getChildren())
            child
                .and(Draggable_2.default, draggableDefinition)
                .style('sortable-item');
        updateOrder();
        component.event.subscribe('childrenInsert', (event, nodes) => {
            for (const node of nodes)
                if (node !== slot?.element)
                    node.component
                        ?.and(Draggable_2.default, draggableDefinition)
                        .style('sortable-item');
            updateOrder();
        });
        const sortable = component.extend(component => ({
            sorting,
            order,
            setSortDelay(delay) {
                sortDelay.value = delay ?? definition.sortDelay ?? 0;
                return component;
            },
            setStickyDistance(distance) {
                stickyDistance.value = distance ?? definition.stickyDistance ?? 0;
                return component;
            },
            cancel: () => {
                reset(false);
                return component;
            },
        }));
        return sortable;
        function getDraggables() {
            return [...component.getChildren()]
                .map(child => child.as(Draggable_2.default))
                .filter(Arrays_6.NonNullish);
        }
        function updateOrder() {
            order.value = getDraggables()
                .map(definition.getID)
                .filter(Arrays_6.NonNullish);
        }
        function reset(shouldCommit = true) {
            if (!sorting.value)
                return;
            sorting.value = false;
            isSortingAnySortable.value = false;
            const draggable = sortingDraggable;
            sortingDraggable = undefined;
            draggable?.style.remove('sortable-item-sorting')
                .style.removeProperties('position', 'left', 'top');
            draggable?.stopDragging();
            slot?.remove();
            slot = undefined;
            if (shouldCommit)
                updateOrder();
        }
        function onMoveStart(draggable, position) {
            const id = definition.getID(draggable);
            if (id === undefined) {
                console.warn('Failed to begin sorting, draggable without ID');
                return false;
            }
            draggable.style('sortable-item-sorting')
                .style.setProperty('position', 'fixed')
                .style.setProperty('z-index', 999999999);
            sortingDraggable = draggable;
            isSortingAnySortable.value = true;
            onMove(draggable, Vector2_2.default.ZERO, position);
            sorting.value = true;
        }
        function onMove(draggable, offset, position) {
            const rect = draggable.rect.value;
            draggable.style.setProperty('left', `${position.x - rect.width / 2}px`);
            draggable.style.setProperty('top', `${position.y - rect.height / 2}px`);
            sort(draggable, position);
        }
        function onMoveEnd(draggable, offset, position) {
            draggable.insertTo(sortable, 'after', slot);
            reset();
        }
        function sort(draggable, position) {
            slot ??= (0, Component_56.default)()
                .style('sortable-slot')
                .tweak(slot => {
                const rect = draggable.rect.value;
                slot.style.setProperty('width', `${rect.width}px`);
                slot.style.setProperty('height', `${rect.height}px`);
            });
            const rect = sortable.rect.value;
            const draggables = getDraggables().filter(d => d !== draggable);
            const positionInSortable = Vector2_2.default.subtract(position, rect.position);
            const previousItem = findPreviousItem(draggable, positionInSortable, draggables);
            const toMarkDirty = new Set(slot.getNextSiblings());
            if (!previousItem)
                slot.prependTo(sortable);
            else
                slot.insertTo(sortable, 'after', previousItem);
            for (const sibling of slot.getNextSiblings())
                toMarkDirty.add(sibling);
            for (const sibling of toMarkDirty)
                sibling.rect.markDirty();
        }
        function findPreviousItem(sorting, position, draggables) {
            const { left: thisLeft, top: thisTop } = sortable.rect.value;
            let lastTop;
            for (let i = 0; i < draggables.length; i++) {
                const child = draggables[i];
                if (child === sorting) {
                    continue;
                }
                let { left, top, width, height } = child.rect.value;
                // adjust child position by the position of the host in the document
                left -= thisLeft - width / 2;
                top -= thisTop;
                // if this is the first item
                if (i === (draggables[0] === sorting ? 1 : 0)) {
                    if (position.y < top) {
                        // if we're higher than the first item, sort to the start
                        return undefined;
                    }
                    if (position.x < left && position.y < top + height) {
                        // if we're left of the first item, and we're not below the first item, sort to the start
                        return undefined;
                    }
                }
                // if we're on a different row
                if (lastTop !== undefined && lastTop !== top) {
                    // if the new row's top is past the hovered position's y, sort to the end of the previous row
                    if (position.y < top) {
                        return draggables[i - 1];
                    }
                    // if the position is within this row vertically, but before any item, sort at the start of this row
                    if (position.y >= top && position.y < top + height && position.x < left) {
                        return draggables[i - 1];
                    }
                }
                lastTop = top;
                // if we're hovering inside an item's box
                if (position.x >= left && position.x < left + width && position.y >= top && position.y < top + height) {
                    return child;
                }
            }
            // we weren't inside anything, and we didn't get put at the start, so we must be after everything instead
            return draggables.at(-1);
        }
    }), {
        isSorting: isSortingAnySortable,
    });
});
define("ui/utility/Applicator", ["require", "exports", "utility/State"], function (require, exports, State_38) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    State_38 = __importDefault(State_38);
    function Applicator(host, defaultValueOrApply, apply) {
        const defaultValue = !apply ? undefined : defaultValueOrApply;
        apply ??= defaultValueOrApply;
        let unbind;
        const result = makeApplicator(host);
        return result;
        function makeApplicator(host) {
            return {
                state: (0, State_38.default)(defaultValue),
                set: value => {
                    unbind?.();
                    setInternal(value);
                    return host;
                },
                bind: state => {
                    unbind?.();
                    unbind = state?.use(host, setInternal);
                    if (!state)
                        setInternal(defaultValue);
                    return host;
                },
                unbind: () => {
                    unbind?.();
                    setInternal(defaultValue);
                    return host;
                },
                rehost: makeApplicator,
            };
        }
        function setInternal(value) {
            if (result.state.value !== value) {
                result.state.value = value;
                apply(value);
            }
        }
    }
    exports.default = Applicator;
});
define("utility/Mouse", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Mouse;
    (function (Mouse) {
        function extractArgs(args) {
            if (typeof args[0] === 'number')
                return args.reverse();
            else
                return args;
        }
        Mouse.asLeft = as.bind(null, 0);
        Mouse.asMiddle = as.bind(null, 1);
        Mouse.asRight = as.bind(null, 2);
        function as(...args) {
            const [event, button] = extractArgs(args);
            if (event.type !== 'click' && event.type !== 'mousedown' && event.type !== 'mouseup')
                return undefined;
            const mouseEvent = event;
            return mouseEvent.button === button ? mouseEvent : undefined;
        }
        Mouse.as = as;
        Mouse.isLeft = is.bind(null, 0);
        Mouse.isMiddle = is.bind(null, 1);
        Mouse.isRight = is.bind(null, 2);
        function is(...args) {
            const [event, button] = extractArgs(args);
            if (event.type !== 'click' && event.type !== 'mousedown' && event.type !== 'mouseup')
                return false;
            const mouseEvent = event;
            return mouseEvent.button === button;
        }
        Mouse.is = is;
        Mouse.handleLeft = handle.bind(null, 0);
        Mouse.handleMiddle = handle.bind(null, 1);
        Mouse.handleRight = handle.bind(null, 2);
        function handle(...args) {
            const [event, button] = extractArgs(args);
            if (!is(event, button))
                return false;
            event.preventDefault();
            return true;
        }
        Mouse.handle = handle;
    })(Mouse || (Mouse = {}));
    exports.default = Mouse;
});
define("ui/component/TagsEditor", ["require", "exports", "lang/en-nz", "model/Tags", "ui/Component", "ui/component/core/Block", "ui/component/core/ext/Input", "ui/component/core/ext/Sortable", "ui/component/core/ProgressWheel", "ui/component/core/Slot", "ui/component/core/TextInput", "ui/component/Tag", "ui/utility/AnchorManipulator", "ui/utility/Applicator", "utility/AbortPromise", "utility/Mouse", "utility/State", "utility/string/Strings"], function (require, exports, en_nz_13, Tags_3, Component_57, Block_12, Input_5, Sortable_1, ProgressWheel_2, Slot_13, TextInput_5, Tag_2, AnchorManipulator_3, Applicator_1, AbortPromise_4, Mouse_4, State_39, Strings_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    en_nz_13 = __importDefault(en_nz_13);
    Tags_3 = __importDefault(Tags_3);
    Component_57 = __importDefault(Component_57);
    Input_5 = __importDefault(Input_5);
    Sortable_1 = __importStar(Sortable_1);
    ProgressWheel_2 = __importDefault(ProgressWheel_2);
    Slot_13 = __importDefault(Slot_13);
    TextInput_5 = __importStar(TextInput_5);
    Tag_2 = __importDefault(Tag_2);
    Applicator_1 = __importDefault(Applicator_1);
    AbortPromise_4 = __importDefault(AbortPromise_4);
    Mouse_4 = __importDefault(Mouse_4);
    State_39 = __importDefault(State_39);
    Strings_3 = __importDefault(Strings_3);
    const TagsEditor = Component_57.default.Builder((component) => {
        const tagsState = (0, State_39.default)({ global_tags: [], custom_tags: [] });
        ////////////////////////////////////
        //#region Current
        const tagsContainer = (0, Slot_13.default)()
            .style('tags-editor-current')
            .use(tagsState, AbortPromise_4.default.asyncFunction(async (signal, slot, tags) => {
            const globalTags = await Tags_3.default.resolve(tags.global_tags);
            if (signal.aborted)
                return;
            if (globalTags.length)
                (0, Component_57.default)()
                    .and(Sortable_1.default, (0, Sortable_1.SortableDefinition)({
                    getID: component => getTagID(component.as(Tag_2.default)?.tag),
                    onOrderChange: order => {
                        tagsState.value.global_tags = order;
                    },
                }))
                    .style('tags-editor-current-type', 'tags-editor-current-global')
                    .append(...globalTags.map(tag => (0, Tag_2.default)(tag)
                    .setNavigationDisabled(true)
                    .event.subscribe('auxclick', event => event.preventDefault())
                    .event.subscribe('mouseup', event => Mouse_4.default.handleMiddle(event) && removeTag(tag))
                    .addDeleteButton(() => removeTag(tag))))
                    .appendTo(slot);
            if (tags.custom_tags.length)
                (0, Component_57.default)()
                    .and(Sortable_1.default, (0, Sortable_1.SortableDefinition)({
                    getID: component => getTagID(component.as(Tag_2.default)?.tag),
                    onOrderChange: order => {
                        tagsState.value.custom_tags = order;
                    },
                }))
                    .style('tags-editor-current-type', 'tags-editor-current-custom')
                    .append(...tags.custom_tags.map(tag => (0, Tag_2.default)(tag)
                    .setNavigationDisabled(true)
                    .event.subscribe('auxclick', event => event.preventDefault())
                    .event.subscribe('mouseup', event => Mouse_4.default.handleMiddle(event) && removeTag(tag))
                    .addDeleteButton(() => removeTag(tag))))
                    .appendTo(slot);
            const hasTags = !!globalTags.length || !!tags.custom_tags.length;
            tagsContainer.style.toggle(hasTags, 'tags-editor-current');
        }));
        function getTagID(tag) {
            return !tag ? '' : typeof tag === 'string' ? tag : `${tag.category}: ${tag.name}`;
        }
        //#endregion
        ////////////////////////////////////
        const inputWrapper = (0, Component_57.default)()
            .style('text-input', 'tags-editor-input-wrapper')
            .event.subscribe('click', () => input.focus());
        const input = (0, TextInput_5.default)()
            .style('tags-editor-input')
            .style.remove('text-input')
            .placeholder.use('shared/form/tags/placeholder')
            .filter(TagsFilter)
            .appendTo(inputWrapper);
        ////////////////////////////////////
        //#region Suggestions
        const hasOrHadFocus = State_39.default.Some(component, component.hasFocused, component.hadFocusedLast);
        const suggestions = (0, Slot_13.default)()
            .style('tags-editor-suggestions')
            .use(State_39.default.UseManual({
            tags: tagsState,
            filter: input.state,
            focus: hasOrHadFocus,
        }), AbortPromise_4.default.asyncFunction(async (signal, slot, { tags, filter, focus }) => {
            if (!filter && !focus)
                return;
            const manifest = await Tags_3.default.getManifest();
            if (signal.aborted)
                return;
            let [category, name] = Strings_3.default.splitOnce(filter, ':');
            if (name === undefined)
                name = category, category = '';
            category = category.trim(), name = name.trim();
            const categorySuggestions = category ? []
                : Object.values(manifest.categories)
                    .filter(category => category.nameLowercase.startsWith(name))
                    // only include categories that have tags that haven't been added yet
                    .filter(category => Object.entries(manifest.tags)
                    .some(([tagId, tag]) => tag.category === category.name && !tags.global_tags.some(added => tagId === added)))
                    .sort(category => -Object.values(manifest.tags).filter(tag => tag.category === category.name).length, (a, b) => a.name.localeCompare(b.name))
                    .map(category => Tag_2.default.Category(category)
                    .event.subscribe('click', () => input.value = `${category.name}: `));
            if (categorySuggestions.length)
                (0, Component_57.default)()
                    .style('tags-editor-suggestions-type')
                    .append(...categorySuggestions)
                    .appendTo(slot);
            const tagSuggestions = category
                ? Object.entries(manifest.tags)
                    .filter(([, tag]) => tag.categoryLowercase.startsWith(category) && tag.nameLowercase.startsWith(name))
                : name
                    ? Object.entries(manifest.tags)
                        .filter(([, tag]) => tag.wordsLowercase.some(word => word.startsWith(name)))
                    : [];
            tagSuggestions.filterInPlace(([tagId]) => !tags.global_tags.some(added => added === tagId));
            if (tagSuggestions.length)
                (0, Component_57.default)()
                    .style('tags-editor-suggestions-type')
                    .append(...tagSuggestions.map(([, tag]) => (0, Tag_2.default)(tag)
                    .setNavigationDisabled(true)
                    .event.subscribe('click', () => {
                    tags.global_tags.push(`${tag.category}: ${tag.name}`);
                    tagsState.emit();
                    input.value = '';
                })))
                    .appendTo(slot);
            const customTagSuggestions = select(() => {
                if (!name)
                    return [];
                if (!category)
                    return [(0, Tag_2.default)(name)];
                return [(0, Tag_2.default)(`${name} ${category}`), (0, Tag_2.default)(`${category} ${name}`)];
            });
            if (customTagSuggestions.length)
                (0, Component_57.default)()
                    .style('tags-editor-suggestions-type')
                    .append((0, Component_57.default)()
                    .style('tags-editor-suggestions-type-label')
                    .text.use('shared/form/tags/suggestion/add-as-custom'))
                    .append(...customTagSuggestions.map(tag => tag
                    .setNavigationDisabled(true)
                    .event.subscribe('click', () => {
                    tags.custom_tags.push(tag.tag);
                    tagsState.emit();
                    input.value = '';
                })))
                    .appendTo(slot);
            if (slot.size)
                (0, Component_57.default)()
                    .style('tags-editor-suggestions-label')
                    .text.use('shared/form/tags/suggestion/label')
                    .prependTo(slot);
            editor.rect.markDirty();
        }))
            .appendTo(inputWrapper);
        //#endregion
        ////////////////////////////////////
        const hiddenInput = (0, Component_57.default)('input')
            .style('tags-editor-validity-pipe-input')
            .tabIndex('programmatic')
            .attributes.set('type', 'text')
            .setName(`tags-editor-validity-pipe-input-${Math.random().toString(36).slice(2)}`);
        const maxLengthGlobal = (0, State_39.default)(undefined);
        const maxLengthCustom = (0, State_39.default)(undefined);
        const editor = component
            .and(Input_5.default)
            .style('tags-editor')
            .append(tagsContainer)
            .append(inputWrapper)
            .append(hiddenInput)
            .pipeValidity(hiddenInput)
            .extend(editor => ({
            state: tagsState,
            get tags() {
                return tagsState.value;
            },
            default: (0, Applicator_1.default)(editor, value => tagsState.value = {
                global_tags: value?.global_tags?.slice() ?? [],
                custom_tags: value?.custom_tags?.slice() ?? [],
            }),
            maxLengthGlobal, maxLengthCustom,
            lengthGlobal: tagsState.mapManual(tags => tags.global_tags.length),
            lengthCustom: tagsState.mapManual(tags => tags.custom_tags.length),
            setMaxLengthGlobal(maxLength) {
                maxLengthGlobal.value = maxLength;
                return editor;
            },
            setMaxLengthCustom(maxLength) {
                maxLengthCustom.value = maxLength;
                return editor;
            },
        }));
        editor.disableDefaultHintPopoverVisibilityHandling();
        hasOrHadFocus.subscribeManual(focus => editor.getPopover()?.toggle(focus).anchor.apply());
        editor.setCustomHintPopover(popover => popover
            .append(Input_5.default.createHintText(en_nz_13.default['shared/form/tags/hint/main']()), Input_5.default.createHintText(en_nz_13.default['shared/form/tags/hint/global']()), ProgressWheel_2.default.Length(editor.lengthGlobal, editor.maxLengthGlobal), Input_5.default.createHintText(en_nz_13.default['shared/form/tags/hint/custom']()), ProgressWheel_2.default.Length(editor.lengthCustom, editor.maxLengthCustom))
            .anchor.reset()
            .anchor.from(input)
            .anchor.add('off right', `.\\${Block_12.BlockClasses.Main}`, 'centre', AnchorManipulator_3.AllowYOffscreen));
        tagsState.use(editor, tags => {
            let invalid;
            if (tags.global_tags.length > (editor.maxLengthGlobal.value ?? Infinity))
                invalid = en_nz_13.default['shared/form/invalid/tags/too-many-global']();
            else if (tags.custom_tags.length > (editor.maxLengthCustom.value ?? Infinity))
                invalid = en_nz_13.default['shared/form/invalid/tags/too-many-custom']();
            editor.setCustomInvalidMessage(invalid);
        });
        input.event.subscribe('keydown', event => {
            if (event.key === 'Enter') {
                event.preventDefault();
                suggestions.getFirstDescendant(Tag_2.default)?.element.click();
            }
        });
        return editor;
        function removeTag(tag) {
            const tagString = typeof tag === 'string' ? tag : `${tag.category}: ${tag.name}`;
            if (typeof tag === 'string')
                tagsState.value.custom_tags.filterInPlace(tag => tag !== tagString);
            else
                tagsState.value.global_tags.filterInPlace(tag => tag !== tagString);
            tagsState.emit();
        }
    });
    ////////////////////////////////////
    //#region Input Filter
    const TagsFilter = (0, TextInput_5.FilterFunction)((before, selected, after) => {
        before = filterSegment(before);
        selected = filterSegment(selected);
        after = filterSegment(after);
        if (before.includes(':')) {
            selected = selected.replaceAll(':', ' ');
            after = after.replaceAll(':', ' ');
        }
        else if (selected.includes(':')) {
            after = after.replaceAll(':', ' ');
        }
        const shouldTrimBeforeEnd = true
            && before.endsWith(' ')
            && (false
                || selected.startsWith(' ') || selected.startsWith(':')
                || (!selected && (after.startsWith(' ') || after.startsWith(':'))));
        if (shouldTrimBeforeEnd)
            before = before.trimEnd();
        if (selected.endsWith(' ') && (after.startsWith(' ') || after.startsWith(':')))
            selected = selected.trimEnd();
        before = before.trimStart();
        after = after.trimEnd();
        if (!before)
            selected = selected.trimStart();
        if (!after)
            selected = selected.trimEnd();
        return [before, selected, after];
    });
    function filterSegment(text) {
        return text.toLowerCase()
            .replace(/[^a-z0-9: -]/g, ' ')
            .replace(/(?<=:.*?):/g, ' ')
            .replace(/ {2,}/g, ' ')
            .replace(' :', ':');
    }
    //#endregion
    ////////////////////////////////////
    exports.default = TagsEditor;
});
define("ui/view/work/WorkEditForm", ["require", "exports", "endpoint/work/EndpointWorkCreate", "endpoint/work/EndpointWorkUpdate", "lang/en-nz", "model/FormInputLengths", "model/Session", "ui/Component", "ui/component/core/Block", "ui/component/core/Form", "ui/component/core/LabelledTable", "ui/component/core/Textarea", "ui/component/core/TextEditor", "ui/component/core/TextInput", "ui/component/core/toast/Toast", "ui/component/TagsEditor", "ui/component/VanityInput"], function (require, exports, EndpointWorkCreate_1, EndpointWorkUpdate_1, en_nz_14, FormInputLengths_5, Session_14, Component_58, Block_13, Form_4, LabelledTable_3, Textarea_1, TextEditor_5, TextInput_6, Toast_4, TagsEditor_1, VanityInput_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    EndpointWorkCreate_1 = __importDefault(EndpointWorkCreate_1);
    EndpointWorkUpdate_1 = __importDefault(EndpointWorkUpdate_1);
    en_nz_14 = __importDefault(en_nz_14);
    FormInputLengths_5 = __importDefault(FormInputLengths_5);
    Session_14 = __importDefault(Session_14);
    Component_58 = __importDefault(Component_58);
    Block_13 = __importDefault(Block_13);
    Form_4 = __importDefault(Form_4);
    LabelledTable_3 = __importDefault(LabelledTable_3);
    Textarea_1 = __importDefault(Textarea_1);
    TextEditor_5 = __importDefault(TextEditor_5);
    TextInput_6 = __importDefault(TextInput_6);
    TagsEditor_1 = __importDefault(TagsEditor_1);
    exports.default = Component_58.default.Builder((component, state) => {
        const block = component.and(Block_13.default);
        const form = block.and(Form_4.default, block.title);
        form.viewTransition('work-edit-form');
        const type = state.value ? 'update' : 'create';
        form.title.text.use(`view/work-edit/${type}/title`);
        form.setName(en_nz_14.default[`view/work-edit/${type}/title`]().toString());
        // if (params.type === "create")
        // 	form.description.text.use("view/work-edit/create/description")
        form.submit.textWrapper.text.use(`view/work-edit/${type}/submit`);
        const table = (0, LabelledTable_3.default)().appendTo(form.content);
        const nameInput = (0, TextInput_6.default)()
            .setRequired()
            .default.bind(state.map(component, work => work?.name))
            .hint.use('view/work-edit/shared/form/name/hint')
            .setMaxLength(FormInputLengths_5.default.manifest?.work.name);
        table.label(label => label.text.use('view/work-edit/shared/form/name/label'))
            .content((content, label) => content.append(nameInput.setLabel(label)));
        const vanityInput = (0, TextInput_6.default)()
            .placeholder.bind(nameInput.state
            .map(component, name => (0, VanityInput_2.FilterVanity)(name)))
            .default.bind(state.map(component, work => work?.vanity))
            .filter(VanityInput_2.FilterVanity)
            .hint.use('view/work-edit/shared/form/vanity/hint')
            .setMaxLength(FormInputLengths_5.default.manifest?.work.vanity);
        table.label(label => label.text.use('view/work-edit/shared/form/vanity/label'))
            .content((content, label) => content.append(vanityInput.setLabel(label)));
        const descriptionInput = (0, Textarea_1.default)()
            .default.bind(state.map(component, work => work?.description))
            .hint.use('view/work-edit/shared/form/description/hint')
            .setMaxLength(FormInputLengths_5.default.manifest?.work.description);
        table.label(label => label.text.use('view/work-edit/shared/form/description/label'))
            .content((content, label) => content.append(descriptionInput.setLabel(label)));
        const synopsisInput = (0, TextEditor_5.default)()
            .default.bind(state.map(component, work => work?.synopsis.body))
            .hint.use('view/work-edit/shared/form/synopsis/hint')
            .setMaxLength(FormInputLengths_5.default.manifest?.work.synopsis);
        table.label(label => label.text.use('view/work-edit/shared/form/synopsis/label'))
            .content((content, label) => content.append(synopsisInput.setLabel(label)));
        const tagsEditor = (0, TagsEditor_1.default)()
            .default.bind(state)
            .setMaxLengthGlobal(FormInputLengths_5.default.manifest?.work_tags.global)
            .setMaxLengthCustom(FormInputLengths_5.default.manifest?.work_tags.custom);
        table.label(label => label.text.use('view/work-edit/shared/form/tags/label'))
            .content((content, label) => content.append(tagsEditor.setLabel(label)));
        form.event.subscribe('submit', async (event) => {
            event.preventDefault();
            const name = nameInput.value;
            const response = await (() => {
                switch (type) {
                    case 'create':
                        return EndpointWorkCreate_1.default.query({
                            body: {
                                name,
                                vanity: vanityInput.value,
                                description: descriptionInput.value,
                                synopsis: synopsisInput.useMarkdown(),
                                ...tagsEditor.state.value,
                            },
                        });
                    case 'update': {
                        if (!state.value)
                            return;
                        const authorVanity = Session_14.default.Auth.author.value?.vanity;
                        if (!authorVanity)
                            return new Error('Cannot update a work when not signed in');
                        return EndpointWorkUpdate_1.default.query({
                            params: {
                                author: authorVanity,
                                vanity: state.value.vanity,
                            },
                            body: {
                                name,
                                vanity: vanityInput.value,
                                description: descriptionInput.value,
                                synopsis: synopsisInput.useMarkdown(),
                                ...tagsEditor.state.value,
                            },
                        });
                    }
                }
            })();
            if (toast.handleError(response, quilt => quilt['view/work-edit/shared/toast/failed-to-save'](name)))
                return;
            toast.success(Toast_4.TOAST_SUCCESS, quilt => quilt['view/work-edit/shared/toast/saved'](name));
            state.value = response?.data;
        });
        return form;
    });
});
define("ui/view/WorkEditView", ["require", "exports", "endpoint/work/EndpointWorkDelete", "endpoint/work/EndpointWorkGet", "ui/component/core/ActionRow", "ui/component/core/Button", "ui/component/core/ConfirmDialog", "ui/component/core/Slot", "ui/view/shared/component/View", "ui/view/shared/component/ViewDefinition", "ui/view/shared/ext/ViewTransition", "ui/view/work/WorkEditForm", "utility/State"], function (require, exports, EndpointWorkDelete_1, EndpointWorkGet_2, ActionRow_6, Button_19, ConfirmDialog_2, Slot_14, View_11, ViewDefinition_10, ViewTransition_4, WorkEditForm_1, State_40) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    EndpointWorkDelete_1 = __importDefault(EndpointWorkDelete_1);
    EndpointWorkGet_2 = __importDefault(EndpointWorkGet_2);
    ActionRow_6 = __importDefault(ActionRow_6);
    Button_19 = __importDefault(Button_19);
    ConfirmDialog_2 = __importDefault(ConfirmDialog_2);
    Slot_14 = __importDefault(Slot_14);
    View_11 = __importDefault(View_11);
    ViewDefinition_10 = __importDefault(ViewDefinition_10);
    ViewTransition_4 = __importDefault(ViewTransition_4);
    WorkEditForm_1 = __importDefault(WorkEditForm_1);
    State_40 = __importDefault(State_40);
    exports.default = (0, ViewDefinition_10.default)({
        requiresLogin: true,
        create: async (params) => {
            const id = 'work-edit';
            const view = (0, View_11.default)(id);
            const work = params && await EndpointWorkGet_2.default.query({ params });
            if (work instanceof Error)
                throw work;
            const state = (0, State_40.default)(work?.data);
            const stateInternal = (0, State_40.default)(work?.data);
            (0, Slot_14.default)()
                .use(state, () => (0, WorkEditForm_1.default)(stateInternal).subviewTransition(id))
                .appendTo(view);
            (0, Slot_14.default)()
                .use(state, () => createActionRow()?.subviewTransition(id))
                .appendTo(view);
            stateInternal.subscribe(view, work => ViewTransition_4.default.perform('subview', id, () => state.value = work));
            return view;
            function createActionRow() {
                if (!stateInternal.value)
                    return;
                return (0, ActionRow_6.default)()
                    .viewTransition('work-edit-action-row')
                    .tweak(row => row.right
                    .append((0, Button_19.default)()
                    .text.use('view/work-edit/update/action/delete')
                    .event.subscribe('click', async () => {
                    if (!params)
                        return;
                    const result = await ConfirmDialog_2.default.prompt(view, { dangerToken: 'delete-work' });
                    if (!result)
                        return;
                    const response = await EndpointWorkDelete_1.default.query({ params });
                    if (toast.handleError(response))
                        return;
                    return navigate.toURL(`/author/${params.author}`);
                })));
            }
        },
    });
});
define("endpoint/chapter/EndpointChapterGetAll", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_33) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_33 = __importDefault(Endpoint_33);
    exports.default = (0, Endpoint_33.default)('/work/{author}/{vanity}/chapters/list', 'get');
});
define("ui/component/Chapter", ["require", "exports", "model/Session", "ui/Component", "ui/component/core/Button", "ui/component/core/ext/CanHasActionsMenuButton", "ui/component/core/Link", "ui/component/core/Timestamp", "utility/maths/Maths"], function (require, exports, Session_15, Component_59, Button_20, CanHasActionsMenuButton_2, Link_8, Timestamp_4, Maths_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Session_15 = __importDefault(Session_15);
    Component_59 = __importDefault(Component_59);
    Button_20 = __importDefault(Button_20);
    CanHasActionsMenuButton_2 = __importDefault(CanHasActionsMenuButton_2);
    Link_8 = __importDefault(Link_8);
    Timestamp_4 = __importDefault(Timestamp_4);
    Maths_3 = __importDefault(Maths_3);
    const Chapter = Component_59.default.Builder((component, chapter, work, author) => {
        component = (0, Link_8.default)(`/work/${author.vanity}/${work.vanity}/chapter/${chapter.url}`)
            .style('chapter');
        const chapterNumber = Maths_3.default.parseIntOrUndefined(chapter.url);
        const number = (0, Component_59.default)()
            .style('chapter-number')
            .text.set(chapterNumber ? `${chapterNumber.toLocaleString()}` : '')
            .appendTo(component);
        const chapterName = (0, Component_59.default)()
            .style('chapter-name')
            .text.set(chapter.name)
            .appendTo(component);
        const right = (0, Component_59.default)()
            .style('chapter-right')
            .appendTo(component);
        const timestamp = !chapter.time_last_update ? undefined
            : (0, Timestamp_4.default)(chapter.time_last_update)
                .style('chapter-timestamp')
                .appendTo(right);
        return component
            .and(CanHasActionsMenuButton_2.default, button => button
            .type('inherit-size')
            .style('chapter-actions-menu-button')
            .style.bind(component.hoveredOrHasFocused.not, 'chapter-actions-menu-button--not-focused')
            .appendTo(right))
            .setActionsMenu((popover, button) => {
            if (author && author.vanity === Session_15.default.Auth.author.value?.vanity) {
                (0, Button_20.default)()
                    .type('flush')
                    .text.use('view/work/chapters/action/label/edit')
                    .event.subscribe('click', () => navigate.toURL(`/work/${author.vanity}/${work.vanity}/chapter/${chapter.url}/edit`))
                    .appendTo(popover);
                (0, Button_20.default)()
                    .type('flush')
                    .text.use('view/author/works/action/label/delete')
                    .event.subscribe('click', () => { })
                    .appendTo(popover);
            }
        })
            .tweak(component => component.actionsMenuButton)
            .extend(component => ({
            chapter,
            number,
            chapterName,
            timestamp,
        }));
    });
    exports.default = Chapter;
});
define("ui/view/WorkView", ["require", "exports", "endpoint/chapter/EndpointChapterGetAll", "endpoint/work/EndpointWorkGet", "model/Session", "ui/Component", "ui/component/Chapter", "ui/component/core/Button", "ui/component/core/Paginator", "ui/component/core/Slot", "ui/component/Work", "ui/view/shared/component/View", "ui/view/shared/component/ViewDefinition", "utility/Errors"], function (require, exports, EndpointChapterGetAll_1, EndpointWorkGet_3, Session_16, Component_60, Chapter_1, Button_21, Paginator_5, Slot_15, Work_4, View_12, ViewDefinition_11, Errors_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    EndpointChapterGetAll_1 = __importDefault(EndpointChapterGetAll_1);
    EndpointWorkGet_3 = __importDefault(EndpointWorkGet_3);
    Session_16 = __importDefault(Session_16);
    Component_60 = __importDefault(Component_60);
    Chapter_1 = __importDefault(Chapter_1);
    Button_21 = __importDefault(Button_21);
    Paginator_5 = __importDefault(Paginator_5);
    Slot_15 = __importDefault(Slot_15);
    Work_4 = __importDefault(Work_4);
    View_12 = __importDefault(View_12);
    ViewDefinition_11 = __importDefault(ViewDefinition_11);
    Errors_3 = __importDefault(Errors_3);
    exports.default = (0, ViewDefinition_11.default)({
        create: async (params) => {
            const view = (0, View_12.default)('work');
            const response = await EndpointWorkGet_3.default.query({ params });
            if (response instanceof Error)
                throw response;
            const workData = response.data;
            const authorData = workData.synopsis.mentions.find(author => author.vanity === params.author);
            if (!authorData)
                throw Errors_3.default.BadData('Work author not in synopsis authors');
            (0, Work_4.default)(workData, authorData)
                .viewTransition('work-view-work')
                .setContainsHeading()
                .appendTo(view);
            const paginator = (0, Paginator_5.default)()
                .viewTransition('work-view-chapters')
                .tweak(p => p.title.text.use('view/work/chapters/title'))
                .tweak(p => p.primaryActions.append((0, Slot_15.default)()
                .if(Session_16.default.Auth.loggedIn, () => (0, Button_21.default)()
                .setIcon('plus')
                .ariaLabel.use('view/work/chapters/action/label/new')
                .event.subscribe('click', () => navigate.toURL(`/work/${params.author}/${params.vanity}/chapter/new`)))))
                .appendTo(view);
            const chaptersQuery = EndpointChapterGetAll_1.default.prep({
                params: {
                    author: params.author,
                    vanity: params.vanity,
                },
            });
            await paginator.useEndpoint(chaptersQuery, (slot, chapters) => {
                slot.style('chapter-list');
                for (const chapterData of chapters)
                    (0, Chapter_1.default)(chapterData, workData, authorData)
                        .appendTo(slot);
            });
            paginator.orElse(slot => (0, Component_60.default)()
                .style('placeholder')
                .text.use('view/work/chapters/content/empty')
                .appendTo(slot));
            return view;
        },
    });
});
define("navigation/Routes", ["require", "exports", "navigation/Route", "ui/view/AccountView", "ui/view/AuthorView", "ui/view/ChapterEditView", "ui/view/ChapterView", "ui/view/DebugView", "ui/view/FeedView", "ui/view/HomeView", "ui/view/NotificationsView", "ui/view/TagView", "ui/view/WorkEditView", "ui/view/WorkView", "utility/Env"], function (require, exports, Route_1, AccountView_1, AuthorView_1, ChapterEditView_1, ChapterView_1, DebugView_1, FeedView_1, HomeView_1, NotificationsView_1, TagView_1, WorkEditView_1, WorkView_1, Env_10) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Route_1 = __importDefault(Route_1);
    AccountView_1 = __importDefault(AccountView_1);
    AuthorView_1 = __importDefault(AuthorView_1);
    ChapterEditView_1 = __importDefault(ChapterEditView_1);
    ChapterView_1 = __importDefault(ChapterView_1);
    DebugView_1 = __importDefault(DebugView_1);
    FeedView_1 = __importDefault(FeedView_1);
    HomeView_1 = __importDefault(HomeView_1);
    NotificationsView_1 = __importDefault(NotificationsView_1);
    TagView_1 = __importDefault(TagView_1);
    WorkEditView_1 = __importDefault(WorkEditView_1);
    WorkView_1 = __importDefault(WorkView_1);
    Env_10 = __importDefault(Env_10);
    const Routes = [
        (0, Route_1.default)('/debug', DebugView_1.default.navigate),
        (0, Route_1.default)('/', Env_10.default.isDev ? FeedView_1.default.navigate : HomeView_1.default.navigate),
        (0, Route_1.default)('/account', AccountView_1.default.navigate),
        (0, Route_1.default)('/author/$vanity', AuthorView_1.default.navigate),
        (0, Route_1.default)('/notifications', NotificationsView_1.default.navigate),
        (0, Route_1.default)('/work/new', WorkEditView_1.default.navigate),
        (0, Route_1.default)('/work/$author/$vanity', WorkView_1.default.navigate),
        (0, Route_1.default)('/work/$author/$vanity/edit', WorkEditView_1.default.navigate),
        (0, Route_1.default)('/work/$author/$vanity/chapter/new', ChapterEditView_1.default.navigate),
        (0, Route_1.default)('/work/$author/$vanity/chapter/$url', ChapterView_1.default.navigate),
        (0, Route_1.default)('/work/$author/$vanity/chapter/$url/edit', ChapterEditView_1.default.navigate),
        (0, Route_1.default)('/tag/$category/$name', TagView_1.default.navigate),
        (0, Route_1.default)('/tag/$custom_name', TagView_1.default.navigate),
    ];
    exports.default = Routes;
});
define("ui/view/ErrorView", ["require", "exports", "lang/en-nz", "ui/component/core/Heading", "ui/component/core/Paragraph", "ui/view/shared/component/View", "ui/view/shared/component/ViewDefinition"], function (require, exports, en_nz_15, Heading_2, Paragraph_3, View_13, ViewDefinition_12) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    en_nz_15 = __importDefault(en_nz_15);
    Heading_2 = __importDefault(Heading_2);
    Paragraph_3 = __importDefault(Paragraph_3);
    View_13 = __importDefault(View_13);
    ViewDefinition_12 = __importDefault(ViewDefinition_12);
    exports.default = (0, ViewDefinition_12.default)({
        create: (params) => {
            const view = (0, View_13.default)('error');
            if (params.code === 500 && params.error)
                console.error(params.error);
            (0, Heading_2.default)()
                .text.use(quilt => quilt['view/error/title']({ CODE: params.code }))
                .appendTo(view);
            const key = `view/error/description-${params.code}`;
            if (key in en_nz_15.default)
                (0, Paragraph_3.default)()
                    .text.use(key)
                    .appendTo(view);
            return view;
        },
    });
});
define("ui/view/RequireLoginView", ["require", "exports", "ui/component/core/ActionRow", "ui/component/core/Block", "ui/component/core/Button", "ui/view/AccountView", "ui/view/shared/component/View", "ui/view/shared/component/ViewDefinition"], function (require, exports, ActionRow_7, Block_14, Button_22, AccountView_2, View_14, ViewDefinition_13) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ActionRow_7 = __importDefault(ActionRow_7);
    Block_14 = __importDefault(Block_14);
    Button_22 = __importDefault(Button_22);
    AccountView_2 = __importDefault(AccountView_2);
    View_14 = __importDefault(View_14);
    ViewDefinition_13 = __importDefault(ViewDefinition_13);
    exports.default = (0, ViewDefinition_13.default)({
        create: () => {
            const view = (0, View_14.default)('require-login');
            const block = (0, Block_14.default)().appendTo(view);
            block.title.text.use('view/shared/login-required/title');
            block.description.text.use('view/shared/login-required/description');
            const actionRow = (0, ActionRow_7.default)()
                .appendTo(block);
            (0, Button_22.default)()
                .type('primary')
                .text.use('view/shared/login-required/action')
                .event.subscribe('click', () => navigate.ephemeral(AccountView_2.default, undefined))
                .appendTo(actionRow.right);
            return view;
        },
    });
});
define("ui/view/shared/component/ViewContainer", ["require", "exports", "model/Session", "ui/Component", "ui/component/core/Button", "ui/component/core/Dialog", "ui/view/AccountView", "ui/view/ErrorView", "ui/view/RequireLoginView", "ui/view/shared/ext/ViewTransition"], function (require, exports, Session_17, Component_61, Button_23, Dialog_3, AccountView_3, ErrorView_1, RequireLoginView_1, ViewTransition_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Session_17 = __importDefault(Session_17);
    Component_61 = __importDefault(Component_61);
    Button_23 = __importDefault(Button_23);
    Dialog_3 = __importDefault(Dialog_3);
    AccountView_3 = __importDefault(AccountView_3);
    ErrorView_1 = __importDefault(ErrorView_1);
    RequireLoginView_1 = __importDefault(RequireLoginView_1);
    ViewTransition_5 = __importDefault(ViewTransition_5);
    let globalId = 0;
    const ViewContainer = () => {
        let cancelLogin;
        const container = (0, Component_61.default)()
            .style('view-container')
            .tabIndex('programmatic')
            .ariaRole('main')
            .ariaLabel.use('view/container/alt')
            .extend(container => ({
            show: async (definition, params) => {
                const showingId = ++globalId;
                let view;
                let loadParams = undefined;
                const needsLogin = definition.requiresLogin && !Session_17.default.Auth.loggedIn.value;
                if (needsLogin || definition.load) {
                    let loginPromise;
                    const transition = ViewTransition_5.default.perform('view', async () => {
                        swapRemove();
                        if (!needsLogin)
                            return;
                        const login = logIn();
                        loginPromise = login?.authed;
                        await login?.accountViewShown;
                    });
                    await transition.updateCallbackDone;
                    await loginPromise;
                    if (needsLogin && !Session_17.default.Auth.loggedIn.value) {
                        let setLoggedIn;
                        const loggedIn = new Promise(resolve => setLoggedIn = resolve);
                        ViewTransition_5.default.perform('view', async () => {
                            hideEphemeral();
                            const view = await swapAdd(RequireLoginView_1.default);
                            if (!view)
                                return;
                            Session_17.default.Auth.loggedIn.subscribe(view, loggedIn => loggedIn && setLoggedIn());
                        });
                        await loggedIn;
                    }
                }
                loadParams = !definition.load ? undefined : await definition.load(params);
                if (globalId !== showingId)
                    return;
                if (container.view || showingId > 1) {
                    const transition = ViewTransition_5.default.perform('view', swap);
                    await transition.updateCallbackDone;
                }
                else {
                    await swap();
                }
                return view;
                async function swap() {
                    swapRemove();
                    await swapAdd();
                }
                function swapRemove() {
                    container.view?.remove();
                    hideEphemeral();
                }
                async function swapAdd(replacementDefinition = definition) {
                    const shownView = await Promise.resolve(replacementDefinition.create(params, loadParams))
                        .then(v => {
                        view = replacementDefinition === definition ? v : undefined;
                        return v;
                    })
                        .catch((error) => ErrorView_1.default.create({
                        code: (error.code < 200 ? undefined : error.code) ?? 500,
                        error,
                    }));
                    if (shownView) {
                        shownView.appendTo(container);
                        container.view = shownView;
                        if (replacementDefinition === definition)
                            shownView.params = params;
                    }
                    return shownView;
                }
            },
            ephemeralDialog: (0, Dialog_3.default)()
                .style('view-container-ephemeral')
                .tweak(dialog => dialog.style.bind(dialog.opened, 'view-container-ephemeral--open'))
                .setOwner(container)
                .setNotModal()
                .append((0, Button_23.default)()
                .setIcon('xmark')
                .style('view-container-ephemeral-close')
                .event.subscribe('click', () => {
                if (cancelLogin)
                    cancelLogin();
                else
                    return container.hideEphemeral();
            }))
                .appendTo(document.body),
            showEphemeral: async (definition, params) => {
                let view;
                const transition = document.startViewTransition(async () => view = await showEphemeral(definition, params));
                await transition.updateCallbackDone;
                return view;
            },
            hideEphemeral: async () => {
                const transition = document.startViewTransition(hideEphemeral);
                await transition.updateCallbackDone;
            },
        }));
        return container;
        async function showEphemeral(definition, params) {
            container.ephemeral?.remove();
            let view;
            const shownView = await Promise.resolve(definition.create(params))
                .then(v => view = v)
                .catch((error) => ErrorView_1.default.create({ code: error.code ?? 500, error }));
            if (shownView) {
                shownView.prependTo(container.ephemeralDialog);
                container.ephemeral = shownView;
                container.ephemeralDialog.open();
                container.attributes.append('inert');
                container.ephemeralDialog.opened.subscribe(shownView, opened => {
                    if (!opened) {
                        hideEphemeral();
                    }
                });
            }
            return view;
        }
        function hideEphemeral() {
            container.ephemeralDialog.close();
            container.ephemeral?.remove();
            delete container.ephemeral;
            container.attributes.remove('inert');
        }
        function logIn() {
            if (Session_17.default.Auth.author.value)
                return;
            const accountViewShown = showEphemeral(AccountView_3.default, undefined);
            const authPromise = accountViewShown.then(async (view) => {
                if (!view)
                    return false;
                const loginCancelledPromise = new Promise(resolve => cancelLogin = resolve);
                await Promise.race([
                    Session_17.default.Auth.await(view),
                    loginCancelledPromise,
                ]);
                cancelLogin = undefined;
                return Session_17.default.Auth.loggedIn.value;
            });
            return {
                accountViewShown,
                authed: authPromise,
            };
        }
    };
    exports.default = ViewContainer;
});
define("navigation/Navigate", ["require", "exports", "navigation/Routes", "ui/view/ErrorView", "utility/Env"], function (require, exports, Routes_1, ErrorView_2, Env_11) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Routes_1 = __importDefault(Routes_1);
    ErrorView_2 = __importDefault(ErrorView_2);
    Env_11 = __importDefault(Env_11);
    function Navigator(app) {
        let lastURL;
        const navigate = {
            fromURL: async () => {
                if (location.href === lastURL?.href)
                    return;
                const oldURL = lastURL;
                lastURL = new URL(location.href);
                let errored = false;
                if (location.pathname !== oldURL?.pathname) {
                    const url = location.pathname;
                    let handled = false;
                    for (const route of Routes_1.default) {
                        const params = route.match(url);
                        if (!params)
                            continue;
                        await route.handler(app, (!Object.keys(params).length ? undefined : params));
                        handled = true;
                        break;
                    }
                    if (!handled) {
                        errored = true;
                        await app.view.show(ErrorView_2.default, { code: 404 });
                    }
                }
                if (location.hash && !errored) {
                    const id = location.hash.slice(1);
                    const element = document.getElementById(id);
                    if (!element) {
                        console.error(`No element by ID: "${id}"`);
                        location.hash = '';
                        return;
                    }
                    element.scrollIntoView();
                    element.focus();
                }
            },
            toURL: async (url) => {
                navigate.setURL(url);
                return navigate.fromURL();
            },
            setURL: (url) => {
                if (url !== location.pathname)
                    history.pushState({}, '', `${Env_11.default.URL_ORIGIN}${url.slice(1)}`);
            },
            toRawURL: (url) => {
                if (url.startsWith('http')) {
                    location.href = url;
                    return true;
                }
                if (url.startsWith('/')) {
                    void navigate.toURL(url);
                    return true;
                }
                if (url.startsWith('#')) {
                    const id = url.slice(1);
                    const element = document.getElementById(id);
                    if (!element) {
                        console.error(`No element by ID: "${id}"`);
                        return false;
                    }
                    location.hash = url;
                    return true;
                }
                console.error(`Unsupported raw URL to navigate to: "${url}"`);
                return false;
            },
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
            ephemeral: (...args) => app.view.showEphemeral(...args),
        };
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        window.addEventListener('popstate', navigate.fromURL);
        Object.assign(window, { navigate });
        return navigate;
    }
    exports.default = Navigator;
});
define("endpoint/notification/EndpointNotificationGetUnread", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_34) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_34 = __importDefault(Endpoint_34);
    exports.default = (0, Endpoint_34.default)('/notifications/get/unread', 'get');
});
define("endpoint/notification/EndpointNotificationGetCount", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_35) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_35 = __importDefault(Endpoint_35);
    exports.default = (0, Endpoint_35.default)('/notifications/get/count', 'get');
});
define("model/Notifications", ["require", "exports", "endpoint/notification/EndpointNotificationGetCount", "endpoint/notification/EndpointNotificationGetUnread", "model/Session", "utility/State", "utility/Store", "utility/Time"], function (require, exports, EndpointNotificationGetCount_1, EndpointNotificationGetUnread_1, Session_18, State_41, Store_4, Time_8) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    EndpointNotificationGetCount_1 = __importDefault(EndpointNotificationGetCount_1);
    EndpointNotificationGetUnread_1 = __importDefault(EndpointNotificationGetUnread_1);
    Session_18 = __importDefault(Session_18);
    State_41 = __importDefault(State_41);
    Store_4 = __importDefault(Store_4);
    Time_8 = __importDefault(Time_8);
    var Notifications;
    (function (Notifications) {
        Notifications.recentUnreads = (0, State_41.default)(Store_4.default.items.notifications?.recentUnreads ?? []);
        Notifications.unreadCount = (0, State_41.default)(Store_4.default.items.notifications?.unreadCount ?? 0);
        Notifications.lastUpdate = (0, State_41.default)(Store_4.default.items.notifications?.lastUpdate ?? 0);
        function clear() {
            if (Store_4.default.items.notifications)
                Store_4.default.items.notifications = { ...Store_4.default.items.notifications, lastCheck: 0, lastUpdate: 0 };
        }
        Notifications.clear = clear;
        function check() {
            if (Store_4.default.items.notifications)
                Store_4.default.items.notifications = { ...Store_4.default.items.notifications, lastCheck: 0 };
            return checkNotifications();
        }
        Notifications.check = check;
        let activeCheck = false;
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        setInterval(checkNotifications, Time_8.default.seconds(5));
        async function checkNotifications() {
            if (activeCheck)
                return;
            if (!Session_18.default.Auth.author.value)
                return;
            let notifications = Store_4.default.items.notifications;
            const now = Date.now();
            if (now - (notifications?.lastCheck ?? 0) < Time_8.default.minutes(1))
                return;
            activeCheck = true;
            const response = await EndpointNotificationGetCount_1.default.query();
            notifications ??= {};
            notifications.lastCheck = Date.now();
            Store_4.default.items.notifications = notifications;
            activeCheck = false;
            if (toast.handleError(response))
                return;
            const time = new Date(response.data.notification_time_last_modified).getTime();
            if (time <= (notifications.lastUpdate ?? 0))
                return;
            const firstPage = await EndpointNotificationGetUnread_1.default.query();
            if (toast.handleError(firstPage))
                return;
            const count = response.data.unread_notification_count;
            notifications.unreadCount = Notifications.unreadCount.value = count;
            notifications.recentUnreads = Notifications.recentUnreads.value = firstPage.data;
            notifications.lastUpdate = Notifications.lastUpdate.value = time;
            Store_4.default.items.notifications = notifications;
        }
    })(Notifications || (Notifications = {}));
    Object.assign(window, { Notifications });
    exports.default = Notifications;
});
define("ui/component/masthead/Flag", ["require", "exports", "ui/Component", "utility/Arrays"], function (require, exports, Component_62, Arrays_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Component_62 = __importDefault(Component_62);
    Arrays_7 = __importDefault(Arrays_7);
    const Flag = Component_62.default.Builder((component) => {
        const stripes = Arrays_7.default.range(5)
            .map(i => (0, Component_62.default)()
            .style('flag-stripe', `flag-stripe-${FLAG_STRIPE_COLOURS[i]}`, `flag-stripe-${i + 1}`));
        let endWhen = Infinity;
        const activeReasons = new Set();
        function add(reason) {
            if (!activeReasons.size) {
                endWhen = Infinity;
                for (const stripe of stripes) {
                    stripe.style.remove('flag-stripe--animate-end-0', 'flag-stripe--animate-end-1');
                    stripe.style('flag-stripe--animate');
                }
            }
            activeReasons.add(reason);
        }
        function remove(reason) {
            activeReasons.delete(reason);
        }
        function toggle(reason, enabled) {
            if (enabled)
                add(reason);
            else
                remove(reason);
        }
        component.hoveredOrFocused.subscribe(component, enabled => toggle('focus', enabled));
        for (const stripe of stripes) {
            const first = stripe === stripes[0];
            let iteration = 0;
            stripe.event.subscribe('animationstart', () => iteration = 0);
            stripe.event.subscribe('animationiteration', () => {
                iteration++;
                if (first && !activeReasons.size)
                    endWhen = iteration;
                if (iteration >= endWhen) {
                    stripe.style.remove('flag-stripe--animate');
                    stripe.style(`flag-stripe--animate-end-${(iteration % 2)}`);
                }
            });
        }
        return component
            .style('flag')
            .append(...stripes)
            .extend(flag => ({
            wave: toggle,
        }));
    });
    exports.default = Flag;
    const FLAG_STRIPE_COLOURS = [
        'blue',
        'pink',
        'white',
        'pink',
        'blue',
    ];
});
define("ui/component/PrimaryNav", ["require", "exports", "ui/Component"], function (require, exports, Component_63) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Component_63 = __importDefault(Component_63);
    exports.default = Component_63.default.Builder(nav => {
        // Heading()
        // 	.text.set("hi")
        // 	.appendTo(nav)
        return nav;
    });
});
define("ui/component/Sidebar", ["require", "exports", "ui/Component", "ui/component/core/Button", "ui/component/core/Link", "utility/Env", "utility/Store"], function (require, exports, Component_64, Button_24, Link_9, Env_12, Store_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Component_64 = __importDefault(Component_64);
    Button_24 = __importDefault(Button_24);
    Link_9 = __importDefault(Link_9);
    Env_12 = __importDefault(Env_12);
    Store_5 = __importDefault(Store_5);
    const Sidebar = Component_64.default.Builder('nav', (sidebar) => {
        sidebar.style('sidebar')
            .ariaLabel.use('masthead/primary-nav/alt');
        if (Env_12.default.ENVIRONMENT === 'dev')
            (0, Link_9.default)('/debug')
                .and(Button_24.default)
                .text.set('Debug')
                .appendTo(sidebar);
        updateSidebarVisibility();
        return sidebar.extend(sidebar => ({
            toggle: () => {
                Store_5.default.items.sidebar = !Store_5.default.items.sidebar;
                updateSidebarVisibility();
                return sidebar;
            },
        }));
        function updateSidebarVisibility() {
            sidebar.style.toggle(!!Store_5.default.items.sidebar, 'sidebar--visible');
        }
    });
    exports.default = Sidebar;
});
define("ui/component/Masthead", ["require", "exports", "endpoint/notification/EndpointNotificationGetUnread", "model/Notifications", "model/Session", "ui/Component", "ui/component/core/Button", "ui/component/core/Link", "ui/component/core/Slot", "ui/component/masthead/Flag", "ui/component/NotificationList", "ui/component/PrimaryNav", "ui/component/Sidebar", "ui/utility/Viewport", "utility/AbortPromise", "utility/Env", "utility/Task"], function (require, exports, EndpointNotificationGetUnread_2, Notifications_1, Session_19, Component_65, Button_25, Link_10, Slot_16, Flag_1, NotificationList_2, PrimaryNav_1, Sidebar_1, Viewport_4, AbortPromise_5, Env_13, Task_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    EndpointNotificationGetUnread_2 = __importDefault(EndpointNotificationGetUnread_2);
    Notifications_1 = __importDefault(Notifications_1);
    Session_19 = __importDefault(Session_19);
    Component_65 = __importDefault(Component_65);
    Button_25 = __importDefault(Button_25);
    Link_10 = __importDefault(Link_10);
    Slot_16 = __importDefault(Slot_16);
    Flag_1 = __importDefault(Flag_1);
    NotificationList_2 = __importDefault(NotificationList_2);
    PrimaryNav_1 = __importDefault(PrimaryNav_1);
    Sidebar_1 = __importDefault(Sidebar_1);
    Viewport_4 = __importDefault(Viewport_4);
    AbortPromise_5 = __importDefault(AbortPromise_5);
    Env_13 = __importDefault(Env_13);
    Task_4 = __importDefault(Task_4);
    const Masthead = Component_65.default.Builder('header', (masthead, view) => {
        masthead.style('masthead');
        const sidebar = (0, Sidebar_1.default)();
        const nav = (0, PrimaryNav_1.default)();
        (0, Button_25.default)()
            .style('masthead-skip-nav')
            .text.use('masthead/skip-navigation')
            .event.subscribe('click', view.focus)
            .appendTo(masthead);
        let popover;
        const left = (0, Component_65.default)()
            .append((0, Component_65.default)()
            .and(Button_25.default)
            .setIcon('bars')
            .style('masthead-left-hamburger', 'masthead-left-hamburger-sidebar')
            .ariaHidden()
            .event.subscribe('click', sidebar.toggle))
            .append((0, Button_25.default)()
            .setIcon('bars')
            .style('masthead-left-hamburger', 'masthead-left-hamburger-popover')
            .ariaLabel.use('masthead/primary-nav/alt')
            .clearPopover()
            .setPopover('hover', p => popover = p
            .anchor.add('aligned left', 'off bottom')
            .ariaRole('navigation')))
            .style('masthead-left')
            .appendTo(masthead);
        sidebar.style.bind(masthead.hasFocused, 'sidebar--visible-due-to-keyboard-navigation');
        Viewport_4.default.size.use(masthead, async () => {
            await Task_4.default.yield();
            nav.appendTo(sidebar.element.clientWidth ? sidebar : popover);
        });
        const flag = (0, Flag_1.default)()
            .style('masthead-home-logo');
        const homeLink = (0, Link_10.default)('/')
            .ariaLabel.use('home/label')
            .clearPopover()
            .append((0, Component_65.default)()
            .and(Button_25.default)
            .style('masthead-home', 'heading')
            .append(flag)
            .append((0, Component_65.default)('img')
            .style('masthead-home-logo-wordmark')
            .ariaHidden()
            .attributes.set('src', `${Env_13.default.URL_ORIGIN}image/logo-wordmark.svg`)))
            .appendTo(left);
        flag.style.bind(homeLink.hoveredOrFocused, 'flag--focused');
        flag.style.bind(homeLink.active, 'flag--active');
        homeLink.hoveredOrFocused.subscribe(masthead, focus => flag.wave('home link focus', focus));
        (0, Component_65.default)()
            .style('masthead-search')
            .appendTo(masthead);
        (0, Component_65.default)()
            .style('masthead-user')
            .append((0, Slot_16.default)().if(Session_19.default.Auth.loggedIn, () => (0, Button_25.default)()
            .setIcon('bell')
            .style('masthead-user-notifications')
            .clearPopover()
            .ariaLabel.use('masthead/user/notifications/alt')
            .append((0, Slot_16.default)().use(Notifications_1.default.unreadCount, (slot, count) => !count ? undefined
            : (0, Component_65.default)()
                .style('masthead-user-notifications-badge')
                .text.set(`${count}`)))
            .setPopover('hover', popover => popover
            .style('masthead-user-notifications-popover')
            .anchor.add('aligned right', 'off bottom')
            .append((0, Slot_16.default)().use(Notifications_1.default.recentUnreads, AbortPromise_5.default.asyncFunction(async (signal, slot, notifications) => {
            const query = EndpointNotificationGetUnread_2.default.prep().setPageSize(5);
            const list = await (0, NotificationList_2.default)(query, notifications.slice(0, 5));
            if (signal.aborted)
                return;
            list.type('flush')
                .style('masthead-user-notifications-list');
            list.header.style('masthead-user-notifications-list-header');
            list.title.style('masthead-user-notifications-list-title');
            list.content.style('masthead-user-notifications-list-content');
            list.footer.style('masthead-user-notifications-list-footer');
            (0, Link_10.default)('/notifications')
                .and(Button_25.default)
                .type('flush')
                .text.use('masthead/user/notifications/link/label')
                .appendTo(list.footer.middle);
            list.appendTo(slot);
        }))))))
            .append((0, Button_25.default)()
            .setIcon('circle-user')
            .clearPopover()
            .ariaLabel.use('masthead/user/profile/alt')
            .setPopover('hover', popover => popover
            .anchor.add('aligned right', 'off bottom')
            .ariaRole('navigation')
            .append((0, Slot_16.default)()
            .use(Session_19.default.Auth.author, (slot, author) => {
            if (!author) {
                (0, Link_10.default)('/account')
                    .and(Button_25.default)
                    .type('flush')
                    .style('masthead-popover-link-button')
                    .text.use('masthead/user/profile/popover/login')
                    .appendTo(slot);
                return;
            }
            (0, Link_10.default)(`/author/${author.vanity}`)
                .and(Button_25.default)
                .type('flush')
                .style('masthead-popover-link-button')
                .text.use('masthead/user/profile/popover/profile')
                .appendTo(slot);
            (0, Link_10.default)('/account')
                .and(Button_25.default)
                .type('flush')
                .style('masthead-popover-link-button')
                .text.use('masthead/user/profile/popover/account')
                .appendTo(slot);
            (0, Button_25.default)()
                .type('flush')
                .style('masthead-popover-link-button')
                .text.use('view/account/action/logout')
                .event.subscribe('click', () => Session_19.default.reset())
                .appendTo(slot);
        }))))
            .appendTo(masthead);
        return masthead.extend(masthead => ({
            sidebar,
        }));
    });
    exports.default = Masthead;
});
define("ui/utility/ActiveListener", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ActiveListener;
    (function (ActiveListener) {
        let lastActive = [];
        function allActive() {
            return lastActive;
        }
        ActiveListener.allActive = allActive;
        function active() {
            return lastActive.at(-1);
        }
        ActiveListener.active = active;
        function* allActiveComponents() {
            for (const element of lastActive) {
                const component = element.component;
                if (component)
                    yield component;
            }
        }
        ActiveListener.allActiveComponents = allActiveComponents;
        function activeComponent() {
            return lastActive.at(-1)?.component;
        }
        ActiveListener.activeComponent = activeComponent;
        function listen() {
            document.addEventListener('mousedown', updateActive);
            document.addEventListener('mouseup', updateActive);
            function updateActive() {
                const allActive = document.querySelectorAll(':active');
                const active = allActive[allActive.length - 1];
                if (active === lastActive[lastActive.length - 1])
                    return;
                const newActive = [...allActive];
                for (const element of lastActive)
                    if (element.component && !newActive.includes(element))
                        element.component.active.asMutable?.setValue(false);
                for (const element of newActive)
                    if (element.component && !lastActive.includes(element))
                        element.component.active.asMutable?.setValue(true);
                lastActive = newActive;
            }
        }
        ActiveListener.listen = listen;
    })(ActiveListener || (ActiveListener = {}));
    exports.default = ActiveListener;
    Object.assign(window, { ActiveListener });
});
define("App", ["require", "exports", "lang/en-nz", "model/FormInputLengths", "model/Session", "navigation/Navigate", "style", "ui/Component", "ui/component/core/toast/ToastList", "ui/component/Masthead", "ui/InputBus", "ui/utility/ActiveListener", "ui/utility/FocusListener", "ui/utility/HoverListener", "ui/utility/Mouse", "ui/utility/Viewport", "ui/view/shared/component/ViewContainer", "utility/Async", "utility/DevServer", "utility/Store", "utility/Time"], function (require, exports, en_nz_16, FormInputLengths_6, Session_20, Navigate_1, style_2, Component_66, ToastList_1, Masthead_1, InputBus_2, ActiveListener_1, FocusListener_3, HoverListener_2, Mouse_5, Viewport_5, ViewContainer_1, Async_5, DevServer_2, Store_6, Time_9) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    en_nz_16 = __importDefault(en_nz_16);
    FormInputLengths_6 = __importDefault(FormInputLengths_6);
    Session_20 = __importDefault(Session_20);
    Navigate_1 = __importDefault(Navigate_1);
    style_2 = __importDefault(style_2);
    Component_66 = __importDefault(Component_66);
    ToastList_1 = __importDefault(ToastList_1);
    Masthead_1 = __importDefault(Masthead_1);
    InputBus_2 = __importDefault(InputBus_2);
    ActiveListener_1 = __importDefault(ActiveListener_1);
    FocusListener_3 = __importDefault(FocusListener_3);
    HoverListener_2 = __importDefault(HoverListener_2);
    Mouse_5 = __importDefault(Mouse_5);
    Viewport_5 = __importDefault(Viewport_5);
    ViewContainer_1 = __importDefault(ViewContainer_1);
    Async_5 = __importDefault(Async_5);
    DevServer_2 = __importDefault(DevServer_2);
    Store_6 = __importDefault(Store_6);
    Time_9 = __importDefault(Time_9);
    async function App() {
        if (location.pathname.startsWith('/auth/')) {
            if (location.pathname.endsWith('/error')) {
                const params = new URLSearchParams(location.search);
                // eslint-disable-next-line no-debugger
                debugger;
                Store_6.default.items.popupError = {
                    code: +(params.get('code') ?? '500'),
                    message: params.get('message') ?? 'Internal Server Error',
                };
            }
            window.close();
        }
        await screen?.orientation?.lock?.('portrait-primary').catch(() => { });
        InputBus_2.default.subscribe('down', event => {
            if (event.use('F6'))
                for (const stylesheet of document.querySelectorAll('link[rel=stylesheet]')) {
                    const href = stylesheet.getAttribute('href');
                    const newHref = `${href.slice(0, Math.max(0, href.indexOf('?')) || Infinity)}?${Math.random().toString().slice(2)}`;
                    stylesheet.setAttribute('href', newHref);
                }
            if (event.use('F4'))
                document.documentElement.classList.add('persist-tooltips');
        });
        InputBus_2.default.subscribe('up', event => {
            if (event.use('F4'))
                document.documentElement.classList.remove('persist-tooltips');
        });
        await FormInputLengths_6.default.getManifest();
        // const path = URL.path ?? URL.hash;
        // if (path === AuthView.id) {
        // 	URL.hash = null;
        // 	URL.path = null;
        // }
        // ViewManager.showByHash(URL.path ?? URL.hash);
        await Promise.race([
            Session_20.default.refresh(),
            Async_5.default.sleep(Time_9.default.seconds(2)),
        ]);
        HoverListener_2.default.listen();
        ActiveListener_1.default.listen();
        FocusListener_3.default.listen();
        Mouse_5.default.listen();
        Viewport_5.default.listen();
        DevServer_2.default.connect();
        document.title = en_nz_16.default['fluff4me/title']().toString();
        document.body.classList.add(...style_2.default.body);
        const view = (0, ViewContainer_1.default)();
        const masthead = (0, Masthead_1.default)(view);
        const related = (0, Component_66.default)()
            .style('app-content-related');
        const content = (0, Component_66.default)()
            .style('app-content')
            .monitorScrollEvents()
            .append(view, related);
        const app = (0, Component_66.default)()
            .style('app')
            .append(masthead, masthead.sidebar, content)
            .append((0, ToastList_1.default)())
            .extend(app => ({
            navigate: (0, Navigate_1.default)(app),
            view,
        }))
            .appendTo(document.body);
        await app.navigate.fromURL();
        Object.assign(window, { app });
        return app;
    }
    exports.default = App;
});
define("Constants", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.APP_NAME = void 0;
    exports.APP_NAME = 'fluff4.me / Queer Webnovels';
});
define("utility/DOMRect", ["require", "exports", "utility/Define", "utility/maths/Vector2"], function (require, exports, Define_6, Vector2_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = default_1;
    Define_6 = __importDefault(Define_6);
    Vector2_3 = __importDefault(Vector2_3);
    function default_1() {
        Define_6.default.magic(DOMRect.prototype, 'centreX', {
            get() {
                return this.left + this.width / 2;
            },
        });
        Define_6.default.magic(DOMRect.prototype, 'centreY', {
            get() {
                return this.top + this.height / 2;
            },
        });
        Define_6.default.magic(DOMRect.prototype, 'centre', {
            get() {
                return (0, Vector2_3.default)(this.left + this.width / 2, this.top + this.height / 2);
            },
        });
        Define_6.default.magic(DOMRect.prototype, 'position', {
            get() {
                return (0, Vector2_3.default)(this.left, this.top);
            },
        });
        (0, Define_6.default)(DOMRect.prototype, 'expand', function (amount) {
            return new DOMRect(this.x - amount, this.y - amount, this.width + amount * 2, this.height + amount * 2);
        });
        (0, Define_6.default)(DOMRect.prototype, 'contract', function (amount) {
            return new DOMRect(Math.min(this.x + amount, this.centreX), Math.min(this.y - amount, this.centreY), Math.max(0, this.width - amount * 2), Math.max(0, this.height - amount * 2));
        });
        (0, Define_6.default)(DOMRect.prototype, 'intersects', function (target) {
            if ('width' in target)
                return true
                    && this.left >= target.right
                    && this.right <= target.left
                    && this.top >= target.bottom
                    && this.bottom <= target.top;
            return true
                && this.left <= target.x && this.right >= target.x
                && this.top <= target.y && this.bottom >= target.y;
        });
    }
});
define("utility/Elements", ["require", "exports", "utility/Define"], function (require, exports, Define_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Define_7 = __importDefault(Define_7);
    var Elements;
    (function (Elements) {
        function applyPrototypes() {
            Define_7.default.set(Element.prototype, 'asType', function (tagName) {
                return this.tagName.toLowerCase() === tagName ? this : undefined;
            });
        }
        Elements.applyPrototypes = applyPrototypes;
    })(Elements || (Elements = {}));
    exports.default = Elements;
});
define("index", ["require", "exports", "utility/Arrays", "utility/DOMRect", "utility/Elements", "browser-source-map-support", "utility/Env"], function (require, exports, Arrays_8, DOMRect_1, Elements_1, browser_source_map_support_1, Env_14) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Arrays_8 = __importDefault(Arrays_8);
    DOMRect_1 = __importDefault(DOMRect_1);
    Elements_1 = __importDefault(Elements_1);
    browser_source_map_support_1 = __importDefault(browser_source_map_support_1);
    Env_14 = __importDefault(Env_14);
    Object.assign(window, {
        _: undefined,
        select: (fn) => fn(),
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    browser_source_map_support_1.default.install({
        environment: 'browser',
    });
    // view transition api fallback
    const noopViewTransition = {
        finished: Promise.resolve(undefined),
        ready: Promise.resolve(undefined),
        updateCallbackDone: Promise.resolve(undefined),
        skipTransition: () => { },
    };
    document.startViewTransition ??= cb => {
        cb?.();
        return noopViewTransition;
    };
    (0, DOMRect_1.default)();
    Arrays_8.default.applyPrototypes();
    Elements_1.default.applyPrototypes();
    void (async () => {
        await Env_14.default.load();
        const app = await new Promise((resolve_2, reject_2) => { require(['App'], resolve_2, reject_2); }).then(__importStar);
        await app.default();
    })();
});
define("endpoint/feed/EndpointFeedGetAuthed", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_36) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_36 = __importDefault(Endpoint_36);
    exports.default = (0, Endpoint_36.default)('/feed/get/authed', 'get');
});
define("endpoint/feed/EndpointFeedGetFollowed", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_37) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_37 = __importDefault(Endpoint_37);
    exports.default = (0, Endpoint_37.default)('/feed/get/followed', 'get');
});
define("endpoint/follow/EndpointFollowAdd", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_38) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_38 = __importDefault(Endpoint_38);
    exports.default = (0, Endpoint_38.default)('/follow/{type}/{vanity}', 'post');
});
define("endpoint/follow/EndpointFollowAddWork", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_39) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_39 = __importDefault(Endpoint_39);
    exports.default = (0, Endpoint_39.default)('/follow/work/{author}/{vanity}', 'post');
});
define("endpoint/follow/EndpointFollowGet", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_40) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_40 = __importDefault(Endpoint_40);
    exports.default = (0, Endpoint_40.default)('/follows/{type}/{vanity}', 'get');
});
define("endpoint/follow/EndpointFollowGetAll", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_41) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_41 = __importDefault(Endpoint_41);
    exports.default = (0, Endpoint_41.default)('/following/{type}', 'get');
});
define("endpoint/follow/EndpointFollowGetAllMerged", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_42) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_42 = __importDefault(Endpoint_42);
    exports.default = (0, Endpoint_42.default)('/following', 'get');
});
define("endpoint/follow/EndpointFollowGetWork", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_43) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_43 = __importDefault(Endpoint_43);
    exports.default = (0, Endpoint_43.default)('/follows/work/{author}/{vanity}', 'get');
});
define("endpoint/follow/EndpointFollowRemove", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_44) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_44 = __importDefault(Endpoint_44);
    exports.default = (0, Endpoint_44.default)('/unfollow/{type}/{vanity}', 'post');
});
define("endpoint/follow/EndpointFollowRemoveWork", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_45) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_45 = __importDefault(Endpoint_45);
    exports.default = (0, Endpoint_45.default)('/unfollow/work/{author}/{vanity}', 'post');
});
define("endpoint/ignore/EndpointIgnoreAdd", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_46) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_46 = __importDefault(Endpoint_46);
    exports.default = (0, Endpoint_46.default)('/ignore/{type}/{vanity}', 'post');
});
define("endpoint/ignore/EndpointIgnoreAddWork", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_47) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_47 = __importDefault(Endpoint_47);
    exports.default = (0, Endpoint_47.default)('/ignore/work/{author}/{vanity}', 'post');
});
define("endpoint/ignore/EndpointIgnoreGet", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_48) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_48 = __importDefault(Endpoint_48);
    exports.default = (0, Endpoint_48.default)('/ignores/{type}/{vanity}', 'get');
});
define("endpoint/ignore/EndpointIgnoreGetAll", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_49) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_49 = __importDefault(Endpoint_49);
    exports.default = (0, Endpoint_49.default)('/ignoring/{type}', 'get');
});
define("endpoint/ignore/EndpointIgnoreGetAllMerged", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_50) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_50 = __importDefault(Endpoint_50);
    exports.default = (0, Endpoint_50.default)('/ignoring', 'get');
});
define("endpoint/ignore/EndpointIgnoreGetWork", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_51) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_51 = __importDefault(Endpoint_51);
    exports.default = (0, Endpoint_51.default)('/ignores/work/{author}/{vanity}', 'get');
});
define("endpoint/ignore/EndpointIgnoreRemove", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_52) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_52 = __importDefault(Endpoint_52);
    exports.default = (0, Endpoint_52.default)('/unignore/{type}/{vanity}', 'post');
});
define("endpoint/ignore/EndpointIgnoreRemoveWork", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_53) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_53 = __importDefault(Endpoint_53);
    exports.default = (0, Endpoint_53.default)('/unignore/work/{author}/{vanity}', 'post');
});
define("endpoint/patreon/EndpointPatreonGetTiers", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_54) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_54 = __importDefault(Endpoint_54);
    exports.default = (0, Endpoint_54.default)('/patreon/campaign/tiers/get', 'get');
});
define("endpoint/patreon/EndpointPatreonSetThresholds", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_55) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_55 = __importDefault(Endpoint_55);
    exports.default = (0, Endpoint_55.default)('/patreon/campaign/tiers/set/{author}/{vanity}', 'post');
});
define("endpoint/privilege/EndpointPrivilegeGetAllAuthor", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_56) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_56 = __importDefault(Endpoint_56);
    exports.default = (0, Endpoint_56.default)('/privilege/get/{vanity}', 'get');
});
define("endpoint/privilege/EndpointPrivilegeGrantAuthor", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_57) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_57 = __importDefault(Endpoint_57);
    exports.default = (0, Endpoint_57.default)('/privilege/grant/author/{vanity}', 'post');
});
define("endpoint/privilege/EndpointPrivilegeGrantRole", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_58) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_58 = __importDefault(Endpoint_58);
    exports.default = (0, Endpoint_58.default)('/privilege/grant/role/{vanity}', 'post');
});
define("endpoint/privilege/EndpointPrivilegeRevokeAuthor", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_59) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_59 = __importDefault(Endpoint_59);
    exports.default = (0, Endpoint_59.default)('/privilege/revoke/author/{vanity}', 'post');
});
define("endpoint/privilege/EndpointPrivilegeRevokeRole", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_60) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_60 = __importDefault(Endpoint_60);
    exports.default = (0, Endpoint_60.default)('/privilege/revoke/role/{vanity}', 'post');
});
define("endpoint/role/EndpointRoleCreate", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_61) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_61 = __importDefault(Endpoint_61);
    exports.default = (0, Endpoint_61.default)('/role/create', 'post');
});
define("endpoint/role/EndpointRoleDelete", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_62) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_62 = __importDefault(Endpoint_62);
    exports.default = (0, Endpoint_62.default)('/role/delete/{role}', 'post');
});
define("endpoint/role/EndpointRoleGrantAuthor", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_63) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_63 = __importDefault(Endpoint_63);
    exports.default = (0, Endpoint_63.default)('/role/grant/{role}/{author}', 'post');
});
define("endpoint/role/EndpointRoleListAll", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_64) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_64 = __importDefault(Endpoint_64);
    exports.default = (0, Endpoint_64.default)('/role/get', 'get');
});
define("endpoint/role/EndpointRoleReorder", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_65) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_65 = __importDefault(Endpoint_65);
    exports.default = (0, Endpoint_65.default)('/role/reorder', 'post');
});
define("endpoint/role/EndpointRoleRevokeAuthor", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_66) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_66 = __importDefault(Endpoint_66);
    exports.default = (0, Endpoint_66.default)('/role/revoke/{role}/{author}', 'post');
});
define("endpoint/role/EndpointRoleUpdate", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_67) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_67 = __importDefault(Endpoint_67);
    exports.default = (0, Endpoint_67.default)('/role/update/{role}', 'post');
});
define("endpoint/tag/EndpointTagCreateCategory", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_68) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_68 = __importDefault(Endpoint_68);
    exports.default = (0, Endpoint_68.default)('/tag/create/category', 'post');
});
define("endpoint/tag/EndpointTagCreateGlobal", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_69) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_69 = __importDefault(Endpoint_69);
    exports.default = (0, Endpoint_69.default)('/tag/create/global', 'post');
});
define("endpoint/tag/EndpointTagCustomPromote", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_70) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_70 = __importDefault(Endpoint_70);
    exports.default = (0, Endpoint_70.default)('/tag/promote/{vanity}', 'post');
});
define("endpoint/tag/EndpointTagDeleteCategory", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_71) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_71 = __importDefault(Endpoint_71);
    exports.default = (0, Endpoint_71.default)('/tag/delete/category/{vanity}', 'post');
});
define("endpoint/tag/EndpointTagDeleteGlobal", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_72) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_72 = __importDefault(Endpoint_72);
    exports.default = (0, Endpoint_72.default)('/tag/delete/global/{vanity}', 'post');
});
define("endpoint/tag/EndpointTagGlobalDemote", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_73) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_73 = __importDefault(Endpoint_73);
    exports.default = (0, Endpoint_73.default)('/tag/demote/{vanity}', 'post');
});
define("endpoint/tag/EndpointTagUpdateCategory", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_74) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_74 = __importDefault(Endpoint_74);
    exports.default = (0, Endpoint_74.default)('/tag/update/category/{vanity}', 'post');
});
define("endpoint/tag/EndpointTagUpdateGlobal", ["require", "exports", "endpoint/Endpoint"], function (require, exports, Endpoint_75) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Endpoint_75 = __importDefault(Endpoint_75);
    exports.default = (0, Endpoint_75.default)('/tag/update/global/{vanity}', 'post');
});
define("ui/component/core/ActionHeading", ["require", "exports", "ui/Component", "ui/component/core/ActionRow", "ui/component/core/Heading"], function (require, exports, Component_67, ActionRow_8, Heading_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Component_67 = __importDefault(Component_67);
    ActionRow_8 = __importDefault(ActionRow_8);
    Heading_3 = __importDefault(Heading_3);
    const ActionHeading = Component_67.default.Builder((component) => {
        const row = component.and(ActionRow_8.default)
            .viewTransition('action-heading')
            .style('action-heading');
        const heading = row.left.and(Heading_3.default).style('action-heading-heading');
        return row.extend(row => ({
            heading,
        }));
    });
    exports.default = ActionHeading;
});
define("utility/Debug", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Debug = void 0;
    var Debug;
    (function (Debug) {
        Debug.placeholder = false;
    })(Debug || (exports.Debug = Debug = {}));
    Object.assign(window, { Debug });
});
define("utility/Tuples", ["require", "exports", "utility/Arrays"], function (require, exports, Arrays_9) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Arrays_9 = __importDefault(Arrays_9);
    var Tuples;
    (function (Tuples) {
        function make(...values) {
            return values;
        }
        Tuples.make = make;
        const nullishFilters = Object.fromEntries(Arrays_9.default.range(6)
            .map(index => make(index, (value) => value[index] !== undefined && value[index] !== null)));
        function filterNullish(index) {
            return nullishFilters[index];
        }
        Tuples.filterNullish = filterNullish;
        const falsyFilters = Object.fromEntries(Arrays_9.default.range(6)
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            .map(index => make(index, (value) => value[index])));
        function filterFalsy(index) {
            return falsyFilters[index];
        }
        Tuples.filterFalsy = filterFalsy;
        function getter(index) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return tuple => tuple[index];
        }
        Tuples.getter = getter;
        function filter(index, predicate) {
            return (tuple, i) => predicate(tuple[index], i);
        }
        Tuples.filter = filter;
    })(Tuples || (Tuples = {}));
    exports.default = Tuples;
});
