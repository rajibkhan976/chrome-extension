import { useState, useEffect } from "react";
import axios from "axios";

function useApi(url, payload, type) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  useEffect(() => {
    const fetchData = async () => {
      let response = null;
      try {
        switch (type) {
          case "POST":
            setLoading(true);
            response = await axios.get(url, payload, config);
            setData(response.data);
            // console.log("post call is happend",response.data);
            break;
          case "GET":
            setLoading(true);
            response = await axios.get(url);
            setData(response.data);
            break;
          default:
            setData(
              "Icorrect api call Type it should be like ||POST||GET||DELETE||UPDATE||"
            );
            setLoading(true);
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [url, payload, type]);

  return { data, loading, error };
}
export default useApi;
