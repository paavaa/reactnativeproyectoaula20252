import React from "react";
import { View, Text, FlatList, Image } from "react-native";
import { useProducts } from "../contexts/ProductsContext";

export default function AlertsScreen() {
    const { getLowStockProducts } = useProducts();
    const lowStockProducts = getLowStockProducts();

    return (
        <View style={{ flex: 1, padding: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 15 }}>
                ⚠️ Alertas de Stock Bajo
            </Text>

            {lowStockProducts.length === 0 ? (
                <View style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center"
                }}>
                    <Text style={{ fontSize: 48, marginBottom: 10 }}>(●'◡'●)</Text>
                    <Text style={{ fontSize: 18, textAlign: "center", color: "#666" }}>
                        ¡Todo bien!{"\n"}No hay productos con stock bajo
                    </Text>
                </View>
            ) : (
                <>
                    <View style={{
                        backgroundColor: "#fff3cd",
                        padding: 15,
                        borderRadius: 8,
                        marginBottom: 15
                    }}>
                        <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                            {lowStockProducts.length} producto(s) requieren atención
                        </Text>
                    </View>

                    <FlatList
                        data={lowStockProducts}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <View style={{
                                marginBottom: 15,
                                padding: 15,
                                backgroundColor: "#fff",
                                borderRadius: 8,
                                borderLeftWidth: 5,
                                borderLeftColor: item.quantity === 0 ? "#d32f2f" : "#ff9800",
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.1,
                                shadowRadius: 2,
                                elevation: 2
                            }}>
                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                    {item.imageUrl && (
                                        <Image
                                            source={{ uri: item.imageUrl }}
                                            style={{
                                                width: 60,
                                                height: 60,
                                                marginRight: 15,
                                                borderRadius: 5
                                            }}
                                        />
                                    )}
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 20, marginBottom: 5 }}>
                                            {item.quantity === 0 ? "🚫" : "⚠️"}
                                        </Text>
                                        <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                                            {item.name}
                                        </Text>
                                        <Text style={{ color: "#666" }}>
                                            Código: {item.code}
                                        </Text>
                                        <Text style={{
                                            fontWeight: "bold",
                                            color: item.quantity === 0 ? "#d32f2f" : "#ff6f00",
                                            fontSize: 16,
                                            marginTop: 5
                                        }}>
                                            Stock actual: {item.quantity}
                                        </Text>
                                        <Text style={{ fontSize: 12, color: "#666" }}>
                                            Stock mínimo: {item.minStock}
                                        </Text>
                                        <Text style={{
                                            fontSize: 12,
                                            color: item.quantity === 0 ? "#d32f2f" : "#ff6f00",
                                            marginTop: 5,
                                            fontWeight: "bold"
                                        }}>
                                            {item.quantity === 0
                                                ? "🚫 SIN STOCK - Reabastecer urgente"
                                                : "⚠️ Reabastecer pronto"}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        )}
                    />
                </>
            )}
        </View>
    );
}