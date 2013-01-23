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
        'text!templates/aws/block_storage/awsVolumeAppTemplate.html',
        '/js/aws/models/block_storage/awsVolume.js',
        '/js/aws/collections/block_storage/awsVolumes.js',
        '/js/aws/views/block_storage/awsVolumeRowView.js',
        '/js/aws/views/block_storage/awsVolumeCreateView.js',
        'icanhaz',
        'common',
        'jquery.dataTables'
], function( $, _, Backbone, AppView, awsVolumeAppTemplate, Volume, volumes, AwsVolumeRowView, AwsVolumeCreateView, ich, Common ) {
	'use strict';

	// Aws Application View
	// ------------------------------

    /**
     * Aws AppView is UI view list of cloud items.
     *
     * @name AppView
     * @constructor
     * @category Resources
     * @param {Object} initialization object.
     * @returns {Object} Returns an AwsAppView instance.
     */
	var AwsVolumesAppView = AppView.extend({
	    template: _.template(awsVolumeAppTemplate),
	    
        modelStringIdentifier: "volumeId",
        
        idRowNumber: 2,
        
        model: Volume,
        
        collection: volumes,
        
        type: "block_storage",
        
        subtype: "volumes",
        
        CreateView: AwsVolumeCreateView,
        
        RowView: AwsVolumeRowView,
        
        events: {
            'click #create_button': 'createNew',
            'click #resource_table tbody': 'clickOne'
        },

        initialize: function() {
            this.render();
        }
	});
    
	return AwsVolumesAppView;
});