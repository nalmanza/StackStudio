/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true */
define([
        'models/resource/resourceModel',
        'common'
], function( ResourceModel, Common ) {
    'use strict';

    var Policy = ResourceModel.extend({

        idAttribute: "_id",
        
        defaults: {
            id: '',
            name: ''
        },
        
        create: function(name,options,oS,credentialId) {
            var url = Common.apiUrl + "/identity/v1/policies?&cred_id=" + credentialId;
            this.sendAjaxAction(url, "POST", {"policy": options,"policy_os": oS,"name":name}, "policyAppRefresh", "Policy Created");
        },
        
        save: function(name,options,oS,pW,id, orgId) {
            var url;    
            if(id === undefined){
                url = Common.apiUrl + "/identity/v1/policies?&org_id=" + orgId;
            }else{
                url = Common.apiUrl + "/identity/v1/policies/"+id+"?&org_id=" + orgId;
            }
            this.sendAjaxAction(url, "POST", {"policy": options,"policy_os" : oS,"policy_pw" : pW ,"name":name}, "policyAppRefresh", "Policy Saved");
        },
        
        addToGroup: function(options,orgId,login) {
            //var url = Common.apiUrl + "/identity/v1/policies/groups?&org_id=" + orgId;
            var url = Common.apiUrl + "/identity/v1/policies/groups?&login=" + login;
            this.sendAjaxAction(url, "POST", {"policy": options}, "groupRefresh");
        },
        
        destroy: function() {
            var url = Common.apiUrl + "/identity/v1/policies/" + this.id + "?_method=DELETE";
            this.sendAjaxAction(url, "POST", undefined, "policyAppRefresh");
        }
    });

    return Policy;
});
