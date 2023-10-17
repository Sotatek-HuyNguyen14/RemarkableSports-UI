import * as React from "react";
import axios, { AxiosError } from "axios";
import qs from "qs";
import allSettled from "promise.allsettled";
import { DeviceEventEmitter } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { add, isAfter } from "date-fns";
import { REFRESH_TOKEN_STORAGE_KEY } from "../constants/keys";
import { User } from "../models/User";
import ApiUrls from "../constants/ApiUrls";
import { getAccountStorage } from "../utils/crypto";
import { formatCoreUrl } from "../services/ServiceUtil";
import { LAN_CHANGE } from "../language";
import useNotification from "./UseNotification";
import store from "../stores";

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

interface AuthContextInterface {
  initialized: boolean;
  loggedIn: boolean;
  user: User | null;
  isLoading: boolean;
  init: () => Promise<void>;
  login: (at: string, rt: string, expiresIn: number) => void;
  logout: () => Promise<void>;
  updateUserInfo: () => Promise<void>;
}

async function requestNewTokens(refreshToken: string) {
  const { data: newToken } = await axios.create().post<TokenResponse>(
    "/token",
    qs.stringify({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      scope: "openid profile email roles offline_access",
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      baseURL: ApiUrls.apiHost,
    }
  );
  return newToken;
}

function updateAxiosInterceptor(tokenRetriever: () => Promise<string | null>) {
  const id = axios.interceptors.request.use(async (config) => {
    const token = await tokenRetriever();
    if (token) {
      // eslint-disable-next-line no-param-reassign
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
  return id;
}

const authContext = React.createContext<AuthContextInterface | null>(null);

export function ProvideAuth({
  children,
}: React.PropsWithChildren<{}>): JSX.Element {
  const auth = useProviderAuth();
  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}

export function useAuth(): AuthContextInterface {
  return (
    React.useContext(authContext) ?? {
      initialized: false,
      loggedIn: false,
      user: null,
      isLoading: false,
      init: async () => {},
      login: (at: string, rf: string, expiresIn: number) => null,
      logout: async () => {},
      updateUserInfo: async () => {},
    }
  );
}

export function useProviderAuth(): AuthContextInterface {
  const [initialized, setInitialized] = React.useState<boolean>(false);

  const [token, setToken] = React.useState<{
    accessToken: string;
    refreshToken: string;
    expiredTime: Date;
  } | null>(null);

  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [user, setUser] = React.useState<User | null>(null);
  const { cleanUpNotifications } = useNotification();

  const [interceptorId, setInterceptorId] = React.useState<number>(0);

  const init = async () => {
    // only can be ran once
    if (initialized) return;

    const storedRefreshToken = await AsyncStorage.getItem(
      REFRESH_TOKEN_STORAGE_KEY
    );

    if (storedRefreshToken) {
      try {
        const newToken = await requestNewTokens(storedRefreshToken);
        await login(
          newToken.access_token,
          newToken.refresh_token,
          newToken.expires_in
        );
        await getAccountStorage();
      } catch (e: unknown) {
        try {
          await cleanUpNotifications();
        } catch (cleanError: any) {
          console.log(cleanError);
        }
        console.error("fail to request new tokens or user info:\n", e.response);
        logout();
      }
    }
    setInitialized(true);
  };

  const login = async (
    accessToken: string,
    refreshToken: string,
    expiresIn: number
  ) => {
    setToken({
      accessToken,
      refreshToken,
      expiredTime: add(Date.now(), { seconds: expiresIn }),
    });
    await AsyncStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
  };

  const logout = React.useCallback(async () => {
    await AsyncStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    setUser(null);
    setToken(null);

    axios.interceptors.request.eject(store.incriptorId);
  }, []);

  const queryToken = React.useCallback(async () => {
    if (!token) return null;

    if (token.refreshToken && isAfter(Date.now(), token.expiredTime)) {
      try {
        const newToken = await requestNewTokens(token.refreshToken);
        console.log("Refresh Token Scuccess", newToken);
        if (newToken) {
          await AsyncStorage.setItem(
            REFRESH_TOKEN_STORAGE_KEY,
            newToken.refresh_token
          );
          setToken({
            accessToken: newToken.access_token,
            refreshToken: newToken.refresh_token,
            expiredTime: add(Date.now(), { seconds: newToken.expires_in }),
          });
          return newToken.access_token;
        }
        try {
          cleanUpNotifications();
        } catch (cleanError: any) {
          console.log(cleanError);
        }
        await logout();
        DeviceEventEmitter.emit(LAN_CHANGE, "");
      } catch (error) {
        console.log("Refresh Token Error", error);
        try {
          cleanUpNotifications();
        } catch (cleanError: any) {
          console.log(cleanError);
        }
        await logout();
        DeviceEventEmitter.emit(LAN_CHANGE, "");
      }
    }

    return token.accessToken;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  React.useMemo(() => {
    // remove the axios interceptors
    axios.interceptors.request.eject(store.incriptorId);
    store.setIncriptorId(0);
    const id = updateAxiosInterceptor(queryToken);
    // setInterceptorId(id);
    store.setIncriptorId(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryToken]);

  const updateUserInfo = async () => {
    setIsLoading(true);
    // first get user api
    allSettled([
      axios.get<User>("/userInfo"),
      axios.get<User>(formatCoreUrl("/user")),
    ]).then((results) => {
      if (results[0].status === "fulfilled") {
        let userData = results[0].value.data;
        if (results[1].status === "fulfilled") {
          userData = { ...userData, ...results[1].value.data };
        }
        setUser(userData);
      } else {
        console.error("User Request Error", results[0].reason);
      }
      setIsLoading(false);
    });
  };

  React.useEffect(() => {
    if (token) {
      updateUserInfo();
    }
  }, [token]);

  return {
    initialized,
    loggedIn: !!token,
    isLoading,
    user,
    init,
    login,
    logout,
    updateUserInfo,
  };
}
