/**
 * Saillog main app.
 */
'use strict';

Saillog.App = L.Class.extend({
	initialize: function () {
		var app = this;
		this.focused = 'none'
		this.indexLayers = {}
		this.sidebar = $('#sidebar');

		var map = this._map = new Saillog.Map(this);
		this.indexWidget = new Saillog.Widget.Index(this.sidebar).on({
			'click-story create-story': function (e) {
				var id = e.id;

				if (!id) {
					return new Saillog.Editor.InitializeStory(function (id) {
						window.location.hash = '#' + id;
					});
				} else {
					window.location.hash = '#' + id;
				}
			}
		});



		var closeEditor = function() {
			document.getElementById('delete').style.display='none'
	        document.getElementById('export').style.display='none'

			console.log(document.getElementsByClassName('leaflet-draw leaflet-control')[0])

			if (document.getElementsByClassName('leaflet-draw leaflet-control')[0]) {
				document.getElementsByClassName('leaflet-draw leaflet-control')[0].visibility="hidden"
			}
		}


		var openEditor = function() {

	        document.getElementById('delete').style.display='block'
	        document.getElementById('export').style.display='block'

			var featureGroup = L.featureGroup().addTo(map);

            var drawControl = new L.Control.Draw({
                edit: {
                    featureGroup: featureGroup
                }
            }).addTo(map);

            map.on('draw:created', function(e) {

                // Each time a feaute is created, it's added to the over arching feature group
                featureGroup.addLayer(e.layer);
            });

			// on click, clear all layers
	        document.getElementById('delete').onclick = function(e) {
	            featureGroup.clearLayers();
	        }



	        document.getElementById('export').onclick = function(e) {
	            // Extract GeoJson from featureGroup
	            var data = featureGroup.toGeoJSON();
				var geomData = data['features'][0]['geometry'];
				console.log(geomData)
				// var convertedData = '"geometry":' + JSON.stringify(geomData);
				var convertedData = JSON.stringify(geomData);

				var executeCopy = function() {
				  var copyhelper = document.createElement("input");
				  copyhelper.className = 'copyhelper'
				  document.body.appendChild(copyhelper);
				  copyhelper.value = convertedData;
				  copyhelper.select();
				  document.execCommand("copy");
				  document.body.removeChild(copyhelper);
				};

	            // // Stringify the GeoJson
	            // var convertedData = 'text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data));
				//
	            // // Create export
	            // document.getElementById('export').setAttribute('href', 'data:' + convertedData);
	            // document.getElementById('export').setAttribute('download','data.geojson');
				executeCopy()
		        featureGroup.clearLayers();

	        }
	    }

		var closeEditor = function() {
			document.getElementById('delete').style.display='none'
	        document.getElementById('export').style.display='none'

			if (document.getElementsByClassName('leaflet-draw leaflet-control')[0]) {
				// document.getElementsByClassName('leaflet-draw leaflet-control')[0].style.display="none"
				document.getElementsByClassName('leaflet-draw leaflet-control')[0].remove()
			}
		}




		var initEditor = function() {
			console.log('init story editor')
			$('#sidebar').css('width', '50%')

			$('#calendar')[0].style.display = "none"
			$('.leaflet-bottom')[0].style.display = "none"


			var editorFunc = $("<div/>")   // creates a div element
				 .attr("id", "editorFunctions")  // adds the id
				 .addClass("leg")   // add a class
				 .html(`<h3></h3>
					 <div class="editor-group">
						 <label for="template-id" class="editor-label" style="font-size:xx-small;">template id:</label>
						 <input type="text" id="template-id" class="editor-input" value="empty-editor" style="font-size:xx-small;"/>
					 </div>
					 <div class='elBtn' onclick="saillog.loadTemplate(true)">Load template</div>
					 <div class='elBtn' onclick="saillog.appendLeg({})">Add new leg</div>
					 <div class='elBtn' onclick="saillog.exportStory()" style="margin-bottom:10px;">Export story</div>`);
			$("#sidebar").append(editorFunc.clone());

            var editorFuncSide = $("<div/>")   // creates a div element
				 .attr("id", "editorFunctionsSide")  // adds the id
				 .addClass("leg")   // add a class
				 .html(`<h3></h3>
					 <div class='elBtn' onclick="saillog.appendLeg({})">Add new leg</div>
					 `);
            $("#editor_controls").append(editorFuncSide.clone());


			var elements = $("<div/>")   // creates a div element
                 .attr("id", "editorElements")  // adds the id
                 .addClass("leg")   // add a class
                 .html(`<h3></h3>
					 <div class='elBtn' onclick='saillog.copyTC("[tekst](https://url)")'>Link</div>
					 <div class='elBtn' onclick='saillog.copyTC("\\n\\n")'>Enter</div>
					 <div class='elBtn' onclick='saillog.copyTC("![tekst](afbeelding.jpg)")'>Image</div>
					 <div class='elBtn' onclick='saillog.copyTC("inline")'>Image inline</div>
					 <div class='elBtn' onclick='saillog.copyTC("![tekst](http://youtu.be/id)")'>Youtube</div>
					 <div class='elBtn' onclick='saillog.copyTC("abbr")'>Abbr</div>
					 <div class='elBtn' onclick='saillog.copyTC("\`\`\`code\`\`\`")'>Code</div>
					 <div class='elBtn' onclick="saillog.copyTC('table')">Table</div>
					 <div class='elBtn' onclick='saillog.copyTC("**tekst**")'>Bold</div>
					 <div class='elBtn' onclick='saillog.copyTC("<em>tekst</em>")'>Oblique</div>
					 <div class='elBtn' onclick='saillog.copyTC("#A41623")' style="color: #A41623;">Red</div>
					 <div class='elBtn' onclick='saillog.copyTC("#230007")' style="color: #230007;">Sienna</div>
                     <div class='elBtn' onclick='saillog.copyTC("#253C78")' style="color: #253C78;">Blue</div>
                     <div class='elBtn' onclick='saillog.copyTC("#F6AE2d")' style="color: #F6AE2D;">Yellow</div>
                     <div class='elBtn' onclick='saillog.copyTC("#566E3D")' style="color: #566E3D;">Green</div>
					 <div class='elBtn' onclick='saillog.copyTC("#E4572E")' style="color: #E4572E;">Orange</div>
					 <div class='elBtn' onclick='saillog.copyTC(new Date().toISOString().slice(0, 10))'>Date</div>
					 <div class='elBtn' onclick='saillog.copyTC(new Date(Date.now() - ((new Date()).getTimezoneOffset() * 60000)).toISOString().slice(0, 16)+":00")' style="margin-bottom:10px;">Now</div>`);

            $("#sidebar").append(elements.clone());
            $("#editor_controls").append(elements.clone());

            document.getElementById('editor_controls').style.display='block'


			var storyProperties = $("<div/>")
				.attr("id", "storyProperties")  // adds the id
				.addClass("leg")   // add a class
				.html(`<h3></h3>
					<div class="editor-group">
						<label for="story-title" class="editor-label">Title:</label>
						<input type="text" id="story-title" class="editor-input" style="font-family: 'Avenir-Medium'; font-size:small;"/>
					</div>
							<section>
								<article>
									<details>
										<summary style="font-size:80%;">
											Details
										</summary>
										<p>
											<div class="editor-group">
												<label for="story-id" class="editor-label">ID:</label>
												<input type="text" id="story-id" class="editor-input"/>
											</div>
											<div class="editor-group">
												<label for="story-units" class="editor-label">Units:</label>
												<input type="text" id="story-units" class="editor-input"/>
											</div>
											<div class="editor-group">
												<label for="story-average" class="editor-label">Average:</label>
												<input type="number" id="story-average" class="editor-input" step="0.1" value="4.5"/>
											</div>
											<div class="editor-group">
												<label for="story-timeline" class="editor-label">Show timeline:</label>
												<input type="checkbox" id="story-timeline" class="editor-input" checked/>
											</div>
											<div class="editor-group">
												<label for="story-calendar" class="editor-label">Show calendar:</label>
												<input type="checkbox" id="story-calendar" class="editor-input" checked/>
											</div>
											<div class="editor-group">
												<label for="story-track" class="editor-label">Show track:</label>
												<input type="checkbox" id="story-track" class="editor-input" checked/>
											</div>
										</p>
									</details>
								</article>
							</section>
					`);
		   $("#sidebar").append(storyProperties);

		   // app.appendLeg({})
		   app.loadTemplate(false)

		}



		this.storyWidget = new Saillog.Widget.Story(this.sidebar);

		this.calendarControl = new Saillog.Control.Calendar().addTo(map);
		this.timelineControl = new Saillog.Control.Timeline().addTo(map);

		if (window.location.hash.slice(1) !== 'editor') {
			this._attachLegActions(this.storyWidget);
		};

		this.storyWidget.on({
			'edit-metadata': function () {
				this.showEditor('metadata');
			},
			'create-leg edit-leg': function (event) {
				var legId = event.legId;
				if (!legId) {
					legId = this._story.addLeg();
				}

				this.showEditor(legId);
			}
		}, this);

		this._attachLegActions(this.calendarControl);
		this._attachLegActions(this.timelineControl);

		this.loadIndex(function () {
			$(window).on('hashchange', function () {
				var hash = window.location.hash.slice(1);

				closeEditor()

				if (hash === '') {
					app.showIndex();
				// } else if (hash === 'edit') {
				// 	app.showIndex()
				// 	app.sidebar.hide(250);
				// 	openEditor()
				} else {
					app.loadStory(hash, function (success, err) {
						if (success) {
							app.showStory();
							if (hash === 'editor') {
								openEditor()
								initEditor()
							}
						} else {
							console.log('Story ' + hash + ' could not be loaded: ' + err);
							// TODO: notify user.
							window.location.hash = '#';
						}
					});
				}
			}).trigger('hashchange');
		});

		$('body').mediaModal({
			selector: '.thumb, .youtube'
		});

		// sidebar toggle
		$('<div id="sidebar-handle">')
			.prop('title', 'Toggle sidebar')
			.append(Saillog.util.icon('fa-arrow-circle-right'))
			.append(Saillog.util.icon('fa-arrow-circle-right'))
			.append(Saillog.util.icon('fa-arrow-circle-right'))
			.insertAfter(this.sidebar)
			.on('click', function () {
				if (app.sidebar.is(':visible')) {
					app.sidebar.hide(0);
				} else {
					app.sidebar.show(0);
				}
				$(this).children('i')
					.toggleClass('fa-arrow-circle-right fa-arrow-circle-left');
			});
	},


	hoverIndexIn: function (element) {
		var storyId = $(element).attr('data-id')
		saillog.indexLayers[storyId].setStyle(Saillog.defaultStyles.indexHover)
		saillog.indexLayers[storyId].bringToFront()

		$.each(saillog.indexLayers, function( key, layer ) {
			if ( key !== storyId) {
				layer.setStyle(Saillog.defaultStyles.indexNot);
			}
		});

	},

	hoverIndexOut: function (element) {
		// var storyId = $(element).attr('data-id')
		// saillog.indexLayers[storyId].setStyle(Saillog.defaultStyles.index)

		$.each(saillog.indexLayers, function( key, layer ) {
			layer.setStyle(Saillog.defaultStyles.index);
		});
	},

	insertAtCaret: function(text) {
		var areaId = this.focused.id
		console.log(areaId)

	  var txtarea = document.getElementById(areaId);
	  if (!txtarea) {
	    return;
	  }

	  var scrollPos = txtarea.scrollTop;
	  var strPos = 0;
	  var br = ((txtarea.selectionStart || txtarea.selectionStart == '0') ?
	    "ff" : (document.selection ? "ie" : false));
	  if (br == "ie") {
	    txtarea.focus();
	    var range = document.selection.createRange();
	    range.moveStart('character', -txtarea.value.length);
	    strPos = range.text.length;
	  } else if (br == "ff") {
	    strPos = txtarea.selectionStart;
	  }

	  var front = (txtarea.value).substring(0, strPos);
	  var back = (txtarea.value).substring(strPos, txtarea.value.length);
	  txtarea.value = front + text + back;
	  strPos = strPos + text.length;
	  if (br == "ie") {
	    txtarea.focus();
	    var ieRange = document.selection.createRange();
	    ieRange.moveStart('character', -txtarea.value.length);
	    ieRange.moveStart('character', strPos);
	    ieRange.moveEnd('character', 0);
	    ieRange.select();
	  } else if (br == "ff") {
	    txtarea.selectionStart = strPos;
	    txtarea.selectionEnd = strPos;
	    txtarea.focus();
	  }

	  txtarea.scrollTop = scrollPos;
  },

	// Copies a string to the clipboard. Must be called from within an
	// event handler such as click. May return false if it failed, but
	// this is not always possible. Browser support for Chrome 43+,
	// Firefox 42+, Safari 10+, Edge and Internet Explorer 10+.
	// Internet Explorer: The clipboard feature may be disabled by
	// an administrator. By default a prompt is shown the first
	// time the clipboard is used (per session).
	copyTC: function(text) {

		if (text==='table') {
			text = `<table>\\n<tr><td class=\"meta\">Boot</td><td>Peerd Parmant, Hurley 800</td></tr>\\n<tr><td class=\"meta\">Gevaren</td><td>10NM</td></tr>\\n</table>`.replace(/"/g, '\\"')
		}
		if (text==='inline') {
			text = `![tekst](afbeelding.jpg "inline")`.replace(/"/g, '\\"')
		}
		if (text === 'abbr'){
			text = `<abbr title=\"uitleg\">tekst</abbr>`.replace(/"/g, '\\"')
		}



		text = text.replace(/\n/g, '\\n')

		saillog.insertAtCaret(text)

		if (window.clipboardData && window.clipboardData.setData) {
			// Internet Explorer-specific code path to prevent textarea being shown while dialog is visible.
			return clipboardData.setData("Text", text);

		}
		else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
			var textarea = document.createElement("textarea");
			textarea.textContent = text;
			textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in Microsoft Edge.
			document.body.appendChild(textarea);
			textarea.select();
			try {
				return document.execCommand("copy");  // Security exception may be thrown by some browsers.
			}
			catch (ex) {
				console.warn("Copy to clipboard failed.", ex);
				return false;
			}
			finally {
				document.body.removeChild(textarea);
			}
		}
	},

	loadTemplate: function(cnf) {

		var templateId = $('#template-id').val()

		console.log(cnf)

		if (cnf === true) {
			var r = confirm("Do you want to load " + templateId + " as a template? You will lose all progress");
			if (r == true) {
			  console.log("loading template");
			} else {
			  console.log("stop loading")
			  return;
			}
		}


		$.getJSON('data/' + templateId + '.geojson', function(json){
			templateLoaded(json)
		});

		function templateLoaded(template) {
			var props = template['properties']
			var id = template['id']

			$('#story-id').val(id)
			$('#story-title').val(props['title'])
			$('#story-average').val(props['average'])
			$('#story-units').val(props['units'])
			$('#story-timeline').prop("checked", props['showTimeline'])
			$('#story-calendar').prop("checked", props['showCalendar'])
			$('#story-track').prop("checked", props['showTrack'])

			$('*[id*=legEntry]').each(function() {
			    $(this).remove();
			});

			$.each(template.features, function(i, feature) {
				// console.log(feature.properties)
				// console.log(feature)
				saillog.appendLeg(feature)
			})


		};


	},

	changeColor: function(obj) {
        console.log(this)
		var newColor = obj.value
        console.log(newColor)
		var obj_id = obj.id.split('-').pop()
        console.log('changeColor: ', newColor, obj_id)
        $('#leg-color-example-' + obj_id).css('background-color', newColor)
        var borderStyle = '4px solid ' + newColor
        $('#legEntry-' + obj_id).css('border-left', borderStyle)
	},

	addFocus: function(obj) {

		this.focused = document.activeElement;
		console.log(this.focused.id)


	},

	exportStory: function() {
		console.log('exporting story to geojson...')

		var obj = {}
		var properties = {}
		var features = []

		obj.id = $('#story-id').val()
		obj.type = 'FeatureCollection'

		properties.title = $('#story-title').val()
		properties.average = parseFloat($('#story-average').val())
		properties.units = $('#story-units').val()
		properties.showTimeline = $('#story-timeline').prop("checked")
		properties.showCalendar = $('#story-calendar').prop("checked")
		properties.showTrack = $('#story-track').prop("checked")

		obj.properties = properties

		$('.leg.entry').each(function() {
			var curF = {'type':'Feature'}
			var props = {}
			var fId = this.id.split('-').pop()

			props.title = $('#leg-title-' + fId).val()
            // props.text = $('#leg-text-' + fId).val().replace(/\\n/g, '\n').replace(/\\\"inline\\\"/g, '\"inline\"')
            props.text = $('#leg-text-' + fId).val().replace(/\\n/g, '\n').replace(/\\\"/g, '\"')
			props.date = $('#leg-date-' + fId).val()
			props.color = $('#leg-color-' + fId).val()
			props.average = parseFloat($('#leg-average-' + fId).val())
			if ($('#leg-start-' + fId).val()) {
				props.startTime = $('#leg-start-' + fId).val()
			}
			if ($('#leg-end-' + fId).val()) {
				props.endTime = $('#leg-end-' + fId).val()
			}

			curF.properties = props

			if ($('#leg-geom-' + fId).val()) {
				curF.geometry = JSON.parse($('#leg-geom-' + fId).val())
			}

			features.push(curF)
		})

		obj.features = features

		console.log(obj)
		var inp = JSON.stringify(obj, undefined, 4)
		// $('#leg-text-4').val(inp)


	  	var new_page = window.open();
	  	new_page.document.write('<pre>'+inp+'</pre>');


		var saveData = (function () {
		    var a = document.createElement("a");
		    document.body.appendChild(a);
		    a.style = "display: none";
		    return function (data, fileName) {
		        var json = JSON.stringify(data, undefined, 4),
		            blob = new Blob([json], {type: "octet/stream"}),
		            url = window.URL.createObjectURL(blob);
		        a.href = url;
		        a.download = fileName;
		        a.click();
		        window.URL.revokeObjectURL(url);
		    };
		}());

		var fileName = obj.id + ".geojson";

		saveData(obj, fileName);

	},

	appendLeg: function(feature) {

		if (Object.keys(feature).length === 0) {
			console.log('new empty leg')

			var defaultFeature = {
				'properties':{
					'title': '',
					'text': '',
					'average': 4.5,
					'color': '#ffffff',
					'date': '',
					'startTime': '',
					'endTime': ''
				}
			}
			whenDone(defaultFeature)

		} else {
			whenDone(feature)
		};

		function whenDone(feature) {

			var fID = $('div.leg').length;
			// console.log(fID)

			// console.log(feature)
			// console.log(feature['properties']['text'])

			let fTitle = feature['properties']['title']
			let fText = feature['properties']['text'].replace(/\n/g, '\\n')
			let fDate = feature['properties']['date']
			let fStart = feature['properties']['startTime']
			let fEnd = feature['properties']['endTime']
			let fAverage = feature['properties']['average']
			let fColor = feature['properties']['color']
			let fGeom = feature['geometry']

			if (!fStart) {
				fStart = ''
			};
			if (!fEnd) {
				fEnd = ''
			};
			if (!fGeom) {
				fGeom = ''
			} else {
				// console.log(fGeom)
				fGeom = JSON.stringify(fGeom)
			};

			var legEntries = $("<div/>")
			.attr("id", "legEntry-" +fID)  // adds the id
			.addClass("leg entry")   // add a class
			.html(`<h3></h3>
				<div class="editor-group-leg">
					<input type="text" id="leg-title-${fID}" class="editor-input-leg" style="font-family: 'Avenir-Medium'; font-size:larger;"/>
				</div>
				<div class="editor-group-leg">
					<textarea rows="5" id="leg-text-${fID}" class="editor-input-leg" style="font-size:small" onfocus="saillog.addFocus()"/>
				</div>
						<section>
							<article>
								<details>
									<summary style="font-size:80%;">
										Details
									</summary>
									<p>
										<div class="editor-group">
											<label for="leg-date-${fID}" class="editor-label">Date:</label>
											<input type="text" id="leg-date-${fID}" class="editor-input" onfocus="saillog.addFocus()"/>
										</div>
										<div class="editor-group">
											<label for="leg-start-${fID}" class="editor-label">Start:</label>
											<input type="text" id="leg-start-${fID}" class="editor-input" onfocus="saillog.addFocus()"/>
										</div>
										<div class="editor-group">
											<label for="leg-end-${fID}" class="editor-label">End:</label>
											<input type="text" id="leg-end-${fID}" class="editor-input" onfocus="saillog.addFocus()"/>
										</div>
										<div class="editor-group">
											<label for="leg-color-${fID}" class="editor-label">Color:</label>
											<input type="text" id="leg-color-${fID}" class="editor-input" onfocus="saillog.addFocus()" onchange="saillog.changeColor(this)" onpaste="saillog.changeColor(this)"/>
											<input type="text" class="editor-input" id="leg-color-example-${fID}" style="background-color: ${fColor};margin-left:2px;max-width:12px;"/>
										</div>
										<div class="editor-group">
											<label for="leg-average-${fID}" class="editor-label">Average:</label>
											<input type="text" id="leg-average-${fID}" class="editor-input" onfocus="saillog.addFocus()"/>
										</div>
										<div class="editor-group">
											<label for="leg-geom-${fID}" class="editor-label">Geometry:</label>
											<input type="text" id="leg-geom-${fID}" class="editor-input" onfocus="saillog.addFocus()"/>
										</div>
									</p>
								</details>
							</article>
						</section>
				`);
		   $("#sidebar").append(legEntries);

		   $('#leg-title-' + fID).val(fTitle)
		   $('#leg-text-' + fID).val(fText)
		   $('#leg-date-' + fID).val(fDate)
		   $('#leg-start-' + fID).val(fStart)
		   $('#leg-end-' + fID).val(fEnd)
		   $('#leg-color-' + fID).val(fColor)
		   $('#leg-average-' + fID).val(fAverage)
		   $('#leg-geom-' + fID).val(fGeom)
           var borderStyle = '4px solid ' + fColor;
           $('#legEntry-' + fID).css('border-left', borderStyle)


		};
   },

	showIndex: function () {
		Saillog.util.imagePrefix = 'data/';

		$.each(saillog.indexLayers, function( key, layer ) {
			layer.setStyle(Saillog.defaultStyles.index);
		});

		this._map
			.setView(this._index.center, this._index.zoom)
			.maxZoom(14);

		if (this._story) {
			this._map.removeLayer(this._story);
		}

		this.indexWidget.update(this._index);

		[
			this.calendarControl,
			this.timelineControl
		].forEach(function (it) {
			it.hide();
		});
	},

	showStory: function () {
		var story = this._attachLegActions(this._story);

		console.log('showStory')
		$.each(saillog.indexLayers, function( key, layer ) {
			layer.setStyle(Saillog.defaultStyles.indexHidden);
			saillog._map.removeLayer(layer)
		});

		Saillog.util.imagePrefix = 'data/' + story.id + '/';

		this._map
			.addLayer(story)
			.panTo(story);

		this.storyWidget.update(story).show();
		if (story.getProperty('showTimeline')) {
			this.timelineControl.update(story).show();
		}
		if (story.getProperty('showCalendar')) {
			this.calendarControl.update(story).show();
		}
		if (story.getProperty('baselayer')) {
			console.log(story.getProperty('baselayer'));
			this._map.replaceBaseLayer(story.getProperty('baselayer'));
		}
	},

	_attachLegActions: function (emitter) {
		var actions = {
			'click-leg': this._legClick,
			'mouseover-leg': this._legHover,
			'mouseout-leg': function () {
				this._highlight();
			}
		};
		return emitter
			.off(actions)
			.on(actions, this);
	},

	_legClick: function (event) {
		var legId = event.legId;

		this._highlight(legId);
		this._map.panTo(this._story.getLayer(legId));

		this._scrollTo(legId);
	},

	_legHover: function (event) {
		this._highlight(event.legId);
	},

	_highlight: function (id) {
		[
			this._story,
			this.storyWidget,
			this.calendarControl,
			this.timelineControl
		].forEach(function (it) {
			it.highlight(id);
		});
	},

	_scrollTo: function (id, duration) {
		duration = duration || 500;

		console.log('scroll to: ', id)
		console.log($('#leg-story-' + id))

		$('#sidebar').focus()
		// $('#leg-story-' + id).animate({ scrollTop: -20 }, duration);

		$.scrollTo('#leg-story-' + id, {
			duration: duration,
			offset: {
				top: -20
			}
		});
		return this;

		//
		// var scrollPos = $('#leg-story-' + id).scrollTop
		// $('#leg-story-' + id).scrollTop = scrollPos;


	},

	sidebarPadding: function () {
		return this.sidebar.width() + 200;
	},

	loadIndex: function (callback) {
		var app = this;

		$.getJSON('data/index.json', function (index) {
			app._index = index;
			callback();
		});
	},

	loadStory: function (id, callback) {
		var app = this;

		if (this._story) {
			this._map.removeLayer(this._story);
		}

		$.ajax({
			url: 'data/' + id + '.geojson',
			method: 'get',
			dataType: 'json',
			success: function (response) {
				app._story = new Saillog.Story(response);
				callback(true);
			},
			error: function (_, err, message) {

				callback(false, err + ': ' + message);
			}
		});
	}
});

$(function () {
	var saillog = new Saillog.App();
	window.saillog = saillog;

	L.extend(saillog, Saillog.Editor);
	if (Saillog.util.isDev()) {
		Saillog.util.liveReload();

		window.setTimeout(function () {
			if (window.location.hash === '#2013-zomerzeilen') {
				window.saillog.showEditor(23);
			}
		}, 500);
	}
});
