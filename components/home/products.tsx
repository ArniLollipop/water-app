import Colors from "@/constants/Colors";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import UIIcon from "../UI/Icon";
import UIButton from "../UI/Button";
import useHttp from "@/utils/axios";
import { RootState } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { setCart } from "@/store/slices/userSlice";

export default function Products(props: {
  isOrderPage?: boolean;
  type?: "local";
}) {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.user);

  const [products, setProducts] = useState([
    {
      name: "Вода 12.5 л",
      item: "b12" as "b12" | "b19",
      count: 0,
    },
    {
      name: "Вода 18.9 л",
      item: "b19" as "b12" | "b19",
      count: 0,
    },
  ]);
  const [styles, setStyles] = useState({} as any);

  useEffect(() => {
    if (user?.cart) {
      setProducts([
        {
          name: "Вода 12.5 л",
          item: "b12" as "b12" | "b19",
          count: user.cart.b12,
        },
        {
          name: "Вода 18.9 л",
          item: "b19" as "b12" | "b19",
          count: user.cart.b19,
        },
      ]);
    }
  }, [user?.cart]);

  useEffect(() => {
    if (props.isOrderPage) {
      setStyles(orderStyles);
    } else {
      setStyles(productStyles);
    }
  }, [props.isOrderPage]);

  async function updateCart(item: "b12" | "b19", method: "add" | "minus") {
    if (props.type === "local" && user?.cart) {
      if (method === "add") {
        dispatch(
          setCart({
            cart: {
              ...user.cart,
              [item]: user?.cart ? user.cart[item] + 1 : 1,
            },
          })
        );
      } else {
        dispatch(
          setCart({
            cart: {
              ...user.cart,
              [item]: user?.cart ? user.cart[item] - 1 : 0,
            },
          })
        );
      }
    } else {
      await useHttp
        .post<{ success: boolean }>("/updateCart", {
          mail: user?.mail,
          product: item,
          method,
        })
        .then((res) => {
          if (res.data.success && user?.cart) {
            dispatch(
              setCart({
                cart: {
                  ...user.cart,
                  [item]:
                    method === "add"
                      ? user.cart[item] + 1
                      : user.cart[item] - 1,
                },
              })
            );
          }
        });
    }
  }

  return (
    <View style={productStyles.products}>
      <Text style={styles.title}>Товары</Text>
      <View style={styles.block}>
        {products.map((product, index) => (
          <View key={index} style={styles.one}>
            <View style={styles.image}>
              {product.name === "Вода 12.5 л" ? 
                <Image
                  source={require("../../assets/images/b12.png")}
                  style={{
                    height: "100%",
                    width: "100%",
                    objectFit: "contain",
                  }}
                /> :
                <Image
                  source={require("../../assets/images/b19.png")}
                  style={{
                    height: "100%",
                    width: "100%",
                    objectFit: "contain",
                  }}
                />  
              }
              
            </View>
            <View style={styles.right}>
              <View>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productDesc}>негазированная</Text>
              </View>
              {props.isOrderPage || product.count > 0 ? (
                <View style={styles.oneCart}>
                  <View style={productStyles.oneCartInner}>
                    <UIIcon name="cart" />
                    <Text style={styles.count}>{product.count} шт</Text>
                  </View>
                  <View style={productStyles.oneCartInner}>
                    <Pressable
                      onPress={() => updateCart(product.item, "minus")}
                      style={styles.cartButton}>
                      <UIIcon
                        name={props.isOrderPage ? "smallMinus" : "minus"}
                      />
                    </Pressable>
                    <Pressable
                      onPress={() => updateCart(product.item, "add")}
                      style={styles.cartButton}>
                      <UIIcon name={props.isOrderPage ? "smallPlus" : "plus"} />
                    </Pressable>
                  </View>
                </View>
              ) : (
                <UIButton
                  onPress={() => updateCart(product.item, "add")}
                  type="default"
                  text="В корзину"
                />
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const productStyles = StyleSheet.create({
  products: {
    marginVertical: 0,
    width: "100%",
    position: "relative",
    zIndex: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "500",
    color: Colors.text,
    marginLeft: 15,
  },
  block: {
    width: "100%",
    marginTop: 15,
    gap: 15,
  },
  image: {
    width: 111,
    height: 111,
    borderRadius: 19,
    padding: 10,
    backgroundColor: Colors.background,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  one: {
    width: "100%",
    backgroundColor: Colors.darkWhite,
    borderRadius: 19,
    overflow: "hidden",
    padding: 10,
    flexDirection: "row",
    gap: 5,
    alignItems: "stretch",
    justifyContent: "space-between",
  },

  right: {
    flexGrow: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    paddingHorizontal: 5,
  },

  oneCart: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 5,
    padding: 5,
    borderRadius: 19,
    backgroundColor: Colors.background,
  },

  productName: {
    fontSize: 20,
    fontWeight: "500",
    color: Colors.text,
  },
  productDesc: {
    fontSize: 15,
    fontWeight: "400",
    color: Colors.gray,
  },

  cartButton: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: Colors.darkWhite,
    alignItems: "center",
    justifyContent: "center",
  },
  count: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.text,
  },

  oneCartInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
});

const orderStyles = StyleSheet.create({
  title: {
    display: "none",
  },
  block: {
    width: "100%",
    backgroundColor: Colors.darkWhite,
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 15,
    padding: 10,
    gap: 15,
  },
  one: {
    width: "100%",
    backgroundColor: Colors.darkWhite,
    overflow: "hidden",
    flexDirection: "row",
    gap: 5,
    alignItems: "stretch",
    justifyContent: "space-between",
  },
  image: {
    width: 46,
    height: 46,
    borderRadius: 10,
    padding: 5,
    backgroundColor: Colors.background,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  right: {
    flexGrow: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 5,
  },
  productName: {
    fontSize: 16,
    fontWeight: "400",
    color: Colors.text,
  },
  productDesc: {
    fontSize: 13,
    fontWeight: "400",
    color: Colors.gray,
  },
  count: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text,
  },
  oneCart: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 5,
    borderRadius: 19,
  },
  cartButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
});
