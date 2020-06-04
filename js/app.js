/**
 * Saillog main app.
 */
'use strict';

Saillog.App = L.Class.extend({
	initialize: function () {
		var app = this;
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
				var convertedData = '"geometry":' + JSON.stringify(geomData);

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

			console.log(document.getElementsByClassName('leaflet-draw leaflet-control')[0])

			if (document.getElementsByClassName('leaflet-draw leaflet-control')[0]) {
				document.getElementsByClassName('leaflet-draw leaflet-control')[0].visibility="hidden"
			}
		}

		var initEditor = function() {
			console.log('init story editor')

			var elements = $("<div/>")   // creates a div element
                 .attr("id", "editorElements")  // adds the id
                 .addClass("leg")   // add a class
                 .html("<h3>Elements</h3><div class='elBtn'>Link</div><div class='elBtn'>Image</div><div class='elBtn'>Youtube</div><div class='elBtn'>Abbr</div><div class='elBtn'>Code</div><div class='elBtn'>Bold</div><div class='elBtn'>Oblique</div>");


			$("#sidebar").append(elements);

		}

		this.storyWidget = new Saillog.Widget.Story(this.sidebar);

		this.calendarControl = new Saillog.Control.Calendar().addTo(map);
		this.timelineControl = new Saillog.Control.Timeline().addTo(map);

		this._attachLegActions(this.storyWidget);
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

				// closeEditor()

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

	showIndex: function () {
		Saillog.util.imagePrefix = 'data/';

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
