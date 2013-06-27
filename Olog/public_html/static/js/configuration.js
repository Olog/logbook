/*
 * Configuration file for setting global variables
 *
 * @author: Dejan Dežman <dejan.dezman@cosylab.com>
 */

/**
 * Variables that can be and should be configured by user
 */

// For accessing the REST service
var serviceurl = "http://localhost:8080/Olog/resources/";

// For all the dates shown in client
// Mormat docs can be found at http://momentjs.com/docs/#/displaying/format/
var dateFormat = "MMMM Do YYYY, h:mm a";

// How many logs do you want to load per request?
var numberOfLogsPerLoad = 20;

// Set the name of the cookie that holds selected filters
var filtersCookieName = "filters";

// Set the name of the cookie that holds the user data
var sessionCookieName = "SESSION";

// Write logs to console
var writeLogs = true;

// First page name
var firstPageName = "index.html";

// Search key map. Function will extract value from search input, try to find
// keyMap keys in it and it will generate search query by replacing keyMap keys
// with keyMap values.
var keyMap = {
	'tag:': 'tag=',
	'logbook:': 'logbook=',
	'from:': 'start=',
	'start:': 'start=',
	'end:': 'end=',
	'to:': 'end=',
	'search:': 'search='
};

// Convert time filters to seconds. Forulas are evaluated and added or substracted from
// current time.
var timeFilter = {
	'min': '60',
	'mins': '60',
	'hour': '60*60',
	'hours': '60*60',
	'day': '24*60*60',
	'days': '24*60*60',
	'week': '7*24*60*60',
	'weeks': '7*24*60*60'
};

/**
 * Global variables needed by more than one page. SHOULD NOT BE CONFIGURED BY USER!
 */

// Current Log search url
var searchURL = "";

// Available Levels
var levels = ["Info", "Problem", "Request", "Suggestion", "Urgent"];

// Current Log displayed
var selectedLog = -1;