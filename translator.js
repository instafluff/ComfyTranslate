var AWS = require("aws-sdk");
const request = require( 'request' );
var awsTranslate = null;

function AWSTranslate( accessKeyId, secretAccessKey, message, language, callback ) {
  if( !awsTranslate ) {
    // Setup AWS Translate
    awsTranslate = new AWS.Translate({
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
      region: "us-west-2"
    });
  }
  awsTranslate.translateText({
    SourceLanguageCode: "auto",
    TargetLanguageCode: language,
    Text: message,
    TerminologyNames: [] // Add emote names in here
  }, ( err, data ) => {
    // Error handling
    if( err ) { callback( err, message, null, language ); }

    try {
      callback( null, data.TranslatedText, data.SourceLanguageCode, language );
    }
    catch( e ) {
      callback( e.message, message, null, language );
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
function YandexTranslate( apiKey, message, language, callback ) {
  if( !apiKey ) {
    throw new Error( "Translate module not given API key" );
  }

  request.get(
    `https://translate.yandex.net/api/v1.5/tr.json/translate?key=${apiKey}&lang=${language}&text=${encodeURI( message )}`,
    ( err, res, body ) => {
      // Error handling
      if( err ) { callback( err, message, null, language ); }

      try {
        const resp = JSON.parse( body );
        if( resp && resp.lang ) {
          callback( null, resp.text[ 0 ] || "", resp.lang, language );
        }
        else {
          callback( "Failed to translate", message, null, language );
        }
      }
      catch( e ) {
        callback( e.message, message, null, language );
      }
    } );
}

module.exports = {
  AWSTranslate,
  YandexTranslate
}
