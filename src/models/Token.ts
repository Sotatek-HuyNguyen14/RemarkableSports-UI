import { JwtPayload } from "jwt-decode";

export default interface RSToken extends JwtPayload {
  name: string;
  email: string;
}
