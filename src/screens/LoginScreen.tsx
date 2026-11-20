import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, Input, Title, Muted } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../lib/api";
import { colors } from "../theme";

export function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("cedrickhakuzimana75@gmail.com");
  const [password, setPassword] = useState("Quiz@2026!Demo3");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Missing fields", "Enter email and password");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
    } catch (e) {
      Alert.alert("Login failed", e instanceof ApiError ? e.message : "Could not sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>QM</Text>
          </View>
          <Title>QuizMind Student</Title>
          <Muted>Sign in to take quizzes, track progress, and see study recommendations.</Muted>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <Input
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            placeholder="student@school.edu"
          />
          <Text style={styles.label}>Password</Text>
          <Input
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholder="Your password"
          />
          <Button title="Sign in" onPress={onSubmit} loading={loading} />
          <Text style={styles.note}>Student accounts only. Teachers and admins use the web app.</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { flexGrow: 1, justifyContent: "center", padding: 20 },
  hero: { marginBottom: 28 },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  logoText: { color: "#fff", fontWeight: "800", fontSize: 18 },
  form: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
  },
  label: { fontSize: 12, fontWeight: "600", color: colors.textMuted, marginBottom: 6 },
  note: { marginTop: 14, fontSize: 12, color: colors.textMuted, textAlign: "center" },
});
