import cookieParser from "cookie-parser";
import express, { Request, Response, NextFunction } from "express";
import * as core from "express-serve-static-core";
import fs from "fs";
import { StatusCodes } from "http-status-codes";
import cors from "cors";
import Discovery from "../adapters/discovery";
import { settingsService } from "../config/settings";
import { BridgeInfo } from "../core/models";
import StateStore, { DeviceStore } from "../core/store/state";
import { loggerFactory } from "../utils/logger";
import Api from "./api/index";
import Frontend from "./Frontend";
import WebSocketService from "./WebSocketService";

const logger = loggerFactory.getLogger("API");

export default class Server {
  private server?: core.Express;
  private serverProcess?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private api?: Api;
  private frontend: Frontend;
  private websocketSrv: WebSocketService;

  constructor() {
    this.frontend = new Frontend();
    this.websocketSrv = new WebSocketService();
  }

  enableApi(
    devices: DeviceStore,
    state: StateStore,
    discovery: Discovery,
    bridgeInfo: BridgeInfo,
    actionCallback: any,
  ) {
    logger.info("Server enable Api");
    this.api = new Api(devices, state, discovery, bridgeInfo, actionCallback);
  }

  private authenticate(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;
    if (settingsService.get().frontend.authToken) {
      if (authHeader && authHeader !== "null") {
        const token = authHeader.split(" ")[1];
        logger.info("auth Header");
        const isAuthenticated =
          settingsService.get().frontend.authToken === token;
        if (!isAuthenticated) {
          res
            .status(StatusCodes.UNAUTHORIZED)
            .json({ success: false, message: "UnAuthorized" });
        } else {
          next();
        }
      } else {
        res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ success: false, message: "not configured" });
      }
    } else {
      next();
    }
  }

  private isHttpsConfigured(): boolean {
    if (
      settingsService.get().frontend.sslCert &&
      settingsService.get().frontend.sslKey
    ) {
      if (
        !fs.existsSync(settingsService.get().frontend.sslCert) ||
        !fs.existsSync(settingsService.get().frontend.sslKey)
      ) {
        logger.error(
          `defined ssl_cert '${
            settingsService.get().frontend.sslCert
          }' or ssl_key '${
            settingsService.get().frontend.sslKey
          }' file path does not exists, server won't be secured.`,
        ); /* eslint-disable-line max-len */
        return false;
      }
      return true;
    }
    return false;
  }

  async start(): Promise<void> {
    logger.info("Server Starting");
    if (this.isHttpsConfigured()) {
      const serverOptions = {
        key: fs.readFileSync(settingsService.get().frontend.sslKey),
        cert: fs.readFileSync(settingsService.get().frontend.sslCert),
      };
      this.server = express();
    } else {
      this.server = express();
    }

    this.server.use(express.json());
    this.server.use(express.urlencoded({ extended: true }));
    this.server.use(cookieParser());
    
    // Enable CORS for all environments
    logger.info("Enabling CORS");
    this.server.use(cors({
      origin: 'http://localhost:3010', // React dev server
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
    }));

    // First register API routes
    this.server.use(
      "/api",
      (req: Request, res: Response, next: NextFunction) => {
        this.authenticate(req, res, next);
      },
    );

    if (this.api !== undefined) {
      this.server?.use("/api", this.api.router);
    }
    
    // Then register frontend routes
    this.server.use(this.frontend.router);
    this.server.set("views", this.frontend.getPath());
    // Serve front-end content for non-API routes
    this.server.get("^/$", (req, res) => {
      res.sendFile("index.html", {  });
    });

    /*this.server.use(function (req: Request, res: Response, next: NextFunction) {
      logger.info(
        req.method + " " + req.originalUrl + " : " + JSON.stringify(req.body),
      );
      next();
    });*/

    // Error handling middleware should be added after all routes
    this.server.use(
      (err: Error, req: Request, res: Response, next: NextFunction) => {
        logger.error(err.message + " " + err);
        res.status(StatusCodes.BAD_REQUEST).json({
          error: err.message,
        });
      },
    );

    /* istanbul ignore next */
    const options = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setHeaders: (res: any, path: string): void => {
        if (path.endsWith("index.html")) {
          res.setHeader("Cache-Control", "no-store");
        }
      },
    };

    if (!settingsService.get().frontend.host) {
      (this.serverProcess = this.server.listen(
        settingsService.get().frontend.port,
      )),
        () => {
          logger.info(
            `Started frontend on port ${settingsService.get().frontend.port}`,
          );
        };
    } else if (settingsService.get().frontend.host.startsWith("/")) {
      this.serverProcess = this.server.listen(
        settingsService.get().frontend.host,
        () => {
          logger.info(
            `Started frontend on socket ${settingsService.get().frontend.host}`,
          );
        },
      );
    } else {
      this.serverProcess = this.server.listen(
        settingsService.get().frontend.port,
        settingsService.get().frontend.host,
        () => {
          logger.info(
            `Started frontend on port ${settingsService.get().frontend.host}:${
              settingsService.get().frontend.port
            }`,
          );
        },
      );
    }

    this.websocketSrv.init(this.serverProcess);

    logger.info("Server Started");
  }

  async stop(): Promise<void> {
    logger.info("Server stop");
    if (this.serverProcess) {
      return new Promise((cb: () => void) => this.serverProcess.close(cb));
    }
  }
}
