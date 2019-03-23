var AWS = require("aws-sdk");
const request = require( 'request' );
var awsTranslate = null;

function AWSTranslate( accessKeyId, secretAccessKey, message, fromLang, toLang, callback ) {
  if( !awsTranslate ) {
    // Setup AWS Translate
    awsTranslate = new AWS.Translate({
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
      region: "us-west-2"
    });
  }
  awsTranslate.translateText({
    SourceLanguageCode: fromLang || "auto",
    TargetLanguageCode: toLang,
    Text: message,
    TerminologyNames: [] // Add emote names in here
  }, ( err, data ) => {
    // Error handling
    if( err ) { callback( err, message, null, toLang ); return; }

    try {
      callback( null, data.TranslatedText, data.SourceLanguageCode, toLang );
    }
    catch( e ) {
      callback( e.message, message, null, toLang );
    }
  });
}

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
function YandexTranslate( apiKey, message, fromLang, toLang, callback ) {
  if( !apiKey ) {
    throw new Error( "Translate module not given API key" );
  }

  request.get(
    `https://translate.yandex.net/api/v1.5/tr.json/translate?key=${apiKey}&lang=${toLang}&text=${encodeURI( message )}`,
    ( err, res, body ) => {
      // Error handling
      if( err ) { callback( err, message, null, toLang ); return; }

      try {
        const resp = JSON.parse( body );
        if( resp && resp.lang ) {
          callback( null, resp.text[ 0 ] || "", resp.lang, toLang );
        }
        else {
          callback( "Failed to translate", message, null, toLang );
        }
      }
      catch( e ) {
        callback( e.message, message, null, toLang );
      }
    } );
}

module.exports = {
  AWSTranslate,
  YandexTranslate
}
