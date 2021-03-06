(function ($) {

  window.PTL = window.PTL || {};

  PTL.common = {

    init: function () {
      PTL.utils.makeSelectableInput('#js-select-language',
        {
          allowClear: true,
          placeholder: gettext("All Languages"),
          width: 'off'
        },
        function (e) {
          var langCode = $(this).val(),
              projectCode = $('#js-select-project').val();
          PTL.common.navigateTo(langCode, projectCode);
      });
      PTL.utils.makeSelectableInput('#js-select-project',
        {
          allowClear: true,
          placeholder: gettext("All Projects"),
          width: 'off'
        },
        function (e) {
          var projectCode = $(this).val(),
              langCode = $('#js-select-language').val();
          PTL.common.navigateTo(langCode, projectCode);
      });

      /* Collapsing functionality */
      $(document).on("click", ".collapse", function (e) {
        e.preventDefault();
        $(this).siblings(".collapsethis").slideToggle("fast");

        if ($("textarea", $(this).next("div.collapsethis")).length) {
          $("textarea", $(this).next("div.collapsethis")).focus();
        }
      });

      /* Fancybox on links */
      $(document).on("click", "a.fancybox", function (e) {
        e.preventDefault();
        $.fancybox({'href': $(e.target).attr('href'), 'type': 'ajax'});
      });

      /* Path summary */
      $(document).on("click", "#js-path-summary", function (e) {
        e.preventDefault();
        var node = $("#" + $(this).data('target')),
            $textNode = $(this),
            data = node.data();

        function hideShow() {
          node.slideToggle('slow', 'easeOutQuad', function () {
            node.data('collapsed', !data.collapsed);
            var newText = data.collapsed ? gettext('Expand details') : gettext('Collapse details');
            $textNode.text(newText);
          });
        }

        if (data.loaded) {
          hideShow();
        } else {
          var url = $(this).attr('href');
          $.ajax({
            url: url,
            success: function (data) {
              node.html(data).hide();
              node.data('loaded', true);
              hideShow();
            },
            beforeSend: function () {
              node.spin();
            },
            complete: function () {
              node.spin(false);
            },
          });
        }
      });

      /* Overview actions */
      $("#overview-actions").on("click", ".js-overview-actions-upload",
        function (e) {
          e.preventDefault();
          $.fancybox("#upload");
      });
      $("#overview-actions").on("click", ".js-overview-actions-delete-path",
        function (e) {
          return confirm(gettext("Are you sure you want to continue?") + "\n" +
                         gettext("This operation cannot be undone."));
      });

      /* Generic toggle */
      $(document).on("click", ".js-toggle", function (e) {
        e.preventDefault();
        var target = $(this).attr("href") || $(this).data("target");
        $(target).toggle();
      });

      /* Sorts language names within select elements */
      var ids = ["id_languages", "id_alt_src_langs", "-language",
                 "-source_language"];

      $.each(ids, function (i, id) {
        var $selects = $("select[id$='" + id + "']");

        $.each($selects, function (i, select) {
          var $select = $(select);
          var options = $("option", $select);

          if (options.length) {
            if (!$select.is("[multiple]")) {
              var selected = $(":selected", $select);
            }

            var opsArray = $.makeArray(options);
            opsArray.sort(function (a, b) {
              return PTL.utils.strCmp($(a).text(), $(b).text());
            });

            options.remove();
            $select.append($(opsArray));

            if (!$select.is("[multiple]")) {
              $select.get(0).selectedIndex = $(opsArray).index(selected);
            }
          }
        });
      });
    },

    /* Navigates to `languageCode`, `projectCode` while retaining the
     * current context when applicable */
    navigateTo: function (languageCode, projectCode) {
      var curProject = $('#js-select-project').data('initial-code'),
          curLanguage = $('#js-select-language').data('initial-code'),
          curUrl = window.location.toString(),
          newUrl = curUrl,
          langChanged = languageCode !== curLanguage,
          projChanged = projectCode !== curProject,
          hasChanged = langChanged || projChanged;

      if (!hasChanged) {
        return;
      }

      if (languageCode === '' && projectCode === '') {
        newUrl = l('/');
      } else if (languageCode === '' && projectCode !== '') {
        newUrl = l(['', 'projects', projectCode].join('/'));
      } else if (languageCode !== '' && projectCode === '') {
        newUrl = l(['', languageCode].join('/'));
      } else if (languageCode !== '' && projectCode !== '') {
        if (projChanged) {
          newUrl = l(['', languageCode, projectCode].join('/'));
        } else if (langChanged) {
          if (curLanguage === '') {
            newUrl = curUrl.replace('projects/' + curProject,
                                    languageCode + '/' + curProject);
          } else {
            newUrl = curUrl.replace(curLanguage + '/' + curProject,
                                    languageCode + '/' + curProject)
                           .replace(/(\#|&)unit=\d+/, '');
          }
        }
        var changed = projChanged ? 'project' : 'language';
        $.cookie('user-choice', changed, {path: '/'});
      }

      window.location.href = newUrl;
    },

    /* Updates the disabled state of an input button according to the
     * checked status of input checkboxes.
     */
    updateInputState: function (checkboxSelector, inputSelector) {
      var $checkbox = $(checkboxSelector);
      if ($checkbox.length) {
        function updateInputState($checkboxes, $input) {
          if ($checkboxes.length === $checkboxes.filter(':checked').length) {
            $input.removeAttr('disabled');
          } else {
            $input.attr('disabled', 'disabled');
          }
        }
        var $input = $(inputSelector);
        updateInputState($checkbox, $input);
        $checkbox.change(function () {
          updateInputState($checkbox, $input);
        });
      }
    },

    /* Updates relative dates */
    updateRelativeDates: function () {
      $('.js-relative-date').each(function (i, e) {
        $(e).text(PTL.utils.relativeDate(Date.parse($(e).attr('datetime'))));
      });
    }

  };

}(jQuery));

$(function ($) {
  PTL.zoom.init();
  PTL.common.init();

  $(".js-select2").select2({
    width: "resolve"
  });
  // Hide the help messages for the Select2 multiple selects.
  $("select[multiple].js-select2").siblings("span.help_text").hide();
});
