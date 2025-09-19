// import { Navigate } from "react-router";
// import useAuthUserStore from "@/stores/useAuthUserStore";
// import { api } from "@/lib/api-client";
// import { useQuery } from "@tanstack/react-query";
// import Loading from "./ui/loading";
// import { socket } from "@/lib/socket";
// import { useParams } from "react-router";
// import { useUserRestaurants } from "@/hooks/use-user-restaurants";
// import useAudioNotification from "@/hooks/use-audio-player";

// const checkUser = async () => {
//   try {
//     const response = await api.get("/v1/users/me");
//     return response.data;
//   } catch (error) {
//     return null;
//   }
// };

// export const ProtectedAdmin = ({ children }) => {
//   useAudioNotification();
//   const { authUser, setAuthUser } = useAuthUserStore();
//   const { restaurantId } = useParams();
//   const { restaurants, isLoading: isLoadingRestaurant, error } = useUserRestaurants();
//   const { isFetching, isPending, isLoading } = useQuery({
//     queryKey: ["authUser"],
//     queryFn: async () => {
//       const user = await checkUser();
//       if (user?.data) {
//         setAuthUser(user.data);
//         return user.data;
//       }
//       return null;
//     },
//     staleTime: Infinity,
//     enabled: !authUser,
//   });

//   if (isPending || isFetching || isLoading || isLoadingRestaurant) {
//     return <Loading />;
//   }

//   // console.log(restaurants);

//   const res = restaurants.find((r) => r.restaurantId === restaurantId);
//   // console.log(role);
//   if (res)
//     socket.emit("joinRestaurantOrderRoom", {
//       userId: authUser.userId,
//       role: res.role,
//       restaurantId: res.restaurantId,
//     });

//   if (!authUser & !isFetching) {
//     return <Navigate to={"/login"} replace />;
//   }

//   return children;
// };