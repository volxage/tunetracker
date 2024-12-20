import axios from "axios";

export default axios.create({
  withCredentials: true,
  baseURL: "https://api.jhilla.org:443/tunetracker",
  headers: {
    "Content-type": "application/json",
  }
});

