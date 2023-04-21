import { Errors } from "../types/const";
import dotenv from "dotenv"

dotenv.config({
  path: "../../"
});

export const PORT = 3000;

export const isProd = process.env?.NODE_ENV === "production" ? true : false;
export const ABSTRACT_API = {
  KEY: process.env.ABSTRACT_API_KEY ?? "",
}

export const ERROR: Errors = {
  invalidMime: {
    code: "invalid-MIME",
    message: "Invalid MIME type",
    details: "The provided MIME type is not valid. Please provide a valid MIME type in the request",
    status: 400,
  },
  
  invalidMethod: {
    code: "invalid-method",
    message: "Invalid HTTP Method",
    details: "The provided HTTP method is not allowed for this route. Please use the correct HTTP method.",
    status: 405
  },

  invalidJSON: {
    code: "invalid-JSON",
    message: "Invalid JSON",
    details: "expected valid JSON for the path",
    status: 400,
  },

  badInput: {
    code: "bad-input",
    message: "Bad input",
    details: "The provided input data is not valid. Please provide valid input data",
    status: 400,
  },

  emailInvalid: {
    code: "email-invalid",
    message: "Received a bad email",
    details: "The provided email is not valid. Please provide a valid email address.",
    status: 400,
  }
}
