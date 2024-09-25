import Colors from "@/constants/Colors";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import UIIcon from "../UI/Icon";
import UIButton from "../UI/Button";
import useHttp from "@/utils/axios";
import { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";

export default function HomeProducts() {
  const { user } = useSelector((state: RootState) => state.user);

  const [products, setProducts] = useState([
    {
      name: "Вода 12,9 л",
      item: "b12" as "b12" | "b19",
      count: 0,
    },
    {
      name: "Вода 20 л",
      item: "b19" as "b12" | "b19",
      count: 0,
    },
  ]);

  useEffect(() => {
    if (user?.cart) {
      setProducts([
        {
          name: "Вода 12,9 л",
          item: "b12" as "b12" | "b19",
          count: user.cart.b12,
        },
        {
          name: "Вода 20 л",
          item: "b19" as "b12" | "b19",
          count: user.cart.b19,
        },
      ]);
    }
  }, [user?.cart]);

  async function updateCart(item: string, method: "add" | "minus") {
    await useHttp
      .post<{ success: boolean }>("/updateCart", {
        mail: "bocunahero@gmail.com",
        product: item,
        method,
      })
      .then((res) => {
        if (res.data.success) {
          setProducts((prev) => {
            let newProducts = [...prev];
            let index = newProducts.findIndex(
              (product) => product.item === item
            );
            if (method === "add") {
              newProducts[index].count++;
            } else {
              newProducts[index].count--;
            }
            return newProducts;
          });
        }
      });
  }

  return (
    <View style={productStyles.products}>
      <Text style={productStyles.title}>Товары</Text>
      <View style={{ width: "100%", marginTop: 15, gap: 15 }}>
        {products.map((product, index) => (
          <View key={index} style={productStyles.one}>
            <View
              style={{
                width: 111,
                height: 111,
                borderRadius: 19,
                padding: 10,
                backgroundColor: Colors.background,
                position: "relative",
                alignItems: "center",
                justifyContent: "center",
              }}>
              <Image
                source={require("../../assets/images/su.png")}
                style={{
                  objectFit: "cover",
                }}
              />
            </View>
            <View style={productStyles.right}>
              <View>
                <Text style={productStyles.productName}>{product.name}</Text>
                <Text style={productStyles.productDesc}>негазированная</Text>
              </View>
              {product.count > 0 ? (
                <View style={productStyles.oneCart}>
                  <View style={productStyles.oneCartInner}>
                    <UIIcon name="cart" />
                    <Text style={productStyles.count}>{product.count} шт</Text>
                  </View>
                  <View style={productStyles.oneCartInner}>
                    <Pressable
                      onPress={() => updateCart(product.item, "minus")}
                      style={productStyles.cartButton}>
                      <UIIcon name="minus" />
                    </Pressable>
                    <Pressable
                      onPress={() => updateCart(product.item, "add")}
                      style={productStyles.cartButton}>
                      <UIIcon name="plus" />
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
