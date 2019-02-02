const request = require( 'request' );

/**
 * Calls Yandex translation
 *
 * @param {String} apiKey API key used for contacting Yandex
 * @param {String} message the message to be translate
 * @param {String} language The desired language
 * @param {TranslateCallback} callback
 *
 * @return void
 */
function YandexTranslate( apiKey, message, language, callback ) {
  if( !apiKey ) {
    throw new Error( "Translate module not given API key" );
  }

  request.get(
    `https://translate.yandex.net/api/v1.5/tr.json/translate?key=${apiKey}&lang=${language}&text=${encodeURI( message )}`,
    ( err, res, body ) => {
      // Error handling
      if( err ) { callback( err, null, null, language ); }

      try {
        const resp = JSON.parse( body );
        if( resp && resp.lang ) {
          callback( null, resp.text[ 0 ] || "", resp.lang, language );
        }
        else {
          callback( "Failed to translate", null, null, language );
        }
      }
      catch( e ) {
        callback( e.message, null, null, language );
      }
    } );
}

module.exports = {
  YandexTranslate
}
