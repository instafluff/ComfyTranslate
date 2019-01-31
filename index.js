const fs = require( 'fs' );
const request = require( 'request' );
const Storage = require( 'node-storage' );
const translations = new Storage( "translations.db" );

const maxCachedMessageLength = 64;
const memTranslations = [];
const memLimit = 1000;

const naughtylist = fs.readFileSync( "facebook-bad-words-list_comma-separated-text-file_2018_07_29.txt", "utf8" )
  .split( ", " ).filter( Boolean );

const naughtyRegexList = naughtylist
  .map( word => new RegExp( `\\b${ word }\\b`, "gi" ) )
const globalblacklist = fs.readFileSync( "blacklist.txt", "utf8" ).split( "\n" )
  .filter( Boolean )
  .map( word => new RegExp( `\\b${ word }\\b`, "gi" ) );
const CENSORED = "[censored]"

function naughtyToNice( text ) {
  return naughtyRegexList.reduce(
    ( string, regex ) => string.replace( regex, CENSORED ),
    text
  )
}

function containsNaughtyWord( text ) {
  return naughtylist.some( x => text.includes( x ) );
}

function hasBlacklistedWord( string ) {
  return globalblacklist.some( regex => regex.test( string ) )
}

function translate( message, language, callback, censored = true ) {
  // Blacklist filtering
  if( hasBlacklistedWord( message ) ) return;

  const resp = message.length < maxCachedMessageLength
    ? translations.get( message ) || undefined
    : memTranslations.find( translation => translation.message == message )

  if( resp && resp[ language ] ) {
    var text = resp.text[ 0 ] || "";
    // Censoring
    if( censored ) {
      text = naughtyToNice( text );
    }
    callback( null, text, resp.lang, language );
  }
  else {
    translateYandex( {
      apiKey: process.env.YANDEX_KEY,
      message,
      language,
      callback
    });
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

/**
 * Calls translator
 *
 * @param {Object} options
 * @param {String} options.apiKey API key used for contacting Yandex
 * @param {String} options.message the message to be translate
 * @param {String} options.language The desired language
 * @param {Boolean=true} options.censored Option to toggle censoring off
 * @param {TranslateCallback} options.callback
 *
 * @return void
 */
function translateYandex( opts ) {
  const {
    apiKey,
    message,
    language,
    callback,
    censored = true,
  } = opts || {};

  if( !apiKey ) {
    throw new Error("Translate module not given API key")
  }

  request.get(
    "https://translate.yandex.net/api/v1.5/tr.json/translate?key=" + apiKey + "&lang=" + language + "&text=" + encodeURI( message ),
    ( err, res, body ) => {
      // Error handling
      if( err ) {
        callback( "Error in translation request:" + err, "", "", "" );
      }
      try {
        const resp = JSON.parse( body );
        if( resp && resp.lang ) {
          var text = resp.text[ 0 ] || "";
          // Censoring
          if( censored ) {
            text = naughtyToNice( text );
          }
          callback( null, text, resp.lang, language );
          // Cache translation
          if( message.length < maxCachedMessageLength ) {
            const translation = translations.get( message ) || {};
            translation[ language ] = resp;
            translations.put( message, translation );
          }
          else {
            if( memTranslations.length >= memLimit ) {
              memTranslations.splice( 0, 1 );
            }
            memTranslations.push( {
              message: message,
              [ language ]: resp
            } );
          }
        }
      } catch( e ) {
        console.log( e );
      }
    } );
}

module.exports = {
  naughtyToNice,
  containsNaughtyWord,
  hasBlacklistedWord,
  translate
}
