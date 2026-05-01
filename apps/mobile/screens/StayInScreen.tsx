import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing } from "@omni-life/ui";

export function StayInScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stay In</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white, padding: spacing.md },
  title: { fontSize: 22, fontWeight: "700", color: colors.navy },
});
