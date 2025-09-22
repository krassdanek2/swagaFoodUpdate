/*
 * Plugins
 */
/*! npm.im/object-fit-images 3.2.4 */
var objectFitImages = (function () {
'use strict';

var OFI = 'bfred-it:object-fit-images';
var propRegex = /(object-fit|object-position)\s*:\s*([-.\w\s%]+)/g;
var testImg = typeof Image === 'undefined' ? {style: {'object-position': 1}} : new Image();
var supportsObjectFit = 'object-fit' in testImg.style;
var supportsObjectPosition = 'object-position' in testImg.style;
var supportsOFI = 'background-size' in testImg.style;
var supportsCurrentSrc = typeof testImg.currentSrc === 'string';
var nativeGetAttribute = testImg.getAttribute;
var nativeSetAttribute = testImg.setAttribute;
var autoModeEnabled = false;

function createPlaceholder(w, h) {
	return ("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='" + w + "' height='" + h + "'%3E%3C/svg%3E");
}

function polyfillCurrentSrc(el) {
	if (el.srcset && !supportsCurrentSrc && window.picturefill) {
		var pf = window.picturefill._;
		// parse srcset with picturefill where currentSrc isn't available
		if (!el[pf.ns] || !el[pf.ns].evaled) {
			// force synchronous srcset parsing
			pf.fillImg(el, {reselect: true});
		}

		if (!el[pf.ns].curSrc) {
			// force picturefill to parse srcset
			el[pf.ns].supported = false;
			pf.fillImg(el, {reselect: true});
		}

		// retrieve parsed currentSrc, if any
		el.currentSrc = el[pf.ns].curSrc || el.src;
	}
}

function getStyle(el) {
	var style = getComputedStyle(el).fontFamily;
	var parsed;
	var props = {};
	while ((parsed = propRegex.exec(style)) !== null) {
		props[parsed[1]] = parsed[2];
	}
	return props;
}

function setPlaceholder(img, width, height) {
	// Default: fill width, no height
	var placeholder = createPlaceholder(width || 1, height || 0);

	// Only set placeholder if it's different
	if (nativeGetAttribute.call(img, 'src') !== placeholder) {
		nativeSetAttribute.call(img, 'src', placeholder);
	}
}

function onImageReady(img, callback) {
	// naturalWidth is only available when the image headers are loaded,
	// this loop will poll it every 100ms.
	if (img.naturalWidth) {
		callback(img);
	} else {
		setTimeout(onImageReady, 100, img, callback);
	}
}

function fixOne(el) {
	var style = getStyle(el);
	var ofi = el[OFI];
	style['object-fit'] = style['object-fit'] || 'fill'; // default value

	// Avoid running where unnecessary, unless OFI had already done its deed
	if (!ofi.img) {
		// fill is the default behavior so no action is necessary
		if (style['object-fit'] === 'fill') {
			return;
		}

		// Where object-fit is supported and object-position isn't (Safari < 10)
		if (
			!ofi.skipTest && // unless user wants to apply regardless of browser support
			supportsObjectFit && // if browser already supports object-fit
			!style['object-position'] // unless object-position is used
		) {
			return;
		}
	}

	// keep a clone in memory while resetting the original to a blank
	if (!ofi.img) {
		ofi.img = new Image(el.width, el.height);
		ofi.img.srcset = nativeGetAttribute.call(el, "data-ofi-srcset") || el.srcset;
		ofi.img.src = nativeGetAttribute.call(el, "data-ofi-src") || el.src;

		// preserve for any future cloneNode calls
		// https://github.com/bfred-it/object-fit-images/issues/53
		nativeSetAttribute.call(el, "data-ofi-src", el.src);
		if (el.srcset) {
			nativeSetAttribute.call(el, "data-ofi-srcset", el.srcset);
		}

		setPlaceholder(el, el.naturalWidth || el.width, el.naturalHeight || el.height);

		// remove srcset because it overrides src
		if (el.srcset) {
			el.srcset = '';
		}
		try {
			keepSrcUsable(el);
		} catch (err) {
			if (window.console) {
				console.warn('https://bit.ly/ofi-old-browser');
			}
		}
	}

	polyfillCurrentSrc(ofi.img);

	el.style.backgroundImage = "url(\"" + ((ofi.img.currentSrc || ofi.img.src).replace(/"/g, '\\"')) + "\")";
	el.style.backgroundPosition = style['object-position'] || 'center';
	el.style.backgroundRepeat = 'no-repeat';
	el.style.backgroundOrigin = 'content-box';

	if (/scale-down/.test(style['object-fit'])) {
		onImageReady(ofi.img, function () {
			if (ofi.img.naturalWidth > el.width || ofi.img.naturalHeight > el.height) {
				el.style.backgroundSize = 'contain';
			} else {
				el.style.backgroundSize = 'auto';
			}
		});
	} else {
		el.style.backgroundSize = style['object-fit'].replace('none', 'auto').replace('fill', '100% 100%');
	}

	onImageReady(ofi.img, function (img) {
		setPlaceholder(el, img.naturalWidth, img.naturalHeight);
	});
}

function keepSrcUsable(el) {
	var descriptors = {
		get: function get(prop) {
			return el[OFI].img[prop ? prop : 'src'];
		},
		set: function set(value, prop) {
			el[OFI].img[prop ? prop : 'src'] = value;
			nativeSetAttribute.call(el, ("data-ofi-" + prop), value); // preserve for any future cloneNode
			fixOne(el);
			return value;
		}
	};
	Object.defineProperty(el, 'src', descriptors);
	Object.defineProperty(el, 'currentSrc', {
		get: function () { return descriptors.get('currentSrc'); }
	});
	Object.defineProperty(el, 'srcset', {
		get: function () { return descriptors.get('srcset'); },
		set: function (ss) { return descriptors.set(ss, 'srcset'); }
	});
}

function hijackAttributes() {
	function getOfiImageMaybe(el, name) {
		return el[OFI] && el[OFI].img && (name === 'src' || name === 'srcset') ? el[OFI].img : el;
	}
	if (!supportsObjectPosition) {
		HTMLImageElement.prototype.getAttribute = function (name) {
			return nativeGetAttribute.call(getOfiImageMaybe(this, name), name);
		};

		HTMLImageElement.prototype.setAttribute = function (name, value) {
			return nativeSetAttribute.call(getOfiImageMaybe(this, name), name, String(value));
		};
	}
}

function fix(imgs, opts) {
	var startAutoMode = !autoModeEnabled && !imgs;
	opts = opts || {};
	imgs = imgs || 'img';

	if ((supportsObjectPosition && !opts.skipTest) || !supportsOFI) {
		return false;
	}

	// use imgs as a selector or just select all images
	if (imgs === 'img') {
		imgs = document.getElementsByTagName('img');
	} else if (typeof imgs === 'string') {
		imgs = document.querySelectorAll(imgs);
	} else if (!('length' in imgs)) {
		imgs = [imgs];
	}

	// apply fix to all
	for (var i = 0; i < imgs.length; i++) {
		imgs[i][OFI] = imgs[i][OFI] || {
			skipTest: opts.skipTest
		};
		fixOne(imgs[i]);
	}

	if (startAutoMode) {
		document.body.addEventListener('load', function (e) {
			if (e.target.tagName === 'IMG') {
				fix(e.target, {
					skipTest: opts.skipTest
				});
			}
		}, true);
		autoModeEnabled = true;
		imgs = 'img'; // reset to a generic selector for watchMQ
	}

	// if requested, watch media queries for object-fit change
	if (opts.watchMQ) {
		window.addEventListener('resize', fix.bind(null, imgs, {
			skipTest: opts.skipTest
		}));
	}
}

fix.supportsObjectFit = supportsObjectFit;
fix.supportsObjectPosition = supportsObjectPosition;

hijackAttributes();

return fix;

}());
// ../../node_modules/@googlemaps/dist/index.min.js
/*
 * Custom
 */
(function ($) {
  'use strict';

  objectFitImages('img');

  menuBtnClick();
  windowResize();
  closeModal();
  productInfoModal();
  toggleLocationsMap();
  showLocationInfo();
  isPastDate();
  calcHeroHeight();
  formSelectChange();
  searchFormSubmit();
  clickModalOverlay();
  chooseSizeNutritional();
  locationSelectChange();

  function locationSelectChange() {
    $('.location-select').on('change', function () {

      let id = $(this).val();

      if($('#email-recipient').length > 0 && $(this).hasClass('get-email')) {
        $.ajax({
          type: 'POST',
          url: '/wp-admin/admin-ajax.php',
          data: {
            'action': 'getLocationMail',
            'id': id
          },
          success: function (data) {
            let response = JSON.parse(data);
            $('#email-recipient').val(response['email']);
            $('#location-title').val(response['title']);
          }
        });
      } else if($('#email-recipient').length > 0 && $(this).hasClass('get-booking-email')) {
        $.ajax({
          type: 'POST',
          url: '/wp-admin/admin-ajax.php',
          data: {
            'action': 'getBookingMail',
            'id': id
          },
          success: function (data) {
            let response = JSON.parse(data);
            $('#email-recipient').val(response['email']);
            $('#location-title').val(response['title']);
          }
        });
      } else if($(this).hasClass('get-title')) {
        let name = $(this).attr('name');
        $.ajax({
          type: 'POST',
          url: '/wp-admin/admin-ajax.php',
          data: {
            'action': 'getLocationTitle',
            'id': id
          },
          success: function (data) {
            $('input[name="' + name + '-value"]').val(data);
          }
        });
      }
    });
  }

  function chooseSizeNutritional() {
    $('.modal-info__info-sizes a').on('click', function () {
      if (!$(this).hasClass('active')) {
        $(this).siblings().removeClass('active');
        $(this).addClass('active');
        $('.modal-info__info-list').removeClass('active');
        $('.modal-info__info-list[data-tab="' + $(this).data('tab-btn') + '"]').addClass('active');
      }
    });
  }

  function clickModalOverlay() {
    $('.modal').on('click', function (e) {
      const modalInner = $('.modal__inner');
      if (!modalInner.is(e.target) && modalInner.has(e.target).length === 0) {
        $(this).parents().find('.modal').fadeOut();
        toggleBodyOverflow();
      }
    })
  }

  function searchFormSubmit() {
    $('.search__form').on('submit', function (e) {
      e.preventDefault();
    });
  }

  function formSelectChange() {
    $('.form select').change(function () {
      if ($(this).val() != '') {
        $(this).removeClass('grey');
      } else {
        $(this).addClass('grey');
      }
    });
  }

  function calcHeroHeight() {
    if ($(window).width() < 992) return false;

    var heroInner = $('.hero__inner'),
      header = $('.header'),
      heroAlert = $('.hero__alert'),
      heroInnerHeight;

    if (heroInner.length) {
      if (heroAlert.length) {
        heroInnerHeight = $(window).height() - header.height() - heroAlert.height() - 70;
      } else {
        heroInnerHeight = $(window).height() - header.height();
      }
      heroInner.css('min-height', heroInnerHeight);
    }
  }

  function showLocationInfo() {
    $('.location').on('click', function (e) {
      e.preventDefault();
      $('.modal-location').fadeIn();
      toggleBodyOverflow();
    });
  }

  function toggleLocationsMap() {
    $('.locations__map-toggle').on('click', function (e) {
      e.preventDefault();
      $('.locations-wrapper').toggleClass('showMap');
    });
  }

  function productInfoModal() {
    $('.product__info-btn').on('click', function (e) {
      e.preventDefault();
      $('.modal-info').fadeIn();
      toggleBodyOverflow();
    });
  }

  function toggleBodyOverflow() {
    var body = document.body;
    body.classList.toggle('overflow-hidden');
  }

  function menuBtnClick() {
    var menuBtn = document.querySelector('.menu-btn'),
      menu = document.querySelector('.header__menu')
    menuBtn.addEventListener('click', function () {
      menuBtn.classList.toggle('active');
      toggleBodyOverflow();
      menu.classList.toggle('active');
    });
  }

  function windowResize() {
    window.addEventListener('resize', function () {

      var menu = document.querySelector('.header__menu');
      if (window.screen.width > 1200) {
        menu.classList.remove('transition');
      } else {
        setTimeout(function () {
          menu.classList.add('transition');
        }, 350);
      }

    });
  }

  function closeModal() {
    $('.modal__close').on('click', function (e) {
      e.preventDefault();
      $(this).parents().find('.modal').fadeOut();
      toggleBodyOverflow();
    });
  }

  // check if choosed date in past
  function isPastDate() {
    $('.walcf7-datepicker').on('change', function () {
      var today = new Date(),
        dd = String(today.getDate()).padStart(2, '0'),
        mm = String(today.getMonth() + 1).padStart(2, '0'),
        yyyy = today.getFullYear(),
        choosed_date = $(this).val();

      today = yyyy + '-' + mm + '-' + dd;

      if ($(this).hasClass('future') && choosed_date < today && choosed_date != '') {
        $(this).val('');
        alert('วันที่ที่เลือกอยู่ในอดีต!');
        return false;
      } else if ($(this).hasClass('past') && choosed_date > today && choosed_date != today && choosed_date != '') {
        $(this).val('');
        alert('วันที่ที่เลือกอยู่ในอนาคต!');
      }
    });
  }




})(jQuery);