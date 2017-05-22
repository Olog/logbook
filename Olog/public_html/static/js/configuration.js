/*
 * Configuration file for setting global variables
 *
 * @author: Dejan Dežman <dejan.dezman@cosylab.com>
 */

/**
 * Variables that can be and should be configured by user
 */


// Version number
var version = "0.5";

// For accessing the REST service
var serviceurl = window.location.protocol + "//" + window.location.host + "/Olog/resources/";

// For all the dates shown in client
// Format docs can be found at http://momentjs.com/docs/#/displaying/format/
var dateFormat = "M/D/YY, h:mm a";

// jQuery datepicker plugin has its onw date format so it is defined separately.
// Format switches can be found at http://api.jqueryui.com/datepicker/
var datePickerDateFormat = "mm/dd/yy";

// jQuery timepicker plugin has its onw date format so it is defined separately.
// Format switches can be found at http://trentrichardson.com/examples/timepicker/
var datePickerTimeFormat = "hh:mm";

// Date from the datepicker is put in the search input but need to be parsed
// to build a REST service query. Format documentation can be found at
// http://momentjs.com/docs/#/parsing/
var datePickerDateFormatMometParseString = "MM/DD/YYYY hh:mm";

// Start of the week in the jQuery datepicker: 0: Sunday, 1: Monday, ...
var datePickerFirstName = 1;

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
	'owner:': 'owner=',
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

// Create From filter definition array. Other values can be added in this array to
// extend the functionality.
// @param name name of the filter which will be visibla by the user
// @param value value of the filter that can be parsed with the regular expression
var createdFromFilterDefinition = [
	{name:"Last min", value:"last 1 min"},
	{name:"Last hour", value:"last 1 hour"},
	{name:"Last day", value:"last 1 day"},
	{name:"Last week", value:"last 1 week"}
];

// Available sizes for Log attachments. These sites will be displayed in the
// Image size dropdown list.
// list:
// @param name is the name of the size that will be displayed as a list item
// @param scale is a scale, attachment will be resized to
// @param correction is a parameter that can be set to correct image sizes so they
// fit in the right pane in all browsers
// selected:
// represents the default selected size
// current:
// represents the current selected size
var imageSizes = {
	list:[
		{name:'small', scale:'0.25', correction:'15'},
		{name:'medium', scale:'0.5', correction:'25'},
		{name:'large', scale:'1', correction:'0'}
	],
	defaultSize:1,
	current:-1
};

// Map size names to list item array position
var backwardImageSizesMap = {
	small:0,
	medium:1,
	large:2
};

// Update interval in seconds. After this time has elapsed system will check if
// new Log entries were created. If updateInterval is set to -1, checking will
// be disabled.
var updateInterval = 60;

// Settings cookie name
var settingsCookieName = "olog";

// Maximum width of small resolution. If Olog will be displayed in smaller
// width, panes will be stacked one upon each other and filters will be closed.
// If this constant is changes, constant should also be changed in style.css
// file.
var smallScreenResolutionWidth = 1024;

// Available Levels
var levels = ["Info", "Problem", "Request", "Suggestion", "Urgent"];

//Markdown toolbar sections
var mdToolbar = [
	"bold", "italic", "strikethrough",
    "|",
    "heading", "heading-smaller", "heading-bigger",
    "|",
    "unordered-list", "ordered-list", "link", "image", "table",
	"|",
	"preview", "guide"
	];


//Used to keep track of the search tags and information
var searchInputElements = {
    logbook:{},
    tagt:{},
    start:{},
    end:{},
    owner:{},
    from:{},
    to:{},
    search:{},
	default:{}
};

/**
 * Global variables needed by more than one page. SHOULD NOT BE CONFIGURED BY THE USER!
 */

// Current Log search url
var searchURL = "";

// Current Log displayed
var selectedLog = "";

// Html file that contain modal windows
var modalWindows = "static/html/modal_windows.html";

// Html file that contain templates
var templates = "static/html/templates.html";

// Selected filter elements are saved into an object
var selectedElements = {};

// Olog settings that are saved in Olog settings cookie
var ologSettings = {};

// Should history be included by default
var includeHistory = true;

//If the StartDate should be displayed for logs
var includeStartDate = true;

// URL parameter for displaying log's history
var historyParameter = "history";

// URL parameter for displaying particular version of log entry
var versionParameter = "version";

// Default version order
var logVersionOrder = true;

// Place delete button into Log details and allow deleting if this property is set to true
var allowDeletingLogs = false;

// Global log id placeholder
var globalLogId = undefined;

// If in read-only mode
var inReadOnly = false;
