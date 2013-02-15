/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
        'jquery',
        'underscore',
        'backbone',
        'views/resourceAppView',
        'text!templates/aws/cloud_watch/awsAlarmAppTemplate.html',
        '/js/aws/models/cloud_watch/awsAlarm.js',
        '/js/aws/collections/cloud_watch/awsAlarms.js',
        '/js/aws/views/cloud_watch/awsAlarmCreateView.js',
        'icanhaz',
        'common',
        'jquery.dataTables'
], function( $, _, Backbone, ResourceAppView, awsAlarmAppTemplate, Alarm, Alarms, AwsAlarmCreate, ich, Common ) {
    'use strict';

    // Aws Reserved Instance Application View
    // ------------------------------

    /**
     * AwsAlarmAppView is UI view list of aws alarms.
     *
     * @name AwsAlarmAppView
     * @constructor
     * @category Resources
     * @param {Object} initialization object.
     * @returns {Object} Returns a AwsAlarmAppView instance.
     */
    var AwsAlarmAppView = ResourceAppView.extend({
        template: _.template(awsAlarmAppTemplate),
        
        modelStringIdentifier: "id",
        
        columns: ["id", "threshold", "state_value"],
        
        idColumnNumber: 0,
        
        model: Alarm,
        
        collectionType: Alarms,
        
        type: "cloud_watch",
        
        subtype: "alarms",
        
        CreateView: AwsAlarmCreate,
        
        events: {
            'click .create_button': 'createNew',
            'click #resource_table tr': 'toggleActions'
        },

        initialize: function(options) {
            if(options.cred_id) {
                this.credentialId = options.cred_id;
            }
            this.render();
        },
        
        toggleActions: function(e) {
            this.clickOne(e);
            var rowData = this.$table.fnGetData(e.currentTarget);
        }
    });
    
    return AwsAlarmAppView;
});
