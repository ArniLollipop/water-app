import axios from "axios";
import * as SecureStore from "expo-secure-store";
import parseJwt from "./parseJwt";
import { setUser } from "@/store/slices/userSlice";
import { setError } from "@/store/slices/errorSlice";
import store from "@/store/store";
import { useRouter } from "expo-router";

let token = "" as string | null;
let refreshToken = "" as string | null;

const useHttp = axios.create({
  baseURL: "http://192.168.191.48:4444/",
  headers: {
    "Content-Type": "application/json",
    authorization: "Bearer " + token,
  },
});

(async () => {
  token = await SecureStore.getItemAsync("token");
  refreshToken = await SecureStore.getItemAsync("refreshToken");
})();

useHttp.interceptors.response.use(null, async (error) => {
  const originalRequest = error.config;
  const router = useRouter();

  if (
    error.response?.status === 403 &&
    !originalRequest._retry &&
    refreshToken
  ) {
    originalRequest._retry = true;
    await useHttp
      .post<{ accessToken: string; refreshToken: string }>("/refreshToken", {
        refreshToken,
      })
      .then(async (res) => {
        console.log("все тема");
        await SecureStore.setItemAsync("token", res.data.accessToken);
        await SecureStore.setItemAsync("refreshToken", res.data.refreshToken);

        store.dispatch(setUser(parseJwt(res.data.accessToken)));

        token = res.data.accessToken;
        refreshToken = res.data.refreshToken;

        originalRequest.headers.Authorization = "Bearer " + token;

        return useHttp(originalRequest, res.data.accessToken as any);
      })
      .catch(async () => {
        await SecureStore.setItemAsync("token", "");
        await SecureStore.setItemAsync("refreshToken", "");
        store.dispatch(
          setError({ error: true, errorMessage: error.response?.data.message })
        );
        store.dispatch(setUser(null));
        router.push("(registration)/login");
      });
  }
  throw error;
});

useHttp.interceptors.request.use((config) => {
  if (token) config.headers["Authorization"] = "Bearer " + token;
  config.withCredentials = true;
  return config;
});

export default useHttp;
