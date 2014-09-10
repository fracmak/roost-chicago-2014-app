define(function(require) {
  'use strict';

  var BaseView = require('modules/core/base-view');
  var template = require('tmpl!modules/components/photo/gallery');
  var AnimationLib = require('csslib');
  var TrafficCop = require('trafficcop');
  var $ = require('jquery');
  require('jquery-ui');

  var GalleryView = BaseView.extend({
    template: template,
    events: {
      'click #toggleAnimation': 'toggleAnimation',
      'click #toggleShuffling': 'toggleShuffling',
      'click #toggleTrafficCop': 'toggleTrafficCop',
//      'mouseenter': 'sortable',
//      'mouseleavel': 'unsortable'
      'mouseenter .thumbnails': 'protectSortable',
      'mouseleave .thumbnails': 'unProtectSortable'
    },
    shuffling: false,
    animating: false,
    sorting: false,
    trafficCop: false,
    protectedThumbnails: false,
    protectSortable: function(){
      this.protectedThumbnails = $.Deferred();
      if (this.trafficCop) {
        TrafficCop.addRead(this.protectedThumbnails);
      }
      this.sortable();
    },
    unProtectSortable: function() {
      if (this.protectedThumbnails) {
        this.protectedThumbnails.resolve();
      }
      this.unsortable();
    },
    sortable: function(){
      var _this = this;
      $('.thumbnails').sortable({
        start: function() {
          _this.sorting = $.Deferred();
          if (_this.trafficCop) {
            TrafficCop.addRead(_this.sorting);
          }
        },
        stop: function() {
          _this.sorting.resolve();
        }
      });
    },
    unsortable: function(){
      $('.thumbnails').sortable('destroy');
    },
    toggleShuffling: function(e){
      this.fixLabel($(e.currentTarget), this.shuffling);
      if (this.shuffling) {
        clearInterval(this.shuffling);
      } else {
        this.triggerShuffle();
      }
      this.shuffling = !this.shuffling;
    },
    triggerShuffle: function(){
      var _this = this;
      TrafficCop.addWrite($.Deferred(function(defer){
        this.shuffling = setTimeout(function() {
          defer.resolve();
        }, 500);
      })).done(function(){
        if (_this.shuffling) {
          _this.shuffle();
          _this.triggerShuffle();
        }
      });
    },
    shuffle: function(){
      var thumbnails = $('.thumbnails li'),
          max = thumbnails.length,
          source = thumbnails.eq(Math.round(Math.random() * max)),
          dest = thumbnails.eq(Math.round(Math.random() * max));
      source.insertAfter(dest);
    },
    toggleTrafficCop: function(e) {
      this.fixLabel($(e.currentTarget), this.trafficCop);
      this.trafficCop = !this.trafficCop;
    },
    toggleAnimation: function(e){
      var self = this;
      this.fixLabel($(e.currentTarget), this.animating);
      if (this.animating) {
        this.$('li').each(function(idx, el) {
          self.stopAnimate($(el));
        });
      } else {
        this.$('li').each(function(idx, el) {
          self.animate($(el));
        });
      }
      this.animating = !this.animating;
    },
    fixLabel: function($el, enabled) {
      var type = $el.html().split(' ')[1];
      $el.html((enabled ? 'Enabled ': 'Disabled ') + type);
    },
    stopAnimate: function($el){
      $el.css('position', 'relative');
      AnimationLib.stop($el, 'left');
      AnimationLib.stop($el, 'top');
    },
    animate: function($el){
      var position = $el.position();
      $el.css({
        position: 'absolute',
        left: position.left,
        top: position.top,
        width: $el.width()
      });
      this.randomizePlacement($el);
    },
    randomizePlacement: function(el){
      var self = this,
          a1, a2, combinedPromise,
          thumbnailWidth = $('.thumbnails').width(),
          windowHeight = $(window).height(),
          newLeft = Math.round(Math.random() * thumbnailWidth),
          newTop = Math.round(Math.random() * windowHeight);

      a1 = AnimationLib.animate(el, 'left', newLeft, 2000, 'ease-out');
      a2 = AnimationLib.animate(el, 'top', newTop, 2000, 'ease-out');
      combinedPromise = $.when(a1, a2);
      TrafficCop.addRead(combinedPromise);
      combinedPromise.done(function(){
        setTimeout(function(){
          self.randomizePlacement(el);
        }, 100);
      });
    },
    serializeData: function() {
      return {
        gallery: this.collection.toJSON()
      };
    }
  });

  return GalleryView;
});
