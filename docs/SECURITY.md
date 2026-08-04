# Security Overview

1. **Authentication**: JWT access tokens signed with HMAC SHA-256.
2. **Password Hashing**: Bcrypt / Passlib salted password context.
3. **Upload Protection**: Strict MIME type validation, extension whitelist, max file size enforcement (15MB), EXIF orientation strip, safe randomized filename generation.
4. **Temporary File Cleanup**: Uploaded guest bytes are processed in-memory / temporary files without permanent disk storage unless authorized.
5. **Sanitized Error Outputs**: Global exception handler masks internal stack traces from client responses.
