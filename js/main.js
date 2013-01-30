/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
var URL_ARGS, DEBUG;

if (DEBUG) {
    URL_ARGS = 'cb=' + Math.random();
}

require(['./common'], function (common) {
    require([
            'views/accountLoginView',
            'views/projectSidebarView',
            'views/projectAppView',
             // 'views/projectNavigationSidebarView',
             'views/projectResourceSidebarView',
             // 'views/projectListItemView',
             'views/projectEditView',
             'views/resourceNavigationView'
            ], function() {
        common.backbone.history.start();
    });
});
