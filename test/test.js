var translate = require("../index");
var assert = require('chai').assert;

describe('Translate', function() {
  describe('containsNaughtyWord()', function() {
    it('should return false when no bad words', function() {
      assert.isFalse( translate.containsNaughtyWord( "this is a clean sentence" ) );
    });
  });

  describe('containsNaughtyWord()', function() {
    it('should return true when containing bad words', function() {
      assert.isTrue( translate.containsNaughtyWord( "this is a fucking naughty sentence" ) );
    });
  });

  describe('hasBlacklistedWord()', function() {
    it('should return false when no blacklist words', function() {
      assert.isFalse( translate.hasBlacklistedWord( "this is a clean sentence" ) );
    });
  });

  describe('hasBlacklistedWord()', function() {
    it('should return true when containing blacklist words', function() {
      assert.isTrue( translate.hasBlacklistedWord( "this is a blacklisted lul sentence ha" ) );
    });
  });

  describe('naughtyToNice()', function() {
    it('should return the same sentence when clean', function() {
      assert.equal( translate.naughtyToNice( "this is a clean sentence" ), "this is a clean sentence" );
    });
  });

  describe('naughtyToNice()', function() {
    it('should return the same sentence when naughty', function() {
      assert.equal( translate.naughtyToNice( "this is a fucking naughty sentence" ), "this is a [censored] naughty sentence" );
    });
  });
});
