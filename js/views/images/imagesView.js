/*!
 * StackStudio 2.0.0-rc.1 <http://stackstudio.transcendcomputing.com>
 * (c) 2012 Transcend Computing <http://www.transcendcomputing.com/>
 * Available under ASL2 license <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
/*jshint smarttabs:true */
/*global define:true console:true requirejs:true require:true alert:true*/
define([
        'jquery',
        'underscore',
        'bootstrap',
        'backbone',
        'common',
        'text!templates/images/imagesTemplate.html',
        'text!templates/images/advancedTemplate.html',
        'models/packedImage',
        '/js/aws/collections/compute/awsImages.js',
        'collections/packedImages',
        'messenger',
        'jquery-ui',
        'jquery.form'
], function( $, _, bootstrap, Backbone, Common, imagesTemplate, advancedTemplate, PackedImage, Images, PackedImages, Messenger ) {

    var ImagesView = Backbone.View.extend({

        tagName: 'div',

        template: _.template(imagesTemplate),

        currentImageTemplate: undefined,
        
        images: undefined,
        
        packed_images: undefined,

        events: {
            "click #new_image_template_button": "newImageTemplate",
            "click #close_image_template_button": "closeImageTemplate",
            "change #image_type_select":"builderSelect",
            "change #image_config_management_select":"provisionerSelect",
            "change #dev_ops_select":"devopsSelect",
            "change #post_processor_select":"postProcessorSelect",
            "click .adv_tab": "advTabSelect",
            "click #save_image_template_button":"packImage",
            "click #deploy_image_template_button":"deployImage",
            "click .img_item":"loadPackedImage",
            "click .append-btn":"appendButton",
            "focus #os_input": "openImageList"
        },

        initialize: function() {
            $("#main").html(this.el);
            this.$el.html(this.template);
            
            var creds = JSON.parse(sessionStorage.cloud_credentials);
            $("#aws_cred_select").empty();
            for (var i in creds) {
                if(creds[i].cloud_credential.cloud_provider === "AWS"){
                    $("#aws_cred_select").append("<option value='"+creds[i].cloud_credential.id+"' data-ak='"+creds[i].cloud_credential.access_key+"' data-sk='"+creds[i].cloud_credential.secret_key+"'>"+creds[i].cloud_credential.name+"</option>");
                }
            }
            
            this.packed_images = new PackedImages();
            this.packed_images.on( 'reset', this.addAllPackedImages, this );
            
            this.images = new Images();
            this.images.on( 'reset', this.addAllImages, this );

            var piView = this;
            Common.vent.on("packedImageAppRefresh", function(data) {
                console.log(data);
                piView.currentImageTemplate.attributes.doc_id = data['Id'];
                piView.uploadAsync();
                piView.packed_images.fetch({reset: true});
            });

            this.fetchDropDowns();
            this.images.fetch({reset: true});
            this.packed_images.fetch({reset: true});
            
            $('#upForm').ajaxForm({
                success: function(data) {
                    new Messenger().post({type:"success", message:"File Uploaded..."});
                },
                contentType: 'application/x-www-form-urlencoded'
            });
        },

        render: function() {
            //Fetch image templates
            if(this.currentImageTemplate) {
                if(this.currentImageTemplate.id === "") {
                    // Set image template fields to defaults
                }else {
                    // Fill in the image template fields to match the selected image template
                }
                $("#image_template_not_opened").hide();
                $("#image_template_open").show();
            }else {
                $("#image_template_open").hide();
                $("#image_template_not_opened").show();
            }
        },

        newImageTemplate: function() {
            if(this.currentImageTemplate) {
                var confirmation = confirm("Are you sure you want to open a new image template? Any unsaved changes to the current template will be lose.");
                if(confirmation === true) {
                    this.currentImageTemplate = "test";
                    this.render();
                }
            }else {
                this.currentImageTemplate = "test";
                this.render();
            }
        },
        
        fetchDropDowns: function(){
            $.getJSON( Common.apiUrl + "/stackstudio/v1/packed_images/builders", function( builders ) {
                $("#image_type_select").empty();
                for (var key in builders) {
                    $("#image_type_select").append("<option>"+key+"</option>");
                }
                $.getJSON( Common.apiUrl + "/stackstudio/v1/packed_images/builders/" + $("#image_type_select").val().replace('-',''), function( builder ) {
                    $("#builder_settings").html(_.template(advancedTemplate)({optional: builder.optional, advanced: builder.advanced, qemu: undefined, required: builder.required, title: "Builder: "+$("#image_type_select").val()}));
                    $("#builder_settings").tooltip();
                });
            });
            $.getJSON( Common.apiUrl + "/stackstudio/v1/packed_images/provisioners", function( provisioners ) {
                $("#image_config_management_select").empty();
                $("#dev_ops_select").empty();
                for (var key in provisioners) {
                    if(key === 'chef-solo' || key === 'salt-masterless'){
                        $("#dev_ops_select").append("<option>"+key+"</option>");
                    }else{
                        $("#image_config_management_select").append("<option>"+key+"</option>");
                    }
                }
                $("#dev_ops_select").append("<option>None</option>");
                $("#image_config_management_select").append("<option>None</option>");
                $.getJSON( Common.apiUrl + "/stackstudio/v1/packed_images/provisioners/" + $("#image_config_management_select").val(), function( provisioner ) {
                    if(provisioner.required_xor !== undefined){
                        provisioner.required = provisioner.required_xor;
                    }
                    $("#provisioner_settings").html(_.template(advancedTemplate)({optional: provisioner.optional, advanced: provisioner.advanced, qemu: undefined, required: provisioner.required, title: "Provisioner: "+$("#image_config_management_select").val()}));
                    $("#provisioner_settings").tooltip();
                });
                $.getJSON( Common.apiUrl + "/stackstudio/v1/packed_images/provisioners/" + $("#dev_ops_select").val(), function( provisioner ) {
                    $("#devops_settings").html(_.template(advancedTemplate)({optional: provisioner.optional, advanced: provisioner.advanced, qemu: undefined, required: provisioner.required, title: "DevOps Tool: "+$("#dev_ops_select").val()}));
                    $("#devops_settings").tooltip();
                });
            });
            $.getJSON( Common.apiUrl + "/stackstudio/v1/packed_images/postprocessors", function( postprocessors ) {
                $("#post_processor_select").empty();
                for (var key in postprocessors) {
                    $("#post_processor_select").append("<option>"+key+"</option>");
                }
                $("#post_processor_select").append("<option>None</option>");
                $.getJSON( Common.apiUrl + "/stackstudio/v1/packed_images/postprocessors/" + $("#post_processor_select").val().replace('-',''), function( postprocessor ) {
                    var q = postprocessor.optional['qemu'];
                    delete postprocessor.optional['qemu'];
                    $("#postprocessor_settings").html(_.template(advancedTemplate)({optional: postprocessor.optional, advanced: postprocessor.advanced, qemu: q, required: postprocessor.required, title: "Post-Processor: "+$("#post_processor_select").val()}));
                    $("#postprocessor_settings").tooltip();
                });
            });
        },
        
        addAllImages: function() {
            var createView = this;
            $("#os_input").autocomplete({
                source: createView.images.toJSON(),
                minLength: 0
            })
            .data("autocomplete")._renderItem = function (ul, item){
                var imagePath;
                switch(item.logo)
                {
                case "aws":
                    imagePath = "/images/ImageLogos/amazon20.png";
                    break;
                case "redhat":
                    imagePath = "/images/ImageLogos/redhat20.png";
                    break;
                case "suse":
                    imagePath = "/images/ImageLogos/suse20.png";
                    break;
                case "ubuntu":
                    imagePath = "/images/ImageLogos/canonical20.gif";
                    break;
                case "windows":
                    imagePath = "/images/ImageLogos/windows20.png";
                    break;
                }
                var img = '<td style="width:22px;" rowspan="2"><img height="20" width="20" src="'+imagePath+'"/></td>';
                var name = '<td>'+item.label+'</td>';
                var description = '<td>'+item.description+'</td>';
                var imageItem = '<a><table stlye="min-width:150px;"><tr>'+ img + name + '</tr><tr>' + description + '</tr></table></a>';
                return $("<li>").data("item.autocomplete", item).append(imageItem).appendTo(ul);
            };
        },
        
        addAllPackedImages: function(collection){
            $("#packed_images_list").hide('slow');
            $("#packed_images_list").empty();
            collection.each(function(model) {
                $("#packed_images_list").append("<li><a id='"+model.attributes.doc_id+"' class='img_item'>"+model.attributes.name+"</a></li>");
            });
            $("#packed_images_list").show('slow');
        },
        
        openImageList: function() {
            if($("ul.ui-autocomplete").is(":hidden")) {
                $("#os_input").autocomplete("search", "");
            }
        },
        
        builderSelect: function(){
            $.getJSON( Common.apiUrl + "/stackstudio/v1/packed_images/builders/" + $("#image_type_select").val().replace('-',''), function( builder ) {
                $("#builder_settings").html(_.template(advancedTemplate)({optional: builder.optional, advanced: builder.advanced, qemu: undefined, required: builder.required, title: "Builder: "+$("#image_type_select").val()})).hide().fadeIn('slow');
                $("#builder_settings").tooltip();
            });
        },
        
        provisionerSelect: function(event){
            if($("#image_config_management_select").val() !== "None"){
                $.getJSON( Common.apiUrl + "/stackstudio/v1/packed_images/provisioners/" + $("#image_config_management_select").val(), function( provisioner ) {
                    if(provisioner.required_xor !== undefined){
                        provisioner.required = provisioner.required_xor;
                    }
                    $("#provisioner_settings").html(_.template(advancedTemplate)({optional: provisioner.optional, advanced: provisioner.advanced, qemu: undefined, required: provisioner.required, title: "Provisioner: "+$("#image_config_management_select").val()})).hide().fadeIn('slow');
                    $("#provisioner_settings").tooltip();
                });
            }else{
                $("#provisioner_settings").hide('slow').html('');
            }
        },

        devopsSelect: function(event){
            if($("#dev_ops_select").val() !== "None"){
                $.getJSON( Common.apiUrl + "/stackstudio/v1/packed_images/provisioners/" + $("#dev_ops_select").val(), function( provisioner ) {
                    $("#devops_settings").html(_.template(advancedTemplate)({optional: provisioner.optional, advanced: provisioner.advanced, qemu: undefined, required: provisioner.required, title: "DevOps Tool: "+$("#dev_ops_select").val()})).hide().fadeIn('slow');
                    $("#devops_settings").tooltip();
                });
            }else{
                $("#devops_settings").hide('slow').html('');
            }
        },
        
        postProcessorSelect: function(event){
            if($("#post_processor_select").val() !== "None"){
                $.getJSON( Common.apiUrl + "/stackstudio/v1/packed_images/postprocessors/" + $("#post_processor_select").val(), function( postprocessor ) {
                    var q = postprocessor.optional['qemu'];
                    delete postprocessor.optional['qemu'];
                    $("#postprocessor_settings").html(_.template(advancedTemplate)({optional: postprocessor.optional, advanced: postprocessor.advanced, qemu: q, required: postprocessor.required, title: "Post-Processor: "+$("#post_processor_select").val()})).hide().fadeIn('slow');
                    $("#postprocessor_settings").tooltip();
                });
            }else{
                $("#postprocessor_settings").hide('slow').html('');
            }
        },
        
        advTabSelect: function(event){
            $(".active").removeClass('active');
            $("#"+event.target.id).closest('li').addClass('active');
            $(".adv_tab_panel").hide('slow');
            if(event.target.text === "Builder"){
                $("#builder_settings").show('slow');
            }else if(event.target.text === "Provisioner"){
                $("#provisioner_settings").show('slow');
            }else if(event.target.text === "DevOps Tool"){
                $("#devops_settings").show('slow');
            }else if(event.target.text === "Post-Processor"){
                $("#postprocessor_settings").show('slow');
            }
        },
        
        loadPackedImage: function(event){
            //debugger
        },
        
        packImage: function(){
            //base_image
            var base_image = {};
            
            var clouds = [];
            $("input[name='clouds_select']:checkbox:checked").each(function(){  clouds.push($(this).val());   });
            
            base_image.name = $('#image_template_name_input').val();
            base_image.clouds = clouds;
            base_image.os = $('#os_input').val();

            var packed_image = this.map_base(base_image);
            
            var builder = {};
            $("#builder_settings :input").each(function() {
                if($( this ).val().length === 0){
                    //dont add
                }else if($(this).attr('type') === 'checkbox'){
                    builder[$(this).attr('name')] = $( this ).is(':checked');
                }else if($(this).attr('type') === 'number' && isNaN($( this ).val())){
                    builder[$(this).attr('name')] = parseInt($( this ).val(),10);
                }else if($(this).attr('data-type').indexOf("array") !== -1){
                    if(builder[$(this).attr('name')] === undefined){
                        builder[$(this).attr('name')] = [$( this ).val()];
                    }else{
                        builder[$(this).attr('name')].push($( this ).val());
                    }
                }else{
                    builder[$(this).attr('name')] = $( this ).val();
                }
            });
            
            var provisioner = {};
            if($("#image_config_management_select").val() !== "None"){
                provisioner['type'] = $("#image_config_management_select").val();
                $("#provisioner_settings :input").each(function() {
                    if($( this ).val().length === 0){
                        //dont add
                    }else if($(this).attr('type') === 'checkbox'){
                        provisioner[$(this).attr('name')] = $( this ).is(':checked');
                    }else if($(this).attr('type') === 'number' && isNaN($( this ).val())){
                        provisioner[$(this).attr('name')] = parseInt($( this ).val(),10);
                    }else if($(this).attr('data-type').indexOf("array") !== -1){
                        if(provisioner[$(this).attr('name')] === undefined){
                            provisioner[$(this).attr('name')] = [$( this ).val()];
                        }else{
                            provisioner[$(this).attr('name')].push($( this ).val());
                        }
                    }else{
                        provisioner[$(this).attr('name')] = $( this ).val();
                    }
                });
            }
            
            var devopsP = {};
            if($("#dev_ops_select").val() !== "None"){
                devopsP['type'] = $("#dev_ops_select").val();
                $("#devops_settings :input").each(function() {
                    if($( this ).val().length === 0){
                        //dont add
                    }else if($(this).attr('type') === 'checkbox'){
                        devopsP[$(this).attr('name')] = $( this ).is(':checked');
                    }else if($(this).attr('type') === 'number' && isNaN($( this ).val())){
                        devopsP[$(this).attr('name')] = parseInt($( this ).val(),10);
                    }else if($(this).attr('data-type').indexOf("array") !== -1){
                        if(devopsP[$(this).attr('name')] === undefined){
                            devopsP[$(this).attr('name')] = [$( this ).val()];
                        }else{
                            devopsP[$(this).attr('name')].push($( this ).val());
                        }
                    }else{
                        devopsP[$(this).attr('name')] = $( this ).val();
                    }
                });
            }
            
            var postProcessor = {};
            if($("#post_processor_select").val() !== "None"){
                postProcessor['type'] = $("#post_processor_select").val();
                $("#postprocessor_settings :input").each(function() {
                    if($( this ).val().length === 0){
                        //dont add
                    }else if($(this).attr('type') === 'checkbox'){
                        postProcessor[$(this).attr('name')] = $( this ).is(':checked');
                    }else if($(this).attr('type') === 'number' && isNaN($( this ).val())){
                        postProcessor[$(this).attr('name')] = parseInt($( this ).val(),10);
                    }else if($(this).attr('data-type').indexOf("array") !== -1){
                        if(postProcessor[$(this).attr('name')] === undefined){
                            postProcessor[$(this).attr('name')] = [$( this ).val()];
                        }else{
                            postProcessor[$(this).attr('name')].push($( this ).val());
                        }
                    }else{
                        postProcessor[$(this).attr('name')] = $( this ).val();
                    }
                });
            }
            
            $.extend( packed_image.builders[0], builder );
            if(!$.isEmptyObject(provisioner)){
                packed_image.provisioners.push(provisioner);
            }
            if(!$.isEmptyObject(devopsP)){
                packed_image.provisioners.push(devopsP);
            }
            if(!$.isEmptyObject(postProcessor)){
                packed_image['post-processors'].push(postProcessor);
            }
            
            //packed_image = this.getDefaultTemplate();
            
            this.currentImageTemplate = new PackedImage({'packed_image':packed_image,'name':base_image.name});
            this.currentImageTemplate.save();
        },
        
        deployImage: function(){
            this.currentImageTemplate.deploy();
        },
        
        map_base: function(base){
            var builders = [];
            var provisioners = [];
            var postProcessors = [];
            var mappings;
            $.ajax({
              url: '/samples/awsImages.json',
              async: false,
              success: function(data) {
                mappings = data;
              }
            });
            for (var i in base.clouds) {
                if(base.clouds[i] === 'aws'){
                    for(var j in mappings){
                        if(mappings[j].label === $('#os_input').val()){
                            var aws = {
                                        "type": $("#image_type_select").val(),
                                        "access_key": $("#aws_cred_select option:selected").attr('data-ak'),
                                        "secret_key": $("#aws_cred_select option:selected").attr('data-sk'),
                                        "region": $("#aws_region_select").val(),
                                        'source_ami' : mappings[j].region[$("#aws_region_select").val()],
                                        "instance_type": $("#instance_type_select").val(),
                                        "ssh_username": "ubuntu",
                                        "ami_name": $("#image_template_name_input").val()
                                       };
                            builders.push(aws);
                        }
                    }
                }
                if(base.clouds[i] === 'openstack'){
                    builders.push({
                        "type": "qemu"
                        //"username": "buildbot-grizzly",
                        //"password": "buildbot-grizzly",
                        //"provider": "",
                        //"region": "nova",
                        //"ssh_username": "ubuntu",
                        //"image_name": $("#image_template_name_input").val(),
                        //"source_image": "b53eea94-b195-4978-abcb-691d31ca57b5",
                        //"flavor": "2"         
                    });
                }
            }
            
            return {'builders':builders,'provisioners':provisioners, 'post-processors':postProcessors};
        },
        
        getDefaultTemplate: function(){
            var mappings;
            $.ajax({
              url: '/samples/packer-centos-6.json',
              async: false,
              success: function(data) {
                mappings = data;
              }
            });
            return mappings;
        },
        
        uploadAsync: function(){
            var d_id = this.currentImageTemplate.attributes.doc_id;
            var upUrl = Common.apiUrl + "/stackstudio/v1/packed_images/save?uid=" + sessionStorage.org_id + "&docid=" + d_id;
            $("#upForm").attr('action',upUrl);
            if($("#mciaas_files").val() !== ""){
                $("#upSub").click();
            }            
        },
        
        appendButton: function(e){
            var id = e.target.getAttribute('data-name');
            var placeholder = $("#"+id).attr('placeholder');
            var title = $("#"+id).attr('title');
            var dataType = $("#"+id).attr('data-type');
            $( "<br/><input name='"+id+"' placeholder='"+placeholder+"' title='"+title+"' data-type='"+dataType+"' style='margin-top: 4px;' type='text' class='input-xlarge'></input>" ).insertAfter( e.target ).hide().show('fast');
            //debugger
        },

        closeImageTemplate: function() {
            this.currentImageTemplate = undefined;
            this.render();
        },

        close: function(){
            this.$el.empty();
            this.undelegateEvents();
            this.stopListening();
            this.unbind();
        }
    });

    var imagesView;

    Common.router.on('route:images', function (id) {
        if(sessionStorage.account_id) {
            if (this.previousView !== imagesView) {
                this.unloadPreviousState();
                imagesView = new ImagesView();
                this.setPreviousState(imagesView);
            }
            imagesView.imgId = id;
            imagesView.render();
        }else {
            Common.router.navigate("", {trigger: true});
            Common.errorDialog("Login Error", "You must login.");
        }
    }, Common);

	return ImagesView;
});
