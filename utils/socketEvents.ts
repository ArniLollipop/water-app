import socket from "@/utils/socket";
import store from "@/store/store";
import { updateOrderStatus } from "@/store/slices/lastOrderStatusSlice";

let isSubscribed = false;

export function subscribeToSocketEvents() {
  if (!isSubscribed) {
    console.log("Subscribing to socket events...");

    socket.on("orderStatusChanged", (data) => {
      console.log("Order status changed:", data.status);
      store.dispatch(updateOrderStatus(data.status));
    });

    isSubscribed = true;
  }
}