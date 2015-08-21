hashtagHelper
-------------

A small library that highlights hashtags as a user types and provides suggestions based on a customizable criteria. 

# Installation

The hashtag-helper.js, hashtag-helper.css, and textarea-helper.js files are all necessary. Additionally, you will need to include jQuery. I've included a minified copy of what is currently the latest version, 2.1.4. It should work with some earlier versions, but I make no guarantees. 

# Usage

To create the helper, call 
    
    $("#mytextarea").hashtagHelper(hashtags)
    
Where hashtags is an array of possible hashtags. 

By default, hashtags that start with what the user has already typed will be shown (e.g., #f would show "foo" if the candidates are "foo" and "bar"). 

You can modify the criteria by which hashtags are matched by providing a second parameter "func":

    $("#mytextarea").hashtagHelper(hashtags, func)
    
"func" must be a function that takes the start of the hashtag the user has provided and returns an array of suggestions. The "hashtags" parameter can be null if func is provided, or you can provide it as an array of candidates, which will be passed to "func". 