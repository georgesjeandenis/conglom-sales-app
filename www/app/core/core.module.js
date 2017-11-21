(function() {

"use strict";

angular.module('app.core', [
	'ionic',
  'pascalprecht.translate',
	'ngCordova',
	'app.LocalStorage',
	'app.StoreAPI',
	'app.Config',
	'app.layout',
	'app.Authentication',
	'app.CustomerSelector',
])
  .config( runBlock );

// =======================
// Function definitions
// =======================

runBlock.$inject = ['$translateProvider'];

function runBlock( $translateProvider ) {
    $translateProvider
      .useStaticFilesLoader({
        prefix: 'app/locales/',
        suffix: '.json'
      })
      .registerAvailableLanguageKeys(['en', 'fr'], {
        'en' : 'en', 'en_GB': 'en', 'en_US': 'en',
        'fr' : 'fr'
      })
      .preferredLanguage('fr')
      .fallbackLanguage('fr')
      .determinePreferredLanguage()
      .useSanitizeValueStrategy('escapeParameters');


  };

})();