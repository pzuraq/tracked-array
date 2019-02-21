'use strict';

const DEFAULT_OPTIONS = {
  requireLegacyBrowserSupport: true,
};

module.exports = {
  name: require('./package').name,

  included() {
    this._super.included.apply(this, arguments);

    let parent = this.parent;
    let host = this._findHost();

    let parentOptions = (parent.options || {})[this.name];
    let hostOptions = (host.options || {})[this.name];

    let config = Object.assign({}, DEFAULT_OPTIONS, parentOptions, hostOptions);

    let plugins = [
      [
        require.resolve('babel-plugin-debug-macros'),
        {
          debugTools: {
            isDebug: true,
            source: 'tracked-array-flags',
          },

          flags: [
            {
              name: 'tracked-array-flags',
              source: 'tracked-array-flags',
              flags: {
                REQUIRE_LEGACY_BROWSER_SUPPORT:
                  config.requireLegacyBrowserSupport,
              },
            },
          ],
        },
        'tracked-array-debug-macros',
      ],
    ];

    this.options = { babel: { plugins } };
  },
};
