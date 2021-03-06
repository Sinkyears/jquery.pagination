/*!
 * jQuery.pagination.js 插件
 * @version v0.1.5
 * @author  unclekeith
 * 调用方法： $('selector').pagination();
 */
;
(function(global, factory) {
	'use strict';
	if (typeof define === 'function' && define.amd) {
		define(['jquery'], function($) {
			return factory($, global, global.document, global.Math);
		});
	} else if (typeof exports === "object" && exports) {
		module.exports = factory($, global, global.document, global.Math);
	} else {
		factory(jQuery, global, global.document, global.Math);
	}
})(typeof window !== 'undefined' ? window : this, function($, window, document, Math, undefined) {
	'use strict';

	var defaults = {
		count: 2, 							// 出现省略号时的当前分页的前后分页个数
		pageTotal: 8, 						// 分页总数
		pageStart: 6, 						// 出现省略号时的起始分页码
		prevCount: 2, 						// 出现省略号时的最前显示分页个数
		commonCls: 'pg-common', 			// 分页共同样式钩子
		currContentCls: 'pg-on', 			// 当前分页样式钩子
		prevContent: '<', 					// 上一页文案
		prevContentCls: 'pg-prev', 			// 上一页样式钩子
		nextContent: '>', 					// 下一页文案
		nextContentCls: 'pg-next',		 	// 下一页样式钩子
		totalContentCls: 'pg-totalWrapper', // 文字样式钩子
		totalNumCls: 'pg-totalNum', 		// 总页数样式钩子
		jumpToPageCls: 'pg-jumpWrapper', 	// 文字样式钩子
		jumpNum: 'pg-jumpNum', 				// 输入框样式钩子
		current: 1, 						// 当前页
		jumpBtnContent: '确定', 			// 按钮文案
		jumpBtnCls: 'pg-jumpBtn', 			// 按钮样式钩子
		callback: function() {}, 			// 回调函数，接收一个对象作为参数
		render: function() {} 				// 异步接口
	};

	function Pagination(target, options) {
		var _this = $(target),
			index,
			obj = this,
			prevText = '',
			rest = '<span class="' + options.commonCls + '">...</span>';

		this.getPageCount = function() {
			return options.pageTotal;
		}

		this.setPageTotal = function(num) {
			return options.pageTotal = num;
		}

		this.getCurrent = function() {
			return options.current;
		}

		this.setPage = function(index) {
			var html = '',
				current = index || options.current,
				count = options.count,
				start = 1,
				end = 5,
				prevText = '';

			options.current = index || 1;
			if (options.current > options.pageTotal || options.prevCount >= options.pageTotal || options.pageStart >= options.pageTotal || options.pageStart + options.count > options.pageTotal) {
				html += '请设置正确的pagination参数';
				_this.html(html);
				return;
			}

			if (current === 1) {
				html += '<span class="' + options.prevContentCls + ' ' + options.commonCls + '">' + options.prevContent + '</span>';
			} else {
				html += '<a href="javascript:;" class="' + options.prevContentCls + ' ' + options.commonCls + '">' + options.prevContent + '</a>';
			}

			if (current < options.pageStart && end - current < 2) {
				end = current + 2;
			} else if (current >= options.pageStart && current <= options.pageTotal) {
				end = current + options.count <= options.pageTotal ? current + options.count : options.pageTotal;
				start = end === options.pageTotal && options.pageTotal - current < options.count ? options.pageTotal - options.count * 2 : current - options.count;
				for (var i = 0; i < options.prevCount; i++) {
					prevText += '<a href="javascript:;" class="' + options.commonCls + '" data-page="' + (i + 1) + '">' + (i + 1) + '</a>';
				}
				html += prevText + rest;
			}

			for (; start <= end; start++) {
				if (start === current) {
					html += '<span class="' + options.commonCls + ' ' + options.currContentCls + '" data-page="' + start + '">' + start + '</span>';
				} else {
					html += '<a href="javascript:;" class="' + options.commonCls + '" data-page="' + start + '">' + start + '</a>';
				}
			}

			if (options.pageTotal > end) {
				html += rest;
			}

			if (current === options.pageTotal) {
				html += '<span class="' + options.nextContentCls + ' ' + options.commonCls + '">' + options.nextContent + '</span>';
			} else {
				html += '<a href="javascript:;" class="' + options.nextContentCls + ' ' + options.commonCls + '">' + options.nextContent + '</a>';
			}

			html += '<span class="' + options.totalContentCls + '">共<span class="' + options.totalNumCls + '">' + options.pageTotal + '</span>页，</span>';
			html += '<span class="' + options.jumpToPageCls + '">到第<input type="text" class="' + options.jumpNum + '" />页</span>'
			html += '<input type="button" value="' + options.jumpBtnContent + '" class="' + options.jumpBtnCls + '" />'
			_this.html(html);
			options.render();
			typeof options.callback === 'function' && options.callback(obj);
		}

		this.eventBind = function() {
			_this.on('click', 'a.' + options.commonCls, function() {
				if ($(this).hasClass('' + options.nextContentCls + '')) {
					index = obj.getCurrent() + 1;
				} else if ($(this).hasClass('' + options.prevContentCls + '')) {
					index = obj.getCurrent() - 1;
				} else {
					index = +$(this).data('page');
				}
				obj.setPage(index);
			});
			_this.on('input keydown', '.' + options.jumpNum, function(event) {
				var $this = $(this);
				if (event.type === 'input') {
					var reg = /([^\d]+)/g,
						text = $(this).val();
					if (reg.test(text)) {
						$this.val(text.replace(reg, ''));
					} + $this.val() > options.pageTotal && $this.val(options.pageTotal);
					if ($this.val() === '0') {
						$this.val(1)
					};
				} else {
					if (event.keyCode === 13) {
						setTimeout(function() {
							var index = +$this.val();
							index !== obj.getCurrent() && obj.setPage(index);
						}, 0);
					}
				}
			});
			_this.on('click', '.' + options.jumpBtnCls, function() {
				setTimeout(function() {
					var index = +($('.' + options.jumpNum).val());
					index !== +$('.' + options.currContentCls).text() && obj.setPage(index);
				}, 0);
			});
		}

		this.init = function() {
			this.setPage();
			this.eventBind();
		}

		this.init();
	}

	$.fn.pagination = function(opts) {
		var options = $.extend({}, defaults, opts);
		return this.each(function() {
			new Pagination(this, options);
		});
	}
});