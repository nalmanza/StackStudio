/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
BASE_URL = 'js/vendor';

EXTRA_PATHS = {};

// Add the following to allow tests to force a reload of JS every time.
var URL_ARGS = 'cb=' + Math.random();

require(['./common', './main'], function (common) {
	require({
		paths: {
		    'jasmine': '../../node_modules/grunt-contrib-jasmine/vendor/jasmine-1.3.0/jasmine',
		    'jasmine-html': '../../node_modules/grunt-contrib-jasmine/vendor/jasmine-1.3.0/jasmine-html',
		},
		shim: {
			jasmine: {
				exports: 'jasmine'
			},
			'jasmine-html': {
				deps: ['jasmine'],
				exports: 'jasmine'
			}

		}
	},
	['underscore', 'jquery', 'jasmine-html'], function(_, $, jasmine){
		var jasmineEnv = jasmine.getEnv();
		jasmineEnv.updateInterval = 1000;

	    var trivialReporter = new jasmine.TrivialReporter();

	    jasmineEnv.addReporter(trivialReporter);

		jasmineEnv.specFilter = function(spec) {
			return trivialReporter.specFilter(spec);
		};

		var specs = [];

		specs.push('../../spec/console');

		$(function(){
			require(specs, function(){
				jasmineEnv.execute();
		    });
		});

	});
});

