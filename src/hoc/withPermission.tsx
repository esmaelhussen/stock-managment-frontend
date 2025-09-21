import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

const withPermission = (Component: React.FC, requiredPermission: string) => {
  return (props: any) => {
    const [isClient, setIsClient] = useState(false); // State to ensure client-side rendering
    const [hasPermission, setHasPermission] = useState(false); // State to track permission
    const router = useRouter();

    useEffect(() => {
      setIsClient(true); // Set to true after the component is mounted
    }, []);

    useEffect(() => {
      if (isClient) {
        const permissions = JSON.parse(Cookies.get("permission") || "[]");
        if (!permissions.includes(requiredPermission)) {
          router.push(`/unauthorized`); // Use `push` for navigation
        } else {
          setHasPermission(true); // Set permission state to true
        }
      }
    }, [isClient, requiredPermission, router]);

    if (!isClient || !hasPermission) {
      return null; // Render nothing while redirecting or on the server side
    }

    return <Component {...props} />;
  };
};

export default withPermission;
