import { Buffer } from "buffer";

const parseJwt = (token: string) => {
  const parts: Buffer[] = token.split(".").map((part: string): Buffer => {
    return Buffer.from(part.replace(/-/g, "+").replace(/_/g, "/"), "base64");
  });
  const payload = JSON.parse(parts[1].toString()) as any;

  return payload.client as IUser;
};

export default parseJwt;
