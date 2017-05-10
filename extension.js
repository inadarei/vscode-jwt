var vscode = require('vscode');
var jwt    = require('jsonwebtoken');
var ncp = require("copy-paste");
var fs = require('fs');
var path = require('path');

// @see: https://code.visualstudio.com/docs/extensionAPI/extension-points
// @see: https://tstringer.github.io/nodejs/javascript/vscode/2015/12/14/input-and-output-vscode-ext.html

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

    var disposables = [];
    var config = vscode.workspace.getConfiguration('jwt');

    //console.log(config);
        // The command has been defined in the package.json file
    // The commandId parameter must match the command field in package.json
    disposables.push( vscode.commands.registerCommand('extension.encodeJWTPresets', function () {
      var options = {
        'Token Duration: One Hour' : '1h',  
        'Token Duration: One Day' : '1d',
        'Token Duration: One Week' : '7d',
        'Token Duration: One Month (30 days)' : '30d',
        'Token Duration: Three Months (90 days)' : '90d',
        'Token Duration: Six Months (180 days)' : '180d'
      };

      vscode.window.showQuickPick(Object.keys(options)).then((selection) => {
        if (selection) {
          var duration = options[selection];
          generateToken(config, duration);
        }        
      });

    }));

    // The command has been defined in the package.json file
    // The commandId parameter must match the command field in package.json
    disposables.push( vscode.commands.registerCommand('extension.encodeJWT', function () {
      generateToken(config);
    }));

    disposables.push( vscode.commands.registerCommand('extension.decodeJWT', function () {
        var srcText = getSelectionText();
        if (!srcText) return; // nothing to do

        var algo = getContextualAlgo(config);
        var opts = {
          //"ignoreExpiration" : true,
          algorithms: [algo]
        };

        jwt.verify(srcText, 
                   getContextualSecret(config, 'public'),
                   opts,
                   function(err, token) {
          if (err) {
            vscode.window.showInformationMessage("Error decoding from JWT: " + err);
            return;
          }
          ncp.copy(token, function () {
            vscode.window.showInformationMessage('Verified JWT token copied to clipboard!');
          });          
        });
    }));

    context.subscriptions.concat(disposables);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}

function generateToken(config, duration = false) {
  var _duration = duration || config.duration;
  var srcText = getSelectionText();
  if (!srcText) return; // nothing to do

  var toEncode;
  var errParsingJSON = false;

  try {
      // Let's see if the input is a valid JSON
      toEncode = JSON.parse(srcText);
  } catch (Err) {
      errParsingJSON = true;
      toEncode = srcText;
      vscode.window.showWarningMessage("Couldn't parse input as JSON. Assuming plain text and disabling expiration.");
  }

  var secret, method;
  secret = getContextualSecret(config);
  method = getContextualAlgo(config);

  try {
    var token;
    if (errParsingJSON) {
      // NOTE: plaintext payloads don't support expiration  
      token =  jwt.sign(toEncode, secret);
    } else {
      token =  jwt.sign(toEncode, secret, {expiresIn: _duration, 
                                           algorithm: method});
    }

    ncp.copy(token, function () {
        var infoMsg = 'Encoded JWT token copied to clipboard!';
        vscode.window.showInformationMessage(infoMsg);
    });          
  } catch (Err) {
    vscode.window.showInformationMessage("Error encoding to JWT: " + Err);
  }
}

function getSelectionText() {
    var editor = vscode.window.activeTextEditor;
    var msgNoText = 'Please select text to encode, in the active editor.';
    if (!editor) {
        vscode.window.showInformationMessage(msgNoText);
        return;
    }

    var selection = editor.selection;
    var srcText = editor.document.getText(selection);

    if (srcText.length < 1) {
        vscode.window.showInformationMessage(msgNoText); 
        return; 
    }

    return srcText;
}

// returns config.secret if symmetric encryption is used 
// or base64-decoded secret if assymetric (public/private) one is
function getContextualSecret(config, mode = 'private') {

  var secret, pathToKey;

  // If there's pubkey present we assume pub/private
  // encryption and that the values of setting variables
  // are paths pointing to corresponding files locally.
  if (config.pubKey && config.pubKey.length > 1) {
    if (mode === 'public') {
      //secret = Buffer.from(config.pubKey, 'base64').toString('utf8');
      pathToKey = path.normalize(resolveHome(config.pubKey));
    } else {
      //secret = Buffer.from(config.secret, 'base64').toString('utf8');
      pathToKey = path.normalize(resolveHome(config.secret));
    }
    secret = fs.readFileSync(pathToKey, 'utf8');
  } else {
    secret = config.secret;
  }

  return secret;
}

function getContextualAlgo(config) {
  if (config.pubKey && config.pubKey.length > 1) {
    return 'RS256';
  } else {
    return 'HS256';
  }
  
}

function resolveHome(filepath) {
    filepath = filepath.trim();
    if (filepath[0] === '~') {
        return path.join(process.env.HOME, filepath.slice(1));
    }
    return filepath;
}

exports.deactivate = deactivate;

