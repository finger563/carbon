var ctrlX = false;
var ctrlS = false;
var remote = require('electron').remote;
var dialog = remote.dialog;
var fs = require('fs');
var filename = ""; 
var activeBufferID = "buffer0";
var numBuffers = 1;
var ctrlX1 = false;
var htmlBeforeCtrlX1 = "";
var bufferList = [
{
	
}
];

// Update the activeBufferID when switching to a new buffer
$(document).click(function (e) {
  activeBufferID = e.target.id;
});

function highlightText() {
	$('pre code').each(function(i, block) {
		hljs.highlightBlock(block);
	});	
}

function getCaretCharacterOffsetWithin(element) {
    var caretOffset = 0;
    var doc = element.ownerDocument || element.document;
    var win = doc.defaultView || doc.parentWindow;
    var sel;
    if (typeof win.getSelection != "undefined") {
        sel = win.getSelection();
        if (sel.rangeCount > 0) {
            var range = win.getSelection().getRangeAt(0);
            var preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(element);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            caretOffset = preCaretRange.toString().length;
        }
    } else if ( (sel = doc.selection) && sel.type != "Control") {
        var textRange = sel.createRange();
        var preCaretTextRange = doc.body.createTextRange();
        preCaretTextRange.moveToElementText(element);
        preCaretTextRange.setEndPoint("EndToEnd", textRange);
        caretOffset = preCaretTextRange.text.length;
    }
    return caretOffset;
}

/**
 * Inserts text at cursor position and immediately 
 * moves cursor to right after the text
 */
function insertTextAtCursor(text) { 
	var sel, range, html; 
	sel = window.getSelection();
	range = sel.getRangeAt(0); 
	range.deleteContents(); 
	var textNode = document.createTextNode(text);
	range.insertNode(textNode);
	range.setStartAfter(textNode);
	sel.removeAllRanges();
	sel.addRange(range);        
}

function copySelection(str) {
    var resizable = $('#resizable').val(str).select();
    document.execCommand('copy');
    resizable.val('');
}

function pasteFromClipboard() {
    var result = '',
        resizable = $('#resizable').val('').select();
    if (document.execCommand('paste')) {
        result = resizable.val();
    }
    resizable.val('');
    return result;
}

/*
fs.readdir(".", function(err, files) {
	for (i=0; i < files.length; i++) {
		document.getElementById(activeBufferID).innerHTML += '<div><a href="URL" title="Description">' + files[i] + '</a></div>';
	}
	console.log(files);
});*/

function handleKeyPress(event) {
	
	/*! Spacebar, Backspace or Delete */
	if (event.keyCode == 32 || event.keyCode == 8 || event.keyCode == 46) {
		// Handle or save state if needed
	}
	
	// C-a
	if (event.ctrlKey && event.keyCode == 65) {
		event.preventDefault();
		// Simulate HOME key press event and move to first character in line
		$('#container').trigger(
			jQuery.Event( 'keypress', { keyCode: 36, which: 36 } )
		);
	} 	
	
	// C-x - New command
	if (event.ctrlKey && event.keyCode == 88) {
		if (ctrlX == true) {
			document.getElementById("commandArea").innerText += " C-x";
		}
		else {
			document.getElementById("commandArea").innerText = "C-x";
			ctrlX = true;
		}
	} 
	
	// C-g - Clear command buffer
	if (event.ctrlKey && event.keyCode == 71) {
		ctrlX = false;
		document.getElementById("commandArea").innerText = "C-g";
		document.getElementById("commandArea").innerText = "";
	} 	
	
	// C-x 1 - Toggle full-frame mode for active buffer
	if (ctrlX == true && event.keyCode == 49) {
	    document.getElementById("commandArea").innerText = "C-x 1";
		event.preventDefault();
		if (ctrlX1 == false) {
			// save state of all buffers
			htmlBeforeCtrlX1 = document.getElementById("container").innerHTML;
			
			// Make active buffer full-frame
			document.getElementById(activeBufferID).style.float = "left";
			document.getElementById(activeBufferID).style.verticalAlign = "top";
			document.getElementById(activeBufferID).style.width = "100vw";
			document.getElementById(activeBufferID).style.height = "94vh";
			document.getElementById(activeBufferID).style.position = "absolute";
			
			// Set style.display for all other buffers to none
			var allBuffers = document.getElementsByClassName("hljs");
			for (i=0; i < allBuffers.length; i++) {
				if (allBuffers[i].id != activeBufferID)
					allBuffers[i].style.display = "none";
			}
			ctrlX1 = true;
			highlightText();
		}
		else {
			var activeBufferTextHTML = document.getElementById(activeBufferID).innerHTML;
			document.getElementById("container").innerHTML = htmlBeforeCtrlX1;
			document.getElementById(activeBufferID).innerHTML = activeBufferTextHTML;
			ctrlX1 = false;
			highlightText();
		}
	}
	
	// C-x 2 - Split Horizontally
	if (ctrlX == true && event.keyCode == 50) {
		document.getElementById("commandArea").innerText = "C-x 2";
		ctrlX = false;
		if (activeBufferID.includes("buffer")) {
			var newBufferID = "buffer" + numBuffers.toString();
			numBuffers += 1;
			
			var target = document.getElementById(activeBufferID);
			var wrap = document.createElement('div');
			var pre = document.createElement('pre');
			wrap.appendChild(pre);
			pre.appendChild(target.cloneNode(true));
			
			var newBufferHTML;
			var fixedDiv = false;
			
			if (activeBufferID != "buffer0") {
				
				newBufferHTML = wrap.innerHTML + 
					"<pre><code id=\"" + newBufferID + "\" name=\"codeArea\" class=\"hljs\" contentEditable=true style=\"position: relative;\"></code></pre>";
				document.getElementById("container").innerHTML = 
					document.getElementById("container").innerHTML.replace(wrap.innerHTML, newBufferHTML);	
			}
			else {
				fixedDiv = true;
				document.getElementById("container").innerHTML += 
					"<pre><code id=\"" + newBufferID + "\" name=\"codeArea\" class=\"hljs\" contentEditable=true style=\"position: static;\"></code></pre>";
			}	
			
			var activeBufferHeight = 0;
			if(document.getElementById(activeBufferID).style.height.includes("vh"))
				activeBufferHeight = parseInt(document.getElementById(activeBufferID).style.height.split('vh')[0]);
			if (activeBufferHeight != 0) {
				document.getElementById(activeBufferID).style.height = (activeBufferHeight/2.0).toString() + "vh";
				document.getElementById(newBufferID).style.height = (activeBufferHeight/2.0).toString() + "vh";	
			}
			else {
				document.getElementById(activeBufferID).style.height = "50vh";
				document.getElementById(newBufferID).style.height = "50vh";		
				document.getElementById(activeBufferID).style.width = "100vw";
			}
			document.getElementById(activeBufferID).style.verticalAlign = "top";
			document.getElementById(newBufferID).style.verticalAlign = "bottom";
			if (fixedDiv == true) {
				if (activeBufferHeight != 0)
					document.getElementById(newBufferID).style.top = (activeBufferHeight/2.0 + 1.0).toString() + "vh";
				else 
					document.getElementById(newBufferID).style.top = "51vh";
			}
		
			document.getElementById(newBufferID).style.width = document.getElementById(activeBufferID).style.width;
			document.getElementById(newBufferID).style.float = document.getElementById(activeBufferID).style.float;		
		}
	}		
	
	// C-x 3 - Split Vertically
	if (ctrlX == true && event.keyCode == 51) {
		event.preventDefault();
		document.getElementById("commandArea").innerText = "C-x 3";
		ctrlX = false;
		if (activeBufferID.includes("buffer")) {
			var newBufferID = "buffer" + numBuffers.toString();
			numBuffers += 1;
			
			var target = document.getElementById(activeBufferID);
			var wrap = document.createElement('div');
			var pre = document.createElement('pre');
			wrap.appendChild(pre);
			pre.appendChild(target.cloneNode(true));
						
			var newBufferHTML = wrap.innerHTML + 
				"<pre><code id=\"" + newBufferID + "\" name=\"codeArea\" class=\"hljs\" contentEditable=true style=\"position: relative;\"></code></pre>";
			
			document.getElementById("container").innerHTML = 
				document.getElementById("container").innerHTML.replace(wrap.innerHTML, newBufferHTML);	
									
			var activeBufferWidth = 0;
			if(document.getElementById(activeBufferID).style.width.includes("vw"))
				activeBufferWidth = parseInt(document.getElementById(activeBufferID).style.width.split('vw')[0]);
			
			if (activeBufferWidth != 0) {
				document.getElementById(activeBufferID).style.width = (activeBufferWidth/2).toString() + "vw";
				document.getElementById(newBufferID).style.width = (activeBufferWidth/2).toString() + "vw";	
			}
			else {		
				document.getElementById(activeBufferID).style.width = "50vw";
				document.getElementById(newBufferID).style.width = "50vw";		
				document.getElementById(activeBufferID).style.height = "94vh";
				document.getElementById(activeBufferID).style.verticalAlign = "top";
				document.getElementById(newBufferID).style.verticalAlign = "top";				
			}
			document.getElementById(activeBufferID).style.float = "left";
			document.getElementById(newBufferID).style.float = "right";				
			
			document.getElementById(newBufferID).style.height = document.getElementById(activeBufferID).style.height;
		}
	}	
	
	// C-x C-f - Open file
	if (ctrlX == true && event.ctrlKey && event.keyCode == 70) {
		document.getElementById("commandArea").innerText = "C-x C-f";
		ctrlX = false;
 		dialog.showOpenDialog(function (fileNames) {
			if(fileNames === undefined)
				console.log("No file selected");
			else {
				document.getElementById("fileArea").innerHTML = "--:--&nbsp;&nbsp;Loading...";
				readFile(fileNames[0]);
			}
		});
	}
	
	// C-x C-s - Save file
	if (ctrlX == true && event.ctrlKey && event.keyCode == 83) {
		document.getElementById("commandArea").innerText = "C-x C-s";
		ctrlX = false;
		if (filename == "") {
			var content = document.getElementById(activeBufferID).innerText;
			dialog.showSaveDialog(function (fileName) {
				   if (fileName === undefined){
						console.log("You didn't save the file");
						return;
				   }
				   // fileName is a string that contains the path and filename created in the save file dialog.  
				   fs.writeFile(fileName, content, function (err) {
					   if(err){
						   alert("An error ocurred creating the file "+ err.message)
					   }
						
					filename = fileName;
					document.getElementById("commandArea").innerText = "Wrote " + fileName;
					highlightText();
					document.getElementById("fileArea").innerHTML = "--:--&nbsp;&nbsp;";
					document.getElementById("fileArea").innerText += fileName.replace(/^.*[\\\/]/, '');					   
				   });
			}); 
		}
		else {
			var content = document.getElementById(activeBufferID).innerText;
			fs.writeFile(filename, content, function (err) {
				  if(err){
						alert("An error ocurred updating the file"+ err.message);
						console.log(err);
						return;
				  }
								
				    document.getElementById("commandArea").innerText = "Wrote " + filename;
					highlightText();
			 }); 			
		}
	}	
	
	// C-x C-w - Save buffer to new file
	if (ctrlX == true && event.ctrlKey && event.keyCode == 87) {
		document.getElementById("commandArea").innerText = "C-x C-w";
		ctrlX = false;
		var content = document.getElementById(activeBufferID).innerText;
		dialog.showSaveDialog(function (fileName) {
		   if (fileName === undefined){
				console.log("You didn't save the file");
				return;
		   }
		   // fileName is a string that contains the path and filename created in the save file dialog.  
		   fs.writeFile(fileName, content, function (err) {
			   if(err){
				   alert("An error ocurred creating the file "+ err.message)
			   }
				
			filename = fileName;
			document.getElementById("commandArea").innerText = "Wrote " + fileName;
			highlightText();
			document.getElementById("fileArea").innerHTML = "--:--&nbsp;&nbsp;";
			document.getElementById("fileArea").innerText += fileName.replace(/^.*[\\\/]/, '');					   
		   });
		}); 
	}	
	
	// C-x C-c - Close application
	if (event.ctrlKey && event.keyCode == 67) {
		document.getElementById("commandArea").innerText = "C-x C-c";
		if (ctrlX == true) {
			// Quit Application
			if (process.platform !== 'darwin')
				require('electron').remote.app.quit();
			else 
				require('electron').remote.app.exit();
		}
	}	
	
	// C-x k - Close file in buffer
	if (event.keyCode == 75) {
		document.getElementById("commandArea").innerText = "C-x k";
		if (ctrlX == true) {
			event.preventDefault();
			// Close file
			filename = "";
			document.getElementById("fileArea").innerHTML = "--:--&nbsp;&nbsp;";
			document.getElementById(activeBufferID).innerText = "";
			document.getElementById("commandArea").innerText = "";
		}
	}	
	
	// C-x h - Select all
	if (event.keyCode == 72) {
		document.getElementById("commandArea").innerText = "C-x h";
		if (ctrlX == true) {
			event.preventDefault();
			// Select all
			document.execCommand("selectAll");
		}
	}	
	
/* 	// C-x C-+ - Zoom in
	if ((event.ctrlKey && event.keyCode == 107) || (event.ctrlKey && event.shiftKey && event.keyCode == 187)) {
		document.getElementById(activeBufferID).style.fontSize = "larger";
	}	
	
	// C-x C-- - Zoom out
	if ((event.ctrlKey && event.keyCode == 109) || (event.ctrlKey && event.keyCode == 189)) {
		document.getElementById(activeBufferID).style.fontSize = "smaller";
	}	 */	
		
	// TAB key press - Indent
	if (event.keyCode == 9) {
		event.preventDefault();
		if (event.shiftKey)
			document.execCommand("outdent");
		else 
			document.execCommand("indent");
	}

	// C-w - Cut Selection
	if (event.ctrlKey && event.keyCode == 87) {
		document.execCommand("cut");
	}

	// C-/ - Undo edits
	if (event.ctrlKey && event.keyCode == 191) {
		document.execCommand("undo");
	}		

	// M-w - Copy Selection
	if (event.altKey && event.keyCode == 87) {
		copySelection();
	}
	
	// C-y - Paste from Clipboard
	if (event.ctrlKey && event.keyCode == 89) {
		pasteFromClipboard();
	}	
	
	// C-s - Commence Search 
	if (event.ctrlKey && event.keyCode == 83) {
		document.getElementById("commandArea").innerText = "";
		document.getElementById("commandArea").focus();
		document.execCommand("insertText", false, "search: ");
		ctrlS = true;
	}
	
	// ENTER key press
	if (event.keyCode == 13) {
		
		// Highlight and show the results of the search
		if (ctrlS == true) {
			event.preventDefault();
			ctrlS = false;
			// Handle search
			var src_str = document.getElementById(activeBufferID).innerText;
			var term = document.getElementById("commandArea").innerText.split('search: ')[1];
			term = term.replace(/(\s+)/,"(<[^>]+>)*$1(<[^>]+>)*");
			var pattern = new RegExp("("+term+")", "gi");

			src_str = src_str.replace(pattern, "<mark>$1</mark>");
			src_str = src_str.replace(/(<mark>[^<>]*)((<[^>]+>)+)([^<>]*<\/mark>)/,"$1</mark>$2<mark>$4");

			document.getElementById(activeBufferID).innerHTML = src_str;
			document.getElementById(activeBufferID).focus();
			document.getElementById("commandArea").innerText = "";		
			highlightText();
		}
	}
}

function readFile(filepath) {
	fs.readFile(filepath, 'utf-8', function (err, data) {
		if(err){
			alert("An error ocurred reading the file :" + err.message);
			return;
		}
		
		filename = filepath;
		var re = /(?:\.([^.]+))?$/;
		var extension = re.exec(filepath)[1];
 		document.getElementById(activeBufferID).innerText = data;
		if (extension != undefined) {
			document.getElementById(activeBufferID).className = extension;
			highlightText();
			document.getElementById(activeBufferID).focus();
			document.getElementById("fileArea").innerHTML = "--:--&nbsp;&nbsp;";
			document.getElementById("fileArea").innerText += filepath.replace(/^.*[\\\/]/, ''); 
		}
	});
}      