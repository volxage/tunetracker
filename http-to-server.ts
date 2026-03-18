import axios from "axios";

export default axios.create({
  withCredentials: true,
  baseURL: "https://api.jhilla.org:443/tunetracker",
  timeout:  3000,
  headers: {
    "Content-type": "application/json",
  }
});

