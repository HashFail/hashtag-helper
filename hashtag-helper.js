/*
  jQuery hashtag-helper v0.2
	(c) 2013-2015 Jake Christensen - jakec43@gmail.com
	license: MIT
	adapted from jQuery #hashtags by "doenervich": http://doenervich.github.io/jquery-hashtags/
*/

(function($) {
	$.fn.hashtagHelper = function(suggestions, func) {
		if(this[0].hashtagSuggestor){
			if(suggestions){
				this[0].hashtagSuggestor.setSuggestions(suggestions, func);
			}
			return this[0].hashtagSuggestor;
		} else {
			this[0].hashtagSuggestor = new HashtagSuggestor(this[0], suggestions, func);
			return this[0].hashtagSuggestor;
		}
  	};
	HashtagSuggestor = function(target, suggestions, func){
		var t = $(target);
		var suggestor = this;
		this.target = target;
		this.cursorPosition = 0;
		this.caretPos = {top: 0, left: 0};
		this.updateCursorPosition = function(){
			this.cursorPosition = t.textareaHelper("getOriginalCaretPos");
			this.caretPos = t.textareaHelper("caretPos");
			this.startIndex = this.getHashtagStartIndex(this.cursorPosition);
			this.endIndex = this.getHashtagEndIndex(this.cursorPosition);
		};
		this.updateCaretPosition = function(){
			this.caretPos = t.textareaHelper("caretPos");
		}
		this.setHashtags = function() {
			var t = $(this.target);
			var str = t.val();
			t.parent().parent().find(".highlighter").css("width", t.outerWidth() + "px").css("height", t.outerHeight() + "px");
			str = str.replace(/^#([a-zA-Z0-9]+)/g, '<span class="inline_hashtag">#$1</span>');
			str = str.replace(/(\s|\n)#([a-zA-Z0-9]+)/g, '$1<span class="inline_hashtag">#$2</span>');
			str = str.replace(/\n/g, '<br>');
			t.parent().parent().find(".highlighter").children(".offseter").html(str);
		}
		this.repositionSuggestions = function() {
			var t = $(this.target);
			var suggestionsContainer = t.parent().next(".hashtag-suggestions-container");
			suggestionsContainer.css("left", this.caretPos.left + 6 + "px");
			suggestionsContainer.css("top", this.caretPos.top + 1 + "px");
		}
		this.hideSuggestions = function() {
			var t = $(this.target);
			if(this.startIndex > -1 && this.caretPos.top > -1 && this.caretPos.top < t.outerHeight()){
				t.parent().next(".hashtag-suggestions-container").show();
			}else{
				t.parent().next(".hashtag-suggestions-container").hide();
			}
		}
		this.updateSuggestions = function(){
			var t = $(this.target);
			var hashtag = this.getHashtag(this.cursorPosition - 1);
			var suggestionsContainer = t.parent().next(".hashtag-suggestions-container");
			if(hashtag.length > 0)
			{
				suggestionsContainer.empty();
				suggestionsContainer.show();
				var candidates = this.suggestions;
				var matched = [];
				if(this.suggestionsFunction){
					matched = this.suggestionsFunction(hashtag, candidates);
				}else{
					var regExp = new RegExp("^" + hashtag, "i");
					for(var i = 0; i < candidates.length; i++)
					{
						if(regExp.test(candidates[i]))
						{
							matched.push(candidates[i])
						}
					}
				}
				for(var i = 0; i < matched.length; i++)
				{
					var div = $("<div class=\"hashtag-suggestion\">" + matched[i] + "</div>");
					div.on("click", function(){
						suggestor.insertHashtag($(this).html());
					});
					suggestionsContainer.append(div);
				}
			}
			else
			{
				suggestionsContainer.hide();
			}
		}
		this.getHashtag = function() {
			if(this.startIndex > -1)
			{
				return $(this.target).val().substring(this.startIndex, this.endIndex);
			}
			else
			{
				return "";
			}
		}
		this.getHashtagEndIndex = function(index)
		{
			var text = $(this.target).val();
			while(index < text.length)
			{
				var code = text.charCodeAt(index);
				if(code < 48 || code > 57 && code < 65 || code > 90 && code < 97 || code > 122)
				{
					return index;
				}
				index++;
			}
			return index;
		}
		this.getHashtagStartIndex = function(index)
		{
			var text = $(this.target).val();
			while(--index > -1)
			{
				var code = text.charCodeAt(index);
				if(code == 35)
				{
					if(index == 0 ||text.charAt(index - 1).match(/(\s)/)){
						return index + 1;
					}else{
						return -1;
					}
				}
				if(code < 48 || code > 57 && code < 65 || code > 90 && code < 97 || code > 122)
				{
					return -1;
				}
			}
			return -1;
		}
		this.insertHashtag = function(hashtag) {
			var t = $(this.target);	
			var oldHTML = t.val();
			t.val(oldHTML.substring(0, this.startIndex) + hashtag + oldHTML.substring(this.endIndex));
			this.setHashtags();
			this.updateSuggestions();
			t.textareaHelper("setCaretPos", this.startIndex + hashtag.length);
			t.parent().next(".hashtag-suggestions-container").hide();
		}
		var holder = $('<div class="jqueryHashtags"><div class="highlighter"><div class="offseter"></div></div><div class="typehead"></div></div>');
		holder.insertBefore(t);
		holder.children(".typehead").append(t);
		t.addClass("theSelector");
		t.textareaHelper();
		t.on("click", function(){
			suggestor.setHashtags();
			suggestor.updateCursorPosition();
			suggestor.updateSuggestions();
			suggestor.repositionSuggestions();
		});
		t.on("scroll", function(){
			var t = $(this);
			t.parent().siblings(".highlighter").children(".offseter").css("top", "-" + t.scrollTop() + "px");
			suggestor.updateCaretPosition();
			suggestor.repositionSuggestions();
			suggestor.hideSuggestions();
		})
		t.on("keydown paste cut", function(e){
			var keyCode = e.which || e.keyCode;
			if(keyCode == 9){
				var t = $(this);
				var next = t.parent().next(".hashtag-suggestions-container");
				if(next.css("display") == "block"){
					if(e.shiftKey){
						t.focus();
						next.children().removeClass("focused");
					}else{
						next.focus();
						next.children().first().addClass("focused");
					}
					e.preventDefault();
				}
			}else{
				window.setTimeout(function(){
					suggestor.setHashtags();
					suggestor.updateCursorPosition();
					suggestor.updateSuggestions();
					suggestor.repositionSuggestions();
				}, 0);
			}
		});
		t.parent().prev().on('click', function() {
			$(suggestor.target).parent().find(".theSelector").focus();
		});
		var suggestionsContainer = $("<div class=\"hashtag-suggestions-container\"></div>");
		suggestionsContainer.attr("tabindex", "-1");
		suggestionsContainer.on("keydown", function(e){
			var keyCode = e.which || e.keyCode;
			var t = $(this);
			var f = t.children(".focused");
			if(keyCode == 38){
				var prev = f.prev();
				if(prev){
					f.removeClass("focused");
					prev.addClass("focused");
				}
			}else if(keyCode == 40){
				var next = f.next();
				if(next){
					f.removeClass("focused");
					next.addClass("focused");
				}
			}else if(keyCode == 13 || keyCode == 32){
				f.trigger("click");
				t.siblings(".typehead").children("textarea").focus();
				e.preventDefault();
			}else if(keyCode == 9){
				f.removeClass("focused");
			}
		});
		$(suggestionsContainer).insertAfter(t.parent());
		this.setSuggestions = function(suggestions, func){
			this.suggestions = suggestions;
			this.suggestionsFunction = func;
		}
		this.setSuggestions(suggestions, func);
		this.setHashtags();
	}
})(jQuery);
