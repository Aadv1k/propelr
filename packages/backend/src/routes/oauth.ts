import Koa from 'koa';
import passport from 'koa-passport';

import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import { Strategy as MicrosoftStategy } from 'passport-microsoft';

import { GOOGLE_AUTH, MS_AUTH, OAuthSchemes, ERROR, JWT_SECRET } from '../common/const';
import { sendErrorResponse, generateId, sendJSONResponse } from '../common/utils';

import { User } from '../types';
import UserRepo from '../models/UserRepository';
import * as common from '@propelr/common';

import qs from "node:querystring";

import fetch from "node-fetch";

const USER_DB = new UserRepo();

passport.use(
  new GoogleStrategy(
    {
      clientID:     GOOGLE_AUTH.CLIENT_ID,
      clientSecret: GOOGLE_AUTH.CLIENT_SECRET,
      callbackURL:  GOOGLE_AUTH.REDIRECT,
    },
    (access, refresh, profile, done) => {
      return done(null, profile);
    },
  ),
);

passport.use(
  new MicrosoftStategy(
    {
      clientID: MS_AUTH.CLIENT_ID,
      clientSecret: MS_AUTH.CLIENT_SECRET,
      callbackURL: MS_AUTH.REDIRECT,
      passReqToCallback: false,
    },
    function (accessToken: any, refreshToken: any, profile: any, done: any) {
      return done(null, profile);
    },
  ),
);

export async function routeOAuth(ctx: Koa.Context, next: Koa.Next): Promise<void> {
  const params = ctx.path.split('/');
  const scheme = params.find((e) => OAuthSchemes[e]);

  if (!scheme) {
    sendErrorResponse(ctx, ERROR.oAuthSchemeNotFound);
    return;
  }

  const authScheme: {
    provider: string;
    scope: Array<string>;
  } = {
    provider: '',
    scope: [],
  };

  switch (scheme) {
    case 'google':
      authScheme.provider = 'google';
      authScheme.scope = ['email', 'profile'];
      break;
    case 'microsoft':
      authScheme.provider = 'microsoft';
      authScheme.scope = ['User.Read'];
      break;
  }

  await passport.authenticate(authScheme.provider, {
    scope: authScheme.scope,
  })(ctx, next);
}

export async function routeOAuthCallback(ctx: Koa.Context, next: Koa.Next): Promise<void> {
  const params = ctx.path.split('/');
  const scheme = params.find((e) => OAuthSchemes[e]);

  if (!scheme) {
    sendErrorResponse(ctx, ERROR.oAuthSchemeNotFound);
    return;
  }

  let callback;
  try {
    callback = await new Promise((resolve, reject) => {
      const scheme = params.find((e) => OAuthSchemes[e]) as string;
      passport.authenticate(scheme, async (err, user) => {
        if (err) {
          reject(err);
        } else {
          resolve(user);
        }
      })(ctx, next);
    });
  } catch (err) {
    console.log(err);
    sendErrorResponse(ctx, ERROR.badOAuthCallback);
    return;
  }

  const user: any = callback;
  await USER_DB.init();

  // TODO: this currently works since we have two schemes
  const foundUser = await USER_DB.getUserByEmail(user?.email || user?.userPrincipalName);

  if (foundUser) {
    const token = common.jwt.sign({
      id: foundUser.id,
      email: foundUser.email,
    }, JWT_SECRET);

    sendJSONResponse(ctx, {
      success: {
        message: 'User found',
        token,
      },
      status: 200,
    });
    return;
  }

  const userToPush: User = {
    id: generateId(16),
    email: user?.email ?? user?.userPrincipalName,
    password: generateId(16), // TODO: find a better way to generate password
  };

  const pushedUser = await USER_DB.pushUser(userToPush);

  if (!pushedUser) {
    sendErrorResponse(ctx, ERROR.internalError);
    return;
  }

  const jwt_payload: any = {
    id: pushedUser.id,
    email: pushedUser.email,
  };

  const token = common.jwt.sign(jwt_payload, JWT_SECRET);

  sendJSONResponse(ctx, {
    success: {
      message: 'Successfully registered',
      token,
    },
    status: 200,
  });
}

async function getGoogleEmailFromToken(token: string): Promise<string | null> {
  const userProfileEndpoint = 'https://www.googleapis.com/oauth2/v3/userinfo';
  const response = await fetch(userProfileEndpoint, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await response.json();
  return data?.email;
}

async function getGoogleAuthTokenFromCode(code: string) {
  const requestBody = JSON.stringify({
    code: code,
    client_id:     GOOGLE_AUTH.CLIENT_ID,
    client_secret: GOOGLE_AUTH.CLIENT_SECRET,
    redirect_uri:  "http://localhost:3000/register",
    grant_type: 'authorization_code',
  });

  let tokenEndpoint = `https://oauth2.googleapis.com/token`;

  const response = await fetch(tokenEndpoint, {
    method: "POST",
    body: requestBody,
  });
  const data = await response.json();
  return data.access_token;
}

async function findUserOrCreateUserToken(email: string): Promise<string | null> {
  await USER_DB.init();

  const foundUser = await USER_DB.getUserByEmail(email);

  if (foundUser) {
    const token = common.jwt.sign({
      id: foundUser.id,
      email: foundUser.email,
    }, JWT_SECRET);

    return token;
  }

  const userToPush: User = {
    id: generateId(16),
    email: email,
    password: generateId(16), // TODO: find a better way to generate password
  };

  const pushedUser = await USER_DB.pushUser(userToPush);

  if (!pushedUser) return null;
  
  const jwt_payload: any = {
    id: pushedUser.id,
    email: pushedUser.email,
  };

  const token = common.jwt.sign(jwt_payload, JWT_SECRET);
  return token;
}

export async function routeOAuthToken(ctx: Koa.Context, next: Koa.Next) {
  const params = ctx.path.split('/');
  const scheme = params.find((e) => OAuthSchemes[e]);

  if (!scheme) {
    sendErrorResponse(ctx, ERROR.oAuthSchemeNotFound);
    return;
  }

  const authCode = ctx.URL.searchParams.get("code");

  if (!authCode) {
    sendErrorResponse(ctx, ERROR.badOAuthCallback);
    return;
  }

  const authScheme: {
    provider: string;
    scope: Array<string>;
  } = {
    provider: '',
    scope: [],
  };

  switch (scheme) {
    case 'google':
      const authToken = await getGoogleAuthTokenFromCode(authCode);
      if (!authToken) {
        sendErrorResponse(ctx, ERROR.expiredToken);
        break;
      }
      const email = await getGoogleEmailFromToken(authToken);

      if (!email) {
        sendErrorResponse(ctx, ERROR.internalError);
        return;
      }

      const jwtToken = await findUserOrCreateUserToken(email);

      if (!jwtToken) {
        sendErrorResponse(ctx, ERROR.internalError);
        return;
      }

      sendJSONResponse(ctx, {
        message: "Success",
        token: jwtToken,
        status: 200
      }, 200) 
      break;
    case 'microsoft':
      authScheme.provider = 'microsoft';
      authScheme.scope = ['User.Read'];
      break;
  }
}
