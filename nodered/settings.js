const fs = require("fs");

const LOGIN_ATTEMPTS_FILE = "/data/login-attempts.json";
const MAX_LOGIN_ATTEMPTS = 200;

function readLoginAttempts() {
    try {
        const data = fs.readFileSync(LOGIN_ATTEMPTS_FILE, "utf8");
        return JSON.parse(data);
    } catch {
        return [];
    }
}

function writeLoginAttempts(attempts) {
    fs.writeFileSync(LOGIN_ATTEMPTS_FILE, JSON.stringify(attempts, null, 2));
}

function recordLoginAttempt(entry) {
    const attempts = readLoginAttempts();
    attempts.push(entry);
    if (attempts.length > MAX_LOGIN_ATTEMPTS) {
        attempts.splice(0, attempts.length - MAX_LOGIN_ATTEMPTS);
    }
    writeLoginAttempts(attempts);
}

module.exports = {
    flowFile: "flows.json",
    flowFilePretty: true,

    uiPort: process.env.PORT || 1880,
    uiHost: "0.0.0.0",

    adminAuth: {
        type: "credentials",
        users: [
            {
                username: "admin",
                password: process.env.NODE_RED_ADMIN_PASSWORD_HASH,
                permissions: "*",
            },
        ],
        sessionExpiryTime: 86400,
    },

    httpAdminMiddleware: function (req, res, next) {
        // Endpoint: GET /auth/login-attempts
        if (req.path === "/auth/login-attempts" && req.method === "GET") {
            const attempts = readLoginAttempts();
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(attempts, null, 2));
            return;
        }

        // Intercept POST /auth/token to log login attempts
        if (req.path === "/auth/token" && req.method === "POST") {
            const ip =
                req.headers["x-forwarded-for"] ||
                req.connection.remoteAddress ||
                req.ip;
            const userAgent = req.headers["user-agent"] || "";
            const username = req.body?.username || "unknown";

            const originalEnd = res.end;
            res.end = function (chunk, encoding) {
                const success = res.statusCode === 200;
                recordLoginAttempt({
                    timestamp: new Date().toISOString(),
                    username: username,
                    ip: ip,
                    userAgent: userAgent,
                    success: success,
                });
                originalEnd.call(res, chunk, encoding);
            };
        }

        next();
    },

    logging: {
        console: {
            level: "info",
            metrics: false,
            audit: false,
        },
    },

    editorTheme: {
        projects: {
            enabled: false,
        },
    },
};
