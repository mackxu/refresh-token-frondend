# Refresh Token

access_token 用于身份认证，refresh_token 用于刷新 token，也就是续签。

在登录接口里同时返回 access_token 和 refresh_token，access_token 设置较短的过期时间，比如 30 分钟，refresh_token 设置较长的过期时间，比如 7 天。

当 access_token 失效的时候，可以用 refresh_token 去刷新，服务端会根据其中的 userId 查询用户数据，返回新 token。
