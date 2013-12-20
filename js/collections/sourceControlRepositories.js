/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true alert:true*/
define([
        'jquery',
        'backbone',
        'models/sourceControlRepository',
        'common'
], function( $, Backbone, SourceControlRepository, Common) {
    'use strict';

    var SourceControlRepositoryList = Backbone.Collection.extend({

        model: SourceControlRepository,

        url: function(options){return Common.apiUrl + '/api/v1/source_control_repositories/org/' + sessionStorage.org_id;}
    
    });

    return SourceControlRepositoryList;

});