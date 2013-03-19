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
        'text!templates/aws/rds/awsRelationalDatabaseAppTemplate.html',
        '/js/aws/models/rds/awsRelationalDatabase.js',
        '/js/aws/collections/rds/awsRelationalDatabases.js',
        '/js/aws/views/rds/awsRelationalDatabaseCreateView.js',
        'icanhaz',
        'common',
        'morris',
        'spinner',
        'jquery.dataTables'
], function( $, _, Backbone, ResourceAppView, relationalDatabaseAppTemplate, RelationalDatabase, RelationalDatabases, RelationalDatabaseCreate, ich, Common, Morris, Spinner ) {
    'use strict';

    var AwsRdsAppView = ResourceAppView.extend({
        
        template: _.template(relationalDatabaseAppTemplate),
        
        modelStringIdentifier: "id",
        
        columns: ["id", "flavor_id", "allocated_storage", "engine", "availability_zone", "state"],
        
        idColumnNumber: 0,
        
        model: RelationalDatabase,
        
        collectionType: RelationalDatabases,
        
        type: "rds",
        
        subtype: "relationaldatabases",
        
        CreateView: RelationalDatabaseCreate,
        
        events: {
            'click .create_button': 'createNew',
            'click #action_menu ul li': 'performAction',
            'click #resource_table tr': "clickOne",
        },

        initialize: function(options) {
            if(options.cred_id) {
                this.credentialId = options.cred_id;
            }
            this.render();
            
            var rdsApp = this;
            Common.vent.on("rdsAppRefresh", function() {
                rdsApp.render();
            });
        },
        
        toggleActions: function(e) {
            //Disable any needed actions
        },
        
        performAction: function(event) {
            var rds = this.collection.get(this.selectedId);
            
            switch(event.target.text)
            {
            case "Delete":
                rds.destroy(this.credentialId);
                break;
            }
        }
    });

    return AwsRdsAppView;
});
