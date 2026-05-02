export const getSubdomain = () => {
  try {
    const hostname = window.location.hostname;

    if (hostname.includes("localhost")) {
      const parts = hostname.split(".");
      return parts.length > 1 ? parts[0] : null;
    }

    const parts = hostname.split(".");

    if (parts[0] === "www") {
      parts.shift();
    }

    if (parts.length > 2) {
      return parts[0];
    }

    return null;
  } catch (e) {
    console.error("Error extracting subdomain:", e);
    return null;
  }
};

// console.log(getSubdomain());
