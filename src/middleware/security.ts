import {  ArcjetNodeRequest, slidingWindow } from "@arcjet/node";
import aj from "../config/arcjet.js";
import { Request, Response, NextFunction } from "express";
import { error } from "node:console";
import { Socket } from "node:dgram";

const securityMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    if(process.env.NODE_ENV === "test" || process.env.NODE_ENV === "development") return next();

    try {
        const role: RateLimitRole = req.user?.role ?? "guest";

        let limit: number;
        let message: string;

        switch (role) {
            case "admin":
                limit = 30;
                message = "Admin request limit exceeded. (30 requests per minute).";
                break;
            case "teacher":
                limit = 25;
                message = "Teacher request limit exceeded. (25 requests per minute). Please wait.";
                break;
            case "student":
                limit = 20;
                message = "Student request limit exceeded. (20 requests per minute). Please wait";
                break;
            default:
                limit = 5;
                message = "Guest request limit exceeded. (5 requests per minute). Please sign up for higher limits.";
                break;
        }

        const client = aj.withRule(
            slidingWindow({
                mode: "LIVE",
                interval: '1m', 
                max: limit,
            })
        )
        const arcjetRequest: ArcjetNodeRequest = {
            method: req.method,
            url: req.originalUrl ?? req.url,
            headers: req.headers,
            socket: {remoteAddress: req.socket.remoteAddress ?? req.ip ?? '0.0.0.0'} ,
        };

        const decision = await client.protect(arcjetRequest);

        if (decision.isDenied() && decision.reason.isBot()) {
            res.status(403).json({error: "Forbidden", message: 'Automated request are not allowed'});
            return;
        }

        if (decision.isDenied() && decision.reason.isShield()) {
            res.status(403).json({error: "Forbidden", message: 'Request blocked by security policy'});
            return;
        }

        if (decision.isDenied() && decision.reason.isRateLimit()) {
            res.status(429).json({error: "Forbidden", message});
            return;
        }

        next();
    } catch (e) {
        console.error("Arcjet middleware error:", e);
        res.status(500).json({error: "Internal Server Error", message: 'something went wrong with the security middleware'});
    }
}

export default securityMiddleware;