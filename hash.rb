#!/usr/bin/env ruby
require 'digest/sha1'
print Digest::SHA1.hexdigest(ARGV.first)
print ''
