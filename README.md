EZProxy Redirect Browser Extension
==================================

[![Build](https://github.com/tom5760/chrome-ezproxy/actions/workflows/publish.yml/badge.svg)](https://github.com/tom5760/chrome-ezproxy/actions/workflows/publish.yml)

Version: [v22](https://github.com/tom5760/chrome-ezproxy/releases/tag/v22)

* By: Tom Wambold <tom5760@gmail.com>
* Code: https://github.com/tom5760/chrome-ezproxy
* Chrome Extension: https://chromewebstore.google.com/detail/ezproxy-redirect/gfhnhcbpnnnlefhobdnmhenofhfnnfhi
* Firefox Extension: https://addons.mozilla.org/addon/firefox-ezproxy-redirect/

Description
-----------

Many universities use EZProxy to allow its students access to various online
databases.  This extension adds a button to Chrome which allows for a quick way
to reload the current page through your EZProxy system.

All it does is pass the URL to your library's EZProxy login URL.  For example:

    http://ieeexplore.ieee.org/

would change to:

    http://www.library.drexel.edu/cgi-bin/r.cgi?url=http://ieeexplore.ieee.org
