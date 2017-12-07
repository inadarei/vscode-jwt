# JWT Extension for VS Code

[![Codacy Badge][codacy-img]][codacy-url]


Makes it easy to sign (generate) and verify (decode) JWT tokens in VS Code.

## Features

1. Sign a JWT token using a shared secret or a private key (set in extension settings)
2. Verify a JWT token using a shared secret or public key (set in extension settings)

![Using JWT](img/jwt-extension.png)

## Extension Settings

This extension contributes the following settings:

* `jwt.secret`: A shared secret or a private key for signing JWT tokens.
* `jwt.pubKey`: A public key for verifying JWT tokens, if using asymmetric verification
* `jwt.duration`: Duration for JWT tokens. Defaults to "24h"

## Using Public/Secret Keys

If you only set jwt.secret in your settings, the jwt extension will perform
symmetrical signing/verification using HS256 algorithm.

If you indicate jwt.pubKey in your VS Code settings, jwt extension will
immediately assume that you are performing assymetrical signing/verificatin and
will use RS256 algorithm. Please also note that in this scenario, the values of
jwt.secret and jwt.pubKey are file paths pointing to where you have your public
and private keys saved locally, e.g.:

```
"jwt.secret": "~/work/my-keys/jwt.pem",
"jwt.pubKey": "~/work/my-keys/jwt.pem.pub"
```

To generate keys that work with RS256, you can run something like the following:

```
> openssl genrsa -out jwt.pem 2048
> openssl rsa -in jwt.pem -pubout -out jwt.pem.pub
```

## Release Notes

### 1.3.0

Full support of assymetrical signing with public/private keys.

### 1.2.0

Added command with duration presets to easily generate tokens of various durations.

### 1.1.0

Major improvement: properly supporting JSON and plain-text payloads.

### 1.0.0

Initial release.


**Enjoy!**


## License

[MIT](LICENSE)

[codacy-img]: https://api.codacy.com/project/badge/Grade/94d7b048519b405384528013499d2808
[codacy-url]: https://www.codacy.com/app/irakli/vscode-jwt?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=inadarei/vscode-jwt&amp;utm_campaign=Badge_Grade
