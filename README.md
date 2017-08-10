Chrome EZProxy Redirect
=======================

By: Tom Wambold <tom5760@gmail.com>

Updates By: Rohit Agrawal <https://github.com/rohitagr>

Code: https://github.com/tom5760/chrome-ezproxy

Extension: https://chrome.google.com/extensions/detail/gfhnhcbpnnnlefhobdnmhenofhfnnfhi

Destription
-----------

Many universities use EZProxy to allow its students access to various online
databases.  This extension adds a button to Chrome which allows for a quick way
to reload the current page through your EZProxy system.

All it does is pass the URL to your library's EZProxy login URL.  For example:

    http://ieeexplore.ieee.org/

would change to:

    http://www.library.drexel.edu/cgi-bin/r.cgi?url=http://ieeexplore.ieee.org

Change Log
----------

Version 16 - August 10, 2017:
* Update to yesterdays release, now uses the "activeTab" permission, instead of
  the "tabs" permission, which removes the scary warning about the extension
  being able to access browser history (it doesn't).

Version 15 - August 9, 2017:
* Update to fix issue in Chrome 60.  The latest version of Chrome restricts
  access to the URL the current tab is on behind the "tabs" permission.  This
  is required so that the extension can redirect you when you click the
  extension button.  Nothing about the actual function of the extension
  changed, just the added permission to keep the current functionality working.

Version 14 - December 12, 2014:
* Use chrome's synced storage to save the redirect url

Version 10 - March 23, 2011:
* Added support for updating URL lists from my EZProxy URL Database, so
  I don't have to release new versions of the extension just to add new
  URLs. https://ezproxy-db.appspot.com/
* Fixed Columbia University URL (thanks Chris)
* Added RIT URL (thanks Sakshar)

Version 8,9 - December 20, 2010:
* Added URL for University of Central Florida (thanks Pieter).
* Updated icon (I seem to have forgotten to commit it last time).

Version 5 - September 8, 2010:
* Added context menu item for links.
* Added drop down box in options to select school.

Version 4 - March 3, 2010:
* Initial version on GitHub.
* Simple redirect button.
