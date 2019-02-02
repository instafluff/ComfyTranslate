var Censor = require("../censor");
var assert = require('chai').assert;

describe('Censor', function() {
  describe('containsNaughtyWord()', function() {
    it('should return false when no bad words', function() {
      assert.isFalse( Censor.containsNaughtyWord( "this is a clean sentence" ) );
    });
  });

  describe('containsNaughtyWord()', function() {
    it('should return true when containing bad words', function() {
      assert.isTrue( Censor.containsNaughtyWord( "this is a fucking naughty sentence" ) );
    });
  });

  describe('hasBlacklistedWord()', function() {
    it('should return false when no blacklist words', function() {
      assert.isFalse( Censor.hasBlacklistedWord( "this is a clean sentence" ) );
    });
  });

  describe('hasBlacklistedWord()', function() {
    it('should return true when containing blacklist words', function() {
      assert.isTrue( Censor.hasBlacklistedWord( "this is a blacklisted lul sentence ha" ) );
    });
  });

  describe('naughtyToNice()', function() {
    it('should return the same sentence when clean', function() {
      assert.equal( Censor.naughtyToNice( "this is a clean sentence" ), "this is a clean sentence" );
    });
  });

  describe('naughtyToNice()', function() {
    it('should return the same sentence when naughty', function() {
      assert.equal( Censor.naughtyToNice( "this is a fucking naughty sentence" ), "this is a [censored] naughty sentence" );
    });
  });
});
