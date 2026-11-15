# Changelog

## [0.2.0](https://github.com/Miragon/miranum-clients/compare/client-sevdesk-v0.1.0...client-sevdesk-v0.2.0) (2026-11-15)


### ⚠ BREAKING CHANGES

* **sevdesk:** `client.get/post/put/del(path, …)` are gone; call the typed `sdk.<operation>({ client, … })` or `client.get({ url, query })` instead. The built-in 429 retry and the 30 s request timeout are gone: a 429 now throws a SevdeskError with status 429, and timeouts come from the caller's `signal`. Errors are SevdeskError instances instead of `Error("sevDesk API <status>: …")`.

### Features

* **sevdesk:** generate the client from the sevDesk OpenAPI spec ([#14](https://github.com/Miragon/miranum-clients/issues/14)) ([4f2c7ef](https://github.com/Miragon/miranum-clients/commit/4f2c7efe93945aee2750a8694681b9887b599566))

## 0.1.0 (2026-11-14)


### Features

* **sevdesk:** add hand-written sevDesk client ([340db65](https://github.com/Miragon/miranum-clients/commit/340db65450f6d9c1d0d8a3e7f4bdb1466b4f6df8))
* **sevdesk:** add hand-written sevDesk client ([d39473a](https://github.com/Miragon/miranum-clients/commit/d39473a46fe3bbc41a3f16bada8a40c6bd1c4d56))
* **sevdesk:** add hand-written sevDesk client- [#6](https://github.com/Miragon/miranum-clients/issues/6) ([340db65](https://github.com/Miragon/miranum-clients/commit/340db65450f6d9c1d0d8a3e7f4bdb1466b4f6df8))
