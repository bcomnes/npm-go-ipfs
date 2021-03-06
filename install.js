#!/usr/bin/env node

var fs = require('fs')
var path = require('path')
var mkdirp = require('mkdirp');
var nugget = require('nugget')
var goenv = require('go-platform')
var extract = require('extract-zip')
var version = require('./package.json').version

checkPlatform(goenv) // make sure we can do this.

// hacky hack hack to work around unpublishability
version = version.replace(/-[0-9]+/, "")

var filename = 'ipfs_v'+ version +'_' + goenv.GOOS + '-' + goenv.GOARCH + '.zip'
var url = 'https://gobuilder.me/get/github.com/ipfs/go-ipfs/cmd/ipfs/' + filename

var bin = path.join(__dirname, 'bin')
var tmp = path.join(__dirname, 'tmp')
var installPath = path.join(bin, 'ipfs')
var zipfile = path.join(tmp, filename)

// mk tmp dir
mkdirp(tmp, function(err) {
  if (err) onerror(err)

  // download binary
  nugget(url, {target: filename, dir: tmp, resume: true, verbose: true}, function (err) {
    if (err) return onerror(err)

    // extract zip
    extract(zipfile, {dir: tmp}, function (err) {
      if (err) return onerror(err)

      // move ipfs binary into place.
      fs.rename(path.join(tmp, "ipfs", "ipfs"), installPath, function(err) {
        if (err) return onerror(err)

        // remove zip from disk
        fs.unlink(zipfile, function(err) {
          if (err) return onerror(err)

        })
      })
    })
  })
})

function onerror (err) {
  if (err) throw err
}

function checkPlatform(goenv) {
  switch (goenv.GOOS) {
  case "darwin":
  case "linux":
  case "freebsd":
    break

  default:
    throw new Error("no binary available for os:" + goenv.GOOS)
  }

  switch (goenv.GOARCH) {
  case "amd64":
  case "386":
  case "arm":
    break

  default:
    throw new Error("no binary available for arch: " + goenv.GOARCH)
  }
}
