const request = require( 'request' );
const fs = require( 'fs' );
const Storage = require( 'node-storage' );
const Censor = require( "./censor" );
const Translator = require( "./translator" );
var translations = undefined;

const maxCachedMessageLength = 64;
const memTranslations = [];
const memLimit = 1000;

function create( opts ) {
  switch( opts[ "api" ] || "Yandex" ) {
    case "AWS":
      let accessKeyId = opts[ "access" ];
      let secretAccessKey = opts[ "secret" ];
      if( !accessKeyId ) { throw new Error( "access is required" ); }
      if( !secretAccessKey ) { throw new Error( "secret is required" ); }
      translations = new Storage( "aws.db" );

      return ( message, language, callback, censored = true ) => {
        callTranslator( "AWS", { accessKeyId, secretAccessKey }, message, language, callback, censored );
      };
    case "Yandex":
      let apiKey = opts[ "apiKey" ];
      if( !apiKey ) { throw new Error( "API key is required" ); }
      translations = new Storage( "yandex.db" );

      return ( message, language, callback, censored = true ) => {
        callTranslator( "Yandex", apiKey, message, language, callback, censored );
      };
    default:
      throw new Error( "Unsupported API" );
  }
}

/** Description of the function
 * @name TranslateCallback
 * @function
 * @param {String|void} error
 * @param {String|void} translation
 * @param {String|void} language_response
 * @param {String|void} language_target
 */
function callTranslator( api, credentials, message, language, callback, censored ) {
  // Blacklist filtering
  if( Censor.hasBlacklistedWord( message ) ) {
    callback( "Blacklisted Word", null, null, language );
    return;
  }

  // Check Cache
  const resp = message.length < maxCachedMessageLength
    ? translations.get( message ) || undefined
    : memTranslations.find( translation => translation.message == message )

  if( resp && resp[ language ] ) {
    // Found in cache
    var text = resp[ language ];
    // Censoring
    if( censored ) {
      text = Censor.naughtyToNice( text );
    }
    callback( null, text, resp.lang, language );
  }
  else {
    switch( api ) {
      case "AWS":
        Translator.AWSTranslate( credentials.accessKeyId, credentials.secretAccessKey, message, language, ( error, translatedMessage, fromLanguage, toLanguage ) => {
          sendTranslatedMessage( error, message, translatedMessage, fromLanguage, toLanguage, censored, callback );
        } );
        break;
      case "Yandex":
        Translator.YandexTranslate( credentials, message, language, ( error, translatedMessage, fromLanguage, toLanguage ) => {
          sendTranslatedMessage( error, message, translatedMessage, fromLanguage, toLanguage, censored, callback );
        } );
        break;
    }
  }
}

function sendTranslatedMessage( error, message, translatedMessage, fromLanguage, toLanguage, censored, callback ) {
  if( error ) {
    callback( error, null, null, toLanguage );
  }
  else {
    var text = translatedMessage;
    // Censoring
    if( censored ) {
      text = Censor.naughtyToNice( text );
    }
    callback( error, text, fromLanguage, toLanguage );
    // Cache translation
    if( message.length < maxCachedMessageLength ) {
      let translation = translations.get( message ) || {};
      translation.lang = fromLanguage;
      translation[ toLanguage ] = translatedMessage;
      translations.put( message, translation );
    }
    else {
      if( memTranslations.length >= memLimit ) {
        memTranslations.splice( 0, 1 );
      }
      memTranslations.push( {
        message: message,
        lang: fromLanguage,
        [ toLanguage ]: translatedMessage
      } );
    }
  }
}

module.exports = {
  create
}
