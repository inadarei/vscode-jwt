var vscode = require('vscode');
var jwt    = require('jsonwebtoken');
var ncp = require("copy-paste");

// @see: https://code.visualstudio.com/docs/extensionAPI/extension-points

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

    var disposables = [];
    var secretSignature = "unsigned";
    var config = vscode.workspace.getConfiguration('jwt');

    //console.log(config);

    // The command has been defined in the package.json file
    // The commandId parameter must match the command field in package.json
    disposables.push( vscode.commands.registerCommand('extension.encodeJWT', function () {
        var srcText = getSelectionText();
        if (!srcText) return; // nothing to do

        try {
          var token =  jwt.sign({
            "data": srcText
          }, config.secret, { expiresIn: config.duration });

          ncp.copy(token, function () {
              vscode.window.showInformationMessage('Encoded JWT token copied to clipboard!');
          });          
        } catch (Err) {
          vscode.window.showInformationMessage("Error encoding to JWT: " + Err);
        }
    }));

    disposables.push( vscode.commands.registerCommand('extension.decodeJWT', function () {
        var srcText = getSelectionText();
        if (!srcText) return; // nothing to do

        var opts = {
          "ingoreExpiration" : true
        };

        jwt.verify(srcText, 
                    config.pubKey || config.secret,
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

exports.deactivate = deactivate;