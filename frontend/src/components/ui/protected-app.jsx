// import { api } from "@/lib/api-client";
// import { useQuery } from "@tanstack/react-query";
// import Loading from "./ui/loading";
// import useAuthUserStore from "@/stores/useAuthUserStore";
// import useAddressStore from "@/stores/useAddressStore";
// import { Navigate, useLocation } from "react-router";

// const getCurrentLocation = () =>
//   new Promise((resolve, reject) => {
//     navigator.geolocation.getCurrentPosition(
//       ({ coords }) => resolve({ latitude: coords.latitude, longitude: coords.longitude }),
//       (error) => {
//         reject(error);
//       },
//     );
//   });

// const getReverseGeocode = async () => {
//   try {
//     let lat = null;
//     let lng = null;
//     const location = await getCurrentLocation();
//     if (location) {
//       lat = location.latitude;
//       lng = location.longitude;
//       const response = await api.get(`/v1/geocode/reverse?latitude=${lat}&longitude=${lng}`);
//       return response.data;
//     }
//   } catch (error) {
//     if (error.code === 1) {
//       const response = await api.get(`/v1/geocode/ip`);
//       if (response) {
//         return response.data;
//       }
//     }
//     console.error("Error fetching locations:", error);
//   }
// };

// const checkUser = async () => {
//   try {
//     const response = await api.get("/v1/users/me");
//     return response.data;
//   } catch (error) {
//     return null;
//   }
// };

// export const ProtectedApp = ({ children }) => {
//   const { setAddress } = useAddressStore();
//   const { setAuthUser, authUser } = useAuthUserStore();
//   const location = useLocation();

//   const { isFetching, isPending, isLoading } = useQuery({
//     queryKey: ["authUser"],
//     queryFn: async () => {
//       const user = await checkUser();
//       if (!user || user?.data?.addresses.length === 0) {
//         const geocode = await getReverseGeocode();
//         setAddress(geocode.data);
//       } else if (user?.data?.addresses.length > 0) {
//         const as = user.data.addresses.find((address) => address.isDefault);
//         if (as) {
//           const address = {
//             formatted: `${as.addressLine1} ${as.addressLine2 ? ", " + as.addressLine2 : ""}`,
//             ...as,
//           };
//           setAddress(address);
//         } else {
//           const address = {
//             formatted: `${user.data.addresses[0].addressLine1} ${user.data.addresses[0].addressLine2 ? ", " + user.data.addresses[0].addressLine2 : ""}`,
//             ...user.data.addresses[0],
//           };
//           setAddress(address);
//         }
//         // const { addressLine1, addressLine2 } = user.data.addresses.find((address) => address.isDefault);
//       }

//       if (user?.data) {
//         setAuthUser(user.data);
//         return user.data;
//       }
//       return null;
//     },
//     staleTime: Infinity,
//     enabled: !authUser,
//   });

//   const protectedRoutes = ["history", "d", "me", "checkout"];
//   const currentPath = location.pathname.split("/")[1];
//   // console.log(location,currentPath)

//   if (isPending || isFetching || isLoading) {
//     return <Loading />;
//   }
//   if (!authUser && protectedRoutes.includes(currentPath)) {
//     return <Navigate to={"/login"} replace />;
//   }

//   return children;
// };